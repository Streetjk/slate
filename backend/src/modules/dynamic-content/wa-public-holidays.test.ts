import { describe, expect, it } from 'bun:test';
import {
  WA_PUBLIC_HOLIDAYS_BY_YEAR,
  WA_PUBLIC_HOLIDAYS_SOURCE_AS_OF,
  waPublicHolidayOn,
} from './wa-public-holidays';

describe('WA public holidays', () => {
  it('contains every confirmed Perth date for 2026', () => {
    expect(WA_PUBLIC_HOLIDAYS_BY_YEAR[2026]?.map((holiday) => holiday.date)).toEqual([
      '2026-01-01',
      '2026-01-26',
      '2026-03-02',
      '2026-04-03',
      '2026-04-05',
      '2026-04-06',
      '2026-04-25',
      '2026-04-27',
      '2026-06-01',
      '2026-09-28',
      '2026-12-25',
      '2026-12-26',
      '2026-12-28',
    ]);
  });

  it('contains every confirmed Perth date for 2027', () => {
    expect(WA_PUBLIC_HOLIDAYS_BY_YEAR[2027]?.map((holiday) => holiday.date)).toEqual([
      '2027-01-01',
      '2027-01-26',
      '2027-03-01',
      '2027-03-26',
      '2027-03-28',
      '2027-03-29',
      '2027-04-25',
      '2027-04-26',
      '2027-06-07',
      '2027-09-27',
      '2027-12-25',
      '2027-12-26',
      '2027-12-28',
    ]);
  });

  it('does not fabricate an unconfirmed year', () => {
    expect(waPublicHolidayOn(2028, 1, 1)).toBeNull();
    expect(WA_PUBLIC_HOLIDAYS_SOURCE_AS_OF).toBe('2026-05-25');
  });
});
