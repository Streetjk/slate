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
