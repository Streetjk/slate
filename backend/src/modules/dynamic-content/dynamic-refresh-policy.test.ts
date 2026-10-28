import { describe, expect, it } from 'bun:test';
import {
  computeDynamicRefreshSchedule,
  computeErrorBackoffAt,
  dynamicSchedulePolicy,
} from './dynamic-refresh-policy';

describe('AI usage refresh scheduling', () => {
  it('honors the configured five-minute refresh interval', () => {
    const now = new Date('2026-09-25T00:00:00.000Z');
    expect(dynamicSchedulePolicy('ai_usage')).toBe('refresh_interval');
    const schedule = computeDynamicRefreshSchedule({
      dynamicType: 'ai_usage',
      config: { type: 'ai_usage', refresh_interval_sec: 300 },
      now,
      defaultTtlSec: 3600,
    });
    expect(schedule.nextRunAt?.toISOString()).toBe('2026-09-25T00:05:00.000Z');
    expect(schedule.refreshDueAt?.toISOString()).toBe('2026-09-25T00:05:00.000Z');
  });
});

describe('Outlook auto-page refresh scheduling', () => {
  const calendarEvents = Array.from({ length: 7 }, (_, index) => {
    const start = `2026-10-27T${String(index + 7).padStart(2, '0')}:00:00+08:00`;
    return {
      id: `meeting-${index}`,
      title: `Meeting ${index}`,
      start,
      end: new Date(Date.parse(start) + 60 * 60_000).toISOString(),
      allDay: false,
    };
  });

  it('schedules the first page transition at 09:00 instead of waiting for the regular refresh', () => {
    const now = new Date('2026-10-27T00:30:00.000Z'); // 08:30 in Perth
    const schedule = computeDynamicRefreshSchedule({
      dynamicType: 'outlook_calendar',
      config: { type: 'outlook_calendar', tz: 'Australia/Perth', day_offset: 0 },
      now,
      defaultTtlSec: 3600,
      calendarEvents,
    });
    expect(schedule.nextRunAt?.toISOString()).toBe('2026-10-27T01:00:00.000Z');
    expect(schedule.refreshDueAt?.toISOString()).toBe('2026-10-27T01:00:00.000Z');
  });

  it('retains normal refreshes if they happen before the page transition', () => {
    const now = new Date('2026-10-27T00:30:00.000Z');
    const schedule = computeDynamicRefreshSchedule({
      dynamicType: 'outlook_calendar',
      config: { type: 'outlook_calendar', tz: 'Australia/Perth', day_offset: 0 },
      now,
      defaultTtlSec: 600,
      calendarEvents,
    });
    expect(schedule.nextRunAt?.toISOString()).toBe('2026-10-27T00:40:00.000Z');
  });

  it('does not schedule scrolling with six events or on a navigated date', () => {
    const now = new Date('2026-10-27T00:30:00.000Z');
    for (const [events, dayOffset] of [
      [calendarEvents.slice(0, 6), 0],
      [calendarEvents, -1],
    ] as const) {
      const schedule = computeDynamicRefreshSchedule({
        dynamicType: 'outlook_calendar',
        config: { type: 'outlook_calendar', tz: 'Australia/Perth', day_offset: dayOffset },
        now,
        defaultTtlSec: 3600,
        calendarEvents: events,
      });
      expect(schedule.nextRunAt?.toISOString()).toBe('2026-10-27T01:30:00.000Z');
    }
  });
});

describe('computeErrorBackoffAt', () => {
  const now = new Date('2026-01-01T00:00:00.000Z');
  const delaySec = (attempts: number) =>
    (computeErrorBackoffAt(attempts, now).getTime() - now.getTime()) / 1000;

  it('returns a strictly future time for the first failure', () => {
    expect(computeErrorBackoffAt(1, now).getTime()).toBeGreaterThan(now.getTime());
  });

  it('doubles the delay per consecutive failure', () => {
    expect(delaySec(1)).toBe(60);
    expect(delaySec(2)).toBe(120);
    expect(delaySec(3)).toBe(240);
  });

  it('caps the delay at one hour', () => {
    expect(delaySec(10)).toBe(3600);
    expect(delaySec(100)).toBe(3600);
  });

  it('treats non-positive / fractional attempts as the first failure', () => {
    expect(delaySec(0)).toBe(60);
    expect(delaySec(-5)).toBe(60);
    expect(delaySec(1.9)).toBe(60);
  });

  it('treats non-finite attempts as the first failure (no Invalid Date)', () => {
    expect(delaySec(NaN)).toBe(60);
    expect(delaySec(undefined as unknown as number)).toBe(60);
    expect(Number.isNaN(computeErrorBackoffAt(NaN, now).getTime())).toBe(false);
  });
});
