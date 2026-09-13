# CA-1 / CA-2 repair and exact review result

Date: 2026-09-13 (Australia/Perth)
Status: implemented, qualified and exactly reviewed; no production authority

## Decision and writer

```text
SOURCE_BOUND_DECISION_HEAD=4b2dd5c49ad8bb53a6c735fa16318ddd814df6f5
GROK_LEAD_DECISION=DECIDED
CA1_DECISION=ATOMIC_TURN_LANGUAGE_STAGE_RECORDS_AND_TURN_CAPTURE_SCOPED_DEDUPLICATION
CA2_DECISION=MERGE_BEFORE_CLASSIFY_WITH_REVISABLE_PROVISIONAL_LANGUAGE_EVIDENCE
ZAI_EXACT_ROUTE=UNAVAILABLE_ONLY_LOCAL_GLM_ROUTE_IS_UNAUTHORIZED_NVIDIA_NIM_GLM52
IMPLEMENTATION_WRITER=CODEX_TEMPORARY_FALLBACK
FALLBACK_AUTHORITY=EXPLICIT_OPERATOR_AUTHORIZED_AFTER_GROK_ASSIGNMENT
```

The exact Z.ai `glm-5.3-flash` route was not invoked through the locally
available NVIDIA GLM-5.2 wrapper. No credential value was read or exposed.

## Implemented changes

```text
PRODUCT_SOURCE_COMMIT=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
PRODUCT_SOURCE_TREE=25adf0fd62a07939a1ff1f99f823a63581a16633
CHANGED_PRODUCT_PATHS=backend/src/modules/assistant/xiaozhi-voice-session.ts;backend/src/modules/assistant/xiaozhi-voice-session.test.ts;scripts/slate-m4-sanitized-observer-v2.py
```

CA-1 now emits bounded atomic timing and language records containing turn
identity, stage/language fields and sanitized timestamps. The remote
prefilter preserves those records without `sort -u`; the collector parses
them as association-preserving events. Repeated same-value records in
different turns remain distinct, while exact duplicate records are bounded
and deduplicated.

CA-2 now merges each input-transcription fragment before classification.
Per-turn language evidence can revise an initial `UNKNOWN` class when later
fragments become informative. Per-turn state resets on a new turn; Han-only
ambiguity remains `UNKNOWN`; inferred input language remains separate from
the response-language recommendation.

No transcript, audio, provider payload, credential or private identifier is
logged by the new markers.

## Qualification

```text
COLLECTOR_SELF_TEST=PASS
CA1_ATOMIC_TWO_TURN_REPEATED_RECORD_TEST=PASS
CA2_PROVISIONAL_LANGUAGE_REVISION_TEST=PASS
FOCUSED_BACKEND_SHARED=59_PASS_0_FAIL_1777_EXPECTATIONS
BACKEND_TYPECHECK=PASS
SHARED_TYPECHECK=PASS
BACKEND_LINT=PASS
FORMAT_CHECK=PASS
FULL_REGRESSION=442_PASS_9_SKIP_4_UNRELATED_NEST_DECORATOR_ERRORS_5_UNHANDLED_ERRORS
PRIVACY_SCAN=PASS_NO_CHANGED_FILE_SECRET_PATTERN
GIT_DIFF_CHECK=PASS
```

The full-suite errors are confined to untouched Nest controller/decorator
tests under the current Bun 1.3.13 harness. They do not occur in the changed
files or focused affected suite and are retained as a qualification
limitation, not silently counted as passes.

## Exact artifacts

```text
FINAL_BACKEND_IMAGE_ID=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
FINAL_BACKEND_PLATFORM=linux/arm64
FINAL_BACKEND_TAG=slate:ca1-ca2-1cb585a
FINAL_COLLECTOR_ID=m4-sanitized-structural-v3|sha256:6140c29148d35a29fc95a1a77141323e4d3f1037669620b4353b8b7ed31a9f29
FIRMWARE_CHANGED=NO
FINAL_FIRMWARE_BIN_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
```

