# Slate completion audit and bounded closure plan

Date: 2026-09-13 (Australia/Perth)
Status: SOURCE-BASED ADVISORY AND GROK DECISION REQUEST; NO PRODUCTION AUTHORITY

## 1. Conclusion and evidence boundary

The project is not complete. The current C8 repair candidate is reported built, locally tested and Grok-reviewed, but not activated or physically accepted. That is a candidate milestone, not completion of C7/C8 or the full requested dashboard/integration scope.

Inspected PR #2 head: `408ecb0b9b7fa880b55fa17d1170305fdc057f52`.
Reported repair source: `8876c50f56f45cec4413755e83fba9d3d07627cf`.
The compare from repair source to inspected head contains seven subsequent commits and changes only `docs/campaign-reports/CAMPAIGN-STATE.md`.

PR #1 C7 head: `641e358f7067d7e314e4f2c1eb18258690268cab`.
PR #3 C9 head: `61700ea8c5b7755aa39259a45554289ca01ff700`.
PR #4 C10 head: `e9a6cfac86c63cb461a62d5029080332fac06865`.
All four inspected PRs are open, draft and unmerged.

This audit read the current campaign state, the consumed physical-result report, all four PR scopes, README and selected critical source paths. It did not rerun the repository's full test suite, inspect the running production installation, flash a device or call a development/review model. Two isolated reproductions of copied classifier logic and the backend evidence prefilter were executed locally; they are not full application tests.

Preserve the reported Grok PASS as historical evidence. The source findings below are new audit inputs for Grok to adjudicate, not an invented new Grok verdict. Do not repeat old reviews merely because a later CLI invocation failed. A genuinely new source finding, however, must not be dismissed solely because the earlier review passed.

## 2. What the latest report supports

`CAMPAIGN-STATE.md` now correctly identifies an operator activation boundary, rather than demanding another redundant Grok STOP audit. It reports:

- focused tests: 104 pass;
- backend: 449 pass, 9 documented skips, no failures;
- shared: 7 pass;
- typecheck, lint, format, frontend build, firmware build, privacy and diff checks: pass;
- exact-artifact Grok 4.6 review: P0/P1/P2/Security all zero;
- activation of this candidate: not performed.

Do not add the focused and backend counts together as if they were disjoint coverage.

Reported frozen artifacts:

```text
SOURCE=8876c50f56f45cec4413755e83fba9d3d07627cf
BACKEND_IMAGE=sha256:c4289feb7e6f86f85ed2690a7ad3e8300f539c1c3d4f487bcae451d13d3257eb
PLATFORM=linux/arm64
FIRMWARE_BIN_SHA256=cfa15233f037d8cce3721f3d70539f3395b69d85a61f3279b6ac9d3a8616b13c
FIRMWARE_BYTES=2537984
FIRMWARE_ELF_ID=1956207c3fb6f7893c77e3f7a316292593a782d24812d8f59eb9d123bfeb765c
COLLECTOR=m4-sanitized-structural-v3
COLLECTOR_SHA256=9482324d4ae24dba606bf1746c2ac48fc765d626d4ee4f1ae4d65bf060310808
```

Hash strings are not proof that the corresponding files remain available. Locate and verify exact bytes before requesting activation; do not rebuild unnecessarily or silently replace a missing artifact. Resolve the real Git tree separately: the state currently repeats the commit value in `FINAL_SOURCE_TREE`, which is not a demonstrated tree-object identity.

## 3. Completion matrix

