# Campaign 6D — NOTE4 E-Ink Refresh Optimization Instructions

Repository: `Streetjk/slate`
Branch: `integration/note4-custom`

## Authority

This directive governs the next NOTE4 stage after Campaign 6C O3 backend deployment PASS.

Before work:
1. `git fetch origin`.
2. Read `AGENTS.md`, `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`, `docs/campaign-reports/CAMPAIGN-STATE.md`, `docs/campaign-reports/06C-ORANGE-PI-BACKEND.md`, and this file.
3. Verify live branch HEAD and working tree.
4. Treat Codex as sole production writer/integrator. AGY is read-only reviewer/researcher.

Do not begin Airtable/Gantt.

## Current observed state

- Custom NOTE4 firmware is flashed and boots.
- Orange Pi custom Slate backend is healthy at `http://192.168.50.108:3001`.
- NOTE4 has reached the Slate pairing flow and displayed an Add Device code, proving device-to-backend reachability at least through pairing.
- User reports Slate e-ink interaction feels slower than stock firmware.
- Current Slate SSD1683/SSD2683-compatible path includes:
  - 50 ms sliding refresh debounce, up to 500 ms hard maximum;
  - 300 ms sampling throttle for non-urgent refreshes;
  - full refresh when diff ratio >= 30%;
  - forced cleanup full refresh after 8 partial refreshes;
  - `EpdInit()`/reset before each refresh;
  - current partial path writes transition data for the entire 400x300 panel.
- Public ZECTRIX NOTE4 reference implementation demonstrates controller partial-window command `0x83` and region-limited transition transfer.
- Orange Pi root filesystem was approximately 97% used after build, with about 508 MB free. Preserve the running deployment and rollback capability before any cleanup.

## Campaign goal

Improve perceived NOTE4 UI responsiveness safely and measurably, prioritizing software/transfer-path improvements over experimental waveform changes.

Success means:
- button/menu interactions are materially faster than the Campaign 6 baseline;
- no regression in correctness, ghosting control, sleep/wake, backend sync, or display reliability;
- deterministic firmware tests/build pass;
- AGY review passes;
- optimized firmware artifact is produced with hashes;
- no new optimized firmware is flashed until the explicit flash gate below is satisfied.

## Hard safety rules

Do NOT initially:
- modify vendor/OTP waveform tables or external LUT/waveform timing;
- overclock SPI beyond known hardware-safe settings merely for benchmark numbers;
- remove controller reset/re-init steps that the controller/reference path requires for reliable repeat refresh;
- disable full-refresh ghost cleanup entirely;
- change EPD rail/power sequencing without evidence;
- perform `docker system prune -a`, delete the running image, or delete the designated rollback image;
- expose credentials, OAuth tokens, device secrets, or private SSH keys.

If a proposed optimization touches waveform/LUT, EPD voltage/booster, unsafe SPI timing, or power sequencing, STOP and publish evidence/recommendation for separate authorization.

## Phase D0 — pair and establish physical baseline

If pairing is not already complete, stop at the minimal human action needed to enter the current NOTE4 Add Device code in the Slate Web UI. Do not commit transient pairing codes to GitHub.

After pairing is complete, collect a reproducible baseline from the currently flashed firmware before changing refresh behavior.

Measure, where technically observable:
- button event timestamp;
- scene/UI invalidation timestamp;
- final LVGL flush timestamp;
- refresh-task start after debounce;
- full vs partial decision;
- SPI/frame-transfer start/end;
- BUSY/display-refresh completion;
- total button-to-visible-refresh latency.

Use serial/log instrumentation only if needed, and keep added instrumentation removable or debug-gated.

Capture at least these representative flows:
1. small UI change suitable for partial refresh;
2. page/menu navigation;
3. BTC D/W/M switching when available;
4. a large screen change that currently triggers full refresh.

Record whether user-facing delays are dominated by debounce, full-refresh selection, full-frame transfer, BUSY waveform time, rendering, or another stage.

## Phase D1 — safe implementation priority

Apply optimizations in this order and measure after each meaningful step.

### D1.1 True dirty-rectangle partial transfer

Highest priority.

Use the existing accumulated dirty rectangle / framebuffer diff information to implement a real SSD2683/SSD1683-compatible partial window where safe, based on controller behavior and the public ZECTRIX NOTE4 reference architecture.

Requirements:
- align X boundaries as required by packed pixels/controller protocol;
- program the partial window using the proper controller command (reference uses `0x83`);
- transfer only rows/bytes inside the affected rectangle for partial updates;
- preserve old/new transition encoding from `prev_snapshot_` to `snapshot_`;
- update/maintain `prev_snapshot_` consistency correctly;
- fall back to known-good full-frame/full-refresh behavior on invalid/unsupported windows;
- add deterministic unit tests for window alignment, clipping, packed transition bytes, unchanged areas, edge rectangles, full-width/full-height, and fallback behavior.

