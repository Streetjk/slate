# Campaign 8A — NOTE4 Voice routing / Tenclass activation blocker

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2 — `feat(note4): evaluate Gemini 3.5 Live voice stack`

This addendum is newer than `08-GEMINI-35-LIVE-INSTRUCTIONS.md` and governs the physical voice-routing defect discovered before Campaign 8 execution began. Read both directives; where they conflict, this addendum takes precedence.

## Physical evidence

A real NOTE4 test showed:

- double-tap ENTER successfully opens Voice AI;
- microphone/audio capture is working;
- the device hears the user and renders speech/transcript UI;
- Voice AI then displays a Chinese activation message asking the user to log in to a control panel and add the device, with a temporary verification code.

Do not record or depend on any transient activation code in Git, reports, tests, screenshots, or configuration.

Record the physical result as:

- `MIC_CAPTURE=PASS`
- `VOICE_UI=PASS`
- `LEGACY_XIAOZHI_ACTIVATION_DETECTED=YES`
- `SLATE_GEMINI_VOICE_E2E=FAIL/BLOCKED`

## Root-cause lead already established

Current firmware contains the legacy Xiaozhi activation/configuration client:

- `firmware/main/xiaozhi/config/activation_client.h`
- `ActivationClient::kConfigUrl = "https://api.tenclass.net/xiaozhi/ota/"`
- `ActivationClient::kLanguage = "zh-CN"`

`XiaozhiService` enters `kAwaitingActivation` when no local protocol configuration exists and the external Xiaozhi configuration service returns an activation flow.

Treat this as a production integration defect for this NOTE4 project. The user must not need a Tenclass/Xiaozhi vendor account or control-panel pairing for the finished product.

## Required target architecture

Production voice path must be Slate-owned:

`NOTE4 -> authenticated Slate backend -> Slate voice/Xiaozhi-compatible transport -> Gemini Live`

The NOTE4 may retain useful Xiaozhi-derived firmware audio/UI/protocol components, but production configuration, routing, authentication, and model selection must not depend on `api.tenclass.net`, a vendor activation code, or a Xiaozhi/Tenclass user account.

Backend remains the Gemini model authority. Firmware must not embed Gemini credentials or model IDs.

## Phase R0 — reconcile current voice architecture

Before model migration work, trace the exact current path end-to-end:

1. NOTE4 ENTER/button path into `XiaozhiScene` and `XiaozhiService`.
2. `settings::HasProtocolConfig()` persistence and lifecycle.
3. `ActivationClient::Fetch()` / activation fallback behavior.
4. protocol configuration written into NVS (`mqtt` / `websocket`).
5. actual voice WebSocket/MQTT endpoint selected after configuration.
6. existing Slate backend Xiaozhi/voice endpoint(s), including device authentication.
7. backend bridge into `GeminiLiveService`.

Publish a sequence diagram in `08-GEMINI-35-LIVE.md` showing the current broken path and the intended Slate-owned path.

## Phase R1 — remove external vendor activation dependency

Implement the smallest robust migration that preserves working audio/UI code while eliminating the external Tenclass activation dependency from the production path.

Preferred properties:

- reuse the existing Slate `device_id` / `device_secret` identity where practical;
- NOTE4 obtains voice session/configuration from the configured Slate server address;
- use authenticated Slate device endpoints rather than public vendor activation;
- no second user-facing pairing system unless mechanically unavoidable;
- no static cloud credentials in firmware;
- no manual token copying;
- no fallback to Tenclass/Xiaozhi vendor cloud in production;
- existing Slate server address remains the single backend authority;
- existing Google Calendar Confirm/Cancel semantics remain unchanged;
- Outlook isolation remains unchanged.

If a compatibility configuration endpoint is needed on Slate, keep it narrow, authenticated, versioned, and deterministic. It may return only the protocol/session information needed by the NOTE4. Do not expose Gemini or Google credentials.

## Phase R2 — language/UI cleanup for activation path

The production Voice AI path must not display vendor Chinese activation text. Because the intended design removes vendor activation entirely, do not merely translate the Tenclass prompt and keep the dependency.

Any Slate-owned voice configuration error shown to the user should be concise English and describe the actual Slate condition (for example backend unavailable, device authentication invalid, or voice service not configured).

## Phase R3 — regression and security tests

Add deterministic tests proving at minimum:

- production firmware does not contact `api.tenclass.net` during normal Voice AI startup;
- no production constant silently falls back to the Tenclass/Xiaozhi activation endpoint;
- NOTE4 voice configuration is derived from the configured Slate server address;
- device authentication is required for Slate voice configuration/session setup;
- no Gemini/Google secrets are returned to firmware;
- existing device pairing is reused where designed;
- Voice AI ENTER/button mapping is unchanged;
- calendar proposal Confirm writes exactly once and Cancel writes zero times;
- Outlook data remains inaccessible to Gemini;
- EN/JP voice requirements remain intact;
- network/config failure produces a Slate-owned error, not a vendor activation code.

A test that only mocks away the vendor path is insufficient: inspect production constants and compiled/runtime routing mechanically.

## Relationship to Gemini Live model evaluation

After R0/R1 are implemented and deterministic tests pass, continue the original Campaign 8 model evaluation from `08-GEMINI-35-LIVE-INSTRUCTIONS.md`.

Do not confuse the two issues:

- routing/auth defect: NOTE4 currently falls into legacy Tenclass activation;
- model choice: determine the best currently supported Gemini Live architecture after Slate owns the voice path.

It is acceptable for the routing fix to land in the same PR because PR #2 is already scoped to the NOTE4 voice stack. Keep commits logically separated so the vendor-dependency removal can be reviewed independently from model-selection changes.

## Validation

Run all original Campaign 8 gates plus:

- firmware exact ESP-IDF `v5.5.2` build if firmware changes;
- backend/shared tests for new Slate voice configuration/session endpoints;
- negative device-auth tests;
- secret scan;
- source scan for `api.tenclass.net` and other production vendor fallback URLs;
- bounded local/runtime protocol test against Slate backend;
- AGY independent review with high effort for auth/routing changes.

## Physical flash boundary

Implementation, tests, review, and artifact generation are authorized.

Do not automatically flash the replacement firmware.

Before requesting flash authorization, publish:

- exact root cause;
- exact firmware/backend changes;
- proof Tenclass activation is removed from the production path;
- test/build results;
- AGY verdict;
- firmware artifact hashes;
- rollback artifact/reference;
- `READY_FOR_SLATE_VOICE_FLASH=true|false`.

Then stop at the physical firmware-flash boundary.
