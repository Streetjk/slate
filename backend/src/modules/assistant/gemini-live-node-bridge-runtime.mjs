import { closeSync, fstatSync, openSync, readFileSync, constants } from 'node:fs';
import { resolve } from 'node:path';
import { GoogleGenAI, Modality } from '@google/genai/node';
import { createLiveSessionEpochController } from './gemini-live-node-bridge-session.mjs';

const PROTOCOL_VERSION = 1;
const MAX_FRAME_BYTES = 2 * 1024 * 1024;
const MAX_TEXT_BYTES = 16 * 1024;
const MAX_MODEL_BYTES = 256;
const MAX_SYSTEM_INSTRUCTION_BYTES = 32 * 1024;
const MAX_CREDENTIAL_BYTES = 4096;
const CANONICAL_FUNCTION_DECLARATIONS = [
  {
    name: 'propose_google_calendar_event',
    description:
      'Propose a Google Calendar event for user confirmation. Never create or modify an event directly.',
    parametersJsonSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'start', 'end', 'allDay'],
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 256 },
        start: {
          type: 'string',
          description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events',
        },
        end: { type: 'string', description: 'ISO 8601 date-time or YYYY-MM-DD for all-day events' },
        allDay: { type: 'boolean' },
        location: { type: 'string', minLength: 1, maxLength: 256 },
        timezone: { type: 'string', minLength: 1, maxLength: 64 },
      },
    },
  },
  {
    name: 'get_btc_price',
    description: 'Request a cached BTC/USD series for a supported display period.',
    parametersJsonSchema: {
      type: 'object',
      additionalProperties: false,
      properties: { period: { type: 'string', enum: ['daily', 'weekly', 'monthly'] } },
    },
  },
];
const credentialFile = process.env.SLATE_GEMINI_BRIDGE_CREDENTIAL_FILE;
const authMode = process.env.SLATE_GEMINI_BRIDGE_AUTH_MODE;
const expectedModel = process.env.SLATE_GEMINI_BRIDGE_MODEL;
let openFrame;
const sessions = createLiveSessionEpochController();
let shuttingDown = false;

function send(frame) {
  if (shuttingDown) return;
  try {
    process.stdout.write(`${JSON.stringify(frame)}\n`);
  } catch {
    shutdown(2);
  }
}

function error(code, epoch = sessions.activeEpoch) {
  send({ type: 'error', version: PROTOCOL_VERSION, epoch, code });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  const currentSession = sessions.currentSession;
  const closingEpoch = sessions.invalidate();
  try {
    currentSession?.close();
  } catch {
    // Provider cleanup is best effort; the process is exiting.
  }
  if (code === 0) {
    try {
      process.stdout.write(
        `${JSON.stringify({ type: 'closed', version: PROTOCOL_VERSION, epoch: closingEpoch })}\n`
      );
    } catch {
      // stdout may already be closed.
    }
  }
  setImmediate(() => process.exit(code));
}

