# Campaign 8D1M-A — Production Guard Correction and Full Requalification

Date: 2026-09-04 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Recover autonomously from the 8D1M pre-mutation hard stop where the exact reviewed candidate rejected the already-authorized production Developer-API Node-bridge configuration before child spawn.

This campaign authorizes a **narrow production-gating source correction plus complete zero-provider, zero-production-mutation requalification**. It must produce a newly reviewed source SHA and newly built exact ARM64 image SHA suitable for a later exact-artifact production deployment authorization.

Do not treat this as permission to deploy the new image automatically.

## Starting state

Expected starting evidence:

```text
CAMPAIGN=8D1M
STATUS=HARD_STOP_AUTHORIZED_PRODUCTION_CONFIG_REJECTED_BEFORE_CHILD
CURRENT_PRODUCT_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PR2_STATE=open_draft_unmerged
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
PROVIDER_CALLS_8D1M=0
CURRENT_PRODUCTION_HEALTH=PASS
CURRENT_PRODUCTION_RESTARTS=0
AUTHORIZED_OLD_CANDIDATE_IMAGE_SHA=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
```

The current source contains a deliberate fail-closed production guard in `GeminiConfig.isConfigured()` that rejects the Node Live bridge when `NODE_ENV=production`. Do not bypass this with `NODE_ENV=test/development` in production.

## Authority

This directive authorizes Codex to modify only the feature branch and only as needed to introduce a deliberate production-only opt-in for the already-reviewed Gemini 3.1 Developer-API Node-bridge path.

Authorized tracked changes may include:

- `backend/src/modules/assistant/gemini.config.ts`;
- `backend/src/modules/assistant/gemini.config.test.ts`;
- `backend/src/infra/config/env.schema.ts` and its tests;
- `.env.example` / `backend/.env.example` as appropriate;
- narrowly related provider-disabled integration/E2E tests;
- campaign report/state documentation.

Do not broaden this campaign into unrelated Gemini behavior, firmware, Calendar, Outlook, Search, UI, storage, Campaign 6D, PR #1, or PR #3 work.

## Required design

Introduce a distinct production-only boolean opt-in named:

```text
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
```

Default must be `false`.

This flag is additional to, not a replacement for, the existing:

```text
GEMINI_DEVELOPER_API_KEY_ENABLED
```

The production Node-bridge path may be considered configured only when **all** of the following are true:

```text
NODE_ENV=production
GEMINI_AUTH_MODE=developer_api_key
GEMINI_DEVELOPER_API_KEY_ENABLED=true
GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED=true
GEMINI_LIVE_RUNTIME=node_bridge
GEMINI_LIVE_MODEL=gemini-3.1-flash-live-preview
GEMINI_API_KEY_FILE=<usable protected file reference>
```

The usable credential-file requirements must remain at least as strict as the current source: regular file, non-symlink, non-empty, bounded size, restrictive permissions, readable by the runtime, and value never exposed by configuration/reporting code.

### Required fail-closed behavior

Production must still fail closed when any one of these conditions is true:

- `GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED` missing or false;
- existing `GEMINI_DEVELOPER_API_KEY_ENABLED` missing or false;
- wrong auth mode;
- wrong Live runtime;
- wrong Live model;
- missing/unusable credential file;
- Bun SDK + Developer API selected in production;
- any attempt to use a different model under this production opt-in.

### Required preserved behavior

- Existing `vertex_adc` behavior remains unchanged.
- Existing non-production Developer-API evaluation behavior remains unchanged.
- Production Bun SDK + Developer API remains prohibited.
- Node bridge remains private stdio only and must not gain a listener/public port.
- Backend remains model authority; NOTE4 does not obtain a Gemini credential or model ID.
- Outlook isolation and Calendar confirmation semantics remain unchanged.
- No credential value may enter logs, argv, image layers, Git, reports, environment dumps, screenshots, or reviewer prompts.

## Implementation expectations

Prefer the smallest auditable change. Do not remove the production guard wholesale. Convert it from an unconditional production ban into an explicit production authorization predicate for only the exact Node-bridge path described above.

Configuration error messages must make the distinction clear, e.g. production Node bridge requires the dedicated production opt-in rather than saying production is categorically disabled.

Update env schema/examples so the new variable is typed, defaults to false, and is documented as a production-only high-risk explicit opt-in. Do not embed or add any key value.

## Required tests

Add or update deterministic tests proving at minimum:

