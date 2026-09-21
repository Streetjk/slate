import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_PREFIX, api } from '@/lib/http';

export type AiUsageProvider = 'codex' | 'agy_gemini' | 'zai' | 'grok';
export type AiUsageSource = 'version_probe' | 'sanitized_metrics' | 'none';
export type AiUsageQuotaSource = 'unsupported' | 'mac_helper' | 'none';
export type AiUsageAvailability =
  | 'AVAILABLE'
  | 'BINARY_MISSING'
  | 'UNAVAILABLE_NO_MACHINE_READABLE_USAGE'
  | 'UNSUPPORTED'
  | 'ERROR';
export type AiUsageFreshness = 'fresh' | 'stale' | 'error';
export type AiUsageAuthStatus = 'LOCAL_AUTH_PRESENT' | 'NOT_DETECTED' | 'UNKNOWN';
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
  capability: {
    binaryPresent: boolean;
    version: string | null;
    probeCommand: string;
  };
  source: AiUsageSource;
  usageSupported: boolean;
  quotaSource: AiUsageQuotaSource;
  availability: AiUsageAvailability;
  freshness: AiUsageFreshness;
  probedAt: string | null;
  staleAfter: string | null;
  error: { code: string; message: string } | null;
  unknownQuotaFields: Record<string, string | number | boolean | null>;
  auth: {
    mode: 'oauth' | 'adc' | 'api_key';
    status: AiUsageAuthStatus;
    source: 'local_metadata' | 'mac_helper' | 'none';
    loginCommand: string;
    loginHint: string;
    checkedAt: string;
    deviceAuthAvailable: boolean;
  };
}

export interface AiUsageSnapshot {
  cards: AiUsageCard[];
  collectedAt: string;
}

export function useAiUsage() {
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const { data } = await api.get<AiUsageSnapshot>(`${API_PREFIX}/ai-usage`);
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
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

export function useStartAiUsageDeviceAuth() {
  return useMutation({
    mutationFn: async (provider: AiUsageDeviceAuthProvider) => {
      const { data } = await api.post<AiUsageDeviceAuthFlow>(
        `${API_PREFIX}/ai-usage/oauth/device/${provider}`
      );
      return data;
    },
  });
}

export function useAiUsageDeviceAuth(flowId: string | null) {
  return useQuery({
    queryKey: ['ai-usage-device-auth', flowId],
    enabled: Boolean(flowId),
    queryFn: async () => {
      const { data } = await api.get<AiUsageDeviceAuthFlow>(
        `${API_PREFIX}/ai-usage/oauth/device/flows/${flowId}`
      );
      return data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'STARTING' || status === 'WAITING_USER' ? 1_500 : false;
    },
    staleTime: 0,
  });
}

export function useCancelAiUsageDeviceAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flowId: string) => {
      await api.delete(`${API_PREFIX}/ai-usage/oauth/device/flows/${flowId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
    },
  });
}
