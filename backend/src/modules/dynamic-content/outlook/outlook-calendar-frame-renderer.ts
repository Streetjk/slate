import { FRAME_WIDTH } from 'shared';
import { getDateTimeFormat } from '../../../common/utils/intl';
import { BitmapCanvas } from '../rendering/bitmap-canvas';
import type { DynamicRenderContext } from '../rendering/dynamic-render-context';
import type { FrameDrawKit } from '../rendering/frame-draw-kit';
import type { FontSet } from '../rendering/fonts/dynamic-frame-font.service';
import { CONTENT_LEFT, CONTENT_RIGHT, STATUS_BAR_H } from '../rendering/frame-renderer-layout';
import {
  formatOutlookTime,
  parseOutlookCalendarData,
} from '../providers/outlook-calendar.provider';
import { datePartsInTz, utcFromWallTimeInTz } from '../timezone';

export function renderOutlookCalendarFrame(
  c: BitmapCanvas,
  fonts: FontSet,
  ctx: DynamicRenderContext,
  draw: FrameDrawKit
): void {
  const timezone = typeof ctx.config.tz === 'string' ? ctx.config.tz : 'Australia/Perth';
  const data = parseOutlookCalendarData(ctx.data);
  const dateLabel = getDateTimeFormat('en-AU', {
    timeZone: timezone,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
    .format(ctx.renderedAt)
    .toUpperCase();
  draw.drawText(c, fonts.sans16, dateLabel, CONTENT_LEFT, STATUS_BAR_H + 14, {
    maxWidth: 220,
    ellipsis: true,
  });
  draw.drawText(c, fonts.sans12, 'OUTLOOK', CONTENT_RIGHT, STATUS_BAR_H + 17, {
    align: 'right',
    maxWidth: 120,
    ellipsis: true,
  });
  draw.drawRule(c, CONTENT_LEFT, STATUS_BAR_H + 42, FRAME_WIDTH - 2 * CONTENT_LEFT, 'solid');

  const events =
    data?.events
      .filter((event) => overlapsRenderedDay(event.start, event.end, event.allDay, ctx.renderedAt, timezone))
      .sort((a, b) => a.start.localeCompare(b.start)) ?? [];
  if (events.length === 0) {
    draw.drawText(
      c,
      fonts.sans16,
      data?.connected === false ? 'Connect Outlook to sync' : 'No events',
      FRAME_WIDTH / 2,
      132,
      {
        align: 'center',
        maxWidth: 340,
        ellipsis: true,
      }
    );
    return;
  }

  const rows = events.slice(0, 6);
  const rowY = STATUS_BAR_H + 54;
  for (const [index, event] of rows.entries()) {
    const y = rowY + index * 35;
    draw.drawText(
      c,
      fonts.metric12,
      formatOutlookTime(event.start, timezone, event.allDay),
      CONTENT_LEFT,
      y + 2,
      { maxWidth: 58 }
    );
    draw.drawText(c, fonts.sans16, event.title, CONTENT_LEFT + 70, y, {
      maxWidth: CONTENT_RIGHT - CONTENT_LEFT - 70,
      ellipsis: true,
    });
    if (event.location) {
      draw.drawText(c, fonts.sans12, event.location, CONTENT_LEFT + 70, y + 17, {
        maxWidth: CONTENT_RIGHT - CONTENT_LEFT - 70,
        ellipsis: true,
      });
    }
    if (index < rows.length - 1)
      draw.drawRule(c, CONTENT_LEFT + 70, y + 31, CONTENT_RIGHT - CONTENT_LEFT - 70, 'dashed');
  }
}

function overlapsRenderedDay(
  start: string,
  end: string,
  allDay: boolean,
  renderedAt: Date,
  timezone: string
): boolean {
  const parts = datePartsInTz(renderedAt, timezone);
  const targetKey =
    `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;

  if (allDay) return start <= targetKey && targetKey < end;

  const dayStart = utcFromWallTimeInTz(
    { year: parts.year, month: parts.month, day: parts.day },
    timezone
  );
  const nextDay = utcFromWallTimeInTz(
    { year: parts.year, month: parts.month, day: parts.day + 1 },
    timezone
  );
  if (!dayStart || !nextDay) return false;

  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  return Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < nextDay.getTime() && endMs > dayStart.getTime();
}
