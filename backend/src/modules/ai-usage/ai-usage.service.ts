import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
  AI_USAGE_PROVIDERS,
  type AiUsageCard,
  type AiUsageProvider,
  type AiUsageSnapshot,
  type AiUsageUnknownValue,
  type AiUsageAuthInfo,
} from './ai-usage.types';
import { setBoundedCache } from '../../common/utils/cache-utils';

const execFileAsync = promisify(execFile);
export const COMMAND_TIMEOUT_MS = 1_500;
export const MAX_COMMAND_OUTPUT_BYTES = 8 * 1024;
export const DEFAULT_AI_USAGE_CACHE_TTL_MS = 30_000;

export const COMMANDS: Record<AiUsageProvider, readonly [string, readonly string[]]> = {
  codex: ['codex', ['--version']],
  agy_gemini: ['agy', ['--version']],
  claude: ['claude', ['--version']],
  grok: ['grok', ['--version']],
};

export const AUTH_LOGIN: Record<
  AiUsageProvider,
  { mode: AiUsageAuthInfo['mode']; command: string; hint: string }
> = {
  codex: {
    mode: 'oauth',
    command: 'codex login --device-auth',
    hint: 'Use the Codex device OAuth flow; credentials remain in the local Codex store.',
  },
  agy_gemini: {
    mode: 'oauth',
    command: 'agy',
    hint: 'Launch AGY and complete Google OAuth sign-in when prompted.',
  },
  claude: {
    mode: 'oauth',
    command: 'claude auth login',
    hint: 'Use Claude Code account OAuth; Slate never receives the OAuth tokens.',
  },
  grok: {
    mode: 'oauth',
    command: 'grok login --device-auth',
    hint: 'Use Grok device OAuth; credentials remain in the local Grok store.',
  },
};

const ALLOWED_PAYLOAD_KEYS = new Set([
  'usedPercent',
  'remainingPercent',
  'resetAt',
  'windowLabel',
  'planOrTier',
  'sessionInputTokens',
  'sessionOutputTokens',
  'sessionTotalTokens',
]);

const REJECTED_UNKNOWN_FIELD_KEYS =
  /(^|_)(?:token|tokens|password|secret|credential|cookie|auth|authorization|api[_-]?key|access[_-]?token|refresh[_-]?token|email|account|user|username|id|private|payload|transcript|audio)(_|$)/;
const REJECTED_UNKNOWN_FIELD_NAMES = new Set(['constructor', 'prototype', '__proto__']);

export interface CommandRunnerOptions {
  timeout: number;
  maxBuffer: number;
  shell: boolean;
  cwd: string;
  env: Record<string, string>;
  windowsHide?: boolean;
}

export type CommandRunner = (
  command: string,
  args: readonly string[],
  options: CommandRunnerOptions
) => Promise<{ stdout: string; stderr: string }>;

const defaultCommandRunner: CommandRunner = (command, args, options) => {
  return execFileAsync(command, [...args], options);
};

export const AI_USAGE_RUNNER_TOKEN = Symbol('AiUsageRunner');

export interface AiUsageServiceOptions {
  cacheTtlMs?: number;
  safeCwd?: string;
  sourceEnv?: NodeJS.ProcessEnv;
  homeDir?: string;
}

