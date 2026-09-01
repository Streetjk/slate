# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `76d32460a4c5d6d6a3319af4b8c4b30abfc652bf` (PR #2 Campaign 8A routing candidate; deterministic gates and AGY routing review pass; firmware not flashed)
Campaign instructions SHA: `3446979b695afd40c920af1610f7c0659df4dbee`

Current campaign: Campaign 8 — PR #2 Slate-owned voice routing
Current stage: 8B backend candidate deployment
Current status: BLOCKED_HUMAN_DOCKER_RECOVERY — candidate image is built and the known-good rollback is preserved, but Orange Pi Docker operations hang on a stale builder snapshot. Current production containers remain healthy and compose was restored to the known-good image. No firmware was flashed.

Completed campaigns:

- Campaign 0 — Phase 0 baseline: PASS/READY
  - TypeScript, backend, frontend baseline checks passed.
  - Firmware passed with exact local ESP-IDF `v5.5.2`, target `esp32s3`.
  - Native AGY skill and OAuth smoke test passed.
- Campaign 1A — Shared normalized contracts: PASS
  - Shared schemas and deterministic tests passed.
  - AGY medium-effort final review passed with no findings.
- Campaign 1 — English UI: PASS, pending external-review display cleanup recheck
  - Frontend, backend, shared, and NOTE4 firmware presentation/error text was localized to English.
  - Deterministic gates and exact local ESP-IDF `v5.5.2` firmware build passed.
  - AGY medium/high-effort review loop closed with final PASS and no findings.
  - Independent external review later raised XR-005 regarding remaining user-visible Chinese voice/default labels; recheck required.
- Campaign 1 — BTC/USD: PASS, pending external-review hardening recheck
  - BTC current, daily, weekly, and monthly dynamic content integrated with cached backend data, English configuration controls, and deterministic 1bpp renderer tests.
  - Deterministic gates and exact local ESP-IDF `v5.5.2` firmware regression passed.
  - AGY medium review returned PASS with two accepted P3 hardening observations; fixes were re-reviewed with final PASS and no findings.
  - Independent external review later raised XR-001, XR-002 and XR-003; see `CAMPAIGN-INSTRUCTIONS.md`.
- Campaign 2 — Outlook read-only calendar: PASS
  - User-owned Microsoft OAuth/MSAL + PKCE, encrypted token cache, Graph calendarView normalization, Perth agenda rendering, offline fallback, and English connect UI integrated.
  - Deterministic gates passed: 226 backend tests, lint, typecheck, format, Prisma validation, and frontend build.
  - AGY high-effort review passed with no P0-P3 findings. Live Microsoft consent/account smoke test is deferred to the human OAuth boundary.
- Campaign 3A — Gemini OAuth/ADC feasibility: PASS; report published in `03A-GEMINI-OAUTH-FEASIBILITY.md`
  - Official Google documentation verified ADC/OAuth authentication and the required capability split.
  - `gemini-3.7-flash` is selected for text reasoning, Search grounding, structured output, and function calling.
  - `gemini-live-2.5-flash-native-audio` is selected for live audio, transcription, multilingual interaction, Search, and function calling because Gemini 3.7 Flash does not support Live API.
  - Cloud Speech-to-Text V2 `chirp_3` covers the required English and Japanese locales; TTS has an ADC-compatible Google Cloud path.
- Campaign 3B — Gemini voice, Search, and Q&A: PASS; report publication in `03-GEMINI-VOICE-QA.md`
  - ADC-backed text assistant, configurable Gemini Live native-audio gateway, Xiaozhi WebSocket bridge, Opus/PCM conversion, strict tools, and lifecycle/security tests integrated.
  - Deterministic gates passed: 252 backend tests, 6 shared tests, lint, typecheck, format, Prisma validation, and frontend build.
  - AGY medium final re-review passed after a high-effort REVISE cycle fixed seven lifecycle/codec/controller findings. Live Google ADC account and physical NOTE4 tests remain human-boundary actions.
