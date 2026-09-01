# Campaign 6C — Orange Pi Slate Backend Deployment Instructions

Date: 2026-09-01
Repository: `Streetjk/slate`
Integration branch: `integration/note4-custom`
Target host: `192.168.1.108`
Status: ACTIVE DEPLOYMENT DIRECTIVE

## Authority

This stage follows Campaign 6B flash PASS. It does not reopen completed software campaigns and does not authorize Airtable/Gantt work.

Goal: deploy the custom Slate backend/Web UI required by the flashed NOTE4 onto the user's Orange Pi at `192.168.1.108`, then verify LAN reachability so the NOTE4 can use that host as its Server Address.

Codex remains controller and production-write authority. Do not claim physical device/OAuth PASS from server deployment evidence alone.

## Source checkpoint

Expected live integration branch before this instruction commit:

`66865d311eec73b27b7d1b33aeed2c444bfebd7b`

Accepted firmware/application source remains:

`bca05819e2cccc5cfdc128d82ffda052b3913412`

Always fetch and verify live state first.

## Critical deployment rule

Do NOT deploy the stock upstream image `ghcr.io/qiujun8023/slate:latest` as the production backend for this NOTE4 campaign. It does not contain the custom Outlook/Gemini/Google Calendar/BTC-trio work from `Streetjk/slate`.

Deploy a backend built from this repository's `integration/note4-custom` code (or an image mechanically proven to be built from the exact accepted custom source).

## Phase O0 — Non-destructive Orange Pi reconnaissance

Before changing the Orange Pi:

1. Verify local Git state and fetch `origin`.
2. Attempt normal existing SSH/configured access to `192.168.1.108`. Do not brute-force credentials and do not overwrite SSH configuration.
3. If access exists, inspect only:
   - OS/distribution/version
   - CPU architecture (`aarch64`/ARM64 expected)
   - RAM and free disk
   - Docker / Docker Compose availability and versions
   - existing containers
   - existing listeners/ports, especially `3001` and `3306`
   - existing reverse proxy, DNS, tunnel or HTTPS services if readily discoverable
   - current hostname/network identity
4. Preserve all unrelated services. Do not stop/remove/reconfigure unrelated containers or daemons merely to make Slate fit.
5. If port/resource conflicts exist, choose a minimal non-destructive resolution and document it. Do not silently commandeer an occupied production port.

If SSH/authentication is unavailable, stop only at that human credential boundary and publish the evidence/report.

## Phase O1 — Verify ARM64 deployment compatibility

Before production start:

1. Confirm the Orange Pi is ARM64.
2. Verify the Slate Docker build dependencies used by this branch support ARM64, including Bun base images, Alpine packages/ffmpeg, Prisma runtime, and MySQL image.
3. Prefer building the custom image directly on the Orange Pi from the exact checked-out branch/SHA if practical, or build/publish a multi-arch/custom ARM64 image through an already-authorized path.
4. Do not replace the custom branch with upstream `latest` merely because it is easier to pull.
5. If a real ARM64 incompatibility appears, reproduce it and make the smallest source/deployment fix, then run deterministic regression and AGY review when source code changes are required.

## Phase O2 — Persistent deployment

Deploy Slate as a persistent service using Docker Compose or an equivalently reproducible container setup.

Requirements:

- Slate backend/Web UI reachable on LAN.
- Preferred LAN endpoint: `http://192.168.1.108:3001` unless a mechanically verified existing reverse proxy/HTTPS endpoint is better.
- MySQL persistent storage.
- Slate blob/data persistent storage.
- `restart: unless-stopped` or equivalent.
- Strong generated `MYSQL_PASSWORD` and `JWT_SECRET` stored only in an untracked server-side environment file/secret store.
- Never commit credentials, OAuth tokens, ADC files, client secrets, database data or `.env` contents to Git.
- Do not print secret values into the campaign report.
- Preserve a clear upgrade/rollback path.

The custom code must be built from `Streetjk/slate` `integration/note4-custom`; documentation-only commits after the accepted application source are fine if the application tree is unchanged.

## Phase O3 — Base server verification

