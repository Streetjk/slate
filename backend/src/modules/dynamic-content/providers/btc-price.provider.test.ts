import { afterEach, describe, expect, it } from 'bun:test';
import {
  BtcPriceProvider,
  normalizeCoinbaseCandles,
  parseCoinbaseAmount,
} from './btc-price.provider';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('normalizeCoinbaseCandles', () => {
  it('filters malformed rows, sorts points, and removes duplicate timestamps', () => {
    expect(
      normalizeCoinbaseCandles([
        [1710000000, '1', '2', '1.5', '10', 'ignored'],
        ['bad', 1, 2, 3, 4],
        [1710000060, 1, 2, 3, '11'],
        [1710000000, 1, 2, 3, '12'],
        [1710000120, 1, 2, 3, '-1'],
      ])
    ).toEqual([
      { timestamp: '2024-03-09T16:00:00.000Z', priceUsd: 12 },
      { timestamp: '2024-03-09T16:01:00.000Z', priceUsd: 11 },
    ]);
  });
});

describe('BtcPriceProvider', () => {
  it('fetches spot and period candles, then caches the normalized series', async () => {
    const requests: string[] = [];
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      requests.push(String(input));
      if (String(input).includes('/spot')) {
        return Response.json({ data: { amount: '70000.12', base: 'BTC', currency: 'USD' } });
      }
      return Response.json([
        [1710000000, '69000', '69100', '69050', '69080'],
        [1710003600, '69900', '70000', '69900', '70000'],
      ]);
    }) as unknown as typeof fetch;

    const provider = new BtcPriceProvider();
    const config = provider.validateConfig({
      type: 'btc_price',
      period: 'weekly',
      refresh_interval_sec: 600,
    });
    const ctx = { now: new Date('2026-05-18T00:00:00.000Z') };
    const first = await provider.fetchData(config, ctx);
    const second = await provider.fetchData(config, {
      ...ctx,
      now: new Date(ctx.now.getTime() + 1000),
    });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      symbol: 'BTC/USD',
      period: 'weekly',
      currentPriceUsd: 70000.12,
    });
    expect(first.points).toHaveLength(2);
    expect(first.changePercent).toBeCloseTo(1.332, 3);
    expect(requests).toHaveLength(2);
    expect(requests.some((url) => url.includes('granularity=3600'))).toBe(true);
    expect(requests.some((url) => url.includes('start=') && url.includes('end='))).toBe(true);
  });

  it('caps the monthly series at the most recent 30 daily points', async () => {
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      if (String(input).includes('/spot')) {
        return Response.json({ data: { amount: '70000' } });
      }
      return Response.json(
        Array.from({ length: 35 }, (_, index) => [
          1710000000 + index * 86400,
          1,
          2,
          1,
          69000 + index,
        ])
      );
    }) as unknown as typeof fetch;
    const provider = new BtcPriceProvider();
    const config = provider.validateConfig({ type: 'btc_price', period: 'monthly' });

    const result = await provider.fetchData(config, {
      now: new Date('2026-05-18T00:00:00.000Z'),
    });

    expect(result.points).toHaveLength(30);
    expect(result.points[0]!.priceUsd).toBe(69005);
    expect(result.points.at(-1)!.priceUsd).toBe(69034);
  });

  it('uses a matching previous series when the public endpoint fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network timeout');
    }) as unknown as typeof fetch;
    const provider = new BtcPriceProvider();
    const config = provider.validateConfig({ type: 'btc_price', period: 'daily' });
    const cached = {
      symbol: 'BTC/USD',
      period: 'daily',
      points: [{ timestamp: '2026-05-17T00:00:00.000Z', priceUsd: 69000 }],
      fetchedAt: '2026-05-17T00:00:00.000Z',
      currentPriceUsd: 69000,
      changePercent: 0,
    };

    await expect(
      provider.fetchData(config, {
        now: new Date('2026-05-18T00:00:00.000Z'),
        lastData: cached,
      })
    ).resolves.toEqual(cached);
  });

  it('rejects invalid spot prices instead of rendering fabricated values', () => {
    expect(parseCoinbaseAmount('not-a-price')).toBeNull();
    expect(parseCoinbaseAmount(-1)).toBeNull();
    expect(parseCoinbaseAmount('70000.12')).toBe(70000.12);
  });
});
