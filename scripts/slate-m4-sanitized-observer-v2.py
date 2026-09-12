#!/usr/bin/env python3
"""Capture only structural NOTE4/backend markers for one bounded M4 session."""

from __future__ import annotations

import argparse
from collections import deque
import json
import re
import subprocess
import time

import serial
from serial import SerialException


COLLECTOR_CONTRACT_VERSION = "m4-sanitized-structural-v3"
MAX_PENDING_INPUT_CHARS = 8192
MAX_EVENTS_PER_LINE = 64
MAX_SEEN_EVENT_BATCHES = 2048
REQUIRED_PRODUCER_EVENT_CLASSES = (
    "FRAME_MARKER",
    "VOICE_FONT_MARKER",
    "VOICE_LAYOUT_MARKER",
    "WEATHER_LIFECYCLE_MARKER",
)


FRAME_MARKER_RE = re.compile(
    r"\bframe marker phase=(server_current|requested|received|sync_result|active)"
    r"(?P<fields>[^\r\n]{0,260})"
)
VOICE_FONT_MARKER_RE = re.compile(r"\bvoice font marker(?P<fields>[^\r\n]{0,320})")
VOICE_FONT_MISSING_RE = re.compile(r"\bvoice font marker missing_codepoint=0x([0-9A-Fa-f]{1,6})\b")
VOICE_LAYOUT_MARKER_RE = re.compile(r"\bvoice layout marker(?P<fields>[^\r\n]{0,220})")
WEATHER_LIFECYCLE_MARKER_RE = re.compile(
    r"\[slate\] weather lifecycle marker stage=(db_mark_config_invalid|db_mark_fetch_error|"
    r"db_clear_error_unchanged|db_clear_error_rendered|db_write_error|frontend_view) "
    r"type=weather error_present=([01])\b"
)
PRODUCER_SCHEMA_RE = re.compile(r"\bmarker_schema=([0-9]+)\b")
SENSITIVE_FIELD_RE = re.compile(
    r"(?:^|\s)(?:transcript|audio|payload|device(?:_id)?|mac|ip|ssid|token|credential|"
    r"auth_header|url|stack|exception|content)="
)


def _bounded_field(fields: str, name: str, maximum: int = 100000) -> str | None:
    match = re.search(rf"(?:^|\s){name}=([0-9]+)(?=\s|$)", fields)
    if not match:
        return None
    value = int(match.group(1))
    return str(value) if value <= maximum else None


def _enum_field(fields: str, name: str, allowed: tuple[str, ...]) -> str | None:
    choices = "|".join(re.escape(value) for value in allowed)
    match = re.search(rf"(?:^|\s){name}=({choices})(?=\s|$)", fields)
    return match.group(1) if match else None


def _bool_field(fields: str, name: str) -> str | None:
    value = _enum_field(fields, name, ("0", "1"))
    return {"0": "NO", "1": "YES"}.get(value) if value else None


