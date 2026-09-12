import { Logger } from '@nestjs/common';
import type { LiveServerMessage } from '@google/genai';
import { randomUUID } from 'node:crypto';
import type { RawData, WebSocket } from 'ws';
import { GeminiLiveService, type GeminiLiveConnection } from './gemini-live.service';
import {
  GEMINI_LIVE_FAILURE_STAGES,
  GeminiLiveBridgeFailure,
  GeminiLiveBridgeProtocolError,
} from './gemini-live-bridge.protocol';
import { OpusPcmCodec, type VoiceCodec } from './opus-pcm-codec';
import type { VoiceLanguageT } from 'shared';

const MAX_PRE_PROVIDER_MIC_FRAMES = 50;
const MAX_PRE_PROVIDER_MIC_BYTES = 100 * 1024;
const TRANSCRIPT_STREAM_DELAY_MS = 100;

export type LiveFailureSource =
  | 'CONNECT_REJECT'
  | 'PROVIDER_ONERROR'
  | 'PROVIDER_ONCLOSE'
  | 'BRIDGE_ERROR'
  | 'MESSAGE_HANDLER_EXCEPTION'
  | 'AUDIO_CODEC_EXCEPTION'
  | 'SOCKET_SEND_EXCEPTION'
  | 'OTHER_SAFE_CLASS';

export class AudioCodecError extends Error {
  constructor(message = 'Audio codec error') {
    super(message);
    this.name = 'AudioCodecError';
  }
}

export class SocketSendError extends Error {
  constructor(message = 'WebSocket send error') {
    super(message);
    this.name = 'SocketSendError';
  }
}

export class MessageHandlerError extends Error {
  constructor(message = 'Message handler error') {
    super(message);
    this.name = 'MessageHandlerError';
  }
}

export class ProviderOnError extends Error {
  constructor(message = 'Provider error') {
    super(message);
    this.name = 'ProviderOnError';
  }
}

export class ProviderOnClose extends Error {
  constructor(message = 'Provider session closed') {
    super(message);
    this.name = 'ProviderOnClose';
  }
}

