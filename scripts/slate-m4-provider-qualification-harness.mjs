#!/usr/bin/env node

/**
 * Provider-disabled, fail-closed accounting for one bounded M4 qualification.
 *
 * The live adapter must convert provider/child-process observations to the
 * small structural event vocabulary below before passing them here. This
 * module never accepts or emits transcript, audio, payload, credential, auth
 * header, device, Calendar or Outlook values.
 */

export const INPUT_TRANSCRIPTION_HINT = 'en-US;ja-JP';

export const TERMINAL_CLASSES = Object.freeze([
  'PASS',
  'FAIL_CONFIG',
  'FAIL_CONNECT',
  'FAIL_SESSION_SETUP',
  'FAIL_AUDIO_SEND',
  'FAIL_NO_INPUT_TRANSCRIPTION',
  'FAIL_LANGUAGE_EXPECTATION',
  'FAIL_NO_PROVIDER_OUTPUT',
  'FAIL_PROTOCOL',
  'TIMEOUT',
  'DRIVER_ERROR',
]);

export const ALLOWED_PROVIDER_ERROR_CLASSES = Object.freeze([
  'AUTH',
  'MODEL_NOT_FOUND',
  'UNSUPPORTED_CONFIG',
  'INVALID_ARGUMENT',
  'QUOTA',
  'NETWORK',
  'TLS',
  'PROTOCOL',
  'UNKNOWN_SANITIZED',
]);

const ALLOWED_PROVIDER_ERROR_CLASS_SET = new Set(ALLOWED_PROVIDER_ERROR_CLASSES);

export function sanitizeProviderErrorClass(value) {
  if (typeof value === 'string' && ALLOWED_PROVIDER_ERROR_CLASS_SET.has(value)) {
    return value;
  }
  return 'UNKNOWN_SANITIZED';
}

const TURN_COUNT = 2;
const VALID_LANGUAGES = new Set(['en', 'ja']);
const STRUCTURAL_TYPES = new Set([
  'driver_started',
  'bridge_started',
  'provider_connect_attempt',
  'provider_session_established',
  'audio_sent',
  'audio_end_sent',
  'input_transcription',
  'provider_ready',
  'provider_output',
  'turn_complete',
  'provider_error',
  'child_exit',
  'timeout',
  'config_failure',
  'hint_configured',
]);

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTurn(value) {
  return Number.isInteger(value) && value >= 1 && value <= TURN_COUNT;
}

function isFiniteTimestamp(value) {
  return value === undefined || (Number.isInteger(value) && value >= 0);
}

/**
 * Keep only structural fields. Unknown fields are deliberately discarded.
 * A malformed event is represented without copying any untrusted value.
 */
export function sanitizeStructuralEvent(value) {
  if (!isRecord(value) || typeof value.type !== 'string' || !STRUCTURAL_TYPES.has(value.type)) {
    return { kind: 'malformed' };
  }

  const type = value.type;
  if (type === 'driver_started' || type === 'bridge_started' || type === 'provider_connect_attempt') {
    return { kind: type };
  }
  if (type === 'provider_session_established' || type === 'provider_ready') {
    return { kind: type, timestampMs: isFiniteTimestamp(value.timestampMs) ? value.timestampMs : undefined };
  }
  if (type === 'hint_configured') {
    return { kind: type, value: value.value === INPUT_TRANSCRIPTION_HINT };
  }
  if (type === 'audio_sent' || type === 'audio_end_sent' || type === 'provider_output' || type === 'turn_complete') {
    return isTurn(value.turn)
      ? { kind: type, turn: value.turn, timestampMs: isFiniteTimestamp(value.timestampMs) ? value.timestampMs : undefined }
      : { kind: 'malformed' };
  }
  if (type === 'input_transcription') {
    if (!isTurn(value.turn) || !VALID_LANGUAGES.has(value.expectedLanguage)) return { kind: 'malformed' };
    return {
      kind: type,
      turn: value.turn,
      expectedLanguage: value.expectedLanguage,
      languageExpectationMet: value.languageExpectationMet === true,
      timestampMs: isFiniteTimestamp(value.timestampMs) ? value.timestampMs : undefined,
    };
  }
  if (type === 'provider_error') {
    const rawClass = value.errorClass ?? value.error_class ?? value.code ?? value.error;
    return { kind: type, errorClass: sanitizeProviderErrorClass(rawClass) };
  }
  if (type === 'child_exit') return { kind: type, clean: value.clean === true };
  if (type === 'timeout') return { kind: type };
  if (type === 'config_failure') return { kind: type };
  return { kind: 'malformed' };
}

function emptyTurn() {
  return {
    expectedLanguage: undefined,
    audioSent: false,
    audioEndSent: false,
    inputTranscription: false,
    languageExpectationMet: undefined,
    providerOutput: false,
    turnComplete: false,
    markers: {},
  };
}

