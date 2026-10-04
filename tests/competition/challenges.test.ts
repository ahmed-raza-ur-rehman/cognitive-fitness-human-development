import { describe, expect, it } from "vitest";
import {
  createSelfReportedResultCode,
  createWeeklyFriendChallenge,
  getFriendChallengeWindowState,
  getUtcWeekStart,
  getWeeklyFriendChallengeFromCode,
  parseSelfReportedResultCode,
  parseWeeklyFriendChallengeCode,
} from "@/features/competition/challenges";
import { GAME_IDS } from "@/features/training/training-engine";

describe("fixed weekly friend challenges", () => {
  it("builds a stable event binding the game version, seed, settings, and UTC event window", () => {
    const first = createWeeklyFriendChallenge("2026-10-05", "logic");
    const second = createWeeklyFriendChallenge("2026-10-05", "logic");

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      version: "CF3",
      dateKey: "2026-10-05",
      gameId: "logic",
      gameVersion: "1.0.0",
      seed: first.code,
      settings: { questionCount: 5, timed: false, scoring: "correct-count" },
      window: {
        startAt: "2026-10-05T00:00:00.000Z",
        endAt: "2026-10-12T00:00:00.000Z",
        timezone: "UTC",
      },
      eligibility: { requiresCode: true, identityVerified: false, attemptLimit: null },
    });
    expect(first.questions).toHaveLength(5);
    expect(Object.isFrozen(first.settings)).toBe(true);
    expect(getWeeklyFriendChallengeFromCode(first.code)).toEqual(first);
    expect(parseWeeklyFriendChallengeCode(first.code)).toEqual({
      dateKey: "2026-10-05",
      gameId: "logic",
      gameVersion: "1.0.0",
    });
  });

  it("allows every catalog game while rejecting malformed, mismatched, and non-Monday event IDs", () => {
    for (const gameId of GAME_IDS) {
      const event = createWeeklyFriendChallenge("2026-10-05", gameId);
      expect(getWeeklyFriendChallengeFromCode(event.code)?.gameId).toBe(gameId);
    }

    expect(parseWeeklyFriendChallengeCode("CF3-20261006-LOGIC-v1-0-0")).toBeNull();
    expect(parseWeeklyFriendChallengeCode("CF3-20261005-UNKNOWN-v1-0-0")).toBeNull();
    expect(parseWeeklyFriendChallengeCode("CF3-20261005-LOGIC-v9-0-0")).toBeNull();
    expect(parseWeeklyFriendChallengeCode("CF3-20260230-LOGIC-v1-0-0")).toBeNull();
    expect(() => createWeeklyFriendChallenge("2026-10-06", "logic")).toThrow(/valid Monday in UTC/);
  });

  it("uses Monday-based UTC weeks and identifies upcoming/open/closed windows", () => {
    expect(getUtcWeekStart("2026-10-04")).toBe("2026-09-28");
    expect(getUtcWeekStart("2026-10-05")).toBe("2026-10-05");
    expect(getUtcWeekStart("not-a-date")).toBeNull();

    const event = createWeeklyFriendChallenge("2026-10-05", "sequence");
    expect(getFriendChallengeWindowState(event, "2026-10-04")).toBe("upcoming");
    expect(getFriendChallengeWindowState(event, "2026-10-05")).toBe("open");
    expect(getFriendChallengeWindowState(event, "2026-10-11")).toBe("open");
    expect(getFriendChallengeWindowState(event, "2026-10-12")).toBe("closed");
    expect(getFriendChallengeWindowState(event, "bad-date")).toBeNull();
  });

  it("encodes and parses only a bounded self-reported score for the exact event", () => {
    const event = createWeeklyFriendChallenge("2026-10-05", "logic");
    const resultCode = createSelfReportedResultCode(event.code, 4, 5);
    expect(resultCode).toBe(`CR1|${event.code}|4/5`);
    expect(parseSelfReportedResultCode(resultCode ?? "", event.code, 5)).toEqual({
      eventCode: event.code,
      correctCount: 4,
      totalCount: 5,
    });

    expect(parseSelfReportedResultCode(resultCode ?? "", `${event.code}-other`, 5)).toBeNull();
    expect(parseSelfReportedResultCode(`CR1|${event.code}|6/5`, event.code, 5)).toBeNull();
    expect(parseSelfReportedResultCode(`CR1|${event.code}|4/4`, event.code, 5)).toBeNull();
    expect(createSelfReportedResultCode(event.code, 6, 5)).toBeNull();
    expect(createSelfReportedResultCode(event.code, -1, 5)).toBeNull();
    expect(createSelfReportedResultCode(`${event.code}|forged`, 1, 5)).toBeNull();
  });
});
