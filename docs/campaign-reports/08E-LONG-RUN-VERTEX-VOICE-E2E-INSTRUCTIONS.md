# Campaign 8E — Long-run Vertex + physical Slate Voice E2E

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Date: 2026-09-02 (Australia/Perth)

This directive is the long-run continuation after Campaign 8D/8D1. It does **not** authorize any currently blocked human action by itself. It defines how Codex must continue automatically once each explicit human boundary has been satisfied.

Read first, in this order:

1. `docs/campaign-reports/08-GEMINI-35-LIVE.md`
2. `docs/campaign-reports/08A-VOICE-ROUTING-TENCLASS-INSTRUCTIONS.md`
3. `docs/campaign-reports/08D-PHYSICAL-VOICE-E2E-INSTRUCTIONS.md`
4. `docs/campaign-reports/08D1-VERTEX-ADC-HUMAN-SETUP-INSTRUCTIONS.md`
5. `docs/campaign-reports/08D-CLAUDE-SONNET5-WORKER-POLICY.md`
6. `docs/campaign-reports/CAMPAIGN-STATE.md`
7. this directive

Where older text conflicts with the newest durable checkpoint or this directive, the newest checkpoint and this directive govern.

---

## 1. Accepted starting checkpoint

At the time this directive is authored:

- PR #2 remains open and draft.
- Latest observed PR head before this directive: `1ea5b29a9a5e31e240850db314e4e77a1a3e2a34`.
- Campaign 8C backend is deployed and healthy on `note4-orangepi`.
- Deployed backend source: `121622c3bd1d23587b4aadb3a079ec85d2052278`.
- Deployed backend tag: `slate-note4:campaign8-voice-routing-121622c`.
- Preserved rollback image: `slate-note4:rollback-before-campaign8-948934c`.
- Slate health: PASS.
- MySQL health: PASS.
- public HTTPS/Funnel: PASS.
- existing NOTE4 authenticated polling: PASS.
- unauthenticated voice-config: correctly rejected.
- unauthenticated voice WebSocket: correctly rejected.
- Tenclass/vendor route: absent.
- firmware has **not** been flashed.
- current reviewed firmware source: `121622c3bd1d23587b4aadb3a079ec85d2052278`.
- reviewed full image SHA-256: `eba9427558bf08eb387894bbba1feac2da5ec1d0b2ab8c8785285251d65afe33`.
- reviewed OTA/app image SHA-256: `95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4`.
- ESP-IDF: `5.5.2`.
- target: `esp32s3`.
- current Gemini Live model remains backend controlled as `gemini-live-2.5-flash-native-audio`.
- Campaign 8D0/8D1 found no usable Vertex/ADC configuration on the Orange Pi.
- `HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES`.

Do not reinterpret this directive as proof that Google Cloud setup has since been completed. Re-check live state before proceeding.

---

## 2. Controller-liveness rule

Codex remains the primary controller, adjudicator, integrator, test runner, Git writer and production-change executor where explicitly authorized.

For all ordinary non-human work in this campaign, use this loop:

```text
fetch/reconcile remote
→ recompute exact current stage
→ inspect current production state
→ bounded research or implementation
→ deterministic validation
→ bounded Claude Sonnet 5 worker if useful
→ Codex adjudication
→ AGY exact-artifact review where required
→ bounded correction if needed
→ revalidation
→ durable report/state checkpoint
→ selective commit
→ push
→ verify remote
→ automatically continue to next authorized stage
```

Do **not** return control merely because one ordinary phase completed.

Return control only for a genuine human boundary or hard stop listed below.

After a human boundary is satisfied, resume from the durable checkpoint and continue automatically through every remaining authorized ordinary stage.

Do not recursively delegate controller authority.

---

## 3. Worker and reviewer policy

### Claude worker

If a worker is useful, use **Claude Sonnet 5 through the authenticated Claude CLI only**.

Mandatory:

- use the existing authenticated Claude CLI session;
- no OpenRouter;
- no Anthropic API key fallback;
- no copied static Anthropic credentials;
- no proxy/aggregator route;
- no recursive delegation;
- Claude is a bounded worker only;
- Codex reviews and integrates all worker output.

