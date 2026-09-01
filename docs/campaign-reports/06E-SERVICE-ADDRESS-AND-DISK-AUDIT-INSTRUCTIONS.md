# Campaign 6E Addendum — Public Server Address Migration + Orange Pi Disk Audit

Repository: `Streetjk/slate`
Branch: `integration/note4-custom`

## Authority

This addendum follows Campaign 6E E2 PASS at public HTTPS endpoint:

`https://orangepi5.tail6aabef.ts.net`

It does not replace the existing OAuth human boundary and does not authorize firmware flashing or Campaign 6D refresh changes.

Before work:
1. `git fetch origin`.
2. Read `AGENTS.md`, `CAMPAIGN-INSTRUCTIONS.md`, `CAMPAIGN-STATE.md`, `06E-PUBLIC-HTTPS-ROAMING.md`, and this file.
3. Verify the live branch HEAD and clean working tree.

## A0 — Confirm permanent NOTE4 Server Address

The permanent roaming Server Address is:

`https://orangepi5.tail6aabef.ts.net`

The old LAN-only address `http://192.168.50.108:3001` must not remain the permanent NOTE4 server URL if off-home use is required.

Firmware behavior already shows that Wi-Fi/server URL storage is separate from `device_id` / `device_secret`; changing the server URL through the supported setup/captive-portal path must preserve the paired device identity unless a separate explicit secret-clear/factory-reset action is performed.

Do not clear device identity, factory-reset, or force a re-pair unless evidence shows it is required.

Human boundary: if changing the Server Address requires physical NOTE4 captive-portal interaction, stop only for the minimum action needed and tell the user exactly what to enter. The required value is:

`https://orangepi5.tail6aabef.ts.net`

After the change, verify the NOTE4 reaches the existing paired account/backend over HTTPS before declaring migration PASS.

## A1 — Full Orange Pi storage-capacity inventory

Before deleting anything, collect and report exact live evidence from `note4-orangepi`:

- `df -hT /`
- `lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS,MODEL`
- `findmnt /`
- `docker system df -v`
- running container/image IDs and bind mounts
- `journalctl --disk-usage` if permitted
- top-level disk usage, preferably with `du -xhd1` on `/`, `/var`, `/home`, `/tmp`, `/var/tmp`, `/var/log`, `/var/cache`, `/home/pi`

Report both:
- actual block-device/system-disk capacity;
- root filesystem capacity, used and free space.

Do not infer nominal media size from `df`; record `lsblk` evidence.

## A2 — Identify safe cleanup candidates

Inspect for disposable space only. Candidates may include, when mechanically verified safe:

- remaining Docker/BuildKit cache;
- dangling/unreferenced Docker layers/images not equal to running images or the designated Slate rollback image;
- apt package cache under `/var/cache/apt/archives`;
- stale `/tmp` and `/var/tmp` files not open/in use and old enough to be safely removed;
- rotated/compressed system logs beyond a conservative retention window;
- systemd journal storage that can be vacuumed conservatively if unusually large;
- old package download caches;
- clearly stale build directories, extracted archives or temporary deployment artifacts under the `pi` home directory that are not part of the running Slate checkout/deployment, rollback, backups, SSH config, Tailscale state, or user data.

For each candidate, record path/category, size, why it is safe, and exact proposed deletion command before deletion.

## A3 — Safe cleanup policy

Authorized without another user checkpoint only when the target is provably disposable and does not need sudo interaction beyond an already-authorized non-interactive path:

- `docker builder prune` for reclaimable build cache;
- `docker image prune` for dangling images after confirming they are not the running/rollback images;
- apt cache cleanup;
- conservative systemd journal vacuum if journal size is materially large;
- stale temp files that are clearly not in use.

Never delete:

- `/home/pi/slate-note4-deploy/slate-data`;
- `/home/pi/slate-note4-deploy/mysql-data`;
- `/home/pi/slate-note4-deploy/.env`;
- `/home/pi/slate-note4-deploy/compose.yml`;
- running Slate image;
- running MySQL image;
- designated Slate rollback image;
- active repository checkout required for deployment/build reproducibility;
- Tailscale state/configuration;
- SSH keys/config;
- NOTE4 backups;
- user documents or unrelated service data;
- Docker volumes/bind mounts unless explicitly proven disposable and separately authorized.

Forbidden: `docker system prune -a`, volume prune, broad `rm -rf` against system/home directories, or destructive filesystem resizing.

If sudo password interaction is required, stop with the smallest exact command for the human to run; never request the password in chat.

## A4 — Post-cleanup validation

After cleanup:

- rerun `df -hT /` and `lsblk`;
- rerun `docker system df -v`;
- verify `slate-note4` healthy;
- verify `slate-note4-mysql` healthy;
- verify local `/healthz`;
- verify public `https://orangepi5.tail6aabef.ts.net/healthz`;
- verify Funnel status remains enabled;
- report exact bytes/GB reclaimed.

Preferred target: >2 GB root free space if achievable safely. If not, report why further cleanup would require deleting useful/rollback data or increasing/replacing the system disk.

## A5 — Reporting

Update `docs/campaign-reports/06E-PUBLIC-HTTPS-ROAMING.md` and `CAMPAIGN-STATE.md` with:

- NOTE4 Server Address migration status;
- whether pairing/device identity was preserved;
- exact system disk/block-device capacity;
- exact root filesystem capacity/usage before and after;
- cleanup candidates found;
- cleanup actions actually taken;
- exact space reclaimed;
- preserved running/rollback assets;
- Slate/MySQL/Funnel/public-health status;
- next human boundary.

Commit, push and verify the remote branch before returning control.

## Continue/stop rules

Continue automatically through read-only inventory and safe non-destructive cleanup.
Stop only for:
- physical NOTE4 server-address entry;
- sudo password interaction;
- ambiguous file ownership/safety;
- destructive cleanup beyond this authorization;
- OAuth provider-console/consent boundary;
- any P0/P1/security concern.
