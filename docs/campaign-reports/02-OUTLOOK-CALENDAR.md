# Stage Report

Stage: Campaign 2 — Outlook read-only calendar
Date: 2026-09-01
Status: PASS

## Repository State

Repository: https://github.com/Streetjk/slate
Branch: `integration/note4-custom`
Base SHA: `c54879c5f19c92095e3a7366f15f91eb490083b6`
Head SHA: `98dd2abbd82260c6a112bf476f1d66294dbb56e7` (implementation and test commits; report commit follows)
Upstream SHA: `cf5b4ffb0b3db09cb44c058b425b77c4fa58d21e`

Commits:

- `5d1901b` — `feat(outlook): add read-only calendar synchronization`
- `20e96d1` — `feat(outlook): register agenda frame renderer`
- `98dd2ab` — `test(outlook): enforce calendar security boundaries`

## Harness

Codex version: `codex-cli 0.147.0`
AGY version: `1.1.22`
AGY model: `gemini-3.7-flash-high` for Microsoft architecture research and security review
AGY authentication: OAuth through the official AGY CLI; no model API key used
Orchestration mode: `CODEX_PRIMARY`

## Objective

Add a user-owned, read-only Microsoft Outlook Calendar integration while preserving Slate’s existing dynamic-content, 400×300 1bpp rendering, synchronization, and low-power paths. The integration must use Microsoft OAuth/MSAL, normalize Graph events immediately, cache offline data, and remain completely outside Gemini’s tool and data boundary.

## Work Completed

- Added `outlook_calendar` shared configuration with validated `Australia/Perth`, seven-day default range, event cap, and configurable refresh interval.
- Added `UserIntegration` persistence keyed by `(userId, provider)` with cascade ownership from `User`.
- Added AES-256-GCM token encryption with random IV, authenticated associated data bound to user/provider/token kind, and encrypted MSAL token cache persistence.
- Added official `@azure/msal-node` authorization-code flow with PKCE, single-use ten-minute state, `select_account`, and delegated scopes `openid profile offline_access Calendars.Read`.
- Added fixed Graph `GET /v1.0/me/calendarView` access with `$select=id,subject,start,end,isAllDay,location`, bounded results, and `Prefer: outlook.timezone="W. Australia Standard Time"`.
- Normalized Graph events to shared `CalendarEvent`, retaining only id/title/start/end/all-day/location/timezone; descriptions, attendees, bodies, and meeting details are discarded.
- Added refresh through the encrypted MSAL cache and safe disconnect on refresh failures requiring interaction; no token values are returned by controllers or logs.
- Added owner propagation from the containing group into dynamic fetch context. Unowned preview/test contexts cannot call Graph.
- Added owner-partitioned provider cache, recent-data fallback, offline/empty handling, and English Perth agenda rendering with `NEXT` event display.
- Added English frontend metadata, default configuration, refresh control, and a token-free “Connect/Reconnect Outlook” action that consumes a backend-generated authorization URL.
- Kept Outlook routes limited to authorization URL, OAuth callback, and connection status. No Outlook event create/update/delete route or Graph mutation client exists.

## Files Changed

Important files include:

- `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260901080000_user_integrations/migration.sql` — user-owned external integration storage.
- `backend/src/infra/security/token-encryption.service.ts` and `security.module.ts` — encrypted token/cache protection.
- `backend/src/infra/config/{env.schema.ts,app.config.ts}`, `backend/.env.example` — OAuth and encryption configuration names/placeholders only.
- `backend/src/modules/dynamic-content/outlook/*` — MSAL flow, Graph read client, controller, module, and frame renderer.
- `backend/src/modules/dynamic-content/providers/outlook-calendar.provider.ts` — normalized provider cache/fallback.
- `backend/src/modules/dynamic-content/{dynamic-content.types.ts,dynamic-content-renderer.service.ts,dynamic-content-registry.ts,dynamic-content.module.ts}` — owner context and registry integration.
- `shared/src/dynamic/config.ts` — shared type/config contract.
- `frontend/src/features/dynamic/{components,model,query}` — English Outlook configuration/connect UI.
- `backend/src/modules/dynamic-content/outlook/*.test.ts`, `providers/outlook-calendar.provider.test.ts`, `infra/security/token-encryption.service.test.ts` — security, normalization, cache, and scope coverage.

## Architecture Decisions

- Microsoft Graph is isolated behind `MicrosoftOAuthService` → `MicrosoftGraphCalendarClient` → normalized `CalendarEvent[]` → existing dynamic provider/renderer/sync pipeline.
- External connections are user-scoped; no global Outlook account is used. Dynamic content receives only `ownerUserId`, never OAuth material.
- MSAL’s serialized token cache is encrypted at rest rather than storing a plaintext refresh token. Encryption AAD prevents cross-user/provider substitution.
- The MVP timezone is intentionally fixed to `Australia/Perth`, mapped to Graph’s `W. Australia Standard Time`, preventing a mismatch between Graph wall times and normalized ISO offsets.
- The Graph client has one fixed read-only method and a bounded `$select`; no generic Microsoft HTTP capability is exposed.
- Outlook is not imported by the AI module and is absent from `AssistantToolName`; its event payload and credentials never enter the assistant path.
- Existing Slate dynamic provider/cache/renderer/synchronization infrastructure is reused. No firmware low-level audio, display, Wi-Fi, sleep/wake, or device protocol rewrite was made.

