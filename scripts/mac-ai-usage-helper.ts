import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
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
    allowedHosts: ['accounts.x.ai', 'auth.x.ai', 'x.ai', 'grok.com'],
  },
};

export interface HelperQuotaWindow {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetLabel: string | null;
}

export interface HelperQuotaSnapshot {
  windows: HelperQuotaWindow[];
  observedAt: string;
  ageSeconds: number;
}

const CODEX_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;
const AGY_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;

export function readProviderQuota(
  provider: HelperProvider,
  nowMs = Date.now()
): HelperQuotaSnapshot | null {
  if (provider === 'codex') {
    return readCodexQuota(nowMs);
  }
  if (provider === 'agy_gemini' || provider === 'claude') {
    return readAgyQuota(provider, nowMs);
  }
  return null;
}

function readCodexQuota(nowMs: number): HelperQuotaSnapshot | null {
  const path = join(homedir(), '.claude', 'codex-quota-cache.json');
  const raw = readJsonRecord(path);
  if (!raw) return null;
  const observedSec = finiteNumber(raw.event_epoch) ?? finiteNumber(raw.fetched_at);
  if (observedSec === null) return null;
  const ageSeconds = Math.max(0, nowMs / 1000 - observedSec);
  if (ageSeconds > CODEX_QUOTA_MAX_AGE_SEC) return null;

  const windows = ['primary', 'secondary'].flatMap((key) => {
    const row = isRecord(raw[key]) ? raw[key] : null;
    if (!row) return [];
    const usedPercent = percentNumber(row.used_pct);
    const remainingPercent = percentNumber(row.rem_pct);
    if (usedPercent === null || remainingPercent === null) return [];
    const windowMinutes = finiteNumber(row.window_minutes);
    const label =
      windowMinutes === 300
        ? '5h'
        : windowMinutes === 10080
          ? 'Weekly'
          : windowMinutes
            ? Math.round(windowMinutes) + 'm'
            : key === 'primary'
              ? 'Primary'
              : 'Secondary';
    const resetLabel =
      typeof row.resets_at === 'string' && row.resets_at.trim()
        ? row.resets_at.trim().slice(0, 40)
        : null;
    return [{ label, usedPercent, remainingPercent, resetLabel }];
  });
  if (windows.length === 0) return null;
  return {
    windows,
    observedAt: new Date(observedSec * 1000).toISOString(),
    ageSeconds: Math.round(ageSeconds),
  };
}

function readAgyQuota(
  provider: 'agy_gemini' | 'claude',
  nowMs: number
): HelperQuotaSnapshot | null {
  const path = join(homedir(), '.claude', 'agy-g1-cache.json');
  const raw = readJsonRecord(path);
  if (!raw) return null;
  const fetchedSec = finiteNumber(raw.fetched_at);
  if (fetchedSec === null) return null;
  const ageSeconds = Math.max(0, nowMs / 1000 - fetchedSec);
  if (ageSeconds > AGY_QUOTA_MAX_AGE_SEC) return null;

  const prefix = provider === 'agy_gemini' ? 'gemini' : 'claude';
  const weeklyRemaining = percentNumber(raw[prefix + '_weekly_pct']);
  const fiveHourRemaining = percentNumber(raw[prefix + '_5h_pct']);
  const windows: HelperQuotaWindow[] = [];
  if (fiveHourRemaining !== null) {
    windows.push({
      label: '5h',
      usedPercent: 100 - fiveHourRemaining,
      remainingPercent: fiveHourRemaining,
      resetLabel: safeResetText(raw[prefix + '_5h_reset']),
    });
  }
  if (weeklyRemaining !== null) {
    windows.push({
      label: 'Weekly',
      usedPercent: 100 - weeklyRemaining,
      remainingPercent: weeklyRemaining,
      resetLabel: safeResetText(raw[prefix + '_weekly_reset']),
    });
  }
  if (windows.length === 0) return null;
  return {
    windows,
    observedAt: new Date(fetchedSec * 1000).toISOString(),
    ageSeconds: Math.round(ageSeconds),
  };
}

function readJsonRecord(path: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value: unknown): number | null {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(number) ? number : null;
}

function percentNumber(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && number >= 0 && number <= 100 ? Math.round(number) : null;
}

function safeResetText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 40) : null;
}

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
  const lines = clean.split(/\r?\n/);
  const codePattern = /\b[A-Z0-9]{4,6}(?:-[A-Z0-9]{4,6})+\b|\b[A-Z0-9]{8,12}\b/;
  for (let index = 0; index < lines.length; index++) {
    if (!/(?:code|enter|activate|verification)/i.test(lines[index] ?? '')) continue;
    for (let offset = 0; offset <= 2 && index + offset < lines.length; offset++) {
      const match = (lines[index + offset] ?? '').match(codePattern);
      if (match) {
        userCode = match[0];
        break;
      }
    }
    if (userCode) break;
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
          quota: readProviderQuota(provider),
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
