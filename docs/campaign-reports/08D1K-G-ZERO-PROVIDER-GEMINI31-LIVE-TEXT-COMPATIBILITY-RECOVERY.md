# Campaign 8D1K-G — Zero-provider Gemini 3.1 Live text-transport compatibility recovery

Date authorized: 2026-09-03 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## 1. Purpose

Campaign 8D1K-F recovered the historical protected Gemini credential mechanism and spent its one separately authorized full-Slate-adapter provider call. The call failed before any model event/turn completion with the same sanitized `SLATE_ADAPTER_ERROR` class previously seen in historical 8D1K Call 3.

No additional Gemini provider call is authorized by this campaign.

This campaign exists to perform a **zero-provider compatibility correction and observability recovery** before any further real-provider authorization is considered.

## G1 forensic checkpoint — sanitized F2 reconstruction

The exact F2 disposable container was checked by ID using filtered Docker
metadata only. The remote daemon returned `no such object`; therefore no
container metadata, environment, mount metadata, or logs remained available
to inspect in this session. No removal command was issued.

The already-pushed F2 report and durable-result evidence remain the complete
sanitized record: the full adapter exited 21 before a model event or turn
completion, reported `SLATE_ADAPTER_ERROR`, did not OOM, and the result was
recovered independently. The prior report records the protected bind as
read-only and the input/tool/private-data invariants as satisfied.

```text
G1_F2_CONTAINER_METADATA=NOT_PRESENT_NO_SUCH_OBJECT
G1_F2_CONTAINER_REMOVAL=NOT_PERFORMED
F2_STAGE_REACHED=UNKNOWN
F2_BRIDGE_ERROR_CODE=UNKNOWN
F2_CHILD_EXIT=UNKNOWN
F2_READY_OBSERVED=NO
F2_TEXT_FRAME_SENT=UNKNOWN
F2_RESULT_EVIDENCE_PRESERVED=YES
F2_RAW_PROVIDER_ERROR_READ=NO
F2_CREDENTIAL_VALUE_READ=NO
PROVIDER_CALLS_THIS_CAMPAIGN=0
```

This evidence does not prove the historical F2 failure occurred at text send;
the text-transport attribution remains plausible but not live-proven.

The primary current hypothesis is now grounded in current official Google Gemini 3.1 Live documentation rather than only runtime inference:

- current Slate Node bridge conversational text transport uses `session.sendClientContent(...)`;
- Google now documents that for `gemini-3.1-flash-live-preview`, `send_client_content` / `sendClientContent` is supported only for seeding initial context history when the corresponding history configuration is enabled;
- Google instructs applications to use `send_realtime_input` / `sendRealtimeInput({ text })` for text updates during a Gemini 3.1 Live conversation.

Current official documentation checked on 2026-09-03:

- https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview
- https://ai.google.dev/gemini-api/docs/live-api/capabilities

This is a real API-compatibility mismatch in the current Node bridge text path. It is a valid bounded product/runtime correction regardless of whether it is ultimately proven to be the sole cause of the F2 failure.

Do **not** claim historical or F2 root cause conclusively until the corrected artifact is eventually revalidated through a separately authorized real-provider call.

## 2. Starting evidence

Start by fetching and reconciling the latest live PR #2 remote state.

Accepted F2 terminal evidence before this directive:

```text
CAMPAIGN=8D1K_F
STATUS=HARD_STOP_EXACT_FULL_ADAPTER_REAL_PROVIDER_REVALIDATION_FAILURE
F1=PASS
F2=FAIL
F2_FAILURE_CLASS=SLATE_ADAPTER_ERROR
F2_MODEL=gemini-3.1-flash-live-preview
F2_MODEL_EVENT=NO
F2_TURN_COMPLETE=NO
F2_TOOL_INVOCATIONS=0
F2_SEARCH_EXECUTED=NO
F2_PRIVATE_DATA_SENT=NO
F2_GENERATED_AUDIO_RETAINED=NO
F2_OOM=NO
F2_EXIT=21
F2_RESULT_RECOVERED_INDEPENDENTLY=YES
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
SOURCE_DEFECT_PROVEN=NO
SOURCE_CORRECTION_MADE=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
```

Recovered protected credential mechanism, for metadata/reference only:

