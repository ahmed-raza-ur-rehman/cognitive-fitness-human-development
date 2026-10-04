# Privacy and data principles

This is the initial product privacy model. It is intentionally conservative; retention, consent screens, and legal requirements must be reviewed before real user data or third-party AI integrations ship.

## Default posture

- Make exploration, learning, and core activities available without an account.
- Collect only data needed for a specific user-visible feature.
- Prefer local-first storage for preferences and activity history where practical; explain what is stored and provide clear reset/export controls.
- Do not collect sensitive mental-health, diagnostic, biometric, or free-text reflection data by default.
- Do not send personal activity history, answers, reflections, or profile data to an AI provider without an explicit, understandable user action and disclosure.
- Do not use user activity for advertising or hidden profiling.

## Keep data classes separate

1. **Identity/authentication:** account identifiers and sign-in state.
2. **Preferences:** theme, accessibility choices, learning depth, and selected goals.
3. **Activity data:** task, timestamp, difficulty, accuracy/response time, and completion.
4. **Knowledge state:** concepts viewed, learned, or bookmarked.
5. **Reflection/free text:** potentially sensitive; avoid collecting unless there is a defined benefit, explicit consent, and suitable retention/deletion controls.
6. **AI context:** a minimal, purpose-specific summary; never send the full history by default.

Each future data field must have a purpose, storage location, retention rule, user control, and disclosure before implementation.

## AI and identity

Authentication and AI-provider authorization are separate. A Google sign-in does **not** grant access to Gemini, a Gemini API key, or the user's AI quota. Any connected-provider flow must be explicit and use the provider's current supported authorization model.

- Identify the provider and explain what data it receives before sending data.
- Keep private provider credentials on a trusted server; never embed secrets in client bundles or commits.
- Use short, bounded prompts and only the context needed for the current task.
- Do not send identifying details unless essential.
- Provider failure or opt-out must not disable the non-AI product.

## Current optional Coach integration (S12)

The `/coach` page is an optional layer, not a dependency. Its reviewed local workspace works without a provider. Server calls are disabled by default and are available only when both `COACH_AI_ENABLED=true` and a server-side `OPENAI_API_KEY` are configured. The key must never use a `NEXT_PUBLIC_` prefix. Login, if added in the future, would not grant provider authorization.

- **Provider and data sent:** The configured provider is the OpenAI API using `gpt-5.4-mini`. Before each call, the user sees the provider/data-sharing notice, must self-declare age eligibility for this adult-only feature, and must separately consent for that one reply. Changing the question or selected context resets data-sharing consent. The request includes only the current question, the selected reviewed public workspace item (none by default), and the fixed tool catalog/instructions. The app does not automatically attach prior chat turns, saved goals, scores, activity history, account identity, or the local reflection note. However, free text typed into the current question is sent as written; users must not include scores, identifying details, health information, or other sensitive content.
- **Adult-only eligibility:** The UI requires an ephemeral self-declaration of age 18 or older and the API rejects requests without `adultConfirmed: true`. There is no parent/guardian-consent flow, no birth date collection, and no age/identity verification. A direct API caller can forge this boolean, so it is a lightweight adult-only product gate—not a verified age control. Do not enable the provider for minors or a mixed-age audience on this basis. A stronger eligibility/consent design and legal review are required if that audience is intended.
- **Local reflection and chat:** The visible conversation and optional reflection note live only in page memory and disappear on refresh/navigation. They are not added to later requests or saved by this feature. A private note should not be entered on a shared device if another person may see the current screen.
- **Provider retention:** Requests use `store: false` and no conversation/response ID, which disables Responses API application-state storage for this request. This is **not** Zero Data Retention: OpenAI states that abuse-monitoring logs may include prompts and responses and are retained for up to 30 days by default, subject to exceptions. OpenAI states API data is not used to train models by default. Re-check current terms, data controls, project settings, and any applicable regional/legal requirements before enabling. The app does not control provider retention.
- **Tools and scientific scope:** The model returns a strict JSON action and exact ID; the server resolves it against the reviewed local catalog. No model-provided URL, arbitrary code, write operation, or provider-hosted tool is executed. The model does not calculate scores or receive saved results. It can still produce inaccurate prose: the local evidence library, not generated text, is the source of reviewed claims. Activity outcomes must stay task-specific, not diagnostic or evidence of broad transfer.
- **Request and abuse limits:** Request bodies are capped at 4,096 bytes; questions at 800 characters; selected context at 3,500 serialized characters; provider output at 420 tokens and 32 KiB; calls time out after 10 seconds and are not automatically retried. The server applies a 5-per-minute per-client in-memory limiter (at most 2,048 keys) and a 60-call-per-hour per-warm-process budget. The limiter reads hosting-supplied IP headers, which must be normalized by the deployment proxy. The origin check accepts the request URL origin or a matching `X-Forwarded-Host`/`X-Forwarded-Proto` pair for TLS-terminating previews; only use this behind a proxy that overwrites forwarded headers. These are process-local safeguards, not a deployment-wide spend cap: restarts and multiple instances multiply/reset them. Configure hosting/WAF-level global limits and an OpenAI project spend alert/limit before production enablement. Do not interpret this local budget as a billing guarantee.

