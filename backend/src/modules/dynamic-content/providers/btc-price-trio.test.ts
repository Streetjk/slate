import { describe, expect, it } from 'bun:test';
import { createBtcTrioRequests } from './btc-price-trio';

describe('BTC trio provisioning', () => {
  it('creates one cached dynamic content request for each supported period', () => {
    expect(createBtcTrioRequests()).toEqual([
      {
        kind: 'dynamic',
        frame_name: 'BTC/USD · Daily',
        config: { type: 'btc_price', period: 'daily', refresh_interval_sec: 600 },
      },
      {
        kind: 'dynamic',
        frame_name: 'BTC/USD · Weekly',
        config: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
      },
      {
        kind: 'dynamic',
        frame_name: 'BTC/USD · Monthly',
        config: { type: 'btc_price', period: 'monthly', refresh_interval_sec: 600 },
      },
    ]);
  });

  it('applies the configured backend refresh interval to every view', () => {
    const requests = createBtcTrioRequests(900);
    expect(requests).toHaveLength(3);
    expect(requests.map((request) => request.config)).toEqual([
      { type: 'btc_price', period: 'daily', refresh_interval_sec: 900 },
      { type: 'btc_price', period: 'weekly', refresh_interval_sec: 900 },
      { type: 'btc_price', period: 'monthly', refresh_interval_sec: 900 },
    ]);
  });
});
