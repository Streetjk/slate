# Slate post-core finite campaign roadmap — 2026-09-14

## Status and authority

This is a preparation record, not an activation authorization. It preserves the
current core boundary and defines the finite sequence that can start after the
already-prepared no-serial physical acceptance is completed.

```text
SOURCE_REF=feature/gemini-35-live-evaluation
SOURCE_HEAD_AT_PREPARATION=948444cb42fe5dba6675a36c1c64c7264159682c
CORE_BOUNDARY=NO_SERIAL_PHYSICAL_ACCEPTANCE_PREPARED_HUMAN_BOUNDARY
CORE_PHYSICAL_REQUALIFICATION=NOT_RUN
CORE_PHYSICAL_REQUALIFICATION_CONSUMED=NO
CORE_PHYSICAL_REQUALIFICATION_PENDING=YES
SERIAL_OBSERVER_REQUIRED_FOR_PRODUCT_ACCEPTANCE=NO
PHYSICAL_ACCEPTANCE_ALLOWED_WITHOUT_SERIAL_OBSERVER=YES_FOR_HUMAN_VISIBLE_CLAIMS
OBSERVER_NONINTERFERENCE_PROVEN=NO
RESET_CAUSE_ATTRIBUTION=UNKNOWN
ACCEPTED_SOURCE=1cb585a6d554e1eddd3b3ed8300a7e3252e3bc31
ACCEPTED_BACKEND=sha256:1201ca661bc5a7e7e775f4bf0f67964852b77d31c23aa17156ba766df232ae8e
ACCEPTED_FIRMWARE=sha256:cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
ACCEPTED_COLLECTOR=m4-sanitized-structural-v3|sha256:9bac9adc2231839542b993d8a8e5af0c29414d327dfee1f4c5590f5faf334576
ACTIVATION_AUTHORIZED=NO
```

Historical observer failure, prior physical evidence, accepted artifact
identities and the current human boundary remain authoritative. Preparation
does not consume, arm or execute the physical window.

## Grok sequencing decision

The technical lead was given a compact packet containing the current core
boundary, accepted artifact identities, C7/C9/C10 evidence and authority
limits. The bounded response was:

```text
DECISION_STATUS=DECIDED
POST_CORE_PRIORITY_ORDER=B,A,C,D
PARALLEL_SAFE_PREP=B C10 source/readiness (provider-set record, no deploy); A C7 English-error-path review only (no OAuth)
CORE_PHYSICAL_DEPENDENCIES=Unconsumed/unexecuted alternate no-serial physical acceptance; serial not required for human-visible claims; reset cause UNKNOWN; device-side audio/EPD timings UNKNOWN; accepted source and reviewed backend/firmware unchanged
C7_OUTLOOK_DECISION=PREPARE_ONLY now; keep safe English error handling; Calendars.Read activation is BLOCKED_AUTHORITY pending separate Microsoft account/OAuth consent; no credentials or provider calls
C10_DECISION=SOURCE_READINESS_ONLY; isolated/reviewed/undeployed; current probes are versions/unavailable metrics only; do not deploy; do not silently replace Claude; reconcile original Codex,AGY,Claude vs implemented Codex,AGY/Gemini,Grok
C9_DECISION=REMAIN_PARKED; not a blocker; do not unpark or sequence as activation work
FINAL_HANDOFF_DECISION=LAST after B then A-prep and explicit C-park confirm; may proceed without serial and without C9; must record unconsumed no-serial physical acceptance and UNKNOWN reset/audio/EPD; no merge/release
NEXT_SAFE_ACTION=Prepare C10 source/readiness packet recording original vs implemented providers without deploy, provider calls, or Claude replacement
STOP_CONDITION=Any device access, OAuth, credentials, billing, provider calls, physical-acceptance execution, deploy, merge/release, authority grant, silent Claude-to-Grok replacement, or unparking C9 as a blocker
```

This decision orders preparation, not activation. C10 and C7 packet work can be
prepared in parallel with the pending core human window. Actual Outlook consent,
any provider/account usage source, deployment, or release remains separately
gated. C9 is not a prerequisite.

