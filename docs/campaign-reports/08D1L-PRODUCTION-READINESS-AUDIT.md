# Campaign 8D1L — Gemini 3.1 Live production-readiness audit

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite: 8D1K exact non-production adapter E2E PASS.

## Objective

Turn a successful exact non-production Node Live adapter result into a production-readiness decision without deploying, restarting production, changing billing, or changing the production Gemini model/auth mode.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 for bounded readiness fixes/documentation only;
- reviewer: GLM-5.3-Flash read-only final readiness review;
- repository integrator/validator/sole writer: Codex.

## Audit areas

1. Re-run complete backend/shared tests, lint, typecheck, format, frontend build, diff check, and secret scan against the exact proposed production artifact.
2. Rebuild the ARM64 production image reproducibly without any credential in build context/layers.
3. Verify the image contains the required pinned Node runtime/bridge artifact and current Bun backend runtime, but contains no Gemini credential.
4. Confirm runtime secret injection design is read-only and host-local.
5. Verify the Node Live boundary is not publicly reachable and cannot be accessed by NOTE4/client traffic directly.
6. Verify current production rollback image and exact rollback procedure.
7. Verify current production health before any future deployment.
8. Verify default/rollback behavior if the Node bridge fails to start, crashes, times out, or loses Gemini connectivity.
9. Review Google’s then-current Developer API free-tier quota and data-use/privacy language from official sources. Separate current policy from earlier observed project behavior.
10. Produce a deployment matrix with exact proposed environment/config changes, exact model, image SHA, rollback image SHA, secret mount shape, health gates, smoke tests, and rollback triggers.
11. GLM-5.3-Flash reviews the exact final diff, deployment plan, secret boundary, failure behavior, and test evidence. Luna adjudicates findings; Sonnet 4.6 may correct bounded issues; revalidate afterward.

## No production mutation

This campaign may build and inspect a candidate image but must not load/start it on the production Orange Pi service, alter production env/config, restart production, move/copy the protected key into a new location, enable billing/Vertex, flash firmware, or merge PR #2.

## Successful state

```text
CAMPAIGN=8D1L
STATUS=READY_FOR_HUMAN_PRODUCTION_DECISION
PROPOSED_IMAGE_SHA=<...>
ROLLBACK_IMAGE_SHA=<...>
SECRET_IN_IMAGE=NO
NODE_BOUNDARY_PUBLIC=NO
FULL_TESTS=PASS
GLM53_REVIEW=PASS
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION=YES
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_ACCEPT_OR_REJECT_CURRENT_GEMINI_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_8D1M_DEPLOYMENT
```

Stop there.

## Hard stops

Unresolved P0/P1; credential exposure; key in image/build context; inability to rollback; production health drift; billing/Vertex requirement; data-policy ambiguity that cannot be stated clearly; firmware or merge requirement.

## 8D1L execution record — zero-provider readiness audit

Execution date: 2026-09-04 (Australia/Perth)

The block above is the normative audit template. It is not a claim that the
audit was complete before this execution. The following record is the
executed audit evidence and supersedes the template placeholders only after
the final reviewer result below.

```text
AUDIT_TEMPLATE_STATUS=NORMATIVE_TEMPLATE_NOT_EXECUTION_RESULT
CAMPAIGN=8D1L
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
G17_PROVIDER_CALLS_USED=1_OF_1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
8D1L_PROVIDER_CALLS_USED=0
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
```

### Candidate and runtime attestation

The exact ARM64 candidate was built from the reviewed source lineage with:

```text
IMAGE_TAG=slate:campaign-8d1l-candidate-7a72448
IMAGE_ID=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
OS=linux
ARCH=arm64
CONFIG_USER=bun
WORKDIR=/app
ENTRYPOINT=/app/entrypoint.sh
EXPOSED_PORT=3001/tcp
NODE_EXECUTABLE=/usr/local/bin/node
NODE_VERSION=v22.22.2
GENAI_SDK_VERSION=2.20.0
NODE_LIVE_SDK_LOAD_FROM_BACKEND=PASS
```

The Node `22.22.2` value is from the current candidate's actual
`/usr/local/bin/node`, and the SDK-load check was run from `/app/backend`,
the Dockerfile and entrypoint work directory. Earlier G12/G16 evidence that
mentions Node `26.3.0` and a `/usr/local/bun-node-fallback-bin/node` wrapper
belongs to the historical disposable fallback harness; it is not the
8D1L candidate runtime. The current Dockerfile-pinned Node `22.22.2`
attestation is authoritative for this audit. No source drift was found in
`backend/src`, `Dockerfile`, or `entrypoint.sh` relative to `SOURCE_SHA`.

The candidate contains no `.env` or `.env.*` file, and Docker history/build
context inspection found no credential. The Node bridge uses stdio and has no
listener; only the Slate HTTP service port `3001/tcp` is exposed. The bridge
is therefore not a public NOTE4/client boundary.

### Deterministic validation

The complete zero-provider validation completed successfully:

