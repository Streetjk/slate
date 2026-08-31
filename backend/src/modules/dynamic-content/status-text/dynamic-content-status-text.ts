import type { ContentKind, Prisma } from '@prisma/client';
import {
  DASHBOARD_SYSTEM_TEMPLATES,
  DashboardConfig,
  FONT_TEST_FONTS,
  HotListConfig,
  hotListSourceShortLabel,
  normalizeWeatherAlertProvince,
} from 'shared';
import { recordValue, valueText } from '../../../common/utils/value-utils';
import { cnMonthDay, datePartsInTz, timezoneFromConfig } from '../timezone';

export interface ContentStatusBarSource {
  kind: ContentKind;
  frameName: string | null;
  dynamicType: string | null;
  dynamicConfig?: Prisma.JsonValue | null;
  dynamicData?: Prisma.JsonValue | null;
  renderedAt?: Date | null;
}

export function deviceStatusBarText(row: ContentStatusBarSource): string {
  if (row.kind !== 'dynamic') return row.frameName ?? '';
  // 依赖 renderedAt 的动态类型在首次渲染前用 frameName 占位。
  // 不用 `new Date()` 兜底：会让 etag 计算路径在每次刷新时漂移，下游 manifest etag
  // 持续抖动到首次渲染落库，把 304 缓存优势打掉。
  switch (row.dynamicType) {
    case 'daily_calendar':
      if (!row.renderedAt) return row.frameName ?? '';
      return dailyCalendarStatusBarText(row.dynamicData, row.dynamicConfig, row.renderedAt);
    case 'month_calendar':
      if (!row.renderedAt) return row.frameName ?? '';
      return monthCalendarStatusBarText(row.dynamicConfig, row.renderedAt);
    case 'history_today':
      if (!row.renderedAt) return row.frameName ?? '';
      return historyTodayStatusBarText(row.dynamicData, row.dynamicConfig, row.renderedAt);
    case 'weather_alert':
      return weatherAlertStatusBarText(row.dynamicConfig);
    case 'earthquake_report':
      return 'Earthquake reports';
    case 'btc_price':
      return 'BTC/USD';
    case 'weather':
      return weatherStatusBarText(row.dynamicConfig);
    case 'dashboard':
      return row.frameName ?? dashboardStatusBarText(row.dynamicConfig);
    case 'font_test':
      return fontTestStatusBarText(row.dynamicConfig);
    case 'hot_list':
      return hotListStatusBarText(row.dynamicConfig);
    default:
      return row.frameName ?? '';
  }
}

export function defaultDynamicFrameName(
  dynamicType: string | null,
  config?: unknown
): string | null {
  switch (dynamicType) {
    case 'daily_calendar':
      return 'Calendar';
    case 'month_calendar':
      return 'Monthly calendar';
    case 'history_today':
      return 'Today in history';
    case 'weather_alert':
      return weatherAlertStatusBarText(config);
    case 'earthquake_report':
      return 'Earthquake reports';
    case 'btc_price':
      return 'BTC/USD';
    case 'weather':
      return weatherStatusBarText(config);
    case 'dashboard':
      return dashboardStatusBarText(config);
    case 'font_test':
      return fontTestStatusBarText(config);
    case 'hot_list':
      return hotListStatusBarText(config);
    default:
      return null;
  }
}

function dailyCalendarStatusBarText(
  data: Prisma.JsonValue | null | undefined,
  config: Prisma.JsonValue | null | undefined,
  renderedAt: Date
): string {
  const parts = datePartsInTz(renderedAt, timezoneFromConfig(config));
  const month = valueText(recordValue(data, 'month')) ?? String(parts.month);
  const day = valueText(recordValue(data, 'day')) ?? String(parts.day);
  return `${Number(month)}/${Number(day)}`;
}

function monthCalendarStatusBarText(
  config: Prisma.JsonValue | null | undefined,
  renderedAt: Date
): string {
  const parts = datePartsInTz(renderedAt, timezoneFromConfig(config));
  return `${parts.year}/${parts.month}`;
}

function historyTodayStatusBarText(
  data: Prisma.JsonValue | null | undefined,
  config: Prisma.JsonValue | null | undefined,
  renderedAt: Date
): string {
  const label =
    valueText(recordValue(data, 'dateLabel')) ?? cnMonthDay(renderedAt, timezoneFromConfig(config));
  return `History on ${label.replace(/\s+/g, '').replace(/^(\d+)月(\d+)日$/, '$1/$2')}`;
}

export function weatherStatusBarText(config: unknown): string {
  const location = valueText(recordValue(config, 'location_label')) ?? 'Weather';
  return location === 'Weather' ? 'Weather' : `${location} weather`;
}

export function weatherAlertStatusBarText(config: unknown): string {
  const province = normalizeWeatherAlertProvince(valueText(recordValue(config, 'province')) ?? '');
  return `${province || 'National'} weather alerts`;
}

export function dashboardStatusBarText(config: unknown): string {
  const parsed = DashboardConfig.safeParse(config);
  if (!parsed.success) return 'External data';
  if (parsed.data.template.kind === 'system') {
    return DASHBOARD_SYSTEM_TEMPLATES[parsed.data.template.id]?.label ?? 'External data';
  }
  return parsed.data.template.template.name?.trim() || 'Custom template';
}

export function fontTestStatusBarText(config: unknown): string {
  const id = valueText(recordValue(config, 'font_id'));
  return id ? (FONT_TEST_FONTS.find((font) => font.id === id)?.label ?? 'Font test') : 'Font test';
}

export function hotListStatusBarText(config: unknown): string {
  const parsed = HotListConfig.safeParse(config);
  if (!parsed.success) return 'Trending list';
  return `${hotListSourceShortLabel(parsed.data.source)} trending`;
}