```text
SOURCE_HOST=note4-orangepi
SOURCE_PATH=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
SOURCE_OWNER=pi
SOURCE_GROUP=pi
SOURCE_MODE=600
SOURCE_TYPE=REGULAR_NON_SYMLINK_FILE
CONTAINER_DESTINATION=/run/secrets/gemini_api_key
READ_ONLY_BIND=YES
```

Never read, print, copy, move, hash, upload, commit or otherwise expose the credential value.

## 3. Provider-call accounting

Historical provider accounting remains immutable:

```text
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
```

Campaign G authorizes:

```text
CAMPAIGN=8D1K_G
PROVIDER_CALLS_AUTHORIZED=0
PROVIDER_CALLS_USED=0
```

No Gemini network/provider call, SDK live-connect probe, direct Node provider control, tool call, Search call, or metadata operation that consumes provider quota is authorized.

## 4. Controller routing

Use the existing routing:

- controller/stage authority: **Luna**;
- bounded implementation/correction worker: **Sonnet 4.6**;
- independent reviewer: exact **GLM-5.3-Flash** via `zai-glm53-reviewer`, read-only;
- **Codex**: sole repository writer/integrator/validator/checkpoint publisher.

No silent substitution.

Do not use GLM-5.2, Hermes, Grok, Gemini, AGY, another ZAI profile, or Claude as the independent final reviewer for this campaign.

## 5. Non-negotiable invariants

Preserve:

- production Developer API / Node bridge fail-closed under `NODE_ENV=production`;
- no production deployment/restart/config mutation;
- backend remains model authority;
- NOTE4 stores no Gemini/Google credential and does not call Gemini directly;
- Gemini API credential remains runtime-only/backend-only;
- protected credential references remain limited to trusted runtime secret roots;
- Outlook remains read-only and isolated from Gemini;
- Google Calendar remains proposal-only until physical NOTE4 confirmation;
- no direct Calendar write exposed through this work;
- billing remains off/unattached;
- Vertex remains disabled;
- no firmware flash;
- no PR #2 merge;
- no Campaign 6D, PR #1, PR #3, Airtable, Immich, storage, package cleanup or unrelated host work.

## 6. G0 — Fresh reconciliation and preserve F2 evidence

Before editing:

1. `git fetch origin --prune`;
2. verify PR #2 remains open, draft, unmerged;
3. reconcile local worktree with current remote head without overwriting unrelated user work;
4. read:
   - `AGENTS.md`;
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`;
   - `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`;
   - `docs/campaign-reports/CAMPAIGN-STATE.md`;
   - `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
   - `docs/campaign-reports/08D1K-E-LONGRUN-REVIEW-CLOSURE-AND-REVALIDATION.md`;
   - `docs/campaign-reports/08D1K-F-ONE-CALL-EXACT-ADAPTER-PROVIDER-REVALIDATION.md`;
   - this directive;
5. record exact product/runtime source SHA before G corrections;
6. confirm F2 budget is consumed `1_OF_1` and G budget is `0`;
7. preserve any still-existing dead F2 disposable container/result metadata until G1 evidence inspection finishes.

Do not delete recoverable F2 evidence merely for cleanup convenience.

## 7. G1 — Zero-provider F2 forensic reconstruction

Before source edits, exhaust safe evidence from the failed F2 disposable artifacts.

Allowed:

- filtered `docker ps -a`/inspect for the exact F2 container;
- exact container exit/OOM/status/timestamps;
- mount metadata;
- sanitized durable result file already generated by the harness;
- container logs only if the harness design already guarantees they contain no credential/raw provider payload;
- exact launcher/driver source retained locally if it contains no secret;
- campaign shell/session history needed to reconstruct the exact F2 configuration, with secret-bearing material redacted/avoided.

Do not:

- dump the full environment;
- print secret values;
- read production `.env`;
- print raw provider error bodies;
- copy provider payloads into Git/reports.

Determine as precisely as possible:

```text
F2_STAGE_REACHED=<before_child_spawn|child_started|provider_connect_started|ready_observed|text_sent|provider_error_after_text|unknown>
F2_BRIDGE_ERROR_CODE=<safe code or UNKNOWN>
F2_CHILD_EXIT=<...>
F2_READY_OBSERVED=<YES|NO|UNKNOWN>
F2_TEXT_FRAME_SENT=<YES|NO|UNKNOWN>
```

