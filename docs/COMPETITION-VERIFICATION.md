# Competition verification — S10

**Status:** CF3 weekly friend events and CR1 same-event self-reported result comparison are implemented in the account-free `/train` prototype. This is not a ranked service, score-verification system, security control, or claim of production fairness. Two-device and real assistive-technology review remain open.

## Event contract

CF3 is an opt-in, deterministic, untimed friend event with a code shaped like:

```text
CF3-YYYYMMDD-GAME-VMAJOR-MINOR-PATCH
```

The encoded date must be a Monday in UTC. The code binds the normalized catalog game ID and its current activity version; the full code is the deterministic seed. CF3 reconstruction runs the five-item selection and answer-order shuffle for that game version and applies the fixed CF3 rules:

- exactly five items;
- untimed, with no completion-time ranking or tie-breaker;
- correct-count scoring only;
- new-run start inclusive at Monday `00:00:00 UTC`, start window end exclusive at the following Monday `00:00:00 UTC`; a run started inside the window may finish afterward;
- code required to reconstruct the event, with no verified identity and no enforced attempt limit.

The UI displays the UTC week, game/version, scoring rules, and explicit browser-only enforcement limits. The creator may choose from the full catalog without an active goal; with a goal selected, the picker is restricted to that program's game set. A completed matching game session is counted by the existing weekly adherence logic; its score remains distinct from goal progress. The optional CF2 daily challenge remains separate.

Unknown CF3 game versions and malformed/non-Monday dates are rejected instead of being silently reconstructed under newer rules. When a game's questions, options, or scoring change, maintainers must increment that activity's version. CF1 and CF2 daily codes continue to use their existing parser, rotation, and reconstruction behavior.

## Result sharing and comparison

A CR1 report has this shape:

```text
CR1|<exact-event-code>|<correct-count>/<total-count>
```

The helper bounds integer counts, rejects impossible totals, and the importer requires the exact expected event code and item count. The UI only compares reports for the same event; it never compares different game codes or presents a general score/rank. A receiver can load the friend's result link, inspect the self-reported count, play the same event, and see an explicitly labeled same-event comparison. The text calls out that time is ignored and retries are allowed.

CR1 carries no name, contact detail, account ID, raw answers, or completion time. Copying an invitation/result is user-triggered. When included in a shared URL, challenge and result codes are present in the query string and visible to the recipient; browser/hosting request history may also contain them. Do not add private information to codes. If local saving is separately enabled, the user's own challenge session summary follows the existing local-storage policy; peer reports are not written as new session records.

## Integrity boundary — no verification

All event and result logic runs in the browser. CF3 and CR1 are reproducible text, not signed credentials. A participant can fabricate a score, replay the task, retry, change the device clock, modify the client, or skip the intended event window. The code does not enforce who played, how many attempts occurred, that the item set was actually completed, or that a score is truthful. A local window check is user guidance, not access control.

Therefore this prototype has no public ranking, leaderboard, participant registry, account, challenge/result endpoint, server verification, anti-cheat service, matchmaking, or multiplayer. All shared counts are labeled **self-reported and unverified**; they must not be called verified, official, or a measure of cognitive ability. A noncompetitive practice path remains available without signup or sharing.

Before any ranked/public or real-time service, obtain explicit product approval and design authoritative event manifests/scoring, server-enforced windows and attempt/retry policy, replay/idempotency controls, identity or privacy-preserving pseudonyms, rate limits, abuse/reporting/moderation/appeals, minors and safety policies, accessible alternatives, retention/deletion/withdrawal, incident ownership, and hosting cost/availability. The current local codes cannot be promoted to trusted ranks without that separate system and review.

## Automated coverage

- `tests/competition/challenges.test.ts`: deterministic event reconstruction, game/version/settings binding, Monday UTC dates including year handling, upcoming/open/closed windows, supported-game coverage, malformed/version-mismatch rejection, and bounded exact-event CR1 parsing.
- `tests/training-engine.test.ts`: legacy CF1 reconstruction, CF2 compatibility/rotation, deterministic question/answer keys, and matching activity-only goal counts.
- `tests/training-hub.test.tsx`: goal-limited CF3 game picker, matching event counted only for its goal, imported out-of-goal events explicitly kept optional and excluded from adherence, expired-window state, imported peer score handling, and same-event comparison only after the local run.

The full repository test/build results are recorded in [`../orchestration/runs/S10-handoff.md`](../orchestration/runs/S10-handoff.md) when S10 is signed off.

## Manual verification still required

- Open a copied CF3 invite and CR1 result on two separate real devices; confirm identical current-version content and exact-event comparison.
- Check Monday UTC rollover, start/end inclusivity, another local timezone, and the upcoming/closed states.
- Verify CF1 and CF2 imports still work, including challenge/result copy fallback when clipboard access is unavailable.
- Test goal-aligned picker options, completion counts, keyboard/screen-reader flow, zoom/reflow, and small screens.
- Confirm users understand that the code does not enforce event timing, identity, or attempts, and that scores are not verified.

Automated tests do not establish browser-clock integrity, anti-cheat, fairness, WCAG conformance, or production readiness.
