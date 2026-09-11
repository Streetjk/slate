#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCENE="$ROOT_DIR/main/scenes/xiaozhi/xiaozhi_scene.cc"

test -n "$(grep -F 'LogVoiceFontSelection' "$SCENE")"
test -n "$(grep -F 'font=Voice_Font_16' "$SCENE")"
test -n "$(grep -F 'direct_descriptor=' "$SCENE")"
test -n "$(grep -F 'direct_bitmap=' "$SCENE")"
test -n "$(grep -F 'fallback_descriptor=' "$SCENE")"
test -n "$(grep -F 'fallback_bitmap=' "$SCENE")"
test -n "$(grep -F 'voice layout marker' "$SCENE")"
test -n "$(grep -F '"voice_font_16+zfull_16"' "$SCENE")"
test "$(grep -cF 'ESP_LOG_LEVEL' "$SCENE")" -eq 0

if grep -Eq 'voice font marker.*(display_text|transcript|content|device)' "$SCENE"; then
  echo 'FAIL: voice font marker retained transcript text' >&2
  exit 1
fi

if grep -F 'voice font marker missing_codepoint=0x%04lX' "$SCENE" >/dev/null; then
  test "$(grep -cF 'ESP_LOGW(kTag, "voice font marker missing_codepoint=0x%04lX",' "$SCENE")" -eq 1
  test "$(grep -cF 'voice font marker missing_codepoint=0x%04lX' "$SCENE")" -eq 1
fi

echo 'run_sanitized_voice_font_marker_test: PASS'
