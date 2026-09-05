#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Campaign 8D1M-G M1 recovery.  This is a versioned V4 replacement for
# /home/pi/slate-m1-rootstep.sh, V2 and V3.  It never removes either Docker tree.
SOURCE=/var/lib/docker
DEST=/mnt/ssd-tmp/slate-tools/docker-data
NVME=/mnt/ssd-tmp
SLATE_TOOLS=/mnt/ssd-tmp/slate-tools
DAEMON_CONFIG=/etc/docker/daemon.json
DAEMON_BACKUP=/mnt/ssd-tmp/slate-tools/m1-daemon-pre-migration-v4.json
VERIFY_FILE=/mnt/ssd-tmp/slate-tools/m1-root-copy-v4-verify.txt
RESERVE_FLOOR=180000000000
CANDIDATE_BYTES=1130645824
CURRENT_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
NETWORK=slate-note4-deploy_default

stage=preflight
failure_class=UNCLASSIFIED
mutation_started=0
config_was_present=0
config_mode=600
slate_restart_before=0
mysql_restart_before=0
slate_restart_expected=0
mysql_restart_expected=0
STARTUP_TIMEOUT=180
ROLLBACK_TIMEOUT=180
tmpdir=

log() {
  printf 'M1_ROOT_STEP_V4 stage=%s status=%s\n' "$1" "$2"
}

cleanup_temp() {
  if [[ -n "$tmpdir" && -d "$tmpdir" ]]; then
    find "$tmpdir" -mindepth 1 -maxdepth 1 -exec rm -f -- {} +
    rmdir "$tmpdir" || true
  fi
}

rollback() {
  local rollback_ok=0
  set +e
  systemctl stop docker >/dev/null 2>&1
  if (( config_was_present )); then
    cp -a "$DAEMON_BACKUP" "$DAEMON_CONFIG" >/dev/null 2>&1
    chmod "$config_mode" "$DAEMON_CONFIG" >/dev/null 2>&1
    chown root:root "$DAEMON_CONFIG" >/dev/null 2>&1
  else
    rm -f -- "$DAEMON_CONFIG" >/dev/null 2>&1
  fi
  systemctl start docker >/dev/null 2>&1
  for _ in $(seq 1 "$ROLLBACK_TIMEOUT"); do
    root_after=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)
    if [[ "$root_after" == "$SOURCE" ]] &&
       docker inspect slate-note4 --format '{{.State.Status}}' 2>/dev/null | grep -qx running &&
       docker inspect slate-note4 --format '{{.State.Health.Status}}' 2>/dev/null | grep -qx healthy &&
       docker inspect slate-note4-mysql --format '{{.State.Status}}' 2>/dev/null | grep -qx running &&
       docker inspect slate-note4-mysql --format '{{.State.Health.Status}}' 2>/dev/null | grep -qx healthy &&
       curl -fsS --max-time 15 -o /dev/null http://127.0.0.1:3001/healthz &&
       curl -fsS --max-time 20 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz; then
      rollback_ok=1
      break
    fi
    sleep 1
  done
  if (( rollback_ok )); then
    printf 'M1_ROOT_STEP_V4 rollback=PASS data_root=%s health=PASS\n' "$SOURCE"
  else
    printf 'M1_ROOT_STEP_V4 rollback=FAIL data_root=%s health=FAIL\n' "$root_after"
  fi
  return $((1 - rollback_ok))
}

on_error() {
  local rc=$?
  trap - ERR
  cleanup_temp
  if (( mutation_started )); then
    rollback || true
  fi
  printf 'M1_ROOT_STEP_V4 stage=%s status=FAIL class=%s\n' "$stage" "$failure_class"
  exit "$rc"
}
trap on_error ERR

assert_production_health() {
  docker inspect slate-note4 --format '{{.State.Status}}' | grep -qx running || { failure_class=SLATE_NOT_RUNNING; return 1; }
  docker inspect slate-note4 --format '{{.State.Health.Status}}' | grep -qx healthy || { failure_class=SLATE_NOT_HEALTHY; return 1; }
  docker inspect slate-note4-mysql --format '{{.State.Status}}' | grep -qx running || { failure_class=MYSQL_NOT_RUNNING; return 1; }
  docker inspect slate-note4-mysql --format '{{.State.Health.Status}}' | grep -qx healthy || { failure_class=MYSQL_NOT_HEALTHY; return 1; }
  [[ "$(docker inspect slate-note4 --format '{{.RestartCount}}')" == "$slate_restart_expected" ]] || { failure_class=SLATE_RESTART_COUNT_CHANGED; return 1; }
  [[ "$(docker inspect slate-note4-mysql --format '{{.RestartCount}}')" == "$mysql_restart_expected" ]] || { failure_class=MYSQL_RESTART_COUNT_CHANGED; return 1; }
  curl -fsS --max-time 15 -o /dev/null http://127.0.0.1:3001/healthz || { failure_class=LOCAL_HEALTH_FAILED; return 1; }
  curl -fsS --max-time 20 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz || { failure_class=PUBLIC_HEALTH_FAILED; return 1; }
}

