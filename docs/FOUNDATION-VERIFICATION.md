# S4 — Application foundation verification

**Date:** 2026-10-04  
**Stage status:** implementation and local checks complete; coordinator self-review recorded, with independent review and real assistive-technology review still outstanding.

## Scope delivered

- Next.js App Router shell in the accepted `cognitive-fitness/` project root, with strict TypeScript, Tailwind CSS 4, ESLint, Vitest, Testing Library, npm lockfile, and Node 22 pin.
- Responsive landing page, skip link, labeled navigation, conceptual SVG with an accessible title/description/caption, visible focus styling, and reduced-motion overrides.
- A simple, accessible loading state, route error state with retry and a safe route home, root-level global error fallback, and not-found route.
- No authentication, analytics, database, provider SDK, API key, or user-data storage was added. The recall-result card is explicitly an example; there is no interactive activity or score yet.

## Reproducible checks

Environment used: Node.js `v22.22.3`, npm `10.9.8`.

| Check | Command | Result |
|---|---|---|
| Clean dependency install | `npm ci` | **Pass** — completed from the committed lockfile. npm reports 5 high-severity *development-tree* audit findings (see security note). |
| Lint | `npm run lint` | **Pass** — ESLint/Next.js rules. |
| Type check | `npm run typecheck` | **Pass** — strict TypeScript includes the TS/TSX tests and Vitest config. |
| Component tests | `npm test` | **Pass** — 4 files, 4 tests: home/map description, labeled navigation, loading announcement, and retry/error disclosure. |
| Production build | `npm run build` | **Pass** — Next.js `16.3.8`; `/` and `/_not-found` prerender as static routes. No environment variables are required. |
| Workflow unit tests | `python3 -m unittest discover -s cognitive-fitness/tests -p 'test_*.py' -v` (from repository root) | **Pass** — 10 orchestration-helper tests. The tests use fresh state fixtures so they remain valid as the workflow advances. |
| Production dependency audit | `npm audit --omit=dev` | **Pass** — 0 production vulnerabilities. |
| Local HTTP smoke | `curl http://127.0.0.1:3000/` | **Pass** — HTTP 200, server-rendered page content returned. Unknown route returned HTTP 404. The app binds to `0.0.0.0` for the live preview. |

The landing page is available in the Arena live preview while the local development process is running. This is **not** a Vercel deployment or a substitute for reviewing the eventual Vercel preview.

## Accessibility and behavior review

Implemented and covered structurally by component tests:

- Native links and a retry button; no custom keyboard interaction or pointer-only action in the foundation.
- Skip link, named primary navigation, visible `:focus-visible` outlines, semantic landmarks/headings, and an SVG image with a text alternative.
- Responsive breakpoints at 920px, 700px, and 420px; layout supports the 320 CSS-pixel minimum without a fixed-width content canvas.
- `prefers-reduced-motion` disables nonessential scrolling/transition/animation effects.
- Loading progress is exposed as a status; route error text avoids exposing the thrown internal message and allows retry/home recovery.

**Not yet performed:** hands-on keyboard/touch checks across phone and desktop browsers, screen-reader testing, 200% zoom/reflow inspection, and contrast measurement. WCAG 2.2 AA remains a target, not a conformance claim. Complete these checks on the actual preview before release and again during S6/S10.

## Vercel readiness and limits

- Vercel project **Root Directory:** `cognitive-fitness/`.
- Framework: Next.js; runtime pinned to Node.js `22.x`; use the committed lockfile and normal `npm ci` / `npm run build` integration.
- The current shell statically prerenders and uses no Functions, secrets, or environment variables. `output: "export"` and custom `vercel.json` are intentionally absent so a future reviewed server route remains possible.
- No Vercel deployment has been created from this workspace. Before production, re-check the official framework, Node, deployment, and plan documentation linked from `docs/ARCHITECTURE.md` and `docs/TECH-DECISIONS.md`. The current architecture record flags that Vercel Hobby is restricted to personal, non-commercial use; project eligibility is not assumed.

## Security and toolchain notes

- `npm audit --omit=dev` reports no production vulnerabilities.
- Full `npm audit` currently reports **5 high-severity findings, all in development dependencies**, through `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`, including [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The installed `braces` version is `3.0.3`; the registry version queried on 2026-10-04 has no newer `braces` release. npm's suggested automatic fix downgrades the Next.js lint config across a major version to `14.2.35`, so it was not applied. Recheck after upstream releases and before deployment.
- ESLint `9.39.5` is pinned because the current Next.js/React lint plugins declare support through ESLint 9; a local check with ESLint 10 produced peer conflicts and failed inside `react/display-name`. npm emits an upstream deprecation warning for ESLint 9. Revisit when the Next.js plugin stack supports ESLint 10 cleanly.
- The findings are lint/build-time tooling dependencies and are not included in the production dependency audit. Keep the lockfile committed and do not run `npm audit fix --force` blindly.

## Handoff

S4 provides a deployable, no-secret application foundation and documented quality commands. It deliberately does not implement the memory content model, research claims, or recall exercise; these are S5/S6 work. The actual Vercel preview and full manual accessibility review remain open. The coordinating agent performed a scoped self-review against the S4 prompt and the quality/architecture roles; this was not an independent review.