If the dead disposable container can be safely removed after all sanitized evidence is recovered, remove only that exact disposable dead container and record cleanup. Do not touch production containers/images.

## G2–G6 deterministic correction checkpoint

### G2 compatibility and boundary audit

The current Node runtime ordinary text branch was confirmed to use the
incompatible post-connect `sendClientContent` path. The bounded correction is
to use `sendRealtimeInput({ text })`; audio, audio-end, tool-response,
reconnect, close, and the production Bun/2.5 path are unchanged.

The SDK's `LiveServerMessage.text` and `.data` accessors concatenate all text
and inline-data parts from a model turn, while the bridge forwards the complete
server message. Downstream Slate processing therefore does not assume one
part; this is recorded as `SERVER_MULTIPART_EVENT_AUDIT=PASS_NO_CHANGE`.

Search-disabled tool evidence is now represented accurately:

```text
SEARCH_DECLARED=NO
CUSTOM_FUNCTIONS_DECLARED=YES
CUSTOM_FUNCTION_NAMES=propose_google_calendar_event,get_btc_price
TOOL_INVOCATIONS=0_IN_PROVIDER_DISABLED_FIXTURES
```

### G3/G4 bounded implementation

The Node runtime now sends ordinary text with `sendRealtimeInput({ text })`.
The private bridge also carries a bounded internal `GeminiLiveBridgeFailure`
stage enum covering configuration rejection, child spawn, credential,
protocol, pre-ready provider connection, post-ready provider error, text-send,
unexpected-close, timeout, and unknown-safe failures. Service/device-facing
messages remain generic; no raw provider detail is retained or logged.

### G5/G6 validation evidence

```text
G31_TEXT_TRANSPORT_COMPATIBILITY=DEFECT_CONFIRMED
TEXT_TRANSPORT_CORRECTED=YES
SAFE_FAILURE_STAGE_OBSERVABILITY=IMPROVED
TARGETED_BRIDGE_SERVICE_TESTS=PASS
FULL_BACKEND_HOST=327_PASS_0_FAIL_4_SECRET_GATED_SKIP
FULL_BACKEND_ARM64=331_PASS_0_FAIL
SHARED_TESTS=6_PASS_0_FAIL
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
NODE_SYNTAX_CHECK=PASS
ARM64_CANDIDATE_BUILD_PRECOMMIT=PASS
ARM64_NODE_VERSION=22.22.2
ARM64_BUN_VERSION=1.4.0
ARM64_GENAI_NODE_SDK_LOAD=PASS_NO_PROVIDER_CALL
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
PROVIDER_DISABLED_MODEL_EVENT_SHAPE=PASS
PROVIDER_DISABLED_TURN_COMPLETE_SHAPE=PASS
PRIVATE_DATA_FIXTURES=NONE
PROVIDER_CALLS_THIS_CAMPAIGN=0
```

The four host skips are the pre-existing integration tests gated on a
synthetic `/run/secrets` fixture; the architecture-matched run supplied only
that disposable synthetic fixture and executed all 331 backend tests. No
production secret or environment was mounted.

## 8. G2 — Official Gemini 3.1 Live compatibility audit

Audit the exact current Node bridge and service behavior against current official Gemini 3.1 Flash Live guidance.

### G2.1 Conversational text transport — confirmed mismatch

Current Node runtime behavior in `gemini-live-node-bridge-runtime.mjs` uses the equivalent of:

```text
session.sendClientContent({ turns: [...], turnComplete: true })
```

for ordinary post-connect user text frames.

Current Google Gemini 3.1 Live guidance requires conversational text updates to use:

```text
session.sendRealtimeInput({ text })
```

`sendClientContent` is reserved for seeding initial history under the relevant history configuration.

Classify:

```text
G31_TEXT_TRANSPORT_COMPATIBILITY=DEFECT_CONFIRMED
```

This correction does not require a real-provider call to justify implementation.

### G2.2 Server-event shape audit

Google also documents that a Gemini 3.1 Live server event may contain multiple content parts simultaneously.

