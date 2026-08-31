# Stage Report

Stage: Phase 0 — harness bootstrap, repository setup, baseline, and architecture research  
Date: 2026-09-01  
Status: READY; firmware passed via exact local ESP-IDF fallback; GitHub Actions registration remains infrastructure debt

## Repository State

Repository: https://github.com/Streetjk/slate  
Branch: `integration/note4-custom`  
Base SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`  
Head SHA: `6c29e541eb65f38c12e4d146158668182e9705e` before this closure amendment commit
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

Remotes:

- `origin`: `https://github.com/Streetjk/slate.git`
- `upstream`: `https://github.com/qiujun8023/slate.git`

The fork and upstream were at the same commit when the baseline was captured. No feature implementation was started.

## Harness

Codex version: `codex-cli 0.147.0`  
AGY version: `1.1.22`  
AGY model: `gemini-3.7-flash-high` for research; `gemini-3.7-flash-low` for smoke test  
AGY authentication: OAuth through the official AGY CLI; no API key was supplied or inspected  
Orchestration mode: `CODEX_PRIMARY`

Evidence for authentication and orchestration:

- `codex login status` reported `Logged in using ChatGPT`.
- `agy models` succeeded and listed Gemini 3.7 Flash high, medium, and low.
- The agy-staff ask smoke test returned `AGY_OAUTH_OK` and telemetry identified `model=gemini-3.7-flash-low`.
- The current Codex app session needs a restart before native `$agy:*` skills are registered. The verified fallback invoked the installed agy-staff companion directly, which is the same code path documented by agy-staff.
- Research job `research-mth99hokx` completed using `gemini-3.7-flash-high` and produced no tracked working-tree changes.

## Objective

Bootstrap the campaign harness, clone the user’s Slate fork, establish the integration branch and upstream remote, install dependencies, run every available Phase 0 baseline check, map the existing architecture, and obtain an independent read-only AGY architecture assessment before implementing features.

## Work Completed

- Read the root README, repository `AGENTS.md`, CONTRIBUTING guide, and backend, frontend, shared, and firmware READMEs.
- Confirmed the fork already existed and cloned `Streetjk/slate` locally.
- Confirmed `origin` points to the user fork and `upstream` points to `qiujun8023/slate`.
- Created local branch `integration/note4-custom`; no work was done directly on `master`.
- Installed workspace dependencies with Bun and generated Prisma Client.
- Ran all available TypeScript/backend/frontend checks.
- Checked for the ESP-IDF toolchain without installing or modifying it.
- Mapped dynamic content, rendering, device synchronization, authentication, frontend routing, firmware scenes, audio, Xiaozhi, cache, and sleep/wake entry points.
- Counted the existing frontend English-UI migration surface: 91 files and 627 lines containing Han characters. This includes comments as well as user-facing literals and is an inventory signal, not a translation defect count.
- Ran a high-confidence tracked-source and Git-history credential-pattern scan with no matches.
- Requested and collected an independent AGY architecture research report in read-only mode.

## Files Changed

No production source files, schemas, dependencies, lockfiles, or firmware files were changed.

These are the tracked campaign artifacts added in Phase 0:

- `docs/campaign-reports/00-PHASE0-BASELINE.md` — persists the baseline, architecture map, research comparison, and readiness decision.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — records resumable autonomous campaign state.

The agy-staff `.agy-staff/` job state is local scratch data ignored through `.git/info/exclude`; it is not part of the tracked repository.

## Architecture Decisions

The following decisions are recorded for later stages:

