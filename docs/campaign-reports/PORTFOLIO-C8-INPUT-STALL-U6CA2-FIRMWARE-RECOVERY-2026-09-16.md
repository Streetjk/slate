# C8 input-stall regression and U+6CA2 firmware provenance recovery

## Scope

This report records safe host qualification only. No NOTE4 serial node was
opened, no Voice session or physical retest was run, and no firmware was
flashed. The deployed application and running firmware remain unchanged.

## Technical decision

The controlling bounded Grok decision classified the post-long-output input
stall as incomplete evidence rather than a proven product defect. It selected
the existing listen-rearm seam for host regression and prohibited a speculative
runtime repair. The seam is:

```text
pending_listen_after_playback
 -> WaitForPlaybackQueueEmpty(0)
 -> SendStartListening
 -> EnableVoiceProcessing(true)
 -> InputTask read/encode tick
```

The decision also required bounded recovery of the exact pinned
`78/esp-ml307` input before accepting a new firmware build.

## Input-stall evidence

`firmware/test/voice_rearm_host_test.cc` is a deterministic C++17 model of the
production rearm seam. It exercises:

- 32-frame long playback;
- the final synchronous playback write held in flight;
- blocked playback drain not rearming input;
- release of the write followed by StartListening and voice-processing enable;
- an input encode tick after rearm;
- encode/send leftovers characterized without incorrectly extending the
  playback-idle predicate.

Command and result:

```text
c++ -std=c++17 -Wall -Wextra -Werror firmware/test/voice_rearm_host_test.cc -o <temporary-test-binary>
<temporary-test-binary>
voice_rearm_host_test: PASS (long playback, in-flight write, blocked drain, post-rearm input)
```

The test proves the expected ordering and the first observable gating seam in
the model. It does not reproduce the operator's stall in production hardware,
nor prove that codec, transport, microphone, provider, or display timing is
the cause. Therefore no product runtime repair is justified:

```text
INPUT_STALL_STATUS=INCOMPLETE_HOST_REGRESSION_PASS_NO_PRODUCT_DEFECT
INPUT_STALL_FIRST_BOUNDARY=LISTEN_REARM_AFTER_TTS_STOP_PLAYBACK_DRAIN_TO_START_LISTENING
INPUT_STALL_PRODUCT_REPAIR=NONE_NOT_PROVEN
```

## Firmware input provenance

The candidate source is mechanically equivalent to PR2 firmware paths at
`9074daa71f1b065522942b70699f50a2907d944b`. The U+6CA2 source is already
represented in that candidate (`firmware/main/resources/fonts/voice_font_16.c`
and `zfull_16.c`, plus their generator/test inputs); no new product source
mutation was made for this recovery slice.

The recovered generated component input has:

```text
COMPONENT=78/esp-ml307
VERSION=3.6.5
REPOSITORY_COMMIT=ab4de7c28c8b8f809eba2f56f38090d57fce984d
LOCK_COMPONENT_HASH=5231991281a2f48f0e34ec705c2982936264d8b14f6f9373e60b153fd4b62123
COMPONENT_INTEGRITY_METADATA=present
UPSTREAM_CHECKSUM_MATCH=49/50
INTENTIONAL_OVERLAY_PATH=src/web_socket.cc
INTENTIONAL_OVERLAY_SHA256=68d232f23a21a05aab8b51cec4e4733268137d8584b90681c30535dc1618efae
INTENTIONAL_OVERLAY_HISTORY_MATCH=YES
```

The one checksum difference is the tracked Slate overlay, not an unreviewed
component substitution.

## Exact unflashed candidate

Built in the existing `espressif/idf:v5.5.2` Linux container for ESP32-S3.
The container build completed and its image metadata was valid. The copied
worktree gitfile was not resolvable inside the container, so source identity is
bound to the explicit repository SHA above rather than inferred from container
Git metadata.

```text
FIRMWARE_CANDIDATE_BIN_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
FIRMWARE_CANDIDATE_BIN_BYTES=2538064
FIRMWARE_CANDIDATE_ELF_SHA256=5e01c88e64ab7160a262cb931fb90667413327ee353c6334c0903fe792d043d6
FIRMWARE_CANDIDATE_BUILD_MANIFEST_SHA256=fcd725f2c850dcf29fb8e4b8427ef6674d53a29f660a77eaa531cb9bbb8891b3
FIRMWARE_CANDIDATE_SCOPE=ESP32-S3_APPLICATION_IMAGE_ONLY_UNFLASHED
FIRMWARE_PARTITION_CHECK=PASS_0x26ba50_WITHIN_0x400000_APP_PARTITION
```

The candidate is a new hash and does not inherit any prior f6bd flash
authority. It is not deployed or flashed. Fresh exact-artifact Grok review is
complete for this candidate; the review is not a flash authorization.

## Qualification results

```text
VOICE_REARM_HOST_TEST=PASS
AUDIO_PATH_MARKERS=PASS
SANITIZED_FRAME_MARKERS=PASS
VOICE_FONT_COVERAGE=PASS_INCLUDING_U+697D_U+6CA2_U+66C7_AND_REQUIRED_JAPANESE_FIXTURES
WEBSOCKET_EVENT_LOSS_REGRESSION=PASS
COMPONENT_LOCK_AND_INTEGRITY=PASS_49_OF_50_PLUS_EXPECTED_TRACKED_OVERLAY
FIRMWARE_BUILD=PASS
FIRMWARE_EXACT_ARTIFACT_REVIEW=PASS_P0_NONE_P1_NONE_P2_DOCUMENTED_LIMITATIONS_SECURITY_NONE
GIT_DIFF_CHECK=PASS
PRIVACY_SCOPE=NO_RAW_AUDIO_TRANSCRIPT_CREDENTIALS_OR_PRIVATE_DEVICE_DATA
```

## Boundaries and next action

The deployed Weather repair candidate remains separate and un-deployed. The
current running firmware identity remains the previously activated f6bd image.
No physical acceptance, serial observation, reset-cause attribution, or input
stall root cause is claimed here. The exact-artifact review is complete. Any
new firmware flash authority must be requested separately for this exact hash.

```text
PHYSICAL_REQUALIFICATION=NOT_RUN
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
```

## Fresh exact-artifact review

```text
REVIEWER=grok -m grok-4.6
VERDICT=PASS
P0=none
P1=none
P2=input stall remains unproven; physical/device validation deferred; build-container gitfile unresolved but source SHA-bound
SECURITY=none
REVIEWED_SOURCE=9074daa71f1b065522942b70699f50a2907d944b
REVIEWED_FIRMWARE_BIN_SHA256=5346a2d5e045d50ca7dca2f6cc9b79aa39351aad9189205edf7f9b104da4fcda
REVIEWED_FIRMWARE_BIN_BYTES=2538064
REVIEWED_FIRMWARE_ELF_ID=5e01c88e64ab7160a262cb931fb90667413327ee353c6334c0903fe792d043d6
REVIEWED_FONT_ID=Voice_Font_16=9f1670ea5f129ece966f0311adf164ae07573670e5198c824418fae404174e7e;Zfull_16=519a1c30202dc2c5493a323414d42c31de47c5ef184d64e4bd9c21f3d28701e3
```

The review confirmed the exact binary and ELF identities, accepted the
provenance-matching intentional component overlay, and found no blocking
firmware issue. It explicitly preserved the input-stall uncertainty and did
not authorize flashing or physical testing.
