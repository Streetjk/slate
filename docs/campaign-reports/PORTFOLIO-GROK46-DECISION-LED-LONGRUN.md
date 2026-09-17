# Slate: Grok 4.6 decision-led multi-mission execution

Date: 2026-09-12
Basis: PR #2 head bc76e0d6239ed235dde934ea221ce24551b1c4d3.

## Activation and scope

The operator requested a long multi-campaign instruction with Grok 4.6 making as many decisions as possible, and reported that the previous session lasted about ten minutes.

Technical-decision delegation to Grok is the requested direction. This document includes a PROPOSED explicit exception to the previous Z.ai-only implementation rule: Grok may assign Codex as a temporary implementation writer if the existing Z.ai route fails. That writer exception takes effect only when the operator explicitly adopts it, including by submitting the accompanying activation prompt. Merely encountering this file does not grant the writer exception. Until adoption, preserve the existing exclusive writer rule and state the exact unresolved approval rather than silently substituting.

This plan does not authorize production deployment/restart, firmware flash/reset, production BTC data changes, physical testing, additional Gemini qualification sessions, OAuth/consent, new provider credentials/accounts, billing, private-data expansion, merge or release. Technical delegation is not authority to cross those boundaries. Existing explicitly granted permissions remain valid only for their exact scope, artifact and budget; do not reactivate consumed approvals.

Use the existing M00-M10 plan in `PORTFOLIO-C7-C8-EVIDENCE-FIRST-MULTIMISSION-PLAN.md`. This document changes decision ownership and execution resilience; it does not create C11/C12 or reopen parked research.

## 1. Source-supported checkpoint

Read `PORTFOLIO-C7-C8-EVIDENCE-FIRST-MULTIMISSION-RESULT.md` and the top current section of `CAMPAIGN-STATE.md` at the actual live head before executing.

The latest result records:

- M00 reconciliation completed.
- M01 reproduced the collector defect: all seven exact producer fixtures returned no events, despite the collector's old self-test passing.
- The new designated Z.ai invocation failed before implementation with an unresolved authentication/source-loading rejection. It is later than the previous successful binding report; preserve both observations without declaring either universally current.
- M02 same-ID/changed-image and Weather error-to-success tests were NOT RUN.
- M03 actual bitmap retrieval is NOT IMPLEMENTED; runtime/update-path proof remains pending.
- M04 real isolated-database concurrency and render-interruption tests were NOT RUN.
- M05 host replay reports 100 simulated turns and 1,000 partials with final operation/microphone queues zero. This is not a physical/provider/optical latency acceptance.
- M06 reports 90 targeted backend/shared tests and 16 shared/frontend fixtures passing, plus an existing format failure and synthetic secret-scan pattern matches requiring accurate classification.
- M07 is NOT READY; no fresh Grok review of a repaired combined candidate occurred.
- The new commit changed only reports/state, not product bytes. Historical b235f67 remains the implementation baseline, not a newly accepted activation candidate.

The report supports an authentication/policy stop. It does not demonstrate a platform-imposed ten-minute limit, prove that authentication will recover by waiting, or prove that all planned behavioral tests have been completed.

## 2. Roles and delegated technical decisions

After operator adoption:

```text
TECHNICAL_DECISION_LEAD=grok -m grok-4.6
EXECUTION_CONTROLLER=CODEX_CLI
INTEGRATOR=CODEX_CLI
PREFERRED_IMPLEMENTATION_WRITER=Z.ai glm-5.3-flash
TEMPORARY_IMPLEMENTATION_FALLBACK=CODEX_ONLY_WHEN_GROK_ASSIGNMENT_AND_OPERATOR_EXCEPTION_ARE_PRESENT
FINAL_REVIEWER=grok -m grok-4.6_IN_FRESH_REVIEW_CONTEXT
SILENT_SUBSTITUTION=NO
```

Grok owns ordinary in-scope engineering decisions: prioritization, mission decomposition, diagnostic hypothesis selection, reproduction design, repair design, affected-file scope, fixture/test strategy, local sandbox setup choices, dependency ordering, implementation assignment under the adopted writer rule, findings adjudication, bounded technical recovery, candidate composition, and technical readiness for an approval request.

