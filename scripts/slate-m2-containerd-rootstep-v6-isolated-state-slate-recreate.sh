#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Campaign 8D1M-G V5. Migrate containerd's persistent root with isolated
# candidate runtime state, then recreate Slate only after candidate startup.
# Preserve /var/lib/containerd, /var/lib/docker, the active NVMe Docker root,
# MySQL and all Deluge paths/data. No provider call is made here.

SOURCE=/var/lib/containerd
DEST=/mnt/ssd-tmp/slate-tools/containerd-root
ORIGINAL_STATE=/run/containerd
STATE=/run/containerd-v5
CONTAINERD_SOCKET=$STATE/containerd.sock
NVME=/mnt/ssd-tmp
SLATE_TOOLS=/mnt/ssd-tmp/slate-tools
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
TAR=/mnt/ssd-tmp/slate-tools/m2-ux-candidate.tar
TAR_SHA256=cf47b8c4bb6aec65161d1c54e766bbf62f9a4ada1430fb5b86766231d7074865
TAR_BYTES=1183010304
CONTAINERD_DROPIN_DIR=/etc/systemd/system/containerd.service.d
CONTAINERD_DROPIN=$CONTAINERD_DROPIN_DIR/99-slate-m2-v5-root.conf
CONTAINERD_DROPIN_TMP=$CONTAINERD_DROPIN.tmp.$$
DOCKER_DROPIN_DIR=/etc/systemd/system/docker.service.d
DOCKER_DROPIN=$DOCKER_DROPIN_DIR/99-slate-m2-v5-containerd-endpoint.conf
DOCKER_DROPIN_TMP=$DOCKER_DROPIN.tmp.$$
BACKUP=/mnt/ssd-tmp/slate-tools/m2-containerd-rootstep-v5-backup
SERVICE_STATE=$BACKUP/containerd-service-state.txt
DOCKER_SERVICE_STATE=$BACKUP/docker-service-state.txt
VERIFY_FILE=$BACKUP/containerd-rsync-verify.txt
VERIFY_ERR=$BACKUP/containerd-rsync-verify.stderr
COMPOSE_DIR=/home/pi/slate-note4-deploy
COMPOSE_FILE=$COMPOSE_DIR/compose.yml
COMPOSE_OVERRIDE=/mnt/ssd-tmp/slate-tools/g3-candidate.override.yml
COMPOSE_OVERRIDE_SHA256=4ea3566f3c0df8ce7ff548a980619db2811db18020abefaa707237ddefe7f935
COMPOSE_FILE_SHA256=00a56a6a34e56c4a26447f38599dbaf6bee41ab1948051ae0257023fb2e1aaa0
RESERVE_FLOOR=161061273600
CURRENT_IMAGE=sha256:5ef126ff62ccf466c0795c1c76b4bdf0a7b9657184eab1f09b7435deeedbab6d
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MYSQL_IMAGE=sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
NETWORK=slate-note4-deploy_default

stage=preflight
failure_class=UNCLASSIFIED
mutation_started=0
containerd_dropin_created=0
containerd_dropin_dir_created=0
docker_dropin_created=0
docker_dropin_dir_created=0
candidate_state_created=0
docker_socket_was_active=0
tmpdir=
slate_restart_before=
mysql_restart_before=
mysql_id_before=
STARTUP_TIMEOUT=180
ROLLBACK_TIMEOUT=180
STABILITY_WINDOW=60

log() {
  printf 'M2_ROOT_STEP_V5 stage=%s status=%s\n' "$1" "$2"
}

cleanup_temp() {
  if [[ -n "$tmpdir" && -d "$tmpdir" ]]; then
    find "$tmpdir" -mindepth 1 -maxdepth 1 -type f -exec rm -f -- {} + 2>/dev/null || true
    rmdir "$tmpdir" 2>/dev/null || true
  fi
}

