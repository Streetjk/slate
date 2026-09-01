import { Injectable } from '@nestjs/common';
import { CalendarEvent, type CalendarEventT, type OutlookCalendarConfigT } from 'shared';
import { fetchJson } from '../../../common/http/fetch';
import { utcFromWallTimeInTz, utcOffsetMin } from '../timezone';
import { MicrosoftOAuthService } from './microsoft-oauth.service';

const GRAPH_CALENDAR_VIEW_URL = 'https://graph.microsoft.com/v1.0/me/calendarView';
const PERTH_TIMEZONE = 'Australia/Perth';
const GRAPH_TIMEZONE = 'W. Australia Standard Time';

interface GraphEvent {
  id?: unknown;
  subject?: unknown;
  isAllDay?: unknown;
  start?: { dateTime?: unknown; timeZone?: unknown };
  end?: { dateTime?: unknown; timeZone?: unknown };
  location?: { displayName?: unknown };
}

interface GraphCalendarViewResponse {
  value?: unknown;
}

@Injectable()
export class MicrosoftGraphCalendarClient {
  constructor(private readonly oauth: MicrosoftOAuthService) {}

  async listCalendarView(
    userId: string,
    config: Pick<OutlookCalendarConfigT, 'days_ahead' | 'max_events' | 'tz'>,
    now: Date
  ): Promise<CalendarEventT[]> {
    const url = new URL(GRAPH_CALENDAR_VIEW_URL);
    url.searchParams.set('startDateTime', now.toISOString());
    url.searchParams.set(
      'endDateTime',
      new Date(now.getTime() + config.days_ahead * 24 * 60 * 60 * 1000).toISOString()
    );
    url.searchParams.set('$select', 'id,subject,start,end,isAllDay,location');
    url.searchParams.set('$orderby', 'start/dateTime asc');
    url.searchParams.set('$top', String(config.max_events));
    const response = await fetchJson<GraphCalendarViewResponse>(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${await this.oauth.getAccessToken(userId)}`,
        Prefer: `outlook.timezone="${GRAPH_TIMEZONE}"`,
      },
      requireJsonContentType: true,
    });
    if (!Array.isArray(response.value)) return [];
    return response.value
      .map((event) => normalizeGraphEvent(event, config.tz))
      .filter((event): event is CalendarEventT => event !== null)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, config.max_events);
  }
}

export function normalizeGraphEvent(
  value: unknown,
  timezone = PERTH_TIMEZONE
): CalendarEventT | null {
  if (!value || typeof value !== 'object') return null;
  const event = value as GraphEvent;
  if (typeof event.id !== 'string' || !event.id.trim()) return null;
  const allDay = event.isAllDay === true;
  const start = normalizeGraphTemporal(event.start?.dateTime, allDay, timezone);
  const end = normalizeGraphTemporal(event.end?.dateTime, allDay, timezone);
  if (!start || !end) return null;
  const title =
    typeof event.subject === 'string' && event.subject.trim() ? event.subject : 'Untitled event';
  const location =
    typeof event.location?.displayName === 'string' && event.location.displayName.trim()
      ? event.location.displayName.trim()
      : undefined;
  const parsed = CalendarEvent.safeParse({
    id: event.id,
    title,
    start,
    end,
    allDay,
    ...(location ? { location } : {}),
    timezone,
  });
  return parsed.success ? parsed.data : null;
}

function normalizeGraphTemporal(value: unknown, allDay: boolean, timezone: string): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?/);
  if (!match?.[1]) return null;
  if (allDay) return match[1];
  if (!match[2] || !match[3]) return null;
  const seconds = match[4] ?? '00';
  const [year, month, day] = match[1].split('-').map(Number);
  const instant = utcFromWallTimeInTz(
    { year, month, day, hour: Number(match[2]), minute: Number(match[3]), second: Number(seconds) },
    timezone
  );
  if (!instant) return null;
  const offset = utcOffsetMin(instant, timezone);
  const sign = offset >= 0 ? '+' : '-';
  const absolute = Math.abs(offset);
  return `${match[1]}T${match[2]}:${match[3]}:${seconds}${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}
