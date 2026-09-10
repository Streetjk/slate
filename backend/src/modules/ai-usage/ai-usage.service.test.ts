import { describe, expect, it } from 'bun:test';
import { parseSanitizedUsagePayload, unavailableCard } from './ai-usage.service';

describe('AI usage sanitization', () => {
  it('represents an unavailable provider without inventing metrics', () => {
    const card = unavailableCard('codex', null, 'UNAVAILABLE');
    expect(card.usedPercent).toBeNull();
    expect(card.remainingPercent).toBeNull();
    expect(card.sessionTotalTokens).toBeNull();
    expect(card.sourceStatus).toBe('UNAVAILABLE');
  });

  it('accepts bounded usage, reset time and session tokens', () => {
    expect(
      parseSanitizedUsagePayload(
        'grok',
        {
          usedPercent: 100,
          remainingPercent: 0,
          resetAt: '2026-09-10T00:00:00Z',
          windowLabel: 'weekly',
          sessionInputTokens: 10,
          sessionOutputTokens: 20,
          sessionTotalTokens: 30,
        },
        '2026-09-10T01:00:00Z'
      )
    ).toMatchObject({
      usedPercent: 100,
      remainingPercent: 0,
      resetAt: '2026-09-10T00:00:00.000Z',
      sessionTotalTokens: 30,
      sourceStatus: 'AVAILABLE',
    });
  });

  it('rejects malformed, out-of-range or secret-bearing output', () => {
    expect(parseSanitizedUsagePayload('codex', '{bad}', '2026-09-10T00:00:00Z')).toBeNull();
    expect(
      parseSanitizedUsagePayload('codex', { usedPercent: 101 }, '2026-09-10T00:00:00Z')
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload(
        'codex',
        { accountEmail: 'private@example.test' },
        '2026-09-10T00:00:00Z'
      )
    ).toBeNull();
    expect(
      parseSanitizedUsagePayload('codex', { resetAt: 'not-a-date' }, '2026-09-10T00:00:00Z')
    ).toBeNull();
  });

  it('allows stale-last-good state to be represented separately by the caller', () => {
    const card = parseSanitizedUsagePayload(
      'agy_gemini',
      { remainingPercent: 100 },
      '2026-09-10T01:00:00Z'
    );
    expect(card?.remainingPercent).toBe(100);
    expect(card?.sourceStatus).toBe('AVAILABLE');
  });
});
