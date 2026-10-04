import type { ScoredQuestion } from "./contracts";

export type ScoreSummary = {
  correctCount: number;
  totalCount: number;
  answeredCount: number;
  invalidAnswerCount: number;
};

/** Score one bounded multiple-choice set. Invalid, missing, or extra answers never earn credit. */
export function scoreMultipleChoice(
  questions: readonly ScoredQuestion[],
  answers: readonly (number | null)[],
): ScoreSummary {
  let correctCount = 0;
  let answeredCount = 0;
  let invalidAnswerCount = 0;

  questions.forEach((question, index) => {
    const answer = answers[index];
    if (answer === null || answer === undefined) return;
    if (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length) {
      invalidAnswerCount += 1;
      return;
    }
    answeredCount += 1;
    if (answer === question.correctOptionIndex) correctCount += 1;
  });

  if (answers.length > questions.length) {
    invalidAnswerCount += answers.length - questions.length;
  }

  return {
    correctCount,
    totalCount: questions.length,
    answeredCount,
    invalidAnswerCount,
  };
}
