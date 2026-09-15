#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const REVIEW_SOURCE =
  process.env.SLATE_REVIEW_SOURCE ?? '553ad71932a8036a6f6dfe34794052eb4e573b10';
export const REVIEW_BASE =
  process.env.SLATE_REVIEW_BASE ?? 'd26efe2441407faf71c4c508f66e9f5c39f98fae';
export const REVIEW_IMAGE =
  process.env.SLATE_REVIEW_IMAGE ??
  'sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4';
export const REVIEW_MODEL = 'grok-4.6';
export const MAX_OUTPUT_BYTES = 64 * 1024;
export const REVIEW_TIMEOUT_MS = 300_000;
export const DISALLOWED_REVIEW_TOOLS =
  'Agent,web_search,web_fetch,run_terminal_cmd,run_terminal_command';

const FOCUSED_PATHS = [
  'backend/src/modules/dynamic-content/definitions/google-news.json',
  'backend/src/modules/dynamic-content/dynamic-content-registry.ts',
  'backend/src/modules/dynamic-content/dynamic-content.module.ts',
  'backend/src/modules/dynamic-content/dynamic-data-reuse-policy.ts',
  'backend/src/modules/dynamic-content/dynamic-refresh-policy.ts',
  'backend/src/modules/dynamic-content/providers/google-news.provider.ts',
  'backend/src/modules/dynamic-content/providers/weather.provider.ts',
  'backend/src/modules/dynamic-content/rendering/dynamic-frame-renderer.service.ts',
  'backend/src/modules/dynamic-content/rendering/google-news-frame-renderer.ts',
  'backend/src/modules/dynamic-content/status-text/dynamic-content-status-text.ts',
  'backend/src/modules/dynamic-content/weather-city.controller.ts',
  'frontend/src/features/dynamic/components/DynamicContentFields.tsx',
  'frontend/src/features/dynamic/components/config/CitySearch.tsx',
  'frontend/src/features/dynamic/components/config/GoogleNewsConfig.tsx',
  'frontend/src/features/dynamic/components/config/WeatherConfig.tsx',
  'frontend/src/features/dynamic/hooks/useWeatherCitySearch.ts',
  'frontend/src/features/dynamic/model/config-types.ts',
  'frontend/src/features/dynamic/model/default-config.ts',
  'frontend/src/features/dynamic/model/display-name.ts',
  'frontend/src/features/dynamic/model/type-meta.ts',
  'frontend/src/features/dynamic/query/outlook-queries.ts',
  'shared/src/dynamic/config.ts',
];

const TERMINAL_LINE = /^(VERDICT)=(PASS|REVISE)$/gm;
const COUNT_LINE = /^(P0|P1|P2|SECURITY)=([0-9]+)$/gm;

export function parseTerminalVerdict(output) {
  const verdicts = [...output.matchAll(TERMINAL_LINE)];
  const counts = [...output.matchAll(COUNT_LINE)];
  if (verdicts.length !== 1 || counts.length !== 4) {
    return { terminal: false, classification: 'NO_TERMINAL_VERDICT' };
  }

  const countMap = new Map(counts.map((match) => [match[1], Number(match[2])]));
  if (
    countMap.size !== 4 ||
    !['P0', 'P1', 'P2', 'SECURITY'].every((key) => countMap.has(key))
  ) {
    return { terminal: false, classification: 'NO_TERMINAL_VERDICT' };
  }

  return {
    terminal: true,
    verdict: verdicts[0][2],
    p0: countMap.get('P0'),
    p1: countMap.get('P1'),
    p2: countMap.get('P2'),
    security: countMap.get('SECURITY'),
  };
}

function runGitDiff(repoRoot) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      'git',
      ['diff', '--no-ext-diff', '--unified=2', REVIEW_BASE, REVIEW_SOURCE, '--', ...FOCUSED_PATHS],
      { cwd: repoRoot, shell: false, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    const chunks = [];
    let bytes = 0;
    child.stdout.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes <= MAX_OUTPUT_BYTES) chunks.push(chunk);
      else child.kill('SIGTERM');
    });
    child.stderr.resume();
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0 || bytes > MAX_OUTPUT_BYTES) {
        reject(new Error('FOCUSED_DIFF_UNAVAILABLE'));
        return;
      }
      resolvePromise(Buffer.concat(chunks).toString('utf8'));
    });
  });
}