- Campaign 4 — Google Calendar voice writes: PASS; report publication in `04-GOOGLE-CALENDAR-VOICE.md`
  - Google OAuth/PKCE, encrypted user credentials, proposal validation, single-use confirmation tickets, narrow `events.insert`, voice proposal routing, and NOTE4 confirm/cancel UI integrated.
  - Deterministic gates passed: 267 backend tests, 6 shared tests, lint, typecheck, format, Prisma validation, frontend build, and exact ESP-IDF `v5.5.2`/`esp32s3` Docker build with merged artifacts.
  - AGY high-effort review passed with no P0–P2 findings and one deferred P3 ticket-retention observation.
  - Live Google consent/account testing and physical NOTE4 interaction remain human-boundary actions.
- Campaign 5 — MVP integration/hardening: PASS software gate; reports `05-MVP-FINAL.md` and `05-MVP-PRE-HARDWARE.md`
  - XR-002 BTC trio provisioning was implemented; XR-001, XR-003, XR-004, and XR-005 were rechecked as fixed.
  - Final deterministic regression and exact ESP-IDF Docker build passed; final AGY high-effort adversarial review passed with two deferred P3 operational observations.
  - Hardware flashing, physical NOTE4 flows, and live personal OAuth consent remain pending human action.
- Campaign 6C — Orange Pi backend deployment: PASS through O3; custom ARM64 Slate backend and MySQL are healthy at `http://192.168.50.108:3001`; O4 NOTE4 device handoff remains pending human action.
- Campaign 6D — E-Ink refresh optimization: D0 BASELINE COMPLETE; diagnostic timing source `e32ff24` flashed app-only and physical timing captured. Partial median total `829.26 ms` with `21.80 ms` full-frame transition transfer; full median total `1262.55 ms`. Second-pass windowed partial implementation is pending and has not been flashed.
- Campaign 6E — Public HTTPS + roaming connectivity: E0/E1/E2, addendum A1-A4, V0, S0, and S3 PASS; the NOTE4 Server Address is `https://orangepi5.tail6aabef.ts.net`, existing pairing is preserved, and 40 authenticated device polls returned HTTP 201 in the final 60-minute window. All eight explicitly disabled Snap revisions and the apt cache were removed/cleaned without touching active revisions or Slate/MySQL/Tailscale state. Exact root free space is `3401887744` bytes. Funnel, public health, and Web UI remain verified. True off-LAN and E3 OAuth checks remain HUMAN_PENDING.
- Campaign 1B — external-review hardening: PASS; report published in `01B-EXTERNAL-REVIEW-HARDENING.md`
  - XR-001, XR-003, XR-004, and XR-005 were fixed and re-reviewed by AGY with final PASS.
  - XR-002 BTC D/W/M trio provisioning was confirmed as a real UX gap and deferred to MVP hardening with a named “Add BTC Trio” follow-up.

Blocked campaigns:

- None.

Deferred campaigns / required later gates:

- GitHub Actions workflow registration is infrastructure debt; local exact ESP-IDF fallback is the current reproducible firmware path.
- Live Microsoft/Google OAuth consent and physical NOTE4 testing remain future human-boundary actions.
- XR-002 BTC D/W/M automatic trio UX: RESOLVED in Campaign 5 through authenticated trio provisioning and existing frame navigation.
- XR-004 strict per-tool input schemas: RESOLVED in Campaign 4 through static proposal DTO validation and proposal-only voice dispatch.
- Campaign 6C O4 — Server Address entry is complete and pairing is verified; the remaining physical validation checklist and true off-LAN test remain pending.
- Campaign 6E — S1/S2 cleanup and S3 post-cleanup validation are complete; do not remove active Snap revisions or alter deployment state.
- Campaign 6E E3 — human must register `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/google/calendar/callback` and `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/microsoft/calendar/callback` in the provider consoles, complete any interactive OAuth consent, and enter required secrets directly into the mode-600 Orange Pi environment. Do not share or commit credentials. Then resume E3 live checks.

Active feature branches:

- `feature/english-ui` — PASS; integrated at `eb3c9dbeacf48772b179c6d0d2954fa2120a39ef`
- `feature/btc` — PASS; integrated at `2011ac2c88fcf8c53d12ade1a53269c27b72ee70`
- `feature/external-review-hardening` — PASS; integrated at `5edab3c45e060426fbd0986eac52cf04695d6c0e`
- `feature/gemini-35-live-evaluation` — PR #2 Campaign 8A routing candidate; backend deployment pending Docker daemon recovery.

