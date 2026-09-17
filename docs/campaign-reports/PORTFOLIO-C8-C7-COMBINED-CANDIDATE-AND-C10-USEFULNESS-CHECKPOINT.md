# Portfolio C8+C7 combined candidate and C10 usefulness checkpoint

Date: 2026-09-10 (Australia/Perth)

## Reconciled live state

At the start of this checkpoint, GitHub was independently reconciled as follows:

```text
PR1_HEAD=641e358f7067d7e314e4f2c1eb18258690268cab
PR1_STATE=OPEN
PR1_DRAFT=YES
PR1_MERGED=NO
PR2_HEAD=42f24492559b854dad83791a181706696b66770b
PR2_STATE=OPEN
PR2_DRAFT=YES
PR2_MERGED=NO
PR3_HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
PR3_STATE=OPEN
PR3_DRAFT=YES
PR3_MERGED=NO
PR4_HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
PR4_STATE=OPEN
PR4_DRAFT=YES
PR4_MERGED=NO
```

The running deployment was not changed. The sanitized observer remained armed
and connected; its structural snapshots continued to show the accepted
`slate:m4-c7-c8-combined-8fcf7c6` backend, healthy Slate/MySQL, unchanged
restart counters, and healthy local/public checks. No provider call, firmware
operation, physical action, OAuth action, credential action, or data-authority
change was performed.

## Post-physical C8+C7 candidate

The candidate was formed on the live accepted C8 branch lineage. The C7 repair
delta was applied path-by-path and applied cleanly.

```text
COMBINED_BASE=42f24492559b854dad83791a181706696b66770b
ACCEPTED_INTEGRATION_ANCESTOR=c797cc44842fd598c64dacd22606493890ed9730
C8_REPAIR_PARENT=6d0b7f274e36872f5f70c89e4ff7f26746714378
C7_REPAIR_PARENT=641e358f7067d7e314e4f2c1eb18258690268cab
C8_C7_OVERLAP_FILES=NONE
CONFLICT_FILES=NONE
CONFLICT_RESOLUTION=NONE_CLEAN_PATH_SPECIFIC_APPLICATION
C8_ASSISTANT_REPAIR_PRESENT=YES_EXACT_RUNTIME_FILE_MATCH
C7_OUTLOOK_REPAIR_PRESENT=YES
C7_WMO_REPAIR_PRESENT=YES
FIRMWARE_CHANGED=NO
```

The only additional change beyond the reviewed C7 delta is a test-local Bun
legacy-decorator shim in `outlook.controller.test.ts`. It avoids importing
Nest route metadata while unit-testing controller method behavior; it does not
change production runtime bytes or route metadata.

```text
POSTPHYSICAL_COMBINED_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
POSTPHYSICAL_COMBINED_TAG=slate:m4-postphysical-c8-c7-d26efe2
POSTPHYSICAL_COMBINED_ARM64_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
POSTPHYSICAL_COMBINED_BUILD=PASS
POSTPHYSICAL_COMBINED_ARCH=linux/arm64
```

The exact source commit and image have not been deployed.

## Validation and review

Focused combined tests passed:

```text
BACKEND_FOCUSED=70_PASS_0_FAIL
FRONTEND_FOCUSED=11_PASS_0_FAIL
```

The full backend run exercised 432 tests and reported 423 pass, 5 skip, and
the same 4 pre-existing Bun/Nest decorator metadata errors plus 1 related
decorator metadata error seen on the unchanged C8 baseline (baseline: 411
tests, 402 pass, 5 skip, 4 fail, 5 errors). The failures are in unrelated
controller/decorator tests and are not introduced by this candidate. All
candidate-focused tests pass.

```text
FRONTEND_BUILD=PASS
ROOT_TYPECHECK=PASS
ROOT_LINT=PASS
ROOT_FORMAT_CHECK=PASS
GIT_DIFF_CHECK=PASS
PRIVACY_SECRET_SCAN=PASS_NO_CREDENTIAL_MATERIAL
IMAGE_HISTORY_SECRET_CHECK=PASS_NO_SECRET_CONTENT
```

The generic scan's only matches were intentional test redaction canaries and
the production error-redaction regex itself; no credential, token, auth
header, cookie, private key, provider payload, or private data was added.

Fresh exact independent review was performed with the canonical reviewer:

```text
REVIEWER=grok_-m_grok-4.6
COMBINED_REVIEW=PASS
P0=0
P1=0
P2=0
SECURITY=0
```

The review covered the exact candidate bytes, C8 transcript timing and
generation safety, neutral bilingual session setup without Gemini 2.5
`languageCodes`, Outlook navigation-or-visible-error behavior and read-only
scope, WMO-to-asset semantics, unknown fallback, and regression risk.

## C10 supported local usage-surface exhaustion

Only help/version/status surfaces were inspected. No credential file, cookie,
private endpoint, model request, or billable refresh was used.

