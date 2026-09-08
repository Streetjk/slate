#!/usr/bin/env python3
"""Capture only structural NOTE4/backend markers for one bounded M4 session."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import time

import serial
from serial import SerialException


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
    "LIVE_FAILURE_SOURCE": (
        r"(?:CONNECT_REJECT|PROVIDER_ONERROR|PROVIDER_ONCLOSE|BRIDGE_ERROR|"
        r"MESSAGE_HANDLER_EXCEPTION|AUDIO_CODEC_EXCEPTION|SOCKET_SEND_EXCEPTION|"
        r"OTHER_SAFE_CLASS)"
    ),
    "PROVIDER_CLOSE_EXPECTED": r"(?:YES|NO)",
    "ACTIVE_CONNECT_GENERATION": r"[0-9]+",
    "ACTIVE_LISTEN_GENERATION": r"[0-9]+",
    "LISTENING_STATE_AT_FAILURE": r"(?:YES|NO)",
    "LIVE_SESSION_PRESENT_AT_FAILURE": r"(?:YES|NO)",
    "CONNECTING_PROMISE_PRESENT_AT_FAILURE": r"(?:YES|NO)",
    "PROVIDER_LIVE_ERROR_CALLBACK": r"YES",
    "PROVIDER_LIVE_CLOSE_CALLBACK": r"YES",
}
VOICE_REGEX = {
    key: re.compile(rf"(?<![A-Z0-9_]){key}=({pattern})(?![A-Za-z0-9_.-])")
    for key, pattern in VOICE_PATTERNS.items()
}
TIMING_KEY_PREFIXES = (
    r"T_(?:DEVICE|FIRMWARE|BACKEND|PROVIDER|FIRST|TRANSCRIPT|AUDIO|EPD|UI|LVGL|WS)[A-Z0-9_]*"
)
TIMING_BOOL_REGEX = re.compile(
    rf"(?<![A-Z0-9_])({TIMING_KEY_PREFIXES})(?<!_MS)=(YES|NO)(?![A-Za-z0-9_.-])"
)
TIMING_MS_REGEX = re.compile(
    rf"(?<![A-Z0-9_])({TIMING_KEY_PREFIXES}_MS)=([0-9]+)(?![A-Za-z0-9_.-])"
)
SERIAL_MARKERS = {
    "BOOT": re.compile(r"(?i)(ESP-ROM|app_main|bootloader|booting|reset reason|rst:)"),
    "WIFI": re.compile(r"(?i)(wifi|wi-fi|got ip|ip_event_sta_got_ip|station.*connect|network.*connect)"),
    "POLL": re.compile(r"(?i)(poll|sync|authenticated|heartbeat)"),
    "FATAL": re.compile(r"(?i)(guru meditation|abort\(|panic|assert failed|fatal error|stack overflow)"),
}
STRUCTURAL_PATTERNS = {
    "AUDIO_PACKET_RECEIVED": re.compile(r"\baudio_pkt_recv count=(\d+) bytes=(\d+)"),
    "AUDIO_PACKET_GATE_REJECTED": re.compile(r"\baudio_pkt_gate_rejected(?: count=(\d+))?"),
    "AUDIO_PACKET_ENQUEUED": re.compile(r"\baudio_pkt_enqueued(?: count=(\d+))?"),
    "AUDIO_DECODE_OK": re.compile(r"\baudio_decode_ok(?: count=(\d+))?"),
    "AUDIO_DECODE_FAIL": re.compile(r"\baudio_decode_fail(?: count=(\d+))?"),
    "AUDIO_PLAYER_WRITE_OK": re.compile(r"\baudio_player_write_ok(?: count=(\d+))?"),
    "AUDIO_PLAYER_WRITE_FAIL": re.compile(r"\baudio_player_write_fail(?: count=(\d+))?"),
    "TIMING_MARKER": re.compile(
        r"\b(T_(?:DEVICE|FIRMWARE|BACKEND|PROVIDER|FIRST|TRANSCRIPT|AUDIO|EPD|UI|LVGL|WS)[A-Z0-9_]*)\b"
    ),
    "REFRESH_MARKER": re.compile(r"\b(refresh_(?:start|done))\b(?: path=(full|partial))?"),
}


def extract_voice_events(line: str) -> list[dict[str, str]]:
    """Return allow-listed key/value pairs; never return the source line."""
    events: list[dict[str, str]] = []
    for key, pattern in VOICE_REGEX.items():
        for match in pattern.finditer(line):
            events.append({"event": key, "value": match.group(1)})
    for match in TIMING_BOOL_REGEX.finditer(line):
        events.append({"event": match.group(1), "value": match.group(2)})
    for match in TIMING_MS_REGEX.finditer(line):
        events.append({"event": match.group(1), "value": match.group(2)})
    return events


def extract_structural_events(line: str) -> list[dict[str, str]]:
    """Return only allow-listed numeric/enum audio and timing markers."""
    events: list[dict[str, str]] = []
    for event, pattern in STRUCTURAL_PATTERNS.items():
        match = pattern.search(line)
        if not match:
            continue
        values = [value for value in match.groups() if value is not None]
        events.append({"event": event, "value": "|".join(values) if values else "YES"})
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
docker logs --since 8s slate-note4 2>&1 | grep -oE '(VOICE_[A-Z0-9_]+|PROVIDER_(SESSION_CREATE_START|SESSION_CREATE_RESULT|SESSION_STARTED|LIVE_ERROR_CALLBACK|LIVE_CLOSE_CALLBACK|CLOSE_EXPECTED)|FIRST_MIC_FRAME_RECEIVED|LIVE_FAILURE_SOURCE|ACTIVE_CONNECT_GENERATION|ACTIVE_LISTEN_GENERATION|LISTENING_STATE_AT_FAILURE|LIVE_SESSION_PRESENT_AT_FAILURE|CONNECTING_PROMISE_PRESENT_AT_FAILURE|T_[A-Z0-9_]+|audio_(pkt_recv|pkt_gate_rejected|pkt_enqueued|decode_ok|decode_fail|player_write_ok|player_write_fail))=[A-Za-z0-9_.=-]+' | sort -u || true
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
    assert extract_structural_events("audio_pkt_recv count=3 bytes=120") == [
        {"event": "AUDIO_PACKET_RECEIVED", "value": "3|120"}
    ]
    assert extract_structural_events("T_DEVICE_FIRST_AUDIO_DECODED") == [
        {"event": "TIMING_MARKER", "value": "T_DEVICE_FIRST_AUDIO_DECODED"}
    ]

    # Verify LIVE_FAILURE_SOURCE with all allowed fixed enum values
    allowed_sources = [
        "CONNECT_REJECT",
        "PROVIDER_ONERROR",
        "PROVIDER_ONCLOSE",
        "BRIDGE_ERROR",
        "MESSAGE_HANDLER_EXCEPTION",
        "AUDIO_CODEC_EXCEPTION",
        "SOCKET_SEND_EXCEPTION",
        "OTHER_SAFE_CLASS",
    ]
    for src in allowed_sources:
        assert extract_voice_events(f"LIVE_FAILURE_SOURCE={src}") == [
            {"event": "LIVE_FAILURE_SOURCE", "value": src}
        ]

    # Unsanitized / arbitrary values must NOT be captured
    assert extract_voice_events("LIVE_FAILURE_SOURCE=RAW_UNSANITIZED_EXCEPTION") == []
    assert extract_voice_events("LIVE_FAILURE_SOURCE=UNKNOWN_ERROR") == []

    # Verify PROVIDER_CLOSE_EXPECTED YES/NO
    assert extract_voice_events("PROVIDER_CLOSE_EXPECTED=YES") == [
        {"event": "PROVIDER_CLOSE_EXPECTED", "value": "YES"}
    ]
    assert extract_voice_events("PROVIDER_CLOSE_EXPECTED=NO") == [
        {"event": "PROVIDER_CLOSE_EXPECTED", "value": "NO"}
    ]
    assert extract_voice_events("PROVIDER_CLOSE_EXPECTED=MAYBE") == []

    # Verify generation markers (digits only)
    assert extract_voice_events("ACTIVE_CONNECT_GENERATION=42") == [
        {"event": "ACTIVE_CONNECT_GENERATION", "value": "42"}
    ]
    assert extract_voice_events("ACTIVE_CONNECT_GENERATION=abc") == []
    assert extract_voice_events("ACTIVE_LISTEN_GENERATION=7") == [
        {"event": "ACTIVE_LISTEN_GENERATION", "value": "7"}
    ]
    assert extract_voice_events("ACTIVE_LISTEN_GENERATION=invalid") == []

    # Verify failure state markers YES/NO
    assert extract_voice_events("LISTENING_STATE_AT_FAILURE=YES") == [
        {"event": "LISTENING_STATE_AT_FAILURE", "value": "YES"}
    ]
    assert extract_voice_events("LISTENING_STATE_AT_FAILURE=NO") == [
        {"event": "LISTENING_STATE_AT_FAILURE", "value": "NO"}
    ]
    assert extract_voice_events("LIVE_SESSION_PRESENT_AT_FAILURE=YES") == [
        {"event": "LIVE_SESSION_PRESENT_AT_FAILURE", "value": "YES"}
    ]
    assert extract_voice_events("LIVE_SESSION_PRESENT_AT_FAILURE=NO") == [
        {"event": "LIVE_SESSION_PRESENT_AT_FAILURE", "value": "NO"}
    ]
    assert extract_voice_events("CONNECTING_PROMISE_PRESENT_AT_FAILURE=YES") == [
        {"event": "CONNECTING_PROMISE_PRESENT_AT_FAILURE", "value": "YES"}
    ]
    assert extract_voice_events("CONNECTING_PROMISE_PRESENT_AT_FAILURE=NO") == [
        {"event": "CONNECTING_PROMISE_PRESENT_AT_FAILURE", "value": "NO"}
    ]

    # Verify callback markers YES
    assert extract_voice_events("PROVIDER_LIVE_ERROR_CALLBACK=YES") == [
        {"event": "PROVIDER_LIVE_ERROR_CALLBACK", "value": "YES"}
    ]
    assert extract_voice_events("PROVIDER_LIVE_CLOSE_CALLBACK=YES") == [
        {"event": "PROVIDER_LIVE_CLOSE_CALLBACK", "value": "YES"}
    ]
    assert extract_voice_events("PROVIDER_LIVE_ERROR_CALLBACK=NO") == []
    assert extract_voice_events("PROVIDER_LIVE_CLOSE_CALLBACK=NO") == []

    # Verify privacy preservation: raw details, transcripts, auth, urls must not be retained
    line = (
        "LIVE_FAILURE_SOURCE=BRIDGE_ERROR "
        "transcript=user_said_hello password=secret_token url=https://example.com/api "
        "stack=at /Users/ollama/secret.ts header=Bearer secret"
    )
    extracted = extract_voice_events(line)
    assert extracted == [{"event": "LIVE_FAILURE_SOURCE", "value": "BRIDGE_ERROR"}]
    dumped = json.dumps(extracted)
    assert "user_said_hello" not in dumped
    assert "password" not in dumped
    assert "secret" not in dumped
    assert "https://" not in dumped
    assert "/Users" not in dumped

    # Verify allowlisted T_* boolean markers and T_*_MS numeric timestamps
    assert extract_voice_events("T_DEVICE_LISTEN_START=YES") == [
        {"event": "T_DEVICE_LISTEN_START", "value": "YES"}
    ]
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=1725800000000") == [
        {"event": "T_DEVICE_LISTEN_START_MS", "value": "1725800000000"}
    ]
    assert extract_voice_events("T_PROVIDER_SESSION_READY=YES") == [
        {"event": "T_PROVIDER_SESSION_READY", "value": "YES"}
    ]
    assert extract_voice_events("T_PROVIDER_SESSION_READY_MS=1725800000050") == [
        {"event": "T_PROVIDER_SESSION_READY_MS", "value": "1725800000050"}
    ]
    assert extract_voice_events("T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN=YES") == [
        {"event": "T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN", "value": "YES"}
    ]
    assert extract_voice_events("T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS=1725800000050") == [
        {"event": "T_PROVIDER_SESSION_READY_IF_ALREADY_OPEN_MS", "value": "1725800000050"}
    ]
    assert extract_voice_events("T_BACKEND_FIRST_AUDIO_RECEIVED=YES") == [
        {"event": "T_BACKEND_FIRST_AUDIO_RECEIVED", "value": "YES"}
    ]
    assert extract_voice_events("T_BACKEND_FIRST_AUDIO_RECEIVED_MS=1725800000020") == [
        {"event": "T_BACKEND_FIRST_AUDIO_RECEIVED_MS", "value": "1725800000020"}
    ]
    assert extract_voice_events("T_FIRST_DEVICE_AUDIO_SENT=YES") == [
        {"event": "T_FIRST_DEVICE_AUDIO_SENT", "value": "YES"}
    ]
    assert extract_voice_events("T_PROVIDER_FIRST_OUTPUT_EVENT=YES") == [
        {"event": "T_PROVIDER_FIRST_OUTPUT_EVENT", "value": "YES"}
    ]
    assert extract_voice_events("T_PROVIDER_FIRST_AUDIO_EVENT=YES") == [
        {"event": "T_PROVIDER_FIRST_AUDIO_EVENT", "value": "YES"}
    ]
    assert extract_voice_events("T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=YES") == [
        {"event": "T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE", "value": "YES"}
    ]
    assert extract_voice_events("T_TRANSCRIPT_FINALIZED=YES") == [
        {"event": "T_TRANSCRIPT_FINALIZED", "value": "YES"}
    ]

    # Multiple timing markers on a single line
    combo = extract_voice_events(
        "T_DEVICE_LISTEN_START=YES T_DEVICE_LISTEN_START_MS=1725800000000 "
        "T_PROVIDER_SESSION_READY=YES T_PROVIDER_SESSION_READY_MS=1725800000050"
    )
    assert combo == [
        {"event": "T_DEVICE_LISTEN_START", "value": "YES"},
        {"event": "T_PROVIDER_SESSION_READY", "value": "YES"},
        {"event": "T_DEVICE_LISTEN_START_MS", "value": "1725800000000"},
        {"event": "T_PROVIDER_SESSION_READY_MS", "value": "1725800000050"},
    ]

    # Rejection of unallowlisted timing prefixes
    assert extract_voice_events("T_UNAPPROVED_PREFIX=YES") == []
    assert extract_voice_events("T_UNAPPROVED_PREFIX_MS=1725800000000") == []
    assert extract_voice_events("T_RANDOM_STAGE=YES") == []

    # Rejection of non-boolean values for T_*
    assert extract_voice_events("T_DEVICE_LISTEN_START=1725800000000") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START=MAYBE") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START=PASS") == []

    # Rejection of non-numeric values for T_*_MS (digits only)
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=YES") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=1725800000000abc") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=-100") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=1725800000000.5") == []
    assert extract_voice_events("T_DEVICE_LISTEN_START_MS=0x123") == []

    # Timing marker privacy preservation: payloads, keys, credentials, and errors must NOT leak
    timing_leak_line = (
        "T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE=YES "
        "T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE_MS=1725800000400 "
        "transcript=user_private_sentence "
        "api_key=synthetic-test-token-never-leak-98765 "
        "exception=GeminiLiveBridgeFailure:connection_aborted "
        "uuid=550e8400-e29b-41d4-a716-446655440000"
    )
    timing_leak_events = extract_voice_events(timing_leak_line)
    assert timing_leak_events == [
        {"event": "T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE", "value": "YES"},
        {"event": "T_BACKEND_FIRST_AUDIO_PACKET_TO_DEVICE_MS", "value": "1725800000400"},
    ]
    timing_dump = json.dumps(timing_leak_events)
    assert "user_private_sentence" not in timing_dump
    assert "synthetic-test-token" not in timing_dump
    assert "GeminiLiveBridgeFailure" not in timing_dump
    assert "550e8400" not in timing_dump

    # Serial structural markers must still be captured intact
    assert extract_structural_events("T_DEVICE_FIRST_AUDIO_DECODED") == [
        {"event": "TIMING_MARKER", "value": "T_DEVICE_FIRST_AUDIO_DECODED"}
    ]
    assert extract_structural_events("T_DEVICE_FIRST_AUDIO_PLAYBACK") == [
        {"event": "TIMING_MARKER", "value": "T_DEVICE_FIRST_AUDIO_PLAYBACK"}
    ]
    assert extract_structural_events("audio_pkt_recv count=12 bytes=480") == [
        {"event": "AUDIO_PACKET_RECEIVED", "value": "12|480"}
    ]
    assert extract_structural_events("audio_player_write_ok count=1 samples=240") == [
        {"event": "AUDIO_PLAYER_WRITE_OK", "value": "1"}
    ]

    # Firmware audio attribution markers with sanitized numeric timestamps
    fw_stages = [
        ("I (1000) xiaozhi_ws: T_DEVICE_FIRST_AUDIO_RECEIVED=YES T_DEVICE_FIRST_AUDIO_RECEIVED_MS=1725800000100",
         "T_DEVICE_FIRST_AUDIO_RECEIVED_MS", "1725800000100"),
        ("I (1050) xiaozhi_audio: T_DEVICE_FIRST_AUDIO_DECODED=YES T_DEVICE_FIRST_AUDIO_DECODED_MS=1725800000150",
         "T_DEVICE_FIRST_AUDIO_DECODED_MS", "1725800000150"),
        ("I (1100) xiaozhi_audio: T_DEVICE_FIRST_AUDIO_PLAYBACK=YES T_DEVICE_FIRST_AUDIO_PLAYBACK_MS=1725800000200",
         "T_DEVICE_FIRST_AUDIO_PLAYBACK_MS", "1725800000200"),
        ("I (1150) audio: T_AUDIO_PLAYER_FIRST_WRITE=YES T_AUDIO_PLAYER_FIRST_WRITE_MS=1725800000220",
         "T_AUDIO_PLAYER_FIRST_WRITE_MS", "1725800000220"),
        ("I (1151) audio: T_DEVICE_FIRST_AUDIO_WRITE=YES T_DEVICE_FIRST_AUDIO_WRITE_MS=1725800000220",
         "T_DEVICE_FIRST_AUDIO_WRITE_MS", "1725800000220"),
    ]
    for raw_line, expected_event, expected_val in fw_stages:
        extracted = extract_voice_events(raw_line)
        assert any(e["event"] == expected_event and e["value"] == expected_val for e in extracted), (
            f"Failed to extract {expected_event}={expected_val} from {raw_line}: {extracted}"
        )
        dump = json.dumps(extracted)
        assert "xiaozhi" not in dump
        assert "audio" not in dump or expected_event in dump

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
    device = None
    try:
        while time.monotonic() - started < args.duration:
            if device is None:
                try:
                    device = serial.Serial(port=args.port, baudrate=115200, timeout=0.2)
                    print(json.dumps({"observer": "SERIAL_CONNECTED"}), flush=True)
                except (SerialException, OSError):
                    print(json.dumps({"observer": "SERIAL_DISCONNECTED"}), flush=True)
                    time.sleep(1.0)
                    continue
            try:
                raw = device.readline()
            except (SerialException, OSError):
                device.close()
                device = None
                print(json.dumps({"observer": "SERIAL_DISCONNECTED"}), flush=True)
                continue
            if raw:
                line_count += 1
                line = raw.decode("utf-8", "replace")
                for name, pattern in SERIAL_MARKERS.items():
                    if pattern.search(line):
                        counts[name] += 1
                events = extract_voice_events(line) + extract_structural_events(line)
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
        if device is not None:
            device.close()
        print(json.dumps({"observer": "STOPPED", "serial_counts": {"lines": line_count, **counts}}, sort_keys=True), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
