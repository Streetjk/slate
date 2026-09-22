import { afterEach, describe, expect, it } from 'bun:test';
import type { OutlookCalendarConfigT } from 'shared';
import { OutlookIcsService, parseOutlookIcs, validateOutlookIcsUrl } from './outlook-ics.service';

const config: OutlookCalendarConfigT = {
  type: 'outlook_calendar',
  tz: 'Australia/Perth',
  days_ahead: 7,
  max_events: 20,
  refresh_interval_sec: 600,
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('OutlookIcsService security and parsing', () => {
  it('accepts Microsoft Outlook published HTTPS ICS URLs and rejects arbitrary/server-local URLs', () => {
    expect(
      validateOutlookIcsUrl('https://outlook.office365.com/owa/calendar/opaque-token/calendar.ics')
        .hostname
    ).toBe('outlook.office365.com');
    expect(() => validateOutlookIcsUrl('http://outlook.office365.com/calendar.ics')).toThrow(
      'HTTPS'
    );
    expect(() => validateOutlookIcsUrl('https://127.0.0.1/calendar.ics')).toThrow('Microsoft');
    expect(() => validateOutlookIcsUrl('https://example.com/calendar.ics')).toThrow('Microsoft');
  });

  it('fetches published ICS feeds with a browser user agent for Exchange Online compatibility', async () => {
    let userAgent: string | null = null;
    globalThis.fetch = (async (
      _input: Parameters<typeof fetch>[0],
      init?: Parameters<typeof fetch>[1]
    ) => {
      userAgent = new Headers(init?.headers).get('user-agent');
      return new Response(
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Slate Test//EN',
          'BEGIN:VEVENT',
          'UID:ua-test',
          'DTSTAMP:20260921T000000Z',
          'DTSTART:20260922T010000Z',
          'DTEND:20260922T020000Z',
          'SUMMARY:Browser UA Test',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n'),
        { status: 200, headers: { 'content-type': 'text/calendar' } }
      );
    }) as typeof fetch;

    const service = new OutlookIcsService(
      {
        userIntegration: {
          upsert: async () => ({}),
          findUnique: async () => ({ updatedAt: new Date('2026-09-22T00:00:00.000Z') }),
        },
        content: { updateMany: async () => ({ count: 1 }) },
      } as never,
      { encrypt: () => 'encrypted' } as never
    );

    await service.connect(
      'user-a',
      'https://outlook.office365.com/owa/calendar/opaque-token/calendar.ics'
    );

    expect(userAgent).toContain('Mozilla/5.0');
    expect(userAgent).toContain('Chrome/');
  });

  it('accepts an Outlook ICS feed larger than the old 2 MiB limit', async () => {
    globalThis.fetch = (async () =>
      new Response(
        [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Slate Test//EN',
          'BEGIN:VEVENT',
          'UID:large-feed-test',
          'DTSTAMP:20260921T000000Z',
          'DTSTART:20260922T010000Z',
          'DTEND:20260922T020000Z',
          'SUMMARY:Large Feed Test',
          'END:VEVENT',
          'END:VCALENDAR',
        ].join('\r\n'),
        { status: 200, headers: { 'content-length': String(3 * 1024 * 1024) } }
      )) as typeof fetch;

    const service = new OutlookIcsService(
      {
        userIntegration: {
          upsert: async () => ({}),
          findUnique: async () => ({ updatedAt: new Date('2026-09-22T00:00:00.000Z') }),
        },
        content: { updateMany: async () => ({ count: 1 }) },
      } as never,
      { encrypt: () => 'encrypted' } as never
    );

    await expect(
      service.connect(
        'user-a',
        'https://outlook.office365.com/owa/calendar/opaque-token/calendar.ics'
      )
    ).resolves.toEqual({
      connected: true,
      updatedAt: '2026-09-22T00:00:00.000Z',
    });
  });

  it('still rejects Outlook ICS feeds above the 16 MiB safety limit', async () => {
    globalThis.fetch = (async () =>
      new Response('BEGIN:VCALENDAR\r\nEND:VCALENDAR', {
        status: 200,
        headers: { 'content-length': String(16 * 1024 * 1024 + 1) },
      })) as typeof fetch;

    const service = new OutlookIcsService({} as never, {} as never);

    await expect(
      service.connect(
        'user-a',
        'https://outlook.office365.com/owa/calendar/opaque-token/calendar.ics'
      )
    ).rejects.toThrow('too large');
  });

  it('normalizes timed, all-day, and recurring events without exposing feed metadata', () => {
    const body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Slate Test//EN',
      'BEGIN:VEVENT',
      'UID:single-1',
      'DTSTAMP:20260921T000000Z',
      'DTSTART:20260922T010000Z',
      'DTEND:20260922T020000Z',
      'SUMMARY:Team Meeting',
      'LOCATION:Workshop',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:allday-1',
      'DTSTAMP:20260921T000000Z',
      'DTSTART;VALUE=DATE:20260923',
      'DTEND;VALUE=DATE:20260924',
      'SUMMARY:Site Day',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:repeat-1',
      'DTSTAMP:20260921T000000Z',
      'DTSTART:20260922T030000Z',
      'DTEND:20260922T033000Z',
      'RRULE:FREQ=DAILY;COUNT=3',
      'SUMMARY:Daily Standup',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const events = parseOutlookIcs(body, config, new Date('2026-09-22T00:00:00.000Z'));
    expect(
      events.some((event) => event.title === 'Team Meeting' && event.location === 'Workshop')
    ).toBe(true);
    expect(events.some((event) => event.title === 'Site Day' && event.allDay)).toBe(true);
    expect(events.filter((event) => event.title === 'Daily Standup')).toHaveLength(3);
    expect(JSON.stringify(events)).not.toContain('opaque-token');
  });

  it('returns status metadata without returning or decrypting the saved URL', async () => {
    let decryptCalls = 0;
    const service = new OutlookIcsService(
      {
        userIntegration: {
          findUnique: async () => ({ updatedAt: new Date('2026-09-22T00:00:00.000Z') }),
        },
      } as never,
      {
        decrypt: () => {
          decryptCalls += 1;
          return 'SHOULD_NOT_BE_READ';
        },
      } as never
    );

    await expect(service.status('user-a')).resolves.toEqual({
      connected: true,
      updatedAt: '2026-09-22T00:00:00.000Z',
    });
    expect(decryptCalls).toBe(0);
  });
});
