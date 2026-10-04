import { describe, expect, it } from "vitest";
import {
  getProgramTimeline,
  isProgramProgress,
  pauseProgramProgress,
  resumeProgramProgress,
  startProgramProgress,
} from "@/features/progress/program-progress";

describe("local program progress timeline", () => {
  it("starts at week one and advances to completion only by elapsed active time", () => {
    const start = new Date("2026-01-05T12:00:00.000Z");
    const progress = startProgramProgress(start);
    expect(getProgramTimeline(progress, 4, start)).toMatchObject({ weekNumber: 1, weekIndex: 0, isComplete: false });
    expect(getProgramTimeline(progress, 4, new Date("2026-01-20T12:00:00.000Z"))).toMatchObject({ weekNumber: 3, isComplete: false });
    expect(getProgramTimeline(progress, 4, new Date("2026-02-02T12:00:00.000Z"))).toMatchObject({ weekNumber: 4, isComplete: true });
  });

  it("freezes the schedule while paused and restores accumulated active time on resume", () => {
    const start = new Date("2026-01-05T12:00:00.000Z");
    const progress = startProgramProgress(start);
    const paused = pauseProgramProgress(progress, new Date("2026-01-12T12:00:00.000Z"));
    expect(getProgramTimeline(paused, 4, new Date("2026-02-01T12:00:00.000Z"))).toMatchObject({ weekNumber: 2, isPaused: true, isComplete: false });

    const resumed = resumeProgramProgress(paused, new Date("2026-01-19T12:00:00.000Z"));
    expect(resumed.pausedDurationMs).toBe(7 * 86_400_000);
    expect(getProgramTimeline(resumed, 4, new Date("2026-01-26T12:00:00.000Z"))).toMatchObject({ weekNumber: 3, isPaused: false, isComplete: false });
  });

  it("validates migrated progress records and safely rejects malformed storage", () => {
    expect(isProgramProgress(startProgramProgress(new Date("2026-01-01T00:00:00.000Z")))).toBe(true);
    expect(isProgramProgress({ startedAt: "no-date", pausedAt: null, pausedDurationMs: 0 })).toBe(false);
    expect(isProgramProgress({ startedAt: "2026-01-01", pausedAt: null, pausedDurationMs: 0 })).toBe(false);
    expect(isProgramProgress({ startedAt: "2026-01-01T00:00:00.000Z", pausedAt: null, pausedDurationMs: -1 })).toBe(false);
    expect(getProgramTimeline(null, 4)).toBeNull();
  });
});