Last test status: PASS for the existing Campaign 8A candidate — 273 backend tests, 6 shared tests, format, lint, typecheck, frontend build, exact ESP-IDF `v5.5.2`/`esp32s3` build, merged firmware artifacts, and AGY high routing review. Backend deployment validation is pending Docker daemon recovery; candidate endpoint tests have not been claimed.
Last AGY verdict: `BLOCKED_EXTERNAL_REVIEW` — D1 `gemini-3.7-flash-medium` read-only review request timed out without output. Previous Campaign 5 high-effort PASS remains historical and does not review D1.

External review gate:

- XR-001 — BTC stale fallback / central freshness policy: FIXED and rechecked.
- XR-002 — D/W/M automatic cached switching UX: FIXED through BTC trio provisioning and rechecked.
- XR-003 — out-of-range Coinbase timestamp normalization: FIXED and rechecked.
- XR-004 — strict per-tool input contracts before Gemini execution: FIXED and rechecked.
- XR-005 — remaining English display labels/defaults: FIXED and rechecked.

Next automatic action: obtain a returned AGY review for D1 and, only after review PASS plus explicit exact-hash human authorization, perform the physical before/after refresh measurements. Do not flash automatically. Do not begin Airtable/Gantt.

Human action required: YES — provide a genuinely different Internet egress for NOTE4 off-LAN validation and separately complete provider consent/secure environment setup. Never send credentials in chat or reports.

## Campaign 6D D1 Candidate Checkpoint

```text
BASE_SHA=72fffdf4f58e30fd9ca68d7eb18c3df72d44d0a4
CANDIDATE_SHA=7dd15c310c9d5b8e8da0159e3ef9cfeaee95b4da
FULL_IMAGE_SHA256=1d3e9c90b7a3082df3727796ebe959b6c33ba2054f2f87114176227a4dcee1ea
APP_IMAGE_SHA256=3d5e226d55686466deba9860f64713bdefd92eaa8ded9050d3749efb2b250841
ESP_IDF=5.5.2
TARGET=esp32s3
OPTIMIZED_FIRMWARE_FLASHED=NO
PHYSICAL_D1_MEASUREMENTS=NOT_RUN
AGY_D1_REVIEW=BLOCKED_EXTERNAL_REVIEW_NO_RESPONSE
READY_FOR_OPTIMIZED_FLASH=NO
```

## Campaign 8B — Slate Voice Backend Deployment Checkpoint

```text
CAMPAIGN=8B
FEATURE_BRANCH=feature/gemini-35-live-evaluation
STATUS=BLOCKED_DOCKER_DAEMON_RECOVERY
CURRENT_DEPLOYED_SOURCE=948934c9211709fc2bc29d0a8435181ae1ca2814
CURRENT_DEPLOYED_IMAGE=slate-note4:campaign5-runtime-fix-948934c
ROLLBACK_IMAGE=slate-note4:rollback-before-campaign8-948934c
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
CANDIDATE_BACKEND_SOURCE=121622c3bd1d23587b4aadb3a079ec85d2052278
CANDIDATE_IMAGE_ID=sha256:f24a88f4b91766eba7d2e3a4843bb99226026e27eabda8460fa65f3e36dcf41f
CANDIDATE_IMAGE_DEPLOYED=NO
SLATE_HEALTH_CURRENT_IMAGE=PASS
MYSQL_HEALTH_CURRENT_IMAGE=PASS
PUBLIC_HEALTH_CANDIDATE=NOT_RUN
NOTE4_POLLING_CANDIDATE=NOT_RUN
VOICE_CONFIG_AUTH_TEST=NOT_RUN_CANDIDATE_NOT_DEPLOYED
DISK_FREE_BYTES_APPROX=552000000
PERSISTENT_DATA_CHANGED=NO
PRODUCTION_GEMINI_SETTINGS_CHANGED=NO
FIRMWARE_FLASHED=NO
READY_FOR_SLATE_VOICE_FLASH=NO
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION=ssh note4-orangepi; sudo systemctl restart docker
NEXT_ACTION=RESUME_BACKEND_DEPLOYMENT_AFTER_DOCKER_RECOVERY
```

## Campaign 6D D0 Reconciliation

