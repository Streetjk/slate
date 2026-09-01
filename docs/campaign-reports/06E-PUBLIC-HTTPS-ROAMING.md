# Stage Report

Stage: Campaign 6E — Public HTTPS + roaming connectivity
Date: 2026-09-01 (Australia/Perth)
Status: E0/E1/E2 PASS; A1-A4 PASS; A0 NOTE4 Server Address migration HUMAN_PENDING at the physical captive-portal boundary

## Repository State

Repository: `Streetjk/slate`
Branch: `integration/note4-custom`
Base SHA: `dd18b72e95831e8972d5c0528574aa483b96ada5`
Head SHA: `478653d1c46c449f67b5293c27c863142ef1ccd3` before this report update commit
Upstream SHA: not changed in this stage

## Harness

Codex version: not re-probed in this infrastructure-only stage
AGY version: not invoked; no source/config change required
AGY model: not invoked
AGY authentication: not applicable this stage
Orchestration mode: Codex primary; AGY read-only reviewer

## Objective

Relieve Orange Pi storage pressure safely, audit the Slate public surface, and
prepare a stable HTTPS endpoint through Tailscale Funnel without exposing
MySQL, unrelated services, or the LAN port directly to the Internet.

## Work Completed

### E0 — disk/cache hygiene

Before cleanup, the Orange Pi root filesystem had approximately 508 MB free
(97% used). Docker reported three preserved images (active Slate, rollback
Slate, and MySQL) and approximately 2.826 GB of builder cache.

The following preservation set was mechanically identified:

- Active Slate image: `slate-note4:campaign5-runtime-fix-948934c`,
  `sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`.
- Active MySQL image: `mysql:8`,
  `sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb`.
- Slate rollback image: `slate-note4:campaign5-bca0581`,
  `sha256:52ee3c48f993e7e562665d79f8b0de495a22d2dc49ebc69a9a0fd7a3eb564398`.
- Slate data bind: `/home/pi/slate-note4-deploy/slate-data -> /data`.
- MySQL data bind: `/home/pi/slate-note4-deploy/mysql-data -> /var/lib/mysql`.
- Deployment Compose: `/home/pi/slate-note4-deploy/compose.yml`, mode 644.
- Deployment environment file: `/home/pi/slate-note4-deploy/.env`, mode 600;
  contents were not read or recorded.

Cleanup actions were limited to `docker builder prune -f`, termination of the
stale idle prune client after the cache had stopped shrinking, and
`docker image prune -f`. No volumes, bind-mounted data, active images,
rollback image, Compose file, environment file, or unrelated service data were
removed. The dangling-image prune reclaimed 0 B. Docker builder cache fell to
1.472 GB, with approximately 39.92 MB reclaimable.

### E1 — Tailscale and public-surface audit

Orange Pi Tailscale is online:

- Version: `1.102.2`.
- Backend state: `Running`.
- Hostname/FQDN: `orangepi5.tail6aabef.ts.net`.
- Tailscale IPv4: `100.98.54.118`.
- Funnel status before enablement: `No serve config`.

The installed CLI and current official documentation confirm the current
syntax is `tailscale funnel --bg <target>` (with `--yes` for non-interactive
configuration), HTTPS termination is provided by Tailscale, and reverse-proxy
targets must use `http://127.0.0.1:<port>`. Current Funnel HTTPS ports are
restricted to 443, 8443, or 10000. Funnel may require tailnet policy/HTTPS
approval and an administrative/root operation. References:

- https://tailscale.com/docs/features/tailscale-funnel
- https://tailscale.com/docs/reference/tailscale-cli/funnel

The backend audit found:

- `/healthz` is public and returns only status/timestamp.
- Register/login are public but rate-limited (register 5/window and login
  10/window, keyed by client IP).
- Device registration is public and rate-limited; device current/sync routes
  require the device secret through `DeviceAuthGuard`.
- Content reads are public at the Nest guard level but require either a valid
  user JWT or device secret through `JwtOrDeviceAuthGuard` and enforce owner or
  selected-device scope.
- Web management, assistant answer, calendar integration, groups, device
  management, and mutations remain behind the global JWT guard.
- Google and Microsoft callback routes are public only for OAuth callback
  completion; their `auth-url` and status routes require JWT.
