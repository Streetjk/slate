import { describe, expect, it } from 'bun:test';
import {
  dayFromMonthDay,
  formatForecastDate,
  formatForecastWeekday,
  formatShortTime,
  monthFromMonthDay,
  parseDateLike,
} from './frame-date-utils';

describe('frame date utils', () => {
  it('parses no-zone date-time strings in the requested time zone', () => {
    const parsed = parseDateLike('2026-05-21 08:30', 'Asia/Shanghai');

    expect(parsed.toISOString()).toBe('2026-05-21T00:30:00.000Z');
  });

  it('preserves explicit offsets when formatting short time', () => {
    const fallback = new Date('2026-05-21T00:00:00.000Z');

    expect(formatShortTime('2026-05-21T08:30:00+09:00', fallback, 'Asia/Shanghai')).toBe('07:30');
  });

  it('advances nonexistent DST wall times to the next valid local time', () => {
    const parsed = parseDateLike('2026-03-08 02:30', 'America/New_York');

    expect(parsed.toISOString()).toBe('2026-03-08T07:30:00.000Z');
  });

  it('chooses the earlier instant for repeated DST wall times', () => {
    const parsed = parseDateLike('2026-11-01 01:30', 'America/New_York');

    expect(parsed.toISOString()).toBe('2026-11-01T05:30:00.000Z');
  });

  it('formats forecast ISO dates as compact day-month labels and actual weekdays', () => {
    expect(formatForecastDate('2026-09-20')).toBe('20 Sep');
    expect(formatForecastWeekday('2026-09-20')).toBe('Sunday');
    expect(formatForecastDate('2027-01-01')).toBe('1 Jan');
    expect(formatForecastWeekday('2027-01-01')).toBe('Friday');
    expect(formatForecastDate('2026-02-31')).toBe('');
    expect(formatForecastWeekday('2026-02-31')).toBe('');
    expect(formatForecastDate('2026-13-01')).toBe('');
    expect(formatForecastDate('20/09/2026')).toBe('');
  });

  it('falls back for malformed month-day values instead of returning NaN text', () => {
    const fallback = new Date('2026-05-21T00:00:00.000Z');

    expect(monthFromMonthDay('abc', fallback, 'Asia/Shanghai')).toBe('05');
    expect(dayFromMonthDay('abc', fallback, 'Asia/Shanghai')).toBe('21');
  });
});
