import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/coach/api/route";
import { MAX_REQUEST_BYTES, MAX_OUTPUT_TOKENS, OPENAI_MODEL } from "@/lib/ai/contracts";
import { COACH_INSTANCE_BUDGET, coachInstanceBudget, coachRequestLimiter } from "@/lib/ai/rate-limit";

const URL = "https://cognitive.example/coach/api";

function makeRequest(
  value: unknown,
  options: { origin?: string | null; ip?: string; contentType?: string; raw?: string; contentLength?: string } = {},
) {
  const raw = options.raw ?? JSON.stringify(value);
  const headers = new Headers({
    "Content-Type": options.contentType ?? "application/json",
    "X-Real-IP": options.ip ?? "198.51.100.22",
  });
  if (options.origin !== null) headers.set("Origin", options.origin ?? "https://cognitive.example");
  if (options.contentLength) headers.set("Content-Length", options.contentLength);
  return new Request(URL, { method: "POST", headers, body: raw });
}

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

const validRequest = {
  question: "What does this activity practice?",
  context: { kind: "game", id: "sequence" },
  adultConfirmed: true,
  consent: true,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  coachRequestLimiter.reset();
  coachInstanceBudget.reset();
});

beforeEach(() => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("COACH_AI_ENABLED", "false");
  coachRequestLimiter.reset();
  coachInstanceBudget.reset();
});

