# Campaign 8E0F — libllvm19 post-removal verification

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Human action already completed

User manually ran on the Orange Pi:

```bash
sudo apt-get remove --purge -y libllvm19
```

Observed result supplied by the user:

- removed package: `libllvm19:arm64 (1:19.1.1-1ubuntu1~24.04.2)`
- APT reported about `125 MB` disk space freed
- `apt autoremove` was NOT run
- APT now reports `libglapi-mesa` and `libxcb-dri2-0` as automatically installed and no longer required; these remain unreviewed and MUST NOT be removed in this stage

## Objective

Verify the Orange Pi after libllvm19 removal and determine whether root-space pressure is now sufficiently reduced before any NVMe migration decision.

This stage is verification only.

## Required checks

Run non-destructive checks:

```bash
df -B1 /
df -hT /
dpkg -s libllvm19 2>/dev/null || true
dpkg -s libllvm20 2>/dev/null | sed -n '1,12p' || true
systemctl is-active tailscaled || true
systemctl is-enabled tailscaled || true
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/healthz
curl -fsS -o /dev/null -w '%{http_code}\n' https://orangepi5.tail6aabef.ts.net/healthz
```

Also confirm:

- `slate-note4` healthy;
- `slate-note4-mysql` healthy;
- Tailscale running;
- Funnel still maps Slate public HTTPS to local port 3001;
- naturally observed authenticated NOTE4 polling remains HTTP 201;
- `libllvm20` remains installed;
- no Mesa/X/VNC/WebKit/FFmpeg packages were removed by the libllvm19 action;
- no NVMe/Deluge path changed;
- no production environment, ADC, model, billing, OAuth, or firmware state changed.

## Package cleanup boundary

Do NOT run:

```bash
sudo apt autoremove
```

Do not remove `libglapi-mesa` or `libxcb-dri2-0` yet. If they are worth considering, first perform the same strict reverse-dependency + active-use + APT simulation audit used for libllvm19 and report the result for human review.

Keep OpenVPN as `KEEP_UNCERTAIN` from 8E0E unless a later explicit directive broadens the audit/removal scope.

## Decision after verification

Report exact root free bytes.

If root free space is comfortably above the 2,000,000,000-byte Google CLI gate, mark:

```text
LIBLLVM19_REMOVAL=PASS
ORANGEPI_STORAGE_GATE=PASS
NVME_MOVE_REQUIRED_FOR_IMMEDIATE_GCLOUD=NO
```

Do not interpret this as authorization to install gcloud or configure Vertex yet. Human Google project/account/billing/ADC actions remain separate boundaries.

If root free space remains marginal, report the exact headroom and recommend whether the previously assessed bounded NVMe directory policy should be used before gcloud installation.

## Hard boundaries

No:

- apt autoremove;
- OpenVPN removal;
- libllvm20 removal;
- NVMe repartition/format/remount;
- Slate/MySQL data move;
- Docker data-root move;
- gcloud installation;
- Google ADC login;
- billing/API changes;
- firmware flash;
- PR merge;
- Campaign 6D / PR #1 / PR #3 changes.

Update `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md` with the result and stop for human review.