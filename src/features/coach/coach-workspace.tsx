"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  COACH_CONTEXT_OPTIONS,
  WORKSPACE_TOOL_OPTIONS,
  resolveWorkspaceTool,
  type WorkspaceItem,
  type WorkspaceToolOption,
} from "@/lib/ai/tools";
import { isPlainRecord, MAX_QUESTION_CHARS } from "@/lib/ai/contracts";
import {
  PUTER_DOCS_URL,
  PUTER_PRICING_URL,
  isPuterSignedIn,
  puterSignIn,
  puterSignOut,
  readPuterUser,
  requestPuterCoach,
  type PuterAccount,
} from "@/lib/ai/puter";
import { Breadcrumbs, RouteOutlook } from "@/components/page-shell";
import styles from "./coach.module.css";

type GuideMode = "local" | "puter" | "openai";
type ChatMessage = { role: "you" | "guide"; text: string; source?: string };
const MAX_VISIBLE_MESSAGES = 40;

function appendChatMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
  return [...messages, message].slice(-MAX_VISIBLE_MESSAGES);
}

function isWorkspaceItem(value: unknown): value is WorkspaceItem {
  if (
    !isPlainRecord(value) ||
    !["concept", "game", "challenge", "evidence", "goal", "reflection"].includes(String(value.kind)) ||
    typeof value.title !== "string" ||
    typeof value.summary !== "string" ||
    !Array.isArray(value.details)
  ) return false;

  if (!value.details.every((detail) =>
    isPlainRecord(detail) && typeof detail.label === "string" && typeof detail.value === "string"
  )) return false;

  if (value.href !== undefined && (
    typeof value.href !== "string" ||
    !value.href.startsWith("/") ||
    value.href.startsWith("//") ||
    value.href.includes("\\")
  )) return false;

  if (value.references !== undefined && (
    !Array.isArray(value.references) ||
    !value.references.every((reference) =>
      isPlainRecord(reference) &&
      typeof reference.label === "string" &&
      typeof reference.url === "string" &&
      reference.url.startsWith("https://")
    )
  )) return false;

  return true;
}

function isCoachReply(value: unknown): value is { answer: string; workspaceItem: WorkspaceItem | null } {
  return isPlainRecord(value) &&
    typeof value.answer === "string" &&
    value.answer.length > 0 &&
    value.answer.length <= 1_200 &&
    (value.workspaceItem === null || isWorkspaceItem(value.workspaceItem));
}

function groupedOptions(options: readonly WorkspaceToolOption[]) {
  const groups = new Map<string, WorkspaceToolOption[]>();
  for (const option of options) {
    const group = groups.get(option.group) ?? [];
    group.push(option);
    groups.set(option.group, group);
  }
  return [...groups.entries()];
}

const MODE_COPY: Record<GuideMode, { label: string; detail: string }> = {
  local: {
    label: "This device only (no AI)",
    detail: "Nothing leaves the page. The workspace tools below open real product content, and no provider is contacted.",
  },
  puter: {
    label: "Puter guide (your account)",
    detail: "Your browser sends one question to Puter.js. Usage counts against your own Puter allowance, not this site's bill, and this app has no key and no server step.",
  },
  openai: {
    label: "OpenAI (operator configured)",
    detail: "This app's server sends one question to OpenAI using an operator-held key. Available only when the deployment is configured for it.",
  },
};

