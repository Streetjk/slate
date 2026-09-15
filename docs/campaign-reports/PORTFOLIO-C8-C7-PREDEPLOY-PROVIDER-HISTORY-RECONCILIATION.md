# Portfolio C8+C7 predeployment provider-history reconciliation

Date: 2026-09-10 (Australia/Perth)

## Purpose

Prevent a stale/ambiguous Campaign 8 provider-history label from misleading the next deployment/acceptance controller pass.

This document grants no deployment, provider call, physical NOTE4 action, firmware flash, reset, re-pair, Wi-Fi change, OAuth/credential/billing/private-data action, merge or release authority.

PR #2 must remain OPEN / DRAFT / UNMERGED.

## Exact live control context at reconciliation

```text
LIVE_PR2_HEAD_BEFORE_THIS_DIRECTIVE=35d59db680c20b399381eb9cde0bd4b1e2d648d2
CURRENT_PORTFOLIO_NODE=EXACT_COMBINED_C8_C7_BACKEND_DEPLOYMENT_AND_ONE_NOTE4_PHYSICAL_ACCEPTANCE_AUTHORITY
POSTPHYSICAL_COMBINED_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
POSTPHYSICAL_COMBINED_TAG=slate:m4-postphysical-c8-c7-d26efe2
POSTPHYSICAL_COMBINED_ARM64_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
POSTPHYSICAL_COMBINED_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
FIRMWARE_CHANGED=NO
C10_JOIN_NEXT_DEPLOYMENT=NO
```

## Provider-history correction

The current top portfolio block contains:

```text
C8_PROVIDER_SESSION_CONSUMED=2_OF_2_HISTORICAL_MAX;NO_NEW_SESSION
C8_PROVIDER_RESULT=PRIOR_FAIL_SESSION_SETUP;CURRENT_PHYSICAL_RESULT=UNKNOWN_NO_NEW_SESSION
```

That label is incomplete if read as the accepted current C8 provider qualification state.

The durable accepted restore result in:

`docs/campaign-reports/08D1M-G-M4-EXACT-RESTORE-DEPLOYMENT-AND-PROVIDER-QUALIFICATION-RESULT.md`

records the later exact restored Gemini 2.5 Node-bridge qualification as:

```text
C8_RESTORE_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
PROVIDER_SESSION_ESTABLISHED=YES
PROVIDER_SETUP_LANGUAGE_CODES=ABSENT_EXPECTED
EN_INPUT_TRANSCRIPTION=YES
JA_INPUT_TRANSCRIPTION=YES
EN_LANGUAGE_EXPECTATION_MET=YES
JA_LANGUAGE_EXPECTATION_MET=YES
EN_PROVIDER_OUTPUT=YES
JA_PROVIDER_OUTPUT=YES
EN_TURN_COMPLETE=YES
JA_TURN_COMPLETE=YES
CLEAN_CHILD_EXIT=YES
PROVIDER_ERROR_CLASS=NONE
QUALIFICATION_TERMINAL=PASS
C8_PROVIDER_QUALIFICATION=PASS_SYNTHETIC_PROVIDER_BRIDGE
```

Therefore preserve both historical facts distinctly:

```text
C8_EARLIER_PROVIDER_ATTEMPT=FAIL_SESSION_SETUP_OR_AMBIGUOUS_HISTORICAL
C8_ACCEPTED_RESTORE_PROVIDER_QUALIFICATION=PASS_SYNTHETIC_PROVIDER_BRIDGE
C8_ACCEPTED_PROVIDER_SESSION_ESTABLISHED=YES
C8_ACCEPTED_PROVIDER_EN_TRANSCRIPTION=YES
C8_ACCEPTED_PROVIDER_JA_TRANSCRIPTION=YES
C8_ACCEPTED_PROVIDER_OUTPUT=YES_EN_AND_JA
C8_ACCEPTED_PROVIDER_CLEAN_EXIT=YES
C8_REAL_DEVICE_ACCENT_ASR=NOT_PROVEN_BY_SYNTHETIC_PROVIDER_TEST
C8_CURRENT_POSTPHYSICAL_PROVIDER_SESSION_REQUIRED=NO
```

Do not rewrite history to erase the earlier failed/ambiguous attempt. Instead distinguish it from the later accepted PASS. Do not treat `PRIOR_FAIL_SESSION_SETUP` as the current accepted provider result or as a blocker requiring another provider call.

At the next durable `CAMPAIGN-STATE.md` checkpoint, replace or expand the ambiguous `C8_PROVIDER_RESULT` field so the accepted restore PASS and earlier historical failure are mechanically distinct.

## Current candidate remains valid

This reconciliation changes documentation/control-plane interpretation only. It does not invalidate or alter the already frozen post-physical combined candidate:

```text
POSTPHYSICAL_COMBINED_SOURCE=d26efe2441407faf71c4c508f66e9f5c39f98fae
POSTPHYSICAL_COMBINED_TAG=slate:m4-postphysical-c8-c7-d26efe2
POSTPHYSICAL_COMBINED_ARM64_IMAGE_ID=sha256:4788c9c69ac08cc31132ac1f70c72f17d626467e619943014c6a7c8f4f928662
POSTPHYSICAL_COMBINED_BUILD=PASS
COMBINED_REVIEW=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
C8_REPAIR=FIRST_INPUT_PARTIAL_IMMEDIATE_WITH_BOUNDED_SUBSEQUENT_COALESCING;REMOVE_UNJUSTIFIED_ENGLISH_ONLY_SESSION_BIAS
C7_REPAIR=OUTLOOK_NAVIGATION_OR_VISIBLE_ERROR;OPEN_METEO_WMO_TO_VALID_ASSET_MAPPING
FIRMWARE_CHANGED=NO
NEW_PROVIDER_SESSION_REQUIRED=NO
```

The next human boundary remains the exact combined C8+C7 backend deployment plus one bounded NOTE4 physical acceptance after deployment health checks pass.

## Acceptance focus after authorization

The physical acceptance should primarily retest changed/previously failed paths rather than inventing a new provider experiment:

1. C8 Voice AI: one continuous short EN/JA session, checking input-to-user-text speed, real-accent Japanese-vs-Chinese recognition, bubble ordering/one-bubble semantics, audible response, progressive lag/freeze and clean exit.
2. C7 Outlook dashboard: Connect must produce navigation or a visible safe configuration/error state; do not cross OAuth consent/private-data authority if not already authorized.
3. C7 Weather: representative Perth current/forecast icons must no longer collapse into the unknown cloud/question-mark fallback for known WMO codes.
4. Perform only minimal regression navigation for unchanged C7 surfaces as needed to ensure the combined artifact did not regress them.

No additional synthetic provider session is required or authorized by this reconciliation.

If the combined deployment is later explicitly authorized, deploy only the exact frozen candidate after re-verifying its reviewed source/image identity and existing production configuration. Do not recreate MySQL and do not flash/reset/re-pair/change Wi-Fi.

If the one physical acceptance is later explicitly authorized and consumed, do not blind-repeat. Ingest operator observations plus existing sanitized structural evidence and continue safe deterministic work automatically.

Keep C10 separate and not deployed unless separately authorized. Keep C9 parked research-only.
