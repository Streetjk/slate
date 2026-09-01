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

Do not claim real hardware validation unless it actually occurred.

---

# External review gate — findings added 2026-09-01

These findings came from an independent review of the actual `integration/note4-custom` source after Campaign 1. Codex must not blindly accept them; it must inspect the current code and the latest AGY/Codex reports, then either fix each valid issue or reject it with concrete evidence in the next relevant report.

This section is intentionally revisitable. At the next pushed Campaign 2 report/checkpoint, compare these findings against the new implementation and AGY conclusions. If later code or evidence changes severity/scope, update this directive rather than preserving stale assumptions.

## XR-001 — P1 candidate: BTC provider stale fallback bypasses central reuse policy

Current concern:

`BtcPriceProvider.fetchData()` catches upstream Coinbase failures and returns `ctx.lastData` itself. Slate's central `DynamicContentRendererService` normally catches provider failures and calls `canReuseDynamicData()` to decide whether stale data is still within the configured reuse age. If the provider converts the failure into a successful return, the central policy cannot reject expired data, and the provider's in-memory cache may cache the stale fallback as if it were a successful fetch.

Required action before Campaign 1 is treated as fully hardened:

1. Reproduce the behavior with a deterministic test using an expired `PriceSeries`.
2. Prefer removing provider-level `lastData` fallback and allowing Slate's existing central reuse policy to own stale-data acceptance/rejection.
3. If keeping provider-level fallback, prove with tests that it applies the exact same freshness semantics and does not reset/cache stale age as fresh. This is less preferred because it duplicates central policy.
4. Add tests for:
   - recent stale fallback accepted by the central path;
   - expired stale data rejected;
   - upstream failure remains recorded as an error/backoff event rather than becoming a false success;
   - subsequent retry timing is not incorrectly extended by caching fallback data.
5. Run AGY re-review after the fix.

Do not silently downgrade this finding solely because previous AGY review passed. Either fix it or document evidence proving the concern is incorrect.

## XR-002 — P2 candidate: BTC D/W/M product UX requires three manually configured content items

Current implementation appears to model one `period` per `btc_price` dynamic-content item. The desired product behavior is immediate NOTE4 switching among Daily/Weekly/Monthly views with all required frames/data already available locally/cached.

Required action:

1. Confirm the current user flow end-to-end from Web creation through group/frame sync and device button navigation.
2. If the user must manually create three separate BTC content items, treat the backend provider as technically valid but the product requirement as incomplete.
3. Implement the minimum-change UX that gives the intended result. Preferred options, in order:
   - an "Add BTC" workflow that provisions a D/W/M trio automatically into the selected group using existing Slate frame navigation;
   - another mechanism that guarantees all three views are created/synced/cached without a network request per button press.
4. Do not add a new low-level firmware navigation stack if existing frame/group navigation already satisfies switching.
5. Add deterministic tests for the provisioning/config behavior where practical and document what still requires real-device confirmation.

This may be scheduled as Campaign 1B hardening rather than blocking Outlook research, but it must be resolved before final MVP completion.

## XR-003 — P2 candidate: malformed finite Coinbase timestamps can throw during normalization

Current concern:

The Coinbase candle normalizer accepts a finite positive timestamp and then constructs `new Date(timestamp * 1000).toISOString()`. A finite number can still be outside JavaScript Date's representable range, causing `toISOString()` to throw instead of filtering the malformed external row.

Required action:

1. Add a regression case using an out-of-range but finite timestamp.
2. Validate the constructed Date (`Number.isFinite(date.getTime())`) before calling `toISOString()`.
3. Filter invalid rows rather than crashing normalization.
4. Re-run focused BTC tests and AGY review.

## XR-004 — P2-before-AI candidate: assistant tool names are restricted but tool inputs are generic

Current shared contract restricts tool names, which is good, but tool input is currently a generic record. Before any real Gemini tool execution is enabled, convert the tool request contract to strict per-tool input schemas.

Minimum target:

- `web_search` — explicit query/options only;
- `get_btc_price` — explicit supported period/parameters only;
- `propose_google_calendar_event` — explicit proposal fields only, using the normalized calendar proposal contract where appropriate.

Required behavior:

1. Prefer a discriminated union keyed by tool name.
2. Reject unknown fields where practical.
3. Add positive/negative tests for each tool input.
4. Explicitly prove no Outlook/Microsoft capability can be smuggled through a generic URL/body/tool input.
5. This finding does **not** need to block Outlook Campaign 2 research/implementation, but it **must** block Campaign 3B/4 production tool execution if unresolved.

