# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `4bfce037b2d206dbabca9ab905301c088a0c1f01` (PR #2 Campaign 8D1E implementation; deterministic gates and exact GLM-5.3-Flash review pass; overnight Node control passed and Bun control timed out without a sanitized result; no production use)
Campaign instructions SHA: `08501bb3ca75739e43fbf4f54811e0243ca5d193`

Current campaign: Campaign 8 — PR #2 Slate-owned voice routing
Current stage: 8D1K-F one-call exact full-Slate-adapter real-provider revalidation
Current status: AUTHORIZED_NOT_STARTED — one separately budgeted exact full-Slate-adapter Gemini Live provider call is authorized; historical 8D1K accounting remains 3_OF_3 and is not reset.

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
  - Deterministic gates and exact ESP-IDF `v5.5.2` firmware regression passed.
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
- XR-002 BTC D/W/M automatic cached switching UX: RESOLVED in Campaign 5 through authenticated trio provisioning and existing frame navigation.
- XR-004 strict per-tool input schemas: RESOLVED in Campaign 4 through static proposal DTO validation and proposal-only voice dispatch.
- Campaign 6C O4 — Server Address entry is complete and pairing is verified; the remaining physical validation checklist and true off-LAN test remain pending.
- Campaign 6E — S1/S2 cleanup and S3 post-cleanup validation are complete; do not remove active Snap revisions or alter deployment state.
- Campaign 6E E3 — human must register `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/google/calendar/callback` and `https://orangepi5.tail6aabef.ts.net/api/v1/integrations/microsoft/calendar/callback` in the provider consoles, complete any interactive OAuth consent, and enter required secrets directly into the mode-600 Orange Pi environment. Do not share or commit credentials. Then resume E3 live checks.

Active feature branches:

- `feature/english-ui` — PASS; integrated at `eb3c9dbeacf48772b179c6d0d2954fa2120a39ef`
- `feature/btc` — PASS; integrated at `2011ac2c88fcf8c53d12ade1a53269c27b72ee70`
- `feature/external-review-hardening` — PASS; integrated at `5edab3c45e060426fbd0986eac52cf04695d6c0e`
- `feature/gemini-35-live-evaluation` — PR #2; Campaign 8D1K-E complete; Campaign 8D1K-F one-call exact full-adapter provider revalidation authorized and not yet executed; production deployment and merge remain prohibited.

Last test status: PASS — 8D1K-E full deterministic gates, ARM64 build, secret scan, and exact full-adapter provider-disabled E2E all passed. Firmware was not changed or flashed.
Last independent review verdict: `PASS` — exact configured GLM-5.3-Flash/ZAI read-only review for the 8D1K-E product/runtime artifact; no P0/P1/P2 findings; four non-blocking P3 observations adjudicated by Luna.

External review gate:

- XR-001 — BTC stale fallback / central freshness policy: FIXED and rechecked.
- XR-002 — D/W/M automatic cached switching UX: FIXED through BTC trio provisioning and rechecked.
- XR-003 — out-of-range Coinbase timestamp normalization: FIXED and rechecked.
- XR-004 — strict per-tool input contracts before Gemini execution: FIXED and rechecked.
- XR-005 — remaining English display labels/defaults: FIXED and rechecked.

Next automatic action: execute `docs/campaign-reports/08D1K-F-ONE-CALL-EXACT-ADAPTER-PROVIDER-REVALIDATION.md` using exactly one separately authorized Gemini provider call. If it passes and the durable checkpoint is pushed/verified, begin the existing 8D1L non-production production-readiness audit only if its prerequisites are satisfied. Do not start 8D1M.

Human action required: NO for 8D1K-F execution — the single new exact-adapter provider validation call is explicitly authorized. A new human decision is required for any second provider call and later for production API-key/data-policy/billing/deployment decisions.

## Campaign 8D1K-E Final Checkpoint

```text
CAMPAIGN=8D1K_E
STATUS=REVIEW_CLOSED_DETERMINISTICALLY_READY_FOR_HUMAN_PROVIDER_REVALIDATION_DECISION
FINAL_SOURCE_SHA=693288a7b63d61a7ef9fe0e68d1882e5585353d8
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
EXACT_FULL_ADAPTER_PROVIDER_DISABLED_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_TOTAL_PROVIDER_CALLS_USED=3_OF_3
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_DECIDE_API_KEY_AND_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_ONE_NEW_EXACT_ADAPTER_PROVIDER_REVALIDATION
```

## Campaign 8D1K-F Authorization Checkpoint

```text
CAMPAIGN=8D1K_F
STATUS=AUTHORIZED_NOT_STARTED
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
PROVIDER_CALLS_REMAINING=1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
MODEL=gemini-3.1-flash-live-preview
EXACT_FULL_ADAPTER_REAL_PROVIDER_E2E=NOT_RUN
SEARCH_ENABLED=NO
TOOLS_ENABLED=NO
PRIVATE_DATA_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=NO_FOR_8D1K_F_EXECUTION
NEXT_ACTION=EXECUTE_08D1K_F_ONE_CALL_EXACT_ADAPTER_PROVIDER_REVALIDATION
```
