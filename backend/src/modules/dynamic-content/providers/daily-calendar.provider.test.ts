import { describe, expect, it } from 'bun:test';
import { CalendarDataService } from '../calendar-data.service';
import { DailyCalendarProvider } from './daily-calendar.provider';
import { MonthCalendarProvider } from './month-calendar.provider';

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

describe('MonthCalendarProvider', () => {
  it('keeps real today separate from a shifted month view', async () => {
    const provider = new MonthCalendarProvider(new CalendarDataService());
    const config = provider.validateConfig({
      type: 'month_calendar',
      tz: 'Australia/Perth',
      month_offset: 1,
    });

    const data = await provider.fetchData(config, {
      now: new Date('2026-09-23T00:00:00.000Z'),
    });

    expect(data.calendar.today).toBe('2026-09-23');
    expect(data.calendar.coverage.from).toBe('2026-10-01');
    expect(data.calendar.months['2026-10']).toBeDefined();
    expect(data.calendar.months[data.calendar.today.slice(0, 7)]).toBeUndefined();
  });
});
