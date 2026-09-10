import { afterEach, describe, expect, it } from 'bun:test';
import type { QweatherConfig } from './qweather.config';
import { forecastLabel, openMeteoWeatherText, WeatherProvider } from './weather.provider';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('forecastLabel', () => {
  it('labels forecast dates across year boundaries', () => {
    const now = new Date('2026-12-31T04:00:00.000Z');

    expect(forecastLabel('2027-01-01', 'Australia/Perth', now)).toBe('Tomorrow');
    expect(forecastLabel('2027-01-02', 'Australia/Perth', now)).toBe('Day after');
  });

  it('searches QWeather cities and maps safe response fields', async () => {
    let requestedUrl = '';
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      requestedUrl = String(input);
      return Response.json({
        code: '200',
        location: [
          { id: '101250101', name: '长沙', adm1: '湖南省', adm2: '长沙市' },
          { id: '', name: 'invalid', adm1: '湖南省', adm2: '长沙市' },
        ],
      });
    }) as unknown as typeof fetch;

    const provider = new WeatherProvider({
      apiKey: 'key',
      apiHost: 'https://weather.example',
    } as QweatherConfig);

    await expect(provider.searchCities('长沙', 8, 1)).resolves.toEqual([
      { id: '101250101', name: '长沙', adm1: '湖南省', adm2: '长沙市' },
    ]);
    expect(requestedUrl).toContain('/geo/v2/city/lookup');
    expect(requestedUrl).toContain('location=%E9%95%BF%E6%B2%99');
    expect(requestedUrl).toContain('number=8');
  });

  it('does not reuse stale last-data fallback when QWeather is not configured', async () => {
    const provider = new WeatherProvider({
      apiKey: '',
      apiHost: '',
    } as QweatherConfig);
    const config = provider.validateConfig({
      type: 'weather',
      tz: 'Asia/Shanghai',
      provider: 'qweather',
      location_id: '101250101',
      location_label: '长沙',
      refresh_interval_sec: 600,
    });

    await expect(
      provider.fetchData(config, {
        now: new Date('2026-05-18T00:00:00.000Z'),
        lastData: {
          tempC: 21,
          summary: '晴',
          updatedAt: '2026-05-17T00:00:00.000Z',
        },
      })
    ).rejects.toThrow('QWEATHER_API_KEY 未配置');
  });

  it('keeps legacy weather configs without a provider on QWeather and preserves record identity', () => {
    const provider = new WeatherProvider({
      apiKey: 'key',
      apiHost: 'https://weather.example',
    } as QweatherConfig);
    const validated = provider.validateConfig({
      type: 'weather',
      tz: 'Asia/Shanghai',
      location_id: '101250101',
      location_label: 'Changsha',
    });
    expect(validated.provider).toBe('qweather');
    expect(validated.location_id).toBe('101250101');
    expect(validated.location_label).toBe('Changsha');
    expect(validated.tz).toBe('Asia/Shanghai');
  });

  it('accepts the reviewed current Open-Meteo Perth shape', () => {
    const provider = new WeatherProvider({ apiKey: '', apiHost: '' } as QweatherConfig);
    const validated = provider.validateConfig({
      type: 'weather',
      tz: 'Australia/Perth',
      provider: 'open_meteo',
      location_id: '2063523',
      location_label: 'Perth',
      latitude: -31.95224,
      longitude: 115.8614,
      location_timezone: 'Australia/Perth',
    });
    expect(validated.provider).toBe('open_meteo');
    expect(validated.location_id).toBe('2063523');
    expect(validated.location_label).toBe('Perth');
    expect(validated.latitude).toBe(-31.95224);
    expect(validated.longitude).toBe(115.8614);
    expect(validated.location_timezone).toBe('Australia/Perth');
  });

  it('searches Open-Meteo cities without credentials and returns coordinates', async () => {
    globalThis.fetch = (async () =>
      Response.json({
        results: [
          {
            id: 2063523,
            name: 'Perth',
            latitude: -31.95224,
            longitude: 115.8614,
            timezone: 'Australia/Perth',
            admin1: 'Western Australia',
          },
        ],
      })) as unknown as typeof fetch;
    const provider = new WeatherProvider({ apiKey: '', apiHost: '' } as QweatherConfig);
    await expect(provider.searchCities('Perth', 8, 1, 'open_meteo')).resolves.toEqual([
      {
        id: '2063523',
        name: 'Perth',
        adm1: 'Western Australia',
        adm2: '',
        provider: 'open_meteo',
        latitude: -31.95224,
        longitude: 115.8614,
        timezone: 'Australia/Perth',
      },
    ]);
  });

  it('normalizes an Open-Meteo forecast in English metric units', async () => {
    globalThis.fetch = (async () =>
      Response.json({
        current: {
          time: '2026-09-01T21:00',
          temperature_2m: 12.9,
          relative_humidity_2m: 80,
          apparent_temperature: 12.1,
          weather_code: 1,
          surface_pressure: 1021.3,
          wind_speed_10m: 4.7,
        },
        daily: {
          time: ['2026-09-01', '2026-09-02', '2026-09-03'],
          weather_code: [1, 53, 61],
          temperature_2m_max: [17.3, 17, 18],
          temperature_2m_min: [10.7, 11.6, 12],
        },
      })) as unknown as typeof fetch;
    const provider = new WeatherProvider({ apiKey: '', apiHost: '' } as QweatherConfig);
    const config = provider.validateConfig({
      type: 'weather',
      tz: 'Australia/Perth',
      provider: 'open_meteo',
      location_id: '2063523',
      location_label: 'Perth',
      latitude: -31.95224,
      longitude: 115.8614,
      location_timezone: 'Australia/Perth',
    });
    const data = await provider.fetchData(config, { now: new Date('2026-09-01T13:00:00Z') });
    expect(data).toMatchObject({
      tempC: 13,
      feelsLikeC: 12,
      humidity: 80,
      pressure: 1021,
      summary: 'Mainly clear',
    });
    expect(data.windDisplay).toBe('5 km/h');
    expect(data.fc.map((day) => day.label)).toEqual(['Today', 'Tomorrow', 'Day after']);
    expect(data.fc[1]?.text).toBe('Drizzle');
  });

  it('maps WMO codes deterministically for known and unknown codes', () => {
    expect(openMeteoWeatherText(0)).toBe('Clear sky');
    expect(openMeteoWeatherText(1)).toBe('Mainly clear');
    expect(openMeteoWeatherText(2)).toBe('Partly cloudy');
    expect(openMeteoWeatherText(3)).toBe('Overcast');
    expect(openMeteoWeatherText(45)).toBe('Fog');
    expect(openMeteoWeatherText(51)).toBe('Drizzle');
    expect(openMeteoWeatherText(61)).toBe('Rain');
    expect(openMeteoWeatherText(71)).toBe('Snow');
    expect(openMeteoWeatherText(80)).toBe('Rain showers');
    expect(openMeteoWeatherText(95)).toBe('Thunderstorm');
    expect(openMeteoWeatherText(999)).toBe('Unknown conditions');
    expect(openMeteoWeatherText(-1)).toBe('Unknown conditions');
  });

  it('keeps malformed configs fail-closed with concise English errors', () => {
    const provider = new WeatherProvider({ apiKey: '', apiHost: '' } as QweatherConfig);

    // Invalid provider
    expect(() =>
      provider.validateConfig({
        type: 'weather',
        tz: 'Australia/Perth',
        provider: 'unknown_provider',
        location_id: '2063523',
        location_label: 'Perth',
      })
    ).toThrow(/Invalid provider/);

    // Out-of-bounds latitude
    expect(() =>
      provider.validateConfig({
        type: 'weather',
        tz: 'Australia/Perth',
        provider: 'open_meteo',
        location_id: '2063523',
        location_label: 'Perth',
        latitude: 120,
        longitude: 115.8614,
      })
    ).toThrow(/Invalid latitude/);

    // Out-of-bounds longitude
    expect(() =>
      provider.validateConfig({
        type: 'weather',
        tz: 'Australia/Perth',
        provider: 'open_meteo',
        location_id: '2063523',
        location_label: 'Perth',
        latitude: -31.95224,
        longitude: 200,
      })
    ).toThrow(/Invalid longitude/);

    // Empty location_id
    expect(() =>
      provider.validateConfig({
        type: 'weather',
        tz: 'Australia/Perth',
        provider: 'open_meteo',
        location_id: '',
        location_label: 'Perth',
      })
    ).toThrow(/Invalid location_id/);

    // Missing coordinates on Open-Meteo fetch
    const configWithoutCoords = provider.validateConfig({
      type: 'weather',
      tz: 'Australia/Perth',
      provider: 'open_meteo',
      location_id: '2063523',
      location_label: 'Perth',
    });
    expect(
      provider.fetchData(configWithoutCoords, { now: new Date('2026-09-01T13:00:00Z') })
    ).rejects.toThrow('Open-Meteo location coordinates are not configured');
  });
});
