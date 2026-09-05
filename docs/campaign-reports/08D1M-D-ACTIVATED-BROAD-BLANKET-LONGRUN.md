# Campaign 8D1M-D — ACTIVATED Broad-Blanket Long-Run Validation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Activation basis: explicit human request to reduce stop frequency and use a broader blanket validation method.

## Authority

```text
DIRECTIVE_STATE=ACTIVATED
LONGRUN_DEFAULT=YES
STOP_BETWEEN_AUTHORIZED_STAGES=NO
PROVIDER_POOL_MAX=2_SESSIONS_TOTAL
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_AFTER_D1_PASS
PRODUCTION_RESTART_AUTHORIZED=YES_WITHIN_D2_ONLY
AUTO_ROLLBACK_ON_D2_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_D2_PASS=YES_IF_HEALTH_GREEN
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PRIVATE_DATA_AUTHORIZED=NO
BILLING_OR_VERTEX_CHANGE_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This activation supersedes the earlier `PROPOSED_NOT_AUTHORIZED` state for 8D1M-D only. It does not expand into physical NOTE4 use, firmware, private data, billing/Vertex changes, credential replacement, Calendar writes, destructive host/database work, or PR merge.

## Exact pins

```text
SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
SDK=2.20.0
SEARCH_ENABLED=NO
TOOLS_INVOCATION_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
GENERATED_AUDIO_RETENTION=NO
```

Documentation/report-only commits do not invalidate the source pin. Any tracked product/runtime source change or materially different deployment image invalidates the live/deployment authorization pin; in that case continue all zero-provider repair/requalification/review work autonomously, then stop only when a newly pinned artifact requires fresh human live/deployment authority.

## Broad-blanket test method

Use fewer provider sessions but extract substantially more evidence from each session.

Each authorized live session may contain a bounded synthetic multi-turn matrix instead of a single `TEST` turn. The goal is to validate lifecycle stability, turn reset behavior, English/Japanese handling, model-output observation, and turn-completion semantics in one session.

Use exactly these synthetic turns unless current deterministic harness limitations make one unsafe; if one cannot be executed safely, record why and continue with the remaining turns without creating a human gate:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

For every turn capture only payload-free structural telemetry:

- model turn seen;
- model turn part count;
- text part seen boolean;
- inline-data/audio part seen boolean;
- output-transcription seen boolean;
- generation-complete seen boolean;
- turn-complete seen boolean;
- provider error/close seen boolean;
- relative timings;
- accepted model-output predicate result.

Do not retain model text, audio, transcriptions, raw provider frames, or private data.

A provider session counts as PASS only if the existing accepted AUDIO-output model-event predicate and turn-complete semantics pass for every executed matrix turn. Do not weaken the acceptance predicate merely to obtain a pass.

## D0 — reconcile, do not stop

D0 is already PASS. Reconcile current branch, exact pins, rollback health, protected credential metadata/mount boundary, and runner availability. Do not rerun expensive work without cause. A clean D0 reconciliation is a checkpoint, not a handoff.

## D1 — exact-image non-production broad session

Consume at most one provider session using the exact candidate image/source in explicit non-production mode with the synthetic matrix above.

Required controls:

- protected Gemini credential read only via approved runtime mount;
- no production `.env` read;
- Search off;
- no Calendar/Outlook/private payload;
- no microphone;
- no retained generated audio;
- content-free structural telemetry only.

### D1 PASS path

Publish/verify the D1 checkpoint, then continue directly into D2. Do not return control merely because D1 passed or because deployment is next; D2 is preauthorized by this activation.

### D1 FAIL/AMBIGUOUS path

Do not immediately return. Automatically exhaust zero-provider diagnosis under `AUTONOMY-AND-HUMAN-GATE-POLICY.md`:

1. preserve sanitized evidence and exact call accounting;
2. reconstruct event/timing state;
3. inspect runner/bridge/SDK/image lineage;
4. provider-disabled reproductions and structural matrix;
5. bounded harness/observability/timeout fixes when deterministic evidence justifies them;
6. full deterministic/ARM64 requalification as relevant;
7. exact GLM-5.3 reviewer route for tracked product/runtime changes;
8. report/commit/push/fetch/verify.

If the failure is proven to be harness/runner-only and the exact product/runtime source plus candidate image remain semantically unchanged, the remaining second provider session may be used for one corrected D1 revalidation instead of D2. No blind retry.

If tracked product/runtime source or deployment image changes, do not use the remaining provider session against the old pin. Fully qualify the new artifact, publish, then stop for fresh pin authorization.

If D1 fails for a real provider/product reason and cannot be closed without another call, stop only after all safe zero-provider work is exhausted.

## D2 — exact candidate production deploy + broad synthetic session

Run only if D1 passes on the accepted pins.

Before mutation:

- verify rollback image exists and matches the pinned digest;
- verify Slate/MySQL health;
- verify current production state and record it without reading secret values;
- verify the candidate digest exactly;
- publish/verify the pre-mutation checkpoint, then continue automatically.

Deploy/restart production using only the exact accepted candidate image/source and already-reviewed production Node-bridge/Developer-API opt-ins. Mount the existing protected Gemini credential read-only. Keep the Node bridge private.

After health is green, consume exactly one provider session using the same synthetic multi-turn matrix and same acceptance predicate/structural telemetry as D1.

### D2 PASS path

If all executed turns pass and production health remains green:

- keep the candidate deployed;
- verify Slate/MySQL/local/public health;
- verify protected secret mount is read-only and no credential value was exposed;
- publish the complete D3 dossier;
- continue every safe deterministic/read-only post-deploy verification already in scope;
- stop only at the next genuinely new boundary, expected to be physical NOTE4/private-microphone/firmware/merge authority.

### D2 FAIL/AMBIGUOUS path

Immediately rollback to the pinned rollback image, verify Slate/MySQL/local/public health, remove candidate-only secret mount/config if applicable, preserve sanitized structural evidence, then automatically perform all safe zero-provider forensic work before returning.

No production retry after D2 failure within this activation.

## Provider pool accounting

```text
TOTAL_PROVIDER_SESSION_POOL=2
D1_PRIMARY_MAX=1
D2_PRIMARY_MAX=1_IF_D1_PASS
ALTERNATE_SECOND_SESSION=ONE_CORRECTED_D1_ONLY_IF_D1_FAILURE_IS_DETERMINISTIC_HARNESS_ONLY_AND_ARTIFACT_PIN_UNCHANGED
BLIND_RETRY=NO
PROVIDER_POOL_EXPANSION=NO_WITHOUT_NEW_HUMAN_AUTHORITY
```

Historical pools remain immutable and are not reused.

## Non-stopping work

Do not return control for:

- report/state/checkpoint pushes;
- deterministic tests or reruns;
- ARM64 builds/provider-disabled replay;
- exact reviewer retries;
- bounded repairs inside authorized scope;
- recoverable Docker/SSH/container work;
- read-only production health inspection;
- source/image/SDK reconciliation;
- zero-provider forensics after a failed live attempt;
- successful transition D1 -> D2;
- D3 publication.

`REPORT-PUSH-INVARIANT.md` remains binding, but checkpoint publication is not a handoff.

## True stop conditions

Stop only when one of these is actually reached:

1. the 2-session provider pool is exhausted and another live session is genuinely required;
2. tracked product/runtime source or exact deployment artifact changed, invalidating the live/deploy pin, after full autonomous requalification is complete;
3. a new credential must be created/replaced/migrated/recovered interactively;
4. billing/tier/Vertex/provider-account policy must change;
5. private NOTE4/Outlook/Calendar/microphone data use is required;
6. physical NOTE4 interaction or firmware flashing is required;
7. destructive host/storage/database work outside disposable state is required;
8. unresolved P0/P1 or credible security/privacy/data-integrity issue remains after bounded recovery;
9. PR merge/release/publication is required.

## Reporting

Update both the main report and `CAMPAIGN-STATE.md` at every meaningful live/deploy/failure/terminal checkpoint. Secret-safe check, commit, push, fetch/verify exact remote SHA, verify PR #2 remains open/draft/unmerged, then continue automatically if the next action remains authorized.

Final expected terminal state on success:

```text
D1_RESULT=PASS
D2_RESULT=PASS
PROVIDER_SESSIONS_USED=2_OF_2
PRODUCTION_CANDIDATE_DEPLOYED=YES
PRODUCTION_HEALTH=PASS
ROLLBACK_AVAILABLE=YES
READY_FOR_PHYSICAL_NOTE4_DECISION=YES
PR2_STATE=open_draft_unmerged
```

## D1 failure checkpoint

The first and only D1 provider session returned a sanitized structural failure
on `TURN_1_EN`: output transcription, generation completion, and turn
completion were observed, but the accepted `modelTurn` predicate was not.
The durable result was recovered independently from the launcher/container
lifetime. No raw provider payload, generated audio, credential value, private
data, tool call, or Search request was retained or sent.

```text
D1_RESULT=FAIL
D1_FAILURE_CLASS=MODEL_EVENT_MISSING_WITH_TURN_COMPLETE
D1_MODEL_TURN_SEEN=NO
D1_OUTPUT_TRANSCRIPTION_SEEN=YES
D1_GENERATION_COMPLETE_SEEN=YES
D1_TURN_COMPLETE_SEEN=YES
D1_TOOL_INVOCATIONS=0
D1_PROVIDER_ERROR_SEEN=NO
D1_PROVIDER_CLOSE_SEEN=NO
D1_PROVIDER_SESSIONS_USED=1_OF_2
D2_RESULT=NOT_RUN_D1_FAILED
D2_PRODUCTION_MUTATION=NO
D1_RESULT_DURABLY_RECOVERED=YES
D1_RAW_PROVIDER_PAYLOAD_RETAINED=NO
D1_CREDENTIAL_VALUE_CAPTURED=NO
D1_PRIVATE_DATA_SENT=NO
D1_SEARCH_EXECUTED=NO
D1_GENERATED_AUDIO_RETAINED=NO
ZERO_PROVIDER_FORENSICS=REQUIRED
```

Under the reduced-stop policy, zero-provider forensic, deterministic
requalification, and any justified exact-route review work continues before
returning control. D2 remains unstarted unless a harness-only defect is proven
without changing the exact source/image authorization pin.

## D1 zero-provider forensic closure and human boundary

The authorized zero-provider work is complete. Focused assistant/shared
regression passed, the exact ARM64 provider-disabled replay passed, and the
remaining deterministic gates passed. The full-repository failures are the
known host/candidate Bun Nest controller-loader baseline and did not identify
a tracked product/runtime defect. No harness-only defect was proven, so the
remaining provider session is not eligible for an automatic retry and D2 is
not authorized by the failed D1 path.

```text
D1_ZERO_PROVIDER_FORENSICS=PASS
FOCUSED_ASSISTANT_SHARED_REGRESSION=PASS_85_TESTS_5_EXPECTED_SYNTHETIC_SKIPS
EXACT_ARM64_PROVIDER_DISABLED_REPLAY=PASS_6_TESTS
NODE_BRIDGE_SYNTAX=PASS
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
FULL_REPO_TESTS=BASELINE_BUN_NEST_CONTROLLER_LOADER_LIMITATION_4_FAILURES_5_ERRORS
SOURCE_DIFF_FROM_PIN=REPORT_ONLY
PRODUCT_SOURCE_CHANGED=NO
HARNESS_ONLY_DEFECT_PROVEN=NO
GLM53_REVIEW=NOT_REQUIRED_NO_TRACKED_PRODUCT_RUNTIME_CHANGE
D1_PROVIDER_SESSIONS_USED=1_OF_2
SECOND_PROVIDER_SESSION=NOT_USED
D2_RESULT=NOT_RUN_D1_FAILED
D2_PRODUCTION_MUTATION=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
READY_FOR_NEW_PROVIDER_AUTHORIZATION=YES
```

This is the retained human boundary for a new provider strategy/session.
There was no second provider call, no production mutation, no physical NOTE4
test, no firmware action, and no private data use.