export function CoachWorkspace({
  providerAvailable,
  puterEnabled = true,
}: {
  providerAvailable: boolean;
  puterEnabled?: boolean;
}) {
  const [mode, setMode] = useState<GuideMode>("local");
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [contextChoice, setContextChoice] = useState("");
  const [toolChoice, setToolChoice] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [workspaceItem, setWorkspaceItem] = useState<WorkspaceItem | null>(null);
  const [localReflection, setLocalReflection] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  const [puterReady, setPuterReady] = useState(() => isPuterSignedIn());
  const [puterAccount, setPuterAccount] = useState<PuterAccount | null>(null);
  const [authNotice, setAuthNotice] = useState("");
  const availableContext = useMemo(() => groupedOptions(COACH_CONTEXT_OPTIONS), []);
  const availableTools = useMemo(() => groupedOptions(WORKSPACE_TOOL_OPTIONS), []);

  const selectedContextOption = COACH_CONTEXT_OPTIONS.find((option) => option.key === contextChoice);
  const selectedToolOption = WORKSPACE_TOOL_OPTIONS.find((option) => option.key === toolChoice);

  // Show whose account is connected before anything is sent, so the billing disclosure is concrete.
  useEffect(() => {
    if (mode !== "puter" || !puterReady || puterAccount) return;
    let active = true;
    readPuterUser()
      .then((account) => {
        if (active && account) setPuterAccount(account);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [mode, puterReady, puterAccount]);

  const modeAvailable = (candidate: GuideMode) =>
    candidate === "local" || (candidate === "openai" && providerAvailable) || (candidate === "puter" && puterEnabled);

  const aiChosen = mode !== "local";
  const canAsk = aiChosen && modeAvailable(mode) && adultConfirmed && consent && question.trim().length > 0 && !pending;
  const blockReason = !aiChosen
    ? "Device-only mode is active, so sending is disabled by design. Pick a guide mode above if you do want an AI answer."
    : pending
      ? "One request is already in flight; this page never sends a second copy."
      : !adultConfirmed
        ? "Tick the adults-only declaration to enable sending."
        : !consent
          ? "Tick the one-turn consent for this message; it is required for every send."
          : question.trim().length === 0
            ? "Type a question to send."
            : null;
  const sendLabel = mode === "puter" ? "Ask with Puter" : mode === "openai" ? "Send to OpenAI" : "Choose a guide mode first";

  function chooseMode(next: GuideMode) {
    if (!modeAvailable(next)) return;
    setMode(next);
    setConsent(false);
    setNotice(
      next === "local"
        ? "Switched to device-only mode. Nothing is sent, and no provider request is possible from this page."
        : next === "puter"
          ? "Puter mode selected. No question has been sent yet: sign in with your own Puter account, then consent per message."
          : "OpenAI mode selected. No question has been sent yet; consent is required for each message.",
    );
  }

  async function togglePuterAccount() {
    setAuthNotice("");
    try {
      if (puterReady) {
        await puterSignOut();
        setPuterReady(false);
        setPuterAccount(null);
        setAuthNotice("Signed out of Puter in this browser. The guide cannot send anything until you sign in again.");
        return;
      }
      const account = await puterSignIn();
      setPuterReady(true);
      setPuterAccount(account ?? await readPuterUser());
      setAuthNotice(
        account
          ? `Signed in as ${account.username} on your Puter account. Your allowance covers usage. No question was sent by signing in.`
          : "Puter reported a successful sign-in, though the profile could not be read. You can still send a question if the popup allows it.",
      );
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "error" in error ? String((error as { error: unknown }).error) : "";
      setAuthNotice(
        code === "popup_blocked"
          ? "Your browser blocked the Puter sign-in popup. Allow popups for this site, or continue using the local tools."
          : "Puter sign-in did not complete. Nothing was sent, and the local workspace tools still work.",
      );
    }
  }

  function openSelectedTool() {
    if (!selectedToolOption) return;
    const item = resolveWorkspaceTool({
      tool: selectedToolOption.tool,
      targetId: selectedToolOption.targetId,
    });
    if (!item) {
      setWorkspaceNotice("That workspace item is not available. Choose another local tool.");
      return;
    }
    setWorkspaceItem(item);
    setLocalReflection("");
    setWorkspaceNotice(`${item.title} is open in this page. Nothing was sent to an AI provider.`);
  }

  async function sendQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedQuestion = question.trim();
    if (!canAsk) return;

    const context = selectedContextOption?.context ?? null;
    setMessages((current) => appendChatMessage(current, { role: "you", text: cleanedQuestion }));
    setQuestion("");
    setConsent(false);
    setNotice("");
    setPending(true);

    if (mode === "puter") {
      try {
        const result = await requestPuterCoach({
          question: cleanedQuestion,
          context,
          adultConfirmed: true,
          consent: true,
        });
        if (!result.ok) {
          setNotice(result.message);
          setMessages((current) => appendChatMessage(current, {
            role: "guide",
            text: "No answer was produced. The message above explains what happened.",
          }));
          return;
        }
        setMessages((current) => appendChatMessage(current, { role: "guide", text: result.turn.answer, source: "Puter" }));
        if (result.turn.workspaceItem) {
          setWorkspaceItem(result.turn.workspaceItem);
          setLocalReflection("");
          setWorkspaceNotice(`Puter suggested ${result.turn.workspaceItem.title}. Choose its link below if you want to open it.`);
        }
      } catch {
        setNotice("The Puter request could not start. No automatic retry was attempted, and your local tools still work.");
      } finally {
        setPending(false);
      }
      return;
    }

    try {
      const response = await fetch("/coach/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanedQuestion,
          context,
          adultConfirmed: true,
          consent: true,
        }),
      });
      const value: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setNotice(
          isPlainRecord(value) && typeof value.message === "string"
            ? value.message
            : "The guide could not complete this request. Use the local tools below or try again later.",
        );
        return;
      }

      if (!isCoachReply(value)) {
        setNotice("The response could not be validated, so no workspace action was taken. Use a local tool or try again later.");
        return;
      }

      setMessages((current) => appendChatMessage(current, { role: "guide", text: value.answer, source: "OpenAI" }));
      if (value.workspaceItem) {
        setWorkspaceItem(value.workspaceItem);
        setLocalReflection("");
        setWorkspaceNotice(`The guide suggested ${value.workspaceItem.title}. Choose its link below if you want to open it.`);
      }
    } catch {
      setNotice("The AI connection failed. No automatic retry was attempted. Your local tools still work below.");
    } finally {
      setPending(false);
    }
  }

  const statusText = mode === "local"
    ? "Device-only mode. The workspace tools below work without a provider, an account, or a network request."
    : mode === "puter"
      ? puterReady
        ? `Puter is signed in${puterAccount ? ` as ${puterAccount.username}` : ""}. Each message still needs your consent, and usage is measured against your Puter account.`
        : "Puter is available but no account is connected here yet. Sign in below to enable the optional guide; nothing is sent by this page until you do."
      : providerAvailable
        ? "OpenAI is configured for this deployment. Sending a message still requires your explicit consent each time."
        : "The OpenAI provider is unavailable or not configured here. The shared workspace and all other product features remain usable.";

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.crumbs}>
        <Breadcrumbs
          label="Guide location"
          items={[{ label: "Home", href: "/" }, { label: "Guided paths", href: "/journeys" }, { label: "Optional guide" }]}
        />
      </div>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>GUIDE / OPTIONAL, TOOL-FIRST</p>
          <h1>Think together. Keep the choice yours.</h1>
          <p className={styles.lead}>
            Ask a short question, choose whether to share one reviewed item, and let the guide suggest a real concept,
            activity, evidence card, goal, challenge, or reflection prompt. You decide what to open — and whether to use
            an AI guide at all.
          </p>
          <ul className={styles.principles} aria-label="Guide boundaries">
            <li>No account or AI required</li>
            <li>No saved scores or history attached</li>
            <li>Tools are read-only and allowlisted</li>
          </ul>
        </div>

        <aside className={styles.privacyCard} aria-labelledby="provider-status-title">
          <div className={styles.privacyCardTop}>
            <span className={styles.miniLabel}>DATA SHARING / BEFORE YOU SEND</span>
            <span className={aiChosen ? styles.statusReady : styles.statusUnavailable} aria-hidden="true" />
          </div>
          <h2 id="provider-status-title">A deliberate, one-turn connection.</h2>
          <p role="status" aria-live="polite">{statusText}</p>

          <fieldset className={styles.modeGroup}>
            <legend>How would you like guidance?</legend>
            {(Object.keys(MODE_COPY) as GuideMode[]).map((candidate) => (
              <label className={styles.modeOption} key={candidate}>
                <input
                  type="radio"
                  name="coach-mode"
                  value={candidate}
                  checked={mode === candidate}
                  disabled={!modeAvailable(candidate)}
                  onChange={() => chooseMode(candidate)}
                />
                <span>
                  <strong>{MODE_COPY[candidate].label}</strong>
                  <small>
                    {modeAvailable(candidate)
                      ? MODE_COPY[candidate].detail
                      : candidate === "openai"
                        ? "Not available: this deployment has no OpenAI key configured, and none is needed to use the product."
                        : "Not available: the Puter guide is disabled for this deployment."}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>

          {mode === "puter" ? (
            <div className={styles.authBlock}>
              <p>
                <span className={styles.miniLabel}>PUTER ACCOUNT</span>
                {puterAccount ? `Connected as ${puterAccount.username}.` : "No Puter account is connected in this browser yet."}
              </p>
              <button className={`button button-quiet ${styles.localButton}`} type="button" onClick={togglePuterAccount} disabled={pending}>
                {puterReady ? "Sign out of Puter" : "Sign in with Puter"}
              </button>
              <p className={styles.fieldHint}>
                Sign-in opens Puter&apos;s own popup and is billed to your account. Their published model describes a free
                monthly allowance and paid usage beyond it — not unlimited free AI. This app cannot see your balance,
                limit your spend, or delete what Puter logs.{" "}
                <a href={PUTER_PRICING_URL} target="_blank" rel="noreferrer">Puter pricing <span className="visually-hidden">(opens in a new tab)</span></a>{" "}
                ·{" "}
                <a href={PUTER_DOCS_URL} target="_blank" rel="noreferrer">Puter.js docs <span className="visually-hidden">(opens in a new tab)</span></a>
              </p>
              {authNotice ? <p className={styles.requestNotice} role="status" aria-live="polite">{authNotice}</p> : null}
            </div>
          ) : null}

          <p>
            {aiChosen
              ? <>When you choose <strong>{sendLabel}</strong>, the current question is sent as written, plus one public workspace item if you select one and the fixed tool catalog. The app does not attach previous chat turns, saved game results, goals, activity history, or your private reflection note. Do not type scores, personal history, or sensitive details.</>
              : "While device-only mode is selected, nothing is sent anywhere. The same sentence you type stays in this page, and the workspace tools open only reviewed product content."}
          </p>
          <p>
            {mode === "puter"
              ? "The request goes from your browser to Puter.js under your account. Puter mediates the model call, so the retention and logging that apply are Puter's and the chosen provider's, not this app's; review their current terms before sending anything you would not want retained. The reply is AI-generated and may be wrong."
              : mode === "openai"
                ? "OpenAI states that API inputs are not used to train its models by default. Abuse-monitoring logs may retain prompts and responses for up to 30 days. This app sets store: false to disable Responses API application-state storage; that is not zero data retention."
                : "No provider is contacted, so no retention question arises from using the local tools. This page still cannot promise what your browser or hosting logs contain about the page view itself."}
          </p>
          <details className={styles.privacyDetails}>
            <summary>Provider, age, and account details</summary>
            <ul>
              <li>Google sign-in is deliberately not used as an AI switch. Authenticating with an account is separate from authorising paid model usage, and this prototype has no user database to hold either.</li>
              <li>Puter mode needs a Puter account belonging to you; this product holds no key and no server for it. Sign-in is a popup and is optional — you can keep using the local tools.</li>
              <li>The OpenAI path uses a server-held key that an operator configures; it is separate from any sign-in or consumer chat account.</li>
              <li>This feature is adult-only: you must self-declare that you are 18 or older before using a provider. There is no parent or guardian-consent workflow, and this self-declaration is not verified age or identity. We do not request or store a birth date.</li>
              <li>The provider request is stateless: no prior response ID or conversation history is sent.</li>
              <li>The response is AI-generated and may be wrong. It is not diagnosis, treatment, professional advice, or an assessment.</li>
            </ul>
            <p className={styles.providerLinks}>
              <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer">OpenAI data controls <span className="visually-hidden">(opens in a new tab)</span></a>
              <a href="https://openai.com/policies/services-agreement/" target="_blank" rel="noreferrer">OpenAI Services Agreement <span className="visually-hidden">(opens in a new tab)</span></a>
            </p>
          </details>
        </aside>
      </header>

      <div className={styles.workspaceGrid}>
        <section className={styles.panel} aria-labelledby="guide-chat-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.miniLabel}>OPTIONAL AI GUIDE</p>
              <h2 id="guide-chat-title">Ask, then review the suggestion.</h2>
            </div>
            <div className={styles.chatActions}>
              <span className={styles.readOnlyTag}>One turn at a time</span>
              <button
                className={styles.clearConversationButton}
                type="button"
                onClick={() => {
                  setMessages([]);
                  setNotice("");
                }}
                disabled={messages.length === 0 || pending}
              >
                Clear conversation
              </button>
            </div>
          </div>
          <p className={styles.panelIntro}>
            Saved activity results and prior messages are not automatically attached. The question you type is sent as
            written; do not include scores or sensitive details. If selected, one reviewed public item is the only extra
            context.
          </p>

          <label className={styles.ageGate} htmlFor="coach-adult-confirm">
            <input
              id="coach-adult-confirm"
              type="checkbox"
              checked={adultConfirmed}
              onChange={(event) => {
                setAdultConfirmed(event.target.checked);
                setConsent(false);
              }}
            />
            <span>
              <strong>Adults only.</strong> I confirm I am 18 years or older. This is a self-declaration, not age verification. We do not collect a birth date; this feature has no parent or guardian consent flow and is unavailable to minors.
            </span>
          </label>

          <div className={styles.contextControl}>
            <label htmlFor="coach-context">Optional context for this question</label>
            <select
              id="coach-context"
              value={contextChoice}
              onChange={(event) => {
                setContextChoice(event.target.value);
                setConsent(false);
              }}
            >
              <option value="">No extra context</option>
              {availableContext.map(([group, options]) => (
                <optgroup key={group} label={group}>
                  {options.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className={styles.fieldHint}>
              {selectedContextOption
                ? `One selected item: ${selectedContextOption.label}. It is not your personal progress.`
                : "Nothing is selected by default. No local scores, saved goals, or reflections can be chosen."}
            </p>
          </div>

          <div className={styles.messageList} role="log" aria-label="Current page conversation" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <p className={styles.emptyConversation}>
                Your guide is optional. Ask about a selected item or request a next step. Messages stay in this page&apos;s memory until you leave or refresh; they are not stored by this app.
              </p>
            ) : messages.map((message, index) => (
              <article className={message.role === "you" ? styles.userMessage : styles.guideMessage} key={`${message.role}-${index}`}>
                <p className={styles.messageRole}>{message.role === "you" ? "You" : `AI-generated guide${message.source ? ` (${message.source})` : ""}`}</p>
                <p className={styles.messageText}>{message.text}</p>
              </article>
            ))}
            {pending ? <p className={styles.pendingMessage} role="status">Waiting for the optional provider…</p> : null}
          </div>

          <form className={styles.questionForm} onSubmit={sendQuestion}>
            <label htmlFor="coach-question">Your question <span>(maximum {MAX_QUESTION_CHARS} characters)</span></label>
            <textarea
              id="coach-question"
              maxLength={MAX_QUESTION_CHARS}
              rows={4}
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setConsent(false);
              }}
              placeholder="For example: What does this activity practice, and what can its result not tell me?"
              aria-describedby="coach-question-hint"
              disabled={pending}
            />
            <p className={styles.fieldHint} id="coach-question-hint">
              {aiChosen
                ? "Avoid personal or health information. Only the current question is sent; the visible conversation is not used as future context."
                : "You can write here without sending anything: device-only mode has no provider. Choose a guide mode above to send."}
            </p>

            {aiChosen ? (
              <details className={styles.payloadPreview}>
                <summary>Preview exactly what would be sent</summary>
                <pre aria-label="Provider request preview">
{JSON.stringify(
  {
    question: question.trim() ? `${question.trim().slice(0, 160)}${question.trim().length > 160 ? "…" : ""}` : "(empty)",
    selectedContext: selectedContextOption ? selectedContextOption.label : "none",
    fixedToolCatalog: "the allowlisted tool names and IDs above",
    localProgress: "never included",
  },
  null,
  2,
)}
                </pre>
                <p className={styles.fieldHint}>
                  The real request also carries the standing rules and the same bounded context. This preview exists so the
                  disclosure is checkable rather than a promise.
                </p>
              </details>
            ) : null}

            {aiChosen ? (
              <label className={styles.consentLabel} htmlFor="coach-consent">
                <input
                  id="coach-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  disabled={pending}
                  required
                />
                <span>
                  I consent to send this current question and the selected public item, if any, plus the fixed tool list to{" "}
                  {mode === "puter" ? "Puter.js from my browser, on my own account" : "OpenAI"} for this one reply. I will not include sensitive or identifying details.
                </span>
              </label>
            ) : null}
            <button
              className={`button button-primary ${styles.sendButton}`}
              type="submit"
              disabled={!canAsk}
            >
              {pending ? "Sending…" : sendLabel}
            </button>
            {blockReason ? (
              <p className={styles.fieldHint} role="status">
                {blockReason}
              </p>
            ) : null}
            {notice ? <p className={styles.requestNotice} role="status" aria-live="polite">{notice}</p> : null}
          </form>
        </section>

        <section className={styles.panel} aria-labelledby="shared-workspace-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.miniLabel}>REAL PRODUCT TOOLS / NO AI REQUIRED</p>
              <h2 id="shared-workspace-title">Shared workspace</h2>
            </div>
            <span className={styles.localTag}>Local</span>
          </div>
          <p className={styles.panelIntro}>
            Open a reviewed product item here without sending anything. An AI suggestion appears in this same workspace, but never opens a page or changes data on its own.
          </p>

          <div className={styles.toolControl}>
            <label htmlFor="workspace-tool">Choose a local tool</label>
            <select id="workspace-tool" value={toolChoice} onChange={(event) => setToolChoice(event.target.value)}>
              <option value="">Choose an item to open…</option>
              {availableTools.map(([group, options]) => (
                <optgroup key={group} label={group}>
                  {options.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className={`button button-quiet ${styles.localButton}`} type="button" onClick={openSelectedTool} disabled={!selectedToolOption}>
              Open in shared workspace
            </button>
            {workspaceNotice ? <p className={styles.fieldHint} role="status" aria-live="polite">{workspaceNotice}</p> : null}
          </div>

          {workspaceItem ? (
            <article className={styles.workspaceItem} aria-label={`${workspaceItem.kind} workspace item`}>
              <div className={styles.workspaceItemTop}>
                <p className={styles.itemKind}>{workspaceItem.kind.replaceAll("-", " ")}</p>
                <button
                  className={styles.clearButton}
                  type="button"
                  onClick={() => {
                    setWorkspaceItem(null);
                    setLocalReflection("");
                    setWorkspaceNotice("Workspace cleared. No item was sent to the provider.");
                  }}
                >
                  Clear item
                </button>
              </div>
              <h3>{workspaceItem.title}</h3>
              <p className={styles.itemSummary}>{workspaceItem.summary}</p>
              {workspaceItem.details.length > 0 ? (
                <dl className={styles.detailsList}>
                  {workspaceItem.details.map((detail, index) => (
                    <div key={`${detail.label}-${index}`}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {workspaceItem.references?.length ? (
                <div className={styles.references}>
                  <h4>Reviewed references</h4>
                  <ul>
                    {workspaceItem.references.map((reference) => (
                      <li key={`${reference.label}-${reference.url}`}>
                        <a href={reference.url} target="_blank" rel="noreferrer">
                          {reference.label} <span className="visually-hidden">(opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {workspaceItem.href ? (
                <Link className={`button button-outline ${styles.openItemLink}`} href={workspaceItem.href}>
                  {workspaceItem.linkLabel ?? "Open in Cognitive Fitness"}
                </Link>
              ) : null}
              {workspaceItem.kind === "reflection" ? (
                <div className={styles.reflectionScratchpad}>
                  <label htmlFor="coach-local-reflection">Optional private note <span>(this page only; not saved or sent)</span></label>
                  <textarea
                    id="coach-local-reflection"
                    rows={4}
                    maxLength={1_000}
                    value={localReflection}
                    onChange={(event) => setLocalReflection(event.target.value)}
                    placeholder="You can leave this blank. Avoid sensitive details on a shared device."
                  />
                  <button className={styles.clearNoteButton} type="button" onClick={() => setLocalReflection("")} disabled={localReflection.length === 0}>
                    Clear private note
                  </button>
                </div>
              ) : null}
            </article>
          ) : (
            <div className={styles.emptyWorkspace}>
              <span className={styles.workspaceMark} aria-hidden="true">✳</span>
              <p>Choose a concept, activity, challenge, evidence item, goal, or reflection prompt. Its actual product content will appear here.</p>
              <nav className={styles.quickLinks} aria-label="Explore without AI">
                <Link href="/explore">Explore concepts</Link>
                <Link href="/journeys">Choose a guided path</Link>
                <Link href="/train#activities">Browse activities</Link>
                <Link href="/evidence">Inspect evidence</Link>
              </nav>
            </div>
          )}
        </section>
      </div>

      <section className={styles.boundaryNote} aria-labelledby="guide-boundary-title">
        <h2 id="guide-boundary-title">The guide is a doorway, not an authority.</h2>
        <p>
          Deterministic game scoring and stored progress are not automatically passed to any AI, and an AI never decides
          scores. The question you type is sent as written. Any result describes only its specific activity; it does not
          diagnose or establish everyday ability or transfer. If a provider is unavailable, the local tools above and the
          rest of the product continue to work.
        </p>
      </section>

      <RouteOutlook
        routeId="coach"
        title="Guidance without a provider"
        note="Everything the guide can point at is also reachable directly — that redundancy is deliberate."
      />
    </main>
  );
}
