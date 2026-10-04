# UX flows — first memory-learning slice

**Status:** approved blueprint for the prototype; refine with user testing before production.

## Experience principles

- **Start with curiosity, not configuration.** No signup, profile quiz, provider choice, or dashboard gate.
- **A calm laboratory, not an arcade.** Use a restrained dark/neutral canvas with one warm/cool accent, strong typography, generous spacing, small purposeful diagrams, and gentle motion only when it clarifies state. No pulsing brain art, loud gradients, scores-as-rewards, streak pressure, or fake anatomical imagery.
- **One thing at a time.** Keep the current concept or task prominent; secondary explanations, evidence details, and related concepts are available on demand.
- **Beginner first, depth on request.** Use direct language with concise technical explanations expandable below it.
- **Always tell the truth about what is happening.** Explain why a task is shown, what its result reports, what is stored, and what cannot be inferred.
- **Visible, reversible control.** Users can go back, stop, retry, or leave an activity without losing the public knowledge page.

## Information architecture for the prototype

Keep the initial navigation narrow and real:

- **Home:** product thesis + one primary entry into Explore.
- **Explore:** Memory concept with a small interactive, text-equivalent relationship map.
- **Lab:** a short recall demonstration reachable from the concept explanation.
- **Evidence:** source and limitations linked directly to the relevant claim.

Do not display inactive placeholders for Coach, Assess, Programs, or Lifestyle. Those are roadmap capabilities, not empty screens.

## Primary journey

```text
Home
  → Explore memory
    → Read the simple explanation
    → Select a related concept or “Try a short recall activity”
      → Read purpose + limits + instructions
      → Reveal a small list at the user's pace
      → Choose “Hide list and recall”
      → Enter recalled words without a time limit
      → See the answer and raw result
      → Read “what this can/cannot tell you”
      → Open the evidence card or return to a related concept
```

The task is explicitly a **self-paced educational demonstration**. It does not measure working-memory capacity, use a normative threshold, or compare people. The user decides when the list is hidden; the activity does not pretend to control exposure time.

## Screen and state details

### 1. Home

- Masthead with working-title wordmark and simple Explore/Lab navigation.
- One plain headline and one primary CTA: **Explore memory**.
- Secondary explanation of the loop: explore a concept → try a short demo → follow the evidence.
- Small trust line: no account required; educational, not diagnostic; no AI required.
- No dashboard, questionnaire, login modal, autoplay, or animated background.

### 2. Explore: Memory

- Page title, one-sentence description, beginner explanation, and “go deeper” control.
- A focused map of a handful of concepts (Memory, Working Memory, Attention, Encoding, Retrieval, Learning). Selected node has a clear textual description. Other nodes are direct, labeled links.
- Map interaction is optional: an equivalent list with the same labels/relationship descriptions is always available. Avoid drag-only and zoom-only navigation.
- A related “Try a short recall activity” link explains that it is a demonstration and starts no account or data collection.

### 3. Lab introduction

Before a task begins, tell the user:

- what they will do (view a short word list, hide it, recall any items);
- why it is included (experience one simple recall task and compare the task conditions);
- what the task measures (the number of listed items entered correctly for this single round);
- what it does not measure (overall memory, IQ, health, diagnosis, or a validated assessment);
- that the activity is self-paced and can be stopped or skipped.

Provide **Start** and **Back to concept** actions. No microphone, sound, timed-response countdown, or forced animation.

### 4. Experiment states

- **Ready:** clearly labeled instructions and Start action.
- **List visible:** short, readable list, with a user-operated **Hide list and recall** button. No auto-hide timer.
- **Recall input:** labeled text area or inputs, accessible submit button, no time limit, no color-coded feedback.
- **Result:** raw count (for example, “You recalled 4 of 6 words in this round”), expected list, and a short limitations statement. No grade, percentile, “brain age,” or comparison with other users.
- **Continue:** retry with an explicit note that repeated practice changes familiarity; return to concept; inspect evidence.

