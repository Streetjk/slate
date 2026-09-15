import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_PROVIDER_ERROR_CLASSES,
  INPUT_TRANSCRIPTION_HINT,
  replayDriverFailure,
  runQualificationReplay,
  sanitizeProviderErrorClass,
  sanitizeStructuralEvent,
  serializeLiveConnectSetup,
} from './slate-m4-provider-qualification-harness.mjs';

const HARNESS_PATH = fileURLToPath(new URL('./slate-m4-provider-qualification-harness.mjs', import.meta.url));

function successEvents() {
  return [
    { type: 'driver_started' },
    { type: 'bridge_started' },
    { type: 'provider_connect_attempt' },
    { type: 'provider_session_established', timestampMs: 100 },
    { type: 'hint_configured', value: INPUT_TRANSCRIPTION_HINT },
    { type: 'provider_ready', timestampMs: 200 },
    { type: 'audio_sent', turn: 1, timestampMs: 300 },
    { type: 'audio_end_sent', turn: 1, timestampMs: 400 },
    { type: 'input_transcription', turn: 1, expectedLanguage: 'en', languageExpectationMet: true, timestampMs: 500 },
    { type: 'provider_output', turn: 1, timestampMs: 600 },
    { type: 'turn_complete', turn: 1, timestampMs: 700 },
    { type: 'audio_sent', turn: 2, timestampMs: 800 },
    { type: 'audio_end_sent', turn: 2, timestampMs: 900 },
    { type: 'input_transcription', turn: 2, expectedLanguage: 'ja', languageExpectationMet: true, timestampMs: 1000 },
    { type: 'provider_output', turn: 2, timestampMs: 1100 },
    { type: 'turn_complete', turn: 2, timestampMs: 1200 },
    { type: 'child_exit', clean: true },
  ];
}

function assertExactlyOneTerminal(result, expected) {
  assert.equal(result.terminal, expected);
  assert.equal(result.lines.filter((line) => line.startsWith('QUALIFICATION_TERMINAL=')).length, 1);
  assert.equal(result.lines.at(-1), `QUALIFICATION_TERMINAL=${expected}`);
}

test('success emits exactly one PASS terminal and sanitized timing markers', () => {
  const result = runQualificationReplay(successEvents());
  assertExactlyOneTerminal(result, 'PASS');
  assert.ok(result.lines.includes('INPUT_TRANSCRIPTION_HINT=en-US;ja-JP'));
  assert.ok(result.lines.includes('INPUT_TRANSCRIPTION_HINT_CONFIGURED=YES'));
  assert.ok(result.lines.includes('T_PROVIDER_FIRST_OUTPUT=600'));
  assert.equal(JSON.stringify(result).includes('transcript'), false);
});

test('connect/session failure is terminal and fail closed', () => {
  const result = runQualificationReplay([{ type: 'driver_started' }, { type: 'bridge_started' }, { type: 'provider_connect_attempt' }]);
  assertExactlyOneTerminal(result, 'FAIL_CONNECT');
});

test('missing input transcription is distinct from missing output', () => {
  const events = successEvents().filter((event) => event.type !== 'input_transcription' || event.turn !== 1);
  assertExactlyOneTerminal(runQualificationReplay(events), 'FAIL_NO_INPUT_TRANSCRIPTION');
  const noOutput = successEvents().filter((event) => event.type !== 'provider_output' || event.turn !== 1);
  assertExactlyOneTerminal(runQualificationReplay(noOutput), 'FAIL_NO_PROVIDER_OUTPUT');
});

test('provider error, child exit, timeout and malformed event are terminal', () => {
  assertExactlyOneTerminal(runQualificationReplay([{ type: 'driver_started' }, { type: 'provider_error' }]), 'FAIL_SESSION_SETUP');
  assertExactlyOneTerminal(runQualificationReplay([{ type: 'driver_started' }, { type: 'bridge_started' }, { type: 'child_exit', clean: false }]), 'DRIVER_ERROR');
  assertExactlyOneTerminal(runQualificationReplay([{ type: 'driver_started' }, { type: 'timeout' }]), 'TIMEOUT');
  assertExactlyOneTerminal(runQualificationReplay([{ type: 'driver_started' }, { type: 'not-a-structural-event', text: 'must not escape' }]), 'FAIL_PROTOCOL');
});

