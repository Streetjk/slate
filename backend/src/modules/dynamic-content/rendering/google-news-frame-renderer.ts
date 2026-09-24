import { FRAME_WIDTH } from 'shared';
import { BitmapCanvas } from './bitmap-canvas';
import type { DynamicRenderContext } from './dynamic-render-context';
import type { FrameDrawKit } from './frame-draw-kit';
import { CONTENT_LEFT, CONTENT_RIGHT, CONTENT_WIDTH, STATUS_BAR_H } from './frame-renderer-layout';
import type { FontSet } from './fonts/dynamic-frame-font.service';
import { isRecord, pickText } from './helpers/frame-value-utils';

export function renderGoogleNewsFrame(
  c: BitmapCanvas,
  fonts: FontSet,
  ctx: DynamicRenderContext,
  draw: FrameDrawKit
): void {
  const data = ctx.data ?? {};
  const sections = Array.isArray(data.sections) ? data.sections.filter(isRecord) : [];
  const pageIndex = Math.max(0, Math.min(5, Number(ctx.config.page_index ?? 0) || 0));

  if (sections.length === 0) {
    draw.drawText(c, fonts.sans16, 'No news data', FRAME_WIDTH / 2, 142, {
      align: 'center',
      maxWidth: CONTENT_WIDTH,
    });
    return;
  }

  const au = sections.find((section) => section.edition === 'au');
  const tw = sections.find((section) => section.edition === 'tw');
  const pageLabel = `${pageIndex + 1}/6`;
  draw.drawText(c, fonts.metric12, pageLabel, CONTENT_RIGHT, STATUS_BAR_H + 7, {
    align: 'right',
    maxWidth: 42,
  });

  if (au && tw) {
    drawNewsBlock(c, fonts, draw, au, pageIndex, 'ENGLISH · AU', STATUS_BAR_H + 11, 116);
    draw.drawRule(c, CONTENT_LEFT, STATUS_BAR_H + 139, CONTENT_WIDTH, 'dashed');
    drawNewsBlock(c, fonts, draw, tw, pageIndex, 'TAIWAN · 繁中', STATUS_BAR_H + 150, 116);
    return;
  }

  const only = au ?? tw ?? sections[0]!;
  drawNewsBlock(
    c,
    fonts,
    draw,
    only,
    pageIndex,
    only.edition === 'tw' ? 'TAIWAN · 繁中' : 'ENGLISH · AU',
    STATUS_BAR_H + 28,
    220
  );
}

function drawNewsBlock(
  c: BitmapCanvas,
  fonts: FontSet,
  draw: FrameDrawKit,
  section: Record<string, unknown>,
  pageIndex: number,
  label: string,
  top: number,
  height: number
): void {
  const items = Array.isArray(section.items) ? section.items.filter(isRecord) : [];
  const item = items[pageIndex];
  draw.drawStrongText(c, fonts.sans16, label, CONTENT_LEFT, top, {
    maxWidth: CONTENT_WIDTH - 48,
    ellipsis: true,
  });

  if (!item) {
    draw.drawText(c, fonts.sans16, 'No story in this position', CONTENT_LEFT, top + 36, {
      maxWidth: CONTENT_WIDTH,
      maxLines: 2,
    });
    return;
  }

  const title = pickText(item.title, 'Untitled story');
  const source = pickText(item.source, 'Google News');
  const titleTop = top + 28;
  draw.drawText(c, fonts.sans16, title, CONTENT_LEFT, titleTop, {
    maxWidth: CONTENT_WIDTH,
    maxLines: height >= 200 ? 7 : 4,
    ellipsis: true,
    lineGap: 3,
  });
  draw.drawText(c, fonts.metric12, source, CONTENT_LEFT, top + height - 13, {
    maxWidth: CONTENT_WIDTH,
    ellipsis: true,
  });
}
