import { afterEach, describe, expect, it } from 'bun:test';
import type { AppConfig } from '../../../infra/config/app.config';
import { AiUsageProvider } from './ai-usage.provider';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('AiUsageProvider', () => {
  it('normalizes only safe helper fields for the device frame', async () => {
    globalThis.fetch = (async () =>
      Response.json({
        codex: {
          version: 'codex-cli 0.155.0',
          authMetadataDetected: true,
          checkedAt: '2026-09-20T22:04:44.815Z',
          quota: {
            observedAt: '2026-09-20T22:04:30.000Z',
            windows: [
              {
                label: 'Weekly',
                usedPercent: 20,
                remainingPercent: 80,
                resetLabel: 'Sep 26 4:49pm',
              },
            ],
          },
          access_token: 'DO_NOT_COPY',
          email: 'secret@example.com',
        },
        agy_gemini: {
          version: '1.2.7',
          authMetadataDetected: true,
          checkedAt: '2026-09-20T22:04:44.815Z',
        },
        zai: {
          version: 'glm-5.3-flash (Z.ai)',
          authMetadataDetected: true,
          checkedAt: '2026-09-20T22:04:44.815Z',
        },
        grok: {
          version: 'grok 1.0.34',
          authMetadataDetected: true,
          checkedAt: '2026-09-20T22:04:44.815Z',
        },
      })) as typeof fetch;

    const provider = new AiUsageProvider({
      aiUsageMacHelperUrl: 'http://100.73.201.113:19091',
    } as AppConfig);

    const data = await provider.fetchData(
      { type: 'ai_usage', refresh_interval_sec: 300 },
      { now: new Date('2026-09-20T22:05:00.000Z') }
    );

    expect(data.providers.map((entry) => [entry.id, entry.status])).toEqual([
      ['codex', 'connected'],
      ['grok', 'connected'],
      ['agy_gemini', 'connected'],
      ['zai', 'connected'],
    ]);
    expect(data.providers[0]?.version).toBe('codex-cli 0.155.0');
    expect(data.providers[0]?.quotaWindows).toEqual([
      { label: 'Weekly', usedPercent: 20, remainingPercent: 80, resetLabel: 'Sep 26 4:49pm' },
    ]);
    expect(data.providers[1]?.quotaWindows).toEqual([]);
    expect(data.updatedAt).toBe('2026-09-20T22:04:44.815Z');
    expect(JSON.stringify(data)).not.toContain('DO_NOT_COPY');
    expect(JSON.stringify(data)).not.toContain('secret@example.com');
  });

  it('fails closed when the Mac helper is not configured', async () => {
    const provider = new AiUsageProvider({ aiUsageMacHelperUrl: undefined } as AppConfig);
    await expect(
      provider.fetchData(
        { type: 'ai_usage', refresh_interval_sec: 300 },
        { now: new Date('2026-09-20T22:05:00.000Z') }
      )
    ).rejects.toThrow('not configured');
  });
});
