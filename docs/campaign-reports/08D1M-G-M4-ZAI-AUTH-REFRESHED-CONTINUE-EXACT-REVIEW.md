# Campaign 8D1M-G M4 — ZAI authentication refreshed; continue exact review

## Operator boundary update

The operator reports that the existing designated ZAI API credential has been refreshed in the controller's existing local credential source.

This satisfies the current human authentication boundary. Do not print, commit, copy, transform, or otherwise expose the credential value. Do not change reviewer/provider/model/credential authority or billing authority.

## Required continuation

Reconcile the live branch and current campaign state, then verify the existing designated reviewer route using a safe no-secret authentication probe or the normal reviewer invocation path.

The review target remains exactly:

```text
8a51da387f8c1ec058883031ef0603ae3da3af36
```

The reviewer remains exactly:

```text
PROVIDER=ZAI
MODEL=glm-5.3-flash
PROFILE=zai-glm53-reviewer
```

Do not substitute the local `glm` convenience command, GLM 5.2, another ZAI model, another provider, or another reviewer.

If authentication now succeeds, immediately run a **fresh exact independent review** of the frozen candidate at the target commit. No production bytes may change between the reviewed target and deployment.

If the reviewer returns PASS with no blocking P0/P1/P2/security findings, continue automatically under `FRONTIER_DRIVEN_LONGRUN` through all remaining safe work:

```text
exact review PASS
-> verify frozen backend/firmware identities still match the reviewed target
-> deploy exact reviewed backend candidate
-> app-only flash exact reviewed firmware at the established offset if still authorized
-> verify hashes
-> run deployment/config fail-closed qualification
-> requalify Slate/MySQL/local/public health
-> rearm durable sanitized observer
-> publish exact runtime identities and current frontier
```

Preserve the already-approved Gemini production configuration and the new fail-closed eight-key continuity qualifier. Never log secret values; status/key-name evidence only.

Do not request a new physical test until all safe nonphysical work is exhausted and both `READY_NODE_COUNT=0` and `READONLY_READY_NODE_COUNT=0`.

The next physical acceptance, when reached, must be a bounded multi-turn EN/JA soak that checks:

- early-turn vs late-turn latency;
- no progressive lag or freeze;
- user-before-assistant bubble order and one logical bubble per role;
- Japanese rendering, especially `の`;
- audible assistant audio;
- per-turn sanitized provider/backend/firmware queue/resource markers;
- reset/watchdog/heap/PSRAM evidence if any degradation occurs.

Do not claim the UI-event-backpressure root cause physically proven until the repaired deployed build survives that physical multi-turn soak.

If ZAI authentication still fails after the refreshed credential is loaded, stop only at the same reviewer-auth boundary and publish the exact non-secret failure class. Do not silently fall back.

Keep PR #2 OPEN / DRAFT / UNMERGED.
