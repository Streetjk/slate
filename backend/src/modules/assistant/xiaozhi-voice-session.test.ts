import { EventEmitter } from 'node:events';
import { describe, expect, it, spyOn } from 'bun:test';
import { Logger } from '@nestjs/common';
import type { WebSocket } from 'ws';
import {
  AudioCodecError,
  classifyLiveFailureSource,
  classifyProviderFailure,
  ConnectRejectError,
  type LiveFailureSource,
  mergeTranscriptFragment,
  MessageHandlerError,
  ProviderOnClose,
  ProviderOnError,
  sanitizeTimingMs,
  SocketSendError,
  VoiceTimingTrace,
  XiaozhiVoiceSession,
} from './xiaozhi-voice-session';
import { GeminiLiveBridgeFailure } from './gemini-live-bridge.protocol';
import type { GeminiLiveConnection, GeminiLiveEvent } from './gemini-live.service';
import type { VoiceCodec } from './opus-pcm-codec';

class FakeSocket extends EventEmitter {
  readonly OPEN = 1;
  readyState = this.OPEN;
  bufferedAmount = 0;
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

  it('classifies live failure sources deterministically for all safe categories', () => {
    expect(classifyLiveFailureSource(new ConnectRejectError('connect error'))).toBe(
      'CONNECT_REJECT'
    );
    expect(classifyLiveFailureSource(new Error('provider connect rejected'))).toBe(
      'CONNECT_REJECT'
    );
    expect(classifyLiveFailureSource(new ProviderOnError('live error'))).toBe('PROVIDER_ONERROR');
    expect(classifyLiveFailureSource(new Error('Gemini Live connection error'))).toBe(
      'PROVIDER_ONERROR'
    );
    expect(
      classifyLiveFailureSource(
        new GeminiLiveBridgeFailure('READY_THEN_PROVIDER_ERROR', 'provider error')
      )
    ).toBe('BRIDGE_ERROR');
    expect(classifyLiveFailureSource(new ProviderOnClose('live close'))).toBe('PROVIDER_ONCLOSE');
    expect(classifyLiveFailureSource(new Error('Gemini Live session closed'))).toBe(
      'PROVIDER_ONCLOSE'
    );
    expect(
      classifyLiveFailureSource(
        new GeminiLiveBridgeFailure('SESSION_CLOSED_UNEXPECTEDLY', 'closed')
      )
    ).toBe('BRIDGE_ERROR');
    expect(
      classifyLiveFailureSource(new GeminiLiveBridgeFailure('CHILD_SPAWN_FAILED', 'child failed'))
    ).toBe('BRIDGE_ERROR');
    expect(
      classifyLiveFailureSource(
        new GeminiLiveBridgeFailure('BRIDGE_PROTOCOL_REJECTED', 'bad protocol')
      )
    ).toBe('BRIDGE_ERROR');
    expect(classifyLiveFailureSource(new MessageHandlerError('bad message'))).toBe(
      'MESSAGE_HANDLER_EXCEPTION'
    );
    expect(classifyLiveFailureSource(new SyntaxError('bad json'))).toBe(
      'MESSAGE_HANDLER_EXCEPTION'
    );
    expect(classifyLiveFailureSource(new AudioCodecError('opus error'))).toBe(
      'AUDIO_CODEC_EXCEPTION'
    );
    expect(classifyLiveFailureSource(new SocketSendError('send failed'))).toBe(
      'SOCKET_SEND_EXCEPTION'
    );
    expect(classifyLiveFailureSource(new Error('arbitrary unknown unclassified message'))).toBe(
      'OTHER_SAFE_CLASS'
    );
    expect(classifyLiveFailureSource(new Error('anything'), 'OTHER_SAFE_CLASS')).toBe(
      'OTHER_SAFE_CLASS'
    );
  });

