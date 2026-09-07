import { Logger } from '@nestjs/common';
import type { LiveServerMessage } from '@google/genai';
import { randomUUID } from 'node:crypto';
import type { RawData, WebSocket } from 'ws';
import { GeminiLiveService, type GeminiLiveConnection } from './gemini-live.service';
import { GeminiLiveBridgeFailure } from './gemini-live-bridge.protocol';
import { OpusPcmCodec, type VoiceCodec } from './opus-pcm-codec';

const MAX_PRE_PROVIDER_MIC_FRAMES = 50;
const MAX_PRE_PROVIDER_MIC_BYTES = 100 * 1024;
const TRANSCRIPT_STREAM_DELAY_MS = 100;

export interface VoiceCalendarActions {
  propose(proposal: unknown): Promise<{
    ticket: string;
    proposal: unknown;
    expiresAt: string;
  }>;
  confirm(ticket: string): Promise<{ id: string; htmlLink?: string }>;
  cancel(ticket: string): Promise<void>;
}

export class XiaozhiVoiceSession {
  private readonly logger = new Logger(XiaozhiVoiceSession.name);
  private readonly sessionId = randomUUID();
  private readonly codec: VoiceCodec;
  private readonly timing = new VoiceTimingTrace();
  private live: GeminiLiveConnection | undefined;
  private connectingPromise: Promise<GeminiLiveConnection | undefined> | undefined;
  private connectGeneration = 0;
  private listenGeneration = 0;
  private handshaken = false;
  private listening = false;
  private closed = false;
  private speaking = false;
  private pendingInputTranscript = '';
  private pendingOutputTranscript = '';
  private lastSentOutputTranscript = '';
  private transcriptTimer: ReturnType<typeof setTimeout> | undefined;
  private operation = Promise.resolve();
  private micFrameMarkerEmitted = false;
  private micQueue: Uint8Array[] = [];
  private micQueueBytes = 0;

  constructor(
    private readonly socket: WebSocket,
    private readonly liveService: GeminiLiveService,
    codecFactory: () => VoiceCodec = () => new OpusPcmCodec(),
    private readonly calendarActions?: VoiceCalendarActions
  ) {
    this.codec = codecFactory();
  }

