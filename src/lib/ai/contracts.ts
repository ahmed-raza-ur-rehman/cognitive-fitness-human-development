export const OPENAI_PROVIDER_NAME = "OpenAI" as const;
export const OPENAI_MODEL = "gpt-5.4-mini" as const;
export const MAX_QUESTION_CHARS = 800;
export const MAX_ANSWER_CHARS = 1_200;
export const MAX_CONTEXT_CHARS = 3_500;
export const MAX_REQUEST_BYTES = 4_096;
export const MAX_PROVIDER_RESPONSE_BYTES = 32_768;
export const MAX_OUTPUT_TOKENS = 420;
export const PROVIDER_TIMEOUT_MS = 10_000;

export type CoachContextKind = "concept" | "game" | "challenge" | "evidence" | "goal";

export type CoachContextSelection = {
  kind: CoachContextKind;
  id: string;
};

export type CoachRequest = {
  question: string;
  context: CoachContextSelection | null;
  adultConfirmed: true;
  consent: true;
};

export const COACH_TOOL_NAMES = [
  "none",
  "open_concept",
  "open_game",
  "open_challenge",
  "open_evidence",
  "open_goal",
  "reflect",
] as const;

export type CoachToolName = (typeof COACH_TOOL_NAMES)[number];

export type CoachToolRequest = {
  tool: CoachToolName;
  targetId: string;
};

export type CoachTurn = {
  answer: string;
  workspaceItem: import("@/lib/ai/tools").WorkspaceItem | null;
};

export type ProviderFailureKind =
  | "timeout"
  | "rate_limited"
  | "unavailable"
  | "invalid_response";

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function hasOnlyKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}
