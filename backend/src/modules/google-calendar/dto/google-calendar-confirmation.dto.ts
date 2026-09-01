import { z } from 'zod';

export const GoogleCalendarConfirmationRequest = z.object({
  ticket: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
export type GoogleCalendarConfirmationRequestT = z.infer<typeof GoogleCalendarConfirmationRequest>;

export class GoogleCalendarConfirmationDto implements GoogleCalendarConfirmationRequestT {
  static readonly schema = GoogleCalendarConfirmationRequest;
  declare ticket: string;
}
