import { describe, expect, it } from 'bun:test';
import {
  loadWeatherIconMask,
  mapWmoToQWeather,
  normalizeIconCode,
  resolveIconPath,
} from './weather-icons';

describe('weather icon asset resolution', () => {
  // Required Open-Meteo WMO codes: 0, 1, 2, 3, 45, 51, 61, 63, 80, 95
  // and all grouped variants already normalized (48, 53, 55, 56, 57, 65, 66, 67, 71, 73, 75, 77, 81, 82, 85, 86, 96, 99)
  const requiredWmoCodes = [
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ];

  it('proves all required Open-Meteo WMO codes do not resolve to unknown fallback (999.svg)', () => {
    for (const code of requiredWmoCodes) {
      const resolved = resolveIconPath(code);
      expect(resolved).not.toBeNull();
      expect(resolved).not.toContain('999.svg');
      expect(resolved?.endsWith('.svg')).toBe(true);
      expect(mapWmoToQWeather(code)).toBeDefined();
    }
  });

  it('asserts exact semantic pair mappings for refined and representative WMO codes', () => {
    // Refined pairs from review
    expect(mapWmoToQWeather(1)).toBe(102); // mainly clear -> Few Clouds
    expect(mapWmoToQWeather(56)).toBe(313); // light freezing drizzle -> Freezing Rain
    expect(mapWmoToQWeather(57)).toBe(313); // dense freezing drizzle -> Freezing Rain
    expect(mapWmoToQWeather(85)).toBe(407); // slight snow showers -> Snow Flurry
    expect(mapWmoToQWeather(86)).toBe(407); // heavy snow showers -> Snow Flurry

    // Verify resolveIconPath resolves to the exact asset filenames for refined pairs
    expect(resolveIconPath(1)).toContain('102.svg');
    expect(resolveIconPath(56)).toContain('313.svg');
    expect(resolveIconPath(57)).toContain('313.svg');
    expect(resolveIconPath(85)).toContain('407.svg');
    expect(resolveIconPath(86)).toContain('407.svg');

    // Required representative mappings
    const representativePairs: Array<[number, number, string]> = [
      [0, 100, '100.svg'], // clear sky
      [2, 103, '103.svg'], // partly cloudy
      [3, 104, '104.svg'], // overcast
      [45, 501, '501.svg'], // fog
      [48, 501, '501.svg'], // rime fog
      [51, 309, '309.svg'], // drizzle
      [61, 305, '305.svg'], // slight rain
      [63, 306, '306.svg'], // moderate rain
      [65, 307, '307.svg'], // heavy rain
      [66, 313, '313.svg'], // freezing rain
      [67, 313, '313.svg'], // freezing rain
      [71, 400, '400.svg'], // slight snow
      [73, 401, '401.svg'], // moderate snow
      [80, 300, '300.svg'], // rain showers
      [82, 301, '301.svg'], // violent rain showers
      [95, 302, '302.svg'], // thunderstorm
      [96, 304, '304.svg'], // thunderstorm with hail
      [99, 304, '304.svg'], // thunderstorm with heavy hail
    ];

    for (const [wmoCode, expectedQWeatherCode, expectedSvg] of representativePairs) {
      expect(mapWmoToQWeather(wmoCode)).toBe(expectedQWeatherCode);
      expect(resolveIconPath(wmoCode)).toContain(expectedSvg);
    }
  });

  it('proves unknown codes still resolve to unknown fallback (999.svg)', () => {
    const unknownCodes = [-1, 42, 88, 999, 1234];
    for (const code of unknownCodes) {
      const resolved = resolveIconPath(code);
      expect(resolved).not.toBeNull();
      expect(resolved).toContain('999.svg');
      expect(mapWmoToQWeather(code)).toBeUndefined();
    }
  });

  it('preserves existing QWeather codes and asset resolution', () => {
    const qweatherCodes = [100, 101, 103, 104, 300, 305, 306, 501];
    for (const code of qweatherCodes) {
      const resolved = resolveIconPath(code);
      expect(resolved).not.toBeNull();
      expect(resolved).toContain(`${code}.svg`);
      expect(mapWmoToQWeather(code)).toBeUndefined();
    }
  });

  it('normalizes null or non-finite codes to 999 fallback', () => {
    expect(normalizeIconCode(null)).toBe(999);
    expect(normalizeIconCode(Number.NaN)).toBe(999);
  });

  it('loads bitmap masks for WMO codes and preserves caching behavior', async () => {
    const mask1 = await loadWeatherIconMask(0, 'tiny');
    expect(mask1).not.toBeNull();
    expect(mask1?.width).toBe(30);
    expect(mask1?.height).toBe(30);

    // Cache hit should return identical mask reference
    const mask2 = await loadWeatherIconMask(0, 'tiny');
    expect(mask2).toBe(mask1);

    // QWeather code 100 should share the mapped cache entry
    const maskQWeather = await loadWeatherIconMask(100, 'tiny');
    expect(maskQWeather).toBe(mask1);

    // Large icon size loads proper dimensions
    const maskLarge = await loadWeatherIconMask(0, 'large');
    expect(maskLarge).not.toBeNull();
    expect(maskLarge?.width).toBe(70);
    expect(maskLarge?.height).toBe(70);
  });
});
