import { describe, expect, it } from "vitest";
import { MAX_CONTEXT_CHARS } from "@/lib/ai/contracts";
import {
  COACH_CONTEXT_OPTIONS,
  REFLECTION_PROMPTS,
  WORKSPACE_TOOL_OPTIONS,
  buildProviderContext,
  getProviderToolCatalog,
  parseCoachContext,
  parseCoachRequest,
  parseModelTurn,
  resolveWorkspaceTool,
} from "@/lib/ai/tools";

describe("bounded coach workspace tools", () => {
  it("offers an allowlisted local item in every requested product area", () => {
    const groups = new Set(WORKSPACE_TOOL_OPTIONS.map((option) => option.group));
    expect(groups).toEqual(new Set([
      "Concepts",
      "Games and activities",
      "Challenges",
      "Evidence",
      "Practice goals",
      "Reflection",
    ]));

    for (const option of WORKSPACE_TOOL_OPTIONS) {
      expect(resolveWorkspaceTool({ tool: option.tool, targetId: option.targetId })).not.toBeNull();
    }
  });

  it("builds context from one explicitly selected public item only", () => {
    const parsed = parseCoachContext({ kind: "evidence", id: "claim.working-memory-active" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const context = buildProviderContext(parsed.context);
    expect(context?.kind).toBe("evidence");
    expect(context?.title).toBe("Working memory in a task");
    expect(JSON.stringify(context)).not.toContain("correctCount");
    expect(JSON.stringify(context)).not.toContain("sessionHistory");
    expect(WORKSPACE_TOOL_OPTIONS.filter((option) => option.tool === "reflect").every((option) => option.context === undefined)).toBe(true);
    expect(COACH_CONTEXT_OPTIONS.map((option) => option.context.kind)).not.toContain("reflection");
    for (const option of COACH_CONTEXT_OPTIONS) {
      const bounded = buildProviderContext(option.context);
      expect(bounded).not.toBeNull();
      expect(JSON.stringify(bounded).length).toBeLessThanOrEqual(MAX_CONTEXT_CHARS);
    }
  });

  it("rejects unknown contexts and request fields instead of ignoring them", () => {
    expect(parseCoachContext({ kind: "game", id: "not-a-game" })).toEqual({ ok: false });
    expect(parseCoachContext({ kind: "evidence", id: "claim.working-memory-active", url: "https://example.com" })).toEqual({ ok: false });
    expect(parseCoachRequest({ question: "Help me choose.", context: null, adultConfirmed: true, consent: true })).toEqual({
      question: "Help me choose.", context: null, adultConfirmed: true, consent: true,
    });
    expect(parseCoachRequest({ question: "Help me choose.", context: null, adultConfirmed: false, consent: true })).toBeNull();
    expect(parseCoachRequest({ question: "Help me choose.", context: null, adultConfirmed: true, consent: false })).toBeNull();
    expect(parseCoachRequest({ question: "Help me choose.", context: null, adultConfirmed: true, consent: true, history: [] })).toBeNull();
    expect(parseCoachRequest({ question: "   ", context: null, adultConfirmed: true, consent: true })).toBeNull();
    expect(parseCoachRequest({ question: "x".repeat(801), context: null, adultConfirmed: true, consent: true })).toBeNull();
    expect(parseCoachRequest({ question: "Help me choose.", context: { kind: "goal", id: "not-a-goal" }, adultConfirmed: true, consent: true })).toBeNull();
  });

  it("accepts only a valid read-only tool request and rejects arbitrary links", () => {
    const valid = parseModelTurn(JSON.stringify({
      answer: "This is one task-specific practice activity.",
      action: { tool: "open_game", targetId: "sequence" },
    }));
    expect(valid?.workspaceItem?.title).toBe("Sequence Recall");
    expect(valid?.workspaceItem?.href).toBe("/train#activities");

    expect(parseModelTurn(JSON.stringify({
      answer: "Open this link.",
      action: { tool: "open_game", targetId: "sequence", href: "javascript:alert(1)" },
    }))).toBeNull();
    expect(parseModelTurn(JSON.stringify({
      answer: "Try a different activity.",
      action: { tool: "open_game", targetId: "javascript:alert(1)" },
    }))).toBeNull();
    expect(parseModelTurn(JSON.stringify({
      answer: "No action.",
      action: { tool: "none", targetId: "open_concept:memory" },
    }))).toBeNull();
  });

  it("uses fixed, reviewed reflection prompts and discloses challenge limits", () => {
    for (const prompt of REFLECTION_PROMPTS) {
      const item = resolveWorkspaceTool({ tool: "reflect", targetId: prompt.id });
      expect(item?.summary).toBe(prompt.prompt);
      expect(item?.href).toBeUndefined();
    }

    const challenge = resolveWorkspaceTool({ tool: "open_challenge", targetId: "friend" });
    expect(challenge?.summary).toContain("not a verified competition");
    expect(challenge?.details.some((detail) => detail.value.includes("self-reported and unverified"))).toBe(true);
  });

  it("does not put source URLs or arbitrary data in the provider tool catalog", () => {
    const catalog = getProviderToolCatalog();
    expect(catalog).toContain("open_concept | concept.memory");
    expect(catalog).toContain("open_evidence | claim.working-memory-active");
    expect(catalog).not.toContain("https://");
    expect(catalog).not.toContain("javascript:");
  });
});
