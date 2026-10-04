# Initial threat model

**Scope:** static/prerendered, account-free prototype including S9 opt-in local goal/schedule/session summaries and S10 client-side CF3 weekly friend events/CR1 self-reported result codes, plus future trust boundaries for competitive services, accounts, and optional AI. CF3/CR1 are untrusted sharing formats, not authentication or score verification. This is a design baseline, not a penetration test or security certification.

## Assets and impact

- Integrity of scientific claims, evidence links, and safety language.
- Correctness of deterministic experiment tasks/results.
- Availability and accessibility of the learning experience.
- Opt-in local goal, schedule timestamps, and up to 200 task-result summaries; free-text reflections and raw answers are not collected.
- Future provider credentials, tool permissions, and user context, if AI is introduced.
- GitHub/Vercel project configuration and deployment supply chain.

## Current trust boundaries

```text
Visitor / browser
  ├─ reads public, build-reviewed Next.js content from Vercel/CDN
  ├─ runs learning and game activities locally
  ├─ keeps goal/session summaries in page memory unless local save is explicitly enabled
  ├─ when opted in, reads/writes versioned localStorage (untrusted input, capped/validated)
  ├─ locally reconstructs CF3 events and CR1 score reports from share codes
  ├─ accepts challenge/result values from URL query strings as untrusted input
  ├─ copies invite/result text only after the visitor chooses to share
  └─ no login, analytics, provider connection, challenge API, score service, or secret

Future boundaries (not implemented yet)
  ├─ browser → challenge/leaderboard service
  │    (authoritative event versions/scores, pseudonyms, abuse controls, privacy)
  └─ browser → narrowly scoped serverless AI route → chosen provider
       (explicit consent, minimal context, validated tools, rate/cost limits)
```

## Threats and required controls

| Threat | Initial/future mitigation | Gate |
|---|---|---|
| False or overstated science; fabricated citations; graph edge implies causality | Evidence ledger with exact claim-source fit, population/outcome/limits; reviewed copy; typed relation semantics; no model-generated citations treated as fact. | S1/S5/S11/S12 |
| Malformed or manipulated user input skews a score | Pure deterministic scoring functions; validate input shape/range; guard duplicate/rapid actions and state transitions; tests for boundaries. | S4/S6 |
| XSS from content, user reflections, markdown, or AI output | Render plain text/React-escaped content; avoid raw HTML; sanitize any future rich content with a reviewed library; never render model HTML as trusted markup. | S5/S8/S11/S12 |
| Local data tampering, stale schema, or browser storage failure | Treat browser storage as untrusted; version and validate; graceful reset/recovery; visible export/delete. Do not depend on persistence for the core. | S9 |
| Forged, replayed, automated, or collusive competitive scores; unfair event settings | CF3/CR1 are client-generated share formats, not proof: a visitor can edit a score, replay a set, change the device date, modify client code, or skip the intended event window. Parse challenge versions/game IDs and score shape; bind a displayed comparison to the exact imported event code and expected item count; always label it unverified and game-specific. Do not create a ranked table. Public ranks require authoritative server validation, immutable event/game versions, seed/settings binding, rate limits, replay/idempotency protection, anomaly review/appeals, and documented moderation. Never infer ability from a rank. | S10 |
| Data exposure to third-party AI or analytics | No such transmission in first slice; future user action and provider disclosure; minimal context; no hidden trackers; no full history by default. | S12/S13 |
| Leaked API key or model credentials | No key required in first slice; future server-only environment variables, never `NEXT_PUBLIC_*`; secret scanning and Vercel environment separation. | S12/S13 |
| Prompt injection causes unauthorized tools/actions | Tool schemas allow only named app actions; validate arguments and authorization; model cannot issue arbitrary HTTP, SQL, code, HTML, or application mutations. | S12 |
| Provider abuse, cost spike, timeout, or outage | AI optional; per-session/user request and output limits; timeouts, capped retries, model budgets and fallback; monitor Vercel/provider quotas; core continues without AI. | S12/S13 |
| Account confusion or excessive permissions | No accounts in the current prototype; if added, auth only for identity and explicit sync/competition benefits. Provider authorization is separate; request minimum scopes. | S10/S12 |
| Microphone/camera permission pressure or capture | No capture in first slice; any voice mode is opt-in, least-permission, clear active state, transcript/delete controls, and equivalent non-audio path. | S12+ |
| Dependency/build compromise or preview confusion | Commit lockfile, use `npm ci`, keep dependencies minimal, run lint/type/test/build in CI, review Vercel Root Directory and production branch. Treat previews as separate environments; never put production secrets in previews by default. | S4/S13 |
| Accessibility exclusion / motion or time pressure harms users | Keyboard/touch/screen-reader path, text alternatives, reduced motion, adjustable/optional timing, clear stop/exit; manually review high-risk interactions. | S3/S6/S8/S9/S10/S13 |
| Hobby plan quotas or policy mismatch | Keep first slice static/prerendered and no-function; monitor usage; confirm non-commercial eligibility and current terms before production. | S2/S13 |