### 5. Evidence view

- Show the exact claim, source title/authors/year, DOI or stable URL, the population/outcome studied, and limitations.
- Evidence label is accompanied by its reasoning. Do not imply the source endorses this specific mini-game.
- Link back to the concept and let users close/return without losing their place.

## Training pilot flows — current slice and next stages

The `/train` route now implements user-selected four-week goal schedules → week-focused activity → task-specific result/review and an account-free friend challenge. Schedules are authored routines, not validated curricula or verified competition; see `TRAINING-PILOT.md` for boundaries.

### Goal → practice → review

```text
Choose one user-owned goal and its four-week schedule
  → see this week's focus, recovery/review details, and a matching activity suggestion
  → optionally pause, resume, stop, skip/rest, or choose another goal
  → complete a self-paced, untimed game
  → see task feedback/result and UTC-week adherence separately
  → optionally save the schedule and session history on this device
  → inspect by activity, export, or clear saved data
```

The pilot has memory, attention, reasoning, and balanced-exploration schedules, but the games are small task demonstrations. The goal is not “increase IQ.” Do not make failure to complete a schedule feel like personal failure. Evidence-reviewed curricula, private reflection capture, adaptive progression, and whole-person pathways remain future work.

### Daily challenge and weekly friend event

```text
Open /train
  → inspect the optional CF2 daily challenge, UTC date, game, fixed set, and untimed rules
  → for a friend event, optionally open “Create a weekly friend challenge”
  → use any catalog game without a goal, or choose only a game from the active practice goal
  → inspect the CF3 code, current game version, Monday–Sunday UTC window, and lack of server enforcement
  → explicitly copy an invite or play the same deterministic five-item set
  → optionally share an unverified CR1 correct/total report for that event
  → load a friend's event/result; comparison appears only when the exact event code and item count match
  → see accuracy for that game only; completion time is not ranked
  → leave, or use ordinary noncompetitive practice at any time
```

CF2 remains the rotating daily challenge across eight local games; legacy `CF1` links for the original four games remain reconstructible. `CF3` binds a Monday UTC start, game and current game version, seed, five-item correct-count scoring, no timer, and a following-Monday-exclusive window for starting a new run; an already-started set may finish afterward. When a goal is selected, the event picker offers only its activity set and only completed matching activities count toward adherence. `CR1` contains no identity, only an event code and claimed correct/total count. The browser checks dates and code shape for user feedback; it cannot enforce event time, identity, attempt limits, prevent altered scores, or create a verified rank. No challenge server, leaderboard, account, participant registry, or multiplayer exists. Invitations/result URLs disclose the shared codes to their recipient and may be present in browser/hosting request history. Public rankings and real-time competition require separate product approval and fairness, privacy, accessibility, anti-cheat, age-safety, moderation, retention, and operational review.

## Interaction and visual behavior

- Keep the primary action visible in the first viewport and use descriptive link/button labels.
- Use a compact concept map as navigation, not as a decorative brain diagram. Relationships are labeled; uncertain/associative relationships are not arrows implying causation.
- Motion is short and optional; prefers-reduced-motion removes nonessential transitions.
- Do not autoplay voices, request browser permissions, or start timers on page load.
- Preserve meaningful URLs for Explore and Lab so the user can share/bookmark content.
- Explore/Lab results remain session-only. The `/train` route adds a separate, explicitly opt-in local save for one goal and recent task summaries; there is no remote profile or account.

## Prototype review scenarios

1. A beginner arrives on a phone and finds the primary action without scrolling.
2. A keyboard-only user can move from Home through Explore, start/stop the lab, submit an answer, open evidence, and return.
3. A screen-reader user can understand the concept relationships without a visual graph.
4. A user who needs more time can inspect and hide the list when ready, then submit at their own pace.
5. A user sees a low result and does not infer a diagnosis or global memory score.
6. A user completes the experience when AI, audio, and sign-in do not exist.