| Capability | Evidence-supported status | Remaining completion condition |
| --- | --- | --- |
| BTC seven-day tile | Prior report records one live Weekly tile after targeted consolidation | Preserve it; verify in the eventual UI regression, do not reconsolidate |
| Japanese glyphs | Targeted 楽/曲 additions and bitmap-oriented diagnostics are in the candidate | Exact candidate running; synthetic target characters and normal updated bubbles visibly correct |
| EN/JA/Traditional Chinese Voice | Trilingual setup and removal of connect-time language pinning implemented | Current-turn language switches work on device, including JA-to-ZH and ZH-to-JA |
| Chinese latency | Slow physical interaction reported; cause not identified | Valid correlated stage measurements, explicit acceptance targets and evidence of acceptable latency; instrumentation alone is not a speed fix |
| Voice audio/stability | Host regression evidence exists; latest consumed report leaves audio/exit and other physical fields unknown | Audible output, correct order, stable multi-turn behavior, clean exit and no unexplained reboot/freeze |
| Daily/month Calendar and Weather | C7 implementation/tests exist; earlier operator failures lack later accepted closure evidence | Existing cards display English/Perth/metric content, correct supported WA holidays and current non-error Weather state |
| Google News | Operator partial success | AU, TW and Both verified individually where in scope; do not erase intended Traditional Chinese TW headlines |
| Outlook | Improved English error handling; last diagnosis unconfigured | Actual read-only connectivity requires separate setup/consent, or explicit operator deferral; an error message is not connectivity |
| AI quota dashboard | C10 isolated and undeployed; current source only probes CLI versions | Real authorized quota source to displayed metric, or explicit deferral; retain honest unavailable/stale handling |
| C9 auth research | Parked research | Keep deferred unless separately selected; not a blocker for a working core |
| Repository handoff | Four draft PRs, no merged release completion | Final capability/evidence record and an explicitly approved integration/release or documented private-deployment handoff |

The original visible quota request named Codex, AGY and Claude; current C10 source names Codex, AGY/Gemini and Grok. The inspected sources do not establish that Claude coverage was deliberately withdrawn. Record this scope question rather than silently treating Grok as its replacement.

A personal working-core milestone can exclude optional integrations only through explicit scope acceptance. It must not be reported as full original-scope completion while those requirements remain undelivered.

## 4. New source findings to adjudicate before the next physical window

### CA-1 — Timing evidence loses turn association in the collection path

At source `8876c50f`, `VoiceTimingTrace` emits turn index, language class and ordinary stage timestamps as separate logger lines. The collector's `backend_snapshot()` extracts individual key/value matches and then runs `sort -u`. That changes chronology and separates values from their originating turn. The optional structured timing output includes `turn=`, but the checked-in backend prefilter does not preserve it as part of an atomic stage event.

An isolated example reproduced the information loss: two distinct input histories with EN/ZH language and timestamp assignments swapped between turns produced identical sorted output. This proves those histories cannot be distinguished from that output alone; it does not assert that a production capture contained both turns in the same snapshot.

The serial `CaptureAccumulator` also deduplicates by event/value batches across its bounded cache, rather than by a turn-scoped event identity. A legitimately repeated same-value marker in a later turn can therefore be dropped as a duplicate. The final summary checks producer-class presence, not completion of a particular Voice turn. A marker-parser self-test PASS must not be promoted to end-to-end latency-attribution PASS.

Grok should select the smallest correction or demonstrate an already-existing tested capture path that preserves the required association. Acceptance test: feed distinct synthetic two-turn histories through the actual producer format, remote prefilter, collector and final report; retain the correct turn/language/stage association in each, including repeated same-value events and overlapping poll windows. Avoid collecting raw payloads merely to repair correlation. Preserve missing stages as UNKNOWN. Do not subtract timestamps from different clock domains without a demonstrated alignment method.

### CA-2 — Language telemetry is latched from the first partial transcript

`handleGeminiMessage()` classifies `inputTranscription.text` before merging it into the pending transcript. `setTurnLanguageClass()` returns once `TURN_LANGUAGE_CLASS` has been emitted for the turn. Therefore later, more informative fragments cannot revise an early UNKNOWN or misleading class.

Isolated classifier results from copied source logic:

```text
日 -> UNKNOWN
日本の首都はどこですか？ -> JA
我 -> UNKNOWN
我住在臺灣 -> ZH_HANT
為替 -> ZH_HANT
```

The last fixture illustrates that the so-called distinctive cue set contains characters shared with Japanese usage, not an exhaustive trustworthy language detector. The first four show why fragment timing matters even when the final complete-text classifier result is suitable.

