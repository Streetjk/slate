import { describe, expect, it } from 'bun:test';
import { google } from 'googleapis';
import type { ProposedCalendarEventT } from 'shared';
import { GoogleCalendarWriteService, toGoogleEvent } from './google-calendar-write.service';

const timed: ProposedCalendarEventT = {
  title: 'Dentist appointment',
  start: '2026-09-04T15:00:00+08:00',
  end: '2026-09-04T16:00:00+08:00',
  allDay: false,
  timezone: 'Australia/Perth',
};

describe('GoogleCalendarWriteService', () => {
  it('maps timed and all-day proposals to the narrow Calendar event shape', () => {
    expect(toGoogleEvent(timed)).toEqual({
      summary: 'Dentist appointment',
      start: { dateTime: timed.start, timeZone: timed.timezone },
      end: { dateTime: timed.end, timeZone: timed.timezone },
    });
    expect(
      toGoogleEvent({ title: 'Holiday', start: '2026-09-04', end: '2026-09-05', allDay: true })
    ).toEqual({
      summary: 'Holiday',
      start: { date: '2026-09-04' },
      end: { date: '2026-09-05' },
    });
  });

  it('does not obtain a Google client when confirmation is absent', async () => {
    let oauthCalls = 0;
    const service = new GoogleCalendarWriteService(
      {
        consume: async () => {
          throw new Error('invalid or expired');
        },
      } as never,
      {
        getAuthenticatedClient: async () => {
          oauthCalls++;
          return {} as never;
        },
      } as never
    );
    await expect(service.createConfirmedCalendarEvent('user-a', 'ticket')).rejects.toThrow(
      'invalid or expired'
    );
    expect(oauthCalls).toBe(0);
  });

  it('performs one narrow insert only after a consumed ticket', async () => {
    const originalCalendar = google.calendar;
    let request: unknown;
    google.calendar = (() => ({
      events: {
        insert: async (value: unknown) => {
          request = value;
          return { data: { id: 'google-event-1' } };
        },
      },
    })) as never;
    try {
      const service = new GoogleCalendarWriteService(
        {
          consume: async () => ({ proposal: timed, calendarId: 'primary' }),
        } as never,
        { getAuthenticatedClient: async () => ({}) } as never
      );
      await expect(service.createConfirmedCalendarEvent('user-a', 'ticket')).resolves.toEqual({
        id: 'google-event-1',
      });
      expect(request).toEqual({
        calendarId: 'primary',
        sendUpdates: 'none',
        requestBody: toGoogleEvent(timed),
      });
    } finally {
      google.calendar = originalCalendar;
    }
  });

  it('burns the ticket when OAuth or Calendar insertion fails', async () => {
    const originalCalendar = google.calendar;
    let consumed = false;
    let consumeCalls = 0;
    google.calendar = (() => ({
      events: {
        insert: async () => {
          throw new Error('provider detail synthetic-secret-value');
        },
      },
    })) as never;
    try {
      const service = new GoogleCalendarWriteService(
        {
          consume: async () => {
            consumeCalls++;
            if (consumed) throw new Error('invalid or expired');
            consumed = true;
            return { proposal: timed, calendarId: 'primary' };
          },
        } as never,
        { getAuthenticatedClient: async () => ({}) } as never
      );

      await expect(service.createConfirmedCalendarEvent('user-a', 'ticket')).rejects.toThrow(
        'Google Calendar event creation failed'
      );
      await expect(service.createConfirmedCalendarEvent('user-a', 'ticket')).rejects.toThrow(
        'invalid or expired'
      );
      expect(consumeCalls).toBe(2);
    } finally {
      google.calendar = originalCalendar;
    }
  });
});