test('audio/end-turn and language expectation failures are independently classified', () => {
  const noAudio = successEvents().filter((event) => event.type !== 'audio_sent' || event.turn !== 2);
  assertExactlyOneTerminal(runQualificationReplay(noAudio), 'FAIL_AUDIO_SEND');
  const wrongLanguage = successEvents().map((event) => event.type === 'input_transcription' && event.turn === 2 ? { ...event, languageExpectationMet: false } : event);
  assertExactlyOneTerminal(runQualificationReplay(wrongLanguage), 'FAIL_LANGUAGE_EXPECTATION');
  const swappedLanguages = successEvents().map((event) => event.type === 'input_transcription'
    ? { ...event, expectedLanguage: event.turn === 1 ? 'ja' : 'en' }
    : event);
  assertExactlyOneTerminal(runQualificationReplay(swappedLanguages), 'FAIL_LANGUAGE_EXPECTATION');
});

test('wrong or missing hint is visible and fail closed', () => {
  const wrongHint = successEvents().map((event) => event.type === 'hint_configured' ? { ...event, value: 'ja-JP' } : event);
  const result = runQualificationReplay(wrongHint);
  assertExactlyOneTerminal(result, 'FAIL_CONFIG');
  assert.ok(result.lines.includes('INPUT_TRANSCRIPTION_HINT_CONFIGURED=NO'));
  const correctedLater = runQualificationReplay([
    ...wrongHint.filter((event) => event.type !== 'child_exit'),
    { type: 'hint_configured', value: INPUT_TRANSCRIPTION_HINT },
    { type: 'child_exit', clean: true },
  ]);
  assertExactlyOneTerminal(correctedLater, 'FAIL_CONFIG');
});

test('timing markers are first-write-wins and buffered failure preserves evidence', () => {
  const duplicate = [...successEvents(), { type: 'provider_output', turn: 1, timestampMs: 9999 }];
  assert.ok(runQualificationReplay(duplicate).lines.includes('T_PROVIDER_FIRST_OUTPUT=600'));
  const contradictoryInput = successEvents().map((event) => event.type === 'input_transcription' && event.turn === 1
    ? { ...event, languageExpectationMet: false }
    : event);
  contradictoryInput.splice(10, 0, { type: 'input_transcription', turn: 1, expectedLanguage: 'en', languageExpectationMet: true, timestampMs: 550 });
  assertExactlyOneTerminal(runQualificationReplay(contradictoryInput), 'FAIL_LANGUAGE_EXPECTATION');
  const bufferedFailure = runQualificationReplay([
    { type: 'driver_started' },
    { type: 'bridge_started' },
    { type: 'provider_connect_attempt' },
    { type: 'provider_session_established' },
    { type: 'provider_ready' },
    { type: 'audio_sent', turn: 1 },
    { type: 'audio_end_sent', turn: 1 },
    { type: 'child_exit', clean: false },
  ]);
  assertExactlyOneTerminal(bufferedFailure, 'DRIVER_ERROR');
  assert.equal(bufferedFailure.state.providerSessionEstablished, true);
});

test('non-array replay input is a protocol failure', () => {
  assertExactlyOneTerminal(runQualificationReplay({}), 'FAIL_PROTOCOL');
});

test('buffered timeout and crash-equivalent failures preserve prior structural evidence', () => {
  const prefix = JSON.stringify([
    { type: 'driver_started' },
    { type: 'bridge_started' },
    { type: 'provider_connect_attempt' },
    { type: 'provider_session_established' },
  ]);
  const timeout = replayDriverFailure(prefix, { type: 'timeout' });
  assertExactlyOneTerminal(timeout, 'TIMEOUT');
  assert.equal(timeout.state.providerSessionEstablished, true);
  const crash = replayDriverFailure(prefix, { type: 'child_exit', clean: false });
  assertExactlyOneTerminal(crash, 'DRIVER_ERROR');
  assert.equal(crash.state.providerSessionEstablished, true);
  assertExactlyOneTerminal(replayDriverFailure('[', { type: 'timeout' }), 'TIMEOUT');
});