def extract_producer_events(line: str) -> list[dict[str, str]]:
    """Parse the producer contract without retaining producer text or payloads."""
    events: list[dict[str, str]] = []
    if SENSITIVE_FIELD_RE.search(line):
        return [{"event": "CAPTURE_REJECTED", "value": "UNAPPROVED_FIELD"}]
    schema = PRODUCER_SCHEMA_RE.search(line)
    if schema and schema.group(1) != "2":
        return [{"event": "CAPTURE_REJECTED", "value": "STALE_SCHEMA"}]

    frame = FRAME_MARKER_RE.search(line)
    if frame:
        fields = frame.group("fields")
        events.append({"event": "FRAME_MARKER", "value": "OBSERVED"})
        events.append({"event": "FRAME_MARKER_PHASE", "value": frame.group(1)})
        for name in ("ok", "seq"):
            value = _bounded_field(fields, name)
            if value is not None:
                events.append({"event": f"FRAME_MARKER_{name.upper()}", "value": value})
        for name in ("frame_id_present", "frame_available"):
            value = _bool_field(fields, name)
            if value is not None:
                events.append({"event": f"FRAME_MARKER_{name.upper()}", "value": value})
        value = _enum_field(fields, "frame_id_match", ("match", "mismatch", "unknown"))
        if value is not None:
            events.append({"event": "FRAME_MARKER_FRAME_ID_MATCH", "value": value})

    font = VOICE_FONT_MARKER_RE.search(line)
    if font:
        fields = font.group("fields")
        events.append({"event": "VOICE_FONT_MARKER", "value": "OBSERVED"})
        for source, target in (
            ("direct_descriptor", "VOICE_FONT_DIRECT_DESCRIPTOR_FOUND"),
            ("direct_bitmap", "VOICE_FONT_DIRECT_BITMAP_FOUND"),
            ("fallback_descriptor", "VOICE_FONT_FALLBACK_DESCRIPTOR_FOUND"),
            ("fallback_bitmap", "VOICE_FONT_FALLBACK_BITMAP_FOUND"),
        ):
            value = _bool_field(fields, source)
            if value is not None:
                events.append({"event": target, "value": value})
        fallback = _enum_field(fields, "fallback", ("Zfull_16", "none"))
        if fallback is not None:
            events.append({"event": "VOICE_FONT_FALLBACK_CLASS", "value": fallback})
    missing = VOICE_FONT_MISSING_RE.search(line)
    if missing:
        events.append({"event": "VOICE_FONT_MISSING_CODEPOINT", "value": missing.group(1).upper()})

    layout = VOICE_LAYOUT_MARKER_RE.search(line)
    if layout:
        fields = layout.group("fields")
        events.append({"event": "VOICE_LAYOUT_MARKER", "value": "OBSERVED"})
        for name in ("measured_width", "final_width", "final_height", "text_chars"):
            value = _bounded_field(fields, name, maximum=100000)
            if value is not None:
                events.append({"event": f"VOICE_LAYOUT_{name.upper()}", "value": value})

    weather = WEATHER_LIFECYCLE_MARKER_RE.search(line)
    if weather:
        events.extend(
            [
                {"event": "WEATHER_LIFECYCLE_MARKER", "value": "OBSERVED"},
                {"event": "WEATHER_LIFECYCLE_STAGE", "value": weather.group(1)},
                {"event": "WEATHER_LIFECYCLE_ERROR_PRESENT", "value": "YES" if weather.group(2) == "1" else "NO"},
            ]
        )
    return events[:MAX_EVENTS_PER_LINE]

