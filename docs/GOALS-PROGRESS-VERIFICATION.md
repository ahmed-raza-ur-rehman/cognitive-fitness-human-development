# Goals and progress verification — S9

**Status:** Four user-owned four-week schedules are implemented in `/train` alongside the eight-game catalog. They are behavioral practice/learning routines, not validated cognitive interventions or guarantees of change.

## Program structure

| Program | Weekly target | Four-week focus sequence | Included activities |
|---|---:|---|---|
| Explore memory | 2 | Sequence practice → spatial patterns → user-chosen mix → review | Sequence Recall, Grid Pattern Recall |
| Practice attention | 2 | Unhurried search → read-the-rule classification → alternate/repeat → review | Target Finder, Rule Switch |
| Practice reasoning | 3 | Number patterns → stated premises → arithmetic/routes → review | Pattern Predictor, Logic Lab, Mental Math Studio, Route Planner |
| Balanced exploration | 3 | Memory → attention → reasoning → choose/stop | All eight activities |

Each schedule describes purpose, weekly focus and matching activity set, item-level feedback, optional rest/recovery, and a review prompt. The suggested activity rotates only within the current week’s focus. The user chooses a goal to start a schedule, may pause/resume or stop the elapsed-time clock, may switch goals, can rest/skip, and is not penalized for missing a target. A legacy v1 local goal loads without program dates and can start its four-week schedule explicitly.

The schedule advances by four seven-day periods of **active elapsed time** from the start timestamp. Pausing records local metadata and freezes elapsed time; resuming adds the paused interval. It is not a streak and does not represent improvement. Weekly adherence counts only completed sessions in that program's activity set and after its start timestamp. The CF3 friend-event game picker is limited to the selected goal's activity set, and a completed event counts only when its game belongs to that goal; with no selected goal the picker may offer the full catalog. Its score remains a separate field. During a pause, optional activities remain accessible and any completed activity remains in history; a matching goal activity still counts toward the UTC-week behavior target.

The Week 4 review prompt is a private, optional reflection aid rendered on screen; no reflection response is collected or stored. Reaching the end means the schedule elapsed, not that the goal was mastered. The user can restart a four-week cycle, stop the schedule without clearing the selected goal/history, or change goals.

## Progress and data boundary

Progress and game performance remain distinct:

- **Goal adherence:** number of matching sessions completed in the current UTC week, compared only with the user's chosen behavior target.
- **Task performance:** correct responses out of the activity's five-item set, shown in the result card and recent-session history grouped by activity.
- **Caveat:** item sets and difficulty are not standardized across sessions; practice and device effects are not controlled. The activity-specific history is not a normalized trend, standardized baseline, or valid personal-best ranking across different seeds.
- **No inference:** no cross-game composite, IQ/EQ/diagnosis, far-transfer estimate, or health prediction is calculated.

Before explicit save, the goal, schedule metadata, and session summaries exist in page state only. The Recent sessions panel shows four records at a glance and can expand to inspect the saved records grouped by game, including local completion date, practice/challenge mode, and task score. Opt-in local storage holds the goal ID, start/pause timestamps and accumulated paused milliseconds, plus at most 200 summary records. Raw answers, reflection text, identity, contact data, and remote profiles are not stored. Existing `cognitive-fitness.training.v1` saves that lack the new optional schedule metadata remain readable. Export includes the schedule fields and summaries; clear deletes the local record. Storage denial/quota failure falls back to the page session.

## Automated verification

- `tests/goals/programs.test.ts`: four complete weekly themes, week-specific valid linked activities, feedback, rest, and review text.
- `tests/progress/program-progress.test.ts`: week transitions, four-week completion timing, pause/resume elapsed-time arithmetic, and malformed-record rejection.
- `tests/training-engine.test.ts`: current UTC-week counts are limited to the selected program's activity set and exclude activity before a new schedule starts.
- `tests/training-hub.test.tsx`: opt-in persistence includes schedule state, pause/resume/stop works, legacy v1 data starts a schedule safely, storage-write and deletion failures retain a usable page-memory fallback, task history stays activity-scoped, and all eight activities complete.

Current exact command results are recorded in `orchestration/runs/S9-handoff.md` before stage sign-off.

## Open limits / manual review

- These are authored product routines, not evidence-reviewed curricula; no trial demonstrates efficacy or transfer.
- There is no calendar scheduling, notifications, adaptive difficulty, baseline assessment, long-term score chart, cloud sync, account, or AI recommendation.
- Validate accessible focus/order for goal selection, pause/resume, progress bars, and review details with keyboard, screen reader, zoom/reflow, and real mobile devices at S13.
- Test data export/delete and browser localStorage failure/quota behavior in real browsers; JSDOM tests do not establish device reliability.
