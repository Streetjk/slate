import { FRAME_WIDTH } from 'shared';
import { BitmapCanvas } from './bitmap-canvas';
import type { DynamicRenderContext } from './dynamic-render-context';
import type { FrameDrawKit } from './frame-draw-kit';
import {
  CONTENT_LEFT,
  CONTENT_RIGHT,
  CONTENT_SAFE_TOP,
  CONTENT_WIDTH,
} from './frame-renderer-layout';
import type { FontSet } from './fonts/dynamic-frame-font.service';
import { formatShortTime } from './helpers/frame-date-utils';
import { isRecord, pickText } from './helpers/frame-value-utils';

const PROVIDER_LABELS = ['Codex', 'AGY / Gemini', 'Claude', 'Grok'];

export function renderAiUsageFrame(
  c: BitmapCanvas,
  fonts: FontSet,
  ctx: DynamicRenderContext,
  draw: FrameDrawKit
): void {
  const data = ctx.data ?? {};
  const rawProviders = Array.isArray(data.providers)
    ? data.providers.filter(isRecord).slice(0, 4)
    : [];
  const top = CONTENT_SAFE_TOP + 8;

  draw.drawStrongText(c, fonts.sans16, 'AI Usage', FRAME_WIDTH / 2, top, {
    align: 'center',
    maxWidth: CONTENT_WIDTH,
  });
  draw.drawRule(c, CONTENT_LEFT, top + 24, CONTENT_WIDTH, 'dashed');

  for (let index = 0; index < 4; index++) {
    const row = rawProviders[index] ?? {};
    const y = top + 38 + index * 49;
    const label = pickText(row.label, PROVIDER_LABELS[index] ?? 'Provider');
    const status = pickText(row.status, 'unknown');
    const version = pickText(row.version, 'Unavailable');
    const statusLabel =
      status === 'connected' ? 'Connected' : status === 'sign_in' ? 'Sign in' : 'Unknown';

    draw.drawStrongText(c, fonts.sans16, label, CONTENT_LEFT, y, {
      maxWidth: 155,
      ellipsis: true,
    });
    draw.drawText(c, fonts.sans16, statusLabel, CONTENT_RIGHT, y, {
      align: 'right',
      maxWidth: 100,
      ellipsis: true,
    });
    draw.drawText(c, fonts.metric12, version, CONTENT_LEFT, y + 20, {
      maxWidth: CONTENT_WIDTH,
      ellipsis: true,
    });
    if (index < 3) draw.drawRule(c, CONTENT_LEFT, y + 40, CONTENT_WIDTH, 'dashed');
  }

  const updated = formatShortTime(data.updatedAt, ctx.renderedAt, 'Australia/Perth');
  draw.drawText(
    c,
    fonts.metric12,
    updated ? 'Updated ' + updated : 'Updated --',
    FRAME_WIDTH / 2,
    282,
    {
      align: 'center',
      maxWidth: CONTENT_WIDTH,
      ellipsis: true,
    }
  );
}
