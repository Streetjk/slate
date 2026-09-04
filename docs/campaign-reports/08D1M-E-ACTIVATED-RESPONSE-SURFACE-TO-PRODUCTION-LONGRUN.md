# Campaign 8D1M-E — ACTIVATED Response-Surface Differential to Production Long Run

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Activation basis: standing human instruction to reduce repeated stops, use broader blanket testing, and continue from the latest report with the next long-running instruction.

## Starting state

```text
PR_HEAD_BEFORE_E=7782cff1691be021dbab4a27440df49eec097c56
D1_RESULT=FAIL
D1_FAILURE_CLASS=MODEL_EVENT_MISSING_WITH_TURN_COMPLETE
D1_MODEL_TURN_SEEN=NO
D1_OUTPUT_TRANSCRIPTION_SEEN=YES
D1_GENERATION_COMPLETE_SEEN=YES
D1_TURN_COMPLETE_SEEN=YES
D1_PROVIDER_ERROR_SEEN=NO
D1_PROVIDER_CLOSE_SEEN=NO
D1_PROVIDER_SESSIONS_USED=1_OF_2
D1_ZERO_PROVIDER_FORENSICS=PASS
HARNESS_ONLY_DEFECT_PROVEN=NO
PRODUCT_SOURCE_CHANGED=NO
D2_RESULT=NOT_RUN_D1_FAILED
PRODUCTION_CHANGED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
```

Accepted starting product/runtime source and artifact:

```text
START_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
START_ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
SDK=2.20.0
```

The D1 result proves provider connectivity and lifecycle progress but does not prove usable audio delivery through Slate. Output transcription is not a substitute for audio bytes. Do not weaken the audio-output acceptance gate merely because transcription and turn completion were observed.

## Current official SDK/API evidence to verify before live execution

Refresh current official Google documentation immediately before the live diagnostic and record only the resulting semantic conclusions in the report. Current evidence at activation time is:

- `LiveServerContent.outputTranscription` is independent of `modelTurn`; ordering is not guaranteed.
- `LiveServerMessage.data` is an SDK accessor that returns concatenated inline-data payload when present.
- official JavaScript Live examples receive audio from `serverContent.modelTurn.parts[].inlineData`.
- both realtime text input and client-content text input surfaces exist in the SDK; do not assume they are behaviorally identical for this model without evidence.

If official semantics materially changed, adapt the diagnostic mechanically but remain within this campaign's privacy/provider ceilings.

## Authority and long-run rule

