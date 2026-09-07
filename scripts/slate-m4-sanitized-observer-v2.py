#!/usr/bin/env python3
"""Capture only structural NOTE4/backend markers for one bounded M4 session."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import time

import serial


VOICE_PATTERNS = {
    "VOICE_CONFIG_REQUEST_START": r"YES",
    "VOICE_CONFIG_RESULT": r"(?:2xx|4xx|5xx|transport_error)",
    "VOICE_CONFIG_PARSE": r"(?:PASS|FAIL_[A-Z0-9_]+)",
    "VOICE_WS_CONNECT_START": r"YES",
    "VOICE_WS_CONNECT_RESULT": r"(?:OPEN|HTTP_FAIL|TLS_FAIL|TRANSPORT_FAIL)",
    "VOICE_WS_CLOSE_CODE": r"(?:NONE|[0-9]{3,4})",
    "VOICE_GENERIC_FAILURE_BRANCH": r"[A-Z0-9_]+",
    "VOICE_SESSION_INIT_SENT": r"(?:YES|NO)",
    "VOICE_MIC_STREAM_STARTED": r"(?:YES|NO)",
    "VOICE_CONFIG_AUTH_ATTEMPT": r"YES",
    "VOICE_CONFIG_AUTH_RESULT": r"(?:PASS|REJECT)",
    "VOICE_CONFIG_RESPONSE_CLASS": r"(?:2xx|4xx|5xx)",
    "VOICE_WS_UPGRADE_ATTEMPT": r"YES",
    "VOICE_WS_AUTH_RESULT": r"(?:PASS|REJECT)",
    "VOICE_WS_ACCEPTED": r"(?:YES|NO)",
    "PROVIDER_SESSION_CREATE_START": r"(?:YES|NO)",
    "PROVIDER_SESSION_CREATE_RESULT": r"(?:PASS|[A-Z][A-Z0-9_]*)",
    "PROVIDER_SESSION_STARTED": r"(?:YES|NO)",
    "FIRST_MIC_FRAME_RECEIVED": r"(?:YES|NO)",
}
VOICE_REGEX = {
    key: re.compile(rf"(?<![A-Z0-9_]){key}=({pattern})(?![A-Za-z0-9_.-])")
    for key, pattern in VOICE_PATTERNS.items()
}
SERIAL_MARKERS = {
    "BOOT": re.compile(r"(?i)(ESP-ROM|app_main|bootloader|booting|reset reason|rst:)"),
    "WIFI": re.compile(r"(?i)(wifi|wi-fi|got ip|ip_event_sta_got_ip|station.*connect|network.*connect)"),
    "POLL": re.compile(r"(?i)(poll|sync|authenticated|heartbeat)"),
    "FATAL": re.compile(r"(?i)(guru meditation|abort\(|panic|assert failed|fatal error|stack overflow)"),
}


def extract_voice_events(line: str) -> list[dict[str, str]]:
    """Return allow-listed key/value pairs; never return the source line."""
    events: list[dict[str, str]] = []
    for key, pattern in VOICE_REGEX.items():
        for match in pattern.finditer(line):
            events.append({"event": key, "value": match.group(1)})
    return events


def backend_snapshot() -> dict[str, object]:
    remote = """set -eu
local=$(curl -fsS --max-time 8 -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/healthz || true)
public=$(curl -fsS --max-time 12 -o /dev/null -w '%{http_code}' https://orangepi5.tail6aabef.ts.net/healthz || true)
slate=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{.RestartCount}}|{{.Config.Image}}' slate-note4 2>/dev/null || true)
mysql=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{.RestartCount}}|{{.Config.Image}}' slate-note4-mysql 2>/dev/null || true)
echo HEALTH=$local,$public
printf 'SLATE=%s\n' "$slate"
printf 'MYSQL=%s\n' "$mysql"
docker logs --since 8s slate-note4 2>&1 | grep -oE 'VOICE_[A-Z0-9_]+=[A-Za-z0-9_.-]+' | sort -u || true
"""
    try:
        completed = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=5", "note4-orangepi", remote],
            capture_output=True,
            text=True,
            timeout=20,
            check=False,
        )
    except Exception as exc:
        return {"ssh_exit": "ERROR", "error_class": type(exc).__name__}
    result: dict[str, object] = {"ssh_exit": completed.returncode, "health": "UNKNOWN", "slate": "UNKNOWN", "mysql": "UNKNOWN", "voice": []}
    voice: list[dict[str, str]] = []
    for line in completed.stdout.splitlines():
        if line.startswith("HEALTH="):
            result["health"] = line.removeprefix("HEALTH=")
        elif line.startswith("SLATE="):
            result["slate"] = line.removeprefix("SLATE=")
        elif line.startswith("MYSQL="):
            result["mysql"] = line.removeprefix("MYSQL=")
        else:
            voice.extend(extract_voice_events(line))
    result["voice"] = voice
    return result


def self_test() -> int:
    events = extract_voice_events("VOICE_WS_CONNECT_RESULT=TRANSPORT_FAIL transcript=DO_NOT_RETAIN")
    assert events == [{"event": "VOICE_WS_CONNECT_RESULT", "value": "TRANSPORT_FAIL"}]
    assert "DO_NOT_RETAIN" not in json.dumps(events)
    assert extract_voice_events("VOICE_MIC_STREAM_STARTED=NO") == [{"event": "VOICE_MIC_STREAM_STARTED", "value": "NO"}]
    assert extract_voice_events("VOICE_WS_CLOSE_CODE=1006") == [{"event": "VOICE_WS_CLOSE_CODE", "value": "1006"}]
    print("slate-m4-sanitized-observer-v2: PASS")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", default="/dev/cu.usbmodem31201")
    parser.add_argument("--duration", type=float, default=3600.0)
    parser.add_argument("--interval", type=float, default=5.0)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    counts = {name: 0 for name in SERIAL_MARKERS}
    line_count = 0
    last_backend = 0.0
    started = time.monotonic()
    print(json.dumps({"observer": "ARMED", "serial_port": args.port, "raw_content": "NOT_RETAINED"}), flush=True)
    try:
        with serial.Serial(port=args.port, baudrate=115200, timeout=0.2) as device:
            while time.monotonic() - started < args.duration:
                raw = device.readline()
                if raw:
                    line_count += 1
                    line = raw.decode("utf-8", "replace")
                    for name, pattern in SERIAL_MARKERS.items():
                        if pattern.search(line):
                            counts[name] += 1
                    events = extract_voice_events(line)
                    if events:
                        print(json.dumps({"serial_line_count": line_count, "events": events}, sort_keys=True), flush=True)
                now = time.monotonic()
                if now - last_backend >= args.interval:
                    last_backend = now
                    print(json.dumps({"serial_counts": {"lines": line_count, **counts}}, sort_keys=True), flush=True)
                    print(json.dumps({"backend": backend_snapshot()}, sort_keys=True), flush=True)
    except KeyboardInterrupt:
        pass
    finally:
        print(json.dumps({"observer": "STOPPED", "serial_counts": {"lines": line_count, **counts}}, sort_keys=True), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
