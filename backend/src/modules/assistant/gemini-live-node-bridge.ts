import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { accessSync, constants, lstatSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LiveServerMessage } from '@google/genai';
import type { VoiceLanguageT } from 'shared';
import { buildGeminiToolRegistry } from './gemini-tool-registry';
import {
  encodeGeminiLiveBridgeFrame,
  GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
  GEMINI_LIVE_BRIDGE_MAX_FRAME_BYTES,
  parseGeminiLiveBridgeResponse,
  type GeminiLiveBridgeErrorCode,
  type GeminiLiveBridgeRequest,
  type GeminiLiveBridgeResponse,
} from './gemini-live-bridge.protocol';
import type { GeminiLiveConnection, GeminiLiveEvent } from './gemini-live.service';

export interface NodeGeminiLiveBridgeOptions {
  executable: string;
  script: string;
  authMode: 'vertex_adc' | 'developer_api_key';
  apiKeyFile?: string;
  adcCredentialFile?: string;
  project?: string;
  location?: string;
}

export interface NodeGeminiLiveBridgeFactory {
  (options: NodeGeminiLiveBridgeOptions): NodeGeminiLiveBridge;
}

export const NODE_GEMINI_LIVE_BRIDGE_FACTORY = Symbol('NodeGeminiLiveBridgeFactory');

export const createNodeGeminiLiveBridge: NodeGeminiLiveBridgeFactory = (options) =>
  new NodeGeminiLiveBridge(options);

interface BridgeProcess {
  stdin: {
    write(data: string): boolean;
    end(): void;
    on?(event: 'error', listener: (error: Error) => void): void;
  };
  stdout: { on(event: 'data', listener: (data: Buffer | string) => void): void };
  stderr: { on(event: 'data', listener: (data: Buffer | string) => void): void };
  once(event: 'error', listener: (error: Error) => void): void;
  once(event: 'exit', listener: (code: number | null, signal: string | null) => void): void;
  kill(signal?: NodeJS.Signals): boolean;
}

type SpawnBridgeProcess = (
  executable: string,
  args: string[],
  options: { env: NodeJS.ProcessEnv; stdio: ['pipe', 'pipe', 'pipe']; shell: false }
) => BridgeProcess;

const spawnBridgeProcess: SpawnBridgeProcess = (executable, args, options) =>
  spawn(executable, args, options) as ChildProcessWithoutNullStreams;

export class NodeGeminiLiveBridge {
  constructor(
    private readonly options: NodeGeminiLiveBridgeOptions,
    private readonly processSpawner: SpawnBridgeProcess = spawnBridgeProcess
  ) {}

  connect(
    language: VoiceLanguageT,
    onEvent: (event: GeminiLiveEvent) => void,
    onError: (error: Error) => void,
    model: string,
    systemInstruction: string,
    connectTimeoutMs: number,
    enableWebSearch: boolean
  ): Promise<GeminiLiveConnection> {
    const process = this.processSpawner(
      resolveExecutable(this.options.executable),
      [resolve(this.options.script)],
      {
        env: buildBridgeEnvironment(this.options, model),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
      }
    );
    const connection = new NodeGeminiLiveConnection(process, onEvent, onError, connectTimeoutMs);
    return connection.open({
      type: 'open',
      version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
      model,
      language,
      systemInstruction,
      connectTimeoutMs,
      enableWebSearch,
      tools: buildGeminiToolRegistry(enableWebSearch),
    });
  }
}

