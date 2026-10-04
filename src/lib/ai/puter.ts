import { MAX_PROVIDER_RESPONSE_BYTES, PROVIDER_TIMEOUT_MS, type CoachRequest, type CoachTurn } from "@/lib/ai/contracts";
import { buildCoachInstructions, buildCoachUserPayload } from "@/lib/ai/prompt";
import { parseModelTurn } from "@/lib/ai/tools";

/**
 * An optional, browser-side guide route through Puter.js.
 *
 * Why this exists: the product must not depend on the operator holding an API key or paying per
 * user. Puter's documented "user-pays" model means a signed-in user's own Puter account covers
 * their AI usage from their own allowance. That is materially different from an operator key, and
 * it changes what has to be disclosed — so this module is deliberately loud about three things:
 *
 * 1. Requests leave the browser directly for puter.com; no app server sees the question.
 * 2. Usage counts against the signed-in user's Puter allowance (a free monthly allowance, then paid
 *    usage) — it is not unlimited free AI, and this app cannot see or cap their bill.
 * 3. Nothing outside the current question plus at most one reviewed public item is ever sent.
 *
 * The feature stays optional: local tools, learning content, and every activity work without it.
 */

export const PUTER_SDK_URL = "https://js.puter.com/v2/";
export const PUTER_DOCS_URL = "https://docs.puter.com/";
export const PUTER_PRICING_URL = "https://developer.puter.com/pricing/";

const SDK_LOAD_TIMEOUT_MS = 15_000;
const MAX_CLIENT_REQUESTS_PER_WINDOW = 6;
const CLIENT_REQUEST_WINDOW_MS = 5 * 60_000;

export type PuterFailureKind =
  | "disabled"
  | "sdk_blocked"
  | "sign_in_required"
  | "sign_in_cancelled"
  | "rate_limited"
  | "timeout"
  | "invalid_response"
  | "unavailable";

export type PuterResult =
  | { ok: true; turn: CoachTurn }
  | { ok: false; kind: PuterFailureKind; message: string };

export type PuterAccount = { username: string };

type PuterChatMessage = { role: "system" | "user"; content: string };

type PuterApi = {
  auth: {
    isSignedIn: () => boolean;
    signIn: (options?: { attempt_temp_user_creation?: boolean }) => Promise<unknown>;
    signOut: () => Promise<unknown> | unknown;
    getUser: () => Promise<{ username?: string } | null>;
  };
  ai: {
    chat: (messages: PuterChatMessage[], testMode: false, options: Record<string, unknown>) => Promise<unknown>;
  };
};

declare global {
  interface Window {
    puter?: PuterApi;
  }
}

let sdkPromise: Promise<PuterApi> | null = null;
const requestTimes: number[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Loads the published Puter.js SDK exactly once and never reuses a stale script element. */
export function loadPuterSdk(timeoutMs = SDK_LOAD_TIMEOUT_MS): Promise<PuterApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  const existing = window.puter;
  if (existing?.ai?.chat && existing.auth) return Promise.resolve(existing);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<PuterApi>((resolve, reject) => {
    const script = document.createElement("script");
    let settled = false;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.remove();
      if (error) reject(error);
      else {
        const api = window.puter;
        if (api?.ai?.chat && api.auth) resolve(api);
        else reject(new Error("sdk_missing_global"));
      }
    };

    const timer = window.setTimeout(() => finish(new Error("sdk_timeout")), timeoutMs);
    script.src = PUTER_SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onload = () => finish();
    script.onerror = () => finish(new Error("sdk_blocked"));
    document.head.appendChild(script);
  }).catch((error: Error) => {
    sdkPromise = null;
    throw error;
  });

  return sdkPromise;
}

/**
 * Clears the cached SDK promise. Production loads Puter once per page; tests use this seam so a
 * stub installed in one case cannot leak into the next.
 */
export function resetPuterSdkCache() {
  sdkPromise = null;
}

export function isPuterSdkLoaded(): boolean {
  return typeof window !== "undefined" && Boolean(window.puter?.ai?.chat && window.puter.auth);
}

/** Puter opens a popup, so sign-in must come from a click rather than page load. */
export async function puterSignIn(): Promise<PuterAccount | null> {
  const api = await loadPuterSdk();
  await api.auth.signIn();
  return readPuterUser(api);
}

export async function puterSignOut(): Promise<void> {
  if (!isPuterSdkLoaded()) return;
  const api = window.puter;
  if (!api) return;
  await api.auth.signOut();
}

export async function readPuterUser(api = window.puter): Promise<PuterAccount | null> {
  if (!api?.auth) return null;
  try {
    if (!api.auth.isSignedIn()) return null;
    const user = await api.auth.getUser();
    const username = typeof user?.username === "string" ? user.username.slice(0, 48) : "";
    return username ? { username } : null;
  } catch {
    return null;
  }
}

