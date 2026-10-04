# S14 product review — whole-person development atlas

- **Reviewed:** 2026-10-04
- **Status:** S14 prototype implementation and automated verification complete; this remains a scoped role pass, not an external or independent review.
- **Product gap:** S11 delivered a useful sleep-and-recovery pathway, while the broader product brief covers cognition, learning, emotion, social life, health foundations, behavior, creativity, and development across the lifespan. A sleep-only pathway did not meet that broader intent.
- **Decision:** Add a navigable `/develop` atlas of 14 practical learning pathways. Every pathway offers at least one user-facing action and says what kind of action it is. This is a starting map, not a claim to have exhaustively covered human development or reviewed every intervention in the literature.

## Product principles

1. **Do not turn every human-development topic into a game.** A puzzle can provide task practice; movement, sleep, food access, relationships, and life context are not interchangeable with game training.
2. **Name the kind of support.** Each pathway is labeled as task-specific practice, an everyday skill practice, support/context, or learning/reflection. Only the first category is described as task-specific training, and its result remains tied to that task.
3. **Give a doable next action.** Each pathway has a short starter, a way to apply it or find appropriate support, something non-clinical to notice, and a visible limitation.
4. **Make evidence useful, not decorative.** Sources are linked beside claims and carry an explicit note about what they support and what they do not. Public-health recommendations and review-level evidence do not validate this application.
5. **Respect different people and circumstances.** Activities are optional, unhurried, and adaptable. No individual is expected to follow a single path or disclose sensitive information.
6. **No broad improvement promise.** The atlas does not generate IQ/EQ, personality, brain-age, health, or clinical scores; it does not claim disease prevention, treatment, or far transfer.

## Coverage map

| Cluster | Pathway | Topics represented | Useful offer in the prototype | Type / boundary |
|---|---|---|---|---|
| Think & learn | Memory and learning | Working and long-term memory, retrieval, spacing, feedback, comprehension and language learning | A recall–check–revisit recipe; reviewed memory/learning pages, word-recall lab, and relevant task practice | Learning strategy plus task-specific practice; not a global memory or intelligence score |
| Think & learn | Attention and executive skills | Sustained/selective attention, working memory, inhibition, switching, planning and organization | A one-task setup; links to unhurried Target Finder, Rule Switch, route puzzles, and optional schedules | Task performance is stimulus- and context-bound; not an ADHD screen or everyday-attention measure |
| Think & learn | Reasoning and decisions | Pattern finding, deduction, numeracy, problem solving, alternatives, uncertainty and evidence | A low-stakes decision checklist; links to pattern, logic, arithmetic and route activities with explanations | No standardized reasoning, judgment, or IQ score; puzzle performance is not far transfer |
| Think & learn | Metacognition and self-regulated learning | Confidence, calibration, strategy choice, monitoring, feedback and reflection | A predict–try–check routine with an optional private confidence judgment; no saved reflection | Research on prompts in learning settings does not establish an effect for this app or every learner |
| Think & learn | Creativity and curiosity | Questions, divergent ideas, constraints, iteration and creative practice | A three-ideas / one-small-experiment prompt, without judging the user's creativity | Open-ended practice, not a creativity test or guaranteed ability change |
| Feel & connect | Emotional awareness and regulation | Naming emotions, noticing context, response choice, self-kindness and emotional skills sometimes called EQ | A private notice–name–choose prompt; users need not enter feelings into the app | Educational self-reflection only; no EQ score, mental-health diagnosis, or therapy |
| Feel & connect | Stress, resilience and coping | Grounding, coping with difficult thoughts/feelings, values, support and recovery after adversity | A brief optional present-moment grounding practice, linked to the WHO self-help guide | May not suit everyone; does not remove danger or replace qualified care |
| Feel & connect | Social cognition, communication and connection | Listening, perspective-taking, empathy, non-verbal context, cooperation, conflict and relationships | A non-scored listening practice for a safe, ordinary conversation; links to WHO's multilevel social-connection report | No emotional mind-reading, personality/“social intelligence” score, or assumption that loneliness is an individual failure |
| Body & foundations | Sleep and recovery | Sleep opportunity, rest, recovery, daily timing and links to memory research | The existing sleep/recovery pathway and local clock-arithmetic planner | Not sleep tracking, an individualized sleep prescription, insomnia care, or a training target |
| Body & foundations | Movement, physical and sensory health | Movement, mobility, strength, balance, physical context, hearing and vision | A user-selected comfortable movement option and official age/ability-sensitive guidance | Not an exercise prescription, fitness score, or proof of cognitive change; adapt for personal needs |
| Body & foundations | Nutrition, hydration and energy | Nourishment, dietary variety, access, culture and hydration context | A non-judgmental access/meal-support reflection linked to WHO general principles | No calorie/weight tracking, restrictive diet, supplement recommendation, or personalized diet plan |
| Life, context & science | Habits, motivation and environment | Cues, routines, goals, values, friction, environment and sustainable planning | A small if–then plan with a user-chosen cue and an easier next action; no streak or penalty | A planning aid, not a validated behavior-change program or guarantee of adherence |
| Life, context & science | Brain, perception and consciousness | Nervous system, perception, attention, arousal, sleep/wake states, plasticity and consciousness | A question-and-evidence prompt; links to the existing concept/evidence map | Conceptual learning only; no scans, biomarkers, hidden mental-state inference, or direct “brain training” claim |
| Life, context & science | Lifespan, individual differences and healthy aging | Childhood through later life, development, neurodiversity, identity, learning context, aging and social conditions | A flexible life-stage question and source-comparison prompt; links to NASEM/NIA material | Not a developmental screen, dementia test, personality profile, or assumption of uniform decline |

## Shared user journey

1. Arrive from the main `Develop` navigation item or home-page entry point without signup.
2. Choose one of four clusters and scan the 14 pathway summaries.
3. Open a short starter activity, continue into a live `/explore`, `/train`, `/lab`, or `/evidence` experience when linked, or follow an official source.
4. Optionally add up to three pathways to a transient practice menu. The menu makes a small “try / apply / reflect” sequence; it assigns no dates, frequency, outcome, or health target.
5. Copy the generated public text, use the browser's own print/save controls if desired, or clear the menu. Nothing is stored by the atlas; there is no free-text journal or progress score.
6. Decide independently whether to repeat, adapt, or stop. For personal health or safety needs, use qualified local support.

## Intentional exclusions

- No all-in-one “brain score,” productivity score, personalized diagnosis, treatment plan, or claim of cognitive enhancement.
- No forced streak, schedule, optimization target, food log, sleep diary, medication advice, calorie count, social ranking, or body/health metric.
- No suggestion that difficult emotions, stress, loneliness, illness, disability, or structural barriers can be solved by an individual practice alone.
- No simulated expert, automatic wellness interpretation, or model-generated personal recommendation.
- No unreviewed third-party legacy game migration; the existing external-games repository remains inaccessible for source audit.

## Remaining domain work

The atlas gives every area a useful entry point but is intentionally shallow relative to a full learning curriculum. Future expansions should choose a user need, review the exact sources and audience for that domain, and build an end-to-end pathway with appropriate activities, accessibility, privacy, and subject-matter review. A directory card is not evidence of a validated intervention or of completion of the whole-person roadmap.
