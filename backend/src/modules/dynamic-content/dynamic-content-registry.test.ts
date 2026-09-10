import { describe, expect, it } from 'bun:test';
import { DynamicContentRegistry } from './dynamic-content-registry';
import { GoogleNewsProvider } from './providers/google-news.provider';
import { WeatherProvider } from './providers/weather.provider';
import type { QweatherConfig } from './providers/qweather.config';

describe('DynamicContentRegistry', () => {
  it('registers google_news and weather with their definitions and providers', () => {
    const googleNewsProvider = new GoogleNewsProvider();
    const weatherProvider = new WeatherProvider({ apiKey: '', apiHost: '' } as QweatherConfig);

    const registry = new DynamicContentRegistry(
      { type: 'daily_calendar' } as never,
      { type: 'month_calendar' } as never,
      weatherProvider,
      { type: 'history_today' } as never,
      { type: 'weather_alert' } as never,
      { type: 'earthquake_report' } as never,
      { type: 'dashboard' } as never,
      { type: 'font_test' } as never,
      { type: 'hot_list' } as never,
      { type: 'btc_price' } as never,
      { type: 'outlook_calendar' } as never,
      googleNewsProvider
    );

    registry.onModuleInit();

    const newsEntry = registry.get('google_news');
    expect(newsEntry).toBeDefined();
    expect(newsEntry?.definition.type).toBe('google_news');
    expect(newsEntry?.provider).toBe(googleNewsProvider);
    expect(registry.defaultTtlSec('google_news')).toBe(900);

    const weatherEntry = registry.get('weather');
    expect(weatherEntry).toBeDefined();
    expect(weatherEntry?.definition.type).toBe('weather');
    expect(weatherEntry?.provider).toBe(weatherProvider);

    expect(registry.get('unknown_type')).toBeUndefined();
    expect(registry.defaultTtlSec('unknown_type')).toBeNull();
  });
});
