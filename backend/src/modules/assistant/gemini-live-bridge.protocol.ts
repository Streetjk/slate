import type { VoiceLanguageT } from 'shared';

export const GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION = 1 as const;
export const GEMINI_LIVE_BRIDGE_MAX_FRAME_BYTES = 2 * 1024 * 1024;

export type GeminiLiveBridgeOpen = {
  type: 'open';
  version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION;
  model: string;
  language: VoiceLanguageT;
  systemInstruction: string;
  connectTimeoutMs: number;
  enableWebSearch: boolean;
  tools: unknown[];
};

export type GeminiLiveBridgeRequest =
  | GeminiLiveBridgeOpen
  | { type: 'audio'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION; data: string }
  | { type: 'text'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION; text: string }
  | { type: 'audio_end'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION }
  | {
      type: 'tool_response';
      version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION;
      calls: Array<{ id: string; name: string; response: Record<string, unknown> }>;
    }
  | { type: 'reconnect'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION }
  | { type: 'close'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION };

export type GeminiLiveBridgeResponse =
  | { type: 'ready'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION }
  | {
      type: 'server_message';
      version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION;
      message: unknown;
    }
  | {
      type: 'error';
      version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION;
      code: GeminiLiveBridgeErrorCode;
    }
  | { type: 'closed'; version: typeof GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION };

export type GeminiLiveBridgeErrorCode =
  | 'BRIDGE_NOT_READY'
  | 'BRIDGE_ALREADY_OPEN'
  | 'BRIDGE_RUNTIME_UNAVAILABLE'
  | 'BRIDGE_CREDENTIAL_UNAVAILABLE'
  | 'BRIDGE_PROVIDER_CONNECTION_FAILED'
  | 'BRIDGE_PROVIDER_ERROR'
  | 'BRIDGE_PROTOCOL_REJECTED'
  | 'BRIDGE_SHUTDOWN';

export class GeminiLiveBridgeProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiLiveBridgeProtocolError';
  }
}

export function encodeGeminiLiveBridgeFrame(frame: GeminiLiveBridgeRequest): string {
  const encoded = `${JSON.stringify(frame)}\n`;
  if (Buffer.byteLength(encoded, 'utf8') > GEMINI_LIVE_BRIDGE_MAX_FRAME_BYTES) {
    throw new GeminiLiveBridgeProtocolError('bridge frame is too large');
  }
  return encoded;
}

export function parseGeminiLiveBridgeResponse(line: string): GeminiLiveBridgeResponse {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new GeminiLiveBridgeProtocolError('bridge response was not valid JSON');
  }

  if (!isRecord(value) || value.version !== GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION) {
    throw new GeminiLiveBridgeProtocolError('bridge response version is unsupported');
  }
  if (typeof value.type !== 'string') {
    throw new GeminiLiveBridgeProtocolError('bridge response type is missing');
  }

  switch (value.type) {
    case 'ready':
    case 'closed':
      assertOnlyKeys(value, ['type', 'version']);
      return value as GeminiLiveBridgeResponse;
    case 'server_message':
      assertOnlyKeys(value, ['type', 'version', 'message']);
      if (!('message' in value))
        throw new GeminiLiveBridgeProtocolError('server message is missing');
      return value as GeminiLiveBridgeResponse;
    case 'error':
      assertOnlyKeys(value, ['type', 'version', 'code']);
      if (!isBridgeErrorCode(value.code)) {
        throw new GeminiLiveBridgeProtocolError('bridge error code is unsupported');
      }
      return value as GeminiLiveBridgeResponse;
    default:
      throw new GeminiLiveBridgeProtocolError('bridge response type is unsupported');
  }
}

export function assertGeminiLiveBridgeOpen(value: unknown): asserts value is GeminiLiveBridgeOpen {
  if (!isRecord(value)) throw new GeminiLiveBridgeProtocolError('open frame must be an object');
  assertOnlyKeys(value, [
    'type',
    'version',
    'model',
    'language',
    'systemInstruction',
    'connectTimeoutMs',
    'enableWebSearch',
    'tools',
  ]);
  if (
    value.type !== 'open' ||
    value.version !== GEMINI_LIVE_BRIDGE_PROTOCOL_VERSION ||
    typeof value.model !== 'string' ||
    value.model.length === 0 ||
    (value.language !== 'en' && value.language !== 'ja') ||
    typeof value.systemInstruction !== 'string' ||
    typeof value.connectTimeoutMs !== 'number' ||
    !Number.isInteger(value.connectTimeoutMs) ||
    value.connectTimeoutMs <= 0 ||
    typeof value.enableWebSearch !== 'boolean' ||
    !Array.isArray(value.tools)
  ) {
    throw new GeminiLiveBridgeProtocolError('open frame is invalid');
  }
}

function isBridgeErrorCode(value: unknown): value is GeminiLiveBridgeErrorCode {
  return (
    typeof value === 'string' &&
    [
      'BRIDGE_NOT_READY',
      'BRIDGE_ALREADY_OPEN',
      'BRIDGE_RUNTIME_UNAVAILABLE',
      'BRIDGE_CREDENTIAL_UNAVAILABLE',
      'BRIDGE_PROVIDER_CONNECTION_FAILED',
      'BRIDGE_PROVIDER_ERROR',
      'BRIDGE_PROTOCOL_REJECTED',
      'BRIDGE_SHUTDOWN',
    ].includes(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOnlyKeys(value: Record<string, unknown>, keys: string[]): void {
  const allowed = new Set(keys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new GeminiLiveBridgeProtocolError('bridge frame contains an unknown field');
  }
}
