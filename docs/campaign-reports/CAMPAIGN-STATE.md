# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `c172ec9d0ac2d7a57cf708948f1092a61a5c8c2a`
Campaign instructions SHA: `e4de34fde343c93ea13e42304ca85ee4d53a57e6`

Current campaign: Campaign 1 — Foundation + English + BTC
Current stage: English UI
Current status: RUNNING

Completed campaigns:

- Campaign 0 — Phase 0 baseline: PASS/READY
  - TypeScript, backend, frontend baseline checks passed.
  - Firmware passed with exact local ESP-IDF `v5.5.2`, target `esp32s3`.
  - Native AGY skill and OAuth smoke test passed.
- Campaign 1A — Shared normalized contracts: PASS
  - Shared schemas and deterministic tests passed.
  - AGY medium-effort final review passed with no findings.

Blocked campaigns:

- None.

Deferred campaigns:

- None.
- GitHub Actions workflow registration is infrastructure debt; local exact ESP-IDF fallback is the current reproducible firmware path.
- Live Microsoft/Google OAuth consent and physical NOTE4 testing remain future human-boundary actions.

Active feature branches:

- `feature/english-ui` — RUNNING
- `feature/btc` — QUEUED

Last test status: PASS — shared contract tests (5 tests, 21 expectations), workspace typecheck/lint, backend tests (200), frontend build, and root format check.
Last AGY verdict: PASS — Campaign 1A final `gemini-3.7-flash-medium` review with no findings.

Next automatic action: implement user-facing English UI on `feature/english-ui`, preserving machine-readable identifiers; run deterministic checks and read-only AGY review before integration.

Human action required: NO
