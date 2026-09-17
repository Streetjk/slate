# CA-1 / CA-2 deterministic evidence

Date: 2026-09-13 (Australia/Perth)
Status: evidence-only; no product runtime mutation, deployment, flash or physical test

## Scope and identities

```text
CURRENT_HEAD=a2a18e0a313beb4e0e3d21f7c5d30a702059b292
PRODUCT_SOURCE=8876c50f56f45cec4413755e83fba9d3d07627cf
BACKEND_IMAGE=sha256:c4289feb7e6f86f85ed2690a7ad3e8300f539c1c3d4f487bcae451d13d3257eb
FIRMWARE_BIN=sha256:cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
FIRMWARE_BYTES=2537984
COLLECTOR=m4-sanitized-structural-v3|sha256:9482324d4ae24dba606bf1746c2ac48fc765d626d4ee4f1ae4d65bf060310808
PRODUCT_RUNTIME_CHANGED=NO
```

The exact firmware file was found at `firmware/build/slate.bin` and matched
both the recorded SHA-256 and byte count. The local Docker image matched the
recorded image ID and reported `linux/arm64`. No rebuild was performed.

## CA-1 — timing correlation

```text
CA1_EVIDENCE_STATUS=PROVEN_DEFECT
CA1_FIRST_LOSS_BOUNDARY=SSH_PREFILTER_TOKEN_EXTRACTION_AND_SORT_U
CA1_SECONDARY_LOSS_BOUNDARY=CAPTURE_ACCUMULATOR_GLOBAL_EVENT_BATCH_DEDUPLICATION
```

The producer emits turn, language and stage information in separate logger
fields. The remote `backend_snapshot()` command extracts individual tokens
with `grep -oE`, then applies `sort -u`. This removes line/record boundaries.
A bounded synthetic reproduction produced identical sorted token output for
two histories with EN/ZH assignments and stage timestamps swapped between
turns:

```text
CA1_SORTED_HISTORIES_COLLIDE=YES
```

The collector parser can recognize the individual fields, but that recognition
does not restore their association. `CaptureAccumulator` also drops an
identical event batch arriving from a later overlapping capture window:

```text
CA1_CAPTURE_EVENTS_RETAIN_TURN_FIELDS=YES
CA1_OVERLAP_DUPLICATE_DROPPED=YES
CA1_SUMMARY_TERMINAL=MISSING_EVIDENCE
```

Minimum options for Grok adjudication are:

1. Preserve each sanitized timing record atomically through the prefilter,
   including turn identity and stage; remove global sorting as the association
   mechanism.
2. Make duplicate identity turn- and capture-window-scoped, or explicitly
   retain repeated same-value events when their turn identity differs.
3. Keep missing stages UNKNOWN and do not subtract unaligned clock domains.

The exact repair choice is intentionally not made by Codex.

## CA-2 — input-language telemetry

```text
CA2_EVIDENCE_STATUS=PROVEN_DEFECT
CA2_FIRST_LOSS_BOUNDARY=handleGeminiMessage_CLASSIFIES_RAW_FRAGMENT_BEFORE_MERGE_THEN_setTurnLanguageClass_LATCHES
```

The actual session path classifies `inputTranscription.text` before calling
`mergeTranscriptFragment`. `setTurnLanguageClass` returns after the first
class emission for the turn. A bounded reproduction showed:

```text
INITIAL_AMBIGUOUS_FRAGMENT=UNKNOWN
LATER_COMPLETE_JA_FRAGMENT=JA
EMITTED_TURN_CLASS=UNKNOWN
INITIAL_AMBIGUOUS_FRAGMENT=UNKNOWN
LATER_COMPLETE_ZH_FRAGMENT=ZH_HANT
EMITTED_TURN_CLASS=UNKNOWN
```

Cross-turn reset/switch behavior passed: a new turn can emit a new class.
Ambiguous Han-only inputs remain UNKNOWN rather than being forced to Chinese.

Minimum options for Grok adjudication are:

1. Classify the merged transcript and emit a final/provisional distinction,
   allowing a later informative fragment to revise an earlier UNKNOWN.
2. Or retain provisional per-fragment evidence and emit only the final
   turn-level class for acceptance, preserving UNKNOWN when no final evidence
   exists.
3. Keep inferred input language separate from observed assistant output
   language; these reproductions do not prove a provider response mismatch.

The exact repair choice is intentionally not made by Codex.

## Tests and boundaries

```text
COLLECTOR_SELF_TEST=PASS
CA1_SYNTHETIC_REPRODUCTION=PASS
CA2_SYNTHETIC_REPRODUCTION=PASS
SESSION_AND_SHARED_TESTS=58_PASS_0_FAIL_1458_EXPECTATIONS
GIT_DIFF_CHECK=PASS
PRODUCT_POST_FREEZE_PATHS=NONE
GROK_CLI_STATUS=KNOWN_DEVICE_NOT_CONFIGURED_OS_ERROR_6
CA3_STATUS=DEFERRED_C10_SEPARATE_SCOPE
```

No transcript, audio, provider payload, credential or private device data was
retained. No product source, artifact, provider configuration, production
data, device state or physical acceptance state changed.

## Frontier

CA-1 and CA-2 are now mechanically evidenced and await the mandated Grok
decision. The next executable action is one bounded Grok adjudication after
the existing Grok CLI device/session is restored. C10 remains isolated and
deferred; C9 remains parked.
