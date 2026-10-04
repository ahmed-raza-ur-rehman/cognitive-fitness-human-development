import { describe, expect, it } from "vitest";
import {
  ACTIVITIES,
  GAME_IDS,
  GOAL_PROGRAMS,
  getChallengeFromCode,
  getDailyChallenge,
  getNextProgramActivity,
  getPracticeQuestions,
  getProgram,
  getWeeklySessionCount,
  isValidGridRoute,
  parseChallengeCode,
  scoreAnswers,
  type TrainingSessionRecord,
} from "@/features/training/training-engine";

describe("training engine", () => {
  it("builds the same versioned, untimed challenge set for a UTC date", () => {
    const first = getDailyChallenge("2026-10-04");
    const second = getDailyChallenge("2026-10-04");

    expect(first).toEqual(second);
    expect(first.code.startsWith("CF2-20261004-")).toBe(true);
    expect(first.version).toBe("CF2");
    expect(first.questions).toHaveLength(5);
    expect(first.questions.every((question) => question.options.length === 4)).toBe(true);
    expect(getChallengeFromCode(first.code)).toEqual(first);
  });

  it("rejects malformed, impossible, or mismatched challenge codes", () => {
    expect(parseChallengeCode("CF1-20260230-LOGIC")).toBeNull();
    expect(parseChallengeCode("CF1-20261004-NOTAGAME")).toBeNull();

    const challenge = getDailyChallenge("2026-10-04");
    const wrongGameCode = `CF2-20261004-${challenge.gameId === "logic" ? "PATTERN" : "LOGIC"}`;
    expect(parseChallengeCode(wrongGameCode)).toBeNull();
  });

  it("keeps legacy CF1 friend links reconstructible while CF2 rotates across all eight games", () => {
    const legacy = getChallengeFromCode("CF1-20261004-VISUALSEARCH");
    expect(legacy).not.toBeNull();
    expect(legacy).toMatchObject({ version: "CF1", dateKey: "2026-10-04", gameId: "visual-search" });
    expect(getChallengeFromCode(legacy?.code ?? "")).toEqual(legacy);

    const rotated = Array.from({ length: GAME_IDS.length }, (_, index) => {
      const day = new Date(Date.UTC(2026, 9, 2 + index)).toISOString().slice(0, 10);
      return getDailyChallenge(day).gameId;
    });
    expect(new Set(rotated).size).toBe(8);
    expect(parseChallengeCode("CF1-20261004-PLANNINGPUZZLE")).toBeNull();
  });

  it("keeps every training game's answer key aligned after deterministic option shuffling", () => {
    for (const activity of ACTIVITIES) {
      const questions = getPracticeQuestions(activity.id, "test-seed");
      expect(questions).toHaveLength(5);
      expect(scoreAnswers(questions, questions.map((question) => question.correctOptionIndex))).toBe(5);
      expect(questions.every((question) => question.options.length >= 2 && question.options.length <= 4)).toBe(true);
    }
  });

  it("keeps the Rule Switch alternating and verifies every route-puzzle answer key", () => {
    const switchQuestions = getPracticeQuestions("rule-switch", "switch-seed");
    expect(switchQuestions).toHaveLength(5);
    expect(switchQuestions.every((question) => question.options.length === 2)).toBe(true);
    for (let index = 1; index < switchQuestions.length; index += 1) {
      expect(switchQuestions[index].ruleFamily).not.toBe(switchQuestions[index - 1].ruleFamily);
    }

    const routes = getPracticeQuestions("planning-puzzle", "route-seed");
    for (const question of routes) {
      expect(question.planningGrid).toBeDefined();
      const validOptionIndexes = question.options.flatMap((option, index) =>
        question.planningGrid && isValidGridRoute(question.planningGrid, option) ? [index] : []);
      expect(validOptionIndexes).toEqual([question.correctOptionIndex]);
    }
  });

  it("counts only sessions in the current UTC week", () => {
    const sessions: TrainingSessionRecord[] = [
      { id: "monday", activityId: "logic", mode: "practice", correctCount: 3, totalCount: 5, completedAt: "2026-09-28T08:00:00.000Z" },
      { id: "sunday", activityId: "pattern", mode: "challenge", correctCount: 4, totalCount: 5, completedAt: "2026-10-04T20:00:00.000Z" },
      { id: "last-week", activityId: "sequence", mode: "practice", correctCount: 4, totalCount: 5, completedAt: "2026-09-27T23:59:59.000Z" },
      { id: "future", activityId: "sequence", mode: "practice", correctCount: 4, totalCount: 5, completedAt: "2026-10-05T00:00:00.000Z" },
    ];

    expect(getWeeklySessionCount(sessions, new Date("2026-10-04T23:00:00.000Z"))).toBe(2);
    expect(getWeeklySessionCount(sessions, new Date("2026-10-04T23:00:00.000Z"), ["logic"])).toBe(1);
    expect(getWeeklySessionCount(sessions, new Date("2026-10-04T23:00:00.000Z"), ["logic"], "2026-09-28T09:00:00.000Z")).toBe(0);
  });

  it("rotates a goal's suggested activities without claiming skill gains", () => {
    const program = getProgram("balanced");
    expect(program).not.toBeNull();
    expect(GOAL_PROGRAMS).toContain(program);
    if (!program) return;

    expect(getNextProgramActivity(program, 0).id).toBe(program.activityIds[0]);
    expect(getNextProgramActivity(program, 1).id).toBe(program.activityIds[1]);
    expect(getNextProgramActivity(getProgram("memory")!, 0, 1).id).toBe("matrix-memory");
    expect(getNextProgramActivity(getProgram("attention")!, 0, 1).id).toBe("rule-switch");
  });
});
