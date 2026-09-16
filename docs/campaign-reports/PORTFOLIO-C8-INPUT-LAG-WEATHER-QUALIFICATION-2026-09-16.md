# C8 Input-Lag Qualification and Weather Physical Verification — 2026-09-16

## Scope

This report records the operator's Weather verification after the reviewed
Weather application repair was deployed, and a bounded offline qualification
of the post-long-output input-rearm path. It does not access NOTE4, a serial
node, a provider, or the firmware activation path.

## Weather physical verification

```text
C10_WEATHER_PHYSICAL_VERIFICATION=PASS_OPERATOR_VERIFIED_AFTER_DEPLOYED_REPAIR
C10_WEATHER_PRIOR_PHYSICAL_RESULT=FAIL_VISIBLE_QUESTION_MARK_PERSISTING
C10_WEATHER_EXACT_LIVE_FRAME_CODE=UNKNOWN
```

The prior question-mark observation remains true historical evidence. The new
operator result is a separate later verification after the reviewed mapping
repair deployment. No exact live frame code, icon code, or additional card
result was inferred.

## Grok 4.6 input-lag decision

The current source-bound evidence was sent to Grok 4.6. Its bounded decision
was:

```text
DECISION_STATUS=DECIDED
INPUT_STALL_REPAIR_DECISION=NO_SOURCE_REPAIR
DIRECT_REPRODUCTION_SCOPE=OFFLINE_HOST_ONLY
FIRST_BOUNDARY_STATUS=REAL_FIRMWARE_HOST_COMPILE_BLOCKED_MISSING_FREERTOS_ESP_IDF_HEADERS
PRODUCT_DEFECT_PROVEN=NO
ENCODE_SEND_EXCLUSION_STATUS=DIAGNOSTIC_GAP_NOT_DEFECT
IMPLEMENTATION_WRITER=NONE
NEXT_SAFE_ACTION=EXTEND_DOCUMENT_OFFLINE_PRODUCTION_BOUND_TESTS_AND_TIMING_BACKPRESSURE_NOTES
STOP_CONDITION=STOP_BEFORE_FREERTOS_ESP_IDF_SHIMS_OR_DEVICE_PROVIDER_SERIAL_ACTION
```

The production path is statically bound as:

```text
TTS stop -> pending_listen_after_playback
-> WaitForPlaybackQueueEmpty(0)
-> SendStartListening
-> clear pending
-> EnableVoiceProcessing(true)
```

`WaitForPlaybackQueueEmpty(0)` intentionally covers decode/playback queues and
active flags, while `IsIdle()` additionally covers encode/send queues. The
existing host test already characterized this distinction; no causal link
from transport backlog to the operator's stall was proven.

## Offline qualification executed

The test-only model now includes a long-output rearm case with a full send
queue and encode backlog remaining when playback becomes idle. It verifies
that the model does not rearm before playback drain, then records that the
production playback predicate can rearm while transport backlog remains. This
is explicitly diagnostic evidence, not a hardware-readiness claim.

```text
voice_long_output_attribution_static_contract=PASS
voice_long_output_attribution_host_test=PASS
  100 turns; 1000 partials; rearm ordering; in-flight playback;
  queue bounds; transport-backlog boundary; coalescing; interruption fail-closed
voice_rearm_host_test=PASS
xiaozhi_bubble_update_host_test=PASS
audio_path_markers_test=PASS
backend_xiaozhi_voice_session=52_PASS_0_FAIL
```

Changed test-only paths:

```text
firmware/test/voice_long_output_attribution_host_test.cc
firmware/test/run_voice_long_output_attribution_test.sh
```

No firmware, backend runtime, font, artifact, provider, or device bytes were
changed. The U+6CA2 candidate remains bound, reviewed and unflashed:

```text
U6CA2_FIRMWARE_CANDIDATE_BIN_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
U6CA2_FIRMWARE_CANDIDATE_BIN_BYTES=2538064
U6CA2_FIRMWARE_CANDIDATE_ELF_SHA256=5e01c88e64ab7160a262cb931fb90667413327ee353c6334c0903fe792d043d6
```

## Remaining boundary

The exact production-class C++ path cannot be compiled in the current host
without FreeRTOS/ESP-IDF headers and test shims. No shims were introduced.
The remaining attribution requires production-class instrumentation or a
separately authorized device/provider observation. `RESET_CAUSE_ATTRIBUTION`
and `OBSERVER_NONINTERFERENCE_PROVEN` remain `UNKNOWN`/`NO` respectively.

```text
PRODUCT_RUNTIME_CHANGED=NO
PHYSICAL_TEST=NOT_RUN
FIRMWARE_ACTIVATION=NOT_ATTEMPTED
```
