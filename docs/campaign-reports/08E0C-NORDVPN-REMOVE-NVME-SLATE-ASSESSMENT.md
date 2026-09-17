# Campaign 8E0C — Remove NordVPN and assess bounded NVMe use for Slate

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This directive supersedes Campaign 8F as the immediate next action. Do **not** migrate Slate to the Immich host at this stage. The Orange Pi already has a 238.5 GB NVMe mounted at `/mnt/ssd-tmp`; that NVMe is intentionally used as a temporary/buffer zone for Deluge downloads, so Slate may use only a bounded share that does not compromise Deluge's buffer function.

## Current accepted state

- Orange Pi root free space: approximately 1.94 GB on a ~14 GB root filesystem.
- NVMe mount: `/mnt/ssd-tmp`, approximately 238.5 GB.
- HDD archive mount: `/mnt/hdd-archive`, approximately 9.1 TB.
- Slate/MySQL healthy.
- Tailscale/Funnel healthy.
- NOTE4 authenticated polling healthy.
- `nordvpnd.service` is active and the installed `nordvpn` package is approximately 93.7 MB installed size.
- Deluge and Deluge Web are intentionally retained.
- No Google Cloud CLI installed yet.

## Controller / model policy

- Codex remains controller and sole production integrator.
- Luna is the bounded worker when useful.
- Grok 4.6 via the existing authenticated Grok CLI/session is the independent reviewer where a review gate is needed.
- Gemini 3.7 Flash review/shadow calls remain blocked until `2026-09-06T02:00:00+08:00` unless superseded.

## Hard invariants

Do not:

- remove or alter Tailscale;
- remove or alter Deluge / Deluge Web;
- alter `/mnt/hdd-archive`;
- repartition, format, shrink, or recreate the NVMe;
- change Deluge download/completed-download paths in this stage;
- move Docker data-root in this stage;
- move Slate/MySQL data in this stage;
- install gcloud in this stage;
- flash NOTE4 firmware;
- merge PR #2;
- change production Gemini model, credentials, billing, or OAuth state;
- touch Campaign 6D, PR #1, or PR #3.

---

# N0 — Pre-change health and NordVPN ownership check

Before removal, record non-secret evidence:

```bash
systemctl status nordvpnd --no-pager || true
systemctl is-enabled nordvpnd || true
dpkg-query -W -f='${Package}\t${Status}\t${Installed-Size}\n' nordvpn 2>/dev/null || true
apt-cache policy nordvpn 2>/dev/null || true
command -v nordvpn || true
ss -lntup

tailscale status
curl -fsS http://127.0.0.1:3001/healthz
curl -fsS https://orangepi5.tail6aabef.ts.net/healthz

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
df -B1 /
```

Confirm that `nordvpnd.service` belongs to the `nordvpn` package and that no Slate/Tailscale systemd unit has a dependency on it.

If ownership is ambiguous, stop rather than removing a different package.

---

# N1 — Remove NordVPN only

The user explicitly authorized removal of NordVPN from the Orange Pi.

Use the narrowest package removal path. Preferred sequence:

```bash
sudo systemctl stop nordvpnd.service || true
sudo systemctl disable nordvpnd.service || true
sudo apt-get remove --purge -y nordvpn
```

Do **not** run `apt autoremove` automatically. Do not remove OpenVPN, Tailscale, NetworkManager, WireGuard/kernel networking packages, or shared libraries merely because APT marks them as automatically installed.

If NordVPN installed an exact vendor repository/key/config file, list those residual NordVPN-specific files after package removal. Remove only files that are unambiguously NordVPN-owned and not shared. Do not edit generic networking configuration.

After removal:

```bash
systemctl status nordvpnd --no-pager || true
command -v nordvpn || true
dpkg-query -W nordvpn 2>/dev/null || true
tailscale status
curl -fsS http://127.0.0.1:3001/healthz
curl -fsS https://orangepi5.tail6aabef.ts.net/healthz
df -B1 /
```

Record exact bytes reclaimed.

If Slate, public HTTPS, or Tailscale regresses, stop and investigate before any further action.

---

# V0 — Read-only NVMe / Deluge buffer assessment

Do not create, delete, move, resize, or reformat anything in this phase.

Determine the exact NVMe block device and filesystem behind `/mnt/ssd-tmp`:

```bash
findmnt -no SOURCE,FSTYPE,OPTIONS,SIZE,USED,AVAIL /mnt/ssd-tmp
lsblk -o NAME,PATH,SIZE,FSTYPE,FSVER,LABEL,UUID,MOUNTPOINTS
blkid
cat /etc/fstab

df -hT /mnt/ssd-tmp /mnt/hdd-archive
df -B1 /mnt/ssd-tmp /mnt/hdd-archive
sudo du -xhd1 /mnt/ssd-tmp 2>/dev/null | sort -h
sudo find /mnt/ssd-tmp -xdev -maxdepth 2 -type d -printf '%p\n' 2>/dev/null | sort
```

Inventory Deluge's current configuration without printing credentials:

- service unit and user;
- active config directory;
- download directory;
- incomplete/temp directory;
- completed/move-completed directory;
- whether completed downloads are moved to `/mnt/hdd-archive`;
- any free-space thresholds or queue limits already configured;
- current active download footprint on `/mnt/ssd-tmp`.

Use Deluge config inspection carefully: redact/remove passwords, auth tokens, proxy credentials, tracker credentials, and private torrent metadata from reports.

Also collect current NVMe utilization and the largest top-level consumers. Do not inspect or publish torrent names if that would expose private content; aggregate by size/path category where possible.

---

# V1 — Determine a safe Slate allocation model

Goal: let Slate use a small, predictable portion of the NVMe while preserving the NVMe's primary role as a Deluge buffer.

Evaluate these options in order:

### Preferred A — dedicated Slate directory + explicit capacity/free-space policy

Example conceptual path only:

```text
/mnt/ssd-tmp/slate-note4/
```

This is preferred if the filesystem is a normal ext4/xfs/btrfs filesystem and a hard partition is unnecessary.

Determine a safe cap using actual disk state. The cap should be large enough for Slate/MySQL growth but small relative to Deluge's buffer capacity. Do not assume an arbitrary percentage without evidence.

At minimum preserve a **Deluge reserve floor** that is much larger than Slate's expected use. Recommend both:

- `SLATE_NVME_CAP_GB=<bounded value>`
- `DELUGE_NVME_RESERVED_FREE_GB=<larger safety floor>`

For context only, current Slate data plus MySQL and runtime growth is expected to be far smaller than the full 238.5 GB NVMe; a modest 10–20 GB class allocation may be sufficient, but Codex must calculate/recommend from observed data rather than implementing that number blindly.

### Preferred B — filesystem-native quota/subvolume

If the filesystem already supports a safe quota/subvolume mechanism without repartitioning:

- ext4/xfs project quota, if already enabled or can be enabled later with low risk;
- btrfs subvolume/qgroup if the NVMe is btrfs;
- ZFS dataset quota if applicable.

Assess only in this stage; do not enable quota features or remount/reboot yet.

### Avoid C — repartitioning

Do not repartition the NVMe just to create a Slate partition unless A/B are technically unsuitable. Repartitioning a live Deluge buffer adds unnecessary risk and reduces flexibility.

### Avoid D — move all Docker data-root to NVMe

Do not recommend moving `/var/lib/docker` wholesale unless there is a strong measured reason. A shared Docker data-root can grow unpredictably and consume Deluge buffer space. Prefer moving only Slate's persistent bind-mounted data if/when migration is authorized.

---

# V2 — Recommend exactly what should move later

Produce a no-write plan comparing:

1. keep Docker image/layer storage on root but move only:
   - `/home/pi/slate-note4-deploy/slate-data`
   - `/home/pi/slate-note4-deploy/mysql-data`
   to a bounded NVMe Slate directory using bind mounts;
2. keep all Slate persistent data on root and use NVMe only for backups/staging;
3. other filesystem-native bounded option if clearly superior.

For each option report:

- estimated root bytes reclaimed;
- expected NVMe footprint;
- Deluge impact;
- rollback complexity;
- downtime required;
- whether MySQL logical backup/restore or file-level move is safest;
- whether any remount/reboot is needed.

Prefer the smallest migration that materially improves root headroom.

---

# V3 — Post-stage checkpoint

Update `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md` with:

```text
NORDVPN_REMOVED=YES|NO|BLOCKED
NORDVPN_BYTES_RECLAIMED=<bytes>
TAILSCALE_AFTER_NORDVPN=PASS|FAIL
SLATE_HEALTH_AFTER_NORDVPN=PASS|FAIL
PUBLIC_HEALTH_AFTER_NORDVPN=PASS|FAIL
ROOT_FREE_BYTES_AFTER_NORDVPN=<bytes>
NVME_SOURCE=<device>
NVME_FILESYSTEM=<type>
NVME_TOTAL_BYTES=<bytes>
NVME_USED_BYTES=<bytes>
NVME_FREE_BYTES=<bytes>
DELUGE_BUFFER_ROLE=CONFIRMED|UNCONFIRMED
DELUGE_BUFFER_CURRENT_USAGE_BYTES=<bytes or UNKNOWN>
RECOMMENDED_SLATE_NVME_MODEL=<directory_policy|filesystem_quota|other|none>
RECOMMENDED_SLATE_NVME_CAP_GB=<value or PENDING>
RECOMMENDED_DELUGE_RESERVED_FREE_GB=<value or PENDING>
SLATE_DATA_MOVE_EXECUTED=NO
NVME_REPARTITIONED=NO
DOCKER_DATA_ROOT_MOVED=NO
```

Stop for human review before moving any Slate/MySQL data to NVMe.

## Immediate action

Execute N0/N1 (NordVPN removal) and V0/V1/V2 (read-only NVMe/Deluge assessment). Do not move Slate data or repartition the NVMe yet.