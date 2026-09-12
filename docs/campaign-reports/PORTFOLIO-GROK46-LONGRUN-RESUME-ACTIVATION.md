# Slate Grok 4.6 decision-led longrun resume

Date: 2026-09-12 (Australia/Perth)
Status: CONTROL-PLANE CONTINUATION; NO PRODUCTION/FLASH/PHYSICAL AUTHORITY

## Live basis

This directive is bound to the live evidence-first frontier where PR #2 is at `bc76e0d6239ed235dde934ea221ce24551b1c4d3`, PRs #1/#2/#3/#4 are OPEN / DRAFT / UNMERGED, and the current result is `PORTFOLIO-C7-C8-EVIDENCE-FIRST-MULTIMISSION-RESULT.md`.

The latest result establishes:

```text
M00_STATUS=PASS_RECONCILED
M01_EXACT_PRODUCER_FIXTURE_CAPTURE=FAIL_CURRENT_COLLECTOR_DROPS_ALL_PRODUCER_MARKERS
M02_STATUS=SOURCE_DIAGNOSIS_COMPLETE_INSTRUMENTATION_DEPENDENT
M03_STATUS=SOURCE_FAILURE_BOUNDARY_PROVEN_RUNTIME_PROOF_PENDING
M04_STATUS=SOURCE_RACE_AND_FAILURE_ATOMICITY_GAP_PROVEN
M05_STATUS=HOST_REPLAY_PASS_100_TURNS_1000_PARTIALS
M06_STATUS=DETERMINISTIC_BASELINE_PASS_PHYSICAL_FIELDS_UNKNOWN
M07_STATUS=NOT_READY
ZAI_WRITER_STATUS=BLOCKED_ZAI_GLM_5_3_FLASH
ZAI_AUTH_FAILURE_BOUNDARY=AUTHENTICATION_BEFORE_MODEL_EXECUTION
PRODUCT_DEPLOYMENT=NONE
FIRMWARE_FLASH=NONE
PHYSICAL_TEST=NONE
```

Do not rerun M00 or re-prove F1/F4 merely to create another report. Preserve the historical Grok PASS for source `b235f67...` only as historical evidence; it is not acceptance of the future repaired candidate.

## Decision ownership

The operator has explicitly requested long multi-mission execution with Grok 4.6 making as many ordinary technical decisions as possible.

```text
TECHNICAL_DECISION_LEAD=grok -m grok-4.6
EXECUTION_CONTROLLER=CODEX_CLI
INTEGRATOR=CODEX_CLI
PREFERRED_IMPLEMENTATION_WRITER=Z.ai glm-5.3-flash
FINAL_REVIEWER=grok -m grok-4.6_IN_FRESH_CONTEXT
```

Grok should decide ordinary in-scope engineering questions rather than returning options to the operator: mission priority, hypothesis selection, repair architecture, affected-file scope, test design, bounded recovery, worktree concurrency, integration order, findings adjudication, candidate composition and technical readiness for an authority request.

Codex executes Grok decisions and must reject instructions that violate verified evidence, privacy, explicit requirements or authority boundaries. Feed the discrepancy back to Grok for a revised decision.

## Preferred-writer failure and proposed fallback

Z.ai remains preferred. One meaningful structural recovery may be attempted when new evidence changes the auth state. Do not tight-loop unchanged authentication failures.

A temporary Codex implementation-writer fallback is PROPOSED to prevent the preferred-writer authentication block from ending otherwise-authorized development. It becomes active only when the operator explicitly adopts it in the execution prompt. When adopted:

```text
TEMPORARY_IMPLEMENTATION_FALLBACK=CODEX
FALLBACK_TRIGGER=ZAI_GLM_5_3_FLASH_UNAVAILABLE_AFTER_ONE_MEANINGFUL_BOUNDED_RECOVERY
FALLBACK_ASSIGNMENT_REQUIRES=GROK_TECHNICAL_DECISION
SILENT_SUBSTITUTION=NO
```

No other provider/model/writer substitution is authorized.

## Long-run execution policy

A ten-minute elapsed interval, a report push, one test pass, one reproduced defect, one Grok decision, or preferred-writer failure is not a valid voluntary stop while an authorized executable mission remains.

Use the existing evidence-first missions M01-M07. At the start of each work packet, send Grok a compact SHA-bound decision packet with observed facts, unresolved uncertainties, runnable missions and hard authority limits. Grok returns one executable work package and one independent secondary package when safe parallelism exists. Codex executes without re-asking Grok for routine shell-level choices.

