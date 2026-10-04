import {
  MAX_OUTPUT_TOKENS,
  MAX_PROVIDER_RESPONSE_BYTES,
  OPENAI_MODEL,
  PROVIDER_TIMEOUT_MS,
  type CoachRequest,
  type CoachTurn,
  type ProviderFailureKind,
} from "@/lib/ai/contracts";
import { parseModelTurn } from "@/lib/ai/tools";
import { buildCoachInstructions, buildCoachUserPayload } from "@/lib/ai/prompt";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: {
      type: "string",
      description: "A brief, cautious reply grounded only in the selected public workspace context.",
    },
    action: {
      type: "object",
      additionalProperties: false,
      properties: {
        tool: {
          type: "string",
          enum: ["none", "open_concept", "open_game", "open_challenge", "open_evidence", "open_goal", "reflect"],
        },
        targetId: {
          type: "string",
          description: "An exact target ID from the supplied tool catalog; use an empty string for none.",
        },
      },
      required: ["tool", "targetId"],
    },
  },
  required: ["answer", "action"],
} as const;

export type ProviderResult =
  | { ok: true; turn: CoachTurn }
  | { ok: false; kind: ProviderFailureKind };

export function isOpenAICoachEnabled(): boolean {
  return process.env.COACH_AI_ENABLED === "true";
}

export function getOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

export function isOpenAICoachAvailable(): boolean {
  return isOpenAICoachEnabled() && Boolean(getOpenAIApiKey());
}

export function buildOpenAIRequestBody(request: CoachRequest) {
  return {
    model: OPENAI_MODEL,
    store: false,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    reasoning: { effort: "none" },
    instructions: buildCoachInstructions(),
    input: buildCoachUserPayload(request),
    text: {
      format: {
        type: "json_schema",
        name: "cognitive_fitness_coach_turn",
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
  };
}

async function readLimitedResponse(response: Response, maxBytes: number): Promise<string | null> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }

  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(output);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractStructuredText(value: unknown): string | null {
  if (!isRecord(value)) return null;
  if (typeof value.output_text === "string") return value.output_text;
  if (!Array.isArray(value.output)) return null;

  const textBlocks: string[] = [];
  for (const item of value.output) {
    if (!isRecord(item) || item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const block of item.content) {
      if (!isRecord(block)) continue;
      if (block.type === "refusal") return null;
      if (block.type === "output_text" && typeof block.text === "string") {
        textBlocks.push(block.text);
      }
    }
  }
  return textBlocks.length > 0 ? textBlocks.join("") : null;
}

export async function requestOpenAICoach(
  request: CoachRequest,
  options: {
    apiKey: string;
    fetcher?: typeof fetch;
    timeoutMs?: number;
  },
): Promise<ProviderResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? PROVIDER_TIMEOUT_MS);
  const fetcher = options.fetcher ?? fetch;

  try {
    const response = await fetcher(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(buildOpenAIRequestBody(request)),
      signal: controller.signal,
      cache: "no-store",
      redirect: "error",
    });

    if (response.status === 429) return { ok: false, kind: "rate_limited" };
    if (!response.ok) return { ok: false, kind: "unavailable" };

    const rawBody = await readLimitedResponse(response, MAX_PROVIDER_RESPONSE_BYTES);
    if (rawBody === null) return { ok: false, kind: "invalid_response" };

    let envelope: unknown;
    try {
      envelope = JSON.parse(rawBody);
    } catch {
      return { ok: false, kind: "invalid_response" };
    }

    const text = extractStructuredText(envelope);
    if (!text) return { ok: false, kind: "invalid_response" };
    const turn = parseModelTurn(text);
    return turn ? { ok: true, turn } : { ok: false, kind: "invalid_response" };
  } catch {
    return controller.signal.aborted
      ? { ok: false, kind: "timeout" }
      : { ok: false, kind: "unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
