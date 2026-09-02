import { describe, expect, it } from 'bun:test';
import type { LiveServerMessage } from '@google/genai';
import {
  GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
  type GeminiLiveBridgeRequest,
} from './gemini-live-bridge.protocol';
import { NodeGeminiLiveBridge } from './gemini-live-node-bridge';

class FakeStream {
  private readonly listeners: Array<(data: Buffer) => void> = [];

  on(_event: 'data', listener: (data: Buffer) => void): void {
    this.listeners.push(listener);
  }

  emit(data: string): void {
    for (const listener of this.listeners) listener(Buffer.from(`${data}\n`));
  }
}

class FakeProcess {
  readonly stdout = new FakeStream();
  readonly stderr = new FakeStream();
  readonly writes: GeminiLiveBridgeRequest[] = [];
  readonly envs: Array<Record<string, string | undefined>> = [];
  suppressNextReady = false;
  private readonly onceListeners = new Map<string, (...args: unknown[]) => void>();

  readonly stdin = {
    write: (data: string): boolean => {
      const frame = JSON.parse(data) as GeminiLiveBridgeRequest;
      this.writes.push(frame);
      if (frame.type === 'open' || frame.type === 'reconnect') {
        queueMicrotask(() => {
          if (frame.type === 'reconnect' && this.suppressNextReady) return;
          if (frame.type === 'reconnect') this.stdout.emit('{"type":"closed","version":1}');
          this.stdout.emit('{"type":"ready","version":1}');
        });
      }
      return true;
    },
    end: (): void => undefined,
  };

  once(event: 'error' | 'exit', listener: (...args: unknown[]) => void): void {
    this.onceListeners.set(event, listener);
  }

  kill(): boolean {
    this.onceListeners.get('exit')?.(0, null);
    return true;
  }
}

function options() {
  return {
    executable: '/usr/local/bin/node',
    script: './src/modules/assistant/gemini-live-node-bridge-runtime.mjs',
    authMode: 'developer_api_key' as const,
    apiKeyFile: '/run/secrets/gemini_api_key',
  };
}

describe('NodeGeminiLiveBridge', () => {
  it('uses a private stdio child boundary and never puts credentials in frames', async () => {
    const child = new FakeProcess();
    const events: LiveServerMessage[] = [];
    const errors: Error[] = [];
    let spawnOptions: { env: Record<string, string | undefined>; shell: false } | undefined;
    const bridge = new NodeGeminiLiveBridge(options(), ((_executable, _args, childOptions) => {
      spawnOptions = childOptions as typeof spawnOptions;
      return child as never;
    }) as never);

    const connection = await bridge.connect(
      'en',
      ({ message }) => events.push(message),
      (error) => errors.push(error),
      'gemini-3.1-flash-live-preview',
      'synthetic instruction',
      100,
      true
    );

    expect(spawnOptions?.shell).toBe(false);
    expect(spawnOptions?.env).toEqual({
      PATH: expect.any(String),
      NODE_ENV: expect.any(String),
      SLATE_GEMINI_BRIDGE_AUTH_MODE: 'developer_api_key',
      SLATE_GEMINI_BRIDGE_MODEL: 'gemini-3.1-flash-live-preview',
      SLATE_GEMINI_BRIDGE_CREDENTIAL_FILE: '/run/secrets/gemini_api_key',
    });
    expect(JSON.stringify(child.writes[0])).not.toContain('gemini_api_key');
    expect(JSON.stringify(child.writes[0])).not.toContain('credential');

    connection.sendAudio(new Uint8Array([1, 2, 3, 4]));
    connection.sendText('synthetic text');
    connection.endAudio();
    expect(child.writes.slice(1, 4)).toEqual([
      { type: 'audio', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION, data: 'AQIDBA==' },
      { type: 'text', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION, text: 'synthetic text' },
      { type: 'audio_end', version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION },
    ]);

    child.stdout.emit('{"type":"server_message","version":1,"message":{"synthetic":true}}');
    expect(events).toEqual([{ synthetic: true }]);
    expect(errors).toHaveLength(0);

    child.stdout.emit('{"type":"closed","version":1}');
    expect(errors).toHaveLength(1);
    await connection.reconnect();
    expect(child.writes.at(-1)).toEqual({
      type: 'reconnect',
      version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
    });
    connection.close();
    expect(child.writes.at(-1)).toEqual({
      type: 'close',
      version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
    });
  });

  it('fails safely when the configured Node runtime cannot be spawned', () => {
    const bridge = new NodeGeminiLiveBridge(options(), (() => {
      throw new Error('synthetic spawn failure');
    }) as never);

    expect(() =>
      bridge.connect(
        'en',
        () => undefined,
        () => undefined,
        'gemini-3.1-flash-live-preview',
        'synthetic instruction',
        100,
        false
      )
    ).toThrow('synthetic spawn failure');
  });

  it('settles a reconnect when the caller closes during the pending handshake', async () => {
    const child = new FakeProcess();
    const bridge = new NodeGeminiLiveBridge(options(), ((_executable, _args, _childOptions) => {
      return child as never;
    }) as never);
    const connection = await bridge.connect(
      'en',
      () => undefined,
      () => undefined,
      'gemini-3.1-flash-live-preview',
      'synthetic instruction',
      100,
      false
    );

    child.suppressNextReady = true;
    const reconnect = connection.reconnect();
    connection.close();
    await expect(reconnect).rejects.toThrow('was closed');
  });
});
