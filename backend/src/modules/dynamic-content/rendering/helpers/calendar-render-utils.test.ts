import { describe, expect, it } from 'bun:test';
import { monthCellSubtitle } from './calendar-render-utils';

describe('calendar-render-utils', () => {
  describe('monthCellSubtitle', () => {
    it('returns empty string when dayData is not a record', () => {
      expect(monthCellSubtitle(null)).toBe('');
      expect(monthCellSubtitle(undefined)).toBe('');
      expect(monthCellSubtitle(123)).toBe('');
      expect(monthCellSubtitle('text')).toBe('');
    });

    it('returns empty string when public_holiday is absent or null', () => {
      expect(monthCellSubtitle({})).toBe('');
      expect(monthCellSubtitle({ public_holiday: null })).toBe('');
      expect(monthCellSubtitle({ public_holiday: '' })).toBe('');
    });

    it('returns public holiday name limited to 12 characters', () => {
      expect(monthCellSubtitle({ public_holiday: 'WA Day' })).toBe('WA Day');
      expect(monthCellSubtitle({ public_holiday: "King's Birthday" })).toBe("King's Birth");
      expect(monthCellSubtitle({ public_holiday: 'Christmas Day' })).toBe('Christmas Da');
    });

    it('ignores Chinese lunar dates, solar terms, and festivals in favor of public holiday', () => {
      expect(
        monthCellSubtitle({
          lunar_date: '农历四月初一',
          solar_term: '小满',
          festival: '端午节',
          public_holiday: null,
        })
      ).toBe('');

      expect(
        monthCellSubtitle({
          lunar_date: '农历四月初一',
          solar_term: '小满',
          festival: '端午节',
          public_holiday: 'WA Day',
        })
      ).toBe('WA Day');
    });
  });
});