```text
CODEX_CLI_VERSION=codex-cli_0.153.4
CODEX_STATUS_SURFACE=NO_STATUS_SUBCOMMAND;TOP_LEVEL_HELP_ONLY
CODEX_APP_SERVER_OR_RPC_USAGE_SURFACE=APP_SERVER_HELP_ONLY_NO_USAGE_SURFACE_VERIFIED
CODEX_SESSION_TOKEN_USAGE_AVAILABLE=NO_VERIFIED_MACHINE_READABLE_VALUE
CODEX_SUBSCRIPTION_WINDOW_USAGE_AVAILABLE=NO_VERIFIED_MACHINE_READABLE_VALUE
CODEX_RESET_AT_AVAILABLE=NO_VERIFIED_MACHINE_READABLE_VALUE
CODEX_SELECTED_SOURCE=VERSION_ONLY;USAGE_UNAVAILABLE

AGY_VERSION=1.2.0
AGY_SUPPORTED_USAGE_OR_QUOTA_SURFACE=NO_USAGE_STATUS_OR_QUOTA_SUBCOMMAND_EXPOSED_BY_HELP
AGY_SESSION_TOKEN_USAGE_AVAILABLE=NO_VERIFIED_MACHINE_READABLE_VALUE
AGY_QUOTA_USAGE_AVAILABLE=NO_VERIFIED_MACHINE_READABLE_VALUE
GEMINI_CLI_VERSION=0.47.0_PACKAGE_PRESENT
GEMINI_STATS_MODEL_SURFACE=NO_NONINTERACTIVE_HELP_OR_STATS_VALUE_VERIFIED;CLI_HELP_TIMED_OUT
AGY_GEMINI_SELECTED_SOURCE=VERSION_ONLY;USAGE_UNAVAILABLE

GROK_VERSION=1.0.24
GROK_USAGE_SURFACE=SUPPORTED_LOCAL_USAGE_COMMAND_REQUIRES_SESSION_ID
GROK_SESSION_TOKEN_USAGE_AVAILABLE=NO_CURRENT_VALUE_VERIFIED
GROK_SUBSCRIPTION_WINDOW_USAGE_AVAILABLE=NO
GROK_RESET_AT_AVAILABLE=NO
GROK_SELECTED_SOURCE=VERSION_ONLY;SESSION_USAGE_NOT_CONSUMED
```

The C10 usefulness threshold is not met: no provider has a verified supported
local subscription-window metric or current-session metric that can be shown
without an unsafe or billable flow. C10 therefore remains isolated and is not
joined to the next deployment.

```text
C10_USEFULNESS_THRESHOLD_MET=NO
C10_JOIN_NEXT_DEPLOYMENT=NO
C10_JOIN_REASON=SUPPORTED_LOCAL_METRICS_NOT_PROVEN;VERSION_ONLY_CARDS_REMAIN_UNAVAILABLE;KEEP_C8_C7_ACCEPTANCE_UNBLOCKED
C10_CODEX_SELECTED_SOURCE=VERSION_ONLY;UNAVAILABLE_METRICS
C10_AGY_GEMINI_SELECTED_SOURCE=VERSION_ONLY;UNAVAILABLE_METRICS
C10_GROK_SELECTED_SOURCE=VERSION_ONLY;UNAVAILABLE_METRICS
C10_CREDENTIALS_COPIED=NO
C10_BROWSER_COOKIES_USED=NO
C10_BILLABLE_REFRESH_CALLS=NO
C10_TEST_STATUS=PASS_AT_e9a6cfac86c63cb461a62d5029080332fac06865
C10_REVIEW_STATUS=PASS_GROK_4_6_SECURITY_FOCUSED_P0_0_P1_0_P2_0_SECURITY_0
C10_DEPLOYED=NO
```

## Durable frontier

The running backend remains unchanged. The exact combined C8+C7 candidate is
qualified and reviewed but awaits the separate deployment and one physical
acceptance authority expressly excluded from this checkpoint. C10 remains a
separate reviewed draft awaiting its own deployment authority. Campaign 9 is
parked research-only.

```text
FINAL_NEXT_DEPLOYMENT_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
FINAL_NEXT_DEPLOYMENT_TAG=slate:m4-postphysical-c8-c7-d26efe2
FINAL_NEXT_DEPLOYMENT_ARM64_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
FINAL_NEXT_DEPLOYMENT_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
C8_C7_DEPLOYMENT_REQUIRED=YES
C8_C7_PHYSICAL_RETEST_REQUIRED=YES_AFTER_AUTHORIZED_DEPLOYMENT

PORTFOLIO_READY_NODE_COUNT=0
PORTFOLIO_READONLY_READY_NODE_COUNT=0
PORTFOLIO_WAITING_DEVICE_COUNT=0
PORTFOLIO_WAITING_HUMAN_COUNT=2
PORTFOLIO_EXTERNALLY_BLOCKED_COUNT=0
PORTFOLIO_HUMAN_ACTION_REQUIRED=YES
PORTFOLIO_HUMAN_ACTION_REASON=EXACT_COMBINED_C8_C7_BACKEND_DEPLOYMENT_AND_ONE_NOTE4_PHYSICAL_ACCEPTANCE_AUTHORITY;SEPARATE_C10_DEPLOYMENT_AUTHORITY
PORTFOLIO_TERMINAL_REASON=SAFE_COMBINATION_VALIDATION_BUILD_REVIEW_AND_C10_SURFACE_DISCOVERY_EXHAUSTED_AT_EXPLICIT_AUTHORITY_BOUNDARIES
PORTFOLIO_NEXT_ACTION=AWAIT_EXACT_COMBINED_C8_C7_DEPLOYMENT_AND_ONE_NOTE4_ACCEPTANCE_AUTHORITY;KEEP_C10_SEPARATE
```

No PR was merged or released. PR #1, #2, #3 and #4 remain OPEN / DRAFT /
UNMERGED.