Do not blindly copy external code. Re-derive the minimal implementation against the controller protocol and existing Slate abstractions.

### D1.2 Interaction-aware debounce

Profile the existing 50 ms sliding debounce before changing it.

If button-driven scene transitions already have a deterministic point where LVGL rendering is complete, permit a bounded urgent path that reduces or bypasses unnecessary debounce without allowing half-rendered frames.

Requirements:
- background/animation-driven LVGL flushes must remain coalesced safely;
- no refresh storm;
- no partial rendering/tearing-like incomplete UI state;
- keep a conservative fallback path.

Do not simply set debounce to zero globally.

### D1.3 Full-refresh policy tuning

Only after D1.1/D1.2 measurements.

Evaluate whether `diff >= 30% => full` is unnecessarily conservative for this panel/use case.

If evidence supports adjustment:
- use an explicit named constant/config;
- compare ghosting and latency across representative transitions;
- retain periodic cleanup full refresh;
- do not raise thresholds so far that large incompatible transition updates become unreliable.

The cleanup cadence (`8` partials) may also be evaluated, but must remain bounded and justified by physical evidence.

### D1.4 Other low-risk latency wins

Investigate only if material after the above:
- avoid redundant framebuffer conversion/copies;
- reduce unnecessary SPI transaction fragmentation;
- preserve DMA-safe buffers where useful;
- avoid redundant temperature-read mode switching when already cached;
- ensure urgent button paths bypass only the intended 300 ms non-urgent sampling throttle.

Do not sacrifice reliability for small benchmark gains.

## Phase D2 — deterministic validation

For every production change:
- run relevant unit tests;
- run full firmware deterministic tests available in repo;
- exact ESP-IDF `v5.5.2`, target `esp32s3` build;
- produce merged/full and OTA/app artifacts as applicable;
- record SHA-256 hashes;
- `git diff --check`;
- secret-pattern scan.

Run AGY medium review for normal refresh implementation and AGY high review if controller protocol/power behavior changes materially or findings persist.

Maximum 3 review/fix loops; unresolved P1 after 3 loops => BLOCKED.

## Phase D3 — Orange Pi disk hygiene

Separately, restore safe free space on `note4-orangepi`.

First record:
- `df -h /`;
- `docker system df`;
- running container image IDs;
- current running custom Slate image;
- one clearly designated rollback image.

Then remove only safe disposable data such as build cache and dangling/unreferenced intermediate layers.

Allowed examples after verification:
- `docker builder prune` / BuildKit cache cleanup;
- dangling image cleanup that provably does not include running or rollback images.

Forbidden:
- `docker system prune -a`;
- deleting volumes;
- deleting MySQL or Slate persistent data;
- deleting running image;
- deleting designated rollback image.

Target: recover a practical safety margin, preferably >2 GB free if achievable without deleting required runtime/rollback assets. Report before/after usage.

## Phase D4 — optimized-flash gate

Implementation/build/testing/review are authorized by this directive.

Do NOT flash the newly optimized firmware automatically.

Before any optimized reflash, publish:
- exact source SHA;
- artifact hashes;
- baseline vs optimized measured timing table;
- refresh-path changes;
- test/build results;
- AGY verdict;
- known ghosting/reliability risks;
- rollback artifact/source reference;
- explicit `READY_FOR_OPTIMIZED_FLASH=true|false`.

Then stop for explicit human authorization to flash the new image.

## Report and state publication

Before stopping at any human boundary, commit and push:
- `docs/campaign-reports/06D-EINK-REFRESH-OPTIMIZATION.md`
- updated `docs/campaign-reports/CAMPAIGN-STATE.md`

Report must include:
- starting and ending SHAs;
- baseline measurements;
- each optimization attempted and measured effect;
- exact tests/builds;
- AGY model/effort/verdict/findings;
- artifact hashes;
- Orange Pi disk before/after and preserved image IDs/tags;
- whether pairing/physical tests were completed;
- `READY_FOR_OPTIMIZED_FLASH`.

Push successfully and verify remote branch before returning control.

## Continue/stop behavior

Continue automatically through D0-D3 wherever no human interaction is required.

Stop only for:
- pairing code entry or other physical device action that cannot be automated;
- optimized firmware reflash authorization;
- credential/OAuth interactive consent;
- unsafe controller/waveform/power-sequencing proposal;
- persistent P1/P0 or safety blocker;
- destructive/paid action not already authorized.

Normal compiler/test failures, valid P2/P3 fixes, measurements, and code-review loops are not human stops.