VOICE_PATTERNS = {
    "DEVICE_AUTHENTICATED_POLL_RESULT": r"PASS",
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
    "VOICE_TURN_INDEX": r"[0-9]+",
    "VOICE_TURN_START": r"(?:YES|NO)",
    "VOICE_TURN_START_MS": r"[0-9]+",
    "BACKEND_OPERATION_QUEUE_DEPTH": r"[0-9]+",
    "BACKEND_PRE_PROVIDER_MIC_QUEUE_FRAMES": r"[0-9]+",
    "BACKEND_PRE_PROVIDER_MIC_QUEUE_BYTES": r"[0-9]+",
    "VOICE_WS_BUFFERED_BYTES": r"[0-9]+",
    "VOICE_WS_SEND_BACKLOG_BYTES": r"[0-9]+",
    "BRIDGE_STDIO_WRITE_BACKLOG_BYTES": r"[0-9]+",
    "BRIDGE_STDIO_DRAIN_PENDING": r"(?:YES|NO)",
    "UI_EVENT_QUEUE_WAITING": r"[0-9]+",
    "UI_EVENT_QUEUE_SPACES": r"[0-9]+",
    "HEAP_INTERNAL_FREE_BYTES": r"[0-9]+",
    "HEAP_SPIRAM_FREE_BYTES": r"[0-9]+",
    "AUDIO_DECODE_QUEUE_LEN": r"[0-9]+",
    "AUDIO_SEND_QUEUE_LEN": r"[0-9]+",
    "AUDIO_PLAYBACK_QUEUE_LEN": r"[0-9]+",
    "RESET_REASON_CLASS": r"(?:POWERON|SW|DEEPSLEEP|PANIC|INT_WDT|TASK_WDT|WDT|BROWNOUT|SDIO|UNKNOWN|OTHER)",
    "WATCHDOG_REASON_CLASS": r"(?:NONE|TASK_WDT|INT_WDT|OTHER_WDT)",
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
    "BOOT": re.compile(r"(?i)(ESP-ROM|app_main|bootloader|booting|reset reason|rst:|BOOT_METRICS|RESET_REASON_CLASS)"),
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


def extract_sanitized_line_events(line: str) -> list[dict[str, str]]:
    """Apply producer, key/value and structural parsers without returning raw input."""
    producer_events = extract_producer_events(line)
    if producer_events:
        return producer_events[:MAX_EVENTS_PER_LINE]
    return (extract_voice_events(line) + extract_structural_events(line))[:MAX_EVENTS_PER_LINE]


class CaptureAccumulator:
    """Bounded fragmented-line capture with explicit duplicate/missing accounting."""

    def __init__(self) -> None:
        self.pending = ""
        self.line_count = 0
        self.duplicate_count = 0
        self.rejected_count = 0
        self.interrupted = False
        self._seen_event_batches: set[tuple[tuple[str, str], ...]] = set()
        self._seen_event_batch_order: deque[tuple[tuple[str, str], ...]] = deque()
        self._required_seen: set[str] = set()

    def feed(self, chunk: bytes | str) -> list[dict[str, str]]:
        text = chunk.decode("utf-8", "replace") if isinstance(chunk, bytes) else chunk
        if not text:
            return []
        self.pending += text
        events: list[dict[str, str]] = []
        if len(self.pending) > MAX_PENDING_INPUT_CHARS:
            last_newline = self.pending.rfind("\n")
            self.pending = self.pending[last_newline + 1 :] if last_newline >= 0 else ""
            events.append({"event": "CAPTURE_BUFFER_OVERFLOW", "value": "DROPPED"})
        while "\n" in self.pending:
            line, self.pending = self.pending.split("\n", 1)
            line = line.rstrip("\r")
            self.line_count += 1
            line_events = extract_sanitized_line_events(line)
            if not line_events:
                continue
            if any(event["event"] == "CAPTURE_REJECTED" for event in line_events):
                self.rejected_count += 1
            batch = tuple((event["event"], event["value"]) for event in line_events)
            if batch in self._seen_event_batches:
                self.duplicate_count += 1
                events.append({"event": "CAPTURE_DUPLICATE_EVENT", "value": "DROPPED"})
                continue
            self._seen_event_batches.add(batch)
            self._seen_event_batch_order.append(batch)
            if len(self._seen_event_batch_order) > MAX_SEEN_EVENT_BATCHES:
                expired = self._seen_event_batch_order.popleft()
                self._seen_event_batches.discard(expired)
            for event in line_events:
                if event["event"] in REQUIRED_PRODUCER_EVENT_CLASSES:
                    self._required_seen.add(event["event"])
            events.extend(line_events)
        return events[:MAX_EVENTS_PER_LINE]

    def mark_interrupted(self) -> dict[str, str] | None:
        if not self.pending:
            return None
        self.pending = ""
        self.interrupted = True
        return {"event": "CAPTURE_INTERRUPTED", "value": "PARTIAL_LINE_DROPPED"}

    def summary(self) -> dict[str, object]:
        missing = [name for name in REQUIRED_PRODUCER_EVENT_CLASSES if name not in self._required_seen]
        terminal = "PASS" if not missing and not self.pending and not self.interrupted else "MISSING_EVIDENCE"
        return {
            "contract_version": COLLECTOR_CONTRACT_VERSION,
            "terminal": terminal,
            "missing_required": missing,
            "lines": self.line_count,
            "duplicates_dropped": self.duplicate_count,
            "rejected": self.rejected_count,
            "interrupted": self.interrupted,
            "reordered_input_tolerated": True,
        }


def backend_snapshot() -> dict[str, object]:
    remote = """set -eu
local=$(curl -fsS --max-time 8 -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/healthz || true)
public=$(curl -fsS --max-time 12 -o /dev/null -w '%{http_code}' https://orangepi5.tail6aabef.ts.net/healthz || true)
slate=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{.RestartCount}}|{{.Config.Image}}' slate-note4 2>/dev/null || true)
mysql=$(docker inspect --format '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}|{{.RestartCount}}|{{.Config.Image}}' slate-note4-mysql 2>/dev/null || true)
echo HEALTH=$local,$public
printf 'SLATE=%s\n' "$slate"
printf 'MYSQL=%s\n' "$mysql"
docker logs --since 8s slate-note4 2>&1 | grep -oE '(DEVICE_AUTHENTICATED_POLL_RESULT|VOICE_[A-Z0-9_]+|PROVIDER_[A-Z0-9_]+|BACKEND_[A-Z0-9_]+|BRIDGE_[A-Z0-9_]+|UI_[A-Z0-9_]+|HEAP_[A-Z0-9_]+|AUDIO_[A-Z0-9_]+|RESET_[A-Z0-9_]+|WATCHDOG_[A-Z0-9_]+|FIRST_MIC_FRAME_RECEIVED|LIVE_FAILURE_SOURCE|ACTIVE_CONNECT_GENERATION|ACTIVE_LISTEN_GENERATION|LISTENING_STATE_AT_FAILURE|LIVE_SESSION_PRESENT_AT_FAILURE|CONNECTING_PROMISE_PRESENT_AT_FAILURE|T_[A-Z0-9_]+|audio_(pkt_recv|pkt_gate_rejected|pkt_enqueued|decode_ok|decode_fail|player_write_ok|player_write_fail))=[A-Za-z0-9_.=-]+|frame marker phase=(server_current|requested|received|sync_result|active)( (ok|seq|frame_id_present|frame_id_match|frame_available)=[A-Za-z0-9_.=-]+)*|voice font marker( (artifact|fw|font|direct_descriptor|direct_bitmap|fallback|fallback_descriptor|fallback_bitmap)=[A-Za-z0-9_.+-]+)*|voice layout marker( (measured_width|final_width|final_height|text_chars)=[0-9]+)*|\\[slate\\] weather lifecycle marker stage=(db_mark_config_invalid|db_mark_fetch_error|db_clear_error_unchanged|db_clear_error_rendered|db_write_error|frontend_view) type=weather error_present=[01])' | sort -u || true
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
            voice.extend(extract_sanitized_line_events(line))
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

    # The producer contract is lower-case and intentionally differs from the
    # legacy uppercase key/value contract.  These seven fixtures are the
    # exact producer shapes used by the M01 regression packet.
    producer_fixtures = [
        "frame marker phase=server_current seq=2 frame_id_present=1 frame_id_match=match",
        "frame marker phase=requested seq=2 frame_id_present=1 frame_id_match=unknown",
        "frame marker phase=received seq=2 frame_id_present=1 frame_id_match=mismatch",
        "frame marker phase=sync_result ok=1 seq=2 frame_id_present=1 frame_id_match=match",
        "voice font marker artifact=voice_font_16+zfull_16 fw=fixture font=Voice_Font_16 direct_descriptor=1 direct_bitmap=1 fallback=Zfull_16 fallback_descriptor=1 fallback_bitmap=1",
        "voice layout marker measured_width=144 final_width=162 final_height=48 text_chars=6",
        "[slate] weather lifecycle marker stage=frontend_view type=weather error_present=0",
    ]
    fixture_events = [extract_producer_events(fixture) for fixture in producer_fixtures]
    assert all(events for events in fixture_events)
    assert {event["event"] for events in fixture_events for event in events} >= {
        "FRAME_MARKER",
        "VOICE_FONT_MARKER",
        "VOICE_LAYOUT_MARKER",
        "WEATHER_LIFECYCLE_MARKER",
    }
    assert extract_producer_events(
        "frame marker phase=server_current schema=1 device_id=private"
    ) == [{"event": "CAPTURE_REJECTED", "value": "UNAPPROVED_FIELD"}]
    assert extract_producer_events("voice layout marker marker_schema=1 measured_width=1") == [
        {"event": "CAPTURE_REJECTED", "value": "STALE_SCHEMA"}
    ]
    assert extract_producer_events("voice font marker transcript=must_not_escape") == [
        {"event": "CAPTURE_REJECTED", "value": "UNAPPROVED_FIELD"}
    ]

    # Fragmentation, reordering and exact duplicate handling are explicit and
    # bounded; duplicate producer lines do not become a false new event.
    capture = CaptureAccumulator()
    reordered = producer_fixtures[3:5] + producer_fixtures[:3] + producer_fixtures[5:]
    stream = "\n".join(reordered + [reordered[0]]) + "\n"
    first_half = stream[: len(stream) // 2].encode()
    second_half = stream[len(stream) // 2 :].encode()
    assert capture.feed(first_half)
    capture.feed(second_half)
    assert capture.duplicate_count == 1
    summary = capture.summary()
    assert summary["terminal"] == "PASS"
    assert summary["missing_required"] == []
    assert summary["reordered_input_tolerated"] is True
    bounded = CaptureAccumulator()
    for sequence in range(MAX_SEEN_EVENT_BATCHES + 32):
        bounded.feed(f"frame marker phase=server_current seq={sequence} frame_id_present=1\n")
    assert len(bounded._seen_event_batches) <= MAX_SEEN_EVENT_BATCHES
    assert len(bounded._seen_event_batch_order) <= MAX_SEEN_EVENT_BATCHES
    interrupted = CaptureAccumulator()
    interrupted.feed(b"frame marker phase=server_current")
    assert interrupted.mark_interrupted() == {
        "event": "CAPTURE_INTERRUPTED",
        "value": "PARTIAL_LINE_DROPPED",
    }
    assert interrupted.summary()["terminal"] == "MISSING_EVIDENCE"
    oversized = CaptureAccumulator()
    overflow_events = oversized.feed("x" * (MAX_PENDING_INPUT_CHARS + 1))
    assert {event["event"] for event in overflow_events} == {"CAPTURE_BUFFER_OVERFLOW"}
    assert oversized.summary()["terminal"] == "MISSING_EVIDENCE"
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

    # Backpressure, queue, turn, and reset markers
    new_marker_line = (
        "VOICE_TURN_INDEX=3 VOICE_TURN_START=YES VOICE_TURN_START_MS=1725800000300 "
        "BACKEND_OPERATION_QUEUE_DEPTH=0 BACKEND_PRE_PROVIDER_MIC_QUEUE_FRAMES=2 "
        "BACKEND_PRE_PROVIDER_MIC_QUEUE_BYTES=1920 VOICE_WS_BUFFERED_BYTES=0 "
        "VOICE_WS_SEND_BACKLOG_BYTES=0 BRIDGE_STDIO_WRITE_BACKLOG_BYTES=128 "
        "BRIDGE_STDIO_DRAIN_PENDING=NO UI_EVENT_QUEUE_WAITING=1 UI_EVENT_QUEUE_SPACES=63 "
        "HEAP_INTERNAL_FREE_BYTES=210000 HEAP_SPIRAM_FREE_BYTES=4194304 "
        "AUDIO_DECODE_QUEUE_LEN=0 AUDIO_SEND_QUEUE_LEN=0 AUDIO_PLAYBACK_QUEUE_LEN=1 "
        "RESET_REASON_CLASS=SW WATCHDOG_REASON_CLASS=NONE"
    )
    new_extracted = extract_voice_events(new_marker_line)
    new_map = {e["event"]: e["value"] for e in new_extracted}
    assert new_map["VOICE_TURN_INDEX"] == "3"
    assert new_map["VOICE_TURN_START"] == "YES"
    assert new_map["VOICE_TURN_START_MS"] == "1725800000300"
    assert new_map["BACKEND_OPERATION_QUEUE_DEPTH"] == "0"
    assert new_map["BACKEND_PRE_PROVIDER_MIC_QUEUE_FRAMES"] == "2"
    assert new_map["BACKEND_PRE_PROVIDER_MIC_QUEUE_BYTES"] == "1920"
    assert new_map["VOICE_WS_BUFFERED_BYTES"] == "0"
    assert new_map["VOICE_WS_SEND_BACKLOG_BYTES"] == "0"
    assert new_map["BRIDGE_STDIO_WRITE_BACKLOG_BYTES"] == "128"
    assert new_map["BRIDGE_STDIO_DRAIN_PENDING"] == "NO"
    assert new_map["UI_EVENT_QUEUE_WAITING"] == "1"
    assert new_map["UI_EVENT_QUEUE_SPACES"] == "63"
    assert new_map["HEAP_INTERNAL_FREE_BYTES"] == "210000"
    assert new_map["HEAP_SPIRAM_FREE_BYTES"] == "4194304"
    assert new_map["AUDIO_DECODE_QUEUE_LEN"] == "0"
    assert new_map["AUDIO_SEND_QUEUE_LEN"] == "0"
    assert new_map["AUDIO_PLAYBACK_QUEUE_LEN"] == "1"
    assert new_map["RESET_REASON_CLASS"] == "SW"
    # Verify RESET_REASON_CLASS with known values including deliberate UNKNOWN fallback
    assert extract_voice_events("RESET_REASON_CLASS=UNKNOWN") == [
        {"event": "RESET_REASON_CLASS", "value": "UNKNOWN"}
    ]
    assert extract_voice_events("RESET_REASON_CLASS=POWERON") == [
        {"event": "RESET_REASON_CLASS", "value": "POWERON"}
    ]
    assert extract_voice_events("RESET_REASON_CLASS=PANIC") == [
        {"event": "RESET_REASON_CLASS", "value": "PANIC"}
    ]

    # Verify rejection of unsanitized/invalid values for new markers
    assert extract_voice_events("RESET_REASON_CLASS=UNKNOWN_ARBITRARY") == []
    assert extract_voice_events("RESET_REASON_CLASS=RANDOM_CRASH_INFO") == []
    assert extract_voice_events("WATCHDOG_REASON_CLASS=CRASH_LOG") == []
    assert extract_voice_events("UI_EVENT_QUEUE_WAITING=-1") == []
    assert extract_voice_events("UI_EVENT_QUEUE_WAITING=12abc") == []
    assert extract_voice_events("BRIDGE_STDIO_DRAIN_PENDING=MAYBE") == []
    assert extract_voice_events("VOICE_TURN_START=TRUE") == []

    # Verify DEVICE_AUTHENTICATED_POLL_RESULT accepts exact PASS marker only
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=PASS") == [
        {"event": "DEVICE_AUTHENTICATED_POLL_RESULT", "value": "PASS"}
    ]
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=FAIL") == []
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=REJECT") == []
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=PASS_EXTRA") == []
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=PASSWORD") == []
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=2xx") == []
    assert extract_voice_events("DEVICE_AUTHENTICATED_POLL_RESULT=") == []
    assert extract_voice_events("PREFIX_DEVICE_AUTHENTICATED_POLL_RESULT=PASS") == []

    # Verify privacy preservation: no device ID, MAC, token, or payload retention
    poll_leak_line = (
        "DEVICE_AUTHENTICATED_POLL_RESULT=PASS "
        "deviceId=device-123 mac=AA:BB:CC:DD:EE:FF ip=192.168.1.1 ssid=HomeWiFi "
        "token=secret_device_token payload=sensitive_content"
    )
    poll_extracted = extract_voice_events(poll_leak_line)
    assert poll_extracted == [{"event": "DEVICE_AUTHENTICATED_POLL_RESULT", "value": "PASS"}]
    poll_dumped = json.dumps(poll_extracted)
    assert "device-123" not in poll_dumped
    assert "AA:BB:CC:DD:EE:FF" not in poll_dumped
    assert "192.168.1.1" not in poll_dumped
    assert "HomeWiFi" not in poll_dumped
    assert "secret_device_token" not in poll_dumped
    assert "sensitive_content" not in poll_dumped

    print(f"slate-m4-sanitized-observer-v2 {COLLECTOR_CONTRACT_VERSION}: PASS")
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
    capture = CaptureAccumulator()
    last_backend = 0.0
    started = time.monotonic()
    print(
        json.dumps(
            {
                "observer": "ARMED",
                "contract_version": COLLECTOR_CONTRACT_VERSION,
                "serial_port": args.port,
                "raw_content": "NOT_RETAINED",
            }
        ),
        flush=True,
    )
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
                interrupted = capture.mark_interrupted()
                if interrupted:
                    print(json.dumps({"events": [interrupted]}, sort_keys=True), flush=True)
                device.close()
                device = None
                print(json.dumps({"observer": "SERIAL_DISCONNECTED"}), flush=True)
                continue
            if raw:
                line = raw.decode("utf-8", "replace")
                for name, pattern in SERIAL_MARKERS.items():
                    if pattern.search(line):
                        counts[name] += 1
                events = capture.feed(raw)
                if events:
                    print(json.dumps({"serial_line_count": capture.line_count, "events": events}, sort_keys=True), flush=True)
            now = time.monotonic()
            if now - last_backend >= args.interval:
                last_backend = now
                print(json.dumps({"serial_counts": {"lines": capture.line_count, **counts}}, sort_keys=True), flush=True)
                print(json.dumps({"backend": backend_snapshot()}, sort_keys=True), flush=True)
    except KeyboardInterrupt:
        pass
    finally:
        if device is not None:
            device.close()
        interrupted = capture.mark_interrupted()
        if interrupted:
            print(json.dumps({"events": [interrupted]}, sort_keys=True), flush=True)
        print(
            json.dumps(
                {
                    "observer": "STOPPED",
                    "serial_counts": {"lines": capture.line_count, **counts},
                    "capture_summary": capture.summary(),
                },
                sort_keys=True,
            ),
            flush=True,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
