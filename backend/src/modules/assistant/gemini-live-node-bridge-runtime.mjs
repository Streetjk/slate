import { readFileSync, lstatSync, statSync, accessSync, constants } from 'node:fs';
import { createInterface } from 'node:readline';
import { GoogleGenAI, Modality } from '@google/genai/node';

const PROTOCOL_VERSION = 1;
const credentialFile = process.env.SLATE_GEMINI_BRIDGE_CREDENTIAL_FILE;
const authMode = process.env.SLATE_GEMINI_BRIDGE_AUTH_MODE;
let session;
let openFrame;
let shuttingDown = false;

function send(frame) {
  if (shuttingDown) return;
  try {
    process.stdout.write(`${JSON.stringify(frame)}\n`);
  } catch {
    shutdown(2);
  }
}

function error(code) {
  send({ type: 'error', version: PROTOCOL_VERSION, code });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    session?.close();
  } catch {
    // Provider cleanup is best effort; the process is exiting.
  }
  session = undefined;
  if (code === 0) {
    try {
      process.stdout.write(`${JSON.stringify({ type: 'closed', version: PROTOCOL_VERSION })}\n`);
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
  try {
    if (lstatSync(credentialFile).isSymbolicLink()) throw new Error('symlink');
    const stats = statSync(credentialFile);
    if (!stats.isFile() || stats.size === 0) throw new Error('file');
    accessSync(credentialFile, constants.R_OK);
    const value = readFileSync(credentialFile, 'utf8').trim();
    if (!value) throw new Error('empty');
    return value;
  } catch {
    throw new BridgeRuntimeError('BRIDGE_CREDENTIAL_UNAVAILABLE');
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
      if (!project || !location) throw new BridgeRuntimeError('BRIDGE_RUNTIME_UNAVAILABLE');
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

async function openSession(frame) {
  if (session) throw new BridgeRuntimeError('BRIDGE_ALREADY_OPEN');
  openFrame = frame;
  const client = createClient();
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), frame.connectTimeoutMs);
  try {
    session = await client.live.connect({
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
        onmessage: (message) => send({ type: 'server_message', version: PROTOCOL_VERSION, message }),
        onerror: () => error('BRIDGE_PROVIDER_ERROR'),
        onclose: () => {
          if (!shuttingDown) send({ type: 'closed', version: PROTOCOL_VERSION });
        },
      },
    });
    send({ type: 'ready', version: PROTOCOL_VERSION });
  } catch (cause) {
    session = undefined;
    if (cause?.name === 'AbortError') throw new BridgeRuntimeError('BRIDGE_PROVIDER_CONNECTION_FAILED');
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
      requireSession().sendClientContent({
        turns: [{ role: 'user', parts: [{ text: frame.text }] }],
        turnComplete: true,
      });
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
      if (!hasExactKeys(frame, ['type', 'version']))
        throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      if (!openFrame) throw new BridgeRuntimeError('BRIDGE_NOT_READY');
      session?.close();
      session = undefined;
      await openSession(openFrame);
      return;
    case 'close':
      if (!hasExactKeys(frame, ['type', 'version']))
        throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
      shutdown(0);
      return;
    default:
      throw new BridgeRuntimeError('BRIDGE_PROTOCOL_REJECTED');
  }
}

function requireSession() {
  if (!session || shuttingDown) throw new BridgeRuntimeError('BRIDGE_NOT_READY');
  return session;
}

function isValidOpen(frame) {
  return (
    hasExactKeys(frame, [
      'type',
      'version',
      'model',
      'language',
      'systemInstruction',
      'connectTimeoutMs',
      'enableWebSearch',
      'tools',
    ]) &&
    typeof frame.model === 'string' &&
    frame.model.length > 0 &&
    (frame.language === 'en' || frame.language === 'ja') &&
    typeof frame.systemInstruction === 'string' &&
    Number.isInteger(frame.connectTimeoutMs) &&
    frame.connectTimeoutMs > 0 &&
    typeof frame.enableWebSearch === 'boolean' &&
    Array.isArray(frame.tools)
  );
}

function isValidAudio(frame) {
  return (
    hasExactKeys(frame, ['type', 'version', 'data']) &&
    typeof frame.data === 'string' &&
    frame.data.length > 0 &&
    frame.data.length <= 1_048_576 &&
    frame.data.length % 4 === 0 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(frame.data)
  );
}

function isValidText(frame) {
  return (
    hasExactKeys(frame, ['type', 'version', 'text']) &&
    typeof frame.text === 'string' &&
    frame.text.length > 0 &&
    frame.text.length <= 16_384
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
        isRecord(call.response)
    )
  );
}

function hasExactKeys(value, keys) {
  const expected = new Set(keys);
  return Object.keys(value).length === expected.size && Object.keys(value).every((key) => expected.has(key));
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

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (shuttingDown) break;
  try {
    await handle(JSON.parse(line));
  } catch (cause) {
    error(cause instanceof BridgeRuntimeError ? cause.code : 'BRIDGE_PROTOCOL_REJECTED');
    shutdown(2);
    break;
  }
}

if (!shuttingDown) shutdown(0);