### Corrected sequencing adjudication

The first literal Grok response contained one contradiction with the already
verified no-serial product-acceptance adjudication: it described serial
observation as a core dependency and disallowed human-visible claims without
it. That contradiction was returned to Grok. The corrected decision is the
controlling sequencing result:

The C10 source-readiness action in this historical sequencing record has now
completed. The `C10_DECISION` and `NEXT_SAFE_ACTION` below are retained as
historical instructions that led to the completed C10 implementation; they
are not the current next action. The current C10 state is recorded in the
completion correction below and in the exact deployment packet.

```text
DECISION_STATUS=DECIDED
POST_CORE_PRIORITY_ORDER=B=C10_SOURCE_READINESS;A=C7_PREPARATION;C=C9_PARKED;D=FINAL_HANDOFF
PARALLEL_SAFE_PREP=C10_SOURCE_READINESS_PACKET;C7_OUTLOOK_PREP_PACKET_NO_SEND;CORE_REQUALIFICATION_REMAINS_UNEXECUTED_UNCONSUMED_PENDING
CORE_PHYSICAL_DEPENDENCIES=SERIAL_OBSERVER=DIAGNOSTIC_ONLY_NOT_A_DEPENDENCY;ALTERNATE_HUMAN_VISIBLE_ACCEPTANCE=INDEPENDENT_OF_SERIAL_OBSERVER;C10_AND_C7_PREP=INDEPENDENT_OF_CORE_PHYSICAL_AND_SERIAL;FINAL_HANDOFF_CONSUMPTION_OF_CORE=WAIT_UNTIL_CORE_EXECUTED;OBSERVER_NONINTERFERENCE_PROVEN=NO;RESET_CAUSE_ATTRIBUTION=UNKNOWN;DEVICE_AUDIO_EPD_TIMING=UNKNOWN
C7_OUTLOOK_DECISION=PREPARE_ONLY;DO_NOT_SEND;DO_NOT_GATE_ON_SERIAL_OBSERVER;NO_OAUTH_VOICE_CREDENTIALS_BILLING_PROVIDER
C10_DECISION=FIRST_POST_CORE_PRIORITY;PROCEED_SOURCE_READINESS_NOW;NOT_GATED_ON_SERIAL_OBSERVER_OR_UNEXECUTED_CORE
C9_DECISION=REMAIN_PARKED;NO_UNPARK
FINAL_HANDOFF_DECISION=NOT_NOW;WAIT_FOR_CORE_REQUALIFICATION_EXECUTED_AND_CONSUMED;HUMAN_VISIBLE_CLAIMS_DO_NOT_REQUIRE_SERIAL_OBSERVER;NO_MERGE_RELEASE_DEPLOY
REQUIRED_PACKETS=C10_SOURCE_READINESS;C7_OUTLOOK_PREPARATION;POST_CORE_SEQUENCING_REVISION_RECORDING_SERIAL_AS_DIAGNOSTIC_ONLY
NEXT_SAFE_ACTION=ADVANCE_C10_SOURCE_READINESS_PACKET_WITH_NO_SERIAL_DEVICE_CORE_PHYSICAL_OR_PROVIDER_ACTIONS
STOP_CONDITION=ANY_SERIAL_OR_DEVICE_ACCESS;VOICE;OAUTH;CREDENTIALS;BILLING;PROVIDER_CALLS;DEPLOYMENT;DATA_MUTATION;MERGE;RELEASE;OR_REINTRODUCING_SERIAL_OBSERVER_AS_PRODUCT_ACCEPTANCE_GATE
```

The corrected decision preserves the current core human boundary and does not
authorize physical acceptance, OAuth, provider calls or deployment.

## Finite post-core sequence

### Gate 0 — current core acceptance

Entry: the operator has the prepared no-serial checklist and the accepted
application/firmware/collector identities remain unchanged.

Action: one bounded human-visible NOTE4 acceptance with serial closed. It is
limited to the already-approved C8 Voice/glyph scope. No automatic repeat is
authorized.

