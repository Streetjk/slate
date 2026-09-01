# Stage Report

Stage: Campaign 1B — external-review hardening
Date: 2026-09-01
Status: PASS

## Repository State

Repository: Streetjk/slate
Branch: `integration/note4-custom`
Start SHA: `e747697fbb835b83d9c349aa41732bc76d270474`
Base SHA: `e747697fbb835b83d9c349aa41732bc76d270474`
End SHA: `5edab3c45e060426fbd0986eac52cf04695d6c0e` (integration merge before report publication)
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`
Feature branch: `feature/external-review-hardening` at `48d4945b72b8aa96309d1df533f6fd163716a4ae`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-medium`
AGY authentication: OAuth through the official AGY CLI
Orchestration mode: `CODEX_PRIMARY`

## Objective

Recheck the independent external findings XR-001 through XR-005 before Gemini production tool execution. Fix valid correctness, security, schema, and English-UI findings; preserve Git isolation; and explicitly disposition the BTC trio provisioning UX gap.

## Work Completed

- XR-001 FIXED: removed BTC provider-level `lastData` fallback. Coinbase failures now propagate to Slate’s central dynamic renderer, which records the error, applies the existing freshness reuse policy, and applies error backoff. Provider failures are not cached as successful fresh data.
- XR-003 FIXED: validated `Date.getTime()` before calling `toISOString()` and filtered finite-but-out-of-range Coinbase timestamps.
- XR-004 FIXED: replaced generic assistant tool input records with a discriminated union and strict per-tool schemas for `web_search`, `get_btc_price`, and `propose_google_calendar_event`. Unknown fields and Microsoft/Outlook injection fields are rejected.
- XR-005 FIXED: added English display labels for legacy TTS voice IDs, kept provider IDs unchanged, localized remaining TTS-facing validation/error messages, and changed the new weather starter to the explicit English `Select a city` / `unconfigured` state rather than silently presenting Beijing.
- XR-002 DEFERRED: confirmed the current model requires three manually added `btc_price` content records for D/W/M. Existing group synchronization already makes separate frames locally switchable/offline; a single “Add BTC Trio” provisioning action is scheduled for MVP hardening because it requires a coordinated group/content mutation and should not be implemented as a partial lane-local shortcut.
- No low-level NOTE4 firmware, display, audio, Wi-Fi, sleep/wake, or sync stack was rewritten.

## Files Changed

Market/freshness:

- `backend/src/modules/dynamic-content/providers/btc-price.provider.ts` — centralizes failure/reuse handling and guards invalid dates.
- `backend/src/modules/dynamic-content/providers/btc-price.provider.test.ts` — out-of-range timestamp and repeated-failure/cache regression coverage.
- `backend/src/modules/dynamic-content/dynamic-data-reuse-policy.test.ts` — recent versus expired BTC reuse policy coverage.

AI contract/security:

- `shared/src/types/integrations.ts` — strict per-tool input schemas and discriminated request union.
- `shared/test/integrations.test.ts` — positive/negative tool-input tests and Outlook/Microsoft smuggling rejection.

English UI/TTS:

- `shared/src/dynamic/config.ts` — English TTS label map while preserving legacy IDs.
- `frontend/src/features/contents/components/image-form/TtsFields.tsx` and `frontend/src/features/dynamic/components/config/DynamicAudioSection.tsx` — render English voice labels.
- `frontend/src/features/dynamic/model/default-config.ts` — English unconfigured weather starter.
- `backend/src/modules/tts/tts.service.ts`, `backend/src/modules/tts/tts.service.test.ts` — English TTS validation/error text and regression update.
- `backend/src/modules/contents/contents.service.ts`, `backend/src/modules/contents/content-audio-blob.service.ts`, `backend/src/modules/contents/content-audio-blob.service.test.ts` — English TTS-facing errors and test update.

Commits:

- `7542065 fix(market): centralize BTC stale-data reuse`
- `3293cee fix(shared): enforce strict assistant tool inputs`
- `48d4945 fix(ui): localize voice labels and weather defaults`
- `5edab3c Merge branch 'feature/external-review-hardening' into integration/note4-custom`

## Architecture Decisions

- Slate’s central dynamic renderer remains the sole owner of persisted dynamic-data reuse, stale-age decisions, error recording, and retry backoff. Providers must not convert upstream failures into successful fallback responses when that would bypass the policy.
- Assistant tool requests are now closed-world and per-tool typed. Future Gemini adapters must parse `AssistantToolRequest` before dispatch and must not reintroduce a generic URL/body/options record.
- Legacy TTS identifiers are protocol/provider compatibility values, not UI labels. `TTS_VOICE_LABELS` is the display boundary.
- A new weather content starts unconfigured and requires a user-selected city. This avoids a misleading Chinese default while retaining the existing QWeather provider model.
- The existing group/content/frame synchronization is sufficient for local cycling across manually created BTC frames. The trio provisioning UX remains a product-level follow-up, not a new device navigation stack.

