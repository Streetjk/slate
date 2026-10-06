#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WATCHDOG_SCRIPT="$SCRIPT_DIR/slate-service-watchdog.sh"

if [ ! -f "$WATCHDOG_SCRIPT" ]; then
  echo "ERROR: Watchdog script not found at $WATCHDOG_SCRIPT" >&2
  exit 1
fi

TEST_TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEST_TEMP_DIR"' EXIT INT TERM

TEST_BIN="$TEST_TEMP_DIR/bin"
TEST_STATE="$TEST_TEMP_DIR/state"
TEST_LOG="$TEST_TEMP_DIR/log"
mkdir -p "$TEST_BIN" "$TEST_STATE" "$TEST_LOG"

CURL_MODE_FILE="$TEST_TEMP_DIR/curl_mode"
AI_MODE_FILE="$TEST_TEMP_DIR/ai_mode"
RESTART_LOG="$TEST_TEMP_DIR/restarts.log"
touch "$RESTART_LOG"

cat << 'EOF' > "$TEST_BIN/curl"
#!/usr/bin/env bash
set -euo pipefail
mode="ok"
if [ -n "${FAKE_CURL_MODE_FILE:-}" ] && [ -f "${FAKE_CURL_MODE_FILE:-}" ]; then
  mode="$(cat "$FAKE_CURL_MODE_FILE")"
fi

case "$mode" in
  ok)
    echo '{"status":"ok","ts":"2026-10-02T00:00:00Z"}'
    exit 0
    ;;
  fail)
    echo '{"status":"error"}'
    exit 1
    ;;
  post_restart_ok)
    if [ -n "${FAKE_RESTART_LOG:-}" ] && [ -s "${FAKE_RESTART_LOG:-}" ]; then
      echo '{"status":"ok","ts":"2026-10-02T00:00:00Z"}'
      exit 0
    else
      exit 1
    fi
    ;;
  *)
    exit 1
    ;;
esac
EOF
chmod +x "$TEST_BIN/curl"

cat << 'EOF' > "$TEST_BIN/docker"
#!/usr/bin/env bash
set -euo pipefail
subcmd="${1:-}"

case "$subcmd" in
  ps)
    echo "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES"
    echo "abc123456789   slate   bun run   1h ago    Up 1h    3001    slate-note4"
    exit 0
    ;;
  inspect)
    echo '{"Status":"running","Running":true,"Paused":false,"Restarting":false,"OOMKilled":false,"Dead":false,"Pid":1234,"ExitCode":0,"Error":"","StartedAt":"2026-10-02T00:00:00Z","FinishedAt":"0001-01-01T00:00:00Z"}'
    exit 0
    ;;
  stats)
    echo "CONTAINER ID   NAME          CPU %     MEM USAGE / LIMIT   MEM %     NET I/O     BLOCK I/O   PIDS"
    echo "abc123456789   slate-note4   0.50%     150MiB / 2GiB       7.50%     1MB / 2MB   0B / 0B     25"
    exit 0
    ;;
  logs)
    echo "[info] Container log tail sample"
    exit 0
    ;;
  restart)
    target="${4:-}"
    if [ -f "$FAKE_AI_MODE_FILE.restart_fail" ]; then exit 1; fi
    if [ -n "${FAKE_RESTART_LOG:-}" ]; then
      echo "$target" >> "$FAKE_RESTART_LOG"
    fi
    echo "$target"
    exit 0
    ;;
  exec)
    # docker exec -w /app/backend -e ENV container bun -e SCRIPT
    [ "$#" -eq 9 ] && [ "$8" = "-e" ] && [[ "$9" == *"schedulerStale"* ]] || exit 77
    echo argv-ok >> "$FAKE_RESTART_LOG.argv"
    mode="ok"
    if [ -n "${FAKE_AI_MODE_FILE:-}" ] && [ -f "${FAKE_AI_MODE_FILE:-}" ]; then
      mode="$(cat "$FAKE_AI_MODE_FILE")"
    fi
    case "$mode" in
      ok)
        exit 0
        ;;
      stale)
        exit 42
        ;;
      error)
        echo "Error: Database connection timeout" >&2
        exit 1
        ;;
      *)
        exit 0
        ;;
    esac
    ;;
  *)
    exit 0
    ;;
esac
EOF
chmod +x "$TEST_BIN/docker"

export PATH="$TEST_BIN:$PATH"
export STATE_DIR="$TEST_STATE"
export LOG_DIR="$TEST_LOG"
export FAKE_CURL_MODE_FILE="$CURL_MODE_FILE"
export FAKE_AI_MODE_FILE="$AI_MODE_FILE"
export FAKE_RESTART_LOG="$RESTART_LOG"
export HEALTH_FAILURE_THRESHOLD=3
export AI_STALE_GRACE_SEC=900
export RESTART_COOLDOWN_SEC=600
export POST_RESTART_VERIFY_SEC=2
export SLATE_CONTAINER="slate-note4"

assert_eq() {
  local expected="$1"
  local actual="$2"
  local label="$3"
  if [ "$expected" != "$actual" ]; then
    echo "FAIL: $label (expected '$expected', got '$actual')" >&2
    exit 1
  fi
}