assert_active_root_health() {
  local expected_root=$1
  local slate_restart_limit=$2
  local mysql_restart_limit=$3
  [[ "$(systemctl is-active docker 2>/dev/null || true)" == active ]] || { failure_class=DOCKER_NOT_ACTIVE; return 1; }
  [[ "$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)" == "$expected_root" ]] || { failure_class=DOCKER_ROOT_MISMATCH; return 1; }
  [[ "$(docker info --format '{{.Driver}}' 2>/dev/null || true)" == overlayfs ]] || { failure_class=STORAGE_DRIVER_MISMATCH; return 1; }
  [[ "$(docker inspect slate-note4 --format '{{.State.Status}}' 2>/dev/null || true)" == running ]] || { failure_class=SLATE_NOT_RUNNING; return 1; }
  [[ "$(docker inspect slate-note4 --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)" == healthy ]] || { failure_class=SLATE_NOT_HEALTHY; return 1; }
  [[ "$(docker inspect slate-note4-mysql --format '{{.State.Status}}' 2>/dev/null || true)" == running ]] || { failure_class=MYSQL_NOT_RUNNING; return 1; }
  [[ "$(docker inspect slate-note4-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)" == healthy ]] || { failure_class=MYSQL_NOT_HEALTHY; return 1; }
  local slate_restarts mysql_restarts
  slate_restarts=$(docker inspect slate-note4 --format '{{.RestartCount}}' 2>/dev/null || true)
  mysql_restarts=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}' 2>/dev/null || true)
  [[ "$slate_restarts" =~ ^[0-9]+$ && "$mysql_restarts" =~ ^[0-9]+$ ]] || { failure_class=RESTART_COUNT_UNAVAILABLE; return 1; }
  (( slate_restarts <= slate_restart_limit )) || { failure_class=SLATE_RESTART_GROWTH; return 1; }
  (( mysql_restarts <= mysql_restart_limit )) || { failure_class=MYSQL_RESTART_GROWTH; return 1; }
  curl -fsS --max-time 15 -o /dev/null http://127.0.0.1:3001/healthz || { failure_class=LOCAL_HEALTH_FAILED; return 1; }
  curl -fsS --max-time 20 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz || { failure_class=PUBLIC_HEALTH_FAILED; return 1; }
}

wait_for_health() {
  local expected_root=$1
  local slate_restart_limit=$2
  local mysql_restart_limit=$3
  local timeout=$4
  local deadline=$((SECONDS + timeout))
  while true; do
    if assert_active_root_health "$expected_root" "$slate_restart_limit" "$mysql_restart_limit"; then
      return 0
    fi
    if (( SECONDS >= deadline )); then
      return 1
    fi
    sleep 1
  done
}

wait_for_candidate_health_and_recreate() {
  local deadline=$((SECONDS + STARTUP_TIMEOUT))
  local stable_since=0
  local root_after="" slate_status="" slate_health="" mysql_status="" mysql_health=""
  local slate_restarts="" mysql_restarts=""
  local slate_recreated=0
  local mysql_id=""

  while (( SECONDS < deadline )); do
    root_after=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)
    if [[ "$root_after" != "$DOCKER_ROOT" ]]; then
      sleep 1
      continue
    fi

    mysql_status=$(docker inspect slate-note4-mysql --format '{{.State.Status}}' 2>/dev/null || true)
    mysql_health=$(docker inspect slate-note4-mysql --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    mysql_restarts=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}' 2>/dev/null || true)
    mysql_id=$(docker inspect slate-note4-mysql --format '{{.Id}}' 2>/dev/null || true)
    if [[ -n "$mysql_id" && "$mysql_id" != "$mysql_id_before" ]]; then
      failure_class=MYSQL_RECREATED_OR_MISSING
      return 1
    fi
    if [[ "$mysql_restarts" =~ ^[0-9]+$ ]] && (( mysql_restarts > mysql_restart_before )); then
      failure_class=MYSQL_RESTART_GROWTH
      return 1
    fi
    if [[ -z "$mysql_id" || ! "$mysql_restarts" =~ ^[0-9]+$ || "$mysql_status" != running || "$mysql_health" != healthy ]]; then
      stable_since=0
      sleep 1
      continue
    fi

    if (( ! slate_recreated )); then
      docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" up -d --no-deps --force-recreate slate >/dev/null 2>&1 || {
        failure_class=SLATE_RECREATE_FAILED
        return 1
      }
      slate_recreated=1
      stable_since=0
    fi

    slate_status=$(docker inspect slate-note4 --format '{{.State.Status}}' 2>/dev/null || true)
    slate_health=$(docker inspect slate-note4 --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null || true)
    slate_restarts=$(docker inspect slate-note4 --format '{{.RestartCount}}' 2>/dev/null || true)
    if [[ "$slate_restarts" =~ ^[0-9]+$ ]] && (( slate_restarts > 0 )); then
      failure_class=SLATE_RESTART_GROWTH_AFTER_RECREATE
      return 1
    fi
    if [[ ! "$slate_restarts" =~ ^[0-9]+$ || "$slate_status" != running || "$slate_health" != healthy ]]; then
      stable_since=0
      sleep 1
      continue
    fi

    if [[ "$slate_status" == running && "$slate_health" == healthy &&
          "$mysql_status" == running && "$mysql_health" == healthy ]] &&
       curl -fsS --max-time 15 -o /dev/null http://127.0.0.1:3001/healthz &&
       curl -fsS --max-time 20 -o /dev/null https://orangepi5.tail6aabef.ts.net/healthz; then
      if (( stable_since == 0 )); then
        stable_since=$SECONDS
      fi
      if (( SECONDS - stable_since >= STABILITY_WINDOW )); then
        return 0
      fi
    else
      stable_since=0
    fi
    sleep 1
  done

  if (( slate_recreated == 0 )); then
    failure_class=CANDIDATE_HEALTH_STARTUP_TIMEOUT
  elif [[ "$slate_status" != running || "$slate_health" != healthy ]]; then
    failure_class=SLATE_HEALTH_STABILITY_TIMEOUT
  else
    failure_class=STABILITY_WINDOW_TIMEOUT
  fi
  return 1
}