## Current prototype security posture

- Public educational content; no authentication, analytics SDK, AI provider, database, API route, or challenge/result service. A result-bearing share URL includes the event code and claimed score in its query string, which the recipient and hosting/browser infrastructure may see when opened; no broader activity history or raw answers are sent.
- Game answers/results exist in page state. Goal, optional program dates, and task-result summaries are written to browser-local storage only after an explicit user action; no raw answers, identity, or free-text reflection are persisted.
- Treat localStorage as untrusted and fallible: validate game IDs, goal IDs, scores, timestamps, and program progress; cap history at 200; keep the no-storage path useful; make export/delete outcomes visible.
- Validate the entire result path and keep scoring in pure functions. CF3 binds the Monday UTC start, current game/version, deterministic seed and fixed five-item/untimed/correct-count rules; CR1 accepts bounded correct/total counts only for the exact event code and expected total. These checks protect parsing/comparison correctness, not truth: a submitted result remains self-reported, and the local UTC window can be bypassed by changing the clock or client.
- Share codes contain no identity. Treat query-string challenge/result values as untrusted; an imported result is displayed only for its exact event and is not used to create a rank or a stored peer profile.
- Use platform defaults and conservative browser permissions. If security headers are added, test them against Next.js scripts, fonts, and the Vercel deployment before enforcing a restrictive CSP.
- Provide a visible privacy statement that matches the actual data flow.

## Future AI route checklist

Before adding a provider route: document the data flow; decide whether direct user-authorized browser access is supported and appropriate or a server route is required; use server-only secrets; validate provider response/tool schema; authorize every action; limit request size, tokens, retries, duration, and rate; handle prompt injection and user-supplied content; avoid storing prompts; disclose provider sharing; test provider outage and invalid/malicious tool calls; verify Vercel Hobby resource and commercial constraints.

## Future competition service checklist

Before public rankings or real-time play: define what is public and opt-in; use a pseudonym rather than exposing account identity; validate scores on an authoritative server; bind each score to an immutable game/rules/seed version; prevent replay and unbounded submissions; account for automation/collusion/device/latency differences; define ties, retries, disconnects, reporting, moderation, appeals, age-safety, retention/deletion, and abuse response; test the noncompetitive fallback; model service costs and current Vercel limits. If those controls are not justified, keep competition local/self-reported and label it honestly.

## Review limits

This threat model is scoped to the planned architecture and has not been reviewed by a security professional. Reassess it when authentication, user persistence, competitive services, AI, voice, analytics, payments, or third-party content is introduced.

## T-14 — Third-party AI script loaded client-side (added S14/S15 review, 2026-10-04)

**Asset:** the page's origin, the visitor's Puter session/allowance, and whatever the visitor types into the optional guide box.

**Threats considered**

| Threat | Current control | Residual risk |
|---|---|---|
| Script is malicious or supply-chain compromised | Fixed HTTPS URL, `crossorigin="anonymous"`, single injection per page, no inline eval of returned content; every reply must parse into an allowlisted, validated tool contract before any UI effect | Unpinned third-party code still executes with page privileges; no Subresource Integrity value is committed and no Content-Security-Policy is deployed (the live preview requires frame embedding). **Open gate.** |
| Developer bill abuse / runaway spend | User-pays model: usage meters to the signed-in user; app holds no key, no server route, and no quota to drain | A user can overrun their own allowance; the product states this rather than promising a cap. In-page cap is per tab, not global |
| Prompt injection via the question box | Standing rules mark the question as untrusted data; reply text is rendered as text only; suggested actions must resolve against the product's own registry; no navigation, storage, or code execution is granted to the model | Model may still produce wrong or unsafe *words*. Adversarial testing not performed. **Open gate** |
| Local data exfiltration through AI context | The payload builder takes only the current question and at most one public item; tests assert goals, scores, saved sessions, preferences, private notes, and history are absent | The visitor can paste anything they like; the UI warns against it and cannot enforce it |
| Silent provider failure or double spend | One attempt per click, no automatic retry, explicit timeout, `pending` lock, quota cap before sign-in checks, and a visible status for each failure kind | Users on flaky networks may need to retry manually by design |

**Decision.** Acceptable for a private prototype with the mode opt-in and the deployment kill switch; not acceptable for public production until the CSP/SRI decision, adversarial testing, and audience review in `docs/AI-PUTER-REVIEW.md` are closed.
