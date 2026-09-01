import { afterEach, describe, expect, it } from 'bun:test';
import { CalendarEvent } from 'shared';
import {
  MicrosoftGraphCalendarClient,
  normalizeGraphEvent,
} from './microsoft-graph-calendar.client';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('normalizeGraphEvent', () => {
  it('normalizes a Perth timed event and discards non-rendered fields', () => {
    const event = normalizeGraphEvent({
      id: 'evt-1',
      subject: 'Team meeting',
      isAllDay: false,
      start: { dateTime: '2026-09-04T09:00:00.0000000', timeZone: 'W. Australia Standard Time' },
      end: { dateTime: '2026-09-04T10:00:00.0000000', timeZone: 'W. Australia Standard Time' },
      location: { displayName: 'Office' },
      body: { content: 'private description' },
      attendees: [{ emailAddress: { address: 'private@example.com' } }],
    });

    expect(event).toEqual({
      id: 'evt-1',
      title: 'Team meeting',
      start: '2026-09-04T09:00:00+08:00',
      end: '2026-09-04T10:00:00+08:00',
      allDay: false,
      location: 'Office',
      timezone: 'Australia/Perth',
    });
    expect(CalendarEvent.safeParse(event).success).toBe(true);
  });

  it('keeps all-day boundaries as calendar dates', () => {
    const event = normalizeGraphEvent({
      id: 'evt-2',
      subject: 'Public holiday',
      isAllDay: true,
      start: { dateTime: '2026-09-07T00:00:00.0000000' },
      end: { dateTime: '2026-09-08T00:00:00.0000000' },
    });

    expect(event?.start).toBe('2026-09-07');
    expect(event?.end).toBe('2026-09-08');
    expect(event?.allDay).toBe(true);
  });

  it('rejects malformed or inverted events', () => {
    expect(normalizeGraphEvent({ id: 'missing-times', isAllDay: false })).toBeNull();
    expect(
      normalizeGraphEvent({
        id: 'inverted',
        subject: 'Bad',
        isAllDay: false,
        start: { dateTime: '2026-09-04T10:00:00' },
        end: { dateTime: '2026-09-04T09:00:00' },
      })
    ).toBeNull();
  });

  it('uses only the fixed read-only Graph calendarView request', async () => {
    let request: { url: string; init?: RequestInit } | undefined;
    globalThis.fetch = (async (input, init) => {
      request = { url: String(input), init };
      return new Response(JSON.stringify({ value: [] }), {
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;
    const client = new MicrosoftGraphCalendarClient({
      getAccessToken: async () => 'test-access-token',
    } as never);

    await expect(
      client.listCalendarView(
        'user-a',
        { days_ahead: 7, max_events: 8, tz: 'Australia/Perth' },
        new Date('2026-09-01T00:00:00Z')
      )
    ).resolves.toEqual([]);
    expect(request?.url).toContain('graph.microsoft.com/v1.0/me/calendarView');
    expect(request?.url).toContain('%24select=id%2Csubject%2Cstart%2Cend%2CisAllDay%2Clocation');
    expect(request?.init?.method).toBe('GET');
    const headers = new Headers(request?.init?.headers);
    expect(headers.get('prefer')).toContain('W. Australia Standard Time');
    expect(headers.get('authorization')).toBe('Bearer test-access-token');
  });
});
