# Campaign 8F — Migrate Slate/NOTE4 backend from Orange Pi to Immich host

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## User intent

Move the complete Slate/NOTE4 backend service off the storage-constrained Orange Pi and onto the existing Immich server, then remove the Slate runtime/package footprint from the Orange Pi after the migration is proven healthy.

Known target host from prior project evidence:

- SSH: `immich@192.168.50.214`
- hostname: `immich-ZY-AK2PLUS`
- OS: Ubuntu 24.04.x
- architecture: amd64 / Intel N100
- RAM: ~15 GiB
- free disk previously observed: ~405 GB
- Docker + Compose plugin already installed
- existing workloads include Immich and AdGuard DNS; do not disturb them

Current source host:

- Orange Pi: `note4-orangepi` / `192.168.50.108`
- current Slate image: `slate-note4:campaign8-voice-routing-121622c`
- current rollback image: `slate-note4:rollback-before-campaign8-948934c`
- current backend source: `121622c3bd1d23587b4aadb3a079ec85d2052278`
- current public endpoint: `https://orangepi5.tail6aabef.ts.net`

## Controller / worker / reviewer policy

Newest routing policy remains binding:

- Codex is controller, sole production writer/integrator, validator, and final adjudicator.
- Luna is the bounded worker when useful.
- Grok 4.6 via the existing authenticated Grok CLI/session is the independent reviewer.
- Do not use OpenRouter for Grok.
- Gemini 3.7 Flash reviewer/shadow calls remain blocked until `2026-09-06T02:00:00+08:00` unless superseded by a newer user instruction.
- No recursive delegation.

## Hard safety invariants

Do not:

- modify, stop, recreate, or remove Immich containers/data unless strictly required for shared-host networking and separately justified;
- modify or remove AdGuard DNS;
- expose Immich/AdGuard ports publicly;
- delete Orange Pi Slate/MySQL persistent data until the migration has passed all validation and a durable backup exists;
- flash NOTE4 firmware;
- merge PR #2;
- change `GEMINI_LIVE_MODEL`;
- introduce API keys, OpenRouter, copied bearer tokens, copied refresh tokens, or service-account JSON keys;
- touch Campaign 6D, PR #1, or PR #3;
- reuse the Orange Pi ARM64 image directly on amd64 as the production path.

A rollback path to the Orange Pi must remain functional until target-host acceptance is complete.

---

# Phase F0 — target-host read-only discovery

Connect to `immich@192.168.50.214` and record non-secret evidence only.

Inspect:

```bash
hostnamectl
uname -a
uname -m
cat /etc/os-release
free -h
df -hT
lsblk -f
docker version
docker compose version
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
docker network ls
docker volume ls
ss -lntup
systemctl --type=service --state=running
ufw status verbose || true
command -v tailscale || true
command -v gcloud || true
```

Also inventory the locations and Compose projects for Immich and AdGuard without printing secret environment values.

Determine:

- actual free storage now;
- CPU/RAM headroom;
- existing port allocations;
- Docker network names/subnets;
- whether Tailscale is already installed and authenticated;
- whether port `3001` is free;
- whether a dedicated Slate deployment root such as `/home/immich/slate-note4-deploy` is safe;
- whether Docker restart/reboot would affect critical home services.

Do not change anything in F0.

If the target is not healthy or has a material port/network conflict, stop with evidence.

---

# Phase F1 — migration design and rollback checkpoint

Create a durable migration checkpoint in the report before writes.

Preserve on Orange Pi:

- current running Slate and MySQL containers;
- production `.env`;
- Compose file;
- Slate data;
- MySQL data;
- current candidate image/tag;
- rollback image/tag;
- Tailscale/Funnel state;
- NOTE4 pairing/device-secret state.

Create a non-secret inventory/hashes of the current deployment.

Create a consistent migration backup:

1. Use MySQL-native logical backup (`mysqldump` or equivalent) from the running DB.
2. Archive Slate persistent data/config required for migration.
3. Record SHA-256 hashes and sizes.
4. Store a copy on the Immich host in a mode-700 migration staging directory.
5. Do not print or commit secrets or raw database content.

