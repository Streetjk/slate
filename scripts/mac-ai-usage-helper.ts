import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_HELPER_PORT = 19091;
export const FLOW_TTL_MS = 10 * 60_000;
export const MAX_CAPTURE_BYTES = 32 * 1024;

export type HelperProvider = 'codex' | 'agy_gemini' | 'claude' | 'grok';
export type DeviceAuthProvider = 'codex' | 'grok';
export type DeviceAuthStatus =
  | 'STARTING'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

interface ProviderSpec {
  command: string;
  versionArgs: string[];
  deviceAuthArgs?: string[];
  allowedHosts?: string[];
}

const PROVIDERS: Record<HelperProvider, ProviderSpec> = {
  codex: {
    command: process.env.SLATE_CODEX_BIN ?? join(homedir(), '.local', 'bin', 'codex'),
    versionArgs: ['--version'],
    deviceAuthArgs: ['login', '--device-auth'],
    allowedHosts: ['auth.openai.com', 'chatgpt.com', 'openai.com'],
  },
  agy_gemini: {
    command: process.env.SLATE_AGY_BIN ?? join(homedir(), '.local', 'bin', 'agy'),
    versionArgs: ['--version'],
  },
  claude: {
    command: process.env.SLATE_CLAUDE_BIN ?? '/opt/homebrew/bin/claude',
    versionArgs: ['--version'],
  },
  grok: {
    command: process.env.SLATE_GROK_BIN ?? join(homedir(), '.local', 'bin', 'grok'),
    versionArgs: ['--version'],
    deviceAuthArgs: ['login', '--device-auth'],
    allowedHosts: ['auth.x.ai', 'x.ai', 'grok.com'],
  },
};

interface FlowState {
  id: string;
  provider: DeviceAuthProvider;
  status: DeviceAuthStatus;
  verificationUri: string | null;
  userCode: string | null;
  expiresAt: string;
  error: string | null;
  process: ReturnType<typeof Bun.spawn> | null;
  timer: ReturnType<typeof setTimeout> | null;
  output: string;
}

const flows = new Map<string, FlowState>();

