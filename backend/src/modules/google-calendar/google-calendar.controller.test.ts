import 'reflect-metadata';
import { describe, expect, it } from 'bun:test';
import { GoogleCalendarController } from './google-calendar.controller';

describe('GoogleCalendarController', () => {
  it('passes the authenticated user identity through every operation', async () => {
    const calls: string[] = [];
    const controller = new GoogleCalendarController(
      {
        createAuthorizationUrl: (userId: string) => `url:${userId}`,
        getConnectionStatus: async (userId: string) => ({ connected: userId === 'user-a' }),
        disconnect: async (userId: string) => {
          calls.push(`disconnect:${userId}`);
        },
      } as never,
      {
        create: async (userId: string) => {
          calls.push(`proposal:${userId}`);
          return { ticket: 't' };
        },
        cancel: async (userId: string) => {
          calls.push(`cancel:${userId}`);
        },
      } as never,
      {
        createConfirmedCalendarEvent: async (userId: string, ticket: string) => {
          calls.push(`confirm:${userId}:${ticket}`);
          return { id: 'event-1' };
        },
      } as never
    );
    expect(controller.authorizationUrl({ userId: 'user-a' } as never)).toEqual({
      url: 'url:user-a',
    });
    await controller.createProposal({ userId: 'user-a' } as never, {} as never);
    await controller.confirm({ userId: 'user-a' } as never, { ticket: 'ticket' });
    await controller.cancel({ userId: 'user-a' } as never, { ticket: 'ticket' });
    await controller.disconnect({ userId: 'user-a' } as never);
    expect(calls).toEqual([
      'proposal:user-a',
      'confirm:user-a:ticket',
      'cancel:user-a',
      'disconnect:user-a',
    ]);
  });
});