Audit Slate's downstream server-event processing to confirm it does not assume exactly one part/event and silently drop audio/transcript/content parts.

Do not broaden scope unnecessarily. If current code already forwards/iterates all parts safely, record `PASS_NO_CHANGE`.

### G2.3 Tool-policy evidence reconciliation

Current `buildGeminiToolRegistry(false)` disables Search but still returns custom function declarations for Calendar proposal and BTC.

Therefore verify the exact F2 harness and correct the durable evidence if necessary:

- `SEARCH_EXECUTED=NO` can remain if proven;
- `TOOL_INVOCATIONS=0` can remain if proven;
- do **not** claim `TOOLS_DISABLED=YES` if the full Slate adapter actually declared custom functions.

This is an evidence accuracy issue and does not by itself prove the F2 provider failure cause. Gemini 3.1 Flash Live officially supports function calling.

For future exact full-product validation, distinguish:

```text
SEARCH_DECLARED=<YES|NO>
CUSTOM_FUNCTIONS_DECLARED=<YES|NO>
TOOL_INVOCATIONS=<count>
```

rather than conflating declaration with execution.

## 9. G3 — Bounded source correction

Luna selects the minimum correction; Sonnet 4.6 performs bounded implementation analysis; Codex remains sole writer.

Required correction for the Node Developer API bridge:

- ordinary `text` protocol frames for `gemini-3.1-flash-live-preview` must use the SDK's Gemini 3.1-compatible real-time text-input path (`sendRealtimeInput({ text: ... })`);
- do not use `sendClientContent` for ordinary conversational text turns on the 3.1 Node bridge;
- preserve existing audio, audio-end, tool-response, reconnect and close behavior unless exact evidence requires another bounded change;
- preserve the existing Bun/Vertex production behavior for the retained 2.5 production model unless separately justified;
- do not weaken production guard or secret boundaries.

If the implementation can be made model-explicit without unnecessary abstraction, prefer the narrowest approach.

## 10. G4 — Safe observability hardening

The repeated durable result `SLATE_ADAPTER_ERROR` is too coarse for efficient provider debugging.

Improve only **sanitized internal classification**, not raw provider logging.

Goal: a future one-call result should be able to distinguish at minimum:

```text
CONFIG_REJECTED_BEFORE_CHILD
CHILD_SPAWN_FAILED
BRIDGE_CREDENTIAL_UNAVAILABLE
BRIDGE_PROTOCOL_REJECTED
PROVIDER_CONNECT_FAILED_BEFORE_READY
READY_THEN_PROVIDER_ERROR
READY_THEN_TEXT_SEND_ERROR
SESSION_CLOSED_UNEXPECTEDLY
CONNECT_TIMEOUT
UNKNOWN_SAFE_FAILURE
```

Requirements:

- never include raw provider error message/body;
- never include credential material;
- public/user-facing behavior may remain generic;
- durable campaign harness may consume only the bounded safe enum/category;
- error-category additions must be deterministically tested;
- do not create a public listener or side channel.

If exact implementation evidence shows a narrower safe classification scheme is preferable, Luna may choose it, but future real-provider failures must no longer collapse all meaningful stages into only `SLATE_ADAPTER_ERROR`.

## 11. G5 — Deterministic tests

Add/update tests that prove at minimum:

1. Gemini 3.1 Node bridge ordinary text frames call `sendRealtimeInput({ text })`;
2. Gemini 3.1 ordinary text frames do not call `sendClientContent`;
3. audio path remains unchanged;
4. tool-response path remains unchanged;
5. Search-disabled registry behavior is represented accurately in tests/reporting;
6. safe failure-stage classifications preserve no raw provider text;
7. credential/path checks remain fail-closed;
8. production `NODE_ENV=production` Developer API guard remains fail-closed;
9. provider-disabled full Bun-parent → Node-child adapter still reaches ready, accepts synthetic text through the corrected method, emits synthetic server event/turn-complete-shaped event, and closes cleanly;
10. no private payload enters fixtures.

Use mock SDK/session objects or provider-disabled child shims. Make **zero real Gemini calls**.

## 12. G6 — Full deterministic and ARM64 validation

Against the final corrected source SHA run:

