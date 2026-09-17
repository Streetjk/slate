import { describe, expect, it } from 'bun:test';
import { createBtcWeeklyRequest, planBtcWeeklyConsolidation } from './btc-price-trio';

describe('BTC weekly provisioning', () => {
  it('creates exactly one cached weekly dynamic content request', () => {
    const requests = [createBtcWeeklyRequest()];
    expect(requests).toHaveLength(1);
    expect(requests[0]).toEqual({
      kind: 'dynamic',
      frame_name: 'BTC/USD · Weekly',
      config: { type: 'btc_price', period: 'weekly', refresh_interval_sec: 600 },
    });
  });

  it('keeps the first valid weekly record and targets only legacy or duplicate valid BTC tiles', () => {
    const weekly = { id: 'weekly-1', dynamicConfig: { type: 'btc_price', period: 'weekly' } };
    expect(
      planBtcWeeklyConsolidation([
        { id: 'daily', dynamicConfig: { type: 'btc_price', period: 'daily' } },
        weekly,
        { id: 'monthly', dynamicConfig: { type: 'btc_price', period: 'monthly' } },
        { id: 'weekly-2', dynamicConfig: { type: 'btc_price', period: 'weekly' } },
      ])
    ).toEqual({ keepId: 'weekly-1', removeIds: ['daily', 'monthly', 'weekly-2'] });
  });

  it('preserves malformed BTC configuration for explicit owner repair', () => {
    expect(
      planBtcWeeklyConsolidation([
        { id: 'invalid', dynamicConfig: { type: 'btc_price', period: 'nope' } },
      ])
    ).toEqual({ keepId: null, removeIds: [] });
  });

  it('does not request a provider during deterministic request planning', () => {
    expect(createBtcWeeklyRequest().config).toEqual({
      type: 'btc_price',
      period: 'weekly',
      refresh_interval_sec: 600,
    });
  });
});
