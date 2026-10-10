#!/usr/bin/env python3
"""Mac cron watchdog: freshness observations, bounded retries, helper-only recovery."""
import datetime
import fcntl
import json
import os
from pathlib import Path
import plistlib
import shlex
import signal
import subprocess
import time
import urllib.error
import urllib.request

HOME_DIR = Path.home()
STATE_DIR = HOME_DIR / "Library/Application Support/Slate/quota-watchdog"
PROVIDERS = ("codex", "grok", "agy_gemini", "claude")
STALE_SEC = 1800
COOLDOWN_SEC = 3600


def age(value, now):
    try:
        n = datetime.datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()
        return now - n if n <= now else None
    except (ValueError, TypeError, AttributeError):
        return None


def provider_state(row, now):
    if not isinstance(row, dict):
        return "missing"
    if row.get("authMetadataDetected") is False:
        return "sign_in"
    quota = row.get("quota") or {}
    elapsed = age(quota.get("observedAt"), now)
    windows = quota.get("windows") or []
    if elapsed is None or elapsed > STALE_SEC or not windows:
        return "stale"
    if any(w.get("resetAt") and (age(w["resetAt"], now) is not None) for w in windows):
        return "expired"
    return "fresh"


def ssh(command):
    return subprocess.check_output(["/usr/bin/ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8", "note4-orangepi", command], timeout=30, stderr=subprocess.DEVNULL, text=True)


def snapshot():
    # GET also schedules stale-provider collection in the existing helper.
    return json.loads(ssh("curl -fsS --max-time 15 http://100.73.201.113:19091/v1/providers"))


def helper_health_url():
    with (HOME_DIR / "Library/LaunchAgents/com.slate.ai-usage-helper.plist").open("rb") as f:
        env = plistlib.load(f).get("EnvironmentVariables", {})
    host = env.get("SLATE_AI_HELPER_HOST", "127.0.0.1")
    if host == "0.0.0.0":
        host = "127.0.0.1"
    port = int(env.get("SLATE_AI_HELPER_PORT", "19091"))
    return f"http://{host}:{port}/healthz"


def local_responding():
    url = helper_health_url()
    try:
        with urllib.request.urlopen(url, timeout=3):
            return True
    except urllib.error.HTTPError:
        # IP allowlist rejection still proves the HTTP server is responsive.
        return True
    except (OSError, urllib.error.URLError):
        return False


def restart_helper():
    plist = HOME_DIR / "Library/LaunchAgents/com.slate.ai-usage-helper.plist"
    with plist.open("rb") as f:
        cfg = plistlib.load(f)
    argv = cfg["ProgramArguments"]
    expected = [str(HOME_DIR / ".bun/bin/bun"), str(HOME_DIR / "Library/Application Support/Slate/ai-usage-helper/helper.ts")]
    if argv != expected:
        raise RuntimeError("helper configuration drift")
    listing = subprocess.check_output(["/bin/ps", "-axo", "pid=,uid=,command="], text=True)
    matches = []
    for line in listing.splitlines():
        parts = line.strip().split(None, 2)
        if len(parts) == 3 and int(parts[1]) == os.getuid() and parts[2] == " ".join(argv):
            matches.append(int(parts[0]))
    if len(matches) > 1:
        raise RuntimeError("multiple helper processes")
    for pid in matches:
        current = subprocess.check_output(["/bin/ps", "-p", str(pid), "-o", "command="], text=True).strip()
        if current != " ".join(argv):
            raise RuntimeError("helper PID changed")
        os.kill(pid, signal.SIGTERM)
        for _ in range(30):
            try:
                os.kill(pid, 0)
            except ProcessLookupError:
                break
            time.sleep(0.1)
        else:
            raise RuntimeError("helper did not terminate")
    # A launch supervisor may already have recovered it; avoid a duplicate.
    if local_responding():
        return
    with open(cfg["StandardOutPath"], "ab") as out, open(cfg["StandardErrorPath"], "ab") as err:
        subprocess.Popen(argv, env={**os.environ, **cfg.get("EnvironmentVariables", {})}, cwd=cfg.get("WorkingDirectory", str(HOME_DIR)), stdin=subprocess.DEVNULL, stdout=out, stderr=err, start_new_session=True)


