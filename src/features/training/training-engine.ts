import type { GameDescriptor, ScoredQuestion } from "@/features/games/core/contracts";
import { scoreMultipleChoice } from "@/features/games/core/scoring";
import { seededShuffle } from "@/features/games/core/seeded-random";
import { GOAL_PROGRAMS } from "@/features/goals/programs";
import type { GoalId, GoalProgram } from "@/features/goals/programs";

export { GOAL_PROGRAMS };
export type { GoalId, GoalProgram };

export const GAME_IDS = ["sequence", "pattern", "visual-search", "logic", "matrix-memory", "mental-math", "rule-switch", "planning-puzzle"] as const;

export type GameId = (typeof GAME_IDS)[number];

export type TrainingQuestion = Omit<ScoredQuestion, "options"> & {
  prompt: string;
  options: string[];
  explanation: string;
  studyItems?: string[];
  studyMatrix?: boolean[][];
  matrix?: string[][];
  planningGrid?: string[][];
  ruleFamily?: "A" | "B";
  targetSymbol?: string;
};

export type TrainingActivity = Omit<GameDescriptor, "id"> & {
  id: GameId;
  description: string;
  practiceFocus: string;
  evidenceNote: string;
  minutes: number;
};


export type TrainingSessionRecord = {
  id: string;
  activityId: GameId;
  mode: "practice" | "challenge";
  correctCount: number;
  totalCount: number;
  completedAt: string;
  challengeCode?: string;
};

export type ChallengeVersion = "CF1" | "CF2";

export type DailyChallenge = {
  version: ChallengeVersion;
  dateKey: string;
  gameId: GameId;
  code: string;
  questions: TrainingQuestion[];
};

export const CHALLENGE_VERSION: ChallengeVersion = "CF2";
const LEGACY_CHALLENGE_VERSION: ChallengeVersion = "CF1";
const LEGACY_GAME_IDS = ["sequence", "pattern", "visual-search", "logic"] as const;
export const TRAINING_ENGINE_VERSION = "1.0.0";
export const TRAINING_STORAGE_KEY = "cognitive-fitness.training.v1";

