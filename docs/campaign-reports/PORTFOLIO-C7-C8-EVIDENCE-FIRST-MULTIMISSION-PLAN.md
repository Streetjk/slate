# Slate C7/C8 evidence-first multimission recovery plan

Date: 2026-09-12
Status: REVIEW AND EXECUTION PLAN; NOT PRODUCTION ACTIVATION AUTHORITY

## 1. Scope, baseline and authority

This plan organizes the existing C7/C8 repair and BTC weekly-only scope into bounded missions. It does not create another product campaign or grant deployment, firmware flash, production data migration, physical-test, OAuth, credential, billing, provider-session, merge or release authority. Execute development only within existing standing authority after reconciling the live branch. Phases requiring new authority remain gated.

Reviewed report head: `4ff2b44c0205f2d908c3c957f5751233ce9806bb`.
Reviewed implementation source: `b235f67b2ace99a6b3112ec0754fb5ba068dc228`.

The current report says Z.ai authentication is recovered after binding/reloading the existing credential source. It reports 44 focused backend tests, 6 shared tests, frontend/backend checks, a firmware build and a terminal Grok 4.6 PASS. It reports NO activation of the new package.

Reported artifacts, retained for traceability rather than approved for activation by this plan:

```text
BACKEND_IMAGE=sha256:0e6eb76c2bd88928556d96035671eb9da973786b76a00d1c5bb8b2b1ab29c363
FIRMWARE_APP_SHA256=f6bd1111fba50d94ff9bd6ccfbbc284dbdd4bbcd0d763ed5b09403e231954ab1
FIRMWARE_APP_BYTES=2537024
REPORTED_GROK_REVIEW=PASS
ADVISORY_ACTIVATION_STATUS=HOLD_PENDING_FINDINGS_F1_TO_F5
```

Preserve the reported review verdict as historical evidence. Do not overwrite it with an invented reviewer REVISE. The findings below are a separate source-code review and require reproduction/adjudication. No production execution, device readback, or full test-suite rerun was performed for this review.

Roles remain Codex controller/integrator, Z.ai `glm-5.3-flash` implementation writer and `grok -m grok-4.6` independent reviewer. No silent substitution. Do not repeat the already-resolved credential-recovery campaign unless a fresh invocation actually fails. Never expose, fingerprint, copy into reports, or commit credentials.

C7/PR #1 and C8/PR #2 use the selected combined integration path. C9/PR #3 remains parked research-only. C10/PR #4 remains isolated and undeployed. Keep all PRs OPEN / DRAFT / UNMERGED.

## 2. New review findings against b235f67

### F1 — Producer-to-collector diagnostic contract is incomplete

The firmware emits lowercase messages such as `frame marker phase=...`, `voice font marker ...` and `voice layout marker ...`. Weather emits `weather lifecycle marker ...` messages. The checked-in `scripts/slate-m4-sanitized-observer-v2.py` recognizes a different set of allowlisted uppercase key/value, timing and audio patterns. Its backend grep filter also does not include the new lifecycle messages. The file was not updated with this package.

Consequently the checked-in collector does not preserve the new diagnostic fields. A different local collector may exist, but the report does not identify or qualify one. Binding the actual collector identity and testing emitted fixtures through its entire filtering/parsing/output path is mandatory before another device attempt.

### F2 — Card identity is not rendered-image freshness

`firmware/main/sync/sync_poll.cc` compares cached `manifest_content_id` with `state.current_content.id`. This can establish identity of a content record, but an old image and a new image can belong to that same record. The requested marker currently returns `unknown` in both branches of its conditional.

A same-card/old-image fixture must fail freshness acceptance. Compare actual expected content/image versions, cache metadata and displayed bytes where available. Keep identity and freshness as separate predicates.

### F3 — Glyph markers overstate what they measure

`LogVoiceFontSelection` in `firmware/main/scenes/xiaozhi/xiaozhi_scene.cc` derives `direct_bitmap` and `fallback_bitmap` from positive descriptor bounding-box dimensions; it does not retrieve the glyph bitmap. Its direct lookup uses a fallback-resolving public API, so the label also needs verification against the actual resolved font. The artifact marker is a constant font description plus project version, not unique running-image proof.