See [`AI-VERIFICATION.md`](AI-VERIFICATION.md) for implemented checks, known gaps, release gates, and the current test record. Provider documentation used for this implementation (reviewed 2026-10-04): [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [OpenAI Services Agreement](https://openai.com/policies/services-agreement/), and [GPT-5.4 Mini model details and pricing](https://developers.openai.com/api/docs/models/gpt-5.4-mini). Provider terms and prices can change.

## Goals and competition

Goals and local activity history should default to private, on-device data with inspect/reset/export controls. Joining a challenge or leaderboard must be a separate, explicit choice; do not publish a user's display name, score, goal, or activity history by default. Friend/challenge codes should disclose what their recipient can see and must not embed sensitive free text or identity data.

In the `/train` prototype, goal/session persistence is off until the user chooses **Save this goal on this device**. The stored state is limited to a goal ID, optional program start/pause timestamps and paused duration, and the latest 200 activity/mode/correct-count/timestamp/challenge-code records; raw answers, reflection text, and identity are not saved. The page exposes recent sessions, an expandable history grouped by activity, JSON export of the current schedule/history, and a clear action. If the browser refuses deletion, page-visible history is cleared and the UI warns that browser site-data settings may be needed to remove a persisted copy. Friend invites include a game/date code, not a player identity. Schedule pause/resume dates are stored only after the same explicit local-save action; no reflection response is collected. These controls are a prototype; manual browser-storage denial/quota and export/delete checks remain required.

The `/train` competition pilot is client-side and account-free. CF3 weekly challenge codes expose the UTC week start, game ID, and game version; the code is also the reproducible seed, while fixed event settings are defined by the CF3 version. Codes include no participant identity. CR1 result codes contain the exact event code plus a self-reported correct/total count; they contain no name, contact detail, answer selections, or completion time. The page compares only reports bound to the same event code and expected item count. No challenge/result endpoint, participant registry, or remote leaderboard is implemented. Copying is an explicit user action; when a result is shared, its code is included in the copied text and link query so the recipient can inspect it. A recipient and the hosting/browser infrastructure handling that URL may see the event and score code; do not include anything private in it. If the user separately opts into local goal/history saving, the user's own completed session summary includes the challenge code under the existing local-storage policy; peer scores are not saved as a new history record. The event window and repeat-play rules are client-side disclosures, not enforceable access controls.

Before any public leaderboard, league, or real-time game, define pseudonyms, opt-in visibility, profile/contact exposure, score retention, deletion and withdrawal, reporting/moderation, appeal, child-safety, anti-cheat telemetry, and abuse-response ownership. Collect only fields needed to verify that event's score, separate them from private goals/history, and tell users what is retained and for how long. If trustworthy score verification is not possible, label results as self-reported and do not call them ranked.

## User control and security

Design for inspect, export, clear/delete, and consent withdrawal from the outset. Use secure transport, input validation, least privilege, safe error handling, and documented retention. Avoid logging sensitive content. Review third-party analytics and SDKs before adoption; do not add trackers by default.

## S13 public data-practices summary

The prototype now exposes `/privacy` from the global footer. It describes the current local-first and Coach data flows, challenge URL visibility, provider disclosure, and the fact that a formal privacy contact/request process has not been designated. This is a plain-language implementation summary, **not** a complete legal privacy policy or compliance claim.

When hosted on Vercel, the platform may process network and operational metadata (for example, IP address, requested paths, diagnostics, and security logs) under its own current terms and privacy notice. The app has no application-level prompt or answer logging, but the project owner must verify the actual deployment, log settings/retention, audience, legal disclosures, and request-handling process before public launch. Vercel hosting has not been provisioned from this checkout. See [Vercel's current Privacy Notice](https://vercel.com/legal/privacy-notice) and re-check it with the deployment owner.

Before remote accounts, synchronization, competitive services, or AI are implemented, create a data-flow/threat review and verify applicable platform/provider requirements. Do not promise legal compliance based on this document alone.

## S15 additions (2026-10-04, self-reviewed; no external privacy review)

- **Guided paths** (`/journeys`) are static links between existing reviewed pages. They record nothing: no completion state, step order, dwell time, or telemetry. No new personal data category is introduced.
- **Search** (`/search`) builds its ranking in the browser over the site's own reviewed content. Nothing typed is sent, logged, or stored; the page is `noindex`. The query is reflected in the URL (`?q=`), so a bookmarked or shared search result exposes the words typed there to anyone with the link and to browser history — deliberately, because it is also what makes a search shareable. Users are told not to type personal information anywhere in this prototype.
- **My practice** (`/progress`) reads the same opt-in local training records the Train page writes and adds no new storage. Clearing or exporting in Train changes what it can show; it never uploads or aggregates across devices.
- **Reading preferences** expanded (extra line spacing, serif face, underline-every-link) under the same single `localStorage` key, presentation-only, and are applied before first paint by an inline script that reads that key and nothing else.
- **Optional user-pays AI (Puter.js).** A second guide mode may load `https://js.puter.com/v2/` in the visitor's browser. Consequences stated in-app: a third-party script executes on the page; the visitor signs in to Puter in a popup; the current question plus at most one reviewed public item and the fixed tool list travel from the visitor's browser to Puter and whichever model it selects; usage is metered to the visitor's own Puter account (free monthly allowance, then paid); and this app cannot see, cap, or reverse any of it. No app server is involved, no app-held key exists, and no local progress, goals, preferences, or prior messages are attached. The mode is opt-in per message with adult self-declaration and can be removed from the build with `NEXT_PUBLIC_COACH_PUTER_ENABLED="false"`.
- **No Google Sign-In.** Deliberate: an authentication consent is not authorization to consume that person's Gemini/API quota, and this prototype has no account store, session handling, or deletion process. Should accounts ever be needed (for example cross-device sync), they require a documented need, a real privacy policy with a named contact, and separate explicit AI authorization.
