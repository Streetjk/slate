import { describe, expect, it } from 'bun:test';
import { XiaozhiVoiceGateway } from './xiaozhi-voice.gateway';

function request(token: string) {
  return { headers: { authorization: `Bearer ${token}` } } as never;
}

describe('XiaozhiVoiceGateway', () => {
  it('rejects unauthenticated device sockets before starting a Gemini session', async () => {
    let connected = false;
    const socket = { close: (...args: unknown[]) => calls.push(args) };
    const calls: unknown[][] = [];
    const gateway = new XiaozhiVoiceGateway(
      { authenticate: async () => null } as never,
      { connect: async () => (connected = true) as never } as never,
      {} as never,
      {} as never
    );

    await gateway.handle(socket as never, request('a'.repeat(64)));

    expect(calls).toEqual([[1008, 'device authentication failed']]);
    expect(connected).toBe(false);
  });

  it('authenticates the device secret before attaching the voice session', async () => {
    let authenticated = '';
    const socket = {
      on: () => {},
      close: () => {},
    };
    const gateway = new XiaozhiVoiceGateway(
      {
        authenticate: async (secret: string) => (
          (authenticated = secret),
          { deviceId: 'd1', mac: 'm1' }
        ),
      } as never,
      { connect: async () => ({}) } as never,
      {} as never,
      {} as never
    );

    await gateway.handle(socket as never, request('b'.repeat(64)));

    expect(authenticated).toBe('b'.repeat(64));
  });
});