Reconsult Grok on materially new evidence, failed hypothesis, integration conflict, review finding or proposed portfolio stop.

Use at most two independent implementation worktrees and one integrator. Shared files have one owner. Serialize final integration and exact review.

## Required mission continuation

### M01 observer contract

Do not stop after reproducing zero captured events. Repair and behaviorally test producer -> prefilter/serial -> parser -> sanitized output. Version the structural schema. Require explicit missing-evidence classification. Test exact current producer fixtures, malformed values, fragmentation, duplication, reordering, interrupted capture, bounded output and privacy rejection.

### M04 BTC weekly-only safety

In parallel where paths permit, reproduce absent-weekly concurrency and replacement/render failure using an isolated database. Make one-weekly selection/mutation concurrency safe and failure atomic. Preserve unrelated content and a valid weekly record. Prepare a targeted reversible consolidation dry run only; do not mutate production.

### M02 Calendar/Weather

After or alongside the M01 contract work, add/tests for actual freshness/error lifecycle. Card ID equality is not image freshness. Test same card with newer image, stale cache, interrupted replacement, stale response ordering and Weather error -> success paths with changed and unchanged image bytes. Do not delete/recreate production cards.

### M03 glyph/runtime proof

Use the resolved LVGL version. Replace descriptor-dimension bitmap proxies with actual bitmap/resolved-font evidence. Cover initial bubble and in-place assistant updates. Use actual host layout/draw execution where supported. Bind binary/ELF/font/running-app identities distinctly. No device flash.

### M05/M06 regression

Reuse the existing 100-turn/1000-partial replay only for unchanged paths; rerun when affected code changes. Preserve the combined capability matrix and physical UNKNOWN/prior-failure fields. Outlook safe English error presentation is not connectivity acceptance.

### M07 integrated qualification

Restore locked dependencies in isolated worktrees as needed. Run focused behavioral tests plus complete combined gates. Compare alleged pre-existing failures under identical base/candidate conditions. Freeze exact source/artifact/collector/migration/toolchain identities. Run a fresh bounded Grok 4.6 review in a separate context. Missing/malformed/timeout verdict is not PASS. REVISE loops automatically through Grok adjudication -> assigned writer -> tests -> refreeze -> fresh review while safe work remains.

## Grok decision packets

Use the compact contract:

```text
DECISION_ID=
SOURCE_SHA=
MISSION_IDS=
OBSERVED_FACTS=
UNRESOLVED_UNCERTAINTIES=
AUTHORITY_LIMITS=
RUNNABLE_ACTIONS=
SELECTED_ACTION=
WRITER_ASSIGNMENT=
REQUIRED_TESTS=
SECONDARY_PARALLEL_ACTION=
STOP_CONDITION=
```

Do not ask Grok to approve each command. Ask for coherent work packages.

## Authority boundaries

This control-plane plan does NOT authorize:

- production deploy/restart;
- firmware flash/reset/re-pair/Wi-Fi changes;
- production BTC consolidation/data mutation;
- physical NOTE4 retesting;
- new Gemini/provider qualification sessions;
- Microsoft OAuth/consent/private Outlook access;
- new credentials/accounts/billing;
- C9 activation;
- C10 deployment;
- merge/release.

After M07 terminal PASS, prepare the smallest exact approval package with separately stated scopes for application deployment, app-only firmware flash if required, targeted BTC production consolidation, and one later bounded physical/ordinary Voice acceptance. Do not execute those scopes without explicit authority.

## Voluntary stop audit

Before a voluntary stop, Grok audits every unfinished M01-M07 mission and chooses CONTINUE with an executable task or STOP with a legitimate reason. Valid STOP reasons are: exact human authority boundary; all remaining nodes externally blocked after permitted bounded recovery and no fallback; safety/privacy/data-integrity conflict; operator cancellation; or actual account/execution limits.

If Grok itself is temporarily unavailable, Codex may finish already-decided safe actions and evidence gathering but must not invent a Grok decision or final verdict.

Before exit publish a compact mission ledger, actual changes/tests, active writer attribution, last Grok decision, deduplicated counts, exact current blocker, operator action required NOW, terminal reason and restart packet. Keep PRs #1-#4 OPEN / DRAFT / UNMERGED.