test('a live child without a clean exit cannot PASS', () => {
  const result = runQualificationReplay(successEvents().filter((event) => event.type !== 'child_exit'));
  assertExactlyOneTerminal(result, 'DRIVER_ERROR');
});

test('duplicate child exits are a protocol failure', () => {
  const result = runQualificationReplay([
    ...successEvents(),
    { type: 'child_exit', clean: true },
  ]);
  assertExactlyOneTerminal(result, 'FAIL_PROTOCOL');
});

test('CLI emits one PASS terminal and nonzero failure terminals', async () => {
  const success = JSON.stringify(successEvents());
  const child = spawn(process.execPath, [HARNESS_PATH], { stdio: ['pipe', 'pipe', 'ignore'] });
  let output = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stdin.end(success);
  const [code] = await once(child, 'close');
  assert.equal(code, 0);
  assert.equal(output.trim().split('\n').at(-1), 'QUALIFICATION_TERMINAL=PASS');
  assert.equal(output.match(/^QUALIFICATION_TERMINAL=/gm)?.length, 1);

  const malformed = spawn(process.execPath, [HARNESS_PATH], { stdio: ['pipe', 'pipe', 'ignore'] });
  let malformedOutput = '';
  malformed.stdout.setEncoding('utf8');
  malformed.stdout.on('data', (chunk) => { malformedOutput += chunk; });
  malformed.stdin.end('{"not":"an array"}');
  const [malformedCode] = await once(malformed, 'close');
  assert.equal(malformedCode, 1);
  assert.equal(malformedOutput.trim().split('\n').at(-1), 'QUALIFICATION_TERMINAL=FAIL_PROTOCOL');
});

test('CLI SIGTERM emits one timeout terminal and exits', async () => {
  const child = spawn(process.execPath, [HARNESS_PATH], { stdio: ['pipe', 'pipe', 'ignore'] });
  let output = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { output += chunk; });
  await once(child, 'spawn');
  await new Promise((resolve) => setTimeout(resolve, 50));
  child.stdin.write('[{"type":"driver_started"}');
  await new Promise((resolve) => setTimeout(resolve, 10));
  child.kill('SIGTERM');
  const [code] = await once(child, 'close');
  assert.equal(code, 1);
  assert.equal(output.trim().split('\n').at(-1), 'QUALIFICATION_TERMINAL=TIMEOUT');
  assert.equal(output.match(/^QUALIFICATION_TERMINAL=/gm)?.length, 1);
});

test('config and driver failures cannot silently terminate', () => {
  assertExactlyOneTerminal(runQualificationReplay([{ type: 'driver_started' }, { type: 'config_failure' }]), 'FAIL_CONFIG');
  assertExactlyOneTerminal(runQualificationReplay([]), 'DRIVER_ERROR');
});

test('sanitizer drops raw transcript/audio/credential fields', () => {
  const sanitized = sanitizeStructuralEvent({
    type: 'input_transcription',
    turn: 1,
    expectedLanguage: 'en',
    languageExpectationMet: true,
    text: 'private transcript must not escape',
    audio: 'private audio must not escape',
    credential: 'credential must not escape',
  });
  assert.deepEqual(sanitized, { kind: 'input_transcription', turn: 1, expectedLanguage: 'en', languageExpectationMet: true, timestampMs: undefined });
  assert.equal(JSON.stringify(sanitized).includes('private'), false);
  assert.equal(JSON.stringify(sanitized).includes('credential'), false);
});

