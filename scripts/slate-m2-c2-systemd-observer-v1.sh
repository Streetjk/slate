#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Campaign 8D1M-G M2 C2 recovery observer.
# During the stop window this observer asks only systemd for unit/process state.
# It deliberately does not use a container API, an HTTP probe, or a socket path.

dir=${1:?result directory is required}
host=${2:?remote host is required}
interval=${3:-2}
timeout=${4:-1200}
result=$dir/result.txt
samples=$dir/samples.txt

test -d "$dir"
: >"$samples"
end=$(( $(date +%s) + timeout ))
transition=0

while [ "$(date +%s)" -lt "$end" ]; do
  snapshot=$(ssh -o BatchMode=yes -o ConnectTimeout=10 "$host" '
    printf "CONTAINERD_ACTIVE=%s\n" "$(systemctl is-active containerd.service 2>/dev/null || true)"
    printf "CONTAINERD_EXEC=%s\n" "$(systemctl show containerd.service -p ExecStart --value 2>/dev/null || true)"
    printf "CONTAINERD_JOB=%s\n" "$(systemctl show containerd.service -p Job --value 2>/dev/null || true)"
    printf "DOCKER_ACTIVE=%s\n" "$(systemctl is-active docker.service 2>/dev/null || true)"
    printf "DOCKER_SOCKET_ACTIVE=%s\n" "$(systemctl is-active docker.socket 2>/dev/null || true)"
    printf "DOCKER_JOB=%s\n" "$(systemctl show docker.service -p Job --value 2>/dev/null || true)"
    printf "SOCKET_JOB=%s\n" "$(systemctl show docker.socket -p Job --value 2>/dev/null || true)"
  ' 2>/dev/null || true)
  printf '%s\n' "$snapshot" >>"$samples"

  containerd_active=$(printf '%s\n' "$snapshot" | sed -n 's/^CONTAINERD_ACTIVE=//p')
  containerd_exec=$(printf '%s\n' "$snapshot" | sed -n 's/^CONTAINERD_EXEC=//p')
  docker_active=$(printf '%s\n' "$snapshot" | sed -n 's/^DOCKER_ACTIVE=//p')
  socket_active=$(printf '%s\n' "$snapshot" | sed -n 's/^DOCKER_SOCKET_ACTIVE=//p')

  if [ "$containerd_active" != active ] ||
     printf '%s' "$containerd_exec" | grep -q -- '--root /mnt/ssd-tmp/slate-tools/containerd-root'; then
    transition=1
  fi

  if [ "$transition" = 1 ] &&
     [ "$containerd_active" = active ] &&
     printf '%s' "$containerd_exec" | grep -q -- '--root /mnt/ssd-tmp/slate-tools/containerd-root' &&
     [ "$docker_active" = active ] && [ "$socket_active" = active ]; then
    printf 'C2_SYSTEMD_OBSERVER=PASS_DEST_ROOT_ACTIVE\nCONTAINERD_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root\nDOCKER_SERVICE=active\nDOCKER_SOCKET=active\n' >"$result"
    exit 0
  fi

  if [ "$transition" = 1 ] &&
     [ "$containerd_active" = active ] &&
     ! printf '%s' "$containerd_exec" | grep -q -- '--root /mnt/ssd-tmp/slate-tools/containerd-root' &&
     [ "$docker_active" = active ] && [ "$socket_active" = active ]; then
    printf 'C2_SYSTEMD_OBSERVER=ROLLBACK_HEALTHY_SYSTEMD\nCONTAINERD_ROOT=original\nDOCKER_SERVICE=active\nDOCKER_SOCKET=active\n' >"$result"
    exit 2
  fi

  sleep "$interval"
done

printf 'C2_SYSTEMD_OBSERVER=TIMEOUT_NO_TERMINAL_RESULT\n' >"$result"
exit 3
