# Game catalog verification — S8

**Status:** S8 implementation and automated acceptance checks passed: eight product-native activities are implemented and tested. This is a playable prototype catalog, not a validated cognitive-training program or a complete migration of the user's external games.

## Catalog contract

All activities use the shared versioned game descriptor/session engine. Each has rules and difficulty before play, at least two answer choices, an untimed five-item set, per-item feedback, a result counting correct responses, a task-specific “does not measure” boundary, retry via a fresh practice set, and a leave path that records no incomplete result. The UI includes task rules, scoring, accessibility route, and limitations for each card. Correctness is decided locally by deterministic answer keys. No sound, timer, login, model, network, or remote profile is required.

| Activity | Domain | Interaction | Score unit | Explicit score boundary |
|---|---|---|---|---|
| Sequence Recall | Memory | Study a semantic list at own pace, hide manually, select exact order | Correct sequence choices / 5 | This recognition set only; not general memory, capacity, health, or transfer |
| Target Finder | Attention | Inspect a labelled letter table and select target count | Correct grid counts / 5 | These static letter grids only; not everyday attention, vision, ADHD, or transfer |
| Pattern Predictor | Reasoning | Choose the next item in simple number rules | Correct next-item answers / 5 | These pattern items only; not general reasoning, standardized testing, or intelligence |
| Logic Lab | Reasoning | Apply short stated premises and choose what follows | Correct premise-based answers / 5 | These questions only; not a validated reasoning score or real-world judgment |
| Grid Pattern Recall | Spatial memory | Study a labelled 4×4 pattern at own pace, hide manually, identify coordinate set | Correct spatial-pattern choices / 5 | These layouts only; not general memory, navigation, spatial ability, or transfer |
| Mental Math Studio | Numerical reasoning | Untimed arithmetic/quantity multiple choice; calculator explicitly allowed | Correct arithmetic answers / 5 | This arithmetic set only; not processing speed, aptitude, intelligence, or education level |
| Rule Switch | Cognitive flexibility practice | Alternate number-parity and letter-type rules; every item repeats its rule | Correct classifications / 5 | This alternating set only; not executive function as a trait, diagnosis, self-control, or transfer |
| Route Planner | Planning and strategy | Read a semantic 4×4 map; choose a route obeying right/down and blocker rules | Correct route selections / 5 | These small constrained puzzles only; not general planning/navigation or transfer |

The score wording deliberately describes what was observed. No percentile, composite, cognitive age, IQ/EQ, diagnosis, health prediction, or general improvement claim is generated. Practice scores and goal-adherence counts remain separate.

## Challenge versioning and competition boundary

- **CF2** is the current daily version. UTC date rotation includes all eight catalog entries; question selection and option order derive deterministically from its code.
- **CF1** remains accepted for the original four IDs (`sequence`, `pattern`, `visual-search`, `logic`) using its original four-game date cycle and the same seeded shuffle. CF1 does not accept newly added games.
- Challenge codes are reproducible labels, not signed credentials. The experience is untimed, self-reported, retryable, and not independently verified. There is no public leaderboard, authenticated entry, anti-cheat service, moderation/reporting, matchmaking, or real-time play.
- These limits mean the current share comparison is a prototype friend challenge. Do not call it a verified competition service or a ranked measure of cognitive ability.

## Automated checks

- `tests/games/core/`: descriptor completeness, deterministic shuffle, option scoring boundaries, question/session validation, permitted transitions, invalid/repeated answer rejection, completion/abandonment behavior.
- `tests/training-engine.test.ts`: all eight question banks, score-key alignment, daily CF2 rotation through all games, CF1 legacy reconstruction, Rule Switch alternation, and uniqueness of valid Route Planner answer keys.
- `tests/training-hub.test.tsx`: practice goals and explicit storage opt-in, Sequence Recall hide step, Memory Matrix hide/grid path, Route Planner semantic map, leave-without-record behavior, CF2 challenge completion and self-report disclosure.

Latest full command results are recorded in `orchestration/runs/S8-handoff.md` after verification.

## Manual / external checks still open

1. Keyboard-only interaction through every activity, focus order, visible focus, and the abandon/return path.
2. Screen-reader reading order and announcements for study/answer/feedback phases, all three game tables, and mobile zoom/reflow.
3. Real touchscreen target sizes, browser storage refusal/quota fallback, reduced-motion/contrast review, and copy/paste challenge links across devices.
4. Playtesting with people who have varied visual, motor, reading, math, and cognitive access needs; determine whether coordinates, route text, and task length work as intended.
5. Independent subject-matter/evidence review. The current tasks are newly authored prototype questions and have no study establishing training efficacy or far transfer.
6. Source-level audit/repair of the user's existing public game suite. The linked repository remained inaccessible to the integration (403); no rendered-page inspection can substitute for source review or hands-on regression testing.

No WCAG conformance claim or external-source repair claim is made until those checks are completed.
