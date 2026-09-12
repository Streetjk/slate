# Campaign 8D1M-G — M1 V5 Safety Corrections Summary

Date: 2026-09-05 (Australia/Perth)
Branch: `feature/gemini-35-live-evaluation`
Controller: Codex
Writer: Gemini 3.8 Flash
Reviewer: Grok 4.6

## Purpose

This document summarizes the safety corrections implemented in `scripts/slate-m1-rootstep-v5-startup-rollback-verify.sh`, derived from the Grok 4.6 review findings on `scripts/slate-m1-rootstep-v4-restart-baseline.sh`. Existing V4 is preserved untouched.

## Proven Defects and Corrections

### 1. `manifest_metrics` Definition & Preflight Commands
- **Defect**: In V4, `manifest_metrics` was called during `stage=copy` but was never defined (accidentally deleted during a prior edit). Furthermore, the commands required by `manifest_metrics` (`sort`, `wc`) were missing from the preflight command check.
- **Correction in V5**:
  - Restored and defined `manifest_metrics` before use.
  - Generates deterministic regular-file path/size manifest (`find "$root" -xdev -type f -printf '%P %s\n' | LC_ALL=C sort >"$files"`), symlink evidence (`find "$root" -xdev -type l -printf '%P\0%l\0' | LC_ALL=C sort -z >"$links"`), and hardlink evidence (`find "$root" -xdev -type f -links +1 -printf '%P\n' | LC_ALL=C sort >"$hardlinks"`) safely under `$tmpdir`.
  - Added `sort` and `wc` to the preflight command loop alongside `docker rsync findmnt realpath curl systemctl du df stat awk sha256sum find mktemp`.

### 2. Preflight `jq` Check Before Any Mutation
- **Defect**: In V4, `jq` was only checked during `stage=switch`, after Docker had already been stopped and the entire tree copied. If `jq` was missing, unnecessary downtime and rollback occurred.
- **Correction in V5**: Added `command -v jq` validation in `stage=preflight` immediately upon detecting `DAEMON_CONFIG`, before any backup creation, docker stop, or mutation.

### 3. Switched-Root 180s Startup Retry & Restart Baseline
- **Defect**: In V4, `wait_for_switch_health` aborted immediately on second 1 if `DockerRootDir` was not yet `$DEST`, if restart counts did not match stale preflight expected counts, or if healthz curls failed transiently during boot. Furthermore, the switched-root baseline was captured outside and after `wait_for_switch_health`.
- **Correction in V5**:
  - `wait_for_switch_health` now retries for the full 180-second timeout window (`STARTUP_TIMEOUT=180`).
  - Transient `DockerRootDir` delays loop safely without early termination.
  - Switched-root restart baselines (`slate_restart_baseline`, `mysql_restart_baseline`) are established once containers enter `running` state after Docker starts, absorbing expected boot-time restart behavior.
  - Subsequent restart growth beyond the established baseline is detected and rejected (`SLATE_RESTART_GROWTH`, `MYSQL_RESTART_GROWTH`).
  - Healthz curl checks retry until the deadline before recording timeout failure classes.

### 4. Verified Rollback Operations & Fail-Closed Behavior
- **Defect**: In V4, `rollback()` ran commands with redirected errors without verifying whether Docker stopped, whether `DAEMON_CONFIG.tmp` was removed, whether configuration was properly restored with matching checksums, or whether Docker restarted.
- **Correction in V5**:
  - Every rollback step is explicitly verified:
    - Docker stop verified via `systemctl is-active`.
    - Transient `DAEMON_CONFIG.tmp` removal verified.
    - Configuration restoration verified (backup file presence, `cp -a`, `chmod`, `chown`, file presence, and byte-exact SHA-256 match against backup; or config removal verified if no initial config was present).
    - Docker restart verified via `systemctl is-active`.
  - Retains the full 180-second rollback health wait with container and healthz endpoint verification.
  - Fails closed immediately if any rollback restoration step cannot be verified.

## Invariant Preservation

- Preserved paths: `$SOURCE` (`/var/lib/docker`), `$DEST` (`/mnt/ssd-tmp/slate-tools/docker-data`), `$NVME` (`/mnt/ssd-tmp`), `$SLATE_TOOLS`, `$DAEMON_CONFIG`.
- Preserved image pins: `CURRENT_IMAGE`, `ROLLBACK_IMAGE`, `MYSQL_IMAGE`.
- Preserved network and reserve floor: `slate-note4-deploy_default`, `RESERVE_FLOOR=180000000000`.
- Preserved V2/V3 content verification: rsync flags `-aHAXS --numeric-ids --delete`, dry-run checksum verification, file counts, and logical size gates.
- Preserved safety: Neither Docker tree is ever deleted; zero secrets or credentials are read, stored, or committed.
