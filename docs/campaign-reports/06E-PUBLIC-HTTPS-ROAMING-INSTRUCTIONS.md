# Campaign 6E — Public HTTPS + Roaming Connectivity Instructions

Repository: `Streetjk/slate`
Branch: `integration/note4-custom`

## Authority

This directive governs the public-connectivity stage after the Campaign 6C Orange Pi backend deployment and alongside the current Campaign 6D physical/refresh work.

Before work:
1. `git fetch origin`.
2. Read `AGENTS.md`, `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`, `docs/campaign-reports/CAMPAIGN-STATE.md`, `docs/campaign-reports/06C-ORANGE-PI-BACKEND.md`, `docs/campaign-reports/06D-EINK-REFRESH-OPTIMIZATION-INSTRUCTIONS.md`, the latest `06D-EINK-REFRESH-OPTIMIZATION.md` if present, and this file.
3. Verify live branch HEAD and clean working tree.
4. Codex remains sole production writer/integrator. AGY is read-only reviewer/researcher.

Do not begin Airtable/Gantt.

## Current known state

- Orange Pi target: `192.168.50.108`, SSH alias `note4-orangepi`.
- Orange Pi custom Slate backend and MySQL are healthy.
- Current LAN Slate endpoint: `http://192.168.50.108:3001`.
- Tailscale was previously observed as an existing unrelated service on the Orange Pi; verify current state rather than assuming it is logged in or Funnel-capable.
- Current backend source includes Google and Microsoft OAuth redirect URI configuration expecting HTTPS callback URLs.
- NOTE4 currently stores one server URL and one Wi-Fi credential set in NVS.
- Orange Pi root filesystem became critically space constrained after Docker build, approximately 97% used / ~508 MB free in Campaign 6C evidence.
- Campaign 6D physical baseline may still require the NOTE4 to be connected over USB. Do not break or reset the currently flashed device while doing 6E server/network work.

## Campaign goal

Make the NOTE4 usable away from home on ordinary Wi-Fi by giving it a stable public HTTPS Slate endpoint backed by the Orange Pi, while preserving security, OAuth boundaries, local service integrity, and rollback.

Preferred architecture if current official Tailscale behavior supports it:

`NOTE4 -> public Wi-Fi / hotspot -> HTTPS -> Tailscale Funnel public hostname -> local Slate backend on Orange Pi`

The NOTE4 itself must not require a Tailscale client.

Success means:
- Orange Pi disk pressure is safely relieved first;
- public endpoint uses HTTPS with a stable hostname;
- local port 3001 is not exposed directly to the public internet;
- public Slate surface passes authentication/rate-limit/security review;
- device can use the public HTTPS base URL as Server Address;
- Microsoft/Google OAuth callback feasibility is verified against the same HTTPS hostname;
- reboot persistence and rollback are verified;
- public exposure is not enabled if security gates fail.

---

# Phase E0 — Orange Pi disk/cache hygiene FIRST

This phase is mandatory and must complete before Funnel/public exposure work.

Connect using:

`ssh note4-orangepi`

Record before state:
- `df -h /`
- `docker system df -v` or closest supported equivalent
- `docker ps --no-trunc`
- running Slate image ID/tag/digest
- running MySQL image ID/tag/digest
- all local images with IDs/tags/sizes
- BuildKit/builder cache usage
- `/home/pi/slate-note4-deploy` size breakdown
- persistent Slate/MySQL volume/bind-mount locations from Campaign 6C

Mechanically identify and preserve:
1. the image currently used by `slate-note4`;
2. the image currently used by `slate-note4-mysql`;
3. one clearly designated previous/custom Slate rollback image if available;
4. all persistent Slate data and MySQL data;
5. current deployment Compose/env files.

Allowed cleanup after that evidence is recorded:
- unused Docker build cache / BuildKit cache;
- dangling intermediate images/layers not referenced by running or rollback assets;
- stopped disposable build containers, if verified unrelated to persistent service state;
- package-manager cache such as apt cache only if privilege is already available or user authorizes it interactively;
- temporary build directories that are reproducible and not rollback assets.

