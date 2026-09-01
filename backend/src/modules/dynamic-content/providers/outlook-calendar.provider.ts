import { Injectable } from '@nestjs/common';
import {
  CalendarEvent,
  OutlookCalendarConfig,
  type CalendarEventT,
  type OutlookCalendarConfigT,
} from 'shared';
import { getDateTimeFormat } from '../../../common/utils/intl';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';
import {
  CachedInflightFetcher,
  DEFAULT_PROVIDER_CACHE_TTL_SEC,
  isRecentTimestamp,
} from './provider-cache';
import { MicrosoftGraphCalendarClient } from '../outlook/microsoft-graph-calendar.client';

export interface OutlookCalendarData {
  events: CalendarEventT[];
  fetchedAt: string;
  connected: boolean;
}

const MAX_CACHE_ENTRIES = 64;

@Injectable()
export class OutlookCalendarProvider implements DataProvider<
  OutlookCalendarConfigT,
  OutlookCalendarData
> {
  readonly type = 'outlook_calendar';
  private readonly fetcher = new CachedInflightFetcher<string, OutlookCalendarData>(
    MAX_CACHE_ENTRIES
  );

  constructor(private readonly graph: MicrosoftGraphCalendarClient) {}

  validateConfig(raw: unknown): OutlookCalendarConfigT {
    return OutlookCalendarConfig.parse(raw);
  }

  async fetchData(
    config: OutlookCalendarConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<OutlookCalendarData> {
    if (!ctx.ownerUserId) return emptyCalendar(ctx.now, false);
    const userId = ctx.ownerUserId;
    const key = `${userId}:${config.tz}:${config.days_ahead}:${config.max_events}`;
    const ttlSec = Math.max(config.refresh_interval_sec, DEFAULT_PROVIDER_CACHE_TTL_SEC);
    return this.fetcher.getOrFetch(key, ctx.now.getTime(), ttlSec * 1000, async () => {
      try {
        const events = await this.graph.listCalendarView(userId, config, ctx.now);
        return { events, fetchedAt: ctx.now.toISOString(), connected: true };
      } catch (error) {
        if (isNotConnectedError(error)) return emptyCalendar(ctx.now, false);
        const fallback = fallbackCalendar(ctx.lastData, config.tz, ctx.now);
        if (fallback) return fallback;
        throw error;
      }
    });
  }
}

export function parseOutlookCalendarData(value: unknown): OutlookCalendarData | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.fetchedAt !== 'string' || typeof data.connected !== 'boolean') return null;
  if (!Array.isArray(data.events)) return null;
  const events = data.events.flatMap((event) => {
    const parsed = CalendarEvent.safeParse(event);
    return parsed.success ? [parsed.data] : [];
  });
  return { fetchedAt: data.fetchedAt, connected: data.connected, events };
}

function fallbackCalendar(value: unknown, timezone: string, now: Date): OutlookCalendarData | null {
  const parsed = parseOutlookCalendarData(value);
  if (!parsed || parsed.events.some((event) => event.timezone && event.timezone !== timezone))
    return null;
  return isRecentTimestamp(parsed.fetchedAt, now, 7 * 24 * 60 * 60 * 1000) ? parsed : null;
}

function emptyCalendar(now: Date, connected: boolean): OutlookCalendarData {
  return { events: [], fetchedAt: now.toISOString(), connected };
}

function isNotConnectedError(error: unknown): boolean {
  return error instanceof Error && /not connected/i.test(error.message);
}

export function formatOutlookTime(value: string, timezone: string, allDay: boolean): string {
  if (allDay) return 'ALL DAY';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--';
  return getDateTimeFormat('en-AU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