function readCredential() {
  if (authMode !== 'developer_api_key' || typeof credentialFile !== 'string') {
    return undefined;
  }
  let descriptor;
  try {
    if (typeof constants.O_NOFOLLOW !== 'number') throw new Error('nofollow');
    descriptor = openSync(credentialFile, constants.O_RDONLY | constants.O_NOFOLLOW);
    const stats = fstatSync(descriptor);
    if (!stats.isFile() || stats.size === 0 || stats.size > MAX_CREDENTIAL_BYTES)
      throw new Error('file');
    if ((stats.mode & 0o077) !== 0) throw new Error('permissions');
    const value = readFileSync(descriptor, 'utf8').trim();
    if (!value) throw new Error('empty');
    return value;
  } catch {
    throw new BridgeRuntimeError('BRIDGE_CREDENTIAL_UNAVAILABLE');
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function createClient() {
  try {
    if (authMode === 'developer_api_key') {
      const apiKey = readCredential();
      return new GoogleGenAI({ apiKey });
    }
    if (authMode === 'vertex_adc') {
      const project = process.env.SLATE_GEMINI_BRIDGE_PROJECT;
      const location = process.env.SLATE_GEMINI_BRIDGE_LOCATION;
      const adcFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (!project || !location || !isSafeCredentialFileReference(adcFile))
        throw new BridgeRuntimeError('BRIDGE_RUNTIME_UNAVAILABLE');
      return new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
    }
    throw new BridgeRuntimeError('BRIDGE_RUNTIME_UNAVAILABLE');
  } catch (cause) {
    if (cause instanceof BridgeRuntimeError) throw cause;
    throw new BridgeRuntimeError('BRIDGE_CREDENTIAL_UNAVAILABLE');
  }
}

async function openSession(frame, epochAlreadyActive = false) {
  if (sessions.currentSession) throw new BridgeRuntimeError('BRIDGE_ALREADY_OPEN');
  if (!epochAlreadyActive) {
    try {
      sessions.begin(frame.epoch);
    } catch {
      throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
    }
  } else if (frame.epoch !== sessions.activeEpoch) {
    throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
  }
  const epoch = frame.epoch;
  const client = createClient();
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), frame.connectTimeoutMs);
  let nextSession;
  const isCurrent = () =>
    !shuttingDown && sessions.isCurrent(epoch, nextSession);
  try {
    nextSession = await client.live.connect({
      model: frame.model,
      config: {
        abortSignal: abortController.signal,
        responseModalities: [Modality.AUDIO],
        systemInstruction: frame.systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: frame.tools,
      },
      callbacks: {
        onmessage: (message) => {
          if (isCurrent())
            send({ type: 'server_message', version: PROTOCOL_VERSION, epoch, message });
        },
        onerror: () => {
          if (isCurrent()) error('BRIDGE_PROVIDER_ERROR', epoch);
        },
        onclose: () => {
          if (!isCurrent()) return;
          sessions.clear(epoch, nextSession);
          send({ type: 'closed', version: PROTOCOL_VERSION, epoch });
        },
      },
    });
    if (shuttingDown || sessions.activeEpoch !== epoch || !sessions.install(epoch, nextSession)) {
      nextSession.close();
      throw new BridgeRuntimeError('BRIDGE_PROVIDER_CONNECTION_FAILED');
    }
    openFrame = frame;
    send({ type: 'ready', version: PROTOCOL_VERSION, epoch });
  } catch (cause) {
    sessions.clear(epoch, nextSession);
    openFrame = undefined;
    if (cause?.name === 'AbortError')
      throw new BridgeRuntimeError('BRIDGE_PROVIDER_CONNECTION_FAILED');
    if (cause instanceof BridgeRuntimeError) throw cause;
    throw new BridgeRuntimeError('BRIDGE_PROVIDER_CONNECTION_FAILED');
  } finally {
    clearTimeout(timeout);
  }
}

async function handle(frame) {
  if (!isRecord(frame) || frame.version !== PROTOCOL_VERSION || typeof frame.type !== 'string') {
    throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
  }
  switch (frame.type) {
    case 'open':
      if (!isValidOpen(frame)) throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      await openSession(frame);
      return;
    case 'audio':
      if (!isValidAudio(frame)) throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      requireSession().sendRealtimeInput({
        audio: { data: frame.data, mimeType: 'audio/pcm;rate=16000' },
      });
      return;
    case 'text':
      if (!isValidText(frame)) throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      requireSession().sendRealtimeInput({ text: frame.text });
      return;
    case 'audio_end':
      if (!hasExactKeys(frame, ['type', 'version']))
        throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      requireSession().sendRealtimeInput({ audioStreamEnd: true });
      return;
    case 'tool_response':
      if (!isValidToolResponse(frame)) throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      requireSession().sendToolResponse({ functionResponses: frame.calls });
      return;
    case 'reconnect':
      if (
        !hasExactKeys(frame, ['type', 'version', 'epoch']) ||
        !Number.isInteger(frame.epoch) ||
        frame.epoch <= sessions.activeEpoch
      )
        throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      if (!openFrame) throw new BridgeRuntimeError('BRIDGE_NOT_READY');
      const previousSession = sessions.currentSession;
      sessions.begin(frame.epoch);
      previousSession?.close();
      await openSession({ ...openFrame, epoch: frame.epoch }, true);
      return;
    case 'close':
      if (!hasExactKeys(frame, ['type', 'version', 'epoch']) || frame.epoch !== sessions.activeEpoch)
        throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      shutdown(0);
      return;
    default:
      throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
  }
}

function requireSession() {
  if (!sessions.currentSession || shuttingDown) throw new BridgeRuntimeError('BRIDGE_NOT_READY');
  return sessions.currentSession;
}

function isValidOpen(frame) {
  return (
    hasExactKeys(frame, [
      'type',
      'version',
      'epoch',
      'model',
      'language',
      'systemInstruction',
      'connectTimeoutMs',
      'enableWebSearch',
      'tools',
    ]) &&
    typeof frame.model === 'string' &&
    frame.model.length > 0 &&
    Buffer.byteLength(frame.model, 'utf8') <= MAX_MODEL_BYTES &&
    Number.isInteger(frame.epoch) &&
    frame.epoch > 0 &&
    typeof expectedModel === 'string' &&
    frame.model === expectedModel &&
    (frame.language === 'en' || frame.language === 'ja') &&
    typeof frame.systemInstruction === 'string' &&
    Buffer.byteLength(frame.systemInstruction, 'utf8') <= MAX_SYSTEM_INSTRUCTION_BYTES &&
    Number.isInteger(frame.connectTimeoutMs) &&
    frame.connectTimeoutMs > 0 &&
    frame.connectTimeoutMs <= 120_000 &&
    typeof frame.enableWebSearch === 'boolean' &&
    isValidTools(frame.tools, frame.enableWebSearch)
  );
}

