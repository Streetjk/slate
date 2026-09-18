import { describe, expect, it } from 'bun:test';
import { extractDeviceAuthFields, stripAnsi } from './mac-ai-usage-helper';

describe('Mac AI usage helper device auth sanitization', () => {
  it('extracts only an allowlisted Codex verification URL and one-time code', () => {
    const parsed = extractDeviceAuthFields(
      'codex',
      '\u001b[32mOpen https://auth.openai.com/codex/device\u001b[0m\nEnter code ABCD-EFGH\naccess_token=do-not-return'
    );
    expect(parsed).toEqual({
      verificationUri: 'https://auth.openai.com/codex/device',
      userCode: 'ABCD-EFGH',
    });
  });

  it('rejects unrelated URLs and does not surface token-shaped output', () => {
    const parsed = extractDeviceAuthFields(
      'grok',
      'Open https://evil.example/device\naccess_token=SECRETSECRET\nVisit https://auth.x.ai/device and enter WXYZ-1234'
    );
    expect(parsed.verificationUri).toBe('https://auth.x.ai/device');
    expect(parsed.userCode).toBe('WXYZ-1234');
    expect(JSON.stringify(parsed)).not.toContain('SECRETSECRET');
  });

  it('strips ANSI sequences', () => {
    expect(stripAnsi('\u001b[31mhello\u001b[0m')).toBe('hello');
  });
});
