import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CoachRequest } from "@/lib/ai/contracts";
import {
  PUTER_SDK_URL,
  extractReplyText,
  isPuterEnabled,
  loadPuterSdk,
  readPuterUser,
  resetPuterSdkCache,
  requestPuterCoach,
  resetPuterClientQuota,
} from "@/lib/ai/puter";

const request: CoachRequest = {
  question: "What does this activity practice?",
  context: { kind: "game", id: "sequence" },
  adultConfirmed: true,
  consent: true,
};

type Stub = {
  isSignedIn: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  chat: ReturnType<typeof vi.fn>;
};

function makePuterStub(overrides: Partial<{ signedIn: boolean; reply: unknown; error: unknown }> = {}): Stub {
  const stub: Stub = {
    isSignedIn: vi.fn(() => overrides.signedIn ?? true),
    getUser: vi.fn(async () => ({ username: "learner" })),
    signIn: vi.fn(async () => ({})),
    signOut: vi.fn(async () => ({})),
    chat: vi.fn(async () => {
      if (overrides.error) throw overrides.error;
      return overrides.reply ?? { message: { content: JSON.stringify({ answer: "A bounded reply.", action: { tool: "none", targetId: "" } }) } };
    }),
  };
  (window as unknown as { puter: unknown }).puter = { auth: stub, ai: { chat: stub.chat } };
  return stub;
}

function clearPuter() {
  delete (window as unknown as { puter?: unknown }).puter;
  document.querySelectorAll(`script[src="${PUTER_SDK_URL}"]`).forEach((node) => node.remove());
}

