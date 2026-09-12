# Campaign 8D1M-G M4 — long continuous execution directive

## Purpose

Run the current M4 Voice AI recovery as one continuous `FRONTIER_DRIVEN_LONGRUN` campaign instead of a sequence of routine handoffs.

The current physical boundary remains exactly one combined EN/JA multi-turn soak. After that single human action is consumed, Codex must continue automatically through every safe deterministic, diagnostic, implementation, review, build, requalification, observability, reporting, and closure step that remains inside existing authority.

Routine checkpoints are durable evidence points, not reasons to return control.

This directive is additive to and must preserve:

- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`;
- `docs/campaign-reports/08D1M-G-M4-EXACT-COMBINED-EN-JA-MULTITURN-SOAK.md`.

If any older M4 report conflicts only by unnecessarily stopping at an intermediate checkpoint, this long-run directive and the autonomy policy control. Security, privacy, authority, artifact-identity and PR-state gates remain binding.

## Activation snapshot

```text
MODE=FRONTIER_DRIVEN_LONGRUN
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
ACTIVATION_BRANCH=feature/gemini-35-live-evaluation
ACTIVATION_HEAD=b2cbff113f0757495be13c5a942edba686ab4ea0
CURRENT_ACCEPTED_STAGE=M4_ONE_SHOT_RESET_CONSUMED_NETWORK_QUALIFIED
NETWORK_QUALIFICATION=PASS
DEVICE_AUTHENTICATED_POLL_RESULT=PASS
DEVICE_AUTHENTICATED_POLL_MARKER_COUNT_AT_ACCEPTANCE=11
DEVICE_ROW_COUNT_AT_ACCEPTANCE=1
READY_NODE_COUNT_AT_ACCEPTANCE=0
READONLY_READY_NODE_COUNT_AT_ACCEPTANCE=0
WAITING_DEVICE_COUNT_AT_ACCEPTANCE=0
WAITING_HUMAN_COUNT_AT_ACCEPTANCE=1
CURRENT_BLOCKED_NODE=EXACTLY_ONE_COMBINED_EN_JA_MULTI_TURN_VOICE_AI_PHYSICAL_SOAK
CANONICAL_REVIEWER=GROK_4_6
GROK_MODEL_SELECTOR=grok-4.6
NO_ZAI_RETRY=true
NO_SILENT_REVIEWER_FALLBACK=true
```

The current accepted backend lineage is the reviewed backend-only observability repair:

```text
BACKEND_SOURCE_COMMIT=07248b6830dd0c66ffcfb09229486d3516896a76
BACKEND_TAG=slate:m4-observability-07248b6
BACKEND_LOCAL_IMAGE_ID=sha256:8f886de7c1c369ff1ea3055ee838ebc5d242306fa6f22df624eb176723ea97be
BACKEND_ARCHIVE_SHA256_LOCAL=2b9dcab1a1378aed84ba7c365534094939ccd3aad912c116390570420512aeb8
BACKEND_CONFIG_DIGEST_MATCH=YES
BACKEND_ORDERED_LAYER_IDENTITY_MATCH=YES
FIRMWARE_BYTES_CHANGED_BY_OBSERVABILITY_REPAIR=NO
```

Before any runtime-sensitive action, reconcile the actually running backend image/config and active firmware identity. Do not silently assume a stale report identity is still active.

## Primary objectives

Execute continuously until the campaign reaches one of the allowed terminal conditions below.

### Objective A — consume the one physical soak once

Use the exact procedure in:

`docs/campaign-reports/08D1M-G-M4-EXACT-COMBINED-EN-JA-MULTITURN-SOAK.md`

The soak remains:

```text
PHYSICAL_SOAK_COUNT=1
TARGET_USER_TURNS=8
LANGUAGE_MIX=4_EN_4_JA_ALTERNATING
BLIND_RETRY_ALLOWED=NO
```

Before asking the operator to start, verify only:

- sanitized observer running and connected;
- Slate healthy;
- MySQL healthy;
- network-qualified authenticated NOTE4 path remains valid;
- no unexpected runtime/config/firmware identity change since the accepted checkpoint.

Then return exactly one human instruction: the soak is armed. Do not insert another pre-soak report handoff merely because readiness checks passed.

### Objective B — ingest the physical result immediately

After the single soak is consumed, do not ask the operator to summarize routine internals or repeat the session.

Combine operator-visible observations with sanitized structural evidence only.

Required classifications include, where evidence exists:

```text
PHYSICAL_SOAK_CONSUMED=YES
TURN_COUNT_OBSERVED=
EARLY_TURN_LATENCY_CLASS=
LATE_TURN_LATENCY_CLASS=
PROGRESSIVE_LATENCY_DEGRADATION=
APPARENT_FREEZE=
VOICE_SERVICE_ERROR=
BUBBLE_ORDER_CORRECT=
ONE_BUBBLE_PER_ROLE_BEHAVIOR=
JAPANESE_KANA_RENDERING=
JAPANESE_NO_GLYPH=
AUDIBLE_ASSISTANT_AUDIO=
VOICE_AI_EXIT=
UNEXPECTED_REBOOT_OR_SETTINGS_RETURN=
PROVIDER_READY_TO_FIRST_OUTPUT_TREND=
TRANSCRIPT_FINAL_LATENCY_TREND=
BACKEND_EVENT_QUEUE_TREND=
NODE_BRIDGE_STDIO_BACKLOG_TREND=
PRE_PROVIDER_MIC_QUEUE_TREND=
FIRMWARE_UI_EVENT_QUEUE_TREND=
FIRMWARE_AUDIO_QUEUE_TREND=
HEAP_INTERNAL_FREE_TREND=
HEAP_PSRAM_FREE_TREND=
RESET_REASON_CLASS=
WATCHDOG_REASON_CLASS=
VOICE_WS_CLOSE_CLASS=
PROVIDER_SESSION_STATUS=
FIRST_MIC_FRAME_STATUS=
AUDIO_CHAIN_STATUS=
FATAL_MARKER_COUNT=
SLATE_RESTART_COUNT=
MYSQL_RESTART_COUNT=
```

Do not claim causality from a correlation or missing marker. Preserve `UNKNOWN` when evidence does not mechanically support a stronger statement.

## Continuous decision graph after the soak

### Branch 1 — stability PASS

M4 stability passes only when the combined evidence supports:

- no progressive latency degradation across the eight-turn session;
- no apparent freeze;
- no unexpected reset/watchdog event;
- correct user/assistant ordering;
- no fragment-created extra bubbles or pathological e-ink redraw churn;
- Japanese kana including `の` renders correctly;
- assistant audio is audible;
- Voice AI exits cleanly;
- no Voice service unavailable/error path;
- Slate/MySQL remain healthy.

If those conditions pass:

1. publish and push the exact physical-soak result;
2. update `CAMPAIGN-STATE.md` and close the progressive-lag/freeze acceptance node;
3. reconcile backend, firmware and observer identities;
4. complete privacy/security and residual-risk accounting;
5. classify baseline latency separately from stability;
6. if response latency is still materially slow, open a distinct `M4_BASELINE_PROVIDER_LATENCY_OPTIMIZATION` node;
7. continue automatically into all safe non-provider latency attribution and optimization work;
8. do not merge/release PR #2.

A stable-but-slow run is not a stability failure.

### Branch 2 — physical soak FAIL or ambiguous

The single physical attempt is consumed. No immediate blind retry is allowed.

Automatically continue through the deepest safe evidence-based diagnosis available, including:

1. reconstruct early/late turn timing from sanitized markers;
2. identify the earliest mechanically supported failed boundary;
3. compare provider-ready/output timing against backend, bridge, transcript, mic, firmware UI/audio and resource trends;
4. inspect current exact source and runtime lineage;
5. reproduce with deterministic/host/provider-disabled tests where applicable;
6. test queue/backpressure/resource hypotheses independently instead of assuming the prior UI-event mechanism is still causal;
7. inspect reset/watchdog/WS/session-close evidence;
8. isolate firmware versus backend versus provider baseline behavior;
9. publish the diagnosis checkpoint;
10. continue immediately if safe work remains.

Do not return merely because the physical soak failed.

## Bounded implementation and review loop

When deterministic evidence justifies a code repair:

```text
CODEX_ADJUDICATION
  -> AGY_IMPLEMENTATION=gemini-3.8-flash-high
  -> FOCUSED_TESTS
  -> IMPACTED_TYPECHECK_LINT_FORMAT_BUILD
  -> RELEVANT_HOST_SOAK_OR_REPLAY
  -> PRIVACY_SECRET_SCAN
  -> GIT_DIFF_CHECK
  -> EXACT_SOURCE_FREEZE
  -> FRESH_GROK_4_6_REVIEW
