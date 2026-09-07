import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'bun:test';
import type { WebSocket } from 'ws';
import {
  classifyProviderFailure,
  mergeTranscriptFragment,
  XiaozhiVoiceSession,
} from './xiaozhi-voice-session';
import { GeminiLiveBridgeFailure } from './gemini-live-bridge.protocol';
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
  it('classifies provider failures without exposing error details', () => {
    expect(
      classifyProviderFailure(new GeminiLiveBridgeFailure('CONNECT_TIMEOUT', 'synthetic detail'))
    ).toBe('CONNECT_TIMEOUT');
    expect(classifyProviderFailure(new Error('synthetic credential detail'))).toBe(
      'CREDENTIAL_ERROR'
    );
    expect(classifyProviderFailure(new Error('synthetic provider detail'))).toBe(
      'UNKNOWN_SAFE_FAILURE'
    );
  });

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

  it('coalesces delta and cumulative transcription fragments at turn completion', async () => {
    const ws = socket() as unknown as FakeSocket;
    let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          liveEvent = onEvent;
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
      codec
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    liveEvent?.({ message: { serverContent: { inputTranscription: { text: 'Hel' } } } as never });
    liveEvent?.({ message: { serverContent: { inputTranscription: { text: 'lo' } } } as never });
    liveEvent?.({ message: { serverContent: { inputTranscription: { text: 'Hello' } } } as never });
    liveEvent?.({
      message: { serverContent: { outputTranscription: { text: 'こんにちは' } } } as never,
    });
    liveEvent?.({
      message: {
        serverContent: {
          outputTranscription: { text: 'こんにちは 世界' },
          turnComplete: true,
        },
      } as never,
    });

    const messages = ws.sent
      .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
      .filter((item) => item?.type === 'stt' || item?.type === 'tts');
    expect(messages.filter((item) => item.type === 'stt')).toEqual([
      { type: 'stt', text: 'Hello' },
    ]);
    expect(
      messages.filter((item) => item.type === 'tts' && item.state === 'sentence_start')
    ).toEqual([{ type: 'tts', state: 'sentence_start', text: 'こんにちは 世界' }]);
    expect(messages.filter((item) => item.type === 'tts' && item.state === 'stop')).toHaveLength(1);
  });

  it('preserves cumulative and delta merge semantics without duplicating overlap', () => {
    expect(mergeTranscriptFragment('', '  Hello')).toBe('Hello');
    expect(mergeTranscriptFragment('Hello', 'Hello world')).toBe('Hello world');
    expect(mergeTranscriptFragment('Hel', 'lo')).toBe('Hello');
    expect(mergeTranscriptFragment('Hello', ' world')).toBe('Hello world');
    expect(mergeTranscriptFragment('こんにちは', 'にちは')).toBe('こんにちは');
  });

  it('discards unfinished transcript fragments on abort', async () => {
    const ws = socket() as unknown as FakeSocket;
    let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          liveEvent = onEvent;
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
      codec
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    liveEvent?.({
      message: { serverContent: { outputTranscription: { text: 'unfinished 日本語' } } } as never,
    });
    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);
    expect(
      ws.sent
        .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
        .filter((item) => item?.type === 'tts')
    ).toEqual([{ type: 'tts', state: 'start' }]);
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
    let liveClosed = false;
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
            close: () => {
              liveClosed = true;
            },
          };
        },
      } as never,
      () => ({
        decodeDevicePacket: (packet) => packet,
        encodeModelPcm: () => {
          throw new Error('provider detail synthetic-secret-value');
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
    const alerts = ws.sent
      .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
      .filter((item) => item?.type === 'alert');
    expect(alerts).toEqual([
      {
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      },
    ]);
    expect(JSON.stringify(alerts)).not.toContain('synthetic-secret-value');
    expect(liveClosed).toBe(true);
  });

  it('redacts live-service callback details before sending an alert to the device', async () => {
    const ws = socket() as unknown as FakeSocket;
    let onError: ((error: Error) => void) | undefined;
    let liveClosed = false;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (
          _language: 'en',
          _onEvent: (event: GeminiLiveEvent) => void,
          callback: (error: Error) => void
        ) => {
          onError = callback;
          return {
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {
              liveClosed = true;
            },
          };
        },
      } as never,
      codec
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    onError?.(new Error('provider detail synthetic-secret-value'));

    expect(ws.sent.at(-1)).toEqual({
      data: JSON.stringify({
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      }),
      binary: false,
    });
    expect(String(ws.sent.at(-1)?.data)).not.toContain('synthetic-secret-value');
    expect(liveClosed).toBe(true);
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

  it('queues mic frames during delayed provider connect and flushes with bounded FIFO behavior', async () => {
    const ws = socket() as unknown as FakeSocket;
    const sentAudio: Uint8Array[] = [];
    let resolveConnect!: (conn: GeminiLiveConnection) => void;
    const connectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveConnect = resolve;
    });
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
      connect: async () => connectPromise,
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

    for (let i = 1; i <= 60; i++) {
      await session.handleMessage(Buffer.from([i]), true);
    }
    expect(sentAudio).toHaveLength(0);

    resolveConnect(connection);
    await Promise.resolve();
    await Promise.resolve();

    expect(sentAudio).toHaveLength(50);
    expect(sentAudio[0]).toEqual(Buffer.from([11]));
    expect(sentAudio[49]).toEqual(Buffer.from([60]));

    await session.handleMessage(Buffer.from([61]), true);
    expect(sentAudio).toHaveLength(51);
    expect(sentAudio[50]).toEqual(Buffer.from([61]));
  });

  it('streams incremental same-bubble text updates before turn completion and finalizes', async () => {
    const ws = socket() as unknown as FakeSocket;
    let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          liveEvent = onEvent;
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
      codec
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );

    liveEvent?.({
      message: { serverContent: { outputTranscription: { text: 'Hello' } } } as never,
    });
    await new Promise((resolve) => setTimeout(resolve, 130));

    liveEvent?.({
      message: { serverContent: { outputTranscription: { text: 'Hello world' } } } as never,
    });
    await new Promise((resolve) => setTimeout(resolve, 130));

    liveEvent?.({
      message: {
        serverContent: {
          outputTranscription: { text: 'Hello world!' },
          turnComplete: true,
        },
      } as never,
    });

    const ttsMessages = ws.sent
      .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
      .filter((item) => item?.type === 'tts');

    expect(ttsMessages[0]).toEqual({ type: 'tts', state: 'start' });
    expect(ttsMessages[1]).toEqual({ type: 'tts', state: 'sentence_start', text: 'Hello' });
    expect(ttsMessages[2]).toEqual({ type: 'tts', state: 'sentence_start', text: 'Hello world' });
    expect(ttsMessages[3]).toEqual({ type: 'tts', state: 'sentence_start', text: 'Hello world!' });
    expect(ttsMessages[4]).toEqual({ type: 'tts', state: 'stop' });
  });

  it('handles cumulative, delta, and duplicate fragments across languages with authoritative turnComplete', () => {
    expect(mergeTranscriptFragment('The weather', 'The weather is fine')).toBe(
      'The weather is fine'
    );
    expect(mergeTranscriptFragment('The weather is fine', ' today')).toBe(
      'The weather is fine today'
    );
    expect(mergeTranscriptFragment('The weather is fine today', 'today')).toBe(
      'The weather is fine today'
    );
    expect(mergeTranscriptFragment('The weather is fine today', 'The weather is fine today')).toBe(
      'The weather is fine today'
    );
    expect(mergeTranscriptFragment('東京の', '東京の天気は')).toBe('東京の天気は');
    expect(mergeTranscriptFragment('東京の天気は', '晴れです')).toBe('東京の天気は晴れです');
    expect(mergeTranscriptFragment('東京の天気は晴れです', '晴れです')).toBe(
      '東京の天気は晴れです'
    );
  });

  it('handles abort and clean reconnect without orphaned sessions or state leakage', async () => {
    const ws = socket() as unknown as FakeSocket;
    let connectCount = 0;
    let resolveFirstConnect!: (conn: GeminiLiveConnection) => void;
    const firstConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveFirstConnect = resolve;
    });

    const liveService = {
      connect: async () => {
        connectCount++;
        if (connectCount === 1) {
          return firstConnectPromise;
        }
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
    await session.handleMessage(Buffer.from([1, 2]), true);

    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);

    let firstConnectionClosed = false;
    resolveFirstConnect({
      sendAudio: () => {},
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {
        firstConnectionClosed = true;
      },
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(firstConnectionClosed).toBe(true);

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(2);
  });

  it('ensures abort followed by immediate new listen start closes stale connection when old connect resolves', async () => {
    const ws = socket() as unknown as FakeSocket;
    let connectCount = 0;
    let resolveFirstConnect!: (conn: GeminiLiveConnection) => void;
    let resolveSecondConnect!: (conn: GeminiLiveConnection) => void;
    const firstConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveFirstConnect = resolve;
    });
    const secondConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveSecondConnect = resolve;
    });

    let firstConnectionClosed = false;
    let secondConnectionClosed = false;
    const firstSentAudio: Uint8Array[] = [];
    const secondSentAudio: Uint8Array[] = [];

    const firstConnection: GeminiLiveConnection = {
      sendAudio: (pcm) => firstSentAudio.push(pcm),
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {
        firstConnectionClosed = true;
      },
    };

    const secondConnection: GeminiLiveConnection = {
      sendAudio: (pcm) => secondSentAudio.push(pcm),
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {
        secondConnectionClosed = true;
      },
    };

    const liveService = {
      connect: async () => {
        connectCount++;
        if (connectCount === 1) {
          return firstConnectPromise;
        }
        return secondConnectPromise;
      },
    } as never;

    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    // Initial handshake
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );

    // Turn 1 starts: begins connect attempt 1
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(1);

    // Audio queued for attempt 1
    await session.handleMessage(Buffer.from([1, 2]), true);

    // Abort Turn 1: clears connectingPromise and increments invalidation
    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);

    // Immediate new listen:start: begins connect attempt 2
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(2);

    // Audio sent during attempt 2 (queued in bounded FIFO queue)
    await session.handleMessage(Buffer.from([3, 4]), true);

    // Old in-flight provider connect (attempt 1) resolves
    resolveFirstConnect(firstConnection);
    await Promise.resolve();
    await Promise.resolve();

    // Old connection must be closed immediately and never installed
    expect(firstConnectionClosed).toBe(true);
    expect(firstSentAudio).toHaveLength(0);
    expect(secondConnectionClosed).toBe(false);

    // New provider connect (attempt 2) resolves and becomes authoritative
    resolveSecondConnect(secondConnection);
    await Promise.resolve();
    await Promise.resolve();

    // New connection remains authoritative, not closed, and receives queued audio
    expect(secondConnectionClosed).toBe(false);
    expect(secondSentAudio).toEqual([Buffer.from([3, 4])]);

    // Subsequent audio streams to new authoritative connection
    await session.handleMessage(Buffer.from([5, 6]), true);
    expect(secondSentAudio).toEqual([Buffer.from([3, 4]), Buffer.from([5, 6])]);
    expect(firstSentAudio).toHaveLength(0);
  });

  it('ignores stale connect failure after abort and immediate new listen start', async () => {
    const ws = socket() as unknown as FakeSocket;
    let connectCount = 0;
    let rejectFirstConnect!: (err: Error) => void;
    let resolveSecondConnect!: (conn: GeminiLiveConnection) => void;
    const firstConnectPromise = new Promise<GeminiLiveConnection>((_, reject) => {
      rejectFirstConnect = reject;
    });
    const secondConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveSecondConnect = resolve;
    });

    const secondSentAudio: Uint8Array[] = [];
    let secondConnectionClosed = false;
    const secondConnection: GeminiLiveConnection = {
      sendAudio: (pcm) => secondSentAudio.push(pcm),
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {
        secondConnectionClosed = true;
      },
    };

    const liveService = {
      connect: async () => {
        connectCount++;
        if (connectCount === 1) {
          return firstConnectPromise;
        }
        return secondConnectPromise;
      },
    } as never;

    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );

    // Turn 1 starts
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );

    // Abort Turn 1
    await session.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);

    // Immediate new listen:start (Turn 2)
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    await session.handleMessage(Buffer.from([10, 20]), true);

    // Old connect attempt rejects with an error
    rejectFirstConnect(new Error('synthetic old network error'));
    await Promise.resolve();
    await Promise.resolve();

    // Session must not have failed or closed the socket
    expect(ws.closed).toBeUndefined();
    const alerts = ws.sent.filter(
      (item) => !item.binary && JSON.parse(String(item.data)).type === 'alert'
    );
    expect(alerts).toHaveLength(0);

    // New connect resolves
    resolveSecondConnect(secondConnection);
    await Promise.resolve();
    await Promise.resolve();

    expect(secondConnectionClosed).toBe(false);
    expect(secondSentAudio).toEqual([Buffer.from([10, 20])]);
  });

  it('encodes synthetic model audio into bounded Opus packets with tts start and stop ordering', async () => {
    const ws = socket() as unknown as FakeSocket;
    let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const session = new XiaozhiVoiceSession(
      ws,
      {
        connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
          liveEvent = onEvent;
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
      codec
    );

    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );

    const syntheticPcm = Buffer.alloc(4800, 0x1a);
    liveEvent?.({
      message: {
        data: syntheticPcm.toString('base64'),
      } as never,
    });

    liveEvent?.({
      message: {
        serverContent: { turnComplete: true },
      } as never,
    });

    const textMessages = ws.sent
      .filter((item) => !item.binary)
      .map((item) => JSON.parse(String(item.data)));
    const binaryPackets = ws.sent.filter((item) => item.binary);

    expect(textMessages[1]).toEqual({ type: 'tts', state: 'start' });
    expect(binaryPackets.length).toBeGreaterThanOrEqual(1);
    for (const pkt of binaryPackets) {
      expect((pkt.data as Buffer).length).toBeGreaterThan(0);
    }
    expect(textMessages.at(-1)).toEqual({ type: 'tts', state: 'stop' });
  });

  it('resets connectingPromise and generation on connect failure so subsequent listen start connects cleanly', async () => {
    const ws = socket() as unknown as FakeSocket;
    let connectCount = 0;
    let rejectFirstConnect!: (err: Error) => void;
    let resolveSecondConnect!: (conn: GeminiLiveConnection) => void;
    let firstOnError: (() => void) | undefined;
    let firstOnEvent: ((event: GeminiLiveEvent) => void) | undefined;
    const firstConnectPromise = new Promise<GeminiLiveConnection>((_, reject) => {
      rejectFirstConnect = reject;
    });
    const secondConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveSecondConnect = resolve;
    });

    const secondSentAudio: Uint8Array[] = [];
    const secondConnection: GeminiLiveConnection = {
      sendAudio: (pcm) => secondSentAudio.push(pcm),
      sendText: () => {},
      endAudio: () => {},
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {},
    };

    const liveService = {
      connect: async (
        _language: 'en',
        onEvent: (event: GeminiLiveEvent) => void,
        onError?: () => void
      ) => {
        connectCount++;
        if (connectCount === 1) {
          firstOnEvent = onEvent;
          firstOnError = onError;
          return firstConnectPromise;
        }
        return secondConnectPromise;
      },
    } as never;

    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    // Initial handshake
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );

    // Turn 1 starts: connect attempt 1 begins
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(1);

    // Stop Turn 1 while connect is pending
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
      false
    );

    // Connect attempt 1 fails
    rejectFirstConnect(new GeminiLiveBridgeFailure('CONNECT_TIMEOUT', 'synthetic timeout'));
    await Promise.resolve();
    await Promise.resolve();

    // Socket should remain open because session was stopped, not active listening
    expect(ws.closed).toBeUndefined();

    // Stale callback from attempt 1 should be safely ignored (no alert sent)
    firstOnError?.();
    firstOnEvent?.({ message: { text: 'stale message' } as never });
    const alerts = ws.sent.filter(
      (item) => !item.binary && JSON.parse(String(item.data)).type === 'alert'
    );
    expect(alerts).toHaveLength(0);

    // Turn 2 starts: begins connect attempt 2 without being blocked by resolved connectingPromise
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(2);

    // Turn 2 audio sent
    await session.handleMessage(Buffer.from([7, 8]), true);

    // Connect attempt 2 resolves
    resolveSecondConnect(secondConnection);
    await secondConnectPromise;
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // Second connection receives audio
    expect(secondSentAudio).toEqual([Buffer.from([7, 8])]);
  });

  it('prevents pending listen stop from sending stale endAudio to new turn or session on start stop start', async () => {
    const ws = socket() as unknown as FakeSocket;
    let connectCount = 0;
    let resolveFirstConnect!: (conn: GeminiLiveConnection) => void;
    const firstConnectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveFirstConnect = resolve;
    });

    let firstEndAudioCalls = 0;
    const firstConnection: GeminiLiveConnection = {
      sendAudio: () => {},
      sendText: () => {},
      endAudio: () => {
        firstEndAudioCalls++;
      },
      respondToToolCalls: () => {},
      rejectToolCalls: () => {},
      reconnect: async () => {},
      close: () => {},
    };

    const liveService = {
      connect: async () => {
        connectCount++;
        return firstConnectPromise;
      },
    } as never;

    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    // Initial handshake
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );

    // Turn 1 starts
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );
    expect(connectCount).toBe(1);

    // Turn 1 stops while connect is pending
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
      false
    );

    // Turn 2 starts immediately (start -> stop -> start)
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );

    // Provider connection resolves
    resolveFirstConnect(firstConnection);
    await Promise.resolve();
    await Promise.resolve();

    // Stale endAudio from turn 1 stop MUST NOT have been delivered to turn 2
    expect(firstEndAudioCalls).toBe(0);

    // When turn 2 stops, endAudio is delivered exactly once
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
      false
    );
    expect(firstEndAudioCalls).toBe(1);
  });

  it('rejects and clears mic frames arriving after listen stop while provider connect is pending', async () => {
    const ws = socket() as unknown as FakeSocket;
    let resolveConnect!: (conn: GeminiLiveConnection) => void;
    const connectPromise = new Promise<GeminiLiveConnection>((resolve) => {
      resolveConnect = resolve;
    });

    const sentAudio: Uint8Array[] = [];
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
      connect: async () => connectPromise,
    } as never;

    const session = new XiaozhiVoiceSession(ws, liveService, codec);

    // Initial handshake
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
      false
    );

    // Turn 1 starts
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
      false
    );

    // Valid mic frame sent while listening
    await session.handleMessage(Buffer.from([1, 2]), true);

    // Turn 1 stops while provider connection is still pending
    await session.handleMessage(
      Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
      false
    );

    // Mic frame arriving AFTER listen stop must be rejected
    await expect(session.handleMessage(Buffer.from([3, 4]), true)).rejects.toThrow(
      'before session start'
    );

    // Provider connect resolves
    resolveConnect(connection);
    await Promise.resolve();
    await Promise.resolve();

    // Queued frames from stopped listen were cleared and rejected frame was never flushed
    expect(sentAudio).toHaveLength(0);
  });
});
