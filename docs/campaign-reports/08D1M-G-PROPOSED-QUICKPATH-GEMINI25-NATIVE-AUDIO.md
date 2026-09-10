# Campaign 8D1M-G — PROPOSED Quick Path: Gemini 2.5 Native Audio to Production

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Objective

Make Slate voice work sooner. Stop treating Gemini 3.1 Live as a prerequisite for NOTE4 voice functionality. Preserve the 3.1/F evidence as an R&D/provider-compatibility trail and pivot the software validation path to the currently documented Gemini Developer API native-audio model `gemini-2.5-flash-native-audio-preview-12-2025`.

This is a fallback/quick-path proposal, not permission to run provider sessions or mutate production until explicit human activation.

## Current starting evidence

```text
PR_HEAD_BEFORE_G=cb50bc780d68dd6b24b9d4f6df36dca381f0b274
F1_RESULT=F1C
F1_FAILURE_CLASS=RAW_FIRST_SERVER_MESSAGE_TIMEOUT
F1_PROVIDER_SESSIONS_USED=1_OF_5
F1_ZERO_PROVIDER_FORENSICS=PASS
F1_PRODUCT_SOURCE_CHANGED=NO
F1_NARROW_CORRECTION=NOT_JUSTIFIED
PRODUCTION_CHANGED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
```

The 3.1 path remains useful evidence but is no longer on the critical path for making NOTE4 voice functional.

## Current official model basis to refresh before execution

At proposal time, current Google Gemini Developer API documentation states:

- `gemini-2.5-flash-native-audio-preview-12-2025` supports Live API;
- inputs include text/audio/video and outputs include audio/text;
- native audio generation is supported;
- function calling and Search grounding are supported;
- the model currently has no announced shutdown date;
- Developer API free tier is currently available for this native-audio model, subject to the already recorded free-tier data-use/privacy acceptance.

Refresh official Google documentation immediately before provider execution and record only semantic conclusions. If the model is withdrawn or materially changed, stop after zero-provider reconciliation rather than substituting another model silently.

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PRIVATE_DATA_AUTHORIZED=NO
BILLING_OR_VERTEX_CHANGE_AUTHORIZED=NO
CREDENTIAL_REPLACEMENT_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

## Proposed long-run activation envelope

