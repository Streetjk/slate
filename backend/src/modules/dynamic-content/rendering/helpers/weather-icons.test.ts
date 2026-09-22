import { describe, expect, it } from 'bun:test';
import {
  loadWeatherIconMask,
  mapWmoToQWeather,
  normalizeIconCode,
  resolveIconPath,
} from './weather-icons';

describe('weather icon asset resolution', () => {
  const requiredWmoCodes = [
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ];

  it('maps required Open-Meteo WMO codes away from unknown fallback', () => {
    for (const code of requiredWmoCodes) {
      const resolved = resolveIconPath(code);
      expect(resolved).not.toBeNull();
      expect(resolved).not.toContain('999.svg');
      expect(resolved?.endsWith('.svg')).toBe(true);
      expect(mapWmoToQWeather(code)).toBeDefined();
    }
  });

  it('preserves reviewed semantic mappings and exact asset paths', () => {
    const pairs: Array<[number, number, string]> = [
      [0, 100, '100.svg'],
      [1, 102, '102.svg'],
      [2, 103, '103.svg'],
      [3, 104, '104.svg'],
      [45, 501, '501.svg'],
      [51, 309, '309.svg'],
      [56, 313, '313.svg'],
      [61, 305, '305.svg'],
      [63, 306, '306.svg'],
      [65, 307, '307.svg'],
      [71, 400, '400.svg'],
      [73, 401, '401.svg'],
      [80, 300, '300.svg'],
      [82, 301, '301.svg'],
      [85, 407, '407.svg'],
      [95, 302, '302.svg'],
      [96, 304, '304.svg'],
      [99, 304, '304.svg'],
    ];
    for (const [wmoCode, expectedQWeatherCode, expectedSvg] of pairs) {
      expect(mapWmoToQWeather(wmoCode)).toBe(expectedQWeatherCode);
      expect(resolveIconPath(wmoCode)).toContain(expectedSvg);
    }
  });

  it('keeps unknown codes on the explicit unknown fallback', () => {
    for (const code of [-1, 42, 88, 999, 1234]) {
      expect(resolveIconPath(code)).toContain('999.svg');
      expect(mapWmoToQWeather(code)).toBeUndefined();
    }
  });

  it('preserves QWeather codes and mask caching', async () => {
    for (const code of [100, 101, 103, 104, 300, 305, 306, 501]) {
      expect(resolveIconPath(code)).toContain(`${code}.svg`);
      expect(mapWmoToQWeather(code)).toBeUndefined();
    }
    expect(normalizeIconCode(null)).toBe(999);
    const first = await loadWeatherIconMask(0, 'tiny');
    expect(first).not.toBeNull();
    expect(first?.width).toBe(30);
    expect(first?.height).toBe(30);
    expect(await loadWeatherIconMask(0, 'tiny')).toBe(first);
    expect(await loadWeatherIconMask(100, 'tiny')).toBe(first);
  });
});
