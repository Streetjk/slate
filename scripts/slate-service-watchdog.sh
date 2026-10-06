#!/usr/bin/env bash
set -euo pipefail
umask 077
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Slate Service Watchdog
# Prevent stale AI scheduler / wedged backend by restarting only the target container

SLATE_CONTAINER="${SLATE_CONTAINER:-slate-note4}"
SLATE_HEALTH_URL="${SLATE_HEALTH_URL:-http://127.0.0.1:3001/healthz}"
STATE_DIR="${STATE_DIR:-/var/lib/slate-service-watchdog}"
LOG_DIR="${LOG_DIR:-/var/log/slate-service-watchdog}"
HEALTH_FAILURE_THRESHOLD="${HEALTH_FAILURE_THRESHOLD:-3}"
AI_STALE_GRACE_SEC="${AI_STALE_GRACE_SEC:-900}"
RESTART_COOLDOWN_SEC="${RESTART_COOLDOWN_SEC:-600}"
POST_RESTART_VERIFY_SEC="${POST_RESTART_VERIFY_SEC:-60}"

validate_int() {
  local name="$1"
  local val="$2"
  local min="$3"
  if ! [[ "$val" =~ ^[0-9]+$ ]] || [ "$val" -lt "$min" ]; then
    echo "ERROR: Invalid $name='$val' (must be integer >= $min)" >&2
    exit 1
  fi
}

validate_int "HEALTH_FAILURE_THRESHOLD" "$HEALTH_FAILURE_THRESHOLD" 1
validate_int "AI_STALE_GRACE_SEC" "$AI_STALE_GRACE_SEC" 1
validate_int "RESTART_COOLDOWN_SEC" "$RESTART_COOLDOWN_SEC" 0
validate_int "POST_RESTART_VERIFY_SEC" "$POST_RESTART_VERIFY_SEC" 1

[[ "$SLATE_CONTAINER" == "slate-note4" ]] || { echo "ERROR: only slate-note4 is permitted" >&2; exit 1; }
for req_cmd in bash curl docker timeout flock; do
  if ! command -v "$req_cmd" >/dev/null 2>&1; then
    echo "ERROR: Missing required dependency: $req_cmd" >&2
    exit 1
  fi
done

mkdir -p "$STATE_DIR" "$LOG_DIR"

FAIL_COUNT_FILE="$STATE_DIR/consecutive_failures"
LAST_RESTART_FILE="$STATE_DIR/last_restart_epoch"
WATCHDOG_LOG="$LOG_DIR/watchdog.log"
if [ -f "$WATCHDOG_LOG" ] && [ "$(wc -c < "$WATCHDOG_LOG")" -gt 1048576 ]; then mv "$WATCHDOG_LOG" "$WATCHDOG_LOG.1"; fi
LOCK_FILE="$STATE_DIR/watchdog.lock"
LOCK_DIR="$STATE_DIR/watchdog.lockdir"

acquire_lock() {
  if command -v flock >/dev/null 2>&1; then
    exec 200>"$LOCK_FILE"
    if ! flock -n 200; then
      exit 0
    fi
  else
    if ! mkdir "$LOCK_DIR" 2>/dev/null; then
      exit 0
    fi
    trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM
  fi
}

log() {
  local level="$1"
  local code="$2"
  local msg="$3"
  local ts
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "$ts [$level] [$code] $msg" >> "$WATCHDOG_LOG"
}

get_fail_count() {
  if [ -f "$FAIL_COUNT_FILE" ]; then
    local c
    c="$(cat "$FAIL_COUNT_FILE" 2>/dev/null || echo 0)"
    if [[ "$c" =~ ^[0-9]+$ ]]; then
      echo "$c"
      return
    fi
  fi
  echo 0
}

set_fail_count() {
  echo "$1" > "$FAIL_COUNT_FILE"
}

