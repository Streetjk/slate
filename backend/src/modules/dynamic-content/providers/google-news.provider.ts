import { Injectable, Logger } from '@nestjs/common';
import { GoogleNewsConfig, type GoogleNewsConfigT } from 'shared';
import { fetchResponse } from '../../../common/http/fetch';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';
import {
  DEFAULT_PROVIDER_CACHE_TTL_SEC,
  DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
} from './provider-cache';

export interface GoogleNewsItem {
  title: string;
  source: string;
  link: string;
  publishedAt?: string;
}

export interface GoogleNewsSection {
  edition: 'au' | 'tw';
  label: 'AU' | 'TW';
  items: GoogleNewsItem[];
}

export interface GoogleNewsProviderData {
  edition: GoogleNewsConfigT['edition'];
  updatedAt: string;
  sections: GoogleNewsSection[];
}

export const GOOGLE_NEWS_FEEDS = {
  au: 'https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en',
  tw: 'https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
} as const;

const MAX_ITEMS = 6;
const MAX_RESPONSE_BYTES = 512 * 1024;
const MAX_CACHE_ENTRIES = 4;

@Injectable()
export class GoogleNewsProvider implements DataProvider<GoogleNewsConfigT, GoogleNewsProviderData> {
  readonly type = 'google_news';
  private readonly logger = new Logger(GoogleNewsProvider.name);
  private readonly cache = new Map<string, { data: GoogleNewsSection; fetchedAt: number }>();
  private readonly inflight = new Map<string, Promise<GoogleNewsSection>>();

  validateConfig(raw: unknown): GoogleNewsConfigT {
    return GoogleNewsConfig.parse(raw);
  }

  async fetchData(
    config: GoogleNewsConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<GoogleNewsProviderData> {
    const editions: Array<'au' | 'tw'> =
      config.edition === 'both' ? ['au', 'tw'] : [config.edition];
    const results = await Promise.allSettled(
      editions.map((edition) => this.fetchSection(edition, config, ctx))
    );
    const sections = results.map((result, index) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            edition: editions[index]!,
            label: editions[index] === 'au' ? ('AU' as const) : ('TW' as const),
            items: [],
          }
    );
    if (sections.some((section) => section.items.length > 0)) {
      return { edition: config.edition, updatedAt: ctx.now.toISOString(), sections };
    }
    const failure = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );
    throw failure?.reason instanceof Error
      ? failure.reason
      : new Error('Google News feeds returned no items');
  }

  private async fetchSection(
    edition: 'au' | 'tw',
    config: GoogleNewsConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<GoogleNewsSection> {
    const now = ctx.now.getTime();
    const ttlMs =
      Math.max(config.refresh_interval_sec ?? DEFAULT_PROVIDER_CACHE_TTL_SEC, 300) * 1000;
    const cached = this.cache.get(edition);
    if (cached && now - cached.fetchedAt < ttlMs) return cached.data;
    if (cached) this.cache.delete(edition);
    const existing = this.inflight.get(edition);
    if (existing) return existing;
    const task = this.fetchFresh(edition).finally(() => this.inflight.delete(edition));
    this.inflight.set(edition, task);
    try {
      const section = await task;
      if (section.items.length > 0) {
        this.cache.set(edition, { data: section, fetchedAt: now });
        while (this.cache.size > MAX_CACHE_ENTRIES)
          this.cache.delete(this.cache.keys().next().value!);
      }
      return section;
    } catch (error) {
      this.logger.warn(
        `Google News ${edition} fetch failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  private async fetchFresh(edition: 'au' | 'tw'): Promise<GoogleNewsSection> {
    const response = await fetchResponse(GOOGLE_NEWS_FEEDS[edition], {
      timeoutMs: DEFAULT_PROVIDER_FETCH_TIMEOUT_MS,
      userAgent: 'Slate/1.0 (+personal e-paper reader)',
    });
    const xml = await readBoundedText(response, MAX_RESPONSE_BYTES);
    return {
      edition,
      label: edition === 'au' ? 'AU' : 'TW',
      items: parseGoogleNewsRss(xml).slice(0, MAX_ITEMS),
    };
  }
}

export function parseGoogleNewsRss(xml: string): GoogleNewsItem[] {
  if (xml.length > MAX_RESPONSE_BYTES || /<!DOCTYPE|<!ENTITY/i.test(xml)) return [];
  const items: GoogleNewsItem[] = [];
  for (const match of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const body = match[1] ?? '';
    const title = decodeXml(readTag(body, 'title'));
    const link = decodeXml(readTag(body, 'link'));
    const source = decodeXml(readTag(body, 'source'));
    const publishedAt = decodeXml(readTag(body, 'pubDate'));
    if (!title || !link || !/^https:\/\/news\.google\.com\//i.test(link)) continue;
    if (items.some((item) => item.title === title || item.link === link)) continue;
    items.push({
      title,
      source: source || 'Google News',
      link,
      ...(publishedAt ? { publishedAt } : {}),
    });
    if (items.length >= MAX_ITEMS) break;
  }
  return items;
}

function readTag(body: string, tag: string): string {
  const match = body.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1]?.trim() ?? '';
}

function decodeXml(value: string): string {
  return value
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, value: string) => {
      const radix = value.startsWith('x') || value.startsWith('X') ? 16 : 10;
      const code = Number.parseInt(value.replace(/^x/i, ''), radix);
      return Number.isSafeInteger(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function readBoundedText(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (total <= maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error('Google News response exceeds size limit');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}
