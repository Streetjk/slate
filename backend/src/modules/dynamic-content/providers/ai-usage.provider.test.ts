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

  it('prefers Orange Pi quota per provider and falls back to the Mac for unmigrated providers', async () => {
    globalThis.fetch = (async (input) => {
      const url = String(input);
      if (url.includes('ai-usage-helper:19091')) {
        return Response.json({
          zai: {
            version: 'glm-5.3-flash (Z.ai)',
            authMetadataDetected: true,
            checkedAt: '2026-09-25T02:00:05.000Z',
            quota: {
              observedAt: '2026-09-25T02:00:04.000Z',
              windows: [
                {
                  label: 'Weekly',
                  usedPercent: 31,
                  remainingPercent: 69,
                  resetLabel: 'Sep 30 at 4:07 PM',
                },
              ],
            },
          },
        });
      }
      return Response.json({
        codex: {
          version: 'codex-cli 0.155.0',
          authMetadataDetected: true,
          checkedAt: '2026-09-25T02:00:03.000Z',
          quota: {
            observedAt: '2026-09-25T02:00:02.000Z',
            windows: [
              {
                label: 'Weekly',
                usedPercent: 7,
                remainingPercent: 93,
                resetLabel: 'Oct 1 at 3:52 PM',
              },
            ],
          },
        },
        zai: {
          version: 'old mac zai',
          authMetadataDetected: true,
          checkedAt: '2026-09-25T01:50:00.000Z',
          quota: {
            observedAt: '2026-09-25T01:50:00.000Z',
            windows: [
              { label: 'Weekly', usedPercent: 99, remainingPercent: 1, resetLabel: null },
            ],
          },
        },
      });
    }) as typeof fetch;

    const provider = new AiUsageProvider({
      aiUsageLocalHelperUrl: 'http://ai-usage-helper:19091',
      aiUsageMacHelperUrl: 'http://100.73.201.113:19091',
    } as AppConfig);

    const data = await provider.fetchData(
      { type: 'ai_usage', refresh_interval_sec: 300 },
      { now: new Date('2026-09-25T02:00:10.000Z') }
    );

    const codex = data.providers.find((entry) => entry.id === 'codex');
    const zai = data.providers.find((entry) => entry.id === 'zai');
    expect(codex?.quotaWindows[0]?.usedPercent).toBe(7);
    expect(zai?.quotaWindows[0]?.usedPercent).toBe(31);
    expect(zai?.version).toBe('glm-5.3-flash (Z.ai)');
    expect(data.updatedAt).toBe('2026-09-25T02:00:05.000Z');
  });

  it('retains last known quota when the Mac helper is transiently unavailable', async () => {
    globalThis.fetch = (async (input) => {
      if (String(input).includes('ai-usage-helper:19091')) {
        return Response.json({
          codex: { cliPresent: false, authMetadataDetected: false },
          grok: { cliPresent: false, authMetadataDetected: false },
          agy_gemini: { cliPresent: false, authMetadataDetected: false },
        });
      }
      throw new Error('Mac helper unavailable');
    }) as typeof fetch;

    const provider = new AiUsageProvider({
      aiUsageLocalHelperUrl: 'http://ai-usage-helper:19091',
      aiUsageMacHelperUrl: 'http://100.73.201.113:19091',
    } as AppConfig);
    const lastData = {
      updatedAt: '2026-10-01T21:30:00.000Z',
      providers: [
        {
          id: 'codex',
          label: 'Codex',
          version: 'codex-cli 0.159.2',
          status: 'connected',
          quotaObservedAt: '2026-10-01T21:29:50.000Z',
          quotaWindows: [
            { label: 'Weekly', usedPercent: 75, remainingPercent: 25, resetLabel: 'Oct 7' },
          ],
        },
      ],
    };

    const data = await provider.fetchData(
      { type: 'ai_usage', refresh_interval_sec: 300 },
      { now: new Date('2026-10-01T21:40:00.000Z'), lastData }
    );

    const codex = data.providers.find((entry) => entry.id === 'codex');
    expect(codex?.status).toBe('connected');
    expect(codex?.version).toBe('codex-cli 0.159.2');
    expect(codex?.quotaWindows[0]?.remainingPercent).toBe(25);
    expect(codex?.quotaObservedAt).toBe('2026-10-01T21:29:50.000Z');
    expect(data.updatedAt).toBe('2026-10-01T21:30:00.000Z');
  });

  it('does not retain old quota after a reachable helper reports sign-out', async () => {
    globalThis.fetch = (async () =>
      Response.json({
        codex: {
          version: 'codex-cli 0.159.2',
          authMetadataDetected: false,
          checkedAt: '2026-10-01T21:40:00.000Z',
        },
      })) as typeof fetch;

    const provider = new AiUsageProvider({
      aiUsageMacHelperUrl: 'http://100.73.201.113:19091',
    } as AppConfig);
    const data = await provider.fetchData(
      { type: 'ai_usage', refresh_interval_sec: 300 },
      {
        now: new Date('2026-10-01T21:40:01.000Z'),
        lastData: {
          updatedAt: '2026-10-01T21:30:00.000Z',
          providers: [
            {
              id: 'codex',
              label: 'Codex',
              version: 'codex-cli 0.159.2',
              status: 'connected',
              quotaObservedAt: '2026-10-01T21:29:50.000Z',
              quotaWindows: [
                { label: 'Weekly', usedPercent: 75, remainingPercent: 25, resetLabel: 'Oct 7' },
              ],
            },
          ],
        },
      }
    );

    const codex = data.providers.find((entry) => entry.id === 'codex');
    expect(codex?.status).toBe('sign_in');
    expect(codex?.quotaWindows).toEqual([]);
    expect(codex?.quotaObservedAt).toBeNull();
  });

  it('fails closed when no AI usage helper is configured', async () => {
    const provider = new AiUsageProvider({ aiUsageMacHelperUrl: undefined } as AppConfig);
    await expect(
      provider.fetchData(
        { type: 'ai_usage', refresh_interval_sec: 300 },
        { now: new Date('2026-09-20T22:05:00.000Z') }
      )
    ).rejects.toThrow('not configured');
  });
});
