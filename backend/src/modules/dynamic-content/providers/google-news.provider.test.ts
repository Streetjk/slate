import { afterEach, describe, expect, it } from 'bun:test';
import { GoogleNewsProvider, parseGoogleNewsRss } from './google-news.provider';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const rss = (title: string, source: string, link: string) =>
  `<rss><channel><item><title><![CDATA[${title} &amp; more]]></title><link>${link}</link><source>${source}</source><pubDate>Tue, 01 Sep 2026 13:00:00 GMT</pubDate></item></channel></rss>`;

describe('Google News provider', () => {
  it('parses bounded AU and TW RSS item fields without article bodies', () => {
    const items = parseGoogleNewsRss(
      rss('Perth public transport update', 'ABC News', 'https://news.google.com/articles/au-1') +
        rss('臺灣天氣預報更新', '中央社', 'https://news.google.com/articles/tw-1')
    );
    expect(items).toEqual([
      {
        title: 'Perth public transport update & more',
        source: 'ABC News',
        link: 'https://news.google.com/articles/au-1',
        publishedAt: 'Tue, 01 Sep 2026 13:00:00 GMT',
      },
      {
        title: '臺灣天氣預報更新 & more',
        source: '中央社',
        link: 'https://news.google.com/articles/tw-1',
        publishedAt: 'Tue, 01 Sep 2026 13:00:00 GMT',
      },
    ]);
  });

  it('rejects entity declarations and non-Google links', () => {
    expect(parseGoogleNewsRss('<!DOCTYPE rss [<!ENTITY x "bad">]><rss/>')).toEqual([]);
    expect(parseGoogleNewsRss(rss('bad', 'source', 'https://example.com/story'))).toEqual([]);
  });

  it('fetches both fixed editions and returns separate sections', async () => {
    const requested: string[] = [];
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      requested.push(String(input));
      const tw = String(input).includes('zh-TW');
      return new Response(
        rss(
          tw ? '臺灣焦點' : 'Perth focus',
          tw ? '中央社' : 'ABC News',
          `https://news.google.com/articles/${tw ? 'tw' : 'au'}`
        ),
        {
          headers: { 'content-type': 'application/rss+xml' },
        }
      );
    }) as unknown as typeof fetch;
    const provider = new GoogleNewsProvider();
    const data = await provider.fetchData(
      provider.validateConfig({ type: 'google_news', edition: 'both' }),
      { now: new Date('2026-09-01T13:00:00Z') }
    );
    expect(requested).toHaveLength(2);
    expect(data.sections.map((section) => section.edition)).toEqual(['au', 'tw']);
  });
});
