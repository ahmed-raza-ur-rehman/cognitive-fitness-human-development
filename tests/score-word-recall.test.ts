import { describe, expect, it } from "vitest";
import { scoreWordRecall } from "../src/features/experiment/score-word-recall";

const words = ["lamp", "river", "ticket", "garden", "silver", "window"];

describe("scoreWordRecall", () => {
  it("returns the same raw score for the same list and response", () => {
    const first = scoreWordRecall(words, "river, garden, lamp");
    const second = scoreWordRecall(words, "river, garden, lamp");

    expect(first).toEqual(second);
    expect(first).toMatchObject({ ok: true, totalCount: 6, correctCount: 3 });
  });

  it("matches without case or surrounding punctuation and counts a word only once", () => {
    expect(scoreWordRecall(words, "LAMP! river, river; window.")).toMatchObject({
      ok: true,
      correctCount: 3,
      correctWords: ["lamp", "river", "window"],
      missedWords: ["ticket", "garden", "silver"],
      duplicateCount: 1,
      unrecognizedCount: 0,
    });
  });

  it("does not award credit for off-list input", () => {
    expect(scoreWordRecall(words, "lamp, dragon, window")).toMatchObject({
      ok: true,
      correctCount: 2,
      unrecognizedCount: 1,
    });
  });

  it("allows an empty response as a zero-item result", () => {
    expect(scoreWordRecall(words, "   ")).toMatchObject({
      ok: true,
      totalCount: 6,
      correctCount: 0,
      correctWords: [],
      missedWords: words,
    });
  });

  it.each([null, 42, {}, ["lamp"]])("rejects a malformed response: %s", (response) => {
    expect(scoreWordRecall(words, response)).toMatchObject({
      ok: false,
      code: "invalid-response",
    });
  });

  it("rejects overlong input without processing or echoing it", () => {
    const result = scoreWordRecall(words, "x".repeat(1_001));

    expect(result).toMatchObject({ ok: false, code: "response-too-long" });
    expect(result.ok && "message" in result ? result.message : "").not.toContain("x".repeat(20));
  });

  const invalidWordLists: Array<{ label: string; words: unknown }> = [
    { label: "not an array", words: null },
    { label: "empty", words: [] },
    { label: "more than 50 words", words: Array.from({ length: 51 }, (_, index) => `word-${index}`) },
    { label: "duplicate after normalization", words: ["lamp", "LAMP"] },
    { label: "multiple words in one item", words: ["two words"] },
    { label: "blank item", words: [""] },
    { label: "non-string item", words: [null] },
  ];

  it.each(invalidWordLists)("rejects an invalid word list: $label", ({ words }) => {
    expect(scoreWordRecall(words, "lamp")).toMatchObject({
      ok: false,
      code: "invalid-word-list",
    });
  });
});
