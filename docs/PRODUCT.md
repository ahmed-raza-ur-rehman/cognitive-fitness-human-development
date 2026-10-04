# Product brief

## Product thesis

**A living, interactive map of human cognition and development, where people can explore their own questions, experience useful demonstrations, and learn alongside a scientifically honest guide.**

The product should feel like a cognitive-science environment that combines an interactive textbook, knowledge explorer, experiment lab, training space, and optional AI mentor—not an arcade of disconnected brain games and not a generic chatbot.

## Who it serves

- Curious beginners who want plain-language explanations of memory, attention, emotion, learning, the brain, and behavior.
- Students and serious learners in psychology, neuroscience, cognitive science, education, medicine, social science, and adjacent fields.
- People pursuing self-development in learning, focus, reasoning, metacognition, emotional skills, communication, and sustainable habits.
- Older adults interested in learning, activity, social engagement, and cognitive maintenance.

No audience should be assumed to have specialist vocabulary or high technical literacy. Each concept should offer progressive depth: **simple → practical → academic → technical → research**.

## Experience modes

The modes are connected views of one knowledge and development system—not unrelated product silos.

- **Explore:** navigate concepts and relationships in a cognitive/human-development knowledge graph.
- **Learn:** follow structured paths and understand how concepts connect.
- **Lab:** try educational experiments and inspect what they do and do not show.
- **Train:** practice a well-defined skill with clear instructions and deterministic scoring where possible.
- **Assess:** view cautious, non-clinical performance snapshots and personal trends.
- **Coach / Live:** optionally converse with an AI mentor that can open a concept, graph, experiment, evidence card, or progress view through validated tools.
- **Research:** inspect claims, sources, methods, populations, and limitations.
- **Reflect:** develop metacognition through predictions, confidence, and post-activity reflection.
- **Lifestyle:** explore sleep, physical activity, stress, nutrition, habits, social connection, and recovery as interacting foundations.
- **Goals & Programs:** choose a meaningful learning or practice goal, follow a realistic sequence of education, training, recovery, and reflection, and review observable progress without being promised a change in general ability.
- **Challenges & Competition:** opt into fixed-rule daily/weekly challenges, friend challenges, leagues, or tournaments. Competition belongs to a specific game and event—not a ranking of a person's intelligence, health, or worth.

## Goals, programs, and competitive play

The platform should help users pursue a goal, not merely accumulate games. A goal should be concrete and user-owned (for example, “practice reasoning twice this week” or “complete the Memory Foundations pathway”), with a clear schedule, optional activities, appropriate rest, reflection, and a review point. Measure goal completion and task-specific performance separately from any claim about real-world transfer.

Competition should be engaging but optional and fair:

1. **Solo mastery:** personal bests and private milestones.
2. **Shared challenge:** fixed, versioned daily/weekly challenge rules so participants receive the same task; friend challenges can start with a shareable challenge code.
3. **Leagues/tournaments:** opt-in pseudonymous competition, with the ranked metric limited to the named game/mode and explicit event rules.
4. **Real-time multiplayer:** a later mode only if the user confirms it is wanted and the team can support moderation, anti-cheat, accessibility, privacy, and reliable live infrastructure.

A rank is a rank in that game under those rules; it is not a cognitive assessment. Always provide a noncompetitive path, private/anonymous settings, a way to leave/clear participation, and protections against harassment and score manipulation. Avoid loot boxes, forced streaks, FOMO, punitive loss loops, and notifications designed to maximize time-on-site. Do not launch a public leaderboard before fairness, identity, age, retention, reporting, and abuse-response rules are settled.

## Current implementation snapshot (prototype)

