import { Injectable } from '@nestjs/common';
import {
  BtcPriceConfig,
  DailyCalendarConfig,
  DynamicConfig,
  MonthCalendarConfig,
  OutlookCalendarConfig,
  WeatherConfig,
  type DynamicConfigT,
  type NavigationBundleT,
  type PricePeriodT,
} from 'shared';
import { computeETag } from '../../common/utils/etag';
import { getDateTimeFormat } from '../../common/utils/intl';
import { BlobService } from '../../infra/blob/blob.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { DynamicContentRegistry } from './dynamic-content-registry';
import { DynamicContentRendererService } from './dynamic-content-renderer.service';
import { NAVIGATION_BUNDLE_RENDER_VERSION } from './dynamic-navigation-version';
import { dynamicViewDate } from './timezone';
const BTC_PERIODS: readonly PricePeriodT[] = ['daily', 'three_day', 'weekly', 'monthly'];
const BTC_KEY: Record<PricePeriodT, string> = {
  daily: '1d',
  three_day: '3d',
  weekly: '7d',
  monthly: '1m',
};
const BTC_LABEL: Record<PricePeriodT, string> = {
  daily: '1D',
  three_day: '3D',
  weekly: '7D',
  monthly: '1M',
};

type SupportedConfig = Extract<
  DynamicConfigT,
  {
    type: 'btc_price' | 'daily_calendar' | 'month_calendar' | 'outlook_calendar' | 'weather';
  }
>;

interface VariantSpec {
  key: string;
  label: string;
  statusBarText?: string;
  config: SupportedConfig;
}

interface CachedBundle {
  sourceToken: string;
  groupId: string;
  bundle: NavigationBundleT;
}

@Injectable()
export class DynamicNavigationBundleService {
  private readonly cache = new Map<string, CachedBundle>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly blob: BlobService,
    private readonly registry: DynamicContentRegistry,
    private readonly renderer: DynamicContentRendererService
  ) {}

  async bundleForContent(contentId: string): Promise<NavigationBundleT | null> {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: {
        id: true,
        groupId: true,
        frameName: true,
        kind: true,
        contentEtag: true,
        dynamicType: true,
        dynamicConfig: true,
        dynamicData: true,
        dynamicLastRunAt: true,
        group: { select: { ownerUserId: true } },
      },
    });
    if (!content || content.kind !== 'dynamic' || !content.dynamicType) return null;

    const parsed = DynamicConfig.safeParse(content.dynamicConfig);
    if (!parsed.success || !isSupportedConfig(parsed.data)) return null;
    const base = parsed.data;

    const sourceToken = `${content.contentEtag}:${content.dynamicLastRunAt?.toISOString() ?? 'never'}`;
    const cached = this.cache.get(content.id);
    if (cached?.sourceToken === sourceToken) return cached.bundle;

    const entry = this.registry.get(base.type);
    if (!entry) return null;

    const now = content.dynamicLastRunAt ?? new Date();
    const specs = variantSpecs(base, now);
    const variants: NavigationBundleT['variants'] = [];

    for (const spec of specs) {
      const isSelected = spec.key === selectedKey(base);
      const data =
        isSelected && content.dynamicData != null
          ? content.dynamicData
          : await entry.provider.fetchData(spec.config as never, {
              now,
              ownerUserId: content.group.ownerUserId,
              lastData: undefined,
            });

      const image = await this.renderer.renderPreviewDirect(
        base.type,
        spec.config,
        content.frameName,
        data
      );
      const imageEtag = computeETag(image);
      await this.blob.write(content.groupId, navAssetId(content.id, spec.key), 'image', image);
      variants.push({
        key: spec.key,
        label: spec.label,
        image_etag: imageEtag,
        image_size: image.byteLength,
        status_bar_text: spec.statusBarText ?? spec.label,
      });
    }

    const selected = selectedKey(base);
    const revision = computeETag(
      JSON.stringify({
        renderVersion: NAVIGATION_BUNDLE_RENDER_VERSION,
        sourceToken,
        selected,
        variants: variants.map((variant) => [
          variant.key,
          variant.image_etag,
          variant.label,
          variant.status_bar_text,
        ]),
      })
    );
    const bundle: NavigationBundleT = {
      revision,
      selected_key: selected,
      wrap: base.type === 'btc_price',
      variants,
    };
    this.cache.set(content.id, { sourceToken, groupId: content.groupId, bundle });
    return bundle;
  }

  async readVariantImage(
    contentId: string,
    key: string
  ): Promise<{ data: Buffer; etag: string } | null> {
    if (!isVariantKey(key)) return null;
    const bundle = await this.bundleForContent(contentId);
    const variant = bundle?.variants.find((candidate) => candidate.key === key);
    const cached = this.cache.get(contentId);
    if (!variant || !cached) return null;
    const data = await this.blob.read(cached.groupId, navAssetId(contentId, key), 'image');
    if (!data) return null;
    return { data, etag: variant.image_etag };
  }
}