Exit evidence: direct observations and available backend/network structural
markers only. Human-visible claims may be PASS/FAIL; reset-cause attribution,
device-side audio timing and EPD timing remain UNKNOWN without the serial
observer. This gate is not executed by this preparation record.

### Gate 1 — reconcile core result

After Gate 0, bind the consumed result to the exact source/artifacts, preserve
all UNKNOWNs, and decide whether any C8 repair is justified. A new product
repair would require its own Grok decision, tests, artifact freeze and review.

### Gate 2 — C10 source/readiness lane

This lane is source/readiness work only until a supported, authorized metric
source and provider scope are resolved. It may be prepared independently now;
activation and deployment do not precede a separate decision.

Entry: the original provider scope is explicitly reconciled and the source is
supported, read-only, machine-readable and privacy-safe.

Exit: each provider is `AVAILABLE`, `UNSUPPORTED` or `UNAVAILABLE` with a
source-bound reason. No version probe, token total or session cost is promoted
to subscription quota. A C10 product change requires deterministic tests,
security review, exact artifact freeze and separate deployment authority.

### Gate 3 — C7 Outlook optional lane

This lane remains independent of C10 but requires a separate human Microsoft
account/OAuth-consent decision before real connectivity. Preparation is allowed
now; connection, private agenda access and token refresh are not.

Entry: explicit operator selection of the Outlook lane and Microsoft consent
for the existing account, with maximum scope `Calendars.Read`.

Exit: read-only connectivity and safe failure/re-auth behavior are directly
tested, or the lane is deliberately deferred. No writes, calendar mutation,
Gemini exposure or private-content logging are permitted.

### Gate 4 — C9 parked lane

C9 remains research-only and parked. It can be reopened only by new documented
evidence showing that the accepted Gemini/Vertex architecture cannot meet a
required product property, plus a new operator selection. Research does not
justify live provider experiments, OAuth/project creation, credentials, billing
or runtime replacement.

### Gate 5 — final repository and deployment handoff

After the core result and any selected optional lanes are reconciled, prepare a
single exact handoff. Keep application deployment, firmware flash, data
consolidation, physical acceptance and release as distinct scopes. No merge or
public release is implied by a private deployment handoff.

## C7 Outlook readiness packet — preparation only

```text
C7_OUTLOOK_PREPARED=YES
C7_OUTLOOK_CURRENT_STATUS=SAFE_ENGLISH_ERROR_HANDLING_ONLY
C7_OUTLOOK_CONNECTIVITY_STATUS=NOT_PROVEN_UNCONFIGURED
C7_OUTLOOK_SCOPE_MAX=Calendars.Read
C7_OUTLOOK_WRITES=FORBIDDEN
C7_OUTLOOK_GEMINI_EXPOSURE=FORBIDDEN
C7_OUTLOOK_AUTHORITY_REQUIRED=SEPARATE_OPERATOR_SELECTION_PLUS_MICROSOFT_ACCOUNT_OAUTH_CONSENT
C7_OUTLOOK_EXECUTION_THIS_RUN=NO
```

What a future read-only run would prove:

- connect and visible configured/unconfigured state;
- a read-only Perth agenda with recurrence, all-day events and timezone
  conversion handled correctly;
- disconnect and re-authentication;
- safe failure and stale/expired-token handling;
- no writes and no private event content in logs or structural observer data.

Future acceptance fields:

```text
C7_OUTLOOK_CONNECT_RESULT=PASS|FAIL|UNKNOWN
C7_OUTLOOK_CONFIGURED_STATE_VISIBLE=PASS|FAIL|UNKNOWN
C7_OUTLOOK_READONLY_PERTH_AGENDA=PASS|FAIL|UNKNOWN
C7_OUTLOOK_RECURRENCE=PASS|FAIL|UNKNOWN
C7_OUTLOOK_ALL_DAY=PASS|FAIL|UNKNOWN
C7_OUTLOOK_TIMEZONE=PASS|FAIL|UNKNOWN
C7_OUTLOOK_DISCONNECT_REAUTH=PASS|FAIL|UNKNOWN
C7_OUTLOOK_SAFE_FAILURE=PASS|FAIL|UNKNOWN
C7_OUTLOOK_NO_WRITE_PROOF=PASS|FAIL|UNKNOWN
C7_OUTLOOK_NO_TOKEN_PRIVATE_CONTENT_LOGGING=PASS|FAIL|UNKNOWN
```

