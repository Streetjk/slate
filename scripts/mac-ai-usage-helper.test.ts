import { describe, expect, it } from 'bun:test';
import {
  extractDeviceAuthFields,
  parseGrokQuotaLog,
  parseCodexAppServerRateLimits,
  parseCodexRateLimitEvent,
  parseClaudeQuotaCache,
  readProviderQuota,
  stripAnsi,
} from './mac-ai-usage-helper';

describe('Mac AI usage helper device auth sanitization', () => {
  it('extracts only an allowlisted Codex verification URL and one-time code', () => {
    const parsed = extractDeviceAuthFields(
      'codex',
      '\u001b[32mOpen https://auth.openai.com/codex/device\u001b[0m\nEnter this one-time code\nK7GI-5GIST\naccess_token=do-not-return'
    );
    expect(parsed).toEqual({
      verificationUri: 'https://auth.openai.com/codex/device',
      userCode: 'K7GI-5GIST',
    });
  });

  it('rejects unrelated URLs and does not surface token-shaped output', () => {
    const parsed = extractDeviceAuthFields(
      'grok',
      'Open https://evil.example/device\naccess_token=SECRETSECRET\nVisit https://accounts.x.ai/oauth2/device?user_code=7FW6-WN5T and enter 7FW6-WN5T'
    );
    expect(parsed.verificationUri).toBe('https://accounts.x.ai/oauth2/device?user_code=7FW6-WN5T');
    expect(parsed.userCode).toBe('7FW6-WN5T');
    expect(JSON.stringify(parsed)).not.toContain('SECRETSECRET');
  });

  it('strips ANSI sequences', () => {
    expect(stripAnsi('\u001b[31mhello\u001b[0m')).toBe('hello');
  });
});

