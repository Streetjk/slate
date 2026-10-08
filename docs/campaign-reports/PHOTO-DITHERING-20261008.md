# Photo dithering repair — 8 October 2026

Base9d2d7f3, branchfix/wifi-auto-recovery; governing instructions08501bb3ca75739e43fbf4f54811e0243ca5d193.

Confirmed editor disabled dithering without a new image; old uploads retain only1bpp, canvas export was already dithered, gallery Add Photos hardcodedfloyd.
Retain editable source bytes/settings alongside processed frame, with atomic bounded image-source blob, transactional rollback and deletion cleanup. Owner-web JWT endpoint only; device frame APIs unchanged. No SQL migration.
Send undithered cropped image for new uploads, retain gray detail for future algorithms. Algorithm-only edits reuse saved source, preserve audio, persist mode/threshold. Cached source invalidated after save. Gallery additions honor current selected settings; gallery selection resets form byphotoID.
Legacy photos have irrecoverable original gray detail; UI explicitly requires original reupload once. Do not pretend1bpp can be meaningfully re-dithered.

Validation:
- backend tests458PASS5opt-inSKIP0FAIL (six new source/ownership/rollback/legacy/audio/real Sharp-output cases).
- frontend/backend typecheckPASS, lintPASS; frontendbuildPASS.
- changed-file Prettier applied and gitdiffcheckPASS.
- repository-wide formatcheckFAIL due12pre-existing unrelated files; unchanged files deliberately not reformatted.
- AGY OAuth model-only independentreview gemini-3.7-flash-medium PASSno findings; conversation6f2ba80a-6471-4c9c-8742-52ab38e6e1c0 SUCCESS.
- review packetSHA256 f3ca11b2e391c6d767a0f7bb48fe3946e2cebc06e50b8008759ef10ec7faa5ee; pinnedCLI ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb verifiedpre/post; requestedmodelobservedIDabsent.

Deployment will build a derived image on the existing pinned production image, overlay only reviewed changed backend/shared files and the frontend dist. Preserve runtime config/data, restart onlyslate, retain oldimage/composeoverride rollback. No firmware changes in this photo lane.

## Deployed

Implementation803dc6b, derived image slate:photo-dither-803dc6b, imageIDsha256:0fc649a1b4151754a96ef1b1126164923757cb55ba8bf5a50bdcd83e30027e24.
Pre-deploy production hashes of every replaced existing backend/shared file matched base9d2d7f3; drift checkPASS. No dependency or DB migration. Image built on existing pinnedbase5ef0822f07a5e1f0345bca629b3791587a9818394f90dbc054e7eb7bdc22a65f, overlays seven production source files plus frontenddist only.
Retained backup image override in /mnt/ssd-tmp/slate-tools/photo-dither-803dc6b/image.override.before.yml; updated last image override only. Recreated onlyslate using exact existing compose config chain, --no-deps. Runtime settings/secrets/mounts preserved, not printed or copied into image.
Container started2026-10-08T11:30:00.270543142Z, healthy; healthHTTP200.
Deployed source hashesPASS; source endpoint unauthenticatedHTTP401.
Served index.html SHA25670e0bfb4d10fe42fd328f15a7fdfbc29214da6ba14239945aa731d6dfb4b58d4 equals reviewed build.
No signed-in browser end-to-end editing test or physical display claim.
