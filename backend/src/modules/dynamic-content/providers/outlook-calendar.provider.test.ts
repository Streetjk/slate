import { describe, expect, it } from 'bun:test';
import type { OutlookCalendarConfigT } from 'shared';
import type { MicrosoftGraphCalendarClient } from '../outlook/microsoft-graph-calendar.client';
import type { OutlookIcsService } from '../outlook/outlook-ics.service';
import { OutlookCalendarProvider, parseOutlookCalendarData } from './outlook-calendar.provider';

const config: OutlookCalendarConfigT = {
  type: 'outlook_calendar',
  tz: 'Australia/Perth',
  day_offset: 0,
  days_ahead: 7,
  max_events: 8,
  refresh_interval_sec: 600,
};

describe('OutlookCalendarProvider', () => {
  it('does not call Graph without an authenticated owner', async () => {
    let calls = 0;
    const graph = {
      listCalendarView: async () => {
        calls += 1;
        return [];
      },
    } as unknown as MicrosoftGraphCalendarClient;
    const provider = new OutlookCalendarProvider(graph, disconnectedIcs());

    await expect(
      provider.fetchData(config, { now: new Date('2026-09-01T00:00:00Z') })
    ).resolves.toEqual({
      events: [],
      fetchedAt: '2026-09-01T00:00:00.000Z',
      connected: false,
    });
    expect(calls).toBe(0);
  });

  it('uses the owner ID and preserves a recent cached response on Graph failure', async () => {
    const seenUsers: string[] = [];
    const graph = {
      listCalendarView: async (userId: string) => {
        seenUsers.push(userId);
        throw new Error('network timeout');
      },
    } as unknown as MicrosoftGraphCalendarClient;
    const provider = new OutlookCalendarProvider(graph, disconnectedIcs());
    const now = new Date('2026-09-01T00:00:00Z');
    const lastData = {
      connected: true,
      fetchedAt: '2026-08-31T00:00:00.000Z',
      events: [
        {
          id: 'evt',
          title: 'Team meeting',
          start: '2026-09-01T09:00:00+08:00',
          end: '2026-09-01T10:00:00+08:00',
          allDay: false,
          timezone: 'Australia/Perth',
        },
      ],
    };

    await expect(
      provider.fetchData(config, { now, ownerUserId: 'user-a', lastData })
    ).resolves.toEqual(lastData);
    expect(seenUsers).toEqual(['user-a']);
  });

  it('parses only normalized events from cached data', () => {
    expect(
      parseOutlookCalendarData({
        connected: true,
        fetchedAt: '2026-09-01T00:00:00.000Z',
        events: [
          { id: 'ok', title: 'Event', start: '2026-09-01', end: '2026-09-02', allDay: true },
          { bad: true },
        ],
      })?.events
    ).toHaveLength(1);
  });

  it('filters cancelled Outlook events from normalized cached data', () => {
    const parsed = parseOutlookCalendarData({
      connected: true,
      fetchedAt: '2026-09-22T00:00:00.000Z',
      events: [
        { id: 'ok', title: 'Standup', start: '2026-09-22', end: '2026-09-23', allDay: true },
        {
          id: 'cancelled-au',
          title: 'Cancelled: Supplier meeting',
          start: '2026-09-22',
          end: '2026-09-23',
          allDay: true,
        },
        {
          id: 'canceled-us',
          title: 'Canceled - Review',
          start: '2026-09-22',
          end: '2026-09-23',
          allDay: true,
        },
      ],
    });

    expect(parsed?.events.map((event) => event.id)).toEqual(['ok']);
  });

  it('prefers the encrypted ICS feed over Graph when an ICS connection exists', async () => {
    let graphCalls = 0;
    let icsCalls = 0;
    const graph = {
      listCalendarView: async () => {
        graphCalls += 1;
        return [];
      },
    } as unknown as MicrosoftGraphCalendarClient;
    const ics = {
      status: async () => ({ connected: true, updatedAt: '2026-09-22T00:00:00.000Z' }),
      listCalendarView: async () => {
        icsCalls += 1;
        return [
          {
            id: 'ics-event',
            title: 'ICS event',
            start: '2026-09-22T09:00:00+08:00',
            end: '2026-09-22T10:00:00+08:00',
            allDay: false,
            timezone: 'Australia/Perth',
          },
        ];
      },
    } as unknown as OutlookIcsService;
    const provider = new OutlookCalendarProvider(graph, ics);

    const result = await provider.fetchData(config, {
      now: new Date('2026-09-22T00:00:00.000Z'),
      ownerUserId: 'user-a',
    });

    expect(result.events[0]?.id).toBe('ics-event');
    expect(graphCalls).toBe(0);
    expect(icsCalls).toBe(1);
  });

  it('keeps cache entries isolated by owner', async () => {
    const owners: string[] = [];
    const graph = {
      listCalendarView: async (userId: string) => {
        owners.push(userId);
        return [
          {
            id: userId,
            title: `${userId} event`,
            start: '2026-09-01T09:00:00+08:00',
            end: '2026-09-01T10:00:00+08:00',
            allDay: false,
            timezone: 'Australia/Perth',
          },
        ];
      },
    } as unknown as MicrosoftGraphCalendarClient;
    const provider = new OutlookCalendarProvider(graph, disconnectedIcs());
    const now = new Date('2026-09-01T00:00:00Z');
    const first = await provider.fetchData(config, { now, ownerUserId: 'user-a' });
    const second = await provider.fetchData(config, { now, ownerUserId: 'user-b' });

    expect(first.events[0]?.id).toBe('user-a');
    expect(second.events[0]?.id).toBe('user-b');
    expect(owners).toEqual(['user-a', 'user-b']);
  });
});

function disconnectedIcs(): OutlookIcsService {
  return {
    status: async () => ({ connected: false }),
    listCalendarView: async () => [],
  } as unknown as OutlookIcsService;
}