- `/api/v1/voice/websocket` authenticates the device secret before starting a
  voice session.
- Dashboard ingest is a deliberately public capability-URL endpoint with
  content-ID addressing, 30 requests/minute/content-ID, and payload limits.
- MySQL is container-network-only (`3306/tcp` is not host-published). Slate is
  LAN-bound at `0.0.0.0:3001`, but no Funnel or router port-forward was added.
- Logger serializers redact authorization, cookies, token/API-key fields, and
  password/secret request fields.

This audit found no P0/P1 blocker in the existing authenticated boundaries for
the requested personal deployment. Open registration and capability-URL
dashboard ingest remain documented intentional existing surfaces and should be
revisited before broader public use.

Funnel enablement was attempted with the exact loopback target:

```text
sudo tailscale funnel --bg --yes http://127.0.0.1:3001
```

The non-root attempt correctly returned that the serve configuration is denied
and must be run with sudo. The sudo attempt stopped at the human boundary:
`sudo: a password is required`. No Funnel configuration was created.

## E2–E3 Continuation Evidence

The user subsequently enabled Funnel on `note4-orangepi`. The verified
configuration is:

```text
orangepi5.tail6aabef.ts.net:443 /
  -> http://127.0.0.1:3001
```

`tailscale funnel status --json` reports HTTPS on 443, the root proxy above,
and `AllowFunnel: true`. Tailscale remains online and `tailscaled` is enabled
and active. The background Funnel configuration was observed from separate SSH
sessions. An actual Orange Pi reboot was not performed, so reboot survival is
not claimed as a hardware-tested result.

Public verification from the Mac:

- DNS: `orangepi5.tail6aabef.ts.net` resolved to `100.98.54.118`.
- `curl https://orangepi5.tail6aabef.ts.net/healthz`: HTTP/2 200 with
  `application/json` and valid certificate verification.
- `curl https://orangepi5.tail6aabef.ts.net/`: HTTP/2 200,
  `text/html; charset=utf-8`, 1451 bytes.
- Certificate subject: `orangepi5.tail6aabef.ts.net`; issuer Let's Encrypt
  `YE1`; validity observed 2026-09-01 through 2026-11-30.
- HTTP port 80 did not accept a connection; no HTTP downgrade was observed.
- Public WebSocket `wss://orangepi5.tail6aabef.ts.net/api/v1/voice/websocket`
  completed the upgrade and closed with code `1008` / reason
  `device authentication failed` when no device secret was supplied. This
  verifies the public upgrade path and authentication gate without exposing a
  credential or starting a device session.
- Port 8443 was not configured. MySQL remains without a host-published port.
- Direct `http://orangepi5.tail6aabef.ts.net:3001` was reachable from the
  Mac's Tailscale/LAN context because the existing Compose binding is
  `0.0.0.0:3001`; this is not the public Funnel listener and no Internet route
  or router port-forward was added. The public Internet endpoint is HTTPS on
  443 only.

The exact callback route shapes are present in source and are reachable on the
public HTTPS host (malformed requests return the existing application error):

```text
https://orangepi5.tail6aabef.ts.net/api/v1/integrations/google/calendar/callback
https://orangepi5.tail6aabef.ts.net/api/v1/integrations/microsoft/calendar/callback
```

The deployed environment currently has neither redirect variable set, and no
client IDs/secrets were read or changed. E3 therefore stops at the provider
account boundary. The user must register the exact redirect URIs in the Google
and Microsoft provider consoles and enter any required values directly into
the Orange Pi's mode-600 deployment environment. Do not send credentials in
chat, commit them, or put them in this report.

## Files Changed

- `docs/campaign-reports/06E-PUBLIC-HTTPS-ROAMING.md` — this E0/E1 evidence
  and human-boundary report.
- `docs/campaign-reports/CAMPAIGN-STATE.md` — durable resume state updated to
  record E0 PASS and the E1 sudo authorization boundary.

No product source, firmware, deployment Compose, environment, image, or
Campaign 6D artifacts were changed.

## Architecture Decisions

- Preserve the existing Slate/MySQL images and one custom Slate rollback image.
- Use Tailscale Funnel only as HTTPS termination/proxy to `127.0.0.1:3001`.
- Do not expose MySQL, unrelated Orange Pi services, or a router-forwarded
  port.
