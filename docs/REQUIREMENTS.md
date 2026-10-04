# Product requirements — initial slice

**Status:** S1 baseline, reconciled with the full res4→res1 vision and user feedback on competitive gaming on 2026-10-04. P0 describes the first S6 proof, not the complete product; P1/P2 make the game portfolio, goal pathways, and competition explicit. The S6 baseline had four games; S8 expanded it to eight product-native modes and S9 adds four authored four-week schedules with opt-in local schedule/session history. CF2 unverified fixed challenges and CF1 compatibility remain. These prototype increments do not close the full P1/P2 acceptance gates below.

## Product goal

Let someone arrive with a question about their mind, explore a plain-language concept and its relationships, try one short educational memory demonstration, understand the result without being diagnosed or ranked, and choose a useful next step. The journey should work without an account, AI provider, microphone, or personal-data upload.

## Initial audience and assumptions

- Primary: curious learners and students with mixed ages, education levels, and familiarity with psychology.
- Secondary: people interested in self-development and older adults exploring learning/cognitive maintenance.
- Working language for the first slice: English; keep text/content organized so translation and right-to-left support can be added without rebuilding the domain logic.
- The first activity is education/practice, not a validated psychological or neuropsychological test.
- No sensitive free-text reflection, remote profile, or cross-device sync in the first release.

## Prioritized requirements

### P0 — required for the first vertical slice

**R-01: Start exploring immediately.** A first-time visitor can enter the learning journey without signup, provider connection, setup questionnaire, or microphone permission. The first meaningful action is visible without scrolling through a dashboard.

**R-02: Progressive concept explanation.** Each concept used in the slice has a brief beginner explanation, an everyday connection, optional technical depth, and explicit links to related concepts. Avoid unexplained jargon and avoid presenting simplified models as literal brain anatomy.

**R-03: A usable knowledge map.** The user can move from a concept to directly related concepts and understand why each connection is shown. Provide a text/list navigation equivalent; do not make a large canvas the only way to navigate. On mobile, focus on the selected concept and reveal relationships progressively.

**R-04: One educational memory experiment.** The user receives clear instructions and can start, pause/exit where appropriate, and retry. The task should support keyboard and touch, offer an untimed/instruction alternative, and not depend on color, sound, or a microphone. Explain that task conditions influence performance.

**R-05: Transparent, deterministic result.** The result reports observable task metrics (for example, correct trials out of total and the task settings). The same inputs produce the same score. Do not use percentiles, IQ/EQ scores, generalized ability labels, diagnosis, or claims of improvement from one session.

**R-06: Interpret with restraint.** Explain what was practiced/measured and what cannot be inferred. State that one short session is not a validated measure of general memory, intelligence, health, or future performance. Results are not compared with other users.

**R-07: Evidence at the point of learning.** Link relevant claims to source details, population, outcome, limitations, date, and evidence-level rationale. Do not show a citation badge without a source that supports the exact nearby claim.

**R-08: Privacy by default.** First-slice performance may remain in current session memory; do not send it to a server or AI. If future persistence is added, expose inspect/reset controls and update the privacy notice before release.

**R-09: Useful without AI.** Every P0 journey is available with AI disabled and when a provider is unreachable. The first slice may ship before any AI integration.

**R-10: Responsive and accessible.** Build for small and large screens, keyboard, touch, screen readers, readable text, visible focus, adequate contrast, reduced motion, and an accessible alternative to time pressure. Verify with actual manual checks as well as automated tests.

**R-11: Vercel-ready from the project root.** The application lives under `cognitive-fitness/` and can be selected as the Vercel project root directory. A clean install, lint, tests, and production build are repeatable locally and in deployment. The initial experience requires no environment secrets.

### P1 — next after the first slice is verified

