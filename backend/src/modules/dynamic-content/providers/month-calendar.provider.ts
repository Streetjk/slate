import { Injectable } from '@nestjs/common';
import { MonthCalendarConfig, type MonthCalendarConfigT } from 'shared';
import type { CalendarServerData } from '../calendar-data.service';
import { CalendarDataService } from '../calendar-data.service';
import type { DataProvider, DynamicContentFetchCtx } from '../dynamic-content.types';
import { dynamicViewDate } from '../timezone';

@Injectable()
export class MonthCalendarProvider implements DataProvider<
  MonthCalendarConfigT,
  CalendarServerData
> {
  readonly type = 'month_calendar';

  constructor(private readonly calendar: CalendarDataService) {}

  validateConfig(raw: unknown): MonthCalendarConfigT {
    return MonthCalendarConfig.parse(raw);
  }

  fetchData(
    config: MonthCalendarConfigT,
    ctx: DynamicContentFetchCtx
  ): Promise<CalendarServerData> {
    return Promise.resolve(
      this.calendar.buildCurrentAndNextMonth(dynamicViewDate(config, ctx.now), config.tz)
    );
  }
}
