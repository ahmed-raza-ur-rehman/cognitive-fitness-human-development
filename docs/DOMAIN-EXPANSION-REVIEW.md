# S11 domain expansion review — sleep and recovery

- **Reviewed:** 2026-10-04
- **Content graph:** `content/knowledge-v1.json` version `1.2.0`
- **Decision:** Add one educational sleep-and-recovery pathway, linked to memory and learning, with a local-only sleep-opportunity clock calculator. This is not a sleep intervention, medical product, or validation of a new practice technique.

## User need and selected slice

The product brief names sleep and recovery as whole-person foundations that should connect to learning and practice rather than become another disconnected catalog page. A learner may want to understand what sleep research does—and does not—say about memory, and sketch how a self-chosen time window sits relative to a wake time. The route `Explore → Sleep and recovery → memory / learning → evidence → optional calculator → separate practice goals` addresses that question without a questionnaire, account, health diary, or claim that sleep can be optimized by this app.

The tool performs clock arithmetic only. It does not select the user's sleep duration, make a bedtime recommendation, track sleep, or feed the existing training goal/session system. Links to `/train#goals` and the memory/learning routes are navigation only; no sleep value or recovery outcome is attached to a goal.

## Claim-by-claim evidence review

The population, outcome, study design, grade, source IDs, and limitation IDs are also recorded beside each claim in `content/knowledge-v1.json`. The grade is a compact judgment about each narrow claim—not a prediction for an individual.

### `claim.sleep-duration-guideline` — grade B

**Surface wording:** A joint American Academy of Sleep Medicine and Sleep Research Society consensus statement recommends that healthy adults aged 18–60 obtain at least 7 hours of sleep per night on a regular basis to promote optimal health. This refers to sleep duration, not time reserved in bed.

