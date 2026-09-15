# Campaign 8E temporary model-routing override — Sonnet 5 worker / Gemini 3.7 Flash blackout

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This is a newer explicit user policy and takes precedence over older Campaign 8/8D/8E reviewer or shadow-test instructions where they conflict.

## Effective window

- Effective from: **2026-09-02 10:00 AWST (UTC+08:00)**
- Duration: **88 hours**
- Automatic expiry: **2026-09-06 02:00 AWST (UTC+08:00)**

After the expiry time, the prior reviewer/shadow policy may resume unless a newer user instruction supersedes it.

## Worker policy — required

Codex remains controller, production writer/integrator, validator, and final adjudicator.

For bounded model-worker tasks use:

```text
CLAUDE_WORKER=SONNET_5
CLAUDE_TRANSPORT=CLAUDE_CLI
CLAUDE_AUTH=EXISTING_AUTHENTICATED_CLI_SESSION
```

Binding rules:

- use **Claude Sonnet 5 via the installed authenticated Claude CLI only**;
- do not use OpenRouter for Sonnet/Claude work;
- do not use an Anthropic API key fallback;
- do not proxy or aggregate Claude traffic through another provider;
- if Claude CLI/Sonnet 5 is unavailable or rate-limited, continue with Codex alone where safe or record the worker unavailable; do not silently substitute another worker model;
- Claude remains a bounded worker and must not become controller or production integrator;
- Codex must validate worker output with deterministic tests and repository evidence before integration.

## Temporary Gemini 3.7 Flash blackout

Until the absolute expiry above, **do not call Gemini 3.7 Flash for any reviewer, AGY review, shadow review, shadow test, comparative shadow run, or reviewer retry**.

This includes, without limitation:

- `gemini-3.7-flash`
- `gemini-3.7-flash-high`
- `gemini-3.7-flash-medium`
- any alias/configuration that routes the review or shadow workload to the Gemini 3.7 Flash family.

Do not spend quota on retrying failed/timed-out Gemini 3.7 Flash reviewer or shadow calls during the blackout.

Do not silently substitute another independent reviewer model unless the user separately authorizes it.

### What may continue during the blackout

Codex should continue all safe non-review campaign work autonomously, including:

- repository/state inspection;
- Orange Pi storage audit and bounded cleanup;
- deterministic tests, lint, typecheck, builds, hashes, secret scans, protocol checks, and health checks;
- Sonnet 5 bounded worker tasks through Claude CLI;
- Google Cloud/Vertex setup preparation up to existing human authorization boundaries;
- backend/firmware preparation that does not cross a blocked destructive or human-auth boundary.

### Review-gated actions during the blackout

If a stage requires an independent review before a destructive, production, merge, deployment, firmware-flash, credential, or security-sensitive action, do **not** waive the review requirement and do **not** use Gemini 3.7 Flash.

Instead stop that specific gate with:

```text
INDEPENDENT_REVIEW=DEFERRED_TEMPORARY_GEMINI37_BLACKOUT
GEMINI37_REVIEW_CALLS=0_DURING_BLACKOUT
SHADOW_TESTS=PAUSED_DURING_BLACKOUT
```

Continue other independent non-blocked work where possible. After the expiry time, Codex may resume the previously authorized reviewer/shadow policy and complete the deferred gate unless a newer instruction exists.

## Product-runtime isolation

This temporary blackout concerns **review/shadow workloads only**. It does not by itself change Slate's production Gemini runtime model, Vertex architecture, NOTE4 voice model selection, billing, credentials, firmware, or backend configuration.

In particular, do not interpret this policy as authorization to change `GEMINI_LIVE_MODEL`, enable billing, create API keys, merge PR #2, flash NOTE4, or alter Campaign 6D/PR #1/PR #3.

## Reporting

For every checkpoint during the window record:

```text
WORKER=CLAUDE_SONNET_5_VIA_CLAUDE_CLI
OPENROUTER_USED=NO
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
GEMINI37_BLACKOUT_EXPIRES=2026-09-06T02:00:00+08:00
```

Never record credential values.
