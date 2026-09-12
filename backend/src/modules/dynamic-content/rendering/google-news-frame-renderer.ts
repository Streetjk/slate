import { FRAME_WIDTH } from 'shared';
import { BitmapCanvas } from './bitmap-canvas';
import type { DynamicRenderContext } from './dynamic-render-context';
import type { FrameDrawKit } from './frame-draw-kit';
import { CONTENT_LEFT, CONTENT_WIDTH, STATUS_BAR_H } from './frame-renderer-layout';
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
  if (sections.length === 0) {
    draw.drawText(c, fonts.sans16, 'No news data', FRAME_WIDTH / 2, 142, {
      align: 'center',
      maxWidth: CONTENT_WIDTH,
    });
    return;
  }
  const both = sections.length > 1;
  const sectionWidth = both ? Math.floor(CONTENT_WIDTH / 2) - 8 : CONTENT_WIDTH;
  const sectionHeight = both ? 250 : 270;
  sections.slice(0, 2).forEach((section, sectionIndex) => {
    const x = both ? CONTENT_LEFT + sectionIndex * (sectionWidth + 16) : CONTENT_LEFT;
    if (both && sectionIndex > 0) c.drawVLine(x - 8, STATUS_BAR_H + 6, sectionHeight, 0);
    const label = pickText(section.label, section.edition === 'tw' ? 'TW' : 'AU');
    draw.drawText(c, fonts.sans16, label, x, STATUS_BAR_H + 12, {
      maxWidth: sectionWidth,
    });
    const items = Array.isArray(section.items) ? section.items.filter(isRecord).slice(0, 3) : [];
    items.forEach((item, index) => {
      const y = STATUS_BAR_H + 42 + index * (both ? 67 : 70);
      const title = pickText(item.title, 'Untitled story');
      const source = pickText(item.source, 'Google News');
      draw.drawText(c, fonts.sans16, title, x, y, {
        maxWidth: sectionWidth,
        maxLines: both ? 2 : 2,
        ellipsis: true,
        lineGap: 2,
      });
      draw.drawText(c, fonts.metric12, source, x, y + 35, {
        maxWidth: sectionWidth,
        ellipsis: true,
      });
      if (index < items.length - 1) {
        draw.drawRule(c, x, y + 57, sectionWidth, 'dashed');
      }
    });
  });
}
