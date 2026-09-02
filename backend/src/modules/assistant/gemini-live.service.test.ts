import { describe, expect, it } from 'bun:test';
import type { LiveServerMessage, Session } from '@google/genai';
import { GeminiLiveService } from './gemini-live.service';
import type { GeminiConfig } from './gemini.config';
import { GeminiCredentialError, type GeminiClient } from './gemini.client';

function config(): GeminiConfig {
  return {
    project: 'test-project',
    location: 'australia-southeast1',
    textModel: 'gemini-3.7-flash',
    liveModel: 'gemini-live-2.5-flash-native-audio',
    liveConnectTimeoutMs: 15_000,
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
  } as GeminiConfig;
}

describe('GeminiLiveService', () => {
  it('configures the approved live model and manages PCM session lifecycle', async () => {
    const calls: Array<Record<string, unknown>> = [];
    const clientOptions: Record<string, unknown>[] = [];
    const events: LiveServerMessage[] = [];
    let closed = false;
    let connectionCount = 0;
    const session = {
      sendRealtimeInput: (input: unknown) => calls.push({ type: 'audio', input }),
      sendClientContent: (input: unknown) => calls.push({ type: 'text', input }),
      close: () => {
        closed = true;
      },
    } as unknown as Session;
    const client = {
      live: {
        connect: async (parameters: Record<string, unknown>) => {
          connectionCount++;
          clientOptions.push(parameters);
          const callbacks = parameters.callbacks as {
            onmessage: (message: LiveServerMessage) => void;
          };
          callbacks.onmessage({} as LiveServerMessage);
          return session;
        },
      },
      models: {},
    } as unknown as GeminiClient;
    const service = new GeminiLiveService(config(), () => client);

    const connection = await service.connect('ja', ({ message }) => events.push(message));
    connection.sendAudio(new Uint8Array([1, 2, 3]));
    connection.sendText('こんにちは');
    connection.endAudio();
    await connection.reconnect();
    connection.close();

    expect(clientOptions[0]).toMatchObject({
      model: 'gemini-live-2.5-flash-native-audio',
      config: {
        responseModalities: ['AUDIO'],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    });
    expect(clientOptions[0]?.config).toHaveProperty('tools.0.googleSearch');
    expect(calls[0]).toEqual({
      type: 'audio',
      input: {
        audio: {
          data: Buffer.from([1, 2, 3]).toString('base64'),
          mimeType: 'audio/pcm;rate=16000',
        },
      },
    });
    expect(calls[1]).toMatchObject({ type: 'text', input: { turnComplete: true } });
    expect(calls[2]).toEqual({ type: 'audio', input: { audioStreamEnd: true } });
    expect(events).toHaveLength(2);
    expect(connectionCount).toBe(2);
    expect(closed).toBe(true);
  });

  it('fails closed when OAuth/ADC configuration is missing', async () => {
    const service = new GeminiLiveService(
      { ...config(), project: undefined, isConfigured: () => false } as GeminiConfig,
      () => {
        throw new Error('client must not be constructed');
      }
    );

    await expect(service.connect('en', () => {})).rejects.toThrow('GOOGLE_CLOUD_PROJECT');
  });

  it('uses the explicitly selected Developer API runtime options without changing Live semantics', async () => {
    const clientOptions: Record<string, unknown>[] = [];
    const session = {
      sendRealtimeInput: () => {},
      sendClientContent: () => {},
      sendToolResponse: () => {},
      close: () => {},
    } as unknown as Session;
    const service = new GeminiLiveService(
      {
        ...config(),
        project: undefined,
        location: undefined,
        authMode: 'developer_api_key',
        apiKeyFile: '/run/secrets/gemini_api_key',
        clientOptions: () => ({ apiKeyFile: '/run/secrets/gemini_api_key' }),
      } as GeminiConfig,
      (options) => {
        clientOptions.push(options);
        return {
          models: {},
          live: { connect: async () => session },
        } as unknown as GeminiClient;
      }
    );

    await service.connect('en', () => {});

    expect(clientOptions).toEqual([{ apiKeyFile: '/run/secrets/gemini_api_key' }]);
    expect(JSON.stringify(clientOptions)).not.toContain('synthetic');
  });

  it('maps credential initialization failures to a generic configuration error', async () => {
    const service = new GeminiLiveService(config(), () => {
      throw new GeminiCredentialError('synthetic-secret-value');
    });

    await expect(service.connect('en', () => {})).rejects.toMatchObject({
      name: 'GeminiConfigurationError',
      message: 'Gemini runtime client could not be initialized',
    });
  });

  it('redacts provider details before invoking the device-facing error callback', async () => {
    let providerError: ((event: unknown) => void) | undefined;
    const clientOptions: Record<string, unknown>[] = [];
    const session = { close: () => {} } as unknown as Session;
    const service = new GeminiLiveService(config(), (options) => {
      clientOptions.push(options);
      return {
        models: {},
        live: {
          connect: async (parameters: Record<string, unknown>) => {
            providerError = (parameters.callbacks as { onerror: (event: unknown) => void }).onerror;
            return session;
          },
        },
      } as unknown as GeminiClient;
    });
    const errors: Error[] = [];

    await service.connect(
      'en',
      () => {},
      (error) => errors.push(error)
    );
    providerError?.(new Error('provider detail synthetic-secret-value'));

    expect(clientOptions).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toBe('Gemini Live connection error');
    expect(errors[0]?.message).not.toContain('synthetic-secret-value');
  });

  it('aborts a connection that exceeds the configured timeout', async () => {
    const service = new GeminiLiveService(
      { ...config(), liveConnectTimeoutMs: 1 } as GeminiConfig,
      () =>
        ({
          models: {},
          live: {
            connect: ({ config: liveConfig }: { config: { abortSignal: AbortSignal } }) =>
              new Promise<Session>((_resolve, reject) => {
                liveConfig.abortSignal.addEventListener(
                  'abort',
                  () => reject(new Error('aborted by timeout')),
                  { once: true }
                );
              }),
          },
        }) as unknown as GeminiClient
    );

    await expect(service.connect('en', () => {})).rejects.toThrow('Gemini Live connection failed');
  });
});
