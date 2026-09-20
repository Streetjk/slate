import type { AiUsageCard, AiUsageProvider } from './query/ai-usage-queries';

const PROVIDER_LABELS: Record<AiUsageProvider, string> = {
  codex: 'Codex',
  agy_gemini: 'AGY / Gemini',
  claude: 'Claude',
  grok: 'Grok',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  BINARY_MISSING: 'CLI unavailable',
  UNAVAILABLE: 'Unavailable',
  UNAVAILABLE_NO_MACHINE_READABLE_USAGE: 'Quota unavailable',
  UNSUPPORTED: 'Unsupported',
  ERROR: 'Error',
  STALE: 'Stale',
};

const AUTH_STATUS_LABELS: Record<string, string> = {
  LOCAL_AUTH_PRESENT: 'Connected',
  NOT_DETECTED: 'No OAuth session detected',
  UNKNOWN: 'OAuth status unknown',
};

const SOURCE_LABELS: Record<string, string> = {
  version_probe: 'CLI capability probe',
  sanitized_metrics: 'Sanitized metrics',
  none: 'No source',
};

export function presentAiUsageCard(card: AiUsageCard) {
  return {
    providerLabel: PROVIDER_LABELS[card.provider] ?? 'Unknown',
    sourceLabel: SOURCE_LABELS[card.source] ?? 'No source',
    availabilityLabel: STATUS_LABELS[card.availability] ?? 'Unavailable',
    freshnessLabel:
      card.freshness === 'fresh' ? 'Fresh' : card.freshness === 'stale' ? 'Stale' : 'Error',
    versionLabel: card.capability.version ?? 'Unavailable',
    statusLabel: STATUS_LABELS[card.sourceStatus] ?? 'Unavailable',
    usedLabel: formatPercentage(card.usedPercent),
    remainingLabel: formatPercentage(card.remainingPercent),
    resetLabel: formatDate(card.resetAt),
    sessionTokensLabel: formatTokens(card.sessionTotalTokens),
    updatedLabel: formatDate(card.lastUpdated),
    authStatusLabel: AUTH_STATUS_LABELS[card.auth.status] ?? 'OAuth status unknown',
    authModeLabel: card.auth.mode === 'adc' ? 'ADC' : 'OAuth',
    loginCommand: card.auth.loginCommand,
    loginHint: card.auth.loginHint,
  };
}

function formatPercentage(value: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? `${value}%`
    : 'Unavailable';
}

function formatDate(value: string | null): string {
  if (!value?.trim()) return 'Unavailable';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Unavailable' : parsed.toLocaleString();
}

function formatTokens(value: number | null): string {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value.toLocaleString()
    : 'Unavailable';
}
