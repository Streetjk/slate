import { describe, expect, it } from 'bun:test';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import {
  GoogleCalendarConfirmationService,
  hashTicket,
} from './google-calendar-confirmation.service';

const proposal = {
  title: 'Dentist appointment',
  start: '2026-09-04T15:00:00+08:00',
  end: '2026-09-04T16:00:00+08:00',
  allDay: false,
  timezone: 'Australia/Perth',
};

interface FakeTicketRow {
  id: string;
  userId: string;
  ticketHash: string;
  proposal: unknown;
  calendarId: string;
  expiresAt: Date;
  consumedAt: Date | null;
}

interface CreateArgs {
  data: Omit<FakeTicketRow, 'id' | 'consumedAt'>;
}

interface FindArgs {
  where: { ticketHash: string };
}

interface UpdateArgs {
  where: {
    id?: string;
    ticketHash?: string;
    userId: string;
    consumedAt: null;
    expiresAt: { gt: Date };
  };
  data: { consumedAt: Date };
}

function service() {
  const rows = new Map<string, FakeTicketRow>();
  const ticketTable = {
    create: async ({ data }: CreateArgs) => {
      rows.set(data.ticketHash, {
        id: `row-${rows.size + 1}`,
        ...data,
        consumedAt: null,
      });
    },
    findUnique: async ({ where }: FindArgs) => rows.get(where.ticketHash) ?? null,
    updateMany: async ({ where, data }: UpdateArgs) => {
      const row = [...rows.values()].find(
        (candidate) =>
          (where.id === undefined || candidate.id === where.id) &&
          (where.ticketHash === undefined || candidate.ticketHash === where.ticketHash) &&
          candidate.userId === where.userId &&
          candidate.consumedAt === null &&
          candidate.expiresAt > where.expiresAt.gt
      );
      if (!row) return { count: 0 };
      row.consumedAt = data.consumedAt;
      return { count: 1 };
    },
  };
  const prisma = {
    googleCalendarConfirmationTicket: ticketTable,
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({ googleCalendarConfirmationTicket: ticketTable }),
  } as unknown as PrismaService;
  const config = { googleCalendarId: 'primary' } as never;
  return { service: new GoogleCalendarConfirmationService(config, prisma), rows };
}

describe('GoogleCalendarConfirmationService', () => {
  it('creates a short-lived ticket while storing only its hash', async () => {
    const { service: confirmations, rows } = service();
    const result = await confirmations.create('user-a', proposal);
    expect(result.proposal).toEqual(proposal);
    expect(result.ticket).toHaveLength(43);
    expect(result.expiresAt).toBeString();
    const row = rows.get(hashTicket(result.ticket));
    expect(row).toBeDefined();
    expect(row?.ticketHash).not.toBe(result.ticket);
    expect(row?.userId).toBe('user-a');
    expect(row?.calendarId).toBe('primary');
  });

  it('consumes a ticket once and rejects replay', async () => {
    const { service: confirmations } = service();
    const created = await confirmations.create('user-a', proposal);
    await expect(confirmations.consume('user-a', created.ticket)).resolves.toMatchObject({
      proposal,
      calendarId: 'primary',
    });
    await expect(confirmations.consume('user-a', created.ticket)).rejects.toThrow(
      'invalid or expired'
    );
  });

  it('rejects a ticket for a different user without consuming it', async () => {
    const { service: confirmations } = service();
    const created = await confirmations.create('user-a', proposal);
    await expect(confirmations.consume('user-b', created.ticket)).rejects.toThrow(
      'invalid or expired'
    );
    await expect(confirmations.consume('user-a', created.ticket)).resolves.toBeDefined();
  });

  it('cancels a ticket without invoking any external provider', async () => {
    const { service: confirmations } = service();
    const created = await confirmations.create('user-a', proposal);
    await expect(confirmations.cancel('user-a', created.ticket)).resolves.toBeUndefined();
    await expect(confirmations.consume('user-a', created.ticket)).rejects.toThrow(
      'invalid or expired'
    );
  });

  it('rejects malformed ticket values before database access', async () => {
    const { service: confirmations } = service();
    await expect(confirmations.consume('user-a', 'not-a-ticket')).rejects.toThrow(
      'invalid or expired'
    );
  });
});
