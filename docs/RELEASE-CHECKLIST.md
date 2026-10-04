# S13 — Release readiness and end-to-end audit

**Review date:** 2026-10-04
**Branch / starting revision:** `arena/01a10551-hackathon2`, starting from `89c317f` (`feat(coach): add optional tool-first AI workspace`)
**Status:** **HOLD — S13 remains in progress. This is not production approval.**
**Signed:** Arena coding agent, quality-reviewer role pass, 2026-10-04. This is a self-review by one agent; it is not an independent security, scientific, legal, or accessibility sign-off.

## Release decision

- **Local development / private prototype preview:** suitable to continue with the Coach provider disabled and the existing task-specific, unverified-result disclosures intact.
- **Public production deployment:** **not approved by this audit.** The Vercel GitHub app is now connected (project `eng-ahmed-raza-ur-rehman/cognitive-fitness`) and its build check passed on PR #3, so preview builds exist; but the account plan, commercial eligibility, production ownership/contact, a complete privacy policy, legal review, declared browser support, and hands-on accessibility evidence are still unresolved.
- **Optional AI provider:** remains disabled by default. Do **not** enable it for minors or a mixed-age audience on the present self-attestation, and do not enable it publicly until global abuse/spend controls, a protected staging smoke, privacy/legal review, and independent model/safety review are complete.
- Do not claim WCAG conformance, validated cognitive assessment, broad cognitive transfer, verified competition, or repair/migration of the legacy games repository.

This audit covers the checked-out product under `cognitive-fitness/`: Explore/Lab/Evidence, the eight-mode `/train` pilot and four schedules, CF1/CF2/CF3 friend challenges, the optional `/coach` workspace/API, content and evidence, privacy disclosures, app reliability, and the Vercel deployment plan. It does not constitute a review of the separately hosted legacy game source.

## Findings and disposition

