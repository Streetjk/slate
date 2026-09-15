# Campaign 8D1M-G M4 — provider session setup failure: zero-provider diagnosis before any further live authority

## Purpose

The hardened qualification harness is now deterministic and independently reviewed, but the next bounded live qualification terminated as:

```text
QUALIFICATION_TERMINAL=FAIL_SESSION_SETUP
EARLIEST_MISSING_OR_FAILED_BOUNDARY=PROVIDER_SESSION_ESTABLISHMENT
FIRST_SYNTHETIC_AUDIO_SENT_OBSERVED=NO
FIRST_INPUT_TRANSCRIPTION_EVENT_OBSERVED=NO
FIRST_PROVIDER_OUTPUT_EVENT_OBSERVED=NO
```

No further provider session is authorized by this directive.

This stage must diagnose the provider-session setup failure entirely with provider-disabled evidence before any new live authority is requested.

Preserve:

- `docs/campaign-reports/08D1M-G-M4-LONG-CONTINUOUS-CAMPAIGN.md`
- `docs/campaign-reports/AUTONOMY-AND-HUMAN-GATE-POLICY.md`
- `docs/campaign-reports/REPORT-PUSH-INVARIANT.md`
- `docs/campaign-reports/08D1M-G-M4-PROVIDER-QUALIFICATION-HARNESS-RECOVERY.md`
- `docs/campaign-reports/08D1M-G-M4-PHYSICAL-SOAK-CONSUMED-INPUT-LATENCY-ASR-FOLLOWUP.md`

PR #2 remains OPEN / DRAFT / UNMERGED.

## Activation snapshot

```text
MODE=FRONTIER_DRIVEN_LONGRUN
LIVE_HEAD_AT_ACTIVATION=53a29a9e76e5b44ad2fa129c290fcc652c78bcab
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
DEPLOYED_PRODUCT_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
DEPLOYED_BACKEND_TAG=slate:m4-asr-input-repaired
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
INPUT_TRANSCRIPTION_HINT=en-US;ja-JP
QUALIFICATION_HARNESS_SOURCE_SHA=1edf33e578030c60d12a20b04ea271b58266195d
QUALIFICATION_HARNESS_REVIEW_STATUS=PASS_GROK_4_6_P0_0_P1_0_P2_0_SECURITY_0
QUALIFICATION_HARNESS_DETERMINISTIC_TESTS=PASS_15
PROVIDER_QUALIFICATION_SESSION_ATTEMPTS=2
LATEST_PROVIDER_RESULT=FAIL_SESSION_SETUP
PROVIDER_RETRY_AUTHORIZED=NO
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
```

## Important evidence distinction

The live harness now proves only that session setup failed before synthetic audio.

It does **not** prove:

- the Gemini model itself is broken;
- the developer API key is invalid;
- the Node bridge is generally broken;
- `languageCodes` is definitely unsupported by the current model;
- bilingual ASR is impossible;
- a provider retry would succeed.

The exact sanitized provider/config/connect sub-error was not retained, so root cause remains unresolved.

## Zero-provider setup diagnosis and reviewed compatibility repair — 2026-09-10

The live PR was reconciled before this diagnosis. The consumed provider attempt
was not retried and no physical device action or production restart was used.

```text
LIVE_PR_HEAD_AT_DIAGNOSIS=97b84394d20f386b2fd821552735440e5f0e443b
PR_STATE=OPEN
PR_DRAFT=YES
PR_MERGED=NO
PROVIDER_CALLS_DURING_DIAGNOSIS=0
AUTHORIZATION_PROVENANCE=EXPLICIT_OPERATOR_INSTRUCTION_AVAILABLE
```

### Exact setup reconstruction

The durable last-known generic setup is `1cfb1a2`; its immediate instrumentation
descendant `97711c4` retained the same provider setup. The deployed `b0606b6`
candidate added the same bilingual field in both the Node bridge and direct SDK
paths. The exact source diff is:

