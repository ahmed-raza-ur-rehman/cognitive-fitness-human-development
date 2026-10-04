export type GameMode = "practice" | "challenge";
export type SessionPhase = "study" | "answer" | "feedback" | "completed" | "abandoned";

export type ScoredQuestion = {
  id: string;
  options: readonly unknown[];
  correctOptionIndex: number;
};

export type SessionInitialPhase = Extract<SessionPhase, "study" | "answer">;

export type GameSession<Question extends ScoredQuestion, GameKey extends string = string> = {
  sessionId: string;
  gameId: GameKey;
  gameVersion: string;
  mode: GameMode;
  seed: string;
  challengeCode?: string;
  questions: readonly Question[];
  questionIndex: number;
  answers: (number | null)[];
  phase: SessionPhase;
};

export type CreateGameSessionOptions<Question extends ScoredQuestion, GameKey extends string> = {
  sessionId: string;
  gameId: GameKey;
  gameVersion: string;
  mode: GameMode;
  seed: string;
  challengeCode?: string;
  questions: readonly Question[];
  initialPhase: SessionInitialPhase;
};

export type GameSessionAction =
  | { type: "hide-stimulus" }
  | { type: "submit-answer"; optionIndex: number }
  | { type: "continue"; nextPhase: SessionInitialPhase }
  | { type: "leave" };

export type GameDescriptor = {
  id: string;
  version: string;
  name: string;
  domain: string;
  rules: string;
  difficulty: string;
  inputModes: readonly ("keyboard" | "touch" | "screen-reader")[];
  scoring: string;
  measures: string;
  doesNotMeasure: string;
  accessibilityPath: string;
  retryBehavior: string;
  timePressure: "none" | "optional" | "required";
};

export function validateGameDescriptor(descriptor: GameDescriptor): string[] {
  const errors: string[] = [];
  const requiredText: (keyof GameDescriptor)[] = [
    "id", "version", "name", "domain", "rules", "difficulty", "scoring", "measures",
    "doesNotMeasure", "accessibilityPath", "retryBehavior",
  ];

  for (const key of requiredText) {
    if (typeof descriptor[key] !== "string" || descriptor[key].trim().length === 0) {
      errors.push(`${key} must be a non-empty string`);
    }
  }
  if (!Array.isArray(descriptor.inputModes) || descriptor.inputModes.length === 0) {
    errors.push("inputModes must name at least one supported input path");
  }
  if (!["none", "optional", "required"].includes(descriptor.timePressure)) {
    errors.push("timePressure must be none, optional, or required");
  }
  if (descriptor.timePressure === "required" && descriptor.inputModes.includes("screen-reader")) {
    errors.push("required time pressure must not be represented as screen-reader accessible without a separately validated alternative");
  }
  return errors;
}
