import { describe, expect, it } from 'bun:test';
import {
  extractDeviceAuthFields,
  parseZaiQuotaPayload,
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

  it('parses Z.ai credit windows without exposing credential data', () => {
    const quota = parseZaiQuotaPayload(
      {
        fetchedAt: '2026-09-21T11:37:26.048Z',
        quota: {
          level: 'lite',
          limits: [
            {
              type: 'CREDIT_LIMIT',
              unit: 3,
              percentage: 0,
              currentValue: 0,
              usage: 2000,
              remaining: 2000,
            },
            {
              type: 'CREDIT_LIMIT',
              unit: 6,
              percentage: 13,
              nextResetTime: 1790150863983,
              currentValue: 1346,
              usage: 10000,
              remaining: 8653,
            },
          ],
        },
        apiKey: 'DO_NOT_COPY',
      },
      Date.parse('2026-09-21T11:37:30.000Z')
    );
    expect(
      quota?.windows.map((window) => [window.label, window.usedPercent, window.remainingPercent])
    ).toEqual([
      ['5h', 0, 100],
      ['Weekly', 13, 87],
    ]);
    expect(quota?.windows[1]?.resetLabel).toBeTruthy();
    expect(JSON.stringify(quota)).not.toContain('DO_NOT_COPY');
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