```

The implementation worker must make the minimum justified repair. Do not bundle unrelated cleanup.

The canonical independent reviewer is Grok 4.6 using the established direct route:

`grok -m grok-4.6`

Reviewer handling:

- PASS with no blocking P0/P1/P2/security issue: continue;
- REVISE: Codex adjudicates each finding, accepts only justified findings, sends the accepted repair to the same AGY worker, reruns deterministic gates, freezes a new exact source SHA, and runs a fresh Grok 4.6 review automatically;
- reviewer transport/auth failure: perform bounded same-route recovery; do not silently substitute ZAI or another reviewer;
- no deployment/flash/provider action from unreviewed changed production bytes.

A review PASS is not a stop.
A review REVISE loop is not a stop while repair remains safe.

## Artifact and authority rule

Documentation/report-only commits do not invalidate a previously accepted product artifact.

If production backend or firmware bytes change:

1. finish all safe deterministic qualification, exact build/freeze, privacy/secret checks, reviewer loops and artifact lineage work automatically;
2. determine mechanically whether an existing bounded deployment/flash authorization remains valid for the new artifact under `AUTONOMY-AND-HUMAN-GATE-POLICY.md`;
3. if valid, continue under that existing authority;
4. if artifact identity changes invalidate the authorization pin, stop only at the exact new deployment/flash human gate after the candidate is fully qualified.

This directive itself does not create new production-deploy, production-restart, firmware-flash, provider-budget, credential, billing, OAuth, private-data, Calendar or Outlook authority.

Do not repeatedly stop before the authority boundary while safe qualification work remains.

## Baseline latency optimization node

If M4 stability passes but latency remains materially slow, treat latency as an independent optimization problem.

Start with zero-new-provider-call attribution:

- compare early and late provider-ready-to-first-output timing;
- distinguish connection/session creation latency from provider inference latency;
- inspect Node bridge startup/session reuse behavior;
- inspect turn-complete/transcription timing;
- inspect pre-provider mic buffering and audio framing;
- inspect backend event/coalescer delays;
- inspect firmware render/audio scheduling only where markers support relevance;
- determine whether session reuse is actually occurring as designed;
- check whether conversational context growth causes provider-side delay;
- inspect configured model/runtime path and existing approved timeout/buffering settings;
- run deterministic synthetic/replay benchmarks that do not consume new provider authority.

Do not optimize latency by weakening:

- privacy;
- authentication;
- turn ordering;
- one-bubble-per-role semantics;
- Japanese rendering;
- audio correctness;
- stale-generation protection;
- reconnect/session-close handling;
- queue/resource bounds.

If useful safe work produces a latency candidate, qualify and review it completely before any new provider/deployment authority gate.

If a real provider session is genuinely required and no existing authorized session remains, publish the exact hypothesis, candidate identity, required maximum session count, expected evidence, and stop at that provider-budget gate. Do not consume an unapproved provider call.

## Observer and privacy invariants

Retain only sanitized structural evidence.

Never retain or publish:

- raw microphone audio;
- raw transcripts;
- provider request/response payloads;
- API keys or secret file contents;
- OAuth/access/refresh tokens;
- auth headers;
- device ID, MAC, SSID, IP-derived private identifiers;
- Calendar or Outlook contents;
- unrelated private NOTE4 payloads.

Allowed structural data includes fixed markers, status classes, bounded counters, timing deltas, sanitized close/error classes, queue depths, heap/PSRAM totals/trends, restart counts and reviewed non-secret artifact identities.

## Durable checkpoint behavior

`REPORT-PUSH-INVARIANT.md` is mandatory.

At each meaningful checkpoint:

1. update the exact report;
2. update `CAMPAIGN-STATE.md` when stage/status/frontier changes;
3. ensure the top authoritative state reflects the current active frontier rather than an older product checkpoint;
4. run `git diff --check` and secret-safe report scan;
5. selectively commit;
6. push;
7. fetch/verify the remote branch;
8. record the exact pushed SHA;
9. verify PR #2 is still OPEN / DRAFT / UNMERGED;
10. continue immediately if another READY or READONLY_READY node exists or the next step is already authorized.

A checkpoint push is not a handoff.

## Work-queue invariant

Before every controller exit, compute:

```text
CURRENT_HEAD=
CURRENT_STAGE=
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

