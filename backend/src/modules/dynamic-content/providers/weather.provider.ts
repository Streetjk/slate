import { Injectable } from '@nestjs/common';
import { WeatherConfig, type WeatherConfigT } from 'shared';
import { z } from 'zod';
import { fetchJson as fetchJsonWithTimeout } from '../../../common/http/fetch';
import { getDateTimeFormat } from '../../../common/utils/intl';
import { setBoundedCache } from '../../../common/utils/cache-utils';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';
import { datePartsInTz } from '../timezone';
import {
  CachedInflightFetcher,
  DEFAULT_PROVIDER_CACHE_TTL_SEC,
  DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
  isRecentTimestamp,
} from './provider-cache';
import { QweatherConfig } from './qweather.config';

export interface WeatherForecastDay {
  label: string;
  val: string;
  text: string;
  tempMin: number | string;
  tempMax: number | string;
  code: number;
}

export interface WeatherProviderData {
  tempC: number | string;
  feelsLikeC: number | string;
  humidity: number | string;
  pressure: number | string;
  windDisplay: string;
  summary: string;
  code: number;
  obsTime: string;
  updatedAt: string;
  fc: WeatherForecastDay[];
}

interface LookupCacheEntry {
  id: string;
  fetchedAt: number;
}

interface QWeatherNowResponse {
  code?: string;
  updateTime?: string;
  now?: {
    obsTime?: string;
    temp?: string;
    feelsLike?: string;
    text?: string;
    icon?: string;
    windDir?: string;
    windScale?: string;
    windSpeed?: string;
    humidity?: string;
    pressure?: string;
  };
}

interface QWeatherForecastResponse {
  code?: string;
  updateTime?: string;
  daily?: Array<{
    fxDate?: string;
    tempMax?: string;
    tempMin?: string;
    textDay?: string;
    textNight?: string;
    iconDay?: string;
  }>;
}

interface QWeatherCityLookupResponse {
  code?: string;
  location?: Array<{
    id?: string;
    name?: string;
    adm1?: string;
    adm2?: string;
  }>;
}

export interface WeatherCitySearchResult {
  id: string;
  name: string;
  adm1: string;
  adm2: string;
  provider?: 'qweather' | 'open_meteo';
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

const LOOKUP_CACHE_TTL_MS = 86_400_000;
const CITY_SEARCH_CACHE_TTL_MS = 3_600_000;
const FC_LABELS = ['Today', 'Tomorrow', 'Day after'];
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const MAX_CACHE_ENTRIES = 128;
const MAX_LOOKUP_CACHE_ENTRIES = 256;
const MAX_CITY_SEARCH_CACHE_ENTRIES = 128;

@Injectable()
export class WeatherProvider implements DataProvider<WeatherConfigT, WeatherProviderData> {
  readonly type = 'weather';
  private readonly fetcher = new CachedInflightFetcher<string, WeatherProviderData>(
    MAX_CACHE_ENTRIES
  );
  private readonly lookupCache = new Map<string, LookupCacheEntry>();
  private readonly lookupInflight = new Map<string, Promise<string>>();
  private readonly citySearchCache = new Map<
    string,
    { data: WeatherCitySearchResult[]; fetchedAt: number }
  >();
  private readonly citySearchInflight = new Map<string, Promise<WeatherCitySearchResult[]>>();

  constructor(private readonly config: QweatherConfig) {}

  validateConfig(raw: unknown): WeatherConfigT {
    return WeatherConfig.parse(raw);
  }

  async searchCities(
    query: string,
    limit = 8,
    now = Date.now(),
    provider: 'qweather' | 'open_meteo' = 'qweather'
  ): Promise<WeatherCitySearchResult[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [];
    if (provider === 'open_meteo') return this.searchOpenMeteo(normalizedQuery, limit, now);
    const apiKey = this.config.apiKey;
    if (!apiKey) throw new Error('QWEATHER_API_KEY 未配置');
    if (!this.config.apiHost) {
      throw new Error('QWEATHER_API_HOST 未配置，请在和风天气控制台-设置中复制你的 API Host');
    }

    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);
    const key = `${normalizedQuery}:${safeLimit}`;
    const cached = this.citySearchCache.get(key);
    if (cached && now - cached.fetchedAt < CITY_SEARCH_CACHE_TTL_MS) return cached.data;
    if (cached) this.citySearchCache.delete(key);

    const existing = this.citySearchInflight.get(key);
    if (existing) return existing;