| ID | Severity / status | Finding and evidence | Action / release consequence |
|---|---|---|---|
| R-01 | Medium — **resolved in S13** | Every `/coach` visit used to make a client-side `GET /coach/api` just to discover configuration. That route is a dynamic serverless endpoint, so ordinary page views could consume function invocations and depend on a network probe even when AI was disabled. | `/coach` now embeds only an availability boolean in its static server-rendered shell; the API still rechecks the server flag and key before every provider request. Component tests verify no configuration fetch occurs and local tools make no request. A key/flag change requires a new deployment. See `src/app/coach/page.tsx`, `src/features/coach/coach-workspace.tsx`, `src/lib/ai/openai-provider.ts`, and `tests/coach/coach-workspace.test.tsx`. |
| R-02 | Medium — **resolved in S13, partial baseline** | Static pages had no explicit app-level security-header baseline. | `next.config.ts` now adds `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy` for camera, microphone, and geolocation. Verified against the live port-3000 preview. No CSP or anti-framing header was added: a restrictive CSP needs a Next.js/provider review, and frame blocking can break the embedded Arena preview. Revisit before production; this is not a penetration-test result. |
| R-03 | Medium — **resolved in S13; legal gate remains** | Current local-storage, shared-link, hosting-provider, and optional-AI data flows were not summarized on one public app route. | Added a footer-linked `/privacy` prototype data-practices page and a content test. It says plainly that it is **not** a complete legal privacy policy and that no privacy contact/request process has been designated. Production still requires an owner, contact, audience decision, and legal review. |
| R-04 | High — **open / release blocker** | No real desktop/mobile browser, keyboard-only, screen-reader, contrast, zoom/reflow, reduced-motion, touch, or storage-denial review was performed. A temporary Playwright package installed, but Chromium download failed with a TLS connection reset from the browser CDN; no browser binary or assistive technology was available. | Do not mark accessibility criteria complete or claim WCAG 2.2 AA. Complete the matrix below on real supported devices and record browser/OS/AT, viewport/zoom, findings, and build revision. JSDOM tests, package installation, source inspection, and `curl` are not substitutes. |
| R-05 | High — **open / release blocker** | The Vercel GitHub app builds this repository and its check passed on PR #3 (preview deployments exist in the Vercel dashboard); account plan, budget/usage data, production-branch setting, preview-protection policy, and the deployed URLs themselves remain uninspected from this audit environment (`*.vercel.app` was not reachable). Intended commercial status is unknown. | Owner must confirm the account plan and Hobby eligibility for this content, set the production branch, decide preview protection, and smoke-test the PR preview URL and the post-merge production URL in a real browser. A green Vercel CI check is a build pass, not a deployment review — do not mark this row complete on it alone. |
| R-06 | High for AI enablement — **mitigated by keeping AI off** | The Coach age check is a forgeable 18+ self-declaration, not age or identity verification. There is no guardian flow. Request/IP and hourly limits are process-local; they are not global rate or billing limits. No live provider smoke or key is available here. | Keep `COACH_AI_ENABLED` unset/false and do not set `OPENAI_API_KEY` for public use until audience/legal review, a staging provider smoke, provider spend alert/cap, deployment-wide rate limiting, and adversarial safety review are signed off. See `docs/AI-VERIFICATION.md`. |
| R-07 | Medium — **CI implemented and hosted run passed; required-check enforcement pending** | The repository previously had no root `.github/workflows`, so pushes/PRs did not automatically run the checked commands. | Added `.github/workflows/quality.yml`: read-only token, credential persistence disabled, actions pinned to release SHAs, Node from the project `.nvmrc`, and lint/typecheck/tests/content+workflow validation/production-only audit/build. It is configured for `main`, `arena/**`, PRs to `main`, and manual dispatch. The first GitHub-hosted PR run (commit `b646631`, 2026-10-04) passed all steps in 1m59s; a subsequent handoff-update push run `37208343757` and PR run `37208346428` also passed on commit `38629e1`. Recheck the PR for green status after any later documentation-only commits. The repository owner must verify that `main` rules/branch protection require the resulting check. Current agent integration could not read branch-protection settings (GitHub API returned 403), so enforcement is not independently confirmed here. |
| R-08 | Medium — **open upstream/tooling risk** | Full `npm audit` re-run on 2026-10-04 reports five high-severity development-tree findings (zero critical), all through `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. The root advisory is [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), affecting `braces <=3.0.3` for deeply nested patterns. npm's suggested fix downgrades `eslint-config-next` to `14.2.35` across a major version. | `npm audit --omit=dev` re-run on 2026-10-04 reports zero production vulnerabilities. No safe patch is offered by the current lockfile audit; do not force the major downgrade or weaken Next lint rules. Recheck before public production and monitor upstream. This remains a development/CI supply-chain issue, not evidence of a production runtime exploit. |
| R-09 | Medium — **open / scope boundary** | The eight new product-native activities and code in this checkout are testable, but the user's separate public-game repository still returned 403 in the earlier source-access attempt. Its rendered-page inventory is not a source or gameplay audit. | Do not claim legacy games were repaired, migrated, or audited. Reconnect repository access or provide source, then preserve provenance and test each legacy game before making a migration decision. This does not block an explicitly scoped pilot deployment. |
| R-10 | Medium — **open independent review** | Product/science/accessibility/security/competition checks were role-guided self-review. No independent reviewers, participant/user study, psychologist, privacy counsel, or competition operator were engaged. | Keep independent review and user feedback open. Current evidence labels and eight-game schedules are not a validated curriculum or efficacy study. |
| R-11 | Low — **resolved 2026-10-04** | The repository-root `AGENTS.md` described only four `/train` activities. | Updated the root summary to the current eight-mode `/train` pilot, 14-pathway `/develop` atlas, and disabled-by-default Coach. |

No confirmed code-level critical vulnerability or unsupported clinical/diagnostic feature was found in the checked-in routes during this scoped review. The open items above mean the project is **not cleared for public production** and high-impact accessibility/privacy operations have not been independently verified.

## Product, science, privacy, and competition review

### Activities, goals, and user journey

- The application connects educational concept pages, a one-round self-paced recall demonstration, evidence cards, eight playable untimed activity prototypes, and four optional four-week schedules. This is meaningful product progress, but not the complete long-term human-development platform or the user's separate legacy game portfolio.
- The eight `/train` task modes use native controls/text and deterministic local scoring. `docs/TRAINING-PILOT.md`, `docs/GAME-CATALOG-VERIFICATION.md`, `docs/GOALS-PROGRESS-VERIFICATION.md`, and automated tests describe what is implemented. Scores are item-set correct counts, not IQ, health, diagnosis, percentiles, or transfer. The schedules are authored routines, not evidence-validated curricula.
- Goals and histories remain in page memory until a user opts into local save. Saved data is browser-local, versioned, validated, exportable, clearable, and capped at 200 session summaries. Storage denial/quota, download behavior, and deletion have only automated coverage; they still require real-browser testing.

### Competition integrity

- CF1/CF2 compatibility and the fixed CF3/CR1 contract are covered in `docs/COMPETITION-VERIFICATION.md` and tests. CF3 binds a Monday UTC date, current activity version, seed, five questions, untimed correct-count scoring, and a client-checked event window.
- Friend result codes contain only an event code and a claimed correct/total count; they are self-reported and unverified. Users can retry, change their clock, fabricate a result, or alter client code. There is no account, participant registry, public leaderboard, server score verification, moderation/report/appeal, anti-cheat service, or multiplayer.
- The disclosure is appropriate for a private friend-practice prototype. Do not describe it as public, ranked, official, verified, or fair-play enforced. Two-device, clipboard-fallback, UTC-boundary, and assistive-technology checks remain open.

### Evidence and clinical boundary

- `docs/EVIDENCE-LEDGER.md` keeps claims attached to population, outcome, study context, limitations, and transfer level. The current public evidence slice distinguishes background learning research from validation of the product's one-round demo. Content validation passes for 6 concepts, 10 claims, 8 sources, 16 limitations, 2 activities, and 8 relationships.
- Product copy and Coach instructions prohibit interpreting a task score as general intelligence, diagnosis, health, or proof of far transfer. This is a cautious educational boundary, not an independent scientific review. No new intervention/effectiveness evidence was established by S13.

### Data and privacy

- No accounts, database, advertising SDK, or analytics SDK are in the app. Static-page delivery still requires a hosting request. If hosted on Vercel, Vercel may process IP/request/device/diagnostic/security metadata under its own privacy terms; this app has no control over platform log retention. Challenge and result codes in query strings can be visible to the recipient, browser history, and hosting request logs.
- The new `/privacy` route summarizes the current behavior but is not a legal privacy policy. A user contact, formal data-subject request path, data-controller identity, audience/region decision, and counsel review remain open.
- `/coach` messages and reflection notes stay in page memory. If an operator enables the provider, the app sends only the current free-text question, one optional reviewed public item, and fixed instructions/tool catalog after per-request consent. OpenAI `store:false` disables Responses API application-state storage, **not** all abuse logging; OpenAI's current data-control page says abuse-monitoring logs may retain prompts/responses up to 30 days by default, subject to exceptions. There is no provider credential or live request in this checkout.

### Security, reliability, and performance

- The Coach route is server-only, defaults off, checks same-origin JSON, caps request/response size and tokens, enforces strict parsing/allowlisted read-only tool resolution, times out after 10 seconds, does not retry, and maps upstream failures to safe messages. Tests use a stubbed provider. The adult boolean and forwarded-IP/host headers are not strong identity/trust controls; only deploy behind a proxy that overwrites forwarding headers. In-process limits are not deployment-wide.
- Server errors, invalid provider output, rate limiting, disabled-provider fallback, storage errors, and local game state transitions have automated coverage. A live OpenAI request, Vercel outage/region behavior, billing alert, real abuse scenario, and production rollback were not exercised.
- The production build statically prerenders all content/interaction pages including `/coach` and `/privacy`; only `/coach/api` is dynamic. The frontend has no image/font CDN dependency or heavy visualization package. No Lighthouse, Core Web Vitals, real-device performance, or production traffic measurement was run; performance targets and budgets are not yet declared.
- The explicit response headers are a limited baseline, not CSP, HSTS, anti-framing, or penetration-test coverage. `X-Frame-Options` was intentionally omitted to avoid breaking the embedded live preview; decide frame policy with the actual production embed/domain before launch.

## Verification record

Environment: Node.js `v22.22.3`, npm `10.9.8`. Dependency install used the committed lockfile.

| Exact command / check | Result | Evidence / qualification |
|---|---|---|
| `npm ci` | **Pass (previous verified install)** | Installed from the committed lockfile; npm reports five high-severity development-tree findings (see R-08). |
| `npm run lint` | **Pass** | ESLint clean after current atlas and repository-CI changes. |
| `npm run typecheck` | **Pass** | Strict TypeScript clean. |
| `npm test` | **Pass** | 29 files, 126 tests passed after the atlas integration. |
| `node content/validate.mjs` | **Pass** | Knowledge graph: 6 concepts / 10 claims / 8 sources / 16 limitations / 2 activities / 8 relationships. Atlas: 4 clusters / 14 pathways / 10 contextual sources. |
| `python3 scripts/agent_flow.py validate` | **Pass** | 15 stages, 10 roles, no dependency cycles; 14 stages complete and S13 remains in progress. |
| `python3 -m unittest discover -s tests -p 'test_*.py' -v` | **Pass** | 11 workflow-helper tests, including repository-root scope safety. |
| `npm audit --omit=dev` | **Pass** | Re-run 2026-10-04: 0 production dependency vulnerabilities. |
| Full `npm audit --json` | **Open finding** | Re-run 2026-10-04: 5 high / 0 critical / 0 moderate / 0 low; all are development tooling in the upstream `braces` chain. Do not apply the offered cross-major downgrade. |
| `npm run build` | **Pass** | Isolated temporary copy of current source and installed dependencies preserved the live preview's `.next`. Next.js 16.3.8 generated 16 static pages; `/coach/api` is the sole dynamic route. |
| GitHub Actions workflow | **Pass, hosted** | Push and PR runs passed for initial CI commit `b646631` and subsequent handoff-update commit `38629e1` (run IDs `37208343757` / `37208346428`, 2026-10-04). Verify the current PR status after later handoff-only edits. The owner must verify the quality job is required in `main` rules; this integration could not read branch-protection settings. |
| `bash -n scripts/verify-release.sh` | **Pass (syntax only)** | The combined release script was not run in place because it would replace `.next` under the live preview; its constituent checks and isolated build were run. |
| `git diff --check` | **Pass** | Passed after the current handoff edits and before their commit; rerun for every subsequent docs or source change. |
| Local HTTP smoke against `http://127.0.0.1:3000` | **Pass, local only** | `/`, `/develop`, `/explore`, `/train`, `/evidence`, `/lab`, and `/privacy` returned 200. `/develop` rendered all 14 pathways and its menu. This is not a Vercel preview. |
| `GET /coach/api` and valid same-origin `POST /coach/api` with provider off | **Pass, earlier S13 local check** | GET reported unavailable; POST returned safe 503 `not_configured`. No provider call was made. |
| Live response-header check on `/coach` | **Pass, earlier S13 local check** | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`; `X-Powered-By` absent. |
| Headless browser / manual access review | **Not run** | A temporary Playwright install succeeded, but downloading Chromium failed with a TLS connection reset from the browser CDN. No real browser, screen reader, or device review is claimed. |
| Vercel preview, production deployment, live provider request, rollback, platform data deletion | **Partial / not inspected live** | The Vercel GitHub check builds PRs (passed on PR #3), so preview deployments exist; this environment could not open any `*.vercel.app` URL (connection failure), no post-merge production deploy was observed, and no provider credential exists. Browser-level smoke, rollback, and data-deletion verification remain open. |

A production `npm start` server for this build is currently serving port `3000` on `0.0.0.0` (verified again 2026-10-04 after the sandbox restart; process ids change between restarts, so the server — not a pid — is the stable reference).

### Reproducible local/CI command sequence

Run from `cognitive-fitness/` after stopping a dev server that uses this checkout:

```bash
npm ci
npm run lint
npm run typecheck
npm test
node content/validate.mjs
python3 scripts/agent_flow.py validate
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm audit --omit=dev
npm run build
```

`./scripts/verify-release.sh` runs the same sequence. The full development audit remains separately documented because its current upstream finding has no safe patched release.

## Accessibility/device test matrix — required before release

**Formal support matrix:** not yet approved. Proposed targets only: current Chrome/Edge/Firefox on desktop; current Safari on iOS; current Chrome on Android; responsive content from 320 CSS px through wide desktop. Product owner must confirm which browsers/OS versions are supported before this table can be signed.

| Check | Required action | Status |
|---|---|---|
| Desktop browser | Visit Home → Explore → Lab → result → Evidence → `/train` → `/coach` → `/privacy` in supported desktop browsers; verify no JS/runtime error and usable layout. | **Open — not run** |
| Mobile browser / touch | Exercise each of the eight game modes, goal controls, challenge share/import, local export/delete, and Coach local tools on real iOS Safari and Android Chrome devices. | **Open — not run** |
| Keyboard-only | Tab/Shift+Tab/Enter/Space through navigation, forms, dialogs/details, every game phase, answer feedback, leave/retry, goals, challenge import/share fallback, export/delete, and Coach consent. Confirm focus visibility/order and focus after state changes. | **Open — not run** |
| Screen reader | Test at least NVDA with a supported desktop browser, VoiceOver with iOS Safari, and TalkBack with Android Chrome; validate headings, live result announcements, data tables/maps, disabled controls, error recovery, and Coach message log. | **Open — not run** |
| Zoom/reflow | Inspect 200% browser zoom and 320 CSS px reflow with no page-level horizontal scrolling; test long questions, result codes, table grids, challenge links, and large text. | **Open — not run** |
| Reduced motion | Enable OS/browser `prefers-reduced-motion`; confirm nonessential scroll/transition/animation is removed and no information depends on movement. | **Open — source has CSS override only** |
| Visual contrast/targets | Measure text, focus, control boundaries, and status contrast; confirm practical touch target size/separation, including small controls on `/coach` and `/train`. | **Open — not run** |
| Storage/clipboard | Deny or fill local storage, export on supported browsers, clear and verify data removal; deny clipboard permission and use the manual-copy fallback. | **Open — not run** |
| Competition across devices | Compare same CF3 event on two devices; test CF1/CF2 import, exact-event CR1 comparison, UTC rollover, and explicit unverified/retry disclosures. | **Open — not run** |

Automated tests cover many state transitions and labels, but none of the rows above may be marked passed until evidence is recorded from actual supported browsers/devices and assistive technology.

## Vercel configuration, costs, rollback, and operations

### Configuration and eligibility

- Intended project root: `cognitive-fitness/`; framework: Next.js; Node.js `22.x` (`.nvmrc` and `package.json` engines). Standard install/build commands are `npm ci` and `npm run build`. No custom `vercel.json`, static-export setting, database, analytics service, or required non-AI environment variable is present.
- The build confirmed all pages except `/coach/api` are static/SSG. The Coach shell passes only an availability boolean; its key is never a browser prop. `/coach/api` remains a Node.js dynamic function even when disabled. Standard Git-based deployment and root-directory selection are documented by [Vercel Git deployments](https://vercel.com/docs/git) and [Vercel build settings](https://vercel.com/docs/deploy-button/build-settings).
- Vercel currently lists Node 22.x as supported (24.x is the default); recheck [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) at connection time.
- The current [Vercel Hobby plan](https://vercel.com/docs/plans/hobby), checked 2026-10-04, restricts use to **personal, non-commercial** projects. Project commercial status is not known. Do not choose Hobby for a commercial product; confirm the eligible plan and budget with the owner before attaching a production domain.

### Cost and limits

- Vercel's current plan/pricing pages list Hobby monthly included allowances such as 1,000,000 function invocations, 1,000,000 CDN requests, 100 GB fast data transfer, 4 CPU-hours, and 360 GB-hours of provisioned memory. Quotas and behavior can change; exceeding a Hobby allowance may pause that service. Confirm current values and account settings rather than treating these as a forecast. See [Vercel pricing](https://vercel.com/docs/pricing) and [Function pricing](https://vercel.com/docs/functions/usage-and-pricing).
- Static pages/CDN should be the main load. The dynamic `/coach/api` route still consumes function capacity when called. Normal `/coach` page visits no longer call its GET endpoint, but direct probes/POST traffic remain possible. A disabled provider protects against OpenAI charges; it does not remove platform invocation/abuse risk.
- The in-memory client/hourly controls reset or multiply across serverless instances. They are not global. If AI is enabled, an operator must add host/WAF-wide rate limits, provider project spend alerts/limits, define a budget/owner, verify actual model availability/pricing/retention, and measure one staging call. No cost per user can be estimated without traffic and provider usage data.

### Preview, production, and rollback

1. Connect the repository to Vercel only after the account owner confirms commercial eligibility and production branch.
2. Set Root Directory to `cognitive-fitness/`; keep Next.js preset and Node `22.x`; use the committed lockfile and default build settings. No production secret is needed for the AI-disabled build.
3. Deploy a protected Preview first. Run the route/API smoke, confirm required security headers, inspect build/runtime logs for exposed content/secrets, verify the Coach is unavailable, and repeat the manual device matrix. Promote only after owner/reviewer sign-off.
4. For a production incident, inspect current errors, restore the last known good deployment, then investigate and ship a corrected preview. Current Vercel documentation provides `vercel logs --environment production --status-code 5xx --since 30m`, `vercel rollback <previous-deployment-url-or-id>`, and `vercel rollback status`, followed by a 5-minute log check. **Hobby permits rollback only to the immediately previous production deployment**; higher plans have broader rollback options. See [Rolling back a production deployment](https://vercel.com/docs/deployments/rollback-production-deployment). The Vercel CLI/project is not connected here, so commands were not executed.
5. A routing rollback does not revoke a compromised provider credential, erase local browser data, delete copied URLs/files, or retract a prompt already sent to a provider. Revert the source as well once the cause is fixed; redeploy and verify.

### Data export, deletion, and incident response

- **Local progress:** use `/train`'s export/clear controls. If deletion cannot be confirmed, clear site data in the browser. Exported JSON, backups, a shared-device screen, and friend links/copies are outside this control. No app database/account exists to delete.
- **Challenge data:** CF1/CF2/CF3 and CR1 codes are public, self-reported strings. A URL may expose them to its recipient, browser history, and hosting request logs. No server challenge history exists to erase; copied/shared links must be deleted by their recipient/owner.
- **Hosting/provider data:** Vercel's [Privacy Notice](https://vercel.com/legal/privacy-notice) and current log/retention settings govern platform metadata. OpenAI provider retention is separate; `store:false` is not zero retention. The product cannot promise deletion of those records through the app.
- **Incident actions:** assign a named incident/privacy owner before launch. For suspected key disclosure or cost/abuse spike, first revoke the key in OpenAI, set/keep `COACH_AI_ENABLED=false`, remove affected Vercel env values for every environment, redeploy all affected aliases, then verify GET reports unavailable and consented POST returns `503 not_configured`. Vercel environment changes apply to new deployments; old deployment URLs can retain old configuration, so key revocation is essential. Review platform/provider logs without copying prompts into tickets. Preserve only minimum incident evidence, assess user/regulator notification with counsel, and publish a contact/process before public release.
- **Competition abuse:** current codes do not provide an in-app report, moderator, or appeal system. That is acceptable only while the mode remains private/local/unranked and self-reported. If public abuse/ranking is introduced, pause the feature until moderation, appeal, identity/privacy, retention, child-safety, and server-verification design exists.

### Provider failure path

- With the feature flag/key absent, `GET /coach/api` reports unavailable and an otherwise valid same-origin request returns a generic `503 not_configured`; local tools remain usable.
- When configured, provider request size, context, tokens, response bytes, and time are capped. The route performs one attempt and no automatic retry. Provider 429 maps to a retry-later message; timeout to 504; invalid structured output to 502; other failures to 503. The workspace retains local tools and does not apply an invalid tool action.
- Tests stub provider success/failure. A live credentialed staging smoke, live model/schema/pricing check, provider retention/account settings, actual Vercel timeout, and deployment-wide throttling have **not** been verified. Keep the flag off until all are complete.

## Official platform/provider references checked 2026-10-04

- [Vercel Hobby plan and eligibility](https://vercel.com/docs/plans/hobby)
- [Vercel pricing](https://vercel.com/docs/pricing)
- [Vercel Function pricing and usage](https://vercel.com/docs/functions/usage-and-pricing)
- [Vercel Node.js runtime versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vercel Git deployment/root settings](https://vercel.com/docs/git)
- [Vercel rollback](https://vercel.com/docs/deployments/rollback-production-deployment)
- [Vercel environment-variable rotation](https://vercel.com/docs/environment-variables/rotating-secrets)
- [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice)
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data)
- [OpenAI Services Agreement](https://openai.com/policies/services-agreement/)

## Stage sign-off

S13 acceptance is **partial, not complete**. The new code/doc issues R-01 through R-03 are implemented and automated checks pass. The release checklist, local/CI helper, and incident/deployment notes are present. The real-browser/assistive-technology, independent-review, public-policy/owner, Vercel-account/plan, and AI production gates remain open. Keep `orchestration/state.json` at S13 `in_progress`; do not mark the stage done until the open acceptance criteria have evidence and the product owner accepts the support matrix and deployment plan.

---

# S13 experience-system and user-pays-guide pass (2026-10-04, later checkpoint)

**Decision:** still **HOLD** for public production. Prototype scope advanced; the manual, legal, independent-review, and deployment gates above remain open and unchanged in status.

## New findings recorded by this pass

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-04 | High for public release, acceptable for a private opt-in prototype | `/coach` can load a third-party script (`https://js.puter.com/v2/`) when a visitor explicitly selects the user-pays mode. No Content-Security-Policy or Subresource-Integrity pin is deployed, so the page accepts whatever that origin serves. Mitigations: mode default-off per message, adults-only self-declaration, one bounded stateless turn, strict reply validation with no auto-applied action, per-page request cap, no auto-retry, `NEXT_PUBLIC_COACH_PUTER_ENABLED="false"` kill switch, and explicit billing/retention wording. | **Open — review the CSP/SRI decision and complete adversarial testing before any public audience.** |
| R-05 | Medium | Two new interactive surfaces (`/search`, `/progress`) and one new content system (`/journeys`) have automated coverage only. The search panel is JavaScript-interactive; without scripting it degrades to framing plus browse links, which is disclosed on the page but not user-tested. | **Open — include in the manual matrix.** |
| R-06 | Low | Reading preferences now include spacing, serif face, and link underlining, applied by an inline pre-paint script from one `localStorage` key. The script cannot throw and reads no other value, but contrast, reflow, and forced-colours behaviour under those states has not been measured. | **Open — extend the accessibility matrix to all seven settings.** |