export function buildSanitizedChildEnv(
  sourceEnv: NodeJS.ProcessEnv = process.env
): Record<string, string> {
  const safeEnv: Record<string, string> = {
    PATH: sourceEnv.PATH ?? '/usr/bin:/bin:/usr/local/bin',
  };
  if (sourceEnv.SystemRoot) {
    safeEnv.SystemRoot = sourceEnv.SystemRoot;
  }
  return safeEnv;
}

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);
  private readonly staleLastGood = new Map<AiUsageProvider, AiUsageCard>();
  private readonly runner: CommandRunner;
  private readonly cacheTtlMs: number;
  private readonly safeCwd: string;
  private readonly sanitizedEnv: Record<string, string>;
  private readonly homeDir: string;
  private cachedSnapshot: { snapshot: AiUsageSnapshot; cachedAt: number } | null = null;
  private inflightSnapshot: Promise<AiUsageSnapshot> | null = null;

  constructor(
    @Optional() @Inject(AI_USAGE_RUNNER_TOKEN) runner?: CommandRunner,
    @Optional() options?: AiUsageServiceOptions
  ) {
    this.runner = runner ?? defaultCommandRunner;
    this.cacheTtlMs = options?.cacheTtlMs ?? DEFAULT_AI_USAGE_CACHE_TTL_MS;
    this.safeCwd = options?.safeCwd ?? tmpdir();
    this.sanitizedEnv = buildSanitizedChildEnv(options?.sourceEnv ?? process.env);
    this.homeDir = options?.homeDir ?? homedir();
  }

  getSnapshot(): Promise<AiUsageSnapshot> {
    const now = Date.now();
    if (this.cachedSnapshot && now - this.cachedSnapshot.cachedAt < this.cacheTtlMs) {
      return Promise.resolve(this.cachedSnapshot.snapshot);
    }
    if (this.inflightSnapshot) {
      return this.inflightSnapshot;
    }
    const collection = this.collectSnapshot()
      .then((snapshot) => {
        this.cachedSnapshot = { snapshot, cachedAt: Date.now() };
        return snapshot;
      })
      .finally(() => {
        if (this.inflightSnapshot === collection) {
          this.inflightSnapshot = null;
        }
      });
    this.inflightSnapshot = collection;
    return collection;
  }

  clearCache(): void {
    this.cachedSnapshot = null;
    this.inflightSnapshot = null;
  }

  setLastGoodUsage(card: AiUsageCard): void {
    if (card.sourceStatus === 'AVAILABLE') {
      setBoundedCache(this.staleLastGood, card.provider, card, AI_USAGE_PROVIDERS.length);
    }
  }

  private async collectSnapshot(): Promise<AiUsageSnapshot> {
    const collectedAt = new Date().toISOString();
    const cards = await Promise.all(
      (Object.keys(COMMANDS) as AiUsageProvider[]).map((provider) =>
        this.collectProvider(provider, collectedAt)
      )
    );
    return { cards, collectedAt };
  }

  private async collectProvider(
    provider: AiUsageProvider,
    collectedAt: string
  ): Promise<AiUsageCard> {
    const [command, args] = COMMANDS[provider];
    try {
      const result = await this.runner(command, [...args], {
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
        shell: false,
        cwd: this.safeCwd,
        env: this.sanitizedEnv,
        windowsHide: true,
      });
      // Version output proves only that the supported local CLI is present. It is
      // deliberately not treated as usage data, so unavailable quota fields stay null.
      // Furthermore, a no-usage probe must never be recorded as last-good usage.
      return versionProbeCard(
        provider,
        collectedAt,
        parseCliVersion(result.stdout),
        probeCommand(command, args),
        detectLocalAuth(provider, this.homeDir, collectedAt)
      );
    } catch (error) {
      this.logger.debug(`AI usage source unavailable for ${provider}`);
      const previous = this.staleLastGood.get(provider);
      return previous && previous.sourceStatus === 'AVAILABLE'
        ? { ...previous, sourceStatus: 'STALE', freshness: 'stale' }
        : probeFailureCard(
            provider,
            probeCommand(command, args),
            error,
            detectLocalAuth(provider, this.homeDir, collectedAt)
          );
    }
  }
}

function versionProbeCard(
  provider: AiUsageProvider,
  probedAt: string,
  version: string | null,
  command: string,
  auth: AiUsageAuthInfo
): AiUsageCard {
  return {
    ...unavailableCard(provider, probedAt, 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE', {
      capability: { binaryPresent: true, version, probeCommand: command },
      source: 'version_probe',
      availability: 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE',
      freshness: 'fresh',
      probedAt,
      auth,
    }),
  };
}

function probeFailureCard(
  provider: AiUsageProvider,
  command: string,
  error: unknown,
  auth: AiUsageAuthInfo
): AiUsageCard {
  const missing = isMissingCommandError(error);
  return unavailableCard(provider, null, missing ? 'UNAVAILABLE' : 'ERROR', {
    capability: { binaryPresent: !missing, version: null, probeCommand: command },
    availability: missing ? 'BINARY_MISSING' : 'ERROR',
    freshness: 'error',
    error: {
      code: missing ? 'BINARY_MISSING' : 'PROBE_FAILED',
      message: missing ? 'Allowlisted CLI is not installed' : 'Allowlisted CLI probe failed',
    },
    auth,
  });
}

function probeCommand(command: string, args: readonly string[]): string {
  return [command, ...args].join(' ');
}