```text
BACKEND_TESTS=327_PASS_4_SKIP_0_FAIL
BACKEND_TEST_COUNT=331
SHARED_TESTS=6_PASS_0_FAIL
LINT=PASS
TYPECHECK=PASS
FORMAT_CHECK=PASS
FRONTEND_BUILD=PASS
ARM64_CANDIDATE_BUILD=PASS
ARM64_PROVIDER_DISABLED_TARGETED_E2E=23_PASS_0_FAIL
ARM64_PROVIDER_DISABLED_NETWORK=NONE
ARM64_PROVIDER_DISABLED_SECRET=synthetic_tmpfs_only
```

The four skipped backend tests are the real-secret-gated Bun-parent
differential tests; they were not provider calls. The exact targeted ARM64
run used a synthetic temporary secret and `--network none`, and covered the
Bun parent, actual Node mock child, bridge readiness, text dispatch, timeout,
startup, crash, and provider-loss failure paths. No Gemini credential was
mounted or read during this audit.

### Production read-only health and rollback

Read-only checks against `note4-orangepi` observed both existing services
healthy with zero restarts and `/healthz` returning HTTP 200. No service was
deployed, restarted, or reconfigured. The observed production image was:

```text
CURRENT_PRODUCTION_IMAGE=slate-note4:campaign8-voice-routing-121622c
CURRENT_PRODUCTION_IMAGE_ID=sha256:bd992672d76be4c36e96725bfc78a4e1fd5c32aecf36a66f03cd3e1b3fea526d
ROLLBACK_TAG=slate-note4:rollback-before-campaign8-948934c
ROLLBACK_ALIAS=slate-note4:campaign5-runtime-fix-948934c
ROLLBACK_IMAGE_ID=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
```

The rollback artifact is preserved on the production host. A future human
deployment operator must snapshot the current image/configuration, stop any
rollout on a failed health gate, restore the exact rollback tag and existing
approved runtime configuration, then verify `/healthz`, service health,
restart count, and MySQL health before accepting traffic. This procedure was
not executed because production mutation is prohibited in 8D1L.

Rollback triggers are: non-healthy app or MySQL state, non-200 `/healthz`,
restart-count increase, authentication or voice regression, bridge/provider
failure, credential or policy mismatch, or any unexpected production/data
mutation.

### Deployment and secret-boundary matrix

| Item | Current production | 8D1L candidate / future human review |
|---|---|---|
| Image | `slate-note4:campaign8-voice-routing-121622c` | `slate:campaign-8d1l-candidate-7a72448` / exact ID above |
| Architecture/runtime | Existing healthy ARM64 service | `linux/arm64`, Bun service, Node `22.22.2` bridge runtime |
| Auth mode | `vertex_adc` | No production auth change proposed; Developer API key path is G17 non-production-only |
| Live runtime | `bun_sdk` | No production Node-bridge enablement proposed |
| Model | `gemini-live-2.5-flash-native-audio` | No production model change proposed; G17 used `gemini-3.1-flash-live-preview` only in disposable non-production validation |
| Credential | Existing host-local production mechanism, not read | G17-only protected read-only mount to `/run/secrets/gemini_api_key`; never production `.env`, never copied or persisted |
| Public boundary | Slate HTTP service only | Node bridge is private stdio; no published bridge port |
| Health gate | Existing healthy service and MySQL | Container health, `/healthz` HTTP 200, service/MySQL healthy, zero restart increase, then authorized synthetic smoke test |
| Rollback | Preserved exact rollback tag/ID above | Human operator restores the preserved rollback artifact and verifies all health gates |

The explicit G17 protected Developer API-key mount was authorized only for
synthetic, non-production, one-call validation. It does not amend the
production policy in `CAMPAIGN-INSTRUCTIONS.md`, does not propose a static
API key in production, and does not authorize 8D1M. The production
API-key/data-use decision remains a human-only boundary.

### Failure and policy checks

The parent adapter rejects production Developer API-key/Node-bridge
configuration before child spawn, with deterministic tests covering the
fail-closed behavior. The child is an internal stdio implementation and is
never publicly reachable; an additional child-level production guard is not
needed for the proposed production configuration because the production
configuration remains Vertex/ADC/Bun. Provider-loss, timeout, startup, and
crash behavior are covered by the provider-disabled targeted E2E. The
non-blocking GLM observations about post-connect provider-error state
transition and source-string compatibility-test depth do not affect the
current production path and do not justify source changes in this audit.

Current official policy references were refreshed from Google documentation:

