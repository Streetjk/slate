import { describe, expect, it } from 'bun:test';
import type { AppConfig } from '../../infra/config/app.config';
import { AiUsageAuthFlowService } from './ai-usage-auth-flow.service';
import { unavailableCard, unknownAuthInfo } from './ai-usage.service';

function config(url = 'http://100.73.201.113:19091'): AppConfig {
  return { aiUsageMacHelperUrl: url } as AppConfig;
}

describe('AI usage Mac helper bridge', () => {
  it('enriches CLI/auth presence without importing secrets or account identity', async () => {
    const fakeFetch = async () =>
      Response.json({
        codex: {
          provider: 'codex',
          cliPresent: true,
          version: 'codex-cli 0.153.4',
          authMetadataDetected: true,
          deviceAuthAvailable: true,
          checkedAt: '2026-09-18T00:00:00.000Z',
          quota: {
            observedAt: '2026-09-18T00:00:01.000Z',
            windows: [
              {
                label: '5h',
                usedPercent: 23,
                remainingPercent: 77,
                resetAt: '2026-09-18T05:00:00.000Z',
                resetLabel: '18 Sep 1:00pm',
              },
            ],
          },
          access_token: 'MUST_NOT_FLOW',
        },
      });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fakeFetch as typeof fetch;
    const service = new AiUsageAuthFlowService(config());
    const card = unavailableCard('codex', null, 'UNAVAILABLE', {
      auth: unknownAuthInfo('codex', '2026-09-18T00:00:00.000Z'),
    });
    const result = await service.enrichSnapshot({ cards: [card], collectedAt: 'now' });
    expect(result.cards[0]?.capability.version).toBe('codex-cli 0.153.4');
    expect(result.cards[0]).toMatchObject({
      sourceStatus: 'AVAILABLE',
      availability: 'AVAILABLE',
      source: 'sanitized_metrics',
      usageSupported: true,
      quotaSource: 'mac_helper',
      usedPercent: 23,
      remainingPercent: 77,
      resetAt: '2026-09-18T05:00:00.000Z',
      windowLabel: '5h',
      quotaWindows: [
        {
          label: '5h',
          usedPercent: 23,
          remainingPercent: 77,
          resetAt: '2026-09-18T05:00:00.000Z',
        },
      ],
      lastUpdated: '2026-09-18T00:00:01.000Z',
    });
    expect(result.cards[0]?.auth).toMatchObject({
      status: 'LOCAL_AUTH_PRESENT',
      source: 'mac_helper',
      deviceAuthAvailable: true,
    });
    expect(JSON.stringify(result)).not.toContain('MUST_NOT_FLOW');
    globalThis.fetch = originalFetch;
  });

  it('binds helper device flows to the authenticated Slate user', async () => {
    const calls: Array<{ url: string; method: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, method: init?.method ?? 'GET' });
      if (url.endsWith('/v1/device-auth/codex/start')) {
        return Response.json(
          {
            flowId: 'helper-flow',
            provider: 'codex',
            status: 'WAITING_USER',
            verificationUri: 'https://auth.openai.com/codex/device',
            userCode: 'ABCD-EFGH',
            expiresAt: new Date(Date.now() + 600_000).toISOString(),
            error: null,
          },
          { status: 201 }
        );
      }
      if (url.endsWith('/v1/device-auth/helper-flow')) {
        return Response.json({
          flowId: 'helper-flow',
          provider: 'codex',
          status: 'COMPLETED',
          verificationUri: 'https://auth.openai.com/codex/device',
          userCode: 'ABCD-EFGH',
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          error: null,
        });
      }
      return new Response(null, { status: 204 });
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fakeFetch as typeof fetch;
    const service = new AiUsageAuthFlowService(config());
    const started = await service.start('user-a', 'codex');
    expect(started.flowId).not.toBe('helper-flow');
    await expect(service.status('user-b', started.flowId)).rejects.toThrow('not found');
    expect((await service.status('user-a', started.flowId)).status).toBe('COMPLETED');
    expect(calls.some((call) => call.url.includes('helper-flow'))).toBe(true);
    globalThis.fetch = originalFetch;
  });
});