1. Keep Codex as the sole controller and integration authority. AGY remains a read-only researcher/reviewer unless a later, explicitly scoped implementation workflow is approved.
2. Keep all third-party OAuth, Gemini sessions, provider credentials, and calendar writes in backend services. The NOTE4 should continue to use its device authentication and existing sync protocol.
3. Extend the existing `shared` package with normalized contracts before parallel feature work. Provider-specific Microsoft, Google, exchange, and Gemini objects must not leak through the application.
4. Add BTC and Outlook as backend-owned dynamic content providers only after defining user ownership, caching, refresh, rendering, and offline behavior.
5. Preserve the existing `BitmapCanvas`, dynamic registry, scheduler, ETag/manifest sync, LittleFS staging cache, EPD driver, ES8311 audio path, Xiaozhi lifecycle, SceneStack, UiEvent queue, and SleepManager.
6. Implement Outlook as read-only with minimal Microsoft OAuth scopes and an explicit automated assertion that no Gemini tool registry contains Microsoft or Outlook capability.
7. Implement Google Calendar writes as a two-phase flow: structured proposal, physical/Web confirmation, then a single-use server-side write ticket. No confirmation means no external write.
8. Keep Gemini configuration separate from the existing optional OpenAI-compatible `AI_API_KEY` and `TTS_API_KEY` settings. The campaign must not introduce or reuse static model API keys for Gemini.

## Tests

Commands executed from `/Users/ollama/slate`:

- `bun install` — PASS; 944 packages installed; no tracked lockfile changes.
- `bun run --cwd backend prisma:generate` — PASS; Prisma Client 7.8.0 generated.
- `bun run format:check` — PASS; all files matched Prettier style.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd shared typecheck` — PASS.
- `bun run --cwd backend test` — PASS; 200 tests passed, 0 failed, 666 expectations across 50 files.
- `bun run --cwd frontend build` — PASS; Vite production build completed and transformed 2,165 modules.
- `idf.py -C firmware build` — PASS using the exact local ESP-IDF `v5.5.2` fallback installation and ESP32-S3 target.

The GitHub Actions registration result is an infrastructure limitation, not a recorded firmware test failure. The reproducible local fallback closes the firmware baseline gate.

## Phase 0 Closure Evidence

Closure attempt date: 2026-09-01

### Gate A — Firmware Baseline

The local workflow file was verified to contain `workflow_dispatch`, ESP-IDF `v5.5.2`, target `esp32s3`, `idf.py build`, `idf.py merge-bin`, and artifact upload. It was present on `integration/note4-custom` at commit `3cdb4c70713a49c69f889021ad3dbe85c0fcfcef`.

The documented dispatch command was attempted first without an explicit repository target:

```text
gh workflow run firmware.yml --ref integration/note4-custom
HTTP 403: Must have admin rights to Repository
target resolved by gh: qiujun8023/slate
```

The command was then corrected to target the authenticated fork explicitly:

```text
gh workflow run -R Streetjk/slate firmware.yml --ref integration/note4-custom
HTTP 404: workflow firmware.yml not found on the default branch
```

GitHub API evidence after the failed dispatch:

```text
GET repos/Streetjk/slate/actions/workflows
{"total_count":0,"workflows":[]}

GET repos/Streetjk/slate/branches/integration/note4-custom
{"name":"integration/note4-custom","sha":"3cdb4c70713a49c69f889021ad3dbe85c0fcfcef"}

GET repos/Streetjk/slate/contents/.github/workflows/firmware.yml?ref=integration/note4-custom
firmware.yml present
```

```text
WORKFLOW_RUN_ID: NONE — GitHub created no run
WORKFLOW_REF: integration/note4-custom
COMMIT_SHA: 3cdb4c70713a49c69f889021ad3dbe85c0fcfcef
ESP_IDF_VERSION: v5.5.2 (workflow configuration)
TARGET: esp32s3 (workflow configuration)
BUILD_RESULT: NOT RUN
ARTIFACT_RESULT: NOT RUN
```

Classification: repository Actions-registration/infrastructure blocker before runner execution. There are no workflow logs to collect and no evidence of an actual firmware compilation failure. Firmware was not modified.

GitHub Actions policy was checked through the authenticated GitHub CLI/API:

```text
enabled: true
allowed_actions: all
sha_pinning_required: false
repository permissions: admin=true, maintain=true, push=true
registered workflows: 0
```

The workflow file exists on both `master` and `integration/note4-custom`, while the fork API continues to return zero registered workflows. No repository security setting was weakened and no workflow run ID exists. This is recorded as `GITHUB_ACTIONS_REGISTRATION=INFRASTRUCTURE_DEBT`.

### Gate A fallback — exact local ESP-IDF

The official Espressif framework was cloned and installed outside the repository:

```text
Framework: ESP-IDF v5.5.2
Framework SHA: 30aaf64524299d3bde422ca9a2848090d1bc5d0f
Tool path: /Users/ollama/.espressif-note4
Target tools: esp32s3
```

The official Docker image `espressif/idf:v5.5.2` was first verified by manifest and pull was attempted. Docker failed while registering a layer with `no space left on device` in Docker Desktop's VM, before any build command ran. The host filesystem had available space; no Docker prune or unrelated data deletion was performed.

The exact local fallback then passed against source SHA `6c29e541eb65f38c12e4d146158668182e9705e`:

```text
export IDF_TOOLS_PATH=/Users/ollama/.espressif-note4
source /Users/ollama/esp-idf-v5.5.2/export.sh
idf.py -C firmware build
PASS — ESP-IDF v5.5.2, target esp32s3; slate.bin generated; app size 0x265ec0; 40% partition space free

