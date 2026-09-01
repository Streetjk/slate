
Stage: Campaign 4 — Google Calendar voice writes
Date: 2026-09-01
Status: PASS (software and reproducible firmware build; live account and physical-device tests deferred)

## Repository State

Repository: Streetjk/slate
Branch: `integration/note4-custom`
Start SHA: `f0e3e9adfaab59cf58857f020c6f0d9945da3c9a`
Base SHA: `f0e3e9adfaab59cf58857f020c6f0d9945da3c9a`
Head SHA before report publication: `c37f86f9554f3bf63230b5000c1a42168489445b`
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

Implementation commits:

- `24ead7b` — `feat(calendar): add confirmed Google Calendar voice writes`
- `8b7a69f` — `feat(firmware): add calendar confirmation controls`
- `c37f86f` — `feat(calendar): integrate confirmed Google Calendar voice writes`

Feature branch: `feature/google-calendar`, pushed to `origin` at `8b7a69f`.

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-high`
AGY authentication: OAuth through the official AGY CLI; no model API key used
Orchestration mode: `CODEX_PRIMARY`

## Objective

Implement a narrow, user-confirmed Google Calendar voice-write path using Google OAuth only. The model may produce a proposed event, but only a user-scoped confirmation action may create the event. Preserve the existing Gemini voice path, Outlook read-only boundary, Slate synchronization, and NOTE4 audio/UI architecture.

## Work Completed

- Added Google OAuth 2.0 authorization-code flow with PKCE, cryptographic state, ten-minute pending-state expiry, and the narrow `calendar.events` scope.
- Reused Slate’s encrypted `UserIntegration` token storage. Access and refresh metadata are encrypted with user/provider-bound associated data; refresh is performed through `google-auth-library` and revoked connections fail closed.
- Added a `GoogleCalendarConfirmationTicket` Prisma model and migration. Tickets are random, short-lived, user-scoped, proposal-scoped, calendar-scoped, stored only as SHA-256 hashes, and atomically consumed.
- Added a narrow `createConfirmedCalendarEvent` service. It consumes a ticket before calling exactly `google.calendar({ version: 'v3', auth }).events.insert`; no generic Google API executor exists.
- Added proposal, confirm, cancel, OAuth callback, connection-status, and disconnect endpoints. Cancel, expiry, replay, wrong-user, duplicate, and failed-write paths do not produce a second external write.
- Extended the authenticated device context with the owning Slate user ID. The voice gateway creates calendar actions only for an owned device; Gemini receives no owner token, Graph client, Outlook data, or Google confirmation ticket.
- Added a proposal-only Gemini voice tool path. The backend sends a confirmation proposal to the device, and a separate device action is required for confirm/cancel.
- Added NOTE4 firmware proposal parsing, in-RAM ticket state, confirmation screen, and button controls using existing Xiaozhi protocol/service/scene/audio infrastructure. ENTER confirms; UP/DOWN cancel while a proposal is active.
- Added deterministic service, controller, OAuth, ownership, voice-session, and device-auth regression tests.

## Files Changed

Important files and purpose:

- `backend/src/modules/google-calendar/google-calendar-oauth.service.ts` — OAuth/PKCE, encrypted credential persistence, refresh, and revocation handling.
- `backend/src/modules/google-calendar/google-calendar-confirmation.service.ts` — hashed short-lived ticket creation, atomic consume, cancel, and proposal binding.
- `backend/src/modules/google-calendar/google-calendar-write.service.ts` — narrow confirmed `events.insert` adapter and Google event mapping.
- `backend/src/modules/google-calendar/google-calendar.controller.ts` and DTOs — authenticated OAuth/connection/proposal/confirmation API surface.
- `backend/prisma/schema.prisma` and `backend/prisma/migrations/20260901090000_google_calendar_confirmation_tickets/migration.sql` — user-owned confirmation-ticket persistence.
- `backend/src/modules/assistant/xiaozhi-voice-session.ts` and `xiaozhi-voice.gateway.ts` — proposal-only voice tool handling and owner-bound action bridge.
- `backend/src/common/nest/auth-context.ts` and `backend/src/infra/auth/device-secret-auth-cache.service.ts` — device owner propagation.
- `firmware/main/xiaozhi/service/message_handler.*`, `xiaozhi_service.*`, `protocol.*`, and `firmware/main/scenes/xiaozhi/xiaozhi_scene.cc` — existing NOTE4 protocol/service/scene integration for proposal confirmation.
- `backend/package.json`, `bun.lock), and environment examples/config — official Google client dependencies and OAuth configuration placeholders.

No low-level ESP-IDF, display, ES8311/I2S, power, sleep/wake, LittleFS, or sync stack was replaced.

## Architecture Decisions

- The model can only call `propose_google_calendar_event`; it cannot call a write tool. The write path is a separate device confirmation action.
- Confirmation tickets bind the authenticated user, validated proposal, calendar target, expiry, and nonce. Raw ticket values are returned only to the device/UI and are never persisted or logged.
- Ticket consumption is atomic and occurs before OAuth client creation or the Google API call. A failed upstream write burns the ticket, preventing duplicate retries.
- Google Calendar access is a dedicated provider module. No arbitrary Google endpoint, shell, filesystem, Outlook, Microsoft Graph, email, or broad HTTP capability is exposed to Gemini.
- Timed events preserve the supplied IANA timezone; all-day events use date-only fields. Google writes use `sendUpdates: 'none'`.
- Pending OAuth state is process-local and short-lived, matching the existing integration pattern. A durable distributed state store remains a deployment-scale follow-up for multi-instance deployments.
- Expired and consumed ticket rows are indexed but not yet periodically pruned. This is the non-blocking P3 from AGY’s review and is deferred to operational hardening.

