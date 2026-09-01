# Campaign 6E — Connection Verification + Safe Snap Revision Cleanup

Date: 2026-09-01 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `integration/note4-custom`

## User-confirmed boundary

The user has completed the NOTE4 connection/setup flow and entered the permanent Server Address:

`https://orangepi5.tail6aabef.ts.net`

Treat this as authorization to resume Campaign 6E A0 verification. Do **not** factory-reset or re-register the device unless evidence proves the existing device identity is invalid and a separate human authorization is obtained.

## Controller/orchestration

Codex remains the controller, sole integrator, and production-write authority. Existing worker-model overrides may be used only as already authorized. AGY remains the required read-only reviewer when product source/config changes are made.

Before work:

1. `git fetch origin` and reconcile to the live `integration/note4-custom` branch.
2. Read `AGENTS.md`, `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`, `docs/campaign-reports/CAMPAIGN-STATE.md`, `docs/campaign-reports/06E-PUBLIC-HTTPS-ROAMING.md`, `docs/campaign-reports/06E-SERVICE-ADDRESS-AND-DISK-AUDIT-INSTRUCTIONS.md`, and this directive.
3. Verify live HEAD and a clean or intentionally understood working tree.

## Phase V0 — verify NOTE4 after Server Address migration

Verify the connection setup rather than assuming it succeeded:

- confirm Funnel still maps `orangepi5.tail6aabef.ts.net:443 / -> http://127.0.0.1:3001`;
- confirm public HTTPS `/healthz` PASS;
- confirm Slate Web UI PASS;
- confirm Slate/MySQL containers are healthy;
- confirm the existing NOTE4 device identity/pairing is preserved, without printing or recording the device secret;
- confirm a valid paired-device poll/sync reaches the backend through the public HTTPS hostname;
- if feasible without another human action, perform an off-LAN test using a genuinely different Internet path. Do not claim off-LAN success from the same LAN/Tailscale client path;
- do not re-register the NOTE4 if the existing pairing works.

If the NOTE4 appears unpaired or fails authentication, first diagnose whether the server URL migration accidentally cleared identity state. Do not factory-reset automatically.

## Phase S0 — inventory Snap before deletion

The prior audit found approximately 1.845 GB of disabled Snap revisions. Before deleting anything, capture:

- `df -h /`
- `df -B1 /`
- `du -sh /var/lib/snapd 2>/dev/null || true`
- `snap list --all`
- exact active and disabled revisions per snap
- `systemctl --failed --no-pager`

Build an explicit deletion candidate list containing **only** rows where `snap list --all` marks the revision as `disabled`.

Hard rule: never delete the active/current revision of any snap.

## Phase S1 — safe disabled-revision removal

Removal is authorized only for revisions mechanically confirmed as disabled by `snap list --all` immediately before deletion.

For each disabled revision, use the supported Snap command:

`sudo snap remove <snap-name> --revision=<revision>`

Do not manually delete files under `/var/lib/snapd/snaps`, `/snap`, or Snap state directories.
Do not remove the Snap daemon or uninstall active snaps merely to save space.
Do not use broad wildcards against Snap state.
Do not alter bootloader, kernel, Armbian package state, Tailscale state, Docker state, Slate/MySQL data, or SSH configuration.

If sudo requires a human password, STOP only for the minimal sudo authorization action and provide the exact command(s) to run. Never request, record, or expose the password.

After each removal, verify the command succeeded. If Snap reports a revision is active, required, unavailable, or otherwise not removable, leave it untouched and continue with other clearly disabled revisions.

## Phase S2 — optional apt cache cleanup

If sudo authorization is already available during this same session, the previously identified apt archive cache is also authorized for safe package-cache cleanup using standard package-manager commands only:

- inspect `du -sh /var/cache/apt/archives` first;
- `sudo apt-get clean` is allowed;
- do not run `apt autoremove`, remove installed packages, or change repositories as part of this campaign.

This phase is optional; Snap disabled-revision cleanup is the primary target.

## Phase S3 — post-cleanup validation

After cleanup record:

- `snap list --all` and confirm no intended active revision was removed;
- `du -sh /var/lib/snapd`;
- `df -h /` and `df -B1 /`;
- Slate/MySQL container health;
- local Slate `/healthz`;
- public Funnel `/healthz`;
- Funnel status;
- Tailscale service state;
- `systemctl --failed --no-pager`.

If any service regression appears, stop and report before doing further cleanup.

## Reporting

Update:

- `docs/campaign-reports/06E-PUBLIC-HTTPS-ROAMING.md`
- `docs/campaign-reports/CAMPAIGN-STATE.md`

The report must include:

- start/end SHA;
- Server Address migration verification result;
- pairing preserved YES/NO/UNVERIFIED;
- public HTTPS device sync result;
- off-LAN result, explicitly distinguishing true off-LAN evidence from same-LAN evidence;
- Snap size before/after;
- exact disabled revisions removed (package name + revision only; no secrets);
- active revisions preserved;
- apt cache before/after if cleaned;
- root free space before/after in bytes and human-readable form;
- Slate/MySQL/Tailscale/Funnel health after cleanup;
- any sudo/human boundary encountered.

Commit and push report/state before stopping. Verify remote branch HEAD.

## Stop / continue rules

Continue automatically through all read-only checks and any cleanup for which sudo is already available.

STOP only for:

- required sudo password entry;
- physical/off-LAN human action that cannot be performed by Codex;
- evidence that pairing was lost and re-registration/factory reset would be required;
- any unexpected active Snap dependency or service regression;
- credential/OAuth boundary already defined by Campaign 6E;
- any destructive action outside this directive.

Do not flash firmware, alter Campaign 6D measurements, begin Airtable/Gantt, remove active Snap revisions, or factory-reset the NOTE4.
