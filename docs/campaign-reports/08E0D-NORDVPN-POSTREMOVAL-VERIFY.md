# Campaign 8E0D — NordVPN post-removal verification

User has completed the authorized NordVPN removal on Orange Pi:

```text
sudo systemctl stop nordvpnd.service || true
sudo systemctl disable nordvpnd.service || true
sudo apt-get remove --purge -y nordvpn
```

Observed human terminal result:

- `nordvpnd.service` disabled successfully.
- `nordvpn 4.0.0` removed and purged.
- apt reported ~96.0 MB freed.
- apt suggested `libglapi-mesa`, `libllvm19`, and `libxcb-dri2-0` as auto-removable.
- `apt autoremove` has NOT been authorized. Do not run it.

## Immediate verification

Codex must now perform read-only checks on Orange Pi:

```bash
df -B1 /
df -h /
systemctl is-enabled nordvpnd.service || true
systemctl is-active nordvpnd.service || true
dpkg-query -W -f='${Status} ${Package}\n' nordvpn 2>/dev/null || true
systemctl is-active tailscaled.service
tailscale status
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/healthz
curl -fsS -o /dev/null -w '%{http_code}\n' https://orangepi5.tail6aabef.ts.net/healthz
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

Also re-check a naturally occurring NOTE4 authenticated poll if visible without disturbing the device.

## Storage gate

If root free bytes are now >= 2,000,000,000:

```text
ORANGEPI_STORAGE_GATE=PASS
```

Do NOT move Slate/MySQL data yet. The current 8E0C assessment found only ~229 MiB of MySQL data and negligible Slate blob data, so NVMe migration is not justified solely to cross the gcloud gate if NordVPN removal already solves it.

Keep the NVMe policy recommendation for future growth:

```text
RECOMMENDED_SLATE_NVME_MODEL=directory_policy
RECOMMENDED_SLATE_NVME_CAP_GB=10
RECOMMENDED_DELUGE_RESERVED_FREE_GB=180
```

Do not repartition, enable quotas, change Deluge paths, move Docker data-root, or move Slate/MySQL in this stage.

## Auto-removable package caution

Do not run `apt autoremove` automatically. First inspect reverse dependencies and installed-size for:

- `libglapi-mesa`
- `libllvm19`
- `libxcb-dri2-0`

These may be harmless orphaned graphics/LLVM dependencies, but removal is a separate decision and is not needed if the 2 GB gate now passes.

## If storage gate passes

Return to Campaign 8D1 / 8E long-run flow. The next human-owned step remains Google Cloud/Vertex ADC setup. Do not install gcloud until post-removal health checks pass.

## Required checkpoint

```text
NORDVPN_REMOVED=PASS|FAIL
NORDVPN_SERVICE_ACTIVE=NO|YES
NORDVPN_SERVICE_ENABLED=NO|YES
ROOT_FREE_BYTES=<integer>
ORANGEPI_STORAGE_GATE=PASS|FAIL
SLATE_HEALTH=PASS|FAIL
MYSQL_HEALTH=PASS|FAIL
TAILSCALE=PASS|FAIL
PUBLIC_HEALTH=PASS|FAIL
NOTE4_POLLING=PASS|NOT_OBSERVED|FAIL
APT_AUTOREMOVE_EXECUTED=NO
SLATE_DATA_MOVE_EXECUTED=NO
NVME_CHANGED=NO
READY_FOR_GCLOUD_INSTALL=YES|NO
```

Preserve current Luna worker + Grok 4.6 reviewer routing policy and Gemini 3.7 Flash blackout. No firmware flash, merge, billing change, credential change, or production model change is authorized.