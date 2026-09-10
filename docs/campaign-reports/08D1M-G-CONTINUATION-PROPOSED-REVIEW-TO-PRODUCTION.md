# Campaign 8D1M-G — PROPOSED Review-to-Production Continuation

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Starting PR head: `b0672870ae4491ac7d69b1ac27a7d1d27ab7d9be`

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
NEW_PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO_BY_THIS_FILE_UNTIL_ACTIVATED
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This proposal exists to avoid another short human stop after G2. It does not itself authorize a provider call, production mutation, reviewer substitution, credential creation, billing/Vertex change, physical NOTE4 use, firmware flash, or merge.

## Accepted current evidence

```text
G1_CORRECTED_RESULT=PASS
G1_CORRECTED_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
G1_CORRECTED_READY=YES
G1_CORRECTED_MODEL_TURN=YES
G1_CORRECTED_INLINE_AUDIO=YES
G1_CORRECTED_OUTPUT_TRANSCRIPTION=YES
G1_CORRECTED_GENERATION_COMPLETE=YES
G1_CORRECTED_TURN_COMPLETE=YES
G1_PROVIDER_SESSIONS_USED=2_OF_3
G1_PROVIDER_SESSIONS_REMAINING=1
G1_5_SOURCE_SHA=5ec1838b4c2ca8a741c772788382a1d4ec7f1d04
G1_5_ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
G1_5_CHANGED_ASSISTANT_TESTS=PASS
G1_5_LINT=PASS
G1_5_TYPECHECK=PASS
G1_5_FORMAT_CHECK=PASS
G1_5_FRONTEND_BUILD=PASS
G1_5_ARM64_PROVIDER_DISABLED_REPLAY=PASS
G1_5_IMAGE_CREDENTIAL_CONTENT=ABSENT
PRODUCTION_CHANGED=NO
```

The live 2.5 native-audio proof is accepted. Do not spend more provider sessions re-proving G1.

## Current blockers

### 1. Required independent reviewer

The newest routing override remains binding:

```text
INDEPENDENT_REVIEWER=GROK_4_6
REVIEW_TRANSPORT=GROK_CLI_EXISTING_AUTH_SESSION
```

Current status is `UNAVAILABLE_UNAUTHENTICATED`. Do not substitute GLM, Gemini 3.7, Sonnet, or another reviewer unless a newer explicit human policy overrides the routing file.

The operator may restore the existing Grok CLI session interactively. No static key creation, copying, logging, or repository storage is authorized by this proposal.

After authentication is restored, Codex should run the exact read-only Grok 4.6 review against `G1_5_SOURCE_SHA` and the exact ARM64 image attestation. Address P0/P1/P2 findings only within the narrow Gemini Live model/config scope, then requalify/re-review automatically.

### 2. Full-repository Bun/Nest failures

The full repository sweep currently has unrelated Bun/Nest controller/decorator loader failures while all changed G1.5 assistant tests and deterministic gates pass.

Do not repair unrelated controller/decorator code merely to make the quick path green.

Before treating these failures as non-blocking, perform a zero-provider baseline-equivalence comparison against the nearest accepted pre-G source/runtime under the same Bun/runtime/test command. Record only failure test names/classes/counts and prove:

```text
NEW_G_RELATED_FAILURES=0
BASELINE_FAILURE_SIGNATURES_EQUIVALENT=YES
CHANGED_G1_5_TESTS=PASS
```

If the failures differ materially or implicate a changed G1.5 path, they are not waived and must be investigated. If they are equivalent pre-existing baseline failures, classify the full sweep as `PASS_WITH_VERIFIED_PREEXISTING_BASELINE` for this narrow G continuation; do not modify unrelated source.

## Recommended later activation envelope

A later explicit human activation should authorize this entire remaining software chain in one decision:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_AUTHORIZED_STAGES=NO
CARRY_FORWARD_EXISTING_G_SESSION=1
ADDITIONAL_NEW_PROVIDER_SESSIONS_MAX=1
TOTAL_FUTURE_PROVIDER_SESSIONS_FROM_ACTIVATION_MAX=2
BLIND_RETRY=NO
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_AFTER_G2_PASS
PRODUCTION_RESTART_AUTHORIZED=YES_WITHIN_G3_ONLY
AUTO_ROLLBACK_ON_G3_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_G3_PASS=YES_IF_HEALTH_GREEN
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
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

The existing remaining G session is intended for G2. The single additional session is intended only for G3 after G2 PASS. No retry pool is created.

## Continuation after prerequisites

Once exact Grok review is PASS and baseline equivalence is PASS:

1. continue directly to G2 using the remaining existing G provider session;
2. run the existing EN/EN/JA broad full-adapter non-production matrix;
3. if G2 FAILS, do not deploy and do not consume the additional session; exhaust zero-provider forensics and stop only at a true new boundary;
4. if G2 PASSES and this proposal has been explicitly activated, continue directly to G3 without returning control;
5. preserve rollback, deploy only the exact G2-qualified candidate, verify health, and consume exactly one production synthetic session;
6. on G3 failure, immediately rollback and verify Slate/MySQL/local/public health; no production retry;
7. on G3 PASS, leave candidate deployed only while all health gates remain green, publish terminal dossier, and stop at the separate physical NOTE4/firmware/merge boundary.

Checkpoint/report pushes are not handoffs. `REPORT-PUSH-INVARIANT.md` remains binding.

## True stop conditions

Stop only for a genuinely new boundary: Grok interactive authentication still unavailable; non-baseline or G-related regression; P0/P1/security issue; source correction outside narrow Gemini Live model/config scope; provider pool exhaustion; credential/billing/Vertex change; private data/microphone; physical NOTE4/firmware; destructive host/database action; merge/release.
