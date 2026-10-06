# Slate permanent service watchdog — 6 October 2026

Base: 9a116a9f638a9c49c8849b6408633a10fbe6cec3.
Branch: fix/wifi-auto-recovery.
Campaign instructions: 08501bb3ca75739e43fbf4f54811e0243ca5d193.
User explicitly authorized repair and deployment.

## Repair and execution

One host-side check per minute: three HTTP failures restart only slate-note4.
An AI Usage job is stale only after its due time exceeds the 15-minute grace,
its last successful run predates that due time (or is absent), and its lease
is absent or expired. Missing/malformed/query-error observations do not restart.
Disabled background workers are skipped. The query uses the production adapter
and runs in /app/backend with the complete Bun script as one argument.

Docker queries, diagnostics, restart and verification have finite bounds.
A 10-minute attempt cooldown prevents storms even when restart fails; the
successful restart timestamp updates only after Docker succeeds. A flock
prevents overlap. Diagnostics omit container logs, host journals, environment
and credentials. Diagnostic retention is 20 files; the main log rotates at 1 MiB.

## Deployment

Orange Pi user pi already has Docker access. sudo requires interactive authority,
and the user systemd manager has Linger=no. The active, boot-enabled system cron
daemon therefore runs the watchdog from pi's crontab. No privilege changes,
root units, host reboot, Docker daemon restart or MySQL restart were needed.
The prior untracked systemd candidate is preserved and is not deployed.

Runtime:
- /home/pi/.local/lib/slate-watchdog/slate-service-watchdog.sh (0500)
- /home/pi/.local/lib/slate-watchdog/slate-watchdog-policy.mjs (0400)
- /home/pi/.local/state/slate-service-watchdog (0700)
- logs below that state directory (0700)
- cron: every minute, explicit paths/environment, pi account.

Deployed SHA-256:
- script: d310b4d0f4e5348c71362b81f8462ed0d75acaefe01c636574ac5757ed00f69d
- policy: d2714699c2a77e9e377f543768c810422002ca1342bbcbb8f38596d970b72f34

## Validation and review

- Bash syntax passed.
- 10 mocked Linux recovery scenarios passed on the Pi, using isolated temporary
  state and fake curl/Docker, including exact query argv, failed restart timestamp,
  cooldown, query failure and failed post-restart verification.
- 12 pure scheduler timestamp cases passed.
- Live production database query returned AI_SCHEDULER_OK without restarting.
- Independent packet-only AGY review: SUCCESS, PASS, no findings.
- Requested model: gemini-3.7-flash-medium; no observed model ID was returned.
- Verified CLI 1.2.13 SHA-256:
  ef3728208834483754b06fd99963b4b6320740bf237212768dfed5256ae24ddb.
- Packet SHA-256: eb40559c1f679517ff901578f7f89817965321d739d15c8a81d1f7ac5cdfea20.
- Conversation: a607bf11-47e4-4b0e-acd6-5e18d8fa2a3b.
- Initial review response was discarded after CLI auto-update changed its bytes.
  Repeat used an isolated copy in a non-writable directory; pre/post hash matched.

Controlled production recovery at 12:43 AWST used three injected curl failures,
then normal curl for verification. Exactly one real slate-note4 restart occurred.
Healthy verification succeeded at 12:43:48, about 12 seconds after detection.
MySQL StartedAt matched exactly before/after. A normal subsequent check reported
AI_SCHEDULER_OK. Cron installed at 12:44:14 AWST.

## Rollback and limits

Remove only the watchdog cron line, or restore
/home/pi/.local/state/slate-service-watchdog/crontab-before.txt if no later cron
changes exist. This disarms recovery without restarting services.

This watchdog recovers the backend and scheduler while the host/cron/Docker
control path can execute. It cannot recover an OS-wide stall. It does not repair
a device redraw problem or supervise the separate Mac helper.
No firmware flash, device reset, serial, Wi-Fi/OAuth, merge or release occurred.

First unattended cron execution verified at 12:45:02 AWST: AI_SCHEDULER_OK.
All three Slate/backend-helper/MySQL containers remain healthy.
Deployment source commit: 644d0bb.