describe("/coach/api", () => {
  it("reports provider availability without disclosing the server credential", async () => {
    const disabled = await GET();
    expect(disabled.status).toBe(200);
    expect(await disabled.json()).toEqual({ available: false, provider: "OpenAI" });
    expect(disabled.headers.get("cache-control")).toContain("no-store");

    vi.stubEnv("OPENAI_API_KEY", "do-not-return-this-secret");
    expect(await (await GET()).json()).toEqual({ available: false, provider: "OpenAI" });
    vi.stubEnv("COACH_AI_ENABLED", "true");
    const enabled = await GET();
    const body = await enabled.text();
    expect(JSON.parse(body)).toEqual({ available: true, provider: "OpenAI" });
    expect(body).not.toContain("do-not-return-this-secret");
  });

  it("requires same-origin JSON and rejects oversized requests", async () => {
    const crossOrigin = await POST(makeRequest(validRequest, { origin: "https://attacker.example" }));
    expect(crossOrigin.status).toBe(403);

    const missingOrigin = await POST(makeRequest(validRequest, { origin: null }));
    expect(missingOrigin.status).toBe(403);

    const wrongType = await POST(makeRequest(validRequest, { contentType: "text/plain" }));
    expect(wrongType.status).toBe(415);

    const largeBody = "x".repeat(MAX_REQUEST_BYTES + 1);
    const tooLarge = await POST(makeRequest(null, { raw: largeBody, contentLength: String(largeBody.length) }));
    expect(tooLarge.status).toBe(413);
  });

  it("requires adult self-attestation, per-request consent, and a strict minimal schema", async () => {
    const noConsent = await POST(makeRequest({ ...validRequest, consent: false }, { ip: "198.51.100.31" }));
    expect(noConsent.status).toBe(400);

    const noAdultConfirmation = await POST(makeRequest({ ...validRequest, adultConfirmed: false }, { ip: "198.51.100.32" }));
    expect(noAdultConfirmation.status).toBe(400);

    const withConversationHistory = await POST(makeRequest(
      { ...validRequest, history: [{ role: "user", content: "old turn" }] },
      { ip: "198.51.100.33" },
    ));
    expect(withConversationHistory.status).toBe(400);

    const withPersonalState = await POST(makeRequest(
      { ...validRequest, scores: [5, 5], reflection: "private" },
      { ip: "198.51.100.34" },
    ));
    expect(withPersonalState.status).toBe(400);

    const invalidContext = await POST(makeRequest(
      { ...validRequest, context: { kind: "game", id: "not-in-catalog" } },
      { ip: "198.51.100.35" },
    ));
    expect(invalidContext.status).toBe(400);

    const longQuestion = await POST(makeRequest(
      { ...validRequest, question: "q".repeat(801) },
      { ip: "198.51.100.36" },
    ));
    expect(longQuestion.status).toBe(400);
  });

  it("falls back cleanly when no provider key is configured", async () => {
    const response = await POST(makeRequest(validRequest));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe("not_configured");
  });

  it("uses the fixed provider endpoint, server credential, token cap, and validated local tool map", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-server-secret");
    vi.stubEnv("COACH_AI_ENABLED", "true");
    const fetcher = vi.fn<typeof fetch>(async () => providerResponse(
      "This activity gives feedback about this sequence set only.",
      "open_game",
      "sequence",
    ));
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(makeRequest(validRequest));
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).not.toContain("test-server-secret");
    expect(JSON.parse(text)).toMatchObject({
      answer: "This activity gives feedback about this sequence set only.",
      workspaceItem: { title: "Sequence Recall", href: "/train#activities" },
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test-server-secret");
    const outgoing = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(outgoing.model).toBe(OPENAI_MODEL);
    expect(outgoing.store).toBe(false);
    expect(outgoing.max_output_tokens).toBe(MAX_OUTPUT_TOKENS);
    expect(outgoing).not.toHaveProperty("previous_response_id");
    expect(outgoing).not.toHaveProperty("conversation");
    expect(outgoing).not.toHaveProperty("tools");
    const input = JSON.parse(String(outgoing.input)) as Record<string, unknown>;
    expect(input.current_question).toBe(validRequest.question);
    const selectedContext = JSON.parse(String(input.selected_public_workspace_context)) as Record<string, unknown>;
    expect(selectedContext.title).toBe("Sequence Recall");
    expect(String(input.selected_public_workspace_context)).not.toContain("Target Finder");
  });

  it("maps provider limits and invalid actions to safe messages without returning upstream bodies", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-server-secret");
    vi.stubEnv("COACH_AI_ENABLED", "true");
    const upstreamLimit = vi.fn<typeof fetch>(async () => new Response("private upstream detail", { status: 429 }));
    vi.stubGlobal("fetch", upstreamLimit);
    const limited = await POST(makeRequest(validRequest, { ip: "198.51.100.23" }));
    expect(limited.status).toBe(429);
    expect((await limited.text())).not.toContain("private upstream detail");
    expect(upstreamLimit).toHaveBeenCalledTimes(1);

    const invalidTool = vi.fn<typeof fetch>(async () => providerResponse("Use this external page.", "open_game", "https://attacker.example"));
    vi.stubGlobal("fetch", invalidTool);
    const invalid = await POST(makeRequest(validRequest, { ip: "198.51.100.24" }));
    expect(invalid.status).toBe(502);
    expect(await invalid.json()).toMatchObject({ error: "invalid_response" });
    expect(invalidTool).toHaveBeenCalledTimes(1);
  });

  it("enforces a short-term per-client request limit", async () => {
    const firstFive = await Promise.all(Array.from({ length: 5 }, () =>
      POST(makeRequest(validRequest, { ip: "198.51.100.25" })),
    ));
    expect(firstFive.map((response) => response.status)).toEqual([503, 503, 503, 503, 503]);
    const sixth = await POST(makeRequest(validRequest, { ip: "198.51.100.25" }));
    expect(sixth.status).toBe(429);
    expect(sixth.headers.get("retry-after")).toBeTruthy();
  });

  it("caps provider calls in one warm server process", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-server-secret");
    vi.stubEnv("COACH_AI_ENABLED", "true");
    const fetcher = vi.fn<typeof fetch>(async () => providerResponse("Use a local item if helpful."));
    vi.stubGlobal("fetch", fetcher);
    const totalRequests = COACH_INSTANCE_BUDGET.maxRequests + 1;

    const responses = await Promise.all(Array.from({ length: totalRequests }, (_, index) =>
      POST(makeRequest(validRequest, { ip: `budget-client-${Math.floor(index / 5)}` })),
    ));
    expect(responses.filter((response) => response.status === 200)).toHaveLength(COACH_INSTANCE_BUDGET.maxRequests);
    const limited = responses.find((response) => response.status === 429);
    expect(limited).toBeDefined();
    expect(limited?.headers.get("retry-after")).toBeTruthy();
    expect(fetcher).toHaveBeenCalledTimes(COACH_INSTANCE_BUDGET.maxRequests);
  });
});