  it('records sanitized structural markers on provider-connect rejection', async () => {
    const ws = socket() as unknown as FakeSocket;
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      const liveService = {
        connect: async () => {
          throw new Error('synthetic provider connection failed network');
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

      await Promise.resolve();
      await Promise.resolve();

      expect(logs).toContain('PROVIDER_SESSION_CREATE_START=YES');
      expect(logs).toContain('PROVIDER_SESSION_CREATE_RESULT=NETWORK_ERROR');
      expect(logs).toContain('PROVIDER_SESSION_STARTED=NO');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=CONNECT_REJECT');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(logs).toContain('ACTIVE_CONNECT_GENERATION=2');
      expect(logs).toContain('ACTIVE_LISTEN_GENERATION=1');
      expect(logs).toContain('LISTENING_STATE_AT_FAILURE=YES');
      expect(logs).toContain('LIVE_SESSION_PRESENT_AT_FAILURE=NO');
      expect(logs).toContain('CONNECTING_PROMISE_PRESENT_AT_FAILURE=YES');

      expect(ws.closed).toEqual({ code: 1011, reason: 'voice session failed' });
      const alert = ws.sent
        .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
        .find((item) => item?.type === 'alert');
      expect(alert).toEqual({
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      });
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('records sanitized structural markers on provider onerror callback', async () => {
    const ws = socket() as unknown as FakeSocket;
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      let onErrorCallback: ((err: Error) => void) | undefined;
      const liveService = {
        connect: async (_lang: string, _onEvent: unknown, onError: (err: Error) => void) => {
          onErrorCallback = onError;
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

      onErrorCallback?.(new Error('Gemini Live connection error'));

      expect(logs).toContain('PROVIDER_LIVE_ERROR_CALLBACK=YES');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONERROR');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(logs).toContain('ACTIVE_CONNECT_GENERATION=1');
      expect(logs).toContain('ACTIVE_LISTEN_GENERATION=1');
      expect(logs).toContain('LISTENING_STATE_AT_FAILURE=YES');
      expect(logs).toContain('LIVE_SESSION_PRESENT_AT_FAILURE=YES');
      expect(logs).toContain('CONNECTING_PROMISE_PRESENT_AT_FAILURE=NO');

      const alert = ws.sent
        .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
        .find((item) => item?.type === 'alert');
      expect(alert).toEqual({
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      });
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('records sanitized structural markers on provider unexpected onclose callback', async () => {
    const ws = socket() as unknown as FakeSocket;
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      let onErrorCallback: ((err: Error) => void) | undefined;
      const liveService = {
        connect: async (_lang: string, _onEvent: unknown, onError: (err: Error) => void) => {
          onErrorCallback = onError;
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

      // Unexpected close
      onErrorCallback?.(new Error('Gemini Live session closed'));

      expect(logs).toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONCLOSE');
      expect(logs).toContain('ACTIVE_CONNECT_GENERATION=1');
      expect(logs).toContain('ACTIVE_LISTEN_GENERATION=1');
      expect(logs).toContain('LISTENING_STATE_AT_FAILURE=YES');
      expect(logs).toContain('LIVE_SESSION_PRESENT_AT_FAILURE=YES');
      expect(logs).toContain('CONNECTING_PROMISE_PRESENT_AT_FAILURE=NO');

      const alert = ws.sent
        .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
        .find((item) => item?.type === 'alert');
      expect(alert).toEqual({
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      });
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('records sanitized structural markers on bridge errors during connect and runtime', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      // Connect-time bridge error
      const ws1 = socket() as unknown as FakeSocket;
      const bridgeFailConnect = {
        connect: async () => {
          throw new GeminiLiveBridgeFailure('CHILD_SPAWN_FAILED', 'child spawn failed');
        },
      } as never;

      const session1 = new XiaozhiVoiceSession(ws1, bridgeFailConnect, codec);
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      await Promise.resolve();
      await Promise.resolve();

      expect(logs).toContain('PROVIDER_SESSION_CREATE_RESULT=CHILD_SPAWN_FAILED');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=BRIDGE_ERROR');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(ws1.closed).toEqual({ code: 1011, reason: 'voice session failed' });

      // Runtime bridge error
      logs.length = 0;
      const ws2 = socket() as unknown as FakeSocket;
      let onCallback: ((err: Error) => void) | undefined;
      const bridgeFailRuntime = {
        connect: async (_lang: string, _onEvent: unknown, onError: (err: Error) => void) => {
          onCallback = onError;
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

      const session2 = new XiaozhiVoiceSession(ws2, bridgeFailRuntime, codec);
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );

      onCallback?.(new GeminiLiveBridgeFailure('BRIDGE_PROTOCOL_REJECTED', 'protocol rejected'));

      expect(logs).toContain('PROVIDER_LIVE_ERROR_CALLBACK=YES');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=BRIDGE_ERROR');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('records sanitized structural markers on message-handler, codec, and socket-send exceptions', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      // 1. Message-handler exception (malformed json)
      const ws1 = socket() as unknown as FakeSocket;
      const session1 = new XiaozhiVoiceSession(ws1, { connect: async () => ({}) } as never, codec);
      session1.start();
      ws1.emit('message', Buffer.from('invalid-json'), false);
      await (session1 as unknown as { operation: Promise<void> }).operation;

      expect(logs).toContain('LIVE_FAILURE_SOURCE=MESSAGE_HANDLER_EXCEPTION');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(ws1.closed).toEqual({ code: 1011, reason: 'voice session failed' });

      // 2. Codec exception on decode
      logs.length = 0;
      const ws2 = socket() as unknown as FakeSocket;
      let liveEvent: ((ev: GeminiLiveEvent) => void) | undefined;
      const session2 = new XiaozhiVoiceSession(
        ws2,
        {
          connect: async (_lang: string, onEv: (ev: GeminiLiveEvent) => void) => {
            liveEvent = onEv;
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
          decodeDevicePacket: () => {
            throw new Error('opus decode failed');
          },
          encodeModelPcm: () => [],
          reset: () => {},
          close: () => {},
        })
      );
      session2.start();
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      ws2.emit('message', Buffer.from([1, 2]), true);
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=AUDIO_CODEC_EXCEPTION');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(ws2.closed).toEqual({ code: 1011, reason: 'voice session failed' });

      // 3. Socket-send exception
      logs.length = 0;
      const ws3 = socket() as unknown as FakeSocket;
      ws3.send = () => {
        throw new Error('WebSocket send error');
      };
      const session3 = new XiaozhiVoiceSession(
        ws3,
        {
          connect: async (_lang: string, onEv: (ev: GeminiLiveEvent) => void) => {
            liveEvent = onEv;
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
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      liveEvent?.({
        message: {
          data: Buffer.from([1, 2, 3, 4]).toString('base64'),
        } as never,
      });
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=SOCKET_SEND_EXCEPTION');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('distinguishes expected provider close from unexpected provider close without false failure', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      let onErrorCallback: ((err: Error) => void) | undefined;
      const liveService = {
        connect: async (_lang: string, _onEvent: unknown, onError: (err: Error) => void) => {
          onErrorCallback = onError;
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

      // 1. Expected close via abort
      const ws1 = socket() as unknown as FakeSocket;
      const session1 = new XiaozhiVoiceSession(ws1, liveService, codec);
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      await session1.handleMessage(Buffer.from(JSON.stringify({ type: 'abort' })), false);

      onErrorCallback?.(new Error('Gemini Live session closed'));

      expect(logs).toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=YES');
      expect(logs).not.toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONCLOSE');
      const alerts1 = ws1.sent.filter(
        (item) => !item.binary && JSON.parse(String(item.data)).type === 'alert'
      );
      expect(alerts1).toHaveLength(0);

      // 2. Expected close via session.close()
      logs.length = 0;
      const ws2 = socket() as unknown as FakeSocket;
      const session2 = new XiaozhiVoiceSession(ws2, liveService, codec);
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      session2.close();

      onErrorCallback?.(new Error('Gemini Live session closed'));

      expect(logs).toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=YES');
      expect(logs).not.toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONCLOSE');

      // 3. Unexpected close during active listening
      logs.length = 0;
      const ws3 = socket() as unknown as FakeSocket;
      const session3 = new XiaozhiVoiceSession(ws3, liveService, codec);
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );

      onErrorCallback?.(new Error('Gemini Live session closed'));

      expect(logs).toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONCLOSE');
      const alerts3 = ws3.sent.filter(
        (item) => !item.binary && JSON.parse(String(item.data)).type === 'alert'
      );
      expect(alerts3).toHaveLength(1);
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('preserves privacy across all failure modes without leaking private data or unparsed details', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    const secretMarker = 'synthetic-key-not-a-real-secret-token-999';
    const secretUrl = 'https://generativelanguage.googleapis.com/v1beta/live?key=' + secretMarker;
    const stackSnippet = '/Users/ollama/slate/backend/src/secret-auth-file.ts:42';

    try {
      const liveService = {
        connect: async () => {
          const err = new Error(`Connection to ${secretUrl} failed:\n    at ${stackSnippet}`);
          err.name = 'ConnectError';
          throw err;
        },
      } as never;

      const ws = socket() as unknown as FakeSocket;
      const session = new XiaozhiVoiceSession(ws, liveService, codec);

      await session.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      await Promise.resolve();
      await Promise.resolve();

      // None of the logs should contain the secret, URL, or stack trace
      for (const entry of logs) {
        expect(entry).not.toContain(secretMarker);
        expect(entry).not.toContain('https://');
        expect(entry).not.toContain('secret-auth-file');
        expect(entry).not.toContain('at /Users');
      }

      // Alerts must be generic only
      for (const sent of ws.sent) {
        if (!sent.binary) {
          const text = String(sent.data);
          expect(text).not.toContain(secretMarker);
          expect(text).not.toContain('https://');
          expect(text).not.toContain('secret-auth-file');
        }
      }

      // Check format of all logged key=value markers
      const validFailureSources: LiveFailureSource[] = [
        'CONNECT_REJECT',
        'PROVIDER_ONERROR',
        'PROVIDER_ONCLOSE',
        'BRIDGE_ERROR',
        'MESSAGE_HANDLER_EXCEPTION',
        'AUDIO_CODEC_EXCEPTION',
        'SOCKET_SEND_EXCEPTION',
        'OTHER_SAFE_CLASS',
      ];

      const markers = new Map<string, string>();
      for (const line of logs) {
        const match = /^([A-Z0-9_]+)=([A-Za-z0-9_.-]+)$/.exec(line);
        if (match) {
          markers.set(match[1]!, match[2]!);
        }
      }

      expect(validFailureSources).toContain(
        markers.get('LIVE_FAILURE_SOURCE') as LiveFailureSource
      );
      expect(['YES', 'NO']).toContain(markers.get('PROVIDER_CLOSE_EXPECTED')!);
      expect(/^\d+$/.test(markers.get('ACTIVE_CONNECT_GENERATION')!)).toBe(true);
      expect(/^\d+$/.test(markers.get('ACTIVE_LISTEN_GENERATION')!)).toBe(true);
      expect(['YES', 'NO']).toContain(markers.get('LISTENING_STATE_AT_FAILURE')!);
      expect(['YES', 'NO']).toContain(markers.get('LIVE_SESSION_PRESENT_AT_FAILURE')!);
      expect(['YES', 'NO']).toContain(markers.get('CONNECTING_PROMISE_PRESENT_AT_FAILURE')!);
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('classifies live connection sendAudio/sendText/endAudio/tool responses as BRIDGE_ERROR or OTHER_SAFE_CLASS, not AUDIO_CODEC_EXCEPTION', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      // 1. live.sendAudio throws GeminiLiveBridgeFailure -> BRIDGE_ERROR (not AUDIO_CODEC_EXCEPTION)
      const ws1 = socket() as unknown as FakeSocket;
      const session1 = new XiaozhiVoiceSession(
        ws1,
        {
          connect: async () => ({
            sendAudio: () => {
              throw new GeminiLiveBridgeFailure('READY_THEN_TEXT_SEND_ERROR', 'bridge send failed');
            },
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          }),
        } as never,
        codec
      );
      session1.start();
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session1.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      ws1.emit('message', Buffer.from([1, 2, 3, 4]), true);
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=BRIDGE_ERROR');
      expect(logs).not.toContain('LIVE_FAILURE_SOURCE=AUDIO_CODEC_EXCEPTION');

      // 2. live.sendAudio throws non-bridge error -> OTHER_SAFE_CLASS (not AUDIO_CODEC_EXCEPTION)
      logs.length = 0;
      const ws2 = socket() as unknown as FakeSocket;
      const session2 = new XiaozhiVoiceSession(
        ws2,
        {
          connect: async () => ({
            sendAudio: () => {
              throw new Error('generic sendAudio failure');
            },
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          }),
        } as never,
        codec
      );
      session2.start();
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session2.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      ws2.emit('message', Buffer.from([1, 2, 3, 4]), true);
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=OTHER_SAFE_CLASS');
      expect(logs).not.toContain('LIVE_FAILURE_SOURCE=AUDIO_CODEC_EXCEPTION');

      // 3. live.endAudio throws GeminiLiveBridgeFailure -> BRIDGE_ERROR
      logs.length = 0;
      const ws3 = socket() as unknown as FakeSocket;
      const session3 = new XiaozhiVoiceSession(
        ws3,
        {
          connect: async () => ({
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {
              throw new GeminiLiveBridgeFailure(
                'BRIDGE_PROTOCOL_REJECTED',
                'bridge error on endAudio'
              );
            },
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          }),
        } as never,
        codec
      );
      session3.start();
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      await session3.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
        false
      );

      expect(logs).toContain('LIVE_FAILURE_SOURCE=BRIDGE_ERROR');

      // 4. live.endAudio throws non-bridge error -> OTHER_SAFE_CLASS
      logs.length = 0;
      const ws4 = socket() as unknown as FakeSocket;
      const session4 = new XiaozhiVoiceSession(
        ws4,
        {
          connect: async () => ({
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {
              throw new Error('generic endAudio fail');
            },
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          }),
        } as never,
        codec
      );
      session4.start();
      await session4.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session4.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      await session4.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
        false
      );

      expect(logs).toContain('LIVE_FAILURE_SOURCE=OTHER_SAFE_CLASS');

      // 5. live.respondToToolCalls throws bridge error -> BRIDGE_ERROR
      logs.length = 0;
      const ws5 = socket() as unknown as FakeSocket;
      let eventCallback: ((ev: GeminiLiveEvent) => void) | undefined;
      const session5 = new XiaozhiVoiceSession(
        ws5,
        {
          connect: async (_lang: string, onEv: (ev: GeminiLiveEvent) => void) => {
            eventCallback = onEv;
            return {
              sendAudio: () => {},
              sendText: () => {},
              endAudio: () => {},
              respondToToolCalls: () => {
                throw new GeminiLiveBridgeFailure(
                  'BRIDGE_PROTOCOL_REJECTED',
                  'tool response failed'
                );
              },
              rejectToolCalls: () => {},
              reconnect: async () => {},
              close: () => {},
            };
          },
        } as never,
        codec,
        {
          propose: async () => ({ ticket: 't1', proposal: {}, expiresAt: '2026-01-01' }),
          confirm: async () => ({ id: 'e1' }),
          cancel: async () => {},
        }
      );
      session5.start();
      await session5.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session5.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      eventCallback?.({
        message: {
          toolCall: {
            functionCalls: [{ id: 'c1', name: 'propose_google_calendar_event', args: {} }],
          },
        } as never,
      });
      await Promise.resolve();
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=BRIDGE_ERROR');

      // 6. codec.encodeModelPcm throws -> AUDIO_CODEC_EXCEPTION
      logs.length = 0;
      const ws6 = socket() as unknown as FakeSocket;
      let eventCallback6: ((ev: GeminiLiveEvent) => void) | undefined;
      const session6 = new XiaozhiVoiceSession(
        ws6,
        {
          connect: async (_lang: string, onEv: (ev: GeminiLiveEvent) => void) => {
            eventCallback6 = onEv;
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
          decodeDevicePacket: () => new Uint8Array(),
          encodeModelPcm: () => {
            throw new Error('synthetic encode error');
          },
          reset: () => {},
          close: () => {},
        })
      );
      session6.start();
      await session6.handleMessage(
        Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
        false
      );
      await session6.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      eventCallback6?.({
        message: {
          data: Buffer.from([1, 2, 3]).toString('base64'),
        } as never,
      });
      await Promise.resolve();

      expect(logs).toContain('LIVE_FAILURE_SOURCE=AUDIO_CODEC_EXCEPTION');
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('keeps provider session-create result distinct from runtime callback failure', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      const ws = socket() as unknown as FakeSocket;
      const session = new XiaozhiVoiceSession(
        ws,
        {
          connect: async (_lang: string, _onEvent: unknown, onError: (err: Error) => void) => {
            // Emulate live-service behavior where connect fails and fires onError callback before throwing
            onError(new Error('connect failure callback'));
            throw new Error('connect rejection credential error');
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
      await Promise.resolve();
      await Promise.resolve();

      // Session creation markers must be recorded
      expect(logs).toContain('PROVIDER_SESSION_CREATE_START=YES');
      expect(logs).toContain('PROVIDER_SESSION_CREATE_RESULT=CREDENTIAL_ERROR');
      expect(logs).toContain('PROVIDER_SESSION_STARTED=NO');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=CONNECT_REJECT');

      // Must NOT record runtime error callback marker during session-create
      expect(logs).not.toContain('PROVIDER_LIVE_ERROR_CALLBACK=YES');
      expect(logs).not.toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('does not classify unexpected provider close after normal turn as expected', async () => {
    const logs: string[] = [];
    const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
      logs.push(String(msg));
    });

    try {
      let liveEvent: ((ev: GeminiLiveEvent) => void) | undefined;
      let onErrorCallback: ((err: Error) => void) | undefined;
      const ws = socket() as unknown as FakeSocket;
      const session = new XiaozhiVoiceSession(
        ws,
        {
          connect: async (
            _lang: string,
            onEv: (ev: GeminiLiveEvent) => void,
            onError: (err: Error) => void
          ) => {
            liveEvent = onEv;
            onErrorCallback = onError;
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

      // Normal turn completes
      liveEvent?.({
        message: {
          serverContent: {
            outputTranscription: { text: 'Turn complete' },
            turnComplete: true,
          },
        } as never,
      });
      await session.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
        false
      );

      // After normal turn, provider unexpectedly closes
      onErrorCallback?.(new Error('Gemini Live session closed'));

      expect(logs).toContain('PROVIDER_LIVE_CLOSE_CALLBACK=YES');
      expect(logs).toContain('PROVIDER_CLOSE_EXPECTED=NO');
      expect(logs).toContain('LIVE_FAILURE_SOURCE=PROVIDER_ONCLOSE');

      const alert = ws.sent
        .map((item) => (item.binary ? null : JSON.parse(String(item.data))))
        .find((item) => item?.type === 'alert');
      expect(alert).toEqual({
        type: 'alert',
        status: 'Voice service error',
        message: 'Voice service error',
        emotion: 'neutral',
      });
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('preserves SOCKET_SEND_EXCEPTION only for device WebSocket sends', () => {
    expect(classifyLiveFailureSource(new SocketSendError())).toBe('SOCKET_SEND_EXCEPTION');
    expect(classifyLiveFailureSource(new SocketSendError('send failed'))).toBe(
      'SOCKET_SEND_EXCEPTION'
    );
    // Any other error containing socket or websocket text is OTHER_SAFE_CLASS
    expect(classifyLiveFailureSource(new Error('websocket is not open'))).toBe('OTHER_SAFE_CLASS');
    expect(classifyLiveFailureSource(new Error('socket send error'))).toBe('OTHER_SAFE_CLASS');
    expect(classifyLiveFailureSource(new Error('ws send failure'))).toBe('OTHER_SAFE_CLASS');
  });

  describe('Turn sequencing, bubble order, and Japanese UTF-8 streaming', () => {
    it('guarantees STT is flushed before TTS start and audio when input arrives before output', async () => {
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

      // Provider emits inputTranscription fragments
      liveEvent?.({
        message: { serverContent: { inputTranscription: { text: '今日' } } } as never,
      });
      liveEvent?.({
        message: {
          serverContent: { inputTranscription: { text: '今日は何曜日ですか？' } },
        } as never,
      });

      // Provider emits outputTranscription and first audio chunk (before turnComplete)
      liveEvent?.({
        message: {
          serverContent: { outputTranscription: { text: '今日は火曜日です。' } },
          data: Buffer.from([10, 20]).toString('base64'),
        } as never,
      });

      // Inspect messages received so far (turnComplete has NOT occurred yet)
      const nonBinaryMessages = ws.sent.map((item, idx) => ({
        idx,
        binary: item.binary,
        data: item.binary ? null : JSON.parse(String(item.data)),
      }));

      const sttMsg = nonBinaryMessages.find((m) => m.data?.type === 'stt');
      const ttsStartMsg = nonBinaryMessages.find(
        (m) => m.data?.type === 'tts' && m.data?.state === 'start'
      );
      const firstBinary = ws.sent.findIndex((item) => item.binary);

      // Invariant 1: STT exists before turnComplete
      expect(sttMsg).toBeDefined();
      expect(sttMsg?.data.text).toBe('今日は何曜日ですか？');

      // Invariant 2: STT was sent BEFORE tts start and BEFORE audio binary
      expect(ttsStartMsg).toBeDefined();
      expect(sttMsg!.idx).toBeLessThan(ttsStartMsg!.idx);
      expect(firstBinary).toBeGreaterThanOrEqual(0);
      expect(sttMsg!.idx).toBeLessThan(firstBinary);

      // Invariant 3: Assistant streaming is active before turnComplete (binary audio arrived immediately)
      expect(firstBinary).toBeGreaterThanOrEqual(0);

      // Complete turn
      liveEvent?.({
        message: {
          serverContent: { turnComplete: true },
        } as never,
      });

      const allMessages = ws.sent
        .filter((item) => !item.binary)
        .map((item) => JSON.parse(String(item.data)));

      const sttCount = allMessages.filter((m) => m.type === 'stt').length;
      const ttsStartCount = allMessages.filter(
        (m) => m.type === 'tts' && m.state === 'start'
      ).length;
      const ttsStopCount = allMessages.filter((m) => m.type === 'tts' && m.state === 'stop').length;

      // Exactly one logical user turn and assistant response
      expect(sttCount).toBe(1);
      expect(ttsStartCount).toBe(1);
      expect(ttsStopCount).toBe(1);
    });

    it('streams assistant text and audio immediately when output arrives before input without buffering until turnComplete', async () => {
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

      // Provider emits outputTranscription and audio BEFORE emitting inputTranscription
      liveEvent?.({
        message: {
          serverContent: { outputTranscription: { text: 'はい、分かりました。' } },
          data: Buffer.from([10, 20]).toString('base64'),
        } as never,
      });

      // Assert assistant output was streamed immediately without waiting for turnComplete or STT
      const audioPacketsBeforeTurnComplete = ws.sent.filter((item) => item.binary).length;
      expect(audioPacketsBeforeTurnComplete).toBe(1);

      const ttsStartBeforeTurnComplete = ws.sent
        .filter((item) => !item.binary)
        .some(
          (item) =>
            JSON.parse(String(item.data)).type === 'tts' &&
            JSON.parse(String(item.data)).state === 'start'
        );
      expect(ttsStartBeforeTurnComplete).toBe(true);

      // Now provider emits late inputTranscription
      liveEvent?.({
        message: { serverContent: { inputTranscription: { text: 'こんにちは' } } } as never,
      });

      // Provider emits authoritative turnComplete
      liveEvent?.({
        message: {
          serverContent: { turnComplete: true },
        } as never,
      });

      const allMessages = ws.sent
        .filter((item) => !item.binary)
        .map((item) => JSON.parse(String(item.data)));

      expect(allMessages.filter((m) => m.type === 'stt')).toEqual([
        { type: 'stt', text: 'こんにちは' },
      ]);
      expect(allMessages.filter((m) => m.type === 'tts' && m.state === 'start')).toHaveLength(1);
      expect(allMessages.filter((m) => m.type === 'tts' && m.state === 'stop')).toHaveLength(1);
    });

    it('preserves Japanese UTF-8 characters across cumulative and delta fragments without corruption', async () => {
      const sample = '今日は何曜日ですか？ の ひらがな カタカナ 日本語';
      // Test UTF-8 byte roundtrip
      const utf8Buffer = Buffer.from(sample, 'utf-8');
      expect(utf8Buffer.toString('utf-8')).toBe(sample);

      // Cumulative fragment merge
      expect(mergeTranscriptFragment('今日', '今日は何曜日ですか？')).toBe('今日は何曜日ですか？');
      expect(mergeTranscriptFragment('今日は何曜日ですか？', sample)).toBe(sample);

      // Delta fragment merge
      expect(mergeTranscriptFragment('ひらがな ', 'カタカナ 日本語')).toBe(
        'ひらがな カタカナ 日本語'
      );

      // In session handling
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
        message: {
          serverContent: { inputTranscription: { text: '今日は何曜日ですか？' } },
        } as never,
      });
      liveEvent?.({
        message: {
          serverContent: {
            outputTranscription: { text: sample },
            turnComplete: true,
          },
          data: Buffer.from([1, 2]).toString('base64'),
        } as never,
      });

      const stt = ws.sent
        .filter((item) => !item.binary)
        .map((item) => JSON.parse(String(item.data)))
        .find((m) => m.type === 'stt');
      expect(stt?.text).toBe('今日は何曜日ですか？');

      const sentenceStart = ws.sent
        .filter((item) => !item.binary)
        .map((item) => JSON.parse(String(item.data)))
        .find((m) => m.type === 'tts' && m.state === 'sentence_start');
      expect(sentenceStart?.text).toBe(sample);
    });

    it('resets transcript and turn state cleanly across interruption and subsequent turns', async () => {
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

      // --- Turn 1: Interrupted mid-speech ---
      await session.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );
      liveEvent?.({
        message: { serverContent: { inputTranscription: { text: 'Turn 1 Question' } } } as never,
      });
      liveEvent?.({
        message: {
          serverContent: { outputTranscription: { text: 'Turn 1 Partial Answer' } },
          data: Buffer.from([1, 2]).toString('base64'),
        } as never,
      });

      // User interrupts with new listen: start
      await session.handleMessage(
        Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
        false
      );

      // --- Turn 2: Fresh turn ---
      liveEvent?.({
        message: { serverContent: { inputTranscription: { text: 'Turn 2 Question' } } } as never,
      });
      liveEvent?.({
        message: {
          serverContent: {
            outputTranscription: { text: 'Turn 2 Complete Answer' },
            turnComplete: true,
          },
          data: Buffer.from([3, 4]).toString('base64'),
        } as never,
      });

      const allMessages = ws.sent
        .filter((item) => !item.binary)
        .map((item) => JSON.parse(String(item.data)));

      const sttMessages = allMessages.filter((m) => m.type === 'stt');
      expect(sttMessages.map((m) => m.text)).toEqual(['Turn 1 Question', 'Turn 2 Question']);

      const sentenceStarts = allMessages.filter(
        (m) => m.type === 'tts' && m.state === 'sentence_start'
      );
      expect(sentenceStarts.map((m) => m.text)).toContain('Turn 2 Complete Answer');
      // Verify Turn 2 sentence start has NO Turn 1 text concatenated
      const turn2Sentence = sentenceStarts.find((m) => m.text === 'Turn 2 Complete Answer');
      expect(turn2Sentence).toBeDefined();
    });
  });

  describe('Voice AI timing instrumentation', () => {
    it('sanitizes numeric timestamps strictly to digits and rejects private data or non-numbers', () => {
      expect(sanitizeTimingMs(1725800000123)).toBe('1725800000123');
      expect(sanitizeTimingMs(1725800000123.99)).toBe('1725800000123');
      expect(sanitizeTimingMs(0)).toBe('0');
      expect(sanitizeTimingMs(-500)).toBe('0');
      expect(sanitizeTimingMs(NaN)).toBe('0');
      expect(sanitizeTimingMs(Infinity)).toBe('0');
      expect(sanitizeTimingMs(-Infinity)).toBe('0');
      expect(sanitizeTimingMs('secret_token')).toBe('0');
      expect(sanitizeTimingMs(new Error('stack trace with password'))).toBe('0');
      expect(sanitizeTimingMs({ id: 'uuid-123', text: 'private' })).toBe('0');
      expect(sanitizeTimingMs(null)).toBe('0');
      expect(sanitizeTimingMs(undefined)).toBe('0');
    });

    it('emits boolean markers and sanitized numeric timestamps with first-occurrence semantics and provider aliases', () => {
      const logs: string[] = [];
      const fakeLogger = {
        log: (msg: string) => logs.push(msg),
      } as unknown as Logger;

      let currentTime = 1725800000100;
      const timing = new VoiceTimingTrace(fakeLogger, () => currentTime);

      timing.mark('T_DEVICE_LISTEN_START');
      expect(logs).toEqual(['T_DEVICE_LISTEN_START=YES', 'T_DEVICE_LISTEN_START_MS=1725800000100']);

      // Repeated call must be ignored (first-occurrence semantics)
      currentTime = 1725800000200;
      timing.mark('T_DEVICE_LISTEN_START');
      expect(logs).toHaveLength(2);

      // Provider alias: marking T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN emits both
      currentTime = 1725800000300;
      timing.mark('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN');
      expect(logs.slice(2)).toEqual([
        'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN=YES',
        'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS=1725800000300',
        'T_PROVIDER_SESSION_READY=YES',
        'T_PROVIDER_SESSION_READY_MS=1725800000300',
      ]);

      // Calling T_PROVIDER_SESSION_READY afterwards must not re-emit
      timing.mark('T_PROVIDER_SESSION_READY');
      expect(logs).toHaveLength(6);

      // Reverse alias check with fresh trace
      const reverseLogs: string[] = [];
      const reverseLogger = {
        log: (msg: string) => reverseLogs.push(msg),
      } as unknown as Logger;
      const reverseTiming = new VoiceTimingTrace(reverseLogger, () => 1725800000400);
      reverseTiming.mark('T_PROVIDER_SESSION_READY');
      expect(reverseLogs).toEqual([
        'T_PROVIDER_SESSION_READY=YES',
        'T_PROVIDER_SESSION_READY_MS=1725800000400',
        'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN=YES',
        'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS=1725800000400',
      ]);
    });

    it('emits all stage timing markers during turn lifecycle without leaking private data', async () => {
      const ws = socket() as unknown as FakeSocket;
      const logs: string[] = [];
      const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
        logs.push(String(msg));
      });

      let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
      const connection: GeminiLiveConnection = {
        sendAudio: () => {},
        sendText: () => {},
        endAudio: () => {},
        respondToToolCalls: () => {},
        rejectToolCalls: () => {},
        reconnect: async () => {},
        close: () => {},
      };

      try {
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
            serverContent: {
              outputTranscription: { text: 'Private assistant answer text' },
              turnComplete: true,
            },
            data: Buffer.from([4, 5]).toString('base64'),
          } as never,
        });

        // Stage markers that must be emitted
        const expectedStages = [
          'T_DEVICE_LISTEN_START',
          'T_FIRST_DEVICE_AUDIO_SENT',
          'T_BACKEND_FIRST_AUDIO_RECEIVED',
          'T_PROVIDER_SESSION_READY',
          'T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN',
          'T_PROVIDER_FIRST_OUTPUT_EVENT',
          'T_PROVIDER_FIRST_AUDIO_EVENT',
          'T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE',
          'T_TRANSCRIPT_FINALIZED',
        ];

        for (const stage of expectedStages) {
          expect(logs).toContain(`${stage}=YES`);
          const msLog = logs.find((line) => line.startsWith(`${stage}_MS=`));
          expect(msLog).toBeDefined();
          const msVal = msLog!.slice(`${stage}_MS=`.length);
          expect(/^\d+$/.test(msVal)).toBe(true);
          expect(Number(msVal)).toBeGreaterThan(0);
        }

        // Verify provider ready and alias have identical timestamp
        const readyMs = logs.find((line) => line.startsWith('T_PROVIDER_SESSION_READY_MS='))!;
        const aliasMs = logs.find((line) =>
          line.startsWith('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS=')
        )!;
        expect(readyMs.replace('T_PROVIDER_SESSION_READY_MS=', '')).toBe(
          aliasMs.replace('T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS=', '')
        );

        // Privacy verification: no private text, credentials, or session payload in timing markers
        const timingLogs = logs.filter((line) => line.startsWith('T_'));
        for (const line of timingLogs) {
          expect(line).not.toContain('Private assistant answer text');
          expect(line).not.toContain('secret');
          expect(line).not.toContain('websocket');
        }
      } finally {
        loggerSpy.mockRestore();
      }
    });

    it('isolates per-turn first-occurrence state and provides explicit turn association without stale state across turns', () => {
      const logs: string[] = [];
      const fakeLogger = {
        log: (msg: string) => logs.push(msg),
      } as unknown as Logger;

      let currentTime = 1725800000000;
      const timing = new VoiceTimingTrace(fakeLogger, () => currentTime);

      // Turn 1
      timing.startTurn(1, currentTime);
      expect(timing.getTurn()).toBe(1);
      expect(timing.has('T_DEVICE_LISTEN_START')).toBe(false);

      currentTime += 50;
      timing.mark('T_DEVICE_LISTEN_START', currentTime);
      expect(timing.has('T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.hasForTurn(1, 'T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.getStageTimestamp('T_DEVICE_LISTEN_START', 1)).toBe('1725800000050');

      // Duplicate mark in same turn must be ignored (first-occurrence within turn)
      currentTime += 10;
      timing.mark('T_DEVICE_LISTEN_START', currentTime);
      expect(timing.getStageTimestamp('T_DEVICE_LISTEN_START', 1)).toBe('1725800000050');

      currentTime += 100;
      timing.mark('T_BACKEND_FIRST_AUDIO_RECEIVED', currentTime);
      expect(timing.has('T_BACKEND_FIRST_AUDIO_RECEIVED')).toBe(true);

      // Turn 2 starts: MUST NOT have stale first-occurrence state from Turn 1
      currentTime = 1725800001000;
      timing.startTurn(2, currentTime);
      expect(timing.getTurn()).toBe(2);

      // Crucial invariant: has() returns false for Turn 2 before stages are marked
      expect(timing.has('T_DEVICE_LISTEN_START')).toBe(false);
      expect(timing.has('T_BACKEND_FIRST_AUDIO_RECEIVED')).toBe(false);
      // But hasEver() and hasForTurn(1, ...) retain historical record
      expect(timing.hasEver('T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.hasForTurn(1, 'T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.hasForTurn(2, 'T_DEVICE_LISTEN_START')).toBe(false);

      // Marking stage in Turn 2 associates with Turn 2
      currentTime += 40;
      timing.mark('T_DEVICE_LISTEN_START', currentTime);
      expect(timing.has('T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.hasForTurn(2, 'T_DEVICE_LISTEN_START')).toBe(true);
      expect(timing.getStageTimestamp('T_DEVICE_LISTEN_START', 2)).toBe('1725800001040');
      // Turn 1 timestamp remains intact and unaffected
      expect(timing.getStageTimestamp('T_DEVICE_LISTEN_START', 1)).toBe('1725800000050');
    });
  });

  describe('Multi-turn soak and backpressure boundedness', () => {
    it('maintains bounded queues, per-turn timing markers, and correct bubble ordering across 10 sequential turns', async () => {
      const ws = socket() as unknown as FakeSocket;
      const logs: string[] = [];
      const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
        logs.push(String(msg));
      });
      let liveEvent: ((event: GeminiLiveEvent) => void) | undefined;
      const sentAudioChunks: Buffer[] = [];
      let endAudioCount = 0;

      const connection: GeminiLiveConnection = {
        sendAudio: (data: Buffer) => {
          sentAudioChunks.push(data);
        },
        sendText: () => {},
        endAudio: () => {
          endAudioCount++;
        },
        respondToToolCalls: () => {},
        rejectToolCalls: () => {},
        reconnect: async () => {},
        close: () => {},
      };

      try {
        const liveService = {
          connect: async (_language: 'en', onEvent: (event: GeminiLiveEvent) => void) => {
            liveEvent = onEvent;
            return connection;
          },
        } as never;

        const session = new XiaozhiVoiceSession(ws, liveService, codec);

        // Handshake
        await session.handleMessage(
          Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
          false
        );

        expect(session.getOperationQueueDepth()).toBe(0);
        expect(session.getPreProviderMicQueueFrames()).toBe(0);
        expect(session.getPreProviderMicQueueBytes()).toBe(0);
        expect(session.getWebSocketBufferedBytes()).toBe(0);

        const NUM_TURNS = 10;
        for (let turn = 1; turn <= NUM_TURNS; turn++) {
          // 1. Client starts listening
          await session.handleMessage(
            Buffer.from(JSON.stringify({ type: 'listen', state: 'start' })),
            false
          );

          expect((session as unknown as { listening: boolean }).listening).toBe(true);
          expect((session as unknown as { listenGeneration: number }).listenGeneration).toBe(turn);

          // Verify turn start markers emitted for this turn
          expect(logs).toContain(`VOICE_TURN_INDEX=${turn}`);
          expect(logs).toContain('VOICE_TURN_START=YES');
          expect(logs).toContain(`ACTIVE_LISTEN_GENERATION=${turn}`);

          // 2. Client sends 3 audio frames
          for (let f = 0; f < 3; f++) {
            await session.handleMessage(Buffer.from([turn, f, 1, 2, 3]), true);
          }

          // Audio was forwarded to provider
          expect(sentAudioChunks.length).toBe(turn * 3);

          // 3. User finishes speaking
          await session.handleMessage(
            Buffer.from(JSON.stringify({ type: 'listen', state: 'stop' })),
            false
          );
          expect(endAudioCount).toBe(turn);

          // 4. Provider sends user input transcription
          liveEvent?.({
            message: {
              serverContent: {
                inputTranscription: { text: `User turn ${turn} question` },
              },
            } as never,
          });

          // 5. Provider streams assistant output transcription and audio chunks
          liveEvent?.({
            message: {
              serverContent: {
                outputTranscription: { text: `Turn ${turn} ` },
              },
              data: Buffer.from([turn, 10]).toString('base64'),
            } as never,
          });

          liveEvent?.({
            message: {
              serverContent: {
                outputTranscription: { text: `Turn ${turn} answer completed.` },
              },
              data: Buffer.from([turn, 20]).toString('base64'),
            } as never,
          });

          // 6. Provider completes turn
          liveEvent?.({
            message: {
              serverContent: {
                turnComplete: true,
              },
            } as never,
          });

          // Queue backlogs MUST return to 0 after every turn
          expect(session.getOperationQueueDepth()).toBe(0);
          expect(session.getPreProviderMicQueueFrames()).toBe(0);
          expect(session.getPreProviderMicQueueBytes()).toBe(0);
        }

        // Verify sent messages across all 10 turns:
        const sentMessages = ws.sent;
        const textMessages = sentMessages
          .filter((item) => !item.binary)
          .map((item) => JSON.parse(String(item.data)));

        // Verify that for each turn, stt was emitted with exact text
        const sttMessages = textMessages.filter((m) => m.type === 'stt');
        expect(sttMessages).toHaveLength(NUM_TURNS);
        for (let turn = 1; turn <= NUM_TURNS; turn++) {
          expect(sttMessages[turn - 1].text).toBe(`User turn ${turn} question`);
        }

        // Verify timing markers were emitted per turn and none leaked private data
        for (let turn = 1; turn <= NUM_TURNS; turn++) {
          expect(logs).toContain(`VOICE_TURN_INDEX=${turn}`);
        }

        for (const log of logs) {
          expect(log).not.toContain('User turn');
          expect(log).not.toContain('answer completed');
        }
      } finally {
        loggerSpy.mockRestore();
      }
    });

    it('tracks WebSocket buffered amount backpressure correctly', async () => {
      const ws = socket() as unknown as FakeSocket;
      ws.bufferedAmount = 65536;
      const logs: string[] = [];
      const loggerSpy = spyOn(Logger.prototype, 'log').mockImplementation((msg: string) => {
        logs.push(String(msg));
      });

      try {
        const liveService = {
          connect: async () => ({
            sendAudio: () => {},
            sendText: () => {},
            endAudio: () => {},
            respondToToolCalls: () => {},
            rejectToolCalls: () => {},
            reconnect: async () => {},
            close: () => {},
          }),
        } as never;

        const session = new XiaozhiVoiceSession(ws, liveService, codec);
        expect(session.getWebSocketBufferedBytes()).toBe(65536);

        await session.handleMessage(
          Buffer.from(JSON.stringify({ type: 'hello', version: 1, transport: 'websocket' })),
          false
        );

        expect(logs).toContain('VOICE_WS_BUFFERED_BYTES=65536');
        expect(logs).toContain('VOICE_WS_SEND_BACKLOG_BYTES=65536');
      } finally {
        loggerSpy.mockRestore();
      }
    });
  });
});