- Do not flash firmware or alter Campaign 6D physical measurements.
- Do not migrate NOTE4 `server_url` until public HTTPS is actually healthy.

## Tests

- `df -h /` before cleanup — PASS for evidence; approximately 508 MB free.
- `docker system df -v` before cleanup — PASS for inventory; builder cache
  approximately 2.826 GB.
- `docker ps --no-trunc` and `docker inspect` — PASS; preserved containers and
  bind mounts identified.
- `docker builder prune -f` — PASS with bulk cache reclamation; stale idle
  client was terminated after no further progress.
- `docker image prune -f` — PASS; `0 B` reclaimed and no tagged image removed.
- `df -h /` after cleanup — PASS; approximately 1.2–1.4 GB free (91–92% used).
- `docker system df -v` after cleanup — PASS; 3 preserved images, 2 healthy
  containers, no local volumes removed, builder cache 1.472 GB.
- `curl -fsS http://127.0.0.1:3001/healthz` on Orange Pi — PASS; returned
  `{"status":"ok", ...}`.
- `curl -fsS http://192.168.50.108:3001/healthz` from Mac/LAN — PASS.
- Unauthenticated LAN route probes — PASS: protected routes returned `401`;
  method-mismatched probes returned `404`; `/api/v1/healthz` returned `404`.
- `docker ps` after cleanup — PASS; `slate-note4` and
  `slate-note4-mysql` remained healthy.
- `tailscale funnel status` — PASS for no unintended config; `No serve config`.

## AGY Review

Reviewer model: not invoked
Effort level: not applicable
Verdict: NOT RUN — no source/config change was made and Funnel is blocked at
the root authorization boundary.

P0 findings: none observed
P1 findings: none observed
P2 findings: none adjudicated
P3 findings: none adjudicated

Findings accepted: none
Findings rejected: none
Reason for any rejected finding: none

## Security Checks

OAuth-only requirement: preserved; no AI/API credential was added.
Static AI API keys found: not introduced; deployment secret contents were not
read.
Outlook read-only: unchanged; source audit found only fixed Graph
`calendarView` usage in the existing provider.
Outlook exposed to Gemini: no; no source/config change and existing isolation
tests remain unchanged.
Google Calendar confirmation gate: unchanged; no source/config change.
Secrets detected: none in changed files or report; `.env` was not read.

The earlier E1 observation that public exposure was not enabled is historical.
The current E2 Funnel configuration is enabled and remains verified after the
storage audit; see the continuation evidence below.

## Known Issues

- The NOTE4 Server Address has not yet been entered through the supported
  captive-portal path. Live paired-device polling over the public HTTPS URL and
  off-LAN roaming are therefore not claimed.
- Provider-console redirect registration and interactive Google/Microsoft OAuth
  consent remain a separate E3 human boundary.
- Campaign 6D remains independently blocked on its physical refresh-baseline
  work; this stage did not alter or flash the device.
- Optional apt-cache and disabled Snap-revision cleanup remains available only
  through root/snap administration. It is not needed for the preferred free
  space target and was not attempted.

## Deviations

- AGY review was not invoked because this continuation made no product source
  or deployment configuration change; the work was a read-only audit plus
  authorized cache-only cleanup. A high-effort AGY security review remains
  required if source/config changes are introduced.
- The addendum's A0 physical migration remains pending because the supported
  firmware UI exposes the setup portal only when Wi-Fi setup is entered. No
  factory reset or re-registration was used.

## Next Recommended Stage

On the paired NOTE4, perform the minimum supported server-address migration:

```bash
1. Temporarily make its saved Wi-Fi unavailable so it falls back to setup mode.
2. Connect a phone/laptop to the SSID shown by the NOTE4 (for example,
   `Slate-XXXX`).
3. Browse to `http://192.168.4.1`.
4. Enter the existing Wi-Fi SSID and password and set Server Address to:
   https://orangepi5.tail6aabef.ts.net