function emptyState() {
  return {
    driverStarted: false,
    bridgeStarted: false,
    connectAttempted: false,
    providerSessionEstablished: false,
    providerReady: false,
    hintConfigured: undefined,
    configFailure: false,
    providerError: false,
    providerErrorClass: undefined,
    childExited: false,
    childExitClean: false,
    childExitCount: 0,
    eventAfterChildExit: false,
    timeout: false,
    malformed: false,
    turns: [emptyTurn(), emptyTurn()],
    terminal: undefined,
  };
}

function setMarker(turn, event) {
  if (event.timestampMs !== undefined && turn.markers[event.kind] === undefined) {
    turn.markers[event.kind] = event.timestampMs;
  }
}

function applyEvent(state, event) {
  if (state.childExited && event.kind !== 'child_exit') {
    state.eventAfterChildExit = true;
  }
  switch (event.kind) {
    case 'malformed':
      state.malformed = true;
      break;
    case 'driver_started':
      state.driverStarted = true;
      break;
    case 'bridge_started':
      state.bridgeStarted = true;
      break;
    case 'provider_connect_attempt':
      state.connectAttempted = true;
      break;
    case 'provider_session_established':
      state.providerSessionEstablished = true;
      setMarker(state.turns[0], event);
      break;
    case 'provider_ready':
      state.providerReady = true;
      setMarker(state.turns[0], event);
      break;
    case 'hint_configured':
      if (state.hintConfigured === undefined) state.hintConfigured = event.value;
      break;
    case 'config_failure':
      state.configFailure = true;
      break;
    case 'provider_error':
      state.providerError = true;
      if (state.providerErrorClass === undefined) {
        state.providerErrorClass = event.errorClass ?? 'UNKNOWN_SANITIZED';
      }
      break;
    case 'child_exit':
      state.childExitCount += 1;
      if (state.childExitCount > 1) state.malformed = true;
      state.childExited = true;
      state.childExitClean = event.clean;
      break;
    case 'timeout':
      state.timeout = true;
      break;
    case 'audio_sent':
    case 'audio_end_sent':
    case 'input_transcription':
    case 'provider_output':
    case 'turn_complete': {
      const turn = state.turns[event.turn - 1];
      if (event.kind === 'audio_sent') turn.audioSent = true;
      if (event.kind === 'audio_end_sent') turn.audioEndSent = true;
      if (event.kind === 'input_transcription') {
        if (!turn.inputTranscription) {
          turn.inputTranscription = true;
          turn.expectedLanguage = event.expectedLanguage;
          turn.languageExpectationMet = event.languageExpectationMet;
        }
      }
      if (event.kind === 'provider_output') turn.providerOutput = true;
      if (event.kind === 'turn_complete') turn.turnComplete = true;
      setMarker(turn, event);
      break;
    }
    default:
      state.malformed = true;
  }
}

function chooseTerminal(state) {
  if (!state.driverStarted) return 'DRIVER_ERROR';
  if (state.configFailure) return 'FAIL_CONFIG';
  if (state.timeout) return 'TIMEOUT';
  if (state.malformed) return 'FAIL_PROTOCOL';
  if (state.providerError) return 'FAIL_SESSION_SETUP';
  if (state.childExited && !state.childExitClean) return 'DRIVER_ERROR';
  if (state.eventAfterChildExit) return 'FAIL_PROTOCOL';
  if (!state.bridgeStarted) return 'FAIL_SESSION_SETUP';
  if (!state.connectAttempted || !state.providerSessionEstablished) return 'FAIL_CONNECT';
  if (state.hintConfigured !== true) return 'FAIL_CONFIG';
  if (!state.providerReady) return 'FAIL_SESSION_SETUP';

  for (const [index, turn] of state.turns.entries()) {
    if (!turn.audioSent || !turn.audioEndSent) return 'FAIL_AUDIO_SEND';
    if (!turn.inputTranscription) return 'FAIL_NO_INPUT_TRANSCRIPTION';
    const requiredLanguage = index === 0 ? 'en' : 'ja';
    if (turn.expectedLanguage !== requiredLanguage || turn.languageExpectationMet !== true) {
      return 'FAIL_LANGUAGE_EXPECTATION';
    }
    if (!turn.providerOutput) return 'FAIL_NO_PROVIDER_OUTPUT';
    if (!turn.turnComplete) return 'FAIL_PROTOCOL';
  }

  if (!state.childExited || !state.childExitClean) return 'DRIVER_ERROR';

  return 'PASS';
}

function safeMarkerValue(value) {
  return value === undefined ? 'UNKNOWN' : String(value);
}

