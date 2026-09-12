import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';
import { FRAME_BYTES, FRAME_HEIGHT, FRAME_WIDTH } from 'shared';
import { BITMAP_1BPP_FONT_DIR } from '../../../infra/assets/asset-paths';
import {
  DynamicFrameRendererService,
  type DynamicRenderContext,
} from './dynamic-frame-renderer.service';
import { DynamicFrameFontService } from './fonts/dynamic-frame-font.service';
import { loadBitmapFont, textWidth, type BitmapFont } from './fonts/bitmap-font';

const renderer = new DynamicFrameRendererService(new DynamicFrameFontService());

describe('Calendar frame rendering (English en-AU Perth)', () => {
  it('renders daily calendar with Perth English weekday and WA public holiday', async () => {
    const ctx: DynamicRenderContext = {
      type: 'daily_calendar',
      frameName: 'Calendar',
      config: { type: 'daily_calendar', tz: 'Australia/Perth' },
      data: {
        year: '2026',
        month: '9',
        day: '28',
        weekday: 'Monday',
        publicHoliday: "King's Birthday",
      },
      renderedAt: new Date('2026-09-28T02:00:00.000Z'),
    };

    const frame = await renderer.render(ctx);
    expect(frame.length).toBe(FRAME_BYTES);

    const font = await loadTestFont('source-han-sans-16-slim.json');
    // Verifies English weekday is rendered
    expect(hasTextPixels(frame, font, 'Monday', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
    // Verifies WA public holiday is rendered
    expect(hasTextPixels(frame, font, "King's Birthday", 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(
      true
    );
    // Verifies English section header word
    expect(hasTextPixels(frame, font, 'Public', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
  });

  it('renders daily calendar on a regular day with Perth calendar subtitle and no Chinese labels', async () => {
    const ctx: DynamicRenderContext = {
      type: 'daily_calendar',
      frameName: 'Calendar',
      config: { type: 'daily_calendar', tz: 'Australia/Perth' },
      data: {
        year: '2026',
        month: '9',
        day: '1',
        weekday: 'Tuesday',
        publicHoliday: null,
      },
      renderedAt: new Date('2026-09-01T02:00:00.000Z'),
    };

    const frame = await renderer.render(ctx);
    expect(frame.length).toBe(FRAME_BYTES);

    const font = await loadTestFont('source-han-sans-16-slim.json');
    expect(hasTextPixels(frame, font, 'Tuesday', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
    expect(hasTextPixels(frame, font, 'Perth', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
    // Verifies Chinese solar term / ganzhi labels are NOT present
    expect(hasTextPixels(frame, font, '今日节气', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(false);
    expect(hasTextPixels(frame, font, '宜', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(false);
  });

  it('renders monthly calendar with English weekday headers and WA public holiday in cell', async () => {
    const ctx: DynamicRenderContext = {
      type: 'month_calendar',
      frameName: 'Monthly calendar',
      config: { type: 'month_calendar', tz: 'Australia/Perth' },
      data: {
        calendar: {
          months: {
            '2026-09': {
              days: {
                '2026-09-28': { public_holiday: "King's Birthday" },
              },
            },
          },
        },
      },
      renderedAt: new Date('2026-09-28T02:00:00.000Z'),
    };

    const frame = await renderer.render(ctx);
    expect(frame.length).toBe(FRAME_BYTES);

    const font16 = await loadTestFont('source-han-sans-16-slim.json');
    // Header contains English weekday abbreviations
    expect(hasTextPixels(frame, font16, 'Sun', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
    expect(hasTextPixels(frame, font16, 'Mon', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
    // Chinese weekday header should NOT be present
    expect(hasTextPixels(frame, font16, '日', 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(false);

    // Holiday subtitle in calendarSub10 font
    const font10 = await loadTestFont('fusion-pixel-10.json');
    expect(hasTextPixels(frame, font10, "King's", 0, 0, FRAME_WIDTH, FRAME_HEIGHT)).toBe(true);
  });
});

function loadTestFont(file: string): Promise<BitmapFont> {
  return loadBitmapFont(join(BITMAP_1BPP_FONT_DIR, file));
}

function hasTextPixels(
  frame: Buffer,
  font: BitmapFont,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number
): boolean {
  const target = renderTextMask(font, text);
  for (let yy = y; yy <= y + h - font.lineHeight; yy++) {
    for (let xx = x; xx <= x + w - target.width; xx++) {
      if (matchesTextMask(frame, target, xx, yy)) return true;
    }
  }
  return false;
}

function renderTextMask(
  font: BitmapFont,
  text: string
): { width: number; height: number; pixels: Uint8Array } {
  const width = textWidth(font, text);
  const height = font.lineHeight;
  const pixels = new Uint8Array(width * height);
  let penX = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const glyph = font.glyphs.get(cp);
    if (!glyph) continue;
    const baselineY = font.lineHeight - font.baseLine;
    const startX = penX + glyph.ofs_x;
    const startY = baselineY - glyph.ofs_y - glyph.box_h;
    let bit = glyph.bitmap_index * 8;
    for (let yy = 0; yy < glyph.box_h; yy++) {
      for (let xx = 0; xx < glyph.box_w; xx++) {
        const byte = font.bitmap[bit >> 3] ?? 0;
        const on = (byte & (0x80 >> (bit & 7))) !== 0;
        if (on) {
          const px = startX + xx;
          const py = startY + yy;
          if (px >= 0 && py >= 0 && px < width && py < height) pixels[py * width + px] = 1;
        }
        bit++;
      }
    }
    penX += Math.round(glyph.adv_w / 16);
  }
  return { width, height, pixels };
}

function matchesTextMask(
  frame: Buffer,
  target: { width: number; height: number; pixels: Uint8Array },
  x: number,
  y: number
): boolean {
  for (let yy = 0; yy < target.height; yy++) {
    for (let xx = 0; xx < target.width; xx++) {
      if (!target.pixels[yy * target.width + xx]) continue;
      if (!isBlack(frame, x + xx, y + yy)) return false;
    }
  }
  return true;
}

function isBlack(frame: Buffer, x: number, y: number): boolean {
  if (x < 0 || x >= FRAME_WIDTH || y < 0 || y >= FRAME_HEIGHT) return false;
  const bpr = FRAME_WIDTH >> 3;
  const byte = frame[y * bpr + (x >> 3)]!;
  return ((byte >> (7 - (x & 7))) & 1) === 0;
}
