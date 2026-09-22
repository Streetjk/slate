import { describe, expect, test } from 'bun:test';
import {
  defaultDynamicFrameName,
  deviceStatusBarText,
  weatherAlertStatusBarText,
} from './dynamic-content-status-text';

describe('dynamic content English status text', () => {
  test('uses English default frame names', () => {
    expect(defaultDynamicFrameName('daily_calendar')).toBe('Calendar');
    expect(defaultDynamicFrameName('month_calendar')).toBe('Monthly calendar');
    expect(defaultDynamicFrameName('history_today')).toBe('Today in history');
    expect(defaultDynamicFrameName('earthquake_report')).toBe('Earthquake reports');
  });

  test('formats device status-bar dates in English', () => {
    expect(
      deviceStatusBarText({
        kind: 'dynamic',
        frameName: 'Calendar',
        dynamicType: 'daily_calendar',
        dynamicConfig: { type: 'daily_calendar', tz: 'Asia/Shanghai' },
        dynamicData: { month: 8, day: 31 },
        renderedAt: new Date('2026-08-31T00:00:00.000Z'),
      })
    ).toBe('8/31');
  });

  test('uses the shifted month in monthly-calendar status text', () => {
    expect(
      deviceStatusBarText({
        kind: 'dynamic',
        frameName: 'Monthly calendar',
        dynamicType: 'month_calendar',
        dynamicConfig: { type: 'month_calendar', tz: 'Australia/Perth', month_offset: 1 },
        renderedAt: new Date('2026-09-22T12:00:00.000Z'),
      })
    ).toBe('2026/10');
  });

  test('uses English weather alert fallback text', () => {
    expect(weatherAlertStatusBarText({ type: 'weather_alert', province: '' })).toBe(
      'National weather alerts'
    );
  });
});