Logging occurs in `AppendXiaozhiBubble`, whereas the in-place assistant update path calls `LayoutBubble` without the same glyph probe. A glyph arriving in a later transcription/response update may therefore miss the diagnostic hook.

These are instrumentation limitations, not proof of the original square's root cause.

### F4 — BTC consolidation needs concurrency and failure-atomicity tests

`DynamicContentService.appendBtcTrio` reads group/content state and builds the consolidation plan before acquiring its deletion transaction's group lock. If no weekly record exists, creation occurs later through a separate `append` call. Two requests can therefore both select an absent weekly record before their inserts are serialized. Sequential idempotency is not sufficient to exclude duplicates.

When daily/monthly records exist but weekly does not, removal commits before replacement creation/rendering succeeds. A later creation/render failure may leave the previous cards removed. This is a source-derived failure scenario to reproduce, not an observed production incident.

Do not perform production consolidation until real transaction/concurrency and failure-injection tests pass. The user's objective is one visible seven-day BTC tile, not unnecessary permanent deletion.

### F5 — Test names and reported evidence need narrower claims

`run_sanitized_frame_markers_test.sh` and `run_sanitized_voice_font_marker_test.sh` mainly grep source text and check for forbidden strings. Those checks are useful static checks, but they do not demonstrate collector ingestion, cache freshness, glyph bitmap retrieval, actual LVGL drawing or running-image identity.

`ENGLISH_STRUCTURAL_EXPECTED` is an expectation derived from code, not visual verification of the current served frame. Likewise, source/CMake references are not running-firmware attestation. Record these distinctions explicitly.

## 3. Mission model and scheduling

Operate in `PORTFOLIO_FRONTIER_DRIVEN_LONGRUN`, with at most two independent implementation worktrees and one integrator. Shared files have one owner at a time. Serialize integration and exact-candidate review. Do not introduce another orchestration platform merely to run this plan.

Each mission has an ID, owner, dependencies, source SHA, evidence level, test command/results, next action, authority class and optional blocker ID. Use distinct evidence levels: SOURCE_INSPECTED, HOST_EXECUTED, BUILD_VERIFIED, DEPLOYMENT_VERIFIED and PHYSICAL_OBSERVED. Do not promote one to another automatically.

Recommended mission states are READY, RUNNING, BLOCKED_DEPENDENCY, BLOCKED_EXTERNAL, WAITING_AUTHORITY, WAITING_PHYSICAL, DONE and PARKED. A missing event producer is a development dependency, not WAITING_PHYSICAL. WAITING_PHYSICAL is valid only after the required producer, collector and runtime are qualified and the physical action is authorized.

Keep one current machine-readable frontier with a short human summary in CAMPAIGN-STATE.md. Retain old reports as history; do not rewrite their conclusions silently. Record the inspected base head and candidate hash rather than trying to make a commit contain its own hash. Deduplicate a shared activation gate across C7/C8.

A checkpoint ends a work packet, not the active controller run. Continue any independent safe mission. Do not spin on unchanged authentication, unavailable events, or parked campaigns. On a genuine exit, save a restart packet; do not imply unattended future resumption exists unless a real runner has been configured and authorized.

## M00 — Reconcile evidence and freeze review scope

Owner: Codex. Dependencies: none.

Read the current report, role policy, previous consumed physical evidence and this review. Compare live product bytes with b235f67. Preserve the recovered writer state. Record a source-level issue for each finding, with a minimal reproducer and expected result.

Correct terminology without inventing new observations: Calendar and Weather remain physically unresolved; Japanese square remains unresolved; News is partial operator PASS; Outlook error presentation is improved but actual connectivity remains unconfigured/unaccepted; BTC weekly-only is implemented in a candidate but not applied to production.

Exit: concise mission ledger, exact source/collector/build identities, explicit permissions and a reproducible test plan. Do not spend a model call to rediscover facts already bound to this SHA.

