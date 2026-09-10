# Campaign 8D1M-G M4 — long-run observability and autonomy hardening

## Purpose

This directive converts the current short-horizon qualification flow into a longer-running campaign flow with minimum operator intervention.

The immediate frontier is a post-flash Wi-Fi evidence gap, not a proven product failure. Passive evidence has been exhausted because the current stack lacks a sanitized identity-tied success marker for an authenticated NOTE4 network transaction after flash.

For a long-running campaign, repeated human intervention for this class of observability gap is undesirable when a bounded software-only observability repair can remove the recurring boundary.

Keep PR #2 OPEN / DRAFT / UNMERGED.

## Current preserved facts

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
CURRENT_RUNTIME_REPAIR=DEPLOYED_AND_FLASH_VERIFIED
LATEST_CANONICAL_REVIEWER=GROK_4_6
POSTFLASH_WIFI_QUALIFICATION=UNRESOLVED_READONLY_EVIDENCE_GAP
READY_NODE_COUNT=0
READONLY_READY_NODE_COUNT=1
WAITING_HUMAN_COUNT=1
DEVICE_IDENTITY_PRESERVED=YES
OBSERVER_RUNNING=YES
FATAL_MARKERS=0
```

## Long-run decision rule

Do not stop the campaign at a recurring human boundary when all of the following are true:

1. the boundary exists only because structurally safe evidence is missing;
2. a bounded low-footprint observability repair can create that evidence;
3. the repair does not expand provider/model/credential/billing/private-data authority;
4. the repair can be validated deterministically and independently reviewed;
5. the operator has not explicitly forbidden that repair.

In that case, prefer eliminating the observability gap over repeatedly asking the operator to reproduce state manually.

This rule does not override true human-only gates such as physical acceptance, sudo/root password, merge/release, changed device identity, new credentials/provider/billing/private-data authority, or unresolved P0/P1/security findings.

## Immediate technical objective — self-qualifying authenticated network proof

Investigate the smallest reliable way to prove one successful authenticated NOTE4 network transaction without logging identity/private content.

Prefer backend-side instrumentation if sufficient, because it avoids another firmware flash.

Candidate minimal design:

- emit a sanitized structural marker only after `DeviceAuthGuard` has authenticated the request and the existing poll/heartbeat path has been admitted successfully;
- do not log device ID, MAC, SSID, IP address, token, credential, payload, transcript, audio, provider content, Calendar/Outlook content, or raw request body;
- marker examples may be limited to a status class/counter/timestamp such as `DEVICE_AUTHENTICATED_POLL_RESULT=PASS` plus bounded aggregate counters;
- preserve existing `lastSeenAt` semantics;
- avoid per-request noisy logging if a once-per-boot/session or rate-limited marker is enough;
- make observer ingestion explicit and durable so post-flash qualification can mechanically consume it;
- if backend instrumentation cannot prove NOTE4 identity safely without leaking identity, use another already-authorized structural mechanism, but keep the same privacy constraints.

Do not add a marker that can false-PASS on unauthenticated probes, generic HTTP health, host traffic, reverse-proxy activity, or unrelated device rows.

## Implementation/review chain

If runtime bytes change:

```text
evidence
-> Codex adjudication
-> AGY gemini-3.8-flash-high minimal implementation
-> focused deterministic tests
-> backend/frontend typecheck/lint/format as impacted
-> privacy/secret scan
-> exact build/freeze
-> fresh independent Grok 4.6 review
-> bounded Slate-only deployment if backend-only
-> no firmware flash unless firmware bytes actually changed and are required
-> exact qualification
-> durable observer rearm
-> publish frontier
```

Canonical independent reviewer remains:

```text
REVIEWER=GROK_4_6
MODEL_SELECTOR=grok-4.6
NO_ZAI_RETRY=true
NO_SILENT_REVIEWER_FALLBACK=true
```

If Grok returns REVISE, Codex adjudicates and repairs only accepted findings before a fresh review. Do not deploy unreviewed runtime bytes.

## Long-run autonomy after Wi-Fi proof

Once authenticated NOTE4 network activity is mechanically proven:

1. close the Wi-Fi qualification gap;
2. set `READONLY_READY_NODE_COUNT=0`;
3. rearm the sanitized observer;
4. advance to exactly ONE combined multi-turn EN/JA Voice AI physical acceptance boundary;
5. consume that physical attempt once;
6. immediately ingest observer/backend evidence;
7. continue autonomously through diagnosis, minimal repair, deterministic soak, AGY implementation, Grok 4.6 review, deployment/reflash if required, requalification and observer rearm;
8. do not ask the operator to relay routine intermediate results or repeat failed attempts while nonphysical work remains.

The physical soak must measure/observe:

```text
EARLY_TURN_LATENCY
LATE_TURN_LATENCY
PROGRESSIVE_LATENCY_GROWTH
UI_FREEZE_OR_RECOVERY
TURN_ORDER
ONE_BUBBLE_PER_ROLE
JAPANESE_KANA_RENDERING_INCLUDING_U+306E
AUDIBLE_ASSISTANT_AUDIO
PER_TURN_PROVIDER_LATENCY
BACKEND_QUEUE_BACKLOG
NODE_BRIDGE_STDIO_BACKLOG
FIRMWARE_UI_QUEUE_TREND
AUDIO_QUEUE_TREND
HEAP_PSRAM_TREND
RESET_WATCHDOG_MARKERS
```

Do not conflate provider baseline latency with Slate-side progressive accumulation.

## Durable frontier discipline for a long campaign

At every meaningful checkpoint, publish/update `CAMPAIGN-STATE.md` with at least:

```text
CURRENT_HEAD
CURRENT_STAGE
READY_NODE_COUNT
READONLY_READY_NODE_COUNT
WAITING_DEVICE_COUNT
WAITING_HUMAN_COUNT
EXTERNALLY_BLOCKED_COUNT
CURRENT_BLOCKED_NODE
HUMAN_ACTION_REQUIRED
HUMAN_ACTION_REASON
TERMINAL_REASON
NEXT_ACTION
```

Additional long-run invariants:

- a checkpoint, report push, test pass, reviewer pass, deploy, flash, observer rearm or recoverable failure is not a terminal condition by itself;
- if `READY_NODE_COUNT > 0` or `READONLY_READY_NODE_COUNT > 0`, continue automatically unless safety/authority prevents it;
- preserve exact artifact identities and reviewer target SHAs;
- keep production Gemini provider/model/credential/billing/private-data authority unchanged unless separately authorized;
- keep MySQL identity/data and rollback roots preserved;
- never rerun the containerd V6 migration, repartition NVMe, touch Deluge data, or delete rollback roots/images/backups;
- keep privacy observability structural only;
- PR #2 remains OPEN / DRAFT / UNMERGED until explicit merge/release authority.

## Desired long-campaign outcome

The campaign should be able to run through many diagnosis/repair/review/deploy cycles with GitHub as the durable control bus and require the operator only for true physical or authority boundaries.

The immediate preferred path is therefore:

```text
REMOVE_RECURRING_WIFI_OBSERVABILITY_GAP_WITH_MINIMUM_FOOTPRINT
-> PASSIVE_NETWORK_SELF_QUALIFICATION
-> ONE_COMBINED_EN_JA_MULTI_TURN_SOAK
-> AUTONOMOUS_EVIDENCE_INGEST_AND_REPAIR_CYCLES
-> M4_CLOSEOUT_ONLY_WHEN_ACCEPTANCE_IS_ACTUALLY_PROVEN
```