get_last_restart() {
  if [ -f "$LAST_RESTART_FILE" ]; then
    local t
    t="$(cat "$LAST_RESTART_FILE" 2>/dev/null || echo 0)"
    if [[ "$t" =~ ^[0-9]+$ ]]; then
      echo "$t"
      return
    fi
  fi
  echo 0
}

set_last_restart() {
  echo "$1" > "$LAST_RESTART_FILE"
}

is_in_cooldown() {
  local now
  now="$(date +%s)"
  local last
  last="$(get_last_restart)"
  if [ -f "$STATE_DIR/last_attempt_epoch" ]; then
    local attempt
    attempt="$(cat "$STATE_DIR/last_attempt_epoch")"
    [[ "$attempt" =~ ^[0-9]+$ ]] || return 0
    [ "$attempt" -le "$last" ] || last="$attempt"
  fi
  local diff=$(( now - last ))
  if [ "$diff" -lt "$RESTART_COOLDOWN_SEC" ]; then
    return 0
  fi
  return 1
}

capture_diagnostics() {
  local reason="$1"
  local diag_file="$LOG_DIR/diagnostics-$(date +%s).log"
  {
    echo "Reason: $reason"
    date -u
    timeout -k 1 2 uptime || true
    timeout -k 1 2 free -h || true
    timeout -k 1 2 df -h "$STATE_DIR" "$LOG_DIR" || true
    timeout -k 1 2 df -i "$STATE_DIR" "$LOG_DIR" || true
    timeout -k 1 3 docker inspect --format '{{.State.Status}} OOM={{.State.OOMKilled}} Restarts={{.RestartCount}}' "$SLATE_CONTAINER" || true
    timeout -k 1 3 docker stats --no-stream --format '{{.Name}} {{.CPUPerc}} {{.MemUsage}} {{.PIDs}}' "$SLATE_CONTAINER" || true
  } > "$diag_file" 2>&1
  # Retain the newest 20 diagnostics; filenames are controlled by this script.
  local old
  while IFS= read -r old; do [ -z "$old" ] || rm -f -- "$LOG_DIR/$old"; done < <(
    find "$LOG_DIR" -maxdepth 1 -type f -name 'diagnostics-*.log' -print | sed 's|.*/||' | sort -r | tail -n +21
  )
  log "INFO" "DIAGNOSTICS_CAPTURED" "Captured diagnostics to $diag_file"
}

