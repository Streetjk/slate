import { describe, expect, it } from 'bun:test';
import { chartCoordinates, formatBtcPrice } from './btc-price-frame-renderer';

describe('BTC frame helpers', () => {
  it('keeps chart coordinates inside their bounds for flat and volatile series', () => {
    const points = [
      { timestamp: '2026-05-17T00:00:00.000Z', priceUsd: 70000 },
      { timestamp: '2026-05-17T01:00:00.000Z', priceUsd: 71000 },
      { timestamp: '2026-05-17T02:00:00.000Z', priceUsd: 69000 },
    ];
    const coordinates = chartCoordinates(points, { x: 20, y: 160, w: 360, h: 92 });
    expect(coordinates).toHaveLength(3);
    for (const point of coordinates) {
      expect(point.x).toBeGreaterThanOrEqual(20);
      expect(point.x).toBeLessThanOrEqual(379);
      expect(point.y).toBeGreaterThanOrEqual(160);
      expect(point.y).toBeLessThanOrEqual(251);
    }
    expect(chartCoordinates([points[0]!], { x: 20, y: 160, w: 360, h: 92 })).toEqual([
      { x: 20, y: 251 },
    ]);
  });

  it('formats USD values for a compact e-paper display', () => {
    expect(formatBtcPrice(70000)).toBe('$70,000.00');
    expect(formatBtcPrice(0)).toBe('$0.00');
  });
});