  start(): void {
    this.socket.on('message', (data, isBinary) => {
      if (isBinary) {
        try {
          this.handleAudio(toBuffer(data));
        } catch (error: unknown) {
          this.fail(error);
        }
        return;
      }
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
        if (!this.handshaken) throw new Error('voice session not initialized; hello required');
        if (message.state === 'start') {
          this.listening = true;
          const turn = ++this.listenGeneration;
          this.clearMicQueue();
          this.clearTranscriptState();
          this.timing.mark('T_DEVICE_LISTEN_START');
          void this.ensureLive().catch((error: unknown) => {
            if (!this.closed && this.listening && this.listenGeneration === turn) {
              this.fail(error);
            }
          });
        } else if (message.state === 'stop') {
          this.listening = false;
          this.clearMicQueue();
          if (this.live) {
            this.live.endAudio();
          } else if (this.connectingPromise) {
            const stopConnectGeneration = this.connectGeneration;
            const stopListenGeneration = this.listenGeneration;
            this.connectingPromise
              .then((conn) => {
                if (
                  conn &&
                  !this.closed &&
                  !this.listening &&
                  this.connectGeneration === stopConnectGeneration &&
                  this.listenGeneration === stopListenGeneration
                ) {
                  conn.endAudio();
                }
              })
              .catch(() => {});
          }
        }
        return;
      case 'abort':
        this.connectGeneration++;
        this.listenGeneration++;
        this.clearMicQueue();
        this.clearTranscriptState();
        this.listening = false;
        this.connectingPromise = undefined;
        this.live?.close();
        this.live = undefined;
        this.speaking = false;
        this.codec.reset();
        return;
      case 'calendar':
        await this.handleCalendarMessage(message);
        return;
      case 'goodbye':
        this.close();
        if (this.socket.readyState === this.socket.OPEN) this.socket.close(1000, 'goodbye');
        return;
      default:
        return;
    }
  }

  close(): void {
    this.closed = true;
    this.listening = false;
    this.connectGeneration++;
    this.listenGeneration++;
    this.clearMicQueue();
    this.clearTranscriptState();
    if (!this.micFrameMarkerEmitted) {
      this.micFrameMarkerEmitted = true;
      this.logger.log('FIRST_MIC_FRAME_RECEIVED=NO');
    }
    this.live?.close();
    this.live = undefined;
    this.connectingPromise = undefined;
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
    if (!this.handshaken || !this.listening || (!this.live && !this.connectingPromise))
      throw new Error('voice audio received before session start');
    if (!this.micFrameMarkerEmitted) {
      this.micFrameMarkerEmitted = true;
      this.logger.log('FIRST_MIC_FRAME_RECEIVED=YES');
    }
    this.timing.mark('T_FIRST_DEVICE_AUDIO_SENT');
    this.timing.mark('T_BACKEND_FIRST_AUDIO_RECEIVED');
    if (this.live) {
      this.live.sendAudio(this.codec.decodeDevicePacket(packet));
    } else {
      this.enqueueMicFrame(packet);
    }
  }

  private enqueueMicFrame(packet: Uint8Array): void {
    while (
      this.micQueue.length >= MAX_PRE_PROVIDER_MIC_FRAMES ||
      this.micQueueBytes + packet.byteLength > MAX_PRE_PROVIDER_MIC_BYTES
    ) {
      const dropped = this.micQueue.shift();
      if (!dropped) break;
      this.micQueueBytes -= dropped.byteLength;
    }
    this.micQueue.push(packet);
    this.micQueueBytes += packet.byteLength;
  }

  private flushMicQueue(): void {
    if (!this.live || this.micQueue.length === 0) return;
    const frames = this.micQueue;
    this.micQueue = [];
    this.micQueueBytes = 0;
    for (const frame of frames) {
      this.live.sendAudio(this.codec.decodeDevicePacket(frame));
    }
  }

  private clearMicQueue(): void {
    this.micQueue = [];
    this.micQueueBytes = 0;
  }

  private isCurrentAttempt(generation: number): boolean {
    return !this.closed && generation === this.connectGeneration;
  }

  private async ensureLive(): Promise<GeminiLiveConnection | undefined> {
    if (this.live) {
      this.logger.log('PROVIDER_SESSION_CREATE_START=NO');
      return this.live;
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }
    this.logger.log('PROVIDER_SESSION_CREATE_START=YES');
    const generation = ++this.connectGeneration;
    let connectPromise: Promise<GeminiLiveConnection | undefined> | undefined = undefined;
    connectPromise = (async () => {
      try {
        const live = await this.liveService.connect(
          'en',
          ({ message }) => {
            if (this.isCurrentAttempt(generation)) {
              this.handleGeminiMessage(message);
            }
          },
          () => {
            if (this.isCurrentAttempt(generation)) {
              this.handleLiveFailure();
            }
          }
        );
        if (!this.isCurrentAttempt(generation)) {
          live.close();
          return undefined;
        }
        this.live = live;
        this.logger.log('PROVIDER_SESSION_CREATE_RESULT=PASS');
        this.logger.log('PROVIDER_SESSION_STARTED=YES');
        this.timing.mark('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN');
        this.flushMicQueue();
        return live;
      } catch (error) {
        if (this.isCurrentAttempt(generation)) {
          this.connectGeneration++;
          this.clearMicQueue();
          const sanitizedClass = classifyProviderFailure(error);
          this.logger.log(`PROVIDER_SESSION_CREATE_RESULT=${sanitizedClass}`);
          this.logger.log('PROVIDER_SESSION_STARTED=NO');
          throw error;
        }
        return undefined;
      } finally {
        if (this.connectingPromise === connectPromise) {
          this.connectingPromise = undefined;
        }
      }
    })();
    this.connectingPromise = connectPromise;
    return connectPromise;
  }

  private handleGeminiMessage(message: LiveServerMessage): void {
    try {
      const inputText = message.serverContent?.inputTranscription?.text;
      if (inputText?.trim()) {
        this.pendingInputTranscript = mergeTranscriptFragment(
          this.pendingInputTranscript,
          inputText
        );
      }

      const outputText = message.serverContent?.outputTranscription?.text || message.text;
      if (outputText?.trim()) {
        this.timing.mark('T_PROVIDER_FIRST_OUTPUT_EVENT');
        this.startSpeaking();
        this.pendingOutputTranscript = mergeTranscriptFragment(
          this.pendingOutputTranscript,
          outputText
        );
        this.scheduleOutputTranscript();
      }

      if (message.serverContent?.turnComplete) {
        this.flushPendingTranscripts();
      }

      const audio = message.data;
      if (audio) {
        this.timing.mark('T_PROVIDER_FIRST_AUDIO_EVENT');
        this.startSpeaking();
        for (const packet of this.codec.encodeModelPcm(Buffer.from(audio, 'base64'))) {
          this.timing.mark('T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE');
          this.socket.send(packet, { binary: true });
        }
      }

      if (message.serverContent?.turnComplete && this.speaking) {
        this.sendJson({ type: 'tts', state: 'stop' });
        this.speaking = false;
        this.lastSentOutputTranscript = '';
        this.codec.reset();
      }

      const calls = message.toolCall?.functionCalls ?? [];
      if (calls.length > 0 && this.live) {
        void this.handleToolCalls(this.live, calls).catch((error: unknown) => this.fail(error));
      }
    } catch (error) {
      this.fail(error);
    }
  }

  private async handleToolCalls(
    live: GeminiLiveConnection,
    calls: Array<{ id?: string; name?: string; args?: unknown }>
  ): Promise<void> {
    const accepted: Array<{ id: string; name: string; response: Record<string, unknown> }> = [];
    const rejected: Array<{ id: string; name: string }> = [];
    for (const call of calls) {
      const id = call.id ?? randomUUID();
      const name = call.name ?? 'unknown';
      if (name !== 'propose_google_calendar_event' || !this.calendarActions) {
        rejected.push({ id, name });
        continue;
      }
      try {
        const ticket = await this.calendarActions.propose(call.args);
        this.sendJson({
          type: 'calendar_proposal',
          ticket: ticket.ticket,
          proposal: ticket.proposal,
          expires_at: ticket.expiresAt,
        });
        accepted.push({ id, name, response: { ok: true, status: 'proposal_created' } });
      } catch {
        accepted.push({ id, name, response: { ok: false, error: 'calendar proposal rejected' } });
      }
    }
    if (accepted.length > 0) live.respondToToolCalls(accepted);
    if (rejected.length > 0) live.rejectToolCalls(rejected);
  }

  private async handleCalendarMessage(message: Record<string, unknown>): Promise<void> {
    if (!this.handshaken) throw new Error('voice session not initialized; hello required');
    if (!this.calendarActions) throw new Error('Google Calendar voice actions are unavailable');
    const ticket = typeof message.ticket === 'string' ? message.ticket : '';
    if (message.action === 'confirm') {
      const event = await this.calendarActions.confirm(ticket);
      this.sendJson({ type: 'calendar', state: 'created', event_id: event.id });
      return;
    }
    if (message.action === 'cancel') {
      await this.calendarActions.cancel(ticket);
      this.sendJson({ type: 'calendar', state: 'cancelled' });
      return;
    }
    throw new Error('unsupported calendar action');
  }

  private startSpeaking(): void {
    if (this.speaking) return;
    this.speaking = true;
    this.sendJson({ type: 'tts', state: 'start' });
  }

  private sendAlert(status: string, message: string): void {
    this.sendJson({ type: 'alert', status, message, emotion: 'neutral' });
  }

  private handleLiveFailure(): void {
    this.connectGeneration++;
    const live = this.live;
    this.live = undefined;
    this.connectingPromise = undefined;
    this.clearMicQueue();
    this.clearTranscriptState();
    live?.close();
    this.speaking = false;
    this.codec.reset();
    this.sendAlert('Voice service error', 'Voice service error');
  }

  private scheduleOutputTranscript(): void {
    if (this.transcriptTimer) return;
    this.transcriptTimer = setTimeout(() => {
      this.transcriptTimer = undefined;
      this.emitStreamedOutputTranscript();
    }, TRANSCRIPT_STREAM_DELAY_MS);
  }

  private emitStreamedOutputTranscript(): void {
    const text = this.pendingOutputTranscript.trim();
    if (text && text !== this.lastSentOutputTranscript) {
      this.startSpeaking();
      this.sendJson({ type: 'tts', state: 'sentence_start', text });
      this.lastSentOutputTranscript = text;
    }
  }

  private clearTranscriptState(): void {
    if (this.transcriptTimer) {
      clearTimeout(this.transcriptTimer);
      this.transcriptTimer = undefined;
    }
    this.pendingInputTranscript = '';
    this.pendingOutputTranscript = '';
    this.lastSentOutputTranscript = '';
  }

  private flushPendingTranscripts(): void {
    if (this.transcriptTimer) {
      clearTimeout(this.transcriptTimer);
      this.transcriptTimer = undefined;
    }
    const inputText = this.pendingInputTranscript.trim();
    const outputText = this.pendingOutputTranscript.trim();
    if (inputText || outputText) this.timing.mark('T_TRANSCRIPT_FINALIZED');
    if (inputText) this.sendJson({ type: 'stt', text: inputText });
    if (outputText) {
      this.startSpeaking();
      if (outputText !== this.lastSentOutputTranscript) {
        this.sendJson({ type: 'tts', state: 'sentence_start', text: outputText });
        this.lastSentOutputTranscript = outputText;
      }
    }
    this.pendingInputTranscript = '';
    this.pendingOutputTranscript = '';
  }

  private sendJson(message: Record<string, unknown>): void {
    if (this.socket.readyState === this.socket.OPEN) this.socket.send(JSON.stringify(message));
  }

  private fail(error: unknown): void {
    // Provider and parser details are server-side diagnostics only. Never put
    // arbitrary exception text on the device-facing protocol.
    void error;
    this.clearMicQueue();
    this.clearTranscriptState();
    this.sendAlert('Voice service error', 'Voice service error');
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

export function mergeTranscriptFragment(previous: string, incoming: string): string {
  const current = previous.trim();
  const next = incoming.trim();
  if (!current) return next;
  if (!next || next === current || current.endsWith(next)) return current;
  if (next.startsWith(current)) return next;
  return `${previous}${incoming}`.trim();
}

class VoiceTimingTrace {
  private readonly emitted = new Set<string>();
  private readonly enabled = process.env.SLATE_VOICE_TIMING === '1';

  mark(stage: string): void {
    if (!this.enabled || this.emitted.has(stage)) return;
    this.emitted.add(stage);
    console.info(`[slate-voice-timing] stage=${stage} t_ms=${Date.now()}`);
  }
}

export function classifyProviderFailure(error: unknown): string {
  if (error instanceof GeminiLiveBridgeFailure) {
    return error.failureStage;
  }
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (name === 'GeminiCredentialError' || message.includes('credential')) {
    return 'CREDENTIAL_ERROR';
  }
  if (name === 'GeminiConfigurationError' || message.includes('not configured')) {
    return 'CONFIG_ERROR';
  }
  if (name === 'AbortError' || message.includes('timeout')) {
    return 'CONNECT_TIMEOUT';
  }
  if (
    name === 'TypeError' ||
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('econnrefused')
  ) {
    return 'NETWORK_ERROR';
  }
  if (name === 'GeminiProtocolError' || message.includes('protocol')) {
    return 'PROTOCOL_ERROR';
  }
  return 'UNKNOWN_SAFE_FAILURE';
}
