# Campaign 8D1M-G M4 — Progressive-Lag Freeze Repair, Exact Build, and ZAI Boundary

## Execution checkpoint

This report consumes the single physical boundary from the progressive-lag/freeze
session and the post-freeze Settings observation. No retry, power-cycle, reset, or
reflash was performed before structural evidence capture.

```text
CAMPAIGN=8D1M_G_VOICE_WORKS_LATENCY_TEXT_AUDIO_RECOVERY
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
SOURCE_COMMIT=8a51da3
PHYSICAL_BOUNDARY_CONSUMED=YES
```

## Mechanical attribution of the consumed session

The available sanitized backend markers establish the earliest successful
progression as:

```text
VOICE_WS_UPGRADE_ATTEMPT=YES
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
PROVIDER_SESSION_CREATE_RESULT=PASS
PROVIDER_SESSION_STARTED=YES
FIRST_MIC_FRAME_RECEIVED=YES
PROVIDER_FIRST_OUTPUT_EVENT=YES
TRANSCRIPT_FINALIZED=YES
LIVE_FAILURE_SOURCE=NOT_EMITTED
```

The first-turn numeric decomposition was:

```text
LISTEN_TO_FIRST_BACKEND_AUDIO=77ms
LISTEN_TO_PROVIDER_READY=1665ms
LISTEN_TO_PROVIDER_FIRST_OUTPUT=8428ms
LISTEN_TO_TRANSCRIPT_FINAL=11726ms
PROVIDER_READY_TO_FIRST_OUTPUT=6763ms
FIRST_OUTPUT_TO_TRANSCRIPT_FINAL=3748ms
```

Therefore no Voice/WebSocket/provider failure is proven in this attempt. The
dominant measured first-turn stage was provider-ready to first output (6,763 ms),
but progressive per-turn growth cannot be numerically reconstructed because the
deployed trace was first-occurrence-only and the corrected observer's launchd
stdout was redirected to `/dev/null`. The structural observer process remained
running, but no current-session records were durably captured.

The return to Settings is mechanically `RECOVERY_CLASS=UNKNOWN`: no boot marker,
uptime discontinuity, watchdog/reset reason, WebSocket close, provider close, or
scene/navigation event was captured. It is not classified as delayed input,
normal Voice exit, watchdog reset, or software reset.

## Diagnosis and bounded repair

Static inspection and deterministic host concurrency testing identify one credible
accumulation mechanism in the app: every Xiaozhi snapshot change previously posted
an event to a finite 64-entry UI queue while the handler synchronously rendered
and requested e-ink refresh work. The repair coalesces redundant
`kXiaozhiChanged` notifications with an atomic pending flag and nonblocking post;
button events remain FIFO and are not coalesced. This preserves streaming output
and the already-accepted user-before-assistant, one-bubble-per-role behavior.

The candidate also adds sanitized per-turn timing, backend operation/microphone/
WebSocket backlog markers, bridge stdio backlog markers, firmware queue/heap/
audio markers, reset/watchdog markers, and exact approved `GEMINI_*` configuration
qualification. The qualification reports key names and statuses only; it never
reads or logs secret content. It validates the secret as a private regular file
with restrictive permissions and read-only access, while Docker mount read-only
status remains an external deployment inspection.

The physical freeze remains `PHYSICAL_QUEUE_SATURATION_NOT_CAPTURED`; the repair
is supported by source inspection and deterministic multi-turn soak, not claimed
as a retroactively observed queue saturation.

## Deterministic validation

```text
BACKEND_TYPECHECK=PASS
BACKEND_LINT=PASS
FRONTEND_TYPECHECK=PASS
FRONTEND_LINT=PASS
FOCUSED_BACKEND_TESTS=66_PASS_0_FAIL
OBSERVER_SELF_TEST=PASS
FIRMWARE_EVENT_BUS_HOST_TEST=PASS
FIRMWARE_AUDIO_MARKER_TEST=PASS
FIRMWARE_FRAMEBUFFER_HOST_TEST=PASS
FIRMWARE_VOICE_FONT_COVERAGE_TEST=PASS
FIRMWARE_WEBSOCKET_EVENT_LOSS_REGRESSION_TEST=PASS
FIRMWARE_VENDOR_VOICE_DEPENDENCY_TEST=PASS
GIT_DIFF_CHECK=PASS
PRIVACY_SECRET_SCAN=PASS_NO_CREDENTIAL_CONTENT
```