- **Audit, repair, and grow the existing game portfolio.** Inspect the source for the linked games before deciding what to preserve, refactor, or rebuild; add a tested shared engine for session lifecycle, difficulty, seeded challenge generation, scoring, results, keyboard/touch accessibility, and failure handling. Ship a substantial set of genuinely playable games across memory, attention, reasoning, problem solving, processing speed, creativity, and learning—not placeholder cards.
- **Goal-driven training (S9 prototype delivered).** The current `/train` slice offers four authored four-week schedules with week-focused activities, feedback, optional rest/review, pause/resume/stop, and separate goal/task records. Evidence-reviewed curricula and adaptive pathways remain future work. Keep goal completion, game score, and claims about transfer as separate concepts.
- **Local-first progress (S9 partial).** The prototype offers opt-in goal/schedule/session storage, inspection grouped by activity, JSON export, clear, and storage-failure fallback. It does not compute standardized baselines, normalized trends, or cross-seed personal bests; explain item-set variability, practice/device effects, and the absence of real-world transfer data.
- **Competitive play.** Add fixed-rule daily/weekly challenges and shareable friend challenges. Consider leagues/tournaments and global rankings only after the user confirms the desired mode and identity, fairness, anti-cheat, moderation, age, privacy, and abuse-response requirements are designed. Rankings must remain game/event-specific and opt-in.
- Additional evidence-backed cognitive and learning pathways using the same content model.

### P2 — defer until there is user evidence, owner decisions, and a reviewed design

- Public accounts, remote profile/history, cross-device synchronization, public leaderboards, real-time multiplayer, social/community features, long-term personalization, broad assessments, a provider marketplace, or analytics beyond minimal privacy-reviewed operational metrics.
- Optional AI tutor/coach and voice, only after the underlying games, content, privacy boundaries, and tool/security architecture are proven; neither is a prerequisite for training.
- Deeper whole-person learning and practice pathways for sleep, movement, stress, emotional/social development, nutrition, habits, recovery, creativity, and healthy aging. The `/develop` atlas now provides a broad, shallow entry point with optional starters; build and review substantive domain modules individually rather than treating the directory or its prompts as validated advice or curricula.
- Clinical, diagnostic, treatment, or medical-risk claims are outside the product scope, not a later feature tier.

## First journey acceptance checklist

- [ ] Can start the experience without account, AI, microphone, or permissions.
- [ ] Concept and related concepts are understandable at beginner depth and navigable with a keyboard and on mobile.
- [ ] The activity instructions state its purpose and limitations before it begins.
- [ ] Activity scoring is deterministic and covered by tests for normal, boundary, repeated, and invalid input.
- [ ] Results state exact task metrics and avoid diagnosis, population ranking, IQ/EQ, or broad improvement claims.
- [ ] At least one evidence card links claim → source → population/outcome → limitation.
- [ ] The user can continue to a relevant next concept or return to Explore.
- [ ] No activity or result data leaves the browser in the first slice.
- [ ] The production build works with the documented Vercel-compatible commands and no AI keys.
- [ ] Keyboard, screen-reader labels, reduced motion, contrast, small-screen layout, and a non-timed/non-audio path are manually reviewed.

## Expansion acceptance gates — games, goals, and competition

- [ ] Audit the full source repository for the games linked from the existing public site; document what is reused, repaired, replaced, or deferred before migration.
- [ ] Publish only fully playable games. Each has task-specific instructions, difficulty/settings, a deterministic or clearly described scoring rule, retry/exit, results, accessibility alternatives, and transparent evidence/limitation copy.
- [ ] Provide a coherent portfolio spanning multiple domains; puzzle solvers, educational exercises, and outcome-oriented health content are distinct categories rather than one undifferentiated “brain score.”
- [ ] Let a user define an achievable behavior/learning goal and see a realistic program, schedule, rest/recovery option, and review point. Never promise a goal will increase IQ or general ability.
- [ ] Fixed-seed challenges specify game version, rules, settings, and scoring so scores are comparable only within that event. Distinguish self-reported/shareable scores from server-verified ranked results.
- [ ] Competitive features are opt-in, game-specific, accessible, non-punitive, and removable. The noncompetitive core remains available without an account.
- [ ] Before public or real-time competition, decide account/pseudonym, moderation/reporting, anti-cheat, child-safety, data retention/deletion, costs, and Vercel-compatible architecture with the product owner.

## Success measures (not vanity metrics)

Evaluate whether users can find a concept, accurately explain what the task measured, locate its evidence/limitations, complete or leave an activity without losing context, and use the interface across devices/assistive settings. Do not optimize for time-on-site, compulsive streaks, or unsupported cognitive-change metrics.