describe('Mac AI usage helper quota normalization', () => {
  it('parses fresh Codex session rate-limit events with Unix-second resets', () => {
    const quota = parseCodexRateLimitEvent(
      {
        timestamp: '2026-09-21T12:05:00.000Z',
        payload: {
          rate_limits: {
            limit_id: 'codex',
            primary: {
              used_percent: 23,
              window_minutes: 10080,
              resets_at: 1790412574,
            },
          },
        },
      },
      Date.parse('2026-09-21T12:05:10.000Z')
    );
    expect(quota?.windows[0]).toMatchObject({
      label: 'Weekly',
      usedPercent: 23,
      remainingPercent: 77,
      resetAt: '2026-09-26T08:49:34.000Z',
    });
  });

  it('parses live Codex app-server rate limits', () => {
    const now = Date.parse('2026-09-25T00:00:00.000Z');
    const quota = parseCodexAppServerRateLimits(
      {
        result: {
          rateLimitsByLimitId: {
            codex: {
              limitId: 'codex',
              primary: {
                usedPercent: 6,
                windowDurationMins: 10080,
                resetsAt: 1790841156,
              },
              secondary: null,
            },
          },
        },
      },
      now
    );
    expect(quota).toMatchObject({
      observedAt: '2026-09-25T00:00:00.000Z',
      ageSeconds: 0,
      windows: [
        {
          label: 'Weekly',
          usedPercent: 6,
          remainingPercent: 94,
          resetAt: '2026-10-01T07:52:36.000Z',
        },
      ],
    });
  });

  it('reads fresh Codex quota cache without exposing unrelated fields', () => {
    const quota = readProviderQuota('codex', Date.now());
    if (!quota) return;
    expect(quota.windows.length).toBeGreaterThan(0);
    for (const window of quota.windows) {
      expect(window.usedPercent).toBeGreaterThanOrEqual(0);
      expect(window.usedPercent).toBeLessThanOrEqual(100);
      expect(window.remainingPercent).toBe(100 - window.usedPercent);
    }
    expect(JSON.stringify(quota)).not.toContain('token');
    expect(JSON.stringify(quota)).not.toContain('email');
  });

  it('parses sanitized Claude quota cache without exposing unrelated data', () => {
    const fetchedAt = Date.parse('2026-10-02T04:00:00.000Z') / 1000;
    const now = Date.parse('2026-10-02T04:00:10.000Z');
    const result = parseClaudeQuotaCache(
      {
        fetched_at: fetchedAt,
        five_hour: {
          used_percentage: 12,
          reset_at: 1790937600,
        },
        seven_day: {
          used_percentage: 34,
          reset_at: 1790978400,
        },
      },
      now
    );

    expect(result?.windows.map((w) => [w.label, w.usedPercent, w.remainingPercent])).toEqual([
      ['5h', 12, 88],
      ['Weekly', 34, 66],
    ]);
    expect(result?.windows[0]?.resetLabel).toBeTruthy();
    expect(result?.windows[1]?.resetLabel).toBeTruthy();
  });

  it('parses fresh fetched_at expressed in milliseconds identically to seconds', () => {
    const fetchedSec = Date.parse('2026-10-02T04:00:00.000Z') / 1000;
    const fetchedMs = Date.parse('2026-10-02T04:00:00.000Z');
    const now = Date.parse('2026-10-02T04:00:10.000Z');
    const payload = {
      five_hour: {
        used_percentage: 12,
        reset_at: 1790937600,
      },
      seven_day: {
        used_percentage: 34,
        reset_at: 1790978400,
      },
    };

    const fromSec = parseClaudeQuotaCache({ ...payload, fetched_at: fetchedSec }, now);
    const fromMs = parseClaudeQuotaCache({ ...payload, fetched_at: fetchedMs }, now);

    expect(fromMs).toEqual(fromSec);
    expect(fromMs?.observedAt).toBe('2026-10-02T04:00:00.000Z');
    expect(fromMs?.ageSeconds).toBe(10);
  });

  it('rejects stale Claude quota cache', () => {
    const now = Date.parse('2026-10-02T04:00:00.000Z');
    const result = parseClaudeQuotaCache(
      {
        fetched_at: now / 1000 - 7 * 60 * 60,
        five_hour: {
          used_percentage: 12,
          reset_at: 1790937600,
        },
      },
      now
    );

    expect(result).toBeNull();
  });

  it('uses a fresh local Grok billing percentage when available', () => {
    const quota = readProviderQuota('grok', Date.now());
    if (!quota) return;
    expect(quota.windows[0]?.label).toBe('Weekly');
    expect(quota.windows[0]?.usedPercent).toBeGreaterThanOrEqual(0);
    expect(quota.windows[0]?.usedPercent).toBeLessThanOrEqual(100);
    expect(quota.windows[0]?.remainingPercent).toBe(100 - quota.windows[0]!.usedPercent);
  });
});

describe('Grok billing log freshness', () => {
  const log = JSON.stringify({
    ts: '2026-10-10T01:09:24Z',
    msg: 'billing: fetched credits config',
    ctx: {
      config: {
        creditUsagePercent: 3,
        currentPeriod: { end: '2026-10-15T10:56:15Z' },
        secret: 'DO_NOT_COPY',
      },
    },
  });
  it('reads current billing and excludes unrelated fields', () => {
    const quota = parseGrokQuotaLog(log, Date.parse('2026-10-10T01:10:00Z'));
    expect(quota?.windows[0]?.usedPercent).toBe(3);
    expect(quota?.windows[0]?.resetAt).toBe('2026-10-15T10:56:15.000Z');
    expect(JSON.stringify(quota)).not.toContain('DO_NOT_COPY');
  });
  it('rejects aged observations and expired weekly periods', () => {
    expect(parseGrokQuotaLog(log, Date.parse('2026-10-10T08:10:00Z'))).toBeNull();
    expect(
      parseGrokQuotaLog(
        log.replace('2026-10-15T10:56:15Z', '2026-10-08T10:56:15Z'),
        Date.parse('2026-10-10T01:10:00Z')
      )
    ).toBeNull();
  });
});