- targeted bridge/runtime/service tests;
- full backend suite;
- shared suite;
- lint;
- typecheck;
- format check;
- frontend production build;
- `git diff --check`;
- Node syntax checks for bridge `.mjs` files;
- secret scan across implementation/tests/reports/build metadata;
- reproducible linux/arm64 candidate build;
- verify Node runtime/version;
- verify `@google/genai/node` loads without provider call;
- exact provider-disabled ARM64 full-adapter E2E;
- image history/layer/env credential scan.

No provider call is allowed merely because deterministic gates pass.

## 13. G7 — Exact GLM-5.3-Flash independent review

Because product/runtime source is expected to change, obtain a fresh exact-SHA read-only review from:

```text
PROFILE=zai-glm53-reviewer
PROVIDER=ZAI
MODEL=glm-5.3-flash
```

Review focus:

1. correctness of Gemini 3.1 text transport migration;
2. no regression to production 2.5/Bun behavior;
3. safe error classification without raw provider leakage;
4. secret/runtime-root boundaries preserved;
5. server multi-part event handling audit;
6. tool declaration/execution evidence accuracy;
7. production guard preserved;
8. Outlook/Calendar invariants preserved;
9. test realism;
10. any P0/P1/P2/P3 findings.

Luna adjudicates all findings. Correct credible P0/P1/P2 as required, with maximum three bounded correction/re-review cycles.

No provider call is authorized during review.

## 14. G8 — Final dossier and next boundary

Publish a precise causal statement.

Preferred language if all deterministic evidence passes:

```text
REPEATED_REAL_PROVIDER_SYMPTOM=full_Slate_adapter_failed_before_model_event_with_sanitized_SLATE_ADAPTER_ERROR
G31_TEXT_TRANSPORT_DEFECT=CONFIRMED_BY_CURRENT_OFFICIAL_API_CONTRACT
F2_FAILURE_ATTRIBUTION_TO_TEXT_TRANSPORT=PLAUSIBLE_NOT_LIVE_PROVEN
TEXT_TRANSPORT_CORRECTED=YES
SAFE_FAILURE_STAGE_OBSERVABILITY=IMPROVED
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
```

Do not claim the text-transport mismatch definitely caused F2 unless evidence recovered in G1 directly proves the failure occurred at/after text send in a way that supports that conclusion.

If the corrected artifact passes all deterministic/reviewer gates, stop at:

```text
CAMPAIGN=8D1K_G
STATUS=READY_FOR_HUMAN_DECISION_ON_ONE_CORRECTED_EXACT_ADAPTER_PROVIDER_REVALIDATION
FINAL_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_ONE_NEW_CORRECTED_EXACT_ADAPTER_PROVIDER_CALL
```

Do not start 8D1L until a later separately authorized corrected real-provider full-adapter call passes.

## 15. Durable publication

Obey `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`.

At every terminal checkpoint:

1. update `docs/campaign-reports/08-GEMINI-35-LIVE.md`;
2. append evidence to this directive;
3. update `docs/campaign-reports/CAMPAIGN-STATE.md`;
4. secret-check report content;
5. `git diff --check`;
6. selectively commit authorized changes;
7. push active branch;
8. fetch/verify exact remote SHA;
9. verify PR #2 remains open/draft/unmerged;
10. post concise PR checkpoint with source SHA, GLM verdict, deterministic gates, zero-provider count, production state and next human boundary.

A local-only report is not a completed checkpoint.

## 16. Hard stops

Stop immediately for:

- credential/private-data exposure;
- need for a real Gemini provider call;
- unresolved credible P0;
- persistent credible P1 after bounded cycles;
- production deployment/restart/config change;
- billing/Vertex change;
- firmware flash;
- PR merge;
- Calendar confirmation bypass;
- Outlook exposure;
- destructive host/storage/package operation;
- unreconcilable repository conflict.

Do not stop for routine recoverable deterministic setup work. Exhaust safe zero-provider recovery paths first.

## 17. Controller liveness

Continue autonomously through G0 → G1 → G2 → G3 → G4 → G5 → G6 → G7 → G8 while authorized and no hard stop occurs.

Do not return control merely because:

- one test failed and can be fixed deterministically;
- formatting/lint requires a bounded correction;
- reviewer has non-blocking findings;
- a disposable mock/container needs safe cleanup;
- one deterministic substage completes.