export const ACTIVITIES: TrainingActivity[] = [
  {
    id: "sequence",
    version: "1.0.0",
    name: "Sequence Recall",
    domain: "Memory",
    rules: "Study a short number sequence for as long as you need, hide it, then recognize its exact order.",
    difficulty: "Five items from a small fixed bank; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct sequence-recognition items out of five.",
    measures: "Choices matching the studied number sequences in this set.",
    doesNotMeasure: "General memory, working-memory capacity, intelligence, health, or transfer to daily life.",
    accessibilityPath: "The sequence is a semantic ordered list; learners control when to hide it; answers use native buttons.",
    retryBehavior: "Start a fresh practice set; a daily challenge keeps its fixed question and option order.",
    timePressure: "none",
    description: "Study a short number sequence, hide it when you are ready, then recognize its exact order.",
    practiceFocus: "Visual sequence recognition",
    evidenceNote: "This is a short, unvalidated practice task. A result describes this task only; it does not measure general memory or predict transfer.",
    minutes: 4,
  },
  {
    id: "visual-search",
    version: "1.0.0",
    name: "Target Finder",
    domain: "Attention",
    rules: "Scan a small letter grid and count every instance of the named target.",
    difficulty: "Five small, static grids; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct target counts out of five.",
    measures: "Target-count answers for these static letter grids.",
    doesNotMeasure: "Everyday attention, visual acuity, ADHD, health, or transfer to daily life.",
    accessibilityPath: "The grid is a semantic table with text labels and no color-only distinction; answers use native buttons.",
    retryBehavior: "Start another practice set; challenge grids and option order are fixed by the challenge code.",
    timePressure: "none",
    description: "Scan a small letter grid and count a named target. There is no time limit.",
    practiceFocus: "Visual search and target detection",
    evidenceNote: "This is a small task-specific demonstration, not a validated attention assessment. Accuracy here does not establish everyday focus or broader transfer.",
    minutes: 4,
  },
  {
    id: "pattern",
    version: "1.0.0",
    name: "Pattern Predictor",
    domain: "Reasoning",
    rules: "Look for a simple stated-number pattern and choose the next item; read the explanation after each response.",
    difficulty: "Five items from a small fixed bank; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct next-item choices out of five.",
    measures: "Answers to these simple number-pattern items.",
    doesNotMeasure: "General reasoning ability, standardized-test performance, intelligence, or transfer.",
    accessibilityPath: "Prompts and choices are text; explanations are announced after each item; controls are native buttons.",
    retryBehavior: "Start a new practice set with deterministic shuffling from its seed.",
    timePressure: "none",
    description: "Look for a simple rule in a number pattern and choose what comes next.",
    practiceFocus: "Rule discovery in number sequences",
    evidenceNote: "Items use deliberately simple rules. Performance reflects these items in this session, not general reasoning ability.",
    minutes: 5,
  },
  {
    id: "logic",
    version: "1.0.0",
    name: "Logic Lab",
    domain: "Reasoning",
    rules: "Use only the stated premises to choose what must follow; do not add assumptions.",
    difficulty: "Five short, text-based deduction items; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct premise-based conclusions out of five.",
    measures: "Responses to this set of short deduction questions.",
    doesNotMeasure: "A standardized reasoning score, intelligence, judgment in daily life, or transfer.",
    accessibilityPath: "All premises, choices, and explanations are text; each answer is a native button.",
    retryBehavior: "Start another practice set; challenge questions and options remain fixed for that challenge version.",
    timePressure: "none",
    description: "Check what must follow from short statements, and separate a valid conclusion from a tempting guess.",
    practiceFocus: "Deductive reasoning with stated premises",
    evidenceNote: "These are educational practice questions, not a standardized reasoning test or a measure of intelligence.",
    minutes: 5,
  },
  {
    id: "matrix-memory",
    version: "1.0.0",
    name: "Grid Pattern Recall",
    domain: "Spatial memory",
    rules: "Study the marked cells in a grid at your own pace, hide it, then choose the matching coordinate set.",
    difficulty: "Five small four-by-four layouts with three or four marked cells; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct spatial-pattern recognition items out of five.",
    measures: "Choices matching these previously shown cell layouts.",
    doesNotMeasure: "General memory, spatial ability, navigation skill, intelligence, health, or transfer.",
    accessibilityPath: "The study pattern is a labelled semantic table with marked/empty cell names; answer choices are text coordinates in native buttons.",
    retryBehavior: "Start a fresh practice set; a challenge fixes its pattern and choice order.",
    timePressure: "none",
    description: "Study a small pattern of marked cells, hide it when ready, then recognize the matching layout.",
    practiceFocus: "Spatial-pattern recognition",
    evidenceNote: "This is an unvalidated task-specific memory game. A score applies only to these layouts and does not establish real-world spatial ability or transfer.",
    minutes: 4,
  },
  {
    id: "mental-math",
    version: "1.0.0",
    name: "Mental Math Studio",
    domain: "Numerical reasoning",
    rules: "Solve a short arithmetic or quantity problem without a countdown; use any method or a calculator if you prefer.",
    difficulty: "Five short items using addition, subtraction, multiplication, fractions, and percentages; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct answers to these arithmetic items out of five.",
    measures: "Responses to this small set of arithmetic practice questions.",
    doesNotMeasure: "Processing speed, mathematical aptitude, intelligence, educational attainment, or transfer.",
    accessibilityPath: "Problems are text, calculator use is allowed, and answer choices are native buttons; no timer or audio is used.",
    retryBehavior: "Start another set; review the worked explanation after each answer.",
    timePressure: "none",
    description: "Practice everyday arithmetic at your own pace and review a short worked explanation after each answer.",
    practiceFocus: "Untimed arithmetic practice",
    evidenceNote: "Correct answers describe this practice set only. The activity is not a measure of general numerical ability or processing speed.",
    minutes: 5,
  },
  {
    id: "rule-switch",
    version: "1.0.0",
    name: "Rule Switch",
    domain: "Cognitive flexibility practice",
    rules: "The rule alternates on each item between number parity and letter type; read the rule label every time before choosing.",
    difficulty: "Five alternating, two-choice classification items; no speed requirement.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct rule-based classifications out of five.",
    measures: "Answers to this alternating number/letter rule set.",
    doesNotMeasure: "Executive function as a trait, ADHD, everyday self-control, health, or transfer.",
    accessibilityPath: "Each rule and stimulus is stated in text on every item; the user advances manually; choices are native buttons.",
    retryBehavior: "Start a new five-item set with a deterministic starting rule and alternating sequence.",
    timePressure: "none",
    description: "Switch between two simple classification rules. Read each rule rather than relying on speed.",
    practiceFocus: "Alternating-rule classification practice",
    evidenceNote: "This small prototype is not a validated test of executive function or cognitive flexibility. It is untimed and task-specific.",
    minutes: 4,
  },
  {
    id: "planning-puzzle",
    version: "1.0.0",
    name: "Route Planner",
    domain: "Planning and strategy",
    rules: "Follow a small map from Start to Goal. Move only right or down and never enter a blocked cell.",
    difficulty: "Five short grid-route items with text-labelled start, goal, open, and blocked cells.",
    inputModes: ["keyboard", "touch", "screen-reader"],
    scoring: "Correct valid-route choices out of five.",
    measures: "Responses to these small constrained grid-routing puzzles.",
    doesNotMeasure: "General planning ability, navigation in daily life, intelligence, health, or transfer.",
    accessibilityPath: "The route map is a semantic table with explicit text labels for each cell; candidate routes are written out in native buttons.",
    retryBehavior: "Start another set; explanations identify the relevant constraint after every response.",
    timePressure: "none",
    description: "Plan a route through a small grid while respecting blocked cells and a simple movement rule.",
    practiceFocus: "Constrained route planning",
    evidenceNote: "These are recreational, task-specific route puzzles—not a validated planning or navigation assessment.",
    minutes: 5,
  },
];


