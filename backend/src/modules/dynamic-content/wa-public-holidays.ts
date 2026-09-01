export interface WaPublicHoliday {
  date: string;
  name: string;
}

export const WA_PUBLIC_HOLIDAYS_SOURCE_URL =
  'https://www.wa.gov.au/service/employment/workplace-arrangements/public-holidays-western-australia';
export const WA_PUBLIC_HOLIDAYS_SOURCE_AS_OF = '2026-05-25';

const holidays = (entries: Array<[string, string]>): readonly WaPublicHoliday[] =>
  entries.map(([date, name]) => ({ date, name }));

export const WA_PUBLIC_HOLIDAYS_BY_YEAR: Readonly<Record<number, readonly WaPublicHoliday[]>> = {
  2026: holidays([
    ['2026-01-01', "New Year's Day"],
    ['2026-01-26', 'Australia Day'],
    ['2026-03-02', 'Labour Day'],
    ['2026-04-03', 'Good Friday'],
    ['2026-04-05', 'Easter Sunday'],
    ['2026-04-06', 'Easter Monday'],
    ['2026-04-25', 'Anzac Day'],
    ['2026-04-27', 'Anzac Day (observed)'],
    ['2026-06-01', 'WA Day'],
    ['2026-09-28', "King's Birthday"],
    ['2026-12-25', 'Christmas Day'],
    ['2026-12-26', 'Boxing Day'],
    ['2026-12-28', 'Boxing Day (observed)'],
  ]),
  2027: holidays([
    ['2027-01-01', "New Year's Day"],
    ['2027-01-26', 'Australia Day'],
    ['2027-03-01', 'Labour Day'],
    ['2027-03-26', 'Good Friday'],
    ['2027-03-28', 'Easter Sunday'],
    ['2027-03-29', 'Easter Monday'],
    ['2027-04-25', 'Anzac Day'],
    ['2027-04-26', 'Anzac Day (observed)'],
    ['2027-06-07', 'WA Day'],
    ['2027-09-27', "King's Birthday"],
    ['2027-12-25', 'Christmas Day'],
    ['2027-12-26', 'Boxing Day'],
    ['2027-12-28', 'Boxing Day (observed)'],
  ]),
};

export function waPublicHolidayOn(
  year: number,
  month: number,
  day: number
): WaPublicHoliday | null {
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return WA_PUBLIC_HOLIDAYS_BY_YEAR[year]?.find((holiday) => holiday.date === date) ?? null;
}

export function waPublicHolidaysForYear(year: number): readonly WaPublicHoliday[] {
  return WA_PUBLIC_HOLIDAYS_BY_YEAR[year] ?? [];
}
