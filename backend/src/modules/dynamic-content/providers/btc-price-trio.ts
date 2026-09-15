import { BtcPriceConfig } from 'shared';
import type { CreateDynamicContentRequestT } from 'shared';

export function createBtcWeeklyRequest(refreshIntervalSec = 600): CreateDynamicContentRequestT {
  return {
    kind: 'dynamic',
    frame_name: 'BTC/USD · Weekly',
    config: {
      type: 'btc_price',
      period: 'weekly',
      refresh_interval_sec: refreshIntervalSec,
    },
  };
}

export interface BtcWeeklyConsolidationRecord {
  id: string;
  dynamicConfig: unknown;
}

export interface BtcWeeklyConsolidationPlan {
  keepId: string | null;
  removeIds: string[];
}

export function planBtcWeeklyConsolidation(
  records: readonly BtcWeeklyConsolidationRecord[]
): BtcWeeklyConsolidationPlan {
  const parsedRecords = records.map((record) => ({
    id: record.id,
    config: BtcPriceConfig.safeParse(record.dynamicConfig),
  }));
  const keepId =
    parsedRecords.find((record) => record.config.success && record.config.data.period === 'weekly')
      ?.id ?? null;
  const removeIds = parsedRecords
    .filter((record) => {
      if (!record.config.success) return false;
      if (record.config.data.period !== 'weekly') return true;
      return keepId !== null && record.id !== keepId;
    })
    .map((record) => record.id);
  return { keepId, removeIds };
}