If authenticated Claude CLI / Sonnet 5 is unavailable, continue without Claude where reasonable. If the work materially requires the worker, record the blocker. Never silently substitute OpenRouter or another model/provider.

### Independent reviewer

AGY remains the independent read-only reviewer using the existing approved Google OAuth path. AGY must not write production files, commits or deployments.

Use AGY for exact-artifact/high-risk review after any material correction to:

- device authentication;
- WebSocket protocol/security;
- Gemini/Vertex auth or runtime configuration;
- firmware voice routing;
- calendar confirmation semantics;
- credential handling;
- production deployment logic.

Maximum normal review/fix loops: 3. Escalate rather than cycling indefinitely.

---

## 4. Hard invariants

Throughout Campaign 8E:

- no `GEMINI_API_KEY`;
- no `GOOGLE_API_KEY`;
- no OpenRouter for Gemini or Claude;
- no service-account key JSON;
- no copied Google access/refresh tokens;
- no credentials in Git, reports, screenshots or chat;
- NOTE4 never stores Google/Vertex credentials;
- NOTE4 never calls Gemini directly;
- backend remains Gemini model authority;
- Outlook remains read-only and isolated from Gemini;
- Microsoft OAuth/Graph credentials and raw private Outlook payloads must never be sent to Gemini;
- Google Calendar remains proposal-only until physical NOTE4 confirmation;
- Cancel must write zero calendar events;
- no paid/billing activation without explicit human action;
- no firmware flash without explicit human authorization for the exact reviewed artifact;
- no broad flash erase;
- preserve NVS/LittleFS, server address, pairing and device secret wherever mechanically possible;
- no automatic PR #2 merge;
- no Campaign 6D work;
- no PR #1 work;
- no PR #3 work;
- no Airtable/Gantt expansion.

---

# Phase E0 — resume and reconcile

On every resume:

1. `git fetch origin`.
2. Confirm branch is `feature/gemini-35-live-evaluation`.
3. Confirm working tree state.
4. Read the newest report/state/directives.
5. Record current branch HEAD.
6. Verify PR #2 is still open and targets `integration/note4-custom`.
7. Re-check deployed Orange Pi backend tag/source.
8. Re-check rollback image exists.
9. Re-check Slate/MySQL health.
10. Re-check public `/healthz` and Web UI.
11. Re-check Tailscale/Funnel.
12. Re-check latest NOTE4 authenticated polling.
13. Re-check unauthenticated voice-config rejection.
14. Re-check unauthenticated voice WebSocket rejection.
15. Record disk free space; do not use destructive blanket cleanup.

If the deployed backend has drifted from the accepted Campaign 8C candidate, stop and investigate before proceeding.

---

# Phase E1 — Google Cloud / Vertex readiness after human setup

This phase begins only after the human has selected the intended long-term Google account/project and performed the interactive Google Cloud setup required by 8D1.

Do not assume completion merely because Codex was asked to continue.

## E1.1 Non-secret readiness checks

Verify without exposing credential material:

- official `gcloud` is installed and callable;
- one intended active Google identity exists;
- ADC exists and can refresh an access token internally;
- intended Google Cloud project is selected;
- `GOOGLE_CLOUD_PROJECT` can be resolved to the intended non-secret project ID;
- intended Vertex location is known;
- billing status is active for the chosen project;
- `aiplatform.googleapis.com` is enabled;
- current identity has sufficient Vertex permissions for the bounded probes;
- quota project attribution is valid when required.

Reports may record:

- account state as configured/not configured;
- non-secret project ID if intentionally selected for this deployment;
- location;
- billing enabled yes/no;
- API enabled yes/no;
- ADC refresh pass/fail.

Reports must never record:

- access tokens;
- refresh tokens;
- credential JSON;
- private keys;
- OAuth client secrets;
- auth cookies.

## E1.2 If setup is incomplete

Stop with a narrow boundary such as:

```text
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
```

or

```text
HUMAN_VERTEX_API_ENABLEMENT_REQUIRED=YES
```

or

```text
HUMAN_VERTEX_BILLING_SETUP_REQUIRED=YES
```

Give the operator only the minimal official action necessary. Do not enable billing or create credentials autonomously.

