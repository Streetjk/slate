import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const DEFAULT_HELPER_PORT = 19091;
export const FLOW_TTL_MS = 10 * 60_000;
export const MAX_CAPTURE_BYTES = 32 * 1024;

export type HelperProvider = 'codex' | 'agy_gemini' | 'zai' | 'grok';
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
  fixedVersion?: string;
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
  zai: {
    command: process.env.SLATE_ZAI_BIN ?? join(homedir(), '.local', 'bin', 'glm53'),
    versionArgs: [],
    fixedVersion: process.env.SLATE_ZAI_MODEL ?? 'glm-5.3-flash (Z.ai)',
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
  resetAt: string | null;
  resetLabel: string | null;
}

export interface HelperQuotaSnapshot {
  windows: HelperQuotaWindow[];
  observedAt: string;
  ageSeconds: number;
}

const CODEX_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;
const AGY_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;
const AGY_REFRESH_INTERVAL_MS = 5 * 60_000;
const GROK_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;
const GROK_REFRESH_INTERVAL_MS = 10 * 60_000;
const ZAI_QUOTA_MAX_AGE_SEC = 2 * 60 * 60;
const ZAI_REFRESH_INTERVAL_MS = 5 * 60_000;
const AGY_USAGE_BIN =
  process.env.SLATE_AGY_USAGE_BIN ?? join(homedir(), '.local', 'bin', 'agy-usage');
const ZAI_USAGE_BIN =
  process.env.SLATE_ZAI_USAGE_BIN ?? join(homedir(), '.bun', 'bin', 'zai-usage');

export function readProviderQuota(
  provider: HelperProvider,
  nowMs = Date.now()
): HelperQuotaSnapshot | null {
  if (provider === 'codex') return readCodexQuota(nowMs);
  if (provider === 'grok') return readGrokQuota(nowMs);
  if (provider === 'zai') return zaiQuotaCache;
  if (provider === 'agy_gemini') {
    return agyQuotaCache?.[provider] ?? readAgyQuota(provider, nowMs);
  }
  return null;
}

let agyQuotaCache: Partial<Record<'agy_gemini', HelperQuotaSnapshot | null>> | null = null;
let agyQuotaRefreshedAtMs = 0;
let agyQuotaRefreshPromise: Promise<
  Partial<Record<'agy_gemini', HelperQuotaSnapshot | null>>
> | null = null;
let grokQuotaRefreshedAtMs = 0;
let grokQuotaRefreshPromise: Promise<HelperQuotaSnapshot | null> | null = null;
let zaiQuotaCache: HelperQuotaSnapshot | null = null;
let zaiQuotaRefreshedAtMs = 0;
let zaiQuotaRefreshPromise: Promise<HelperQuotaSnapshot | null> | null = null;