## M01 — Make observability work end to end

Owner: Z.ai writer; Codex adjudicates. Dependencies: M00. Highest priority.

Define a small versioned schema covering frame freshness, Weather error lifecycle, glyph resolution and running-artifact evidence. Use fixed enums, bounded numeric fields and a run-local correlation alias. Do not log raw record/device IDs, transcript text, credentials, arbitrary payloads or reconstructable streams of codepoints.

Update both emission and collection paths. Include remote backend prefilters, serial parsing, browser-side capture where needed, output serialization, timeouts, stream termination and privacy rejection. A console message alone does not establish a usable frontend capture path.

Feed exact producer-format fixtures through the real collector functions. Require correct stage correlation for success and failure, rejection of secret-bearing fields, preserved enum values, bounded output and an explicit missing-evidence result. Test fragmenting, duplicate messages, reordered delivery, stale schema version, and capture interruption. Do not report PASS after a timeout or absent terminal receipt.

Exit: every required event demonstrably survives producer -> filter -> parser -> sanitized evidence. Bind collector SHA/version to the eventual activation manifest.

## M02 — Prove Calendar/Weather freshness, not only configuration

Owner: Z.ai writer, parallel with M03 when paths are disjoint. Dependencies: M01 contract.

Calendar: distinguish record identity, content version, image version, manifest version and last displayed version. Compare versions locally and emit match/mismatch/unknown rather than private raw IDs. A persisted metadata match must not substitute for verification of the actual cached image when the hypothesis is stale bytes.

Tests must include same ID with changed image, server correct/device old, stale API/cache response, successful no-image-change render, missing cache file, interrupted download and manifest update, and normal background/user-active sync. Confirm the expected current frame from the actual rendering path on a fixed non-sensitive date and configuration; do not call a recent timestamp proof of English output.

Retain en-AU, Australia/Perth, English month/weekday presentation and the existing reviewed WA holiday data. Cover months with known holidays, month/year boundaries and supported-year limits without inventing dates.

Weather: compare the authoritative stored error state, render-success state, API boolean/error class and frontend query state. Use read-only structural DB/API reads where existing access permits, before deciding firmware instrumentation is necessary. Represent an absent diagnostic field as UNKNOWN or schema mismatch, not false. Exercise error -> success with changed image and unchanged image, stale response ordering, failed refetch, and refresh cancellation. Preserve the existing card identity.

Exit: a tested freshness/error-lifecycle contract and either a reproduced defect with minimum repair or a precise runtime question the new instrumentation can answer. Do not delete/recreate cards or clear all caches as a diagnostic shortcut.

## M03 — Validate actual glyph drawing and running firmware

Owner: Z.ai writer. Dependencies: M01 contract; may run beside M02.

Use the resolved locked LVGL version, not assumed latest APIs. Inspect the label's effective font and the glyph descriptor's resolved font/placeholder state. Retrieve the glyph bitmap with the actual LVGL API and release associated draw data as required. Distinguish valid zero-area whitespace from a missing printable glyph. Supply correct following-character context for kerning.

Test initial bubble creation AND in-place assistant updates where the problematic character arrives later. Move or share the bounded diagnostic hook accordingly. Prove the literal `曇り時々雨` through actual LVGL layout/draw execution where the host build permits; direct cmap coverage alone is insufficient. Add representative hiragana, katakana, punctuation, `の`, and a deliberately unsupported character. Do not assume the photographed codepoint was U+66C7 without evidence.

Use synthetic fixtures for exact text/codepoints. For production diagnostics, allow only a bounded target codepoint or fixed missing-glyph class; avoid logging every unsupported character from every turn. Measure the overhead of repeated scanning/logging so diagnostics do not recreate progressive UI lag.

Bind firmware binary hash, ELF identity, generated font identity and build manifest explicitly. Add running-partition/running-app identity evidence using supported ESP-IDF APIs. The binary-file SHA and ELF SHA are different identities and must not be compared as if they were the same. A successful write to an offset does not alone prove that app is running. Inspect the partition/boot arrangement before any later flash; never guess a new offset or erase OTA/NVS state.

