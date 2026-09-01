import type { LiveServerMessage } from '@google/genai';
import { randomUUID } from 'node:crypto';
import type { RawData, WebSocket } from 'ws';
import { GeminiLiveService, type GeminiLiveConnection } from './gemini-live.service';
import { OpusPcmCodec, type VoiceCodec } from './opus-pcm-codec';

export class XiaozhiVoiceSession {
  private readonly sessionId = randomUUID();
  private readonly codec: VoiceCodec;
  private live: GeminiLiveConnection | undefined;
  private handshaken = false;
  private speaking = false;
  private operation = Promise.resolve();

  constructor(
    private readonly socket: WebSocket,
    private readonly liveService: GeminiLiveService,
    codecFactory: () => VoiceCodec = () => new OpusPcmCodec()
  ) {
    this.codec = codecFactory();
  }

  start(): void {
    this.socket.on('message', (data, isBinary) => {
      this.operation = this.operation
        .then(() => this.handleMessage(data, isBinary))
        .catch((error: unknown) => this.fail(error));
    });
    this.socket.on('close', () => this.close());
    this.socket.on('error', () => this.close());
  }

  async handleMessage(data: RawData, isBinary: boolean): Promise<void> {
    if (isBinary) {
      this.handleAudio(toBuffer(data));
      return;
    }
    const message = parseJson(toBuffer(data).toString('utf8'));
    switch (message.type) {
      case 'hello':
        this.handleHello(message);
        return;
      case 'listen':
        if (message.state === 'start') {
          await this.ensureLive();
        } else if (message.state === 'stop') {
          this.live?.endAudio();
        }
        return;
      case 'abort':
        this.live?.close();
        this.live = undefined;
        return;
      case 'goodbye':
        this.close();
        return;
      default:
        return;
    }
  }

  close(): void {
    this.live?.close();
    this.live = undefined;
    this.codec.close();
  }

  private handleHello(message: Record<string, unknown>): void {
    if (this.handshaken) throw new Error('duplicate voice hello');
    if (message.transport !== 'websocket' || message.version !== 1) {
      throw new Error('unsupported voice WebSocket protocol');
    }
    this.handshaken = true;
    this.sendJson({
      type: 'hello',
      version: 1,
      transport: 'websocket',
      session_id: this.sessionId,
      audio_params: { format: 'opus', sample_rate: 16_000, channels: 1, frame_duration: 60 },
    });
  }

  private handleAudio(packet: Uint8Array): void {
    if (!this.handshaken || !this.live)
      throw new Error('voice audio received before session start');
    this.live.sendAudio(this.codec.decodeDevicePacket(packet));
  }

  private async ensureLive(): Promise<void> {
    if (this.live) return;
    this.live = await this.liveService.connect(
      'en',
      ({ message }) => this.handleGeminiMessage(message),
      (error) => this.sendAlert('Voice service error', error.message)
    );
  }

  private handleGeminiMessage(message: LiveServerMessage): void {
    const inputText = message.serverContent?.inputTranscription?.text?.trim();
    if (inputText) this.sendJson({ type: 'stt', text: inputText });

    const outputText =
      message.serverContent?.outputTranscription?.text?.trim() || message.text?.trim();
    if (outputText) {
      this.startSpeaking();
      this.sendJson({ type: 'tts', state: 'sentence_start', text: outputText });
    }

    const audio = message.data;
    if (audio) {
      this.startSpeaking();
      for (const packet of this.codec.encodeModelPcm(Buffer.from(audio, 'base64'))) {
        this.socket.send(packet, { binary: true });
      }
    }

    if (message.serverContent?.turnComplete && this.speaking) {
      this.sendJson({ type: 'tts', state: 'stop' });
      this.speaking = false;
    }

    const calls = message.toolCall?.functionCalls ?? [];
    if (calls.length > 0 && this.live) {
      this.live.rejectToolCalls(
        calls.map((call) => ({ id: call.id ?? crypto.randomUUID(), name: call.name ?? 'unknown' }))
      );
    }
  }

  private startSpeaking(): void {
    if (this.speaking) return;
    this.speaking = true;
    this.sendJson({ type: 'tts', state: 'start' });
  }

  private sendAlert(status: string, message: string): void {
    this.sendJson({ type: 'alert', status, message, emotion: 'neutral' });
  }

  private sendJson(message: Record<string, unknown>): void {
    if (this.socket.readyState === this.socket.OPEN) this.socket.send(JSON.stringify(message));
  }

  private fail(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.sendAlert('Voice service error', message.slice(0, 240));
    this.close();
    if (this.socket.readyState === this.socket.OPEN)
      this.socket.close(1011, 'voice session failed');
  }
}

function parseJson(value: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('voice message must be a JSON object');
  }
  return parsed as Record<string, unknown>;
}

function toBuffer(data: RawData): Buffer {
  const value = data as Buffer | ArrayBuffer | Buffer[];
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.concat(value);
}
