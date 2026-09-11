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
  Mail,
  Newspaper,
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
    hint: 'Perth date · English weekday · WA holiday',
    description: "Shows today's English Gregorian date in Australia/Perth.",
    hasConfigurableParams: false,
    supportsAudio: true,
    Icon: Calendar,
  },
  month_calendar: {
    label: 'Monthly calendar',
    hint: 'English month grid · WA public holidays',
    description: 'Shows the current month in English with confirmed WA public holidays.',
    hasConfigurableParams: false,
    supportsAudio: true,
    Icon: CalendarDays,
  },
  weather: {
    label: 'Weather',
    hint: 'Live temperature / humidity / wind speed',
    description: 'Shows live metric weather by city using Open-Meteo or QWeather.',
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
  outlook_calendar: {
    label: 'Outlook calendar',
    hint: 'Read-only agenda · Australia/Perth',
    description: 'Shows a cached read-only agenda from the connected Microsoft Outlook account.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: Mail,
  },
  google_news: {
    label: 'Google News',
    hint: 'Australia · Taiwan · combined editions',
    description: 'Shows compact headlines from fixed Google News RSS editions.',
    hasConfigurableParams: true,
    supportsAudio: false,
    Icon: Newspaper,
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
  'outlook_calendar',
  'google_news',
  'hot_list',
  'dashboard',
  'font_test',
] as const satisfies readonly DynamicTypeT[];
