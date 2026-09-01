import { describe, expect, it } from 'bun:test';
import type { LiveServerMessage, Session } from '@google/genai';
import { GeminiLiveService } from './gemini-live.service';
import type { GeminiConfig } from './gemini.config';
import type { GeminiClient } from './gemini.client';

function config(): GeminiConfig {
  return {
    project: 'test-project',
    location: 'australia-southeast1',
    textModel: 'gemini-3.7-flash',
    liveModel: 'gemini-live-2.5-flash-native-audio',
    liveConnectTimeoutMs: 15_000,
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