const QUESTION_BANK: Record<GameId, TrainingQuestion[]> = {
  sequence: [
    sequenceQuestion("seq-1", ["4", "1", "8"], ["4 · 1 · 8", "4 · 8 · 1", "1 · 4 · 8", "4 · 1 · 6"], 0),
    sequenceQuestion("seq-2", ["2", "7", "3", "9"], ["2 · 7 · 3 · 9", "2 · 3 · 7 · 9", "7 · 2 · 3 · 9", "2 · 7 · 9 · 3"], 0),
    sequenceQuestion("seq-3", ["5", "0", "6", "2"], ["5 · 0 · 6 · 2", "5 · 0 · 2 · 6", "0 · 5 · 6 · 2", "5 · 6 · 0 · 2"], 0),
    sequenceQuestion("seq-4", ["8", "3", "1", "7", "4"], ["8 · 3 · 1 · 7 · 4", "8 · 1 · 3 · 7 · 4", "3 · 8 · 1 · 7 · 4", "8 · 3 · 7 · 1 · 4"], 0),
    sequenceQuestion("seq-5", ["6", "2", "9"], ["6 · 2 · 9", "6 · 9 · 2", "2 · 6 · 9", "6 · 2 · 7"], 0),
    sequenceQuestion("seq-6", ["1", "5", "0", "8"], ["1 · 5 · 0 · 8", "1 · 0 · 5 · 8", "5 · 1 · 0 · 8", "1 · 5 · 8 · 0"], 0),
    sequenceQuestion("seq-7", ["3", "8", "4", "1", "6"], ["3 · 8 · 4 · 1 · 6", "3 · 4 · 8 · 1 · 6", "8 · 3 · 4 · 1 · 6", "3 · 8 · 1 · 4 · 6"], 0),
    sequenceQuestion("seq-8", ["9", "2", "5", "7"], ["9 · 2 · 5 · 7", "9 · 5 · 2 · 7", "2 · 9 · 5 · 7", "9 · 2 · 7 · 5"], 0),
  ],
  pattern: [
    choiceQuestion("pat-1", "2, 4, 6, 8, …", ["9", "10", "12", "16"], 1, "Each step adds 2, so the next number is 10."),
    choiceQuestion("pat-2", "3, 6, 9, 12, …", ["14", "15", "16", "18"], 1, "Each step adds 3, so the next number is 15."),
    choiceQuestion("pat-3", "1, 4, 9, 16, …", ["20", "24", "25", "36"], 2, "These are square numbers: 1², 2², 3², 4². The next is 5², or 25."),
    choiceQuestion("pat-4", "1, 1, 2, 3, 5, …", ["6", "7", "8", "9"], 2, "Each term is the sum of the two before it: 3 + 5 = 8."),
    choiceQuestion("pat-5", "10, 7, 4, 1, …", ["−5", "−3", "−2", "0"], 2, "Each step subtracts 3, so the next number is −2."),
    choiceQuestion("pat-6", "2, 3, 5, 8, 12, …", ["15", "16", "17", "18"], 2, "The differences are +1, +2, +3, +4. Add 5 next to get 17."),
    choiceQuestion("pat-7", "5, 10, 20, 40, …", ["45", "60", "75", "80"], 3, "Each term doubles, so the next number is 80."),
    choiceQuestion("pat-8", "100, 50, 25, …", ["10", "12.5", "15", "20"], 1, "Each term is half the previous one, so the next is 12.5."),
  ],
  "visual-search": [
    matrixQuestion("vis-1", ["A M T A", "R A C M", "T M A R", "C T M A"]),
    matrixQuestion("vis-2", ["R C A T", "A M R C", "T A M R", "C R T A"]),
    matrixQuestion("vis-3", ["M T C R", "A R M T", "C A T M", "R M A C"]),
    matrixQuestion("vis-4", ["A C M R", "T R A C", "M A T R", "C M R T"]),
    matrixQuestion("vis-5", ["T M R A", "C A T M", "R C A T", "M T C R"]),
    matrixQuestion("vis-6", ["C A R M", "T M C A", "A R T M", "M C A R"]),
    matrixQuestion("vis-7", ["R T M C", "A C R T", "M A C R", "T M R A"]),
    matrixQuestion("vis-8", ["M R A T", "C T M A", "R A C M", "A M T R"]),
  ],
  logic: [
    choiceQuestion("log-1", "All tulips are plants. All plants need water. Which statement must be true?", ["All tulips need water.", "All plants are tulips.", "Only tulips need water.", "Some tulips do not need water."], 0, "If every tulip is a plant, and every plant needs water, then every tulip needs water."),
    choiceQuestion("log-2", "Some poets are teachers. All teachers read. Which statement must be true?", ["All poets are teachers.", "Some poets read.", "All readers are poets.", "No poets read."], 1, "At least some poets are teachers, and every teacher reads. Those poets therefore read."),
    choiceQuestion("log-3", "No squares are circles. This tile is a square. What follows?", ["The tile is a circle.", "The tile is not a circle.", "All tiles are squares.", "The tile is not a shape."], 1, "The tile belongs to a group that cannot be circles, so it is not a circle."),
    choiceQuestion("log-4", "Every red card is a circle. This card is red. What follows?", ["This card is a circle.", "Every circle is red.", "No circles are red.", "This card is not a shape."], 0, "The card is red, and all red cards are circles; therefore this card is a circle."),
    choiceQuestion("log-5", "Some hikers carry water. Everyone who carries water brings a bottle. Which must be true?", ["All hikers bring a bottle.", "Some hikers bring a bottle.", "No hikers carry water.", "Everyone with a bottle is a hiker."], 1, "The hikers who carry water also bring a bottle, so at least some hikers bring one."),
    choiceQuestion("log-6", "All Zorbs are Mips. No Mips are green. Can a Zorb be green?", ["Yes, every Zorb is green.", "No, Zorbs are Mips and no Mips are green.", "Only some Mips are green.", "The statements give no information."], 1, "Every Zorb is in the Mip group, and no member of that group is green."),
    choiceQuestion("log-7", "If the alarm is set, the light is on. The light is off. What follows?", ["The alarm is set.", "The alarm is not set.", "The light is broken.", "Nothing can follow."], 1, "If setting the alarm guarantees the light is on, an off light means the alarm is not set."),
    choiceQuestion("log-8", "Every P is Q. Some Q are R. Which statement must be true?", ["Some P are R.", "Every R is P.", "Every P is Q.", "No P is R."], 2, "‘Every P is Q’ is stated directly. The other choices add relationships not guaranteed by the premises."),
  ],
  "matrix-memory": [
    matrixMemoryQuestion("mem-1", ["1000", "0100", "0010", "0001"], ["R1C1, R2C2, R3C3, R4C4", "R1C1, R2C3, R3C2, R4C4", "R1C2, R2C2, R3C4, R4C4", "R1C1, R2C2, R3C3, R4C3"]),
    matrixMemoryQuestion("mem-2", ["0100", "0001", "1000", "0010"], ["R1C2, R2C4, R3C1, R4C3", "R1C2, R2C3, R3C1, R4C3", "R1C2, R2C4, R3C2, R4C3", "R1C1, R2C4, R3C1, R4C3"]),
    matrixMemoryQuestion("mem-3", ["1001", "0000", "0110", "0000"], ["R1C1, R1C4, R3C2, R3C3", "R1C1, R1C3, R3C2, R3C3", "R1C1, R1C4, R3C1, R3C3", "R1C1, R1C4, R3C2, R3C4"]),
    matrixMemoryQuestion("mem-4", ["0010", "0000", "1100", "0001"], ["R1C3, R3C1, R3C2, R4C4", "R1C3, R3C1, R3C3, R4C4", "R1C4, R3C1, R3C2, R4C4", "R1C3, R3C1, R3C2, R4C3"]),
    matrixMemoryQuestion("mem-5", ["0000", "1010", "0001", "0100"], ["R2C1, R2C3, R3C4, R4C2", "R2C1, R2C4, R3C4, R4C2", "R2C1, R2C3, R3C4, R4C3", "R2C2, R2C3, R3C4, R4C2"]),
    matrixMemoryQuestion("mem-6", ["0101", "0000", "1000", "0010"], ["R1C2, R1C4, R3C1, R4C3", "R1C2, R1C3, R3C1, R4C3", "R1C2, R1C4, R3C2, R4C3", "R1C1, R1C4, R3C1, R4C3"]),
    matrixMemoryQuestion("mem-7", ["0000", "0110", "1001", "0000"], ["R2C2, R2C3, R3C1, R3C4", "R2C2, R2C4, R3C1, R3C4", "R2C1, R2C3, R3C1, R3C4", "R2C2, R2C3, R3C1, R3C3"]),
    matrixMemoryQuestion("mem-8", ["1000", "0000", "0101", "0010"], ["R1C1, R3C2, R3C4, R4C3", "R1C1, R3C2, R3C3, R4C3", "R1C2, R3C2, R3C4, R4C3", "R1C1, R3C1, R3C4, R4C3"]),
  ],
  "mental-math": [
    choiceQuestion("math-1", "17 + 28 = ?", ["45", "43", "46", "55"], 0, "17 + 20 = 37, then 37 + 8 = 45."),
    choiceQuestion("math-2", "90 − 37 = ?", ["63", "53", "57", "43"], 1, "90 − 30 = 60, then 60 − 7 = 53."),
    choiceQuestion("math-3", "12 × 4 = ?", ["48", "36", "52", "44"], 0, "Twelve groups of four make 48."),
    choiceQuestion("math-4", "144 ÷ 12 = ?", ["10", "11", "12", "14"], 2, "12 × 12 = 144, so 144 ÷ 12 = 12."),
    choiceQuestion("math-5", "What is 25% of 80?", ["15", "20", "25", "40"], 1, "25% is one quarter; one quarter of 80 is 20."),
    choiceQuestion("math-6", "7 × 8 = ?", ["54", "56", "58", "64"], 1, "Seven groups of eight make 56."),
    choiceQuestion("math-7", "3.5 + 2.25 = ?", ["5.25", "5.5", "5.75", "6.25"], 2, "3.50 + 2.25 = 5.75."),
    choiceQuestion("math-8", "A recipe uses ¾ cup of oats. If you double it, how much is needed?", ["1 cup", "1¼ cups", "1½ cups", "2 cups"], 2, "Doubling ¾ cup gives 6/4 cups, which is 1½ cups."),
  ],
  "rule-switch": [
    ruleQuestion("rule-a1", "A", "Rule A: Is 14 an even number?", ["Yes", "No"], 0, "Fourteen is divisible by two, so it is even."),
    ruleQuestion("rule-b1", "B", "Rule B: Is the letter M a vowel?", ["Yes", "No"], 1, "M is a consonant, not a vowel."),
    ruleQuestion("rule-a2", "A", "Rule A: Is 27 an even number?", ["Yes", "No"], 1, "Twenty-seven is not divisible by two, so it is odd."),
    ruleQuestion("rule-b2", "B", "Rule B: Is the letter A a vowel?", ["Yes", "No"], 0, "A is a vowel."),
    ruleQuestion("rule-a3", "A", "Rule A: Is 42 an even number?", ["Yes", "No"], 0, "Forty-two is divisible by two, so it is even."),
    ruleQuestion("rule-b3", "B", "Rule B: Is the letter T a vowel?", ["Yes", "No"], 1, "T is a consonant, not a vowel."),
    ruleQuestion("rule-a4", "A", "Rule A: Is 35 an even number?", ["Yes", "No"], 1, "Thirty-five is odd, so it is not even."),
    ruleQuestion("rule-b4", "B", "Rule B: Is the letter O a vowel?", ["Yes", "No"], 0, "O is a vowel."),
  ],
  "planning-puzzle": [
    planningQuestion("plan-1", ["S.#.", "..#.", "....", "...G"], ["Down, right, down, right, down, right", "Right, down, right, down, right, down", "Right, right, down, down, down, right", "Down, right, right, down, down, right"], 0, "The first route only moves down or right and avoids both blocked cells."),
    planningQuestion("plan-2", ["S..#", ".#..", "...#", "...G"], ["Down, down, right, right, down, right", "Right, down, right, down, right, down", "Down, right, down, right, right, down", "Right, right, down, down, right, down"], 0, "The first route avoids the blocked cell in row 2, column 2 and reaches the goal."),
    planningQuestion("plan-3", ["S...", "##..", "...#", "...G"], ["Right, right, down, down, down, right", "Down, right, right, down, right, down", "Right, down, right, down, down, right", "Down, down, right, right, right, down"], 0, "This route crosses the top row, then follows the open right portion to the goal without entering the blocked square."),
    planningQuestion("plan-4", ["S..#", "...#", ".#..", "...G"], ["Right, right, down, down, down, right", "Right, right, right, down, down, down", "Down, down, right, right, down, right", "Down, right, down, right, down, right"], 0, "This route moves right/down and stays clear of the blocked cells."),
    planningQuestion("plan-5", ["S...", ".##.", "....", "#..G"], ["Right, right, right, down, down, down", "Down, right, down, right, right, down", "Right, down, right, down, down, right", "Down, down, down, right, right, right"], 0, "The open top row leads to the right edge; moving down from there reaches the goal."),
    planningQuestion("plan-6", ["S.#.", "..#.", "....", "...G"], ["Down, right, down, right, down, right", "Right, right, right, right, down, down", "Right, down, right, down, down, right", "Down, right, right, down, down, right"], 0, "This is a valid down/right route around the obstacles."),
    planningQuestion("plan-7", ["S...", ".##.", "....", "...G"], ["Down, down, down, right, right, right", "Right, down, right, down, right, down", "Down, right, down, down, right, right", "Right, down, down, right, right, down"], 0, "The first route avoids the central blocked cells by moving down the left edge, then across the bottom."),
    planningQuestion("plan-8", ["S...", "##..", "....", "...G"], ["Right, right, right, down, down, down", "Down, right, right, right, down, down", "Right, down, right, down, down, right", "Down, down, right, right, right, down"], 0, "The top row is open and then the right edge leads to the goal."),
  ],
};

