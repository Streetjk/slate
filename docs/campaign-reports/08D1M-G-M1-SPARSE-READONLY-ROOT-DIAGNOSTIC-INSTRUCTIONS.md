# Campaign 8D1M-G — M1 sanitized read-only root diagnostic

Date: 2026-09-05 (Australia/Perth)
Repository: `Streetjk/slate`
Branch: `feature/gemini-35-live-evaluation`
PR: #2

## Purpose

Resolve the V7 `COPY_SPARSE_FILE_COUNT_MISMATCH` without rerunning V7 or mutating Docker state.

Current accepted state:

```text
DOCKER_ROOT=/var/lib/docker
SLATE=running/healthy
MYSQL=running/healthy
LOCAL_PUBLIC_HEALTH=HTTP_200
ORIGINAL_ROOT_PRESENT=YES
NVME_COPY_PRESENT=YES
V7_RERUN=NO
V8_STATUS=BLOCKED_PATH_LEVEL_METADATA_UNAVAILABLE
```

The operator may perform exactly one sanitized **read-only** sudo diagnostic prepared by Codex. This grants no Docker stop/restart, data-root switch, file mutation, provider call, firmware flash, credential access, or PR merge authority.

## Required diagnostic behavior

Codex must prepare a versioned script under `/home/pi/`, validate it, publish its SHA-256, and give the operator exactly one `ssh -t ... sudo ...` command.

The diagnostic must be read-only and must not print file contents, credential values, database contents, application payloads, raw Docker metadata blobs, or private transcript/audio data.

It may read only filesystem metadata necessary to classify the V7 sparse-count difference:

- source `/var/lib/docker` and destination `/mnt/ssd-tmp/slate-tools/docker-data` filesystem/device identity;
- regular-file relative-path identity represented by a stable SHA-256 of the relative path rather than plaintext path where practical;
- logical size (`stat %s`);
- allocated blocks (`stat %b`);
- mode, uid, gid, link count where needed;
- sparse classification derived from size vs allocated blocks;
- extent/allocation summary only if safely available, without file content;
- source/destination file-count and path-set comparison;
- a root `rsync -aHAXS --numeric-ids --checksum --delete --dry-run --omit-dir-times --itemize-changes` comparison, reporting only sanitized count/change-class evidence and whether the result is empty. Do not perform the real rsync.

Because the live source can change while Docker is running, classify the result carefully:

- if source/destination content-equivalence dry-run is empty and the only difference is allocation/sparse representation, publish `SPARSE_DIFFERENCE=REPRESENTATION_ONLY`;
- if the dry-run is non-empty because the live source has legitimately changed since the V7 rollback, do not treat that alone as proof of a bad V7 copy. Use the preserved V7 aggregate equality evidence plus path-level allocation metadata to determine whether the sparse-count mismatch itself is representation-only;
- if any evidence suggests a real ownership/mode/ACL/xattr/hardlink/symlink/content mismatch attributable to the V7 copy, publish `SPARSE_DIFFERENCE=NOT_PROVEN_SAFE` and stop.

The diagnostic must not stop Docker, restart containers, write temporary files inside either Docker tree, alter daemon configuration, delete files, or touch Deluge data.

## Routing

```text
CONTROLLER=CODEX
WRITER=GEMINI_3_8_FLASH
INDEPENDENT_REVIEWER=GROK_4_6
```

Gemini 3.8 Flash may draft the diagnostic script. Codex must validate and install it. Grok review is not required for the read-only diagnostic itself unless Codex finds nontrivial risk, but exact Grok 4.6 review remains mandatory for any V8 migration script.

## Continuation

After the operator runs the diagnostic:

1. Codex must ingest only the sanitized output and publish the evidence.
2. If `SPARSE_DIFFERENCE=REPRESENTATION_ONLY`, prepare V8 where sparse count is diagnostic-only while the checksum/itemized rsync dry-run remains authoritative.
3. Validate V8, obtain exact Grok 4.6 review, perform bounded fixes/re-review without stopping.
4. Install the exact reviewed V8, verify remote SHA/type/mode/bash syntax, arm the observer, push checkpoint, then give the operator one new sudo command.
5. On M1 PASS continue automatically through M2 -> M3 -> M4 under the already-authorized long-run envelope.

Do not rerun V7. Keep PR #2 open/draft/unmerged. Checkpoint pushes are not stops.

## Codex installation checkpoint

The sanitized diagnostic is installed but has not been executed:

```text
DIAGNOSTIC_SCRIPT=/home/pi/slate-m1-sparse-readonly-root-diagnostic-v1.sh
DIAGNOSTIC_SCRIPT_SHA256=ffb42c0cee064186a097d96a079b6f6d8e03939df4f6630e3bc37bbb8958aa5b
```

The remote copy is a regular file, mode 700, and passes `bash -n`. Production
Docker/MySQL and local/public health were rechecked healthy with both Docker
trees preserved. The operator must run only the one command handed off by
Codex; V8 remains blocked until sanitized output is ingested.
