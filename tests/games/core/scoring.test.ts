import { describe, expect, it } from "vitest";
import { scoreMultipleChoice } from "@/features/games/core/scoring";

const questions = [
  { id: "q1", options: ["a", "b", "c"], correctOptionIndex: 1 },
  { id: "q2", options: ["x", "y"], correctOptionIndex: 0 },
];

describe("scoreMultipleChoice", () => {
  it("reports correct, answered, and total counts independently", () => {
    expect(scoreMultipleChoice(questions, [1, 1])).toEqual({
      correctCount: 1, totalCount: 2, answeredCount: 2, invalidAnswerCount: 0,
    });
  });

  it("does not award credit for missing, malformed, out-of-range, or extra answers", () => {
    expect(scoreMultipleChoice(questions, [1, 5, 0])).toEqual({
      correctCount: 1, totalCount: 2, answeredCount: 1, invalidAnswerCount: 2,
    });
    expect(scoreMultipleChoice(questions, [null])).toEqual({
      correctCount: 0, totalCount: 2, answeredCount: 0, invalidAnswerCount: 0,
    });
  });
});
