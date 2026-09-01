import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProposedCalendarEvent, type ProposedCalendarEventT } from 'shared';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AppConfig } from '../../infra/config/app.config';

const TICKET_TTL_MS = 5 * 60 * 1000;
const TICKET_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export interface GoogleCalendarProposalTicket {
  ticket: string;
  proposal: ProposedCalendarEventT;
  expiresAt: string;
}

export interface ConsumedGoogleCalendarTicket {
  proposal: ProposedCalendarEventT;
  calendarId: string;
}

@Injectable()
export class GoogleCalendarConfirmationService {
  constructor(
    private readonly config: AppConfig,
    private readonly prisma: PrismaService
  ) {}

  async create(userId: string, rawProposal: unknown): Promise<GoogleCalendarProposalTicket> {
    const proposal = ProposedCalendarEvent.parse(rawProposal);
    const ticket = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + TICKET_TTL_MS);
    await this.prisma.googleCalendarConfirmationTicket.create({
      data: {
        userId,
        ticketHash: hashTicket(ticket),
        proposal: proposal as Prisma.InputJsonValue,
        calendarId: this.config.googleCalendarId,
        expiresAt,
      },
    });
    return { ticket, proposal, expiresAt: expiresAt.toISOString() };
  }

  async consume(userId: string, ticket: string): Promise<ConsumedGoogleCalendarTicket> {
    this.assertTicketFormat(ticket);
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.googleCalendarConfirmationTicket.findUnique({
        where: { ticketHash: hashTicket(ticket) },
      });
      if (!row || row.userId !== userId || row.consumedAt || row.expiresAt <= now) {
        throw new Error('Google Calendar confirmation ticket is invalid or expired');
      }
      const claimed = await tx.googleCalendarConfirmationTicket.updateMany({
        where: {
          id: row.id,
          userId,
          consumedAt: null,
          expiresAt: { gt: now },
        },
        data: { consumedAt: now },
      });
      if (claimed.count !== 1) {
        throw new Error('Google Calendar confirmation ticket is invalid or expired');
      }
      return {
        proposal: ProposedCalendarEvent.parse(row.proposal),
        calendarId: row.calendarId,
      };
    });
  }

  async cancel(userId: string, ticket: string): Promise<void> {
    this.assertTicketFormat(ticket);
    const result = await this.prisma.googleCalendarConfirmationTicket.updateMany({
      where: {
        ticketHash: hashTicket(ticket),
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    if (result.count !== 1) {
      throw new Error('Google Calendar confirmation ticket is invalid or expired');
    }
  }

  private assertTicketFormat(ticket: string): void {
    if (!TICKET_PATTERN.test(ticket)) {
      throw new Error('Google Calendar confirmation ticket is invalid or expired');
    }
  }
}

export function hashTicket(ticket: string): string {
  return createHash('sha256').update(ticket, 'utf8').digest('hex');
}