function choiceQuestion(
  id: string,
  prompt: string,
  options: string[],
  correctOptionIndex: number,
  explanation: string,
): TrainingQuestion {
  return { id, prompt, options, correctOptionIndex, explanation };
}

function sequenceQuestion(
  id: string,
  studyItems: string[],
  options: string[],
  correctOptionIndex: number,
): TrainingQuestion {
  return {
    id,
    prompt: "Which option matches the sequence in exactly the same order?",
    options,
    correctOptionIndex,
    studyItems,
    explanation: "The result is a count of sequence-recognition items answered correctly in this round. It is not a general memory score.",
  };
}

function matrixQuestion(id: string, rows: string[]): TrainingQuestion {
  const matrix = rows.map((row) => row.split(" "));
  const count = matrix.flat().filter((symbol) => symbol === "A").length;
  const optionValues = [...new Set([Math.max(0, count - 2), Math.max(0, count - 1), count, count + 1, count + 2])].slice(0, 4);
  const correctOptionIndex = optionValues.indexOf(count);
  return {
    id,
    prompt: "How many letter A symbols are in the grid?",
    options: optionValues.map(String),
    correctOptionIndex,
    matrix,
    targetSymbol: "A",
    explanation: `There ${count === 1 ? "is" : "are"} ${count} letter A symbol${count === 1 ? "" : "s"} in the grid.`,
  };
}

