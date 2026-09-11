import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReviewerArgs,
  buildReviewPrompt,
  parseTerminalVerdict,
  REVIEW_MODEL,
} from './slate-c8-grok-review-harness.mjs';

test('accepts exactly one complete PASS terminal block', () => {
  assert.deepEqual(
    parseTerminalVerdict('notes\nVERDICT=PASS\nP0=0\nP1=0\nP2=0\nSECURITY=0\n'),
    { terminal: true, verdict: 'PASS', p0: 0, p1: 0, p2: 0, security: 0 },
  );
});

test('accepts a complete REVISE terminal block with counts', () => {
  assert.deepEqual(
    parseTerminalVerdict('VERDICT=REVISE\nP0=0\nP1=1\nP2=2\nSECURITY=0'),
    { terminal: true, verdict: 'REVISE', p0: 0, p1: 1, p2: 2, security: 0 },
  );
});

test('fails closed for missing, duplicate, or malformed terminal output', () => {
  for (const output of [
    '',
    'VERDICT=PASS\nP0=0\nP1=0\nP2=0',
    'VERDICT=PASS\nP0=0\nP1=0\nP2=0\nSECURITY=0\nVERDICT=PASS\nP0=0\nP1=0\nP2=0\nSECURITY=0',
    'VERDICT=PASS\nP0=x\nP1=0\nP2=0\nSECURITY=0',
  ]) {
    assert.deepEqual(parseTerminalVerdict(output), {
      terminal: false,
      classification: 'NO_TERMINAL_VERDICT',
    });
  }
});

test('prompt binds the exact artifact and forbids unbounded repository discovery', () => {
  const prompt = buildReviewPrompt('diff-content');
  assert.match(prompt, /SOURCE_COMMIT=553ad71932a8036a6f6dfe34794052eb4e573b10/);
  assert.match(prompt, /ARM64_IMAGE=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4/);
  assert.match(prompt, /Do not use tools, browse the repository, access the network/);
  assert.match(prompt, /After reviewing, emit exactly one terminal block/);
});

test('reviewer arguments are bounded, exact-model, and tool-denied', () => {
  const args = buildReviewerArgs('/tmp/repo', 'prompt');
  assert.equal(args[args.indexOf('-m') + 1], REVIEW_MODEL);
  assert.equal(args[args.indexOf('--max-turns') + 1], '2');
  assert.equal(
    args[args.indexOf('--disallowed-tools') + 1],
    'Read,Glob,Grep,Bash,Task,WebSearch,WebFetch',
  );
  assert.equal(args.includes('--single'), true);
});
