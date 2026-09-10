import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { AiUsageCard, AiUsageProvider, AiUsageSnapshot } from './ai-usage.types';

const execFileAsync = promisify(execFile);
const COMMAND_TIMEOUT_MS = 1_500;
const MAX_COMMAND_OUTPUT_BYTES = 8 * 1024;

const COMMANDS: Record<AiUsageProvider, readonly [string, readonly string[]]> = {
  codex: ['codex', ['--version']],
  agy_gemini: ['agy', ['--version']],
  grok: ['grok', ['--version']],
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

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);
  private readonly staleLastGood = new Map<AiUsageProvider, AiUsageCard>();

  async getSnapshot(): Promise<AiUsageSnapshot> {
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
      await execFileAsync(command, [...args], {
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_COMMAND_OUTPUT_BYTES,
        windowsHide: true,
      });
      // Version output proves only that the supported local CLI is present. It is
      // deliberately not treated as usage data, so unavailable quota fields stay null.
      const card = unavailableCard(provider, collectedAt, 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE');
      this.staleLastGood.set(provider, card);
      return card;
    } catch {
      this.logger.debug(`AI usage source unavailable for ${provider}`);
      const previous = this.staleLastGood.get(provider);
      return previous
        ? { ...previous, sourceStatus: 'STALE' }
        : unavailableCard(provider, null, 'UNAVAILABLE');
    }
  }
}

export function unavailableCard(
  provider: AiUsageProvider,
  lastUpdated: string | null,
  sourceStatus: AiUsageCard['sourceStatus']
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
  };
}

/** Parse only a documented, already-sanitized metrics object from a future local collector. */
export function parseSanitizedUsagePayload(
  provider: AiUsageProvider,
  value: unknown,
  lastUpdated: string
): AiUsageCard | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !ALLOWED_PAYLOAD_KEYS.has(key))) return null;
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
  )
    return null;
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
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedPercent(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value
    : value === undefined
      ? null
      : null;
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : value === undefined
      ? null
      : null;
}

function safeIsoDate(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function safeLabel(value: unknown): string | null {
  if (value === undefined) return null;
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 80
    ? value.trim()
    : null;
}