## Re-run checks after this pass

| Command | Result | Notes |
|---|---|---|
| `npm ci` | Pass | From the committed lockfile. |
| `npm run lint` | Pass | 0 errors, 0 warnings. |
| `npx tsc --noEmit` | Pass | Strict, including tests. |
| `npm test` | Pass | 37 files, 187 tests (previously 29 / 126). |
| `node content/validate.mjs` | Pass | Adds the route registry (23 pages) and guided paths (6 journeys / 29 steps) to the previous content checks. |
| `python3 scripts/agent_flow.py validate` | Pass | 15 stages / 10 roles; S13 still `in_progress`; a new S13 workstream declares this pass's scopes. |
| `python3 -m unittest discover -s tests -p 'test_*.py'` | Pass | 11 tests. |
| `npm audit --omit=dev` | Pass | 0 production findings. |
| Full `npm audit` | Open | Upstream dev-tree findings via `braces <=3.0.3` remain; no safe non-breaking fix and no automatic downgrade applied. Recheck upstream before any release. |
| `npm run build` | Pass | 22 prerendered pages; `/coach/api` is the only dynamic route; no new environment variables or dependencies added. |
| `npm start` + `curl` route smoke | Pass | All fourteen listed routes 200, unknown path 404, security headers present, journey step anchors and coach mode text present. |
| Repository-root `Quality checks` workflow (push and pull request) | Pass | Both runs succeeded on commit `0fba131` for `arena/01a107a7-hackathon2` (push run `37218436666`, pull-request run `37218455545` on draft PR #3), covering lint, strict types, app tests, content/workflow validation, production-only audit, and the production build. `main` branch-protection/required-check status still requires the repository owner. |
| Real browser / AT / device / offline / two-device checks | Not run | Same blocker as above: no browser binary, assistive technology, or account availability. |
| Vercel project, plan confirmation, preview deployment, logs, rollback drill | Not run | No connected project. |
| Live Puter or OpenAI request | Not run | No Puter account and no key here; both AI paths remain unexercised against a real provider. |

## Updated instruction for the next reviewer

Treat this pass as additional prototype capability, not as release evidence. The blocking gates are unchanged: declared support matrix with real browser and assistive-technology results; named product/privacy/incident owner and a real policy; independent security, evidence, and accessibility review; confirmed Vercel plan and a protected preview deployment; required CI check on `main`; and, before any public audience, the R-04 CSP/SRI and adversarial-AI decisions. Until then, keep the operator AI path disabled, keep competition self-reported, and do not describe any page, path, or search result as validated.

See `orchestration/runs/S13-experience-pass-handoff.md`, `docs/EXPERIENCE-SYSTEM.md`, and `docs/AI-PUTER-REVIEW.md`.