Exit: behavioral glyph tests, initial/update-path coverage, bounded diagnostics and an unambiguous running-app identity check. Keep original physical failure open until a later authorized observation.

## M04 — Make one seven-day BTC tile safely

Owner: Z.ai writer. Dependencies: M00; can proceed independently of device work.

Target remains one visible BTC/USD Weekly tile, seven days, hourly granularity, at most 168 points. Preserve the existing weekly record where valid, its unrelated configuration, and unrelated content.

Reproduce concurrent requests with no weekly record, with existing daily/monthly records, and with duplicate weekly records. Move authoritative reads, selection and the decisive database mutation into the appropriate common serialization/transaction boundary. Recheck scope/ownership and expected state there. Do not hold a database lock across an external price-provider fetch merely to make the test pass.

Separate preparation, application and cleanup. Do not commit destructive removal before a valid replacement/reference is secured. Prefer reversible visibility removal/archive if the existing schema supports it; otherwise provide a targeted backup and rollback plan before any explicitly authorized deletion. Make cleanup retryable and prevent in-flight refresh from resurrecting removed records or corrupting ordering.

Use a real isolated database for concurrency/failure tests, plus unit tests for planning. Test repeated requests, rollback, writer/process interruption, render failure, invalid BTC config, unrelated cards and consistent manifest/order updates. No external market request is needed for these tests.

Prepare a dry-run production plan with affected-count preconditions, one preserved weekly card and exact rollback behavior. Applying this plan is a production data operation separate from deploying code. Deployment alone must not be reported as successful consolidation of existing records.

Exit: concurrency and failure-atomicity PASS, one idempotent result, targeted migration preview and no production mutation yet.

## M05 — Preserve Voice stability and measure latency honestly

Owner: Codex test lead with designated writer for necessary changes. Dependencies: M01/M03.

Run a bounded provider-disabled long replay, including at least 100 simulated turns and 1,000 partial updates, through the actual state/coalescing paths where supported. Verify one logical bubble per role, user-before-assistant ordering, stale-generation rejection, bounded queues, cancellation/reconnect cleanup and no sustained resource growth after warmup.

Report CPU/local queue timings separately from provider latency and optical e-ink presentation. Do not subtract clocks from different machines without a demonstrated correlation method. Predeclare measurement points and acceptance thresholds before the next physical test. Do not claim a latency improvement merely because fewer characters were displayed or a slow stage was excluded.

This mission does not authorize a Gemini live session or model change. Any later ordinary production Voice acceptance must have an explicit session/turn budget distinct from synthetic qualification and development-model calls.

Exit: stable host replay and a latency measurement plan that can distinguish input/VAD/transcription, backend flush, UI update, audio and provider stages.

## M06 — Preserve C7 feature completeness and honest Outlook status

Owner: Codex integration lead. Dependencies: M02; independent fixture work may start sooner.

Build a capability regression matrix covering daily/monthly Calendar, WA holidays, Weather config/error/icons, Google News AU/TW/Both, Outlook error handling, BTC weekly-only and C8 Voice/glyphs. Preserve News's partial physical success without inventing separate AU/TW/Both acceptance.

Outlook's English server error demonstrates safer error presentation, NOT a usable Outlook connection. Record `OUTLOOK_ERROR_PRESENTATION` separately from `OUTLOOK_CONNECTIVITY`. Source-backed missing configuration may justify a clearer English setup-required state, but OAuth setup, credentials, consent and private event access remain separate decisions. Keep Calendars.Read-only behavior and Gemini isolation.

Use public/synthetic fixture data for regression. Existing Google Calendar proposals still require physical confirmation before writes. Do not rewrite the production authentication architecture from a stale PR description; identify any conflict between historical scope and later authority records without changing credentials or modes.

Exit: capability matrix with independent implemented/tested/deployed/physically-accepted statuses; no omitted C7 path during combination.

