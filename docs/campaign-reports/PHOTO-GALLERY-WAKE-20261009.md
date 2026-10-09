# Photo gallery and wake navigation — 9 October 2026

User requested keeping additional photos inside the photo tile, switching only
with Volume Up/Down, and consuming front-button wake without changing tiles.

Branch: fix/wifi-auto-recovery. Base: 5e3778f94d169fc1a375145e1ee4f24490a3975c.
Governing instructions: 08501bb3ca75739e43fbf4f54811e0243ca5d193.

## Implementation

The existing editor already models every static image in a group as one gallery.
The group grid now presents one gallery card, identifies its photo count and
keeps thumbnails/edit/delete/reorder inside the gallery editor. Root drag order
expands to every photo ID in photo order; deleting the cover promotes the next
photo. No persisted photo, source image, audio or content item is deleted.

Firmware ENTER navigation uses the first static frame as gallery anchor and
skips additional static frames. Leaving any selected gallery picture moves from
the gallery anchor to the next dynamic tile, even when photos are nonadjacent.
Unknown frame metadata remains reachable. A gallery-only group ignores ENTER
without reloading or restarting audio. Volume Up/Down retains local photo
navigation. Minute-based auto-rotation and its web controls are removed as
requested; stored rotation fields remain compatible but unused.

Synthetic post-network wake events are removed. Only the EXT1 wake button uses
a filtered GPIO input driver, hiding the initial held press until a release
debounced with the existing button configuration. The gesture recognizer never
sees the wake press, preventing delayed single/double/long callbacks. Subsequent
presses are normal. Cold boot/non-wake buttons retain existing vendor GPIO
driver. Automatic light sleep preserves ordinary navigation.

## Validation

- C++ host navigation/wake regression compiled with clang++ -std=c++17
  -Wall -Wextra -Werror and passed. Covers interleaved pictures/dynamic tiles,
  gallery child anchoring, reverse/wrap, gallery-only/no-op, unknown metadata,
  empty/single/no-photo cases, held wake, release bounce and later/cold presses.
- bun test scripts/slate-photo-gallery.test.ts: 4 PASS, 0 FAIL, 8 assertions.
- bun run lint and bun run typecheck: PASS (frontend and backend).
- bun run --cwd frontend build: PASS.
- Changed TS/TSX Prettier and git diff --check: PASS.
- Whole-repository format check: existing unrelated formatting debt remains
  (11 files after formatting the changed files); no mass-format changes.
- ESP-IDF v5.5.2 ESP32-S3 build: PASS; app size 0x271870, 39% partition free.
  An initial gpio_config name-shadowing compile error was fixed with ::gpio_config.
- Pre-commit binary SHA256:
  04f7c3aabcd74b382eaab5eb55f82caa2d0d9ebdf1c3409e07e32a089a7b728a.
  Frontend index SHA256:
  4a8d4701f7cc44e88a300b3b8a43a24856b5805a2b1128eb9936e28a3fa08528.

## Independent review

Official Google OAuth, pinned AGY CLI model-only/read-only review:
requested gemini-3.7-flash-medium, effort medium; PASS, no findings.
Conversation: 221b3106-0e08-4349-adb6-c805a26ab44f, SUCCESS, one turn.
Packet SHA256: 9816728a4380362cdd25fc98d4a82e4e789bae7e6511be998a38859a7eb7def6.
CLI SHA256 verified pre/post:
ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb.
Observed model ID absent; requested model is not claimed independently observed.
One review cycle, no findings to accept/reject.

## Delivery and limits

Software ready; frontend-only deployment to follow on the active
slate:photo-dither-803dc6b base, preserving runtime config/data with rollback.
Slate USB ports absent at inspection; NOT flashed. Prior flash authorization
persists, but reconnect is needed. Physical wake/click/EPD behavior unmeasured.
NVS, LittleFS layout, partition table, device protocol and OTA paths unchanged.
Daytime connected light sleep, AI usage polling, offline60s hibernation, quiet
hours and idle audio savings retained. No static AI credentials, auth changes,
Outlook capability, merge, tag or release.

External review XR-001 through XR-005 were outside this narrow navigation stage;
prior hardened campaign evidence remains authoritative and unchanged.
Next action: deploy web, record exact committed firmware build; reconnect Slate
data USB, application-only flash at0x10000, verify hash and backend reconnect.


## Delivery evidence

Implementation SHA: 6d1a995fef5d5e146c3480e52a8f5fa2c8a4849d.
Exact committed-source ESP-IDF5.5.2 rebuild PASS. slate.bin 2562160
bytes, SHA256 04f7c3aabcd74b382eaab5eb55f82caa2d0d9ebdf1c3409e07e32a089a7b728a.
Source clean after rebuild; no firmware modifications after AGY review.

Web deployed frontend-only to slate:gallery-navigation-6d1a995, image ID
sha256:53795fb706f62e67f2a319d5b0e29ebc342a9992c55f73b17127d92173dddea2.
Base image ID verified before build/deploy. Same four-compose-file chain and
service-only recreation; existing backend/image-source fix, runtime config and
data retained. Health HTTP200, running, restart count0. Every deployed frontend
file hash and served index hash matched the local reviewed build. Initial
startup connection resets cleared before success; rollback not required.
Rollback image remains slate:photo-dither-803dc6b; previous override retained at
/mnt/ssd-tmp/slate-tools/gallery-navigation-6d1a995/image.override.before.yml.

Final USB check: []. NOT flashed. Device still runs
previous connected-sleep-cancellation firmware; photo navigation and wake input
changes become active only after application-only flash. Reconnect Slate data
USB, verify exact reviewed binary/port, write0x10000 and verify data/reconnect.