## XR-005 — P3/P2 candidate: full-English display still exposes Chinese defaults/voice labels

Current concern:

Some user-visible TTS voice identifiers and the default weather location still appear in Chinese even though machine identifiers should remain stable.

Required action:

1. Distinguish internal/provider identifiers from user-facing labels.
2. Preserve underlying voice IDs if required by existing TTS compatibility.
3. Add an English display-label map for voice choices rather than renaming protocol values.
4. Replace or localize default visible weather location behavior so an English-first install does not initially present Beijing/Chinese text unless that is genuinely provider data selected by the user.
5. Re-run the remaining-user-facing-Han-character inventory and classify each remaining occurrence as:
   - internal/comment/provider data — acceptable;
   - user-visible label/default — fix;
   - deliberate proper name/provider vocabulary — document.

Do not mass-translate schema/provider constants just to reach zero Han characters.

---

# External review sequencing rule

Because Campaign 2 Outlook research is already running, do not throw away useful in-progress work merely to service the above findings.

Preferred sequencing:

1. Allow current AGY Outlook architecture/research to complete.
2. Persist its findings/report/checkpoint.
3. Before promoting a completed Outlook implementation beyond its normal review gate, execute a short `Campaign 1B — external-review hardening` lane for XR-001, XR-003 and XR-005, unless they have already been resolved by intervening commits.
4. Resolve XR-002 no later than the MVP integration/hardening campaign; do it earlier if it is low-risk to add the BTC trio provisioning UX.
5. Resolve XR-004 before Gemini production tool execution starts.
6. Run deterministic regression and AGY review after each affected fix.
7. Update the relevant historical campaign report by appending hardening evidence or create `01B-EXTERNAL-REVIEW-HARDENING.md`; do not rewrite prior AGY results as if these findings were known at the time.

At the next report boundary, explicitly include:

```text
EXTERNAL_REVIEW_RECHECK:
XR-001: CONFIRMED / FIXED / REJECTED / DEFERRED
XR-002: CONFIRMED / FIXED / REJECTED / DEFERRED
XR-003: CONFIRMED / FIXED / REJECTED / DEFERRED
XR-004: CONFIRMED / FIXED / REJECTED / DEFERRED
XR-005: CONFIRMED / FIXED / REJECTED / DEFERRED

NEW_EVIDENCE:
AGY_AGREEMENT_OR_DISAGREEMENT:
SEVERITY_CHANGES:
NEXT_REQUIRED_ACTION:
```

A rejected external finding must include code/test evidence, not only model disagreement.

---

# Hard-stop conditions

Stop the affected dependency chain and persist state for:

- P0/security-critical finding;
- credential or OAuth token leakage;
- Gemini access to Outlook/Microsoft Graph;
- Outlook write capability;
- Google Calendar write without explicit confirmation;
- required static Gemini API key under the locked auth policy;
- unrecoverable repository corruption;
- unresolved P1 after normal bounded review/fix cycles;
- genuinely required interactive OAuth/hardware/user-account action.

Ordinary compiler/test failures, P2/P3 findings and correctable implementation defects should be handled automatically.

---

# Continuous reporting

Maintain `docs/campaign-reports/CAMPAIGN-STATE.md` as the resumable state record.

At every major stage boundary:

1. test;
2. AGY review;
3. fix/retest/re-review as needed;
4. write/update stage report;
5. update campaign state;
6. commit;
7. push to `origin`;
8. fetch/re-read this instruction file before starting the next major campaign, because external review instructions may have changed.

Reports must include exact branch/SHAs, commands/tests, AGY model/verdict/findings, accepted/rejected findings, security state, known issues and next action.

---

# Human boundary

Software campaigns may continue automatically until genuinely blocked.

Require human action before:

- flashing/physically testing the NOTE4;
- interactive personal OAuth consent when unavoidable;
- entering production credentials;
- destructive external-account operations;
- activating a paid service;
- final merge/release to `master`.

---

# Governing principle

Use Codex for implementation/integration, AGY/Gemini for independent research/review, deterministic tests for truth, Git for rollback/auditability, and OAuth for authentication.

Continue automatically when evidence is green. Do not allow a previous model PASS to override a newly demonstrated code defect, and do not allow an external reviewer assertion to override code/test evidence either.
