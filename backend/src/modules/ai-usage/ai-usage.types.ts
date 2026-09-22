export const AI_USAGE_PROVIDERS = ['codex', 'agy_gemini', 'zai', 'grok'] as const;
export type AiUsageProvider = (typeof AI_USAGE_PROVIDERS)[number];

export type AiUsageSource = 'version_probe' | 'sanitized_metrics' | 'none';
export type AiUsageQuotaSource = 'unsupported' | 'mac_helper' | 'none';
export type AiUsageAvailability =
  | 'AVAILABLE'
  | 'BINARY_MISSING'
  | 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE'
  | 'UNSUPPORTED'
  | 'ERROR';
export type AiUsageFreshness = 'fresh' | 'stale' | 'error';
export type AiUsageAuthMode = 'oauth' | 'adc' | 'api_key';
export type AiUsageAuthStatus = 'LOCAL_AUTH_PRESENT' | 'NOT_DETECTED' | 'UNKNOWN';
export type AiUsageAuthSource = 'local_metadata' | 'mac_helper' | 'none';

export interface AiUsageAuthInfo {
  mode: AiUsageAuthMode;
  status: AiUsageAuthStatus;
  source: AiUsageAuthSource;
  loginCommand: string;
  loginHint: string;
  checkedAt: string;
  deviceAuthAvailable: boolean;
}

export interface AiUsageCapability {
  binaryPresent: boolean;
  version: string | null;
  probeCommand: string;
}

export interface AiUsageError {
  code: string;
  message: string;
}

export type AiUsageSourceStatus =
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE'
  | 'ERROR'
  | 'STALE';

export type AiUsageUnknownValue = string | number | boolean | null;

export interface AiUsageQuotaWindow {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetAt: string | null;
}

export interface AiUsageCard {
  provider: AiUsageProvider;
  usedPercent: number | null;
  remainingPercent: number | null;
  resetAt: string | null;
  windowLabel: string | null;
  quotaWindows?: AiUsageQuotaWindow[];
  planOrTier: string | null;
  sessionInputTokens: number | null;
  sessionOutputTokens: number | null;
  sessionTotalTokens: number | null;
  lastUpdated: string | null;
  sourceStatus: AiUsageSourceStatus;
  capability: AiUsageCapability;
  source: AiUsageSource;
  usageSupported: boolean;
  quotaSource: AiUsageQuotaSource;
  availability: AiUsageAvailability;
  freshness: AiUsageFreshness;
  probedAt: string | null;
  staleAfter: string | null;
  error: AiUsageError | null;
  unknownQuotaFields: Record<string, AiUsageUnknownValue>;
  auth: AiUsageAuthInfo;
}

export interface AiUsageSnapshot {
  cards: AiUsageCard[];
  collectedAt: string;
}

export type AiUsageDeviceAuthProvider = 'codex' | 'grok';
export type AiUsageDeviceAuthStatus =
  | 'STARTING'
  | 'WAITING_USER'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface AiUsageDeviceAuthFlow {
  flowId: string;
  provider: AiUsageDeviceAuthProvider;
  status: AiUsageDeviceAuthStatus;
  verificationUri: string | null;
  userCode: string | null;
  expiresAt: string;
  error: string | null;
}