## Tests

- `bun run format:check` — PASS; all formatted files matched Prettier.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd shared test` — PASS; 6 tests, 0 failures, 27 expectations.
- `bun run --cwd backend test` — PASS; 228 tests, 0 failures, 747 expectations across 60 files.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules and produced the production bundle.
- `bun run --cwd backend prisma validate` — PASS; schema valid.
- `git diff --check` — PASS.

Focused regression evidence:

- BTC provider, policy, TTS, and audio-metadata tests — PASS; 13 tests, 0 failures, 29 expectations.
- Strict tool schemas accept valid inputs for all three allowed tools and reject unknown fields, invalid periods, Outlook URLs, Graph bodies, and calendar body injection.
- Provider failure is retried rather than cached as a successful fallback; central BTC reuse accepts recent persisted data and rejects expired data.

## AGY Review

Reviewer model: `gemini-3.7-flash-medium`
Effort level: medium
Verdict: PASS

AGY’s substantive findings:

- XR-001 FIXED/PASS (P1): provider failure propagation and central 24-hour bounded reuse were correctly restored; no stale fallback cache poisoning remained.
- XR-002 DEFERRED (P2 requirement gap): current three-frame model is locally switchable once frames exist; AGY accepted deferral with a planned “Add BTC Trio” provisioning workflow for MVP hardening.
- XR-003 FIXED/PASS (P2): `Date.getTime()` validation prevents `Invalid time value` from malformed finite timestamps.
- XR-004 FIXED/PASS (P2-before-AI hard stop): strict schemas and the discriminated union reject extra URL/body/headers/scope fields; Outlook remains absent from the tool vocabulary.
- XR-005 FIXED/PASS (P3): English labels preserve internal legacy voice IDs and the weather starter no longer presents Beijing by default.

P0 findings: none.
P1 findings: none after fixes.
P2 findings: none after fixes; XR-002 remains explicitly deferred as a non-security requirement gap.
P3 findings: none after fixes.

Findings accepted: XR-001, XR-003, XR-004, and XR-005 were accepted and fixed with regression coverage. XR-002 was accepted as a real UX gap and deferred with evidence and a named follow-up.

Findings rejected: none.
Reason for any rejected finding: not applicable.

AGY reviewer protocol: the reviewer was instructed to be read-only. It reported zero reviewer-introduced tracked or untracked changes; the working tree remained clean after review.

## External Review Recheck

XR-001: FIXED
XR-002: DEFERRED
XR-003: FIXED
XR-004: FIXED
XR-005: FIXED

New evidence: provider failure tests, BTC reuse-policy tests, invalid-date fixture, strict tool schema tests, English label tests, and full deterministic gates.
AGY agreement or disagreement: AGY agreed with the four fixes and accepted the documented XR-002 deferral.
Severity changes: XR-001 no longer has an unresolved P1; XR-003 and XR-004 no longer have unresolved P2 impact; XR-005 no longer has unresolved P3/P2 impact. XR-002 remains P2 as a deferred product requirement gap.
Next required action: implement and test one-step BTC D/W/M trio provisioning no later than MVP hardening; do not enable Gemini production tools before strict schemas remain in place.

## Security Checks

OAuth-only requirement: PASS; this stage added no authentication integration or credential path.
Static AI API keys found: NONE introduced. No model API key was added.
Outlook read-only: PRESERVED; no Outlook mutation capability was added.
Outlook exposed to Gemini: NO; the strict tool schemas and existing isolation test exclude Microsoft/Outlook capability.
Google Calendar confirmation gate: PRESERVED and not implemented in this stage.
Secrets detected: NONE; secret stores, `.env` files, and OAuth material were not read or committed.

## Known Issues

- XR-002 BTC trio provisioning remains deferred until MVP hardening; current D/W/M views require three content records, although already-synced frames can be cycled locally.
- Existing Slate TTS runtime configuration still uses its legacy provider API-key variables; this stage did not replace that pre-existing provider. Gemini runtime must use the approved ADC path from Campaign 3A and must not reuse this legacy credential path.
- Live Microsoft/Google consent and physical NOTE4 validation remain external human-boundary actions.

## Deviations

- XR-002 was not implemented in this lane because a partial provisioning shortcut could create inconsistent group ordering or etags. It is explicitly scheduled no later than MVP hardening.
- The feature branch was integrated with a merge commit after the remote integration branch advanced with external review instructions; no force push or history rewrite was used.

## Next Recommended Stage

Start Campaign 3B — Gemini voice, Search, and Q&A implementation using the Campaign 3A ADC/OAuth feasibility decision. Preserve the strict tool contracts, keep Outlook outside the AI dependency graph, reuse Slate’s audio lifecycle, and use deterministic mocks before AGY review.

## Final Stage Verdict

READY