Grok may choose among safe alternatives instead of sending an options list to the operator. It may create necessary SUBTASKS of existing missions, not unrelated product scope. It may select a simpler repair or conclude that a suspected finding is unsupported, but must attach evidence. It cannot waive a known blocking security/data-integrity finding, weaken user acceptance requirements merely to get PASS, fabricate observations, or approve live operations outside the operator envelope.

Codex collects evidence, invokes Grok, executes the selected plan, coordinates writers, runs tools/tests, integrates and publishes. It does not routinely substitute its architectural preference or ask the operator to decide the same technical issue again. It MUST refuse an action that violates permissions, privacy, explicit requirements or mechanical safety; it also flags contradictions with verified evidence. Return that discrepancy to Grok with the smallest necessary evidence packet for revision. Do not execute a known erroneous instruction solely because Grok selected it.

Grok is the decision lead and final review model. Use a separate clean-context final review with the candidate, requirements, failing tests and changed contracts, not instructions to ratify the decision lead. Do not describe these as independent model families: separate context reduces continuity/anchoring, but both roles still use Grok 4.6. Keep code writing primarily with the designated implementation role.

## 3. Decision packets, not constant approval conversations

For each material decision, give Grok a bounded SHA-bound packet:

```text
DECISION_ID=
MISSION_IDS=
SOURCE_SHA=
OBSERVED_FACTS=
UNCERTAINTIES=
HARD_CONSTRAINTS=
AVAILABLE_SAFE_ACTIONS=
TESTS_ALREADY_RUN=
DECISION_REQUIRED=
```

Request a concrete response containing:

```text
DECISION_STATUS=DECIDED|NEEDS_EVIDENCE|BLOCKED_AUTHORITY
SELECTED_ACTION=
TECHNICAL_REASON=
WRITER_ASSIGNMENT=
ALLOWED_FILE_SCOPE=
REQUIRED_REPRODUCER=
ACCEPTANCE_TESTS=
DEPENDENCIES=
NEXT_SAFE_ACTION=
STOP_CONDITION=
```

This is a desired output contract, not an assertion that an existing harness already parses it. Use the current supported invocation route; do not invent CLI flags. Preserve the final-review parser separately. Validate any machine-consumed decision contract before dispatching actions.

Batch linked decisions once per mission/repair boundary. Grok need not decide each shell command or formatting change separately. Under a recorded plan, Codex executes routine steps without another model round trip. Ask Grok again for genuinely new evidence, a failed hypothesis, a material integration conflict, or a review finding requiring a choice.

A decision must lead directly to the named executable action. `NEEDS_EVIDENCE` must name an achievable evidence-producing task, owner and permission class. `BLOCKED_AUTHORITY` must identify the specific missing approval. A generic 'need more information' is not a valid handoff.

## 4. Eliminate the single-writer failure stop

When the operator adopts the proposed exception, Z.ai remains PREFERRED, not an absolute prerequisite for every patch.

On first needing a writer, reconcile the last successful and latest failed launcher identities. Inspect only non-secret route/profile names, environment-variable names/presence, existing source path class, endpoint/model binding, process reload behavior and working-directory/session context. Do not infer a loaded valid credential from `ENV_PRESENT=YES`. Never print, hash, fingerprint, copy to reports, or persist credential values or raw auth responses.

A targeted reload of only the already-authorized writer/client context is permissible within existing local recovery scope. No Slate/MySQL/device/network restart. Do not blindly rotate keys or change endpoint/provider/account/billing.

Use at most one fresh exact-model probe after meaningful local binding/reload correction. If the latest failure is already conclusive and nothing changed, reuse that evidence rather than burn another identical probe. Grok chooses whether there is a justified recovery action or whether to assign Codex now.

If Z.ai still fails, Grok records:

