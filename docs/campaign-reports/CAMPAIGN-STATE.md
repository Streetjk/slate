# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `c172ec9d0ac2d7a57cf708948f1092a61a5c8c2a`

Current campaign: Campaign 1 — Foundation + English + BTC
Current stage: English UI and BTC implementation lanes
Current status: QUEUED

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

- None yet; `feature/english-ui` and `feature/btc` are queued for creation by the controller.

Last test status: PASS — shared contract tests (5 tests, 21 expectations), workspace typecheck/lint, backend tests (200), frontend build, and root format check.
Last AGY verdict: PASS — Campaign 1A final `gemini-3.7-flash-medium` review with no findings.

Next automatic action: create isolated English UI and BTC lanes, implement within their ownership boundaries, run deterministic checks, invoke read-only AGY review, integrate only after PASS, and publish `01-FOUNDATION-ENGLISH-BTC.md`.

Human action required: NO