```text
REMOTE_HEAD_BEFORE_RECONCILIATION=3446979b695afd40c920af1610f7c0659df4dbee
DIAGNOSTIC_SOURCE_SHA=e32ff24
CAMPAIGN5_PRODUCTION_SOURCE_SHA=bca05819e2cccc5cfdc128d82ffda052b3913412
DEVICE_PORT=/dev/cu.usbmodem31201
DEVICE=ESP32-S3 QFN56 revision v0.2
DIAGNOSTIC_APP_SHA256=a22b1e00da653abc5faad29f1d561c72859a2e3f6fc7d1de22b56ca4e2467506
DIAGNOSTIC_FLASH=app-only at 0x10000; no erase/bootloader/partition/NVS/LittleFS write
PARTIAL_REFRESHES=25
FULL_REFRESHES=3
PARTIAL_TOTAL_MEDIAN_MS=829.26
PARTIAL_SPI_MEDIAN_MS=21.80 (30000 bytes, full-panel transition payload)
PARTIAL_DISPLAY_BUSY_MEDIAN_MS=451.59
FULL_TOTAL_MEDIAN_MS=1262.55
FULL_SPI_MEDIAN_MS=14.56
FULL_DISPLAY_BUSY_MEDIAN_MS=866.53
OPTIMIZED_ARTIFACT_FLASHED=NO
AGY_REVIEW=NOT_RUN_FOR_DIAGNOSTIC; REQUIRED_FOR_WINDOWED_CANDIDATE
READY_FOR_OPTIMIZED_FLASH=NO
```

## Campaign 8 Evaluation Branch Checkpoint — PR #2

```text
CAMPAIGN=8
FEATURE_BRANCH=feature/gemini-35-live-evaluation
BASE_SHA=2d4a2a9e9a380c591c2ac7f0f3120f1f7939b65d
START_SHA=ad6ed1ec04ad7afffd9822be1632b456fa066d11
STATUS=PASS_OUTCOME_C_NO_RUNTIME_MIGRATION
CURRENT_LIVE_MODEL=gemini-live-2.5-flash-native-audio
GEMINI_3_1_FLASH_LIVE=NOT_SELECTED_VERTEX_ADC_UNVERIFIED
GEMINI_3_5_TRANSCRIBE_LIVE=NOT_SELECTED_SPECIALIZED_STT
GEMINI_3_5_LIVE_TRANSLATE=NOT_SELECTED_SPECIALIZED_TRANSLATION
AGY_REVIEW=PASS_GEMINI_3_7_FLASH_HIGH
DETERMINISTIC_TESTS=270_BACKEND_PASS_6_SHARED_PASS
FIRMWARE_TOUCHED=NO
CAMPAIGN6D_TOUCHED=NO
PR1_TOUCHED=NO
LIVE_ADC_PROBE=NOT_RUN_ADC_UNAVAILABLE
LATENCY_COMPARISON=NOT_MEASURED
DEPLOYMENT=NOT_DEPLOYED
NEXT_ACTION=HUMAN_REVIEW_OR_APPROVED_ADC_LIVE_PROBE
```

## Campaign 8A Voice Routing Blocker Checkpoint

```text
CAMPAIGN=8A
FEATURE_BRANCH=feature/gemini-35-live-evaluation
BASE_SHA=6b61af7
IMPLEMENTATION_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
STATUS=READY_FOR_SLATE_VOICE_FLASH
MIC_CAPTURE=PASS
VOICE_UI=PASS
LEGACY_XIAOZHI_ACTIVATION_DETECTED=YES
SLATE_GEMINI_VOICE_E2E=FAIL_BLOCKED_ON_OLD_FIRMWARE
TENCLASS_URL_IN_PRODUCTION_FIRMWARE=NO
SLATE_CONFIG_ENDPOINT=/api/v1/devices/current/voice/config
SLATE_VOICE_WEBSOCKET=/api/v1/voice/websocket
DEVICE_SECRET_REUSED=YES
FIRMWARE_FLASHED=NO
CUSTOM_FULL_IMAGE_SHA256=eba9427558bf08eb387894bbba1feac2da5ec1d0b2ab8c8785285251d65afe33
CUSTOM_APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
ROLLBACK_SOURCE_SHA=bca05819e2cccc5cfdc128d82ffda052b3913412
AGY_REVIEW=PASS_GEMINI_3_7_FLASH_HIGH_ROUTING
CAMPAIGN6D_TOUCHED=NO
PR1_TOUCHED=NO
NEXT_ACTION=HUMAN_FLASH_AUTHORIZATION_THEN_PHYSICAL_E2E
```