export function unavailableCard(
  provider: AiUsageProvider,
  lastUpdated: string | null,
  sourceStatus: AiUsageCard['sourceStatus'],
  metadata: Partial<
    Pick<
      AiUsageCard,
      | 'capability'
      | 'source'
      | 'usageSupported'
      | 'quotaSource'
      | 'availability'
      | 'freshness'
      | 'probedAt'
      | 'staleAfter'
      | 'error'
      | 'unknownQuotaFields'
      | 'auth'
    >
  > = {}
): AiUsageCard {
  return {
    provider,
    usedPercent: null,
    remainingPercent: null,
    resetAt: null,
    windowLabel: null,
    planOrTier: null,
    sessionInputTokens: null,
    sessionOutputTokens: null,
    sessionTotalTokens: null,
    lastUpdated,
    sourceStatus,
    capability: metadata.capability ?? {
      binaryPresent: false,
      version: null,
      probeCommand: COMMANDS[provider].join(' '),
    },
    source: metadata.source ?? 'none',
    usageSupported: metadata.usageSupported ?? false,
    quotaSource: metadata.quotaSource ?? 'unsupported',
    availability: metadata.availability ?? availabilityForStatus(sourceStatus),
    freshness: metadata.freshness ?? freshnessForStatus(sourceStatus),
    probedAt: metadata.probedAt ?? null,
    staleAfter: metadata.staleAfter ?? null,
    error: metadata.error ?? null,
    unknownQuotaFields: metadata.unknownQuotaFields ?? {},
    auth: metadata.auth ?? unknownAuthInfo(provider, lastUpdated ?? new Date().toISOString()),
  };
}

/** Parse only a documented, already-sanitized metrics object from a future local collector. */
export function parseSanitizedUsagePayload(
  provider: AiUsageProvider,
  value: unknown,
  lastUpdated: string
): AiUsageCard | null {
  if (!isRecord(value)) return null;
  const keys = Object.keys(value);
  if (keys.length === 0) return null;
  const unknownQuotaFields = sanitizeUnknownQuotaFields(value);
  if (unknownQuotaFields === null) return null;

  const usedPercent = boundedPercent(value.usedPercent);
  const remainingPercent = boundedPercent(value.remainingPercent);
  const sessionInputTokens = nonNegativeInteger(value.sessionInputTokens);
  const sessionOutputTokens = nonNegativeInteger(value.sessionOutputTokens);
  const sessionTotalTokens = nonNegativeInteger(value.sessionTotalTokens);
  const resetAt = safeIsoDate(value.resetAt);
  const windowLabel = safeLabel(value.windowLabel);
  const planOrTier = safeLabel(value.planOrTier);

  if (
    (value.usedPercent !== undefined && usedPercent === null) ||
    (value.remainingPercent !== undefined && remainingPercent === null) ||
    (value.sessionInputTokens !== undefined && sessionInputTokens === null) ||
    (value.sessionOutputTokens !== undefined && sessionOutputTokens === null) ||
    (value.sessionTotalTokens !== undefined && sessionTotalTokens === null) ||
    (value.resetAt !== undefined && resetAt === null) ||
    (value.windowLabel !== undefined && windowLabel === null) ||
    (value.planOrTier !== undefined && planOrTier === null)
  ) {
    return null;
  }

  const hasAtLeastOneMetric = [
    usedPercent,
    remainingPercent,
    sessionInputTokens,
    sessionOutputTokens,
    sessionTotalTokens,
    resetAt,
    windowLabel,
    planOrTier,
  ].some((v) => v !== null);

  if (!hasAtLeastOneMetric) return null;

  return {
    provider,
    usedPercent,
    remainingPercent,
    resetAt,
    windowLabel,
    planOrTier,
    sessionInputTokens,
    sessionOutputTokens,
    sessionTotalTokens,
    lastUpdated,
    sourceStatus: 'AVAILABLE',
    capability: {
      binaryPresent: true,
      version: null,
      probeCommand: COMMANDS[provider].join(' '),
    },
    source: 'sanitized_metrics',
    usageSupported: true,
    quotaSource: 'unsupported',
    availability: 'AVAILABLE',
    freshness: 'fresh',
    probedAt: lastUpdated,
    staleAfter: null,
    error: null,
    unknownQuotaFields,
    auth: unknownAuthInfo(provider, lastUpdated),
  };
}

export function unknownAuthInfo(provider: AiUsageProvider, checkedAt: string): AiUsageAuthInfo {
  const login = AUTH_LOGIN[provider];
  return {
    mode: login.mode,
    status: 'UNKNOWN',
    source: 'none',
    loginCommand: login.command,
    loginHint: login.hint,
    checkedAt,
    deviceAuthAvailable: provider === 'codex' || provider === 'grok',
  };
}