function isValidAudio(frame) {
  return (
    hasExactKeys(frame, ['type', 'version', 'data']) &&
    typeof frame.data === 'string' &&
    frame.data.length > 0 &&
    frame.data.length <= 1_048_576 &&
    frame.data.length % 4 === 0 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(frame.data) &&
    Buffer.from(frame.data, 'base64').toString('base64') === frame.data &&
    Buffer.from(frame.data, 'base64').byteLength % 2 === 0
  );
}

function isValidText(frame) {
  return (
    hasExactKeys(frame, ['type', 'version', 'text']) &&
    typeof frame.text === 'string' &&
    frame.text.length > 0 &&
    Buffer.byteLength(frame.text, 'utf8') <= MAX_TEXT_BYTES
  );
}

function isValidToolResponse(frame) {
  return (
    hasExactKeys(frame, ['type', 'version', 'calls']) &&
    Array.isArray(frame.calls) &&
    frame.calls.length <= 16 &&
    frame.calls.every(
      (call) =>
        isRecord(call) &&
        hasExactKeys(call, ['id', 'name', 'response']) &&
        typeof call.id === 'string' &&
        call.id.length > 0 &&
        call.id.length <= 256 &&
        typeof call.name === 'string' &&
        call.name.length > 0 &&
        call.name.length <= 256 &&
        (call.name === 'propose_google_calendar_event' || call.name === 'get_btc_price') &&
        isRecord(call.response)
    )
  );
}

function isValidTools(tools, enableWebSearch) {
  const expectedFunctions = JSON.stringify(CANONICAL_FUNCTION_DECLARATIONS);
  const expectedLength = enableWebSearch ? 2 : 1;
  if (!Array.isArray(tools) || tools.length !== expectedLength) return false;
  const functionTool = enableWebSearch ? tools[1] : tools[0];
  if (enableWebSearch) {
    const searchTool = tools[0];
    if (!isRecord(searchTool) || !hasExactKeys(searchTool, ['googleSearch'])) return false;
    if (!isRecord(searchTool.googleSearch) || Object.keys(searchTool.googleSearch).length !== 0)
      return false;
  }
  return (
    isRecord(functionTool) &&
    hasExactKeys(functionTool, ['functionDeclarations']) &&
    JSON.stringify(functionTool.functionDeclarations) === expectedFunctions
  );
}

function isSafeCredentialFileReference(filePath) {
  if (typeof filePath !== 'string') return false;
  const resolved = resolve(filePath);
  if (!['/run/secrets/', '/var/run/secrets/'].some((root) => resolved.startsWith(root)))
    return false;
  let descriptor;
  try {
    if (typeof constants.O_NOFOLLOW !== 'number') return false;
    descriptor = openSync(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
    const stats = fstatSync(descriptor);
    return stats.isFile() && stats.size > 0 && stats.size <= 64 * 1024 && (stats.mode & 0o077) === 0;
  } catch {
    return false;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function hasExactKeys(value, keys) {
  const expected = new Set(keys);
  return (
    Object.keys(value).length === expected.size &&
    Object.keys(value).every((key) => expected.has(key))
  );
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

class BridgeRuntimeError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

process.stdin.setEncoding('utf8');
let inputBuffer = '';
for await (const chunk of process.stdin) {
  if (shuttingDown) break;
  inputBuffer += chunk;
  if (Buffer.byteLength(inputBuffer, 'utf8') > MAX_FRAME_BYTES) {
    error('BRIDGE_PROTOCOL_REJECTED');
    shutdown(2);
    break;
  }
  let newline = inputBuffer.indexOf('\n');
  while (newline >= 0 && !shuttingDown) {
    const line = inputBuffer.slice(0, newline).replace(/\r$/, '');
    inputBuffer = inputBuffer.slice(newline + 1);
    try {
      await handle(JSON.parse(line));
    } catch (cause) {
      error(cause instanceof BridgeRuntimeError ? cause.code : 'BRIDGE_PROTOCOL_REJECTED');
      shutdown(2);
      break;
    }
    newline = inputBuffer.indexOf('\n');
  }
}

if (!shuttingDown && inputBuffer.length > 0) {
  error('BRIDGE_PROTOCOL_REJECTED');
  shutdown(2);
}

if (!shuttingDown) shutdown(0);
