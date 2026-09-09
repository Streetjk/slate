import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  INPUT_TRANSCRIPTION_HINT,
  replayDriverFailure,
  runQualificationReplay,
  sanitizeStructuralEvent,
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
