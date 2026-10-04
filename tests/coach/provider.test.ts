import { describe, expect, it, vi } from "vitest";
import { MAX_OUTPUT_TOKENS, MAX_PROVIDER_RESPONSE_BYTES, OPENAI_MODEL, type CoachRequest } from "@/lib/ai/contracts";
import { buildOpenAIRequestBody, requestOpenAICoach } from "@/lib/ai/openai-provider";

const request: CoachRequest = {
  question: "What does this practice item show?",
  context: { kind: "game", id: "sequence" },
  adultConfirmed: true,
  consent: true,
};

function providerResponse(answer: string, tool = "none", targetId = "") {
  return new Response(JSON.stringify({
    output: [{
      type: "message",
      content: [{
        type: "output_text",
        text: JSON.stringify({ answer, action: { tool, targetId } }),
      }],
    }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

describe("server-side OpenAI adapter", () => {
  it("uses the Responses API with stateless, token-bounded structured output", () => {
    const body = buildOpenAIRequestBody(request);
    expect(body.model).toBe(OPENAI_MODEL);
    expect(body.store).toBe(false);
    expect(body.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
    expect(body.text.format.type).toBe("json_schema");
    expect(body.text.format.strict).toBe(true);
    expect(body.input).toContain("current_question");
    expect(body.input).toContain("selected_public_workspace_context");
    expect(body).not.toHaveProperty("previous_response_id");
    expect(body).not.toHaveProperty("tools");
  });

  it("sends one fixed HTTPS request, validates its tool, and returns no provider metadata", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => providerResponse(
      "The score describes this sequence set only.",
      "open_game",
      "sequence",
    ));

    const result = await requestOpenAICoach(request, { apiKey: "server-secret", fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(init?.method).toBe("POST");
    expect(init?.redirect).toBe("error");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer server-secret");
    expect(JSON.stringify(result)).not.toContain("server-secret");
    expect(result).toMatchObject({
      ok: true,
      turn: {
        answer: "The score describes this sequence set only.",
        workspaceItem: { title: "Sequence Recall", href: "/train#activities" },
      },
    });

    const payload = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(payload.store).toBe(false);
    expect(payload.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
    expect(payload.model).toBe(OPENAI_MODEL);
    expect(payload).not.toHaveProperty("previous_response_id");
    const input = JSON.parse(String(payload.input)) as Record<string, unknown>;
    expect(input.current_question).toBe(request.question);
    expect(input.selected_public_workspace_context).toContain("Sequence Recall");
    expect(payload).not.toHaveProperty("conversation");
    expect(payload).not.toHaveProperty("history");
  });

  it("maps provider errors without exposing response bodies and does not retry", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response("secret upstream error", { status: 503 }));
    const result = await requestOpenAICoach(request, { apiKey: "server-secret", fetcher });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(result)).not.toContain("secret upstream error");
  });

  it("handles provider limits and invalid model actions safely", async () => {
    const limited = await requestOpenAICoach(request, {
      apiKey: "server-secret",
      fetcher: vi.fn<typeof fetch>(async () => new Response("", { status: 429 })),
    });
    expect(limited).toEqual({ ok: false, kind: "rate_limited" });

    const invalidAction = await requestOpenAICoach(request, {
      apiKey: "server-secret",
      fetcher: vi.fn<typeof fetch>(async () => providerResponse("Open an unsafe link.", "open_game", "https://example.com")),
    });
    expect(invalidAction).toEqual({ ok: false, kind: "invalid_response" });
  });

  it("rejects provider output that exceeds the response-byte ceiling", async () => {
    const oversized = await requestOpenAICoach(request, {
      apiKey: "server-secret",
      fetcher: vi.fn<typeof fetch>(async () => new Response("x".repeat(MAX_PROVIDER_RESPONSE_BYTES + 1), { status: 200 })),
    });
    expect(oversized).toEqual({ ok: false, kind: "invalid_response" });
  });

  it("times out once and makes no automatic retry", async () => {
    const fetcher = vi.fn<typeof fetch>((_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }));
    const result = await requestOpenAICoach(request, { apiKey: "server-secret", fetcher, timeoutMs: 5 });
    expect(result).toEqual({ ok: false, kind: "timeout" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
