import { describe, expect, it } from "vitest";
import { parsePracticeState, summarizePractice, type PracticeState } from "@/features/progress/practice-analytics";
import { TRAINING_STORAGE_KEY, type GameId, type TrainingSessionRecord } from "@/features/training/training-engine";

function session(
  overrides: Partial<Omit<TrainingSessionRecord, "activityId" | "mode">> & { activityId?: GameId; mode?: "practice" | "challenge" } = {},
): TrainingSessionRecord {
  return {
    id: overrides.id ?? "s1",
    activityId: overrides.activityId ?? "sequence",
    mode: overrides.mode ?? "practice",
    correctCount: overrides.correctCount ?? 3,
    totalCount: overrides.totalCount ?? 5,
    completedAt: overrides.completedAt ?? "2026-10-01T10:00:00.000Z",
  };
}

function state(parts: Partial<PracticeState>): PracticeState {
  return { goalId: null, programProgress: null, sessions: [], ...parts };
}

describe("practice analytics", () => {
  it("only reads the opt-in local key and tolerates corrupt or unknown records", () => {
    expect(TRAINING_STORAGE_KEY).toBe("cognitive-fitness.training.v1");
    expect(parsePracticeState(null)).toBeNull();
    expect(parsePracticeState("{not json")).toBeNull();
    expect(parsePracticeState(JSON.stringify({ version: 2, sessions: [] }))).toBeNull();

    const parsed = parsePracticeState(JSON.stringify({ version: 1, sessions: [session(), { id: "bad" }, { ...session(), activityId: "chess" }] }));
    expect(parsed?.sessions).toHaveLength(1);
  });

  it("keeps every activity's numbers separate and never pools them into one score", () => {
    const summary = summarizePractice(state({
      sessions: [
        session({ id: "a", activityId: "sequence", correctCount: 5 }),
        session({ id: "b", activityId: "sequence", correctCount: 1, completedAt: "2026-10-02T10:00:00.000Z" }),
        session({ id: "c", activityId: "logic", correctCount: 4, completedAt: "2026-10-03T10:00:00.000Z" }),
      ],
    }), new Date("2026-10-05T00:00:00.000Z"))!;

    expect(summary.activities).toHaveLength(2);
    const sequence = summary.activities.find((activity) => activity.activityId === "sequence")!;
    expect(sequence.sessions).toBe(2);
    expect(sequence.lowestFraction).toBe(0.2);
    expect(sequence.highestFraction).toBe(1);
    expect(sequence.medianFraction).toBe(0.6);
    expect(sequence.distribution.length).toBe(6);
    expect(sequence.distribution[5]).toBe(1);

    // No aggregate "ability" figure is produced anywhere in the summary shape.
    for (const key of Object.keys(summary)) {
      expect(key.toLowerCase()).not.toMatch(/iq|brain|overall|combined|percentile|rank/);
    }
    expect(sequence.evidenceNote).toMatch(/does not|not a validated|task/i);
    expect(summary.practiceSessions).toBe(3);
  });

  it("counts weeks in UTC and does not invent empty weeks between them", () => {
    const summary = summarizePractice(state({
      sessions: [
        session({ id: "old", completedAt: "2026-09-01T00:30:00.000Z" }),
        session({ id: "new", completedAt: "2026-10-04T23:30:00.000Z" }),
      ],
    }))!;

    expect(summary.weeks.map((week) => week.sessions)).toEqual([1, 1]);
    expect(summary.firstCompletedAt).toBe("2026-09-01T00:30:00.000Z");
    expect(summary.lastCompletedAt).toBe("2026-10-04T23:30:00.000Z");
  });

  it("reports goal adherence as a count against the user's own target, and only for goal activities", () => {
    const goalState: PracticeState = {
      goalId: "memory",
      programProgress: { startedAt: "2026-10-01T00:00:00.000Z", pausedAt: null, pausedDurationMs: 0 },
      sessions: [
        session({ id: "in-goal", activityId: "sequence", completedAt: "2026-10-02T09:00:00.000Z" }),
        session({ id: "other-activity", activityId: "logic", completedAt: "2026-10-02T11:00:00.000Z" }),
      ],
    };
    const summary = summarizePractice(goalState, new Date("2026-10-04T00:00:00.000Z"))!;

    expect(summary.goalName).toMatch(/memory/i);
    expect(summary.currentWeek).toBe(1);
    expect(summary.sessionsThisWeekForGoal).toBe(1);
    expect(summary.goalWeekTarget).toBeGreaterThan(0);
    expect(summary.programIsPaused).toBe(false);
  });

  it("reports no goal fields when no schedule is selected", () => {
    const summary = summarizePractice(state({ sessions: [session({ id: "solo" })] }), new Date("2026-10-04T00:00:00.000Z"))!;

    expect(summary.goalName).toBeNull();
    expect(summary.currentWeek).toBeNull();
    expect(summary.sessionsThisWeekForGoal).toBe(0);
  });

  it("returns null rather than an empty dashboard when nothing was saved", () => {
    expect(summarizePractice(null)).toBeNull();
    const summary = summarizePractice(state({}))!;
    expect(summary.totalSessions).toBe(0);
    expect(summary.activities).toEqual([]);
  });
});
