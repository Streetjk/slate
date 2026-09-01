# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `478653d1c46c449f67b5293c27c863142ef1ccd3` (Campaign 6E addendum audited and validated against the deployed Orange Pi; flashed source remains `bca05819e2cccc5cfdc128d82ffda052b3913412`)
Campaign instructions SHA: `478653d1c46c449f67b5293c27c863142ef1ccd3`

Current campaign: Campaign 6E — Public HTTPS + roaming connectivity
Current stage: Phase S1/S2 — disabled Snap revision and apt-cache cleanup sudo boundary
Current status: HUMAN_BOUNDARY — NOTE4 Server Address migration completed; existing pairing is preserved and authenticated public poll traffic is passing. Campaign 6E S0 inventory identified eight explicitly disabled Snap revisions, but Orange Pi sudo requires a password. Campaign 6D remains independently blocked on its physical refresh-baseline work and was not altered.

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
- Campaign 6D — E-Ink refresh optimization: D0 BLOCKED; no physical NOTE4 serial device detected, no firmware changes or flash attempted.
- Campaign 6E — Public HTTPS + roaming connectivity: E0/E1/E2, addendum A1-A4, V0, and S0 PASS; the NOTE4 Server Address is `https://orangepi5.tail6aabef.ts.net`, existing pairing is preserved, and 23 authenticated device polls returned HTTP 201 after migration. Orange Pi system disk `/dev/mmcblk1` is `15476981760` bytes, exact root free space is `2958049280` bytes before Snap cleanup, and active Slate/MySQL/rollback assets remain preserved. Funnel and public health remain verified. S1/S2 cleanup is HUMAN_PENDING for sudo; true off-LAN and E3 OAuth checks remain separate.
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
- Campaign 6E S1/S2 — human must run the exact eight `sudo snap remove ... --revision=...` commands and `sudo apt-get clean` listed in the 06E report. Do not factory-reset/re-register NOTE4 or remove active Snap revisions.
- Campaign 6E E3 — human must register `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/google/calendar/callback` and `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/microsoft/calendar/callback` in the provider consoles, complete any interactive OAuth consent, and enter required secrets directly into the mode-600 Orange Pi environment. Do not share or commit credentials. Then resume E3 live checks.

Active feature branches:

- `feature/english-ui` — PASS; integrated at `eb3c9dbeacf48772b179c6d0d2954fa2120a39ef`
- `feature/btc` — PASS; integrated at `2011ac2c88fcf8c53d12ade1a53269c27b72ee70`
- `feature/external-review-hardening` — PASS; integrated at `5edab3c45e060426fbd0986eac52cf04695d6c0e`

Last test status: PASS — backend tests (270 tests, 0 failures, 845 expectations), shared tests (6 tests, 0 failures, 27 expectations), workspace format/typecheck/lint, frontend build, Prisma validation, secret-pattern scan, exact ESP-IDF 5.5.2/esp32s3 Docker build and merge-bin, artifact hashes, and `git diff --check`.
Last AGY verdict: PASS — Campaign 5 high-effort `gemini-3.7-flash-high` adversarial review; no P0/P1/P2 findings, P3-001 ticket pruning and P3-002 process-local OAuth state deferred, reviewer tree unchanged.

External review gate:

- XR-001 — BTC stale fallback / central freshness policy: FIXED and rechecked.
- XR-002 — D/W/M automatic cached switching UX: FIXED through BTC trio provisioning and rechecked.
- XR-003 — out-of-range Coinbase timestamp normalization: FIXED and rechecked.
- XR-004 — strict per-tool input contracts before Gemini execution: FIXED and rechecked.
- XR-005 — remaining English display labels/defaults: FIXED and rechecked.

Next automatic action: after the human sudo cleanup, verify Snap state, disk free space, service health, Funnel, and public HTTPS; then complete true off-LAN and Campaign 6E E3 live OAuth boundaries. Do not flash firmware, alter Campaign 6D measurements, or begin Airtable/Gantt.

Human action required: YES — run the exact S1/S2 sudo cleanup commands in the 06E report; separately complete true off-LAN validation and provider consent/secure environment setup. Never send credentials in chat or reports.
