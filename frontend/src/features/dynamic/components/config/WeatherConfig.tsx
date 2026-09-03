import type { DynamicConfigT } from 'shared';
import { CitySearch } from './CitySearch';
import { DynamicRefreshSettings } from './RefreshSettings';
import type { DynamicConfigChange } from '@/features/dynamic/model/config-types';

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
        onSelect={({ locationId, label, provider, latitude, longitude, timezone }) =>
          onChange({
            ...config,
            provider: provider ?? config.provider ?? 'open_meteo',
            location_id: locationId,
            location_label: label,
            latitude,
            longitude,
            location_timezone: timezone,
          })
        }
      />
      <DynamicRefreshSettings config={config} onChange={onChange} />
    </div>
  );
}
