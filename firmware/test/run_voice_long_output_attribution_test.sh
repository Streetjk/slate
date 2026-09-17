#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVICE="$ROOT_DIR/firmware/main/xiaozhi/service/xiaozhi_service.cc"
AUDIO="$ROOT_DIR/firmware/main/xiaozhi/service/audio_service.cc"
EVENTS="$ROOT_DIR/firmware/main/events/event_bus.cc"
MODEL="$ROOT_DIR/firmware/test/voice_long_output_attribution_host_test.cc"
BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/slate-voice-attribution.XXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT HUP INT TERM

python3 - "$SERVICE" "$AUDIO" "$EVENTS" <<'PY'
import pathlib
import re
import sys

service = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
audio = pathlib.Path(sys.argv[2]).read_text(encoding="utf-8")
events = pathlib.Path(sys.argv[3]).read_text(encoding="utf-8")

def require(text, pattern, label):
    if not re.search(pattern, text, re.S):
        raise SystemExit(f"FAIL: production contract missing {label}")

# Bind the host stress to the exact production rearm ordering and predicates.
require(service, r"if \(pending_listen_after_playback_\.load\(std::memory_order_relaxed\) && audio_->WaitForPlaybackQueueEmpty\(0\)\)\s*\{.*?active_protocol->SendStartListening\(ListeningMode::kAutoStop\);\s*pending_listen_after_playback_\.store\(false, std::memory_order_relaxed\);\s*audio_->EnableVoiceProcessing\(true\)", "pending->drain->start-listening->voice-processing order")
require(service, r"case IncomingMessageKind::kTtsStop:.*?pending_listen_after_playback_\.store\(true", "TTS stop pending-listen transition")
require(service, r"case IncomingMessageKind::kTtsStart:.*?pending_listen_after_playback_\.store\(false.*?EnableVoiceProcessing\(false\)", "TTS start disables voice processing")

wait_start = audio.find("bool AudioService::WaitForPlaybackQueueEmpty")
wait_end = audio.find("size_t AudioService::DecodeQueueSize", wait_start)
wait_body = audio[wait_start:wait_end]
require(wait_body, r"decode_queue_\.empty\(\).*?playback_queue_\.empty\(\).*?!decode_active_.*?!playback_active_", "playback drain includes queues and active flags")
if re.search(r"encode_queue_|send_queue_", wait_body):
    raise SystemExit("FAIL: playback-only rearm predicate unexpectedly widened to transport queues")
require(audio, r"bool AudioService::IsIdle\(\).*?encode_queue_\.empty\(\).*?decode_queue_\.empty\(\).*?playback_queue_\.empty\(\).*?send_queue_\.empty\(\)", "full audio idle predicate")
require(audio, r"kMaxPlaybackTasks\s*=\s*2", "playback queue bound")
require(audio, r"kMaxDecodePackets\s*=", "decode queue bound")
require(audio, r"kMaxSendPackets\s*=", "send queue bound")
require(events, r"kQueueLen\s*=\s*64", "UI event queue capacity")
require(events, r"s_xiaozhi_changed_pending\.exchange\(true.*?Post\(e, timeout\)", "coalesced UI event pending/drop behavior")
require(service, r"PostCoalesced\(UiEventKind::kXiaozhiChanged", "production Xiaozhi change coalescing")
print("voice_long_output_attribution_static_contract: PASS")
PY

"${CXX:-c++}" -std=c++17 -Wall -Wextra -Werror "$MODEL" -o "$BUILD_DIR/voice_long_output_attribution_host_test"
"$BUILD_DIR/voice_long_output_attribution_host_test"