check_http_health() {
  local response
  response="$(curl -fsS -m 5 --connect-timeout 3 "$SLATE_HEALTH_URL" 2>/dev/null || true)"
  if [[ "$response" =~ \"status\"[[:space:]]*:[[:space:]]*\"ok\" ]]; then
    return 0
  fi
  return 1
}

verify_post_restart() {
  local start_ts
  start_ts="$(date +%s)"
  local deadline=$(( start_ts + POST_RESTART_VERIFY_SEC ))
  while true;
  do
    if check_http_health; then
      log "INFO" "POST_RESTART_HEALTH_SUCCESS" "Container $SLATE_CONTAINER successfully verified healthy"
      set_fail_count 0
      return 0
    fi
    local cur
    cur="$(date +%s)"
    if [ "$cur" -ge "$deadline" ]; then
      log "ERROR" "POST_RESTART_HEALTH_TIMEOUT" "Container $SLATE_CONTAINER did not return healthy within ${POST_RESTART_VERIFY_SEC}s"
      return 1
    fi
    sleep 1
  done
}

restart_container() {
  local reason="$1"
  if is_in_cooldown; then
    local now last elapsed remaining
    now="$(date +%s)"
    last="$(get_last_restart)"
    elapsed=$(( now - last ))
    remaining=$(( RESTART_COOLDOWN_SEC - elapsed ))
    log "WARN" "COOLDOWN_ACTIVE" "Restart suppressed: cooldown active (${remaining}s remaining). Reason: $reason"
    return 0
  fi

  log "WARN" "RESTART_INITIATED" "Initiating restart of $SLATE_CONTAINER due to: $reason"
  capture_diagnostics "$reason"

  # Persist an attempt bound even if Docker hangs/fails, preventing restart storms.
  echo "$(date +%s)" > "$STATE_DIR/last_attempt_epoch"
  if ! timeout -k 2 35 docker restart --time 10 "$SLATE_CONTAINER"; then
    log "ERROR" "RESTART_FAILED" "docker restart command failed for $SLATE_CONTAINER"
    return 1
  fi

  set_last_restart "$(date +%s)"
  log "INFO" "RESTART_EXECUTED" "Restart command completed for $SLATE_CONTAINER; verifying health"
  verify_post_restart
}

check_ai_scheduler() {
  local bun_script
  bun_script="$(cat << 'EOF'
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

EOF
)"

  bun_script="$bun_script
$(cat "$SCRIPT_DIR/slate-watchdog-policy.mjs")
const disabled = ['false', '0', 'no', 'n', 'off'].includes((process.env.BACKGROUND_WORKERS || '').toLowerCase());
if (disabled) process.exit(0);
const dbUrl = new URL(process.env.DATABASE_URL);
if (['true', '1', 'yes', 'y', 'on'].includes((process.env.DB_ALLOW_PUBLIC_KEY_RETRIEVAL || '').toLowerCase())) dbUrl.searchParams.set('allowPublicKeyRetrieval', 'true');
const prisma = new PrismaClient({adapter: new PrismaMariaDb(dbUrl.toString())});
let code = 1;
try {
  const rows = await prisma.content.findMany({
    where: {kind: 'dynamic', dynamicType: 'ai_usage', dynamicRefreshDueAt: {not: null}},
    select: {dynamicRefreshDueAt: true, dynamicLastRunAt: true, dynamicRefreshLeaseUntil: true}
  });
  code = rows.some(row => schedulerStale(row, Date.now(), Number(process.env.AI_STALE_GRACE_SEC))) ? 42 : 0;
} catch (_) { code = 1; }
finally { try { await prisma.\$disconnect(); } catch (_) {} }
process.exit(code);
"
  local ai_status=0
  local query=(docker exec -w /app/backend -e "AI_STALE_GRACE_SEC=$AI_STALE_GRACE_SEC" "$SLATE_CONTAINER" bun -e "$bun_script")
  timeout -k 2 15 "${query[@]}" >/dev/null 2>&1 || ai_status=$?

  if [ "$ai_status" -eq 0 ]; then
    log "INFO" "AI_SCHEDULER_OK" "AI scheduler check reported healthy state"
    return 0
  elif [ "$ai_status" -eq 42 ]; then
    log "WARN" "AI_SCHEDULER_STALE" "AI scheduler is overdue beyond ${AI_STALE_GRACE_SEC}s grace period"
    return 42
  else
    log "INFO" "AI_SCHEDULER_OBSERVATION_FAILED" "AI scheduler query exited with code $ai_status (observation error only; skipping restart)"
    return 0
  fi
}

main() {
  acquire_lock

  if check_http_health; then
    set_fail_count 0

    local ai_rc=0
    check_ai_scheduler || ai_rc=$?
    if [ "$ai_rc" -eq 42 ]; then
      restart_container "AI_SCHEDULER_STALE"
    fi
    exit 0
  else
    local current_failures
    current_failures="$(get_fail_count)"
    current_failures=$(( current_failures + 1 ))
    set_fail_count "$current_failures"
    log "WARN" "HEALTH_CHECK_FAILED" "Health check failed (consecutive failures: $current_failures / $HEALTH_FAILURE_THRESHOLD)"

    if [ "$current_failures" -ge "$HEALTH_FAILURE_THRESHOLD" ]; then
      restart_container "HEALTH_THRESHOLD_REACHED"
    fi
    exit 0
  fi
}

main
