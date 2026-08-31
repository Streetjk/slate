import { Injectable } from '@nestjs/common';
import {
  BtcPriceConfig,
  PriceSeries,
  type BtcPriceConfigT,
  type PricePeriodT,
  type PriceSeriesT,
} from 'shared';
import { fetchJson } from '../../../common/http/fetch';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';
import {
  CachedInflightFetcher,
  DEFAULT_PROVIDER_CACHE_TTL_SEC,
  DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
} from './provider-cache';

const SPOT_URL = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';
const CANDLES_URL = 'https://api.exchange.coinbase.com/products/BTC-USD/candles';
const MAX_CACHE_ENTRIES = 8;

const GRANULARITY_BY_PERIOD: Record<PricePeriodT, number> = {
  daily: 300,
  weekly: 3600,
  monthly: 86400,
};

interface CoinbaseSpotResponse {
  data?: { amount?: string; base?: string; currency?: string };
}

type CoinbaseCandle = unknown[];

@Injectable()
export class BtcPriceProvider implements DataProvider<BtcPriceConfigT, PriceSeriesT> {
  readonly type = 'btc_price';
  private readonly fetcher = new CachedInflightFetcher<string, PriceSeriesT>(MAX_CACHE_ENTRIES);

  validateConfig(raw: unknown): BtcPriceConfigT {
    return BtcPriceConfig.parse(raw);
  }

  async fetchData(config: BtcPriceConfigT, ctx: DynamicContentFetchCtx): Promise<PriceSeriesT> {
    const key = `BTC-USD:${config.period}`;
    const now = ctx.now.getTime();
    const ttlSec = Math.max(config.refresh_interval_sec ?? DEFAULT_PROVIDER_CACHE_TTL_SEC, 300);
    return this.fetcher.getOrFetch(key, now, ttlSec * 1000, async () => {
      try {
        return await this.fetchFresh(config.period, ctx.now);
      } catch (error) {
        const fallback = fallbackSeries(config, ctx.lastData);
        if (fallback) return fallback;
        throw error;
      }
    });
  }

  private async fetchFresh(period: PricePeriodT, now: Date): Promise<PriceSeriesT> {
    const granularity = GRANULARITY_BY_PERIOD[period];
    const candlesUrl = `${CANDLES_URL}?granularity=${granularity}`;
    const [spot, candles] = await Promise.all([
      fetchJson<CoinbaseSpotResponse>(SPOT_URL, {
        timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
        requireJsonContentType: true,
      }),
      fetchJson<CoinbaseCandle[]>(candlesUrl, {
        timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
        requireJsonContentType: true,
      }),
    ]);

    const currentPriceUsd = parseCoinbaseAmount(spot.data?.amount);
    if (currentPriceUsd === null) throw new Error('Coinbase spot response has no valid BTC price');
    const points = normalizeCoinbaseCandles(candles);
    if (points.length === 0) throw new Error('Coinbase candles response has no valid BTC points');

    const firstPrice = points[0]!.priceUsd;
    const changePercent =
      firstPrice > 0 ? ((currentPriceUsd - firstPrice) / firstPrice) * 100 : undefined;
    return PriceSeries.parse({
      symbol: 'BTC/USD',
      period,
      points,
      fetchedAt: now.toISOString(),
      currentPriceUsd,
      changePercent,
    });
  }
}

export function parseCoinbaseAmount(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeCoinbaseCandles(candles: unknown): PriceSeriesT['points'] {
  if (!Array.isArray(candles)) return [];
  const points = candles.flatMap((candle) => {
    if (!Array.isArray(candle) || candle.length < 5) return [];
    const timestamp = parseFiniteNumber(candle[0]);
    const close = parseFiniteNumber(candle[4]);
    if (timestamp === null || close === null || timestamp <= 0 || close < 0) return [];
    return [{ timestamp: new Date(timestamp * 1000).toISOString(), priceUsd: close }];
  });
  const unique = new Map(points.map((point) => [point.timestamp, point]));
  return [...unique.values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function parseFiniteNumber(value: unknown): number | null {
  const parsed =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function fallbackSeries(config: BtcPriceConfigT, lastData: unknown): PriceSeriesT | null {
  const parsed = PriceSeries.safeParse(lastData);
  if (!parsed.success || parsed.data.symbol !== 'BTC/USD' || parsed.data.period !== config.period) {
    return null;
  }
  return parsed.data;
}