    const host = this.config.apiHost.replace(/\/+$/, '');
    const p = this.fetchCitySearch(host, apiKey, normalizedQuery, safeLimit)
      .then((data) => {
        setBoundedCache(
          this.citySearchCache,
          key,
          { data, fetchedAt: now },
          MAX_CITY_SEARCH_CACHE_ENTRIES
        );
        return data;
      })
      .finally(() => this.citySearchInflight.delete(key));
    this.citySearchInflight.set(key, p);
    return p;
  }

  private cacheKey(c: WeatherConfigT): string {
    return `${c.provider}:${c.location_id}:${c.tz}`;
  }

  async fetchData(
    config: WeatherConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<WeatherProviderData> {
    const key = this.cacheKey(config);
    const now = ctx.now.getTime();
    const ttlSec = Math.max(config.refresh_interval_sec ?? DEFAULT_PROVIDER_CACHE_TTL_SEC, 300);
    return this.fetcher.getOrFetch(key, now, ttlSec * 1000, () =>
      config.provider === 'open_meteo'
        ? this.fetchFromOpenMeteo(config, ctx)
        : this.fetchFromQWeather(config, ctx)
    );
  }

  private async fetchFromOpenMeteo(
    config: WeatherConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<WeatherProviderData> {
    if (config.latitude === undefined || config.longitude === undefined) {
      throw new Error('Open-Meteo location coordinates are not configured');
    }
    const timezone = config.location_timezone ?? config.tz;
    const params = new URLSearchParams({
      latitude: String(config.latitude),
      longitude: String(config.longitude),
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone,
      forecast_days: '3',
      wind_speed_unit: 'kmh',
      temperature_unit: 'celsius',
      precipitation_unit: 'mm',
    });
    const data = await fetchJsonWithTimeout<OpenMeteoResponse>(
      `${OPEN_METEO_FORECAST_URL}?${params.toString()}`,
      { timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS, userAgent: null }
    );
    const current = data.current ?? {};
    const daily = data.daily ?? {};
    const fc = Array.from({ length: 3 }, (_, index) => {
      const date = daily.time?.[index];
      const min = toDisplayNumber(daily.temperature_2m_min?.[index]);
      const max = toDisplayNumber(daily.temperature_2m_max?.[index]);
      const code = safeNumber(daily.weather_code?.[index], 999);
      const text = openMeteoWeatherText(code);
      return {
        label: forecastLabel(date, config.tz, ctx.now) ?? FC_LABELS[index] ?? '--',
        val: `${text}  ${min}~${max}°`,
        text,
        tempMin: min,
        tempMax: max,
        code,
      };
    });
    const code = safeNumber(current.weather_code, 999);
    return {
      tempC: toDisplayNumber(current.temperature_2m),
      feelsLikeC: toDisplayNumber(current.apparent_temperature),
      humidity: toDisplayNumber(current.relative_humidity_2m),
      pressure: toDisplayNumber(current.surface_pressure),
      windDisplay: `${toDisplayNumber(current.wind_speed_10m)} km/h`,
      summary: openMeteoWeatherText(code),
      code,
      obsTime: current.time ? `${current.time}:00` : ctx.now.toISOString(),
      updatedAt: ctx.now.toISOString(),
      fc,
    };
  }

  private async searchOpenMeteo(
    query: string,
    limit: number,
    now: number
  ): Promise<WeatherCitySearchResult[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 20);
    const key = `open_meteo:${query}:${safeLimit}`;
    const cached = this.citySearchCache.get(key);
    if (cached && now - cached.fetchedAt < CITY_SEARCH_CACHE_TTL_MS) return cached.data;
    const params = new URLSearchParams({
      name: query,
      count: String(safeLimit),
      language: 'en',
      format: 'json',
    });
    const json = await fetchJsonWithTimeout<OpenMeteoGeocodingResponse>(
      `${OPEN_METEO_GEOCODING_URL}?${params.toString()}`,
      { timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS, userAgent: null }
    );
    const results = (json.results ?? [])
      .map((location) => ({
        id: String(location.id ?? ''),
        name: location.name?.trim() ?? '',
        adm1: location.admin1?.trim() ?? '',
        adm2: location.admin2?.trim() ?? '',
        provider: 'open_meteo' as const,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      }))
      .filter(
        (location) =>
          location.id &&
          location.name &&
          typeof location.latitude === 'number' &&
          typeof location.longitude === 'number'
      );
    setBoundedCache(
      this.citySearchCache,
      key,
      { data: results, fetchedAt: now },
      MAX_CITY_SEARCH_CACHE_ENTRIES
    );
    return results;
  }

  private async fetchFromQWeather(
    config: WeatherConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<WeatherProviderData> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      const fallback = this.fallbackFromLastData(config, ctx.lastData, ctx.now);
      if (fallback) return fallback;
      throw new Error('QWEATHER_API_KEY 未配置');
    }
    if (!this.config.apiHost) {
      const fallback = this.fallbackFromLastData(config, ctx.lastData, ctx.now);
      if (fallback) return fallback;
      throw new Error('QWEATHER_API_HOST 未配置，请在和风天气控制台-设置中复制你的 API Host');
    }

    const host = this.config.apiHost.replace(/\/+$/, '');
    const locationId = await this.resolveLocationId(
      host,
      apiKey,
      config.location_id,
      ctx.now.getTime()
    );
    const location = encodeURIComponent(locationId);
    const lang = 'zh';
    const nowUrl = `${host}/v7/weather/now?location=${location}&lang=${lang}&unit=m`;
    const forecastUrl = `${host}/v7/weather/3d?location=${location}&lang=${lang}&unit=m`;

    const [nowJson, forecastJson] = await Promise.all([
      fetchJson<QWeatherNowResponse>(nowUrl, apiKey),
      fetchJson<QWeatherForecastResponse>(forecastUrl, apiKey),
    ]);

    if (nowJson.code !== '200') throw new Error(`QWeather now code ${nowJson.code ?? 'unknown'}`);
    if (forecastJson.code !== '200')
      throw new Error(`QWeather forecast code ${forecastJson.code ?? 'unknown'}`);

    const nowData = nowJson.now ?? {};
    const windSpeed = toDisplayNumber(nowData.windSpeed);
    const fc =
      forecastJson.daily?.slice(0, 3).map((day, index) => {
        const dayText = day.textDay || day.textNight || '--';
        const night = day.textNight && day.textNight !== dayText ? `/${day.textNight}` : '';
        const tempMin = toDisplayNumber(day.tempMin);
        const tempMax = toDisplayNumber(day.tempMax);
        return {
          label: forecastLabel(day.fxDate, config.tz, ctx.now) ?? FC_LABELS[index] ?? '--',
          val: `${dayText}${night}  ${tempMin}~${tempMax}°`,
          text: `${dayText}${night}`,
          tempMin,
          tempMax,
          code: Number.parseInt(day.iconDay ?? '999', 10),
        };
      }) ?? [];

    while (fc.length < 3) {
      fc.push({
        label: FC_LABELS[fc.length]!,
        val: '--',
        text: '--',
        tempMin: '--',
        tempMax: '--',
        code: 999,
      });
    }

    return {
      tempC: toDisplayNumber(nowData.temp),
      feelsLikeC: toDisplayNumber(nowData.feelsLike),
      humidity: toDisplayNumber(nowData.humidity),
      pressure: toDisplayNumber(nowData.pressure),
      windDisplay: nowData.windDir
        ? `${nowData.windDir}${nowData.windScale ? nowData.windScale + '级' : ''}`
        : windSpeed === '--'
          ? '--'
          : `${windSpeed}km/h`,
      summary: nowData.text || '--',
      code: Number.parseInt(nowData.icon ?? forecastJson.daily?.[0]?.iconDay ?? '999', 10),
      obsTime: nowData.obsTime || nowJson.updateTime || ctx.now.toISOString(),
      updatedAt: nowJson.updateTime || ctx.now.toISOString(),
      fc,
    };
  }

