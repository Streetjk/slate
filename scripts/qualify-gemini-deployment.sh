#!/usr/bin/env bash
set -euo pipefail

# Fail-closed deployment/configuration qualification check for approved GEMINI_* runtime configuration.
# Reports key names and status only, never values or secret payloads.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if command -v bun >/dev/null 2>&1; then
    exec bun run "$BACKEND_DIR/src/modules/assistant/gemini-deployment-qualification.ts" "$@"
elif command -v node >/dev/null 2>&1; then
    exec node -e "
        import('$BACKEND_DIR/src/modules/assistant/gemini-deployment-qualification.ts')
            .catch(() => process.exit(1));
    " "$@"
else
    echo "GEMINI_CONFIG_QUALIFICATION=FAIL" >&2
    echo "ERROR: neither bun nor node found for qualification runner" >&2
    exit 1
fi