```text
PREFERRED_WRITER_STATUS=UNAVAILABLE
WRITER_ASSIGNMENT=CODEX_TEMPORARY_FALLBACK
FALLBACK_AUTHORITY=OPERATOR_ADOPTED_EXCEPTION
REASON=EXACT_EXISTING_ZAI_ROUTE_FAILED
SCOPE=EXISTING_M00_M07_DEVELOPMENT_TASKS
```

Then Codex implements under Grok's technical decision and the same tests/review gates, without asking the operator again. This fallback uses the existing active Codex environment; it does not add an external provider account, introduce billing, select another Grok/GLM model, or open a new secret route.

Record attribution per work packet. Do not claim Codex-authored code came from Z.ai. Do not repeatedly retry Z.ai or switch writers every mission; keep the assigned route until a meaningful recovery or milestone makes a switch useful. If the exception is not adopted, do not use the fallback; report that exact policy boundary.

## 5. Continuous execution contract

The completion target is a behaviorally qualified M01-M07 development candidate, not one attempted writer call, one report or a minimum elapsed time. Plan a multi-hour batch when enough useful work exists, but do not fabricate hours, add sleep loops or create busywork. There is no arbitrary ten-minute milestone handoff.

Use at most two independent implementation worktrees and one integrator. Protect shared files with explicit ownership; serialize integration and exact candidate review. Grok may reduce concurrency when changes overlap. Do not build another orchestration framework just to run these missions.

Within the active controller session:

1. Reconcile live sources, permissions and unfinished missions.
2. Obtain Grok's first technical decision and writer assignment.
3. Immediately execute the selected work packet.
4. Test and feed actual new failures/results back to Grok.
5. Integrate completed, compatible work.
6. Continue another runnable mission whenever one reaches a local block.
7. Publish meaningful durable checkpoints WITHOUT ending the run.
8. Run final combined qualification/review when the selected candidate is complete.
9. Stop only at a valid terminal condition with a precise restart packet.

A checkpoint, report, source-inspection completion, fixture reproduction, successful build, initial review REVISE or preferred-writer failure is not by itself a portfolio stop.

For a long-running local build/test still making measurable progress, monitor the existing process instead of killing it solely to return a routine chat update. Respect actual tool/runtime limits. If the environment forcibly ends the session, save the exact task, process state, worktree and resume instruction where possible; do not claim it will continue unattended. This instruction creates no background daemon, recurring automation or cloud runner.

## 6. Execute the existing missions to concrete outputs

### M00 — reconcile and appoint Grok

Reuse the completed reconciliation if source identity still matches. Preserve previous review records and physical failures. Do not spend the run rewriting historical directives. Ask Grok to choose the first repair sequence and, when applicable, the implementation fallback.

Output: compact current ledger and a DECIDED first action, followed immediately by execution.

### M01 — first executable repair: collector contract

The report already reproduced the defect; do not stop after proving it again. Patch the actual producer-to-collector path to accept the fixed structural schema while rejecting raw/private data. Include backend prefilters, serial parser, browser evidence path where relevant, output transport and terminal capture accounting.

Turn all seven exact producer fixtures from zero events into the expected structured events. Persist the regression tests in the repository. Test malformed/fragmented/duplicate/reordered records, stale schema versions, bounded buffers, loss/drop accounting, timeout/disconnect and absent required stages. A successful old self-test must not override a failed producer fixture.

Output: working code and executable tests, not only a proposed observability design.

### M04 — independent BTC safety lane

This need not wait for physical devices or a completed collector. Grok selects a transaction/serialization design after reproducing the absent-Weekly concurrency case and delete-before-replacement failure.

Use an isolated local database of the repository's relevant engine and prove it is not production. No production volumes or real account data. Test concurrent first requests, existing Daily/Monthly state, duplicate Weekly state, missing/invalid configs, replacement-render failure, cancellation, retries, ordering and manifest integrity. Do not hold DB locks across an external market fetch to fake safety; use fixtures.

Target: one visible BTC/USD Weekly tile, seven days, hourly granularity, at most 168 points. Preserve an existing valid Weekly card. Make the production consolidation plan targeted and reversible; preparing it is development, applying it remains gated. No claim that deployment alone removes existing records.

Output: repair, real behavioral tests and migration dry run with state/count preconditions.