1. production Node bridge without the new production opt-in fails closed;
2. production Node bridge with production opt-in but existing Developer-API opt-in false fails closed;
3. production Node bridge with wrong auth mode fails closed;
4. production Node bridge with wrong model fails closed;
5. production Node bridge with missing/unusable/symlink credential fails closed;
6. production Bun SDK + Developer API remains blocked even when the new production opt-in is true;
7. exact production Node-bridge + Developer-API + exact model + both opt-ins + usable synthetic protected file is accepted;
8. `nodeBridgeOptions()` exposes only the file reference and non-secret metadata, never credential contents;
9. non-production behavior remains compatible with the existing G17-tested path;
10. Vertex/ADC configuration behavior is unchanged.

## Provider budget

```text
PROVIDER_CALLS_AUTHORIZED=0
PROVIDER_CALLS_USED=0
```

No Gemini provider call is authorized in 8D1M-A.

Do not use the real protected Gemini credential value during deterministic validation. Use synthetic tmpfs/test files only. Metadata-only read-only production credential checks may be performed if useful, without reading the value.

## Full requalification

After the narrow source correction, continue autonomously through all of the following without returning for routine approval:

1. full backend tests;
2. full shared tests;
3. lint;
4. typecheck;
5. format check;
6. frontend build;
7. secret scan / secret-safe diff inspection;
8. `git diff --check`;
9. exact provider-disabled tests covering the modified production gating logic;
10. ARM64 production candidate build from the corrected source;
11. inspect the resulting image and prove:
    - `linux/arm64`;
    - expected Bun backend runtime;
    - expected Node executable/bridge artifact;
    - exact `@google/genai` version remains `2.20.0` unless a separately justified source change is required;
    - no Gemini credential in image/build context/history;
    - Node bridge has no public listener;
12. run an exact **production-shape provider-disabled ARM64 E2E** using:
    - `NODE_ENV=production`;
    - both required Developer-API opt-ins true;
    - exact model `gemini-3.1-flash-live-preview`;
    - `GEMINI_LIVE_RUNTIME=node_bridge`;
    - synthetic restrictive temporary credential file;
    - no network / provider disabled;
    - actual candidate Node executable and bridge artifact;
    - proof the parent accepts the production configuration and reaches child-spawn/bridge-ready/mock-turn boundaries without provider traffic;
13. prove the same production-shape run fails closed when the dedicated production opt-in is removed;
14. perform read-only production health/rollback recheck only; do not deploy or restart;
15. refresh current official Google Gemini model/API-key documentation before final readiness publication and record only sanitized policy compatibility. If the exact model is removed or the authentication boundary materially changes, stop at that genuine boundary rather than inventing a workaround.

## Independent review

