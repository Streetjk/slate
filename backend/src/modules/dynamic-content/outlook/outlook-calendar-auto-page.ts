import type { CalendarEventT } from 'shared';
import { datePartsInTz, utcFromWallTimeInTz } from '../timezone';

export const OUTLOOK_VISIBLE_EVENTS = 6;
const AUTO_PAGE_AFTER_MS = 2 * 60 * 60 * 1000;

export interface OutlookAgendaPage {
  rows: CalendarEventT[];
  totalEvents: number;
  nextPageAt: Date | null;
}

/** Keep all-day events visible while older timed events make room for later appointments. */
export function outlookAgendaPage(
  events: readonly CalendarEventT[],
  viewedDate: Date,
  now: Date,
  timezone: string,
  dayOffset: number
): OutlookAgendaPage {
  const todaysEvents = events
    .filter((event) => overlapsRenderedDay(event, viewedDate, timezone))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (todaysEvents.length <= OUTLOOK_VISIBLE_EVENTS || dayOffset !== 0) {
    return {
      rows: todaysEvents.slice(0, OUTLOOK_VISIBLE_EVENTS),
      totalEvents: todaysEvents.length,
      nextPageAt: null,
    };
  }

  // An all-day event has no meaningful start-hour; it cannot trigger a 02:00 scroll.
  // Reserve space for it, but always leave a row for timed appointments.
  const pinned = todaysEvents.filter((event) => event.allDay).slice(0, OUTLOOK_VISIBLE_EVENTS - 1);
  const scrollable = todaysEvents.filter((event) => !pinned.includes(event));
  const capacity = OUTLOOK_VISIBLE_EVENTS - pinned.length;
  const maxShift = Math.max(0, scrollable.length - capacity);
  const nowMs = now.getTime();
  let shift = 0;
  let nextPageAt: Date | null = null;

  for (let i = 0; i < maxShift; i += 1) {
    const event = scrollable[i]!;
    if (event.allDay) continue;
    const startedAt = Date.parse(event.start);
    if (!Number.isFinite(startedAt)) continue;
    const pageAtMs = startedAt + AUTO_PAGE_AFTER_MS;
    if (pageAtMs <= nowMs) {
      shift = i + 1;
    } else if (!nextPageAt || pageAtMs < nextPageAt.getTime()) {
      nextPageAt = new Date(pageAtMs);
    }
  }

  return {
    rows: [...pinned, ...scrollable.slice(shift, shift + capacity)].sort((a, b) =>
      a.start.localeCompare(b.start)
    ),
    totalEvents: todaysEvents.length,
    nextPageAt,
  };
}

function overlapsRenderedDay(event: CalendarEventT, viewedDate: Date, timezone: string): boolean {
  const parts = datePartsInTz(viewedDate, timezone);
  const targetKey = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;

  if (event.allDay) return event.start <= targetKey && targetKey < event.end;

  const dayStart = utcFromWallTimeInTz(
    { year: parts.year, month: parts.month, day: parts.day },
    timezone
  );
  const nextDay = utcFromWallTimeInTz(
    { year: parts.year, month: parts.month, day: parts.day + 1 },
    timezone
  );
  if (!dayStart || !nextDay) return false;

  const startMs = Date.parse(event.start);
  const endMs = Date.parse(event.end);
  return (
    Number.isFinite(startMs) &&
    Number.isFinite(endMs) &&
    startMs < nextDay.getTime() &&
    endMs > dayStart.getTime()
  );
}
