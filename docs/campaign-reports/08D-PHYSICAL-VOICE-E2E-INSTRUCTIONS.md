# Campaign 8D — Physical Slate Voice E2E gate

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This directive follows Campaign 8C. Read `08-GEMINI-35-LIVE.md`, `08A-VOICE-ROUTING-TENCLASS-INSTRUCTIONS.md`, and `CAMPAIGN-STATE.md` first. Where older text conflicts with the live 8C checkpoint, the newest checkpoint and this directive govern.

## Current accepted checkpoint

Campaign 8C has deployed and validated the Slate-owned voice-routing backend on `note4-orangepi`.

Preserve exactly:

- deployed backend source: `121622c3bd1d23587b4aadb3a079ec85d2052278`;
- deployed backend tag: `slate-note4:campaign8-voice-routing-121622c`;
- rollback image: `slate-note4:rollback-before-campaign8-948934c`;
- firmware source: `121622c3bd1d23587b4aadb3a079ec85d2052278`;
- full image SHA-256: `eba9427558bf08eb387894bbba1feac2da5ec1d0b2ab8c8785285251d65afe33`;
- OTA/app image SHA-256: `95ddf7e41c3dbb3aafb7d983708ccf39c131d68a89eac7f000c48adb5e99c9d4`;
- ESP-IDF `5.5.2`, target `esp32s3`.

Do not merge PR #2, change Gemini model selection, change billing, create an API key, start PR #3, or resume Campaign 6D as part of this stage.

## 8D0 — pre-flash backend and Google-runtime readiness

Before asking for or consuming firmware-flash authorization, re-check the live backend only:

1. Slate container healthy.
2. MySQL healthy.
3. public `/healthz` PASS.
4. Funnel/Tailscale route healthy.
5. NOTE4 authenticated polling still PASS.
6. candidate voice-config route remains registered and unauthenticated access remains rejected.
7. voice WebSocket unauthenticated access remains rejected.
8. rollback image still exists.
9. root disk has sufficient free space for ordinary runtime operation; do not perform broad destructive cleanup.

Then check whether the current Orange Pi has a usable **Vertex/Google ADC runtime** for the configured Gemini Live service without revealing credential material:

- report only whether `GOOGLE_CLOUD_PROJECT` is SET/UNSET, never its value unless it is already non-sensitive project metadata intentionally recorded elsewhere;
- report only whether `GOOGLE_CLOUD_LOCATION` is SET/UNSET;
- determine whether Application Default Credentials can obtain/refresh an authorized identity through the existing approved mechanism;
- do not print access tokens, refresh tokens, credential JSON, private keys, client secrets, or service-account key material;
- do not introduce `GEMINI_API_KEY` or `GOOGLE_API_KEY`;
- do not enable billing automatically;
- do not create a new Google Cloud project automatically.

If Vertex/ADC is absent or cannot be verified, stop before firmware flash with:

`HUMAN_VERTEX_ADC_SETUP_REQUIRED=YES`

and provide the operator only the minimal official Google Cloud/ADC setup/login action required on the Orange Pi or approved admin workstation. The operator must complete Google authentication interactively. Never ask them to paste credentials into chat, Git, logs, or reports.

Do not treat missing Vertex auth as a routing failure: Campaign 8C already proved the Slate-owned routing backend independently.

If Vertex/ADC is usable, run one bounded backend-side Gemini Live connection/probe where possible without NOTE4 firmware changes. Verify connection acceptance and clean close; do not claim physical EN/JP/audio quality yet.

## 8D1 — explicit firmware authorization boundary

Firmware writing remains a human boundary.

Do not flash merely because this directive exists.

Proceed only after the user gives an explicit authorization that identifies Campaign 8D / PR #2 and authorizes flashing the reviewed Campaign 8 voice-routing candidate.

Immediately before writing:

- confirm branch/source/artifact hashes still match this directive;
- confirm no newer unreviewed firmware commit has replaced the reviewed candidate;
- identify the actual NOTE4 serial device deterministically;
- preserve the existing factory/rollback backup procedure;
- preserve NVS/LittleFS/device pairing/server address/device secret unless a separately reviewed recovery requires otherwise;
- do not erase flash.

