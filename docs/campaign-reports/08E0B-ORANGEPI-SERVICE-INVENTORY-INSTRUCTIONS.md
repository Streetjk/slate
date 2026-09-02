# Campaign 8E0B — Orange Pi service/package inventory before further storage action

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

Purpose: produce a human-readable inventory of installed/running services, Docker workloads, large packages, and major disk consumers on `note4-orangepi` so the operator can decide what, if anything, may be removed. This stage is read-only except for writing the resulting report to GitHub.

## Policy / isolation

Newest routing policy applies: Luna bounded worker; Grok 4.6 independent reviewer where review is required; Gemini 3.7 Flash review/shadow blackout remains in force until its recorded expiry. Do not use OpenRouter as a fallback.

Do not remove, disable, stop, uninstall, resize, prune, vacuum, or mutate any service/package/image/file in this stage. Do not install Google Cloud CLI yet. Do not flash NOTE4, merge PR #2, change production `.env`, billing, credentials, model selection, Tailscale/Funnel, MySQL/Slate persistent data, or Campaign 6D/PR #1/PR #3.

## Inventory to collect

On the Orange Pi collect and summarize:

```bash
hostnamectl
uname -a
cat /etc/os-release

df -h /
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINTS,MODEL

systemctl list-units --type=service --state=running --no-pager
systemctl list-unit-files --type=service --state=enabled --no-pager

ss -lntup

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
docker image ls --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}'
docker system df -v

snap list 2>/dev/null || true
flatpak list 2>/dev/null || true

apt-mark showmanual

dpkg-query -Wf='${Installed-Size}\t${Package}\n' | sort -n | tail -100

sudo du -xhd1 / 2>/dev/null | sort -h
sudo du -xhd1 /var /usr /opt /home 2>/dev/null | sort -h
sudo du -xhd1 /var/lib /var/lib/docker /var/log /usr/lib /usr/share 2>/dev/null | sort -h
```

If passwordless sudo is unavailable, run the non-sudo commands and clearly mark the missing sections rather than asking for or exposing the sudo password.

Also classify each running/enabled service into one of:

- REQUIRED_SLATE_RUNTIME
- REQUIRED_OS_NETWORKING
- REQUIRED_TAILSCALE_FUNNEL
- LIKELY_OS_CORE
- OPTIONAL_ADMIN_TOOL
- OPTIONAL_APPLICATION
- UNKNOWN_NEEDS_HUMAN_REVIEW

Do not infer removability solely from package/service name. Include what appears to depend on it and whether it is listening on a port.

## Output

Append a concise table to `docs/campaign-reports/08-GEMINI-35-LIVE.md` with:

- service/package/component;
- running/enabled status;
- approximate installed/disk size where available;
- network port(s) if any;
- classification;
- evidence-based note on likely purpose;
- `REMOVAL_RECOMMENDATION` limited to one of `KEEP`, `CANDIDATE_FOR_HUMAN_REVIEW`, `UNKNOWN`.

Do not mark anything `SAFE_TO_REMOVE` in this stage.

Also list the top 20 largest installed Debian packages and the top-level largest filesystem consumers.

Update `CAMPAIGN-STATE.md` with `ORANGEPI_SERVICE_INVENTORY=COMPLETE` and the current exact free-space bytes.

Commit/push the report and stop for human review. No deletion or service changes are authorized by this directive.
