import type { DynamicConfigT } from 'shared';
import { CitySearch } from './CitySearch';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';

import { resolveWeatherSelection } from '@/features/dynamic/hooks/useWeatherCitySearch';

export function WeatherConfigPanel({
  config,
  onChange,
}: {
  config: Extract<DynamicConfigT, { type: 'weather' }>;
  onChange: DynamicConfigChange;
}) {
  return (
    <div className="space-y-4">
      <CitySearch
        value={config.location_label}
        onSelect={(selection) => onChange(resolveWeatherSelection(config, selection))}
      />
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
