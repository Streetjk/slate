#!/usr/bin/env bash
# Campaign 8D1M-G M1 diagnostic-only task.
# slate-m1-sparse-readonly-root-diagnostic-v1.sh
#
# PURPOSE:
# Perform a strictly read-only root diagnostic comparing /var/lib/docker (source) and
# /mnt/ssd-tmp/slate-tools/docker-data (destination) to verify metadata equivalence,
# inspect allocation/sparse representation differences, and run an exact rsync dry-run.
#
# SAFETY INVARIANTS:
# 1. READ-ONLY: Never modifies either Docker tree, daemon config, Docker service,
#    containers, Deluge, credentials, or provider state.
# 2. SANITIZED: Never prints file contents, plaintext relative paths, or raw metadata blobs.
# 3. ROOT-GUARDED: Intended for manual root execution; fails closed on any unsafe precondition.
# 4. ISOLATED TEMP: Temporary files are stored strictly in a dedicated directory outside
#    both Docker trees and cleaned up via trap on exit.
# 5. NO DELUGE INTERFERENCE: Explicitly guards against colliding with /mnt/ssd-tmp/deluge.

set -Eeuo pipefail
umask 077

SOURCE=/var/lib/docker
DEST=/mnt/ssd-tmp/slate-tools/docker-data
NVME=/mnt/ssd-tmp
EXPECTED_DOCKER_ROOT=/var/lib/docker
EXPECTED_STORAGE_DRIVER=overlayfs
NETWORK=slate-note4-deploy_default

stage=preflight
failure_class=UNCLASSIFIED
tmpdir=""