5. Submit and wait for the NOTE4 to restart and reconnect.
```

Do not choose Factory reset and do not re-register the device. Firmware source
separates `server_url` storage from `device_id`/`device_secret`, so this
supported save path is expected to preserve pairing. Afterward, verify a valid
paired-device poll/backend session and an off-LAN HTTPS sync. Do not enter
provider credentials in Git or reports.

## Addendum — A0-A5 Disk Audit and Server Address Boundary

This continuation was performed against the exact integration branch at
`478653d1c46c449f67b5293c27c863142ef1ccd3`. No product source, firmware,
Compose, environment, persistent data, or Campaign 6D files were changed.

### A0 — NOTE4 Server Address and pairing preservation

Permanent Server Address:
`https://orangepi5.tail6aabef.ts.net`

The supported setup portal was inspected in firmware source. It saves
`wifi_ssid`, `wifi_pwd`, and `server_url` separately from the pairing
`device_id` and `device_secret`; Factory reset/Clear is the separate identity
destructive path. The live device's secret was not read or printed, and live
paired polling cannot be verified until the user performs the portal entry.

Status: `HUMAN_PENDING` — the exact physical action is listed under Next
Recommended Stage. No factory reset or re-registration was performed.

### A1 — Exact Orange Pi storage inventory

The physical/system media was verified with `lsblk`, not inferred from `df`:

- Root/system block device: `/dev/mmcblk1`, `15476981760` bytes
  (approximately 14.42 GiB), model not reported by the board.
