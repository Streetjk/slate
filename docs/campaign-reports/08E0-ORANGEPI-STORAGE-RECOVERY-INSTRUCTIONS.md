# Campaign 8E0 — Orange Pi storage recovery before Google Cloud CLI

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This directive runs before Campaign 8E Vertex/ADC setup. Current Orange Pi root usage is approximately 95% of a 14 GB filesystem. Free space must be recovered conservatively before installing Google Cloud CLI or making further runtime changes.

## Authority and isolation

Codex remains controller and sole production writer/integrator. If a bounded worker is needed, use Claude Sonnet 5 through the authenticated Claude CLI only, per `08D-CLAUDE-SONNET5-WORKER-POLICY.md`. Do not use OpenRouter or an Anthropic API-key fallback.

Do not modify or flash NOTE4 firmware, do not merge PR #2, do not change Gemini model selection, do not enable billing, do not create credentials/API keys, and do not touch Campaign 6D, PR #1, or PR #3.

Preserve exactly:

- current deployed backend image/tag `slate-note4:campaign8-voice-routing-121622c`;
- rollback image/tag `slate-note4:rollback-before-campaign8-948934c`;
- running `slate-note4` and `slate-note4-mysql` containers;
- `/home/pi/slate-note4-deploy/slate-data`;
- `/home/pi/slate-note4-deploy/mysql-data`;
- production `.env` and compose state;
- Tailscale/Funnel configuration;
- device pairing/server address/device secret;
- all current firmware artifacts and rollback evidence.

Never run `docker system prune -a`, `docker volume prune`, or any broad cleanup that can remove required images, volumes, persistent data, or active Snap revisions.

## S0 — audit before deletion

Record non-secret evidence from the Orange Pi:

```bash
df -h /
df -B1 /
docker system df -v
docker ps -a --no-trunc
docker image ls --no-trunc
sudo du -xhd1 /var /home /opt 2>/dev/null | sort -h
sudo du -xhd1 /var/lib/docker /var/log /var/cache/apt 2>/dev/null | sort -h
sudo find /home/pi /tmp /var/tmp -xdev -type f \( -name '*.tar' -o -name '*.tar.gz' -o -name '*.tgz' -o -name '*.zip' \) -printf '%s %p\n' 2>/dev/null | sort -n | tail -50
sudo journalctl --disk-usage
```

Also inspect Docker container JSON logs by size without modifying them.

Classify storage into:

1. required current/rollback runtime;
2. persistent application/database data;
3. Docker build cache;
4. dangling/unreferenced image layers;
5. deployment-transfer archives no longer needed after successful image load;
6. package-manager cache;
7. journal/log growth;
8. temporary files;
9. unknown/needs-human-review.

Do not delete unknown large files merely because they are large.

## S1 — safest cleanup first

Perform only after S0 identifies the space source.

Allowed bounded cleanup, in this order:

1. Remove confirmed disposable deployment-transfer archives (`.tar`, `.tar.gz`, etc.) only when the corresponding loaded Docker image is already verified and the archive is not the sole rollback artifact.
2. Remove unused Docker build cache with a bounded builder-cache prune. This must not remove named images, running containers, or volumes. Record bytes reclaimed.
3. Remove dangling Docker image layers only; do not remove any named/required current or rollback image. Record before/after image inventory.
4. Run `sudo apt-get clean`.
5. Inspect journal size. If materially large, vacuum only old journal data to a conservative retained size (for example 100–200 MB), after recording current campaign diagnostics.
6. Remove stale ordinary files under `/tmp` and `/var/tmp` only when ownership/purpose is clear and they are not active sockets/runtime files.

Do not remove active Snap revisions. Previous Campaign 6E already removed explicitly disabled revisions; leave active Snap state alone.

## S2 — second-pass cleanup if still below target

Target:

- minimum acceptable free space before gcloud install: **2.0 GB**;
- preferred operating cushion: **3.0 GB or more**.

If free space remains below 2.0 GB after S1:

- enumerate every remaining Docker image and its image ID, tag, size, container references, and whether it is required;
- identify unreferenced historical campaign images that are not the current image and not the preserved rollback image;
- remove only those proven-unreferenced images individually by exact image ID/tag;
- do not remove Docker volumes;
- do not delete MySQL/Slate persistent data;
- do not remove the current candidate or rollback images;
- do not improvise destructive filesystem cleanup.

If safe deletions cannot produce at least 2.0 GB free, stop with `HUMAN_STORAGE_EXPANSION_REQUIRED=YES` rather than deleting required state.

## S3 — post-cleanup verification

After cleanup verify:

- root free bytes and percentage;
- Slate container healthy;
- MySQL container healthy;
- local `/healthz` PASS;
- public HTTPS `/healthz` PASS;
- Tailscale/Funnel still healthy;
- current image/tag still present;
- rollback image/tag still present;
- persistent mounts unchanged;
- production `.env` unchanged;
- NOTE4 authenticated polling still succeeds when observed naturally; do not extract or print the device secret just to force a poll;
- no firmware, credentials, billing, model, or OAuth state changed.

Publish exact before/after storage numbers and a list of what was removed to `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md`.

If `FREE_SPACE_BYTES >= 2000000000` and all health checks pass, set:

```text
ORANGEPI_STORAGE_GATE=PASS
READY_FOR_GCLOUD_INSTALL=YES
```

Then continue to the existing Campaign 8E / 8D1 Vertex setup directive. Installing Google Cloud CLI remains allowed only after this storage gate passes, and interactive Google authentication remains a human action.