```text
LAST_KNOWN_SESSION_ESTABLISHING_SOURCE=1cfb1a2
LAST_KNOWN_SETUP_INPUT_AUDIO_TRANSCRIPTION={}
CURRENT_DEPLOYED_SETUP_INPUT_AUDIO_TRANSCRIPTION={languageCodes:["en-US","ja-JP"]}
PROVIDER_FACING_SETUP_DIFF=ONLY_inputAudioTranscription.languageCodes_ADDED_RELATIVE_TO_1cfb1a2
NON_PROVIDER_INSTRUMENTATION_DIFF=T_AUDIO_INPUT_COMMIT_OR_TURN_END;T_PROVIDER_INPUT_TRANSCRIPTION_FIRST_PARTIAL;T_BACKEND_USER_TRANSCRIPT_FLUSH;T_USER_BUBBLE_EVENT_POSTED
PROVIDER_FACING_SETUP_DIFF_b0606b6_vs_97711c4=NONE
```

The instrumentation additions are in `xiaozhi-voice-session.ts`; they do not
change the provider setup object. This mechanically isolates the bilingual
field as the only material provider-facing difference relative to the generic
session-establishing baseline.

### Provider-disabled actual connect-object capture

The actual `ai.live.connect` call in the Node bridge was intercepted with a
fake SDK module and no network access. Only structural summaries were retained:

```text
CAPTURE_MODE=PROVIDER_DISABLED_FAKE_SDK
MODEL=gemini-2.5-flash-native-audio-preview-12-2025
RESPONSE_MODALITIES=["AUDIO"]
INPUT_AUDIO_TRANSCRIPTION={languageCodes:["en-US","ja-JP"]}
OUTPUT_AUDIO_TRANSCRIPTION=OBJECT_PRESENT_EMPTY
SPEECH_CONFIG=ABSENT
REALTIME_INPUT_CONFIG=ABSENT
ACTIVITY_CONFIG=ABSENT
SYSTEM_INSTRUCTION=STRING_PRESENT_BYTES_ONLY
TOOLS=ARRAY_PRESENT_FUNCTION_DECLARATION_SHAPE_ONLY
UNDEFINED_CONFIG_KEYS=NONE
NULL_CONFIG_KEYS=NONE
NETWORK_CALL=NO
```

The provider-disabled serialization matrix was also executed:

```text
CASE_1_INPUT_AUDIO_TRANSCRIPTION={}
CASE_2_INPUT_AUDIO_TRANSCRIPTION={languageCodes:["en-US","ja-JP"]}
CASE_3_INPUT_AUDIO_TRANSCRIPTION={languageCodes:[]}
CASE_SERIALIZATIONS_DISTINCT=YES
SERVER_ACCEPTANCE=NOT_TESTED
```

### Model-specific capability audit

The pinned `@google/genai` 2.20.0 declaration exposes the generic
`AudioTranscriptionConfig.languageCodes` member. That proves SDK schema
availability only. The official Live transcription documentation documents
language-code hints for Gemini 3.5 Transcribe Live, while the official
Gemini 2.5 Flash Native Audio preview model page does not document this field
for the current model. Therefore:

```text
SDK_SCHEMA_SUPPORTS_LANGUAGE_CODES=YES_GENERIC_TYPE_ONLY
CURRENT_MODEL=gemini-2.5-flash-native-audio-preview-12-2025
CURRENT_MODEL_DOCUMENTS_LANGUAGE_CODES_SUPPORT=NO_OFFICIAL_MODEL_SPECIFIC_DOCUMENTATION_FOUND
CURRENT_MODEL_EXPLICITLY_REJECTS_LANGUAGE_CODES=NO_OFFICIAL_MODEL_SPECIFIC_ASSERTION
CURRENT_MODEL_SUPPORT_STATUS=UNDOCUMENTED
LANGUAGE_CODES_HYPOTHESIS=STRONGLY_IMPLICATED_BY_ONLY_PROVIDER_SETUP_DIFF_AND_PRE_AUDIO_FAILURE;NOT_SERVER_PROVEN
BILINGUAL_ASR_STATUS=UNRESOLVED_FOR_CURRENT_GEMINI25_MODEL
```

