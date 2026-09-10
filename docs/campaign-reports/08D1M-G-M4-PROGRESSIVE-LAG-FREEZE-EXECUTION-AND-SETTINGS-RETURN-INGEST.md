# Campaign 8D1M-G — progressive lag/freeze execution and post-freeze Settings return ingest

## Reconciliation

Live GitHub reconciliation was performed against PR #2 at head `d8d183c52691e3858fd913f81ae5a5bba90bc0d9`. PR #2 remains OPEN / DRAFT / UNMERGED. The progressive-lag/freeze report and the post-freeze return-to-Settings addendum were read from that exact live head.

The operator’s one combined physical boundary is consumed. No retry, button press, reboot, power-cycle or reflash was requested or performed before this evidence checkpoint.

## Sanitized evidence preserved before reset

The corrected observer launchd job was still running on `/dev/cu.usbmodem31101` with an open serial descriptor, but its current stdout was `/dev/null`. Its approved JSONL file was unchanged from the earlier `19:55:35` timestamp and therefore contained no records for the consumed `22:27Z` session. Raw serial content was not retained or recovered.

The backend allow-listed marker stream preserved this progression:

```text
VOICE_WS_UPGRADE_ATTEMPT=YES
VOICE_WS_AUTH_RESULT=PASS
VOICE_WS_ACCEPTED=YES
T_DEVICE_LISTEN_START_MS=1788906459435
T_FIRST_DEVICE_AUDIO_SENT_MS=1788906459512
T_BACKEND_FIRST_AUDIO_RECEIVED_MS=1788906459512
PROVIDER_SESSION_CREATE_RESULT=PASS
PROVIDER_SESSION_STARTED=YES
T_PROVIDER_SESSION_READY_MS=1788906461100
T_PROVIDER_FIRST_OUTPUT_EVENT_MS=1788906467863
T_TRANSCRIPT_FINALIZED_MS=1788906471611
PROVIDER_SESSION_CREATE_START=NO  # repeated later turns; same live provider session
```

The first measurable turn decomposes to 77 ms listen→first backend audio, 1,665 ms listen→provider ready, 8,428 ms listen→provider output, and 11,726 ms listen→transcript final. Provider-ready→first output is 6,763 ms; output→transcript final is 3,748 ms. The deployed timing trace is first-occurrence-only, so it cannot establish per-turn growth. No `LIVE_FAILURE_SOURCE` or provider error/close marker was emitted.

The service container remained healthy with restart count 0 and `OOMKilled=false`; MySQL also remained healthy. No sanitized backend markers proved heap exhaustion, queue overflow, watchdog, panic, deadlock or mutex failure. The backend image remained the approved `slate:m4-slow-turn-order-jp-7acb8b9`.

## Mechanical classification of the Settings return

```text
RETURN_TO_SETTINGS_OBSERVED=YES_OPERATOR_REPORTED
BOOT_SEQUENCE_OBSERVED_AFTER_FREEZE=NO_CAPTURED
RESET_REASON_CLASS=UNKNOWN
WATCHDOG_REASON_CLASS=UNKNOWN
BROWNOUT_OR_POWER_RESET_EVIDENCE=UNKNOWN
UPTIME_CONTINUITY=UNKNOWN
VOICE_WS_CLOSE_OBSERVED=NO
VOICE_SESSION_CLOSE_OR_END_OBSERVED=NO
UI_SCENE_EXIT_EVENT_OBSERVED=NO_CAPTURED
PENDING_BUTTON_EVENT_DRAINED_AFTER_DELAY=UNKNOWN
TASK_WATCHDOG_OR_PANIC_MARKER=NO_CAPTURED
FATAL_MARKER_COUNT=0_IN_AVAILABLE_BACKEND_OBSERVATION
RECOVERY_CLASS=UNKNOWN
```

The Settings image alone does not distinguish delayed input, normal Voice exit, watchdog/software reset or power reset. The priority evidence classes were unavailable because the observer output was redirected to `/dev/null`; backend evidence shows neither a normal Voice teardown nor a reset lifecycle. Therefore the return is recorded as `UNKNOWN`, not as a reboot, delayed button, or normal exit.

## Codex adjudication before mutation

The current evidence proves the session crossed WebSocket upgrade, backend authentication, provider session creation, provider start, microphone ingress and provider output. It does not prove a growing provider context, bridge stdio backlog, backend queue, WebSocket send backlog, firmware audio queue, LVGL/EPD queue, heap/PSRAM exhaustion or reset.

Static inspection found bounded firmware queues (decode 40, send 40, playback 2) and a bounded UI event queue of 64. However, every Voice snapshot change posts a UI event with a 50 ms producer wait, and each consumed event can synchronously run LVGL layout/render before the EPD refresh task. This is a credible cross-layer latency/backpressure boundary, but not yet proven as the freeze cause. The backend text-message promise chain, Node bridge JSONL stdin loop and WebSocket sends likewise lack per-turn depth/backpressure telemetry.

The next safe action is therefore deterministic per-turn attribution and bounded resource instrumentation/reproduction, with repair only at the earliest demonstrated boundary. The existing bubble-order, Japanese-font and audio-chain repairs remain preserved. Audio acceptance remains open because no provider-audio-to-player marker was captured.

## Required continuation

1. Add sanitized per-turn timing and queue/resource snapshots without retaining transcripts, audio, credentials or provider payloads.
2. Reproduce sequential turns in host-side backend/bridge and firmware-safe bounded tests where possible.
3. Repair only the proven dominant accumulation, retaining streaming output and turn ordering.
4. Add deterministic fail-closed validation for the approved non-secret `GEMINI_*` runtime configuration and read-only secret mount.
5. Run AGY minimal implementation, deterministic tests including multi-turn soak, privacy/secret scan, exact build/freeze and fresh ZAI `glm-5.3-flash` review.
6. Deploy/reflash only the bounded reviewed artifacts if required, requalify and rearm the observer with durable redirected output.

PR #2 must remain OPEN / DRAFT / UNMERGED.