  private async resolveLocationId(
    host: string,
    apiKey: string,
    locationId: string,
    now: number
  ): Promise<string> {
    if (/^\d+$/.test(locationId)) return locationId;
    const cached = this.lookupCache.get(locationId);
    if (cached && now - cached.fetchedAt < LOOKUP_CACHE_TTL_MS) return cached.id;
    if (cached) this.lookupCache.delete(locationId);

    const existing = this.lookupInflight.get(locationId);
    if (existing) return existing;

    const p = this.fetchLocationId(host, apiKey, locationId)
      .then((id) => {
        setBoundedCache(
          this.lookupCache,
          locationId,
          { id, fetchedAt: now },
          MAX_LOOKUP_CACHE_ENTRIES
        );
        return id;
      })
      .finally(() => this.lookupInflight.delete(locationId));
    this.lookupInflight.set(locationId, p);
    return p;
  }

  private async fetchLocationId(host: string, apiKey: string, locationId: string): Promise<string> {
    const url =
      `${host}/geo/v2/city/lookup?location=${encodeURIComponent(locationId)}` +
      `&range=cn&number=1&lang=zh`;
    const json = await fetchJson<QWeatherCityLookupResponse>(url, apiKey);
    if (json.code !== '200') throw new Error(`QWeather city lookup code ${json.code ?? 'unknown'}`);
    const id = json.location?.[0]?.id;
    if (!id) throw new Error(`QWeather city lookup empty: ${locationId}`);
    return id;
  }