wait_for_candidate_containerd_readiness() {
  local deadline=$((SECONDS + STARTUP_TIMEOUT))
  local main_pid=""
  while true; do
    main_pid=$(systemctl show containerd -p MainPID --value 2>/dev/null || true)
    if [[ "$(systemctl is-active containerd 2>/dev/null || true)" == active ]] &&
       [[ "$main_pid" =~ ^[1-9][0-9]*$ ]] && kill -0 "$main_pid" 2>/dev/null &&
       test -S "$CONTAINERD_SOCKET" &&
       [[ "$(stat -c '%u:%a' "$CONTAINERD_SOCKET" 2>/dev/null || true)" == "0:660" ]] &&
       ctr --address "$CONTAINERD_SOCKET" --connect-timeout 2s --timeout 5s version >/dev/null 2>&1; then
      return 0
    fi
    if (( SECONDS >= deadline )); then
      break
    fi
    sleep 1
  done
  failure_class=CANDIDATE_CONTAINERD_SOCKET_READINESS_TIMEOUT
  return 1
}

cleanup_candidate_state() {
  case "$STATE" in
    /run/containerd-v5) ;;
    *) return 1 ;;
  esac
  if (( candidate_state_created )) && test -d "$STATE"; then
    find "$STATE" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + >/dev/null 2>&1 || return 1
    rmdir -- "$STATE" >/dev/null 2>&1 || return 1
  fi
}

rollback() {
  local saved_failure=$failure_class
  set +e
  systemctl stop docker >/dev/null 2>&1 || true
  systemctl stop docker.socket >/dev/null 2>&1 || true
  systemctl stop containerd >/dev/null 2>&1 || true
  if [[ "$(systemctl is-active docker 2>/dev/null || true)" == active ||
        "$(systemctl is-active docker.socket 2>/dev/null || true)" == active ||
        "$(systemctl is-active containerd 2>/dev/null || true)" == active ]]; then
    printf 'M2_ROOT_STEP_V5 rollback=FAIL action=STOP_SERVICES\n'
    failure_class=$saved_failure
    return 1
  fi

  if (( docker_dropin_created )); then
    rm -f -- "$DOCKER_DROPIN" "$DOCKER_DROPIN_TMP" >/dev/null 2>&1 || true
    if test -e "$DOCKER_DROPIN" || test -e "$DOCKER_DROPIN_TMP"; then
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=RESTORE_SERVICE_CONFIGURATION\n'
      failure_class=$saved_failure
      return 1
    fi
  fi
  if (( containerd_dropin_created )); then
    rm -f -- "$CONTAINERD_DROPIN" "$CONTAINERD_DROPIN_TMP" >/dev/null 2>&1 || true
    if test -e "$CONTAINERD_DROPIN" || test -e "$CONTAINERD_DROPIN_TMP"; then
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=RESTORE_SERVICE_CONFIGURATION\n'
      failure_class=$saved_failure
      return 1
    fi
  fi
  if (( docker_dropin_created || containerd_dropin_created )); then
    systemctl daemon-reload >/dev/null 2>&1 || {
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=DAEMON_RELOAD\n'
      failure_class=$saved_failure
      return 1
    }
  fi
  if (( docker_dropin_dir_created )); then
    rmdir "$DOCKER_DROPIN_DIR" >/dev/null 2>&1 || true
    if test -e "$DOCKER_DROPIN_DIR"; then
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=RESTORE_DROPIN_DIRECTORY\n'
      failure_class=$saved_failure
      return 1
    fi
  fi
  if (( containerd_dropin_dir_created )); then
    rmdir "$CONTAINERD_DROPIN_DIR" >/dev/null 2>&1 || true
    if test -e "$CONTAINERD_DROPIN_DIR"; then
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=RESTORE_DROPIN_DIRECTORY\n'
      failure_class=$saved_failure
      return 1
    fi
  fi
  cleanup_candidate_state || {
    printf 'M2_ROOT_STEP_V5 rollback=FAIL action=CLEANUP_CANDIDATE_STATE\n'
    failure_class=$saved_failure
    return 1
  }

  systemctl start containerd >/dev/null 2>&1 || {
    printf 'M2_ROOT_STEP_V5 rollback=FAIL action=START_CONTAINERD\n'
    failure_class=$saved_failure
    return 1
  }
  local deadline=$((SECONDS + ROLLBACK_TIMEOUT))
  while [[ "$(systemctl is-active containerd 2>/dev/null || true)" != active ]]; do
    if (( SECONDS >= deadline )); then
      printf 'M2_ROOT_STEP_V5 rollback=FAIL action=CONTAINERD_NOT_ACTIVE\n'
      failure_class=$saved_failure
      return 1
    fi
    sleep 1
  done
  systemctl start docker.socket >/dev/null 2>&1 || {
    printf 'M2_ROOT_STEP_V5 rollback=FAIL action=START_DOCKER_SOCKET\n'
    failure_class=$saved_failure
    return 1
  }
  systemctl start docker >/dev/null 2>&1 || {
    printf 'M2_ROOT_STEP_V5 rollback=FAIL action=START_DOCKER\n'
    failure_class=$saved_failure
    return 1
  }
  if wait_for_health "$DOCKER_ROOT" "$slate_restart_before" "$mysql_restart_before" "$ROLLBACK_TIMEOUT"; then
    printf 'M2_ROOT_STEP_V5 rollback=PASS containerd_root=%s docker_root=%s health=PASS\n' "$SOURCE" "$DOCKER_ROOT"
    failure_class=$saved_failure
    return 0
  fi
  printf 'M2_ROOT_STEP_V5 rollback=FAIL containerd_root=%s docker_root=%s health=FAIL\n' "$SOURCE" "$DOCKER_ROOT"
  failure_class=$saved_failure
  return 1
}

