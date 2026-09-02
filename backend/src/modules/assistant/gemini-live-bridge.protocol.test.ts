import { describe, expect, it } from 'bun:test';
import {
  assertGeminiLiveBridgeOpen,
  encodeGeminiLiveBridgeFrame,
  GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
  GeminiLiveBridgeProtocolError,
  parseGeminiLiveBridgeResponse,
} from './gemini-live-bridge.protocol';

describe('Gemini Live bridge protocol', () => {
  it('encodes versioned frames without a credential field', () => {
    const frame = encodeGeminiLiveBridgeFrame({
      type: 'text',
      version: GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION,
      text: 'synthetic input',
    });

    expect(frame).toBe('{"type":"text","version":1,"text":"synthetic input"}\n');
    expect(frame).not.toContain('credential');
    expect(frame).not.toContain('apiKey');
  });

  it('accepts only a complete open frame', () => {
    expect(() =>
      assertGeminiLiveBridgeOpen({
        type: 'open',
        version: 1,
        model: 'gemini-3.1-flash-live-preview',
        language: 'ja',
        systemInstruction: 'synthetic',
        connectTimeoutMs: 15_000,
        enableWebSearch: true,
        tools: [],
      })
    ).not.toThrow();

    expect(() =>
      assertGeminiLiveBridgeOpen({
        type: 'open',
        version: 1,
        model: 'gemini-3.1-flash-live-preview',
        language: 'en',
        systemInstruction: 'synthetic',
        connectTimeoutMs: 15_000,
        enableWebSearch: false,
        tools: [],
        credential: 'must-not-be-accepted',
      })
    ).toThrow(GeminiLiveBridgeProtocolError);
  });

  it('rejects malformed or unknown responses', () => {
    expect(() => parseGeminiLiveBridgeResponse('{"type":"ready","version":2}')).toThrow(
      GeminiLiveBridgeProtocolError
    );
    expect(() => parseGeminiLiveBridgeResponse('{"type":"unknown","version":1}')).toThrow(
      GeminiLiveBridgeProtocolError
    );
    expect(() =>
      parseGeminiLiveBridgeResponse('{"type":"error","version":1,"code":"raw-secret"}')
    ).toThrow(GeminiLiveBridgeProtocolError);
  });

  it('accepts sanitized errors and server messages', () => {
    expect(
      parseGeminiLiveBridgeResponse(
        '{"type":"error","version":1,"code":"BRIDGE_PROVIDER_CONNECTION_FAILED"}'
      )
    ).toEqual({
      type: 'error',
      version: 1,
      code: 'BRIDGE_PROVIDER_CONNECTION_FAILED',
    });
    expect(
      parseGeminiLiveBridgeResponse(
        '{"type":"server_message","version":1,"message":{"synthetic":true}}'
      )
    ).toEqual({
      type: 'server_message',
      version: 1,
      message: { synthetic: true },
    });
  });
});
