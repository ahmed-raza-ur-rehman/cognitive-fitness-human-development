# Architecture and Vercel deployment baseline

## Repository audit (2026-10-04)

The tracked product project initially contained the discovery archive and planning/orchestration material only; S4–S6 have since added the Next.js app and first memory-learning slice. Ahmed's existing games live on a separate public site/repository and are not checked out here. The public pages were inventoried in `docs/GAME-PORTFOLIO-AUDIT.md`, but the source API returned 403 (“Resource not accessible by integration”): no source-code audit, hands-on game test, or migration is claimed. The legacy portfolio must be inspected and preserved before any repair/rebuild decision.

## Accepted Stage S2 decisions

### Application stack and project root

- **Framework:** Next.js App Router, TypeScript, strict type-checking, ESLint, and Tailwind CSS for the Vercel-friendly web app.
- **Node runtime:** Node.js **22.x**, matched to the available local Node 22 environment and supported by Vercel. Keep it pinned in `.nvmrc` and `package.json` `engines.node`; use the npm lockfile for repeatable installs. Next.js' current installation guide lists Node.js 20.9 as its minimum, while Vercel currently supports 22.x and defaults new projects to 24.x. Pinning 22 avoids a local/remote major-version mismatch.
- **Project root:** `cognitive-fitness/`. In Vercel project settings, choose this as **Root Directory**, with Next.js as the framework preset. The app's source and package files will live here; repository-level agent instructions remain one level above.
- **Build model:** regular Next.js/Vercel build (`next build`) with content pages statically rendered/prerendered wherever possible. Do **not** set `output: "export"` initially: the core slice should not need server code, but a later, reviewed AI feature may require a narrow secure server function. Add dynamic routes/functions only when a real feature requires them; don't turn static product content into per-request work.
- **Routing and components:** server-render explanatory/static content by default; use client components only for interactive tasks and small workspace state. Keep browser APIs (storage, microphone) behind user action and browser-only boundaries.
- **Styling/visualization:** Tailwind plus semantic HTML/CSS tokens; no graph/chart framework for the small first graph. Start with an accessible concept list/relationship view and simple SVG/CSS only if it improves clarity.
- **Tests:** ESLint/type-check/build plus focused unit/component tests for deterministic scoring, state transitions, and accessible interactions. Add an end-to-end browser test for the full vertical slice before S6 is complete. Next.js 16 no longer runs lint as part of `next build`, so lint must be a separate explicit script.
- **Package manager:** npm with a committed `package-lock.json`; deployment uses `npm ci` and the package's documented scripts.

These choices are based on the accepted account-free, static-content first slice and Vercel target. Revisit only through a decision record if a verified need appears.

## Vercel deployment plan

Official Vercel documentation describes Next.js as a zero-configuration framework deployment and supports Git-based preview deployments. For a first deployment:

1. Import this GitHub repository into Vercel.
2. Set **Root Directory** to `cognitive-fitness/`.
3. Use the detected **Next.js** preset. Keep the default install/build/output settings unless an observed build requires a documented override.
4. Use the committed lockfile (`npm ci`) and `npm run build`. No environment variables or provider keys are required for the initial slice.
5. Connect the repository's Git integration so branch/PR changes create preview deployments; set the actual production branch only after the user confirms it.
6. Review the preview on phone and desktop, keyboard, and screen reader before production.

Do not add a custom `vercel.json` until a concrete routing/header/build need warrants it. Do not use browser-facing `localhost` URLs; use same-origin relative paths for any future app endpoint.

### Hobby plan constraint

The target is a low-cost Vercel deployment, but **Vercel's current Hobby documentation restricts the plan to personal, non-commercial use** and lists usage quotas that can pause a feature when exceeded. The initial static/prerendered, no-account, no-AI slice minimizes build/runtime needs but does not change the plan's use restrictions. Confirm that the intended deployment is personal/non-commercial before production; if the project becomes commercial, verify the appropriate Vercel plan/terms and budget instead of assuming Hobby is suitable. Usage numbers and terms can change, so consult the official plan page at deployment time.

