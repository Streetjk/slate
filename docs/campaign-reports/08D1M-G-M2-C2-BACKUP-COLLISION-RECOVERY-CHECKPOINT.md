# Campaign 8D1M-G — C2 backup collision checkpoint

Operator second attempt result:

```text
M2_ROOT_STEP_V1 stage=preflight status=FAIL class=BACKUP_COLLISION
```

This is a pre-mutation fail-closed result. The fixed backup directory from the prior failed/rolled-back C2 attempt remains present and V2 correctly refuses to overwrite it.

Recovery authority is defined in:

`docs/campaign-reports/08D1M-G-M2-C2-BACKUP-COLLISION-RECOVERY.md`

Required next work is read-only attribution/revalidation, then preservation of the prior backup by atomic rename and one combined manual root boundary using unchanged exact reviewed V2. No deletion or blind rerun.

PR #2 remains open/draft/unmerged.
