import { describe, expect, it } from 'bun:test';
import { chmodSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GeminiConfig } from './gemini.config';
import { GeminiLiveService } from './gemini-live.service';

const SYNTHETIC_SECRET = process.env.SLATE_TEST_SYNTHETIC_SECRET ?? '/run/secrets/slate-test';
const describeWithSyntheticSecret = existsSync(SYNTHETIC_SECRET) ? describe : describe.skip;

function config(
  script: string,
  overrides: Record<string, unknown> = {},
  credentialFile = SYNTHETIC_SECRET
): GeminiConfig {
  const values: Record<string, unknown> = {
    NODE_ENV: 'test',
    GEMINI_AUTH_MODE: 'developer_api_key',
    GEMINI_API_KEY_FILE: credentialFile,
    GEMINI_DEVELOPER_API_KEY_ENABLED: true,
    GEMINI_LIVE_RUNTIME: 'node_bridge',
    GEMINI_LIVE_MODEL: 'gemini-3.1-flash-live-preview',
    GEMINI_NODE_EXECUTABLE: 'node',
    GEMINI_NODE_BRIDGE_SCRIPT: script,
    GEMINI_LIVE_CONNECT_TIMEOUT_MS: 250,
    ...overrides,
  };
  return new GeminiConfig({ get: (key: string) => values[key] } as never);
}

function mockScript(
  directory: string,
  mode: 'pass' | 'protocol' | 'crash' | 'timeout' | 'provider-error' | 'unexpected-close'
) {
  const file = join(directory, `${mode}.mjs`);
  const behavior = JSON.stringify(mode);
  writeFileSync(
    file,
    `
let buffer = '';
const mode = ${behavior};
function send(frame) { process.stdout.write(JSON.stringify(frame) + '\\n'); }
function handle(frame) {
  if (frame.type === 'open') {
    if (mode === 'protocol') { process.stdout.write('not-json\\n'); return; }
    if (mode === 'crash') { process.exit(17); return; }
    if (mode === 'timeout') return;
    send({ type: 'ready', version: 1, epoch: frame.epoch });
    if (mode === 'unexpected-close') {
      send({ type: 'closed', version: 1, epoch: frame.epoch });
    }
    if (mode === 'provider-error') {
      send({ type: 'error', version: 1, epoch: frame.epoch, code: 'BRIDGE_PROVIDER_ERROR' });
    }
    return;
  }
  if (frame.type === 'text' && mode === 'pass') {
    send({
      type: 'server_message',
      version: 1,
      epoch: 1,
      message: { serverContent: { modelTurn: { parts: [{ text: 'synthetic response' }] }, turnComplete: true } },
    });
    return;
  }
  if (frame.type === 'close') {
    send({ type: 'closed', version: 1, epoch: frame.epoch });
    setImmediate(() => process.exit(0));
  }
}
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let newline = buffer.indexOf('\\n');
  while (newline >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    try { handle(JSON.parse(line)); } catch { process.exit(18); }
    newline = buffer.indexOf('\\n');
  }
});
`,
    { mode: 0o700 }
  );
  chmodSync(file, 0o700);
  return file;
}

async function waitFor<T>(read: () => T | undefined, timeoutMs = 2_000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = read();
    if (value !== undefined) return value;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 10));
  }
  throw new Error('synthetic adapter test timed out');
}