Verify from the Orange Pi and from the Mac mini/LAN:

1. containers/services healthy;
2. MySQL healthy;
3. `GET /healthz` succeeds;
4. Web UI is reachable;
5. registration/login path is reachable as appropriate;
6. `http://192.168.1.108:3001` is reachable from another LAN device;
7. no unexpected public WAN exposure was introduced;
8. reboot/restart persistence is configured (a destructive reboot is not required merely to prove configuration).

If LAN endpoint is healthy, declare:

`NOTE4_SERVER_ADDRESS=http://192.168.1.108:3001`

unless a different verified endpoint is required due to an existing reverse proxy.

## OAuth / Gemini boundary

Do not fake or weaken OAuth configuration just to make the deployment appear complete.

For Microsoft/Google OAuth and Google Cloud ADC:

1. Inspect what this custom backend requires.
2. Determine whether the existing environment already has a usable registered HTTPS callback/domain or secure reverse proxy/tunnel.
3. LAN HTTP at `192.168.1.108` is sufficient for NOTE4-to-Slate LAN testing, but do not assume it is acceptable as a Microsoft/Google web OAuth redirect URI.
4. If provider policy/registered client configuration requires HTTPS or interactive account consent, record that as the next human/account boundary.
5. Do not add static Gemini/OpenAI/OpenRouter API keys.
6. Do not copy or expose personal OAuth/ADC token files through Git or logs.

This stage may complete successfully even if live Microsoft/Google OAuth remains pending, provided the custom backend is healthy and reachable from the NOTE4.

## Phase O4 — NOTE4 LAN connection handoff

Once the backend is healthy and reachable:

1. Give the user the exact Server Address to enter in the NOTE4 captive portal.
2. Do not automatically infer that the user has submitted it successfully.
3. After the user connects the device, continue the Campaign 6 physical matrix from `06-HARDWARE-VALIDATION.md`:
   - English UI
   - Wi-Fi/backend sync
   - BTC trio
   - sleep/wake/reconnect
   - then Outlook/Gemini/Google OAuth/live-account flows as their credential/consent boundaries permit.

## Mandatory GitHub reporting rule

Every Campaign 6C stop/checkpoint MUST be committed and pushed before returning control, unless GitHub itself is unavailable.

Create/update:

- `docs/campaign-reports/06C-ORANGE-PI-BACKEND.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

The report must include at minimum:

```text
ORANGE_PI_REACHABLE=
ORANGE_PI_OS=
ORANGE_PI_ARCH=
ORANGE_PI_RAM=
ORANGE_PI_FREE_DISK=
DOCKER_AVAILABLE=
COMPOSE_AVAILABLE=
EXISTING_SERVICE_CONFLICTS=
CUSTOM_SOURCE_SHA=
CUSTOM_IMAGE_BUILD=PASS|FAIL|NOT_RUN
SLATE_CONTAINER=PASS|FAIL|NOT_RUN
MYSQL_CONTAINER=PASS|FAIL|NOT_RUN
HEALTHZ=PASS|FAIL|NOT_RUN
WEB_UI=PASS|FAIL|NOT_RUN
LAN_REACHABILITY=PASS|FAIL|NOT_RUN
NOTE4_SERVER_ADDRESS=
OAUTH_HTTPS_READY=YES|NO|UNKNOWN
GOOGLE_ADC_READY=YES|NO|UNKNOWN
HUMAN_ACTION_REQUIRED=
BLOCKER=
NEXT_ACTION=
```

Commit only non-secret documentation/source changes and push `integration/note4-custom` before stopping.

## Stop/continue rules

Continue automatically through Orange Pi reconnaissance, custom backend build/deployment and deterministic LAN verification when normal authorized SSH access is already available.

Stop and publish evidence for a genuine human boundary such as:

- SSH authentication requiring user input/credentials not already configured;
- destructive conflict with an existing Orange Pi service;
- interactive Microsoft/Google consent;
- creation/ownership of an external domain/tunnel requiring user choice or paid action;
- a security-critical deployment finding.

Do not start Airtable/Gantt.