async function getProviderQuota(
  provider: HelperProvider,
  nowMs = Date.now()
): Promise<HelperQuotaSnapshot | null> {
  if (provider === 'codex') return readCodexQuota(nowMs);
  if (provider === 'agy_gemini') {
    if (!agyQuotaCache || nowMs - agyQuotaRefreshedAtMs >= AGY_REFRESH_INTERVAL_MS) {
      agyQuotaRefreshPromise ??= refreshAgyQuota(nowMs).finally(() => {
        agyQuotaRefreshPromise = null;
      });
      try {
        agyQuotaCache = await agyQuotaRefreshPromise;
        agyQuotaRefreshedAtMs = Date.now();
      } catch {
        // Fail closed to any still-fresh in-memory cache; otherwise no quota.
      }
    }
    const cached = agyQuotaCache?.[provider] ?? null;
    if (!cached) return null;
    const observedMs = Date.parse(cached.observedAt);
    return Number.isFinite(observedMs) && nowMs - observedMs <= AGY_QUOTA_MAX_AGE_SEC * 1000
      ? cached
      : null;
  }
  if (provider === 'zai') {
    if (!zaiQuotaCache || nowMs - zaiQuotaRefreshedAtMs >= ZAI_REFRESH_INTERVAL_MS) {
      zaiQuotaRefreshPromise ??= refreshZaiQuota(nowMs).finally(() => {
        zaiQuotaRefreshPromise = null;
      });
      try {
        const refreshed = await zaiQuotaRefreshPromise;
        if (refreshed) {
          zaiQuotaCache = refreshed;
          zaiQuotaRefreshedAtMs = Date.now();
        }
      } catch {
        // Keep a still-fresh in-memory value if refresh fails.
      }
    }
    if (!zaiQuotaCache) return null;
    const observedMs = Date.parse(zaiQuotaCache.observedAt);
    return Number.isFinite(observedMs) && nowMs - observedMs <= ZAI_QUOTA_MAX_AGE_SEC * 1000
      ? zaiQuotaCache
      : null;
  }
  if (provider === 'grok') {
    let current = readGrokQuota(nowMs);
    if (!current || nowMs - grokQuotaRefreshedAtMs >= GROK_REFRESH_INTERVAL_MS) {
      grokQuotaRefreshPromise ??= refreshGrokQuota(nowMs).finally(() => {
        grokQuotaRefreshPromise = null;
      });
      try {
        current = await grokQuotaRefreshPromise;
        grokQuotaRefreshedAtMs = Date.now();
      } catch {
        current = readGrokQuota(nowMs);
      }
    }
    return current;
  }
  return null;
}