class NodeGeminiLiveConnection implements GeminiLiveConnection {
  private state: 'starting' | 'ready' | 'disconnected' | 'closed' = 'starting';
  private hasBeenReady = false;
  private lineBuffer = '';
  private readyResolve: (() => void) | undefined;
  private readyReject: ((error: Error) => void) | undefined;
  private readyPromise: Promise<void>;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private killTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly process: BridgeProcess,
    private readonly onEvent: (event: GeminiLiveEvent) => void,
    private readonly onError: (error: Error) => void,
    private readonly connectTimeoutMs: number
  ) {
    this.readyPromise = new Promise<void>((resolveReady, rejectReady) => {
      this.readyResolve = resolveReady;
      this.readyReject = rejectReady;
    });
    process.stdout.on('data', (data) => this.handleStdout(data));
    process.stderr.on('data', () => undefined);
    process.stdin.on?.('error', () => this.failBeforeReady('Gemini Live Node bridge write failed'));
    process.once('error', () => this.failBeforeReady('Gemini Live Node bridge is unavailable'));
    process.once('exit', () => {
      this.clearCloseTimer();
      this.failBeforeReady('Gemini Live Node bridge exited before ready');
    });
  }

  async open(frame: GeminiLiveBridgeRequest): Promise<GeminiLiveConnection> {
    this.openTimer = setTimeout(
      () => this.failBeforeReady('Gemini Live Node bridge connection timed out'),
      this.connectTimeoutMs
    );
    this.write(frame);
    await this.readyPromise;
    return this;
  }

  sendAudio(pcm16: Uint8Array): void {
    this.write({
      type: 'audio',
      version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
      data: Buffer.from(pcm16).toString('base64'),
    });
  }

  sendText(text: string): void {
    this.write({ type: 'text', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION, text });
  }

  endAudio(): void {
    this.write({ type: 'audio_end', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION });
  }

  respondToToolCalls(
    calls: Array<{ id: string; name: string; response: Record<string, unknown> }>
  ): void {
    this.write({ type: 'tool_response', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION, calls });
  }

  rejectToolCalls(calls: Array<{ id: string; name: string }>): void {
    this.respondToToolCalls(
      calls.map(({ id, name }) => ({
        id,
        name,
        response: { error: 'Tool execution is not available in the voice session' },
      }))
    );
  }

  async reconnect(): Promise<void> {
    if (this.state !== 'ready' && this.state !== 'disconnected') {
      throw new Error('Gemini Live Node bridge is not ready');
    }
    this.state = 'starting';
    this.readyPromise = new Promise<void>((resolveReady, rejectReady) => {
      this.readyResolve = resolveReady;
      this.readyReject = rejectReady;
    });
    this.openTimer = setTimeout(
      () => this.failBeforeReady('Gemini Live Node bridge reconnect timed out'),
      this.connectTimeoutMs
    );
    this.write({ type: 'reconnect', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION });
    await this.readyPromise;
  }

  close(): void {
    if (this.state === 'closed') return;
    this.state = 'closed';
    this.clearTimer();
    this.rejectPendingReady('Gemini Live Node bridge was closed');
    try {
      this.process.stdin.write(
        encodeGeminiLiveBridgeFrame({
          type: 'close',
          version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
        })
      );
      this.process.stdin.end();
      this.closeTimer = setTimeout(() => {
        this.process.kill('SIGTERM');
        this.killTimer = setTimeout(() => this.process.kill('SIGKILL'), 2_000);
        this.killTimer.unref?.();
      }, 2_000);
      this.closeTimer.unref?.();
    } catch {
      this.process.kill('SIGTERM');
    }
  }

  private handleStdout(data: Buffer | string): void {
    this.lineBuffer += data.toString();
    if (Buffer.byteLength(this.lineBuffer, 'utf8') > GEMINI_LIVE_BRIDGE_MAX_FRAME_BYTES) {
      this.failBeforeReady('Gemini Live Node bridge protocol was rejected');
      return;
    }
    let newline = this.lineBuffer.indexOf('\n');
    while (newline >= 0) {
      const line = this.lineBuffer.slice(0, newline).trim();
      this.lineBuffer = this.lineBuffer.slice(newline + 1);
      if (line) this.handleResponse(line);
      newline = this.lineBuffer.indexOf('\n');
    }
  }

  private handleResponse(line: string): void {
    let response: GeminiLiveBridgeResponse;
    try {
      response = parseGeminiLiveBridgeResponse(line);
    } catch {
      this.failBeforeReady('Gemini Live Node bridge protocol was rejected');
      return;
    }
    switch (response.type) {
      case 'ready':
        this.state = 'ready';
        this.hasBeenReady = true;
        this.clearTimer();
        this.readyResolve?.();
        this.readyResolve = undefined;
        this.readyReject = undefined;
        return;
      case 'server_message':
        this.onEvent({ message: response.message as LiveServerMessage });
        return;
      case 'error':
        if (response.code === 'BRIDGE_PROVIDER_ERROR' && this.state === 'ready') {
          this.onError(new Error(errorMessage(response.code)));
        } else {
          this.failBeforeReady(errorMessage(response.code));
        }
        return;
      case 'closed':
        if (this.state === 'starting' && this.hasBeenReady) return;
        if (this.state !== 'closed') {
          this.state = 'disconnected';
          this.clearCloseTimer();
          this.onError(new Error('Gemini Live Node bridge session closed'));
        }
        return;
    }
  }

  private write(frame: GeminiLiveBridgeRequest): void {
    this.requireReadyForWrite(frame.type);
    try {
      this.process.stdin.write(encodeGeminiLiveBridgeFrame(frame));
    } catch {
      this.failBeforeReady('Gemini Live Node bridge write failed');
    }
  }

  private requireReadyForWrite(type: GeminiLiveBridgeRequest['type']): void {
    const isOpening = type === 'open';
    const isReconnecting = type === 'reconnect';
    if (
      (isOpening && this.state !== 'starting') ||
      (isReconnecting && this.state !== 'starting') ||
      (!isOpening && !isReconnecting && this.state !== 'ready')
    ) {
      throw new Error('Gemini Live Node bridge is not ready');
    }
  }

  private failBeforeReady(message: string): void {
    this.clearTimer();
    if (this.state === 'starting') {
      this.state = 'closed';
      this.terminateProcess();
      const error = new Error(message);
      this.readyReject?.(error);
      this.readyResolve = undefined;
      this.readyReject = undefined;
      this.onError(error);
      return;
    }
    if (this.state !== 'closed') {
      this.state = 'closed';
      this.clearCloseTimer();
      this.terminateProcess();
      this.onError(new Error(message));
    }
  }

  private rejectPendingReady(message: string): void {
    const reject = this.readyReject;
    this.readyResolve = undefined;
    this.readyReject = undefined;
    reject?.(new Error(message));
  }

  private clearTimer(): void {
    if (this.openTimer) clearTimeout(this.openTimer);
    this.openTimer = undefined;
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
    if (this.killTimer) clearTimeout(this.killTimer);
    this.killTimer = undefined;
  }

  private terminateProcess(): void {
    try {
      this.process.kill('SIGTERM');
    } catch {
      // The process may have already exited.
    }
  }
}

