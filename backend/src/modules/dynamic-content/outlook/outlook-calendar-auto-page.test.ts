import { describe, expect, it } from 'bun:test';
import type { CalendarEventT } from 'shared';
import { outlookAgendaPage } from './outlook-calendar-auto-page';

const timezone = 'Australia/Perth';
const today = new Date('2026-10-27T04:00:00.000Z');

function timed(hour: number): CalendarEventT {
  const start = `2026-10-27T${String(hour).padStart(2, '0')}:00:00+08:00`;
  return {
    id: `at-${hour}`,
    title: `Meeting ${hour}`,
    start,
    end: new Date(Date.parse(start) + 60 * 60_000).toISOString(),
    allDay: false,
  };
}

const eventIds = (rows: CalendarEventT[]) => rows.map((row) => row.id);
const nowAt = (hour: number, minute = 0) =>
  new Date(
    `2026-10-27T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+08:00`
  );

describe('Outlook automatic agenda paging', () => {
  it('keeps up to six appointments visible without auto-paging', () => {
    const events = Array.from({ length: 6 }, (_, i) => timed(i + 7));
    const page = outlookAgendaPage(events, today, nowAt(15), timezone, 0);
    expect(eventIds(page.rows)).toEqual(events.map((event) => event.id));
    expect(page.nextPageAt).toBeNull();
  });

  it('advances at exactly 09:00 when the first of seven events started at 07:00', () => {
    const events = Array.from({ length: 7 }, (_, i) => timed(i + 7));
    const before = outlookAgendaPage(events, today, nowAt(8, 59), timezone, 0);
    expect(eventIds(before.rows)).toEqual(['at-7', 'at-8', 'at-9', 'at-10', 'at-11', 'at-12']);
    expect(before.nextPageAt?.toISOString()).toBe('2026-10-27T01:00:00.000Z');

    const after = outlookAgendaPage(events, today, nowAt(9), timezone, 0);
    expect(eventIds(after.rows)).toEqual(['at-8', 'at-9', 'at-10', 'at-11', 'at-12', 'at-13']);
    expect(after.nextPageAt).toBeNull();
  });

  it('progresses through later meetings without running past the final six', () => {
    const events = Array.from({ length: 10 }, (_, i) => timed(i + 7));
    const first = outlookAgendaPage(events, today, nowAt(9), timezone, 0);
    expect(eventIds(first.rows)).toEqual(['at-8', 'at-9', 'at-10', 'at-11', 'at-12', 'at-13']);
    expect(first.nextPageAt?.toISOString()).toBe('2026-10-27T02:00:00.000Z');

    const last = outlookAgendaPage(events, today, nowAt(20), timezone, 0);
    expect(eventIds(last.rows)).toEqual(['at-11', 'at-12', 'at-13', 'at-14', 'at-15', 'at-16']);
    expect(last.nextPageAt).toBeNull();
  });

  it('retains all-day events and uses the first timed event for the two-hour delay', () => {
    const allDay: CalendarEventT = {
      id: 'all-day',
      title: 'Site shutdown',
      start: '2026-10-27',
      end: '2026-10-28',
      allDay: true,
    };
    const events = [allDay, ...Array.from({ length: 7 }, (_, i) => timed(i + 7))];
    const before = outlookAgendaPage(events, today, nowAt(8, 59), timezone, 0);
    expect(eventIds(before.rows)).toEqual(['all-day', 'at-7', 'at-8', 'at-9', 'at-10', 'at-11']);
    expect(before.nextPageAt?.toISOString()).toBe('2026-10-27T01:00:00.000Z');

    const after = outlookAgendaPage(events, today, nowAt(9), timezone, 0);
    expect(eventIds(after.rows)).toEqual(['all-day', 'at-8', 'at-9', 'at-10', 'at-11', 'at-12']);
  });

  it('does not auto-page yesterday or tomorrow during manual day navigation', () => {
    const events = Array.from({ length: 7 }, (_, i) => timed(i + 7));
    const page = outlookAgendaPage(events, today, nowAt(13), timezone, -1);
    expect(eventIds(page.rows)).toEqual(['at-7', 'at-8', 'at-9', 'at-10', 'at-11', 'at-12']);
    expect(page.nextPageAt).toBeNull();
  });

  it('excludes appointments that do not overlap the viewed Perth date', () => {
    const past = {
      ...timed(7),
      id: 'yesterday',
      start: '2026-10-26T07:00:00+08:00',
      end: '2026-10-26T08:00:00+08:00',
    };
    const future = {
      ...timed(7),
      id: 'tomorrow',
      start: '2026-10-28T07:00:00+08:00',
      end: '2026-10-28T08:00:00+08:00',
    };
    const page = outlookAgendaPage([past, timed(7), future], today, nowAt(12), timezone, 0);
    expect(eventIds(page.rows)).toEqual(['at-7']);
    expect(page.totalEvents).toBe(1);
  });
});
