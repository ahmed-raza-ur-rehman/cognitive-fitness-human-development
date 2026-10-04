import type { GameId } from "@/features/training/training-engine";

export type GoalId = "memory" | "attention" | "reasoning" | "balanced";

export type ProgramWeek = {
  title: string;
  focus: string;
  activityIds: GameId[];
};

export type GoalProgram = {
  id: GoalId;
  name: string;
  purpose: string;
  description: string;
  weeklyTarget: number;
  durationWeeks: number;
  activityIds: GameId[];
  weeks: ProgramWeek[];
  feedback: string;
  recoveryOption: string;
  reviewPrompt: string;
  rationale: string;
};

export const GOAL_PROGRAMS: GoalProgram[] = [
  {
    id: "memory",
    name: "Explore memory",
    purpose: "Establish a self-paced routine exploring sequence and spatial-pattern recognition.",
    description: "A four-week rotation between number sequences and labelled grid patterns.",
    weeklyTarget: 2,
    durationWeeks: 4,
    activityIds: ["sequence", "matrix-memory"],
    weeks: [
      { title: "Try sequence recall", focus: "Explore the self-paced number-sequence task and notice which study approach feels useful.", activityIds: ["sequence"] },
      { title: "Try spatial patterns", focus: "Explore the labelled grid task. Take as long as you need before hiding the pattern.", activityIds: ["matrix-memory"] },
      { title: "Choose your mix", focus: "Alternate the two task formats if they fit your schedule; skipping is allowed.", activityIds: ["sequence", "matrix-memory"] },
      { title: "Review the routine", focus: "Look back at which activity and schedule felt sustainable—not whether a score proves broader change.", activityIds: ["sequence", "matrix-memory"] },
    ],
    feedback: "After each item, the activity shows whether your choice matches the key and provides a short explanation. Session totals describe that item set only.",
    recoveryOption: "Rest, shorten a session, or skip a week. There are no streaks or penalties.",
    reviewPrompt: "Which activity and pace fit your routine? What, if anything, would you keep, change, or stop? Task scores do not answer whether memory changed in daily life.",
    rationale: "A voluntary practice-and-learning routine; not a promise of improved memory or transfer.",
  },
  {
    id: "attention",
    name: "Practice attention",
    purpose: "Explore unhurried target finding and simple alternating classification tasks.",
    description: "A four-week rotation between static visual search and untimed rule switching.",
    weeklyTarget: 2,
    durationWeeks: 4,
    activityIds: ["visual-search", "rule-switch"],
    weeks: [
      { title: "Scan at your pace", focus: "Try a static letter grid without a countdown; stop if it feels visually uncomfortable.", activityIds: ["visual-search"] },
      { title: "Read each rule", focus: "Try the alternating number/letter set by attending to the rule text on every item.", activityIds: ["rule-switch"] },
      { title: "Alternate or repeat", focus: "Choose either activity, or take a rest week. Repetition is optional.", activityIds: ["visual-search", "rule-switch"] },
      { title: "Review your fit", focus: "Review whether the activity and schedule worked for you; do not treat scores as an everyday-attention measure.", activityIds: ["visual-search", "rule-switch"] },
    ],
    feedback: "Each response is followed by item-level correctness and an explanation of the target or rule. It is feedback on that set, not a measure of everyday attention.",
    recoveryOption: "Rest or pause whenever you want; there is no time limit, streak, or missed-session penalty.",
    reviewPrompt: "Which format was accessible and worth repeating? Did the schedule fit your week? This task cannot diagnose or measure daily attention.",
    rationale: "Progress is optional routine participation, not a clinical or everyday-attention score.",
  },
  {
    id: "reasoning",
    name: "Practice reasoning",
    purpose: "Explore different small reasoning and problem-solving formats with explanations.",
    description: "A four-week rotation across number patterns, stated-premise logic, untimed arithmetic, and route puzzles.",
    weeklyTarget: 3,
    durationWeeks: 4,
    activityIds: ["pattern", "logic", "mental-math", "planning-puzzle"],
    weeks: [
      { title: "Explore patterns", focus: "Try a few simple number-rule items and read each explanation.", activityIds: ["pattern"] },
      { title: "Use stated premises", focus: "Separate what follows from what is merely possible in short text questions.", activityIds: ["logic"] },
      { title: "Try applied puzzles", focus: "Choose untimed arithmetic or constrained-route puzzles; any method is allowed.", activityIds: ["mental-math", "planning-puzzle"] },
      { title: "Review and choose", focus: "Review which format you want to continue. A task score is not a general reasoning measure.", activityIds: ["pattern", "logic", "mental-math", "planning-puzzle"] },
    ],
    feedback: "Each response is followed by a keyed answer and worked explanation. Results stay tied to the specific pattern, logic, arithmetic, or route set completed.",
    recoveryOption: "Take rest days or a rest week; no item is timed and missed targets carry no penalty.",
    reviewPrompt: "Which reasoning format was enjoyable or useful to learn from? Which explanations helped? Do not infer general intelligence or real-world transfer from scores.",
    rationale: "A varied task-practice routine; not a claim about general reasoning ability or far transfer.",
  },
  {
    id: "balanced",
    name: "Balanced exploration",
    purpose: "Explore the current catalog without treating it as coverage of all cognition or human development.",
    description: "A four-week tour across memory, attention, reasoning, and problem-solving prototypes.",
    weeklyTarget: 3,
    durationWeeks: 4,
    activityIds: ["sequence", "matrix-memory", "visual-search", "rule-switch", "pattern", "logic", "mental-math", "planning-puzzle"],
    weeks: [
      { title: "Memory formats", focus: "Explore self-paced number sequence and spatial-pattern activities.", activityIds: ["sequence", "matrix-memory"] },
      { title: "Attention formats", focus: "Explore static target finding or read-the-rule classification; either can be skipped.", activityIds: ["visual-search", "rule-switch"] },
      { title: "Reasoning formats", focus: "Explore number patterns, deduction, arithmetic, or route puzzles.", activityIds: ["pattern", "logic", "mental-math", "planning-puzzle"] },
      { title: "Review and choose", focus: "Choose a small routine you would willingly continue, or stop the plan.", activityIds: ["sequence", "matrix-memory", "visual-search", "rule-switch", "pattern", "logic", "mental-math", "planning-puzzle"] },
    ],
    feedback: "Every game gives item-level feedback and an explanation. Totals remain separate for each activity; different games are not combined into a general score.",
    recoveryOption: "Rest or skip any task; all suggestions can be ignored and the product remains usable without a plan.",
    reviewPrompt: "Which activity would you keep, change, or stop? Did the schedule fit your life? The catalog does not represent the whole of cognition or development.",
    rationale: "A user-selected variety goal. It does not imply the tasks cover all of cognition or human development.",
  },
];
