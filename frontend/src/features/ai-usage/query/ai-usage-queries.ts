import { useQuery } from '@tanstack/react-query';
import { API_PREFIX, api } from '@/lib/http';

export type AiUsageProvider = 'codex' | 'agy_gemini' | 'grok';
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

export function useAiUsage() {
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const { data } = await api.get<AiUsageSnapshot>(`${API_PREFIX}/ai-usage`);
      return data;
    },
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
  });
}