test('provider error allowlist retains only authorized structural classes and maps unknown safely', () => {
  const expectedClasses = [
    'AUTH',
    'MODEL_NOT_FOUND',
    'UNSUPPORTED_CONFIG',
    'INVALID_ARGUMENT',
    'QUOTA',
    'NETWORK',
    'TLS',
    'PROTOCOL',
    'UNKNOWN_SANITIZED',
  ];
  assert.deepEqual(Array.from(ALLOWED_PROVIDER_ERROR_CLASSES), expectedClasses);

  for (const cls of expectedClasses) {
    assert.equal(sanitizeProviderErrorClass(cls), cls);
    const result = runQualificationReplay([
      { type: 'driver_started' },
      { type: 'provider_error', errorClass: cls },
    ]);
    assertExactlyOneTerminal(result, 'FAIL_SESSION_SETUP');
    assert.ok(result.lines.includes(`PROVIDER_ERROR_CLASS=${cls}`));
    assert.equal(result.state.providerErrorClass, cls);
  }

  // Safe structural bridge codes that cannot prove a finer class map to UNKNOWN_SANITIZED
  const safeBridgeCodes = [
    'BRIDGE_PROVIDER_CONNECTION_FAILED',
    'BRIDGE_PROVIDER_ERROR',
    'BRIDGE_PROTOCOL_REJECTED',
    'BRIDGE_CREDENTIAL_UNAVAILABLE',
    'BRIDGE_RUNTIME_UNAVAILABLE',
    'BRIDGE_NOT_READY',
  ];
  for (const code of safeBridgeCodes) {
    assert.equal(sanitizeProviderErrorClass(code), 'UNKNOWN_SANITIZED');
    const result = runQualificationReplay([
      { type: 'driver_started' },
      { type: 'provider_error', code },
    ]);
    assert.ok(result.lines.includes('PROVIDER_ERROR_CLASS=UNKNOWN_SANITIZED'));
    assert.equal(result.state.providerErrorClass, 'UNKNOWN_SANITIZED');
  }

  // Unspecified provider error maps to UNKNOWN_SANITIZED
  const unspecified = runQualificationReplay([
    { type: 'driver_started' },
    { type: 'provider_error' },
  ]);
  assert.ok(unspecified.lines.includes('PROVIDER_ERROR_CLASS=UNKNOWN_SANITIZED'));
  assert.equal(unspecified.state.providerErrorClass, 'UNKNOWN_SANITIZED');

  // Arbitrary non-allowlisted values map to UNKNOWN_SANITIZED
  assert.equal(sanitizeProviderErrorClass('ARBITRARY_CLASS'), 'UNKNOWN_SANITIZED');
  assert.equal(sanitizeProviderErrorClass(undefined), 'UNKNOWN_SANITIZED');
  assert.equal(sanitizeProviderErrorClass(null), 'UNKNOWN_SANITIZED');
  assert.equal(sanitizeProviderErrorClass(12345), 'UNKNOWN_SANITIZED');
  assert.equal(sanitizeProviderErrorClass({}), 'UNKNOWN_SANITIZED');
});

