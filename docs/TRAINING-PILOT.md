# Training, goals, and friend-challenge pilot

**Status:** A functional prototype is available at `/train`. S8 added eight product-native, playable activity modes across memory, attention, reasoning, numerical practice, cognitive flexibility, and route planning; S9 added four user-owned four-week schedules with local progress controls. These are prototype routines and games—not completion of the full product vision, validated curricula, verified competition, or whole-person development system.

## What works now

### Eight untimed playable activities

- **Sequence Recall:** study a short number sequence at the learner's pace, hide it manually, then identify its exact order.
- **Target Finder:** inspect a labelled letter grid and choose the target count.
- **Pattern Predictor:** reason about a small numerical pattern and choose what comes next.
- **Logic Lab:** use only the stated premises to select a supported conclusion.
- **Grid Pattern Recall:** study a labelled four-by-four cell pattern, hide it manually, then recognize its coordinate set.
- **Mental Math Studio:** answer arithmetic questions at any pace; a calculator is explicitly allowed.
- **Rule Switch:** classify a number and letter using an alternating rule that is repeated on each item; there is no speed score.
- **Route Planner:** inspect a semantic grid map, respect movement/blocked-cell constraints, and choose a valid written route.

Every activity has a versioned descriptor in the product code and an expandable “Rules, scoring, and access” section. It states rules, difficulty, the accessible interaction route, what the session score counts, and what it does not measure. All are untimed, use text/native controls, provide feedback, and can be left without recording an unfinished result. Route questions are checked to have exactly one valid keyed answer. These are small prototype items, not fully featured recreations of the user's separate public games.

Scores count correct choices within one five-item session. They are not validated cognitive tests, percentiles, diagnoses, broad ability measures, or evidence of far transfer. Task-specific limits are displayed beside the activities; the product does not use these scores for IQ/EQ, health, or worth rankings. Correctness is deterministic in code; question and option order are deterministic for a seed.

### User-led goals and progress

The pilot offers four optional, user-owned four-week practice schedules: Explore memory, Practice attention, Practice reasoning, and Balanced exploration. Each contains four weekly themes with week-specific activity suggestions, a modest sessions-per-UTC-week target, item-level activity feedback and explanations, optional rest/recovery language, a Week 4 review prompt, and a start/pause/resume/stop path. They rotate among relevant prototype activities (memory includes sequence and spatial-pattern practice; attention includes target finding and rule switching; reasoning includes pattern, logic, arithmetic, and route puzzles; balanced includes all eight). Schedule timing uses active elapsed time and pauses when requested. A next-session suggestion follows the current week’s focus; weekly adherence and task scores remain separate. Recent results can be inspected by activity, with a visible note that item sets, difficulty, practice effects, and device effects are not controlled. The weekly count includes only activities in the chosen goal and after the schedule start, so a challenge counts only when its game belongs to that goal. These are authored routines, not evidence-reviewed curricula or promises of ability change. There are no forced streaks, deadlines, penalties, or rank pressure.

Before explicit save, the goal, schedule metadata, and recent session summaries are held in page memory and are lost on refresh. Choosing **Save this goal on this device** stores the selected goal, optional start/pause schedule timestamps, and at most the most recent 200 summaries in `localStorage` under `cognitive-fitness.training.v1`. Existing version-1 saves without schedule metadata still load safely. A summary contains activity, mode, correct/total, completion timestamp, and (for a challenge) its public challenge code; raw answer selections, reflection text, name, account, and contact information are not stored. The UI lists the four most recent records and exposes the full saved history grouped by activity, can export JSON including schedule dates, and can clear saved data. Storage failure falls back to the current page session.

### Daily and weekly friend challenge