function matrixMemoryQuestion(id: string, rows: string[], options: string[]): TrainingQuestion {
  return {
    id,
    prompt: "Which set of marked cells matches the pattern you studied?",
    options,
    correctOptionIndex: 0,
    studyMatrix: rows.map((row) => row.split("").map((cell) => cell === "1")),
    explanation: "Compare the row and column coordinates with the grid shown before you hid it. The result is specific to this pattern set.",
  };
}

function ruleQuestion(
  id: string,
  ruleFamily: "A" | "B",
  prompt: string,
  options: string[],
  correctOptionIndex: number,
  explanation: string,
): TrainingQuestion {
  return { id, ruleFamily, prompt, options, correctOptionIndex, explanation };
}

function planningQuestion(
  id: string,
  rows: string[],
  options: string[],
  correctOptionIndex: number,
  explanation: string,
): TrainingQuestion {
  const planningGrid = rows.map((row) => row.split(""));
  const validOptions = options.flatMap((option, index) => isValidGridRoute(planningGrid, option) ? [index] : []);
  if (validOptions.length !== 1 || validOptions[0] !== correctOptionIndex) {
    throw new Error(`Planning puzzle ${id} must have exactly one keyed valid route.`);
  }
  return {
    id,
    prompt: "Which route reaches Goal? Move only right or down; X cells are blocked.",
    options,
    correctOptionIndex,
    planningGrid,
    explanation,
  };
}