The build includes the concept → self-paced recall → evidence journey; a `/develop` atlas with 14 pathways across four clusters; eight product-native `/train` activity modes; four user-owned four-week schedules with optional local session history; CF1/CF2/CF3 challenges whose shared results remain self-reported and unverified; a `/progress` page that describes saved local sessions per activity with counts, ranges, and cadence only; six `/journeys` guided paths that compose existing pages into `understand → experience → inspect → practice → apply → reflect` sequences; a browser-side `/search` over the site's own reviewed content; one shared page structure (breadcrumbs, page purpose, primary action, boundary, and a registry-driven "where this leads" region) built on `content/routes-v1.json`; expanded reading preferences applied before first paint; and an optional `/coach` workspace that defaults to device-only mode, offers an operator-configured OpenAI path (disabled unless configured), and offers an opt-in user-pays Puter.js path with no app-held key. There is no account, database, or public ranking; challenge results are self-reported; the atlas is an orientation map rather than a validated curriculum; and the deeper per-domain pathways, expert review, manual accessibility verification, and release gates in `docs/RELEASE-CHECKLIST.md` remain open. See `docs/EXPERIENCE-SYSTEM.md` for the structure contract and `docs/AI-PUTER-REVIEW.md` for the AI paths.

## Signature journey

A useful first experience should connect knowledge to action:

1. Arrive without an account or setup questionnaire.
2. Choose a question or concept (for example, memory or attention).
3. See a clear explanation and a small, navigable map of related concepts.
4. Choose an optional, accessible educational experiment.
5. Receive deterministic results with an explanation of what was measured, what the result means, and what it cannot establish.
6. Inspect relevant evidence and limitations.
7. Continue to a related concept, exercise, or optional AI-guided explanation.

A candidate first vertical slice is **Explore memory → inspect a simple memory map → try a short recall demonstration → see transparent results and limitations → follow one evidence-linked relationship**. Stage `S1` confirms the audience, scientific framing, and acceptance criteria; this candidate is not a claim that the demo is a validated assessment.

## AI is an interface, not a dependency

The AI mentor should feel calm, curious, encouraging, and rigorous. It should be honest that it is AI and should not claim feelings, consciousness, clinical expertise, or access to information it does not have. It should teach users to think, not only give answers.

The distinctive interaction is **shared workspace + explicit tool calls**, not a chat bubble that merely describes imaginary actions. A validated action may open a concept, highlight graph nodes, start an experiment, show progress, or reveal evidence. Tool results and user data—not model invention—must determine displayed scores. Voice/avatar are optional future affordances; the whole product remains usable without microphone access, audio, or AI.

Support these modes over time: no-AI core, low-friction provider, explicitly user-authorized provider, and (only if needed) secure server-side provider. Google authentication is not authorization to use Gemini or a user's API quota.

## Product qualities

- **Low friction:** useful exploration before login; minimum clicks and setup.
- **Low visual load:** calm hierarchy, whitespace, focused panels, useful diagrams, restrained motion.
- **Immersive but honest:** visualizations should clarify relationships and be labeled as simplified where relevant; no fabricated anatomical precision.
- **Inclusive:** responsive on phone, tablet, and desktop; keyboard/touch/screen-reader use; readable type, focus states, contrast, reduced motion, captions, and non-audio alternatives.
- **Reliable:** offline/local core where practical, deterministic scoring, graceful provider/network/storage failures.
- **Whole-person:** cognition is presented in context with psychological, physical, behavioral, social, and environmental foundations.

## Boundaries and non-goals

- No claims that a game raises IQ, globally increases intelligence, treats a condition, or prevents disease without strong evidence for the exact claim and careful qualification.
- No fake IQ/EQ scores, medical diagnoses, mental-health treatment, or interpretation of ordinary task scores as a clinical profile.
- No unlimited/free-AI promise; provider pricing, limits, permissions, and data flows must be verified before launch.
- No mandatory account, microphone, provider login, or AI to use basic learning and activities.
- No dashboards, streaks, XP, or notifications designed to maximize engagement at the expense of well-being. Optional goals, mastery milestones, and competitive game modes are allowed only when transparent, user-controlled, accessible, and not presented as evidence of broad cognitive change.
- No huge launch feature set. Prove one end-to-end journey, then expand through repeatable evidence and quality gates.

## How to judge success

Early success means a new user can enter without signup, understand a concept, complete an accessible activity, interpret its result accurately, inspect credible evidence, and choose what to explore next. Longer-term success also includes users choosing and completing meaningful learning/training goals, a healthy return cadence, fair participation in optional challenges, and enjoyment across a broad game portfolio. Evaluate usability, goal completion, accessibility, reliability, comprehension, fair play, and data transparency—not unsupported claims of cognitive improvement or raw time-on-site.