export function isPuterSignedIn(): boolean {
  if (!isPuterSdkLoaded()) return false;
  try {
    return window.puter?.auth.isSignedIn() === true;
  } catch {
    return false;
  }
}

export function takePuterClientQuota(now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
  while (requestTimes.length > 0 && now - requestTimes[0] > CLIENT_REQUEST_WINDOW_MS) requestTimes.shift();
  if (requestTimes.length >= MAX_CLIENT_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((CLIENT_REQUEST_WINDOW_MS - (now - requestTimes[0])) / 1000) };
  }
  requestTimes.push(now);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetPuterClientQuota() {
  requestTimes.length = 0;
}

/** Models frequently wrap JSON in a fence or add a sentence; both are rejected rather than repaired. */
export function extractReplyText(value: unknown): string | null {
  if (typeof value === "string") return value.trim();
  if (!isRecord(value)) return null;

  const message = isRecord(value.message) ? value.message : null;
  const content = message?.content ?? value.content ?? value.text;

  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const block of content) {
      if (isRecord(block) && block.type === "text" && typeof block.text === "string") parts.push(block.text);
      else if (typeof block === "string") parts.push(block);
      else if (isRecord(block) && block.type === "refusal") return null;
    }
    return parts.length > 0 ? parts.join("").trim() : null;
  }
  return null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<{ status: "ok"; value: T } | { status: "timeout" }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve({ status: "timeout" }), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve({ status: "ok", value });
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function failureMessage(kind: PuterFailureKind): string {
  switch (kind) {
    case "disabled":
      return "The optional Puter guide is switched off for this deployment. The local workspace tools and every other part of the product still work.";
    case "sdk_blocked":
      return "The Puter.js script could not load, so no question was sent. A blocked connection, extension, or network policy is the usual reason. The local tools below still work.";
    case "sign_in_required":
      return "No question was sent. The Puter guide needs you to sign in with your own Puter account first, because usage is measured against your account rather than this site's.";
    case "sign_in_cancelled":
      return "Sign-in was cancelled, so nothing was sent. You can use the local workspace tools, or try again when you want an AI answer.";
    case "rate_limited":
      return "Your Puter allowance or the short in-page limit was reached, so this app did not retry. Use the local tools, or try again later.";
    case "timeout":
      return "Puter did not answer in time and no automatic retry was made, so a duplicate request is unlikely. The local tools remain available.";
    case "invalid_response":
      return "The reply could not be validated, so no workspace action was taken. The suggestion is discarded rather than partially applied.";
    case "unavailable":
      return "Puter could not complete this request. Nothing was stored by this app, and the local tools still work.";
  }
}

/**
 * One stateless, bounded turn. The question and at most one public item go out; the reply must
 * parse into the product's own tool contract before anything on screen changes.
 */
export async function requestPuterCoach(
  request: CoachRequest,
  options: { timeoutMs?: number; api?: PuterApi } = {},
): Promise<PuterResult> {
  const fail = (kind: PuterFailureKind): PuterResult => ({ ok: false, kind, message: failureMessage(kind) });

  if (options.api === undefined && isPuterEnabled() !== true) return fail("disabled");

  let api: PuterApi | undefined = options.api;
  if (!api) {
    try {
      api = await loadPuterSdk();
    } catch {
      return fail("sdk_blocked");
    }
  }

  try {
    if (!api.auth.isSignedIn()) return fail("sign_in_required");
  } catch {
    return fail("sign_in_required");
  }

  const quota = takePuterClientQuota();
  if (!quota.allowed) return fail("rate_limited");

  const messages: PuterChatMessage[] = [
    { role: "system", content: buildCoachInstructions({ outputContract: true }) },
    { role: "user", content: buildCoachUserPayload(request) },
  ];

  try {
    const outcome = await withTimeout(api.ai.chat(messages, false, { normalize: true, max_tokens: 420 }), options.timeoutMs ?? PROVIDER_TIMEOUT_MS);
    if (outcome.status === "timeout") return fail("timeout");

    const text = extractReplyText(outcome.value);
    if (!text || text.length > MAX_PROVIDER_RESPONSE_BYTES) return fail("invalid_response");

    const turn = parseModelTurn(text);
    return turn ? { ok: true, turn } : fail("invalid_response");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
    if (/429|limit|insufficient|quota/i.test(message)) return fail("rate_limited");
    return fail("unavailable");
  }
}

/**
 * The feature flag is read in the browser at build time so a deployment can disable the whole path.
 * Anything other than an explicit "false" leaves the optional mode selectable in the UI; the guide
 * still does nothing until an adult user chooses the mode, signs in, and consents per message.
 */
export function isPuterEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COACH_PUTER_ENABLED !== "false";
}
