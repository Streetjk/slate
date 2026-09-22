import { describe, expect, it } from 'bun:test';
import type { GenerateContentParameters } from '@google/genai';
import type { AssistantRequestT } from 'shared';
import { GeminiAssistantService } from './gemini-assistant.service';
import type { GeminiConfig } from './gemini.config';
import { GeminiCredentialError, type GeminiClient } from './gemini.client';
import { buildGeminiToolRegistry, GEMINI_ASSISTANT_TOOL_NAMES } from './gemini-tool-registry';

function config(overrides: Partial<GeminiConfig> = {}): GeminiConfig {
  return {
    project: 'test-project',
    location: 'australia-southeast1',
    textModel: 'gemini-3.7-flash',
    liveModel: 'gemini-live-2.5-flash-native-audio',
    authMode: 'vertex_adc',
    apiKeyFile: undefined,
    clientOptions: () => ({
      vertexai: true,
      project: 'test-project',
      location: 'australia-southeast1',
    }),
    configurationErrorMessage: () =>
      'Gemini runtime is not configured: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are required for vertex_adc mode',
    isConfigured: () => true,
    ...overrides,
  } as GeminiConfig;
}

function request(overrides: Partial<AssistantRequestT> = {}): AssistantRequestT {
  return {
    requestId: 'request-1',
    text: 'What is the weather?',
    language: 'en',
    enableWebSearch: false,
    ...overrides,
  };
}

function fakeClient(
  response: Record<string, unknown>,
  seen: GenerateContentParameters[]
): GeminiClient {
  return {
    models: {
      generateContent: async (parameters) => {
        seen.push(parameters);
        return response;
      },
    },
    live: {} as GeminiClient['live'],
  } as unknown as GeminiClient;
}

describe('GeminiAssistantService', () => {
  it('does not invoke a client when ADC configuration is absent', async () => {
    let factoryCalls = 0;
    const service = new GeminiAssistantService(
      config({ project: undefined, isConfigured: () => false }),
      () => {
        factoryCalls++;
        return fakeClient({ text: 'unexpected' }, []);
      }
    );

    await expect(service.answer(request())).rejects.toThrow('GOOGLE_CLOUD_PROJECT');
    expect(factoryCalls).toBe(0);
  });

  it('uses Vertex/ADC options and does not construct an API-key client', async () => {
    const seen: GenerateContentParameters[] = [];
    const clientOptions: Record<string, unknown>[] = [];
    const service = new GeminiAssistantService(config(), (options) => {
      clientOptions.push(options);
      return fakeClient({ text: 'The answer.' }, seen);
    });

    await expect(service.answer(request())).resolves.toEqual({
      requestId: 'request-1',
      text: 'The answer.',
      language: 'en',
      toolRequests: [],
    });
    expect(clientOptions).toEqual([
      { vertexai: true, project: 'test-project', location: 'australia-southeast1' },
    ]);
    expect(seen[0]?.model).toBe('gemini-3.7-flash');
    expect(seen[0]?.config?.tools).toEqual([{ functionDeclarations: expect.any(Array) }]);
    expect(JSON.stringify(clientOptions)).not.toContain('apiKey');
  });

  it('uses the explicitly selected Developer API runtime file reference', async () => {
    const seen: GenerateContentParameters[] = [];
    const clientOptions: Record<string, unknown>[] = [];
    const service = new GeminiAssistantService(
      config({
        project: undefined,
        location: undefined,
        authMode: 'developer_api_key',
        apiKeyFile: '/run/secrets/gemini_api_key',
        clientOptions: () => ({ apiKeyFile: '/run/secrets/gemini_api_key' }),
      }),
      (options) => {
        clientOptions.push(options);
        return fakeClient({ text: 'The answer.' }, seen);
      }
    );

    await expect(service.answer(request())).resolves.toMatchObject({ text: 'The answer.' });
    expect(clientOptions).toEqual([{ apiKeyFile: '/run/secrets/gemini_api_key' }]);
    expect(seen[0]?.model).toBe('gemini-3.7-flash');
    expect(JSON.stringify(clientOptions)).not.toContain('synthetic-test-key');
  });

  it('maps credential initialization failures to a generic configuration error', async () => {
    const secret = 'synthetic-secret-value';
    const service = new GeminiAssistantService(
      config({
        authMode: 'developer_api_key',
        apiKeyFile: '/run/secrets/gemini_api_key',
      }),
      () => {
        throw new GeminiCredentialError(secret);
      }
    );

    let message = '';
    try {
      await service.answer(request());
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toBe('Gemini runtime client could not be initialized');
    expect(message).not.toContain(secret);
  });

  it('enables only Google Search plus the narrow function declarations', async () => {
    const seen: GenerateContentParameters[] = [];
    const service = new GeminiAssistantService(config(), () =>
      fakeClient({ text: 'searched' }, seen)
    );

    await service.answer(request({ enableWebSearch: true }));
    expect(seen[0]?.config?.tools).toEqual([
      { googleSearch: {} },
      { functionDeclarations: expect.any(Array) },
    ]);
    expect(JSON.stringify(seen[0]?.config?.tools)).not.toMatch(/outlook|microsoft|http|shell/i);
  });

  it('returns a validated Google Calendar proposal and never writes it', async () => {
    const seen: GenerateContentParameters[] = [];
    const service = new GeminiAssistantService(config(), () =>
      fakeClient(
        {
          text: 'Please confirm this event.',
          functionCalls: [
            {
              id: 'call-1',
              name: 'propose_google_calendar_event',
              args: {
                title: 'Dentist',
                start: '2026-09-04T15:00:00+08:00',
                end: '2026-09-04T16:00:00+08:00',
                allDay: false,
              },
            },
          ],
        },
        seen
      )
    );

    await expect(service.answer(request())).resolves.toMatchObject({
      toolRequests: [
        {
          callId: 'call-1',
          name: 'propose_google_calendar_event',
          input: { title: 'Dentist', allDay: false },
        },
      ],
    });
  });

  it('rejects an unknown or malformed model tool call', async () => {
    for (const functionCall of [
      { id: 'call-1', name: 'outlook', args: {} },
      { id: 'call-2', name: 'get_btc_price', args: { period: 'yearly' } },
    ]) {
      const service = new GeminiAssistantService(config(), () =>
        fakeClient({ text: '', functionCalls: [functionCall] }, [])
      );
      await expect(service.answer(request())).rejects.toThrow();
    }
  });
});

describe('Gemini tool registry', () => {
  it('contains exactly the approved logical names and no Outlook capability', () => {
    expect(GEMINI_ASSISTANT_TOOL_NAMES).toEqual([
      'web_search',
      'propose_google_calendar_event',
      'get_btc_price',
    ]);
    expect(GEMINI_ASSISTANT_TOOL_NAMES.some((name) => /outlook|microsoft/i.test(name))).toBe(false);
    expect(JSON.stringify(buildGeminiToolRegistry(true))).not.toMatch(
      /outlook|microsoft|arbitrary_http/i
    );
  });

  it('reports Search disabled without mislabeling custom declarations as absent tools', () => {
    const registry = buildGeminiToolRegistry(false);
    const functionDeclarations = registry[0]?.functionDeclarations ?? [];

    expect(registry.some((tool) => 'googleSearch' in tool)).toBe(false);
    expect(functionDeclarations.map((declaration) => declaration.name)).toEqual([
      'propose_google_calendar_event',
      'get_btc_price',
    ]);
    expect(functionDeclarations.length).toBeGreaterThan(0);
  });
});