Preferred Docker cleanup sequence:
1. inspect with `docker system df -v`;
2. prune builder cache first;
3. remove only verified dangling/unreferenced images;
4. re-run `docker system df -v` and `df -h /`;
5. verify Slate and MySQL remain healthy after cleanup.

Forbidden:
- `docker system prune -a`;
- deleting Docker volumes;
- deleting `/home/pi/slate-note4-deploy/slate-data`;
- deleting `/home/pi/slate-note4-deploy/mysql-data`;
- deleting the running Slate image;
- deleting the running MySQL image;
- deleting the designated rollback Slate image;
- deleting deployment secrets/env files;
- deleting unrelated service data.

Target: preferably >2 GB free on `/`. If safe cleanup cannot reach 2 GB, continue only if at least 1 GB free and there is enough headroom for normal operation without another large local image build. Otherwise stop and report a storage-capacity boundary.

After cleanup verify:
- `slate-note4` healthy;
- `slate-note4-mysql` healthy;
- `curl -fsS http://127.0.0.1:3001/healthz` PASS;
- Mac/LAN `http://192.168.50.108:3001/healthz` PASS;
- no volumes/data were removed.

Do not start public exposure until E0 is PASS.

---

# Phase E1 — current Tailscale/Funnel feasibility and public-surface audit

## E1.1 Verify official current Tailscale behavior

Use current official Tailscale documentation and the installed CLI to verify:
- installed Tailscale version;
- whether the Orange Pi is logged into the expected tailnet;
- MagicDNS/FQDN assigned to this node;
- current syntax and requirements for `tailscale funnel`;
- supported public HTTPS ports and reverse-proxy syntax;
- certificate/TLS behavior;
- persistence behavior across reboot;
- whether Funnel requires a one-time tailnet/admin approval or interactive browser authorization;
- any current plan/bandwidth/feature constraints relevant to this use case.

Do not rely on stale CLI syntax from memory.

If enabling Funnel requires an interactive Tailscale account approval that cannot be completed through the existing authorized session, stop at that exact human boundary and publish the instructions needed. Do not ask for or log Tailscale passwords/tokens.

## E1.2 Audit Slate before public exposure

Before enabling Funnel, inspect the exact routes exposed by the production backend.

At minimum verify:
- device registration/pairing flow;
- device content/sync endpoints;
- login/register routes;
- admin routes;
- integration/OAuth routes;
- health route;
- static frontend routes;
- WebSocket routes including Gemini/voice/Xiaozhi paths;
- file/blob routes if any.

Security requirements:
- device authenticated APIs require valid `device_secret` or equivalent device identity;
- normal user APIs require authenticated user session/JWT where appropriate;
- user ownership isolation remains enforced;
- no database/admin/debug endpoint is publicly reachable without authentication;
- MySQL remains container-network-only and has no host/public port;
- no secrets/tokens appear in public error responses;
- pairing codes are short-lived/bounded and cannot be trivially brute-forced;
- login/register/pairing have appropriate rate limiting or another defensible abuse control;
- password hashing/session behavior is production-appropriate;
- proxy/forwarded headers are handled safely behind Funnel;
- WebSocket upgrade/proxy behavior is supported by the chosen Funnel path;
- no trust decision is based solely on private source IP when behind a public proxy.

If arbitrary public account registration is enabled, explicitly assess whether that is acceptable for this personal deployment. Prefer a bounded personal-server mode over exposing open registration if a minimal safe configuration/change can achieve it.

Any P0/P1 public-exposure finding blocks Funnel enablement until resolved and reviewed.

Run AGY high-effort security review on any source/config changes affecting the public surface.

---

# Phase E2 — Tailscale Funnel HTTPS deployment

Only after E0 PASS and E1 security PASS.

Preferred exposure model:
- keep Slate listening on local/LAN port 3001 as currently deployed;
- publish only HTTPS through Tailscale Funnel;
- do not router-port-forward 3001;
- do not publish MySQL;
- do not create a second public reverse proxy unless required by verified Tailscale behavior.

Use the node's verified Tailscale public hostname, e.g. the actual generated `https://<node>.<tailnet>.ts.net` hostname. Do not invent or hardcode a placeholder in production config.

Funnel should reverse proxy the public HTTPS endpoint to local Slate, preferably `http://127.0.0.1:3001` where supported.

