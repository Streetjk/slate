# Campaign 8D1M-G — Continuation Ready for Activation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Provide one clean, corrected activation surface for the remaining Gemini 2.5 native-audio software path. This file supersedes stale source-pin and reviewer-status text in the earlier continuation proposal where they conflict. It does not itself authorize any provider session or production mutation.

## Exact accepted pins

```text
G1_5_SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
G1_5_ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
```

The invalid earlier source value `5ec1838b4c2ca8a741c772788382a1d4ec7f1d04` must not be used.

## Accepted completed evidence

```text
G1_CORRECTED_RESULT=PASS
G1_CORRECTED_READY=YES
G1_CORRECTED_MODEL_TURN=YES
G1_CORRECTED_INLINE_AUDIO=YES
G1_CORRECTED_OUTPUT_TRANSCRIPTION=YES
G1_CORRECTED_GENERATION_COMPLETE=YES
G1_CORRECTED_TURN_COMPLETE=YES
G1_PROVIDER_SESSIONS_USED=2_OF_3
G1_PROVIDER_SESSIONS_REMAINING=1
BASELINE_EQUIVALENCE=PASS
CURRENT_FULL_REPOSITORY=326_PASS_5_SKIP_4_FAIL_5_ERRORS
BASELINE_FULL_REPOSITORY=326_PASS_5_SKIP_4_FAIL_5_ERRORS
BASELINE_FAILURE_SIGNATURES_EQUIVALENT=YES
NEW_G_RELATED_FAILURES=0
G1_5_CHANGED_ASSISTANT_TESTS=PASS
G1_5_LINT=PASS
G1_5_TYPECHECK=PASS
G1_5_FORMAT_CHECK=PASS
G1_5_FRONTEND_BUILD=PASS
G1_5_ARM64_PROVIDER_DISABLED_REPLAY=PASS
G1_5_IMAGE_CREDENTIAL_CONTENT=ABSENT
G1_5_REVIEW=PASS
REVIEW_PROVIDER=GROK
REVIEW_MODEL=grok-4.6
P0_FINDINGS=0
P1_FINDINGS=0
P2_FINDINGS=0
P3_FINDINGS=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
```

Unrelated Bun/Nest controller/decorator failures are a verified pre-existing baseline and are not to be repaired as part of this narrow continuation.

## Current state

```text
DIRECTIVE_STATE=READY_FOR_EXPLICIT_ACTIVATION_NOT_YET_AUTHORIZED
EXISTING_G_PROVIDER_SESSION_AVAILABLE=1
ADDITIONAL_PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

## Recommended single activation envelope

A later explicit human `proceed` / equivalent should authorize the entire remaining software chain in one decision:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_G2_AND_G3=NO
CARRY_FORWARD_EXISTING_G_SESSION=1
ADDITIONAL_NEW_PROVIDER_SESSIONS_MAX=1
TOTAL_FUTURE_PROVIDER_SESSIONS_FROM_ACTIVATION_MAX=2
BLIND_RETRY=NO
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_AFTER_G2_PASS
PRODUCTION_RESTART_AUTHORIZED=YES_WITHIN_G3_ONLY
AUTO_ROLLBACK_ON_G3_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_G3_PASS=YES_IF_HEALTH_GREEN
SEARCH_SYNTHETIC=OFF
TOOLS_SYNTHETIC=NO_INVOCATION
MICROPHONE=NO
PRIVATE_DATA=NO
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
BILLING_OR_VERTEX_CHANGE=NO
CREDENTIAL_REPLACEMENT=NO
PHYSICAL_NOTE4_TEST=NO
FIRMWARE_FLASH=NO
PR2_MERGE=NO
```

## G2 — full Slate adapter non-production broad validation

Use the remaining existing G provider session with the exact qualified source/image, Bun parent + Node bridge, existing protected credential read-only, Search off, no tool invocation, no private data, no microphone, no retained audio.

Run in one session:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

PASS requires usable native-audio/model-turn output plus turn completion for every executed turn.

If G2 FAILS: do not deploy, do not consume the additional production session, exhaust all zero-provider forensics/requalification and stop only at a true new boundary.

If G2 PASSES: publish/verify checkpoint and continue directly to G3 without returning control.

## G3 — exact qualified production deploy + broad synthetic validation

Before mutation verify exact source/image/rollback and Slate/MySQL/local/public health. Deploy/restart only the G2-qualified candidate using the already approved Developer API/Node-bridge production opt-ins and existing protected credential read-only. Keep the bridge private.

