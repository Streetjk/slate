import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppConfig } from '../../infra/config/app.config';
import type {
  AiUsageDeviceAuthFlow,
  AiUsageDeviceAuthProvider,
  AiUsageProvider,
  AiUsageSnapshot,
} from './ai-usage.types';

const HELPER_TIMEOUT_MS = 3_000;
const OWNED_FLOW_TTL_MS = 12 * 60_000;

interface HelperProviderState {
  provider: AiUsageProvider;
  cliPresent: boolean;
  version: string | null;
  authMetadataDetected: boolean;
  deviceAuthAvailable: boolean;
  checkedAt: string;
}

type HelperProviderSnapshot = Partial<Record<AiUsageProvider, HelperProviderState>>;

type HelperDeviceAuthFlow = AiUsageDeviceAuthFlow;

interface OwnedFlow {
  userId: string;
  provider: AiUsageDeviceAuthProvider;
  helperFlowId: string;
  expiresAtMs: number;
}

export type AiUsageHelperFetch = typeof fetch;

@Injectable()
export class AiUsageAuthFlowService {
  private readonly ownedFlows = new Map<string, OwnedFlow>();

  constructor(
    private readonly config: AppConfig,
    private readonly helperFetch: AiUsageHelperFetch = fetch
  ) {}

  async enrichSnapshot(snapshot: AiUsageSnapshot): Promise<AiUsageSnapshot> {
    const helper = await this.getProviderSnapshot();
    if (!helper) return snapshot;
    return {
      ...snapshot,
      cards: snapshot.cards.map((card) => {
        const state = helper[card.provider];
        if (!state) return card;
        const helperHasCli = state.cliPresent;
        const preserveAvailableMetrics =
          card.sourceStatus === 'AVAILABLE' || card.sourceStatus === 'STALE';
        return {
          ...card,
          ...(preserveAvailableMetrics
            ? {}
            : {
                sourceStatus: helperHasCli
                  ? ('UNAVAILABLE_NO_MACHINE_READABLE_USAGE' as const)
                  : ('UNAVAILABLE' as const),
                availability: helperHasCli
                  ? ('UNAVAILABLE_NO_MACHINE_READABLE_USAGE' as const)
                  : ('BINARY_MISSING' as const),
                freshness: 'fresh' as const,
                source: helperHasCli ? ('version_probe' as const) : ('none' as const),
                probedAt: state.checkedAt,
                lastUpdated: state.checkedAt,
                error: null,
              }),
          capability: {
            ...card.capability,
            binaryPresent: state.cliPresent,
            version: state.version,
          },
          auth: {
            ...card.auth,
            status: state.authMetadataDetected ? 'LOCAL_AUTH_PRESENT' : 'NOT_DETECTED',
            source: 'mac_helper',
            checkedAt: state.checkedAt,
            deviceAuthAvailable: state.deviceAuthAvailable,
          },
        };
      }),
    };
  }

  async start(userId: string, provider: string): Promise<AiUsageDeviceAuthFlow> {
    this.prune();
    if (provider !== 'codex' && provider !== 'grok') {
      throw new Error('Device OAuth is not available for this provider');
    }
    const helperFlow = await this.helperRequest<HelperDeviceAuthFlow>(
      `/v1/device-auth/${provider}/start`,
      { method: 'POST' }
    );
    const flowId = randomUUID();
    const expiresAtMs = Date.parse(helperFlow.expiresAt);
    this.ownedFlows.set(flowId, {
      userId,
      provider,
      helperFlowId: helperFlow.flowId,
      expiresAtMs: Number.isFinite(expiresAtMs) ? expiresAtMs : Date.now() + OWNED_FLOW_TTL_MS,
    });
    return { ...helperFlow, flowId };
  }

  async status(userId: string, flowId: string): Promise<AiUsageDeviceAuthFlow> {
    this.prune();
    const owned = this.requireOwned(userId, flowId);
    const helperFlow = await this.helperRequest<HelperDeviceAuthFlow>(
      `/v1/device-auth/${encodeURIComponent(owned.helperFlowId)}`
    );
    return { ...helperFlow, flowId };
  }

  async cancel(userId: string, flowId: string): Promise<void> {
    this.prune();
    const owned = this.requireOwned(userId, flowId);
    await this.helperRequest<void>(`/v1/device-auth/${encodeURIComponent(owned.helperFlowId)}`, {
      method: 'DELETE',
    });
    this.ownedFlows.delete(flowId);
  }

  private async getProviderSnapshot(): Promise<HelperProviderSnapshot | null> {
    if (!this.config.aiUsageMacHelperUrl) return null;
    try {
      return await this.helperRequest<HelperProviderSnapshot>('/v1/providers');
    } catch {
      return null;
    }
  }

  private requireOwned(userId: string, flowId: string): OwnedFlow {
    const owned = this.ownedFlows.get(flowId);
    if (!owned || owned.userId !== userId) throw new Error('Device OAuth flow not found');
    return owned;
  }

  private prune(): void {
    const now = Date.now();
    for (const [flowId, flow] of this.ownedFlows) {
      if (flow.expiresAtMs + 60_000 < now) this.ownedFlows.delete(flowId);
    }
  }

  private async helperRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const base = this.config.aiUsageMacHelperUrl;
    if (!base) throw new Error('Mac AI usage helper is not configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HELPER_TIMEOUT_MS);
    try {
      const response = await this.helperFetch(new URL(path, ensureTrailingSlash(base)), {
        ...init,
        redirect: 'error',
        signal: controller.signal,
        headers: { accept: 'application/json', ...(init?.headers ?? {}) },
      });
      if (response.status === 204) return undefined as T;
      if (!response.ok) throw new Error(`Mac AI usage helper returned HTTP ${response.status}`);
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
