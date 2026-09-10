# Campaign 8D1M-G — Second M4 Failure Ingest: Execute Now

## Authority and live reconciliation

This instruction is issued against PR #2 after live reconciliation at:

```text
RECONCILED_PR_HEAD=268d81a4a4336aca54c548e398466dae3627ae5c
PR_NUMBER=2
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
HEAD_BRANCH=feature/gemini-35-live-evaluation
BASE_BRANCH=integration/note4-custom
MODE=FRONTIER_DRIVEN_LONGRUN
```

Before execution, re-fetch PR #2. If the head has advanced, reconcile and execute from the newer live frontier rather than blindly replaying this checkpoint.

Keep PR #2 OPEN / DRAFT / UNMERGED. Do not merge or release without explicit human authority.

## Current frontier correction

`docs/campaign-reports/CAMPAIGN-STATE.md` still has a stale top human boundary from before the second physical M4 attempt:

```text
WAITING_HUMAN_COUNT=1
NEXT_ACTION=HUMAN_ENTER_VOICE_AI_ENGLISH_SHORT_TURN_JAPANESE_SHORT_TURN_THEN_EXIT
```

That boundary has already been satisfied.

The second observed physical attempt produced:

```text
VOICE_SERVICE_UNAVAILABLE=YES
SECOND_OBSERVED_M4_FAILURE=YES
MANUAL_RETRY_AFTER_THIS_RESULT=NO
```

Therefore the campaign is no longer waiting on the operator. The immediate frontier is technical attribution/repair.

Do not ask for a third Voice AI retry now.

## Primary mission

Ingest and correlate the exact sanitized observer evidence from the second failed M4 attempt and drive the campaign automatically through attribution, repair if required, validation, exact review, deployment/reflash if required, and requalification until another physical test is genuinely the sole remaining useful node.

Read and preserve the intent of:

```text
docs/campaign-reports/08D1M-G-M4-SECOND-FAILURE-LIVE-OBSERVER-ATTRIBUTION.md
docs/campaign-reports/08D1M-G-M4-FAIL-VOICE-SERVICE-UNAVAILABLE-ATTRIBUTION.md
docs/campaign-reports/CAMPAIGN-STATE.md
```

Newest live evidence/frontier wins over stale historical blocks.

## Step 1 — ingest the second failure mechanically

Locate the exact time window for the second operator-visible `Voice service unavailable` event.

Correlate only sanitized structural evidence from:

1. live PTY serial observer output;
2. backend structural markers/logs;
3. backend and MySQL health/restart state;
4. NOTE4 port/device continuity where already observable without unnecessary probing;
5. exact active backend identity;
6. exact flashed firmware identity.

Do not retain or publish:

- raw microphone audio;
- transcript text;
- provider payload contents;
- API keys;
- credentials;
- auth headers;
- Calendar contents;
- Outlook contents;
- other private user content.

Extract where available:

```text
VOICE_CONFIG_REQUEST_START=
VOICE_CONFIG_RESULT=
VOICE_CONFIG_PARSE=

VOICE_WS_CONNECT_START=
VOICE_WS_CONNECT_RESULT=
VOICE_WS_CLOSE_CODE=

VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
VOICE_GENERIC_FAILURE_BRANCH=

VOICE_CONFIG_AUTH_ATTEMPT=
VOICE_CONFIG_AUTH_RESULT=
VOICE_CONFIG_RESPONSE_CLASS=

VOICE_WS_UPGRADE_ATTEMPT=
VOICE_WS_AUTH_RESULT=
VOICE_WS_ACCEPTED=

PROVIDER_SESSION_CREATE_START=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=

FIRST_MIC_FRAME_RECEIVED=

SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
LOCAL_HEALTH=
PUBLIC_HEALTH=

ACTIVE_BACKEND_IMAGE_ID=
FIRMWARE_APP_SHA256=
DEVICE_PORT_CONTINUITY=
```

