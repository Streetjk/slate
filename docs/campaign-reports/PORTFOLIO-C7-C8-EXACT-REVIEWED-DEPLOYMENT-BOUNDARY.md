# Portfolio C7+C8 exact reviewed deployment boundary

Date: 2026-09-11 (Australia/Perth)

This document prepares the smallest next human authority boundary after the repaired C7+C8 candidate received a terminal canonical Grok 4.6 PASS. It does not itself authorize execution; deployment must begin only from an explicit operator/controller instruction granting this exact boundary.

## Exact reviewed candidate

```text
SOURCE=bdfbcc86e7b7e4c7ae49b9ee10469658fc854885
ARM64_IMAGE=sha256:f1a33bc31e6c44a0a5d1bf803e453f5ea3ec903e9e9972247e61d84b3e0693ce
PLATFORM=linux/arm64
REVIEWER=grok -m grok-4.6
VERDICT=PASS
P0=0
P1=0
P2=0
SECURITY=0
```

Qualification already recorded for this source includes:

```text
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

The repaired P2 specifically prevents coordinate-less Open-Meteo fallback configuration from being persisted; frontend fallback selection resolves to QWeather and clears stale Open-Meteo coordinates, while coordinate-bearing Open-Meteo selection remains supported.

## Exact deployment scope

When explicitly authorized, the deployment may:

- deploy the exact reviewed combined C7+C8 backend/shared/frontend candidate represented by the source/image above;
- recreate/restart only the Slate application service/container as required for that deployment;
- preserve existing network attachment;
- preserve MySQL and all existing data;
- preserve existing NOTE4 identity and pairing;
- preserve the already-approved Gemini provider/model/auth configuration and existing read-only secret mount;
- preserve Outlook read-only scope and current Calendar semantics.

It may not:

- change any source or runtime bytes after the reviewed freeze;
- rebuild a materially different production artifact and silently substitute it;
- recreate MySQL;
- alter Wi-Fi, device identity, NOTE4 pairing, firmware, or firmware partitions;
- flash firmware;
- reset/power-cycle the NOTE4 as part of deployment;
- call a new Gemini/provider qualification session;
- change provider/model/auth mode, credentials, OAuth, billing, private-data scope, Calendar/Outlook permissions, C9, C10, merge or release state.

## Pre-deployment gates

Before touching production, verify and publish:

```text
LIVE_PR2_HEAD=
REVIEWED_SOURCE_MATCH=
REVIEWED_ARM64_IMAGE_MATCH=
PRODUCT_BYTE_DRIFT=0
REVIEW_STATUS=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
SLATE_PREDEPLOY_HEALTH=
SLATE_PREDEPLOY_RESTART_COUNT=
MYSQL_PREDEPLOY_HEALTH=
MYSQL_PREDEPLOY_RESTART_COUNT=
NETWORK_IDENTITY_PRESERVED=
GEMINI_CONFIG_QUALIFICATION=
SECRET_MOUNT_READONLY=
```

If source/image identity does not match exactly, stop. Do not rebuild or substitute under this authority.

## Deployment and post-deployment verification

After deploying only the reviewed candidate, verify before requesting any device interaction:

```text
RUNNING_SOURCE_MATCH=
RUNNING_IMAGE_MATCH=
SLATE_HEALTH=
SLATE_RESTART_COUNT=
MYSQL_HEALTH=
MYSQL_RESTART_COUNT=
LOCAL_HTTP_HEALTH=
PUBLIC_HTTP_HEALTH=
NETWORK_IDENTITY_PRESERVED=
GEMINI_CONFIG_QUALIFICATION=
SECRET_MOUNT_READONLY=
NOTE4_AUTHENTICATED_POLL=
OBSERVER_STATE=
```

Use only sanitized structural evidence. Do not retain raw mic audio, transcript contents, provider payloads, credentials/tokens/auth headers, private Outlook/Calendar contents, or private device identifiers.

If activation fails before the new image becomes healthy, perform only the previously established safe rollback to the last known-good Slate application image/configuration. Do not mutate MySQL or device state. Publish exact rollback evidence.

## Next boundary after healthy deployment

Do not automatically start physical NOTE4 acceptance under this deployment authority.

If deployment and health checks pass, the next human boundary must be a separate, bounded physical acceptance focused on:

- C7 Weather configuration/runtime success and representative Perth icon behavior;
- C7 Google News AU/TW/Both dynamic type/runtime success;
- C7 Outlook Connect visible English-safe behavior without OAuth/private-data expansion;
- C8 Japanese glyph integrity, including whether prior `ㄇ` and missing-glyph-square symptoms recur;
- only the minimum C8 Voice checks needed to validate no regression.

No firmware flash should be bundled unless new deterministic evidence first proves a firmware change is required and that firmware candidate has separately passed build/freeze/review gates.

## Portfolio invariants

C7 remains deferred to the selected combined C7+C8 path. C9 remains parked research-only. C10 remains isolated and undeployed. Keep PRs #1-#4 OPEN / DRAFT / UNMERGED.

Before controller exit after deployment, update `CAMPAIGN-STATE.md`, push/fetch-verify exact SHA, and publish aggregate portfolio counts. Do not claim physical PASS from deployment-only evidence.