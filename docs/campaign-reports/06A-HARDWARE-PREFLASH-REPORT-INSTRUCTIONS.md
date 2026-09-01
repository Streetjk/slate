# Campaign 6A — Publish Pre-Flash Hardware Evidence

Date: 2026-09-01
Repository: `Streetjk/slate`
Integration branch: `integration/note4-custom`
Status: ACTIVE ADDENDUM — REPORT ONLY

## Purpose

The Campaign 6 hardware directive required a local H0/H1 pre-flash evidence snapshot but did not explicitly require publishing the non-sensitive result to the GitHub control plane. This addendum closes that bookkeeping gap.

This addendum does **not** authorize flashing, erasing, eFuse changes, firmware writes, OAuth consent, or Airtable/Gantt work.

## Required action

1. Fetch origin and re-read:
   - `AGENTS.md`
   - `docs/campaign-reports/CAMPAIGN-INSTRUCTIONS.md`
   - `docs/campaign-reports/CAMPAIGN-STATE.md`
   - `docs/campaign-reports/06-HARDWARE-CHECKPOINT-INSTRUCTIONS.md`
   - this addendum.
2. If H0/H1 reconnaissance has already completed locally, use that exact evidence. Do not redo destructive or unnecessary operations merely to create the report.
3. If H0/H1 has not completed, perform only the non-destructive reconnaissance and factory-backup steps already authorized by Campaign 6, then stop before any write.
4. Create `docs/campaign-reports/06-HARDWARE-PREFLASH.md` containing the non-sensitive pre-flash evidence and verdict.
5. Update `CAMPAIGN-STATE.md` only enough to record the hardware pre-flash checkpoint status and next required action. Do not rewrite historical campaign evidence.
6. Commit and push the report/state update to `integration/note4-custom`.
7. Stop. Do not flash until a later explicit directive authorizes it.

## Required report content

Record, where available:

- exact report source/branch HEAD before publication;
- NOTE4 USB detected yes/no;
- serial transport type and port class, but redact local username/home-directory details;
- ESP32-S3 chip identity and revision;
- detected flash size and flash ID;
- Secure Boot state;
- Flash Encryption state;
- UART download/read/write restriction state;
- custom-flash safety verdict;
- whether factory flash was readable;
- whether complete factory backup succeeded;
- factory backup size and SHA-256;
- decoded factory partition layout where available;
- accepted Campaign 5 source SHA;
- verified custom full/app firmware hashes;
- `READY_TO_FLASH=true|false`;
- blockers, caveats, or uncertainty;
- exact commands/tools/versions used where useful for reproducibility.

## Privacy / repository hygiene

Do **not** commit:

- the factory firmware binary;
- OAuth tokens or credentials;
- full MAC/device identifiers unless already intentionally public and necessary;
- local usernames/home-directory paths;
- secrets from NVS or partition contents;
- generated firmware binaries.

Use redacted placeholders for sensitive local paths/identifiers while preserving hashes and technical evidence.

## Stop boundary

After the report/state commit is pushed, STOP at the pre-flash boundary.

No firmware write, erase, eFuse modification, or physical-pass claim is authorized by this addendum.
