import { Injectable, Logger } from '@nestjs/common';
import { Modality, type LiveServerMessage, type Session } from '@google/genai';
import type { VoiceLanguageT } from 'shared';
import { GeminiConfig } from './gemini.config';
import { createGeminiClient, type GeminiClientFactory } from './gemini.client';
import { buildGeminiToolRegistry } from './gemini-tool-registry';

export interface GeminiLiveEvent {
  message: LiveServerMessage;
}

export interface GeminiLiveConnection {
  sendAudio(pcm16: Uint8Array): void;
  sendText(text: string): void;
  endAudio(): void;
  close(): void;
}

const LIVE_SYSTEM_INSTRUCTION =
  'You are the Slate assistant for a monochrome NOTE4 device. Respond in the user language, English or Japanese. Never access, infer, or discuss private Outlook or Microsoft calendar data. Calendar requests may only produce a proposed Google Calendar event for a separate confirmation flow.';

@Injectable()
export class GeminiLiveService {
  private readonly logger = new Logger(GeminiLiveService.name);

  constructor(
    private readonly config: GeminiConfig,
    private readonly clientFactory: GeminiClientFactory = createGeminiClient
  ) {}

  async connect(
    language: VoiceLanguageT,
    onEvent: (event: GeminiLiveEvent) => void,
    onError?: (error: Error) => void,
    enableWebSearch = true
  ): Promise<GeminiLiveConnection> {
    this.assertConfigured();
    let session: Session;
    try {
      const client = this.clientFactory({
        vertexai: true,
        project: this.config.project,
        location: this.config.location,
      });
      session = await client.live.connect({
        model: this.config.liveModel,
        config: {
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
            this.logger.warn(`Gemini Live error: ${error.message}`);
            onError?.(error);
          },
          onclose: () => this.logger.debug('Gemini Live session closed'),
        },
      });
    } catch (error) {
      const normalized = normalizeError(error, 'Gemini Live connection failed');
      this.logger.warn(normalized.message);
      onError?.(normalized);
      throw normalized;
    }

    return {
      sendAudio: (pcm16) => {
        session.sendRealtimeInput({
          audio: { data: Buffer.from(pcm16).toString('base64'), mimeType: 'audio/pcm;rate=16000' },
        });
      },
      sendText: (text) =>
        session.sendClientContent({
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true,
        }),
      endAudio: () => session.sendRealtimeInput({ audioStreamEnd: true }),
      close: () => session.close(),
    };
  }

  private assertConfigured(): void {
    if (!this.config.isConfigured()) {
      throw new GeminiConfigurationError(
        'Gemini OAuth/ADC is not configured: GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION are required'
      );
    }
  }
}

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigurationError';
  }
}

function normalizeError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return new Error(`${fallback}: ${error.message}`);
  return new Error(`${fallback}: ${String(error)}`);
}
