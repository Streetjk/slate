import { describe, expect, it } from 'bun:test';
import { DailyCalendarProvider } from './daily-calendar.provider';

describe('DailyCalendarProvider', () => {
  it('uses the configured Perth civil date and English weekday', async () => {
    const provider = new DailyCalendarProvider();
    const config = provider.validateConfig({
      type: 'daily_calendar',
      tz: 'Australia/Perth',
    });

    const data = await provider.fetchData(config, {
      // 16:30 UTC is already the following day in Perth.
      now: new Date('2026-08-31T16:30:00.000Z'),
    });

    expect(data).toMatchObject({
      year: '2026',
      month: '9',
      day: '1',
      monthDay: '09/01',
      weekday: 'Tuesday',
      publicHoliday: null,
    });
  });

  it('marks a versioned WA public holiday without changing the civil date', async () => {
    const provider = new DailyCalendarProvider();
    const config = provider.validateConfig({
      type: 'daily_calendar',
      tz: 'Australia/Perth',
    });

    const data = await provider.fetchData(config, {
      now: new Date('2026-09-27T16:30:00.000Z'),
    });

    expect(data).toMatchObject({
      year: '2026',
      month: '9',
      day: '28',
      weekday: 'Monday',
      publicHoliday: "King's Birthday",
    });
  });
});