Prefer logical DB migration over copying a live MySQL datadir.

Do not stop the Orange Pi production service yet.

---

# Phase F2 — build an amd64 Slate candidate on Immich

The Orange Pi production image is ARM64 and must not be treated as the amd64 production image.

Build the exact reviewed source SHA on the target host for `linux/amd64`:

```text
SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
TARGET_ARCH=linux/amd64
```

Use the repository's pinned build path and lockfiles. Do not silently upgrade dependencies.

Recommended target tag:

```text
slate-note4:campaign8-voice-routing-121622c-amd64
```

Validate image architecture and source identity. Run deterministic backend/shared tests and any relevant build checks before target deployment.

Grok 4.6 independent review is required for any material migration-specific code/config change. Pure host/Compose relocation with no product-code change may be reviewed at the migration checkpoint rather than forcing code changes.

---

# Phase F3 — isolated target deployment

Create a dedicated Slate Compose project on the Immich host. Do not merge it into the Immich Compose stack.

Suggested deployment root:

```text
/home/immich/slate-note4-deploy
```

Use dedicated names/networks/volumes/bind mounts so Slate cannot collide with Immich or AdGuard.

Initially expose Slate only on a temporary local/LAN validation port if needed (for example `3101`) rather than immediately stealing the production public route.

Restore the MySQL logical backup and Slate persistent state into the target deployment.

Validate locally:

- Slate container healthy;
- MySQL container healthy;
- `/healthz` 200;
- Web UI loads;
- expected database schema/data present;
- device/pairing records preserved;
- voice-config unauthenticated request rejected;
- voice WebSocket unauthenticated request rejected;
- legacy vendor route remains absent;
- no Immich/AdGuard service or port regression;
- host RAM/CPU/disk remain healthy.

Do not cut over NOTE4/public traffic until all F3 checks pass.

---

# Phase F4 — Google Cloud / Vertex setup on the Immich host

This host is now the preferred location for Google Cloud CLI/ADC because it is intended to run the production Slate backend.

Storage on the Orange Pi is no longer a reason to install `gcloud` there.

On the Immich host, install the official Google Cloud CLI only after target-host validation and only through the official package/install path.

Interactive Google login remains a human action. Use the approved Google account/project and normal ADC flow on the Immich host. Do not copy ADC credentials from the Mac or Orange Pi.

No API-key fallback, service-account key JSON, OpenRouter, or copied token path is allowed.

Before any production environment change, verify non-secret facts only:

- selected project ID;
- Vertex API enabled;
- billing state sufficient for the intended workload;
- approved region/location;
- ADC can obtain a token without printing it;
- current Slate Live model is accepted through the approved Vertex/ADC path.

If billing activation or paid spend is newly required, stop for explicit human authorization.

---

# Phase F5 — public endpoint and NOTE4 cutover plan

Do not assume the Orange Pi Funnel URL can be transparently transferred.

Discover whether Tailscale is already present on the Immich host. If not, install/configure it only through the existing authorized tailnet flow.

Create/verify a new Immich-host Slate HTTPS/Funnel endpoint. Record the exact hostname only after Tailscale returns it.

Then update all affected integration/public routing plans:

- NOTE4 Server Address;
- Google Calendar callback URL;
- Microsoft Calendar callback URL;
- any Web UI origin/callback settings;
- Funnel/Tailscale exposure.

Do not expose Immich or AdGuard through the Slate Funnel.

Because OAuth provider callback changes are human/provider-console boundaries, stop for the exact required human actions if those callbacks must be registered.

For NOTE4, preserve pairing/device secret. Prefer changing only the Slate Server Address rather than factory-resetting/re-pairing.

---

# Phase F6 — controlled production cutover

Only after F3/F4/F5 prerequisites pass:

