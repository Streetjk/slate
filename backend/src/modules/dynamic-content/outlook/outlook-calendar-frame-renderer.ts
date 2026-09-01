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
      .filter((event) => event.allDay || Date.parse(event.end) > ctx.renderedAt.getTime())
      .sort((a, b) => a.start.localeCompare(b.start)) ?? [];
  if (events.length === 0) {
    draw.drawText(
      c,
      fonts.sans16,
      data?.connected === false ? 'Connect Outlook to sync' : 'No events',
      FRAME_WIDTH / 2,
      126,
      {
        align: 'center',
        maxWidth: 340,
        ellipsis: true,
      }
    );
    return;
  }

  const rows = events.slice(0, 5);
  const rowY = STATUS_BAR_H + 60;
  for (const [index, event] of rows.entries()) {
    const y = rowY + index * 34;
    draw.drawText(
      c,
      fonts.metric12,
      formatOutlookTime(event.start, timezone, event.allDay),
      CONTENT_LEFT,
      y + 3,
      {
        maxWidth: 62,
      }
    );
    draw.drawText(c, fonts.sans16, event.title, CONTENT_LEFT + 76, y, {
      maxWidth: CONTENT_RIGHT - CONTENT_LEFT - 76,
      ellipsis: true,
    });
  }

  const next = rows[0];
  if (next) {
    draw.drawRule(c, CONTENT_LEFT, 251, FRAME_WIDTH - 2 * CONTENT_LEFT, 'dashed');
    draw.drawText(c, fonts.sans12, 'NEXT', CONTENT_LEFT, 262, { maxWidth: 52 });
    draw.drawText(
      c,
      fonts.sans12,
      `${next.title} — ${formatOutlookTime(next.start, timezone, next.allDay)}`,
      CONTENT_LEFT + 48,
      262,
      {
        maxWidth: CONTENT_RIGHT - CONTENT_LEFT - 48,
        ellipsis: true,
      }
    );
  }
}
