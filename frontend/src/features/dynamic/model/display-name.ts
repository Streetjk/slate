import {
  DASHBOARD_SYSTEM_TEMPLATES,
  FONT_TEST_FONTS,
  hotListSourceShortLabel,
  normalizeWeatherAlertProvince,
  type DashboardConfigT,
  type DynamicConfigT,
  type DynamicTypeT,
} from 'shared';
import { zonedDateParts } from '@/features/dynamic/lib/date';

export function defaultDynamicFrameName(type: DynamicTypeT, config: DynamicConfigT): string {
  switch (type) {
    case 'daily_calendar':
      return 'Calendar';
    case 'month_calendar':
      return 'Monthly calendar';
    case 'weather':
      return config.type === 'weather' && config.location_label
        ? `${config.location_label} weather`
        : 'Weather';
    case 'history_today':
      return 'Today in history';
    case 'weather_alert':
      return dynamicStatusTitle(config) ?? 'Weather alerts';
    case 'earthquake_report':
      return 'Earthquake reports';
    case 'dashboard':
      return config.type === 'dashboard' ? dashboardStatusTitle(config) : 'External data';
    case 'font_test':
      return dynamicStatusTitle(config) ?? 'Font test';
    case 'hot_list':
      return dynamicStatusTitle(config) ?? 'Trending list';
  }
}

export function effectiveDynamicFrameName(
  type: DynamicTypeT,
  config: DynamicConfigT,
  frameName: string
): string {
  if (type === 'dashboard') return frameName.trim() || defaultDynamicFrameName(type, config);
  return defaultDynamicFrameName(type, config);
}

export function effectiveDynamicStatusBarText(
  type: DynamicTypeT | null,
  config: DynamicConfigT | null,
  frameName: string
): string | null {
  if (type === 'dashboard') {
    return (
      frameName.trim() ||
      (config?.type === 'dashboard' ? dashboardStatusTitle(config) : 'External data')
    );
  }
  return dynamicStatusTitle(config);
}

export function frameNameForSyncedDynamicConfigChange(
  previous: DynamicConfigT,
  next: DynamicConfigT
): string | null {
  if (
    next.type === 'weather' &&
    previous.type === 'weather' &&
    next.location_label !== previous.location_label
  ) {
    return defaultDynamicFrameName(next.type, next);
  }
  if (
    next.type === 'weather_alert' &&
    previous.type === 'weather_alert' &&
    next.province !== previous.province
  ) {
    return defaultDynamicFrameName(next.type, next);
  }
  return null;
}

export function dynamicStatusTitle(config: DynamicConfigT | null | undefined): string | null {
  if (!config) return null;

  switch (config.type) {
    case 'daily_calendar': {
      const date = zonedDateParts(new Date(), config.tz);
      return `${date.month}/${date.day}`;
    }
    case 'month_calendar': {
      const date = zonedDateParts(new Date(), config.tz);
      return `${date.year}/${date.month}`;
    }
    case 'weather':
      return config.location_label ? `${config.location_label} weather` : 'Weather';
    case 'history_today': {
      const date = zonedDateParts(new Date(), config.tz);
      return `History on ${date.month}/${date.day}`;
    }
    case 'weather_alert':
      return `${normalizeWeatherAlertProvince(config.province) || 'National'} weather alerts`;
    case 'earthquake_report':
      return 'Earthquake reports';
    case 'dashboard':
      return dashboardStatusTitle(config);
    case 'font_test':
      return FONT_TEST_FONTS.find((font) => font.id === config.font_id)?.label ?? 'Font test';
    case 'hot_list':
      return `${hotListSourceShortLabel(config.source)} trending`;
  }
}

export function dashboardStatusTitle(config: DashboardConfigT): string {
  if (config.template.kind === 'system') {
    return DASHBOARD_SYSTEM_TEMPLATES[config.template.id].label;
  }
  return config.template.template.name?.trim() || 'Custom template';
}