export class ConnectRejectError extends Error {
  constructor(message = 'Provider connect rejected') {
    super(message);
    this.name = 'ConnectRejectError';
  }
}

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
  private readonly logger: Logger;
  private readonly sessionId = randomUUID();
  private readonly codec: VoiceCodec;
  private readonly timing: VoiceTimingTrace;
  private live: GeminiLiveConnection | undefined;
  private connectingPromise: Promise<GeminiLiveConnection | undefined> | undefined;
  private connectGeneration = 0;
  private listenGeneration = 0;
  private handshaken = false;
  private listening = false;
  private closed = false;
  private speaking = false;
  private failing = false;
  private expectedProviderClose = false;
  private pendingInputTranscript = '';
  private lastSentInputTranscript = '';
  private pendingOutputTranscript = '';
  private lastSentOutputTranscript = '';
  private inputTranscriptTimer: ReturnType<typeof setTimeout> | undefined;
  private transcriptTimer: ReturnType<typeof setTimeout> | undefined;
  private operation = Promise.resolve();
  private pendingOperations = 0;
  private micFrameMarkerEmitted = false;
  private micQueue: Uint8Array[] = [];
  private micQueueBytes = 0;

  constructor(
    private readonly socket: WebSocket,
    private readonly liveService: GeminiLiveService,
    codecFactory: () => VoiceCodec = () => new OpusPcmCodec(),
    private readonly calendarActions?: VoiceCalendarActions,
    logger?: Logger,
    private readonly language?: VoiceLanguageT
  ) {
    this.codec = codecFactory();
    this.logger = logger ?? new Logger(XiaozhiVoiceSession.name);
    this.timing = new VoiceTimingTrace(this.logger);
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
      this.pendingOperations++;
      this.logOperationQueueDepth();
      this.operation = this.operation
        .then(() => this.handleMessage(data, isBinary))
        .catch((error: unknown) => {
          if (!this.failing && !this.closed) {
            this.fail(error, 'MESSAGE_HANDLER_EXCEPTION');
          }
        })
        .finally(() => {
          this.pendingOperations = Math.max(0, this.pendingOperations - 1);
        });
    });
    this.socket.on('close', () => this.close());
    this.socket.on('error', () => this.close());
  }

  getOperationQueueDepth(): number {
    return this.pendingOperations;
  }

  getPreProviderMicQueueFrames(): number {
    return this.micQueue.length;
  }

  getPreProviderMicQueueBytes(): number {
    return this.micQueueBytes;
  }

  getWebSocketBufferedBytes(): number {
    return this.socket.bufferedAmount ?? 0;
  }

  getTimingTrace(): VoiceTimingTrace {
    return this.timing;
  }

  private logOperationQueueDepth(): void {
    if (this.pendingOperations > 1) {
      this.logger.log(`BACKEND_OPERATION_QUEUE_DEPTH=${this.pendingOperations}`);
    }
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
        if (!this.handshaken)
          throw new MessageHandlerError('voice session not initialized; hello required');
        if (message.state === 'start') {
          this.listening = true;
          this.expectedProviderClose = false;
          const turn = ++this.listenGeneration;
          this.clearMicQueue();
          this.clearTranscriptState();
          this.timing.startTurn(turn);
          this.timing.mark('T_DEVICE_LISTEN_START');
          void this.ensureLive().catch((error: unknown) => {
            if (!this.closed && this.listening && this.listenGeneration === turn) {
              const source = isBridgeError(error) ? 'BRIDGE_ERROR' : 'CONNECT_REJECT';
              this.fail(error, source, {
                liveSessionPresent: false,
                connectingPromisePresent: true,
                listenGeneration: turn,
              });
            }
          });
        } else if (message.state === 'stop') {
          this.listening = false;
          this.timing.mark('T_AUDIO_INPUT_COMMIT_OR_TURN_END');
          this.clearMicQueue();
          this.flushInputTranscript();
          if (this.live) {
            try {
              this.live.endAudio();
            } catch (error) {
              const source: LiveFailureSource = isBridgeError(error)
                ? 'BRIDGE_ERROR'
                : 'OTHER_SAFE_CLASS';
              this.fail(error, source);
              return;
            }
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
                  try {
                    conn.endAudio();
                  } catch (error) {
                    const source: LiveFailureSource = isBridgeError(error)
                      ? 'BRIDGE_ERROR'
                      : 'OTHER_SAFE_CLASS';
                    this.fail(error, source);
                  }
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
        this.expectedProviderClose = true;
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
    this.expectedProviderClose = true;
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
    if (this.handshaken) throw new MessageHandlerError('duplicate voice hello');
    if (message.transport !== 'websocket' || message.version !== 1) {
      throw new MessageHandlerError('unsupported voice WebSocket protocol');
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
      throw new MessageHandlerError('voice audio received before session start');
    if (!this.micFrameMarkerEmitted) {
      this.micFrameMarkerEmitted = true;
      this.logger.log('FIRST_MIC_FRAME_RECEIVED=YES');
    }
    this.timing.mark('T_FIRST_DEVICE_AUDIO_SENT');
    this.timing.mark('T_BACKEND_FIRST_AUDIO_RECEIVED');
    if (this.live) {
      let pcm: Uint8Array;
      try {
        pcm = this.codec.decodeDevicePacket(packet);
      } catch {
        throw new AudioCodecError();
      }
      try {
        this.live.sendAudio(pcm);
      } catch (error) {
        const source: LiveFailureSource = isBridgeError(error)
          ? 'BRIDGE_ERROR'
          : 'OTHER_SAFE_CLASS';
        this.fail(error, source);
      }
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
    this.logger.log(`BACKEND_PRE_PROVIDER_MIC_QUEUE_FRAMES=${this.micQueue.length}`);
    this.logger.log(`BACKEND_PRE_PROVIDER_MIC_QUEUE_BYTES=${this.micQueueBytes}`);
  }

  private flushMicQueue(): void {
    if (!this.live || this.micQueue.length === 0) return;
    const frames = this.micQueue;
    this.micQueue = [];
    this.micQueueBytes = 0;
    this.logger.log('BACKEND_PRE_PROVIDER_MIC_QUEUE_FRAMES=0');
    this.logger.log('BACKEND_PRE_PROVIDER_MIC_QUEUE_BYTES=0');
    for (const frame of frames) {
      let pcm: Uint8Array;
      try {
        pcm = this.codec.decodeDevicePacket(frame);
      } catch {
        this.fail(new AudioCodecError(), 'AUDIO_CODEC_EXCEPTION');
        return;
      }
      try {
        this.live.sendAudio(pcm);
      } catch (error) {
        const source: LiveFailureSource = isBridgeError(error)
          ? 'BRIDGE_ERROR'
          : 'OTHER_SAFE_CLASS';
        this.fail(error, source);
        return;
      }
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
      this.timing.mark('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN');
      return this.live;
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }
    this.logger.log('PROVIDER_SESSION_CREATE_START=YES');
    const generation = ++this.connectGeneration;
    let isConnected = false;
    let connectPromise: Promise<GeminiLiveConnection | undefined> | undefined = undefined;
    connectPromise = (async () => {
      try {
        const live = await this.liveService.connect(
          this.language,
          ({ message }) => {
            if (this.isCurrentAttempt(generation)) {
              this.handleGeminiMessage(message);
            }
          },
          (error) => {
            if (!isConnected) {
              return;
            }
            if (this.isCurrentAttempt(generation)) {
              this.handleLiveFailure(error);
            } else if (
              this.expectedProviderClose &&
              (isProviderOnclose(error) ||
                (error instanceof GeminiLiveBridgeFailure &&
                  error.failureStage === 'SESSION_CLOSED_UNEXPECTEDLY'))
            ) {
              this.handleExpectedProviderClose();
            }
          }
        );
        if (!this.isCurrentAttempt(generation)) {
          this.expectedProviderClose = true;
          live.close();
          return undefined;
        }
        isConnected = true;
        this.live = live;
        this.logger.log('PROVIDER_SESSION_CREATE_RESULT=PASS');
        this.logger.log('PROVIDER_SESSION_STARTED=YES');
        this.timing.mark('T_PROVIDER_SESSION_READY');
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
        this.timing.mark('T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL');
        this.pendingInputTranscript = mergeTranscriptFragment(
          this.pendingInputTranscript,
          inputText
        );
        if (!this.lastSentInputTranscript) {
          this.flushInputTranscript();
        } else {
          this.scheduleInputTranscript();
        }
      }

      const outputText = message.serverContent?.outputTranscription?.text || message.text;
      if (outputText?.trim()) {
        this.timing.mark('T_PROVIDER_FIRST_OUTPUT_EVENT');
        this.flushInputTranscript();
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
        this.flushInputTranscript();
        this.startSpeaking();
        let packets: Uint8Array[];
        try {
          packets = this.codec.encodeModelPcm(Buffer.from(audio, 'base64'));
        } catch {
          this.fail(new AudioCodecError(), 'AUDIO_CODEC_EXCEPTION');
          return;
        }
        for (const packet of packets) {
          this.timing.mark('T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE');
          this.sendBinary(packet);
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
        void this.handleToolCalls(this.live, calls);
      }
    } catch (error) {
      if (!this.failing && !this.closed) {
        this.fail(error);
      }
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
    try {
      if (accepted.length > 0) live.respondToToolCalls(accepted);
      if (rejected.length > 0) live.rejectToolCalls(rejected);
    } catch (error) {
      const source: LiveFailureSource = isBridgeError(error) ? 'BRIDGE_ERROR' : 'OTHER_SAFE_CLASS';
      this.fail(error, source);
    }
  }

  private async handleCalendarMessage(message: Record<string, unknown>): Promise<void> {
    if (!this.handshaken)
      throw new MessageHandlerError('voice session not initialized; hello required');
    if (!this.calendarActions)
      throw new MessageHandlerError('Google Calendar voice actions are unavailable');
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
    throw new MessageHandlerError('unsupported calendar action');
  }

  private startSpeaking(): void {
    if (this.speaking) return;
    this.speaking = true;
    this.sendJson({ type: 'tts', state: 'start' });
  }

  private sendAlert(status: string, message: string): void {
    this.sendJson({ type: 'alert', status, message, emotion: 'neutral' });
  }

  private handleExpectedProviderClose(): void {
    this.logger.log('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
    this.logger.log('PROVIDER_CLOSE_EXPECTED=YES');
  }

  private handleLiveFailure(error?: unknown): void {
    const isBridge = isBridgeError(error);
    const isClose = !isBridge && isProviderOnclose(error);

    if (isClose) {
      this.logger.log('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      if (this.expectedProviderClose) {
        this.logger.log('PROVIDER_CLOSE_EXPECTED=YES');
        return;
      }
    } else {
      this.logger.log('PROVIDER_LIVE_ERROR_CALLBACK=YES');
    }

    const failureSource: LiveFailureSource = isBridge
      ? 'BRIDGE_ERROR'
      : isClose
        ? 'PROVIDER_ONCLOSE'
        : 'PROVIDER_ONERROR';

    this.logFailureMarkers(failureSource, {
      providerCloseExpected: false,
      liveSessionPresent: this.live !== undefined,
      connectingPromisePresent: this.connectingPromise !== undefined,
    });

    this.connectGeneration++;
    const live = this.live;
    this.live = undefined;
    this.connectingPromise = undefined;
    this.clearMicQueue();
    this.clearTranscriptState();
    this.expectedProviderClose = true;
    live?.close();
    this.speaking = false;
    this.codec.reset();
    this.sendAlert('Voice service error', 'Voice service error');
  }

  private scheduleInputTranscript(generation = this.listenGeneration): void {
    if (this.inputTranscriptTimer) return;
    this.inputTranscriptTimer = setTimeout(() => {
      this.inputTranscriptTimer = undefined;
      if (!this.closed && this.listenGeneration === generation) {
        this.flushInputTranscript(generation);
      }
    }, TRANSCRIPT_STREAM_DELAY_MS);
  }

  private flushInputTranscript(generation = this.listenGeneration): void {
    if (this.closed || this.listenGeneration !== generation) return;
    if (this.inputTranscriptTimer) {
      clearTimeout(this.inputTranscriptTimer);
      this.inputTranscriptTimer = undefined;
    }
    const text = this.pendingInputTranscript.trim();
    if (text && text !== this.lastSentInputTranscript) {
      this.timing.mark('T_BACKEND_USER_TRANSCRIPT_FLUSH');
      this.timing.mark('T_USER_BUBBLE_EVENT_POSTED');
      this.sendJson({ type: 'stt', text });
      this.lastSentInputTranscript = text;
    }
  }

  private scheduleOutputTranscript(generation = this.listenGeneration): void {
    if (this.transcriptTimer) return;
    this.transcriptTimer = setTimeout(() => {
      this.transcriptTimer = undefined;
      if (!this.closed && this.listenGeneration === generation) {
        this.emitStreamedOutputTranscript(generation);
      }
    }, TRANSCRIPT_STREAM_DELAY_MS);
  }

  private emitStreamedOutputTranscript(generation = this.listenGeneration): void {
    if (this.closed || this.listenGeneration !== generation) return;
    this.flushInputTranscript(generation);
    const text = this.pendingOutputTranscript.trim();
    if (text && text !== this.lastSentOutputTranscript) {
      this.startSpeaking();
      this.sendJson({ type: 'tts', state: 'sentence_start', text });
      this.lastSentOutputTranscript = text;
    }
  }

  private clearTranscriptState(): void {
    if (this.inputTranscriptTimer) {
      clearTimeout(this.inputTranscriptTimer);
      this.inputTranscriptTimer = undefined;
    }
    if (this.transcriptTimer) {
      clearTimeout(this.transcriptTimer);
      this.transcriptTimer = undefined;
    }
    this.pendingInputTranscript = '';
    this.lastSentInputTranscript = '';
    this.pendingOutputTranscript = '';
    this.lastSentOutputTranscript = '';
  }

  private flushPendingTranscripts(generation = this.listenGeneration): void {
    if (this.closed || this.listenGeneration !== generation) return;
    if (this.transcriptTimer) {
      clearTimeout(this.transcriptTimer);
      this.transcriptTimer = undefined;
    }
    this.flushInputTranscript(generation);
    const outputText = this.pendingOutputTranscript.trim();
    if (this.lastSentInputTranscript || outputText) {
      this.timing.mark('T_TRANSCRIPT_FINALIZED');
    }
    if (outputText) {
      this.startSpeaking();
      if (outputText !== this.lastSentOutputTranscript) {
        this.sendJson({ type: 'tts', state: 'sentence_start', text: outputText });
        this.lastSentOutputTranscript = outputText;
      }
    }
  }

  private sendBinary(packet: Uint8Array): void {
    if (this.socket.readyState === this.socket.OPEN) {
      try {
        this.socket.send(packet, { binary: true });
        this.logWebSocketBacklog();
      } catch {
        if (!this.closed && !this.failing) {
          this.fail(new SocketSendError(), 'SOCKET_SEND_EXCEPTION');
        }
      }
    }
  }

  private sendJson(message: Record<string, unknown>): void {
    if (this.socket.readyState === this.socket.OPEN) {
      try {
        this.socket.send(JSON.stringify(message));
        this.logWebSocketBacklog();
      } catch {
        if (!this.closed && !this.failing) {
          this.fail(new SocketSendError(), 'SOCKET_SEND_EXCEPTION');
        }
      }
    }
  }

  private logWebSocketBacklog(): void {
    const buffered = this.socket.bufferedAmount ?? 0;
    if (buffered > 0) {
      this.logger.log(`VOICE_WS_BUFFERED_BYTES=${buffered}`);
      this.logger.log(`VOICE_WS_SEND_BACKLOG_BYTES=${buffered}`);
    }
  }

  private logFailureMarkers(
    source: LiveFailureSource,
    options?: {
      providerCloseExpected?: boolean;
      liveSessionPresent?: boolean;
      connectingPromisePresent?: boolean;
      listeningState?: boolean;
      connectGeneration?: number;
      listenGeneration?: number;
    }
  ): void {
    const closeExpected = options?.providerCloseExpected ?? false;
    const listening = options?.listeningState ?? this.listening;
    const livePresent = options?.liveSessionPresent ?? this.live !== undefined;
    const connectingPresent =
      options?.connectingPromisePresent ?? this.connectingPromise !== undefined;
    const connectGen = options?.connectGeneration ?? this.connectGeneration;
    const listenGen = options?.listenGeneration ?? this.listenGeneration;

    this.logger.log(`LIVE_FAILURE_SOURCE=${source}`);
    this.logger.log(`PROVIDER_CLOSE_EXPECTED=${closeExpected ? 'YES' : 'NO'}`);
    this.logger.log(`ACTIVE_CONNECT_GENERATION=${connectGen}`);
    this.logger.log(`ACTIVE_LISTEN_GENERATION=${listenGen}`);
    this.logger.log(`LISTENING_STATE_AT_FAILURE=${listening ? 'YES' : 'NO'}`);
    this.logger.log(`LIVE_SESSION_PRESENT_AT_FAILURE=${livePresent ? 'YES' : 'NO'}`);
    this.logger.log(`CONNECTING_PROMISE_PRESENT_AT_FAILURE=${connectingPresent ? 'YES' : 'NO'}`);
    this.logger.log(`BACKEND_OPERATION_QUEUE_DEPTH=${this.pendingOperations}`);
    this.logger.log(`VOICE_WS_BUFFERED_BYTES=${this.socket.bufferedAmount ?? 0}`);
  }

  private fail(
    error: unknown,
    sourceOverride?: LiveFailureSource,
    stateOverride?: {
      liveSessionPresent?: boolean;
      connectingPromisePresent?: boolean;
      connectGeneration?: number;
      listenGeneration?: number;
    }
  ): void {
    if (this.failing) return;
    this.failing = true;
    // Provider and parser details are server-side diagnostics only. Never put
    // arbitrary exception text on the device-facing protocol.
    const source = sourceOverride ?? classifyLiveFailureSource(error);
    this.logFailureMarkers(source, {
      providerCloseExpected: false,
      liveSessionPresent: stateOverride?.liveSessionPresent,
      connectingPromisePresent: stateOverride?.connectingPromisePresent,
      connectGeneration: stateOverride?.connectGeneration,
      listenGeneration: stateOverride?.listenGeneration,
    });
    this.clearMicQueue();
    this.clearTranscriptState();
    this.sendAlert('Voice service error', 'Voice service error');
    this.close();
    if (this.socket.readyState === this.socket.OPEN)
      this.socket.close(1011, 'voice session failed');
  }
}

function parseJson(value: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new MessageHandlerError();
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MessageHandlerError();
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

export function sanitizeTimingMs(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    const floored = Math.floor(value);
    const str = floored.toString();
    if (/^\d+$/.test(str)) {
      return str;
    }
  }
  return '0';
}

export class VoiceTimingTrace {
  private readonly emitted = new Set<string>();
  private readonly turnEmitted = new Set<string>();
  private readonly turnStages = new Map<number, Map<string, string>>();
  private currentTurn = 1;
  private readonly enabled = process.env.SLATE_VOICE_TIMING === '1';

  constructor(
    private readonly logger?: Logger,
    private readonly clock: () => number = Date.now
  ) {}

  startTurn(turnIndex: number, timestampMs?: number): void {
    this.currentTurn = turnIndex;
    this.turnEmitted.clear();
    if (!this.turnStages.has(turnIndex)) {
      this.turnStages.set(turnIndex, new Map());
    }
    const raw =
      typeof timestampMs === 'number' && Number.isFinite(timestampMs) ? timestampMs : this.clock();
    const sanitizedMs = sanitizeTimingMs(raw);
    this.turnStages.get(turnIndex)!.set('VOICE_TURN_START', sanitizedMs);
    if (this.logger) {
      this.logger.log(`ACTIVE_LISTEN_GENERATION=${turnIndex}`);
      this.logger.log(`VOICE_TURN_INDEX=${turnIndex}`);
      this.logger.log('VOICE_TURN_START=YES');
      this.logger.log(`VOICE_TURN_START_MS=${sanitizedMs}`);
    }
    if (this.enabled) {
      console.info(
        `[slate-voice-timing] stage=VOICE_TURN_START turn=${turnIndex} t_ms=${sanitizedMs}`
      );
    }
  }

  getTurn(): number {
    return this.currentTurn;
  }

  mark(stage: string, timestampMs?: number): void {
    const raw =
      typeof timestampMs === 'number' && Number.isFinite(timestampMs) ? timestampMs : this.clock();
    const sanitizedMs = sanitizeTimingMs(raw);

    this.emitStage(stage, sanitizedMs);

    if (stage === 'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN') {
      this.emitStage('T_PROVIDER_SESSION_READY', sanitizedMs);
    } else if (stage === 'T_PROVIDER_SESSION_READY') {
      this.emitStage('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN', sanitizedMs);
    }
  }

  private emitStage(stage: string, sanitizedMs: string): void {
    if (this.turnEmitted.has(stage)) return;
    this.turnEmitted.add(stage);
    this.emitted.add(stage);
    if (!this.turnStages.has(this.currentTurn)) {
      this.turnStages.set(this.currentTurn, new Map());
    }
    this.turnStages.get(this.currentTurn)!.set(stage, sanitizedMs);
    if (this.logger) {
      this.logger.log(`${stage}=YES`);
      this.logger.log(`${stage}_MS=${sanitizedMs}`);
    }
    if (this.enabled) {
      console.info(
        `[slate-voice-timing] stage=${stage} turn=${this.currentTurn} t_ms=${sanitizedMs}`
      );
    }
  }

  has(stage: string): boolean {
    return this.turnEmitted.has(stage);
  }

  hasForTurn(turnIndex: number, stage: string): boolean {
    return this.turnStages.get(turnIndex)?.has(stage) ?? false;
  }

  getStageTimestamp(stage: string, turnIndex?: number): string | undefined {
    const targetTurn = turnIndex ?? this.currentTurn;
    return this.turnStages.get(targetTurn)?.get(stage);
  }

  hasEver(stage: string): boolean {
    return this.emitted.has(stage);
  }

  reset(): void {
    this.emitted.clear();
    this.turnEmitted.clear();
    this.turnStages.clear();
    this.currentTurn = 1;
  }
}

const SAFE_PROVIDER_FAILURE_STAGES = new Set<string>(GEMINI_LIVE_FAILURE_STAGES);

export function classifyProviderFailure(error: unknown): string {
  if (error instanceof GeminiLiveBridgeFailure) {
    if (SAFE_PROVIDER_FAILURE_STAGES.has(error.failureStage)) {
      return error.failureStage;
    }
    return 'UNKNOWN_SAFE_FAILURE';
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

function isBridgeError(error: unknown): boolean {
  if (error instanceof GeminiLiveBridgeProtocolError) return true;
  if (error instanceof GeminiLiveBridgeFailure) return true;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    name === 'GeminiLiveBridgeFailure' ||
    name === 'GeminiLiveBridgeProtocolError' ||
    name === 'BridgeError' ||
    message.includes('bridge')
  );
}

function isProviderOnclose(error: unknown): boolean {
  if (isBridgeError(error)) return false;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    name === 'ProviderOnClose' ||
    name === 'GeminiLiveSessionClosedError' ||
    message.includes('session closed') ||
    message.includes('onclose') ||
    message.includes('provider closed')
  );
}

function isProviderOnerror(error: unknown): boolean {
  if (isBridgeError(error)) return false;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    name === 'ProviderOnError' ||
    name === 'GeminiLiveConnectionError' ||
    message.includes('connection error') ||
    message.includes('onerror') ||
    message.includes('provider error')
  );
}

function isAudioCodecException(error: unknown): boolean {
  if (error instanceof AudioCodecError) return true;
  const name = error instanceof Error ? error.name : '';
  return name === 'AudioCodecError';
}

function isSocketSendException(error: unknown): boolean {
  if (error instanceof SocketSendError) return true;
  const name = error instanceof Error ? error.name : '';
  return name === 'SocketSendError';
}

function isMessageHandlerException(error: unknown): boolean {
  if (error instanceof MessageHandlerError || error instanceof SyntaxError) return true;
  const name = error instanceof Error ? error.name : '';
  return name === 'MessageHandlerError';
}

function isConnectReject(error: unknown): boolean {
  if (error instanceof ConnectRejectError) return true;
  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    name === 'ConnectRejectError' ||
    name === 'ConnectReject' ||
    name === 'GeminiConfigurationError' ||
    name === 'GeminiCredentialError' ||
    message.includes('connect reject') ||
    message.includes('connection failed') ||
    message.includes('timeout')
  );
}

export function classifyLiveFailureSource(
  error: unknown,
  context?: LiveFailureSource
): LiveFailureSource {
  if (context) return context;
  if (isSocketSendException(error)) return 'SOCKET_SEND_EXCEPTION';
  if (isAudioCodecException(error)) return 'AUDIO_CODEC_EXCEPTION';
  if (isMessageHandlerException(error)) return 'MESSAGE_HANDLER_EXCEPTION';
  if (isBridgeError(error)) return 'BRIDGE_ERROR';
  if (isProviderOnclose(error)) return 'PROVIDER_ONCLOSE';
  if (isProviderOnerror(error)) return 'PROVIDER_ONERROR';
  if (isConnectReject(error)) return 'CONNECT_REJECT';
  return 'OTHER_SAFE_CLASS';
}
