# Campaign 8E0E — OpenVPN + LLVM audit and conditional removal

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2
Date: 2026-09-02 AWST

## User intent

Before moving Slate/MySQL onto the NVMe, determine whether OpenVPN and the large LLVM runtime packages are actually required on the Orange Pi. Remove only components proven unnecessary. Recheck root space and service health afterward. Do not touch the NVMe in this stage.

## Accepted checkpoint

```text
NORDVPN_REMOVED=PASS
ROOT_FREE_BYTES=2040111104
ORANGEPI_STORAGE_GATE=PASS
SLATE_HEALTH=PASS
MYSQL_HEALTH=PASS
TAILSCALE=PASS
FUNNEL=PASS
NOTE4_POLLING=PASS
NVME_CHANGED=NO
```

Current model-routing policy remains binding:

- Codex controller / sole integrator.
- Luna bounded worker when useful.
- Grok 4.6 via authenticated Grok CLI/session is independent reviewer when required.
- Gemini 3.7 Flash review/shadow calls remain blocked until `2026-09-06T02:00:00+08:00` unless superseded.

## Hard protections

Do not remove or disable:

- Tailscale / `tailscaled`;
- Docker / containerd / runc;
- Slate or MySQL containers/data;
- Deluge / Deluge Web;
- Samba, CUPS, desktop/VNC, Mesa, X/Wayland, NetworkManager, or graphics packages as collateral damage;
- kernel/Armbian packages;
- firmware/toolchain packages merely because they are large;
- any package whose simulated removal pulls additional non-target packages;
- any package with unresolved ownership/use.

Do not run broad `apt autoremove` in this stage.
Do not move Slate/MySQL data.
Do not repartition/remount/format the NVMe.
Do not install gcloud yet.
Do not flash firmware or merge PR #2.

---

# Phase A0 — baseline health + package inventory

Record:

```bash
df -B1 /
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
curl -fsS http://127.0.0.1:3001/healthz
systemctl is-active tailscaled.service
systemctl is-active openvpn.service || true
systemctl is-enabled openvpn.service || true
systemctl list-units 'openvpn*' --all --no-pager || true
systemctl list-unit-files 'openvpn*' --no-pager || true

dpkg-query -W -f='${Package}\t${Version}\t${Installed-Size}\t${db:Status-Abbrev}\n' \
  openvpn network-manager-openvpn network-manager-openvpn-gnome libllvm19 libllvm20 2>/dev/null || true
apt-mark showauto | grep -E '^(openvpn|network-manager-openvpn|network-manager-openvpn-gnome|libllvm19|libllvm20)$' || true
```

Preserve before/after root free bytes.

---

# Phase A1 — OpenVPN usage proof

Determine whether OpenVPN has any real configured user/workload.

Inspect without revealing credentials/private keys:

```bash
systemctl cat openvpn.service 2>/dev/null || true
systemctl list-units 'openvpn-client@*' 'openvpn-server@*' --all --no-pager || true
systemctl list-unit-files 'openvpn-client@*' 'openvpn-server@*' --no-pager || true
find /etc/openvpn -maxdepth 3 -type f -printf '%p\n' 2>/dev/null | sed -E 's#(.*)#FILE=\1#'
nmcli -t -f NAME,TYPE connection show 2>/dev/null | grep -E ':(vpn|wireguard)$' || true
ps -ef | grep -E '[o]penvpn' || true
ss -lntup | grep -i openvpn || true
```

Do **not** print file contents, certificates, keys, usernames, passwords, remote endpoints, or connection secrets.

Also inspect package relationships:

```bash
apt-cache rdepends --installed openvpn 2>/dev/null || true
apt-cache rdepends --installed network-manager-openvpn 2>/dev/null || true
apt-get -s remove --purge openvpn 2>&1
```

### OpenVPN removal gate

`openvpn` may be classified `SAFE_TO_REMOVE` only if all are true:

1. no running OpenVPN process/client/server instance;
2. no active `openvpn-client@` / `openvpn-server@` unit;
3. no configured `.conf` / client/server profile indicating current use, OR any files present are clearly package samples rather than user profiles;
4. no NetworkManager VPN connection depends on OpenVPN;
5. simulated `apt-get remove --purge openvpn` removes only `openvpn` itself (plus package-owned config), not Tailscale/NetworkManager/Slate/Deluge/desktop/graphics or other unrelated packages;
6. no current Slate/NOTE4 route relies on it.

If any uncertainty remains, classify `OPENVPN=KEEP_UNCERTAIN` and do not remove.

If `SAFE_TO_REMOVE` but sudo is unavailable to Codex, stop with the exact minimal human command:

