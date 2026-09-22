import { describe, expect, it } from 'bun:test';
import type { OutlookCalendarConfigT } from 'shared';
import { OutlookIcsService, parseOutlookIcs, validateOutlookIcsUrl } from './outlook-ics.service';

const config: OutlookCalendarConfigT = {
  type: 'outlook_calendar',
  tz: 'Australia/Perth',
  days_ahead: 7,
  max_events: 20,
  refresh_interval_sec: 600,
};

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
    expect(() => validateOutlookIcsUrl('https://outlook.office365.com/not-a-calendar')).toThrow(
      '.ics'
    );
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
