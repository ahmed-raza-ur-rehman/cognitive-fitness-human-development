# Technical decision log

Accepted decisions are based on the initial memory-learning vertical slice and checked against current official documentation on 2026-10-04. Reopen through a dated decision record if requirements or platform constraints change.

| ID | Decision | Status | Choice / rationale | Reopen when |
|---|---|---|---|---|
| TD-001 | Keep the research/product experience useful without AI | **Accepted** | The no-AI path is a product requirement; AI is an enhancement. | Only if the product thesis changes explicitly. |
| TD-002 | Avoid diagnosis and unsupported cognitive-improvement claims | **Accepted** | Treat activities as practice/education; distinguish task performance from broader outcomes. | Not a technical decision; copy/evidence can be reviewed and updated. |
| TD-003 | Web framework | **Accepted** | Next.js App Router with TypeScript, strict checking, ESLint, Tailwind, npm, and a committed lockfile. Next.js is Vercel-native and supports statically rendered content with a later progressive path to server features. | If product needs favor simpler hosting/runtime or a different framework. |
| TD-004 | Runtime compatibility | **Accepted** | Pin Node 22.x in `.nvmrc` and `package.json` `engines.node`. It matches local Node 22.22.3; Vercel supports 22.x. Use npm's lockfile for repeatability. | Node 22 support/security lifecycle changes or Next.js requires a newer major. |
| TD-005 | App root and Vercel build | **Accepted** | Keep the actual app/package root at `cognitive-fitness/`; select it as Vercel Root Directory. Use the default Next.js/Vercel build integration, statically/prerender content, and no `vercel.json` unless a verified need appears. | A monorepo/build constraint or custom routing/header requirement appears. |
| TD-006 | Static vs dynamic behavior | **Accepted** | Use a normal Next.js build without `output: "export"`; keep current routes static/prerendered and add server functions only for a justified future feature. This preserves the option for a secure narrow AI route without requiring functions for the first slice. | An enforced static-only host or server dependency changes. |
| TD-007 | Knowledge/content format | **Accepted direction** | Small, typed, versioned concept/edge/claim/source data; exact schema is Stage S5. Keep content separate from React views. | Content volume/editing workflow warrants a CMS or other source of truth. |
| TD-008 | Graph and chart rendering | **Accepted** | No graph/chart dependency for the first graph; use semantic navigation and progressively revealed relationships. Evaluate a library only if user-tested complexity requires it. | The graph becomes too complex for an accessible bespoke view. |
| TD-009 | Persistence and accounts | **Accepted** | No account or remote database initially; no persistent personal profile in the first slice. Revisit local-first persistence only after the user benefit is demonstrated. | Cross-device sync or durable history becomes an accepted need. |
| TD-010 | AI provider and tools | **Deferred** | No runtime provider selected now. Stage S7 compares current terms, user authorization, browser/server support, cost, data handling, and Vercel requirements. Use typed allowlisted tools and keep no-AI fallback. | Stage S7 evidence supports a specific provider and consent model. |
| TD-011 | Vercel Hobby plan | **Conditional target** | Development/preview should be Vercel-compatible and low-usage. Official docs currently restrict Hobby to personal, non-commercial use; production eligibility is not assumed. Verify current limits and use classification before launch. | User confirms commercial status, plan, or hosting target. |
| TD-012 | Voice, accounts, analytics | **Deferred** | Voice stays optional; no analytics SDK, auth, or remote account in the first slice. | User research shows value and privacy/safety review passes. |

## Verified platform references

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Hobby plan and fair-use notes](https://vercel.com/docs/plans/hobby)
- [Vercel supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Next.js installation requirements and current setup](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js SPA/static-to-server evolution](https://nextjs.org/docs/app/guides/single-page-applications)
- [Vercel Git-based deployments and project root selection](https://vercel.com/docs/deployments/git)

## Decision record template

For future decisions, record: `ID`, status, date, owner, context/problem, requirements, options, decision, rationale, verified sources, tradeoffs, security/privacy/accessibility/science implications, migration/reversal plan, and review trigger.
