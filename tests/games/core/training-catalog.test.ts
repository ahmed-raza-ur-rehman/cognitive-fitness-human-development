import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/features/training/training-engine";
import { validateGameDescriptor } from "@/features/games/core/contracts";

describe("training game contracts", () => {
  it("provides at least eight activities across six or more stated domains", () => {
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ACTIVITIES.map((activity) => activity.domain)).size).toBeGreaterThanOrEqual(6);
  });

  it("gives every visible activity a complete task, input, scoring, access, and retry contract", () => {
    for (const activity of ACTIVITIES) {
      expect(validateGameDescriptor(activity), activity.id).toEqual([]);
      expect(activity.timePressure).toBe("none");
      expect(activity.measures.length).toBeGreaterThan(0);
      expect(activity.doesNotMeasure.length).toBeGreaterThan(0);
    }
  });
});