## Exact frozen artifacts

Backend:

```text
BACKEND_TAG=slate:m4-progressive-freeze-8a51da3
BACKEND_PLATFORM=linux/arm64
BACKEND_IMAGE_ID=sha256:45d77127e801e6d8552e01b64dd3f77e4708a6944f9a1933a98a4821ab88a16c
BACKEND_IMAGE_SIZE_BYTES=1130775751
```

Firmware was built with the official `espressif/idf:v5.5.2` toolchain into the
new preserved directory `firmware/build-m4-freeze`:

```text
FIRMWARE_APP_SIZE_BYTES=2535248
FIRMWARE_APP_SHA256=d6cf12371f8c98cc81e102110439f1fbbad3aec153cdbfe53b997413a52ad441
PRIOR_ACCEPTED_APP_SIZE_BYTES=2533424
PRIOR_ACCEPTED_APP_SHA256=4ea31710c6dfd5bff025b5282f2dd5edd49117eacfe4161988dcde0df820c298
FIRMWARE_APP_DELTA_BYTES=1824
APP_PARTITION_FREE_BYTES=1659056
DIRAM_USED_BYTES=237311
DIRAM_REMAINING_BYTES=104449
STATIC_RAM_CHANGE_FROM_JAPANESE_FONT=0
```

The app-only flash target remains offset `0x10000`; no flash has been performed.

## Independent reviewer boundary

The configured route was invoked exactly as `ZAI / glm-5.3-flash /
zai-glm53-reviewer` against commit `8a51da3`. It returned authentication failure
while refreshing model metadata and then exhausted five bounded reconnects before
emitting any verdict:

```text
ZAI_REVIEW_TARGET=8a51da3
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_STATUS=BLOCKED_AUTHENTICATION
ZAI_REVIEW_VERDICT=NONE
ZAI_REVIEW_FAILURE_CLASS=AUTHENTICATION_FAILED
ZAI_REVIEW_RECONNECTS=5
ZAI_REVIEW_SECRET_EXPOSED=NO
```

The unrelated local `glm` convenience command was not used because it targets
GLM 5.2 and would violate the exact reviewer requirement. Deployment, app-only
flash, requalification, and observer rearm are therefore correctly held behind
the designated reviewer authentication/verdict; no unreviewed production bytes
were deployed.

```text
BACKEND_DEPLOYED=NO_REVIEW_AUTH_BOUNDARY
FIRMWARE_APP_FLASHED=NO_REVIEW_AUTH_BOUNDARY
OBSERVER_DURABLE_REARM=PASS_LOCAL_LAUNCHAGENT_STDOUT_STDERR_EXPLICIT
OBSERVER_PID=86863
OBSERVER_SERIAL_DEVICE=/dev/cu.usbmodem31101
OBSERVER_LOG_PATH=/tmp/slate-m4-observer-launchd.jsonl
OBSERVER_ERROR_LOG_PATH=/tmp/slate-m4-observer-launchd.err
OBSERVER_RAW_CONTENT=NO
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=0
EXTERNALLY_BLOCKED_COUNT=1
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=RESTORE_EXISTING_DESIGNATED_ZAI_GLM53_REVIEW_AUTH
TERMINAL_REASON=DESIGNATED_REVIEWER_AUTH_BOUNDARY
NEXT_ACTION=RESTORE_ZAI_AUTH_THEN_RERUN_EXACT_REVIEW_AND_CONTINUE_DEPLOY_REQUALIFY_OBSERVER_REARM
```

PR #2 remains open, draft, and unmerged. No provider, model, credential, billing,
or private-data authority was changed.