Record sanitized timestamps and stage-to-stage deltas sufficient to prove sequencing.

Do not infer missing firmware-side branches.

## Step 2 — narrow failure classification

Classify to the narrowest branch mechanically supported by evidence:

```text
A = authenticated voice-config request/response failure
B = firmware config parse / protocol construction failure
C = WebSocket authentication / upgrade failure
D = WebSocket accepted then firmware-side session-init/send failure
E = WebSocket accepted then pre-mic close / transport / protocol failure
F = provider-session creation failure before mic
G = first mic frame path failure
H = other exact sanitized branch
```

The prior physical failure already established:

```text
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=PASS
VOICE_WEBSOCKET_OPEN_RESULT=ACCEPTED
BACKEND_FIRST_MIC_FRAME=NO
MIC_AUDIO_REACHED_PROVIDER=NO
PROVIDER_SESSION_CREATE_START=NOT_OBSERVED
PROVIDER_SESSION_CREATE_RESULT=NOT_OBSERVED
ROOT_CAUSE_CLASS=CASE_B_OR_CASE_E_PRE_MIC_FAILURE_WITH_OBSERVER_CAPTURE_GAP
SOURCE_DEFECT=NOT_PROVEN
```

Use the second observer capture to close this ambiguity if the evidence permits.

## Step 3A — observer capture succeeded

If the live PTY observer captured enough firmware-side structural markers to determine the exact branch, continue automatically:

```text
sanitized exact attribution
-> root-cause proof
-> AGY gemini-3.8-flash minimal repair if production bytes require change
-> Codex deterministic validation
-> privacy/secret scan
-> rebuild impacted artifact only
-> freeze exact identities
-> fresh independent ZAI glm-5.3-flash review for every changed production byte
-> reviewer REVISE -> adjudicate -> repair -> retest -> rebuild -> new exact freeze -> fresh ZAI rereview
-> repeat until PASS or genuine P0/P1/security/authority boundary
-> reviewed backend redeploy if required
-> exact app-only NOTE4 reflash if required
-> post-deploy/post-flash zero-private-data requalification
-> arm fresh sanitized observers
-> return to operator only when physical M4 validation is genuinely the sole remaining useful node
```

Implementation writer:

```text
AGY gemini-3.8-flash
```

Independent reviewer:

```text
ZAI glm-5.3-flash
```

The reviewer must independently review the exact frozen artifact/bundle. Verdict must bind to exact SHA256. Any production-byte change after review invalidates that verdict and requires a fresh ZAI review.

Do not silently substitute reviewer/model/provider.

## Step 3B — no production-byte change required

If the exact failure proves an authorized operational/config/protocol correction requiring no production source-byte change, perform the minimum deterministic correction and requalification automatically.

Do not change:

- production Gemini model;
- provider;
- credentials;
- billing;
- OAuth/ADC authority;
- Calendar authority;
- Outlook authority;
- private-data authority.

If one of those changes is truly required, stop only at that real authority boundary with a compressed decision packet.

## Step 3C — observer capture failed again

If the second live PTY attempt did not retain enough firmware markers for exact attribution, this is now an instrumentation reliability defect.

Do not ask for a third blind physical retry.

Create a READY software node and implement durable sanitized capture. Prefer the smallest reliable mechanism that mechanically proves capture continuity, such as:

- bounded persistent sanitized ring buffer/file;
- automatic timestamped marker flush;
- explicit observer-alive heartbeat;
- capture tied automatically to Voice AI lifecycle;
- fixed post-failure snapshot of structural markers.

No raw audio, transcript, provider payload, credentials, auth headers, Calendar/Outlook contents, or private content may be retained.

If production bytes change for observer durability:

```text
AGY implementation
-> Codex deterministic tests
-> privacy/secret scan
-> impacted rebuild only
-> exact identity freeze
-> fresh ZAI exact review
-> reviewer repair/rereview loop until PASS
-> reviewed deploy/reflash as required
-> zero-private-data requalification
-> prove observer durability mechanically
```