function buildBridgeEnvironment(
  options: NodeGeminiLiveBridgeOptions,
  model: string
): NodeJS.ProcessEnv {
  if (options.adcCredentialFile && !isSafeCredentialFileReference(options.adcCredentialFile)) {
    throw new Error('Gemini Live Node bridge ADC credential reference is unavailable');
  }
  return {
    PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    SLATE_GEMINI_BRIDGE_AUTH_MODE: options.authMode,
    SLATE_GEMINI_BRIDGE_MODEL: model,
    ...(options.apiKeyFile ? { SLATE_GEMINI_BRIDGE_CREDENTIAL_FILE: options.apiKeyFile } : {}),
    ...(options.adcCredentialFile
      ? { GOOGLE_APPLICATION_CREDENTIALS: options.adcCredentialFile }
      : {}),
    ...(options.project ? { SLATE_GEMINI_BRIDGE_PROJECT: options.project } : {}),
    ...(options.location ? { SLATE_GEMINI_BRIDGE_LOCATION: options.location } : {}),
  };
}

function resolveExecutable(executable: string): string {
  // Preserve PATH lookup for the documented `node` default. `resolve('node')`
  // would incorrectly turn it into a path relative to the backend working dir.
  return executable.includes('/') ? resolve(executable) : executable;
}

function isSafeCredentialFileReference(filePath: string): boolean {
  try {
    if (lstatSync(filePath).isSymbolicLink()) return false;
    const stats = statSync(filePath);
    return (
      stats.isFile() &&
      stats.size > 0 &&
      stats.size <= 64 * 1024 &&
      (stats.mode & 0o077) === 0 &&
      (() => {
        accessSync(filePath, constants.R_OK);
        return true;
      })()
    );
  } catch {
    return false;
  }
}

function errorMessage(code: GeminiLiveBridgeErrorCode): string {
  switch (code) {
    case 'BRIDGE_CREDENTIAL_UNAVAILABLE':
      return 'Gemini Live Node bridge credential is unavailable';
    case 'BRIDGE_RUNTIME_UNAVAILABLE':
      return 'Gemini Live Node bridge runtime is unavailable';
    case 'BRIDGE_PROTOCOL_REJECTED':
      return 'Gemini Live Node bridge protocol was rejected';
    case 'BRIDGE_PROVIDER_CONNECTION_FAILED':
      return 'Gemini Live Node bridge provider connection failed';
    default:
      return 'Gemini Live Node bridge failed';
  }
}