Because Campaign 8 changes application code rather than partition layout, prefer the least destructive reviewed flash path that preserves NVS/pairing. If app-only/OTA flashing is mechanically compatible with the currently installed partition table and bootloader, use the exact reviewed app artifact. If compatibility cannot be proven, stop rather than improvising a full erase.

Record the exact artifact path/hash and write offsets used.

## 8D2 — immediate post-flash routing validation

After reboot, first prove that the old defect is gone before testing Gemini quality.

Required physical checks:

1. device boots normally;
2. Server Address/pairing/device identity remain intact;
3. ordinary authenticated polling resumes;
4. double-tap ENTER opens Voice AI;
5. short ENTER starts/toggles conversation;
6. microphone capture still works;
7. **no Tenclass/Xiaozhi control-panel activation message appears**;
8. no vendor activation code is requested;
9. backend logs show the NOTE4 obtains Slate voice config and attempts the authenticated Slate voice WebSocket;
10. no traffic/production source fallback to `api.tenclass.net` is observed.

If boot, pairing, polling, or basic Voice AI routing regresses, stop and rollback using the preserved Campaign 5 firmware/backend references. Do not attempt unrelated fixes in the same physical session.

## 8D3 — physical Gemini Live E2E validation

Only after 8D2 passes and Vertex/ADC is usable:

Test a small bounded set:

- English speech -> transcript -> spoken Gemini response;
- Japanese speech -> transcript -> spoken Gemini response;
- interruption/barge-in;
- one simple Search-grounded question if enabled;
- one benign function/tool call that does not write external state;
- Google Calendar proposal generation only;
- Cancel -> zero event writes;
- Confirm -> exactly one event write only when the operator explicitly chooses to test the write path;
- reconnect after one controlled session close;
- double ENTER exit;
- UP/DOWN volume outside proposal state;
- long ENTER Settings behavior.

Do not expose Outlook private payloads to Gemini. Preserve existing Outlook read-only/isolation invariants.

If Google Calendar OAuth itself is not yet configured, record that subtest as `HUMAN_GOOGLE_CALENDAR_OAUTH_PENDING`; do not weaken the confirmation gate or substitute credentials.

## 8D4 — adjudication and durable checkpoint

Classify failures by layer:

- firmware boot/input/UI;
- Slate config fetch/device auth;
- Slate voice WebSocket/protocol/codec;
- Vertex/ADC/model connection;
- Gemini event handling/transcription/audio;
- tool/Search/calendar integration.

Do not misattribute a Vertex-auth failure to the firmware routing migration.

After the physical session:

- update `08-GEMINI-35-LIVE.md` with exact physical evidence;
- update `CAMPAIGN-STATE.md`;
- run only the deterministic regressions required by any corrective code actually changed;
- obtain AGY review for any substantive corrective code before another candidate flash;
- commit and push the durable checkpoint;
- update PR #2.

Final states must distinguish at least:

- `SLATE_VOICE_ROUTING_PHYSICAL=PASS|FAIL|NOT_RUN`
- `TENCLASS_ACTIVATION_PHYSICAL=ABSENT|PRESENT|NOT_RUN`
- `VERTEX_ADC_LIVE=PASS|BLOCKED_HUMAN_AUTH|FAIL|NOT_RUN`
- `EN_VOICE_E2E=PASS|FAIL|NOT_RUN`
- `JP_VOICE_E2E=PASS|FAIL|NOT_RUN`
- `SEARCH_E2E=PASS|FAIL|NOT_RUN`
- `CALENDAR_PROPOSAL_E2E=PASS|FAIL|NOT_RUN`
- `CALENDAR_CONFIRM_WRITE_E2E=PASS|FAIL|NOT_RUN`
- `FIRMWARE_ROLLBACK_REQUIRED=YES|NO`

No PR merge or unrelated campaign begins automatically after this stage.