## M07 — Reproducible qualification and exact review

Owner: Codex integrator and Grok reviewer. Dependencies: M01-M06 sufficient for the selected candidate.

Restore workspace dependencies from the existing lockfiles in a clean isolated worktree. Compare base and candidate under the SAME runtime, dependencies and commands when attributing the Bun/Nest import failures. A failure is not proven pre-existing merely because an earlier report called it a harness limitation. Publish pass/fail/skip separately and document any accepted exclusion explicitly.

Run focused behavioral tests, concurrency/failure tests, shared/frontend checks, firmware build and observer contract/privacy tests. Static grep checks remain supplementary. Run integration tests for the combined capability matrix, not only each lane in isolation.

Freeze a manifest containing source/tree, lockfiles, build tool versions, backend image identity/config/layer provenance, frontend bundle, firmware binary/ELF/font identities, collector identity, migration identity and evidence links. Validate digest format mechanically. Never guess missing characters.

Review the smallest COMPLETE SHA-bound package: changed paths, relevant caller/consumer contracts, reproduction results and prior review coverage. Reserve output budget for one terminal verdict. A delta review is valid only when its unchanged base has a documented adequate review, with cross-boundary changes included. Missing/truncated coverage is not PASS. Keep Grok 4.6; bound retries and fix transport/package failures rather than repeatedly rediscovering the whole repository.

Exit: adjudicated findings, exact candidate tests and fresh terminal Grok verdict. Prepare an activation request only after all blocking findings are closed or explicitly accepted by the operator.

## M08 — Controlled activation, only after explicit approval

Owner: Codex. Dependencies: M07 and separate exact operator authority.

Request distinct approvals for the exact application deployment, application-only firmware flash when needed, targeted BTC data application, and physical/ordinary Voice test. They may be presented in one package but are not interchangeable. This document grants none of them.

Before recreation, validate the fully resolved candidate Compose configuration, required non-secret key presence, protected mount mode, network and database continuity. This must happen before, not only after, replacing the application. Capture the known-good rollback identity. Do not log resolved secret values.

Deploy only the approved frozen artifact. Preserve MySQL, all unrelated data, pairing, network, provider/model/auth settings and private-data boundaries. For firmware, verify the actual partition layout, write only the approved app scope, and confirm the running app after boot. No blind reset/reflash loops or guessed offsets.

Qualify health, authenticated device path, runtime identities and actual end-to-end diagnostic capture before asking the operator to test. Apply the targeted BTC change only within its separate approval and state preconditions. Use the approved reversible rollback if activation fails.

Exit: activation receipts plus working diagnostic receipt; otherwise rollback or an exact named boundary. Health alone does not prove product acceptance.

## M09 — One useful physical window, not another blind repeat

Owner: operator with Codex observer. Dependencies: M08 and explicit test authority.

Present one short procedure tailored to the remaining hypotheses. Check existing Weather and monthly Calendar, the single weekly BTC tile, a minimal News regression and Outlook's explicit configured/unconfigured state. Use a known synthetic Japanese rendering fixture when an approved local path exists; do not depend on the model naturally emitting the missing character.

Include an ordinary Voice session only if explicitly authorized. Define its maximum turns/session duration, synthetic non-sensitive prompts and measured stages beforehand. Do not confuse this with an extra direct-provider qualification session. A short smoke test cannot alone close the historic multi-turn degradation issue; use host replay and a suitable single-session acceptance scope.

Bind observations to a capture ID and verified runtime identities. Distinguish a newly captured post-activation result from an old screenshot. Record only reported observations; unmentioned items remain UNKNOWN. Do not infer audio, exit, glyph or holiday PASS from silence.

Consume the attempt once, preserve passing components independently and resume safe diagnosis automatically. A failed or interrupted attempt is not permission for an immediate repeat. Require a changed hypothesis, corrected instrumentation or repaired candidate before proposing another physical window.

Exit: per-capability acceptance results and a supported earliest failure boundary, not just an aggregate PASS/FAIL.

## M10 — Close useful work and prepare restart/release records

