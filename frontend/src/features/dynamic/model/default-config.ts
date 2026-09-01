import {
  DASHBOARD_CUSTOM_STARTER_TEMPLATE,
  DEFAULT_TTS_VOICE,
  type DynamicConfigT,
  type DynamicTypeT,
} from 'shared';

const LOCAL_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function defaultConfig(type: DynamicTypeT): DynamicConfigT {
  switch (type) {
    case 'daily_calendar':
      return {
        type: 'daily_calendar',
        tz: LOCAL_TIME_ZONE,
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
      };
    case 'month_calendar':
      return {
        type: 'month_calendar',
        tz: LOCAL_TIME_ZONE,
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
      };
    case 'weather':
      return {
        type: 'weather',
        tz: LOCAL_TIME_ZONE,
        provider: 'qweather',
        location_id: 'unconfigured',
        location_label: 'Select a city',
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
        refresh_interval_sec: 600,
      };
    case 'history_today':
      return {
        type: 'history_today',
        tz: LOCAL_TIME_ZONE,
        source: 'wikipedia',
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
      };
    case 'weather_alert':
      return {
        type: 'weather_alert',
        province: '',
        refresh_interval_sec: 600,
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
      };
    case 'earthquake_report':
      return {
        type: 'earthquake_report',
        refresh_interval_sec: 600,
        audio_enabled: false,
        audio_voice: DEFAULT_TTS_VOICE,
      };
    case 'btc_price':
      return {
        type: 'btc_price',
        period: 'daily',
        refresh_interval_sec: 600,
      };
    case 'outlook_calendar':
      return {
        type: 'outlook_calendar',
        tz: 'Australia/Perth',
        days_ahead: 7,
        max_events: 8,
        refresh_interval_sec: 600,
      };
    case 'dashboard':
      return {
        type: 'dashboard',
        template: { kind: 'custom', template: DASHBOARD_CUSTOM_STARTER_TEMPLATE },
        refresh_interval_sec: 600,
      };
    case 'font_test':
      return {
        type: 'font_test',
        font_id: 'fusion_pixel_12',
        invert: false,
      };
    case 'hot_list':
      return {
        type: 'hot_list',
        source: 'weibo',
        refresh_interval_sec: 600,
      };
  }
}
