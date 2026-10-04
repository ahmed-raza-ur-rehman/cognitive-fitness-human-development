# Optional user-pays AI guide (Puter.js) — implementation review

**Reviewed:** 2026-10-04 · **Scope:** the second, optional guide path added in S15. The operator-held OpenAI path and its gates are unchanged.

## Why a second path exists

The product must work with no AI at all, and the OpenAI path requires an operator key, spend controls, and abuse controls that do not exist yet. Puter.js documents a "user-pays" model: a signed-in user's own account covers AI usage, there is no API key for the developer, and no server component. That fits the current constraint set better than borrowing a user's consumer AI session, which is not something an app may assume.

**Verified from current Puter documentation (retrieved 2026-10-04):**

- [User-Pays model](https://docs.puter.com/user-pays-model/): "Each user pays for the resources they consume in your app through their own Puter account… Every user starts with a free monthly allowance… If a user runs out of their allowance, Puter prompts them to upgrade."
- [`puter.ai.chat()`](https://docs.puter.com/AI/chat/): accepts a messages array with `role`/`content`, an options object (`model`, `stream`, `max_tokens`, `normalize`, …), and a `testMode` argument; the default model is `gpt-5.4-nano` when none is specified; response shape varies by vendor unless `normalize: true` is requested.
- [`puter.auth.signIn()`](https://docs.puter.com/Auth/signIn/): opens a popup, must be triggered by a user action, and rejects with codes such as `popup_blocked`, `auth_window_closed`, and `unsupported_origin`; auth is otherwise handled automatically.

**Therefore the accurate description in the product is:** a free monthly allowance that a user's own account draws on, then paid usage. Not "unlimited free AI". The guide copy, the account block, and `docs/PRIVACY.md` say exactly that, and the app claims no ability to see or cap a user's bill.

## What the code actually does

`src/lib/ai/puter.ts` (browser-only):

1. Loads `https://js.puter.com/v2/` once per page, HTTPS, with a timeout and no retry stacking.
2. Requires `puter.auth.isSignedIn()` before anything is sent; otherwise it returns a `sign_in_required` message and performs no request.
3. Sends exactly one stateless turn: shared rules (`src/lib/ai/prompt.ts`) plus `{current_question, selected_public_workspace_context}` — no chat history, no local scores, goals, preferences, or reflection note.
4. Requests `normalize: true` with a bounded `max_tokens`, then reads the reply from any documented shape (string, `message.content` string, or content blocks), refuses a `refusal` block, and requires the text to parse into the same strict JSON contract the OpenAI path uses. Invalid or oversized output yields `invalid_response` and **no workspace action**.
5. Applies a per-page request cap (6 per five minutes), maps `429`/quota/insufficient errors to a retry-later message, maps a hung request to `timeout`, and never auto-retries.
6. `NEXT_PUBLIC_COACH_PUTER_ENABLED="false"` removes the mode entirely; the default build offers it but only after the user selects the mode, declares adulthood, and consents to that specific message.

`src/features/coach/coach-workspace.tsx` puts the mode choice first: **This device only (no AI)** is the default, and sending is disabled until a provider mode is chosen. Confirming the adults-only declaration clears a previously given consent, so consent must be fresh. A "preview exactly what would be sent" disclosure shows the payload shape on the page.

## Explicitly not done, and why

- **No Google Sign-In, and no "uses their Google AI".** Authentication and model authorization are different consents; a Google session does not grant an app the right to consume that person's Gemini/API quota, and there is no user database, session handling, token storage, or deletion process here to hold an account safely. The prior archived direction (`conv/res4.md`) reached the same conclusion, and `docs/PRIVACY.md` states this to users rather than burying it.
- No streaming, no tool-calling API, no arbitrary model ids, and no free-text model picker. The reply format is enforced by parsing, not by trusting the provider.
- No persistence of any AI exchange, in-page or otherwise.

## Release gates specific to this path

1. Adversarial testing of the browser path: prompt injection through the question, requests to infer ability from scores, crisis/medical content, oversized or malformed replies, repeated-click behaviour, and popup-blocked flows.
2. Confirm the live model Puter selects, its behaviour, and any account-level data/retention settings a user should be told about; the product text currently describes Puter's model, not a promise.
3. Independent security review of the third-party script decision (`docs/THREAT-MODEL.md` T-14), including subresource-integrity options and a Content-Security-Policy that would allow `js.puter.com` — noting that a CSP was previously withheld because the preview environment embeds the site.
4. Decide whether a user-pays AI mode is appropriate at all for the intended audience and age range before any public production release; the deployment-wide kill switch exists for the answer "not yet".

## Verification performed

`tests/coach/puter-adapter.test.ts` (8 tests) covers single script injection, HTTPS URL, no stacking after a failed load, reply extraction across shapes, refusal handling, sign-in refusal before any request, one bounded turn with the tool revalidated against the product allowlist, malformed-reply rejection, failure mapping, the request cap, the deployment flag, and defensive account reading. `tests/coach/coach-workspace.test.tsx` covers mode gating, consent freshness, payload exclusion of the private note, and that OpenAI is used only through the server route. Lint, typecheck, the full suite, content validation, and the production build pass; no live Puter request was made from this environment (no account), and no claim of factual or safety quality is made.
