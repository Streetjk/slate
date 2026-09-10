# Campaign 8D1M-G — Restore Existing ZAI Auth, Then Exact Review / App-Only Reflash

## Live reconciliation at instruction issue

This instruction was issued after reconciling live PR #2 at:

```text
RECONCILED_PR_HEAD=1593c185fc97144e3cfc5968051d4cd0e8dca8e2
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch PR #2 and `docs/campaign-reports/CAMPAIGN-STATE.md` at the exact current head. If GitHub advanced, reconcile from the newer live frontier rather than replaying stale state.

Keep PR #2 **OPEN / DRAFT / UNMERGED**. Do not merge or release without explicit human authority.

## Current exact frontier

The second M4 failure is no longer an attribution problem and no longer an AGY writer problem.

The lower transport defect has been mechanically proven and the bounded repair has completed through deterministic qualification:

```text
CURRENT_STAGE=M4_SECOND_FAIL_ZAI_EXACT_REVIEW_AUTH_BLOCKED
ROOT_CAUSE_PROOF=PASS_VULNERABLE_ORDERING_MECHANICALLY_PROVEN
ROOT_CAUSE_CLASS=CASE_H_FIRMWARE_WEBSOCKET_TRANSPORT_EVENT_DROP_BEFORE_BACKEND_UPGRADE
SOURCE_COMPONENT=78/esp-ml307
SOURCE_COMPONENT_VERSION=3.6.5
SOURCE_COMPONENT_REPOSITORY_COMMIT=ab4de7c28c8b8f809eba2f56f38090d57fce984d
SOURCE_COMPONENT_REGISTRY_HASH=5231991281a2f48f0e34ec705c2982936264d8b14f6f9373e60b153fd4b62123
SOURCE_FILE=firmware/managed_components/78__esp-ml307/src/web_socket.cc
SOURCE_FUNCTION=WebSocket::Connect
SOURCE_DEFECT=LOWER_TRANSPORT_RECEIVE_TASK_STARTS_BEFORE_STREAM_CALLBACK_REGISTRATION
AGY_IMPLEMENTATION_STATUS=PASS_SAME_DESIGNATED_ROUTE
AGY_MODEL=gemini-3.8-flash-high
CHANGED_SOURCE_SHA256=68d232f23a21a05aab8b51cec4e4733268137d8584b90681c30535dc1618efae
REGRESSION_TEST_SHA256=d6672b3fc695d8406a69769ea90e2c89af911bb84d76ab829eb0690d2776dcff
REGRESSION_TEST_STATUS=PASS_WEBSOCKET_EVENT_LOSS_AND_CALLBACK_ORDER
NO_VENDOR_VOICE_DEPENDENCY_TEST=PASS
FRAMEBUFFER_HOST_TEST=PASS
PRIVACY_SECRET_SCAN=PASS_NO_MATCHES
FIRMWARE_BUILD_STATUS=PASS_ESP_IDF_5_5_2_ESP32S3_2002_OF_2002
FIRMWARE_APP_PATH=build-ws-repair/slate.bin
FIRMWARE_APP_SHA256=640ab435c9ec2f69ad4465520a712405bc28b7b0849a96b16fcb8685693716da
FIRMWARE_APP_SIZE_BYTES=2505008
FLASH_STATUS=NOT_STARTED
```

The fresh independent reviewer gate is blocked only by authentication:

```text
ZAI_REVIEW_PROFILE=zai-glm53-reviewer
ZAI_REVIEW_PROVIDER=ZAI
ZAI_REVIEW_MODEL=glm-5.3-flash
ZAI_REVIEW_STATUS=BLOCKED_EXISTING_AUTH_REJECTED
ZAI_REVIEW_VERDICT=NONE
ZAI_REVIEW_HTTP_STATUS=401
ZAI_REVIEW_FAILURE_CLASS=AUTH_REJECTED
ZAI_REVIEW_SECRET_EXPOSED=NO
ZAI_REVIEW_CREDENTIAL_MUTATED=NO
```

The first local reviewer transport lacked a usable Python CA bundle and therefore produced no reviewer verdict. A materially different system `curl` transport reached the designated ZAI endpoint and returned HTTP 401. Treat this as a genuine authentication boundary, not as an implementation/test failure.

## Human boundary — exact permitted action

The only human action currently required is to restore the **existing designated ZAI / glm-5.3-flash authentication** out of band so the already-authorized reviewer route works again.

Do not request, create, rotate, replace, migrate, expose, print, commit, copy, or transmit credential material in the repository, reports, logs, or chat.

Do not silently switch to:

- another ZAI credential identity;
- another reviewer model;
- another provider;
- NVIDIA NIM;
- Grok;
- Claude;
- Gemini as reviewer;
- Codex self-review as a substitute for the independent reviewer.

If restoring the existing auth genuinely requires a new/replacement credential rather than re-establishing the previously designated authority, stop and request explicit human authorization for that credential change.

## Automatic resume condition

Once the existing designated ZAI authentication is restored, resume immediately without asking for another campaign-level confirmation.

First perform a non-secret route/auth sanity check sufficient to establish that the exact designated reviewer route can authenticate. Do not expose any token/key value.

Then continue automatically through the following stages.

## Stage 1 — freeze/reconfirm exact review target

Before review, mechanically confirm that the frozen changed source, regression test, and firmware artifact still match:

```text
SOURCE_SHA256=68d232f23a21a05aab8b51cec4e4733268137d8584b90681c30535dc1618efae
REGRESSION_SHA256=d6672b3fc695d8406a69769ea90e2c89af911bb84d76ab829eb0690d2776dcff
FIRMWARE_APP_SHA256=640ab435c9ec2f69ad4465520a712405bc28b7b0849a96b16fcb8685693716da
FIRMWARE_APP_SIZE_BYTES=2505008
```

If any production byte changed after the qualification checkpoint, do not reuse these review identities. Re-run the impacted deterministic qualification, freeze new exact identities, and review those instead.

## Stage 2 — fresh exact independent ZAI review

Use only:

```text
REVIEWER=ZAI
MODEL=glm-5.3-flash
PROFILE=zai-glm53-reviewer
```

The reviewer must receive the exact frozen changed-source/regression/artifact evidence and independently inspect:

1. the mechanically proven lower-transport event-loss race;
2. whether the repair correctly registers the lower transport callbacks before the receive task can deliver data;
3. lifetime/concurrency/disconnect implications of the change;
4. deterministic regression coverage;
5. scope containment / absence of unrelated refactors;
6. privacy/security regressions;
7. firmware artifact provenance and exact hashes.

Require a verdict bound to the exact frozen identities:

```text
REVIEW_TARGET_SOURCE_SHA256=
REVIEW_TARGET_REGRESSION_SHA256=
REVIEW_TARGET_FIRMWARE_APP_SHA256=
VERDICT=PASS|REVISE
P0=
P1=
P2=
P3=
SECURITY=
```

A transport success without a valid exact verdict is not review PASS.

## Stage 3A — reviewer PASS

If exact ZAI review returns PASS with no blocking P0/P1/security issue:

1. confirm reviewed source/artifact identities are still unchanged;
2. verify NOTE4 device identity read-only immediately before flashing;
3. if the historical port changed, re-establish the same device identity before any write;
4. flash **app-only** at the established application offset `0x10000`;
5. do not full erase;
6. preserve bootloader, partition table, NVS, pairing, LittleFS/user data, and device identity;
7. verify firmware boot and Wi-Fi;
8. verify no fatal firmware markers;
9. verify Slate backend/MySQL health and restart counts;
10. preserve the already accepted backend image and storage topology unless new evidence requires otherwise;
11. arm the privacy-preserving firmware + backend observers and mechanically confirm observer readiness.

Do not rerun containerd V6, repartition NVMe, touch Deluge data, delete rollback roots/images/backups, change Gemini model/provider/credentials/billing/OAuth/ADC, or broaden Calendar/Outlook/private-data authority.

No extra Gemini provider session is required merely to flash/requalify the firmware.

## Stage 3B — reviewer REVISE

`REVISE` is not a human stop.

Continue automatically:

```text
ZAI findings
-> Codex adjudication
-> same designated AGY gemini-3.8-flash-high minimal repair
-> narrow deterministic regression first
-> impacted firmware/no-vendor tests
-> privacy/secret scan
-> rebuild impacted firmware only
-> freeze new exact source/regression/artifact identities
-> fresh independent ZAI glm-5.3-flash exact rereview
```

Repeat until PASS or a genuine unresolved P0/P1/security/authority boundary appears.

Do not silently change writer, reviewer, provider, model, or credential authority to accelerate the loop.

## Stage 4 — return to physical M4 only when it is truly the sole node

Do not ask the operator to enter Voice AI again until all of the following are mechanically true:

```text
ROOT_CAUSE_PROOF=PASS
AGY_REPAIR=PASS
DETERMINISTIC_REGRESSION=PASS
IMPACTED_TESTS=PASS
PRIVACY_SECRET_SCAN=PASS
FRESH_ZAI_EXACT_REVIEW=PASS
APP_ONLY_REFLASH=PASS
POST_FLASH_BOOT_WIFI=PASS
BACKEND_HEALTH=PASS
MYSQL_HEALTH=PASS
SANITIZED_OBSERVERS=ARMED_AND_VERIFIED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
```

Only then may the next combined physical NOTE4 Voice AI validation become `WAITING_HUMAN_COUNT=1`.

That future physical session should validate the repaired WebSocket path and existing UX requirements in the minimum useful combined session, including EN/JA and clean exit, without introducing unrelated authority changes.

## If ZAI 401 persists after the existing auth is restored

If the exact designated route still returns HTTP 401 after the operator has restored the existing authentication:

1. perform only bounded non-secret diagnostics that do not mutate credentials;
2. confirm endpoint/profile/model identity;
3. do not print or inspect secret values in reports;
4. do not substitute a provider/model/reviewer;
5. if credential replacement/rotation is required, stop at that genuine human authority boundary.

A persistent 401 with endpoint reachability is not justification to bypass the independent review gate.

## Long-run continuation contract

Operate under `FRONTIER_DRIVEN_LONGRUN`.

After authentication is restored, do not return control for:

- exact review PASS;
- exact review REVISE;
- AGY correction;
- deterministic test failure with bounded repair;
- rebuild;
- exact freeze;
- rereview;
- app-only flash;
- boot/Wi-Fi verification;
- backend/MySQL health verification;
- observer re-arming;
- report/checkpoint publication;
- commit/push/remote verification.

Continue while `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0` unless a genuine safety/authority conflict applies.

Before any Codex exit, publish the authoritative frontier with at least:

```text
CURRENT_HEAD=
CURRENT_STAGE=
ROOT_CAUSE_PROOF=
AGY_IMPLEMENTATION_STATUS=
CHANGED_SOURCE_SHA256=
REGRESSION_TEST_STATUS=
FIRMWARE_APP_SHA256=
ZAI_REVIEW_STATUS=
ZAI_REVIEW_VERDICT=
ZAI_REVIEW_HTTP_STATUS=
FLASH_STATUS=
POST_FLASH_REQUALIFICATION_STATUS=
SANITIZED_OBSERVER_STATUS=
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

## Expected current frontier before auth restoration

Until the existing designated authentication is restored, the correct state remains approximately:

```text
CURRENT_STAGE=M4_SECOND_FAIL_ZAI_EXACT_REVIEW_AUTH_BLOCKED
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=0
WAITING_HUMAN_COUNT=1
EXTERNALLY_BLOCKED_COUNT=1
CURRENT_BLOCKED_NODE=ZAI_EXACT_REVIEW_AUTH
HUMAN_ACTION_REQUIRED=YES
HUMAN_ACTION_REASON=RESTORE_EXISTING_DESIGNATED_ZAI_GLM53_REVIEW_AUTH_OUT_OF_BAND
TERMINAL_REASON=EXACT_ZAI_REVIEW_AUTH_HUMAN_BOUNDARY
NEXT_ACTION=RESTORE_EXISTING_ZAI_AUTH_THEN_EXACT_REVIEW_AND_AUTOMATIC_CONTINUATION
```

Do not ask for another NOTE4 physical retry while this reviewer gate is unresolved.