- **Population / outcome:** Healthy adults aged 18–60; a general sleep-duration benchmark intended to promote health. It is not a personalized target, treatment outcome, or claim about cognitive training.
- **Design / evidence quality:** 2015 joint AASM/SRS consensus statement. A 15-expert panel used a modified RAND Appropriateness Method, reviewed 5,314 articles, and reached a recommendation through multiple rounds of review, discussion, and voting. This is a professional-society recommendation informed by a broad literature review, not one randomized trial.
- **Why grade B:** A well-defined consensus recommendation supports a population-level benchmark, while individual sleep need and broader sleep quality/timing/regularity are not captured by the simple duration threshold. The source says individual variability is influenced by genetic, behavioral, medical, and environmental factors.
- **Uncertainty / limits:** The population is explicitly adults aged 18–60; do not apply the number as an individualized target for children or all older adults. The statement itself says people concerned they sleep too little or too much should consult a healthcare provider. A time window in the planner is not equivalent to time asleep.
- **Source:** Watson et al. (2015), `source.watson-2015`, DOI [10.5665/sleep.4716](https://doi.org/10.5665/sleep.4716), [full text in PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/).

### `claim.sleep-memory-review` — grade C

**Surface wording:** A review of 19 systematic reviews and meta-analyses reported sleep-related benefits for some measured memory outcomes in healthy, neurotypical children and adults. Findings varied by memory type and age; these studies do not show that a schedule tool or one sleep change will improve everyday learning.

- **Population / outcome:** Healthy, neurotypical children and adults represented in the underlying reviews; particular memory-consolidation and experimental task outcomes, not general ability, grades, or an individual health outcome.
- **Design / evidence quality:** Weighall and Kellar's 2023 review identified 19 systematic reviews and meta-analyses. It is a review of reviews, not a pooled effect estimate. The authors explicitly state that it is not a formal umbrella review: the search was PubMed-only and English-only, relevant abstract screening was single-reviewed, and there was no formal quality appraisal of included reviews.
- **Why grade C:** The review summarizes a substantial body of existing work, but its own search and appraisal limitations and the variation among the underlying age groups, tasks, and sleep conditions make a broad practical conclusion inappropriate.
- **Uncertainty / limits:** The reviewed findings differ by memory type and age; the review describes weaker/less consistent findings in some older-adult and child procedural-memory contexts. Its experimental outcomes do not establish better everyday learning, educational achievement, cognitive transfer, or an effect of this product.
- **Source:** Weighall & Kellar (2023), `source.weighall-kellar-2023`, DOI [10.1042/ETLS20230110](https://doi.org/10.1042/ETLS20230110), [publisher article](https://portlandpress.com/emergtoplifesci/article/7/5/513/234981/Sleep-and-memory-consolidation-in-healthy).

### `claim.sleep-deprivation-memory` — grade B

**Surface wording:** In a meta-analysis of laboratory studies of healthy adults, at least one full night of total sleep deprivation after learning was followed by poorer later memory-task performance than a normal-sleep control on average (Hedges’ *g* = 0.277, 95% CI [0.177, 0.377]). This does not estimate the effect of ordinary schedule changes or this planner.

- **Population / outcome:** Healthy adults aged 18 or older in the 45 post-learning reports (1,616 participants); the age data available were concentrated among young adults. The 130 effect sizes measured later performance on experimental memory tasks (109 declarative, 21 procedural), not daily functioning or school/work outcomes.
- **Design / evidence quality:** Newbury et al. (2021) conducted two meta-analyses of acute total sleep deprivation before and after learning. This claim uses the post-learning analysis: at least one full night without sleep versus a normal-sleep control, analyzed with a multilevel random-effects model. Studies were identified from English-language human research published from 1970–2020.
- **Why grade B:** The controlled experimental contrast is narrow and directly tested; the pooled post-learning effect was small-to-medium on average. It does not establish an effect for partial restriction, a sleep schedule, ordinary nights, or the calculator.
- **Uncertainty / limits:** The source found significant effect-size heterogeneity, evidence of funnel-plot asymmetry consistent with publication bias, and very low power in most included studies (mean about 14% to detect the pooled effect). Age representation beyond young adults was limited. Recovery-sleep timing and memory type also moderated results. The pooled estimate should not be treated as an individualized forecast.
- **Source:** Newbury et al. (2021), `source.newbury-crowley-2021`, DOI [10.1037/bul0000348](https://doi.org/10.1037/bul0000348), [full text in PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8893218/).

## Additional source check and safety wording

The [CDC's public sleep guidance](https://www.cdc.gov/sleep/about/index.html) was opened as a cross-check of age-specific sleep-duration ranges and the instruction to talk with a healthcare provider about sleep problems. Its age bands are not substituted for the narrower AASM/SRS claim shown in this pathway. The product's explicit care boundary uses the AASM/SRS statement's advice to consult a provider about concern that one is sleeping too little or too much.

No claim is made here about an ideal bedtime, sleep-stage manipulation, a specific habit or device, treatment of insomnia or another disorder, or a guaranteed learning effect. The pathway does not advise changing medication or delaying care. Persistent or concerning personal health questions belong with a qualified healthcare professional.

## Calculator behavior and boundaries

- Inputs: a local clock wake time and a user-selected window from 0.5–16 hours in half-hour steps. The displayed range is an arithmetic input bound, not a recommended duration.
- For windows below 7 hours, the calculator suppresses a start-time result and explains that such a window cannot provide 7 hours of actual sleep for the specific AASM/SRS adult population—even if every minute were spent asleep. This is not an individualized assessment.
- For longer windows, the calculator subtracts the chosen number of minutes from the entered wake time and labels whether the result falls on the same or previous day. It clearly states that time reserved can include time awake and does not establish actual sleep.
- The React component keeps entries in transient page state only. There is no local storage, account, network request, sleep diary, score, health inference, or linkage to `/train` history. A user can clear both fields; leaving/reloading the page discards them.
- `activity.sleep-opportunity-planner` has no measures and an empty `efficacyEvidenceIds`. The graph explicitly lists what it does not measure and why the clock calculation is not a clinical tool.

## Journey, accessibility, and integration review

- `/explore` includes Sleep and recovery in the same concept directory as memory and learning. Labeled, explicitly non-causal graph relationships connect the sleep pathway to memory and learning.
- The sleep route puts a plain-language boundary and provider direction before the optional calculator, then presents claim cards with source, population, outcome, design, and limitations.
- The calculator uses native time/number inputs with persistent labels and instructions, a keyboard-operable clear button, a text status announced politely, no timer, and no color-only meaning. Layout is responsive in a CSS module, and controls/links have at least 44px minimum height where practical.
- The next-step links return to memory, learning evidence, or a separate existing practice goal; they do not assert a causal effect or store sleep inputs in that goal.
- Automated interaction, route, graph-reference, TypeScript, and lint checks are included in the S11 handoff. A manual screen-reader, high-zoom, contrast, or assistive-technology review was not performed; this remains a pre-release task.

## Review trail and limits of this review

The AASM/SRS and Newbury full texts were opened and checked in PubMed Central; the Weighall/Kellar publisher article and repository metadata were checked; the CDC official page was opened for its public guidance and care wording. Exact populations, designs, outcomes, age boundaries, effect estimate, and source limitations were recorded above and in the graph. This was a focused product review, not an exhaustive systematic search or a clinical review. The product/evidence/UX/quality passes were performed by one Arena coding agent; there was no independent clinician or second scientific reviewer. Obtain independent subject-matter review before presenting this as clinical guidance or expanding into behavior recommendations. Recheck sources and wording whenever the population, claim, intervention, or use changes.
