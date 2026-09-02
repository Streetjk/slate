import { describe, expect, it } from 'bun:test';
import { spawn } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
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

const runtimeScript = resolve(import.meta.dir, 'gemini-live-node-bridge-runtime.mjs');
const runtimeCwd = resolve(import.meta.dir, '../../../../');

function runtimeOpenFrame(overrides: Record<string, unknown> = {}): string {
  return `${JSON.stringify({
    type: 'open',
    version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
    model: 'gemini-3.1-flash-live-preview',
    language: 'en',
    systemInstruction: 'synthetic',
    connectTimeoutMs: 1_000,
    enableWebSearch: false,
    tools: [
      {
        functionDeclarations: [
          {
            name: 'propose_google_calendar_event',
            description:
              'Propose a Google Calendar event for user confirmation. Never create or modify an event directly.',
            parametersJsonSchema: {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'start', 'end', 'allDay'],
              properties: {
                title: { type: 'string', minLength: 1, maxLength: 256 },
                start: {
                  type: 'string',
                  description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events',
                },
                end: {
                  type: 'string',
                  description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events',
                },
                allDay: { type: 'boolean' },
                location: { type: 'string', minLength: 1, maxLength: 256 },
                timezone: { type: 'string', minLength: 1, maxLength: 64 },
              },
            },
          },
          {
            name: 'get_btc_price',
            description: 'Request a cached BTC/USD series for a supported display period.',
            parametersJsonSchema: {
              type: 'object',
              additionalProperties: false,
              properties: { period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
            },
          },
        ],
      },
    ],
    ...overrides,
  })}\n`;
}

async function runRuntime(input: string, credentialFile?: string) {
  const child = spawn('node', [runtimeScript], {
    cwd: runtimeCwd,
    env: {
      PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
      NODE_ENV: 'test',
      SLATE_GEMINI_BRIDGE_AUTH_MODE: 'developer_api_key',
      SLATE_GEMINI_BRIDGE_MODEL: 'gemini-3.1-flash-live-preview',
      ...(credentialFile ? { SLATE_GEMINI_BRIDGE_CREDENTIAL_FILE: credentialFile } : {}),
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  child.stdout.on('data', (data: Buffer) => {
    stdout += data.toString();
  });
  child.stdin.end(input);
  const code = await new Promise<number | null>((resolveCode, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('runtime test child timed out'));
    }, 5_000);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('close', (exitCode) => {
      clearTimeout(timer);
      resolveCode(exitCode);
    });
  });
  return { code, stdout };
}

