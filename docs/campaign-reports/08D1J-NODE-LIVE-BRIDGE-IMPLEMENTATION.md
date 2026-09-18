# Campaign 8D1J — Node Gemini Live bridge implementation

Date: 2026-09-02 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
Prerequisite: 8D1I must select a supported narrow Node Live boundary.

## Objective

Implement the selected Node-supported Gemini Developer API Live transport boundary while keeping the Slate/Nest backend on Bun and preserving every current product/security contract.

No Gemini provider call is authorized in this campaign. This is implementation + deterministic validation only.

## Routing

- controller: Luna;
- worker: Sonnet 4.6 for bounded implementation/corrections;
- reviewer: GLM-5.3-Flash, read-only;
- repository integrator/validator/sole writer: Codex.

## Required design properties

1. Bun remains the main Slate/Nest runtime and API/device authority.
2. Node runtime is used only for the Gemini Developer API Live transport that has a documented Node support path.
3. Prefer Node 22 for the bridge runtime; pin image/runtime version and do not upgrade `@google/genai` unless required by evidence.
4. The bridge must not expose a public listening port. Use a local-only boundary such as Unix-domain socket, child-process stdio/IPC, or private loopback transport selected in 8D1I.
5. The Gemini API credential is runtime-only, read by the Node boundary from a protected file reference. Do not pass the raw value through Bun config, CLI arguments, environment dumps, logs, Git, image layers, device responses, or reviewer prompts.
6. Bun must never send Gemini credentials to NOTE4. NOTE4 continues to talk only to Slate.
7. Preserve exact `gemini-3.1-flash-live-preview` model control in backend configuration.
8. Preserve current audio contracts: 16 kHz PCM input and current Slate output/event handling.
9. Preserve Search/tool enablement, strict tool argument validation, Google Calendar proposal/physical-confirm semantics, Cancel zero-write semantics, Outlook isolation, session cleanup, reconnect contract, and generic safe errors.
10. Bridge protocol must be versioned or strongly typed and fail closed on malformed/unknown frames.
11. Child/bridge lifecycle must not leak zombie processes, sockets, key handles, or sessions.
12. Production default remains current path; no production config selection of the new boundary.

## Deterministic tests

Cover at minimum:
- bridge startup/shutdown;
- missing Node executable/runtime -> safe failure;
- missing/unreadable/empty/whitespace credential -> fail closed;
- no raw credential in arguments/env/logs/errors;
- malformed bridge frames -> reject;
- text input mapping;
- audio input mapping;
- server message mapping;
- transcription mapping;
- tool call and tool response mapping;
- close/reconnect/timeout behavior;
- backend disconnect cleans bridge session;
- multiple sequential sessions;
- no public network listener;
- exact model selection;
- current default runtime path unchanged;
- Outlook isolation and Calendar confirmation regressions.

Run complete backend/shared tests, lint, typecheck, format check, frontend build, diff check, and secret scan.

## Independent review

GLM-5.3-Flash reviews the exact implementation diff and non-secret test evidence. Luna adjudicates every finding. Sonnet 4.6 may make bounded corrections; rerun full relevant validation after correction. Stop on unresolved P0 or persistent P1.

## Expected successful state

```text
CAMPAIGN=8D1J
STATUS=NODE_LIVE_BRIDGE_IMPLEMENTED_AND_REVIEWED
PROVIDER_CALLS=0
BUN_BACKEND_RETAINED=YES
NODE_LIVE_BOUNDARY_IMPLEMENTED=YES
GLM53_REVIEW=PASS
PRODUCTION_CHANGED=NO
READY_FOR_8D1K_PROVIDER_VALIDATION=YES
HUMAN_PROVIDER_CALL_AUTHORIZATION_REQUIRED=YES
```

Stop before any real Gemini Live session. The next campaign's provider validation remains a human boundary.

## Hard stops

Credential exposure; public bridge listener; unsupported raw credential propagation; production deploy/restart; billing/Vertex; private data; firmware flash; PR merge; broad whole-backend runtime migration unless 8D1I explicitly selected it.