```bash
sudo systemctl stop openvpn.service || true
sudo systemctl disable openvpn.service || true
sudo apt-get remove --purge -y openvpn
```

Do not include `autoremove`.

If Codex has legitimately available sudo in the current session, removal is authorized only after the above gate passes.

After removal, verify Tailscale/Funnel/Slate/MySQL/NOTE4 health before continuing.

---

# Phase A2 — LLVM ownership and dependency proof

Treat `libllvm19` and `libllvm20` independently. A library being large is not sufficient reason for removal.

Inspect:

```bash
apt-cache policy libllvm19 libllvm20
apt-cache rdepends --installed libllvm19 2>/dev/null || true
apt-cache rdepends --installed libllvm20 2>/dev/null || true
apt-mark showauto | grep -E '^libllvm(19|20)$' || true
apt-get -s autoremove 2>&1
apt-get -s remove libllvm19 2>&1
apt-get -s remove libllvm20 2>&1
```

Also identify installed packages with direct dependency relationships where practical:

```bash
dpkg-query -W -f='${binary:Package}\t${Depends}\n' | grep -E 'libllvm(19|20)' || true
```

Check whether active binaries/processes map the libraries, if available without invasive scanning:

```bash
ldconfig -p | grep -E 'LLVM-(19|20)|libLLVM-(19|20)' || true
for p in $(pgrep -d' ' -f 'Xorg|Xwayland|lightdm|vnc|weston|mesa|deluge|dockerd|containerd' 2>/dev/null); do
  grep -E 'libLLVM-(19|20)' /proc/$p/maps 2>/dev/null && echo "PID_USES_LLVM=$p" || true
done
```

Do not kill processes.

### LLVM removal gate

For each library separately:

- `SAFE_TO_REMOVE` only if it is auto-installed/orphaned **and** the simulated removal selects no additional installed package except that exact library (or clearly disposable package remnants already independently proven unused).
- If simulation removes `mesa-*`, Vulkan/OpenGL, desktop/VNC, WebKit, compiler/toolchain, Docker, Tailscale, Deluge, Slate dependencies, or any other currently installed non-target package, **KEEP** it.
- If an active process maps the library, **KEEP** it.
- If dependency evidence is ambiguous, **KEEP** it.

Important expected possibility from the prior NordVPN removal output:

```text
libllvm19
libglapi-mesa
libxcb-dri2-0
```

were reported by APT as auto-installed and no longer required. This is only a lead, not removal proof. Inspect the full simulated autoremove and package relationships first.

`libllvm20` was not reported as orphaned in that output and should be presumed required unless evidence proves otherwise.

### Conditional removal

If `libllvm19` alone is proven orphaned and safe:

```bash
sudo apt-get remove --purge -y libllvm19
```

If the exact trio `libllvm19 libglapi-mesa libxcb-dri2-0` is proven orphaned by `apt-get -s autoremove`, has no installed reverse dependencies, and its removal does not affect any active graphics/desktop/VNC workload, report the exact proposed command and require human sudo execution rather than broad autoremove.

Do not remove `libllvm20` unless it independently passes the strict gate above.

---

# Phase A3 — post-removal verification

After any authorized removal, verify:

```bash
df -B1 /
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
curl -fsS http://127.0.0.1:3001/healthz
systemctl is-active tailscaled.service
curl -fsS https://orangepi5.tail6aabef.ts.net/healthz
```

Observe a fresh authenticated NOTE4 poll if naturally available.

Confirm Deluge services remain unchanged.

Record exact reclaimed bytes where measurable.

---

# Phase A4 — decision before NVMe migration

Recompute root free space after safe package cleanup.

Use these states:

```text
OPENVPN=KEEP_REQUIRED|KEEP_UNCERTAIN|SAFE_TO_REMOVE|REMOVED
LIBLLVM19=KEEP_REQUIRED|KEEP_UNCERTAIN|SAFE_TO_REMOVE|REMOVED
LIBLLVM20=KEEP_REQUIRED|KEEP_UNCERTAIN|SAFE_TO_REMOVE|REMOVED
ROOT_FREE_BYTES=<exact>
SLATE_HEALTH=PASS|FAIL
MYSQL_HEALTH=PASS|FAIL
TAILSCALE=PASS|FAIL
FUNNEL=PASS|FAIL
NOTE4_POLLING=PASS|NOT_OBSERVED|FAIL
NVME_CHANGED=NO
```

If root free space becomes comfortably sufficient for gcloud/runtime headroom, recommend leaving Slate/MySQL on root and using NVMe only for future bounded staging/backups.

If root pressure still warrants a move, stop and recommend resuming the bounded NVMe Slate-directory plan in a separate stage.

Do not begin the NVMe migration automatically from this directive.