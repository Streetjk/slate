import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'bun:test';
import type { WebSocket } from 'ws';
import { XiaozhiVoiceSession } from './xiaozhi-voice-session';
import type { GeminiLiveConnection, GeminiLiveEvent } from './gemini-live.service';
import type { VoiceCodec } from './opus-pcm-codec';

class FakeSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = this.OPEN;
  readonly sent: Array<{ data: string | Buffer; binary: boolean }> = [];
  closed: { code: number; reason: string } | undefined;

  send(data: string | Buffer, options?: { binary?: boolean }): void {
    this.sent.push({ data, binary: options?.binary ?? false });
  }

  close(code = 1000, reason = ''): void {
    this.closed = { code, reason };
    this.readyState = 3;
  }
}

function socket(): WebSocket {
  return new FakeSocket() as unknown as WebSocket;
}

function codec(): VoiceCodec {
  return {
    decodeDevicePacket: (packet) => packet,
    encodeModelPcm: () => [Buffer.from([7, 8])],
    reset: () => {},
    close: () => {},
  };
}

describe('XiaozhiVoiceSession', () => {
  it('speaks the Xiaozhi handshake and bridges device audio to Gemini Live', async () => {
    const ws = socket() as unknown as FakeSocket;
    const sentAudio: Uint8Array[] = [];
    let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const connection: GeminiLiveConnection = {
      sendAudio: (pcm) => sentAudio.push(pcm),
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {},
    };
    const liveService = {
      connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
        liveEvent = onEvent;
        return connection;
      },
    } as never;
    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    await session.handleMessage(Buffer.from([1, 2, 3]), true);
    liveEvent?.({
      message: {
        text: 'Answer',
        data: Buffer.from([4, 5]).toString('base64'),
        serverContent: { turnComplete: true },
      } as never,
    });

    expect(ws.sent[0]).toMatchObject({ binary: false });
    expect(JSON.parse(String(ws.sent[0]?.data))).toMatchObject({
      type: 'hello',
      version: 1,
      audio_params: { format: 'opus', sample_rate: 16_000, frame_duration: 60 },
    });
    expect(sentAudio).toEqual([Buffer.from([1, 2, 3])]);
    expect(ws.sent.filter((item) => item.binary)).toHaveLength(1);
    expect(
      ws.sent.map((item) => (item.binary ? 'binary' : JSON.parse(String(item.data)).type))
    ).toEqual(['hello', 'tts', 'tts', 'binary', 'tts']);
  });

  it('requires the handshake before opening Gemini Live', async () => {
    const session = new XiaozhiVoiceSession(
      socket(),
      {
        connect: async () => {
          throw new Error('must not connect');
        },
      } as never,
      codec
    );

    await expect(
      session.handleMessage(Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })), false)
    ).rejects.toThrow('hello required');
  });

  it('closes goodbye cleanly and resets speaking state on abort', async () => {
    const ws = socket() as unknown as FakeSocket;
    let resetCount = 0;
    const liveEvents: Array<(event: GeminiLiveEvent) => void> = [];
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          liveEvents.push(onEvent);
          return {
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          };
        },
      } as never,
      () => ({ ...codec(), reset: () => resetCount++ })
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    liveEvents[0]?.({ message: { text: 'answer' } as never });
    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);
    expect(resetCount).toBe(1);
    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'goodbye' })), false);
    expect(ws.closed).toEqual({ code: 1000, reason: 'goodbye' });
  });

  it('fails the socket when a model event cannot be encoded', async () => {
    const ws = socket() as unknown as FakeSocket;
    let eventHandler: ((event: GeminiLiveEvent) => void) | undefined;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          eventHandler = onEvent;
          return {
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          };
        },
      } as never,
      () => ({
        decodeDevicePacket: (packet) => packet,
        encodeModelPcm: () => {
          throw new Error('bad model audio');
        },
        reset: () => {},
        close: () => {},
      })
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    eventHandler?.({ message: { data: Buffer.from([1, 2]).toString('base64') } as never });
    expect(ws.closed).toEqual({ code: 1011, reason: 'voice session failed' });
  });

  it('turns a model calendar proposal into a device confirmation flow', async () => {
    const ws = socket() as unknown as FakeSocket;
    let eventHandler: ((event: GeminiLiveEvent) => void) | undefined;
    let toolResponses: unknown;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          eventHandler = onEvent;
          return {
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: (calls: unknown) => {
              toolResponses = calls;
            },
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          };
        },
      } as never,
      codec,
      {
        propose: async (value) => ({ ticket: 'a'.repeat(43), proposal: value, expiresAt: 'later' }),
        confirm: async (ticket) => ({ id: `event:${ticket}` }),
        cancel: async () => {},
      }
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    eventHandler?.({
      message: {
        toolCall: {
          functionCalls: [
            { id: 'call-1', name: 'propose_google_calendar_event', args: { title: 'Dentist' } },
          ],
        },
      } as never,
    });
    await Promise.resolve();
    await Promise.resolve();
    const proposalMessage = ws.sent
      .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
      .find((item) => item?.type === 'calendar_proposal');
    expect(proposalMessage).toMatchObject({
      type: 'calendar_proposal',
      ticket: 'a'.repeat(43),
      proposal: { title: 'Dentist' },
    });
    expect(toolResponses).toEqual([
      {
        id: 'call-1',
        name: 'propose_google_calendar_event',
        response: { ok: true, status: 'proposal_created' },
      },
    ]);

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'calendar', action: 'confirm', ticket: 'a'.repeat(43) })),
      false
    );
    const createdMessage = ws.sent
      .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
      .find((item) => item?.state === 'created');
    expect(createdMessage).toEqual({
      type: 'calendar',
      state: 'created',
      event_id: `event:${'a'.repeat(43)}`,
    });
  });

  it('rejects audio before handshake/session and closes resources', async () => {
    const ws = socket();
    let closed = false;
    const session = new XiaozhiVoiceSession(ws, { connect: async () => ({}) } as never, () => ({
      ...codec(),
      close: () => (closed = true),
    }));

    await expect(session.handleMessage(Buffer.from([1]), true)).rejects.toThrow(
      'before session start'
    );
    session.close();
    expect(closed).toBe(true);
  });
});