export function detectLocalAuth(
  provider: AiUsageProvider,
  homeDir: string,
  checkedAt: string
): AiUsageAuthInfo {
  const login = AUTH_LOGIN[provider];
  const detected = localAuthMetadataPresent(provider, homeDir);
  return {
    mode: login.mode,
    status: detected === null ? 'UNKNOWN' : detected ? 'LOCAL_AUTH_PRESENT' : 'NOT_DETECTED',
    source: detected === null ? 'none' : 'local_metadata',
    loginCommand: login.command,
    loginHint: login.hint,
    checkedAt,
    deviceAuthAvailable: provider === 'codex' || provider === 'grok',
  };
}

function localAuthMetadataPresent(provider: AiUsageProvider, homeDir: string): boolean | null {
  try {
    switch (provider) {
      case 'codex':
        return existsSync(join(homeDir, '.codex', 'auth.json'));
      case 'claude':
        return existsSync(join(homeDir, '.claude', '.credentials.json'));
      case 'agy_gemini':
        return (
          existsSync(join(homeDir, '.gemini', 'google_accounts.json')) ||
          existsSync(join(homeDir, '.claude', 'agy-g1-cache.json'))
        );
      case 'grok':
        return existsSync(join(homeDir, '.grok', 'auth.json'));
    }
  } catch {
    return null;
  }
}

function availabilityForStatus(status: AiUsageCard['sourceStatus']): AiUsageCard['availability'] {
  switch (status) {
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE':
      return 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE';
    case 'ERROR':
      return 'ERROR';
    case 'STALE':
      return 'AVAILABLE';
    case 'UNAVAILABLE':
      return 'UNSUPPORTED';
  }
}

function freshnessForStatus(status: AiUsageCard['sourceStatus']): AiUsageCard['freshness'] {
  return status === 'STALE' ? 'stale' : status === 'ERROR' ? 'error' : 'fresh';
}

function isMissingCommandError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}

function parseCliVersion(output: string): string | null {
  const match = output.match(
    /\b(?:version\s*)?v?(\d+\.\d+(?:\.\d+){0,2}(?:[-+][0-9A-Za-z.-]+)?)\b/i
  );
  return match?.[1] ?? null;
}

function sanitizeUnknownQuotaFields(
  value: Record<string, unknown>
): Record<string, AiUsageUnknownValue> | null {
  const fields: Record<string, AiUsageUnknownValue> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (ALLOWED_PAYLOAD_KEYS.has(key)) continue;
    if (!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(key)) return null;
    const normalizedKey = key
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toLowerCase();
    if (
      REJECTED_UNKNOWN_FIELD_NAMES.has(normalizedKey) ||
      REJECTED_UNKNOWN_FIELD_KEYS.test(normalizedKey) ||
      /(?:url|uri)$/.test(normalizedKey)
    ) {
      return null;
    }
    if (typeof fieldValue === 'number') {
      if (!Number.isFinite(fieldValue) || !Number.isSafeInteger(fieldValue) || fieldValue < 0) {
        return null;
      }
      fields[key] = fieldValue;
    } else if (typeof fieldValue === 'boolean' || fieldValue === null) {
      fields[key] = fieldValue;
    } else if (typeof fieldValue === 'string') {
      const label = safeLabel(fieldValue);
      if (label === null) return null;
      fields[key] = label;
    } else {
      return null;
    }
  }
  return fields;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedPercent(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : null;
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function safeIsoDate(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function safeLabel(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 80) return null;

  // Reject URLs, protocols, and file paths
  if (
    /^(https?|ftp|file|ws|wss):\/\//i.test(trimmed) ||
    /:\/\//.test(trimmed) ||
    /\b(localhost|www\.)/i.test(trimmed) ||
    trimmed.startsWith('/') ||
    trimmed.includes('\\')
  ) {
    return null;
  }

  // Reject email addresses or handles containing @
  if (trimmed.includes('@')) {
    return null;
  }

  // Reject account-like prefixes or identifiers
  if (
    /^(acct|account|usr|user|org|org_id|uid|id|sub)[:_-]/i.test(trimmed) ||
    /^(sk-|ghp_|gho_|xoxb-|glpat-|bearer\s+)/i.test(trimmed)
  ) {
    return null;
  }

  // Reject sensitive keywords
  if (/\b(password|secret|token|credential|cookie|auth|session|key)\b/i.test(trimmed)) {
    return null;
  }

  // Safe character set: letters, digits, spaces, hyphens, underscores, dots, parentheses
  if (!/^[\w\s.\-()]+$/u.test(trimmed)) {
    return null;
  }

  return trimmed;
}
