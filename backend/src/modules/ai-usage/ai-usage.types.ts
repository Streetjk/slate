export const AI_USAGE_PROVIDERS = ['codex', 'agy_gemini', 'grok'] as const;
export type AiUsageProvider = (typeof AI_USAGE_PROVIDERS)[number];

export type AiUsageSourceStatus =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE'
  | 'ERROR'
  | 'STALE';

export interface AiUsageCard {
  provider: AiUsageProvider;
  usedPercent: number | null;
  remainingPercent: number | null;
  resetAt: string | null;
  windowLabel: string | null;
  planOrTier: string | null;
  sessionInputTokens: number | null;
  sessionOutputTokens: number | null;
  sessionTotalTokens: number | null;
  lastUpdated: string | null;
  sourceStatus: AiUsageSourceStatus;
}

export interface AiUsageSnapshot {
  cards: AiUsageCard[];
  collectedAt: string;
}