restart_count() {
  if [ -f "$RESTART_LOG" ]; then
    wc -l < "$RESTART_LOG" | tr -d ' '
  else
    echo 0
  fi
}

echo "[Test 1] Health success resets prior failure counter and does not restart..."
echo "2" > "$STATE_DIR/consecutive_failures"
echo "ok" > "$CURL_MODE_FILE"
echo "ok" > "$AI_MODE_FILE"
: > "$RESTART_LOG"
bash "$WATCHDOG_SCRIPT"
assert_eq "0" "$(cat "$STATE_DIR/consecutive_failures")" "Failure count reset on health success"
assert_eq "0" "$(restart_count)" "No restart on health success"

echo "[Test 2] First and second failed health checks do not restart..."
echo "0" > "$STATE_DIR/consecutive_failures"
echo "fail" > "$CURL_MODE_FILE"
: > "$RESTART_LOG"
bash "$WATCHDOG_SCRIPT"
assert_eq "1" "$(cat "$STATE_DIR/consecutive_failures")" "Failure count incremented to 1"
assert_eq "0" "$(restart_count)" "No restart on 1st failure"
bash "$WATCHDOG_SCRIPT"
assert_eq "2" "$(cat "$STATE_DIR/consecutive_failures")" "Failure count incremented to 2"
assert_eq "0" "$(restart_count)" "No restart on 2nd failure"

echo "[Test 3] Third failure captures diagnostics and exactly one target-container restart..."
echo "post_restart_ok" > "$CURL_MODE_FILE"
: > "$RESTART_LOG"
bash "$WATCHDOG_SCRIPT"
assert_eq "1" "$(restart_count)" "Exactly one restart on 3rd failure"
assert_eq "slate-note4" "$(head -n 1 "$RESTART_LOG")" "Target container restarted"
diag_files_count="$(find "$LOG_DIR" -name 'diagnostics-*.log' | wc -l | tr -d ' ')"
if [ "$diag_files_count" -lt 1 ]; then
  echo "FAIL: Diagnostics file was not created" >&2
  exit 1
fi

echo "[Test 4] Cooldown prevents repeat restart..."
echo "3" > "$STATE_DIR/consecutive_failures"
echo "fail" > "$CURL_MODE_FILE"
bash "$WATCHDOG_SCRIPT"
assert_eq "1" "$(restart_count)" "Restart suppressed by cooldown"
grep -q "COOLDOWN_ACTIVE" "$LOG_DIR/watchdog.log"

echo "[Test 5] Healthy HTTP + AI stale dedicated docker-exec result triggers one restart..."
: > "$RESTART_LOG"
echo "0" > "$STATE_DIR/last_restart_epoch"
rm -f "$STATE_DIR/last_attempt_epoch"
echo "ok" > "$CURL_MODE_FILE"
echo "stale" > "$AI_MODE_FILE"
bash "$WATCHDOG_SCRIPT"
assert_eq "1" "$(restart_count)" "Restart triggered by stale AI scheduler"
grep -q "AI_SCHEDULER_STALE" "$LOG_DIR/watchdog.log"

echo "[Test 6] AI observation/query error does not restart..."
: > "$RESTART_LOG"
echo "0" > "$STATE_DIR/last_restart_epoch"
rm -f "$STATE_DIR/last_attempt_epoch"
echo "ok" > "$CURL_MODE_FILE"
echo "error" > "$AI_MODE_FILE"
bash "$WATCHDOG_SCRIPT"
assert_eq "0" "$(restart_count)" "No restart on AI query/tool error"
grep -q "AI_SCHEDULER_OBSERVATION_FAILED" "$LOG_DIR/watchdog.log"

echo "[Test 7] Query argv envelope is intact..."
test -s "$RESTART_LOG.argv"
echo "[Test 8] Invalid target rejected..."
if SLATE_CONTAINER=mysql bash "$WATCHDOG_SCRIPT"; then exit 1; fi
echo "[Test 9] Restart failure preserves success timestamp, records attempt and propagates failure..."
echo 0 > "$STATE_DIR/last_restart_epoch"
rm -f "$STATE_DIR/last_attempt_epoch"
touch "$AI_MODE_FILE.restart_fail"
echo stale > "$AI_MODE_FILE"
if bash "$WATCHDOG_SCRIPT"; then exit 1; fi
assert_eq 0 "$(cat "$STATE_DIR/last_restart_epoch")" "Failed restart is not recorded as success"
test -s "$STATE_DIR/last_attempt_epoch"
rm "$AI_MODE_FILE.restart_fail"
echo "[Test 10] Post-restart timeout fails and makes only one restart..."
echo 0 > "$STATE_DIR/last_restart_epoch"
rm -f "$STATE_DIR/last_attempt_epoch"
echo 2 > "$STATE_DIR/consecutive_failures"
echo fail > "$CURL_MODE_FILE"
: > "$RESTART_LOG"
if bash "$WATCHDOG_SCRIPT"; then exit 1; fi
assert_eq 1 "$(restart_count)" "Exactly one failed health-verification restart"
echo "PASS: All slate-service-watchdog tests succeeded" 
exit 0