References used for the capability distinction: [Google Live API transcription](https://ai.google.dev/gemini-api/docs/live-api/live-transcribe), [Gemini 2.5 Flash Native Audio model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-native-audio-preview-12-2025), and [Live API capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities).

### Sanitized failure-class preservation

The bridge/harness boundary now retains exactly one of:

```text
AUTH
MODEL_NOT_FOUND
UNSUPPORTED_CONFIG
INVALID_ARGUMENT
QUOTA
NETWORK
TLS
PROTOCOL
UNKNOWN_SANITIZED
```

Unknown values, raw error strings and bridge codes that cannot prove a finer
class map to `UNKNOWN_SANITIZED`. Raw provider error text, payloads, secrets,
auth headers, identifiers, transcripts and audio are discarded. Existing
terminal precedence and exactly-one-terminal accounting remain unchanged.

### Minimum repair, validation and freeze

Because the field is undocumented for the current Gemini 2.5 model and the
failure occurred before audio/session establishment, the minimum reviewed
candidate restores the generic setup in both production paths:

```text
backend/src/modules/assistant/gemini-live-node-bridge-runtime.mjs: inputAudioTranscription={}
backend/src/modules/assistant/gemini-live.service.ts: inputAudioTranscription={}
```

No model, provider, auth, credential, billing, private-data, tool, audio,
turn-order, stale-generation, queue or timing behavior was changed. The
bilingual ASR question remains open; the current model was not silently
switched or globally forced to Japanese.

```text
AGY_IMPLEMENTATION_MODEL=gemini-3.8-flash-high
AGY_IMPLEMENTATION=PASS_MINIMUM_SCOPE
HARNESS_TESTS=PASS_18
ASSISTANT_FOCUSED_TESTS=PASS_86;SKIP_5_ENVIRONMENT_GATED;FAIL_0
TYPECHECK=PASS
LINT=PASS
FORMAT=PASS_IMPACTED_TYPESCRIPT
GIT_DIFF_CHECK=PASS
PRODUCTION_SECRET_SCAN=PASS
PRIVACY_REDACTION_TESTS=PASS
SOURCE_FREEZE_COMMIT=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
ARM64_BUILD=PASS
ARM64_IMAGE_ID=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
ARM64_IMAGE_SIZE_BYTES=1130803552
FIRMWARE_CHANGED=NO
FIRMWARE_FLASHED=NO
PRODUCTION_DEPLOYMENT=NO
PROVIDER_QUALIFICATION=NO_NEW_SESSION
EXACT_INDEPENDENT_REVIEWER=GROK_4_6
EXACT_INDEPENDENT_REVIEW_COMMAND=grok -m grok-4.6
EXACT_REVIEW_TARGET=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
EXACT_REVIEW_STATUS=PASS
EXACT_REVIEW_BLOCKING_FINDINGS=0
EXACT_REVIEW_P0=0
EXACT_REVIEW_P1=0
EXACT_REVIEW_P2=0
EXACT_REVIEW_SECURITY=0
```

The candidate is fully qualified and independently reviewed, but it is not the
deployed product identity. The existing deployment/provider authority does not
cover this changed candidate, and this directive grants no new provider or
deployment action.

```text
CURRENT_PRODUCT_DEPLOYED_SOURCE=b0606b6beb22a21b49570c17c323a64d486c38c9
CURRENT_PRODUCT_DEPLOYED_IMAGE=sha256:177c3ed9f369eb4cf675bc907584028bb5e3787d4c0ee6daef835d6b2e964e14
CANDIDATE_SOURCE=f0dfdad0b4065e48ff8bc82aa505706d40fd9f4c
CANDIDATE_IMAGE=sha256:b271eb8bfcb7a4d04d602d3974ceeb83c928e72721c67fda19c1c2e822a646d5
NEW_DEPLOYMENT_AUTHORITY=REQUIRED
NEW_PROVIDER_SESSION_AUTHORITY=REQUIRED
PHYSICAL_ACTION_REQUESTED=NO
```

## Highest-priority compatibility hypothesis

The current product model is:

`gemini-2.5-flash-native-audio-preview-12-2025`

The new candidate changed the input transcription setup from the previously working generic transcription config to a bilingual hint:

```text
inputAudioTranscription.languageCodes=["en-US","ja-JP"]
```

Current Google documentation explicitly documents `languageCodes` / BCP-47 hinting for Gemini 3.5 Transcribe Live. Generic current `@google/genai` types expose `AudioTranscriptionConfig.languageCodes`, but generic SDK type acceptance is not proof that this exact field is accepted by every Live model, especially the currently deployed Gemini 2.5 Native Audio preview.

The fact pattern therefore makes **model-specific setup compatibility of `inputAudioTranscription.languageCodes`** the leading hypothesis to falsify provider-disabled. Treat it as a hypothesis, not a conclusion.

## Immediate zero-provider diagnosis

Do not call Gemini while performing the following.

### 1. Exact setup-payload diff

Mechanically reconstruct and diff the Node bridge Live-connect setup payload for:

```text
A = last known session-establishing production config before b0606b6
B = b0606b6 deployed config
```

Separate provider-facing setup differences from structural-only instrumentation differences.

Publish:

```text
LAST_KNOWN_SESSION_ESTABLISHING_SOURCE=
LAST_KNOWN_SETUP_INPUT_AUDIO_TRANSCRIPTION=
CURRENT_SETUP_INPUT_AUDIO_TRANSCRIPTION=
PROVIDER_FACING_SETUP_DIFF=
NON_PROVIDER_INSTRUMENTATION_DIFF=
```

If `languageCodes` is the only material provider-facing setup difference, state that mechanically.

### 2. Serialize the actual SDK setup request provider-disabled

Use mocks/interception/local harnessing to capture the exact object passed to `ai.live.connect` / Node bridge setup without network access.

Verify:

- model ID;
- response modalities;
- input transcription config;
- output transcription config if present;
- speech config;
- system instruction;
- tool declaration shape;
- any realtime input/activity config;
- no accidental undefined/null/schema drift.

Do not print secrets or protected values.

### 3. Model-specific capability audit

Using repository-pinned SDK/runtime documentation, installed package types/source, protocol descriptors and current official Google documentation available to the controller, distinguish:

```text
SDK_SCHEMA_SUPPORTS_LANGUAGE_CODES=
CURRENT_MODEL_DOCUMENTS_LANGUAGE_CODES_SUPPORT=
CURRENT_MODEL_EXPLICITLY_REJECTS_LANGUAGE_CODES=
CURRENT_MODEL_SUPPORT_STATUS=SUPPORTED|UNSUPPORTED|UNDOCUMENTED|UNKNOWN
```

Do not infer model support solely from generic `@google/genai` types.

Current public documentation should be treated carefully: the documented language-code hint examples are for Gemini 3.5 Transcribe Live. The current product remains Gemini 2.5 Flash Native Audio preview unless a separately authorized model decision is made.

### 4. Deterministic setup compatibility matrix

Provider-disabled tests must cover at least:

```text
CASE_1=inputAudioTranscription={}
CASE_2=inputAudioTranscription={languageCodes:["en-US","ja-JP"]}
CASE_3=inputAudioTranscription={languageCodes:[]}
```

The tests must prove serialization/config-path differences and fail-closed classification. They cannot claim server acceptance without a provider call.

### 5. Audit error preservation

The consumed live run recorded:

`PROVIDER_ERROR_CLASS=SANITIZED_BRIDGE_ERROR_CLASS_NOT_RETAINED_BY_DRIVER`

That is insufficient for a scarce bounded live session.

Harden the harness/bridge boundary provider-disabled so a future session records exactly one allowlisted setup/connect error class such as:

```text
PROVIDER_ERROR_CLASS=AUTH
PROVIDER_ERROR_CLASS=MODEL_NOT_FOUND
PROVIDER_ERROR_CLASS=UNSUPPORTED_CONFIG
PROVIDER_ERROR_CLASS=INVALID_ARGUMENT
PROVIDER_ERROR_CLASS=QUOTA
PROVIDER_ERROR_CLASS=NETWORK
PROVIDER_ERROR_CLASS=TLS
PROVIDER_ERROR_CLASS=PROTOCOL
PROVIDER_ERROR_CLASS=UNKNOWN_SANITIZED
```

Never retain raw provider error text, payloads, request bodies, credentials or identifiers.

Every live failure must retain enough sanitized classification to avoid another blind retry.

## Candidate decision

After zero-provider diagnosis, Codex must choose mechanically among:

### A. `languageCodes` strongly implicated / model support undocumented or incompatible

Prepare the minimum candidate that restores the last-known session-establishing transcription setup for the current Gemini 2.5 Native Audio model while **preserving the new structural input-latency instrumentation**.

Do not silently switch Gemini models.

Do not remove the bilingual ASR issue from the campaign; instead classify it as unresolved for the current model and identify whether a later supported approach requires:

- prompt/session bias only;
- a different documented field actually supported by the current model;
- a dedicated transcription path;
- or a model change.

Any model/provider/auth architecture change requires explicit human authority.

### B. Another non-language setup regression is found

Repair only that exact setup regression, preserve bilingual hinting if mechanically compatible, then run deterministic validation.

### C. No provider-disabled cause can be isolated

Do not guess. Harden error-class preservation completely, freeze the unchanged product/harness identities, and request at most one new provider session only after all safe work is exhausted.

## Implementation / review loop

If a code change is justified:

```text
CODEX_ADJUDICATION
  -> AGY_IMPLEMENTATION=gemini-3.8-flash-high
  -> FOCUSED_PROVIDER_DISABLED_TESTS
  -> IMPACTED_TYPECHECK_LINT_FORMAT_BUILD
  -> PRIVACY_SECRET_SCAN
  -> GIT_DIFF_CHECK
  -> EXACT_SOURCE_ARTIFACT_FREEZE
  -> FRESH_GROK_4_6_REVIEW
```

Grok route:

`grok -m grok-4.6`

No ZAI retry. No silent reviewer fallback.

A Grok PASS is not a stop while safe work remains.

## Authorization provenance audit

The consumed-session report labels:

`AUTHORIZATION_SOURCE_HEAD=1f5e1a8ae26bc5a2b3825b9348530ad7a2a6538f`

However that Git commit is a documentation-only frontier-identity commit and does not itself contain an operator authorization statement.

Do not treat a Git head SHA alone as proof of human authority.

Before any future provider/deploy/flash action, record the authority provenance mechanically as one of:

```text
AUTHORIZATION_PROVENANCE=EXPLICIT_OPERATOR_INSTRUCTION_AVAILABLE
AUTHORIZATION_PROVENANCE=DURABLE_AUTHORIZATION_REPORT
AUTHORIZATION_PROVENANCE=UNRESOLVED_DO_NOT_ACT
```

If the explicit operator instruction exists outside Git history, record only its bounded authority facts, not private conversation content. If provenance cannot be established, mark unresolved and do not act.

This audit is governance hygiene and does not retroactively classify the already-consumed session as unauthorized without evidence.

## No new live authority in this directive

This directive authorizes no provider session, production redeploy/restart, firmware flash, NOTE4 reset/re-pair, Wi-Fi change, Gemini model/provider/auth change, credential action, billing action, private-data expansion, Calendar/Outlook action, merge or release.

Keep the deployed backend candidate active while healthy unless deterministic evidence justifies a reviewed replacement and a later explicit deployment boundary.

## Work-queue invariant

The current state again says `NEXT_ACTION=CONTINUE_ZERO_PROVIDER_DIAGNOSIS` while reporting `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`.

Correct this. Zero-provider setup diagnosis is a READY/READONLY_READY node until exhausted.

Before any controller exit publish:

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
AUTHORIZATION_PROVENANCE=
```

Rules:

- if READY > 0, continue;
- if READONLY_READY > 0, continue;
- do not request another provider session until zero-provider setup diagnosis, error preservation, deterministic validation and any required Grok loop are complete;
- do not request physical NOTE4 action to diagnose a provider-session setup failure;
- report pushes/reviews/builds/tests are not stops while safe work remains;
- keep PR #2 OPEN / DRAFT / UNMERGED;
- do not expand into Campaign 9 / PR #3.

## Immediate next action

Reconcile live head and running backend identity, then diagnose the `FAIL_SESSION_SETUP` boundary provider-disabled. Start with an exact before/after provider setup payload diff and model-specific `inputAudioTranscription.languageCodes` compatibility audit. Preserve the new latency instrumentation, harden sanitized error-class retention, and continue automatically through any justified AGY/Grok repair loop. Return only at a genuine new authority boundary after all safe work is exhausted.
