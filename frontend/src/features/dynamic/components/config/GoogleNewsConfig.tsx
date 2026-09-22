import { Select, SelectItem } from '@/components/ui/Select';
import type { DynamicConfigT } from 'shared';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';
import { DynamicRefreshSettings } from './RefreshSettings';

export function GoogleNewsConfigPanel({
  config,
  onChange,
}: {
  config: Extract<DynamicConfigT, { type: 'google_news' }>;
  onChange: DynamicConfigChange;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] text-stone uppercase tracking-[0.18em] mb-1.5">
          Editions
        </p>
        <Select
          value={config.edition}
          onValueChange={(edition) => {
            if (edition !== 'au' && edition !== 'tw' && edition !== 'both') return;
            onChange({ ...config, edition });
          }}
        >
          <SelectItem value="both" hint="Australia + Taiwan">
            AU + Taiwan
          </SelectItem>
          <SelectItem value="au" hint="English headlines">
            Australia
          </SelectItem>
          <SelectItem value="tw" hint="Traditional Chinese headlines">
            Taiwan
          </SelectItem>
        </Select>
      </div>
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