### M02 — Calendar/Weather independent behavior and then integration

Develop standalone freshness and lifecycle tests even if M01 is still underway; only end-to-end capture integration depends on the collector. Grok chooses the smallest observable state comparison that answers the actual hypothesis.

Calendar must distinguish same record ID from current image/content version. Test same-ID/new-image, cache-metadata versus actual-byte mismatch, interrupted image replacement, old response ordering, missing cached image and active-frame handoff. Keep en-AU, Australia/Perth and the existing reviewed WA holiday scope. Preserve the card identity.

Weather must distinguish authoritative stored error, last render outcome, serialized API state and frontend cache state. Test error-to-success for changed AND unchanged images; an absent diagnostic value remains UNKNOWN. Existing authorized read-only structural queries may avoid firmware work; do not log private payloads or recreate cards.

Output: actionable freshness/error checks, their integration with M01 and only evidence-justified repairs.

### M03 — actual glyph and artifact proof

Use the locked LVGL dependency and real glyph/bitmap APIs. Bounding-box dimensions are not bitmap proof. Test resolved font, fallback/placeholder state, legitimate zero-area whitespace and following-character context where required. Cover initial bubble AND in-place updates when a later partial introduces the problem character.

Use `曇り時々雨`, hiragana, katakana, punctuation, `の` and a deliberately unsupported codepoint as synthetic fixtures. Do not pretend the historic photo proves the upstream codepoint. Execute real host LVGL layout/draw when feasible; preserve narrower status if it is not executable.

Bound diagnostic work and output. Verify the marker measures the active label font rather than a hard-coded description. Prepare correct running-partition/app identity measurement without equating binary SHA with ELF SHA. Build in isolation; no flashing or reset.

Output: glyph behavior tests, bounded diagnostic code and qualified artifact identity checks.

### M05 — preserve and extend the existing replay

Reuse the recorded 100-turn/1,000-partial result only for the unchanged baseline. Persist reproducible commands/fixtures and rerun on the candidate when related queues, text updates or diagnostics change.

Exercise latency attribution, cancellation, reconnect, stale generation, queues and post-warmup resource trends. Host replay is not optical/device/provider acceptance. No new live Gemini session.

Output: reproducible candidate regression evidence, with measurement scope and limitations.

### M06 — integration and test hygiene

Cover Calendar, WA holidays, Weather/icons/errors, Google News AU/TW/Both, Outlook error presentation, BTC Weekly and Voice/glyph contracts. Preserve the operator's partial News success; do not invent unobserved mode or physical passes. Outlook remains connectivity-unconfigured, regardless of its improved English error.

Resolve the existing touched-file format failure in the development branch if safe; no repository-wide formatting churn. Classify synthetic secret-scan hits using narrow documented fixture exceptions without weakening real secret detection or printing candidates. Compare alleged baseline failures under identical runtime/dependency/command conditions. Test dependencies can be restored in a clean isolated worktree without waiting for production activation.

Output: combined capability matrix and reproducible pass/fail/skip results.

### M07 — exact candidate and independent-context review

Bind source/tree, lockfiles, test commands/results, backend/frontend artifacts, firmware binary/ELF/font, collector and migration identities. Check producer and consumer coverage together. Static grep tests remain supplementary, not behavioral proof.

Grok as technical lead selects the complete review scope. A fresh Grok 4.6 reviewer independently assesses the candidate against the operator requirements and F1-F5 evidence. Do not preload instructions that the lead's decisions must be accepted. Keep required context, even while minimizing unchanged history.

Use the existing supported bounded review harness, reserve terminal output, and preserve fail-closed parsing. A timed-out/malformed/incomplete verdict is not PASS. Review REVISE returns to Grok-led repair/retest/refreeze without routine operator intervention. Do not waive unresolved blocking P0/P1/P2/security/data-integrity findings.

Output: new exact candidate with current tests and terminal review, or precise outstanding evidence/authority. Historical b235f67 PASS is not current M07 acceptance.

## 7. Failure handling and budget discipline

