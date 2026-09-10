# Campaign 8D1M-G M4 — Reviewer role change: Grok 4.6

## Explicit operator authority

The operator explicitly authorizes replacing the currently blocked designated ZAI reviewer with Grok 4.6 for this campaign stage.

This is a reviewer-role governance change only. It does not authorize any provider/model change for Slate Voice AI, any credential disclosure, any merge/release, or any relaxation of existing validation/deployment gates.

```text
PR_NUMBER=2
PR_STATE_REQUIRED=OPEN
PR_DRAFT_REQUIRED=YES
PR_MERGED_REQUIRED=NO
REVIEW_TARGET_COMMIT=8a51da387f8c1ec058883031ef0603ae3da3af36
OLD_CANONICAL_REVIEWER=ZAI_GLM_5_3_FLASH
OLD_REVIEWER_STATUS=RETIRED_FOR_THIS_STAGE_AUTH_BLOCKED
NEW_CANONICAL_REVIEWER=GROK_4_6
GROK_MODEL_SELECTOR=grok-4.6
NO_ZAI_RETRY=true
NO_SILENT_REVIEWER_FALLBACK=true
```

## Reviewer route

Reuse the controller's established direct Grok CLI route. Prefer the already-proven local invocation pattern:

```text
grok -m grok-4.6
```

Run the review directly from the controller against the exact frozen candidate/worktree. Do not delegate the review back to the implementation model. Verify reviewer process/worktree provenance using the same controller practices already used in prior Grok canonical-review campaigns.

Do not expose, echo, commit, log, fingerprint, or copy Grok credentials. If the established Grok route is not authenticated, stop at that specific Grok-auth boundary rather than falling back to another reviewer.

## Exact independent review requirements

Review exactly commit:

```text
8a51da387f8c1ec058883031ef0603ae3da3af36
```

The review must be independent and read-only. Do not provide a desired verdict. Review the actual repair and its deterministic evidence, including at minimum:

- coalescing/nonblocking handling of redundant `kXiaozhiChanged` UI notifications;
- preservation of FIFO/non-coalesced user button events;
- preservation of one logical user bubble and one logical assistant bubble per turn;
- preservation of streaming behavior;
- bounded multi-turn queue/resource behavior;
- added per-turn latency/resource/reset instrumentation;
- exact `GEMINI_*` fail-closed deployment qualification;
- secret/privacy handling;
- regression risk to Japanese rendering, audio, websocket transport, and NOTE4 controls;
- whether the existing evidence is sufficient for bounded deployment and physical requalification.

The physical queue saturation was not captured in the consumed session, so the reviewer must not treat the backpressure mechanism as physically proven merely because the static/host soak supports it.

## Verdict handling

If Grok 4.6 returns PASS / candidate-ready with no blocking P0/P1/P2/security findings:

1. record the exact reviewer command/model/target and verdict;
2. preserve the frozen backend and firmware artifact identities;
3. continue automatically through exact backend deployment;
4. perform app-only firmware flash at the already-qualified application offset only;
5. verify hashes/artifact identity after deployment/flash;
6. run exact Gemini configuration fail-closed qualification;
7. requalify Slate/MySQL/local/public routes and secret mount status;
8. rearm the durable sanitized observer;
9. update `CAMPAIGN-STATE.md` and publish the new exact frontier;
10. request a physical test only after all safe nonphysical work is exhausted.

If Grok 4.6 returns REVISE:

- Codex must adjudicate the findings;
- send only accepted findings to the designated implementation worker;
- rerun deterministic validation, privacy/secret scan, exact build/freeze;
- obtain a fresh Grok 4.6 review of the new exact artifact before deployment.

If Grok 4.6 is unavailable/auth-blocked, record that exact boundary and do not fall back silently.

## Next physical acceptance after reviewed deployment

The next device boundary must be a multi-turn EN/JA Voice AI soak that checks:

- early-turn versus late-turn latency;
- no progressive UI lag/freeze;
- correct user -> assistant ordering;
- one bubble per role;
- audible assistant audio;
- Japanese kana rendering, especially `の`;
- queue/heap/resource instrumentation;
- reset/watchdog markers if any instability occurs.

Do not request repeated retries if that one bounded physical soak fails; consume the evidence and continue diagnosis.

Keep PR #2 OPEN / DRAFT / UNMERGED.
