# Campaign 8D1M-G — PROPOSED Physical Voice UX Latency + Bubble Coalescing

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Trigger

Human physical NOTE4 observation after the reviewed Campaign 8 firmware app-only flash:

```text
PHYSICAL_VOICE_PATH=WORKS
USER_REPORTED_LATENCY=VERY_LAGGY
ASSISTANT_ONE_SENTENCE_RENDERING=MULTIPLE_BUBBLES
```

Treat this as a real physical UX defect, not as a provider-connectivity failure. The qualified Gemini 2.5 production backend remains healthy and must not be churned unnecessarily.

## Source-level mechanism already established

Current backend `XiaozhiVoiceSession.handleGeminiMessage()` forwards every non-empty Gemini `outputTranscription.text` event immediately as:

```text
{ type: 'tts', state: 'sentence_start', text: outputText }
```

Current firmware maps every incoming `kTtsSentenceStart` to `SetAssistantText(message.text)`.

Current `SetAssistantText()` appends every non-empty text item as a new assistant message:

```text
snapshot_.messages.push_back({"assistant", text});
```

The Xiaozhi scene rebuilds the message UI whenever the message count/key changes, clearing and recreating all bubbles before a render/EPD update.

Therefore the multiple-bubble behavior is structurally explained by per-fragment output-transcription events being treated as independent final assistant messages. The same pattern exists for input transcription / user text and must be assessed for equivalent fragmentation.

The physical lag may have multiple contributors. Repeated transcript-driven UI/EPD work is a concrete candidate, but provider/network/audio timing must be measured rather than guessed.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
SOURCE_CHANGE_AUTHORIZED=NO
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
NEW_PROVIDER_SESSION_AUTHORIZED=NO
PRIVATE_DATA_CAPTURE_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This proposal creates no mutation authority until later explicit human activation.

## Proposed activation envelope

A later explicit activation should authorize a long-running narrow UX repair through source correction, deterministic qualification and independent review, but stop before production deployment or firmware flash unless those actions are separately and explicitly included by the human.

```text
WORKER=LUNA_BOUNDED
CONTROLLER=CODEX
INDEPENDENT_REVIEWER=GROK_4_6_EXISTING_AUTHENTICATED_CLI
SCOPE=VOICE_TRANSCRIPT_TURN_COALESCING_AND_LATENCY_INSTRUMENTATION_ONLY
MODEL_CHANGE=NO
CREDENTIAL_CHANGE=NO
BILLING_OR_VERTEX_CHANGE=NO
CALENDAR_OR_OUTLOOK_SEMANTICS_CHANGE=NO
SEARCH_CHANGE=NO
AUDIO_CODEC_CHANGE=NO_UNLESS_MEASURED_EVIDENCE_REQUIRES_NARROW_FIX
PRODUCTION_DEPLOYMENT=NO
FIRMWARE_FLASH=NO
PROVIDER_CALLS=0_BY_DEFAULT
PRIVATE_MICROPHONE_DATA=NO
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
PR2_MERGE=NO
LONGRUN_DEFAULT=YES
CHECKPOINT_PUSH_IS_NOT_A_STOP=YES
```

## U0 — establish deterministic turn/transcript semantics

Without provider calls or private data:

1. trace backend Gemini Live event handling -> Xiaozhi protocol -> firmware message handler -> snapshot -> scene render;
2. prove with fixtures whether `inputTranscription` and `outputTranscription` events are deltas, cumulative fragments, or either under the adapter contract;
3. reproduce one logical turn split across multiple transcription events;
4. assert current behavior produces multiple message entries/bubbles;
5. identify the authoritative finalization signal (`turnComplete`, generation-complete plus turn-complete, or existing protocol stop boundary) for committing a logical transcript message;
6. preserve streaming audio independently of display transcript finalization.

Do not infer concatenation rules without tests. Prevent duplicated text when providers emit cumulative transcription and prevent missing text when providers emit deltas.

## U1 — narrow bubble coalescing correction

Implement the smallest safe contract so one logical user turn and one logical assistant turn each produce one chat bubble.

Preferred behavioral outcome:

```text
ONE_USER_TURN=ONE_USER_BUBBLE
ONE_ASSISTANT_TURN=ONE_ASSISTANT_BUBBLE
PARTIAL_TRANSCRIPTION_EVENT=NO_NEW_BUBBLE
AUDIO_STREAMING=UNCHANGED
TURN_COMPLETE=FINALIZE_ASSISTANT_DISPLAY_TEXT
```

Choose the exact boundary based on U0 evidence. It is acceptable to update one in-progress message internally, or buffer fragments and publish only finalized text, but do not create a new persistent bubble for every transcription fragment.

