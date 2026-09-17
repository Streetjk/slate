# C8 Input-Stall Attribution Audit — 2026-09-16

## Scope and decision

This is an offline development qualification slice for the operator symptom
“long Voice output followed by delayed or frozen input.” It does not access a
device, serial node, provider, deployment target, or physical acceptance
window.

The bounded Grok 4.6 decision was:

```text
DECISION_STATUS=DECIDED
INPUT_STALL_STATUS=UNPROVEN; mocked/host bounds do not attribute a production stall
FIRST_PROVEN_BOUNDARY=backend mocked soak and host models; production rearm runtime remains unexercised
SOURCE_DEFECT_PROVEN=NO
SELECTED_ACTION=test-only/static bind of existing host models to production rearm/drain/coalesce paths
IMPLEMENTATION_WRITER=NOT_APPLICABLE_TEST_ONLY_STATIC_HOST_CHANGE
STOP_CONDITION=fail closed on rearm with non-empty/active playback, overlap without rearm, coalesced loss, or interrupted capture; no offline PASS may be treated as physical attribution
NEXT_SAFE_ACTION=extend the existing host/mocked tests with multi-turn long-output coverage only
```

The existing preferred Z.ai writer was not used for this test-only package; no
product repair was justified and no writer substitution was used for product
code.

The technical decision was obtained from Grok. A separate diff-review attempt
was bounded twice and both invocations exhausted their turn budget while
inspecting the repository, returning no verdict. This is recorded as a
reviewer-tooling outcome, not as a product finding. No exact product-artifact
review was required because this slice changed no product runtime or artifact
bytes and the technical decision explicitly selected test-only work.

```text
GROK_TECHNICAL_DECISION=RECEIVED_DECIDED
GROK_DIFF_REVIEW=NOT_OBTAINED_BOUNDED_MAX_TURNS_NO_VERDICT
PRODUCT_ARTIFACT_REVIEW=NOT_APPLICABLE_NO_PRODUCT_BYTES_CHANGED
```

## Existing evidence audited

| Evidence | Result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Backend `XiaozhiVoiceSession` 10-turn soak | 52/52 focused file pass | Per-turn backend sequencing, transcript/bubble handling, mocked operation/mic queue reset, WebSocket backlog bound | Device rearm ordering, codec/playback drain, real UI event queue, long-output volume, per-turn device resource attribution |
| Historical M05 replay | 100 turns / 1,000 partials pass | Unchanged host/provider-disabled replay remains a useful baseline for logical ordering, partial updates and cleanup | Production audio queues, `WaitForPlaybackQueueEmpty(0)`, device UI/EPD backpressure, per-stage physical timing, progressive resource attribution |
| Firmware bubble/event host stress | Pass | `PostCoalesced` one-pending behavior, queue-capacity model and button-event separation under repeated/concurrent changes | FreeRTOS scheduling, LVGL execution cost, audio decode/write timing, actual display task backpressure |
| Existing `voice_rearm_host_test` | Pass | A single rearm seam model covers final in-flight write, blocked drain and post-rearm input tick | Production implementation execution; it is not an integration test |

The historical physical snapshots reported bounded queues and no monotonic host
resource trend, but required provider/output/downstream-audio and per-turn
stages were absent. Those fields remain UNKNOWN.

## Production-boundary inspection

The new static contract test checks the exact source at this commit, without
executing it:

```text
xiaozhi_service.cc:
TTS stop -> pending_listen_after_playback=true
pending && WaitForPlaybackQueueEmpty(0)
-> SendStartListening
-> pending=false
-> EnableVoiceProcessing(true)

audio_service.cc:
WaitForPlaybackQueueEmpty checks decode/playback queues and decode/playback active flags
IsIdle additionally includes encode/send queues
playback bound=2; decode/send bounds are present

event_bus.cc:
queue capacity=64; Xiaozhi changes use one pending PostCoalesced item
```

This proves the implementation seam and its ordering. It does not prove that a
running device reaches the seam without a stall.

## New deterministic qualification

Added test-only files:

- `firmware/test/voice_long_output_attribution_host_test.cc`
- `firmware/test/run_voice_long_output_attribution_test.sh`

The host stress exercises 100 sequential turns and 1,000 synthetic output
partial/update events. It covers repeated capture windows, rearm only after
decode/playback drain, synchronous in-flight playback writes, bounded
encode/decode/send/playback queues, one coalesced UI change with button-event
ordering, and interruption before rearm. The shell harness statically binds
those assertions to the production rearm, audio and event-bus source.

Observed result:

```text
voice_long_output_attribution_static_contract: PASS
voice_long_output_attribution_host_test: PASS
voice_rearm_host_test: PASS
xiaozhi_bubble_update_host_test: PASS
audio_path_markers_test: PASS
websocket_event_loss_regression_test: PASS
run_voice_font_coverage_test.sh: PASS
backend xiaozhi-voice-session.test.ts: 52 pass, 0 fail
backend full suite: 450 pass, 9 documented skip, 0 fail
typecheck: PASS
backend lint: PASS
format check: PASS
privacy scan: PASS
```

No product runtime source, backend runtime source, firmware source, font, or
artifact bytes changed. The changes are bounded test/tooling and evidence
documentation only.

## Coverage result and remaining gap

The new package closes the feasible offline gap around long output load,
rearm ordering, queue-drain predicates, in-flight playback, UI coalescing and
interruption handling. It does not close the device/provider attribution gap.

The first production boundary still requiring direct observability is:

```text
TTS stop / pending_listen_after_playback
-> WaitForPlaybackQueueEmpty(0)
-> SendStartListening
-> EnableVoiceProcessing(true)
-> first post-rearm input capture/encode/send
```

There is no evidence of a source defect in that path. In particular, offline
tests did not prove a queue overflow, rearm-before-drain, coalesced event loss,
or interrupted-capture continuation. They also cannot attribute the operator’s
physical delay to provider output, backend transport, device codec/playback,
UI/LVGL, EPD refresh, or reset/freeze behavior.

Therefore:

```text
INPUT_STALL_SOURCE_DEFECT_PROVEN=NO
INPUT_STALL_PHYSICAL_ATTRIBUTION=UNKNOWN
RESET_CAUSE_ATTRIBUTION=UNKNOWN
PRODUCT_RUNTIME_CHANGED=NO
PHYSICAL_RETEST=NOT_AUTHORIZED_AND_NOT_PERFORMED
```

## Other safe lanes

- C10 remains deployed as the exact reviewed application; the AI-usage API
  404 was already reconciled as an auth-gated/request-path smoke limitation,
  not a source-wiring defect. The reviewed Weather mapping repair remains
  frozen and undeployed.
- C7 Outlook remains read-only OAuth/account-consent gated; no safe account
  action is authorized here.
- C9 remains parked research-only; no new provider, credential, OAuth, billing
  or live experiment is justified.
- The U+6CA2 firmware candidate remains exact, reviewed and unflashed; this
  audit does not change or reauthorize it.

## Activation boundary

No deployment, firmware flash, physical test, serial access, provider call,
backend/auth/configuration change, production data mutation, merge or release
was performed. The durable state remains active until this report receives its
review and is pushed; afterward the remaining work is the existing separate
activation/device authority boundary, with physical attribution fields kept
UNKNOWN.