Differentiate authentication failure, model/endpoint mismatch, transport failure, tool deadline, reviewer output-format failure, and a genuine code finding. Do not label every failed model invocation a provider outage.

Grok chooses bounded recovery based on evidence. For an unchanged rejected credential, do not retry. For a transient transport failure, allow at most one controlled retry after checking local conditions; after repeated identical failures, stop that lane. For an oversized/ineffective review packet, repair the local packet/harness first, retaining necessary coverage rather than repeatedly increasing limits.

Use existing development accounts and their remaining allowances. No invented unlimited dollar/token budget or new billing. Record model requests/retries and actual usage only when surfaced by the tool. Batch decisions and reuse SHA-bound evidence. Do not force Grok to approve every command.

If Grok itself is unavailable, Codex may complete actions already selected in a valid standing decision packet and run non-decision evidence gathering within authority. It must not invent a Grok decision, silently replace Grok, or pass a review. If no such work remains, return the exact external block. If account reconnection/approval is explicitly required, stop that route and request it; do not bypass authorization.

## 8. Terminal conditions and exact next authority

A legitimate completion/stop is one of:

- M01-M07 are qualified and the only remaining action is specific production/flash/data/test authority.
- Every unfinished mission is genuinely blocked after authorized recovery/fallback, and no safe pre-decided work remains.
- A concrete safety/privacy/data-integrity conflict prevents execution.
- The operator cancels, actual account budget is exhausted, or the execution environment imposes a hard limit.

Before voluntarily ending early, have Grok audit the mission ledger and choose CONTINUE with an actual task or STOP with one of these reasons. Do not require a functioning Grok request to safely stop a dangerous operation or respond to forced termination; report that exception honestly.

In particular, a stop is not justified solely by ten minutes elapsed, a report being pushed, Z.ai failing when the fallback has been adopted, or a fixture being reproduced while its repair is still authorized.

Prepare M08/M09 authority as distinct scopes: exact application activation, exact app-only flash if needed, targeted BTC consolidation, then a bounded physical/ordinary Voice test. Never execute these from a technical-readiness verdict alone. Keep old physical attempts consumed. No change to production model/auth, Microsoft OAuth, private Calendar semantics or unrelated device state.

C9 and C10 remain PARKED; all PRs remain OPEN / DRAFT / UNMERGED. M10 may prepare release/closure records but cannot merge/release.

## 9. Reporting without turning reports into the work

Reuse the existing mission report/frontier rather than generating a new strategy document after each command. Persist tests and implementation first; checkpoint meaningful state transitions. Fetch live state at entry, before integration/push and approval boundaries, not repeatedly after trivial local operations. Never force-push over concurrent work.

Record:

```text
LIVE_HEAD_AT_ENTRY=
CURRENT_PRODUCT_SOURCE=
TECHNICAL_DECISION_LEAD=GROK_4_6
LAST_GROK_DECISION_ID=
WRITER_EXCEPTION_ADOPTED=
ACTIVE_IMPLEMENTATION_WRITER=
FALLBACK_USED_AND_REASON=
MISSION_STATUS_TABLE=
SOURCE_AND_TEST_FILES_CHANGED=
BEHAVIORAL_TESTS_PASS_FAIL_SKIP=
UNRESOLVED_FINDINGS=
READY_COUNT=
READONLY_READY_COUNT=
BLOCKED_DEPENDENCY_COUNT=
WAITING_AUTHORITY_COUNT=
WAITING_PHYSICAL_COUNT=
EXTERNAL_BLOCK_COUNT=
HUMAN_ACTION_REQUIRED_NOW=
EXACT_HUMAN_ACTION=
GROK_CONTINUATION_OR_STOP_DECISION=
TERMINAL_REASON=
RESUME_PACKET=
```

Deduplicate shared blockers. Do not claim `HUMAN_ACTION_REQUIRED=NO` while simultaneously relying on a credential renewal or policy exception only the operator can supply. Keep prospective setup optional, rather than making every parked lane a mandatory human gate.

Success is an implemented, tested, reviewed candidate and an informative next physical window—not an artificially long session or a growing stack of unchanged reports.
