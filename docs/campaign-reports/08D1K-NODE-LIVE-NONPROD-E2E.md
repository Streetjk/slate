# Campaign 8D1K — Node Live exact non-production E2E

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite: 8D1J PASS with exact implementation SHA and GLM-5.3-Flash PASS.

## Human authorization boundary

DO NOT START provider calls merely because this file exists. A human must explicitly authorize 8D1K after reviewing 8D1J. Until then, inspection and deterministic revalidation are allowed but Gemini provider calls are not.

## Objective

Prove that the exact Slate Bun backend + Node Gemini Live boundary can complete a synthetic Developer API Live turn in a disposable non-production environment using the protected runtime secret mechanism.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 only for bounded diagnostics/corrections if evidence identifies a source defect;
- reviewer: GLM-5.3-Flash read-only for any source correction;
- repository integrator/validator/sole writer: Codex.

## Provider-call budget

After explicit human authorization: maximum 3 new Gemini Live sessions for this entire campaign.

Use them in order and stop as soon as the necessary evidence is obtained:
1. Node bridge minimal control using the exact packaged bridge artifact.
2. Exact Slate adapter synthetic text turn with Search disabled and no tools if the bridge control passes.
3. Exact Slate adapter synthetic text turn with the production-intended tool registry enabled but no tool invocation, only if call 2 passes and this extra validation is necessary.

No blind retry. A failed call must produce a sanitized failure classification before another call is considered.

## Conditions

- exact model: `gemini-3.1-flash-live-preview`;
- synthetic text only, e.g. `Say exactly TEST.`;
- no NOTE4 private data;
- no Outlook data;
- no Calendar event content or writes;
- no Search query execution;
- no real microphone/audio input;
- generated audio may be observed for protocol success but must not be retained;
- credential mounted read-only at runtime only;
- billing remains unattached;
- Vertex remains disabled;
- no production container/config/restart;
- disposable artifacts cleaned up after each stage.

## Diagnostic requirements

Capture only non-secret structured evidence:
- runtime versions;
- bridge startup status;
- sanitized SDK/transport error class;
- WebSocket close code/reason only if non-secret and safe;
- model event observed yes/no;
- turn complete yes/no;
- cleanup status;
- provider-call count.

If a source defect is identified, stop provider calls, correct under Sonnet 4.6, run deterministic tests, obtain fresh GLM-5.3-Flash review, then use remaining budget only if justified.

## Successful state

```text
CAMPAIGN=8D1K
STATUS=EXACT_NODE_LIVE_ADAPTER_E2E_PASS
EXACT_ADAPTER_MODEL_EVENT=YES
EXACT_ADAPTER_TURN_COMPLETE=YES
PROVIDER_CALLS_USED=<1..3>
PRIVATE_DATA_SENT=NO
PRODUCTION_CHANGED=NO
GLM53_REVIEW=<PASS/RETAINED_PASS>
READY_FOR_8D1L=YES
```

If the exact adapter still fails, publish the precise sanitized root-cause class and stop. Do not deploy.

## Hard stops

Credential exposure; quota/billing requirement; Vertex requirement; private data; unclear sanitized failure after budget use; production mutation; firmware flash; PR merge.