Run the exact independent reviewer route:

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
MODE=read_only
```

Review scope must include:

- exact source diff;
- env-schema/config gating logic;
- fail-closed matrix;
- credential-file handling;
- provider-disabled production-shape evidence;
- ARM64 image attestation;
- rollback/production-isolation evidence.

The reviewer must specifically answer whether the new production flag is a narrow explicit authorization control rather than a weakening of all production Developer-API protections.

Luna adjudicates findings. Sonnet 4.6 may implement bounded corrections. Re-run affected tests/builds/review until PASS or until a genuine retained human boundary is reached.

Do not create a human gate for ordinary P2/P3 fixes, reviewer retries, test fixes, report updates, or rebuilds. Unresolved P0/P1 security findings are a hard stop.

## Production prohibition during 8D1M-A

Throughout this campaign:

```text
PRODUCTION_DEPLOYMENT_AUTHORIZED=NO_FOR_NEW_ARTIFACT
PRODUCTION_RESTART_AUTHORIZED=NO_FOR_NEW_ARTIFACT
PRODUCTION_ENV_MUTATION_AUTHORIZED=NO_FOR_NEW_ARTIFACT
PROVIDER_CALLS_AUTHORIZED=0
PROTECTED_CREDENTIAL_VALUE_READ_AUTHORIZED=NO
BILLING_CHANGE_AUTHORIZED=NO
VERTEX_CHANGE_AUTHORIZED=NO
CREDENTIAL_CREATE_OR_REPLACE_AUTHORIZED=NO
FIRMWARE_FLASH_AUTHORIZED=NO
CALENDAR_WRITE_AUTHORIZED=NO
PR2_MERGE_AUTHORIZED=NO
DESTRUCTIVE_HOST_OR_STORAGE_WORK_AUTHORIZED=NO
```

The prior 8D1M authorization applied to the old exact candidate image and cannot be silently reused for the newly built image.

## Successful terminal state

8D1M-A succeeds only when a new production-compatible artifact has passed the complete requalification and exact reviewer route.

Publish at minimum:

```text
CAMPAIGN=8D1M_A
STATUS=READY_FOR_EXACT_NEW_ARTIFACT_PRODUCTION_AUTHORIZATION
BASE_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
CORRECTED_SOURCE_SHA=<new exact source sha>
NEW_CANDIDATE_IMAGE_SHA=<new exact arm64 image sha>
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_OPT_IN=GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
DEFAULT_PRODUCTION_OPT_IN=false
PRODUCTION_NODE_BRIDGE_WITHOUT_OPT_IN=FAIL_CLOSED
PRODUCTION_NODE_BRIDGE_EXACT_AUTHORIZED_SHAPE=PASS_PROVIDER_DISABLED
PRODUCTION_BUN_DEVELOPER_API=FAIL_CLOSED
VERTEX_ADC_BEHAVIOR=UNCHANGED
FULL_TESTS=PASS
ARM64_BUILD=PASS
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS
SECRET_IN_IMAGE=NO
NODE_BOUNDARY_PUBLIC=NO
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1M_REDEPLOYMENT_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES_EXACT_NEW_ARTIFACT_DEPLOYMENT_AUTHORIZATION
```

## Reporting and autonomy

`AUTONOMY-AND-HUMAN-GATE-POLICY.md` and `REPORT-PUSH-INVARIANT.md` remain binding.

At meaningful checkpoints, update report/state, run secret-safe checks and `git diff --check`, selectively commit, push, fetch/verify the remote SHA, and verify PR #2 remains open/draft/unmerged.

Do not stop after intermediate implementation or test milestones. Continue through correction, full validation, ARM64 requalification, exact reviewer closure, report/state publication, push verification, and the final exact-new-artifact deployment-authorization boundary in one long run whenever technically possible.

## Codex execution checkpoint — implementation correction

Date: 2026-09-04 (Australia/Perth)

The live remote branch was fetched and reconciled at directive/source checkpoint
`72e493d34d0160a11400c3e119ef9c5dbda38eb3`. The accepted pre-correction source
lineage remains `7a724488a9ed20093469caefc03addc764185be5`; no production
container, environment, settings, credential value, billing state, Vertex
state, firmware, or provider call was touched.

The narrow correction adds the required false-by-default
`GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED` schema/config/example field and
uses it as an additional predicate for the exact production Node bridge path.
The existing Developer API opt-in, exact model, node-bridge runtime, and
protected credential-file checks remain required. Production Bun SDK plus
Developer API remains fail-closed. A production-shaped provider-disabled mock
adapter test now proves the accepted parent reaches the actual child bridge,
dispatches synthetic text, and observes a completed model turn; the matching
missing-production-opt-in test proves no child spawn.

Deterministic targeted checkpoint:

```text
TARGETED_TESTS=PASS
TARGETED_TEST_COUNT=28_PASS_5_SKIP
TARGETED_EXPECTATIONS=62
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
IMPLEMENTATION_VALIDATION=IN_PROGRESS
```

The skipped tests require the integration test's synthetic secret file and are
intentionally not provider calls. Full regression, ARM64 build/E2E, exact
GLM-5.3-Flash review, and final artifact publication remain pending.

## Codex execution checkpoint — deterministic and ARM64 qualification

Date: 2026-09-04 (Australia/Perth)

The implementation checkpoint was published at source SHA
`895e2d569d6ae0e8909c3e8958d64c189810f203`, and the active PR branch was
fetched back and matched exactly. The PR remains open, draft, and unmerged.

Deterministic qualification passed:

```text
BACKEND_TESTS=PASS_332_5_SKIPPED_ENV_GATED
SHARED_TESTS=PASS_6
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
GIT_DIFF_CHECK=PASS
REPORT_SECRET_SCAN=PASS
PROVIDER_CALLS_USED=0
```

Fresh candidate build and attestation passed:

```text
ARM64_IMAGE_TAG=slate-8d1ma-candidate:895e2d5
ARM64_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
IMAGE_PLATFORM=linux/arm64
NODE_RUNTIME=v22.22.2
BUN_RUNTIME=1.4.0
GENAI_SDK_VERSION=2.20.0
NODE_BRIDGE_ARTIFACT=PASS
NODE_BRIDGE_PUBLIC_LISTENER=NO
IMAGE_HISTORY_SECRET_SCAN=PASS
SECRET_IN_IMAGE=NO
```

The exact production-shape provider-disabled E2E used `NODE_ENV=production`,
both Developer-API opt-ins, the exact Live model and Node bridge runtime, a
synthetic mode-600 temporary credential on a read-only/no-network ARM64
container, and the actual image Node executable/bridge artifact. It passed
the no-production-opt-in fail-closed test and the accepted parent → child
spawn → bridge-ready → synthetic text → model event/turn-complete test, plus
the bridge failure/sanitization suite:

```text
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS_40_TESTS
DEDICATED_OPT_IN_REMOVED=FAIL_CLOSED
CHILD_SPAWN_AND_BRIDGE_READY=PASS
SYNTHETIC_TURN_COMPLETE=PASS
NETWORK_ACCESS=DISABLED
PRIVATE_DATA_SENT=NO
GEMINI_PROVIDER_CALL=NO
GENERATED_AUDIO_RETAINED=NO
```

The final read-only production health and rollback recheck, exact independent
GLM-5.3-Flash review, Luna adjudication, and final publication remain pending.

## 8D1M-A terminal requalification checkpoint

Date: 2026-09-04 (Australia/Perth)

The required read-only production recheck passed after the new candidate was
built; no production deployment, restart, environment mutation, or Gemini
setting change occurred:

```text
CURRENT_PRODUCTION_SLATE=healthy_running
CURRENT_PRODUCTION_MYSQL=healthy_running
CURRENT_PRODUCTION_RESTARTS=0
CURRENT_PRODUCTION_IMAGE_SHA=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
PRODUCTION_HEALTHZ=PASS
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
ROLLBACK_IMAGE_METADATA=PASS_LINUX_ARM64
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
```

Exact independent review route and Luna adjudication:

```text
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_PROVIDER=ZAI
REVIEW_MODEL=glm-5.3-flash
REVIEW_MODE=read_only
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
GLM53_P3=3_ROUTINE_PUBLICATION_ITEMS
LUNA_ADJUDICATION=ACCEPT_P3_NO_SOURCE_CORRECTION_REQUIRED
```

The review confirmed that the new flag is a narrow, false-by-default
production authorization predicate, not a wholesale production Developer API
enablement. Exact auth mode, existing Developer API opt-in, exact model,
`node_bridge`, protected non-symlink restrictive credential-file checks, the
production Bun SDK prohibition, private stdio boundary, and Vertex/ADC path
remain enforced. The three P3 items were publication/recheck completeness
items and are closed by this section and the pushed state checkpoint.

The current official compatibility references were refreshed before closure:

- [Gemini 3.1 Flash Live Preview model](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview) — Live API support remains documented.
- [Gemini API key guidance](https://ai.google.dev/gemini-api/docs/api-key) — credentials remain secret runtime material; no credential value was read or recorded.
- [Gemini billing](https://ai.google.dev/gemini-api/docs/billing) — billing remains unchanged and OFF for this campaign.

Final terminal state:

```text
CAMPAIGN=8D1M_A
STATUS=READY_FOR_EXACT_NEW_ARTIFACT_PRODUCTION_AUTHORIZATION
BASE_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
CORRECTED_SOURCE_SHA=895e2d569d6ae0e8909c3e8958d64c189810f203
NEW_CANDIDATE_IMAGE_SHA=sha256:34897dd8375f1be09a00d45910d44fc484f08f2ee82099816390fab1a15d5400
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
PRODUCTION_OPT_IN=GEMINI_PRODUCTION_DEVELOPER_API_KEY_ENABLED
DEFAULT_PRODUCTION_OPT_IN=false
PRODUCTION_NODE_BRIDGE_WITHOUT_OPT_IN=FAIL_CLOSED
PRODUCTION_NODE_BRIDGE_EXACT_AUTHORIZED_SHAPE=PASS_PROVIDER_DISABLED
PRODUCTION_BUN_DEVELOPER_API=FAIL_CLOSED
VERTEX_ADC_BEHAVIOR=UNCHANGED
FULL_TESTS=PASS
ARM64_BUILD=PASS
PRODUCTION_SHAPE_PROVIDER_DISABLED_E2E=PASS
SECRET_IN_IMAGE=NO
NODE_BOUNDARY_PUBLIC=NO
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_8D1M_REDEPLOYMENT_AUTHORIZATION=YES
HUMAN_ACTION_REQUIRED=YES_EXACT_NEW_ARTIFACT_DEPLOYMENT_AUTHORIZATION
```

This is a retained human boundary. The old 8D1M production authorization does
not automatically authorize this new source/image pair. No deployment or
restart is permitted until a human separately authorizes the exact source,
image, production opt-in, protected credential policy, and rollback procedure.