Normal intended human boundary is the final decision whether to authorize **one new corrected exact full-Slate-adapter provider call**.

No Gemini provider call is authorized by 8D1K-G.

## G7 — Exact GLM-5.3-Flash review and Luna adjudication

The exact reviewer route was preflighted without repository content and
returned `REVIEW_ROUTE_PREFLIGHT_OK PROVIDER=ZAI MODEL=glm-5.3-flash`.
An initial broad read-only review attempt exceeded the bounded 300-second
wall clock (`REVIEW_EXIT=124`) while inspecting the repository; this was
classified as `REVIEWER_ROUTE_EXECUTION_TIMEOUT`, not as a source finding.
A scope-limited retry supplied only the exact source diff and sanitized
deterministic evidence, and completed successfully.

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=READ_ONLY
REVIEWED_SHA=7a724488a9ed20093469caefc03addc764185be5
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
GLM53_P3=2
REVIEW_REQUIRED_ACTION=NONE
PROVIDER_CALLS_THIS_CAMPAIGN=0
SECRET_EXPOSED=NO
```

Luna adjudicated both P3 observations as non-blocking and deferred without
source correction: (1) a startup stdin failure is conservatively classified
as `CHILD_SPAWN_FAILED`; and (2) the runtime compatibility assertion is a
static contract test, with live-provider event testing intentionally outside
this zero-provider authorization. Neither observation is P0/P1/P2, and the
existing deterministic tests cover the bounded behavior and secret boundary.

## G8 — Final zero-provider dossier and human boundary

```text
CAMPAIGN=8D1K_G
STATUS=READY_FOR_HUMAN_DECISION_ON_ONE_CORRECTED_EXACT_ADAPTER_PROVIDER_REVALIDATION
FINAL_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
FULL_TESTS=PASS
ARM64_BUILD=PASS
PROVIDER_DISABLED_FULL_ADAPTER_E2E=PASS
PROVIDER_CALLS_THIS_CAMPAIGN=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
REPEATED_REAL_PROVIDER_SYMPTOM=full_Slate_adapter_failed_before_model_event_with_sanitized_SLATE_ADAPTER_ERROR
G31_TEXT_TRANSPORT_DEFECT=CONFIRMED_BY_CURRENT_OFFICIAL_API_CONTRACT
F2_FAILURE_ATTRIBUTION_TO_TEXT_TRANSPORT=PLAUSIBLE_NOT_LIVE_PROVEN
TEXT_TRANSPORT_CORRECTED=YES
SAFE_FAILURE_STAGE_OBSERVABILITY=IMPROVED
SERVER_MULTIPART_EVENT_AUDIT=PASS_NO_CHANGE
SEARCH_DECLARED=NO
CUSTOM_FUNCTIONS_DECLARED=YES
TOOL_INVOCATIONS=0_IN_PROVIDER_DISABLED_FIXTURES
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
READY_FOR_NEW_PROVIDER_VALIDATION_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_AUTHORIZE_OR_REJECT_ONE_NEW_CORRECTED_EXACT_ADAPTER_PROVIDER_CALL
```

The image-boundary checks completed without provider access: the candidate
image is `linux/arm64`, its image ID is
`sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d`,
no Gemini/API-key/Vertex/Google environment or history match was found, the
runtime credential destination and `/app/.env` are absent, and no public
bridge listener exists. No production command, credential, private fixture,
or generated audio was used. 8D1L and 8D1M remain prohibited until a later
human authorization, and this report is the final G human-boundary record.

## G9 — One separately authorized corrected exact-adapter revalidation: F1 pre-call checkpoint

The human explicitly authorized one new corrected full-Slate-adapter Gemini
provider validation after the G8 boundary. This is a new budget and does not
alter historical accounting or the already-consumed 8D1K-F budget.

```text
CAMPAIGN=8D1K_G_CORRECTED_PROVIDER_REVALIDATION
STATUS=F1_PASS_READY_TO_SPEND_ONE_AUTHORIZED_CALL
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=0_OF_1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
MODEL=gemini-3.1-flash-live-preview
AUTH_MODE=developer_api_key
LIVE_RUNTIME=node_bridge
NODE_ENV=test
CREDENTIAL_SOURCE_HOST=note4-orangepi
CREDENTIAL_SOURCE_PATH=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
CREDENTIAL_SOURCE_OWNER=pi
CREDENTIAL_SOURCE_GROUP=pi
CREDENTIAL_SOURCE_MODE=600
CREDENTIAL_SOURCE_TYPE=REGULAR_NON_SYMLINK_FILE
CREDENTIAL_SOURCE_SIZE_BYTES=53
CREDENTIAL_SOURCE_NONEMPTY=YES
CREDENTIAL_CONTAINER_DESTINATION=/run/secrets/gemini_api_key
CREDENTIAL_READ_ONLY_BIND=YES
CREDENTIAL_VALUE_READ=NO
CREDENTIAL_VALUE_PRINTED=NO
CREDENTIAL_VALUE_COPIED_OR_MOVED=NO
PRODUCTION_ENV_USED=NO
SEARCH_ENABLED=NO
TOOLS_ENABLED=NO
PRIVATE_DATA_INCLUDED=NO
MICROPHONE_INCLUDED=NO
GENERATED_AUDIO_RETAINED=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
NEXT_ACTION=RUN_ONE_DURABLE_CORRECTED_EXACT_FULL_SLATE_ADAPTER_PROVIDER_CALL
```

The exact candidate is the previously reviewed `linux/arm64` artifact with
image ID `sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d`.
The disposable harness will use a uniquely named non-`--rm` container, a
read-only application and credential mount, a writable sanitized result
directory, separate wait/status/result/log retrieval, and cleanup only after
result verification. No production container or image will be touched.

## G10 — Corrected exact-adapter provider revalidation hard stop

The one separately authorized corrected provider call was spent exactly once
through the full Slate Bun adapter and private Node bridge. The durable
result survived a deliberate `docker wait` launcher timeout (`rc=124`) and
was recovered independently after the container exited. Only sanitized
fields were inspected; no raw provider error body or credential value was
read.

```text
CAMPAIGN=8D1K_G_CORRECTED_PROVIDER_REVALIDATION
STATUS=HARD_STOP_CORRECTED_EXACT_FULL_SLATE_ADAPTER_PROVIDER_FAILURE
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PROVIDER_CALLS_AUTHORIZED=1
PROVIDER_CALLS_USED=1_OF_1
PROVIDER_CALLS_REMAINING=0
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1K_F_PROVIDER_CALLS_USED=1_OF_1
MODEL=gemini-3.1-flash-live-preview
PROVIDER_CALL_EXIT=21
MODEL_EVENT=NO
TURN_COMPLETE=NO
SLATE_ADAPTER_ERROR=YES
FAILURE_CLASS=CHILD_SPAWN_FAILED
TOOL_INVOCATIONS=0
SEARCH_EXECUTED=NO
PRIVATE_DATA_SENT=NO
OUTLOOK_DATA_SENT=NO
CALENDAR_DATA_SENT=NO
MICROPHONE_SENT=NO
GENERATED_AUDIO_RETAINED=NO
OOM=NO
RESULT_DURABLY_RECOVERABLE=YES
RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
WAIT_LAUNCHER_TIMEOUT=YES_RC_124
LOG_RETRIEVAL=COMPLETED_WITHOUT_RAW_LOG_INSPECTION
RAW_PROVIDER_ERROR_READ=NO
CREDENTIAL_VALUE_READ=NO
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1L=NO
READY_FOR_8D1M=NO
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_REVIEW_SANITIZED_FAILURE_AND_DECIDE_FUTURE_SCOPE
```

The failure was classified from the durable sanitized result as a
pre-readiness `CHILD_SPAWN_FAILED` boundary. No source correction is claimed
from this result. Exact disposable-container cleanup was attempted after
result verification, but the remote Docker daemon reported removal already
in progress for dead disposable records; production Slate/MySQL remained
running and healthy with zero restarts. No further provider call is
authorized or permitted by this checkpoint.

## G8 report-push invariant checkpoint

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=YES
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=76430f4712ab2cb3a7891ec3eb7510fc1a30a2c1
PR_STATE_VERIFIED=YES
PR_STATE=open_draft_unmerged
```
