#!/usr/bin/env python3
"""Read Claude Code's /usage UI through its normal login; never extract credentials.

Requires pyte==0.8.2 and wcwidth==0.2.13. Prints only validated quota metadata.
The configured cwd must already be trusted. No trust/login input is automated.
"""
import argparse
import codecs
import datetime as dt
import fcntl
import json
import os
import pty
import re
import select
import signal
import struct
import sys
import termios
import time
from zoneinfo import ZoneInfo

MAX_CAPTURE_BYTES = 256 * 1024


def parse_reset(text, now):
    match = re.fullmatch(
        r"Resets\s+(?:(?P<month>[A-Z][a-z]{2})\s+(?P<day>\d{1,2})\s+at\s+)?"
        r"(?P<hour>\d{1,2})(?::(?P<minute>\d{2}))?(?P<ampm>am|pm)"
        r"\s+\((?P<zone>[A-Za-z_]+/[A-Za-z_/]+)\)", text.strip()
    )
    if not match:
        return None
    try:
        local = now.astimezone(ZoneInfo(match["zone"]))
        hour = int(match["hour"])
        minute = int(match["minute"] or 0)
        if not 1 <= hour <= 12 or not 0 <= minute <= 59:
            return None
        hour = hour % 12 + (12 if match["ampm"] == "pm" else 0)
        if match["month"]:
            month = dt.datetime.strptime(match["month"], "%b").month
            target = local.replace(month=month, day=int(match["day"]), hour=hour,
                                   minute=minute, second=0, microsecond=0)
            if target < local - dt.timedelta(minutes=1):
                target = target.replace(year=target.year + 1)
            if not 0 <= (target - local).total_seconds() <= 8 * 86400:
                return None
        else:
            target = local.replace(hour=hour, minute=minute, second=0, microsecond=0)
            if target < local - dt.timedelta(minutes=1):
                target += dt.timedelta(days=1)
            if not -60 <= (target - local).total_seconds() <= 5 * 3600:
                return None
        return int(target.timestamp())
    except (ValueError, KeyError):
        return None


def parse_screen(text, now=None):
    now = now or dt.datetime.now(dt.timezone.utc)
    if re.search(r"Refreshing|failed|error|unable|sign.?in|log.?in|trust this folder",
                 text, re.I):
        return None
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    result = {"fetched_at": now.timestamp()}
    for title, key in [("Current session", "five_hour"),
                       ("Current week (all models)", "seven_day")]:
        indices = [i for i, line in enumerate(lines) if line == title]
        if len(indices) != 1:
            return None
        index = indices[0]
        if index + 2 >= len(lines):
            return None
        match = re.fullmatch(r"[█▌▍▎▏▐▀▄▓▒░\s]*?(\d+(?:\.\d+)?)%\s*used",
                             lines[index + 1])
        if not match:
            return None
        used = float(match[1])
        if not 0 <= used <= 100:
            return None
        reset = parse_reset(lines[index + 2], now)
        # Unknown UI/date formats fail closed instead of guessing a reset time.
        if reset is None:
            return None
        result[key] = {"used_percentage": used, "reset_at": reset}
    return result


def collect_usage(command, cwd, timeout=25):
    import pyte

    pid, master = pty.fork()
    if pid == 0:
        try:
            os.chdir(cwd)
            env = {key: os.environ[key] for key in
                   ["HOME", "PATH", "USER", "LOGNAME", "TMPDIR"] if key in os.environ}
            env["TERM"] = "xterm-256color"
            os.execve(command, [command, "--setting-sources", "",
                      "--settings", '{"disableAllHooks":true}', "--tools", "",
                      "--strict-mcp-config", "/usage"], env)
        except Exception:
            os._exit(2)
    fcntl.ioctl(master, termios.TIOCSWINSZ, struct.pack("HHHH", 45, 140, 0, 0))
    screen = pyte.Screen(140, 45)
    stream = pyte.Stream(screen)
    decoder = codecs.getincrementaldecoder("utf-8")("replace")
    deadline = time.monotonic() + timeout
    captured = 0
    saw_refresh = False
    candidate = None
    stable_since = 0
    query_tail = b""
    try:
        while time.monotonic() < deadline:
            if select.select([master], [], [], 0.2)[0]:
                try:
                    data = os.read(master, 65536)
                except OSError:
                    break
                if not data:
                    break
                captured += len(data)
                if captured > MAX_CAPTURE_BYTES:
                    return None
                queries = query_tail + data
                if b"\x1b[6n" in queries:
                    os.write(master, b"\x1b[1;1R")
                query_tail = queries[-3:]
                stream.feed(decoder.decode(data))
            text = "\n".join(screen.display)
            saw_refresh |= "Refreshing" in text
            parsed = parse_screen(text)
            if not saw_refresh or parsed is None:
                candidate = None
                continue
            comparable = {key: value for key, value in parsed.items() if key != "fetched_at"}
            if comparable != candidate:
                candidate = comparable
                stable_since = time.monotonic()
            elif time.monotonic() - stable_since >= 1:
                # Accept only after this invocation's visible refresh completes.
                return parsed
        return None
    finally:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        cleanup_deadline = time.monotonic() + 1
        while time.monotonic() < cleanup_deadline:
            try:
                if os.waitpid(pid, os.WNOHANG)[0]:
                    break
            except ChildProcessError:
                break
            time.sleep(0.05)
        else:
            try:
                os.kill(pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            try:
                os.waitpid(pid, os.WNOHANG)
            except ChildProcessError:
                pass
        os.close(master)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--command", required=True)
    parser.add_argument("--cwd", required=True)
    args = parser.parse_args()
    try:
        quota = collect_usage(args.command, args.cwd)
    except Exception:
        quota = None
    if quota is None:
        print("Claude usage refresh unavailable", file=sys.stderr)
        sys.exit(2)
    print(json.dumps(quota, separators=(",", ":")))
