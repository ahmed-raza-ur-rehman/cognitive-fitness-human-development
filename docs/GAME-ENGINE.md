# Shared game/session engine

**Status:** S7 engine and S8 catalog complete; S9 four-week goal schedules and S10 local/share-code weekly friend events are implemented for prototype scope. CF3/CR1 adds no server trust or identity. This contract is used by `/train`; it is not a claim that the whole product vision is complete or externally validated.

## Design boundaries

- Game implementations own their question bank, rules, presentation, answer key, and task-specific result wording.
- `GameDescriptor` requires a version, domain, written rules/difficulty, inputs, score meaning and limits, an accessibility path, retry behavior, and the presence/absence of time pressure. It does not establish accessibility conformance or scientific validity; actual review remains required.
- `GameSession` binds a fixed question list to a game id/version, practice-or-challenge mode, seed, optional challenge code, current item, answer slots, and lifecycle phase.
- `createGameSession` rejects empty sets, duplicate/blank question IDs, and invalid answer keys before a run begins.
- `reduceGameSession` accepts only allowed phase transitions: study → answer → feedback → next item/completed, or leave → abandoned. Invalid/repeated answers are ignored. Abandoned runs are not scored or written to history.
- `seededShuffle` is a reproducible local PRNG helper, not a security primitive. Never use it for authentication, anti-cheat, encryption, or secret generation.
- `scoreMultipleChoice` bounds every answer to the corresponding option list, counts unanswered/invalid/extra answers separately, and never awards points for malformed input.
- The core has no account, network, sound, AI, database, timer, or storage dependency. Persistence and challenge transport are product concerns layered on top.

## Current integration

The eight `/train` activities use the shared deterministic shuffle, scoring, session lifecycle, and task contract. The React experience supports start, self-paced study where applicable, answer, feedback, completion, leave, and retry. Daily challenges use CF2 and rotate across all eight games; CF1 links remain reconstructible for the original four activities with their prior date rotation and seeded question/option order. The separate CF3 weekly friend-event helper binds a Monday UTC week, game ID/version, five-item seed, untimed correct-count rules, and a local event window. CR1 carries a bounded self-reported result for an exact event. With a practice goal active, the picker is limited to goal activities and completed matching sessions feed the existing adherence counter.

Each catalog entry exposes its contract in the interface under “Rules, scoring, and access.” The score is task-specific: correct responses in one five-item set, not an estimate of memory, attention, reasoning, health, intelligence, or general transfer. There is no speed scoring.

## Validation

Core tests cover deterministic ordering, copy/no-mutation behavior, score bounds, malformed/extra answers, question and answer-key validation, session transitions, repeated/invalid input, terminal phases, descriptor completeness, and the distinction between task results and broad claims. Product integration tests cover the actual `/train` UI. Manual keyboard, screen-reader, touch, browser, and device checks remain release work under S13.

## Compatibility and migration

- `CF1-YYYYMMDD-GAME` and `CF2-YYYYMMDD-GAME` continue to reconstruct their original daily rotations and deterministic sets. Neither is a signed/verified event token.
- `CF3-YYYYMMDD-GAME-VMAJOR-MINOR-PATCH` represents a Monday UTC start and binds the current catalog game/version plus the exact event seed. CF3 reconstruction applies five untimed items scored by correct count for the seven-day UTC window. `CR1|EVENT-CODE|X/5` is a self-report only; code parsing checks bounds and an exact same-event match, not authenticity.
- `seededShuffle` and event IDs are reproducible, not secrets. Any change to a game's question bank or rules must bump that game's version and keep prior-code handling explicit; unknown versions are rejected rather than silently mapped to a different game set.
- Legacy games on the separate public site were inspected only as rendered pages. The linked GitHub source was not accessible to this session (403). No source-level audit, migration, or repair is claimed. Keep those systems untouched until the repository is available and interactions can be tested.
- Any new game must include a descriptor, pure/testable logic where practical, an accessible input path, safe retry/exit behavior, and a clearly bounded score statement before it is presented as playable.
