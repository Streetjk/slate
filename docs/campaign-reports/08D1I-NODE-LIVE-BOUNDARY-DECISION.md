# Campaign 8D1I — Node-supported Gemini Live boundary decision

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Starting checkpoint: latest remote after `6f5de7fe1fe86289cca99d83a02fd944f0c87d55`

## Objective

Convert the overnight evidence into an explicit runtime architecture decision without changing production and without making any new Gemini provider call.

Accepted evidence entering this stage:
- exact reviewed backend implementation: `4bfce037b2d206dbabca9ab905301c088a0c1f01`;
- GLM-5.3-Flash review PASS, no P0/P1/P2;
- deterministic gates PASS;
- minimal Node + official `@google/genai` Live control PASS with model event and turn complete;
- minimal Bun + the same SDK path timed out without a sanitized result;
- current production backend is intentionally Bun-based;
- current Google JS SDK documentation requires Node.js 20+ and does not document Bun as a supported runtime.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 for bounded architecture/code reconnaissance only;
- reviewer: GLM-5.3-Flash, read-only, only if a nontrivial architecture decision needs independent challenge;
- repository integrator/validator/sole writer: Codex.

## Work

1. Fetch/reconcile remote and confirm PR #2 is open/draft/unmerged.
2. Re-read the latest report/state plus:
   - `Dockerfile`;
   - `entrypoint.sh`;
   - `backend/tsconfig.json`;
   - backend package/runtime scripts;
   - `gemini.client.ts`, `gemini.config.ts`, `gemini-live.service.ts`;
   - any Bun-specific APIs/imports actually used by backend runtime code.
3. Re-check current official `@google/genai` runtime support and current open upstream Live/Bun issues. Record authoritative documentation separately from community/issue evidence.
4. Compare only these architecture choices:
   - A: keep all Live transport in Bun and continue unsupported-runtime investigation;
   - B: move only Gemini Developer API Live transport into a Node 22 local bridge/worker while keeping Nest/Slate under Bun;
   - C: migrate the whole backend runtime to Node;
   - D: use raw WebSocket/direct protocol from Bun instead of the official SDK.
5. Score each option for supported runtime, change size, secret isolation, lifecycle complexity, reconnect behavior, rollback, observability, image size, and testability.
6. Prefer B unless current evidence proves another option is materially safer/smaller. Whole-backend Node migration and raw protocol duplication require strong justification.
7. Produce the exact interface contract for the selected boundary, including session open/close, text/audio input, server events, tool calls/responses, errors, timeouts, reconnect, and shutdown.
8. No provider calls, no production mutation, no dependency upgrade, no deployment, no firmware work.

## Expected successful state

```text
CAMPAIGN=8D1I
STATUS=NODE_LIVE_BOUNDARY_SELECTED
SELECTED_ARCHITECTURE=<...>
PROVIDER_CALLS=0
PRODUCTION_CHANGED=NO
READY_FOR_8D1J=YES
```

If no supported/safe boundary can be selected, stop with a durable report instead of guessing.

## Hard stops

Credential exposure; production mutation; billing/Vertex change; private-data use; unsupported secret propagation; Campaign 6D/PR1/PR3 expansion; firmware flash; PR merge.