function isSupportedConfig(config: DynamicConfigT): config is SupportedConfig {
  return (
    config.type === 'btc_price' ||
    config.type === 'daily_calendar' ||
    config.type === 'month_calendar' ||
    config.type === 'outlook_calendar' ||
    (config.type === 'weather' && config.provider === 'open_meteo')
  );
}

function variantSpecs(base: SupportedConfig, now: Date): VariantSpec[] {
  if (base.type === 'btc_price') {
    return BTC_PERIODS.map((period) => ({
      key: BTC_KEY[period],
      label: BTC_LABEL[period],
      config: BtcPriceConfig.parse({ ...base, period }),
    }));
  }

  if (base.type === 'weather') {
    const labels = ['Previous 3 days', 'Current 3 days', 'Next 3 days'] as const;
    return [-1, 0, 1].map((offset, index) => ({
      key: weatherKey(offset),
      label: labels[index]!,
      statusBarText: `${base.location_label} weather`,
      config: WeatherConfig.parse({ ...base, page_offset: offset }),
    }));
  }

  if (base.type === 'month_calendar') {
    return centeredOffsets(base.month_offset, 6, -24, 24).map((offset) => {
      const config = MonthCalendarConfig.parse({ ...base, month_offset: offset });
      return {
        key: monthKey(offset),
        label: navigationDateLabel(config, now),
        config,
      };
    });
  }

  const offsets = centeredOffsets(base.day_offset, 7, -31, 31);
  if (base.type === 'daily_calendar') {
    return offsets.map((offset) => {
      const config = DailyCalendarConfig.parse({ ...base, day_offset: offset });
      return {
        key: dayKey(offset),
        label: navigationDateLabel(config, now),
        config,
      };
    });
  }

  return offsets.map((offset) => {
    const config = OutlookCalendarConfig.parse({ ...base, day_offset: offset });
    return {
      key: dayKey(offset),
      label: navigationDateLabel(config, now),
      config,
    };
  });
}

function selectedKey(base: SupportedConfig): string {
  if (base.type === 'btc_price') return BTC_KEY[base.period];
  if (base.type === 'weather') return weatherKey(base.page_offset);
  if (base.type === 'month_calendar') return monthKey(base.month_offset);
  return dayKey(base.day_offset);
}

function centeredOffsets(current: number, radius: number, min: number, max: number): number[] {
  const start = Math.max(min, current - radius);
  const end = Math.min(max, current + radius);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function dayKey(offset: number): string {
  return offset < 0 ? `d_m${Math.abs(offset)}` : `d_p${offset}`;
}

function monthKey(offset: number): string {
  return offset < 0 ? `m_m${Math.abs(offset)}` : `m_p${offset}`;
}

function weatherKey(offset: number): string {
  return offset < 0 ? `w_m${Math.abs(offset)}` : `w_p${offset}`;
}

function navigationDateLabel(config: SupportedConfig, now: Date): string {
  if (config.type === 'btc_price') return BTC_LABEL[config.period];

  const target = dynamicViewDate(config, now);
  if (config.type === 'month_calendar') {
    return getDateTimeFormat('en-AU', {
      timeZone: config.tz,
      month: 'long',
      year: 'numeric',
    }).format(target);
  }

  return getDateTimeFormat('en-AU', {
    timeZone: config.tz,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(target);
}

export function navAssetId(contentId: string, key: string): string {
  if (!isVariantKey(key)) throw new Error('invalid navigation variant key');
  return `${contentId}.nav.${key}`;
}

function isVariantKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{1,48}$/.test(key);
}
