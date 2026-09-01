# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `5edab3c45e060426fbd0986eac52cf04695d6c0e` (Campaign 1B integration)
Campaign instructions SHA: `08501bb3ca75739e43fbf4f54811e0243ca5d193`

Current campaign: Campaign 3B — Gemini voice, Search, and Q&A
Current stage: Backend voice gateway architecture and provider implementation
Current status: RUNNING

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
- Campaign 1B — external-review hardening: PASS; report published in `01B-EXTERNAL-REVIEW-HARDENING.md`
  - XR-001, XR-003, XR-004, and XR-005 were fixed and re-reviewed by AGY with final PASS.
  - XR-002 BTC D/W/M trio provisioning was confirmed as a real UX gap and deferred to MVP hardening with a named “Add BTC Trio” follow-up.

Blocked campaigns:

- None.

Deferred campaigns / required later gates:

- GitHub Actions workflow registration is infrastructure debt; local exact ESP-IDF fallback is the current reproducible firmware path.
- Live Microsoft/Google OAuth consent and physical NOTE4 testing remain future human-boundary actions.
- XR-002 BTC D/W/M automatic trio UX may be completed in Campaign 1B or no later than MVP hardening.
- XR-004 strict per-tool input schemas MUST be resolved before Gemini production tool execution in Campaign 3B/4.

Active feature branches:

- `feature/english-ui` — PASS; integrated at `eb3c9dbeacf48772b179c6d0d2954fa2120a39ef`
- `feature/btc` — PASS; integrated at `2011ac2c88fcf8c53d12ade1a53269c27b72ee70`
- `feature/external-review-hardening` — PASS; integrated at `5edab3c45e060426fbd0986eac52cf04695d6c0e`

Last test status: PASS — backend tests (226 tests, 0 failures, 743 expectations), workspace format/typecheck/lint, frontend build, Prisma validation, Outlook security/normalization tests, and secret-pattern scan. Campaign 3A feasibility was research-only; its pre-report tree was clean and `git diff --check` passed.
Last AGY verdict: READY — Campaign 3A `gemini-3.7-flash-high` feasibility research; no P0-P3 findings. Primary Google documentation independently verified the model/capability split.

External review gate:

- XR-001 — BTC stale fallback / central freshness policy: RECHECK REQUIRED; P1 candidate.
- XR-002 — D/W/M automatic cached switching UX: RECHECK REQUIRED; P2 requirement gap candidate.
- XR-003 — out-of-range Coinbase timestamp normalization: RECHECK REQUIRED; P2 candidate.
- XR-004 — strict per-tool input contracts before Gemini execution: REQUIRED BEFORE CAMPAIGN 3B/4.
- XR-005 — remaining English display labels/defaults: RECHECK REQUIRED; P3/P2 candidate.

Next automatic action: implement Campaign 3B’s configurable ADC-backed voice gateway, preserving Slate’s audio lifecycle, strict assistant tool schemas, and the Outlook/AI boundary; use deterministic mocks before AGY review.

Human action required: NO
