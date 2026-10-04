# Product roadmap

The product vision is much larger than the current working slice. The S6 pilot was only a starting point; S8 added a broader game set and S9 adds user-owned four-week practice schedules, but this still does not define or complete the whole-person platform. The machine-readable dependency graph is [`../orchestration/workflow.json`](../orchestration/workflow.json); `scripts/agent_flow.py` validates and tracks it.

## Product sequence

| Stage | Outcome | Key gate |
|---|---|---|
| **S0 — Vision & repository intake** | Read `res4` through `res1`, inspect the checkout, and synthesize the whole-person platform vision. | Archive and repository facts are separated; no speculative rewrite. **Complete.** |
| **S1 — Requirements & evidence map** | Testable first-slice requirements, sourced claim ledger, and visible product decisions. | Claims preserve populations, transfer limits, and scientific uncertainty. **Complete for prototype scope.** |
| **S2 — Architecture, privacy & safety** | Next.js/Vercel, local-first, content, AI, privacy, and threat boundaries. | Simple static foundation; no mandatory accounts or AI; provider authorization is separate from login. **Complete for prototype scope.** |
| **S3 — UX/accessibility blueprint** | Low-friction, responsive Explore/Learn/Lab/Coach interaction patterns and manual accessibility checklist. | No visual-only graph, no mandatory audio, clear failure states. **Blueprint complete; device review continues.** |
| **S4 — Application foundation** | Next.js shell, design tokens, routes, lint/tests/build, errors/loading, Vercel assumptions. | Clean production build and documented project root. **Complete.** |
| **S5 — Knowledge model & first reviewed content** | Versioned concepts, claims, sources, activity definitions, limitations, and explicit non-causal links. | IDs/references validate; source-context is not confused with product efficacy. **Complete for prototype scope.** |
| **S6 — Learning and training pilot** | Preserve Explore → concept → self-paced experiment → evidence; add a small `/train` proof with four playable task demos, user-chosen weekly practice goals, optional local summaries, and a fixed-seed daily/friend challenge. | Automated checks pass; practice scores remain task-specific, local storage is explicit opt-in, challenge scores are untimed/self-reported, and keyboard/screen-reader/real-device review remains open. **Pilot implemented; manual checks remain open.** |
| **S7 — Existing-game audit & training engine** | Define and integrate shared lifecycle/scoring/difficulty/seed contracts; keep existing external work untouched. | Engine and tests complete. Legacy source inspection/migration remains blocked by the separate repository’s 403 access response; rendered pages are not a source or functional audit. |
| **S8 — Core playable game portfolio** | Add and verify eight native modes across at least six task domains while preserving the external portfolio. | Eight modes, seven stated domains, per-game contracts, untimed inputs, explanations, and game tests are implemented and verified. **S8 complete for prototype scope;** manual device/AT review and legacy source audit remain open. |
| **S9 — Goals, programs & personal progress** | Four user-owned four-week practice schedules with week-specific activity suggestions, rest/recovery, optional review, pause/resume/stop, UTC-week adherence, and opt-in local task history grouped by activity. | Automated schedule, timing, migration, history, and UI checks pass; task scores remain distinct from behavior adherence and carry variability/transfer caveats. Export/delete controls remain explicit. **Implemented for prototype scope; manual device/AT and browser-storage review remain open.** |
| **S10 — Opt-in competitive gaming** | CF3 fixed-rule weekly friend events and CR1 same-event self-reported result comparison integrated with `/train`; later leagues/tournaments only if approved. | Challenge codes bind UTC week, game/version, seed, settings, and score bounds; UI labels the unverified client-only model, keeps the event game aligned to active goals, and preserves CF1/CF2. No public ranking/service; manual two-device/accessibility review and authoritative competition remain gated. **Prototype implemented; release review remains open.** |
| **S11 — Whole-person development pathways** | Evidence-led modules for learning, emotional/social skills, stress/resilience, sleep, physical activity, nutrition, habits, recovery, and healthy aging. | Expand one reviewed user need at a time; avoid shallow advice, diagnosis, or unsupported intervention claims. |
| **S12 — Optional tool-first AI mentor** | AI tutor/coach/reflective guide uses the real knowledge graph, game/session tools, evidence and consented context in a shared workspace. | Explicit provider/data consent, typed allowlist, deterministic score source, bounded cost/failure, and fully useful no-AI core. |
| **S13 — Release hardening** | Independent product/science/security/accessibility review, Vercel preview, performance, privacy, incident/rollback readiness. | Real browser/device/assistive-tech checks pass; deployment plan/terms verified; no unresolved high-risk issue. **In progress; not production-approved.** |
| **S14 — Development Atlas and practice menu** | A discoverable 14-area `/develop` map with typed practice/support/reflection offers, source context, and an ephemeral multi-area practice menu. | Each pathway has a doable start, real-life application/support, reflection, and a visible limit. The map is educational orientation, not complete domain coverage or a validated curriculum. **Implemented for prototype scope; independent/manual review remains open.** |