Official references used for implementation:

- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- https://googleapis.dev/nodejs/googleapis/latest/

## Tests

- `bun run format:check` — PASS; all Prettier-checked TypeScript/TSX/JSON files matched.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd backend test` — PASS; 267 tests, 0 failures, 839 expectations across 70 files.
- `bun run --cwd shared test` — PASS; 6 tests, 0 failures, 27 expectations.
- `bunx --bun prisma validate --schema prisma/schema.prisma` from `backend` — PASS; schema valid.
- `bun run --cwd frontend build` — PASS; Vite transformed 2,169 modules and produced the production bundle.
- `git diff --check` — PASS.
- `docker pull espressif/idf:v5.5.2` — PASS; image digest `sha256:05cbfc42ed2e987b8026722c15bf1d8523d3e4fd1b4ac04d2e4056f5e0918b99`.
- `docker run --rm -v "$PWD":/project -w /project espressif/idf:v5.5.2 idf.py -C firmware build` — PASS; target `esp32s3`, app binary `0x266cd0`, 40% free app partition space.
- Workflow-equivalent `idf.py -C firmware merge-bin -o slate-full.bin && cp firmware/build/slate.bin firmware/build/slate-ota.bin` — PASS; artifacts created.
- Firmware artifact SHA-256: `slate.bin`/`slate-ota.bin` `e880386b0155780389469c2895177528959a81c46f2fe44b411668ac184062b9`; `slate-full.bin` `522f189bd36ea9b19cfe6767d70ea00c87c909d7e98ae4c8e1b7015430a1b41c`.

All tests above were rerun after integration at `c37f86f`.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`
Effort level: high
Verdict: PASS

AGY was invoked as a read-only reviewer on `feature/google-calendar` against the Campaign 3B integration base. It confirmed `AUTH_MODE: OAuth`, resolved model `Gemini 3.7 Flash (High)`, and `TRACKED_FILES_CHANGED_BY_REVIEWER: NO`.

Substantive review evidence:

- OAuth/PKCE state is cryptographically random, user-bound, consumed on callback, and uses only `calendar.events`.
- Access/refresh metadata is encrypted and no raw token is returned by controllers or logged.
- Ticket storage uses 256-bit entropy, SHA-256 persistence, five-minute expiry, proposal/calendar/user binding, and transactionally claimed single-use state.
- Confirm consumes before the Google client/API call; cancel has no external call; replay, expiry, and wrong-user attempts are rejected.
- Writes are limited to `events.insert`; no arbitrary Google API execution is present.
- Gemini’s tools and session handler expose proposal-only calendar behavior and no Outlook/Microsoft capability.
- Device owner propagation and firmware proposal/confirm/cancel lifecycle were verified.

P0 findings: none.
P1 findings: none.
P2 findings: none.
P3 findings:

- `P3-001` — consumed/expired confirmation-ticket rows remain until cleanup. Required change: scheduled retention/pruning routine. Status: deferred to operational hardening; not required for Campaign 4 correctness.

Findings accepted: `P3-001` accepted as a deferred follow-up.
Findings rejected: none.
Reason for any rejected finding: not applicable.

## Security Checks

OAuth-only requirement: PASS; Google authorization code + PKCE and encrypted credentials are used. No Google or Gemini API-key path was added.
Static AI API keys found: NONE introduced. Pre-existing legacy Slate `AI_API_KEY`/`TTS_API_KEY` variable names remain as empty configuration placeholders outside this new path and require final MVP disposition.
Outlook read-only: PASS; this campaign adds no Outlook mutation endpoint or provider dependency.
Outlook exposed to Gemini: NO; tool registry, voice action interface, and dependency path contain no Outlook/Microsoft capability.
Google Calendar confirmation gate: PASS; `NO CONFIRMATION = NO WRITE`, and cancel/expiry/replay/duplicate paths perform no write.
Secrets detected: NONE in tracked changes, diffs, reports, or artifacts. No credential stores or `.env` files were read or committed.

## Known Issues

- Live Google OAuth consent/account smoke testing is deferred because it requires user-owned Google Cloud configuration and interactive consent (`LIVE_INTEGRATION`).
- Physical NOTE4 flashing and device interaction are deferred to the hardware boundary; firmware source build and artifacts pass.
- Pending OAuth state is process-local; multi-instance deployments need a shared short-lived state store.
- Confirmation-ticket retention pruning is deferred as AGY P3-001.
- Existing legacy AI/TTS configuration names remain outside the new OAuth-only Gemini/Google Calendar path and must be retired or explicitly dispositioned before the final strict key-policy claim.
- No Airtable/Gantt implementation was started.

## Deviations

- GitHub Actions workflow registration remains infrastructure debt; the exact official ESP-IDF Docker image was used as the documented reproducible fallback.
- Live Microsoft/Google account authorization and physical NOTE4 testing were not represented as automated passes.
- AGY’s high-effort review returned PASS with one non-blocking P3; no correction cycle was required.

## Next Recommended Stage

Start Campaign 5 — full MVP integration/hardening. Re-run the complete software/firmware regression and high-effort adversarial review; resolve remaining external-review hardening items, legacy key-policy disposition, ticket pruning, and any testable integration gaps. Do not flash hardware or perform live OAuth consent without the human-boundary checkpoint.

## Final Stage Verdict

READY
