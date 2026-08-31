# Persistent Campaign Instructions

This file is the coordination channel for the `Streetjk/slate` custom NOTE4 campaign.

## Authority and refresh rule

When working on `integration/note4-custom` or any feature branch created from it:

1. Fetch `origin` before starting a new campaign/stage.
2. Read this file and `docs/campaign-reports/CAMPAIGN-STATE.md` if present.
3. Treat the newest committed version of this file as the current external architecture/review directive.
4. If this file conflicts with an older campaign report, this file governs future work. Historical reports remain evidence and must not be rewritten to conceal prior decisions.
5. Repository safety rules in `AGENTS.md` still apply unless this file explicitly defines a branch-specific campaign workflow.

Do not rely on conversational memory to reconstruct campaign state.

---

## Current checkpoint

Known checkpoint when this instruction was created:

- Repository: `Streetjk/slate`
- Integration branch: `integration/note4-custom`
- Known HEAD before this instruction commit: `6c29e541eb65f38c12e4d146158668182e9705e`
- Phase 0: `NOT READY`
- Native AGY: `PASS`
- AGY authentication: Google OAuth
- AGY smoke model: `gemini-3.7-flash-low`
- Firmware baseline: `NOT RUN`
- GitHub workflow registration: unresolved infrastructure blocker
- Product feature implementation: not started at that checkpoint

Always verify the live branch HEAD rather than assuming the SHA above is still current.

---

# Controller topology

Use:

- **Codex/Luna** as primary controller, sole integration authority and sole production-write authority.
- **AGY / Gemini 3.7 Flash** as first-level researcher, reviewer and instructor.
- **Deterministic tests/builds** as the hard correctness gate.

AGY review mode is read-only. AGY must not commit, merge or push production changes during review.

Normal review model: `gemini-3.7-flash-medium`.

Use `gemini-3.7-flash-high` for architecture, OAuth/security, persistent P1 findings and final adversarial review.

Maximum normal review/fix cycles per stage: **3**. After three unresolved cycles, mark the affected stage `BLOCKED` and persist evidence instead of looping indefinitely.

---

# Authentication policy

Hard requirement: AI/account integrations use approved login/OAuth paths, not static model API keys.

Do not introduce or use for this campaign:

- `GEMINI_API_KEY`
- `GOOGLE_API_KEY` for Gemini
- `OPENAI_API_KEY` for Codex
- OpenRouter for AGY review
- copied AGY OAuth tokens
- manually extracted OAuth bearer tokens

Use:

- Codex: authenticated ChatGPT/Codex login
- AGY: official Google OAuth
- Microsoft Outlook: OAuth/MSAL
- Google Calendar: OAuth

For the NOTE4 Gemini runtime, verify an official OAuth/ADC-compatible path before implementation. If a desired Gemini capability cannot be used under the approved authentication policy, block only that dependent capability and document the limitation. Do not silently fall back to an API key.

---

# Immediate directive: close Phase 0 without indefinite infrastructure blocking

The existing `firmware.yml` should be treated as present source evidence. First investigate repository Actions policy/registration rather than assuming the YAML is missing.

## Step A — repository Actions policy

Using authenticated GitHub tooling, inspect the fork's repository-level Actions permissions.

If Actions are disabled and the authenticated account has appropriate repository administration permission, enable repository Actions using the current documented GitHub API. Do not weaken unrelated security controls.

Then retry workflow discovery and dispatch against `integration/note4-custom`.

Record exact API responses, workflow/run identifiers and tested SHA in the Phase 0 report.

## Step B — reproducible firmware fallback

If GitHub Actions still cannot register/dispatch correctly after a reasonable policy fix, do **not** leave the product campaign permanently blocked on GitHub infrastructure.

Use the official Espressif ESP-IDF Docker image pinned to **v5.5.2** and build the exact integration SHA.

Required baseline operations should reproduce the repository workflow intent:

- ESP-IDF v5.5.2
- target ESP32-S3
- `idf.py -C firmware build`
- merged full binary generation
- OTA binary generation/copy as applicable