The current `/train` build connects four authored four-week schedules → week-focused activity suggestions → task-specific results → opt-in local adherence/history → CF2 daily challenges and CF3 goal-aligned weekly friend events with shareable, same-event self-reported results across eight playable modes. S10 is implemented for prototype scope; it does not provide research-validated curricula, normalized personal-best analytics, verified/public competition, whole-person pathways, optional AI, or release-level manual review. The legacy website source audit is still blocked.

## Initial game portfolio to audit

The existing public games hub lists Memory Matrix, Sequence Recall, Pattern Predictor, Attention Tracker (multiple-object tracking), Logic & Syllogism Lab, Focus Forge/Breath Anchor, Creative Spark, and Speed Math. Separate tools pages also expose Rubik's Cube, Minesweeper, Water Sort, sliding puzzles, Sudoku/nonograms and other grid/word solvers. See [`GAME-PORTFOLIO-AUDIT.md`](GAME-PORTFOLIO-AUDIT.md) for the read-only inventory and access limitation.

The intent is to **audit and reuse the user's work**, not silently replace it. Once source access is available, tests and hands-on checks determine whether each title should be preserved, repaired, refactored, rebuilt, or deferred. A maze of shallow clones is not the goal; the goal is a reliable, varied, maintainable portfolio attached to user-chosen goals.

## Competition strategy

Competitive play is now an explicit product requirement. Build it in safe, useful increments:

1. Private practice and game-specific personal bests.
2. Versioned fixed-seed daily/weekly challenge, same rules for every participant.
3. Shareable/asynchronous friend challenge with an honest distinction between self-reported and verified scores.
4. Opt-in leagues/seasons/tournaments only after event fairness, privacy, pseudonyms, reporting/moderation, anti-cheat, age-safety, retention, abuse response, accessibility, and operating-cost decisions.
5. Real-time multiplayer only if the owner wants it and the architecture can support low-latency authoritative scoring/moderation.

The current `/train` route retains CF2 daily and legacy CF1 reconstruction and adds CF3 Monday-to-Sunday UTC friend events across eight modes. CR1 result codes carry a self-reported count and are compared only for the same event; goal selection constrains the event game to that goal. The browser has no authority to prove scores, attempts, identity, or clock time; there is no participant registry, public leaderboard, or remote score service. This does not settle whether public ranked play or real-time multiplayer is wanted.

A leaderboard measures performance in one game event, not intelligence, health, worth, or long-term ability. Do not introduce forced streaks, FOMO, loot boxes, punitive loss loops, or ranking pressure. The product owner still needs to choose which competition tiers are wanted; the current safe default is local/no-account challenge first.

## Parallel work

S4 (application foundation) and S5 (knowledge/content model) were permitted to run in parallel after S2/S3 because their write scopes did not overlap. Future game implementation, goal persistence, competition and AI are sequential gates: interfaces, scoring, and data rules must be stable before layering identity or real-time services. Research and accessibility review may run in parallel where scopes are separate; one integrator owns shared game/session interfaces.

## Cross-cutting gates

Each stage checks scientific integrity, task-specific interpretation, privacy, non-clinical boundaries, keyboard/touch/screen-reader support, mobile, reduced motion, non-audio paths, deterministic scoring, fairness, error/network/storage fallback, tests, and Vercel fit. Claims must distinguish task practice, near transfer, far transfer, and real-world outcomes. Manual browser/assistive-technology review is not replaced by a passing build.

## Vercel and service scope

The current Next.js app remains rooted at `cognitive-fitness/`, with Node 22.x and ordinary Next.js build/deploy assumptions. Static games and client-side deterministic scoring fit the initial Vercel footprint. Accounts, verified leaderboards, live multiplayer, or AI may require databases/functions/third-party services and must be separately justified, threat-modeled, costed, and checked against current Vercel plan terms before implementation. Do not assume Vercel Hobby is eligible for commercial use.