- [Gemini 3.1 Flash Live Preview model](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview)
- [Live API capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities)
- [Gemini API billing and free tier](https://ai.google.dev/gemini-api/docs/billing)
- [Gemini API terms and data use](https://ai.google.dev/gemini-api/terms)

The unpaid/free-tier policy may use submitted content and responses to
provide, improve, or develop Google products and machine-learning
technologies, and human reviewers may process inputs/outputs. The audit sent
no private data. Billing remains off; no paid-tier or Vertex change is
proposed. This policy distinction is explicitly left for the human decision
before any production/API-key action.

### Preliminary GLM review and Luna adjudication

The exact ZAI GLM-5.3-Flash reviewer was run read-only against the reviewed
source and the initial 8D1L evidence. It returned `VERDICT=BLOCK` with no P0
findings and P1 findings for incomplete deployment evidence, the historical
Node-version ambiguity, an apparent API-key governance conflict, and
premature template/result interpretation. Luna adjudicated that the source
was unchanged and that these were evidence/policy-boundary corrections:

```text
GLM53_PRELIMINARY_VERDICT=BLOCK
GLM53_PRELIMINARY_P0=0
GLM53_PRELIMINARY_P1=4
LUNA_ADJUDICATION=REPORT_ONLY_CORRECTIONS_REQUIRED
PRODUCT_SOURCE_CORRECTION=NOT_JUSTIFIED
```

This execution record supplies the exact image, runtime, rollback, matrix,
health, secret boundary, policy separation, and template interpretation. A
fresh exact-SHA GLM review is required after this correction and before the
terminal human boundary.

## 8D1L final revalidation and human boundary

The report-only corrections were re-reviewed through the exact ZAI
`zai-glm53-reviewer` route. The reviewer was instructed to treat the initial
template as normative, historical Node `26.3.0` fallback evidence as
historical, and the G17 Developer API-key use as non-production-only. The
review completed with:

```text
REVIEW_PROVIDER=ZAI
REVIEW_PROFILE=zai-glm53-reviewer
REVIEW_MODEL=glm-5.3-flash
REVIEWED_SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
VERDICT=PASS
P0_FINDINGS=0
P1_FINDINGS=0
P2_FINDINGS=0
P3_FINDINGS=0
REQUIRED_ACTIONS=none
```

The reviewer confirmed the corrected evidence is internally consistent, the
production fail-closed guard is preserved, the bridge is private stdio, and
the production matrix does not propose Developer API-key/Node-bridge
enablement. No tracked product/runtime source changed during the correction
cycle.

Final zero-provider revalidation remains green: backend `327 pass, 4 skip,
0 fail` across 331 tests, shared `6 pass, 0 fail`, lint, typecheck, format,
frontend build, exact ARM64 candidate build, and targeted ARM64
provider-disabled adapter E2E `23 pass, 0 fail`. Production read-only health
remains green, with no deploy/restart/configuration mutation. G17 remains the
only real-provider session in this sequence (`1_OF_1`); 8D1L made zero
provider calls.

```text
CAMPAIGN=8D1L
STATUS=READY_FOR_HUMAN_PRODUCTION_DECISION
SOURCE_SHA=7a724488a9ed20093469caefc03addc764185be5
PROPOSED_IMAGE_SHA=sha256:fa280ce50cc707f4c442834b3759638ca73851494ce4893a70208a96d2c1807d
ROLLBACK_IMAGE_SHA=sha256:3d5254ee95f6324d4a0a4621396ea0adeea7ea3ed3c9cb8ca7aa3baa8da18ec3
SECRET_IN_IMAGE=NO
NODE_BOUNDARY_PUBLIC=NO
FULL_TESTS=PASS
GLM53_REVIEW=PASS
GLM53_P0=0
GLM53_P1=0
GLM53_P2=0
GLM53_P3=0
PROVIDER_CALLS_8D1L=0
G17_PROVIDER_CALLS_USED=1_OF_1
8D1K_HISTORICAL_PROVIDER_CALLS_USED=3_OF_3
PRODUCTION_CHANGED=NO
PRODUCTION_RESTARTED=NO
BILLING_ENABLED=NO
VERTEX_ENABLED=NO
FIRMWARE_FLASHED=NO
PR2_MERGED=NO
READY_FOR_PRODUCTION_DEPLOYMENT_REVIEW=YES
READY_FOR_HUMAN_PRODUCTION_API_KEY_AND_DATA_POLICY_DECISION=YES
READY_FOR_8D1M=NO_UNTIL_EXPLICIT_HUMAN_AUTHORIZATION
HUMAN_ACTION_REQUIRED=YES
NEXT_ACTION=HUMAN_ACCEPT_OR_REJECT_CURRENT_GEMINI_DATA_POLICY_AND_AUTHORIZE_OR_REJECT_8D1M_DEPLOYMENT
```

This is the retained human boundary. No production deployment, restart,
Developer API-key decision, billing/Vertex change, private-data submission,
firmware flash, or PR merge is authorized by this checkpoint. Campaign 8D1M
has not started.

### Report-push invariant checkpoint

```text
REPORT_UPDATED=YES
CAMPAIGN_STATE_UPDATED=YES
REPORT_COMMITTED=YES
REPORT_PUSHED=YES
REMOTE_SHA_VERIFIED=YES
PUSHED_SHA=32e6d6169beacf536251d56fe060bbe5619dc669
PR_STATE_VERIFIED=YES
PR_STATE=open_draft_unmerged
```
