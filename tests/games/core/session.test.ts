import { describe, expect, it } from "vitest";
import { createGameSession, reduceGameSession } from "@/features/games/core/session";
import type { GameSession } from "@/features/games/core/contracts";

type Question = { id: string; options: string[]; correctOptionIndex: number; study?: string };
const questions: Question[] = [
  { id: "one", options: ["a", "b"], correctOptionIndex: 0, study: "show" },
  { id: "two", options: ["c", "d"], correctOptionIndex: 1 },
];

function newSession(): GameSession<Question, "memory-test"> {
  return createGameSession({
    sessionId: "session-1", gameId: "memory-test", gameVersion: "1.0.0", mode: "practice",
    seed: "seed-1", questions, initialPhase: "study",
  });
}

describe("shared game session lifecycle", () => {
  it("validates session content and starts in the requested phase", () => {
    expect(newSession()).toMatchObject({ questionIndex: 0, phase: "study", answers: [null, null] });
    expect(() => createGameSession({
      sessionId: "bad", gameId: "memory-test", gameVersion: "1", mode: "practice", seed: "s",
      questions: [{ id: "bad", options: ["only"], correctOptionIndex: 0 }], initialPhase: "answer",
    })).toThrow(/invalid answer key/);
  });

  it("enforces study, answer, feedback, and next-question transitions", () => {
    const started = newSession();
    expect(reduceGameSession(started, { type: "submit-answer", optionIndex: 0 })).toBe(started);
    const ready = reduceGameSession(started, { type: "hide-stimulus" });
    const answered = reduceGameSession(ready, { type: "submit-answer", optionIndex: 0 });
    expect(answered).toMatchObject({ phase: "feedback", answers: [0, null] });
    const next = reduceGameSession(answered, { type: "continue", nextPhase: "answer" });
    expect(next).toMatchObject({ questionIndex: 1, phase: "answer" });
  });

  it("ignores invalid or repeated inputs and makes terminal states immutable", () => {
    const started = newSession();
    const ready = reduceGameSession(started, { type: "hide-stimulus" });
    expect(reduceGameSession(ready, { type: "submit-answer", optionIndex: 9 })).toBe(ready);
    const answered = reduceGameSession(ready, { type: "submit-answer", optionIndex: 1 });
    expect(reduceGameSession(answered, { type: "submit-answer", optionIndex: 0 })).toBe(answered);
    const abandoned = reduceGameSession(answered, { type: "leave" });
    expect(abandoned.phase).toBe("abandoned");
    expect(reduceGameSession(abandoned, { type: "continue", nextPhase: "answer" })).toBe(abandoned);
  });

  it("completes exactly after feedback on the last item", () => {
    let state = newSession();
    state = reduceGameSession(state, { type: "hide-stimulus" });
    state = reduceGameSession(state, { type: "submit-answer", optionIndex: 0 });
    state = reduceGameSession(state, { type: "continue", nextPhase: "answer" });
    state = reduceGameSession(state, { type: "submit-answer", optionIndex: 1 });
    state = reduceGameSession(state, { type: "continue", nextPhase: "answer" });
    expect(state.phase).toBe("completed");
  });
});
