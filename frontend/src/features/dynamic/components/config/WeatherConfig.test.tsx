import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { DynamicConfigT } from 'shared';
import { WeatherConfigPanel } from './WeatherConfig';
import {
  resolveFallbackCitySelection,
  resolveRemoteCitySelection,
  resolveWeatherSelection,
  type WeatherCityResult,
} from '@/features/dynamic/hooks/useWeatherCitySearch';

type WeatherConfig = Extract<DynamicConfigT, { type: 'weather' }>;

const sampleOpenMeteoConfig: WeatherConfig = {
  type: 'weather',
  provider: 'open_meteo',
  location_id: '2063523',
  location_label: 'Perth',
  tz: 'Australia/Perth',
  latitude: -31.95224,
  longitude: 115.8614,
  location_timezone: 'Australia/Perth',
  refresh_interval_sec: 600,
};

const sampleQWeatherConfig: WeatherConfig = {
  type: 'weather',
  provider: 'qweather',
  location_id: '101010100',
  location_label: '北京',
  tz: 'Asia/Shanghai',
  refresh_interval_sec: 600,
};

describe('WeatherConfig selection and fallback resolution', () => {
  describe('normal coordinate-bearing Open-Meteo selection', () => {
    it('applies remote Open-Meteo city coordinates and timezone', () => {
      const remoteCity: WeatherCityResult = {
        id: '2147714',
        name: 'Sydney',
        adm1: 'New South Wales',
        adm2: '',
        provider: 'open_meteo',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 'Australia/Sydney',
      };

      const selection = resolveRemoteCitySelection(remoteCity);
      expect(selection).toEqual({
        locationId: '2147714',
        label: 'Sydney',
        provider: 'open_meteo',
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: 'Australia/Sydney',
      });

      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, selection);
      expect(updated.provider).toBe('open_meteo');
      expect(updated.location_id).toBe('2147714');
      expect(updated.location_label).toBe('Sydney');
      expect(updated.latitude).toBe(-33.8688);
      expect(updated.longitude).toBe(151.2093);
      expect(updated.location_timezone).toBe('Australia/Sydney');
    });

    it('transitions from QWeather to Open-Meteo when selecting a coordinate-bearing city', () => {
      const remoteCity: WeatherCityResult = {
        id: '1850147',
        name: 'Tokyo',
        adm1: 'Tokyo',
        adm2: '',
        provider: 'open_meteo',
        latitude: 35.6895,
        longitude: 139.6917,
        timezone: 'Asia/Tokyo',
      };

      const selection = resolveRemoteCitySelection(remoteCity);
      const updated = resolveWeatherSelection(sampleQWeatherConfig, selection);
      expect(updated.provider).toBe('open_meteo');
      expect(updated.location_id).toBe('1850147');
      expect(updated.location_label).toBe('Tokyo');
      expect(updated.latitude).toBe(35.6895);
      expect(updated.longitude).toBe(139.6917);
      expect(updated.location_timezone).toBe('Asia/Tokyo');
    });
  });

  describe('fallback and error behavior', () => {
    it('switches to QWeather and clears coordinates when selecting a local fallback city', () => {
      // User starts with Open-Meteo default, remote search fails/empty, selects fallback "北京"
      const fallbackCity = { locationId: '101010100', name: '北京', province: '北京' };
      const selection = resolveFallbackCitySelection(fallbackCity);

      expect(selection).toEqual({
        locationId: '101010100',
        label: '北京',
        provider: 'qweather',
      });

      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, selection);
      expect(updated.provider).toBe('qweather');
      expect(updated.location_id).toBe('101010100');
      expect(updated.location_label).toBe('北京');
      expect(updated.latitude).toBeUndefined();
      expect(updated.longitude).toBeUndefined();
      expect(updated.location_timezone).toBeUndefined();
    });

    it('clears stale Open-Meteo coordinates when selecting a fallback city with name-based locationId', () => {
      const fallbackCity = { locationId: '哈尔滨', name: '哈尔滨', province: '黑龙江' };
      const selection = resolveFallbackCitySelection(fallbackCity);
      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, selection);

      expect(updated.provider).toBe('qweather');
      expect(updated.location_id).toBe('哈尔滨');
      expect(updated.location_label).toBe('哈尔滨');
      expect(updated.latitude).toBeUndefined();
      expect(updated.longitude).toBeUndefined();
    });
  });

  describe('fail-closed validation against uncoordinated Open-Meteo persistence', () => {
    it('refuses open_meteo provider if latitude or longitude are missing', () => {
      const invalidOpenMeteoSelection = {
        locationId: '2063523',
        label: 'Perth',
        provider: 'open_meteo' as const,
        // Missing latitude and longitude
      };

      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, invalidOpenMeteoSelection);
      expect(updated.provider).toBe('qweather');
      expect(updated.latitude).toBeUndefined();
      expect(updated.longitude).toBeUndefined();
    });

    it('refuses open_meteo provider if coordinates are NaN or non-finite', () => {
      const nanSelection = {
        locationId: '2063523',
        label: 'Perth',
        provider: 'open_meteo' as const,
        latitude: Number.NaN,
        longitude: 115.8614,
      };

      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, nanSelection);
      expect(updated.provider).toBe('qweather');
      expect(updated.latitude).toBeUndefined();
      expect(updated.longitude).toBeUndefined();
    });

    it('does not default to open_meteo when selection lacks both provider and coordinates', () => {
      const bareSelection = {
        locationId: '101010100',
        label: '北京',
      };

      const updated = resolveWeatherSelection(sampleOpenMeteoConfig, bareSelection);
      expect(updated.provider).toBe('qweather');
      expect(updated.latitude).toBeUndefined();
      expect(updated.longitude).toBeUndefined();
    });
  });

  describe('WeatherConfigPanel component rendering', () => {
    it('renders city search and refresh settings without crashing', () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const html = renderToString(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(WeatherConfigPanel, {
            config: sampleOpenMeteoConfig,
            onChange: () => {},
          })
        )
      );

      expect(html).toContain('City');
      expect(html).toContain('Perth');
      expect(html).toContain('Refresh interval');
    });
  });
});
