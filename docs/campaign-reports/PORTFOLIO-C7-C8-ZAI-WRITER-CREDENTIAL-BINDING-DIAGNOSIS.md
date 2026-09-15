# C7/C8 Z.ai implementation-writer credential binding diagnosis

Date: 2026-09-12 (Australia/Perth)

## Live boundary

The exact live PR #2 frontier reports that the mandated implementation writer route:

```text
PROVIDER=Z.AI
MODEL=glm-5.3-flash
```

fails authentication before model execution. The current evidence does not prove whether the credential itself is invalid, whether the writer route reads a different credential source, whether a wrapper/env binding is stale, or whether the client process must be reloaded.

Do not ask the operator to rotate or replace a credential blindly.

## Required safe diagnosis

Use controller-local inspection only. Never print, echo, log, hash, fingerprint, copy, commit, or otherwise expose credential contents.

Mechanically inspect the exact implementation-writer launch path and publish only sanitized structural facts:

```text
ZAI_WRITER_ROUTE_FOUND=YES|NO
ZAI_WRITER_ROUTE_LOCATION_CLASS=PROJECT_LOCAL|USER_CONFIG|ENVIRONMENT|WRAPPER_SCRIPT|OTHER|UNKNOWN
ZAI_WRITER_CREDENTIAL_SOURCE_CLASS=FILE|ENV_VAR|KEYCHAIN|WRAPPER_INJECTION|OTHER|UNKNOWN
ZAI_WRITER_CREDENTIAL_SOURCE_PATH_CLASS=<path class or UNKNOWN; no secret-bearing content>
ZAI_WRITER_CREDENTIAL_SOURCE_ENV_NAME=<name only or UNKNOWN>
ZAI_WRITER_CREDENTIAL_SOURCE_PRESENT=YES|NO|UNKNOWN
ZAI_WRITER_PROCESS_REQUIRES_RELOAD=YES|NO|UNKNOWN
ZAI_WRITER_PROCESS_RELOADED=YES|NO
ZAI_WRITER_ENDPOINT_MODEL_BINDING_MATCH=YES|NO|UNKNOWN
ZAI_WRITER_AUTH_PREFLIGHT_RESULT=PASS|FAIL|UNKNOWN
ZAI_WRITER_AUTH_FAILURE_CLASS=INVALID_OR_EXPIRED|SOURCE_NOT_LOADED|SOURCE_MISMATCH|ENDPOINT_OR_PROFILE_MISMATCH|PROVIDER_REJECTION|NETWORK|OTHER|UNKNOWN
ZAI_WRITER_OPERATOR_ACTION_REQUIRED=YES|NO
ZAI_WRITER_OPERATOR_ACTION_REASON=
```

Do not include token values, prefixes/suffixes, lengths, checksums, hashes, fingerprints, account identifiers, raw HTTP auth payloads, or private provider responses.

## Decision tree

1. If the writer route is bound to an existing credential source that is present but the process has not reloaded it, safely reload/restart only the writer/client shell or process required to consume the existing source. Do not restart Slate, MySQL, NOTE4, networking, or unrelated services.

2. If the writer route points to a different existing source than the one the operator expects, identify only the source class/path or env-var name and stop at the smallest exact operator action needed to update that existing source. Do not create a new credential source.

3. If the correct existing credential is loaded but the provider rejects it, classify the failure as far as safely possible without exposing provider-private response content. Do not silently change model, endpoint, provider, billing, account, or credential type.

4. If endpoint/profile/model binding is wrong while the intended existing route is already authorized, repair only the local binding needed to use the already-approved `Z.AI / glm-5.3-flash` route. Do not substitute another GLM model or provider.

5. Only after a sanitized auth preflight succeeds, resume the previously prepared combined implementation package:

- BTC default/consolidation to exactly one Weekly 7-day tile;
- privacy-safe Calendar frame identity/sync markers;
- privacy-safe Weather error lifecycle markers;
- privacy-safe LVGL/font/codepoint/layout markers for the Japanese missing-square boundary.

Implementation remains:

```text
CONTROLLER=CODEX_CLI
IMPLEMENTATION_WRITER=Z.ai glm-5.3-flash
CANONICAL_REVIEWER=grok -m grok-4.6
```

Then run deterministic qualification, impacted typecheck/lint/format/build, firmware build if required, privacy/secret scan, `git diff --check`, exact artifact freeze and fresh canonical Grok 4.6 review.

Do not deploy, flash, repeat physical testing, configure Microsoft OAuth, call Gemini qualification, mutate MySQL unnecessarily, reopen C9, deploy C10, merge or release under this diagnosis authority.

Keep PR #1, #2, #3 and #4 OPEN / DRAFT / UNMERGED.

## Required frontier publication

Before exit publish:

```text
PORTFOLIO_CURRENT_HEAD=
ZAI_WRITER_ROUTE_FOUND=
ZAI_WRITER_CREDENTIAL_SOURCE_CLASS=
ZAI_WRITER_CREDENTIAL_SOURCE_PRESENT=
ZAI_WRITER_PROCESS_REQUIRES_RELOAD=
ZAI_WRITER_PROCESS_RELOADED=
ZAI_WRITER_ENDPOINT_MODEL_BINDING_MATCH=
ZAI_WRITER_AUTH_PREFLIGHT_RESULT=
ZAI_WRITER_AUTH_FAILURE_CLASS=
ZAI_WRITER_OPERATOR_ACTION_REQUIRED=
ZAI_WRITER_OPERATOR_ACTION_REASON=
BTC_REPAIR_SOURCE=
C7_MONTH_CALENDAR_INSTRUMENTATION_SOURCE=
C7_WEATHER_INSTRUMENTATION_SOURCE=
C8_GLYPH_INSTRUMENTATION_SOURCE=
READY_NODE_COUNT=
READONLY_READY_NODE_COUNT=
WAITING_DEVICE_COUNT=
WAITING_HUMAN_COUNT=
EXTERNALLY_BLOCKED_COUNT=
CURRENT_BLOCKED_NODE=
HUMAN_ACTION_REQUIRED=
HUMAN_ACTION_REASON=
TERMINAL_REASON=
NEXT_ACTION=
```
