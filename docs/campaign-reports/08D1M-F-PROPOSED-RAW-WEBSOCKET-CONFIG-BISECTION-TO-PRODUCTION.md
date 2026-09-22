# Campaign 8D1M-F — PROPOSED Raw-WebSocket / Config-Bisection to Production Long Run

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Starting remote head: `2202c05a8146b33203f4856b397bbd2df3279016`

## Status

```text
DIRECTIVE_STATE=PROPOSED_NOT_AUTHORIZED
PROVIDER_SESSIONS_AUTHORIZED=0
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO
PRODUCTION_RESTART_AUTHORIZED=NO
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PRIVATE_DATA_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

This proposal exists to avoid more short stop/retry loops. A later explicit human activation may authorize the entire bounded chain below in one decision. Until then, perform no Gemini provider session and no production mutation under this file.

## Accepted starting evidence

```text
E1_RESULT=CASE_D
E1_SESSION_ATTEMPTS=2_OF_3
E1_PROVIDER_CONNECTIONS_REACHED=1
E1_TURN_A_METHOD=sendRealtimeInput_text
E1_TURN_A_MODEL_TURN=NO
E1_TURN_A_AUDIO_BEFORE_BOUNDARY=NO
E1_TURN_A_AUDIO_AFTER_BOUNDARY=NO
E1_TURN_A_OUTPUT_TRANSCRIPTION=YES
E1_TURN_A_GENERATION_COMPLETE=YES
E1_TURN_A_TURN_COMPLETE=YES
E1_TURN_B_METHOD=sendClientContent_turnComplete_true
E1_TURN_B_MODEL_TURN=NO
E1_TURN_B_AUDIO_BEFORE_BOUNDARY=NO
E1_TURN_B_AUDIO_AFTER_BOUNDARY=NO
E1_TURN_B_OUTPUT_TRANSCRIPTION=YES
E1_TURN_B_GENERATION_COMPLETE=YES
E1_TURN_B_TURN_COMPLETE=YES
E1_PROVIDER_ERRORS=0
E1_PRODUCT_SOURCE_DEFECT=NO
E1_NARROW_CORRECTION=NOT_JUSTIFIED
E1_PROVIDER_SESSIONS_USED=2_OF_3
E2_RESULT=NOT_RUN_CASE_D
E3_RESULT=NOT_RUN_E2_NOT_RUN
PRODUCTION_CHANGED=NO
ROLLBACK_PRODUCTION_HEALTH=PASS
```

Accepted product/runtime pins remain:

```text
START_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
START_ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
SDK_BASELINE=2.20.0
```

## Current official semantic basis to refresh before execution

Immediately before any provider session, re-check current official Google Gemini Live documentation. At proposal time the official model and Live guides state:

- Gemini 3.1 Flash Live supports text input and audio output;
- ongoing conversational text should use realtime input;
- native audio is delivered through server content model-turn inline-data parts;
- raw WebSocket Live API uses the same model and `responseModalities: ["AUDIO"]` setup and accepts realtime text input.

If official semantics materially changed, adapt only the diagnostic mechanics and document the change; do not broaden authority.

## Proposed long-run activation envelope

A later explicit human activation should authorize, in one checkpoint:

```text
LONGRUN_DEFAULT=YES
STOP_BETWEEN_AUTHORIZED_STAGES=NO
FUTURE_PROVIDER_SESSION_POOL_MAX=5
BLIND_RETRY=NO
PRODUCTION_DEPLOYMENT_AUTHORIZED=CONDITIONAL_AFTER_FULL_ADAPTER_NONPROD_PASS
PRODUCTION_RESTART_AUTHORIZED=YES_WITHIN_FINAL_PRODUCTION_STAGE_ONLY
AUTO_ROLLBACK_ON_PRODUCTION_FAILURE=YES
LEAVE_CANDIDATE_DEPLOYED_ON_PRODUCTION_PASS=YES_IF_HEALTH_GREEN
SEARCH_ENABLED=NO
TOOLS_INVOCATION_AUTHORIZED=NO
MICROPHONE_AUTHORIZED=NO
PRIVATE_DATA_AUTHORIZED=NO
CALENDAR_WRITE_AUTHORIZED=NO
OUTLOOK_PAYLOAD_AUTHORIZED=NO
GENERATED_AUDIO_RETENTION=NO
RAW_PROVIDER_PAYLOAD_RETENTION=NO
CREDENTIAL_REPLACEMENT_AUTHORIZED=NO
BILLING_OR_VERTEX_CHANGE_AUTHORIZED=NO
PHYSICAL_NOTE4_TEST_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
```

The five-session ceiling is conditional, not a target. Stop consuming sessions as soon as the root cause is isolated or a stage cannot justify the next provider session.

## F0 — zero-provider reconcile and raw-WebSocket harness

Do not stop after F0 once activated.

- reconcile exact PR/report/state and immutable provider accounting;
- verify source/image/rollback identity and rollback production health;
- refresh official model/Live/raw-WebSocket semantics;
- build a disposable raw-WebSocket diagnostic that never prints or retains credential values, raw provider payloads, text, transcripts, or audio;
- prove with provider-disabled fixtures that the diagnostic can classify setup complete, server content, model turn, inline audio presence, transcription presence, generation complete, turn complete, provider error/close, and relative timings;
- credential use must be the existing protected read-only source only;
- no production `.env` read.

Payload-free result fields may include counts/booleans only.

## F1 — raw WebSocket minimal baseline

Consume at most one provider session using direct raw WebSocket, bypassing `@google/genai` entirely.

Use the exact model with a deliberately minimal setup:

```text
MODEL=gemini-3.1-flash-live-preview
RESPONSE_MODALITIES=AUDIO
SYSTEM_INSTRUCTION=MINIMAL_OR_OMITTED_IF_OFFICIAL_API_ALLOWS
INPUT_TRANSCRIPTION=OFF
OUTPUT_TRANSCRIPTION=OFF
TOOLS=NONE
SEARCH=OFF
INPUT_METHOD=realtimeInput.text
PROMPT="Say exactly TEST."
```

Capture only structural booleans/counters before cleanup. PASS requires at least one usable model-turn inline-audio event plus turn completion.

### F1 outcome routing

**F1A — raw minimal returns audio**

Provider/model/account can generate native audio. Continue immediately to F2 to isolate SDK/config interaction.

**F1B — raw minimal still returns no audio but lifecycle completes**

Do not change Slate source. Refresh provider/model/account compatibility evidence and use at most one additional provider session only if a materially different official configuration or model-path discriminator is justified. Otherwise publish terminal evidence and stop; this is not a Slate bridge defect.

**F1C — raw connection/provider error**

Exhaust zero-provider setup/auth/endpoint diagnosis. Retry only for a proven disposable harness/setup defect under the same artifact/provider semantics.

## F2 — exact-config versus SDK discriminator

Run only after F1A.

Use one provider session for the highest-information next discriminator chosen mechanically from F1 evidence:

Preferred order:

1. raw WebSocket with Slate-equivalent setup: AUDIO + current system instruction + transcription settings + function declarations, Search off; or
2. SDK 2.20.0 with the same minimal setup as F1 if raw-exact is not the stronger discriminator.

Use one synthetic text turn and payload-free structural telemetry.

Interpretation:

- raw minimal PASS + raw exact FAIL => configuration interaction; proceed to F3 config bisection;
- raw minimal PASS + raw exact PASS + SDK equivalent FAIL => SDK/runtime interaction; proceed to narrow SDK/bridge correction;
- raw minimal PASS + SDK minimal PASS => exact Slate configuration is the remaining suspect; proceed to F3;
- all PASS => previous CASE D was provider/session-specific; proceed directly to full-adapter non-production validation.

## F3 — bounded configuration bisection, only if required

Use at most one provider session, choosing the single highest-information setup based on F2. Prefer binary isolation of:

- transcription configuration versus no transcription;
- function declarations versus no tools;
- Slate system instruction versus minimal instruction;
- SDK transport versus raw WebSocket transport.

Do not test dimensions already excluded by deterministic evidence. One session, one setup, multiple synthetic turns if useful.

The purpose is to identify one mechanically justified correction or prove that the issue lies outside Slate.

## F4 — conditional narrow correction and full qualification

No provider session in this stage.

If F1-F3 prove a narrow Slate runtime/config/SDK defect, implement only the proven correction. Allowed scope is limited to Gemini Live runtime/config/Node bridge and directly associated tests/documentation. Do not alter model family, auth mode, Search/tool policy, Calendar/Outlook semantics, firmware, UI, database, or unrelated code.

Automatically run:

- focused regression for the observed failure;
- Node bridge/protocol tests and syntax;
- assistant/shared regression;
- lint/typecheck/format/frontend build as applicable;
- exact ARM64 build;
- provider-disabled production-shape adapter replay;
- secret/build-context/image-history checks;
- exact `zai-glm53-reviewer` / `glm-5.3-flash` review;
- repeat bounded fix/requalification/review loops for any P0/P1/P2 finding;
- record corrected source SHA and ARM64 image digest;
- push/fetch/verify checkpoint.

A corrected artifact is pre-authorizable for later stages only if the future activation explicitly says so and the correction remains inside this narrow scope with all gates green.

## F5 — full Slate adapter non-production broad validation

Run only when F1-F4 evidence justifies that the exact unchanged or corrected artifact should now produce native audio.

Consume at most one provider session with full Bun parent + Node bridge and the broad synthetic matrix:

```text
TURN_1_EN="Say exactly TEST."
TURN_2_EN="Say exactly SECOND."
TURN_3_JA="日本語で「テスト」とだけ言ってください。"
```

PASS requires usable native-audio/model-turn output plus turn completion for every executed turn. Transcription alone does not pass.

On PASS, publish checkpoint and continue directly to F6 without another human stop if production was included in the activation.

On FAIL, do not deploy. Exhaust all zero-provider forensics and stop only when genuinely new provider/artifact/account authority is required.

## F6 — exact qualified production deploy + one broad synthetic session

Run only after F5 PASS and only if future activation explicitly included production mutation.

- verify exact qualified source/image and pinned rollback image;
- verify Slate/MySQL/local/public health;
- publish/verify pre-mutation checkpoint, then continue;
- deploy/restart only the qualified candidate;
- mount existing protected Gemini credential read-only;
- keep Node bridge private;
- consume at most one provider session using the same EN/EN/JA broad matrix and same native-audio gate.

PASS:

- keep candidate deployed if health remains green;
- verify Slate/MySQL/local/public health and secret mount boundary;
- publish terminal dossier;
- stop only at physical NOTE4/private microphone/firmware/merge authority.

FAIL/AMBIGUOUS:

- immediately rollback to pinned rollback image/config;
- verify all production health;
- remove candidate-only secret mount/config if applicable;
- exhaust zero-provider forensics;
- no production retry inside this activation.

## Non-stopping events after activation

Do not return control for:

- report/state/checkpoint pushes;
- F0 completion;
- raw-WebSocket harness fixes proven disposable-only;
- F1/F2/F3 classification;
- bounded narrow source correction inside authorized scope;
- deterministic test/review loops;
- ARM64 builds/provider-disabled replay;
- recoverable Docker/SSH/container work;
- reviewer retries on the exact required route;
- transitions into F5/F6 when their predicates are satisfied;
- terminal dossier publication.

`REPORT-PUSH-INVARIANT.md` remains binding: push often, stop rarely.

## True stop conditions after activation

Stop only for:

1. provider pool exhausted and another session genuinely required;
2. evidence requires source/runtime change outside the narrow Gemini Live boundary;
3. model/provider/account/billing/Vertex policy change is required;
4. credential creation/replacement/migration/interactive recovery is required;
5. private data or microphone use is required;
6. physical NOTE4 interaction or firmware flash is required;
7. destructive host/storage/database action outside disposable state is required;
8. unresolved P0/P1/security/privacy/data-integrity issue;
9. PR merge/release/publication.

## Proposed success state

```text
RAW_WEBSOCKET_ROOT_CAUSE_CLASSIFIED=YES
FULL_ADAPTER_NONPROD=PASS
PRODUCTION_SYNTHETIC=PASS
PRODUCTION_CANDIDATE_DEPLOYED=YES
PRODUCTION_HEALTH=PASS
ROLLBACK_AVAILABLE=YES
READY_FOR_PHYSICAL_NOTE4_DECISION=YES
PR2_STATE=open_draft_unmerged
```

## Campaign 8D1M-F activation and F0 checkpoint

The contextual human instruction `proceed`, issued after reconciliation of
this proposal, activates the bounded F sequence. The five-session ceiling is
conditional and no session is consumed merely because it exists.

```text
CAMPAIGN=8D1M_F
DIRECTIVE_STATE=AUTHORIZED_ACTIVE
ACTIVATION_BASIS=HUMAN_PROCEED_IN_CONTEXT
FUTURE_PROVIDER_SESSION_POOL_MAX=5
PROVIDER_SESSIONS_USED=0_OF_5
PRODUCTION_DEPLOYMENT=CONDITIONAL_AFTER_F5_PASS
BLIND_RETRY=NO
SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
ARM64_IMAGE=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
MODEL=gemini-3.1-flash-live-preview
SDK_BASELINE=2.20.0
```

The required official documentation refresh confirms the pinned model supports
text input and audio output; for Gemini 3.1 conversational text uses the
realtime input surface, while client content is limited to initial history
seeding. The raw WebSocket contract uses the `models/<model>` setup identifier,
`responseModalities: ["AUDIO"]`, and `realtimeInput.text`. Native audio is
identified only from server-content model-turn inline-data parts.

```text
OFFICIAL_SEMANTICS_REFRESH=PASS_2026-09-04
F0_STATUS=PASS
F0_DRIVER=PROVIDER_DISABLED_MOCK
F0_TRANSPORT=RAW_WEBSOCKET_CLASSIFIER_FIXTURE
F0_RESULT_TELEMETRY_ONLY=YES
F0_RESULT_DURABLY_RECOVERED=YES
F0_RESULT_VERIFIED_BEFORE_CLEANUP=YES
F0_CONTAINER_ROOT_READ_ONLY=YES
F0_NETWORK=NONE
F0_SECRET_MOUNT_PRESENT=NO
F0_SETUP_COMPLETE_CLASSIFIED=YES
F0_SERVER_CONTENT_CLASSIFIED=YES
F0_MODEL_TURN_CLASSIFIED=YES
F0_INLINE_AUDIO_CLASSIFIED=YES
F0_TRANSCRIPTION_CLASSIFIED=YES
F0_GENERATION_COMPLETE_CLASSIFIED=YES
F0_TURN_COMPLETE_CLASSIFIED=YES
F0_PROVIDER_ERROR_CLOSE_CLASSIFIED=YES
F0_PROVIDER_SESSIONS_USED=0
F0_PRODUCTION_CHANGED=NO
```

F1 is the next authorized action: one minimal direct raw-WebSocket session
using only the existing protected read-only credential source.

## Campaign 8D1M-F F1 result and zero-provider closure

The single F1 raw-WebSocket session was executed once against the exact
candidate. The WebSocket did not yield a setup or server-content message
within the first-message deadline, and no provider error or close callback was
observed. Consequently no accepted audio/model-turn or turn-complete event
was observed. The sanitized result was recovered independently after the
launcher control disconnect; no retry was made.

```text
F1_RESULT=F1C
F1_FAILURE_CLASS=RAW_FIRST_SERVER_MESSAGE_TIMEOUT
F1_PROVIDER_SESSION_USED=1_OF_5
F1_PROVIDER_SESSIONS_REMAINING=4
F1_SETUP_COMPLETE=NO
F1_SERVER_CONTENT=NO
F1_MODEL_TURN=NO
F1_INLINE_AUDIO=NO
F1_TURN_COMPLETE=NO
F1_PROVIDER_ERROR=NO_OBSERVED
F1_PROVIDER_CLOSE=NO_OBSERVED
F1_RESULT_DURABLY_RECOVERED=YES
F1_RESULT_RECOVERED_AFTER_CONTROL_DISCONNECT=YES
F1_RAW_PROVIDER_PAYLOAD_RETAINED=NO
F1_GENERATED_AUDIO_RETAINED=NO
F1_CREDENTIAL_VALUE_CAPTURED=NO
F1_PRIVATE_DATA_SENT=NO
F1_SEARCH_ENABLED=NO
F1_TOOLS=NONE
F1_MICROPHONE_SENT=NO
F1_PRODUCTION_CHANGED=NO
```

Zero-provider closure found no client-library defect: Node 22's built-in
WebSocket completed a local loopback fixture in the exact candidate, and the
raw endpoint/model/setup contract matches the refreshed official Live API
documentation. The evidence does not justify a Slate source correction or a
blind F2/F3 session. The remaining F sessions are retained for a materially
different, newly justified official configuration or provider strategy only.

```text
F1_ZERO_PROVIDER_FORENSICS=PASS
RAW_CLIENT_LOOPBACK_FIXTURE=PASS
RAW_ENDPOINT_CONTRACT=OFFICIAL_SEMANTICS_MATCH
PRODUCT_SOURCE_CHANGED=NO
NARROW_CORRECTION=NOT_JUSTIFIED
F2_RESULT=NOT_RUN_F1C
F3_RESULT=NOT_RUN_F1C
F4_RESULT=NOT_RUN_NO_SOURCE_DEFECT
F5_RESULT=NOT_RUN_F1C
F6_RESULT=NOT_RUN_F5_NOT_RUN
READY_FOR_NEW_PROVIDER_AUTHORIZATION=YES
```

This is the retained human/provider-strategy boundary. Production remains on
the pinned rollback image and PR #2 remains open/draft/unmerged.
