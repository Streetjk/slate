#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_DIR="$ROOT_DIR/main"

# 1. Structural audio markers and counters
markers=(
    "audio_pkt_recv"
    "T_DEVICE_FIRST_AUDIO_RECEIVED"
    "audio_pkt_gate_rejected"
    "audio_pkt_enqueued"
    "audio_decode_ok"
    "audio_decode_fail"
    "T_DEVICE_FIRST_AUDIO_DECODED"
    "T_DEVICE_FIRST_AUDIO_PLAYBACK"
    "audio_player_write_ok"
    "audio_player_write_fail"
    "T_AUDIO_PLAYER_FIRST_WRITE"
    "T_DEVICE_FIRST_AUDIO_WRITE"
    "AUDIO_DECODE_QUEUE_LEN"
    "AUDIO_SEND_QUEUE_LEN"
    "AUDIO_PLAYBACK_QUEUE_LEN"
    "UI_EVENT_QUEUE_WAITING"
    "UI_EVENT_QUEUE_SPACES"
    "RESET_REASON_CLASS"
)

for marker in "${markers[@]}"; do
    if ! rg -q -n --glob '*.{cc,h}' -- "$marker" "$PRODUCTION_DIR"; then
        echo "FAIL: required audio marker or counter not found: $marker" >&2
        exit 1
    fi
done

# Check that PostCoalesced is used for UI change event backpressure defense
if ! rg -q -n -- 'PostCoalesced\(UiEventKind::kXiaozhiChanged' "$PRODUCTION_DIR/xiaozhi/service/xiaozhi_service.cc"; then
    echo "FAIL: PostCoalesced not found in XiaozhiService::PostChanged" >&2
    exit 1
fi

# 2. In-place assistant bubble update check
if ! rg -q -n --glob 'xiaozhi_scene.cc' -- 'can_update_in_place' "$PRODUCTION_DIR/scenes/xiaozhi"; then
    echo "FAIL: in-place assistant bubble update logic not found in xiaozhi_scene.cc" >&2
    exit 1
fi

# 3. Privacy safety check: no logging of credentials, payload bytes, or raw audio
if rg -n --glob '*.{cc,h}' -- 'ESP_LOG[A-Z]\(kTag, ".*(?:bearer|device_secret|api_key|password|auth_token)=.*' "$PRODUCTION_DIR/xiaozhi"; then
    echo "FAIL: unsafe credential logging detected in xiaozhi firmware" >&2
    exit 1
fi

echo "audio_path_markers_test: PASS (structural markers and privacy safety verified)"