Privacy and rollback: retain only connection-state classes, scope classes,
sanitized timestamps and bounded error classes; never retain OAuth tokens,
authorization codes, account identifiers or event titles. Stop and revoke the
optional lane if scope exceeds `Calendars.Read`, consent is unavailable, or
private data would enter logs. Roll back only the optional Outlook change; do
not recreate unrelated cards or alter the accepted Gemini path.

Future minimal authorization template (not requested now):

```text
AUTHORIZE_C7_OUTLOOK_READONLY=YES
MICROSOFT_ACCOUNT_CONSENT=ONE_EXISTING_ACCOUNT
OAUTH_SCOPE=Calendars.Read
ALLOW_WRITES=NO
ALLOW_PRIVATE_EVENT_LOGGING=NO
ALLOW_DEPLOYMENT=SEPARATE_EXPLICIT_SCOPE
```

## C10 quota-dashboard readiness packet — preparation only

```text
C10_PREPARED=YES
C10_IMPLEMENTATION_STATUS=ISOLATED_REVIEWED_UNDEPLOYED
C10_EXECUTION_THIS_RUN=NO
C10_ORIGINAL_PROVIDER_SCOPE=CODEX;AGY;CLAUDE
C10_CURRENT_IMPLEMENTED_PROVIDER_SCOPE=CODEX;AGY_GEMINI;GROK
C10_CLAUDE_REPLACED_BY_GROK=NO_NOT_AUTHORIZED
C10_PROVIDER_SCOPE_DECISION_REQUIRED=YES
```

Local source inspection at C10 head `e9a6cfac86c63cb461a62d5029080332fac06865`
found `AiUsageService.COMMANDS` invoking only `codex --version`, `agy
--version` and `grok --version`. Successful probes return
`UNAVAILABLE_NO_MACHINE_READABLE_USAGE` with null quota and session metrics.
The source has a sanitized future-payload parser, but no authorized producer is
bound to it. This is scaffolding, not subscription usage.

Safe controller CLI surfaces inspected without provider calls or credential
store access:

```text
CODEX_PRESENT=YES
CODEX_VERSION=0.153.4
AGY_PRESENT=YES
AGY_VERSION=1.2.2
GROK_PRESENT=YES
GROK_VERSION=1.0.30
CLAUDE_PRESENT=YES
CLAUDE_VERSION=2.1.266
CODEX_SAFE_SURFACE=HELP_VERSION_ONLY
AGY_SAFE_SURFACE=HELP_VERSION_ONLY
GROK_SAFE_SURFACE=HELP_VERSION_ONLY;USAGE_COMMAND_REQUIRES_SESSION_ID
CLAUDE_SAFE_SURFACE=HELP_VERSION_ONLY
```

The existing isolated C10 test command was attempted and could not initialize
because `backend/node_modules/@nestjs/common` is absent; it was interrupted
after remaining idle. This is a test-environment limitation, not a product
failure and not evidence of quota availability.

Source status by provider:

| Provider | Supported safe source now | Meaning permitted in C10 |
| --- | --- | --- |
| Codex | Version/help only; no supported subscription-quota source proven | `UNAVAILABLE` for quota; session metrics only if a supported local source is later bound |
| AGY/Gemini | Version/help only; AGY-specific machine-readable quota source not proven | `UNAVAILABLE` for quota |
| Claude | Binary present; current C10 implementation does not include it | `UNRESOLVED_SCOPE`; do not silently replace with Grok |
| Grok | Version/help only; usage command requires a session identifier and does not prove subscription quota | `UNAVAILABLE` for subscription quota; local session metrics only if explicitly supported |