Rules:

- if `READY_NODE_COUNT > 0`, continue;
- if `READONLY_READY_NODE_COUNT > 0`, continue;
- a reviewer pass is not terminal;
- a report push is not terminal;
- a build/deploy/flash completion is not terminal if further already-authorized qualification remains;
- a recoverable test/infrastructure failure is not terminal;
- a failed physical/provider attempt is not terminal while zero-provider/nonphysical diagnosis remains;
- a blocked node does not block independent READY/READONLY_READY work.

## Allowed terminal reasons

Return control only for one of these conditions:

```text
TERMINAL_REASON=WAITING_FOR_CURRENT_EXACT_8_TURN_PHYSICAL_SOAK
TERMINAL_REASON=NEW_PROVIDER_BUDGET_REQUIRED
TERMINAL_REASON=NEW_PRODUCTION_DEPLOYMENT_OR_RESTART_AUTHORITY_REQUIRED
TERMINAL_REASON=NEW_FIRMWARE_FLASH_AUTHORITY_REQUIRED
TERMINAL_REASON=NEW_CREDENTIAL_OR_OAUTH_ACTION_REQUIRED
TERMINAL_REASON=NEW_BILLING_OR_PROVIDER_POLICY_DECISION_REQUIRED
TERMINAL_REASON=NEW_PRIVATE_DATA_SCOPE_REQUIRED
TERMINAL_REASON=UNRESOLVED_P0_P1_SECURITY_PRIVACY_OR_DATA_INTEGRITY_BLOCK
TERMINAL_REASON=REPOSITORY_PUSH_OR_AUTH_CONFLICT
TERMINAL_REASON=PR_MERGE_OR_RELEASE_AUTHORITY_REQUIRED
TERMINAL_REASON=CAMPAIGN_SCOPE_EXPANSION_REQUIRED
TERMINAL_REASON=CAMPAIGN_COMPLETE_NO_READY_WORK
```