Verify from outside the home LAN if practical:
- public HTTPS `/healthz` works;
- public HTTPS Web UI loads;
- TLS certificate is valid;
- HTTP-to-HTTPS behavior is appropriate;
- no direct public access exists to `192.168.50.108:3001` beyond LAN;
- WebSocket upgrade works for the backend paths required by NOTE4 voice/live features;
- public endpoint survives Orange Pi reboot and Tailscale service restart.

Do not expose unrelated Orange Pi services through Funnel.

Record the exact final public base URL as:

`NOTE4_PUBLIC_SERVER_ADDRESS=https://...`

---

# Phase E3 — OAuth callback migration/verification

Inspect the exact current Google Calendar and Microsoft Outlook callback routes and deployed environment handling.

Use the verified Funnel HTTPS hostname as the preferred callback base if current Google/Microsoft provider rules allow it.

Expected route shapes from repository configuration are currently:
- `/api/v1/integrations/google/calendar/callback`
- `/api/v1/integrations/microsoft/calendar/callback`

Do not assume these are correct without checking the live source/routes.

Prepare the exact redirect URIs required for provider consoles.

Do NOT:
- invent OAuth client IDs/secrets;
- place client secrets in Git;
- copy access/refresh tokens into reports;
- use static Gemini API keys;
- bypass consent or redirect-URI validation.

If provider-console registration or interactive OAuth consent is required, stop at the human account boundary with exact safe instructions and continue automatically after the user confirms completion.

After human/provider setup, verify:
- Google OAuth callback succeeds;
- Microsoft OAuth callback succeeds;
- stored tokens remain encrypted/isolated;
- Outlook remains read-only;
- Google Calendar write still requires NOTE4 explicit Confirm;
- Gemini has no Outlook access.

---

# Phase E4 — NOTE4 public Server Address migration

Only after E2 public endpoint is healthy and E1 security passed.

The long-term NOTE4 Server Address should become the verified HTTPS Funnel base URL rather than `http://192.168.50.108:3001`.

Do not wipe device identity unnecessarily.

First inspect whether the current firmware/UI provides a safe supported way to update only `server_url` while preserving pairing/device secret. If yes, use that path.

If server URL migration currently requires captive-portal reconfiguration or a device-side firmware change, document the least disruptive path. Avoid factory reset unless necessary and explicitly authorized.

Physical user action may be required to enter/reconfigure the URL; stop only at the minimal required device action.

Verify afterward:
- paired device still authenticates;
- sync works through public HTTPS;
- BTC content works;
- ordinary device polling works;
- voice/live WebSocket works if available;
- temporary home LAN loss does not break backend reachability as long as internet Wi-Fi remains available.

Test, if feasible, using a phone hotspot or other non-home Wi-Fi to prove off-LAN operation.

---

# Phase E5 — roaming Wi-Fi design and bounded implementation

Funnel solves backend reachability but the current firmware stores only one Wi-Fi SSID/password pair.

First document current behavior precisely.

Design a minimal multi-Wi-Fi profile mechanism suitable for ESP32-S3/NVS, with goals:
- retain current home Wi-Fi;
- permit at least several saved networks, e.g. home + phone hotspot + other trusted Wi-Fi;
- scan and connect to an available saved network automatically;
- preserve one public HTTPS Slate server URL across all networks;
- never expose saved passwords in UI/logs;
- bounded reconnect/backoff;
- safe migration from the existing single-profile NVS schema;
- factory-reset behavior remains clear.

Do not automatically attempt browser-based hotel/airport captive-portal login in this stage unless a separate design proves it safe and practical.

Implementation is authorized only if it is localized, testable, and does not interfere with Campaign 6D display work. If it materially expands firmware scope or conflicts with 6D, produce the design/report and defer code to a follow-up stage.

Add deterministic tests for profile selection/migration where feasible.

---

# Phase E6 — validation and final gate

Required deterministic validation for any source changes:
- backend relevant tests;
- shared tests as applicable;
- frontend build if public/account UI changed;
- lint/typecheck/format;
- Prisma validation if applicable;
- exact ESP-IDF v5.5.2 / esp32s3 build if firmware changed;
- secret-pattern scan;
- `git diff --check`.

