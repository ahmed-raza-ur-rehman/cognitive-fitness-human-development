# Optional AI guide: implementation verification

**Status:** Implemented as an opt-in scaffold; **not approved for a general-audience or production launch.** The server feature flag is off by default. No live OpenAI request has been made from this checkout, and no provider credential is included. Reviewed on 2026-10-04.

## What is implemented

- `/coach` is exposed in the primary site navigation. The page combines a usable, local shared workspace with an optional model-backed guide; the workspace does not depend on the provider.
- The only provider adapter is a server-side OpenAI Responses API call using `gpt-5.4-mini`, `store: false`, strict JSON Schema output, and `reasoning.effort: none`. The API key is read only on the server from `OPENAI_API_KEY`. Availability requires **both** `COACH_AI_ENABLED=true` and a non-empty key; otherwise the API reports unavailable and local tools continue to work.
- S13 release hardening embeds only the provider-availability **boolean** in the server-rendered `/coach` shell. Normal page views no longer call the dynamic API just to check configuration; the server API rechecks the flag and key before every provider POST. Changing deployment configuration requires a new deployment, and no credential is passed to the client.
- The user must self-declare that they are 18+ and separately consent for each message. Consent resets when the question or selected context changes and after a send. The API rejects requests without `adultConfirmed: true` and `consent: true`.
- A request contains only the current question and, optionally, one allowlisted, reviewed public workspace item. The model receives a fixed catalog of exact tool names/IDs. Previous page messages, saved goals, scores, activity history, and the local reflection scratchpad are not automatically attached. Free text in the current question is transmitted as typed, so the UI warns users not to include scores, identifying details, or sensitive information.
- The model returns a short answer and one strict tool intent. Server code resolves the intent to a real local item. The model cannot provide a URL, execute arbitrary code, change product data, or decide deterministic scoring. The user reviews a suggested item and chooses whether to open its local link.
- Reflections are fixed prompts; the optional note is ephemeral React state. No conversation or note is written to browser storage by this feature.

## Bounded request and failure behavior

| Boundary | Implemented control |
| --- | --- |
| Provider enablement | Off unless both `COACH_AI_ENABLED=true` and `OPENAI_API_KEY` are set server-side |
| Origin / request type | Same-origin `Origin` required; `application/json` only |
| Client request | 4,096-byte body limit; strict field allowlist; question 1–800 characters; exactly one context selection or `null` |
| Selected context | Reviewed local catalog only; serialized context at most 3,500 characters |
| Model output | Strict schema; answer at most 1,200 characters; at most 420 output tokens; provider body read capped at 32 KiB |
| Provider execution | Fixed HTTPS Responses API URL with redirects blocked; 10-second timeout; no automatic retries; no prior response ID or conversation |
| Per-client requests | 5 per 60 seconds in process memory; up to 2,048 limiter buckets |
| Warm-process request budget | 60 provider attempts per 60 minutes per Node process |
| Failure behavior | Generic safe errors for provider limits, timeouts, unavailable service, and invalid model output; local workspace remains available |

The hourly budget is **per warm Node process**, not deployment-wide. Serverless restarts and multiple instances can reset or multiply it; IP headers can also be spoofed if the hosting proxy does not normalize them. The origin check also compares a matching forwarded host/protocol for TLS-terminating previews, so forwarded headers must be overwritten by the trusted proxy. These controls reduce accidental/unbounded work in one worker but are not a billing guarantee. Before enabling a public endpoint, configure host/WAF-level global throttling and an OpenAI project spend limit/alert. Reassess the cap against expected use and current pricing.

The model page checked on 2026-10-04 lists GPT-5.4 Mini at $0.75 per million input tokens and $4.50 per million output tokens, with Responses API and Structured Outputs support. Those prices can change, and the app does not use a provider-enforced spend cap. The fixed instructions/catalog, bounded question/context, and output token cap bound each request's payload, but exact token usage and cost should be verified against live provider usage before launch. See [GPT-5.4 Mini model details](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [Responses API reference](https://developers.openai.com/api/reference/resources/responses/methods/create), and [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Age, consent, and data-retention decision

This implementation takes the **adult-only** route rather than collecting parental consent. It asks for an 18+ self-declaration without a birth date, stores no age information, and has no guardian-consent workflow. The server only checks a client-provided boolean; a direct caller can forge it. It is not verified age or identity. **Do not enable the provider for minors or a mixed-age audience based on this control.** If a general or under-18 audience is intended, keep the feature flag off until an appropriate age/guardian-consent design and legal review are complete.

`store: false` and stateless requests avoid Responses API application-state storage; they do not mean Zero Data Retention. OpenAI states that API data is not used to train models by default and that abuse-monitoring logs may retain prompts/responses for up to 30 days, subject to exceptions. The page and [`PRIVACY.md`](PRIVACY.md) disclose this distinction. The provider's current terms, data controls, account/project settings, and retention must be rechecked before enabling. Sources reviewed 2026-10-04: [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data) and [OpenAI Services Agreement](https://openai.com/policies/services-agreement/). This document is not legal advice or a compliance claim.