handle_failure() {
  local exit_code=$1
  trap - ERR INT TERM HUP
  set +e
  cleanup_temp
  if (( mutation_started )); then
    if ! rollback; then
      failure_class="ROLLBACK_FAILED_${failure_class}"
    fi
  fi
  printf 'M2_ROOT_STEP_V5 stage=%s status=FAIL class=%s\n' "$stage" "$failure_class"
  exit "$exit_code"
}

on_error() {
  local rc=$?
  (( rc != 0 )) || rc=1
  handle_failure "$rc"
}

on_signal() {
  local sig=$1
  local exit_code=$2
  failure_class="SIGNAL_$sig"
  handle_failure "$exit_code"
}

trap on_error ERR
trap 'on_signal INT 130' INT
trap 'on_signal TERM 143' TERM
trap 'on_signal HUP 129' HUP

manifest_metrics() {
  local root=$1
  local prefix=$2
  local files="$tmpdir/$prefix.files"
  local links="$tmpdir/$prefix.links"
  local hardlinks="$tmpdir/$prefix.hardlinks"
  find "$root" -xdev -type f -printf '%P %s\n' | LC_ALL=C sort >"$files"
  find "$root" -xdev -type l -printf '%P -> %l\n' | LC_ALL=C sort >"$links"
  find "$root" -xdev -type f -links +1 -printf '%i %n %P\n' | awk '
  {
    inode = $1
    links = $2
    sub(/^[^ ]+ +[^ ]+ +/, "")
    path = $0
    file_path[NR] = path
    file_inode[NR] = inode
    file_links[NR] = links
    if (!(inode in min_path) || path < min_path[inode]) min_path[inode] = path
  }
  END {
    for (i = 1; i <= NR; i++) print file_path[i], "links=" file_links[i], "target=" min_path[file_inode[i]]
  }' | LC_ALL=C sort >"$hardlinks"
  printf '%s_FILE_COUNT=%s\n' "$prefix" "$(wc -l <"$files")"
  printf '%s_FILE_PATH_SHA256=%s\n' "$prefix" "$(sha256sum "$files" | awk '{print $1}')"
  printf '%s_LOGICAL_BYTES=%s\n' "$prefix" "$(find "$root" -xdev -type f -exec stat -c '%s' {} + | awk '{s+=$1} END {print s+0}')"
  printf '%s_SYMLINK_COUNT=%s\n' "$prefix" "$(find "$root" -xdev -type l | wc -l)"
  printf '%s_SYMLINK_TARGET_SHA256=%s\n' "$prefix" "$(sha256sum "$links" | awk '{print $1}')"
  printf '%s_HARDLINK_FILE_COUNT=%s\n' "$prefix" "$(wc -l <"$hardlinks")"
  printf '%s_HARDLINK_PATH_SHA256=%s\n' "$prefix" "$(sha256sum "$hardlinks" | awk '{print $1}')"
}