```text
DIRECTIVE_STATE=ACTIVATED
LONGRUN_DEFAULT=YES
CHECKPOINT_IS_NOT_HANDOFF=YES
STOP_BETWEEN_AUTHORIZED_STAGES=NO
FUTURE_PROVIDER_SESSIONS_MAX_FROM_THIS_CHECKPOINT=3
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_AFTER_CORRECTED_NONPROD_PASS
PRODUCTION_RESTART_AUTHORIZED=YES_WITHIN_E3_ONLY
AUTO_ROLLBACK_ON_E3_FAILURE=YES
LEAVE_CORRECTED_CANDIDATE_DEPLOYED_ON_E3_PASS=YES_IF_HEALTH_GREEN
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
PRIVATE_DATA_AUTHORIZED=NO
TOOLS_INVOCATION_AUTHORIZED=NO
SEARCH_ENABLED=NO
CALENDAR_WRITE_AUTHORIZED=NO
OUTLOOK_PAYLOAD_AUTHORIZED=NO
GENERATED_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
BILLING_OR_VERTEX_CHANGE_AUTHORIZED=NO
CREDENTIAL_REPLACEMENT_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This campaign intentionally replaces repeated one-session handoffs with one bounded three-session ceiling from this checkpoint. Sessions are conditional; do not consume a session merely because budget remains.

Historical provider accounting remains immutable. The existing D1 session remains consumed. The first session below may use the previously retained second D-session allowance; the additional corrected non-production and production sessions are a new campaign-level authorization created by this directive.

## Narrow future-artifact authorization

To avoid another avoidable human stop, this activation preauthorizes one narrowly bounded tracked runtime correction **only if E1 produces deterministic evidence for it**.

Allowed runtime correction scope is limited to the Gemini Live Node bridge text-send/response-normalization boundary and directly associated tests/documentation, principally:

- `backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs`
- `backend/src/modules/assistant/gemini-live-node-bridge.ts`
- `backend/src/modules/assistant/gemini-live-bridge.protocol.ts`
- directly associated Gemini Live bridge/adapter tests

The correction may do only what E1 proves necessary, for example:

1. use the provider text-send surface that E1 proves returns usable AUDIO/model-turn output for the pinned model; and/or
2. normalize SDK LiveServerMessage audio/model-turn data across the Node JSONL boundary when E1 proves the SDK object contains usable inline audio that the current serialization path loses.

Do not broaden this into model selection, tools, Search, auth-mode changes, general assistant behavior, firmware, Calendar, Outlook, UI, database, or unrelated refactoring.

A future corrected source/image is authorized for E2/E3 only if all of these are true before any further provider session:

```text
FIX_SCOPE=NARROW_RESPONSE_SURFACE_ONLY
FULL_RELEVANT_DETERMINISTIC_GATES=PASS
ARM64_BUILD=PASS
EXACT_PROVIDER_DISABLED_ADAPTER_REPLAY=PASS
SECRET_BOUNDARY_CHECKS=PASS
GLM53_EXACT_REVIEW=PASS_NO_P0_P1_P2
CORRECTED_SOURCE_SHA=RECORDED_IN_REPORT
CORRECTED_ARM64_IMAGE_SHA=RECORDED_IN_REPORT
ROLLBACK_IMAGE_SHA=UNCHANGED_AND_VERIFIED
```

This is explicit human preauthorization for the mechanically derived corrected artifact satisfying those constraints. A correction outside this narrow scope invalidates this future-artifact authority and creates a true stop after autonomous requalification.

## E0 — reconcile and prepare, zero provider

Do not stop after E0.

- fetch/reconcile remote branch and this directive;
- verify D1 evidence and provider accounting;
- refresh official Google Live/SDK semantics;
- verify starting source/image and rollback image;
- verify production rollback health without reading secret values;
- verify the protected Gemini credential metadata and approved read-only mount path only;
- build a disposable diagnostic harness or temporary instrumentation that is not part of the production artifact unless later evidence justifies the narrow tracked fix;
- prove the diagnostic emits payload-free structural booleans/counters only.

E0 diagnostic telemetry may include only:

```text
MESSAGE_CALLBACK_COUNT
SERVER_CONTENT_PRESENT
MODEL_TURN_PRESENT
MODEL_TURN_PART_COUNT
MODEL_TURN_INLINE_DATA_PRESENT
MODEL_TURN_TEXT_PRESENT
MESSAGE_DATA_ACCESSOR_PRESENT
MESSAGE_DATA_ACCESSOR_NONEMPTY
MESSAGE_TEXT_ACCESSOR_PRESENT
OUTPUT_TRANSCRIPTION_PRESENT
GENERATION_COMPLETE_PRESENT
TURN_COMPLETE_PRESENT
PROVIDER_ERROR_PRESENT
PROVIDER_CLOSE_PRESENT
SERIALIZED_MODEL_TURN_PRESENT
RELATIVE_EVENT_TIMINGS
```

Never print, hash, retain, or commit model text, transcription text, audio bytes/base64, raw frames, API keys, or credential values.

## E1 — one-session SDK response-surface differential

Consume at most one provider session in a disposable/non-production environment using the exact starting candidate image, SDK 2.20.0, protected credential read-only, model `gemini-3.1-flash-live-preview`, AUDIO response modality, Search off, tools not invoked, no private data, and no microphone.

Use one Live session and compare two synthetic completed turns after each prior turn reaches `turnComplete`:

```text
E1_TURN_A_METHOD=sendRealtimeInput_text
E1_TURN_A_TEXT="Say exactly TEST."