Do not invent a human gate merely because the next step is inconvenient or long-running.

## Campaign completion criteria

M4 is complete only when all applicable acceptance and accounting are durable:

- network qualification PASS;
- one combined physical soak consumed and classified;
- progressive-lag/freeze node closed or a precisely bounded unresolved gate remains;
- bubble-order acceptance accounted;
- Japanese glyph acceptance accounted;
- audible-audio acceptance accounted;
- Voice exit/recovery accounted;
- backend/firmware identities reconciled;
- observer evidence accounted;
- privacy/secret scan status durable;
- reviewer status durable for the final changed production bytes;
- residual provider latency separated and either closed, moved into a bounded optimization node, or parked at an exact authority gate;
- no READY/READONLY_READY work remains in this campaign;
- final M4 dossier and `CAMPAIGN-STATE.md` pushed and remote-verified.

Do not automatically expand into Campaign 9 / PR #3 or another unrelated product campaign. If M4 fully completes and no in-scope work remains, stop with `CAMPAIGN_COMPLETE_NO_READY_WORK` while keeping PR #2 OPEN / DRAFT / UNMERGED.

## Immediate next action

Reconcile the live branch against this directive, current state and exact soak directive.

If runtime identity and health remain accepted, arm the already-defined one continuous 8-turn EN/JA physical soak and return only for that human action.

After the soak is consumed, resume this long continuous directive automatically and do not return for routine intermediate results.
