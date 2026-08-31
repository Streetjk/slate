import { describe, expect, it } from 'bun:test';
import { weatherAlertEmptyStateText } from './weather-frame-renderer';

describe('weatherAlertEmptyStateText', () => {
  it('separates a regional label from the English empty state', () => {
    expect(weatherAlertEmptyStateText('Guangdong')).toBe('Guangdong: No active alerts');
  });

  it('uses the national empty state when no region is configured', () => {
    expect(weatherAlertEmptyStateText('')).toBe('No active weather alerts');
  });
});