DB_CHECK = r"""import {PrismaClient} from '@prisma/client';import {PrismaMariaDb} from '@prisma/adapter-mariadb';
const u=new URL(process.env.DATABASE_URL);u.searchParams.set('allowPublicKeyRetrieval','true');
const p=new PrismaClient({adapter:new PrismaMariaDb(u.toString())});
try {const now=new Date();const rows=await p.content.findMany({where:{dynamicType:'ai_usage'},select:{dynamicLastRunAt:true}});
const stale=rows.some(r=>!r.dynamicLastRunAt||now.getTime()-r.dynamicLastRunAt.getTime()>1800000);
let queued=0;if(stale){queued=(await p.content.updateMany({where:{dynamicType:'ai_usage',OR:[{dynamicLastRunAt:null},{dynamicLastRunAt:{lt:new Date(now.getTime()-1800000)}}],AND:[{OR:[{dynamicRefreshLeaseUntil:null},{dynamicRefreshLeaseUntil:{lt:now}}]}]},data:{dynamicRefreshDueAt:now,dynamicNextRunAt:now}})).count;}
const devices=await p.device.findMany({select:{lastSeenAt:true}});
console.log(JSON.stringify({renderCount:rows.length,renderStale:stale,queued,deviceLastSeen:devices.map(d=>d.lastSeenAt)}));
}finally{await p.$disconnect();}"""


def run():
    STATE_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (STATE_DIR / "lock").open("w") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        now = time.time()
        receipt = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "action": "none"}
        state_file = STATE_DIR / "state.json"
        try:
            previous = json.loads(state_file.read_text())
        except (OSError, ValueError):
            previous = {}
        # Only local HTTP unresponsiveness authorizes process recovery.
        if not local_responding():
            time.sleep(2)
            if not local_responding():
                last = previous.get("lastRestart", 0)
                if isinstance(last, (int, float)) and now - last >= COOLDOWN_SEC:
                    previous["lastRestart"] = now
                    state_file.write_text(json.dumps(previous))
                    restart_helper()
                    receipt["action"] = "helper_restart"
                    time.sleep(3)
                else:
                    receipt["action"] = "restart_cooldown"
        try:
            data = snapshot()
            status = {p: provider_state(data.get(p), time.time()) for p in PROVIDERS}
            if any(s in ("stale", "expired", "missing") for s in status.values()):
                receipt["retry"] = "collection_scheduled_by_snapshot"
                time.sleep(20)
                data = snapshot()
                status = {p: provider_state(data.get(p), time.time()) for p in PROVIDERS}
            receipt["providers"] = status
        except (OSError, ValueError, subprocess.SubprocessError):
            receipt["collector"] = "unreachable_or_invalid"
        try:
            db = json.loads(ssh("docker exec -w /app/backend slate-note4 bun -e " + shlex.quote(DB_CHECK)))
            receipt["render"] = {k: db[k] for k in ("renderCount", "renderStale", "queued")}
            perth_time = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8)))
            quiet = perth_time.hour >= 23 or (perth_time.hour * 60 + perth_time.minute) < 330
            receipt["devices"] = ["quiet_hours" if quiet else "recent" if age(v, time.time()) is not None and age(v, time.time()) <= STALE_SEC else "offline_or_stale" for v in db["deviceLastSeen"]]
        except (OSError, ValueError, KeyError, subprocess.SubprocessError):
            receipt["backend"] = "check_failed"
        (STATE_DIR / "latest.json").write_text(json.dumps(receipt))
        print(json.dumps(receipt), flush=True)


if __name__ == "__main__":
    try:
        run()
    except Exception:
        # Do not expose subprocess output, configuration or credential diagnostics.
        print(json.dumps({"watchdog": "failed", "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat()}), flush=True)
        raise SystemExit(1)