idf.py -C firmware merge-bin -o slate-full.bin
PASS — firmware/build/slate-full.bin generated; 0x275ec0 bytes

cp firmware/build/slate.bin firmware/build/slate-ota.bin
PASS — firmware/build/slate-ota.bin generated
```

Artifact evidence:

```text
slate-full.bin SHA-256: c78bab5720a641bd8fe1f1fb53d9bd985dbfb599525d99e8c6825732b62eafd2
slate-ota.bin SHA-256: 593a9b6fec49d7573d681ee4e850bbf9743bdf19b846a8eb56177832c1601a46
```

```text
WORKFLOW_RUN_ID: NONE — fork has no registered workflow
WORKFLOW_REF: integration/note4-custom
COMMIT_SHA: 6c29e541eb65f38c12e4d146158668182e9705e
ESP_IDF_VERSION: v5.5.2
TARGET: esp32s3
BUILD_RESULT: PASS via exact local fallback
ARTIFACT_RESULT: PASS; slate-full.bin and slate-ota.bin generated
```

### Gate B — Native AGY/Codex Integration

```text
AGY_SKILL_NATIVE_LOAD: PASS
AUTH_MODE: OAuth
EXPECTED_RESPONSE: AGY_OAUTH_OK
RESOLVED_MODEL: gemini-3.7-flash-low
TRACKED_FILES_CHANGED: NO
```

A fresh `codex exec` process loaded the native `$agy:ask` skill and invoked the installed agy-staff plugin. The observed response was:

```text
AGY_OAUTH_OK
Resolved model identifier: gemini-3.7-flash-low
```

The AGY companion telemetry identified `profile=restricted` and `model=gemini-3.7-flash-low`. No API key was supplied, extracted, or inspected. The fresh Codex process exited successfully with status 0.

### Closure Safety Checks

Before this amendment:

```text
git status --short: empty
git diff --check: PASS
git rev-parse HEAD: 3cdb4c70713a49c69f889021ad3dbe85c0fcfcef
unexpected tracked changes: NONE
credentials introduced: NONE
feature implementation started: NO
```

Gate B and Gate A are closed. GitHub Actions registration remains documented infrastructure debt, but the exact local ESP-IDF fallback provides a reproducible firmware baseline. No feature implementation has started.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`  
Effort level: high  
Verdict: Architecture research complete; code-review verdict not applicable in Phase 0

P0 findings:

- None reported.

P1 findings:

- Gemini Live protocol and approved OAuth/ADC capability remain unverified. AGY’s research mentioned API-key staging as a possible validation path; that path is rejected because it conflicts with the campaign’s OAuth-only policy.
- Third-party OAuth tokens require a dedicated encrypted-at-rest storage and refresh design. AGY proposed AES-256-GCM and short-lived refresh behavior; this remains a design requirement, not an implementation.
- Outlook must remain outside Gemini’s dependency and tool graph. AGY recommended a dedicated read-only provider and an automated zero-Outlook-capability assertion.
- Calendar writes require a server-side, expiring, single-use confirmation ticket with replay protection.

P2 findings:

- Add BTC and Outlook through the existing dynamic provider/definition/renderer pipeline with bounded caching and tests for timeouts, empty data, and offline behavior.
- Add a backend voice gateway so the ESP32 does not hold Microsoft, Google, or Gemini credentials.
- Centralize English UI strings and preserve ASCII-compatible firmware typography and screen-width constraints.
- Add boundary, normalization, timezone, recurrence, audio lifecycle, and confirmation-flow tests before integration.

P3 findings:

- Use configurable provider/model identifiers and validate exchange endpoint availability and regional accessibility during the relevant feature stage.
- Keep changes to central registry, Fastify bootstrap, protocol endpoints, and firmware voice scenes narrowly scoped.

Findings accepted:

- Backend-owned integration gateways.
- Reuse of Slate rendering, caching, synchronization, audio, and sleep infrastructure.
- Shared normalized contracts before parallel implementation.
- Separate OAuth/token service, Outlook provider, Gemini tool allowlist, and confirmation service.
- Deterministic tests for data normalization, rendering, security boundaries, retries, timezones, and replay prevention.

Findings rejected:

- Any API-key fallback for Gemini validation or operation.
- Treating the proposed Gemini Live WebSocket endpoint, model protocol, or `google_search` tool shape as verified facts.
- Blindly adding a user-scoped Outlook provider without first extending the current dynamic fetch context, which currently carries `now` and `lastData` but no owner identity.

Reason for rejected findings: they conflict with the campaign’s hard authentication boundary or require validation against the approved official OAuth/ADC capability before implementation.

## Security Checks

OAuth-only requirement: PASS for the campaign harness; Codex used ChatGPT login and AGY used its normal OAuth CLI path. No API key was supplied, extracted, copied, or inspected.  
Static AI API keys found: No committed credential values found. The baseline source contains optional configuration names `AI_API_KEY` and `TTS_API_KEY`; these are existing legacy provider settings and will not be reused for Gemini.  
Outlook read-only: Not implemented; required for Stage 3.  
Outlook exposed to Gemini: No baseline Outlook or Gemini integration exists. The required isolation test remains pending implementation.  
Google Calendar confirmation gate: Not implemented; required before any Google Calendar write capability.  
Secrets detected: None from high-confidence scans of tracked files and Git history. `.env` files and credential stores were not read.

## Known Issues

- GitHub Actions registration for the fork remains unavailable despite Actions being enabled and the workflow file existing; the exact local ESP-IDF fallback is available for baseline and later regression builds.
- The native `$agy:ask` skill was verified in a fresh Codex process after plugin installation; the prior in-session restart limitation is resolved for new processes.
- Existing Slate user authentication is local password plus JWT; this must not be confused with the separate Microsoft and Google OAuth integrations.
- The backend currently has no Microsoft OAuth, Google Calendar OAuth, Gemini gateway, Fastify WebSocket registration, or user-scoped external-calendar provider.
- The backend currently has no `@fastify/websocket`, Microsoft Graph, Google Calendar, or approved Gemini OAuth/ADC integration dependency.
- The current dynamic fetch context has no authenticated owner identifier, which must be resolved without weakening provider isolation.

## Deviations

- GitHub Actions could not be dispatched because the fork has no registered workflows; Actions permissions were already enabled. The approved official Docker fallback was attempted but could not complete because Docker Desktop's VM ran out of space. The exact ESP-IDF v5.5.2 local fallback was then installed and passed.
- Native `$agy:ask` was verified through a fresh Codex process with OAuth after plugin registration; no API-key fallback was used.
- No optional AGY restricted-mode allowlist was applied; the current agy-staff guide says it is unnecessary for the default unrestricted research path, and applying it would modify global AGY settings.
- No feature implementation, feature branch, commit, merge, or push of product code occurred in Phase 0.

## Next Recommended Stage

Begin Campaign 1 shared normalized contracts, then proceed to English UI and BTC only through the defined test/review/report/push gates. Keep GitHub Actions registration as infrastructure debt and use the exact local ESP-IDF v5.5.2 environment for firmware regression until Actions registers the workflow.

## Final Stage Verdict

READY

The TypeScript/backend/frontend baseline is healthy, the Codex-primary/AGY-OAuth topology is proven, and the exact ESP-IDF v5.5.2 firmware build plus workflow-equivalent artifacts pass at the integration SHA. No product feature implementation has started.