## E1.3 Cost boundary

Before any billable Vertex probe, determine whether the selected project has active free-trial credit / promotional credit or another zero-cash-cost allowance sufficient for the bounded tests.

If not, estimate the maximum cost of the bounded probe campaign. If any actual paid charge could be incurred and the user has not clearly authorized such spend, stop with:

```text
HUMAN_VERTEX_PROBE_COST_AUTHORIZATION_REQUIRED=YES
```

Do not treat a billing-enabled project as unlimited spending authorization.

---

# Phase E2 — bounded backend-side Vertex validation

Once Vertex/ADC and the cost boundary are satisfied, validate the Google runtime **before firmware flashing**.

Do not change the production Gemini model yet.

## E2.1 Environment-safe probe harness

Prefer an isolated one-shot script/process using the same installed `@google/genai` version and the same auth/config construction as Slate.

Do not modify production `.env` merely to run the first isolated probe if the values can be supplied safely to the one-shot process.

Record the installed SDK version and exact model IDs tested.

## E2.2 Text runtime probe

Using current intended text model/config:

- establish authenticated Vertex client construction;
- perform one small benign text request;
- verify response success;
- verify clean error handling;
- verify no secret material appears in logs.

Do not send Outlook private data.

## E2.3 Gemini Live connection probe

Using the currently retained Live model:

`gemini-live-2.5-flash-native-audio`

run one bounded backend-side Live session where supported:

- connect;
- confirm setup accepted;
- send the smallest valid benign input required;
- receive at least one valid server event if possible;
- exercise clean close;
- verify reconnect/cleanup path if practical;
- record latency only if measured, never invent it.

Do not claim physical microphone/speaker quality from this probe.

## E2.4 Capability probes

Where the current authorized model/surface supports it, perform minimal bounded checks for:

- English interaction;
- Japanese interaction;
- input transcription event handling;
- output transcription event handling;
- one Google Search grounded request;
- one benign function/tool-call request using a non-mutating test tool or a deterministic mock boundary;
- calendar proposal generation without calendar write;
- cancel/no-write safety;
- reconnect/close lifecycle.

Do not create a calendar event in this backend-only phase.

## E2.5 E2 verdict

Require:

```text
VERTEX_ADC_AUTH=PASS
VERTEX_TEXT_PROBE=PASS
VERTEX_LIVE_CONNECT=PASS
```

If Live model access is rejected, do not guess. Capture non-secret status/error metadata, re-check official model availability/current region, and adjudicate whether the issue is:

- IAM;
- billing/API enablement;
- region/location;
- model lifecycle/availability;
- SDK protocol;
- quota;
- network.

A model migration remains out of scope unless a new exact directive explicitly authorizes it.

---

# Phase E3 — production Vertex configuration proposal

After E2 passes, inspect the actual Orange Pi production configuration path.

Prepare an exact non-secret change proposal containing only what is necessary, expected to include the intended values for:

- `GOOGLE_CLOUD_PROJECT`;
- `GOOGLE_CLOUD_LOCATION`;
- existing `GEMINI_TEXT_MODEL` only if it already belongs in production config;
- existing `GEMINI_LIVE_MODEL` retained as `gemini-live-2.5-flash-native-audio` unless separately authorized otherwise.

Also define how the production container will access ADC without embedding or copying credential secrets into Git/images.

Preferred properties:

- credentials remain host/runtime managed;
- credential file permissions are restrictive;
- no secret baked into Docker image layers;
- no secret printed by compose inspect/logs;
- restart is controlled and rollbackable.

## E3 human boundary

Do not mutate production `.env`, compose mounts or credential mounts until the user explicitly authorizes the exact proposed production Vertex configuration.

Stop with:

```text
HUMAN_PRODUCTION_VERTEX_CONFIG_AUTHORIZATION_REQUIRED=YES
```

and present only the non-secret diff/plan.

After explicit authorization, continue automatically.

---

# Phase E4 — deploy and validate production Vertex runtime

After E3 authorization:

