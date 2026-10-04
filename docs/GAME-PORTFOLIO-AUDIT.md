# Existing game portfolio — read-only inventory

**Reviewed:** 2026-10-04

**Purpose:** Preserve and expand Ahmed's existing work rather than treating the S6 recall slice as the whole product. This is a *rendered-page inventory*, not a source-code audit, functional test, or claim that a game works.

## Sources inspected

- [Public games hub](https://ahmed-raza-ur-rehman.me/games/) (the supplied GitHub Pages URL resolves to this hub).
- Individual public pages linked from that hub.
- [Puzzle/solver studio](https://ahmed-raza-ur-rehman.me/tools/game-solvers.html?tool=rubik), [grid/logic studio](https://ahmed-raza-ur-rehman.me/tools/grid-logic-solvers.html?tool=sudoku), and [word games studio](https://ahmed-raza-ur-rehman.me/tools/word-solvers.html?tool=wordle).
- The user-referenced source repository is not checked out in this project. A `gh api` request for `ahmed-raza-ur-rehman/ahmed-raza-ur-rehman.github.io` returned HTTP 403: “Resource not accessible by integration.” Public rendered pages were readable, but source inspection and hands-on interaction were not available in this pass. Do not provide credentials in chat; the Arena GitHub integration needs repository permission or the source must be made available in the workspace.

## Visible portfolio

| Existing title | Public page description | Initial product classification / audit focus |
|---|---|---|
| **Memory Matrix** | Spatial pattern recall on a grid that grows from 3×3 to 5×5; the hub mentions streak bonuses and local high scores. | Candidate memory game. Check sequence generation, valid levels, duplicate input, keyboard/touch grid semantics, result math, difficulty fairness, and score persistence. Remove pressure mechanics unless optional. |
| **Sequence Recall** | Progressive sequence span; visual and auditory pattern flashes; current span and personal best. | Candidate sequence game. Add a complete silent/visual path, user-controlled pacing, interruption/retry behavior, and an explicit span/task limitation. |
| **Pattern Predictor Lab** | Ten progressive rule puzzles (shape rotation, arithmetic sequence, color cycle, logical shift); page uses “Raven's Matrices” wording. | Candidate reasoning puzzle. Audit answer key/randomization and explanation quality. Do not imply equivalence to a standardized Raven's test or diagnostic ability score. |
| **Attention Tracker (MOT)** | Five rounds of multiple-object tracking: identify highlighted targets, track moving distractors, select targets. | High visual/motor load. Keep as optional, non-diagnostic play; design an accessible alternative and do not claim a clinical/standardized attention measure without exact evidence. |
| **Logic & Syllogism Lab** | Ten deduction puzzles covering categorical syllogisms, Boolean implication, fallacies, and relational deductions. | Candidate reasoning/learning game. Review formal validity, explanations, and score labels. Replace trait-like output such as “Reasoning Index: High” with a task/event result unless that index is independently valid for a defined population. |
| **Focus Forge & Breath Anchor** | 4-7-8 breathing guide and a 25-minute focus sprint with distraction tally. | A focus utility, not a cognitive game or established treatment. Review timing, stop controls, evidence/safety language, and avoid claiming autonomic/medical effects without sources. A shorter, untimed option is needed. |
| **Creative Spark** | 90-second alternative-uses / divergent-idea sprint. | Open-ended creativity activity. Do not rank idea quality as objective without a validated rubric; provide a non-timed mode and private reflection. |
| **Speed Math Reflex Lab** | 30-second mental arithmetic, streak and best streak. | Timed arithmetic practice. Include an untimed/accessible practice path; score exact correct/attempted items and do not imply general processing-speed or intelligence gains. |

The hub also links three broader utility studios:

- **Game mechanics:** Rubik's Cube/CFOP, Minesweeper, Water Sort, sliding puzzles, Mastermind, Sokoban, Lockpick Simulator, and Book of Answers.
- **Grid/logic:** Sudoku, Killer Sudoku, Nonogram/Picross, KenKen, Futoshiki, Kakuro, Hashi, Slitherlink/Masyu, Star Battle, Flow Free, Lights Out, color puzzles, and matchsticks.
- **Word/linguistic:** anagrams, crossword patterns, Wordle, word ladders, word search, cryptograms, riddles/teasers.

These can be valuable games/tools, but not every solver is a cognitive-training intervention. Keep recreational puzzles, answer solvers, skill practice, and evidence-reviewed learning techniques clearly distinguished in the product catalog.

## What can and cannot be concluded now

**Observed in the rendered hub/pages:** the user has already created a meaningfully varied portfolio, including recall, attention, reasoning, logic, creativity, focus utilities, mental arithmetic, and classic puzzle solvers. The hub's copy favors browser-local play and explicitly cautions against assuming far transfer; it advertises keyboard support for most activities while acknowledging that object tracking is difficult for screen readers.

**Not verified:** source architecture, bug causes, functional controls, scoring correctness, timer behavior, storage implementation, mobile rendering, keyboard operation, screen-reader experience, security, or whether every game currently functions. The text extraction shows initial UI copy and default values only; it is not a gameplay test. No external game code has been copied into this project.

## Product and quality decisions for the next stages

1. **Preserve before replacing.** With source access, run each game, add regression tests, then classify it keep/repair/refactor/rebuild/defer. Preserve credit/attribution and avoid overwriting the existing site.
2. **Reuse one engine where appropriate.** Standardize session lifecycle, difficulty/settings, seeded generation, scoring, results, keyboard/touch input, save/clear controls, and versioned challenge rules. Keep each game's mechanics independent and unit-testable.
3. **Make gameplay more than quantity.** Ship a broad but curated collection with clear category/domain, mechanics, purpose, instructions, difficulty, and score boundary. Do not publish placeholder or nonfunctional cards.
4. **Goals connect the catalog.** A user-chosen goal should lead through education, varied practice, review, recovery, and a next step. Track the goal behavior separately from raw game scores and any evidence of real-world benefit.
5. **Competition is explicit and opt-in.** Start with game-specific personal bests and identical-seed daily/weekly challenges. Friend challenges can share a versioned challenge code. Public rankings or real-time play require owner approval plus privacy, pseudonym, fairness, anti-cheat, moderation/reporting, child-safety, retention/deletion, cost, and Vercel architecture review.
6. **No false cognitive rankings.** Competitive points/ranks measure performance in one game under one event's rules. They are not IQ, EQ, attention, memory capacity, health, or proof of transfer.

## Blocker for source-level repair/migration

The current Arena integration did not grant API access to the referenced website repository (403 resource-access response). To audit and fix those exact implementations, reconnect/adjust GitHub repository access through Arena or provide the relevant source files in this repository. The next stage may proceed with the audited public-page inventory and a new reusable engine design, but it must not claim that the legacy source has been repaired until that code is available and tested.

## S7 follow-through (2026-10-04)

The shared engine was added to the new Next.js product and integrated into the four `/train` activities. Pure tests cover session construction/transitions, seeded shuffle, bounded scoring, and per-activity contract completeness. The source audit itself remains **blocked**: the separate public-site repository was not available through the current GitHub integration (403), and the rendered page inventory is not a substitute for source review or interactive gameplay. No legacy source was copied, migrated, replaced, or repaired. The existing games and puzzle studios remain listed as preservation candidates; source-backed keep/repair/refactor/rebuild decisions are deferred.

The next catalog iteration can add new product-native games without overwriting those external projects. Any eventual migration must first obtain repository access, reproduce reported failures, test keyboard/touch/screen-reader paths, and keep provenance/attribution.