A later explicit human activation should authorize one uninterrupted software chain:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_AUTHORIZED_STAGES=NO
FUTURE_PROVIDER_SESSION_POOL_MAX=3
BLIND_RETRY=NO
MODEL_TARGET=gemini-2.5-flash-native-audio-preview-12-2025
AUTH_MODE=developer_api_key_existing_protected_readonly
SEARCH_SYNTHETIC=OFF
TOOLS_SYNTHETIC=NO_INVOCATION
MICROPHONE_SYNTHETIC=NO
PRIVATE_DATA=NO
RAW_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
PRODUCTION_DEPLOYMENT=CONDITIONAL_AFTER_FULL_ADAPTER_NONPROD_PASS
PRODUCTION_RESTART=YES_WITHIN_G3_ONLY
AUTO_ROLLBACK_ON_G3_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_G3_PASS=YES_IF_HEALTH_GREEN
PHYSICAL_NOTE4_TEST=NO_SEPARATE_FINAL_GATE
FIRMWARE_FLASH=NO_SEPARATE_FINAL_GATE
BILLING_OR_VERTEX_CHANGE=NO
PR2_MERGE=NO
```

The three-session ceiling is conditional, not a target. Stop consuming provider sessions when evidence does not justify the next stage.

## G0 — zero-provider reconcile

Do not stop after G0 once activated.

1. Reconcile current PR/report/state and immutable provider accounting.
2. Refresh official model/deprecation/pricing/data-policy semantics.
3. Verify protected Developer API credential metadata/mount path only; never print/read into reports/logs.
4. Verify rollback production health and candidate build capability.
5. Verify current source can mechanically target the 2.5 native-audio model without broad architectural change.
6. Build provider-disabled fixtures for 2.5 model selection, AUDIO modality, model-turn inline audio, output transcription, generation/turn completion, EN/JA multi-turn, reconnect, and tool declaration preservation.

If supporting 2.5 requires architecture/auth changes outside the Gemini Live model/config boundary, stop after autonomous analysis. Otherwise continue.

## G1 — one minimal non-production 2.5 native-audio provider session

Consume at most one provider session using the existing protected read-only Developer API credential, SDK/Node environment already qualified for Slate, and model:

```text
gemini-2.5-flash-native-audio-preview-12-2025
```

Use deliberately minimal configuration:

```text
RESPONSE_MODALITIES=AUDIO
SEARCH=OFF
TOOLS=NONE_OR_DECLARED_BUT_NOT_INVOKED_AS_REQUIRED_BY_EXISTING_HARNESS
INPUT_TRANSCRIPTION=OFF_IF_HARNESS_PERMITS
OUTPUT_TRANSCRIPTION=OFF_IF_HARNESS_PERMITS
PROMPT="Say exactly TEST."
```

Capture payload-free structural telemetry only. PASS requires native-audio/model-turn evidence plus turn completion.

### G1 PASS

This proves the account/provider/runtime can produce native audio on the quick-path model. Continue automatically into G1.5/G2.

### G1 FAIL

Do not blindly retry. Exhaust zero-provider diagnosis and official compatibility checks. If a disposable harness-only defect is proven, one corrected G1 attempt is permitted within the pool. If the model/provider/account itself does not produce usable audio, stop; do not mutate production.

## G1.5 — conditional narrow model/config correction and qualification

If the current tracked source hardcodes 3.1 or otherwise needs a mechanically bounded change to select the proven 2.5 model, implement only the narrow Gemini Live model/config change and directly associated tests/docs.

Allowed scope:

- Gemini Live model constant/config validation;
- Node bridge expected-model validation;
- model-specific text-send semantics only if current official 2.5 docs require a different existing supported SDK method;
- directly associated tests/documentation.

Do not change auth mode, tools/Search policy, Calendar/Outlook behavior, firmware, UI, database, or unrelated code.

Then automatically run:

- focused Gemini Live regression;
- backend/shared relevant tests;
- Node bridge/protocol syntax/tests;
- lint/typecheck/format/frontend build as applicable;
- exact ARM64 build;
- exact provider-disabled production-shape adapter replay;
- secret/build-context/image-history checks;
- exact `zai-glm53-reviewer` / `glm-5.3-flash` review;
- address any P0/P1/P2 finding inside scope and repeat qualification/review;
- record corrected source SHA and ARM64 image digest;
- commit/push/fetch-verify checkpoint;
- continue directly to G2.

A narrow corrected artifact satisfying all gates is preauthorizable by the future G activation; do not create an extra human handoff merely because its SHA/image changed inside the declared scope.

## G2 — full Slate adapter non-production broad validation

Consume at most one provider session with the exact qualified source/image, Bun parent + Node bridge, existing protected credential read-only, Search off, no tool invocation, no private data, no microphone, no retained audio.

Run in one session:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

Also perform one reconnect cycle in the same session/harness if mechanically supported without creating a second provider connection. PASS requires usable native audio/model output and turn completion for every executed turn.

On PASS, publish checkpoint and continue directly to G3.

On FAIL, do not deploy. Exhaust zero-provider forensics/requalification/reviewer work and stop only if another provider session/new authority is genuinely required.

## G3 — exact qualified production deploy + broad synthetic validation

Run only after G2 PASS.

Before mutation:

- verify exact source/image digest;
- verify pinned rollback image exists;
- verify Slate/MySQL/local/public health;
- record production metadata without reading secret values;
- publish/verify pre-mutation checkpoint and continue.

Deploy/restart only the G2-qualified candidate with the already approved Developer API/Node-bridge production opt-ins and the existing protected credential read-only. Keep the Node bridge private.

Consume at most one provider session using the same EN/EN/JA broad matrix and same native-audio acceptance gate.

### G3 PASS

- leave candidate deployed while health remains green;
- verify Slate/MySQL/local/public health;
- verify protected secret mount is read-only and no secret value was exposed;
- publish the terminal software dossier;
- stop only at the separate physical NOTE4/firmware gate.

Expected software success state:

```text
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
MINIMAL_NATIVE_AUDIO=PASS
FULL_ADAPTER_NONPROD=PASS
PRODUCTION_SYNTHETIC=PASS
PRODUCTION_CANDIDATE_DEPLOYED=YES
PRODUCTION_HEALTH=PASS
ROLLBACK_AVAILABLE=YES
READY_FOR_PHYSICAL_NOTE4_DECISION=YES
PR2_STATE=open_draft_unmerged
```

### G3 FAIL/AMBIGUOUS

Immediately rollback to the pinned rollback image/config, verify Slate/MySQL/local/public health, remove candidate-only secret mount/config if applicable, then exhaust all safe zero-provider forensic work. No production retry inside this activation.

## Non-stopping work after activation

Do not return control for checkpoints, report pushes, G0 completion, deterministic tests, narrow in-scope model/config correction, GLM review loops, ARM64 builds, provider-disabled replay, recoverable Docker/SSH/container issues, G1->G1.5->G2->G3 transitions, or terminal dossier publication.

`REPORT-PUSH-INVARIANT.md` remains binding: push often, stop rarely.

## True stop conditions after activation

Stop only for:

1. provider pool exhausted and another session is genuinely required;
2. required source change exceeds the narrow Gemini Live model/config boundary;
3. current official 2.5 native-audio model is unavailable/withdrawn or provider/account policy must change;
4. credential creation/replacement/migration is required;
5. billing or Vertex enablement/change is required;
6. private data/microphone use is required;
7. physical NOTE4 interaction or firmware flashing is required;
8. unresolved P0/P1/security/privacy/data-integrity issue;
9. destructive host/storage/database action outside disposable state;
10. PR merge/release/publication.

## G activation and G0 zero-provider checkpoint

The human's subsequent `proceed` instruction activated this declared G
long-run envelope. The activation was reconciled against remote commit
`381a0c5228454dbb129f8894121479c79c042569`. The historical F accounting is
preserved; G has its own conditional pool and no provider session has been
reset or spent.

```text
CAMPAIGN=8D1M-G
DIRECTIVE_STATE=AUTHORIZED_ACTIVE
ACTIVATION_BASIS=HUMAN_PROCEED_IN_CONTEXT
FUTURE_PROVIDER_SESSION_POOL_MAX=3
PROVIDER_SESSIONS_USED=0_OF_3
PROVIDER_SESSIONS_REMAINING=3
HISTORICAL_8D1K_PROVIDER_SESSIONS=3_OF_3
MODEL_TARGET=gemini-2.5-flash-native-audio-preview-12-2025
AUTH_MODE=EXISTING_DEVELOPER_API_KEY_PROTECTED_READONLY
SEARCH=OFF
TOOLS=NO_INVOCATION
MICROPHONE=OFF
PRIVATE_DATA=NO
RAW_AUDIO_RETENTION=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
PRODUCTION_CHANGED=NO
PR2_STATE=open_draft_unmerged
```

### Official compatibility refresh

The current official Google model page still lists
`gemini-2.5-flash-native-audio-preview-12-2025` with Live API support, audio
generation, text/audio/video input, and text/audio output. The official
models page lists it as a low-latency native-audio Live model. The official
deprecations page reports no shutdown date for this model and names
`gemini-3.1-flash-live-preview` as its recommended replacement. The official
pricing page continues to show a free tier for this model and says free-tier
content may be used to improve Google's products; billing remains disabled.

References checked during G0:

- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-native-audio-preview-12-2025
- https://ai.google.dev/gemini-api/docs/models
- https://ai.google.dev/gemini-api/docs/deprecations
- https://ai.google.dev/gemini-api/docs/pricing

```text
OFFICIAL_MODEL_LISTED=YES
OFFICIAL_LIVE_API=YES
OFFICIAL_NATIVE_AUDIO=YES
OFFICIAL_SHUTDOWN_DATE=NONE_ANNOUNCED
FREE_TIER_DATA_USE_FOR_PRODUCT_IMPROVEMENT=YES
G0_POLICY_REFRESH=PASS
```

### G0 evidence

The existing source currently pins the approved Gemini Live model in
`backend/src/modules/assistant/gemini.config.ts` and validates the expected
model before the Node bridge can spawn. The bridge already expresses AUDIO
response modality, sanitized model-turn/turn-complete handling, reconnect,
and tool declaration preservation. Therefore selecting the 2.5 model is a
narrow model/config boundary; no auth, architecture, Search, tool policy,
Calendar/Outlook, UI, database, device, or firmware change is required by
the source shape.

The exact local ARM64 candidate remained available as:

```text
ARM64_CANDIDATE_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ARM64_CANDIDATE_PLATFORM=linux/arm64
ARM64_CANDIDATE_USER=bun
ARM64_CANDIDATE_WORKDIR=/app
ARM64_CANDIDATE_SDK=2.20.0
```

The protected host source was checked on `note4-orangepi` by metadata only:

```text
SECRET_SOURCE=/mnt/ssd-tmp/slate-tools/gemini-api-key/gemini_api_key
SECRET_SOURCE_TYPE=regular_file
SECRET_SOURCE_SYMLINK=NO
SECRET_SOURCE_OWNER=pi
SECRET_SOURCE_GROUP=pi
SECRET_SOURCE_MODE=600
SECRET_SOURCE_NONEMPTY=YES
SECRET_DESTINATION=/run/secrets/gemini_api_key
SECRET_MOUNT=READ_ONLY_BIND
SECRET_VALUE_READ=NO
SECRET_VALUE_LOGGED=NO
SECRET_VALUE_COPIED=NO
```

Read-only production checks passed without restart or mutation:

```text
SLATE_NOTE4=running_healthy_RESTARTS_0
SLATE_NOTE4_MYSQL=running_healthy_RESTARTS_0
PRODUCTION_LOCAL_HEALTH_HTTP=200
PRODUCTION_ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_CANDIDATE_DEPLOYED=NO
```

The provider-disabled fixture ran in the exact ARM64 candidate with
`--network none`, `--read-only`, `--user bun`, no credential mount, and no
provider client. It emitted only sanitized structural values and passed the
2.5 model selection, AUDIO modality, inline-audio model-turn, output
transcription, generation/turn completion, EN/JA matrix, reconnect/tool
preservation, Search-off, zero-tool-invocation, and zero-audio-retention
checks:

```text
G0_PROVIDER_DISABLED_FIXTURE=PASS
G0_FIXTURE_PROVIDER_CALLS=0
G0_FIXTURE_MODEL_SELECTION=PASS
G0_FIXTURE_AUDIO_MODALITY=PASS
G0_FIXTURE_MODEL_TURN_INLINE_AUDIO=PASS
G0_FIXTURE_OUTPUT_TRANSCRIPTION=PASS
G0_FIXTURE_GENERATION_COMPLETE=PASS
G0_FIXTURE_TURN_COMPLETE=PASS
G0_FIXTURE_EN_JA_MATRIX=PASS
G0_FIXTURE_RECONNECT_TOOL_PRESERVATION=PASS
G0_FIXTURE_SEARCH=OFF
G0_FIXTURE_TOOL_INVOCATIONS=0
G0_FIXTURE_RAW_AUDIO_RETAINED=NO
```

Focused deterministic assistant regression also passed:

```text
G0_FOCUSED_TESTS=PASS
G0_FOCUSED_TESTS_PASSED=48
G0_FOCUSED_TESTS_FAILED=0
G0_FOCUSED_TESTS_SKIPPED=5_INTENTIONAL_ACTUAL_PROVIDER_DIFFERENTIALS
```

The first disposable fixture invocation exposed only an assertion bug in the
fixture itself: it incorrectly treated the expected `rawAudioRetained=false`
safety result as failure. It made zero provider calls, was corrected in place,
and the corrected fixture passed. No product source was changed.

```text
G0_STATUS=PASS
G0_PRODUCT_SOURCE_CHANGED=NO
G0_PROVIDER_SESSIONS_USED=0_OF_3
G1_NEXT=AUTHORIZED_WITHIN_G_ENVELOPE
```

The next action is the single minimal G1 provider session, using the existing
protected read-only credential mechanism and the exact 2.5 model. No second
session will be attempted without evidence meeting the directive's G1
conditions.

## G1 first attempt — disposable harness failure and zero-provider closure

The first authorized G1 attempt used one provider session and produced a
durable sanitized failure before `ready`:

```text
G1_PROVIDER_SESSION_USED=1_OF_3
G1_RESULT=FAIL
G1_FAILURE_CLASS=BRIDGE_EXITED
G1_READY=NO
G1_MODEL_EVENT=NO
G1_INLINE_AUDIO=NO
G1_TURN_COMPLETE=NO
G1_RAW_PROVIDER_PAYLOAD_RETAINED=NO
G1_RAW_AUDIO_RETAINED=NO
```

The independent result file was recovered after the launcher completed. Its
container was retained until the result and status were verified. No raw
provider log or audio was retained.

Zero-provider forensic replay then ran against the exact ARM64 candidate with
network disabled and no credential mount. Node version and module loading
were checked without opening a provider session. The sanitized diagnostic
identified the harness path defect:

```text
G1_FORENSICS=PASS
G1_FORENSIC_IMAGE=slate-8d1ma-candidate:895e2d5
G1_FORENSIC_NODE=v22.22.2
G1_FORENSIC_RUNTIME_EXPECTED=/app/backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs
G1_FORENSIC_HARNESS_INVOKED=/app/backend/gemini-live-node-bridge-runtime.mjs
G1_FORENSIC_FAILURE_CLASS=MODULE_NOT_FOUND_DISPOSABLE_HARNESS_PATH
G1_FORENSIC_PRODUCT_SOURCE_DEFECT=NO
G1_FORENSIC_PROVIDER_CALLS=0
```

The image's actual packaged runtime path matches the tracked production
configuration (`GEMINI_NODE_BRIDGE_SCRIPT=./src/modules/assistant/gemini-live-node-bridge-runtime.mjs`)
under the `/app/backend` workdir. The first G1 failure therefore does not
classify the 2.5 model, account, credential, or provider. Luna adjudication
is `HARNESS_ONLY_DEFECT`; the proposal explicitly allows one corrected G1
attempt within the existing pool. No product/runtime source changed.

```text
G1_CORRECTED_HARNESS_ATTEMPT=AUTHORIZED_WITHIN_G_ENVELOPE
G1_PROVIDER_SESSIONS_USED=1_OF_3
G1_PROVIDER_SESSIONS_REMAINING=2
G1_PRODUCT_SOURCE_CHANGED=NO
G1_PRODUCTION_CHANGED=NO
```

## G1 corrected attempt — native-audio PASS

Because G1's first attempt was proven to be a disposable harness path defect,
the proposal's one corrected G1 attempt was used. It consumed the second G
provider session and ran the same minimal bridge control on the same protected
credential path and ARM64 candidate:

```text
G1_CORRECTED_PROVIDER_SESSION_USED=2_OF_3
G1_CORRECTED_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
G1_CORRECTED_PROMPT=Say exactly TEST.
G1_CORRECTED_RESPONSE_MODALITIES=AUDIO
G1_CORRECTED_SEARCH=OFF
G1_CORRECTED_TOOL_INVOCATIONS=0
G1_CORRECTED_MICROPHONE=NO
G1_CORRECTED_PRIVATE_DATA=NO
G1_CORRECTED_RAW_AUDIO_RETAINED=NO
G1_CORRECTED_RAW_PROVIDER_PAYLOAD_RETAINED=NO
G1_CORRECTED_READY=YES
G1_CORRECTED_MODEL_EVENT=YES
G1_CORRECTED_MODEL_TURN=YES
G1_CORRECTED_INLINE_AUDIO=YES
G1_CORRECTED_OUTPUT_TRANSCRIPTION=YES
G1_CORRECTED_GENERATION_COMPLETE=YES
G1_CORRECTED_TURN_COMPLETE=YES
G1_CORRECTED_RESULT=PASS
```

The durable result was retrieved independently after a deliberate launcher
timeout/disconnect. The container remained non-`--rm` until status, result, and
log retrieval completed; its disposable state was then cleaned. The result
file was mode 600, contained only sanitized structural telemetry, and no
credential value, raw provider payload, or generated audio was retained.

```text
G1_DURABLE_RESULT=PASS
G1_RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
G1_DISPOSABLE_CLEANUP_AFTER_VERIFICATION=YES
G1_PROVIDER_SESSIONS_USED=2_OF_3
G1_PROVIDER_SESSIONS_REMAINING=1
```

## G1.5 narrow model/config correction and qualification

The corrected provider evidence justified the proposal's bounded model/config
change. The tracked source now selects only
`gemini-2.5-flash-native-audio-preview-12-2025` in
`backend/src/modules/assistant/gemini.config.ts`; directly coupled assistant
contract fixtures were updated to the same model. No auth mode, credential
handling, bridge protocol, Search/tool policy, Calendar/Outlook behavior, UI,
database, device, firmware, or production setting changed.

```text
G1_5_SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
G1_5_SOURCE_SCOPE=NARROW_GEMINI_LIVE_MODEL_CONFIG_AND_DIRECT_TEST_CONTRACTS
G1_5_ARM64_IMAGE_TAG=slate-8d1mg-candidate:2.5-native-audio
G1_5_ARM64_IMAGE_SHA=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
G1_5_ARM64_PLATFORM=linux/arm64
G1_5_ARM64_USER=bun
G1_5_ARM64_WORKDIR=/app
G1_5_NODE=v22.22.2
G1_5_BUN=1.4.1
G1_5_SDK=2.20.0
```

Qualification evidence:

```text
G1_5_CHANGED_ASSISTANT_TESTS=PASS
G1_5_CHANGED_ASSISTANT_TESTS_PASS=85
G1_5_CHANGED_ASSISTANT_TESTS_FAIL=0
G1_5_CHANGED_ASSISTANT_TESTS_SKIPPED=5_ACTUAL_PROVIDER_DIFFERENTIALS
G1_5_LINT=PASS
G1_5_TYPECHECK=PASS
G1_5_FORMAT_CHECK=PASS
G1_5_FRONTEND_BUILD=PASS
G1_5_ARM64_NODE_RUNTIME_SYNTAX=PASS
G1_5_ARM64_PROVIDER_DISABLED_REPLAY=PASS
G1_5_IMAGE_ENV_FILES=ABSENT
G1_5_IMAGE_CREDENTIAL_CONTENT=ABSENT
G1_5_PRODUCTION_CHANGED=NO
```

The complete `bun test backend/src shared/test` sweep was also run. It
reported 326 passing tests, 5 intentional provider-differential skips, and 4
failures with 5 errors. Those failures are confined to unrelated existing
Bun/Nest decorator loading behavior in controller/decorator tests (including
`assistant.controller.test.ts`); no changed G1.5 file failed. The assistant
source-focused sweep reported 85 passing, 5 intentional provider-differential
skips, 1 unrelated controller failure, and 1 related loader error for the
same pre-existing decorator issue. No unrelated repair is authorized by the
narrow G1.5 scope.

```text
G1_5_FULL_REPOSITORY_REGRESSION=BLOCKED_UNRELATED_BUN_NEST_DECORATOR_FAILURES
G1_5_SOURCE_REQUALIFICATION=FOCUSED_PASS_FULL_SWEEP_NOT_CLEAN
```

The image was built reproducibly from `G1_5_SOURCE_SHA` with the pinned
Dockerfile Node base. The final image has no `.env` files or credential
content, the bridge runtime syntax check passes, and the provider-disabled
ARM64 replay used `--network none`, `--read-only`, and no secret mount.

## G1.5 independent-review boundary

The current repository routing override requires the existing authenticated
Grok 4.6 CLI/session for independent review and prohibits silent substitution
of another reviewer. `grok models` returned `You are not authenticated`.
No credential was created, exposed, moved, or replaced, and no Gemini 3.7
review/shadow call was made. Therefore the required exact-artifact review
cannot be completed in this environment.

```text
INDEPENDENT_REVIEWER=GROK_4_6
REVIEW_TRANSPORT=GROK_CLI_EXISTING_AUTH_SESSION
REVIEW_STATUS=UNAVAILABLE_UNAUTHENTICATED
GEMINI37_REVIEW_CALLS=0
GEMINI37_SHADOW_CALLS=0
GEMINI37_BLACKOUT_EXPIRES=2026-09-06T02:00:00+08:00
G1_5_REVIEWED=NO
READY_FOR_G2=NO
READY_FOR_G3=NO
PROVIDER_SESSIONS_USED=2_OF_3
PROVIDER_SESSIONS_REMAINING=1
PRODUCTION_CHANGED=NO
```

This is a retained reviewer/full-regression boundary. The remaining provider
session is not spent until the exact reviewer route and clean in-scope
requalification prerequisites are available. The candidate has not been
deployed; rollback production remains untouched and healthy.

## Exact source-pin reconciliation boundary

The continuation request supplied
`5ec1838b4c2ca8a741c772788382a1d4ec7f1d04` as the review source SHA. Git
contains no object for that exact SHA. The actual pushed model-correction
commit is:

```text
REQUESTED_SOURCE_SHA=5ec1838b4c2ca8a741c772788382a1d4ec7f1d04
REQUESTED_SOURCE_PRESENT=NO
ACTUAL_PUSHED_SOURCE_SHA=5ec18386e8853d61ca0a77785fcac624b218ca39
ACTUAL_SOURCE_SHORT_SHA=5ec1838
SOURCE_CONTENT_USED_FOR_ARM64_BUILD=ACTUAL_PUSHED_SOURCE_SHA
ARM64_IMAGE=sha256:213a6aea997b896211838649b078a1ac487136f9572d2b7d0caee611c3502956
GROK_AUTHENTICATION=PASS
GROK_REVIEW=NOT_RUN_EXACT_SOURCE_PIN_MISMATCH
PROVIDER_CALLS_AFTER_G1=0
PRODUCTION_CHANGED=NO
```

The short prefix is shared, but an exact SHA mismatch cannot be silently
treated as equivalent for an artifact review. The requested exact review was
therefore stopped before any reviewer conclusion or subsequent provider
session. This is a retained artifact/source reconciliation boundary; no
unrelated test repair, G2 provider call, or production action was performed.

## 3.1 disposition

Campaign 8D1M-F is not deleted or rewritten. Its 3.1 raw-WebSocket/SDK evidence remains valid research evidence. G simply removes 3.1 from the critical path for making Slate voice operational. Return to 3.1 only after the device is working or if the human explicitly prioritizes 3.1 research over the quick path.