describe('NodeGeminiLiveBridge', () => {
  it('uses a private stdio child boundary and never puts credentials in frames', async () => {
    const child = new FakeProcess();
    const events: LiveServerMessage[] = [];
    const errors: Error[] = [];
    let spawnedExecutable = '';
    let spawnOptions: { env: Record<string, string | undefined>; shell: false } | undefined;
    const bridge = new NodeGeminiLiveBridge(options(), ((executable, _args, childOptions) => {
      spawnedExecutable = executable;
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
    expect(spawnedExecutable).toBe('/usr/local/bin/node');
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

  it('keeps a bare executable on PATH instead of resolving it against the work directory', async () => {
    const child = new FakeProcess();
    let executable = '';
    const bridge = new NodeGeminiLiveBridge(options(), ((value, _args, _childOptions) => {
      executable = value;
      return child as never;
    }) as never);

    await bridge.connect(
      'en',
      () => undefined,
      () => undefined,
      'gemini-3.1-flash-live-preview',
      'synthetic instruction',
      100,
      false
    );
    expect(executable).toBe('/usr/local/bin/node');

    const pathBridge = new NodeGeminiLiveBridge({ ...options(), executable: 'node' }, ((
      value,
      _args,
      _childOptions
    ) => {
      executable = value;
      return new FakeProcess() as never;
    }) as never);
    await pathBridge.connect(
      'en',
      () => undefined,
      () => undefined,
      'gemini-3.1-flash-live-preview',
      'synthetic instruction',
      100,
      false
    );
    expect(executable).toBe('node');
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

  it('fails closed for malformed runtime frames before provider access', async () => {
    const malformed = await runRuntime('{"type":"unknown","version":1}\n');
    expect(malformed.code).toBe(2);
    expect(malformed.stdout).toBe(
      '{"type":"error","version":1,"code":"BRIDGE_PROTOCOL_REJECTED"}\n'
    );

    const badAudio = await runRuntime(
      `${JSON.stringify({ type: 'audio', version: 1, data: 'AQID' })}\n`
    );
    expect(badAudio.code).toBe(2);
    expect(badAudio.stdout).toContain('BRIDGE_PROTOCOL_REJECTED');

    const unknownTool = await runRuntime(
      `${JSON.stringify({
        type: 'tool_response',
        version: 1,
        calls: [{ id: 'x', name: 'outlook', response: {} }],
      })}\n`
    );
    expect(unknownTool.code).toBe(2);
    expect(unknownTool.stdout).toContain('BRIDGE_PROTOCOL_REJECTED');

    const nonCanonicalTools = await runRuntime(
      runtimeOpenFrame({ tools: [{ functionDeclarations: [] }] })
    );
    expect(nonCanonicalTools.code).toBe(2);
    expect(nonCanonicalTools.stdout).toContain('BRIDGE_PROTOCOL_REJECTED');
  });

  it('fails closed for missing, empty, loose, and symlinked credentials', async () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'slate-live-bridge-runtime-'));
    const file = resolve(directory, 'credential');
    const link = resolve(directory, 'credential-link');
    try {
      for (const contents of ['', ' \n']) {
        writeFileSync(file, contents, { mode: 0o600 });
        const result = await runRuntime(runtimeOpenFrame(), file);
        expect(result.code).toBe(2);
        expect(result.stdout).toContain('BRIDGE_CREDENTIAL_UNAVAILABLE');
      }
      writeFileSync(file, 'synthetic-key\n', { mode: 0o600 });
      chmodSync(file, 0o644);
      const loose = await runRuntime(runtimeOpenFrame(), file);
      expect(loose.code).toBe(2);
      expect(loose.stdout).toContain('BRIDGE_CREDENTIAL_UNAVAILABLE');

      chmodSync(file, 0o600);
      symlinkSync(file, link);
      const symlinked = await runRuntime(runtimeOpenFrame(), link);
      expect(symlinked.code).toBe(2);
      expect(symlinked.stdout).toContain('BRIDGE_CREDENTIAL_UNAVAILABLE');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('validates ADC references before spawning and passes only the path', async () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'slate-live-bridge-adc-'));
    const file = resolve(directory, 'adc.json');
    const link = resolve(directory, 'adc-link');
    try {
      const spawnCalls: Array<Record<string, string | undefined>> = [];
      const child = new FakeProcess();
      const bridge = new NodeGeminiLiveBridge(
        {
          executable: 'node',
          script: runtimeScript,
          authMode: 'vertex_adc',
          adcCredentialFile: file,
          project: 'synthetic-project',
          location: 'synthetic-location',
        },
        ((_executable, _args, childOptions) => {
          spawnCalls.push(childOptions.env);
          return child as never;
        }) as never
      );

      expect(() =>
        bridge.connect(
          'en',
          () => undefined,
          () => undefined,
          'model',
          'test',
          100,
          false
        )
      ).toThrow('ADC credential reference is unavailable');
      writeFileSync(file, 'synthetic-adc', { mode: 0o600 });
      symlinkSync(file, link);
      expect(() =>
        new NodeGeminiLiveBridge(
          {
            executable: 'node',
            script: runtimeScript,
            authMode: 'vertex_adc',
            adcCredentialFile: link,
          },
          (() => child) as never
        ).connect(
          'en',
          () => undefined,
          () => undefined,
          'model',
          'test',
          100,
          false
        )
      ).toThrow('ADC credential reference is unavailable');

      chmodSync(file, 0o644);
      expect(() =>
        new NodeGeminiLiveBridge(
          {
            executable: 'node',
            script: runtimeScript,
            authMode: 'vertex_adc',
            adcCredentialFile: file,
          },
          (() => child) as never
        ).connect(
          'en',
          () => undefined,
          () => undefined,
          'model',
          'test',
          100,
          false
        )
      ).toThrow('ADC credential reference is unavailable');

      chmodSync(file, 0o600);
      writeFileSync(file, Buffer.alloc(64 * 1024 + 1, 'x'), { mode: 0o600 });
      expect(() =>
        new NodeGeminiLiveBridge(
          {
            executable: 'node',
            script: runtimeScript,
            authMode: 'vertex_adc',
            adcCredentialFile: file,
          },
          (() => child) as never
        ).connect(
          'en',
          () => undefined,
          () => undefined,
          'model',
          'test',
          100,
          false
        )
      ).toThrow('ADC credential reference is unavailable');
      expect(spawnCalls).toHaveLength(0);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