  private async fetchCitySearch(
    host: string,
    apiKey: string,
    query: string,
    limit: number
  ): Promise<WeatherCitySearchResult[]> {
    const url =
      `${host}/geo/v2/city/lookup?location=${encodeURIComponent(query)}` +
      `&range=cn&number=${limit}&lang=zh`;
    const json = await fetchJson<QWeatherCityLookupResponse>(url, apiKey);
    if (json.code !== '200') throw new Error(`QWeather city lookup code ${json.code ?? 'unknown'}`);
    return (json.location ?? [])
      .map((location) => ({
        id: location.id?.trim() ?? '',
        name: location.name?.trim() ?? '',
        adm1: location.adm1?.trim() ?? '',
        adm2: location.adm2?.trim() ?? '',
      }))
      .filter((location) => location.id && location.name);
  }

  private fallbackFromLastData(
    config: WeatherConfigT,
    lastData: unknown,
    now: Date
  ): WeatherProviderData | null {
    const parsed = WeatherProviderDataFallback.safeParse(lastData);
    if (!parsed.success) return null;
    const data = parsed.data;
    if (!data.summary && data.tempC === undefined) return null;
    if (!isRecentTimestamp(data.updatedAt, now, reusableWeatherAgeMs(config))) return null;
    return {
      tempC: data.tempC ?? '--',
      feelsLikeC: data.feelsLikeC ?? '--',
      humidity: data.humidity ?? '--',
      pressure: data.pressure ?? '--',
      windDisplay: data.windDisplay ?? '--',
      summary: data.summary ?? '--',
      code: typeof data.code === 'number' ? data.code : 999,
      obsTime: data.obsTime ?? now.toISOString(),
      updatedAt: data.updatedAt ?? now.toISOString(),
      fc: Array.isArray(data.fc) ? data.fc.slice(0, 3) : [],
    };
  }
}

function reusableWeatherAgeMs(config: WeatherConfigT): number {
  const ttlSec = Math.max(config.refresh_interval_sec ?? DEFAULT_PROVIDER_CACHE_TTL_SEC, 300);
  return Math.min(Math.max(ttlSec * 3, 900), 43_200) * 1000;
}

async function fetchJson<T>(url: string, apiKey: string): Promise<T> {
  return fetchJsonWithTimeout<T>(url, {
    timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
    headers: { 'X-QW-Api-Key': apiKey },
    userAgent: null,
  });
}

const WeatherForecastDayFallback = z.object({
  label: z.string(),
  val: z.string(),
  text: z.string(),
  tempMin: z.union([z.number(), z.string()]),
  tempMax: z.union([z.number(), z.string()]),
  code: z.number(),
});

const WeatherProviderDataFallback = z.object({
  tempC: z.union([z.number(), z.string()]).optional(),
  feelsLikeC: z.union([z.number(), z.string()]).optional(),
  humidity: z.union([z.number(), z.string()]).optional(),
  pressure: z.union([z.number(), z.string()]).optional(),
  windDisplay: z.string().optional(),
  summary: z.string().optional(),
  code: z.number().optional(),
  obsTime: z.string().optional(),
  updatedAt: z.string().optional(),
  fc: z.array(WeatherForecastDayFallback).optional(),
});

function toDisplayNumber(value: unknown): number | string {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : value;
  }
  return '--';
}

export function forecastLabel(value: unknown, timeZone: string, now: Date): string | null {
  if (typeof value !== 'string' || !value) return '--';
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return value.slice(5);
  const today = datePartsInTz(now, timeZone);
  if (today) {
    const delta = ordinalDay(year, month, day) - ordinalDay(today.year, today.month, today.day);
    if (delta >= 0 && delta < FC_LABELS.length) return FC_LABELS[delta]!;
  }
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (Number.isNaN(date.getTime())) return value.slice(5);
  try {
    return getDateTimeFormat('en-AU', {
      timeZone,
      month: 'numeric',
      day: 'numeric',
    }).format(date);
  } catch {
    return value.slice(5);
  }
}

function ordinalDay(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function openMeteoWeatherText(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Unknown conditions';
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    weather_code?: number;
    surface_pressure?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id?: number;
    name?: string;
    admin1?: string;
    admin2?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
}
