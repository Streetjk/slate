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
