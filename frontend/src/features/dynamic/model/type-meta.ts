import {
  Activity,
  BarChart3,
  Bell,
  BookText,
  Calendar,
  CalendarDays,
  CloudSun,
  Flame,
  Bitcoin,
  Type as TypeIcon,
  type LucideIcon,
} from 'lucide-react';
import type { DynamicTypeT } from 'shared';

export interface DynamicTypeMeta {
  label: string;
  hint: string;
  description: string;
  hasConfigurableParams: boolean;
  supportsAudio: boolean;
  Icon: LucideIcon;
}

export const DYNAMIC_TYPE_META = {
  daily_calendar: {
    label: 'Calendar',
    hint: 'Date · weekday · lunar date · solar term',
    description: "Shows today's Gregorian date, lunar date, and sexagenary cycle.",
    hasConfigurableParams: false,
    supportsAudio: true,
    Icon: Calendar,
  },
  month_calendar: {
    label: 'Monthly calendar',
    hint: 'Full month · lunar dates · holidays',
    description: 'Shows the calendar for the current month.',
    hasConfigurableParams: false,
    supportsAudio: true,
    Icon: CalendarDays,
  },
  weather: {
    label: 'Weather',
    hint: 'Live temperature / humidity / wind speed',
    description: 'Shows live weather by city. Data comes from QWeather.',
    hasConfigurableParams: true,
    supportsAudio: true,
    Icon: CloudSun,
  },
  history_today: {
    label: 'Today in history',
    hint: 'Historical events for today; updated daily',
    description: 'Automatically shows historical events for today from Wikipedia or Baidu Baike.',
    hasConfigurableParams: true,
    supportsAudio: true,
    Icon: BookText,
  },
  weather_alert: {
    label: 'Weather alerts',
    hint: 'National Meteorological Center · regional alerts',
    description: 'Shows weather alerts for the country or a selected province.',
    hasConfigurableParams: true,
    supportsAudio: true,
    Icon: Bell,
  },
  earthquake_report: {
    label: 'Earthquake reports',
    hint: 'China Earthquake Networks Center · latest reports',
    description: 'Shows the latest earthquake reports from the China Earthquake Networks Center.',
    hasConfigurableParams: true,
    supportsAudio: true,
    Icon: Activity,
  },
  btc_price: {
    label: 'BTC/USD',
    hint: 'Current price · daily / weekly / monthly chart',
    description: 'Shows cached Bitcoin price history in US dollars.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: Bitcoin,
  },
  dashboard: {
    label: 'External data',
    hint: 'Template + JSON data push',
    description: 'Choose a system or custom template, then push data to refresh the display.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: BarChart3,
  },
  font_test: {
    label: 'Font test',
    hint: 'Switch fonts · inspect 1bpp glyphs',
    description: 'Test Fusion Pixel font rendering on the e-paper display.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: TypeIcon,
  },
  hot_list: {
    label: 'Trending list',
    hint: 'Weibo / Zhihu / Bilibili and more',
    description:
      'Choose a site trend list, refresh it automatically, and show it as an e-paper list.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: Flame,
  },
} satisfies Record<DynamicTypeT, DynamicTypeMeta>;

export const DYNAMIC_TYPE_ORDER = [
  'daily_calendar',
  'month_calendar',
  'history_today',
  'weather',
  'weather_alert',
  'earthquake_report',
  'btc_price',
  'hot_list',
  'dashboard',
  'font_test',
] as const satisfies readonly DynamicTypeT[];