1. Put the Orange Pi Slate service into the shortest practical write-free maintenance window.
2. Take a final incremental/logical DB backup and restore any delta to Immich.
3. Start target Slate/MySQL production services.
4. Switch NOTE4/public routing to the target host.
5. Keep Orange Pi containers/images/data intact but stopped as immediate rollback.

Validate:

- target local health;
- target public HTTPS health;
- Web UI;
- authenticated NOTE4 polling;
- voice-config authenticated contract;
- unauthenticated rejection checks;
- voice WebSocket path/security;
- no vendor/Tenclass path;
- Google/Vertex runtime when authorized;
- Outlook read-only behavior;
- Google Calendar proposal/confirmation invariants;
- no Immich/AdGuard regression;
- host resource stability.

If any P0/P1 migration fault occurs, rollback public/device routing to the Orange Pi and restart the preserved Orange Pi deployment.

---

# Phase F7 — acceptance soak

Before removing Orange Pi runtime artifacts, observe the Immich-host deployment through a bounded acceptance window.

Minimum acceptance:

- no unexpected container restarts;
- healthy Slate/MySQL throughout;
- repeated public health checks;
- repeated NOTE4 authenticated polling;
- at least one successful normal Web/UI flow;
- no Immich/AdGuard regression;
- no disk/RAM pressure.

If physical NOTE4 voice firmware is still unflashed, do not treat the host migration as firmware authorization. Firmware remains a separate gate.

Grok 4.6 should review the migration evidence before final source-host cleanup if available under the current reviewer policy.

---

# Phase F8 — Orange Pi cleanup after migration PASS

The user has authorized removing the Slate service/package footprint from the Orange Pi after successful migration. Cleanup must remain scoped to Slate-related runtime artifacts and must not destroy the only rollback copy before target acceptance.

After F7 PASS and durable backup verification:

Allowed cleanup on Orange Pi:

- stop/disable/remove Slate Compose containers;
- remove Slate-specific current/historical Docker images by exact tag/ID once no longer required for rollback;
- remove Slate-specific stopped containers;
- remove Slate deployment source/build/staging archives;
- remove Google Cloud CLI/ADC artifacts if any were later installed on the Pi for Slate (currently not installed at the recorded checkpoint);
- remove Slate-specific Compose/project files after archiving the final non-secret config and backup metadata;
- remove unused Docker cache produced only by Slate.

Preserve initially:

- one final compressed migration/rollback backup of MySQL + Slate state, with hash, until a later explicit purge;
- non-Slate OS services;
- unrelated Docker workloads, if any;
- Tailscale unless it is proven to be used only by Slate and separately approved for removal;
- system/network configuration unrelated to Slate.

Do **not** delete persistent MySQL/Slate data irreversibly until the target migration and backup are verified. If the intent is to purge the last rollback data as well, stop and request explicit final purge authorization.

Docker itself may be uninstalled from the Orange Pi only if a read-only inventory proves there are no non-Slate Docker workloads and the user separately confirms that host-level package removal.

After cleanup report:

- Orange Pi free bytes/usage;
- remaining Docker images/containers;
- remaining Slate files/packages;
- target-host health;
- rollback backup location/hash;
- whether Tailscale remains and why.

---

# Final campaign states

Use one of:

```text
IMMICH_MIGRATION=BLOCKED_TARGET_HOST
IMMICH_MIGRATION=READY_FOR_CUTOVER
IMMICH_MIGRATION=PASS
IMMICH_MIGRATION=ROLLED_BACK
ORANGEPI_CLEANUP=NOT_STARTED
ORANGEPI_CLEANUP=PASS_RUNTIME_REMOVED_BACKUP_RETAINED
```

Do not mark migration PASS unless the new host is actually serving production Slate traffic and NOTE4 polling/public health are confirmed.

## Immediate next action

Start at **F0 read-only discovery** on `immich@192.168.50.214`. Continue autonomously through non-destructive preparation. Stop at any genuine human OAuth/billing/public-route cutover boundary or before any irreversible Orange Pi persistent-data purge.