import { useQuery } from '@tanstack/react-query';
import { API_PREFIX, api } from '@/lib/http';

import type { DynamicConfigT } from 'shared';

const weatherCityQueryKey = (query: string, provider: string) =>
  ['dynamic', 'weather-cities', provider, query] as const;

export interface WeatherCityResult {
  id: string;
  name: string;
  adm1: string;
  adm2: string;
  provider?: 'qweather' | 'open_meteo';
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface WeatherCitySelection {
  locationId: string;
  label: string;
  provider?: 'qweather' | 'open_meteo';
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export function resolveFallbackCitySelection(city: {
  locationId: string;
  name: string;
}): WeatherCitySelection {
  return {
    locationId: city.locationId,
    label: city.name,
    provider: 'qweather',
  };
}

export function resolveRemoteCitySelection(city: WeatherCityResult): WeatherCitySelection {
  return {
    locationId: city.id,
    label: city.name,
    provider: city.provider ?? 'open_meteo',
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

export function resolveWeatherSelection(
  config: Extract<DynamicConfigT, { type: 'weather' }>,
  selection: WeatherCitySelection
): Extract<DynamicConfigT, { type: 'weather' }> {
  const hasCoordinates =
    typeof selection.latitude === 'number' &&
    Number.isFinite(selection.latitude) &&
    typeof selection.longitude === 'number' &&
    Number.isFinite(selection.longitude);
  const resolvedProvider =
    selection.provider === 'open_meteo' && !hasCoordinates
      ? 'qweather'
      : (selection.provider ?? (hasCoordinates ? (config.provider ?? 'open_meteo') : 'qweather'));
  return {
    ...config,
    provider: resolvedProvider,
    location_id: selection.locationId,
    location_label: selection.label,
    latitude: resolvedProvider === 'open_meteo' ? selection.latitude : undefined,
    longitude: resolvedProvider === 'open_meteo' ? selection.longitude : undefined,
    location_timezone: resolvedProvider === 'open_meteo' ? selection.timezone : undefined,
  };
}

export function useWeatherCitySearch(query: string, enabled: boolean, provider = 'open_meteo') {
  const q = query.trim();
  return useQuery({
    queryKey: weatherCityQueryKey(q, provider),
    queryFn: async () => {
      const { data } = await api.get<WeatherCityResult[]>(`${API_PREFIX}/dynamic/weather/cities`, {
        params: { q, provider },
      });
      return data;
    },
    enabled: enabled && q.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}
