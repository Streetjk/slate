# Campaign 8D1M-G — progressive turn lag followed by device freeze

## Operator evidence to consume

A physical Voice AI session has already occurred after the exact approved Gemini runtime configuration restore.

Operator observations from that single session:

```text
INITIAL_SCREEN_RESPONSE=QUICKER_THAN_PREVIOUS_BUILD
INITIAL_CHAT_RESPONSE=QUICK
LATENCY_BEHAVIOR=DEGRADES_AFTER_SEVERAL_TURNS
CHAT_BUBBLE_ORDER=CORRECT_PHYSICALLY_CONFIRMED
DEVICE_STATE_AFTER_SESSION=APPEARS_FROZEN
JP_GLYPH_ACCEPTANCE=NOT_CONFIRMED_BY_OPERATOR_REPORT
AUDIBLE_AUDIO_ACCEPTANCE=NOT_CONFIRMED_BY_OPERATOR_REPORT
```

Treat the pending human boundary as consumed. Do not request another physical retry while nonphysical work remains.

## Immediate preservation rule

Before asking the operator to power-cycle, reset, reflash, or press additional controls, ingest all currently available sanitized observer/backend evidence from the frozen or recently frozen state. If the device is still attached and electrically safe, preserve the state long enough to capture structural evidence first.

Do not retain raw transcripts, raw serial text outside the approved allow-list, raw audio/PCM, provider payloads, credentials, auth headers, private Calendar/Outlook data, or endpoint secrets.

If the device independently recovers or reboots, record that structurally. If a watchdog/reset reason is available, record only the reset class/reason and sanitized counters/timestamps.

## Required attribution

The new evidence changes the latency hypothesis from a fixed startup delay to a **stateful/session-length-dependent degradation**. Determine what grows with turn count and whether the final freeze is the terminal manifestation of the same accumulation.

Attribute the earliest growing or blocked stage across turns using existing instrumentation and safe deterministic inspection. At minimum distinguish:

```text
PROVIDER_TURN_LATENCY_GROWTH=
PROVIDER_CONTEXT_OR_SESSION_BACKLOG=
NODE_BRIDGE_STDIO_BACKLOG=
BACKEND_EVENT_QUEUE_GROWTH=
BACKEND_TRANSCRIPT_BUFFER_GROWTH=
PRE_PROVIDER_MIC_QUEUE_GROWTH=
AUDIO_PACKET_BACKLOG_GROWTH=
WEBSOCKET_SEND_BACKLOG_GROWTH=
FIRMWARE_RX_QUEUE_GROWTH=
AUDIO_DECODER_QUEUE_GROWTH=
AUDIO_PLAYER_QUEUE_GROWTH=
LVGL_EVENT_OR_RENDER_QUEUE_GROWTH=
EPD_REFRESH_QUEUE_GROWTH=
HEAP_TREND=
PSRAM_TREND=
TASK_STACK_OR_WATCHDOG_EVIDENCE=
DEADLOCK_OR_MUTEX_WAIT_EVIDENCE=
RESET_OR_WATCHDOG_REASON=
FREEZE_SCOPE=UI_ONLY|VOICE_TASK_ONLY|AUDIO_TASK_ONLY|NETWORK_TASK_ONLY|WHOLE_DEVICE|UNKNOWN
DOMINANT_GROWING_STAGE=
FREEZE_ROOT_CAUSE_CLASS=
```

Use per-turn numeric timing already deployed where available. Compare early-turn versus late-turn timings rather than relying on one aggregate latency number.

## Bubble ordering

The operator physically confirms chat bubbles now behave correctly. Record this as physical confirmation and do not reopen the turn-order repair unless later evidence contradicts it:

```text
TURN_ORDER_PHYSICAL_ACCEPTANCE=PASS
```

Preserve one logical user bubble and one logical assistant bubble per turn.

## Japanese and audio

Do not mark Japanese glyph or audible-audio acceptance as passed merely because the session otherwise worked. They remain open unless the observer provides structural audio-chain proof and/or the operator explicitly reported the physical result.

## Recovery principles

Do not guess that Gemini context length alone is responsible. Prove whether the degradation originates in provider latency, bridge/backend accumulation, firmware queues/resources, e-ink rendering, or a cross-layer interaction.

Do not solve progressive lag by simply truncating conversation state, reducing quality, disabling streaming, disabling audio, or restarting the session every few turns unless evidence shows that is the minimal correct design and conversation continuity requirements remain satisfied.

If a bounded host-side or firmware-side reproduction can simulate N sequential turns without provider calls, use it to expose queue/memory/resource growth deterministically.

If runtime bytes must change, follow the established chain:

```text
evidence -> Codex adjudication -> designated AGY Gemini 3.8 Flash minimal repair -> deterministic regression including multi-turn soak -> impacted backend/firmware tests -> privacy/secret scan -> exact build/freeze -> fresh ZAI glm-5.3-flash review -> bounded deploy/app-only reflash if authorized -> requalification -> observer rearm
```

Require a multi-turn regression/soak test that proves bounded queues/resources and no monotonic latency growth attributable to Slate over a representative sequence.

Also harden the deployment path so the exact approved Gemini runtime configuration cannot silently disappear on future Slate container recreation. Qualification must fail closed if required non-secret configuration keys are absent. Do not store credential values in Git or logs.

Only return to a new physical EN/JA acceptance boundary after all safe nonphysical work is exhausted and the observer is rearmed.

Keep PR #2 OPEN / DRAFT / UNMERGED.