describe('GeminiLiveService deterministic adapter differential', () => {
  it('keeps the production Developer API Node bridge guard closed before child spawn', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-adapter-production-'));
    try {
      const script = mockScript(directory, 'pass');
      const production = config(script, { NODE_ENV: 'production' });
      let childSpawned = false;
      const service = new GeminiLiveService(production, undefined, () => {
        childSpawned = true;
        throw new Error('child must not spawn');
      });

      await expect(service.connect('en', () => {}, undefined, false)).rejects.toMatchObject({
        name: 'GeminiConfigurationError',
        message: expect.stringContaining('disabled in production'),
      });
      expect(childSpawned).toBe(false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describeWithSyntheticSecret('GeminiLiveService actual Bun-parent differential', () => {
  it('spawns the actual Node mock, exchanges JSONL, and completes a synthetic turn', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-adapter-pass-'));
    try {
      const service = new GeminiLiveService(config(mockScript(directory, 'pass')));
      const events: unknown[] = [];
      const errors: Error[] = [];
      const connection = await service.connect(
        'en',
        ({ message }) => events.push(message),
        (error) => errors.push(error),
        false
      );

      connection.sendText('Say exactly TEST.');
      const event = await waitFor(() => events[0]);
      expect(event).toMatchObject({
        serverContent: {
          modelTurn: { parts: [{ text: 'synthetic response' }] },
          turnComplete: true,
        },
      });
      expect(errors).toEqual([]);
      connection.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('distinguishes deterministic child-boundary failures without exposing raw details', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-adapter-failures-'));
    try {
      const cases: Array<{
        mode: 'protocol' | 'crash' | 'timeout';
        failureStage: string;
      }> = [
        { mode: 'protocol', failureStage: 'BRIDGE_PROTOCOL_REJECTED' },
        { mode: 'crash', failureStage: 'CHILD_SPAWN_FAILED' },
        { mode: 'timeout', failureStage: 'CONNECT_TIMEOUT' },
      ];
      for (const testCase of cases) {
        const service = new GeminiLiveService(
          config(mockScript(directory, testCase.mode), {
            GEMINI_LIVE_CONNECT_TIMEOUT_MS: testCase.mode === 'timeout' ? 25 : 250,
          })
        );
        await expect(service.connect('en', () => {}, undefined, false)).rejects.toMatchObject({
          name: 'GeminiLiveBridgeFailure',
          failureStage: testCase.failureStage,
          message: 'Gemini Live connection failed',
        });
      }

      const missingExecutable = new GeminiLiveService(
        config(mockScript(directory, 'pass'), {
          GEMINI_NODE_EXECUTABLE: '/definitely/missing/slate-node',
        })
      );
      await expect(
        missingExecutable.connect('en', () => {}, undefined, false)
      ).rejects.toMatchObject({
        name: 'GeminiLiveBridgeFailure',
        failureStage: 'CHILD_SPAWN_FAILED',
      });

      const missingScript = new GeminiLiveService(config(join(directory, 'missing-bridge.mjs')));
      await expect(missingScript.connect('en', () => {}, undefined, false)).rejects.toMatchObject({
        name: 'GeminiLiveBridgeFailure',
        failureStage: 'CHILD_SPAWN_FAILED',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('keeps provider errors and unexpected closes sanitized after ready', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-adapter-post-ready-'));
    try {
      for (const mode of ['provider-error', 'unexpected-close'] as const) {
        const errors: Error[] = [];
        const service = new GeminiLiveService(config(mockScript(directory, mode)));
        const connection = await service.connect(
          'en',
          () => {},
          (error) => errors.push(error),
          false
        );
        await waitFor(() => errors[0]);
        expect(errors[0]?.message).not.toContain('synthetic');
        expect(errors[0]?.message).not.toContain('credential');
        connection.close();
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejects an unsafe credential reference before spawning the Node child', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'slate-adapter-unsafe-'));
    try {
      const unsafeCredential = join(directory, 'synthetic-key');
      writeFileSync(unsafeCredential, 'synthetic-only\n', { mode: 0o600 });
      const service = new GeminiLiveService(
        config(mockScript(directory, 'pass'), {}, unsafeCredential)
      );
      await expect(service.connect('en', () => {}, undefined, false)).rejects.toMatchObject({
        name: 'GeminiLiveBridgeFailure',
        failureStage: 'CONFIG_REJECTED_BEFORE_CHILD',
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
