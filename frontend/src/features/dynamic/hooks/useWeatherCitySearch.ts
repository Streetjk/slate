import { useQuery } from '@tanstack/react-query';
import { API_PREFIX, api } from '@/lib/http';

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
