import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import sharp from 'sharp';
import { setBoundedCache } from '../../../../common/utils/cache-utils';
import { QWEATHER_ICON_SVG_DIR } from '../../../../infra/assets/asset-paths';
import type { BitmapMask } from '../bitmap-canvas';

export type WeatherIconSize = 'tiny' | 'large';

const ICON_SIZE_PX: Record<WeatherIconSize, number> = {
  tiny: 30,
  large: 70,
};

const logger = new Logger('WeatherIcons');
const cache = new Map<string, Promise<BitmapMask | null>>();
const MAX_ICON_CACHE_ENTRIES = 256;

export function loadWeatherIconMask(
  code: number | null,
  size: WeatherIconSize
): Promise<BitmapMask | null> {
  const normalized = normalizeIconCode(code);
  const key = `${normalized}:${size}`;
  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }
  const task = renderWeatherIconMask(normalized, size).catch((err: unknown) => {
    cache.delete(key);
    logger.warn(`Weather icon ${normalized} failed to load at size ${size}: ${formatError(err)}`);
    return null;
  });
  setBoundedCache(cache, key, task, MAX_ICON_CACHE_ENTRIES);
  return task;
}

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

async function renderWeatherIconMask(
  code: number,
  size: WeatherIconSize
): Promise<BitmapMask | null> {
  const file = resolveIconPath(code);
  if (!file) return null;

  const px = ICON_SIZE_PX[size];
  const svg = await readFile(file, 'utf8');
  const normalizedSvg = svg.replace(/currentColor/g, '#000');
  const raw = await sharp(Buffer.from(normalizedSvg), { density: 384 })
    .resize(px, px, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const pixels = new Uint8Array(px * px);
  for (let i = 0, p = 0; i < raw.length; i += 4, p++) {
    const alpha = raw[i + 3] ?? 0;
    const luma = raw[i] ?? 255;
    pixels[p] = alpha > 72 && luma < 220 ? 1 : 0;
  }
  return { width: px, height: px, pixels };
}

export const WMO_TO_QWEATHER_MAP: Record<number, number> = {
  0: 100,
  1: 101,
  2: 103,
  3: 104,
  45: 501,
  48: 501,
  51: 309,
  53: 309,
  55: 309,
  56: 309,
  57: 309,
  61: 305,
  63: 306,
  65: 307,
  66: 313,
  67: 313,
  71: 400,
  73: 401,
  75: 402,
  77: 400,
  80: 300,
  81: 300,
  82: 301,
  85: 406,
  86: 406,
  95: 302,
  96: 304,
  99: 304,
};

export function mapWmoToQWeather(code: number): number | undefined {
  return WMO_TO_QWEATHER_MAP[code];
}

export function resolveIconPath(code: number): string | null {
  const mapped = mapWmoToQWeather(code) ?? code;
  const preferred = join(QWEATHER_ICON_SVG_DIR, `${mapped}.svg`);
  if (existsSync(preferred)) return preferred;
  const fallback = join(QWEATHER_ICON_SVG_DIR, '999.svg');
  return existsSync(fallback) ? fallback : null;
}

export function normalizeIconCode(code: number | null): number {
  if (code !== null && Number.isFinite(code)) {
    const int = Math.trunc(code);
    return mapWmoToQWeather(int) ?? int;
  }
  return 999;
}
