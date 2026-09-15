# Campaign 8E temporary routing override — Luna worker / Grok 4.6 reviewer

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This is the newest explicit user policy and supersedes older Campaign 8/8D/8E worker/reviewer routing instructions where they conflict.

## Effective window

This override is effective immediately. The existing Gemini 3.7 Flash review/shadow blackout remains in force until:

- **2026-09-06 02:00 AWST (UTC+08:00)**

After that time, do not automatically revert worker/reviewer routing if a newer user instruction still applies. Re-read the newest policy before dispatching any model call.

## Controller

Codex remains:

- primary controller;
- sole production writer/integrator;
- deterministic validator;
- final adjudicator.

No recursive delegation.

## Worker — Luna

For bounded worker tasks, use **Luna**.

Required behavior:

- use the project's existing authorized Luna transport/configuration already available to Codex;
- do not create, expose, copy, or commit new credentials merely to switch workers;
- do not route Luna through OpenRouter unless a newer explicit user instruction authorizes that exact transport;
- if Luna is unavailable, unauthenticated, rate-limited, or otherwise unusable, continue with Codex alone where safe or record `LUNA_WORKER=UNAVAILABLE`; do not silently substitute Sonnet, Gemini, Grok, GLM, or another worker model;
- Luna is a bounded worker only and must not become controller or production integrator;
- Codex must validate all Luna output with deterministic tests and repository evidence before integration.

Report only non-secret routing state, for example:

```text
WORKER=LUNA
WORKER_AUTH=EXISTING_AUTHORIZED_PROJECT_CONFIGURATION
```

Never record credential values.

## Independent reviewer — Grok 4.6

For independent review gates during this override, use **Grok 4.6** through the existing authenticated Grok CLI/session.

Required behavior:

- reviewer model: Grok 4.6;
- transport: existing authenticated Grok CLI/session only;
- reviewer is read-only and must not edit production files;
- Codex supplies the exact artifact/diff/report being reviewed;
- reviewer must report findings with severity and evidence;
- Codex adjudicates findings and performs any corrections;
- maximum review/fix loop remains bounded by the campaign policy;
- do not use OpenRouter as a Grok fallback;
- do not create or expose a static Grok/xAI API key as part of this change;
- if Grok 4.6 CLI review is unavailable, stop the independent-review gate or continue only non-review work; do not silently substitute Gemini 3.7 Flash or another reviewer.

Record only:

```text
INDEPENDENT_REVIEWER=GROK_4_6
REVIEW_TRANSPORT=GROK_CLI_EXISTING_AUTH_SESSION
```

Never record credential values.

## Gemini 3.7 Flash blackout remains binding

Until **2026-09-06 02:00 AWST**, do not call any Gemini 3.7 Flash family model for:

- independent review;
- AGY review;
- shadow review;
- shadow tests;
- comparative shadow runs;
- reviewer retries.

This includes `gemini-3.7-flash`, `gemini-3.7-flash-high`, `gemini-3.7-flash-medium`, and aliases routing to that family.

Required reporting during the blackout:

```text
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
GEMINI37_BLACKOUT_EXPIRES=2026-09-06T02:00:00+08:00
```

### Shadow-test policy

The user has authorized Grok 4.6 as the **reviewer**, not as a replacement shadow-test model. Therefore keep Gemini 3.7 Flash shadow tests paused during the blackout unless a newer explicit instruction authorizes Grok 4.6 or another model for shadow testing.

## Campaign continuation

Continue safe Campaign 8E0/8E work autonomously under this routing policy, including:

- Orange Pi storage audit and bounded cleanup;
- deterministic tests/builds/lint/typecheck/hashes/secret scans;
- Vertex/ADC preparation up to human authorization boundaries;
- backend/firmware preparation that does not cross a destructive or human-auth boundary;
- Luna worker tasks where useful;
- Grok 4.6 independent review when the campaign reaches a review gate.

Do not interpret this routing change as authorization to:

- flash NOTE4 firmware;
- enable billing;
- create Google/Gemini API keys;
- change `GEMINI_LIVE_MODEL`;
- merge PR #2;
- change production credentials;
- touch Campaign 6D, PR #1, or PR #3.

Those existing human/authorization boundaries remain unchanged.
