import { describe, expect, it } from "vitest";
import { validateGameDescriptor, type GameDescriptor } from "@/features/games/core/contracts";

const descriptor: GameDescriptor = {
  id: "sample", version: "1.0.0", name: "Sample", domain: "Reasoning", rules: "Choose a supported answer.",
  difficulty: "Fixed short set", inputModes: ["keyboard", "touch", "screen-reader"],
  scoring: "Correct answers out of five", measures: "Answers to this task's items",
  doesNotMeasure: "General ability or real-world transfer", accessibilityPath: "Native buttons and headings",
  retryBehavior: "A new practice seed starts another set", timePressure: "none",
};

describe("game descriptor", () => {
  it("accepts a complete task-level contract", () => {
    expect(validateGameDescriptor(descriptor)).toEqual([]);
  });

  it("flags missing accessibility/input paths and required time pressure conflicts", () => {
    expect(validateGameDescriptor({
      ...descriptor, inputModes: [], accessibilityPath: "", timePressure: "required",
    })).toEqual(expect.arrayContaining([
      "inputModes must name at least one supported input path",
      "accessibilityPath must be a non-empty string",
    ]));
  });
});
