import { ProposedCalendarEvent, type ProposedCalendarEventT } from 'shared';

export class ProposeGoogleCalendarEventDto implements ProposedCalendarEventT {
  static readonly schema = ProposedCalendarEvent;
  declare title: string;
  declare start: string;
  declare end: string;
  declare allDay: boolean;
  declare location?: string;
  declare timezone?: string;
}