export function stripAnsi(value: string): string {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

export function extractDeviceAuthFields(
  provider: DeviceAuthProvider,
  value: string
): { verificationUri: string | null; userCode: string | null } {
  const clean = stripAnsi(value);
  const allowed = new Set(PROVIDERS[provider].allowedHosts ?? []);
  let verificationUri: string | null = null;
  for (const match of clean.matchAll(/https:\/\/[^\s<>"']+/g)) {
    try {
      const parsed = new URL(match[0].replace(/[),.;]+$/, ''));
      if (allowed.has(parsed.hostname)) {
        verificationUri = parsed.toString();
        break;
      }
    } catch {
      // Ignore malformed URLs from terminal output.
    }
  }

  let userCode: string | null = null;
  for (const line of clean.split(/\r?\n/)) {
    if (!/(?:code|enter|activate|verification)/i.test(line)) continue;
    const match = line.match(/\b[A-Z0-9]{4}(?:-[A-Z0-9]{4})+\b|\b[A-Z0-9]{8,12}\b/);
    if (match) {
      userCode = match[0];
      break;
    }
  }
  return { verificationUri, userCode };
}

function safeFlow(flow: FlowState) {
  return {
    flowId: flow.id,
    provider: flow.provider,
    status: flow.status,
    verificationUri: flow.verificationUri,
    userCode: flow.userCode,
    expiresAt: flow.expiresAt,
    error: flow.error,
  };
}

async function collectText(stream: ReadableStream<Uint8Array> | null, flow: FlowState) {
  if (!stream) return;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (flow.output.length >= MAX_CAPTURE_BYTES) continue;
    flow.output += decoder
      .decode(value, { stream: true })
      .slice(0, MAX_CAPTURE_BYTES - flow.output.length);
    const parsed = extractDeviceAuthFields(flow.provider, flow.output);
    flow.verificationUri = parsed.verificationUri ?? flow.verificationUri;
    flow.userCode = parsed.userCode ?? flow.userCode;
    if (flow.verificationUri && flow.status === 'STARTING') flow.status = 'WAITING_USER';
  }
}

async function providerVersion(spec: ProviderSpec): Promise<string | null> {
  if (!existsSync(spec.command)) return null;
  try {
    const proc = Bun.spawn([spec.command, ...spec.versionArgs], {
      stdout: 'pipe',
      stderr: 'pipe',
      env: safeCliEnv(),
    });
    const timeout = setTimeout(() => proc.kill(), 2_000);
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    clearTimeout(timeout);
    if (proc.exitCode !== 0) return null;
    return stripAnsi(output).trim().split(/\r?\n/)[0]?.slice(0, 120) || null;
  } catch {
    return null;
  }
}

function authMetadataDetected(provider: HelperProvider): boolean {
  const home = homedir();
  switch (provider) {
    case 'codex':
      return existsSync(join(home, '.codex', 'auth.json'));
    case 'claude':
      return existsSync(join(home, '.claude', '.credentials.json'));
    case 'agy_gemini':
      return (
        existsSync(join(home, '.gemini', 'google_accounts.json')) ||
        existsSync(join(home, '.claude', 'agy-g1-cache.json'))
      );
    case 'grok':
      return existsSync(join(home, '.grok', 'auth.json'));
  }
}

function safeCliEnv(): Record<string, string> {
  return {
    PATH:
      process.env.PATH ??
      `${join(homedir(), '.local', 'bin')}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`,
    HOME: homedir(),
    USER: process.env.USER ?? 'ollama',
    NO_COLOR: '1',
    TERM: 'dumb',
  };
}

async function providersSnapshot() {
  const checkedAt = new Date().toISOString();
  const entries = await Promise.all(
    (Object.keys(PROVIDERS) as HelperProvider[]).map(async (provider) => {
      const spec = PROVIDERS[provider];
      const version = await providerVersion(spec);
      return [
        provider,
        {
          provider,
          cliPresent: version !== null,
          version,
          authMetadataDetected: authMetadataDetected(provider),
          deviceAuthAvailable: Boolean(spec.deviceAuthArgs),
          checkedAt,
        },
      ] as const;
    })
  );
  return Object.fromEntries(entries);
}

function startFlow(provider: DeviceAuthProvider): ReturnType<typeof safeFlow> {
  pruneFlows();
  for (const existing of flows.values()) {
    if (
      existing.provider === provider &&
      (existing.status === 'STARTING' || existing.status === 'WAITING_USER')
    ) {
      return safeFlow(existing);
    }
  }
  const spec = PROVIDERS[provider];
  if (!spec.deviceAuthArgs || !existsSync(spec.command)) {
    throw new Error('Device OAuth is unavailable for this provider on the Mac helper');
  }
  const id = randomUUID();
  const expires = Date.now() + FLOW_TTL_MS;
  const flow: FlowState = {
    id,
    provider,
    status: 'STARTING',
    verificationUri: null,
    userCode: null,
    expiresAt: new Date(expires).toISOString(),
    error: null,
    process: null,
    timer: null,
    output: '',
  };
  flows.set(id, flow);

  const proc = Bun.spawn([spec.command, ...spec.deviceAuthArgs], {
    stdout: 'pipe',
    stderr: 'pipe',
    stdin: 'pipe',
    env: safeCliEnv(),
    cwd: homedir(),
  });
  flow.process = proc;
  void collectText(proc.stdout, flow);
  void collectText(proc.stderr, flow);
  flow.timer = setTimeout(() => {
    if (flow.status === 'COMPLETED' || flow.status === 'FAILED' || flow.status === 'CANCELLED')
      return;
    flow.status = 'EXPIRED';
    flow.error = 'Device login expired';
    proc.kill();
  }, FLOW_TTL_MS);

  void proc.exited.then((code) => {
    if (flow.timer) clearTimeout(flow.timer);
    flow.process = null;
    if (flow.status === 'EXPIRED' || flow.status === 'CANCELLED') return;
    if (code === 0) {
      flow.status = 'COMPLETED';
      flow.error = null;
    } else {
      flow.status = 'FAILED';
      flow.error = 'Provider device login did not complete';
    }
  });

  return safeFlow(flow);
}

function pruneFlows(): void {
  const now = Date.now();
  for (const [id, flow] of flows) {
    const terminal = ['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(flow.status);
    if (terminal && Date.parse(flow.expiresAt) + 60_000 < now) flows.delete(id);
  }
}

function cancelFlow(flow: FlowState) {
  if (flow.status === 'COMPLETED' || flow.status === 'FAILED' || flow.status === 'EXPIRED') return;
  flow.status = 'CANCELLED';
  flow.error = null;
  if (flow.timer) clearTimeout(flow.timer);
  flow.process?.kill();
  flow.process = null;
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
}

if (import.meta.main) {
  const hostname = process.env.SLATE_AI_HELPER_HOST ?? '127.0.0.1';
  const port = Number(process.env.SLATE_AI_HELPER_PORT ?? DEFAULT_HELPER_PORT);
  const allowedIp = process.env.SLATE_AI_HELPER_ALLOWED_IP ?? '127.0.0.1';
  const server = Bun.serve({
    hostname,
    port,
    async fetch(req, server) {
      const remote = server.requestIP(req)?.address ?? '';
      if (remote !== allowedIp) return json({ error: 'forbidden' }, 403);
      const url = new URL(req.url);
      if (req.method === 'GET' && url.pathname === '/healthz') {
        return json({ ok: true, service: 'slate-ai-usage-helper' });
      }
      if (req.method === 'GET' && url.pathname === '/v1/providers') {
        return json(await providersSnapshot());
      }
      const start = url.pathname.match(/^\/v1\/device-auth\/(codex|grok)\/start$/);
      if (req.method === 'POST' && start) {
        try {
          return json(startFlow(start[1] as DeviceAuthProvider), 201);
        } catch (error) {
          return json(
            { error: error instanceof Error ? error.message : 'Device login unavailable' },
            503
          );
        }
      }
      const status = url.pathname.match(/^\/v1\/device-auth\/([0-9a-f-]{36})$/i);
      if (status) {
        const flow = flows.get(status[1]);
        if (!flow) return json({ error: 'not found' }, 404);
        if (req.method === 'GET') return json(safeFlow(flow));
        if (req.method === 'DELETE') {
          cancelFlow(flow);
          return new Response(null, { status: 204 });
        }
      }
      return json({ error: 'not found' }, 404);
    },
  });
  console.log(`slate-ai-usage-helper listening on http://${server.hostname}:${server.port}`);
}
