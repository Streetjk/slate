import { Injectable } from '@nestjs/common';
import { AiUsageConfig, type AiUsageConfigT } from 'shared';
import { AppConfig } from '../../../infra/config/app.config';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';

export interface AiUsagePanelQuotaWindow {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetLabel: string | null;
  resetAt?: string | null;
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
  { id: 'grok', label: 'Grok' },
  { id: 'agy_gemini', label: 'AGY / Gemini' },
  { id: 'claude', label: 'Claude' },
];

const HELPER_TIMEOUT_MS = 2_500;

@Injectable()
export class AiUsageProvider implements DataProvider<AiUsageConfigT, AiUsagePanelData> {
  readonly type = 'ai_usage';

  constructor(private readonly config: AppConfig) {}

  validateConfig(raw: unknown): AiUsageConfigT {
    return AiUsageConfig.parse(raw);
  }

  async fetchData(_config: AiUsageConfigT, ctx: DynamicContentFetchCtx): Promise<AiUsagePanelData> {
    const localBase = this.config.aiUsageLocalHelperUrl;
    const macBase = this.config.aiUsageMacHelperUrl;
    if (!localBase && !macBase) throw new Error('AI usage helper is not configured');

    const [localRecord, macRecord] = await Promise.all([
      fetchHelper(localBase),
      fetchHelper(macBase),
    ]);
    if (!localRecord && !macRecord) throw new Error('AI usage helpers are unavailable');

    const selectedCheckedAt: string[] = [];
    const providers = PROVIDERS.map(({ id, label }) => {
      const localState = providerState(localRecord, id);
      const macState = providerState(macRecord, id);
      const selected = selectProviderState(localState, macState);
      selected.windows = freshQuotaWindows(
        selected.windows,
        safeIso(selected.quota.observedAt),
        ctx.now
      );
      const previous = previousProviderState(ctx.lastData, id);
      if (previous)
        previous.quotaWindows = freshQuotaWindows(
          previous.quotaWindows,
          previous.quotaObservedAt,
          ctx.now
        );
      const currentStatus =
        selected.state.authMetadataDetected === true
          ? ('connected' as const)
          : selected.state.authMetadataDetected === false
            ? ('sign_in' as const)
            : ('unknown' as const);
      const macUnavailable = Boolean(macBase && !macRecord);
      const retainPreviousQuota =
        selected.windows.length === 0 &&
        previous !== null &&
        previous.quotaWindows.length > 0 &&
        (currentStatus !== 'sign_in' || macUnavailable);
      const currentVersion = safeVersion(selected.state.version);

      if (selected.checkedAt) selectedCheckedAt.push(selected.checkedAt);
      return {
        id,
        label,
        version:
          currentVersion !== 'Unavailable' ? currentVersion : (previous?.version ?? 'Unavailable'),
        status:
          currentStatus !== 'unknown'
            ? macUnavailable && previous?.status === 'connected'
              ? ('connected' as const)
              : currentStatus
            : (previous?.status ?? ('unknown' as const)),
        quotaWindows: retainPreviousQuota ? previous.quotaWindows : selected.windows,
        quotaObservedAt: retainPreviousQuota
          ? previous.quotaObservedAt
          : safeIso(selected.quota.observedAt),
      };
    });

    return {
      providers,
      updatedAt:
        newestIso(selectedCheckedAt) ?? previousUpdatedAt(ctx.lastData) ?? ctx.now.toISOString(),
    };
  }
}

interface SelectedProviderState {
  state: Record<string, unknown>;
  quota: Record<string, unknown>;
  windows: AiUsagePanelQuotaWindow[];
  checkedAt: string | null;
}

async function fetchHelper(base: string | undefined): Promise<Record<string, unknown> | null> {
  if (!base) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HELPER_TIMEOUT_MS);
  try {
    const response = await fetch(new URL('/v1/providers', ensureTrailingSlash(base)), {
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const raw = await response.json();
    return isRecord(raw) ? raw : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function providerState(
  record: Record<string, unknown> | null,
  id: AiUsagePanelProvider['id']
): Record<string, unknown> {
  if (!record) return {};
  return isRecord(record[id]) ? record[id] : {};
}

function previousProviderState(
  lastData: unknown,
  id: AiUsagePanelProvider['id']
): AiUsagePanelProvider | null {
  if (!isRecord(lastData) || !Array.isArray(lastData.providers)) return null;
  const row = lastData.providers.find((entry) => isRecord(entry) && entry.id === id);
  if (!isRecord(row)) return null;
  const status =
    row.status === 'connected' || row.status === 'sign_in' || row.status === 'unknown'
      ? row.status
      : 'unknown';
  return {
    id,
    label: typeof row.label === 'string' ? row.label : id,
    version: safeVersion(row.version),
    status,
    quotaWindows: normalizeQuotaWindows(row.quotaWindows),
    quotaObservedAt: safeIso(row.quotaObservedAt),
  };
}

function previousUpdatedAt(lastData: unknown): string | null {
  return isRecord(lastData) ? safeIso(lastData.updatedAt) : null;
}

function selectProviderState(
  localState: Record<string, unknown>,
  fallbackState: Record<string, unknown>
): SelectedProviderState {
  const localQuota = isRecord(localState.quota) ? localState.quota : {};
  const fallbackQuota = isRecord(fallbackState.quota) ? fallbackState.quota : {};
  const localWindows = normalizeQuotaWindows(localQuota.windows);
  const fallbackWindows = normalizeQuotaWindows(fallbackQuota.windows);

  if (localWindows.length > 0) {
    return {
      state: localState,
      quota: localQuota,
      windows: localWindows,
      checkedAt: safeIso(localState.checkedAt),
    };
  }
  if (fallbackWindows.length > 0) {
    return {
      state: fallbackState,
      quota: fallbackQuota,
      windows: fallbackWindows,
      checkedAt: safeIso(fallbackState.checkedAt),
    };
  }

  const localAuthenticated = localState.authMetadataDetected === true;
  const fallbackAuthenticated = fallbackState.authMetadataDetected === true;
  const localHasCapability =
    localState.cliPresent === true || localAuthenticated || typeof localState.version === 'string';
  const state =
    fallbackAuthenticated && !localAuthenticated
      ? fallbackState
      : localHasCapability
        ? localState
        : fallbackState;
  const quota = state === localState ? localQuota : fallbackQuota;
  return {
    state,
    quota,
    windows: [],
    checkedAt: safeIso(state.checkedAt),
  };
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

function newestIso(values: string[]): string | null {
  let newest: string | null = null;
  let newestMs = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    const iso = safeIso(value);
    if (!iso) continue;
    const ms = Date.parse(iso);
    if (ms > newestMs) {
      newestMs = ms;
      newest = iso;
    }
  }
  return newest;
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
          ...(safeIso(item.resetAt) ? { resetAt: safeIso(item.resetAt) } : {}),
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

function freshQuotaWindows(
  windows: AiUsagePanelQuotaWindow[],
  observedAt: string | null,
  now: Date
): AiUsagePanelQuotaWindow[] {
  if (!observedAt) return [];
  const age = now.getTime() - Date.parse(observedAt);
  if (age < 0 || age > 6 * 60 * 60_000) return [];
  return windows.filter((window) => !window.resetAt || Date.parse(window.resetAt) > now.getTime());
}