Official references consulted:

- [Microsoft identity platform authorization code flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Microsoft Graph get event and timezone behavior](https://learn.microsoft.com/en-us/graph/api/event-get?view=graph-rest-1.0)

## Tests

Commands executed from `/Users/ollama/slate`:

- `bun run format:check` — PASS; all TypeScript, TSX, and JSON files formatted.
- `bun run lint` — PASS; frontend and backend ESLint completed with zero warnings.
- `bun run typecheck` — PASS; frontend and backend TypeScript checks completed.
- `bun run --cwd backend test` — PASS; 226 tests, 0 failures, 743 expectations across 59 files.
- `bun run --cwd frontend build` — PASS; Vite production build completed successfully.
- `bun run --cwd backend prisma validate` — PASS; schema valid.
- `git diff --check` — PASS; no whitespace errors.
- Secret-pattern scan over files changed from base SHA — PASS; no private keys, bearer credentials, Google/GitHub/OpenAI-style key values, or credential values detected.

Campaign-specific assertions include:

- AES-GCM round-trip and associated-data mismatch rejection.
- Invalid encryption configuration rejection.
- Perth timed-event normalization and removal of body/attendee data.
- All-day date-boundary preservation.
- Malformed/inverted event rejection.
- Fixed Graph GET, bounded `$select`, Perth timezone preference, and bearer use.
- No-owner provider short-circuit, recent cache fallback, and per-user cache isolation.
- Assistant tool registry contains no Microsoft/Outlook capability.
- Requested Microsoft scopes contain `Calendars.Read` but no write/shared/mail/file permission.

## AGY Review

Reviewer model: `gemini-3.7-flash-high`
Effort level: high
Verdict: PASS

AGY’s substantive conclusions:

- Microsoft scopes are read-only: `openid`, `profile`, `offline_access`, and `Calendars.Read`; no `Calendars.ReadWrite`, shared-calendar, mailbox, or file scopes.
- Only authorization URL, callback, and status routes are exposed; the Graph client only performs `GET .../me/calendarView`.
- Gemini cannot access Outlook tokens, event data, provider classes, Microsoft tools, or a generic Microsoft HTTP tool; the assistant registry remains exactly `web_search`, `propose_google_calendar_event`, and `get_btc_price`.
- User isolation is enforced by the compound database key, owner propagation, AAD binding, and user-partitioned provider cache.
- Controller responses and selected Graph fields exclude secrets, descriptions, attendees, bodies, and meeting details.
- OAuth PKCE/state, encrypted cache, refresh handling, Perth/all-day normalization, rendering, and frontend integration were all assessed compliant.

P0 findings: none.
P1 findings: none.
P2 findings: none.
P3 findings: none.

Findings accepted: none; AGY reported no actionable findings.
Findings rejected: none.
Reason for any rejected finding: not applicable.

AGY reviewer protocol: read-only command; no reviewer changes, commits, pushes, or merges were observed. `git status` remained clean after the implementation/test commits were prepared.

## Security Checks

OAuth-only requirement: PASS for Microsoft integration; MSAL OAuth/PKCE is used and no runtime API key path was added.
Static AI API keys found: NONE introduced; the pre-existing empty `AI_API_KEY=` placeholder remains in Slate’s `.env.example` and contains no value. Outlook code does not read it.
Outlook read-only: PASS; fixed delegated `Calendars.Read` scope, fixed Graph calendarView GET, no event mutation client/routes.
Outlook exposed to Gemini: NO; no assistant tool, dependency, token, event, description, attendee, search, or generic HTTP path is registered.
Google Calendar confirmation gate: NOT IN SCOPE for this stage; unchanged.
Secrets detected: NONE; no credentials were added to source, config, reports, diff, or commits.

## Known Issues

- Live Microsoft app registration, redirect-URI configuration, interactive consent, and account-backed Graph smoke testing were not performed. `CODE_COMPLETE = PASS`; `LIVE_ACCOUNT_TEST = DEFERRED_USER_ACTION` because consent/configuration is an external human boundary.
- OAuth state is process-local and single-use. A future multi-instance deployment should move pending-state storage to a shared, encrypted/short-lived store; this is not required by the current single-instance Slate deployment.
- Firmware and physical NOTE4 behavior were not changed or re-flashed in this campaign; the prior exact ESP-IDF baseline remains the known-good firmware gate.

## Deviations

- The campaign requested `Calendars.Read` and optionally `User.Read`; `User.Read` was intentionally omitted because MSAL’s account username supplies optional account labeling and no Graph `/me` call is needed.
- The campaign’s generic “delete connection” idea was not exposed as an HTTP DELETE route so the public Outlook integration surface remains strictly non-mutating. Internal cleanup on invalid refresh is retained.
- GitHub Actions firmware registration remains documented infrastructure debt; no firmware source change was required for this backend/frontend stage.

## Next Recommended Stage

Start Campaign 3A — Gemini OAuth feasibility. Verify current official Google OAuth/ADC model identifiers and capability availability for STT, reasoning, Search grounding, TTS, function calling, and streaming without using any API key. Keep Outlook isolation unchanged.

## Final Stage Verdict

READY