async function refreshAgyQuota(
  nowMs: number
): Promise<Partial<Record<'agy_gemini', HelperQuotaSnapshot | null>>> {
  if (!existsSync(AGY_USAGE_BIN)) return {};
  const proc = Bun.spawn([AGY_USAGE_BIN, '--refresh', 'json'], {
    stdout: 'pipe',
    stderr: 'ignore',
    env: safeCliEnv(),
    cwd: homedir(),
  });
  const timer = setTimeout(() => proc.kill(), 15_000);
  try {
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return {};
    const parsed = JSON.parse(output);
    if (!isRecord(parsed)) return {};
    const observedAt = safeIsoText(parsed.updated_at) ?? new Date(nowMs).toISOString();
    const quotaSummary = isRecord(parsed.quota_summary) ? parsed.quota_summary : {};
    const groups = Array.isArray(quotaSummary.groups) ? quotaSummary.groups : [];
    const result: Partial<Record<'agy_gemini', HelperQuotaSnapshot | null>> = {};
    for (const group of groups) {
      if (!isRecord(group)) continue;
      const name = typeof group.display_name === 'string' ? group.display_name.toLowerCase() : '';
      const provider = name.includes('gemini') ? 'agy_gemini' : null;
      if (!provider) continue;
      const buckets = Array.isArray(group.buckets) ? group.buckets : [];
      const windows: HelperQuotaWindow[] = [];
      for (const bucket of buckets) {
        if (!isRecord(bucket) || bucket.disabled === true) continue;
        const remainingPercent = percentNumber(bucket.remaining_pct);
        if (remainingPercent === null) continue;
        const window = typeof bucket.window === 'string' ? bucket.window.trim().toLowerCase() : '';
        const label = window === '5h' ? 'AGY 5h' : window === 'weekly' ? 'AGY Weekly' : 'AGY quota';
        windows.push({
          label,
          usedPercent: 100 - remainingPercent,
          remainingPercent,
          resetAt: safeResetIso(bucket.reset_time),
          resetLabel: compactResetLabel(bucket.reset_time),
        });
      }
      if (windows.length > 0) {
        const observedMs = Date.parse(observedAt);
        result[provider] = {
          windows: windows.sort((a, b) =>
            a.label.includes('5h') ? -1 : b.label.includes('5h') ? 1 : 0
          ),
          observedAt,
          ageSeconds: Number.isFinite(observedMs)
            ? Math.max(0, Math.round((nowMs - observedMs) / 1000))
            : 0,
        };
      }
    }
    return result;
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

async function refreshZaiQuota(nowMs: number): Promise<HelperQuotaSnapshot | null> {
  if (!existsSync(ZAI_USAGE_BIN)) return null;
  const key = readZaiApiKey();
  if (!key) return null;
  const proc = Bun.spawn([ZAI_USAGE_BIN, 'summary', '--json'], {
    stdout: 'pipe',
    stderr: 'ignore',
    env: { ...safeCliEnv(), ZAI_API_KEY: key },
    cwd: homedir(),
  });
  const timer = setTimeout(() => proc.kill(), 15_000);
  try {
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return null;
    return parseZaiQuotaPayload(JSON.parse(output), nowMs);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function parseZaiQuotaPayload(
  value: unknown,
  nowMs = Date.now()
): HelperQuotaSnapshot | null {
  if (!isRecord(value)) return null;
  const quota = isRecord(value.quota) ? value.quota : {};
  const limits = Array.isArray(quota.limits) ? quota.limits : [];
  const windows: HelperQuotaWindow[] = [];
  for (const item of limits) {
    if (!isRecord(item)) continue;
    const type = typeof item.type === 'string' ? item.type : '';
    if (type !== 'CREDIT_LIMIT' && type !== 'TOKENS_LIMIT') continue;
    const unit = finiteNumber(item.unit);
    if (unit !== 3 && unit !== 6) continue;
    const usedPercent = percentNumber(item.percentage);
    if (usedPercent === null) continue;
    const remainingPercent = Math.max(0, 100 - usedPercent);
    windows.push({
      label: unit === 3 ? '5h' : 'Weekly',
      usedPercent,
      remainingPercent,
      resetAt: safeResetIso(item.nextResetTime),
      resetLabel: compactResetLabel(item.nextResetTime),
    });
  }
  if (windows.length === 0) return null;
  windows.sort((a, b) => (a.label === '5h' ? -1 : b.label === '5h' ? 1 : 0));
  const observedAt =
    safeIsoText(value.fetchedAt) ?? safeIsoText(value.updatedAt) ?? new Date(nowMs).toISOString();
  const observedMs = Date.parse(observedAt);
  return {
    windows,
    observedAt,
    ageSeconds: Number.isFinite(observedMs)
      ? Math.max(0, Math.round((nowMs - observedMs) / 1000))
      : 0,
  };
}

function readZaiApiKey(): string | null {
  const path = process.env.ZAI_KEYFILE ?? join(homedir(), 'Cre', 'Zai.txt');
  try {
    const text = readFileSync(path, 'utf8').replaceAll(String.fromCharCode(13), '');
    for (const line of text.split(String.fromCharCode(10))) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('ZAI_API_KEY=')) continue;
      const key = trimmed.slice('ZAI_API_KEY='.length).trim();
      return key || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function refreshGrokQuota(nowMs: number): Promise<HelperQuotaSnapshot | null> {
  const grok = PROVIDERS.grok.command;
  if (!existsSync(grok)) return null;
  try {
    const proc = Bun.spawn([grok, 'dashboard'], {
      stdout: 'ignore',
      stderr: 'ignore',
      stdin: 'pipe',
      env: { ...safeCliEnv(), TERM: 'xterm-256color' },
      cwd: homedir(),
    });
    const timer = setTimeout(() => proc.kill(), 4_000);
    try {
      await Promise.race([proc.exited, new Promise((resolve) => setTimeout(resolve, 4_500))]);
    } finally {
      clearTimeout(timer);
      if (proc.exitCode === null) proc.kill();
    }
  } catch {
    // The local log may still contain a usable fresh billing snapshot.
  }
  return readGrokQuota(nowMs);
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
    const resetAt = safeResetIso(row.resets_at);
    const resetLabel =
      typeof row.resets_at === 'string' && row.resets_at.trim()
        ? row.resets_at.trim().slice(0, 40)
        : compactResetLabel(row.resets_at);
    return [{ label, usedPercent, remainingPercent, resetAt, resetLabel }];
  });
  if (windows.length === 0) return null;
  return {
    windows,
    observedAt: new Date(observedSec * 1000).toISOString(),
    ageSeconds: Math.round(ageSeconds),
  };
}

function readGrokQuota(nowMs: number): HelperQuotaSnapshot | null {
  const path = join(homedir(), '.grok', 'logs', 'unified.jsonl');
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  const lines = text.split(String.fromCharCode(10));
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = lines[index] ?? '';
    if (!line.includes('billing: fetched credits config')) continue;
    try {
      const row = JSON.parse(line);
      if (!isRecord(row)) continue;
      const ctx = isRecord(row.ctx) ? row.ctx : isRecord(row.context) ? row.context : {};
      const config = isRecord(ctx.config) ? ctx.config : {};
      const usedPercent = percentNumber(config.creditUsagePercent);
      const observedAt = safeIsoText(row.ts ?? row.timestamp ?? row.time);
      if (usedPercent === null || !observedAt) continue;
      const observedMs = Date.parse(observedAt);
      const ageSeconds = Math.max(0, Math.round((nowMs - observedMs) / 1000));
      if (ageSeconds > GROK_QUOTA_MAX_AGE_SEC) return null;
      const period = isRecord(config.currentPeriod) ? config.currentPeriod : {};
      const resetLabel = compactResetLabel(period.end);
      return {
        windows: [
          {
            label: 'Weekly',
            usedPercent,
            remainingPercent: 100 - usedPercent,
            resetAt: safeResetIso(period.end),
            resetLabel,
          },
        ],
        observedAt,
        ageSeconds,
      };
    } catch {
      continue;
    }
  }
  return null;
}

function readAgyQuota(provider: 'agy_gemini', nowMs: number): HelperQuotaSnapshot | null {
  const path = join(homedir(), '.claude', 'agy-g1-cache.json');
  const raw = readJsonRecord(path);
  if (!raw) return null;
  const fetchedSec = finiteNumber(raw.fetched_at);
  if (fetchedSec === null) return null;
  const ageSeconds = Math.max(0, nowMs / 1000 - fetchedSec);
  if (ageSeconds > AGY_QUOTA_MAX_AGE_SEC) return null;

  const prefix = 'gemini';
  const weeklyRemaining = percentNumber(raw[prefix + '_weekly_pct']);
  const fiveHourRemaining = percentNumber(raw[prefix + '_5h_pct']);
  const windows: HelperQuotaWindow[] = [];
  if (fiveHourRemaining !== null) {
    windows.push({
      label: '5h',
      usedPercent: 100 - fiveHourRemaining,
      remainingPercent: fiveHourRemaining,
      resetAt: safeResetIso(raw[prefix + '_5h_reset']),
      resetLabel: safeResetText(raw[prefix + '_5h_reset']),
    });
  }
  if (weeklyRemaining !== null) {
    windows.push({
      label: 'Weekly',
      usedPercent: 100 - weeklyRemaining,
      remainingPercent: weeklyRemaining,
      resetAt: safeResetIso(raw[prefix + '_weekly_reset']),
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

function safeIsoText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
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

function safeResetIso(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const numeric = Number(value);
  const time = Number.isFinite(numeric) && numeric > 10_000_000_000 ? numeric : Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function compactResetLabel(value: unknown): string | null {
  let time: number;
  if (typeof value === 'number' && Number.isFinite(value)) {
    time = value;
  } else if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    time = Number.isFinite(numeric) && numeric > 10_000_000_000 ? numeric : Date.parse(value);
  } else {
    return null;
  }
  if (!Number.isFinite(time)) return safeResetText(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Perth',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(time));
  return parts.replace(',', '').replace(/s(AM|PM)$/i, (match) => match.toLowerCase());
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
  if (spec.fixedVersion) return spec.fixedVersion;
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
    case 'zai':
      return existsSync(process.env.ZAI_KEYFILE ?? join(home, 'Cre', 'Zai.txt'));
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
          quota: await getProviderQuota(provider),
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
