const MAX_EXPECTED_WORDS = 50;
const MAX_RESPONSE_CHARACTERS = 1_000;

export type RecallScore = {
  ok: true;
  totalCount: number;
  correctCount: number;
  correctWords: string[];
  missedWords: string[];
  duplicateCount: number;
  unrecognizedCount: number;
};

export type RecallScoreError = {
  ok: false;
  code: "invalid-word-list" | "invalid-response" | "response-too-long";
  message: string;
};

export type RecallScoreResult = RecallScore | RecallScoreError;

function normalizeWord(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
}

function invalid(
  code: RecallScoreError["code"],
  message: string,
): RecallScoreError {
  return { ok: false, code, message };
}

/**
 * Scores one self-paced recall response. Matching is case-insensitive and
 * punctuation-tolerant; duplicate and off-list entries never increase score.
 */
export function scoreWordRecall(
  expectedWords: unknown,
  response: unknown,
): RecallScoreResult {
  if (
    !Array.isArray(expectedWords)
    || expectedWords.length === 0
    || expectedWords.length > MAX_EXPECTED_WORDS
  ) {
    return invalid(
      "invalid-word-list",
      "This activity is not available right now. Return to the memory concept and try again.",
    );
  }

  const normalizedExpected: string[] = [];
  const originalExpected: string[] = [];
  const uniqueExpected = new Set<string>();

  for (const item of expectedWords as unknown[]) {
    if (typeof item !== "string") {
      return invalid(
        "invalid-word-list",
        "This activity is not available right now. Return to the memory concept and try again.",
      );
    }

    const normalized = normalizeWord(item);
    if (!normalized || /\s/u.test(normalized) || uniqueExpected.has(normalized)) {
      return invalid(
        "invalid-word-list",
        "This activity is not available right now. Return to the memory concept and try again.",
      );
    }

    uniqueExpected.add(normalized);
    normalizedExpected.push(normalized);
    originalExpected.push(item.trim());
  }

  if (typeof response !== "string") {
    return invalid(
      "invalid-response",
      "Enter your recalled words as text, or leave the field blank if none come to mind.",
    );
  }

  if (response.length > MAX_RESPONSE_CHARACTERS) {
    return invalid(
      "response-too-long",
      "That response is longer than this activity can check. Shorten it and try again; your text is still here.",
    );
  }

  const expectedSet = new Set(normalizedExpected);
  const seenResponses = new Set<string>();
  const recalled = new Set<string>();
  let duplicateCount = 0;
  let unrecognizedCount = 0;

  for (const rawEntry of response.split(/[\s,;]+/u)) {
    const normalized = normalizeWord(rawEntry);
    if (!normalized) {
      continue;
    }

    if (seenResponses.has(normalized)) {
      duplicateCount += 1;
      continue;
    }
    seenResponses.add(normalized);

    if (expectedSet.has(normalized)) {
      recalled.add(normalized);
    } else {
      unrecognizedCount += 1;
    }
  }

  const correctWords = normalizedExpected.flatMap((word, index) =>
    recalled.has(word) ? [originalExpected[index]] : [],
  );
  const missedWords = normalizedExpected.flatMap((word, index) =>
    recalled.has(word) ? [] : [originalExpected[index]],
  );

  return {
    ok: true,
    totalCount: originalExpected.length,
    correctCount: correctWords.length,
    correctWords,
    missedWords,
    duplicateCount,
    unrecognizedCount,
  };
}
