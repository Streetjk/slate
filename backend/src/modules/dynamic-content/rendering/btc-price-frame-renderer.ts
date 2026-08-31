import { PriceSeries, type PricePointT, type PriceSeriesT } from 'shared';
import { getDateTimeFormat } from '../../../common/utils/intl';
import { BitmapCanvas } from './bitmap-canvas';
import type { DynamicRenderContext } from './dynamic-render-context';
import type { FrameDrawKit } from './frame-draw-kit';
import { CONTENT_LEFT, CONTENT_RIGHT, CONTENT_WIDTH, STATUS_BAR_H } from './frame-renderer-layout';
import type { FontSet } from './fonts/dynamic-frame-font.service';

const CHART_TOP = 160;
const CHART_HEIGHT = 92;
const CHART_BOTTOM = CHART_TOP + CHART_HEIGHT;

export function renderBtcPriceFrame(
  c: BitmapCanvas,
  fonts: FontSet,
  ctx: DynamicRenderContext,
  draw: FrameDrawKit
): void {
  const parsed = PriceSeries.safeParse(ctx.data);
  if (!parsed.success || parsed.data.symbol !== 'BTC/USD') {
    draw.drawText(c, fonts.sans16, 'No BTC/USD data', CONTENT_LEFT, 145, {
      maxWidth: CONTENT_WIDTH,
      ellipsis: true,
    });
    return;
  }

  const series = parsed.data;
  draw.drawText(c, fonts.sans16, 'BTC/USD', CONTENT_LEFT, STATUS_BAR_H + 18, {
    maxWidth: 150,
  });
  draw.drawBadge(
    c,
    fonts,
    periodLabel(series.period),
    CONTENT_RIGHT - 58,
    STATUS_BAR_H + 4,
    58,
    24,
    false
  );

  const current = series.currentPriceUsd ?? latestPoint(series.points)?.priceUsd;
  if (current === undefined) {
    draw.drawText(c, fonts.sans16, 'No current price', CONTENT_LEFT, 100, {
      maxWidth: CONTENT_WIDTH,
    });
  } else {
    draw.drawStrongText(c, fonts.sans16, formatBtcPrice(current), CONTENT_LEFT, 72, {
      maxWidth: 220,
      ellipsis: true,
    });
    if (series.changePercent !== undefined) {
      draw.drawText(c, fonts.sans12, formatChange(series.changePercent), CONTENT_RIGHT, 112, {
        align: 'right',
        maxWidth: 100,
      });
    }
  }

  draw.drawRule(c, CONTENT_LEFT, 136, CONTENT_WIDTH, 'solid');
  const chart = chartCoordinates(series.points, {
    x: CONTENT_LEFT,
    y: CHART_TOP,
    w: CONTENT_WIDTH,
    h: CHART_HEIGHT,
  });
  for (let index = 1; index < chart.length; index++) {
    const previous = chart[index - 1]!;
    const point = chart[index]!;
    c.drawLine(previous.x, previous.y, point.x, point.y);
  }
  draw.drawText(c, fonts.metric12, periodDateLabel(series), CONTENT_LEFT, CHART_BOTTOM + 22, {
    maxWidth: CONTENT_WIDTH,
    ellipsis: true,
  });
}

export function chartCoordinates(
  points: PricePointT[],
  bounds: { x: number; y: number; w: number; h: number }
): Array<{ x: number; y: number }> {
  if (points.length === 0 || bounds.w <= 0 || bounds.h <= 0) return [];
  const values = points.map((point) => point.priceUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const maxX = bounds.x + Math.max(0, bounds.w - 1);
  const maxY = bounds.y + Math.max(0, bounds.h - 1);
  return points.map((_, index) => ({
    x: clamp(
      bounds.x + Math.round(((maxX - bounds.x) * index) / Math.max(1, points.length - 1)),
      bounds.x,
      maxX
    ),
    y: clamp(
      maxY - Math.round(((maxY - bounds.y) * (values[index]! - min)) / range),
      bounds.y,
      maxY
    ),
  }));
}

export function formatBtcPrice(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatChange(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function periodLabel(period: PriceSeriesT['period']): string {
  return period === 'daily' ? '1D' : period === 'weekly' ? '7D' : '30D';
}

function periodDateLabel(series: PriceSeriesT): string {
  const first = series.points[0]?.timestamp;
  const last = series.points.at(-1)?.timestamp;
  if (!first || !last) return 'No historical points';
  const formatter = getDateTimeFormat('en-AU', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${formatter.format(new Date(first))} – ${formatter.format(new Date(last))}`;
}

function latestPoint(points: PricePointT[]): PricePointT | undefined {
  return points.at(-1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