Because NOTE4 uses e-ink, avoid redraw/refresh work for every partial transcript unless there is measured UX value. Prefer final-turn text rendering or a bounded single-bubble update strategy that does not repeatedly clean and rebuild the whole conversation list.

Add focused backend + firmware/unit tests for fragmented/cumulative transcription, turn finalization, reconnect/abort cleanup, and EN/JP text.

## U2 — latency instrumentation, zero private content

Add temporary or test-only sanitized timing markers that contain timestamps/stage names only, never transcript text, audio, credentials, provider payloads or user data.

Measure at least:

```text
T_DEVICE_LISTEN_START
T_FIRST_DEVICE_AUDIO_SENT
T_BACKEND_FIRST_AUDIO_RECEIVED
T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN
T_PROVIDER_FIRST_OUTPUT_EVENT
T_PROVIDER_FIRST_AUDIO_EVENT
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE
T_DEVICE_FIRST_AUDIO_PLAYBACK
T_TRANSCRIPT_FINALIZED
T_UI_RENDER_REQUEST
T_EPD_REFRESH_COMPLETE_IF_AVAILABLE
```

Where an exact marker is not mechanically available, document the nearest observable boundary rather than inventing precision.

Produce a latency budget separating:

- device capture/frame buffering;
- NOTE4 -> Orange Pi transport;
- Gemini/provider response latency;
- backend codec/protocol processing;
- Orange Pi -> NOTE4 transport;
- device decode/playback start;
- UI/render/e-ink refresh overhead.

First use deterministic fixtures/replays and synthetic timing hooks. Do not consume a new provider session merely for instrumentation under this proposal.

## U3 — optimize only measured local bottlenecks

Apply only reversible, narrow optimizations supported by U2 evidence. Likely candidates to evaluate include:

- eliminating per-transcription-fragment `PostChanged()` / UI rebuilds;
- avoiding full conversation-list clean/recreate when only the final bubble changes;
- avoiding unnecessary e-ink refreshes while audio is streaming;
- preserving the current audio packet path and codec unless timing proves it is material;
- keeping the Gemini Live connection lifecycle/reconnect behavior unchanged unless measured setup latency is dominant and an existing-session optimization is safe.

Do not trade away barge-in, reconnect, EN/JP, native audio, privacy or rollback behavior for a cosmetic speedup.

## U4 — qualification + independent review

Run focused backend/firmware tests, format/lint/typecheck, exact ESP-IDF 5.5.2 esp32s3 build, secret/diff checks, and any relevant provider-disabled ARM64 replay.

Use the current routing override:

```text
WORKER=LUNA
REVIEWER=GROK_4_6
```

Grok 4.6 must review the exact corrected source/artifacts. Fix P0/P1/P2 findings within the narrow UX scope, requalify and re-review without stopping for intermediate successful checkpoints.

## Completion of this proposal

Publish:

```text
MULTI_BUBBLE_ROOT_CAUSE=CONFIRMED|REVISED
ONE_ASSISTANT_TURN_ONE_BUBBLE=PASS|FAIL
ONE_USER_TURN_ONE_BUBBLE=PASS|FAIL
EPD_PARTIAL_TRANSCRIPT_REFRESH_CHURN=REMOVED|RETAINED_WITH_REASON
LATENCY_BUDGET=PUBLISHED
MEASURED_LOCAL_LATENCY_IMPROVEMENT_MS=<value_or_not_measured>
PROVIDER_BEHAVIOR_CHANGED=NO
PRODUCTION_DEPLOYED=NO
FIRMWARE_FLASHED=NO
READY_FOR_DEPLOY_AND_PHYSICAL_RETEST=YES|NO
```

Stop only at the next genuine production/physical-write/private-data boundary after review PASS. `REPORT-PUSH-INVARIANT.md` remains binding. Keep PR #2 open/draft/unmerged.

## U0/U1/U2 — zero-provider implementation checkpoint

Date: 2026-09-05 (Australia/Perth)

The directive was activated by the current human instruction. No Gemini
provider call, production mutation, credential access, model/configuration
change, billing change, Vertex change, firmware flash, or PR merge occurred.

