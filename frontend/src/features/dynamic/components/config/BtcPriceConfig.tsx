import { PricePeriod, type DynamicConfigT, type PricePeriodT } from 'shared';
import { Select, SelectItem } from '@/components/ui/Select';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';
import { createSafeParseGuard } from '@/features/dynamic/lib/zod-utils';

const isPricePeriod = createSafeParseGuard<PricePeriodT>(PricePeriod);

export function BtcPriceConfigPanel({
  config,
  onChange,
}: {
  config: Extract<DynamicConfigT, { type: 'btc_price' }>;
  onChange: DynamicConfigChange;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] text-stone uppercase tracking-[0.18em] mb-1.5">
          Chart period
        </p>
        <Select
          value={config.period}
          onValueChange={(value) => {
            if (!isPricePeriod(value)) return;
            onChange({ ...config, period: value });
          }}
        >
          <SelectItem value="daily" hint="Intraday movement">
            Daily (1D)
          </SelectItem>
          <SelectItem value="weekly" hint="Seven-day movement">
            Weekly (7D)
          </SelectItem>
          <SelectItem value="monthly" hint="Approximately 30 days">
            Monthly (30D)
          </SelectItem>
        </Select>
      </div>
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