- Root partition: `/dev/mmcblk1p1`, `15300820992` bytes, `ext4`, mounted at
  `/` (also visible at `/var/log.hdd` in the board's mount listing).
- Root filesystem after cleanup: `14985895936` bytes total,
  `11827781632` bytes used, `2958172160` bytes available, `80%`.
- Other physical media was preserved: 10 TB HDD at `/mnt/hdd-archive` and
  256 GB NVMe at `/mnt/ssd-tmp`; neither is the root system disk.
- `findmnt /`: `/dev/mmcblk1p1 ext4 rw,relatime,errors=remount-ro,commit=120`.

Initial inventory identified `/var/lib/snapd` at approximately 3.5 GB,
`/var/cache/apt` at approximately 417 MB, and only 12.3 MB of systemd
journals. Home contained the active source checkout and deployment only; no
stale build directory or archive was deleted.

### A2 — Cleanup candidates and safety decisions

- Docker BuildKit cache: approximately `1.472 GB`, mechanically reclaimable
  and separate from the running images; safe to prune.
- Dangling images: none; `docker image prune` reclaimed `0 B`.
- Apt archives: `324121668` bytes of `.deb` files, root-owned and requiring
  sudo; not removed because no passwordless sudo was available.
- Disabled Snap revisions: `1845465088` bytes, unrelated OS package data and
  requiring root/snap administration; not removed.
- Journals: `12.3 MB`, not materially large; no vacuum performed.
- `/tmp` and `/var/tmp`: no files older than seven days; no deletion needed.
- User cache and rotated logs were small or tied to active desktop processes;
  they were preserved.

### A3 — Actions actually taken

The only cleanup was:

```text
docker builder prune -a -f
docker image prune -f
```

The old builder client stopped responding after the cache reached zero; only
that stale prune client was terminated with `SIGTERM` after verifying it was
the idle cleanup client. No Docker volumes, bind mounts, containers, active
images, rollback image, Compose file, `.env`, Tailscale state, SSH state,
backups, or user data were touched. `docker system prune -a` was not used.

### A4 — Post-cleanup validation

- Docker Build Cache: `1.472 GB` before to `0 B` after.
- Docker images: exactly three preserved images; active Slate image
  `slate-note4:campaign5-runtime-fix-948934c`, rollback image
  `slate-note4:campaign5-bca0581`, and `mysql:8`.
- Containers: `slate-note4` and `slate-note4-mysql` both `healthy`; no host
  MySQL port was added.
- Local `http://127.0.0.1:3001/healthz`: `200`, JSON status `ok`.
- Public `https://orangepi5.tail6aabef.ts.net/healthz`: `200`, JSON status
  `ok`.
- Public Web UI: `200`, HTML, `1451` bytes.
- Funnel: enabled; `443` HTTPS proxies `/` to `http://127.0.0.1:3001`.
- `tailscaled`: enabled and active.
- Exact final root free space: `2958172160` bytes (approximately 2.75 GiB),
  meeting the preferred `>2 GB` free-space target.

Filesystem-level reclaimed bytes are not claimed as an exact delta because
the pre-cleanup `df -h` evidence was human-rounded and Docker overlay storage
accounting is separate. The exact Docker-reported reclaim is the cache change
above.

### A5 — Current boundary

The Orange Pi service and public HTTPS infrastructure are ready. The remaining
6E action is physical NOTE4 portal entry and paired/off-LAN verification. This
stage does not authorize firmware flashing.

## Final Stage Verdict

NOT READY — A1-A4 PASS and E2 remains PASS. A0 physical NOTE4 Server Address
migration and paired/off-LAN verification are HUMAN_PENDING; E3 provider OAuth
console/consent is also HUMAN_PENDING.

START_SHA=`478653d1c46c449f67b5293c27c863142ef1ccd3`
END_SHA=`478653d1c46c449f67b5293c27c863142ef1ccd3` before this report commit
E0_DISK_BEFORE=`/dev/mmcblk1p1 14G, 13G used, 508M free, 97%`
E0_DOCKER_USAGE_BEFORE=`3 images / 3.606GB; builder cache approximately 2.826GB`
E0_RUNNING_SLATE_IMAGE=`slate-note4:campaign5-runtime-fix-948934c @ sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3`
E0_ROLLBACK_SLATE_IMAGE=`slate-note4:campaign5-bca0581 @ sha256:52ee3c48f993e7e562665d79f8b0de495a22d2dc49ebc69a9a0fd7a3eb564398`
E0_CLEANUP_ACTIONS=`docker builder prune -f; docker image prune -f; no volumes/images/data removed`
E0_DISK_AFTER=`/dev/mmcblk1p1 14G, approximately 1.2–1.4GB free, 91–92% used`
E0_DOCKER_USAGE_AFTER=`3 preserved images / 3.606GB; builder cache 1.472GB; no volumes`
E0_SLATE_HEALTH=PASS
E0_MYSQL_HEALTH=PASS
TAILSCALE_VERSION=`1.102.2`
TAILSCALE_LOGGED_IN=YES
TAILSCALE_HOSTNAME=`orangepi5.tail6aabef.ts.net`
FUNNEL_AVAILABLE=YES
PUBLIC_SURFACE_SECURITY=PASS
FUNNEL_ENABLED=YES
PUBLIC_HTTPS_HEALTHZ=PASS
PUBLIC_WEB_UI=PASS
PUBLIC_WEBSOCKET=PASS — upgrade reached gateway; unauthenticated close 1008 as designed
FUNNEL_REBOOT_PERSISTENCE=NOT_RUN — background config and enabled Tailscale service verified; no reboot performed
NOTE4_PUBLIC_SERVER_ADDRESS=`https://orangepi5.tail6aabef.ts.net`
GOOGLE_REDIRECT_URI=`https://orangepi5.tail6aabef.ts.net/api/v1/integrations/google/calendar/callback` (provider registration HUMAN_PENDING)
MICROSOFT_REDIRECT_URI=`https://orangepi5.tail6aabef.ts.net/api/v1/integrations/microsoft/calendar/callback` (provider registration HUMAN_PENDING)
GOOGLE_OAUTH_LIVE=HUMAN_PENDING
MICROSOFT_OAUTH_LIVE=HUMAN_PENDING
NOTE4_PUBLIC_URL_MIGRATED=HUMAN_PENDING
PAIRING_DEVICE_SECRET=`not accessed; preservation path verified; live state unverified`
OFF_LAN_DEVICE_TEST=HUMAN_PENDING
MULTI_WIFI_DESIGN=DEFERRED
MULTI_WIFI_IMPLEMENTED=NO
HUMAN_ACTION_REQUIRED=`Use the supported captive portal: temporarily make saved Wi-Fi unavailable, connect to the displayed Slate-XXXX AP, browse http://192.168.4.1, enter the existing Wi-Fi credentials and https://orangepi5.tail6aabef.ts.net; do not factory-reset or re-register`
BLOCKER=`Physical portal entry and subsequent paired HTTPS/off-LAN confirmation; provider OAuth console/consent remains separate`
NEXT_ACTION=`After portal entry, verify paired polling and off-LAN HTTPS sync; then resume E3/E4 live checks`