1. preserve current production configuration as rollback;
2. apply only the authorized Vertex config/mount changes;
3. restart/recreate only the necessary Slate container;
4. do not disturb MySQL persistent data;
5. verify Slate health;
6. verify MySQL health;
7. verify public `/healthz`;
8. verify public Web UI;
9. verify Tailscale/Funnel;
10. verify NOTE4 polling remains healthy;
11. verify voice-config auth negative test;
12. verify WebSocket auth negative test;
13. verify backend can internally create the Vertex client;
14. repeat the smallest production-context Gemini Live connection/clean-close smoke test;
15. scan logs for accidental secret exposure;
16. preserve rollback path.

If the production container fails, rollback immediately to the prior known-good configuration/image and report the exact non-secret failure.

Successful E4 state:

```text
PRODUCTION_VERTEX_ADC=PASS
PRODUCTION_VERTEX_LIVE_SMOKE=PASS
READY_FOR_PHYSICAL_VOICE_FLASH_PRECHECK=YES
```

---

# Phase E5 — exact firmware flash preflight

No firmware write is authorized by this directive.

Before asking for authorization, prove that the exact previously reviewed artifact is still available and unchanged.

Required values:

```text
FIRMWARE_SOURCE_SHA=121622c3bd1d23587b4aadb3a079ec85d2052278
FULL_IMAGE_SHA256=eba9427558bf08eb387894bbba1feac2da5ec1d0b2ab8c8785285251d65afe33
APP_IMAGE_SHA256=95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4
ESP_IDF=5.5.2
TARGET=esp32s3
```

Recompute hashes from the actual local artifacts immediately before flash authorization.

Verify:

- currently installed partition table compatibility;
- app slot/offset;
- bootloader compatibility;
- device serial port identity;
- existing factory/rollback backup availability;
- NVS/LittleFS/pairing preservation plan;
- no full erase required.

Prefer the least destructive reviewed app-only/OTA-compatible write if mechanically valid. Never improvise offsets.

## E5 human flash boundary

Stop with:

```text
HUMAN_FIRMWARE_FLASH_AUTHORIZATION_REQUIRED=YES
```

The user must explicitly authorize Campaign 8E / PR #2 flashing of the exact artifact/hash.

Do not infer authorization from requests to continue, test, review, or read reports.

---

# Phase E6 — physical flash and immediate routing test

Only after exact explicit firmware authorization:

1. re-check hashes one final time;
2. confirm actual NOTE4 serial device;
3. record pre-flash current state;
4. preserve backup/rollback path;
5. perform only the approved write;
6. do not erase NVS/LittleFS;
7. reboot device;
8. verify normal boot;
9. verify existing pairing/server address survives;
10. verify authenticated polling resumes.

Then perform the first physical Voice AI test:

```text
double ENTER
→ Voice AI scene
→ short ENTER/start conversation
→ Slate voice-config fetch
→ Slate WebSocket
→ Gemini Live backend
```

Primary routing success criteria:

- no Tenclass/Xiaozhi control-panel pairing screen;
- no vendor activation code;
- Slate receives authenticated voice-config request;
- Slate receives authenticated voice WebSocket session;
- firmware does not contact `api.tenclass.net`;
- device remains paired to Slate.

If routing fails, stop user interaction and diagnose before repeated flashing.

---

# Phase E7 — physical voice capability validation

After routing succeeds, perform a concise but meaningful physical validation matrix.

## Core voice

Validate:

- microphone capture;
- speech activity/start-stop behavior;
- server receives audio;
- model response reaches Slate;
- audio playback on NOTE4;
- no obvious sustained feedback loop;
- conversation can stop cleanly;
- double ENTER exits Voice AI;
- reconnect after exiting/re-entering.

## English

Run at least one benign English Q&A interaction.

Record:

- transcript present yes/no;
- spoken response present yes/no;
- gross latency observation only if measured;
- intelligibility pass/fail.

## Japanese

Run at least one benign Japanese Q&A interaction.

Record the same fields.

Do not overclaim quality from one sample.

## Search grounding

Run one prompt that clearly benefits from current public information and confirm the Search/tool path is actually invoked where supported. Do not treat a plausible ungrounded answer as proof.

## Interruption / barge-in

If current Live model/adapter supports it, verify a short interruption cycle without crashing or wedging the session.