E1_TURN_B_METHOD=sendClientContent_turnComplete_true
E1_TURN_B_TEXT="Say exactly SECOND."
```

If the current official SDK requires a mechanically equivalent client-content call shape, use it and record the exact method name only. Do not retain response content.

For each turn capture the E0 structural fields both **before JSON serialization** in the SDK callback and **after the current bridge-equivalent JSON serialization boundary** where practical.

### E1 interpretation

Classify deterministically:

**CASE A — SDK has usable audio but current serialization/bridge loses it**

```text
MESSAGE_DATA_ACCESSOR_NONEMPTY=YES or MODEL_TURN_INLINE_DATA_PRESENT=YES before boundary
AND accepted audio/model-turn shape missing after current boundary
```

=> implement the narrow response-normalization correction, then continue through qualification to E2 without returning.

**CASE B — client-content produces usable audio/modelTurn while realtime text does not**

=> implement the narrow text-send correction to the proven SDK surface, then continue through qualification to E2 without returning.

**CASE C — both methods produce usable audio/modelTurn and current bridge-equivalent boundary preserves it**

=> treat D1 as a provider/session-specific anomaly. No product correction is justified. Use E2 as an exact full-Slate-adapter broad non-production revalidation against the unchanged artifact; do not stop between E1 and E2.

**CASE D — neither method produces usable audio/modelTurn, despite transcription/generation/turn completion**

=> do not deploy. Exhaust zero-provider/provider-doc/model-compatibility analysis. If no mechanically resolvable cause remains, stop only after publication; do not consume E2/E3 blindly.

**CASE E — provider/auth/session error prevents meaningful comparison**

=> exhaust zero-provider diagnosis first. Reuse remaining authorized sessions only if a deterministic non-provider setup/harness defect is proven and the relevant artifact semantics are unchanged. No blind retries.

## E1.5 — conditional narrow correction and qualification

Run only for CASE A or CASE B.

Implement only the proven narrow bridge correction. Then automatically:

- add focused regression for the exact observed structural failure;
- run bridge protocol/node syntax tests;
- run focused assistant/shared regression;
- run lint/typecheck/format/frontend build as applicable;
- build exact ARM64 candidate;
- run exact provider-disabled production-shape adapter replay;
- run secret/build-context/image-history checks;
- run exact `zai-glm53-reviewer` / `glm-5.3-flash` read-only review;
- address any P0/P1/P2 finding and repeat qualification/review inside scope;
- record the corrected source SHA and ARM64 image digest;
- publish/commit/push/fetch-verify the checkpoint;
- continue directly to E2 if all gates are green.

Do not stop merely because a new corrected source/image was produced; the narrow future-artifact authorization above covers it if every qualification condition is satisfied.

## E2 — corrected/exact full-Slate non-production broad session

Consume at most one provider session only if:

- E1 CASE C preserves the unchanged artifact; or
- E1.5 produced a fully qualified narrow corrected artifact.

Use the exact full Slate adapter, Bun parent + Node bridge, explicit non-production mode, protected credential read-only, Search off, no tool invocation, no private data, no microphone, no retained audio.

Run this broad synthetic matrix in one session:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

PASS requires usable accepted audio/model output plus turn completion for every executed turn. Output transcription alone does not satisfy the audio gate.

### E2 PASS

Publish/verify checkpoint and continue directly to E3. Production deployment is already conditionally authorized by this campaign. Do not return for another deployment approval.

### E2 FAIL/AMBIGUOUS

Do not deploy. Exhaust all zero-provider forensics/requalification/reviewer work. Do not consume E3. Stop only when another provider session or new authority is genuinely required.

## E3 — exact qualified production deployment + one broad synthetic session

Run only after E2 PASS.

Before mutation:

- verify exact E2 source/image digest;
- verify pinned rollback image;
- verify Slate/MySQL/local/public production health;
- record current production container/image/config metadata without reading secret values;
- publish/verify the pre-mutation checkpoint and continue automatically.

Deploy/restart production using only the E2-qualified artifact. Use only the already reviewed production Developer-API/Node-bridge opt-ins. Mount the existing protected Gemini credential read-only. Keep the Node bridge private.

After health is green, consume at most one provider session using the same three-turn EN/EN/JA synthetic matrix and the same accepted audio + turn-complete gate.

### E3 PASS

- leave the qualified candidate deployed;
- verify Slate/MySQL/local/public health;
- verify no secret exposure and read-only credential mount;
- publish the full terminal dossier;
- continue all safe read-only/deterministic post-deploy checks;
- stop only at the physical NOTE4/private microphone/firmware/merge boundary.

Expected success state:

```text
E1_RESPONSE_SURFACE_DIFFERENTIAL=PASS_CLASSIFIED
E2_FULL_ADAPTER_NONPROD=PASS
E3_PRODUCTION_SYNTHETIC=PASS
FUTURE_PROVIDER_SESSIONS_USED_MAX=3
PRODUCTION_CANDIDATE_DEPLOYED=YES
PRODUCTION_HEALTH=PASS
ROLLBACK_AVAILABLE=YES
READY_FOR_PHYSICAL_NOTE4_DECISION=YES
PR2_STATE=open_draft_unmerged
```

### E3 FAIL/AMBIGUOUS

Immediately restore the pinned rollback image and production configuration, verify Slate/MySQL/local/public health, remove candidate-only secret mount/config if applicable, preserve payload-free evidence, and then exhaust all safe zero-provider forensic work. No production retry inside this campaign.

## Non-stopping events

Do not return for:

- checkpoint/report/state commits or pushes;
- E0 completion;
- E1 classification;
- a narrow CASE A/B correction;
- new corrected source/image produced strictly under E1.5 constraints;
- deterministic test/review loops;
- ARM64 build/provider-disabled replay;
- recoverable Docker/SSH/container issues;
- reviewer retry on the exact required route;
- transition E1 -> E1.5 -> E2 -> E3 when conditions pass;
- D3/E terminal dossier publication.

`REPORT-PUSH-INVARIANT.md` remains binding. Push often, stop rarely.

## True stop conditions

Stop only if:

1. all authorized future provider sessions are consumed and another is genuinely necessary;
2. the required runtime correction exceeds the narrow response-surface scope above;
3. a new credential must be created/replaced/migrated/recovered interactively;
4. billing/tier/Vertex/provider-account scope must change;
5. private NOTE4/Outlook/Calendar/microphone data is required;
6. physical NOTE4 interaction or firmware flashing is required;
7. destructive host/storage/database work outside disposable state is required;
8. unresolved P0/P1 or credible security/privacy/data-integrity issue remains after bounded recovery;
9. PR merge/release/publication is required.

## Reporting

Update the active D/E report trail and `CAMPAIGN-STATE.md` at every meaningful provider, correction, qualification, deployment, rollback, or terminal checkpoint. Secret-safe check, commit, push, fetch/verify exact remote SHA, verify PR #2 remains open/draft/unmerged, then continue automatically whenever the next action remains inside this activation.
