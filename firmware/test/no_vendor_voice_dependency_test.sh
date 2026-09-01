#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRODUCTION_DIR="$ROOT_DIR/main"

# The old vendor activation client must not be part of the production source
# tree. Keep the forbidden markers here only as test data; the scan is limited
# to firmware/main and therefore cannot pass because of this test itself.
if rg -n --glob '*.{cc,h}' -- 'api[.]tenclass[.]net|ActivationClient|ActivationConfigResult|kAwaitingActivation|activation_client' "$PRODUCTION_DIR"; then
    echo "forbidden vendor voice activation dependency found" >&2
    exit 1
fi

rg -n --glob '*.{cc,h}' -- 'SlateVoiceConfigClient|GetVoiceConfig|/api/v1/voice/websocket' "$PRODUCTION_DIR" >/dev/null
echo "vendor voice activation dependency test passed"
