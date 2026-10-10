# Grok quota repair — 10 October 2026

Base 8ebe2776cd4f0dfe061eb8277fce8ef124725f5a; branch fix/wifi-auto-recovery; governing instructions 08501bb3ca75739e43fbf4f54811e0243ca5d193.

Root cause: Grok1.0.34 dashboard without terminal produced no billing log. A bounded PTY run produced current billing3%, weekly reset2026-10-15T10:56:15.892Z. Previous backend fallback retained October6 observation with October8 reset indefinitely.

Fix: bounded Python PTY wrapper drains/discards CLI output, terminates child and closes PTY; no credentials extracted. Helper rejects expired weekly periods. Backend current/fallback windows require observation <=6h, reject future observations and filter resetAt <=now. Retains optional machine resetAt for future expiration; legacy records expire by observation age. Authentication status remains independent of quota availability. No firmware/schema changes.

Validation: focused21PASS; fullbackend462PASS5SKIP0FAIL; lint/typecheckPASS. Changed files formatted. AGY requested gemini-3.7-flash-medium, PASS, no actionable findings; observed model identity absent. Conversation63f2f548-ba91-444f-966b-3ea747d78ae4; packet35c381003633192240c114d93fd0d3a45134bd43be770f16a43717dba5ba717f. CLI pinned ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb verified pre/post. Review mentions PTY test coverage: PTY validated live, deterministic tests cover parser/freshness only.

Deployed helper restarted PID28076, original saved/private/tmp/slate-grok-helper-before.ts. Backend overlay slate:grok-quota-20261010 sha256:a785fe8fc5f18f70ac44348b666f5882484c60f80ae842cd468a03b565d25dd0; production provider hash and healthPASS; frontend/data/compose retained, rollback override saved in/mnt/ssd-tmp/slate-tools/grok-quota-20261010. OnlySlate service recreated.

Verified repaired helper observation01:11:49.522Z; stored backend render01:12:08.255Z, next01:17:08.255Z, no error, Grok3%used97%remaining, Oct15at6:56PM. Existing device polling300s unchanged. Physical screen not observed; no flash necessary.

Security: approved CLI OAuth only, no tokens printed/copied or static keys introduced. No merge/tag/release.