Only after this is complete and all nonphysical READY/READONLY_READY work is exhausted may another physical M4 attempt become `WAITING_HUMAN_COUNT=1`.

## Accepted platform state — preserve

Do not rerun containerd V6 migration.

Do not repartition NVMe.

Do not touch Deluge data.

Do not delete preserved rollback roots/images/backups.

Preserve:

```text
CONTAINERD_ROOT=/mnt/ssd-tmp/slate-tools/containerd-root
CONTAINERD_STATE=/run/containerd-v5
CONTAINERD_SOCKET=/run/containerd-v5/containerd.sock
DOCKER_ROOT=/mnt/ssd-tmp/slate-tools/docker-data
ACTIVE_BACKEND_IMAGE_ID=sha256:63db9b2133af17d0a755a7149c0fb22e9cfa0fcaad19df31fbac2ebf344def17
FIRMWARE_APP_SHA256=8d0dcaba542ddba1447812ca45cb136fcd2a43e2dfbe938e9560d425d9d4f61a
FIRMWARE_FLASH_OFFSET=0x10000
FIRMWARE_FLASH_SCOPE=APP_ONLY
```

The backend/image identity discrepancy was already proven to be store/config identity semantics, with independent ZAI PASS. Do not reopen that solved migration/identity campaign unless new evidence directly invalidates it.

## Long-run continuation contract

Operate under `FRONTIER_DRIVEN_LONGRUN`.

The following are not terminal while useful frontier work remains:

- report publication;
- checkpoint commit;
- test PASS;
- test FAIL with bounded repair available;
- implementation completion;
- reviewer REVISE;
- reviewer PASS;
- build completion;
- backend deployment completion;
- firmware flash completion;
- transient tool/provider failure with bounded recovery available;
- child/milestone completion.

A blocked node does not block the campaign.

Continue every other READY / READONLY_READY node automatically.

Before any Codex exit, publish/reconcile the authoritative frontier and record:

```text
CURRENT_HEAD=
CURRENT_STAGE=
M4_STATUS=
SECOND_M4_FAILURE_INGESTED=
VOICE_CONFIG_AUTHENTICATED_RESULT=
VOICE_CONFIG_PARSE_RESULT=
VOICE_WEBSOCKET_AUTHENTICATED_RESULT=
VOICE_WEBSOCKET_OPEN_RESULT=
VOICE_WEBSOCKET_CLOSE_CODE=
VOICE_SESSION_INIT_SENT=
VOICE_MIC_STREAM_STARTED=
PROVIDER_SESSION_CREATE_RESULT=
PROVIDER_SESSION_STARTED=
MIC_AUDIO_REACHED_PROVIDER=
FIRMWARE_GENERIC_FAILURE_BRANCH=
ROOT_CAUSE_CLASS=
SOURCE_DEFECT=
OBSERVER_CAPTURE_STATUS=
ACTIVE_BACKEND_IMAGE_ID=
FIRMWARE_APP_SHA256=
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

Do not exit if:

```text
READY_NODE_COUNT > 0
```

or:

```text
READONLY_READY_NODE_COUNT > 0
```

unless an actual safety/authority conflict prevents continuation.

## Expected immediate frontier

Unless new observer evidence reveals a genuine authority/security stop, reconcile toward:

```text
CURRENT_STAGE=M4_SECOND_FAIL_ATTRIBUTION_OR_REPAIR
READY_NODE_COUNT>=1
WAITING_HUMAN_COUNT=0
HUMAN_ACTION_REQUIRED=NO
TERMINAL_REASON=NONE_CAMPAIGN_CONTINUES
NEXT_ACTION=INGEST_SECOND_FAILURE_OBSERVERS_THEN_ATTRIBUTION_REPAIR_REQUALIFICATION
```

Do not return control to the operator merely because another report or checkpoint was written.