The ARM64 image is a local loaded image; no registry transport digest is
claimed. Firmware bytes were not rebuilt or changed.

## Fresh exact-artifact review

```text
FINAL_GROK_REVIEW=PASS
P0=0
P1=0
P2=0
SECURITY=0
REVIEWED_SOURCE_SHA=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
REVIEWED_BACKEND_ARTIFACT=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
REVIEWED_FIRMWARE_BIN_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
REVIEWED_COLLECTOR_ID=m4-sanitized-structural-v3|sha256:6140c29148d35a29fc95a1a77141323e4d3f1037669620b4353b8b7ed31a9f29
```

The first review response was rejected as malformed because its `P2` field
contained prose. A bounded clarification review returned the terminal
numeric verdict above. The reviewer confirmed the full-suite mapping note is
documentation-only and not an actionable product finding.

## Authority boundary

```text
DEPLOYED=NO
FLASHED=NO
PHYSICAL_RETEST=NO
PROVIDER_OR_AUTH_CHANGED=NO
OAUTH_OR_BILLING_CHANGED=NO
MERGED_OR_RELEASED=NO
NEXT_ACTION=REQUEST_EXACT_BACKEND_DEPLOYMENT_AUTHORITY;FIRMWARE_FLASH_NOT_REQUIRED_FOR_THIS_REPAIR;LATER_PHYSICAL_REQUALIFICATION_REQUIRES_SEPARATE_AUTHORITY
```

PRs #1–#4 remain OPEN / DRAFT / UNMERGED. C9 remains parked and C10 remains
isolated/deferred.

## Bounded Grok 4.6 max-turns-6 re-adjudication

The lead adjudication was retried with the existing `grok -m grok-4.6`
route and `--max-turns 6` after the prior attempt ended only at the turn
limit. The retry returned a complete structural decision and did not edit
files or perform activation.

```text
GROK_MAX_TURNS=6
GROK_ADJUDICATION=DECIDED
NEW_REPAIR_REQUIRED=NO
CA1_STATUS=REPAIRED_ATOMIC_TURN_LANGUAGE_STAGE_RECORDS_TURN_CAPTURE_SCOPED_DEDUP_FAIL_CLOSED_MISSING_STAGES_EXACT_REVIEW_PASS
CA2_STATUS=REPAIRED_MERGE_BEFORE_CLASSIFY_REVISABLE_PROVISIONAL_CLASS_HAN_ONLY_UNKNOWN_PRESERVED_INPUT_RESPONSE_SEPARATED_EXACT_REVIEW_PASS
WRITER_ASSIGNMENT=NONE
REQUIRED_ACTION=REQUEST_EXACT_REVIEWED_BACKEND_DEPLOYMENT_AUTHORITY;NO_FIRMWARE_FLASH_REQUIRED_FOR_THIS_REPAIR;LATER_PHYSICAL_REQUALIFICATION_REQUIRES_SEPARATE_AUTHORITY
PORTFOLIO_DECISION=STOP
RUNNABLE_SAFE_WORK_COUNT=0
STOP_CONDITION=NO_NEW_PROVEN_DEFECT_REMAINING_ACTIVATION_OPERATOR_AUTHORITY_GATED
```

The retry re-bound the exact candidate to source
`1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31`, backend image
`sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e`,
unchanged firmware
`sha256:cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c`,
and collector
`m4-sanitized-structural-v3|sha256:6140c29148d35a29fc95a1a77141323e4d3f1037669620b4353b8b7ed31a9f29`.
No product bytes, provider/model/auth configuration, firmware, database,
device state or deployment state changed during the retry.

The exact reviewed backend deployment and later bounded physical
requalification remain operator-authority gates. No firmware flash is
required for this CA-1/CA-2 repair.
