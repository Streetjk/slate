import { describe, expect, it } from 'bun:test';
import { FRAME_BYTES } from 'shared';
import { canReuseDynamicData } from './dynamic-data-reuse-policy';

const recentBtc = {
  symbol: 'BTC/USD',
  period: 'daily',
  points: [{ timestamp: '2026-09-01T00:00:00.000Z', priceUsd: 100_000 }],
  fetchedAt: '2026-09-01T00:00:00.000Z',
  currentPriceUsd: 100_000,
};

describe('dynamic BTC reuse policy', () => {
  it('accepts recent persisted data within the configured reuse window', () => {
    expect(
      canReuseDynamicData(
        'btc_price',
        recentBtc,
        FRAME_BYTES,
        { type: 'btc_price', refresh_interval_sec: 600 },
        new Date('2026-09-01T00:10:00.000Z')
      )
    ).toBe(true);
  });

  it('rejects expired persisted data after an upstream failure', () => {
    expect(
      canReuseDynamicData(
        'btc_price',
        recentBtc,
        FRAME_BYTES,
        { type: 'btc_price', refresh_interval_sec: 600 },
        new Date('2026-09-02T00:00:01.000Z')
      )
    ).toBe(false);
  });
});