The inspected live connection uses an automatic trilingual instruction; these telemetry classes are not, by themselves, proof that the model is forced into the logged language. Likewise `TURN_RESPONSE_LANGUAGE` in this path is a derived recommendation, not a measurement of actual assistant output language. Preserve that distinction.

Grok should adjudicate a minimal final/provisional language-evidence policy, with tests for initial ambiguous fragments followed by Japanese or Traditional Chinese, true language switches, mixed input and Han-only ambiguity. No extra translation-model call or broad language-detection subsystem is requested. Do not claim a response-language PASS from a system-prompt substring test.

### CA-3 — C10 currently cannot deliver real quota metrics

At C10 head `e9a6cfa`, `AiUsageService.COMMANDS` runs only:

```text
codex --version
agy --version
grok --version
```

On success `collectProvider()` returns `UNAVAILABLE_NO_MACHINE_READABLE_USAGE` with null usage/remaining/reset metrics. Its sanitized metrics parser is explicitly described as serving a future collector. Security hardening, caching and unavailable states are useful scaffolding, but this is not completed quota collection.

This is a full-scope delivery gap, not a reason to destabilize the C7/C8 candidate. Keep C10 isolated until selected. A later C10 plan must identify the actual authorized account/CLI host and quota source, not assume that a version probe on Orange Pi measures a subscription used on the controller. Never infer remaining subscription quota from token totals or command availability. Preserve unsupported providers explicitly.

## 5. Finite completion sequence — use existing campaigns, not new open-ended ones

### Gate 1 — Source findings and scope disposition

Grok 4.6 remains the technical decision authority. Give it the current state, exact source findings CA-1/CA-2, the isolated examples, and C10 scope gap. Request a compact decision identifying which findings require changes, which are adequately covered by existing evidence, and the exact tests needed to resolve uncertainty.

Do not demand code mutation for its own sake. Do not force a PASS or repeat the previous whole-repository planning cycle. If fixes are justified, use the existing preferred writer and explicit Codex fallback policy; do not route through the mismatched NVIDIA/GLM provider.

A new technical decision requires a real Grok invocation. If the existing CLI cannot run, record the concrete invocation failure and recover only through an authorized existing route. Do not invent Grok approval, silently substitute another model, or treat the earlier CLI error as proof that the previous candidate review was invalid. Mechanical reads, identity checks and reproducer preparation are not blocked on obtaining a redundant model decision.

### Gate 2 — One final candidate, exact artifacts and usable acceptance evidence

Resolve only accepted blockers; run the impacted behavioral tests and combined C7/C8 regression. Explicitly account for the nine reported skips and reuse unchanged test evidence only by source/environment identity.

Freeze the source/tree, application image, firmware BIN/ELF/font, collector and deployment configuration requirements. Verify actual artifact availability and an application-only rollback plan. A source change requires the affected artifact/review to be refreshed; documentation-only changes do not.

Predeclare a test matrix and latency measurement definitions. Grok should propose numerical targets where no target is already accepted and label them proposed, not historical achieved results. Measure input capture/transcription, first visible answer and first audible answer separately. Do not substitute provider-first-text for first audio or a scheduled draw for visible e-ink completion.

Obtain a fresh artifact-bound review only when new code/evidence requires it. Do not issue another generic request to re-approve an unchanged hash merely to generate a newer report.

### Gate 3 — One explicit activation approval package

Present exact application deployment, app-only firmware flash and one bounded physical window as separate scopes in one request. This audit grants none of them. Existing consumed flash/test approvals do not cover changed hashes or another attempt.

Before activation, verify resolved non-secret configuration, read-only secret mounts, network/device/pairing identity, MySQL preservation and exact rollback artifacts. No MySQL recreation, BTC consolidation, OAuth or account change belongs in this package.

If approved, execute the approved sequence, verify running identities and health, and prove the diagnostic path can capture the required structured events before operator testing. Stop on a failed precondition; do not substitute artifacts or hide the failure by recreating content.

### Gate 4 — One useful combined physical acceptance and bounded repair of observed failures

