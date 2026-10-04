import { describe, expect, it } from "vitest";
import { seededRandom, seededShuffle } from "@/features/games/core/seeded-random";

describe("seeded random helpers", () => {
  it("repeats the same order for the same seed", () => {
    expect(seededShuffle(["a", "b", "c", "d", "e"], "daily-1"))
      .toEqual(seededShuffle(["a", "b", "c", "d", "e"], "daily-1"));
  });

  it("does not mutate its input and keeps every item exactly once", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const shuffled = seededShuffle(input, "order-check");
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...shuffled].sort()).toEqual(input);
  });

  it("provides finite values in the half-open unit interval", () => {
    const random = seededRandom("bounds");
    for (let index = 0; index < 100; index += 1) {
      const value = random();
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
