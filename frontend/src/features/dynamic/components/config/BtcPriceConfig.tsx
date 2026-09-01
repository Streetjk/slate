import { Layers3 } from 'lucide-react';
import { PricePeriod, type DynamicConfigT, type PricePeriodT } from 'shared';
import { Button } from '@/components/ui/Button';
import { Select, SelectItem } from '@/components/ui/Select';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';
import { createSafeParseGuard } from '@/features/dynamic/lib/zod-utils';

const isPricePeriod = createSafeParseGuard<PricePeriodT>(PricePeriod);

export function BtcPriceConfigPanel({
  config,
  onChange,
  onCreateBtcTrio,
}: {
  config: Extract<DynamicConfigT, { type: 'btc_price' }>;
  onChange: DynamicConfigChange;
  onCreateBtcTrio?: () => void;
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
      {onCreateBtcTrio && (
        <div className="border-t border-line pt-3">
          <p className="font-sans text-[12px] leading-relaxed text-stone mb-2">
            Create all three cached views together so NOTE4 can switch without another network
            request.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onCreateBtcTrio}>
            <Layers3 size={14} className="mr-1.5" />
            Add BTC trio
          </Button>
        </div>
      )}
    </div>
  );
}