export function runQualificationReplay(events) {
  const state = emptyState();
  if (!Array.isArray(events)) {
    state.driverStarted = true;
    state.malformed = true;
  }
  else {
    for (const rawEvent of events) {
      applyEvent(state, sanitizeStructuralEvent(rawEvent));
    }
  }
  state.terminal = chooseTerminal(state);
  const lines = [
    `INPUT_TRANSCRIPTION_HINT=${INPUT_TRANSCRIPTION_HINT}`,
    `INPUT_TRANSCRIPTION_HINT_CONFIGURED=${state.hintConfigured ? 'YES' : 'NO'}`,
    `PROVIDER_SESSION_ESTABLISHED=${state.providerSessionEstablished ? 'YES' : 'NO'}`,
    `EN_TRANSCRIPTION_EVENT_SEEN=${state.turns[0].inputTranscription ? 'YES' : 'NO'}`,
    `JA_TRANSCRIPTION_EVENT_SEEN=${state.turns[1].inputTranscription ? 'YES' : 'NO'}`,
    `EN_LANGUAGE_EXPECTATION_MET=${safeMarkerValue(state.turns[0].languageExpectationMet === true ? 'YES' : state.turns[0].languageExpectationMet === false ? 'NO' : undefined)}`,
    `JA_LANGUAGE_EXPECTATION_MET=${safeMarkerValue(state.turns[1].languageExpectationMet === true ? 'YES' : state.turns[1].languageExpectationMet === false ? 'NO' : undefined)}`,
    `T_AUDIO_INPUT_COMMIT_OR_TURN_END=${safeMarkerValue(state.turns[0].markers.audio_end_sent)}`,
    `T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL=${safeMarkerValue(state.turns[0].markers.input_transcription)}`,
    `T_PROVIDER_READY=${safeMarkerValue(state.turns[0].markers.provider_ready)}`,
    `T_PROVIDER_FIRST_OUTPUT=${safeMarkerValue(state.turns[0].markers.provider_output)}`,
    `ASSISTANT_OUTPUT_EVENT_SEEN=${state.turns.some((turn) => turn.providerOutput) ? 'YES' : 'NO'}`,
    ...(state.providerError ? [`PROVIDER_ERROR_CLASS=${state.providerErrorClass}`] : []),
    `QUALIFICATION_TERMINAL=${state.terminal}`,
  ];
  return {
    terminal: state.terminal,
    lines,
    state: {
      providerSessionEstablished: state.providerSessionEstablished,
      providerReady: state.providerReady,
      childExited: state.childExited,
      childExitClean: state.childExitClean,
      providerError: state.providerError,
      providerErrorClass: state.providerError ? state.providerErrorClass : undefined,
      malformed: state.malformed,
    },
  };
}

export function serializeLiveConnectSetup(options = {}) {
  const model = options.model ?? 'gemini-2.5-flash-native-audio-preview-12-2025';
  const systemInstruction =
    options.systemInstruction ??
    'You are the Slate assistant for a monochrome NOTE4 device. Respond in the user language, English or Japanese. Never access, infer, or discuss private Outlook or Microsoft calendar data. Calendar requests may only produce a proposed Google Calendar event for a separate confirmation flow.';
  const inputAudioTranscription = options.inputAudioTranscription ?? {};
  const outputAudioTranscription = options.outputAudioTranscription ?? {};
  const tools = options.tools ?? [];

  return JSON.stringify({
    model,
    config: {
      responseModalities: ['AUDIO'],
      systemInstruction,
      inputAudioTranscription,
      outputAudioTranscription,
      tools,
    },
  });
}

function bufferedEvents(input) {
  if (!input.trim()) return [];
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [{ type: 'malformed' }];
  } catch {
    return [{ type: 'malformed' }];
  }
}

export function replayDriverFailure(input, failureEvent) {
  const parsed = bufferedEvents(input);
  const events = parsed.some((event) => event?.type === 'driver_started')
    ? parsed
    : [{ type: 'driver_started' }, ...parsed];
  return runQualificationReplay([...events, failureEvent]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let emitted = false;
  const emitOnce = (result) => {
    if (emitted) return;
    emitted = true;
    process.stdout.write(`${result.lines.join('\n')}\n`);
    return result;
  };
  const emitFailureAndStop = (event) => {
    const result = replayDriverFailure(input, event);
    if (emitted) return;
    emitted = true;
    const output = `${result.lines.join('\n')}\n`;
    const exit = () => process.exit(1);
    if (!process.stdout.write(output)) process.stdout.once('drain', exit);
    else setImmediate(exit);
    process.stdin.pause();
  };
  process.on('SIGTERM', () => emitFailureAndStop({ type: 'timeout' }));
  process.on('uncaughtException', () => emitFailureAndStop({ type: 'child_exit', clean: false }));
  process.on('unhandledRejection', () => emitFailureAndStop({ type: 'child_exit', clean: false }));
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    if (emitted) return;
    if (!input.trim()) {
      emitOnce(runQualificationReplay([]));
      process.exitCode = 1;
      return;
    }
    try {
      const result = runQualificationReplay(JSON.parse(input));
      emitOnce(result);
      process.exitCode = result.terminal === 'PASS' ? 0 : 1;
    } catch {
      const result = runQualificationReplay([{ type: 'driver_started' }, { type: 'malformed' }]);
      emitOnce(result);
      process.exitCode = 1;
    }
  });
}