Required semantics: `AVAILABLE` requires a fresh supported source; `STALE`
requires previously available data with an explicit age; `UNAVAILABLE` means
no supported source; `ERROR` means a supported source failed. Never infer
subscription-window quota from token totals, version availability or command
exit success.

Future C10 fields:

```text
C10_CODEX_SOURCE_STATUS=AVAILABLE|STALE|UNAVAILABLE|ERROR
C10_AGY_SOURCE_STATUS=AVAILABLE|STALE|UNAVAILABLE|ERROR
C10_CLAUDE_SOURCE_STATUS=AVAILABLE|STALE|UNAVAILABLE|ERROR|UNRESOLVED_SCOPE
C10_GROK_SOURCE_STATUS=AVAILABLE|STALE|UNAVAILABLE|ERROR
C10_SUBSCRIPTION_WINDOW_QUOTA=VALUE_OR_UNKNOWN
C10_SESSION_TOKEN_TOTAL=VALUE_OR_UNKNOWN
C10_SESSION_COST_TOTAL=VALUE_OR_UNKNOWN
C10_RESET_TIME=VALUE_OR_UNKNOWN
C10_SOURCE_UPDATED_AT=VALUE_OR_UNKNOWN
C10_PROVIDER_SCOPE_RECONCILED=YES|NO
C10_DEPLOYMENT_AUTHORIZED=YES|NO
```

Future tests must cover source allowlisting, fresh/stale/unavailable/error
states, malformed and private-field rejection, bounded output, provider
isolation, and the explicit original-versus-current provider scope. Activation
requires a separate exact source, account/credential authority where needed,
artifact review and deployment authority; none is requested here.

## C9 parked-lane packet

```text
C9_PREPARED=YES
C9_STAGE=PARKED_RESEARCH_ONLY
C9_PRODUCT_CHANGE=NO
C9_PROVIDER_CALLS=0
C9_RUNTIME_REPLACEMENT_JUSTIFIED=NO
C9_REOPEN_TRIGGER=NEW_DOCUMENTED_EVIDENCE_THAT_ACCEPTED_GEMINI_VERTEX_CANNOT_MEET_A_REQUIRED_PRODUCT_PROPERTY_PLUS_EXPLICIT_OPERATOR_SELECTION
C9_PROHIBITED_WITHOUT_NEW_AUTHORITY=OAUTH;PROJECT_CREATION;BILLING;NEW_CREDENTIALS;PROVIDER_MODEL_AUTH_CHANGE;LIVE_PROVIDER_EXPERIMENT;DEPLOYMENT
```

The accepted Gemini/Vertex architecture remains the product runtime. C9 does
not block core acceptance, C7, C10 readiness or final handoff. No new C9
research work is justified by the currently available evidence.

## Final completion and handoff packet

| Area | Implemented | Reviewed | Deployed | Physically accepted | Deferred | Blocked/unknown |
| --- | --- | --- | --- | --- | --- | --- |
| C8 glyph/language/timing repair | YES | YES, exact core artifacts | YES for accepted backend/firmware identities | Current no-serial window not run | — | Device-side reset/audio/EPD attribution UNKNOWN |
| C7 Calendar/Weather/News | Existing reviewed behavior | Historical/component evidence | Existing accepted state | Current no-serial scope does not cover these | — | Preserve prior partial/failed physical results |
| C7 Outlook | Safe error handling | Source/tests | NO actual OAuth connectivity | NO | YES pending separate consent | Actual connectivity UNKNOWN |
| BTC Weekly-only | Targeted consolidation complete historically | YES | YES in existing accepted state | Not part of current no-serial scope | — | — |
| C10 AI usage/quota | Isolated scaffolding only | Historical isolated review | NO | NO | YES pending source/scope | Real quota source and Claude scope unresolved |
| C9 auth research | No runtime change | Historical research | NO | N/A | YES, parked | Reopen trigger absent |
| Repository integration/release | Four draft PRs preserved | Candidate reviews exist | Private deployment/release handoff not final | N/A | YES | Merge/release authority absent |