Use the existing Calendar/Weather/BTC cards. Include Google News AU/TW/Both within the agreed budget. Render a known synthetic Japanese fixture through the approved actual bubble path; do not depend on a model randomly emitting 楽 or 曲.

Use one bounded mixed-language Voice session long enough to exercise the previously reported progressive slowdown; a proposed eight-turn sequence can cover EN/JA/ZH and switching back, but its exact scope must be in the approved package. Record audible output, first-visible/first-audible latency, bubble order, exit and unexpected resets. A short session cannot prove unlimited-duration stability, and a host replay cannot prove real speech recognition.

Unknown or untested criteria remain unknown. A correctly attributed slow stage is diagnostic progress, not performance acceptance. If a criterion fails, preserve independent passes and repair only the earliest supported failing boundary. Do not automatically consume another physical attempt; require changed evidence/candidate and explicit authority before a repeat.

### Gate 5 — Finish or explicitly defer integrations and quota delivery

Outlook setup is a separate operator authorization because it involves an account and consent. If selected, prove real read-only connectivity and safe disconnect/re-auth behavior without exposing private calendar contents in logs. Otherwise record a deliberate deferral; never call the error envelope a completed connection.

C10 needs real quota collection and agreement on provider scope, including the original Claude requirement. It should follow core acceptance rather than be mixed into another C8 firmware loop. Read-only investigation can define the supported path; activation, credential access and production deployment require their relevant authority. C9 remains parked unless separately selected.

### Gate 6 — Completion and handoff, not another generic report

Publish one acceptance matrix containing requirement, source/artifact, last test, evidence level, status and remaining action. A row is DONE only with evidence appropriate to that capability. Separate IMPLEMENTED, REVIEWED, DEPLOYED, PHYSICALLY_ACCEPTED, DEFERRED and BLOCKED.

Preserve basic saved-content display, navigation, sync/cache and reconnect behavior through relevant regression; do not expand the closure exercise into retesting every unrelated upstream content provider. Include the exact recovery/backup procedure and demonstrate it in isolation where possible. Any production reboot/recovery test needs separate permission.

Prepare the integration/merge sequence and private-deployment or release record. No merge, PR closure or public release is authorized by this audit. A documented private deployment can be operationally complete without a public release, but all four draft PRs are not evidence of finished repository integration.

## 6. Exit and reporting rules

Use a short current ledger plus linked historical evidence. Do not stack several blocks all labeled CURRENT and infer authority from their order alone. Report the inspected base head rather than trying to embed a commit's own future SHA.

Continue useful authorized work, but do not impose a product-change quota, artificial multi-hour duration or fabricated runnable count. An unchanged remote head proves no newly published branch commits; it does not prove that a controller did no local work. Check local worktree/report/push evidence before diagnosing a broken runner.

The next useful deliverable is either closure of CA-1/CA-2 through executable evidence and a single exact activation request, or a precise blocker. Do not repeat the entire glyph/language implementation merely because this audit has a newer date.

## 7. Source index

At PR #2 head `408ecb0...`:
- `docs/campaign-reports/CAMPAIGN-STATE.md`
- `docs/campaign-reports/PORTFOLIO-C7-C8-PHYSICAL-ACCEPTANCE-GLYPH-ZH-LATENCY-INGESTION-RESULT.md`
- `README.md`

At repair source `8876c50...`:
- `shared/src/types/integrations.ts`
- `backend/src/modules/assistant/gemini-live.service.ts`
- `backend/src/modules/assistant/xiaozhi-voice-session.ts` (`handleGeminiMessage`, `VoiceTimingTrace`)
- `firmware/main/scenes/xiaozhi/xiaozhi_scene.cc`
- `scripts/slate-m4-sanitized-observer-v2.py` (`backend_snapshot`, `CaptureAccumulator`, parser tests and `main`)

At C10 head `e9a6cfa...`:
- `backend/src/modules/ai-usage/ai-usage.service.ts`

Live PR scopes #1-#4 were read separately. Original scope references in this audit come from those scopes and the operator requests, not from treating the upstream README as the custom project's final acceptance specification.
