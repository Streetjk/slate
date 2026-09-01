import { Injectable } from '@nestjs/common';
import { google, type calendar_v3 } from 'googleapis';
import type { ProposedCalendarEventT } from 'shared';
import { GoogleCalendarConfirmationService } from './google-calendar-confirmation.service';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';

export interface CreatedGoogleCalendarEvent {
  id: string;
  htmlLink?: string;
}

@Injectable()
export class GoogleCalendarWriteService {
  constructor(
    private readonly confirmations: GoogleCalendarConfirmationService,
    private readonly oauth: GoogleCalendarOAuthService
  ) {}

  async createConfirmedCalendarEvent(
    userId: string,
    ticket: string
  ): Promise<CreatedGoogleCalendarEvent> {
    const consumed = await this.confirmations.consume(userId, ticket);
    const auth = await this.oauth.getAuthenticatedClient(userId);
    try {
      const response = await google.calendar({ version: 'v3', auth }).events.insert({
        calendarId: consumed.calendarId,
        sendUpdates: 'none',
        requestBody: toGoogleEvent(consumed.proposal),
      });
      const id = response.data.id?.trim();
      if (!id) throw new Error('Google Calendar response did not contain an event id');
      return {
        id,
        ...(response.data.htmlLink ? { htmlLink: response.data.htmlLink } : {}),
      };
    } catch {
      throw new Error('Google Calendar event creation failed');
    }
  }
}

export function toGoogleEvent(proposal: ProposedCalendarEventT): calendar_v3.Schema$Event {
  const start = proposal.allDay
    ? { date: proposal.start }
    : {
        dateTime: proposal.start,
        ...(proposal.timezone ? { timeZone: proposal.timezone } : {}),
      };
  const end = proposal.allDay
    ? { date: proposal.end }
    : {
        dateTime: proposal.end,
        ...(proposal.timezone ? { timeZone: proposal.timezone } : {}),
      };
  return {
    summary: proposal.title,
    start,
    end,
    ...(proposal.location ? { location: proposal.location } : {}),
  };
}