describe("Puter.js browser adapter", () => {
  beforeEach(() => {
    clearPuter();
    resetPuterClientQuota();
    resetPuterSdkCache();
  });

  afterEach(() => {
    clearPuter();
    resetPuterClientQuota();
    resetPuterSdkCache();
    delete process.env.NEXT_PUBLIC_COACH_PUTER_ENABLED;
  });

  it("loads the published SDK once, over HTTPS, and never twice", async () => {
    const created: HTMLScriptElement[] = [];
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const element = realCreate(tag) as HTMLScriptElement;
      if (tag === "script") created.push(element);
      return element;
    });

    const first = loadPuterSdk(50);
    const second = loadPuterSdk(50);
    expect(created).toHaveLength(1);
    expect(created[0]?.src).toBe(PUTER_SDK_URL);
    expect(created[0]?.crossOrigin).toBe("anonymous");
    expect(PUTER_SDK_URL.startsWith("https://")).toBe(true);

    // The SDK defines window.puter on load; simulate that and let the promise settle.
    makePuterStub();
    created[0]?.onload?.({} as Event);
    await expect(first).resolves.toBeDefined();
    await expect(second).resolves.toBeDefined();
  });

  it("gives up rather than hanging when the SDK never arrives, and lets a later attempt try again", async () => {
    makePuterStub();
    const realPuter = (window as unknown as { puter: unknown }).puter;
    delete (window as unknown as { puter?: unknown }).puter;

    vi.spyOn(document, "createElement").mockImplementation(() => ({ onload: null, onerror: null, remove: vi.fn() }) as unknown as HTMLScriptElement);

    await expect(loadPuterSdk(20)).rejects.toBeTruthy();
    // A failed load is not cached, so the next call can recover once the global exists.
    resetPuterSdkCache();
    vi.restoreAllMocks();
    (window as unknown as { puter: unknown }).puter = realPuter;
    await expect(loadPuterSdk(20)).resolves.toBeDefined();
  });

  it("reads the assistant text from every documented reply shape and refuses a refusal", () => {
    expect(extractReplyText("plain text")).toBe("plain text");
    expect(extractReplyText({ message: { content: "normalised" } })).toBe("normalised");
    expect(extractReplyText({ message: { content: [{ type: "text", text: "block one" }, { type: "text", text: " block two" }] } })).toBe("block one block two");
    expect(extractReplyText({ message: { content: [{ type: "refusal" }] } })).toBeNull();
    expect(extractReplyText(null)).toBeNull();
    expect(extractReplyText("```json\n{\"answer\":\"hi\",\"action\":{\"tool\":\"none\",\"targetId\":\"\"}}\n```")).toContain("answer");
  });

  it("refuses to send anything before the user has an account connected", async () => {
    const stub = makePuterStub({ signedIn: false });

    const result = await requestPuterCoach(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("sign_in_required");
      expect(result.message).toMatch(/no question was sent/i);
    }
    expect(stub.chat).not.toHaveBeenCalled();
  });

  it("sends one bounded turn, revalidates the tool, and applies nothing when the reply is malformed", async () => {
    const good = makePuterStub({
      reply: { message: { content: JSON.stringify({ answer: "Try the rules first.", action: { tool: "open_game", targetId: "sequence" } }) } },
    });
    const accepted = await requestPuterCoach(request);
    expect(accepted.ok).toBe(true);
    if (accepted.ok) {
      expect(accepted.turn.workspaceItem?.title).toBe("Sequence Recall");
      expect(accepted.turn.workspaceItem?.href).toContain("/train");
    }
    expect(good.chat).toHaveBeenCalledTimes(1);
    const [messages, testMode, options] = good.chat.mock.calls[0];
    expect(testMode).toBe(false);
    expect(options).toMatchObject({ normalize: true });
    const serialized = JSON.stringify(messages);
    expect(serialized).toContain("What does this activity practice?");
    expect(serialized).toContain("Sequence Recall");
    expect(serialized).toContain("not a clinician");
    // Nothing personal, local, or historical is attached, and the contract is stated to the model.
    expect(serialized).not.toContain("correctCount");
    expect(serialized).not.toContain("goalId");
    expect(serialized).not.toContain("localStorage");
    expect(serialized).toContain("single JSON object");

    const noisy = makePuterStub({ reply: { message: { content: "Here you go: " + JSON.stringify({ answer: "x".repeat(20), action: { tool: "none", targetId: "" } }) } } });
    const rejected = await requestPuterCoach(request);
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.kind).toBe("invalid_response");
    expect(noisy.chat).toHaveBeenCalledTimes(1);
  });

  it("maps provider failures to messages that never retry automatically", async () => {
    const quota = makePuterStub({ error: new Error("HTTP 429 too many requests") });

    const limited = await requestPuterCoach(request);
    expect(!limited.ok && limited.kind).toBe("rate_limited");
    expect(quota.chat).toHaveBeenCalledTimes(1);

    resetPuterSdkCache();
    const broken = makePuterStub({ error: new Error("network down") });
    const failed = await requestPuterCoach(request);
    expect(!failed.ok && failed.kind).toBe("unavailable");
    expect(broken.chat).toHaveBeenCalledTimes(1);

    resetPuterSdkCache();
    const stalled = makePuterStub({ reply: new Promise(() => undefined) });
    const timeout = await requestPuterCoach(request, { timeoutMs: 15 });
    expect(!timeout.ok && timeout.kind).toBe("timeout");
    // Exactly one attempt was made; a timed-out request is never silently resent.
    expect(stalled.chat).toHaveBeenCalledTimes(1);
  });

  it("caps repeated requests in one page and can be switched off for a deployment", async () => {
    makePuterStub();
    for (let index = 0; index < 6; index += 1) {
      const outcome = await requestPuterCoach(request);
      expect(outcome.ok).toBe(true);
    }
    const blocked = await requestPuterCoach(request);
    expect(!blocked.ok && blocked.kind).toBe("rate_limited");
    expect(blocked.ok ? "" : blocked.message).toMatch(/did not retry/i);

    resetPuterClientQuota();
    expect(isPuterEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_COACH_PUTER_ENABLED = "false";
    expect(isPuterEnabled()).toBe(false);
    const disabled = await requestPuterCoach(request);
    expect(!disabled.ok && disabled.kind).toBe("disabled");
    expect(disabled.ok ? "" : disabled.message).toMatch(/switched off/i);
  });

  it("reads the connected account defensively", async () => {
    const stub = makePuterStub();
    await expect(readPuterUser()).resolves.toEqual({ username: "learner" });

    stub.isSignedIn.mockImplementation(() => {
      throw new Error("nope");
    });
    await expect(readPuterUser()).resolves.toBeNull();

    (window as unknown as { puter: { auth: { isSignedIn: () => boolean; getUser: () => Promise<null> }; ai: unknown } }).puter = {
      auth: { isSignedIn: () => true, getUser: async () => null },
      ai: {},
    };
    await expect(readPuterUser()).resolves.toBeNull();
  });
});
