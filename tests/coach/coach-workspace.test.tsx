import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CoachWorkspace } from "@/features/coach/coach-workspace";
import { resetPuterClientQuota } from "@/lib/ai/puter";

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function puterStub(options: {
  signedIn?: boolean;
  username?: string;
  reply?: unknown;
  rejectWith?: unknown;
} = {}) {
  const chat = vi.fn<(messages: unknown, testMode: boolean, options: Record<string, unknown>) => Promise<unknown>>(async () => {
    if (options.rejectWith !== undefined) throw options.rejectWith;
    return options.reply ?? {
      message: {
        content: JSON.stringify({ answer: "A short, bounded reply.", action: { tool: "none", targetId: "" } }),
      },
    };
  });
  const signIn = vi.fn(async () => ({}));
  const signOut = vi.fn(async () => ({}));
  const getUser = vi.fn(async () => (options.username ? { username: options.username } : null));

  (globalThis as { window: Window & { puter?: unknown } }).window.puter = {
    auth: {
      isSignedIn: () => options.signedIn ?? true,
      signIn,
      signOut,
      getUser,
    },
    ai: { chat },
  };

  return { chat, signIn, signOut, getUser };
}

function chooseMode(name: RegExp) {
  fireEvent.click(screen.getByRole("radio", { name: name }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (globalThis as { window: { puter?: unknown } }).window.puter;
});

describe("CoachWorkspace", () => {
  beforeEach(() => {
    resetPuterClientQuota();
  });

  it("starts in device-only mode where nothing can be sent and local tools still work", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);
    render(<CoachWorkspace providerAvailable={false} puterEnabled={false} />);

    expect(await screen.findByText(/device-only mode\. the workspace tools below work without a provider/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose a guide mode first/i })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: /I consent to send this current question/i })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /openAI \(operator configured\)/i })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /puter guide \(your account\)/i })).toBeDisabled();

    expect(screen.getByRole("checkbox", { name: /I confirm I am 18 years or older/i })).not.toBeChecked();

    fireEvent.change(screen.getByLabelText("Choose a local tool"), { target: { value: "open_game:sequence" } });
    fireEvent.click(screen.getByRole("button", { name: "Open in shared workspace" }));
    expect(screen.getByRole("heading", { name: "Sequence Recall" })).toBeInTheDocument();
    expect(screen.getByText(/nothing was sent to an ai provider/i)).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("sends to OpenAI only after the adult declaration and fresh per-message consent, excluding local text", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      jsonResponse({ answer: "The concept is one reviewed description.", workspaceItem: null }),
    );
    vi.stubGlobal("fetch", fetcher);
    render(<CoachWorkspace providerAvailable puterEnabled={false} />);

    chooseMode(/openAI \(operator configured\)/i);
    expect(await screen.findByText(/openai is configured for this deployment/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Choose a local tool"), { target: { value: "reflect:session-fit" } });
    fireEvent.click(screen.getByRole("button", { name: "Open in shared workspace" }));
    fireEvent.change(screen.getByLabelText(/optional private note/i), { target: { value: "This private note remains local." } });

    fireEvent.change(screen.getByLabelText(/optional context for this question/i), {
      target: { value: "open_evidence:claim.working-memory-active" },
    });
    fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "What does this evidence claim say?" } });

    const ageGate = screen.getByRole("checkbox", { name: /I confirm I am 18 years or older/i });
    const consent = screen.getByRole("checkbox", { name: /I consent to send this current question/i });
    const send = screen.getByRole("button", { name: "Send to OpenAI" });

    // The payload preview is part of the disclosure, so it must reflect the current selection.
    fireEvent.click(screen.getByText(/preview exactly what would be sent/i));
    expect(screen.getByText(/the real request also carries the standing rules/i)).toBeInTheDocument();
    expect(screen.getByText(/"selectedContext":/)).toBeInTheDocument();
    expect(screen.getByText(/"localProgress": "never included"/)).toBeInTheDocument();

    // Nothing can be sent while either gate is unticked.
    expect(send).toBeDisabled();
    fireEvent.click(ageGate);
    fireEvent.click(consent);
    expect(consent).toBeChecked();
    expect(send).toBeEnabled();
    // Changing the declaration invalidates a consent that was given before it.
    fireEvent.click(ageGate);
    expect(consent).not.toBeChecked();
    expect(send).toBeDisabled();
    fireEvent.click(ageGate);
    fireEvent.click(consent);
    fireEvent.click(send);

    expect(await screen.findByText("The concept is one reviewed description.")).toBeInTheDocument();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const postCall = fetcher.mock.calls.find(([, init]) => init?.method === "POST");
    expect(postCall?.[0]).toBe("/coach/api");
    const sent = JSON.parse(String(postCall?.[1]?.body)) as Record<string, unknown>;
    expect(sent).toEqual({
      question: "What does this evidence claim say?",
      context: { kind: "evidence", id: "claim.working-memory-active" },
      adultConfirmed: true,
      consent: true,
    });
    expect(JSON.stringify(sent)).not.toContain("private note");
    expect(screen.getByRole("checkbox", { name: /I consent to send this current question/i })).not.toBeChecked();
    expect(ageGate).toBeChecked();
    expect(screen.getByText(/ai-generated guide \(openai\)/i)).toBeInTheDocument();
  });

  it("returns to a no-send state when the mode is switched back to this device", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);
    render(<CoachWorkspace providerAvailable puterEnabled={false} />);

    chooseMode(/openAI \(operator configured\)/i);
    fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I confirm I am 18 years or older/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I consent to send this current question/i }));
    expect(screen.getByRole("button", { name: "Send to OpenAI" })).toBeEnabled();

    chooseMode(/this device only \(no ai\)/i);

    expect(screen.getByText(/switched to device-only mode/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /choose a guide mode first/i })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: /I consent to send this current question/i })).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("uses the browser-side Puter path with its own consent, account state, and disclosure", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);
    const stub = puterStub({ username: "learner_one" });
    render(<CoachWorkspace providerAvailable={false} puterEnabled />);

    chooseMode(/puter guide \(your account\)/i);
    expect(await screen.findByText(/connected as learner_one/i)).toBeInTheDocument();

    // Puter pricing/limits are stated rather than promised.
    expect(screen.getByText(/free\s+monthly allowance and paid usage beyond it/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /puter pricing/i })).toHaveAttribute("href", "https://developer.puter.com/pricing/");

    fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "What should I read first?" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I confirm I am 18 years or older/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I consent to send this current question/i }));
    fireEvent.click(screen.getByRole("button", { name: "Ask with Puter" }));

    expect(await screen.findByText("A short, bounded reply.")).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    expect(stub.chat).toHaveBeenCalledTimes(1);

    const [messages, testMode, options] = stub.chat.mock.calls[0]!;
    expect(testMode).toBe(false);
    expect(options).toMatchObject({ normalize: true });
    const serialized = JSON.stringify(messages);
    expect(serialized).toContain("What should I read first?");
    expect(serialized).toContain("Cognitive Fitness");
    expect(serialized).toContain("not a clinician");
    expect(serialized).not.toContain("consent");

  });

  it("refuses to send through Puter without an adult declaration, consent, or a signed-in account", async () => {
    const stub = puterStub({ signedIn: false });
    render(<CoachWorkspace providerAvailable={false} puterEnabled />);

    chooseMode(/puter guide \(your account\)/i);
    expect(screen.getByText(/no puter account is connected in this browser yet/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/your question/i), { target: { value: "Any reading suggestion?" } });
    expect(screen.getByRole("button", { name: "Ask with Puter" })).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /I confirm I am 18 years or older/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /I consent to send this current question/i }));
    expect(screen.getByRole("button", { name: "Ask with Puter" })).toBeEnabled();

    // An unsigned-in account must refuse before any network call rather than failing silently.
    fireEvent.click(screen.getByRole("button", { name: "Ask with Puter" }));

    expect(await screen.findByText(/needs you to sign in with your own puter account first/i)).toBeInTheDocument();
    expect(stub.chat).not.toHaveBeenCalled();
    expect(screen.queryByText(/a short, bounded reply\./i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sign in with Puter" }));
    await waitFor(() => expect(stub.signIn).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Sign out of Puter" })).toBeInTheDocument();
  });

  it("keeps the guide framed as a doorway and never as an authority", () => {
    render(<CoachWorkspace providerAvailable={false} puterEnabled={false} />);

    expect(screen.getByRole("heading", { name: /the guide is a doorway, not an authority/i })).toBeInTheDocument();
    expect(screen.getByText(/never decides/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /choose a guided path/i })).toHaveAttribute("href", "/journeys");
    expect(screen.getByText(/authenticating with an account is separate/i)).toBeInTheDocument();
  });
});