AGY:
- high-effort for public exposure/auth/OAuth/security changes;
- medium for isolated multi-Wi-Fi implementation after architecture passes;
- maximum 3 review/fix loops; persistent P1 after 3 loops => BLOCKED.

No Airtable/Gantt.

---

# Reporting

Before every human boundary or final stop, commit and push:
- `docs/campaign-reports/06E-PUBLIC-HTTPS-ROAMING.md`
- updated `docs/campaign-reports/CAMPAIGN-STATE.md`

Report must include:

```text
START_SHA=
END_SHA=
E0_DISK_BEFORE=
E0_DOCKER_USAGE_BEFORE=
E0_RUNNING_SLATE_IMAGE=
E0_ROLLBACK_SLATE_IMAGE=
E0_CLEANUP_ACTIONS=
E0_DISK_AFTER=
E0_DOCKER_USAGE_AFTER=
E0_SLATE_HEALTH=PASS|FAIL
E0_MYSQL_HEALTH=PASS|FAIL
TAILSCALE_VERSION=
TAILSCALE_LOGGED_IN=YES|NO|UNKNOWN
TAILSCALE_HOSTNAME=
FUNNEL_AVAILABLE=YES|NO|UNKNOWN
PUBLIC_SURFACE_SECURITY=PASS|FAIL|BLOCKED
FUNNEL_ENABLED=YES|NO
PUBLIC_HTTPS_HEALTHZ=PASS|FAIL|NOT_RUN
PUBLIC_WEB_UI=PASS|FAIL|NOT_RUN
PUBLIC_WEBSOCKET=PASS|FAIL|NOT_RUN
FUNNEL_REBOOT_PERSISTENCE=PASS|FAIL|NOT_RUN
NOTE4_PUBLIC_SERVER_ADDRESS=
GOOGLE_REDIRECT_URI=
MICROSOFT_REDIRECT_URI=
GOOGLE_OAUTH_LIVE=PASS|FAIL|HUMAN_PENDING|NOT_RUN
MICROSOFT_OAUTH_LIVE=PASS|FAIL|HUMAN_PENDING|NOT_RUN
NOTE4_PUBLIC_URL_MIGRATED=YES|NO|HUMAN_PENDING
OFF_LAN_DEVICE_TEST=PASS|FAIL|HUMAN_PENDING|NOT_RUN
MULTI_WIFI_DESIGN=PASS|DEFERRED|NOT_RUN
MULTI_WIFI_IMPLEMENTED=YES|NO
HUMAN_ACTION_REQUIRED=
BLOCKER=
NEXT_ACTION=
```

Never put transient pairing codes, private keys, passwords, OAuth tokens, client secrets, JWT secrets, MySQL passwords, or Tailscale auth keys in the report.

---

# Continue/stop behavior

Continue automatically through non-destructive E0 cleanup, E1 audit, and any already-authorized non-interactive work.

Stop only at genuine boundaries:
- interactive sudo/password authorization that cannot use already-authorized privilege;
- Tailscale Funnel/tailnet approval requiring user interaction;
- provider-console OAuth redirect registration;
- Google/Microsoft interactive OAuth consent;
- physical NOTE4 server-URL/Wi-Fi action;
- destructive storage action outside E0 authorization;
- public-exposure P0/P1 security blocker;
- paid service/plan decision;
- source changes requiring separate unsafe waveform/power authorization;
- persistent P1/P0 after bounded review loops.

Normal compiler/test failures, P2/P3 fixes, safe Docker cache cleanup, security inspection, local configuration, and report publication are not human stops.

## Ordering with Campaign 6D

E0 Orange Pi disk/cache cleanup is authorized immediately and should run first because disk pressure is operationally urgent and independent of the NOTE4 USB baseline.

E1-E3 server/public/OAuth work may proceed independently of E-Ink refresh optimization provided they do not modify the flashed device or invalidate Campaign 6D's baseline.

E4 physical NOTE4 Server Address migration and E5 firmware-side multi-Wi-Fi implementation must coordinate with Campaign 6D so that refresh-baseline measurements are not invalidated or an unreviewed firmware image is flashed. If Campaign 6D is still awaiting baseline/optimized-flash authorization, preserve that gate and do not flash 6E firmware automatically.
