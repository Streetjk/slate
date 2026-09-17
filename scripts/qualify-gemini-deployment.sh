#!/usr/bin/env bash
set -euo pipefail

# Fail-closed deployment/configuration qualification check for approved GEMINI_* runtime configuration.
# Reports key names and status only, never values or secret payloads.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if command -v bun >/dev/null 2>&1; then
    exec bun run "$BACKEND_DIR/src/modules/assistant/gemini-deployment-qualification.ts" "$@"
else
    echo "GEMINI_CONFIG_QUALIFICATION=FAIL" >&2
    echo "ERROR: bun not found for qualification runner" >&2
    exit 1
fi