PR integration options, without merging:

1. retain each lane as an open draft and produce a reviewed integration commit
   on PR2 only after the core and selected optional lanes are reconciled; or
2. prepare a private deployment handoff from exact reviewed artifacts while
   keeping all PRs open; or
3. if public release is later selected, perform a separately authorized merge
   sequence after branch reconciliation and final review.

Private deployment means an exact artifact is installed in the authorized
environment; it is not a public release and does not close or merge PRs.

Rollback references remain the previously accepted backend image/source and
application-only firmware scope in the current campaign state. Any future
optional lane must carry its own exact rollback identity and must not mutate
MySQL, unrelated dynamic content, device pairing or network identity.

Remaining human gates are separate: the current no-serial physical acceptance;
optional Microsoft OAuth/account consent for C7 Outlook; any C10 account/source
authority and deployment; exact application/firmware activation authority if a
new candidate is produced; and any eventual merge/release authority.

### C10 completion correction

The initial C10 preparation fields and the table row above are retained as
historical preparation evidence. They are superseded for the current frontier
by the completed source-only implementation and exact local artifact review:

```text
C10_CURRENT_PR_HEAD=6251317327b52cc08021e1fd6956955b300333c3
C10_REVIEWED_PRODUCT_SOURCE=965f1a605ff47b64dee20b36c68597db5760b46f
C10_EXACT_ARTIFACT_IMAGE_ID=sha256:821de0092acd4aa121984a9a9f2f16a7fb26254580f2ed6b62a970dc4eb94dfb
C10_EXACT_ARTIFACT_PLATFORM=linux/arm64
C10_EXACT_ARTIFACT_TRANSPORT=LOCAL_LOAD_ONLY_NO_TRANSPORT_DIGEST
C10_ROLLBACK_IMAGE_ID=sha256:bc755aa2aa78017b327e1f12bf91bebd1f3446f36f8f0def5b328087288207ae
C10_PROVIDER_SCOPE=CODEX;AGY_GEMINI;CLAUDE;GROK_ADDITIVE_NOT_CLAUDE_REPLACEMENT
C10_ARTIFACT_REVIEW=PASS_P0_0_P1_0_P2_DOCUMENTED_LIMITATIONS_SECURITY_PASS
C10_CURRENT_STAGE=SOURCE_AND_EXACT_ARTIFACT_REVIEWED_READY_FOR_SEPARATE_DEPLOYMENT_AUTHORITY_NOT_DEPLOYED
C10_DEPLOYED=NO
C10_RUNTIME_HEALTH=UNKNOWN_UNTESTED
C10_DEPLOYMENT_AUTHORIZED=NO
C10_NEXT_ACTION=REQUEST_SEPARATE_C10_DEPLOYMENT_AUTHORITY_FOR_EXACT_LOCAL_IMAGE_ID
```

C7 Outlook remains preparation-only and still requires its separate
`Calendars.Read` Microsoft consent boundary. C9 remains `PARKED_RESEARCH_ONLY`.
Neither lane is changed or implicitly activated by C10 completion. The exact
deployment preconditions and exclusions are in
`PORTFOLIO-C10-DEPLOYMENT-AUTHORITY-PACKET-2026-09-14.md` on PR #2.

## Preparation frontier

```text
POST_CORE_PREPARED=YES
POST_CORE_RUNNABLE_SAFE_WORK_COUNT=0
POST_CORE_PREPARATION_RESULT=COMPLETE_SOURCE_AND_READINESS_PACKETS
CURRENT_CORE_BOUNDARY_UNCHANGED=YES
NEXT_POST_CORE_ACTION=AWAIT_CURRENT_NO_SERIAL_PHYSICAL_ACCEPTANCE;THEN_RECONCILE_CORE_RESULT;C10_DEPLOYMENT_REMAINS_SEPARATE_AUTHORITY_GATE
```

No physical interaction, OAuth, provider call, deployment, data mutation,
firmware action, merge or release was performed by this preparation.