# Explicit guardrail: Reject any command-line arguments to enforce non-interactive read-only action
if (( $# > 0 )); then
  printf 'M1_SPARSE_DIAG stage=preflight status=FAIL class=UNEXPECTED_ARGUMENTS\n' >&2
  exit 1
fi

cleanup() {
  local rc=$?
  if [[ -n "$tmpdir" && -d "$tmpdir" ]]; then
    # Double-check guardrail that tmpdir is strictly outside SOURCE and DEST before deletion
    if [[ "$tmpdir" != "$SOURCE" && "$tmpdir" != "$SOURCE"/* && "$tmpdir" != "$DEST" && "$tmpdir" != "$DEST"/* ]]; then
      find "$tmpdir" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + 2>/dev/null || true
      rmdir "$tmpdir" 2>/dev/null || true
    fi
  fi
  exit "$rc"
}
trap cleanup EXIT

on_error() {
  local rc=$?
  (( rc != 0 )) || rc=1
  printf 'M1_SPARSE_DIAG stage=%s status=FAIL class=%s\n' "$stage" "$failure_class" >&2
  exit "$rc"
}
trap on_error ERR

on_signal() {
  local sig=$1
  local exit_code=$2
  failure_class="SIGNAL_${sig}"
  printf 'M1_SPARSE_DIAG stage=%s status=FAIL class=%s\n' "$stage" "$failure_class" >&2
  exit "$exit_code"
}
trap 'on_signal INT 130' INT
trap 'on_signal TERM 143' TERM
trap 'on_signal HUP 129' HUP

# -----------------------------------------------------------------------------
# 1. PREFLIGHT CHECKS & GUARDRAILS
# -----------------------------------------------------------------------------
stage=preflight

# Root execution requirement
[[ "$(id -u)" == 0 ]] || { failure_class=NOT_ROOT; false; }

# Command availability checks
for command_name in docker rsync findmnt realpath curl systemctl stat awk sha256sum find mktemp sort wc grep cut rmdir rm; do
  command -v "$command_name" >/dev/null 2>&1 || { failure_class=${command_name^^}_COMMAND_MISSING; false; }
done

# Source directory validation
test -d "$SOURCE" || { failure_class=SOURCE_MISSING; false; }
test ! -L "$SOURCE" || { failure_class=SOURCE_SYMLINK; false; }
[[ "$(realpath "$SOURCE")" == "$SOURCE" ]] || { failure_class=SOURCE_PATH_MISMATCH; false; }

# Destination directory validation
test -d "$DEST" || { failure_class=DESTINATION_MISSING; false; }
test ! -L "$DEST" || { failure_class=DESTINATION_SYMLINK; false; }
[[ "$(realpath "$DEST")" == "$DEST" ]] || { failure_class=DESTINATION_PATH_MISMATCH; false; }

# NVMe mountpoint validation
test -d "$NVME" || { failure_class=NVME_MOUNT_MISSING; false; }
[[ "$(realpath "$NVME")" == "$NVME" ]] || { failure_class=NVME_PATH_MISMATCH; false; }

# Explicit guardrails: Deluge path protection
[[ "$DEST" != /mnt/ssd-tmp/deluge && "$DEST" != /mnt/ssd-tmp/deluge/* ]] || { failure_class=DELUGE_PATH_COLLISION; false; }
[[ "$SOURCE" != /mnt/ssd-tmp/deluge && "$SOURCE" != /mnt/ssd-tmp/deluge/* ]] || { failure_class=DELUGE_PATH_COLLISION; false; }

# Explicit guardrail: Reject source and destination path identity
[[ "$(realpath "$SOURCE")" != "$(realpath "$DEST")" ]] || { failure_class=SOURCE_DEST_IDENTICAL; false; }

# Explicit guardrail: Reject source and destination inode/device identity
[[ "$(stat -c '%d:%i' "$SOURCE")" != "$(stat -c '%d:%i' "$DEST")" ]] || { failure_class=SOURCE_DEST_IDENTICAL; false; }

# Explicit guardrail: Reject directory nesting
[[ "$DEST" != "$SOURCE"/* && "$SOURCE" != "$DEST"/* ]] || { failure_class=SOURCE_DEST_NESTED; false; }

# Safe filesystem and device identity checks
src_fstype=$(findmnt -T "$SOURCE" -no FSTYPE 2>/dev/null || true)
src_source=$(findmnt -T "$SOURCE" -no SOURCE 2>/dev/null || true)
src_target=$(findmnt -T "$SOURCE" -no TARGET 2>/dev/null || true)
src_devid=$(stat -c '%d' "$SOURCE")

dst_fstype=$(findmnt -T "$DEST" -no FSTYPE 2>/dev/null || true)
dst_source=$(findmnt -T "$DEST" -no SOURCE 2>/dev/null || true)
dst_target=$(findmnt -T "$DEST" -no TARGET 2>/dev/null || true)
dst_devid=$(stat -c '%d' "$DEST")

[[ -n "$src_fstype" ]] || { failure_class=SOURCE_FSTYPE_UNKNOWN; false; }
[[ -n "$dst_fstype" ]] || { failure_class=DEST_FSTYPE_UNKNOWN; false; }
[[ "$src_devid" != "$dst_devid" ]] || { failure_class=SOURCE_DEST_DEVICE_IDENTICAL; false; }

# Create isolated temp directory strictly outside either Docker tree
tmpdir=$(mktemp -d /tmp/slate-m1-sparse-diag.XXXXXX) || { failure_class=TMPDIR_CREATE_FAILED; false; }
[[ "$tmpdir" != "$SOURCE" && "$tmpdir" != "$SOURCE"/* && "$tmpdir" != "$DEST" && "$tmpdir" != "$DEST"/* ]] || { failure_class=TMPDIR_INSIDE_DOCKER_TREE; false; }

# -----------------------------------------------------------------------------
# 2. DOCKER SERVICE STATUS & HEALTH PROVE
# -----------------------------------------------------------------------------
stage=docker_prove

docker_service_active=$(systemctl is-active docker 2>/dev/null || echo "inactive")
current_docker_root="UNAVAILABLE"
storage_driver="UNAVAILABLE"
docker_root_verified=NO
slate_status="UNAVAILABLE"
slate_health="UNAVAILABLE"
slate_restarts="-1"
mysql_status="UNAVAILABLE"
mysql_health="UNAVAILABLE"
mysql_restarts="-1"
network_present=NO
local_health="UNAVAILABLE"
public_health="UNAVAILABLE"

if [[ "$docker_service_active" == active ]]; then
  current_docker_root=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "QUERY_FAILED")
  if [[ "$current_docker_root" == "$EXPECTED_DOCKER_ROOT" ]]; then
    docker_root_verified=YES
  else
    failure_class=DOCKER_ROOT_MISMATCH
    false
  fi

  storage_driver=$(docker info --format '{{.Driver}}' 2>/dev/null || echo "QUERY_FAILED")

  slate_status=$(docker inspect slate-note4 --format '{{.State.Status}}' 2>/dev/null || echo "missing")
  slate_health=$(docker inspect slate-note4 --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || echo "unknown")
  slate_restarts=$(docker inspect slate-note4 --format '{{.RestartCount}}' 2>/dev/null || echo "-1")

  mysql_status=$(docker inspect slate-note4-mysql --format '{{.State.Status}}' 2>/dev/null || echo "missing")
  mysql_health=$(docker inspect slate-note4-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || echo "unknown")
  mysql_restarts=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}' 2>/dev/null || echo "-1")

  if docker network inspect "$NETWORK" >/dev/null 2>&1; then
    network_present=YES
  fi

  local_health=$(curl -fsS --max-time 10 -o /dev/null http://127.0.0.1:3001/healthz 2>/dev/null && echo "HTTP_200" || echo "FAIL")
  public_health=$(curl -fsS --max-time 15 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz 2>/dev/null && echo "HTTP_200" || echo "FAIL")
fi

# The diagnostic may inspect a live rollback state but must not classify a
# degraded/inactive production baseline as evidence for the copy comparison.
[[ "$docker_service_active" == active ]] || { failure_class=DOCKER_SERVICE_NOT_ACTIVE; false; }
[[ "$current_docker_root" == "$EXPECTED_DOCKER_ROOT" ]] || { failure_class=DOCKER_ROOT_NOT_VERIFIED; false; }
[[ "$slate_status" == running && "$slate_health" == healthy ]] || { failure_class=SLATE_HEALTH_NOT_PASS; false; }
[[ "$mysql_status" == running && "$mysql_health" == healthy ]] || { failure_class=MYSQL_HEALTH_NOT_PASS; false; }
[[ "$network_present" == YES ]] || { failure_class=SLATE_NETWORK_NOT_PRESENT; false; }
[[ "$local_health" == HTTP_200 ]] || { failure_class=LOCAL_HEALTH_NOT_PASS; false; }
[[ "$public_health" == HTTP_200 ]] || { failure_class=PUBLIC_HEALTH_NOT_PASS; false; }

# -----------------------------------------------------------------------------
# 3. METADATA INSPECTION & RELATIVE-PATH HASH COMPARISON
# -----------------------------------------------------------------------------
stage=metadata_inspection

# scan_metadata scans regular files strictly within the given tree (-xdev).
# Never cats or prints file contents.
# Computes stable SHA-256 identity of each relative path.
# Output record format per line:
# <path_sha256> <logical_size> <allocated_blocks> <mode_octal> <uid> <gid> <links> <is_sparse>
scan_metadata() {
  local root=$1
  local out_records=$2

  while IFS= read -r -d '' relpath; do
    local path_sha
    path_sha=$(printf '%s' "$relpath" | sha256sum | awk '{print $1}')
    local sz blk md u g ln
    read -r sz blk md u g ln < <(stat -c '%s %b %a %u %g %h' "$root/$relpath")
    local is_sparse=0
    if (( sz > blk * 512 )); then
      is_sparse=1
    fi
    printf '%s %s %s %s %s %s %s %s\n' "$path_sha" "$sz" "$blk" "$md" "$u" "$g" "$ln" "$is_sparse"
  done < <(find "$root" -xdev -type f -printf '%P\0') | LC_ALL=C sort -k1,1 > "$out_records"
}

scan_metadata "$SOURCE" "$tmpdir/src_records.txt"
scan_metadata "$DEST" "$tmpdir/dst_records.txt"

src_file_count=$(wc -l < "$tmpdir/src_records.txt" | awk '{print $1}')
dst_file_count=$(wc -l < "$tmpdir/dst_records.txt" | awk '{print $1}')

src_path_set_sha256=$(awk '{print $1}' "$tmpdir/src_records.txt" | sha256sum | awk '{print $1}')
dst_path_set_sha256=$(awk '{print $1}' "$tmpdir/dst_records.txt" | sha256sum | awk '{print $1}')

src_logical_bytes=$(awk '{s+=$2} END {print s+0}' "$tmpdir/src_records.txt")
dst_logical_bytes=$(awk '{s+=$2} END {print s+0}' "$tmpdir/dst_records.txt")

src_alloc_blocks=$(awk '{s+=$3} END {print s+0}' "$tmpdir/src_records.txt")
dst_alloc_blocks=$(awk '{s+=$3} END {print s+0}' "$tmpdir/dst_records.txt")

src_sparse_count=$(awk '$8==1 {n++} END {print n+0}' "$tmpdir/src_records.txt")
dst_sparse_count=$(awk '$8==1 {n++} END {print n+0}' "$tmpdir/dst_records.txt")

# Stable hash of non-block transferable metadata (path_sha256, logical_size, mode, uid, gid, links)
src_transferable_metadata_sha256=$(awk '{print $1, $2, $4, $5, $6, $7}' "$tmpdir/src_records.txt" | sha256sum | awk '{print $1}')
dst_transferable_metadata_sha256=$(awk '{print $1, $2, $4, $5, $6, $7}' "$tmpdir/dst_records.txt" | sha256sum | awk '{print $1}')

# Detailed path-by-path comparison using path_sha256
sparse_diff_file="$tmpdir/sparse_diff_records.txt"
touch "$sparse_diff_file"

read -r only_in_src only_in_dst sz_mismatches md_mismatches u_mismatches g_mismatches ln_mismatches blk_diffs sparse_diffs < <(
  awk -v diff_out="$sparse_diff_file" '
    NR==FNR {
      s_sz[$1] = $2; s_blk[$1] = $3; s_md[$1] = $4; s_u[$1] = $5; s_g[$1] = $6; s_ln[$1] = $7; s_sp[$1] = $8
      next
    }
    {
      p = $1
      if (!(p in s_sz)) {
        only_d++
        next
      }
      if (s_sz[p] != $2) sz_mis++
      if (s_blk[p] != $3) blk_dif++
      if (s_md[p] != $4) md_mis++
      if (s_u[p] != $5) u_mis++
      if (s_g[p] != $6) g_mis++
      if (s_ln[p] != $7) ln_mis++
      if (s_sp[p] != $8) {
        sp_dif++
        print p, s_sz[p], $2, s_blk[p], $3, s_sp[p], $8 >> diff_out
      }
      delete s_sz[p]
    }
    END {
      for (p in s_sz) { only_s++ }
      printf "%d %d %d %d %d %d %d %d %d\n", only_s+0, only_d+0, sz_mis+0, md_mis+0, u_mis+0, g_mis+0, ln_mis+0, blk_dif+0, sp_dif+0
    }
  ' "$tmpdir/src_records.txt" "$tmpdir/dst_records.txt"
)

sparse_diff_records_sha256="NONE"
if (( sparse_diffs > 0 )); then
  sparse_diff_records_sha256=$(sha256sum "$sparse_diff_file" | awk '{print $1}')
fi

# Symlinks and hardlinks aggregate metrics (sanitized, no plaintext paths)
src_symlink_count=$(find "$SOURCE" -xdev -type l | wc -l | awk '{print $1}')
dst_symlink_count=$(find "$DEST" -xdev -type l | wc -l | awk '{print $1}')
src_symlink_target_sha256=$(find "$SOURCE" -xdev -type l -printf '%P -> %l\n' | LC_ALL=C sort | sha256sum | awk '{print $1}')
dst_symlink_target_sha256=$(find "$DEST" -xdev -type l -printf '%P -> %l\n' | LC_ALL=C sort | sha256sum | awk '{print $1}')

src_hardlink_count=$(find "$SOURCE" -xdev -type f -links +1 | wc -l | awk '{print $1}')
dst_hardlink_count=$(find "$DEST" -xdev -type f -links +1 | wc -l | awk '{print $1}')

# -----------------------------------------------------------------------------
# 4. EXACT RSYNC DRY-RUN VERIFICATION
# -----------------------------------------------------------------------------
stage=rsync_dryrun

rsync_stdout="$tmpdir/rsync_dryrun.stdout"
rsync_stderr="$tmpdir/rsync_dryrun.stderr"

set +e
rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes "$SOURCE/" "$DEST/" >"$rsync_stdout" 2>"$rsync_stderr"
rsync_rc=$?
set -e

rsync_stdout_bytes=$(wc -c < "$rsync_stdout" | awk '{print $1}')
rsync_stdout_sha256=$(sha256sum "$rsync_stdout" | awk '{print $1}')
rsync_stderr_bytes=$(wc -c < "$rsync_stderr" | awk '{print $1}')
rsync_stderr_sha256=$(sha256sum "$rsync_stderr" | awk '{print $1}')

if (( rsync_rc == 0 && rsync_stdout_bytes == 0 && rsync_stderr_bytes == 0 )); then
  rsync_result=EMPTY_PASS
else
  rsync_result=NONEMPTY_OR_ERROR
fi

# -----------------------------------------------------------------------------
# 5. SANITIZED DIAGNOSTIC REPORT EMISSION
# -----------------------------------------------------------------------------
stage=report

printf '=== SLATE M1 SPARSE READ-ONLY ROOT DIAGNOSTIC v1 ===\n'
printf 'DIAGNOSTIC_MODE=READ_ONLY\n'
printf 'EXECUTION_USER_ID=%s\n' "$(id -u)"

printf '\n--- DOCKER_SERVICE_PROVE ---\n'
printf 'DOCKER_SERVICE_ACTIVE=%s\n' "$docker_service_active"
printf 'DOCKER_ROOT=%s\n' "$current_docker_root"
printf 'DOCKER_ROOT_VERIFIED=%s\n' "$docker_root_verified"
printf 'STORAGE_DRIVER=%s\n' "$storage_driver"
printf 'SLATE_CONTAINER_STATUS=%s\n' "$slate_status"
printf 'SLATE_CONTAINER_HEALTH=%s\n' "$slate_health"
printf 'SLATE_RESTART_COUNT=%s\n' "$slate_restarts"
printf 'MYSQL_CONTAINER_STATUS=%s\n' "$mysql_status"
printf 'MYSQL_CONTAINER_HEALTH=%s\n' "$mysql_health"
printf 'MYSQL_RESTART_COUNT=%s\n' "$mysql_restarts"
printf 'SLATE_NETWORK_PRESENT=%s\n' "$network_present"
printf 'LOCAL_HEALTH=%s\n' "$local_health"
printf 'PUBLIC_HEALTH=%s\n' "$public_health"

printf '\n--- SAFE_FILESYSTEM_IDENTITY ---\n'
printf 'SOURCE_TARGET=%s\n' "$src_target"
printf 'SOURCE_FSTYPE=%s\n' "$src_fstype"
printf 'SOURCE_DEVICE=%s\n' "$src_source"
printf 'SOURCE_DEVICE_ID=%s\n' "$src_devid"
printf 'DEST_TARGET=%s\n' "$dst_target"
printf 'DEST_FSTYPE=%s\n' "$dst_fstype"
printf 'DEST_DEVICE=%s\n' "$dst_source"
printf 'DEST_DEVICE_ID=%s\n' "$dst_devid"
printf 'FILESYSTEM_SEPARATION_VERIFIED=YES\n'

printf '\n--- METADATA_INSPECTION_AGGREGATES ---\n'
printf 'SRC_FILE_COUNT=%s\n' "$src_file_count"
printf 'DST_FILE_COUNT=%s\n' "$dst_file_count"
printf 'FILE_COUNT_EQUAL=%s\n' "$([[ "$src_file_count" == "$dst_file_count" ]] && echo YES || echo NO)"
printf 'SRC_PATH_SET_SHA256=%s\n' "$src_path_set_sha256"
printf 'DST_PATH_SET_SHA256=%s\n' "$dst_path_set_sha256"
printf 'PATH_SET_EQUAL=%s\n' "$([[ "$src_path_set_sha256" == "$dst_path_set_sha256" ]] && echo YES || echo NO)"
printf 'SRC_LOGICAL_BYTES=%s\n' "$src_logical_bytes"
printf 'DST_LOGICAL_BYTES=%s\n' "$dst_logical_bytes"
printf 'LOGICAL_BYTES_EQUAL=%s\n' "$([[ "$src_logical_bytes" == "$dst_logical_bytes" ]] && echo YES || echo NO)"
printf 'SRC_ALLOCATED_BLOCKS=%s\n' "$src_alloc_blocks"
printf 'DST_ALLOCATED_BLOCKS=%s\n' "$dst_alloc_blocks"
printf 'ALLOCATED_BLOCKS_EQUAL=%s\n' "$([[ "$src_alloc_blocks" == "$dst_alloc_blocks" ]] && echo YES || echo NO)"
printf 'SRC_TRANSFERABLE_METADATA_SHA256=%s\n' "$src_transferable_metadata_sha256"
printf 'DST_TRANSFERABLE_METADATA_SHA256=%s\n' "$dst_transferable_metadata_sha256"
printf 'TRANSFERABLE_METADATA_EQUAL=%s\n' "$([[ "$src_transferable_metadata_sha256" == "$dst_transferable_metadata_sha256" ]] && echo YES || echo NO)"
printf 'SRC_SYMLINK_COUNT=%s\n' "$src_symlink_count"
printf 'DST_SYMLINK_COUNT=%s\n' "$dst_symlink_count"
printf 'SRC_SYMLINK_TARGET_SHA256=%s\n' "$src_symlink_target_sha256"
printf 'DST_SYMLINK_TARGET_SHA256=%s\n' "$dst_symlink_target_sha256"
printf 'SRC_HARDLINK_FILE_COUNT=%s\n' "$src_hardlink_count"
printf 'DST_HARDLINK_FILE_COUNT=%s\n' "$dst_hardlink_count"

printf '\n--- PER_PATH_COMPARISON_METRICS ---\n'
printf 'PATHS_ONLY_IN_SRC_COUNT=%s\n' "$only_in_src"
printf 'PATHS_ONLY_IN_DST_COUNT=%s\n' "$only_in_dst"
printf 'LOGICAL_SIZE_MISMATCH_COUNT=%s\n' "$sz_mismatches"
printf 'MODE_MISMATCH_COUNT=%s\n' "$md_mismatches"
printf 'UID_MISMATCH_COUNT=%s\n' "$u_mismatches"
printf 'GID_MISMATCH_COUNT=%s\n' "$g_mismatches"
printf 'LINK_COUNT_MISMATCH_COUNT=%s\n' "$ln_mismatches"
printf 'ALLOCATED_BLOCKS_DIFF_COUNT=%s\n' "$blk_diffs"
printf 'SRC_SPARSE_FILE_COUNT=%s\n' "$src_sparse_count"
printf 'DST_SPARSE_FILE_COUNT=%s\n' "$dst_sparse_count"
printf 'SPARSE_DIFFERENCE_COUNT=%s\n' "$sparse_diffs"
printf 'SPARSE_DIFFERENCE_RECORDS_SHA256=%s\n' "$sparse_diff_records_sha256"

printf '\n--- EXACT_RSYNC_DRYRUN ---\n'
printf 'RSYNC_DRYRUN_COMMAND=rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes /var/lib/docker/ /mnt/ssd-tmp/slate-tools/docker-data/\n'
printf 'RSYNC_DRYRUN_RC=%s\n' "$rsync_rc"
printf 'RSYNC_DRYRUN_STDOUT_BYTES=%s\n' "$rsync_stdout_bytes"
printf 'RSYNC_DRYRUN_STDOUT_SHA256=%s\n' "$rsync_stdout_sha256"
printf 'RSYNC_DRYRUN_STDERR_BYTES=%s\n' "$rsync_stderr_bytes"
printf 'RSYNC_DRYRUN_STDERR_SHA256=%s\n' "$rsync_stderr_sha256"
printf 'RSYNC_DRYRUN_RESULT=%s\n' "$rsync_result"

printf '\n--- DIAGNOSTIC_VERDICT ---\n'
if [[ "$src_path_set_sha256" == "$dst_path_set_sha256" && \
      "$src_logical_bytes" == "$dst_logical_bytes" && \
      "$src_transferable_metadata_sha256" == "$dst_transferable_metadata_sha256" && \
      "$rsync_result" == EMPTY_PASS ]]; then
  if (( sparse_diffs > 0 )); then
    printf 'VERDICT=PASS_CONTENT_IDENTICAL_SPARSE_ALLOCATION_REPRESENTATION_ONLY\n'
    printf 'ANALYSIS=Sparse file count discrepancy (%s vs %s) is proven to be filesystem block allocation representation rather than content or metadata corruption.\n' "$src_sparse_count" "$dst_sparse_count"
  else
    printf 'VERDICT=PASS_CONTENT_AND_ALLOCATION_IDENTICAL\n'
  fi
else
  printf 'VERDICT=FAIL_CONTENT_OR_METADATA_MISMATCH\n'
fi

printf 'M1_SPARSE_DIAG stage=complete status=PASS\n'