wait_for_switch_health() {
  local deadline=$((SECONDS + STARTUP_TIMEOUT))
  local root_after slate_status slate_health mysql_status mysql_health slate_restarts mysql_restarts
  while (( SECONDS < deadline )); do
    root_after=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)
    [[ "$root_after" == "$DEST" ]] || { failure_class=NEW_DOCKER_ROOT_NOT_ACTIVE; return 1; }
    slate_status=$(docker inspect slate-note4 --format '{{.State.Status}}' 2>/dev/null || true)
    slate_health=$(docker inspect slate-note4 --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    mysql_status=$(docker inspect slate-note4-mysql --format '{{.State.Status}}' 2>/dev/null || true)
    mysql_health=$(docker inspect slate-note4-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    slate_restarts=$(docker inspect slate-note4 --format '{{.RestartCount}}' 2>/dev/null || true)
    mysql_restarts=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}' 2>/dev/null || true)
    [[ -z "$slate_restarts" || "$slate_restarts" == "$slate_restart_expected" ]] || { failure_class=SLATE_RESTART_GROWTH; return 1; }
    [[ -z "$mysql_restarts" || "$mysql_restarts" == "$mysql_restart_expected" ]] || { failure_class=MYSQL_RESTART_GROWTH; return 1; }
    if [[ "$slate_status" == running && "$slate_health" == healthy &&
          "$mysql_status" == running && "$mysql_health" == healthy ]]; then
      curl -fsS --max-time 15 -o /dev/null http://127.0.0.1:3001/healthz || { failure_class=LOCAL_HEALTH_AFTER_SWITCH_FAILED; return 1; }
      curl -fsS --max-time 20 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz || { failure_class=PUBLIC_HEALTH_AFTER_SWITCH_FAILED; return 1; }
      return 0
    fi
    sleep 1
  done
  [[ "$slate_status" == running && "$slate_health" == healthy ]] || { failure_class=SLATE_HEALTH_STARTUP_TIMEOUT; return 1; }
  [[ "$mysql_status" == running && "$mysql_health" == healthy ]] || { failure_class=MYSQL_HEALTH_STARTUP_TIMEOUT; return 1; }
  failure_class=HEALTH_STARTUP_TIMEOUT
  return 1
}

stage=preflight
[[ "$(id -u)" == 0 ]] || { failure_class=NOT_ROOT; false; }
for command_name in docker rsync findmnt realpath curl systemctl du df stat awk sha256sum find mktemp; do
  command -v "$command_name" >/dev/null 2>&1 || { failure_class=${command_name^^}_COMMAND_MISSING; false; }
