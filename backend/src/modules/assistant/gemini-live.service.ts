import { Inject, Injectable, Logger } from '@nestjs/common';
import { Modality, type LiveServerMessage, type Session } from '@google/genai';
import type { VoiceLanguageT } from 'shared';
import { DEVELOPER_API_LIVE_MODEL, GeminiConfig } from './gemini.config';
import {
  createGeminiClient,
  GEMINI_CLIENT_FACTORY,
  safeGeminiErrorCategory,
  type GeminiClientFactory,
} from './gemini.client';
import { buildGeminiToolRegistry } from './gemini-tool-registry';
import {
  createNodeGeminiLiveBridge,
  NODE_GEMINI_LIVE_BRIDGE_FACTORY,
  type NodeGeminiLiveBridgeFactory,
} from './gemini-live-node-bridge';

export interface GeminiLiveEvent {
  message: LiveServerMessage;
}

export interface GeminiLiveConnection {
  sendAudio(pcm16: Uint8Array): void;
  sendText(text: string): void;
  endAudio(): void;
  respondToToolCalls(
    calls: Array<{ id: string; name: string; response: Record<string, unknown> }>
  ): void;
  rejectToolCalls(calls: Array<{ id: string; name: string }>): void;
  reconnect(): Promise<void>;
  close(): void;
}

const LIVE_SYSTEM_INSTRUCTION =
  'You are the Slate assistant for a monochrome NOTE4 device. Respond in the user language, English or Japanese. Never access, infer, or discuss private Outlook or Microsoft calendar data. Calendar requests may only produce a proposed Google Calendar event for a separate confirmation flow.';

@Injectable()
export class GeminiLiveService {
  private readonly logger = new Logger(GeminiLiveService.name);

  constructor(
    private readonly config: GeminiConfig,
    @Inject(GEMINI_CLIENT_FACTORY)
    private readonly clientFactory: GeminiClientFactory = createGeminiClient,
    @Inject(NODE_GEMINI_LIVE_BRIDGE_FACTORY)
    private readonly nodeBridgeFactory: NodeGeminiLiveBridgeFactory = createNodeGeminiLiveBridge
  ) {}

  async connect(
    language: VoiceLanguageT,
    onEvent: (event: GeminiLiveEvent) => void,
    onError?: (error: Error) => void,
    enableWebSearch = true
  ): Promise<GeminiLiveConnection> {
    this.assertConfigured();
    if (this.config.liveRuntime === 'node_bridge') {
      if (
        this.config.authMode !== 'developer_api_key' ||
        this.config.liveModel !== DEVELOPER_API_LIVE_MODEL
      ) {
        throw new GeminiConfigurationError(
          `Gemini runtime is not configured: the Node Live bridge requires ${DEVELOPER_API_LIVE_MODEL} in evaluation-only Developer API mode`
        );
      }
      try {
        return await this.nodeBridgeFactory(this.config.nodeBridgeOptions()).connect(
          language,
          onEvent,
          onError ?? (() => undefined),
          this.config.liveModel,
          `${LIVE_SYSTEM_INSTRUCTION} Preferred language: ${language}.`,
          this.config.liveConnectTimeoutMs,
          enableWebSearch
        );
      } catch (error) {
        const normalized = normalizeError(error, 'Gemini Live connection failed');
        this.logger.warn(normalized.message);
        onError?.(normalized);
        throw normalized;
      }
    }
    let session: Session | undefined;
    let closed = false;
    let activeGeneration = 0;
    const expectedCloseSessions = new WeakSet<object>();
    let client: ReturnType<GeminiClientFactory>;
    try {
      client = this.clientFactory(this.config.clientOptions());
    } catch (error) {
      const normalized = new GeminiConfigurationError(
        'Gemini runtime client could not be initialized'
      );
      this.logger.warn(`Gemini client initialization failed: ${safeGeminiErrorCategory(error)}`);
      onError?.(normalized);
      throw normalized;
    }

    const connectSession = async (): Promise<void> => {
      const generation = ++activeGeneration;
      session = undefined;
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), this.config.liveConnectTimeoutMs);
      let nextSession: Session | undefined;
      try {
        nextSession = await client.live.connect({
          model: this.config.liveModel,
          config: {
            abortSignal: abortController.signal,
            responseModalities: [Modality.AUDIO],
            systemInstruction: `${LIVE_SYSTEM_INSTRUCTION} Preferred language: ${language}.`,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: buildGeminiToolRegistry(enableWebSearch),
          },
          callbacks: {
            onmessage: (message) => onEvent({ message }),
            onerror: (event) => {
              const error =
                event instanceof Error ? event : new Error('Gemini Live connection error');
              this.logger.warn(`Gemini Live error: ${safeGeminiErrorCategory(error)}`);
              onError?.(new Error('Gemini Live connection error'));
            },
            onclose: () => {
              const isExpectedClose =
                nextSession !== undefined && expectedCloseSessions.delete(nextSession);
              if (generation !== activeGeneration) return;
              if (nextSession !== undefined && session !== undefined && session !== nextSession)
                return;
              session = undefined;
              if (!isExpectedClose && !closed) {
                this.logger.debug('Gemini Live session closed');
                onError?.(new Error('Gemini Live session closed'));
              }
            },
          },
        });
        if (closed) {
          nextSession.close();
          throw new GeminiLiveStateError('Gemini Live session was closed while connecting');
        }
        session = nextSession;
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      await connectSession();
    } catch (error) {
      const normalized = normalizeError(error, 'Gemini Live connection failed');
      this.logger.warn(normalized.message);
      onError?.(normalized);
      throw normalized;
    }

    const requireSession = (): Session => {
      if (closed || !session) {
        throw new GeminiLiveStateError('Gemini Live session is not connected');
      }
      return session;
    };

    return {
      sendAudio: (pcm16) => {
        requireSession().sendRealtimeInput({
          audio: { data: Buffer.from(pcm16).toString('base64'), mimeType: 'audio/pcm;rate=16000' },
        });
      },
      sendText: (text) =>
        requireSession().sendClientContent({
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        }),
      endAudio: () => requireSession().sendRealtimeInput({ audioStreamEnd: true }),
      respondToToolCalls: (calls) =>
        requireSession().sendToolResponse({
          functionResponses: calls.map(({ id, name, response }) => ({ id, name, response })),
        }),
      rejectToolCalls: (calls) =>
        requireSession().sendToolResponse({
          functionResponses: calls.map(({ id, name }) => ({
            id,
            name,
            response: { error: 'Tool execution is not available in the voice session' },
          })),
        }),
      reconnect: async () => {
        if (closed) {
          throw new GeminiLiveStateError('Cannot reconnect a closed Gemini Live session');
        }
        const previousSession = session;
        if (previousSession) {
          expectedCloseSessions.add(previousSession);
          previousSession.close();
        }
        await connectSession();
      },
      close: () => {
        closed = true;
        session?.close();
        session = undefined;
      },
    };
  }

  private assertConfigured(): void {
    if (!this.config.isConfigured()) {
      throw new GeminiConfigurationError(this.config.configurationErrorMessage());
    }
  }
}

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigurationError';
  }
}

export class GeminiLiveStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiLiveStateError';
  }
}

function normalizeError(error: unknown, fallback: string): Error {
  if (error instanceof GeminiConfigurationError || error instanceof GeminiLiveStateError) {
    return error;
  }
  return new Error(fallback);
}