- The daily challenge remains **CF2**. Each UTC date rotates among all eight activities and reconstructs the same five-question set, option order, and scoring from a versioned code such as `CF2-YYYYMMDD-GAME`.
- **CF1 links remain reconstructible** for the original four activities and continue to use their original date rotation and seeded question/option order. Newer activities require CF2.
- **CF3 adds a weekly event** with a code shaped like `CF3-YYYYMMDD-GAME-VMAJOR-MINOR-PATCH`. It binds a Monday UTC start, a catalog game and its version, a deterministic seed (the full code), five questions, untimed correct-count scoring, and a Monday-inclusive / following-Monday-exclusive UTC window for starting a new run; a run begun in-window may finish later. Both people with the same current-version code reconstruct the same set. Unknown game versions are rejected rather than silently remapped.
- With a practice goal selected, the weekly challenge picker offers only that goal's game set; without a goal it offers the catalog. Completing a weekly event counts as one goal session only if the activity belongs to the chosen goal, the same as other completed activities. Goal adherence and task score stay separate.
- **CR1** carries only an exact event code and a correct/total count. A participant may choose to copy/share it. The app validates the format, score bounds, expected total and exact event match before showing a same-event comparison; no participant identity is attached. No elapsed time is ranked.
- Invitations and comparison UI state that results are self-reported and unverified. CF3 event dates, identity, and repeat attempts are not securely enforced by this browser-only implementation: anyone with a code can retry, change their device clock, alter a score string, or modify client code. The code is not a signed credential.
- The pilot has **no account, participant registry, challenge/result endpoint, public leaderboard, score verification, anti-cheat service, matchmaking, or real-time multiplayer**. It is an optional friendly practice flow, not an authoritative ranked event. Public ranked or real-time competition needs separate product approval and service threat-modeling.

See [`COMPETITION-VERIFICATION.md`](COMPETITION-VERIFICATION.md) for the event contract and automated coverage.

## Validation added

Automated coverage checks deterministic CF2 generation and CF1 reconstruction, CF3 Monday-UTC boundaries/window states/version parsing across all games, fixed five-question seeds/rules, bounded CR1 result codes and exact-event matching, goal-constrained weekly-event selection, matching challenge adherence, and exclusion of imported/out-of-goal events, answer-key alignment, rule alternation, unique valid route answers, schedule timing and local-storage controls, version-1 save migration, memory hide steps, game lifecycle exit, and complete challenge sessions. Game descriptors are checked for task-level score boundaries, accessibility paths, untimed rules, retry behavior, and difficulty descriptions.

## S8 baseline verification

At the S8 handoff, the code passed 59 Vitest tests across 15 files, strict TypeScript, ESLint, the Next.js production build, content validation, workflow validation, 10 Python workflow tests, and `git diff --check`. Exact baseline evidence is recorded in `orchestration/runs/S8-handoff.md`; see `orchestration/runs/S9-handoff.md` for the current S9 verification.

## Manual review still required

Before treating these features as release-ready, manually test at minimum:

- Every game start, answer, feedback, continue, leave, and retry flow by keyboard and touch.
- Focus movement and screen-reader announcements as questions and phases change; table navigation for Target Finder, Memory Matrix, and Route Planner.
- Zoom/reflow, narrow mobile layouts, contrast, reduced motion, and browser-local storage denial/quota behavior.
- CF1/CF2/CF3 invite and result-code import on two real devices, correct same-event-only comparison, Monday/UTC event-window boundaries and rollover, goal-limited game choices and adherence, clipboard fallback, and local export/delete. Browser clock changes and client tampering must not be mistaken for enforceable competition integrity.
- Whether the challenge mechanics feel enjoyable and fair to users with different motor, visual, or cognitive access needs; preserve the noncompetitive route.

Automated DOM tests do not establish WCAG conformance, device usability, or accessibility for every individual.

## Explicitly not delivered

This iteration does not replace or source-audit the user's existing public games. The integration could inspect rendered pages, but the separate GitHub source repository returned 403; no source-level repair/migration is claimed. This also does not deliver full-scale games, evidence-reviewed or trial-validated curricula, standardized personal baselines/normalized trends/personal-best analytics, cross-device sync, accounts, verified leagues/tournaments, public ranking, moderation, a whole-person development pathway, or an AI mentor. These remain staged work with separate gates.