Owner: Codex. Dependencies: relevant mission evidence.

Produce one completion matrix distinguishing shipped functionality, reviewed-but-undeployed work, known defects, optional setup and parked research. A safely displayed Outlook error is not Outlook feature completion. A reviewed observability patch is not Calendar/glyph repair acceptance. A BTC dry run is not the live one-tile result.

Keep C9 and C10 parked unless separately selected. Do not create C11/C12 to avoid idle time. Prepare release/merge planning only; do not merge, release or close PRs under this plan.

Each blocked mission must name the missing event/artifact, its producer, authorized action needed to produce it, and an executable next step. Do not wait for a marker that the running collector cannot receive. If all remaining work is genuinely gated, stop cleanly with one exact operator decision and a restart packet.

## 4. Efficiency and stop rules

Use one bounded implementation packet per mission; provide exact paths, failures and acceptance tests, not the entire historical campaign transcript. Reuse verified unchanged evidence by identity. Run focused tests during edits and full combined gates at freeze. Do not rebuild unchanged firmware for a backend-only edit, but rebuild/review all affected artifacts when shared dependencies change.

Commit meaningful tested work and frontier transitions. Avoid commits that only repeatedly restate an unchanged blocker or attempt self-referential CURRENT_HEAD corrections. Fetch/reconcile at entry, before integration/push and authority boundaries, not after every local thought or trivial test. On push conflict, preserve the worktree and reconcile without force-pushing.

Use a finite retry budget per failure fingerprint. Authentication/model/endpoint failure does not authorize a new account, key, billing action or fallback. If the designated writer is blocked, continue analysis/fixture planning in other lanes within controller authority, but do not disguise another implementation writer as a helper.

A report push, build PASS or review PASS is not an active-run stop when another authorized mission is runnable. A stop is valid when all remaining nodes are DONE/PARKED, genuinely externally blocked after bounded handling, awaiting precise authority, or blocked by a documented safety conflict. Do not manufacture work.

Before exit publish a compact table of mission ID, status, evidence level, source/artifact, blocker and next action, plus deduplicated READY, READONLY_READY, WAITING_AUTHORITY, WAITING_PHYSICAL and EXTERNAL_BLOCK counts. State what the operator must do NOW, separately from optional future choices.

## 5. Source index and technical cross-checks

Repository sources inspected at the report/candidate SHAs above:

- `docs/campaign-reports/CAMPAIGN-STATE.md` (top current frontier).
- `docs/campaign-reports/PORTFOLIO-C7-C8-ZAI-WRITER-CREDENTIAL-BINDING-RESULT.md`.
- `docs/campaign-reports/PORTFOLIO-LONGRUN-MULTICAMPAIGN-SCHEDULER.md`.
- `scripts/slate-m4-sanitized-observer-v2.py` (allowlists, prefilter, parser and main loop).
- `firmware/main/sync/sync_poll.cc` (BuildTelemetry, SyncOnce).
- `firmware/main/scenes/xiaozhi/xiaozhi_scene.cc` (glyph logging, initial and in-place bubble paths).
- `firmware/test/run_sanitized_frame_markers_test.sh`.
- `firmware/test/run_sanitized_voice_font_marker_test.sh`.
- `backend/src/modules/dynamic-content/dynamic-content.service.ts` (appendBtcTrio, append).
- `backend/src/modules/dynamic-content/providers/btc-price-trio.ts`.
- `backend/src/modules/dynamic-content/rendering/calendar-frame-renderer.ts`.
- `frontend/src/features/contents/components/cards/weather-lifecycle.ts`.
- `firmware/main/idf_component.yml` (LVGL manifest constraint ~9.5.0).

External primary-source cross-checks inform proposed diagnostics, not claims about the device's observed state: LVGL v9.5.0 `src/font/lv_font.c` distinguishes glyph descriptor resolution from bitmap retrieval; ESP-IDF v5.5.2 ESP32-S3 OTA documentation distinguishes running partition/application description from update/write operations. Verify the project's resolved lockfile version before implementation.