### Verified platform references (checked 2026-10-04)

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) — framework deployment and Git previews.
- [Deploying Git repositories with Vercel](https://vercel.com/docs/deployments/git) — branch deployments, preview URLs, and project root-directory selection.
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) — current eligibility, usage, and fair-use restrictions.
- [Vercel supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) — current 24.x default and supported 22.x.
- [Next.js installation requirements](https://nextjs.org/docs/app/getting-started/installation) — current Node minimum and setup.
- [Next.js single-page applications and static sites](https://nextjs.org/docs/app/guides/single-page-applications) — progressive path from static site to server features, and static-export limitations.

## Logical architecture

```text
Next.js App Router (Vercel project root: cognitive-fitness/)
  ├─ Server-rendered/static knowledge and evidence pages
  ├─ Responsive Explore / Learn / Lab navigation
  ├─ Client-only, deterministic experiment interaction
  └─ Optional future Coach workspace behind an explicit AI boundary

Domain/content layer
  ├─ Typed concept nodes and relationship edges
  ├─ Claims and evidence sources stored separately
  ├─ Experiment/game definitions and deterministic scoring functions
  ├─ Versioned challenge/event rules and seedable generation
  ├─ User goals/programs distinct from task-result records
  └─ Explainable next-activity suggestions follow the selected schedule week

Persistence / external services
  ├─ First slice: no account, no remote database, no personal data transmission
  ├─ Current opt-in goals/progress: local-first, versioned summaries, exportable and clearable storage
  ├─ Future competition: local challenges first; server-verified leaderboards only after an approved design
  └─ Future AI: user-selected mode, validated tools, minimum context, cost/rate limits

Vercel
  ├─ CDN/static prerendering for public content
  ├─ No Functions required for the first slice
  └─ Narrow serverless routes only if a justified future feature requires trusted secrets
```

## Game, goal, and competition architecture

- Treat games as **versioned task modules** over a shared lifecycle contract: instructions → ready → play → score → result → retry/exit. Keep deterministic mechanics/scoring in pure, tested functions where possible. Random challenges use a versioned seed and settings so replay/fairness can be checked.
- A game record should state domain/category, purpose, rules, difficulty/settings, supported inputs, accessibility alternatives, metric, interpretation boundary, evidence/context IDs, and explicit non-measures. A recreational puzzle solver is not automatically a cognitive intervention.
- Model user goals/programs separately from game results. Goals capture chosen behavior/learning intentions and schedule; session observations remain task-specific. Recommendations should be rules-based and explainable before any model is considered.
- Competition layers should be independent of solo practice: private personal best → fixed-seed challenge → shareable friend challenge → optional verified league/tournament → real-time multiplayer only with owner approval. Challenge records bind game version, seed, settings, scoring rules, event window, and verification state.
- A client-only share code can support friendly play but is self-reported and must not appear as verified/ranked. Public rankings require an authoritative service, server-side score validation, anti-replay/automation safeguards, pseudonyms, opt-in visibility, report/moderation/appeal path, rate limits, age-safety review, retention/deletion controls, and operating-cost limits.
- Never rank users by a composite “brain” score or claim a game leaderboard measures intelligence, health, or generalized ability. Preserve a noncompetitive, no-account path; do not use FOMO, forced streaks, loot boxes, or punitive loss loops.

Goal schedules, the local game engine, and self-reported share codes are implemented in `/train`; the online competition elements below remain an architecture target, not an implemented leaderboard. The competition tier (local, async friends, public league, real-time) remains a product-owner decision in `docs/OPEN-QUESTIONS.md`.

## Data and trust boundaries

- Public research content is reviewed and bundled at build time; user input is not merged into trusted content.
- Experiment scoring is deterministic application code, not an LLM decision.
- Browser storage is untrusted and may be unavailable, cleared, or modified; validate data and make loss recoverable.
- No personal activity, reflection, or identity information is sent to a remote service by the current local-first prototype; schedule/session summaries are stored only after explicit browser-local save opt-in.
- Any future AI request must be initiated by the user, identify the provider, disclose the context being sent, enforce a strict typed tool allowlist, and degrade gracefully.
- Authentication and model-provider authorization are separate. Google sign-in never implicitly provides Gemini/API access.
- Never expose server-side API secrets in `NEXT_PUBLIC_*`, client bundles, source maps, logs, or commits.

## Decisions still open

The product's intended commercial status must be confirmed before a production Hobby deployment. AI provider/authorization, minimum supported ages, durable remote persistence, and analytics remain deferred. The product owner must choose the desired competitive tier before accounts/public rankings/real-time play; access to the legacy games source repository must be granted before code-level audit/migration. Localization/Urdu RTL also needs user research. These are not blockers for the account-free local prototype or the next engine design.