export function isStudyQuestion(question: TrainingQuestion | undefined): boolean {
  return Boolean(question?.studyItems || question?.studyMatrix);
}

export function isValidGridRoute(grid: readonly (readonly string[])[], route: string): boolean {
  if (grid.length === 0 || grid.some((row) => row.length !== grid[0].length)) return false;
  const starts: [number, number][] = [];
  const goals: [number, number][] = [];
  grid.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
    if (cell === "S") starts.push([rowIndex, columnIndex]);
    if (cell === "G") goals.push([rowIndex, columnIndex]);
  }));
  if (starts.length !== 1 || goals.length !== 1) return false;

  let [row, column] = starts[0];
  const moves = route.toLowerCase().split(/\s*,\s*/).filter(Boolean);
  if (moves.length === 0) return false;
  for (const move of moves) {
    if (move === "right") column += 1;
    else if (move === "down") row += 1;
    else return false;
    if (row >= grid.length || column >= grid[0].length || grid[row][column] === "#") return false;
  }
  return row === goals[0][0] && column === goals[0][1];
}

function isValidDateKey(dateKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey;
}

function gameCode(gameId: GameId): string {
  return gameId.toUpperCase().replaceAll("-", "");
}

function gameForDate(dateKey: string, version: ChallengeVersion): GameId {
  const dayIndex = Math.floor(Date.parse(`${dateKey}T00:00:00.000Z`) / 86_400_000);
  const gameIds: readonly GameId[] = version === LEGACY_CHALLENGE_VERSION ? LEGACY_GAME_IDS : GAME_IDS;
  return gameIds[((dayIndex % gameIds.length) + gameIds.length) % gameIds.length];
}