Consume exactly one additional provider session using the same EN/EN/JA synthetic matrix and same native-audio gate.

On PASS: leave candidate deployed only while all health gates remain green; verify secret boundary and production health; publish terminal dossier; stop only at physical NOTE4/private microphone/firmware/merge boundary.

On FAIL/AMBIGUOUS: immediately rollback to the pinned rollback image/config; verify Slate/MySQL/local/public health; remove candidate-only secret mount/config if applicable; exhaust all safe zero-provider forensics; no production retry.

## Non-stopping events after activation

Do not return for report/checkpoint pushes, G2 PASS, pre-production checkpoint, deterministic postchecks, recoverable Docker/SSH/container work, or G2 -> G3 transition. `REPORT-PUSH-INVARIANT.md` remains binding.

## True stops

Stop only for provider pool exhaustion, new source/artifact outside the narrow reviewed pin, credential/billing/Vertex change, private data/microphone, physical NOTE4/firmware, destructive host/database action, unresolved P0/P1/security/privacy issue, or PR merge/release.

## Human activation checkpoint

Date: 2026-09-04 (Australia/Perth)

The human instruction `proceed` explicitly activated the continuation envelope
above. The original staged boundary is retained as historical evidence; this
block is the active state for execution.

```text
ACTIVATION_BASIS=EXPLICIT_HUMAN_PROCEED_IN_CONTEXT
DIRECTIVE_STATE=AUTHORIZED_ACTIVE
G2_STATUS=AUTHORIZED_READY
G3_STATUS=CONDITIONAL_AFTER_G2_PASS
CARRY_FORWARD_EXISTING_G_PROVIDER_SESSION=1
ADDITIONAL_NEW_PROVIDER_SESSIONS_MAX=1
TOTAL_FUTURE_PROVIDER_SESSIONS_FROM_ACTIVATION_MAX=2
G_PROVIDER_SESSIONS_USED=2_OF_3
G_PROVIDER_SESSIONS_REMAINING=1
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
PRODUCTION_DEPLOYMENT=CONDITIONAL_AFTER_G2_PASS
PRODUCTION_RESTART=AUTHORIZED_WITHIN_G3_ONLY
BLIND_RETRY=NO
PRIVATE_DATA_SENT=NO
PR2_MERGED=NO
```

`REPORT-PUSH-INVARIANT` applies before the G2 provider boundary. Checkpoint
publication is not a handoff; once the exact remote checkpoint is verified,
the authorized G2 work continues automatically.

## G2 preflight hard stop — exact candidate image storage boundary

The exact ARM64 candidate was present in the local Colima Docker store, but was
not present in the remote Docker store. A zero-provider transfer of only that
qualified image was attempted so the approved host-local protected credential
could remain at its existing path. The remote Docker root filesystem reached
100% during the load. The launcher was disconnected, disposable untagged
partial layers were identified and removed, and no credential was mounted,
read, copied, or exposed.

```text
G2_PROVIDER_CALL=NOT_STARTED
G2_PROVIDER_SESSIONS_USED=0_FROM_ACTIVATION
G_PROVIDER_SESSIONS_USED=2_OF_3
G_PROVIDER_SESSIONS_REMAINING=1
G2_EXACT_IMAGE_LOCAL=PASS
G2_EXACT_IMAGE_REMOTE=ABSENT
G2_IMAGE_TRANSFER=ABORTED_REMOTE_DOCKER_ROOT_CAPACITY
G2_PARTIAL_TRANSFER_CLEANUP=PASS_DISPOSABLE_UNTAGGED_LAYERS_ONLY
G2_DURABLE_PROVIDER_RESULT=NOT_CREATED_PROVIDER_NOT_STARTED
G2_CREDENTIAL_VALUE_READ=NO
G2_CREDENTIAL_MOUNTED=NO
G2_PRODUCTION_MUTATION=NO
G2_STATUS=BLOCKED_EXACT_IMAGE_CANNOT_BE_LOADED_SAFELY
READY_FOR_G2_PROVIDER_CALL=NO
HUMAN_INFRASTRUCTURE_DECISION_REQUIRED=YES
```

The remote root is 14 GB with 871 MB available after cleanup; the candidate
image metadata reports 1,130,704,920 bytes before Docker's load overhead. The
historical images and Docker root were not deleted or relocated. Production
remains on rollback image
`sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`,
with Slate and MySQL healthy and both restart counts at zero; the read-only
health endpoint returned HTTP 200. No G3 action is authorized or possible
until the exact candidate image can be made available without a new
destructive host/storage decision.