Verify outputs exist and record hashes where practical.

If the exact-source container build passes:

- set `FIRMWARE_BASELINE=PASS`
- track GitHub Actions registration as `INFRASTRUCTURE_DEBT`
- mark Phase 0 `READY`

If Docker is unavailable, exact local ESP-IDF v5.5.2 installation is an acceptable fallback.

Do not change firmware source merely to force a baseline build to pass.

## Step C — Phase 0 closure

Once native AGY remains verified and firmware baseline passes:

1. update `00-PHASE0-BASELINE.md` with closure evidence;
2. create/update `CAMPAIGN-STATE.md`;
3. run minimal safety checks;
4. commit and push;
5. continue automatically to Campaign 1.

Do not pause for routine human approval after successful Phase 0 closure.

---

# Autonomous campaign sequence

After Phase 0 closes, proceed through the following software campaigns automatically unless a hard-stop condition occurs.

## Campaign 1 — foundation + English + BTC

First define provider-independent shared contracts, including at minimum:

- `PricePoint`
- `PriceSeries`
- `CalendarEvent`
- `ProposedCalendarEvent`
- `VoiceTranscript`
- assistant request/response/tool contracts as needed

Provider-specific Microsoft/Google/Gemini/market objects must remain inside provider modules.

Then use isolated feature branches/worktrees where practical:

### English UI

Implement full user-facing English for NOTE4 and Web UI without blindly translating machine-readable protocol/schema identifiers.

Preserve 400x300 e-paper constraints, font support and existing navigation.

### BTC/USD

Implement current BTC/USD plus daily, weekly and monthly views.

Prefer backend fetch/normalize/cache/render and local/cached D/W/M switching on the device rather than a fresh network request on each button press.

Add deterministic tests for normalization, ranges, empty/bad data, timeouts, formatting, chart boundaries and cached fallback.

After each feature lane:

- deterministic tests first;
- AGY L1 review;
- fix valid findings;
- re-test/re-review;
- integrate only after pass.

Push a campaign report and update `CAMPAIGN-STATE.md`.

## Campaign 2 — Outlook read-only calendar

Before implementation use AGY high-effort research against current official Microsoft OAuth/MSAL/Graph behavior.

Requirements:

- user-scoped Microsoft OAuth connection;
- minimum read-only calendar scope;
- token refresh and safe persistence;
- normalized `CalendarEvent` objects;
- e-paper agenda rendering;
- cached/offline display;
- timezone/recurrence/all-day handling;
- ownership isolation between Slate users.

### Locked Outlook/AI boundary

Gemini must never receive or be able to access:

- Outlook OAuth/refresh tokens;
- Microsoft Graph client;
- Outlook event contents;
- attendees/descriptions;
- Outlook search or write capability;
- generic internal HTTP tooling capable of reaching Microsoft Graph.

Add automated tests proving the Gemini tool/dependency graph contains zero Outlook/Microsoft capability.

If code is complete but live Microsoft OAuth needs interactive user consent, mark live-account testing deferred and continue independent campaigns.

## Campaign 3A — Gemini OAuth feasibility

Before implementing runtime AI, verify current official Google capabilities and exact model identifiers under the approved OAuth/ADC path.

Verify separately:

- live STT / streaming transcription;
- English and Japanese support;
- general reasoning/Q&A;
- Google Search grounding/web search;
- tool/function calling;
- TTS;
- transport/session requirements.

Do not assume model names from prior conversation. Record current official evidence.

If one capability is unavailable under OAuth/ADC, block only its dependency chain where possible.

## Campaign 3B — Gemini voice/Q&A

Reuse Slate's existing NOTE4 audio stack and Xiaozhi lifecycle wherever practical:

- ES8311
- I2S
- microphone capture
- speaker playback
- buffers
- voice scenes/state management

Backend should own Gemini sessions/credentials. Do not put Google credentials in firmware.

Required product behavior where supported:

- English STT
- Japanese STT
- general Q&A
- web-grounded current-information answers
- TTS/spoken response

