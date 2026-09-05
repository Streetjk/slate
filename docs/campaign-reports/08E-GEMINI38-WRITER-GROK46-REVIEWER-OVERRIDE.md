# Campaign 8E routing override — Gemini 3.8 Flash writer / Grok 4.6 reviewer

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This is the newest explicit user routing policy and supersedes `08E-TEMPORARY-LUNA-WORKER-GROK46-REVIEWER.md` wherever worker/writer routing conflicts.

## Controller / integration authority

Codex remains:

- primary controller;
- sole repository and production writer/integrator;
- deterministic validator;
- final adjudicator.

Gemini 3.8 Flash is a bounded implementation writer/worker. It may propose patches, scripts, tests, diagnostics, and documentation, but it must not independently mutate production or bypass Codex validation/integration.

## Writer / worker — Gemini 3.8 Flash

Use:

```text
WRITER=GEMINI_3_8_FLASH
WRITER_MODEL=gemini-3.8-flash
WRITER_ROLE=BOUNDED_IMPLEMENTATION_WRITER_WORKER
```

Required behavior:

- use an existing authorized Gemini/Google transport already available to Codex;
- do not create, reveal, copy, or commit a new credential merely to enable writer routing;
- do not use the protected Orange Pi production Gemini API key for orchestration/writer work;
- do not route through OpenRouter unless a newer explicit user instruction authorizes that exact transport;
- do not silently fall back to Luna, Sonnet, Gemini 3.7 Flash, Grok, GLM, or another writer model;
- if Gemini 3.8 Flash is unavailable, unauthenticated, rate-limited, or unsupported by the existing transport, record `GEMINI38_WRITER=UNAVAILABLE` and continue with Codex alone where safe;
- Codex must deterministically validate all writer output before integration;
- no recursive delegation.

For nontrivial implementation work, prefer `thinking_level=high` where the active transport exposes that option; otherwise use the transport's supported/default reasoning configuration. Do not block safe work solely because the transport does not expose a thinking-level control.

## Independent reviewer — Grok 4.6

Grok 4.6 remains the independent reviewer through the existing authenticated Grok CLI/session.

```text
INDEPENDENT_REVIEWER=GROK_4_6
REVIEW_TRANSPORT=GROK_CLI_EXISTING_AUTH_SESSION
```

Reviewer remains read-only. Codex supplies the exact artifact/diff/report, adjudicates findings, and performs any accepted correction. Do not use Gemini 3.8 Flash as its own independent reviewer for work it authored.

If Grok 4.6 review is unavailable, stop the independent-review gate or continue only work that does not require that gate; do not silently substitute another reviewer.

## Gemini 3.7 blackout

The existing Gemini 3.7 Flash review/shadow blackout until `2026-09-06T02:00:00+08:00` remains binding. This routing change does not authorize Gemini 3.7 calls.

## Product/runtime isolation

This writer change is orchestration-only. It does **not** authorize or imply any change to the NOTE4 voice runtime or production model.

```text
PRODUCTION_GEMINI_LIVE_MODEL_CHANGE=NO
NOTE4_LIVE_MODEL_CHANGE=NO
BILLING_CHANGE=NO
VERTEX_CHANGE=NO
PRODUCTION_CREDENTIAL_CHANGE=NO
FIRMWARE_FLASH_AUTHORIZATION_CHANGE=NO
DOCKER_ROOT_AUTHORIZATION_CHANGE=NO
PR2_MERGE_AUTHORIZED=NO
```

Gemini 3.8 Flash does not replace the production Gemini Live model. The existing product/runtime pins and campaign gates remain unchanged.

## Current campaign continuation

Apply this routing immediately to subsequent bounded implementation work, including the current M1 V4 Docker-root migration-script correction and later software repair work, while retaining all existing campaign safety and human-authority boundaries.

Checkpoint pushes remain non-stopping. Stop only for a genuine new human/security/production/physical boundary under the campaign policy.