done
test -d "$SOURCE" || { failure_class=SOURCE_MISSING; false; }
[[ "$(realpath "$SOURCE")" == "$SOURCE" ]] || { failure_class=SOURCE_PATH_MISMATCH; false; }
[[ "$(docker info --format '{{.DockerRootDir}}')" == "$SOURCE" ]] || { failure_class=DOCKER_ROOT_MISMATCH; false; }
[[ "$(docker info --format '{{.Driver}}')" == overlayfs ]] || { failure_class=STORAGE_DRIVER_MISMATCH; false; }
test -d "$SLATE_TOOLS" || { failure_class=SLATE_TOOLS_PATH_MISSING; false; }
[[ "$(realpath "$SLATE_TOOLS")" == "$SLATE_TOOLS" ]] || { failure_class=SLATE_TOOLS_PATH_MISMATCH; false; }
test -d "$DEST" || { failure_class=DESTINATION_MISSING; false; }
test ! -L "$DEST" || { failure_class=DESTINATION_SYMLINK; false; }
[[ "$(realpath "$DEST")" == "$DEST" ]] || { failure_class=DESTINATION_PATH_MISMATCH; false; }
[[ "$DEST" != /mnt/ssd-tmp/deluge && "$DEST" != /mnt/ssd-tmp/deluge/* ]] || { failure_class=DELUGE_PATH_COLLISION; false; }
[[ "$(findmnt -T "$NVME" -no FSTYPE)" == ext4 ]] || { failure_class=NVME_FILESYSTEM_MISMATCH; false; }
nvme_options=$(findmnt -T "$NVME" -no OPTIONS)
[[ ",$nvme_options," == *,rw,* || "$nvme_options" == rw,* || "$nvme_options" == *,rw ]] || { failure_class=NVME_NOT_READ_WRITE; false; }
[[ "$(systemctl is-active docker 2>/dev/null)" == active ]] || { failure_class=DOCKER_NOT_ACTIVE; false; }
current_runtime_image=$(docker inspect slate-note4 --format '{{.Image}}')
mysql_runtime_image=$(docker inspect slate-note4-mysql --format '{{.Image}}')
slate_restart_before=$(docker inspect slate-note4 --format '{{.RestartCount}}')
mysql_restart_before=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}')
# Initialize preflight expectations before any health assertion; non-zero history is valid.
slate_restart_expected=$slate_restart_before
mysql_restart_expected=$mysql_restart_before
[[ "$current_runtime_image" == "$CURRENT_IMAGE" ]] || { failure_class=CURRENT_IMAGE_MISMATCH; false; }
[[ "$mysql_runtime_image" == "$MYSQL_IMAGE" ]] || { failure_class=MYSQL_IMAGE_MISMATCH; false; }
assert_production_health
docker network inspect "$NETWORK" >/dev/null 2>&1 || { failure_class=NETWORK_MISSING; false; }
if test -e "$DAEMON_CONFIG"; then
  test -f "$DAEMON_CONFIG" || { failure_class=DAEMON_CONFIG_NOT_REGULAR; false; }
  test ! -L "$DAEMON_CONFIG" || { failure_class=DAEMON_CONFIG_SYMLINK; false; }
  config_was_present=1
  config_mode=$(stat -c %a "$DAEMON_CONFIG")
  test ! -e "$DAEMON_BACKUP" || { failure_class=DAEMON_BACKUP_COLLISION; false; }
  cp -a "$DAEMON_CONFIG" "$DAEMON_BACKUP" || { failure_class=DAEMON_CONFIG_BACKUP_FAILED; false; }
  chmod 600 "$DAEMON_BACKUP"
  chown root:root "$DAEMON_BACKUP"
fi
docker_bytes=$(du -sb "$SOURCE" | awk '{print $1}')
nvme_free=$(df -P -B1 "$NVME" | awk 'NR==2{print $4}')
required_bytes=$((docker_bytes + CANDIDATE_BYTES + RESERVE_FLOOR))
(( nvme_free >= required_bytes )) || { failure_class=NVME_RESERVE_PRECHECK_FAILED; false; }
test ! -e "$VERIFY_FILE" || { failure_class=VERIFY_FILE_COLLISION; false; }
log preflight PASS

# Stop Docker before copying.  This unmounts live overlay roots, so rsync sees
# the Docker data-root itself rather than transient container mount contents.
stage=copy
mutation_started=1
systemctl stop docker >/dev/null 2>&1 || { failure_class=DOCKER_STOP_FAILED; false; }
[[ "$(systemctl is-active docker 2>/dev/null || true)" != active ]] || { failure_class=DOCKER_STOP_FAILED; false; }
rsync -aHAXS --numeric-ids --delete "$SOURCE/" "$DEST/" >/dev/null 2>&1 || { failure_class=COPY_RSYNC_FAILED; false; }
tmpdir=$(mktemp -d "$SLATE_TOOLS/m1-root-copy-v4-metrics.XXXXXX")
manifest_metrics "$SOURCE" SRC
manifest_metrics "$DEST" DST
src_file_count=$(find "$SOURCE" -xdev -type f | wc -l)
dst_file_count=$(find "$DEST" -xdev -type f | wc -l)
src_logical_bytes=$(find "$SOURCE" -xdev -type f -exec stat -c '%s' {} + | awk '{s+=$1} END {print s+0}')
dst_logical_bytes=$(find "$DEST" -xdev -type f -exec stat -c '%s' {} + | awk '{s+=$1} END {print s+0}')
[[ "$src_file_count" == "$dst_file_count" ]] || { failure_class=COPY_FILE_COUNT_MISMATCH; false; }
[[ "$src_logical_bytes" == "$dst_logical_bytes" ]] || { failure_class=COPY_LOGICAL_SIZE_MISMATCH; false; }
src_path_sha=$(sha256sum "$tmpdir/SRC.files" | awk '{print $1}')
dst_path_sha=$(sha256sum "$tmpdir/DST.files" | awk '{print $1}')
[[ "$src_path_sha" == "$dst_path_sha" ]] || { failure_class=COPY_FILE_PATH_MISMATCH; false; }
src_link_sha=$(sha256sum "$tmpdir/SRC.links" | awk '{print $1}')
dst_link_sha=$(sha256sum "$tmpdir/DST.links" | awk '{print $1}')
[[ "$src_link_sha" == "$dst_link_sha" ]] || { failure_class=COPY_SYMLINK_MISMATCH; false; }
src_hardlink_sha=$(sha256sum "$tmpdir/SRC.hardlinks" | awk '{print $1}')
dst_hardlink_sha=$(sha256sum "$tmpdir/DST.hardlinks" | awk '{print $1}')
[[ "$src_hardlink_sha" == "$dst_hardlink_sha" ]] || { failure_class=COPY_HARDLINK_MISMATCH; false; }
rm -f -- "$VERIFY_FILE"
rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes --out-format='%i' "$SOURCE/" "$DEST/" >"$VERIFY_FILE" 2>/dev/null || { failure_class=COPY_DETERMINISTIC_VERIFY_COMMAND_FAILED; false; }
test ! -s "$VERIFY_FILE" || { failure_class=COPY_DETERMINISTIC_VERIFY_FAILED; false; }
rm -f -- "$VERIFY_FILE"
cleanup_temp
tmpdir=
log copy PASS

stage=switch
if (( config_was_present )); then
  command -v jq >/dev/null 2>&1 || { failure_class=JQ_COMMAND_MISSING; false; }
  jq --arg dest "$DEST" '(. + {"data-root": $dest})' "$DAEMON_CONFIG" >"$DAEMON_CONFIG.tmp"
  jq empty "$DAEMON_CONFIG.tmp"
  chmod "$config_mode" "$DAEMON_CONFIG.tmp"
  chown root:root "$DAEMON_CONFIG.tmp"
  mv -f -- "$DAEMON_CONFIG.tmp" "$DAEMON_CONFIG"
else
  printf '{\n  "data-root": "%s"\n}\n' "$DEST" >"$DAEMON_CONFIG"
  chmod 600 "$DAEMON_CONFIG"
  chown root:root "$DAEMON_CONFIG"
fi
systemctl start docker >/dev/null 2>&1 || { failure_class=DOCKER_START_FAILED; false; }
wait_for_switch_health
[[ "$(docker info --format '{{.DockerRootDir}}')" == "$DEST" ]] || { failure_class=NEW_DOCKER_ROOT_NOT_ACTIVE; false; }
[[ "$(docker info --format '{{.Driver}}')" == overlayfs ]] || { failure_class=NEW_STORAGE_DRIVER_MISMATCH; false; }
docker image inspect "$CURRENT_IMAGE" >/dev/null 2>&1 || { failure_class=CURRENT_IMAGE_NOT_VISIBLE; false; }
docker image inspect "$ROLLBACK_IMAGE" >/dev/null 2>&1 || { failure_class=ROLLBACK_IMAGE_NOT_VISIBLE; false; }
docker image inspect "$MYSQL_IMAGE" >/dev/null 2>&1 || { failure_class=MYSQL_IMAGE_NOT_VISIBLE; false; }
docker network inspect "$NETWORK" >/dev/null 2>&1 || { failure_class=NETWORK_NOT_VISIBLE; false; }
slate_restart_expected=$(docker inspect slate-note4 --format '{{.RestartCount}}') || { failure_class=SLATE_RESTART_BASELINE_UNAVAILABLE; false; }
mysql_restart_expected=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}') || { failure_class=MYSQL_RESTART_BASELINE_UNAVAILABLE; false; }
assert_production_health
nvme_free_after=$(df -P -B1 "$NVME" | awk 'NR==2{print $4}')
(( nvme_free_after >= RESERVE_FLOOR + CANDIDATE_BYTES )) || { failure_class=NVME_RESERVE_POSTCHECK_FAILED; false; }
trap - ERR
printf 'M1_ROOT_STEP_V4 stage=switch status=PASS data_root=%s old_root_preserved=YES\n' "$DEST"
printf 'M1_ROOT_STEP_V4 stage=complete status=PASS\n'
