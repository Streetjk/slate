# Campaign State

Repository: Streetjk/slate
Integration branch: `integration/note4-custom`
Last known good SHA: `6c29e541eb65f38c12e4d146158668182e9705e`

Current campaign: Campaign 1 — Foundation + English + BTC
Current stage: Shared normalized contracts
Current status: QUEUED

Completed campaigns:

- Campaign 0 — Phase 0 baseline: PASS/READY
  - TypeScript, backend, frontend baseline checks passed.
  - Firmware passed with exact local ESP-IDF `v5.5.2`, target `esp32s3`.
  - Native AGY skill and OAuth smoke test passed.

Blocked campaigns:

- None.

Deferred campaigns:

- None.
- GitHub Actions workflow registration is infrastructure debt; local exact ESP-IDF fallback is the current reproducible firmware path.
- Live Microsoft/Google OAuth consent and physical NOTE4 testing remain future human-boundary actions.

Active feature branches:

- None. Feature implementation has not started.

Last test status: PASS — baseline TypeScript/backend/frontend checks; firmware `idf.py build`; `idf.py merge-bin`; OTA artifact generation.
Last AGY verdict: PASS — native `$agy:ask` OAuth smoke; architecture research complete with no tracked changes.

Next automatic action: implement shared provider-independent contracts on the integration branch, run deterministic checks, invoke read-only AGY review, and create/push `01A-SHARED-CONTRACTS.md` only after the stage passes.

Human action required: NO