## Reconnect

Test a clean conversation exit/re-enter. If safe and useful, test one bounded transient network interruption and recovery. Do not destabilize the production network.

---

# Phase E8 — Calendar confirmation and privacy gates

Only run live calendar writes if the user's Google Calendar OAuth integration is separately configured and authorized.

If Calendar OAuth is not yet configured, record:

```text
CALENDAR_LIVE_WRITE=HUMAN_OAUTH_PENDING
```

and do not block the core voice-routing PASS solely on that external integration boundary.

When authorized, verify:

1. voice request creates a proposal only;
2. no event exists before physical confirmation;
3. short ENTER with active proposal confirms exactly once;
4. event creation is narrow and correct;
5. duplicate confirmation cannot duplicate the event;
6. a separate proposal canceled with UP/DOWN writes zero events.

Outlook privacy regression remains mandatory regardless of whether Outlook OAuth is live:

- no Microsoft access token sent to Gemini;
- no Graph credential sent to Gemini;
- no raw private Outlook event description/attendee payload sent to Gemini.

---

# Phase E9 — failure classification and bounded correction loops

If any test fails, classify the failure before modifying code.

Use one primary layer:

- **R1 firmware bootstrap/routing** — config fetch, persisted config, vendor fallback, button state;
- **R2 device authentication** — `device_secret`, config endpoint, WebSocket handshake;
- **R3 Slate Xiaozhi protocol bridge** — framing/session messages;
- **R4 audio codec/transport** — Opus/PCM, rates, playback/capture;
- **R5 Vertex auth/model/runtime** — ADC, IAM, region, model, SDK;
- **R6 tools/Search/Calendar** — function schemas, proposal/confirm semantics;
- **R7 network/Funnel** — connectivity/TLS/Tailscale;
- **R8 hardware** — microphone/speaker/button/device power.

For ordinary software failures:

1. reproduce minimally;
2. gather non-secret evidence;
3. use bounded Sonnet 5 Claude CLI worker if useful;
4. Codex adjudicates;
5. implement smallest fix;
6. run focused tests;
7. run full relevant regression;
8. AGY exact-artifact review for material changes;
9. correct if needed;
10. repeat, max 3 loops.

### Critical reflash rule

If **any firmware source changes after the exact reviewed artifact above**, the old flash authorization is void for the new artifact.

For a new firmware candidate:

- rebuild with exact ESP-IDF 5.5.2;
- record source SHA;
- record full/app hashes;
- run deterministic firmware regression;
- run vendor-dependency scan;
- run AGY exact-artifact review;
- publish rollback;
- stop for a **new explicit exact-hash flash authorization**.

Never auto-flash a corrected firmware artifact merely because the previous artifact was authorized.

Backend-only corrections may be deployed only if they fall inside already authorized production scope and retain rollback; otherwise stop for the appropriate human deployment boundary.

---

# Phase E10 — deterministic final regression

Before declaring Campaign 8E complete, run the complete relevant software gates from the latest exact source:

- backend tests;
- shared tests;
- targeted device/auth/voice tests;
- Gemini Live service tests;
- tool registry tests;
- Google Calendar proposal/confirmation tests;
- Outlook isolation tests;
- format check;
- lint;
- typecheck;
- frontend build if frontend is touched;
- `git diff --check`;
- secret-pattern scan;
- `firmware/test/no_vendor_voice_dependency_test.sh`;
- framebuffer/host regression relevant to firmware if firmware changed;
- exact ESP-IDF `5.5.2` build if firmware changed;
- exact artifact hashes.

Do not report a gate as PASS if it was not run.

---

# Phase E11 — final independent review

Ask AGY to review the exact final artifacts and evidence read-only.

Review scope must include:

- Tenclass/vendor activation fully absent from production path;
- device-secret auth on config/WebSocket;
- Google credentials backend-only;
- ADC/Vertex runtime safety;
- no API-key fallback;
- Outlook isolation;
- Calendar physical-confirm gate;
- physical E2E evidence;
- rollback readiness;
- exact firmware artifact identity if flashed;
- no Campaign 6D/PR #1/PR #3 contamination.

Resolve P0/P1 and material P2 findings before final readiness. Handle P3 advisories explicitly.

