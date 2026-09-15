# Portfolio C8 Grok second bounded retry and P2 repair result

Date: 2026-09-11 (Australia/Perth)

## Reconciled live state at entry

```text
PR1=OPEN;DRAFT;UNMERGED;HEAD=641e358f7067d7e314e4f2c1eb18258690268cab
PR2=OPEN;DRAFT;UNMERGED;HEAD=4824fecf301ee451f0dcbfdb27eaf01d25fb4495
PR3=OPEN;DRAFT;UNMERGED;HEAD=61700ea8c5b7755aa39259a45554289ca01ff700
PR4=OPEN;DRAFT;UNMERGED;HEAD=e9a6cfac86c63cb461a62d5029080332fac06865
```

The product runtime was not deployed, restarted, flashed, or connected to a
provider during this work. No credentials, OAuth, billing, device, Wi-Fi,
private Calendar/Outlook data, merge or release action was performed.

## Authorized second review

The exact frozen candidate and harness gates were verified before the
authorized review:

```text
SOURCE=553ad71932a8036a6f6dfe34794052eb4e573b10
ARM64_IMAGE=sha256:23363b7c54c4dbce27d2a223f637551b245a206dca8befc567f895af02ddf9c4
PRODUCT_DRIFT_FROM_SOURCE=0
HARNESS_TESTS=5_PASS
HARNESS_SHELL_FREE=YES
HARNESS_TOOL_WEB_DENIAL=YES
HARNESS_SINGLE_VERDICT_PARSER=YES_FAIL_CLOSED
HARNESS_MAX_TURNS=2
HARNESS_TIMEOUT_MS=300000
```

The one authorized second review returned a terminal finding:

```text
VERDICT=REVISE
P0=0
P1=0
P2=1
SECURITY=0
```

The exact P2 was that Open-Meteo fallback selection could persist
`provider=open_meteo` without latitude/longitude, causing every refresh to
fail when search fallback data was selected.

## Repair and qualification

AGY `gemini-3.8-flash-high` implemented the minimum repair: shared Weather
configuration now rejects coordinate-less Open-Meteo values, while frontend
fallback selection resolves to QWeather and clears stale Open-Meteo
coordinates. Coordinate-bearing remote Open-Meteo selection remains intact.

```text
REPAIRED_SOURCE=bdfbcc86e7b7e4c7ae49b9ee10469658fc854885
REPAIRED_ARM64_IMAGE=sha256:f1a33bc31e6c44a0a5d1bf803e453f5ea3ec903e9e9972247e61d84b3e0693ce
REPAIRED_IMAGE_PLATFORM=linux/arm64
FRONTEND_TESTS=19_PASS
FOCUSED_BACKEND_WEATHER_TESTS=9_PASS
FULL_BACKEND_TESTS=422_PASS;5_SKIP;0_FAIL
TYPECHECK=PASS
LINT=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
ADDED_LINES_SECRET_SCAN=PASS
GIT_DIFF_CHECK=PASS
```

The first post-repair review invocation failed closed without a verdict because
the evidence package still caused the CLI to retrieve a truncated prompt under
the two-turn ceiling. Session metadata showed no product review finding. The
harness was then narrowed to the 396-line delta from the previously reviewed
candidate, with the prior P2 bound explicitly and an empty built-in tool
allowlist. No product bytes changed during that harness correction.

The required fresh canonical review of the repaired product candidate then
returned:

```text
REVIEWER=grok -m grok-4.6
REVIEW_BASE=553ad71932a8036a6f6dfe34794052eb4e573b10
REVIEW_SOURCE=bdfbcc86e7b7e4c7ae49b9ee10469658fc854885
REVIEW_IMAGE=sha256:f1a33bc31e6c44a0a5d1bf803e453f5ea3ec903e9e9972247e61d84b3e0693ce
VERDICT=PASS
P0=0
P1=0
P2=0
SECURITY=0
REVIEWER_CLEAN_EXIT=YES
```

## Current authority boundary

```text
C8_PRODUCT_RUNTIME_CHANGED=YES_SOURCE_ONLY_NOT_DEPLOYED
C8_DEPLOYMENT=NOT_AUTHORIZED_BY_THIS_RETRY
C8_FIRMWARE_FLASH=NO
C8_PROVIDER_CALL=NO
C8_REVIEW_STATUS=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
C8_NEXT_HUMAN_AUTHORITY=EXACT_COMBINED_C7_C8_BACKEND_SHARED_FRONTEND_DEPLOYMENT_ONLY
C7_PATH=DEFERRED_TO_SELECTED_COMBINED_C7_C8_DEPLOYMENT
C9_STAGE=PARKED_RESEARCH_ONLY
C10_STAGE=ISOLATED_USAGE_TILES_REVIEWED_NOT_DEPLOYED
```

No authority is requested for firmware, provider calls, OAuth, credentials,
billing, private data, C9, C10, merge or release. All portfolio PRs remain
OPEN / DRAFT / UNMERGED.
