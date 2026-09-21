import { Injectable } from '@nestjs/common';
import { AiUsageConfig, type AiUsageConfigT } from 'shared';
import { AppConfig } from '../../../infra/config/app.config';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';

export interface AiUsagePanelQuotaWindow {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetLabel: string | null;
}

export interface AiUsagePanelProvider {
  id: 'codex' | 'agy_gemini' | 'claude' | 'grok';
  label: string;
  version: string;
  status: 'connected' | 'sign_in' | 'unknown';
  quotaWindows: AiUsagePanelQuotaWindow[];
  quotaObservedAt: string | null;
}

export interface AiUsagePanelData {
  providers: AiUsagePanelProvider[];
  updatedAt: string;
}

const PROVIDERS: Array<{ id: AiUsagePanelProvider['id']; label: string }> = [
  { id: 'codex', label: 'Codex' },
  { id: 'agy_gemini', label: 'AGY / Gemini' },
  { id: 'claude', label: 'Claude' },
  { id: 'grok', label: 'Grok' },
];

@Injectable()
export class AiUsageProvider implements DataProvider<AiUsageConfigT, AiUsagePanelData> {
  readonly type = 'ai_usage';

  constructor(private readonly config: AppConfig) {}

  validateConfig(raw: unknown): AiUsageConfigT {
    return AiUsageConfig.parse(raw);
  }

  async fetchData(_config: AiUsageConfigT, ctx: DynamicContentFetchCtx): Promise<AiUsagePanelData> {
    const base = this.config.aiUsageMacHelperUrl;
    if (!base) throw new Error('AI usage Mac helper is not configured');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await fetch(new URL('/v1/providers', ensureTrailingSlash(base)), {
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('AI usage helper returned HTTP ' + response.status);
      const raw = await response.json();
      const record = isRecord(raw) ? raw : {};
      const providers = PROVIDERS.map(({ id, label }) => {
        const state = isRecord(record[id]) ? record[id] : {};
        const quota = isRecord(state.quota) ? state.quota : {};
        return {
          id,
          label,
          version: safeVersion(state.version),
          status:
            state.authMetadataDetected === true
              ? ('connected' as const)
              : state.authMetadataDetected === false
                ? ('sign_in' as const)
                : ('unknown' as const),
          quotaWindows: normalizeQuotaWindows(quota.windows),
          quotaObservedAt: safeIso(quota.observedAt),
        };
      });
      const checkedAt = PROVIDERS.map(({ id }) => {
        const state = isRecord(record[id]) ? record[id] : {};
        return safeIso(state.checkedAt);
      }).find((value) => value !== null);
      return { providers, updatedAt: checkedAt ?? ctx.now.toISOString() };
    } finally {
      clearTimeout(timer);
    }
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : value + '/';
}

function safeVersion(value: unknown): string {
  if (typeof value !== 'string') return 'Unavailable';
  const text = value
    .replaceAll(String.fromCharCode(13), ' ')
    .replaceAll(String.fromCharCode(10), ' ')
    .replaceAll(String.fromCharCode(9), ' ')
    .trim();
  return text ? text.slice(0, 64) : 'Unavailable';
}

function safeIso(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function normalizeQuotaWindows(value: unknown): AiUsagePanelQuotaWindow[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => {
      if (!isRecord(item)) return [];
      const label = typeof item.label === 'string' ? item.label.trim().slice(0, 24) : '';
      const usedPercent = safePercent(item.usedPercent);
      const remainingPercent = safePercent(item.remainingPercent);
      if (!label || usedPercent === null || remainingPercent === null) return [];
      return [
        {
          label,
          usedPercent,
          remainingPercent,
          resetLabel:
            typeof item.resetLabel === 'string' && item.resetLabel.trim()
              ? item.resetLabel.trim().slice(0, 40)
              : null,
        },
      ];
    })
    .slice(0, 2);
}

function safePercent(value: unknown): number | null {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(number) && number >= 0 && number <= 100 ? Math.round(number) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