---

# Phase E12 — durable final report and PR checkpoint

Update:

- `docs/campaign-reports/08-GEMINI-35-LIVE.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

Include exact final values for:

```text
PR2_HEAD=
BACKEND_SOURCE=
BACKEND_IMAGE=
ROLLBACK_BACKEND_IMAGE=
VERTEX_PROJECT_CONFIGURED=YES|NO
VERTEX_LOCATION_CONFIGURED=YES|NO
VERTEX_ADC_AUTH=PASS|FAIL|BLOCKED
VERTEX_TEXT_PROBE=PASS|FAIL|NOT_RUN
VERTEX_LIVE_CONNECT=PASS|FAIL|NOT_RUN
PRODUCTION_VERTEX_ADC=PASS|FAIL|NOT_CONFIGURED
FIRMWARE_SOURCE_SHA=
FIRMWARE_FULL_SHA256=
FIRMWARE_APP_SHA256=
FIRMWARE_FLASHED=YES|NO
TENCLASS_ACTIVATION_SCREEN=ABSENT|PRESENT|NOT_TESTED
SLATE_VOICE_CONFIG_PHYSICAL=PASS|FAIL|NOT_RUN
SLATE_VOICE_WEBSOCKET_PHYSICAL=PASS|FAIL|NOT_RUN
MIC_CAPTURE=PASS|FAIL|NOT_RUN
AUDIO_PLAYBACK=PASS|FAIL|NOT_RUN
ENGLISH_VOICE=PASS|FAIL|NOT_RUN
JAPANESE_VOICE=PASS|FAIL|NOT_RUN
SEARCH_GROUNDING=PASS|FAIL|NOT_RUN
BARGE_IN=PASS|FAIL|NOT_RUN
CALENDAR_PROPOSAL_GATE=PASS|FAIL|HUMAN_OAUTH_PENDING|NOT_RUN
CALENDAR_CANCEL_ZERO_WRITE=PASS|FAIL|HUMAN_OAUTH_PENDING|NOT_RUN
OUTLOOK_ISOLATION=PASS|FAIL
AGY_FINAL_VERDICT=PASS|REVISE|BLOCKED
READY_FOR_PR2_MERGE=true|false
```

Commit report/state changes selectively, push, verify remote HEAD, and add a concise PR #2 checkpoint comment.

Do not merge PR #2 automatically.

If all required core voice/routing/security gates pass but optional external OAuth integrations remain human-pending, distinguish them clearly rather than falsely marking core voice as failed.

---

## 5. Human boundaries summary

The only normal reasons to return control are:

1. Google account/project/ADC/billing/API setup is incomplete.
2. A billable probe could incur actual spend without prior authorization.
3. Production Vertex `.env`/credential-mount change needs approval.
4. Exact firmware flash needs explicit authorization.
5. A corrected firmware artifact needs a new exact-hash flash authorization.
6. Live Google/Microsoft OAuth consent is required for Calendar/Outlook integration tests.
7. Hardware interaction is physically impossible without the operator.
8. A P0/security/credential leak or other hard stop occurs.

For all other ordinary work, remain live as controller and continue automatically.

---

## 6. Hard-stop conditions

Stop immediately for:

- credential/secret exposure;
- unauthorized billing activation;
- unauthorized paid spend;
- service-account key creation;
- Gemini/Google static API-key introduction;
- OpenRouter use for Gemini or Claude;
- firmware erase without explicit authorization;
- flashing an artifact whose hash differs from the authorized hash;
- Outlook write capability;
- Gemini receiving Microsoft credentials/private raw payloads;
- unconfirmed Calendar write;
- unrecoverable production rollback loss;
- persistent P0/P1 after bounded correction loops;
- unknown hardware target/serial port;
- branch contamination with Campaign 6D/PR #1/PR #3.

---

## 7. Expected next state from the current checkpoint

At authoring time the immediate expected stop remains:

```text
HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES
```

Once the operator finishes the approved Google Cloud setup, Codex should be woken with a short instruction to fetch origin and continue this directive. Codex should then automatically execute E0 → E1 → E2 and onward until the next genuine human boundary.