function dateCode(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

function buildQuestionSet(gameId: GameId, seed: string): TrainingQuestion[] {
  let selected: TrainingQuestion[];
  if (gameId === "rule-switch") {
    const rules = {
      A: seededShuffle(QUESTION_BANK[gameId].filter((question) => question.ruleFamily === "A"), `${seed}:rule-A`),
      B: seededShuffle(QUESTION_BANK[gameId].filter((question) => question.ruleFamily === "B"), `${seed}:rule-B`),
    };
    const firstRule = seededShuffle(["A", "B"] as const, `${seed}:initial-rule`)[0];
    selected = Array.from({ length: 5 }, (_, index) => {
      const family = index % 2 === 0 ? firstRule : firstRule === "A" ? "B" : "A";
      return rules[family][Math.floor(index / 2)];
    });
  } else {
    selected = seededShuffle(QUESTION_BANK[gameId], `${seed}:question-order`).slice(0, 5);
  }

  return selected.map((question) => {
    const optionIndexes = seededShuffle(question.options.map((_, index) => index), `${seed}:${question.id}:options`);
    const correctOptionIndex = optionIndexes.indexOf(question.correctOptionIndex);
    return {
      ...question,
      options: optionIndexes.map((index) => question.options[index]),
      correctOptionIndex,
    };
  });
}

function createChallenge(dateKey: string, version: ChallengeVersion): DailyChallenge {
  if (!isValidDateKey(dateKey)) throw new Error("A valid UTC date is required for a challenge.");
  const gameId = gameForDate(dateKey, version);
  const code = `${version}-${dateCode(dateKey)}-${gameCode(gameId)}`;
  const questions = buildQuestionSet(gameId, code);
  return { version, dateKey, gameId, code, questions };
}

export function getDailyChallenge(dateKey: string): DailyChallenge {
  return createChallenge(dateKey, CHALLENGE_VERSION);
}

export function parseChallengeCode(code: string): { version: ChallengeVersion; dateKey: string; gameId: GameId } | null {
  const match = /^(CF1|CF2)-(\d{8})-([A-Z]+)$/.exec(code.trim().toUpperCase());
  if (!match) return null;

  const version = match[1] as ChallengeVersion;
  const rawDate = match[2];
  const dateKey = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
  if (!isValidDateKey(dateKey)) return null;

  const gameId = GAME_IDS.find((candidate) => gameCode(candidate) === match[3]);
  if (!gameId) return null;
  if (version === LEGACY_CHALLENGE_VERSION && !(LEGACY_GAME_IDS as readonly GameId[]).includes(gameId)) return null;
  if (gameForDate(dateKey, version) !== gameId) return null;
  return { version, dateKey, gameId };
}

export function getChallengeFromCode(code: string): DailyChallenge | null {
  const parsed = parseChallengeCode(code);
  return parsed ? createChallenge(parsed.dateKey, parsed.version) : null;
}

export function getPracticeQuestions(gameId: GameId, seed = `practice-${Date.now()}`): TrainingQuestion[] {
  return buildQuestionSet(gameId, seed);
}

export function scoreAnswers(
  questions: readonly TrainingQuestion[],
  answers: readonly (number | null)[],
): number {
  return scoreMultipleChoice(questions, answers).correctCount;
}

export function getWeeklySessionCount(
  sessions: readonly TrainingSessionRecord[],
  now = new Date(),
  activityIds?: readonly GameId[],
  programStartedAt?: string,
): number {
  const day = now.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  const nextMonday = new Date(monday.getTime() + 7 * 86_400_000);
  const startedAtMs = programStartedAt ? Date.parse(programStartedAt) : Number.NEGATIVE_INFINITY;
  return sessions.filter((session) => {
    const completedAt = new Date(session.completedAt);
    const belongsToGoal = !activityIds || activityIds.includes(session.activityId);
    return belongsToGoal && !Number.isNaN(completedAt.getTime()) && completedAt >= monday && completedAt < nextMonday && completedAt.getTime() >= startedAtMs;
  }).length;
}

export function getProgram(id: GoalId | null): GoalProgram | null {
  return GOAL_PROGRAMS.find((program) => program.id === id) ?? null;
}

export function getNextProgramActivity(program: GoalProgram, completedThisWeek: number, weekIndex = 0): TrainingActivity {
  const week = program.weeks[Math.max(0, Math.min(weekIndex, program.weeks.length - 1))];
  const activityIds = week?.activityIds.length ? week.activityIds : program.activityIds;
  const activityId = activityIds[completedThisWeek % activityIds.length];
  return ACTIVITIES.find((activity) => activity.id === activityId) ?? ACTIVITIES[0];
}