stage=preflight
[[ "$(id -u)" == 0 ]] || { failure_class=NOT_ROOT; false; }
[[ "$#" == 0 ]] || { failure_class=UNEXPECTED_ARGUMENTS; false; }
for command_name in docker containerd ctr rsync findmnt realpath curl systemctl du df stat sha256sum find mktemp sort wc awk grep sleep mkdir cp chmod chown rm mv rmdir diff cat; do
  command -v "$command_name" >/dev/null 2>&1 || { failure_class=${command_name^^}_COMMAND_MISSING; false; }
done
test -d "$SOURCE" && test ! -L "$SOURCE" || { failure_class=CONTAINERD_ROOT_INVALID; false; }
[[ "$(realpath "$SOURCE")" == "$SOURCE" ]] || { failure_class=CONTAINERD_ROOT_PATH_MISMATCH; false; }
test -d "$SLATE_TOOLS" && [[ "$(realpath "$SLATE_TOOLS")" == "$SLATE_TOOLS" ]] || { failure_class=SLATE_TOOLS_PATH_INVALID; false; }
test ! -e "$DEST" || { failure_class=DESTINATION_COLLISION; false; }
[[ "$SOURCE" != "$DEST"/* && "$DEST" != "$SOURCE"/* ]] || { failure_class=SOURCE_DEST_NESTED; false; }
[[ "$DEST" != /mnt/ssd-tmp/deluge && "$DEST" != /mnt/ssd-tmp/deluge/* ]] || { failure_class=DELUGE_PATH_COLLISION; false; }
[[ "$(findmnt -T "$NVME" -no FSTYPE 2>/dev/null || true)" == ext4 ]] || { failure_class=NVME_FILESYSTEM_MISMATCH; false; }
nvme_options=$(findmnt -T "$NVME" -no OPTIONS 2>/dev/null || true)
[[ ",$nvme_options," == *,rw,* || "$nvme_options" == rw,* || "$nvme_options" == *,rw ]] || { failure_class=NVME_NOT_READ_WRITE; false; }
[[ "$(systemctl is-active containerd 2>/dev/null || true)" == active ]] || { failure_class=CONTAINERD_NOT_ACTIVE; false; }
[[ "$(systemctl is-active docker 2>/dev/null || true)" == active ]] || { failure_class=DOCKER_NOT_ACTIVE; false; }
[[ "$(systemctl is-active docker.socket 2>/dev/null || true)" == active ]] || { failure_class=DOCKER_SOCKET_NOT_ACTIVE; false; }
docker_socket_was_active=1
[[ "$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || true)" == "$DOCKER_ROOT" ]] || { failure_class=DOCKER_ROOT_MISMATCH; false; }
[[ "$(docker info --format '{{.Driver}}' 2>/dev/null || true)" == overlayfs ]] || { failure_class=STORAGE_DRIVER_MISMATCH; false; }
containerd_exec=$(systemctl show containerd -p ExecStart --value 2>/dev/null || true)
[[ "$containerd_exec" == *"/usr/bin/containerd"* ]] || { failure_class=CONTAINERD_EXECSTART_MISMATCH; false; }
[[ "$containerd_exec" != *"--root"* && "$containerd_exec" != *"--state"* && "$containerd_exec" != *"--config"* ]] || { failure_class=CONTAINERD_ALTERNATE_FLAGS_PRESENT; false; }
docker_exec=$(systemctl show docker -p ExecStart --value 2>/dev/null || true)
[[ "$docker_exec" == *"--containerd=/run/containerd/containerd.sock"* ]] || { failure_class=DOCKER_CONTAINERD_SOCKET_MISMATCH; false; }
test ! -e "$CONTAINERD_DROPIN" || { failure_class=CONTAINERD_DROPIN_COLLISION; false; }
test ! -e "$DOCKER_DROPIN" || { failure_class=DOCKER_DROPIN_COLLISION; false; }
test ! -e "$STATE" || { failure_class=CANDIDATE_STATE_COLLISION; false; }
containerd_dump=$(containerd config dump 2>/dev/null || true)
printf '%s\n' "$containerd_dump" | grep -Eq '^[[:space:]]*root[[:space:]]*=.*\/var\/lib\/containerd' || { failure_class=CONTAINERD_ROOT_CONFIG_MISMATCH; false; }
printf '%s\n' "$containerd_dump" | grep -Eq '^[[:space:]]*state[[:space:]]*=.*\/run\/containerd' || { failure_class=CONTAINERD_STATE_CONFIG_MISMATCH; false; }
test ! -e /etc/containerd/config.toml || { failure_class=UNEXPECTED_CONTAINERD_CONFIG_FILE; false; }
test -f "$TAR" || { failure_class=CANDIDATE_TAR_MISSING; false; }
[[ "$(stat -c %s "$TAR")" == "$TAR_BYTES" ]] || { failure_class=CANDIDATE_TAR_SIZE_MISMATCH; false; }
[[ "$(sha256sum "$TAR" | awk '{print $1}')" == "$TAR_SHA256" ]] || { failure_class=CANDIDATE_TAR_SHA_MISMATCH; false; }
test -f "$COMPOSE_FILE" || { failure_class=COMPOSE_FILE_MISSING; false; }
[[ "$(sha256sum "$COMPOSE_FILE" | awk '{print $1}')" == "$COMPOSE_FILE_SHA256" ]] || { failure_class=COMPOSE_FILE_SHA_MISMATCH; false; }
test -f "$COMPOSE_OVERRIDE" || { failure_class=COMPOSE_OVERRIDE_MISSING; false; }
[[ "$(sha256sum "$COMPOSE_OVERRIDE" | awk '{print $1}')" == "$COMPOSE_OVERRIDE_SHA256" ]] || { failure_class=COMPOSE_OVERRIDE_SHA_MISMATCH; false; }
docker compose version >/dev/null 2>&1 || { failure_class=DOCKER_COMPOSE_UNAVAILABLE; false; }
docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" -f "$COMPOSE_OVERRIDE" config --services 2>/dev/null | grep -qx slate || { failure_class=SLATE_COMPOSE_SERVICE_MISSING; false; }
test -d /var/lib/docker && test -d "$DOCKER_ROOT" || { failure_class=DOCKER_TREE_MISSING; false; }
test -d /mnt/ssd-tmp/incomplete && test -d /mnt/hdd-archive/Downloads && test -d /home/pi/Downloads || { failure_class=DELUGE_PATH_MISSING; false; }
systemctl is-active deluged >/dev/null 2>&1 || { failure_class=DELUGE_NOT_ACTIVE; false; }
systemctl is-active deluge-web >/dev/null 2>&1 || { failure_class=DELUGE_WEB_NOT_ACTIVE; false; }
slate_restart_before=$(docker inspect slate-note4 --format '{{.RestartCount}}' 2>/dev/null) || { failure_class=SLATE_INSPECT_FAILED; false; }
mysql_restart_before=$(docker inspect slate-note4-mysql --format '{{.RestartCount}}' 2>/dev/null) || { failure_class=MYSQL_INSPECT_FAILED; false; }
mysql_id_before=$(docker inspect slate-note4-mysql --format '{{.Id}}' 2>/dev/null) || { failure_class=MYSQL_ID_UNAVAILABLE; false; }
[[ "$slate_restart_before" =~ ^[0-9]+$ && "$mysql_restart_before" =~ ^[0-9]+$ ]] || { failure_class=RESTART_BASELINE_INVALID; false; }
[[ "$(docker inspect slate-note4 --format '{{.Image}}')" == "$CURRENT_IMAGE" ]] || { failure_class=CURRENT_IMAGE_MISMATCH; false; }
[[ "$(docker inspect slate-note4-mysql --format '{{.Image}}')" == "$MYSQL_IMAGE" ]] || { failure_class=MYSQL_IMAGE_MISMATCH; false; }
docker image inspect "$ROLLBACK_IMAGE" >/dev/null 2>&1 || { failure_class=ROLLBACK_IMAGE_NOT_VISIBLE; false; }
docker network inspect "$NETWORK" >/dev/null 2>&1 || { failure_class=NETWORK_MISSING; false; }
assert_active_root_health "$DOCKER_ROOT" "$slate_restart_before" "$mysql_restart_before" || false
source_bytes=$(du -sb "$SOURCE" | awk 'NR==1{print $1}')
[[ "$source_bytes" =~ ^[0-9]+$ ]] || { failure_class=CONTAINERD_SIZE_UNAVAILABLE; false; }
nvme_free=$(df -P -B1 "$NVME" | awk 'NR==2{print $4}')
[[ "$nvme_free" =~ ^[0-9]+$ ]] || { failure_class=NVME_FREE_SPACE_UNAVAILABLE; false; }
required_bytes=$((source_bytes + TAR_BYTES + RESERVE_FLOOR))
(( nvme_free >= required_bytes )) || { failure_class=NVME_PROJECTED_RESERVE_FAILED; false; }
test ! -e "$BACKUP" || { failure_class=BACKUP_COLLISION; false; }
mkdir "$BACKUP" || { failure_class=BACKUP_CREATE_FAILED; false; }
systemctl show containerd -p Id -p FragmentPath -p DropInPaths -p ActiveState -p SubState -p MainPID -p ExecStart >"$SERVICE_STATE" || { failure_class=SERVICE_STATE_CAPTURE_FAILED; false; }
chmod 600 "$SERVICE_STATE" || { failure_class=SERVICE_STATE_CHMOD_FAILED; false; }
chown root:root "$SERVICE_STATE" || { failure_class=SERVICE_STATE_CHOWN_FAILED; false; }
log preflight PASS

stage=copy
mutation_started=1
systemctl stop docker.socket >/dev/null 2>&1 || { failure_class=DOCKER_SOCKET_STOP_FAILED; false; }
[[ "$(systemctl is-active docker.socket 2>/dev/null || true)" != active ]] || { failure_class=DOCKER_SOCKET_STOP_FAILED; false; }
systemctl stop docker >/dev/null 2>&1 || { failure_class=DOCKER_STOP_FAILED; false; }
[[ "$(systemctl is-active docker 2>/dev/null || true)" != active ]] || { failure_class=DOCKER_STOP_FAILED; false; }
systemctl stop containerd >/dev/null 2>&1 || { failure_class=CONTAINERD_STOP_FAILED; false; }
[[ "$(systemctl is-active containerd 2>/dev/null || true)" != active ]] || { failure_class=CONTAINERD_STOP_FAILED; false; }
nested_mounts=$(findmnt -rn -o TARGET 2>/dev/null || true)
if printf '%s\n' "$nested_mounts" | grep -E -q "^($SOURCE|$DEST)/"; then
  failure_class=NESTED_MOUNT_DETECTED
  false
fi
mkdir "$DEST" || { failure_class=DESTINATION_CREATE_FAILED; false; }
rsync -aHAXS --numeric-ids "$SOURCE/" "$DEST/" >/dev/null 2>&1 || { failure_class=COPY_RSYNC_FAILED; false; }
tmpdir=$(mktemp -d "$BACKUP/verify.XXXXXX") || { failure_class=VERIFY_TMPDIR_FAILED; false; }
manifest_metrics "$SOURCE" TREE >"$tmpdir/src.metrics"
manifest_metrics "$DEST" TREE >"$tmpdir/dst.metrics"
diff -u "$tmpdir/src.metrics" "$tmpdir/dst.metrics" >/dev/null 2>&1 || { failure_class=COPY_STRUCTURE_METRICS_MISMATCH; false; }
rsync -aHAXS --numeric-ids --checksum --dry-run --itemize-changes --out-format='%i %n%L' "$SOURCE/" "$DEST/" >"$VERIFY_FILE" 2>"$VERIFY_ERR" || { failure_class=COPY_DETERMINISTIC_VERIFY_COMMAND_FAILED; false; }
test ! -s "$VERIFY_ERR" || { failure_class=COPY_DETERMINISTIC_VERIFY_COMMAND_FAILED; false; }
test ! -s "$VERIFY_FILE" || { failure_class=COPY_DETERMINISTIC_VERIFY_FAILED; false; }
cleanup_temp
tmpdir=
log copy PASS

stage=switch
if test -e "$CONTAINERD_DROPIN_DIR"; then
  test -d "$CONTAINERD_DROPIN_DIR" || { failure_class=CONTAINERD_DROPIN_DIR_NOT_DIRECTORY; false; }
else
  mkdir "$CONTAINERD_DROPIN_DIR" || { failure_class=CONTAINERD_DROPIN_DIR_CREATE_FAILED; false; }
  containerd_dropin_dir_created=1
fi
test ! -L "$CONTAINERD_DROPIN_DIR" || { failure_class=CONTAINERD_DROPIN_DIR_SYMLINK; false; }
cat >"$CONTAINERD_DROPIN_TMP" <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/containerd --root $DEST --state $STATE --address $CONTAINERD_SOCKET
EOF
chmod 644 "$CONTAINERD_DROPIN_TMP" || { failure_class=CONTAINERD_DROPIN_TMP_CHMOD_FAILED; false; }
chown root:root "$CONTAINERD_DROPIN_TMP" || { failure_class=CONTAINERD_DROPIN_TMP_CHOWN_FAILED; false; }
mv -- "$CONTAINERD_DROPIN_TMP" "$CONTAINERD_DROPIN" || { failure_class=CONTAINERD_DROPIN_INSTALL_FAILED; false; }
containerd_dropin_created=1
if test -e "$DOCKER_DROPIN_DIR"; then
  test -d "$DOCKER_DROPIN_DIR" || { failure_class=DOCKER_DROPIN_DIR_NOT_DIRECTORY; false; }
else
  mkdir "$DOCKER_DROPIN_DIR" || { failure_class=DOCKER_DROPIN_DIR_CREATE_FAILED; false; }
  docker_dropin_dir_created=1
fi
test ! -L "$DOCKER_DROPIN_DIR" || { failure_class=DOCKER_DROPIN_DIR_SYMLINK; false; }
cat >"$DOCKER_DROPIN_TMP" <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// --containerd=$CONTAINERD_SOCKET
EOF
chmod 644 "$DOCKER_DROPIN_TMP" || { failure_class=DOCKER_DROPIN_TMP_CHMOD_FAILED; false; }
chown root:root "$DOCKER_DROPIN_TMP" || { failure_class=DOCKER_DROPIN_TMP_CHOWN_FAILED; false; }
mv -- "$DOCKER_DROPIN_TMP" "$DOCKER_DROPIN" || { failure_class=DOCKER_DROPIN_INSTALL_FAILED; false; }
docker_dropin_created=1
systemctl daemon-reload || { failure_class=DAEMON_RELOAD_FAILED; false; }
containerd_exec_after=$(systemctl show containerd -p ExecStart --value 2>/dev/null || true)
[[ "$containerd_exec_after" == *"--address $CONTAINERD_SOCKET"* ]] || { failure_class=CONTAINERD_SWITCH_ENDPOINT_MISMATCH; false; }
[[ "$containerd_exec_after" == *"--root $DEST"* && "$containerd_exec_after" == *"--state $STATE"* ]] || { failure_class=CONTAINERD_SWITCH_CONFIG_MISMATCH; false; }
docker_exec_after=$(systemctl show docker -p ExecStart --value 2>/dev/null || true)
[[ "$docker_exec_after" == *"--containerd=$CONTAINERD_SOCKET"* ]] || { failure_class=DOCKER_SWITCH_CONFIG_MISMATCH; false; }
mkdir "$STATE" || { failure_class=CANDIDATE_STATE_CREATE_FAILED; false; }
chmod 700 "$STATE" || { failure_class=CANDIDATE_STATE_CHMOD_FAILED; false; }
chown root:root "$STATE" || { failure_class=CANDIDATE_STATE_CHOWN_FAILED; false; }
candidate_state_created=1
systemctl start containerd >/dev/null 2>&1 || { failure_class=CONTAINERD_START_FAILED; false; }
containerd_deadline=$((SECONDS + STARTUP_TIMEOUT))
while [[ "$(systemctl is-active containerd 2>/dev/null || true)" != active ]]; do
  if (( SECONDS >= containerd_deadline )); then failure_class=CONTAINERD_STARTUP_TIMEOUT; false; fi
  sleep 1
done
wait_for_candidate_containerd_readiness || false
systemctl start docker.socket >/dev/null 2>&1 || { failure_class=DOCKER_SOCKET_START_FAILED; false; }
[[ "$(systemctl is-active docker.socket 2>/dev/null || true)" == active ]] || { failure_class=DOCKER_SOCKET_NOT_ACTIVE; false; }
systemctl start docker >/dev/null 2>&1 || { failure_class=DOCKER_START_FAILED; false; }
wait_for_candidate_health_and_recreate || false
[[ "$(systemctl show containerd -p ExecStart --value 2>/dev/null || true)" == *"--root $DEST"* ]] || { failure_class=CONTAINERD_ROOT_NOT_ACTIVE; false; }
test -d "$SOURCE" && test -d "$DEST" || { failure_class=CONTAINERD_ROOT_PRESERVATION_FAILED; false; }
nvme_free_after=$(df -P -B1 "$NVME" | awk 'NR==2{print $4}')
(( nvme_free_after >= RESERVE_FLOOR )) || { failure_class=NVME_RESERVE_POSTCHECK_FAILED; false; }
secret_rw=$(docker inspect slate-note4 --format '{{range .Mounts}}{{if eq .Destination "/run/secrets/gemini_api_key"}}{{.RW}}{{end}}{{end}}' 2>/dev/null || true)
[[ "$secret_rw" == false ]] || { failure_class=GEMINI_SECRET_MOUNT_NOT_READ_ONLY; false; }
trap - ERR INT TERM HUP
printf 'M2_ROOT_STEP_V5 stage=switch status=PASS containerd_root=%s state=%s docker_root=%s old_root_preserved=YES health=PASS slate_recreated=YES stability_window=%ss\n' "$DEST" "$STATE" "$DOCKER_ROOT" "$STABILITY_WINDOW"
printf 'M2_ROOT_STEP_V5 stage=complete status=PASS\n'
