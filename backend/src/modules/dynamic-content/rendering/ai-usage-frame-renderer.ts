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

const PROVIDER_LABELS = ['Codex', 'Grok', 'AGY / Gemini', 'Z.ai'];

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
  const rowTop = CONTENT_SAFE_TOP + 6;
  const rowHeight = 61;
  for (let index = 0; index < 4; index++) {
    const row = rawProviders[index] ?? {};
    const y = rowTop + index * rowHeight;
    const label = pickText(row.label, PROVIDER_LABELS[index] ?? 'Provider');
    const status = pickText(row.status, 'unknown');
    const statusLabel =
      status === 'connected' ? 'Connected' : status === 'sign_in' ? 'Sign in' : 'Unknown';
    const quotaWindows = Array.isArray(row.quotaWindows) ? row.quotaWindows.filter(isRecord) : [];
    const primary = quotaWindows[0] ?? null;
    const secondary = quotaWindows[1] ?? null;
    const usedPercent = primary ? numberPercent(primary.usedPercent) : null;

    draw.drawStrongText(c, fonts.sans16, label, CONTENT_LEFT, y, {
      maxWidth: 170,
      ellipsis: true,
    });
    draw.drawText(c, fonts.metric12, statusLabel, CONTENT_RIGHT, y + 2, {
      align: 'right',
      maxWidth: 90,
      ellipsis: true,
    });

    if (primary && usedPercent !== null) {
      const primaryLabel = pickText(primary.label, 'Quota');
      const secondaryPercent = secondary ? numberPercent(secondary.usedPercent) : null;

      if (secondary && secondaryPercent !== null) {
        drawCompactQuotaWindow(
          c,
          fonts,
          draw,
          y + 21,
          primaryLabel,
          usedPercent,
          pickText(primary.resetLabel, ''),
          CONTENT_LEFT,
          CONTENT_RIGHT
        );
        drawCompactQuotaWindow(
          c,
          fonts,
          draw,
          y + 40,
          pickText(secondary.label, 'wk'),
          secondaryPercent,
          pickText(secondary.resetLabel, ''),
          CONTENT_LEFT,
          CONTENT_RIGHT
        );
      } else {
        const barX = CONTENT_LEFT;
        const barY = y + 23;
        const barW = 292;
        const barH = 12;
        c.strokeRect(barX, barY, barW, barH);
        const innerW = Math.max(0, barW - 4);
        const fillW = Math.round((innerW * usedPercent) / 100);
        if (fillW > 0) c.fillRect(barX + 2, barY + 2, fillW, barH - 4);

        draw.drawStrongText(c, fonts.sans16, String(usedPercent) + '%', CONTENT_RIGHT, y + 19, {
          align: 'right',
          maxWidth: 54,
          ellipsis: true,
        });

        const resetLabel = pickText(primary.resetLabel, '');
        const displayPrimaryLabel = shortQuotaLabel(primaryLabel);
        const detail = resetLabel
          ? displayPrimaryLabel + ' · reset ' + resetLabel
          : displayPrimaryLabel + ' used';
        draw.drawText(c, fonts.metric12, detail, CONTENT_LEFT, y + 41, {
          maxWidth: CONTENT_WIDTH,
          ellipsis: true,
        });
      }
    } else {
      const version = pickText(row.version, 'Unavailable');
      draw.drawText(c, fonts.sans16, 'Quota unavailable', CONTENT_LEFT, y + 20, {
        maxWidth: 145,
        ellipsis: true,
      });
      draw.drawText(c, fonts.metric12, version, CONTENT_RIGHT, y + 22, {
        align: 'right',
        maxWidth: 205,
        ellipsis: true,
      });
    }

    if (index < 3) draw.drawRule(c, CONTENT_LEFT, y + 55, CONTENT_WIDTH, 'dashed');
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

function numberPercent(value: unknown): number | null {
  const number =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(number) && number >= 0 && number <= 100 ? Math.round(number) : null;
}

function drawCompactQuotaWindow(
  c: BitmapCanvas,
  fonts: FontSet,
  draw: FrameDrawKit,
  y: number,
  label: string,
  usedPercent: number,
  resetLabel: string,
  left: number,
  right: number
): void {
  const compactReset = shortResetLabel(resetLabel);
  const barX = left + 30;
  const rightTextW = 128;
  const barW = Math.max(80, right - barX - rightTextW - 6);
  const barH = 8;
  draw.drawText(c, fonts.metric12, shortQuotaLabel(label), left, y, {
    maxWidth: 26,
    ellipsis: true,
  });
  c.strokeRect(barX, y + 2, barW, barH);
  const innerW = Math.max(0, barW - 4);
  const fillW = Math.round((innerW * usedPercent) / 100);
  if (fillW > 0) c.fillRect(barX + 2, y + 4, fillW, barH - 4);

  const rightText = compactReset
    ? String(usedPercent) + '% · ' + compactReset
    : String(usedPercent) + '%';
  draw.drawStrongText(c, fonts.metric12, rightText, right, y, {
    align: 'right',
    maxWidth: rightTextW,
    ellipsis: true,
  });
}

function shortQuotaLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('5h')) return '5h';
  if (normalized.includes('week')) return 'wk';
  return value.slice(0, 8);
}

function shortResetLabel(value: string): string {
  const text = value.trim();
  if (!text) return '';

  const match = text.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );
  if (!match) return text.replace(/\s+at\s+/i, ' ').slice(0, 13);

  const months: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  const month = months[match[1]!.toLowerCase()];
  if (!month) return text.slice(0, 13);

  return `${Number(match[2])}/${month} ${Number(match[3])}:${match[4]}${match[5]![0]!.toLowerCase()}`;
}