## Automated verification record

The focused suite currently covers 30 tests across seven files:

- `tests/coach/http.test.ts`: same-origin and forwarded HTTPS origin checks, malformed/cross-site origin rejection, bounded body and UTF-8 parsing, JSON-object parsing, and rate-limit IP-header selection.
- `tests/coach/api-route.test.ts`: no secret in availability/responses, disabled-by-default feature flag, same-origin/content-type/body-size checks, strict consent and adult attestation, rejected history/personal-state/context injection, configured success path, safe provider errors, per-client throttle, and warm-process budget.
- `tests/coach/provider.test.ts`: fixed endpoint/auth header, model/body/token settings, stateless request shape, local tool resolution, invalid actions, provider error mapping, oversized output, timeout, and no retry.
- `tests/coach/tools.test.ts`: complete tool catalog resolution, context-only provider payload bounds, exact input/output validation, arbitrary URL rejection, and challenge/reflection boundaries.
- `tests/coach/rate-limit.test.ts`: fixed-window request limits and bounded bucket/pruning behavior.
- `tests/coach/coach-workspace.test.tsx`: local-only use while provider is unavailable, adult gate, fresh per-turn consent, selected public context, exclusion of the local reflection note, and in-memory conversation clearing.
- `tests/coach/privacy-boundaries.test.ts`: no client key/environment access, browser persistence, or client console logging.

Run the focused suite with:

```bash
npm test -- tests/coach
npm run typecheck
```

Local verification recorded on 2026-10-04:

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test -- tests/coach` | Pass: 30 tests / 7 files |
| `npm test` | Pass: 113 tests / 26 files |
| `npm run build` | Pass; `/coach` is statically rendered and `/coach/api` is dynamic |
| Local preview smoke | `/coach` 200; `/coach/api` reports unavailable; valid POST returns safe 503 while the feature flag is off |
| Live OpenAI request | Not run; no provider credential is configured and the feature flag remains off |

The tests use a stubbed provider. They do **not** prove factual accuracy, prompt-injection resistance, provider availability, account-specific retention, actual token/cost usage, age, or legal compliance. Adversarial/model behavior, live staging, and deployment-wide controls still need independent review.

## Release gates still open

1. Obtain privacy/legal review of the adult-only self-attestation, intended audience, OpenAI terms, privacy notice, and abuse-monitoring retention. A self-declaration is not verified age; keep the feature flag off if stronger controls are required.
2. Confirm current model availability, API schema, output behavior, pricing, and project data controls with a non-production key in a protected staging deployment. Verify no secrets or prompt text enter application logs.
3. Configure deployment-wide rate/spend limits in addition to the in-process cap; set alerts and document the operator responsible for disabling the feature if usage or safety thresholds are exceeded.
4. Conduct adversarial tests for prompt injection, medical/diagnostic requests, self-harm/crisis language, requests to infer general ability from game scores, unsupported factual questions, malformed/oversized provider output, and unsafe link/tool suggestions. Review whether a moderation or escalation design is required.
5. Perform hands-on keyboard, screen-reader, zoom, contrast, and small-screen checks for the new age/data-sharing controls and workspace. Automated tests are not a WCAG conformance claim.
6. Recheck this report and provider terms/model/pricing before setting `COACH_AI_ENABLED=true` in any deployed environment.

## S15 — optional user-pays guide (Puter.js)

A second, browser-side guide mode was added so the product need not depend on an operator-held key. It reuses the existing safety contract unchanged: the shared rules and tool catalog now live in `src/lib/ai/prompt.ts` for both providers; the reply must parse into `{answer, action:{tool,targetId}}` and the target must resolve through the product's allowlist, or no action is applied. Local progress, goals, preferences, saved scores, prior turns, and the private reflection note are not attached. Requests are one-per-click, capped per page, timeout-bounded, and never auto-retried.

The guide mode is chosen explicitly, defaults to **This device only (no AI)**, requires an adult self-declaration and fresh per-message consent, and shows a request preview. Usage is metered to the visitor's own Puter account, whose documentation describes a free monthly allowance then paid usage — stated in the product rather than promised as free. Google sign-in was intentionally not implemented as an AI switch (authentication ≠ model authorization, and no account store exists). Full review, verified documentation links, and open gates: `docs/AI-PUTER-REVIEW.md`. Threat analysis: `docs/THREAT-MODEL.md` T-14.

Automated coverage added (19 tests across `tests/coach/puter-adapter.test.ts` and `tests/coach/coach-workspace.test.tsx`). Not performed here: any live provider call (no account/key), adversarial prompting, model-quality or safety evaluation, accessibility testing of the new controls, and cost review — all remain release gates.
