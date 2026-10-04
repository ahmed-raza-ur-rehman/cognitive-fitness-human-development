import { describe, expect, it } from "vitest";
import { GOAL_PROGRAMS } from "@/features/goals/programs";
import { ACTIVITIES } from "@/features/training/training-engine";

describe("practice program schedules", () => {
  it("provides four-week purpose, schedule, activities, recovery, and review for every user-owned goal", () => {
    const availableActivities = new Set(ACTIVITIES.map((activity) => activity.id));
    expect(GOAL_PROGRAMS).toHaveLength(4);
    for (const program of GOAL_PROGRAMS) {
      expect(program.durationWeeks).toBe(4);
      expect(program.weeks).toHaveLength(4);
      expect(program.purpose.trim()).not.toBe("");
      expect(program.feedback).toMatch(/explanation/i);
      expect(program.recoveryOption.trim()).not.toBe("");
      expect(program.reviewPrompt.trim()).not.toBe("");
      expect(program.activityIds.length).toBeGreaterThan(0);
      expect(program.activityIds.every((id) => availableActivities.has(id))).toBe(true);
      expect(program.weeks.every((week) => week.activityIds.length > 0 && week.activityIds.every((id) => program.activityIds.includes(id)))).toBe(true);
    }
  });
});
