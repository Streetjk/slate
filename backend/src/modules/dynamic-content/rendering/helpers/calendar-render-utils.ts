import { parseHistoryTodayData } from '../../history-today.data';
import { isRecord, limitChars, pickText } from './frame-value-utils';

export function readHistoryItems(
  data: Record<string, unknown>
): Array<{ year: string; text: string }> {
  const parsed = parseHistoryTodayData(data);
  if (!parsed) return [];
  return parsed.items.map((item) => ({ year: item.year, text: item.display }));
}

export function monthCellSubtitle(dayData: unknown): string {
  if (!isRecord(dayData)) return '';
  return limitChars(pickText(dayData.public_holiday, ''), 12);
}