test('provider error sanitizer completely redacts raw error strings, payloads, credentials, and private data', () => {
  const sensitiveEvent = {
    type: 'provider_error',
    errorClass: 'AUTH',
    rawError: 'GoogleGenerativeAIError: [403 Forbidden] API_KEY_INVALID AIzaSyD987654321',
    credential: 'AIzaSySecretCredential12345',
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token',
    identifier: 'project-canary-secret-id',
    transcript: 'confidential user voice transcript',
    audio: 'pcm16-audio-payload-base64-secret-stream',
    payload: { details: 'internal server error payload' },
  };

  const sanitized = sanitizeStructuralEvent(sensitiveEvent);
  assert.deepEqual(sanitized, { kind: 'provider_error', errorClass: 'AUTH' });
  const sanitizedJson = JSON.stringify(sanitized);
  assert.equal(sanitizedJson.includes('AIzaSy'), false);
  assert.equal(sanitizedJson.includes('Forbidden'), false);
  assert.equal(sanitizedJson.includes('Bearer'), false);
  assert.equal(sanitizedJson.includes('canary'), false);
  assert.equal(sanitizedJson.includes('confidential'), false);
  assert.equal(sanitizedJson.includes('pcm16'), false);
  assert.equal(sanitizedJson.includes('payload'), false);

  const result = runQualificationReplay([
    { type: 'driver_started' },
    sensitiveEvent,
  ]);
  const resultJson = JSON.stringify(result);
  assert.equal(resultJson.includes('AIzaSy'), false);
  assert.equal(resultJson.includes('Forbidden'), false);
  assert.equal(resultJson.includes('Bearer'), false);
  assert.equal(resultJson.includes('canary'), false);
  assert.equal(resultJson.includes('confidential'), false);
  assert.equal(resultJson.includes('pcm16'), false);
  assert.equal(resultJson.includes('payload'), false);
  assert.ok(result.lines.includes('PROVIDER_ERROR_CLASS=AUTH'));
  assertExactlyOneTerminal(result, 'FAIL_SESSION_SETUP');

  // If a raw error string is supplied as errorClass, it is redacted to UNKNOWN_SANITIZED
  const rawClassEvent = {
    type: 'provider_error',
    errorClass: 'Error: 400 Bad Request: languageCodes not supported for gemini-2.5-flash-native-audio-preview-12-2025',
  };
  const rawResult = runQualificationReplay([
    { type: 'driver_started' },
    rawClassEvent,
  ]);
  assert.ok(rawResult.lines.includes('PROVIDER_ERROR_CLASS=UNKNOWN_SANITIZED'));
  assert.equal(rawResult.lines.some((l) => l.includes('400') || l.includes('languageCodes')), false);
  assert.equal(JSON.stringify(rawResult).includes('languageCodes'), false);
});

test('setup serialization covers {}, bilingual hints, and empty hints provider-disabled', () => {
  // Case 1: restored working production config (inputAudioTranscription: {})
  const json1 = serializeLiveConnectSetup({ inputAudioTranscription: {} });
  const case1 = JSON.parse(json1);
  assert.deepEqual(case1.config.inputAudioTranscription, {});
  assert.equal('languageCodes' in case1.config.inputAudioTranscription, false);
  assert.equal(case1.config.inputAudioTranscription.languageCodes, undefined);
  assert.equal(case1.model, 'gemini-2.5-flash-native-audio-preview-12-2025');
  assert.deepEqual(case1.config.responseModalities, ['AUDIO']);
  assert.deepEqual(case1.config.outputAudioTranscription, {});

  // Case 2: deployed b0606b6 candidate config (inputAudioTranscription: { languageCodes: ['en-US', 'ja-JP'] })
  const json2 = serializeLiveConnectSetup({
    inputAudioTranscription: { languageCodes: ['en-US', 'ja-JP'] },
  });
  const case2 = JSON.parse(json2);
  assert.deepEqual(case2.config.inputAudioTranscription, {
    languageCodes: ['en-US', 'ja-JP'],
  });
  assert.deepEqual(case2.config.inputAudioTranscription.languageCodes, ['en-US', 'ja-JP']);

  // Case 3: empty languageCodes array config (inputAudioTranscription: { languageCodes: [] })
  const json3 = serializeLiveConnectSetup({
    inputAudioTranscription: { languageCodes: [] },
  });
  const case3 = JSON.parse(json3);
  assert.deepEqual(case3.config.inputAudioTranscription, {
    languageCodes: [],
  });
  assert.deepEqual(case3.config.inputAudioTranscription.languageCodes, []);

  // Exact serialization differential: all three cases produce distinct strings
  assert.notEqual(json1, json2);
  assert.notEqual(json1, json3);
  assert.notEqual(json2, json3);

  // Schema integrity: verify no accidental undefined/null/schema drift
  assert.ok(case1.config.systemInstruction.length > 0);
  assert.ok(Array.isArray(case1.config.tools));
  assert.equal(json1.includes('undefined'), false);
  assert.equal(json1.includes('null'), false);
  assert.equal(json2.includes('undefined'), false);
  assert.equal(json2.includes('null'), false);
  assert.equal(json3.includes('undefined'), false);
  assert.equal(json3.includes('null'), false);
});