Initial Gemini tool allowlist must remain narrow. Outlook/Microsoft access is forbidden.

## Campaign 4 — voice to Google Calendar

Use Google OAuth only.

Implement a narrow, confirmation-gated event creation capability.

Flow:

`voice -> STT -> interpretation -> ProposedCalendarEvent -> NOTE4/Web confirmation -> single-use server ticket -> Google Calendar write`

No confirmation means no write.

Confirmation ticket must be:

- server-generated;
- short-lived;
- single-use;
- user-scoped;
- bound to proposal data;
- replay-resistant.

Test cancellation, expiry, replay, wrong user, duplicate submit, invalid dates, timezone and OAuth/network failures.

Do not expose arbitrary Google API execution to Gemini.

## Campaign 5 — MVP integration/hardening

Integrate all passed campaigns and run full regression:

- format
- lint
- typecheck
- shared/backend tests
- frontend build
- exact firmware build
- secret scan

Run AGY high-effort adversarial final review.

Do not claim real hardware success without testing real hardware.

When physical NOTE4 flashing/testing is the remaining boundary, produce a pre-hardware report containing:

- exact source SHA;
- firmware artifact names;
- artifact hashes;
- flash instructions;
- expected boot behavior;
- test checklist;
- rollback method.

Then stop for physical user interaction.

## Campaign 6 — Airtable Gantt (post-MVP)

Do not begin until the software MVP gate passes unless explicitly instructed otherwise.

Design for user-scoped Airtable sync, normalized tasks and server-rendered 400x300 Gantt output. Initially keep Airtable outside Gemini's tool access.

---

# Hard-stop conditions

Routine compiler errors, test failures, P2/P3 findings, ordinary merge conflicts and normal bug fixing are **not** reasons to stop the autonomous campaign. Resolve them where reasonable.

Stop/persist/escalate for:

- credential or OAuth token leakage;
- unexpected Outlook write capability;
- Gemini gaining Outlook/Microsoft access;
- calendar write possible without confirmation;
- unresolved P0 security finding;
- persistent P1 after the defined review loop;
- implementation requiring prohibited static Gemini/API-key auth;
- repository state/rollback becoming unsafe;
- interactive OAuth consent that requires the user;
- physical NOTE4 connection/flashing;
- destructive external-account action;
- new paid service/subscription requirement.

When stopped, preserve safe completed work, push the report/state, and state the exact external action required.

---

# Reporting and shared coordination

Maintain:

`docs/campaign-reports/CAMPAIGN-STATE.md`

with at least:

- repository/branch;
- last known good SHA;
- current campaign/stage/status;
- completed/blocked/deferred campaigns;
- active feature branches;
- last deterministic test result;
- last AGY verdict/model;
- next automatic action;
- whether human action is required.

At every major stage boundary:

1. implement;
2. test;
3. AGY review;
4. fix/re-test/re-review as needed;
5. write stage report;
6. update campaign state;
7. commit;
8. push;
9. continue automatically if no hard stop.

Reports must preserve actual commands/results, accepted/rejected AGY findings and security checks. Never commit OAuth tokens, secrets, cookies, authorization headers or private keys.

---

# External reviewer communication protocol

This file is intentionally designed so an external reviewer can update instructions through GitHub.

At the start of each new campaign or after pulling new commits:

- check whether `CAMPAIGN-INSTRUCTIONS.md` changed;
- if changed, read the complete latest version before proceeding;
- record the instruction-file commit SHA in the next campaign report/state file.

Do not assume this file will change during an already-running command. Re-read it at campaign/stage boundaries and after explicit repository refreshes.

---

# Governing principle

Optimize for correctness, security, reproducibility, auditability and automatic progress.

Preferred loop:

`PLAN -> IMPLEMENT -> TEST -> AGY REVIEW -> FIX -> RETEST -> RE-REVIEW -> PASS -> COMMIT -> PUSH REPORT/STATE -> REFRESH INSTRUCTIONS -> NEXT CAMPAIGN`

Continue automatically until a genuine hard-stop condition above is reached.