#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

test -n "$(grep -F 'manifest_content_id' "$ROOT_DIR/main/storage/cache/cache.h")"
test -n "$(grep -F 'manifest_content_id' "$ROOT_DIR/main/storage/cache/cache_frames.cc")"
test -n "$(grep -F 'phase=requested' "$ROOT_DIR/main/sync/sync_poll.cc")"
test -n "$(grep -F 'phase=received' "$ROOT_DIR/main/sync/sync_manifest.cc")"
test -n "$(grep -F 'phase=active' "$ROOT_DIR/main/scenes/frame/frame_scene.cc")"
test -n "$(grep -F 'phase=active' "$ROOT_DIR/main/scenes/bg_refresh/bg_refresh_scene.cc")"
test -n "$(grep -F 'phase=sync_result' "$ROOT_DIR/main/sync/sync_poll.cc")"

if grep -R 'frame marker.*status_bar_text' "$ROOT_DIR/main/sync" "$ROOT_DIR/main/scenes"; then
  echo 'FAIL: frame marker exposed frame content' >&2
  exit 1
fi

if grep -R -E 'frame marker.*frame_id=' "$ROOT_DIR/main/sync" "$ROOT_DIR/main/scenes"; then
  echo 'FAIL: frame marker exposed a raw frame ID' >&2
  exit 1
fi

test -z "$(grep -R -E 'frame marker.*(manifest_content_id|content_etag|image_etag|audio_etag)' "$ROOT_DIR/main/sync" "$ROOT_DIR/main/scenes")"
for source in "$ROOT_DIR/main/sync/sync_manifest.cc" "$ROOT_DIR/main/sync/sync_poll.cc" \
  "$ROOT_DIR/main/scenes/frame/frame_scene.cc" "$ROOT_DIR/main/scenes/bg_refresh/bg_refresh_scene.cc"; do
  grep -F 'frame_id_present=' "$source" >/dev/null
  grep -F 'frame_id_match=' "$source" >/dev/null
done

echo 'run_sanitized_frame_markers_test: PASS'
