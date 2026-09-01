import type { CreateDynamicContentRequestT, PricePeriodT } from 'shared';

export const BTC_TRIO_PERIODS: readonly PricePeriodT[] = ['daily', 'weekly', 'monthly'];

const LABEL_BY_PERIOD: Record<PricePeriodT, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function createBtcTrioRequests(refreshIntervalSec = 600): CreateDynamicContentRequestT[] {
  return BTC_TRIO_PERIODS.map((period) => ({
    kind: 'dynamic',
    frame_name: `BTC/USD · ${LABEL_BY_PERIOD[period]}`,
    config: {
      type: 'btc_price',
      period,
      refresh_interval_sec: refreshIntervalSec,
    },
  }));
}
