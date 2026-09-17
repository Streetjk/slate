# No-Serial Physical Acceptance Adjudication

Date: 2026-09-14 (Australia/Perth)

## Decision boundary

The existing serial observer gate remains failed closed. The prior idle attach
reset and the campaign-related classification of both serial nodes are
preserved. The operator does not want added USB-UART or other serial-observer
hardware. No serial node was opened for this decision.

```text
SERIAL_OBSERVER_REQUIRED_FOR_PRODUCT_ACCEPTANCE=NO
SERIAL_OBSERVER_DIAGNOSTIC_VALUE=HIGH_FOR_RESET_CAUSE_AND_DEVICE_SIDE_AUDIO_EPD_TIMING_ONLY
ALTERNATE_ACCEPTANCE_VALID=YES_FOR_HUMAN_VISIBLE_CLAIMS_NOT_DEVICE_SIDE_ATTRIBUTION
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
PHYSICAL_ACCEPTANCE_ALLOWED_WITHOUT_SERIAL_OBSERVER=YES
SERIAL_OBSERVER_USED=NO
PHYSICAL_REQUALIFICATION_CONSUMED=NO
REQUALIFICATION_WINDOW_ARMED=NO
```

Grok 4.6 adjudicated that serial observation is primarily a forensic and
device-side attribution channel, not a mandatory gate for answering whether
the repaired NOTE4 product works. A bounded acceptance may use human-visible
NOTE4 behavior with existing backend/network structural telemetry. It must
not upgrade missing device-side evidence into a pass.

## Existing safe evidence channels

The accepted source and artifacts remain unchanged:

```text
BACKEND_SOURCE=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
BACKEND_IMAGE=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
FIRMWARE=sha256:cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
BACKEND_HEALTH_READY=YES
NOTE4_AUTHENTICATED_POLL=UNKNOWN_POST_ACTIVATION_NO_FRESH_SANITIZED_MARKER
```

The established observer tooling can collect local/public HTTP status,
Slate/MySQL health and restart counters, plus sanitized backend language and
timing markers. Those channels do not provide a device pixel, audio, EPD, or
reset-cause observation. The existing physical report similarly records the
Voice and timing fields as UNKNOWN when no correlatable event exists.

## Acceptance evidence matrix

The columns describe evidence available to a future bounded no-serial window,
not a claim that the window has already run.

| Acceptance item | HUMAN_VISIBLE | BACKEND_OBSERVABLE | NETWORK_OBSERVABLE | SERIAL_ONLY | Acceptable without serial |
|---|---|---|---|---|---|
| `楽` / `楽曲` glyph rendering | YES | PARTIAL structural turn/language markers; not display pixels | PARTIAL delivery/session evidence | Runtime font/codepoint/layout markers | YES for visible correct glyph/no square; runtime font attribution remains UNKNOWN |
| English current turn -> English response | YES | PARTIAL derived language-policy/response markers; not actual display | PARTIAL session/packet evidence | NO | YES when the visible/audio response is English |
| Japanese current turn -> Japanese response | YES | PARTIAL derived language-policy/response markers; not actual display | PARTIAL session/packet evidence | NO | YES when the visible/audio response is Japanese |
| Traditional Chinese current turn -> Traditional Chinese response | YES | PARTIAL derived language-policy/response markers; not actual display | PARTIAL session/packet evidence | NO | YES when the visible/audio response is Traditional Chinese |
| Chinese latency attribution | Relative slowness only | PARTIAL backend/provider stages | PARTIAL transport stages | Device listen/UI/EPD endpoints | NO for exact dominant-boundary attribution; relative observation may be recorded |
| Multi-turn lag/freeze/reboot behavior | YES for bounded visible behavior | PARTIAL server/session health | PARTIAL connection evidence | Reset/boot cause and device markers | YES for no observed lag/freeze/reboot during the window; reset cause remains UNKNOWN |
| Clean Voice exit | YES, including audible/UI completion | PARTIAL session-close/error markers | PARTIAL connection close evidence | Device cleanup markers | YES for visible/audible clean exit; device-side cleanup attribution remains UNKNOWN |

`HUMAN_VISIBLE=YES` means a human can accept the product-level outcome during
the bounded window. It does not prove an internal stage or root cause. A
server/network marker is corroboration, not a replacement for device display
or audio observation.

## Replacement gate (prepared, not armed)

```text
SERIAL_OBSERVER_USED=NO
OBSERVER_NONINTERFERENCE_PROVEN=NO_NOT_REQUIRED_FOR_ALTERNATE_ACCEPTANCE
RESET_CAUSE_ATTRIBUTION=UNKNOWN
PHYSICAL_ACCEPTANCE_ALLOWED_WITHOUT_SERIAL_OBSERVER=YES
```

The following checklist is prepared for a later operator-started window; it is
not being requested or executed in this turn:

1. Confirm the exact accepted backend/firmware identities and existing backend
   health are still present. Keep both `/dev/cu.usbmodem31101` and
   `/dev/cu.usbmodem31201` closed and do not run the serial observer.
2. Run one bounded ordinary Voice window using only human-visible NOTE4
   observations and existing backend/network structural telemetry. Do not use
   a synthetic provider qualification call.
3. Exercise the repaired Japanese path naturally and record only whether
   `楽`/`楽曲` is visibly correct or a square/wrong glyph is visible.
4. Exercise English, Japanese and Traditional Chinese as separate current
   turns. Record the displayed/audible response language; previous-turn
   language must not be used as a substitute for current-turn evidence.
5. Record bounded human-observed relative latency and any visible lag, freeze,
   reboot/settings return, or loss of audio/UI progress. Use backend/network
   structural markers where available, without comparing unaligned clocks.
6. Close Voice normally and record whether the human-visible/audible session
   exits cleanly.

Any exact Chinese stage attribution, reset cause, device-side audio timing,
EPD timing, or unobserved runtime marker remains `UNKNOWN`. A visible reboot,
freeze, wrong language, wrong glyph, or unclean exit is a product acceptance
failure even without serial.

## Grok adjudication

```text
PRODUCT_ACCEPTANCE_NECESSITY=FORENSIC_ATTRIBUTION_NOT_CORE_ACCEPTANCE
SERIAL_OBSERVER_REQUIRED_FOR_PRODUCT_ACCEPTANCE=NO
ALTERNATE_ACCEPTANCE_VALID=YES_FOR_HUMAN_VISIBLE_CLAIMS_NOT_A_SUBSTITUTE_FOR_DEVICE_SIDE_ATTRIBUTION
HUMAN_OBSERVATION_SUFFICIENT_FOR_NO_REBOOT_OR_FREEZE=YES
RESET_CAUSE_ATTRIBUTION_WITHOUT_SERIAL=UNKNOWN
PHYSICAL_ACCEPTANCE_ALLOWED_WITHOUT_SERIAL_OBSERVER=YES
PORTFOLIO_DECISION=SPLIT_CORE_ACCEPTANCE_FROM_FORENSICS;PHYSICAL_WINDOW_UNCONSUMED
```

No serial connection, NOTE4 interaction, Voice run, product change, backend
change, firmware change, or authority expansion occurred during this slice.
