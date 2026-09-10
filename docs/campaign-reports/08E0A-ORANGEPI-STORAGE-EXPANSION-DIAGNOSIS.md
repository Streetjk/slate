# Campaign 8E0A — Orange Pi storage expansion diagnosis

Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

This directive follows Campaign 8E0. Current root free space is `1697796096` bytes on `/dev/mmcblk1p1`, below the `2000000000`-byte Google Cloud CLI safety gate by `302203904` bytes.

Newest temporary routing policy remains binding:

- bounded worker: Luna;
- independent reviewer: Grok 4.6 via the existing authenticated Grok CLI/session;
- Gemini 3.7 Flash review/shadow calls remain blocked until `2026-09-06T02:00:00+08:00`;
- no OpenRouter fallback or new static credentials.

## Objective

Determine whether the Orange Pi root filesystem can be safely expanded using already-present unallocated capacity on the boot device, without deleting more Slate state or installing Google Cloud CLI yet.

This stage is **diagnostic only**. Do not resize a partition, filesystem, LVM/PV, device, or image without a later explicit human authorization if any destructive or irreversible step is required.

## Preserve exactly

- current deployed backend image/tag `slate-note4:campaign8-voice-routing-121622c`;
- rollback image/tag `slate-note4:rollback-before-campaign8-948934c`;
- Slate/MySQL persistent data and mounts;
- production `.env` and compose state;
- Tailscale/Funnel state;
- NOTE4 pairing/server address/device secret;
- all firmware artifacts and rollback evidence.

Do not flash firmware, install gcloud, enable billing/APIs, create credentials, merge PR #2, or touch Campaign 6D/PR #1/PR #3.

## D0 — map the physical/storage layout

Run non-destructive inspection only:

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,FSVER,MOUNTPOINTS,PARTLABEL,PARTUUID,UUID
findmnt -no SOURCE,FSTYPE,OPTIONS /
df -hT /
df -B1 /
sudo fdisk -l
sudo parted -l
sudo blockdev --getsize64 /dev/mmcblk1 2>/dev/null || true
sudo sfdisk -d /dev/mmcblk1 2>/dev/null || true
```

If the root device is not `/dev/mmcblk1p1`, stop and report the actual topology before proceeding.

Determine:

1. total physical capacity of `/dev/mmcblk1`;
2. start/end/size of partition 1;
3. whether unallocated capacity exists after the root partition;
4. filesystem type on `/`;
5. whether the filesystem supports online growth;
6. whether the partition table layout permits safe in-place extension of partition 1;
7. whether any other partition lies immediately after the root partition;
8. whether Armbian provides a supported root-filesystem resize mechanism for this exact layout.

Do not assume a nominal 16 GB card/eMMC means the partition can be grown. Use exact sector/byte evidence.

## D1 — choose one outcome

### Outcome A — safe existing unallocated capacity is available

If partition 1 is the final partition, there is contiguous unallocated space after it, and the filesystem/layout support online expansion, report the exact maximum additional capacity and the least-destructive supported expansion method.

Do **not** execute the resize yet unless the operation is clearly non-destructive and already authorized by existing Armbian first-boot/resize policy. If there is any doubt, stop with:

```text
STORAGE_EXPANSION_PATH=AVAILABLE_NEEDS_HUMAN_AUTH
```

Provide the exact command sequence that would be run after authorization and explain whether a reboot is required.

### Outcome B — filesystem is already using the full physical device

If no material unallocated capacity exists, report:

```text
STORAGE_EXPANSION_PATH=NO_UNALLOCATED_CAPACITY
```

Then identify the next safest capacity option without deleting protected Slate state, such as migrating Docker data to a larger attached device or replacing/cloning the boot medium. Do not execute migration automatically.

### Outcome C — layout is ambiguous or unsafe

If another partition follows root, the partition table is unusual, filesystem state is inconsistent, or expansion would require moving partitions, report:

```text
STORAGE_EXPANSION_PATH=UNSAFE_OR_AMBIGUOUS
```

Stop. Do not improvise partition surgery.

## D2 — health preservation

After inspection, verify nothing changed:

- `slate-note4` healthy;
- `slate-note4-mysql` healthy;
- local/public `/healthz` PASS;
- Tailscale/Funnel healthy;
- current and rollback images present;
- root free bytes unchanged except ordinary runtime drift;
- NOTE4 authenticated polling still healthy when naturally observed;
- firmware, ADC, billing, credentials, production model/config unchanged.

Publish findings to `08-GEMINI-35-LIVE.md` and `CAMPAIGN-STATE.md`.

Do not install Google Cloud CLI until the root free-space gate reaches at least `2000000000` bytes.