```text
CHECKPOINT_BASE_SHA=2cd407044200ecd088f9d9ee862b6b35c3ddc4e3
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

### U0 deterministic finding

The source trace and focused fixtures confirm that Live input and output
transcription fields can arrive as either delta fragments or cumulative
text under the adapter contract. The previous session emitted each non-empty
fragment immediately. Firmware then appended every `stt` and
`tts/sentence_start` message, while the Xiaozhi scene treated each changed
message key as a reason to clear and recreate the entire conversation list.

The corrected contract buffers each logical input/output transcript, merges
delta or cumulative fragments without duplicate cumulative prefixes, and
publishes the text only at `turnComplete`. Abort, close, and live-failure
paths discard unfinished text. Audio encoding, packetization, and send order
remain on the existing path. Firmware additionally upserts a same-role tail
message and preserves the same merge behavior as a defense against a future
fragmented protocol sender.

Focused backend tests cover:

```text
DELTA_FRAGMENTS=PASS
CUMULATIVE_FRAGMENTS=PASS
CUMULATIVE_OVERLAP_DEDUPLICATION=PASS
ENGLISH_AND_JAPANESE_TEXT=PASS
TURN_COMPLETE_FINALIZATION=PASS
ABORT_DISCARDS_UNFINISHED_TEXT=PASS
AUDIO_BRIDGING_REGRESSION=PASS
FOCUSED_RESULT=10_PASS_0_FAIL
```

### U2 sanitized timing markers

Timing is opt-in with `SLATE_VOICE_TIMING=1`. It emits stage name, monotonic
process timestamp, and no transcript, audio, credential, provider payload,
session identifier, or user data. Firmware timing is opt-in with the existing
`SLATE_EPD_TIMING=1` diagnostic build definition. The nearest observable
boundaries are documented rather than presented as more precise than they
are.

```text
T_DEVICE_LISTEN_START=firmware_send_listening_or_backend_listen_observation
T_FIRST_DEVICE_AUDIO_SENT=first_device_packet_released_for_transport
T_BACKEND_FIRST_AUDIO_RECEIVED=first_backend_binary_packet_observed
T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN=live_connect_resolved
T_PROVIDER_FIRST_OUTPUT_EVENT=first_nonempty_model_output_text
T_PROVIDER_FIRST_AUDIO_EVENT=first_model_audio_event
T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=first_encoded_packet_written_to_socket
T_DEVICE_FIRST_AUDIO_PLAYBACK=first_decoded_pcm_write_to_audio_player
T_TRANSCRIPT_FINALIZED=turnComplete_flush
T_UI_RENDER_REQUEST=scene_render_entry
T_EPD_REFRESH_COMPLETE_IF_AVAILABLE=refresh_command_completion
```

### Published latency budget

This zero-provider source/build checkpoint publishes the complete stage
separation. Numeric end-to-end values require a later authorized physical
trace and are intentionally not invented here.

| Segment | Boundary markers | Current evidence |
| --- | --- | --- |
| Device capture and frame buffering | `T_DEVICE_LISTEN_START` -> `T_FIRST_DEVICE_AUDIO_SENT` | Instrumented; physical value pending |
| NOTE4 -> Orange Pi transport | `T_FIRST_DEVICE_AUDIO_SENT` -> `T_BACKEND_FIRST_AUDIO_RECEIVED` | Both endpoints instrumented; cross-device value pending |
| Gemini/provider response | `T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN` -> `T_PROVIDER_FIRST_OUTPUT_EVENT` / `T_PROVIDER_FIRST_AUDIO_EVENT` | Instrumented; no provider call in this campaign |
| Backend codec/protocol | `T_PROVIDER_FIRST_AUDIO_EVENT` -> `T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE` | Instrumented; deterministic timing value pending |
| Orange Pi -> NOTE4 transport | `T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE` -> `T_DEVICE_FIRST_AUDIO_PLAYBACK` | Both endpoints instrumented; physical value pending |
| Device decode/playback start | `T_DEVICE_FIRST_AUDIO_PLAYBACK` | Instrumented at first PCM write |
| UI/render/e-ink refresh | `T_TRANSCRIPT_FINALIZED` -> `T_UI_RENDER_REQUEST` -> `T_EPD_REFRESH_COMPLETE_IF_AVAILABLE` | Instrumented; fragment-driven redraw path removed by final-turn publication |

```text
LATENCY_BUDGET=PUBLISHED_STAGE_SEPARATION_ONLY
NUMERIC_END_TO_END_LATENCY=NOT_MEASURED_NO_PHYSICAL_RETEST_AUTHORIZED
MEASURED_LOCAL_LATENCY_IMPROVEMENT_MS=NOT_MEASURED
PROVIDER_BEHAVIOR_CHANGED=NO
```

### Deterministic qualification checkpoint

```text
BACKEND_FOCUSED_TESTS=10_PASS_0_FAIL
BACKEND_FULL_REGRESSION=329_PASS_5_SKIP_4_FAIL_5_ERRORS_KNOWN_BASELINE
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
GIT_DIFF_CHECK=PASS
ESP_IDF=5.5.2
ESP_TARGET=ESP32S3
ESP_IDF_BUILD=PASS
ESP_APP_BINARY_SHA256=edf94e0c4f78b1f6f40475679eeffd16aeb629cd50127beb25c2ab1f6a122abb
ESP_MERGED_BINARY_SHA256=7bf1f37b3c79bb7a01220cb8e168b74413db82f38e942687b3c9be7b94be7a65
```

The four full-regression failures and five errors match the pre-existing
Nest/Bun decorator baseline recorded by the repository; no unrelated repair
was made. Exact independent Grok 4.6 review remains the next authorized
stage.

## U4 — ARM64 provider-disabled qualification checkpoint

```text
SOURCE_SHA=931103bb96e05f38ebfbf4b4c10f3ebd932fb201
ARM64_IMAGE_ID=sha256:97fe79b0cfce5d7b6b17eef67395c9890a7ab7af1443e375f53a3c016fcb7f8b
ARM64_IMAGE_PLATFORM=linux/arm64
ARM64_DOCKER_BUILD=PASS
ARM64_NODE_LIVE_SDK_LOAD=PASS
ARM64_NETWORK=NONE
ARM64_PROVIDER_CALLS=0
ARM64_FULL_ADAPTER_MOCK_E2E=6_PASS_0_FAIL
ARM64_XIAOZHI_COALESCING_TESTS=10_PASS_0_FAIL
ARM64_CREDENTIAL=NOT_MOUNTED
ARM64_AUDIO=NOT_CAPTURED_OR_RETAINED
```

The image was built from the exact Dockerfile and source commit with `.env`,
firmware, build output, and runtime data excluded by the existing build
context. The test run used only a disposable tmpfs synthetic test file for
the provider-disabled credential seam; it did not mount or read any Gemini
credential. The production daemon, image store, network, backend, MySQL, and
device were untouched.

```text
READY_FOR_EXACT_GROK_REVIEW=YES
READY_FOR_DEPLOY_AND_PHYSICAL_RETEST=NO_GROK_REVIEW_PENDING
```

## U4-A — bounded whitespace-preservation correction

The pre-review self-audit found that trimming each fragment before merging
could remove a provider-supplied leading space at a valid delta boundary
(for example, `Hello` followed by ` world`). The merge helper now compares
trimmed views for cumulative/duplicate detection but preserves the original
fragment boundary when concatenating deltas, with final display trimming only
at turn flush. This is within the authorized transcript-coalescing scope.

```text
CORRECTION_SCOPE=TRANSCRIPT_FRAGMENT_MERGE_ONLY
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
FIRMWARE_FLASHED=NO
FOCUSED_REQUALIFICATION=10_PASS_0_FAIL
TYPECHECK=PASS
LINT=PASS
GROK_REVIEW_OF_PREVIOUS_SHA=DISCARDED_BEFORE_VERDICT
ARM64_IMAGE_REBUILD=REQUIRED
```

The previously built ARM64 image was not treated as qualified for this
corrected source and will be rebuilt and re-run before the exact Grok review.

## U4-B — corrected artifact qualification checkpoint

```text
SOURCE_SHA=aae1c1fefce5e6c4ca4dbc2cd4d50f44ed4863d3
ARM64_IMAGE_ID=sha256:fcfa4b8deaeb4321becddffe6d9cb9bc30bd180a72c49ce9e9b95193aadd45c4
ARM64_IMAGE_PLATFORM=linux/arm64
ARM64_DOCKER_BUILD=PASS
ARM64_NODE_LIVE_SDK_LOAD=PASS
ARM64_NETWORK=NONE
ARM64_PROVIDER_CALLS=0
ARM64_FULL_ADAPTER_MOCK_E2E=6_PASS_0_FAIL
ARM64_XIAOZHI_COALESCING_TESTS=10_PASS_0_FAIL
ARM64_TOTAL=16_PASS_0_FAIL
ARM64_CREDENTIAL=NOT_MOUNTED
```

The corrected image was rebuilt from the exact pushed source and replayed
with the real Bun parent/Node child mock boundary. The provider-disabled
test used only a disposable tmpfs synthetic file; no Gemini credential was
mounted or read. The firmware source tree is identical to the previously
built ESP-IDF candidate, so the exact `esp32s3` / IDF 5.5.2 build evidence
above remains valid for this backend-only correction.

```text
CORRECTED_SOURCE_ARM64_REQUALIFICATION=PASS
READY_FOR_EXACT_GROK_REVIEW=YES
READY_FOR_DEPLOY_AND_PHYSICAL_RETEST=NO_GROK_REVIEW_PENDING
```