export function buildReviewPrompt(diff) {
  return [
    'You are the read-only canonical independent reviewer for one exact Slate candidate.',
    'Do not use tools, browse the repository, access the network, or inspect any other files.',
    'Review only the bounded evidence and focused diff below. Do not edit or implement anything.',
    '',
    `SOURCE_COMMIT=${REVIEW_SOURCE}`,
    `BASE_COMMIT=${REVIEW_BASE}`,
    `ARM64_IMAGE=${REVIEW_IMAGE}`,
    `MODEL=${REVIEW_MODEL}`,
    'ARTIFACT_SCOPE=C7+C8 combined backend/shared/frontend only; firmware unchanged.',
    'QUALIFICATION_EVIDENCE=focused C7 weather compatibility, google_news registration/dispatch, C8 transcript coalescing and mixed EN/JA provider-disabled tests previously passed; product runtime bytes are unchanged in this review.',
    'PRIOR_REVIEW_FINDING=P2: Open-Meteo fallback selection could persist provider=open_meteo without latitude/longitude; the corrected delta must prove that this path now fails closed or selects a coordinate-bearing alternative.',
    'REVIEW_RUBRIC=check correctness, security/privacy, data integrity, regression risk, bounded queues/refresh behavior, and exact artifact/source consistency.',
    'SEVERITY_CONTRACT=P0 critical; P1 high; P2 medium; P3 low/informational; SECURITY any secret/privacy/auth boundary. Count only actionable findings in P0/P1/P2/SECURITY.',
    '',
    'After reviewing, emit exactly one terminal block with these five lines and no markdown:',
    'VERDICT=PASS or VERDICT=REVISE',
    'P0=<non-negative integer>',
    'P1=<non-negative integer>',
    'P2=<non-negative integer>',
    'SECURITY=<non-negative integer>',
    'If REVISE, put any concise finding explanation before the block; never emit a second block.',
    '',
    'FOCUSED_DIFF_BEGIN',
    diff,
    'FOCUSED_DIFF_END',
  ].join('\n');
}

export function buildReviewerArgs(repoRoot, prompt) {
  return [
    '--cwd',
    repoRoot,
    '--no-plan',
    '--no-subagents',
    '--tools',
    '',
    '--disable-web-search',
    '--disallowed-tools',
    DISALLOWED_REVIEW_TOOLS,
    '--no-alt-screen',
    '--max-turns',
    '2',
    '-m',
    REVIEW_MODEL,
    '--single',
    prompt,
  ];
}

function runReviewer(repoRoot, prompt) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('grok', buildReviewerArgs(repoRoot, prompt), {
      cwd: repoRoot,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const chunks = [];
    let bytes = 0;
    let oversized = false;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, REVIEW_TIMEOUT_MS);

    const collect = (chunk) => {
      bytes += chunk.length;
      if (bytes <= MAX_OUTPUT_BYTES) chunks.push(chunk);
      else {
        oversized = true;
        child.kill('SIGTERM');
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolvePromise({
        code,
        signal,
        oversized,
        timedOut,
        output: Buffer.concat(chunks).toString('utf8'),
      });
    });
  });
}

export async function executeReview({ repoRoot = process.cwd() } = {}) {
  if (!/^[0-9a-f]{40}$/.test(REVIEW_SOURCE)) throw new Error('INVALID_REVIEW_SOURCE');
  if (!/^sha256:[0-9a-f]{64}$/.test(REVIEW_IMAGE)) throw new Error('INVALID_REVIEW_IMAGE');
  const diff = await runGitDiff(repoRoot);
  const prompt = buildReviewPrompt(diff);
  const result = await runReviewer(repoRoot, prompt);
  if (result.timedOut) return { classification: 'TIMEOUT', cleanExit: false };
  if (result.oversized) return { classification: 'OUTPUT_LIMIT', cleanExit: false };
  const parsed = parseTerminalVerdict(result.output);
  return {
    ...parsed,
    cleanExit: result.code === 0 && result.signal === null,
    controllerExitCode: result.code,
  };
}

async function main() {
  try {
    const result = await executeReview();
    if (!result.terminal) {
      console.log(`REVIEW_HARNESS_TERMINAL=${result.classification}`);
      process.exitCode = 2;
      return;
    }
    console.log(`VERDICT=${result.verdict}`);
    console.log(`P0=${result.p0}`);
    console.log(`P1=${result.p1}`);
    console.log(`P2=${result.p2}`);
    console.log(`SECURITY=${result.security}`);
    console.log(`REVIEWER_CLEAN_EXIT=${result.cleanExit ? 'YES' : 'NO'}`);
  } catch (error) {
    const classification = error?.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'DRIVER_ERROR';
    console.log(`REVIEW_HARNESS_TERMINAL=${classification}`);
    process.exitCode = 2;
  }
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === resolve(thisFile)) {
  await main();
}
