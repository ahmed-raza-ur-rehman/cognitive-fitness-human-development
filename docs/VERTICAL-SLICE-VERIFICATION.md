# S6 learning and training-pilot verification

**Date:** 2026-10-04  
**Status:** Implementation and automated checks pass. S6 remains in progress pending hands-on keyboard, screen-reader, mobile/reflow, and independent review that require a real browser/device and assistive technology. This is not a WCAG conformance claim or a Vercel deployment.

## Delivered journey

1. Home → `/explore` → graph-backed concept detail (`/explore/[slug]`).
2. An optional, self-paced six-word recall demonstration at `/lab`; the user chooses when to hide the list and can leave or submit a blank answer.
3. A deterministic, single-round result reports only distinct listed words entered from that fixed list. Repeated entries do not add credit; off-list entries do not add credit.
4. The result explains the measurement boundary and links to retrieval-practice context/limitations on the same page and to related concepts. The result remains in the active page while its evidence section is read.

The `/lab` activity uses client component state only. Its response is not submitted to a server or AI and is not persisted; reload/exit clears it. There is no timer, account, audio, microphone, analytics, or provider integration. Research sources are context for the general learning strategy, not validation or efficacy evidence for this product activity; its `efficacyEvidenceIds` remains empty.

## Training pilot supplement

Historical S6 verification snapshot (2026-10-04): the original product-owner scope correction added `/train` with four playable task demonstrations, four user-chosen weekly practice targets, opt-in local summaries with export/clear, and a `CF1` fixed UTC-date friend challenge. The active S8 implementation now has eight native game modes and CF2; see `docs/GAME-CATALOG-VERIFICATION.md` and `docs/TRAINING-PILOT.md` for current details. The challenge is untimed, with raw correct/total accuracy only; codes bind the date/game/version and results are explicitly self-reported. There is no remote leaderboard, verification, account, or real-time service. Exact product limits and the manual review checklist are in `docs/TRAINING-PILOT.md`.

Automated tests cover deterministic challenge generation, code parsing/rejection, answer-key alignment, UTC-week counts, program activity rotation, explicit goal save/clear, memory-sequence hide/answer feedback, challenge import, and completion. A passing DOM test is not a manual screen-reader/device check.

## Acceptance review

| S6 criterion | Result | Evidence / boundary |
|---|---|---|
| One coherent concept → experiment → result → evidence journey, without signup/audio/microphone/AI | **Pass in implementation and automated route/component checks** | Graph-backed `/explore` pages connect to `/lab`; pre-task disclosure says no account, microphone, or audio is needed. The task makes no account, provider, audio, or microphone calls. Response is local component state and is not posted. See `src/features/experiment/word-recall-experiment.tsx` and `tests/learning-pages.test.tsx`. |
| Useful on phone and desktop | **Partial — responsive rules implemented; real-device verification open** | Responsive single-column/list layouts are defined at 700px and 420px; buttons and key nav controls have 44px-or-greater targets. No browser/device was available to check 320px reflow, zoom, orientation, or horizontal overflow. |
| Deterministic scoring and safe handling of malformed/repeated input | **Pass in automated unit/component checks** | `scoreWordRecall` is pure and bounded; case/punctuation normalization, duplicate suppression, off-list input, blank response, invalid expected lists, non-string response, and overlong response are tested. The UI preserves a correctable overlong response and exposes an announced validation error. |
| Exact measurement and non-inferences communicated | **Pass in implementation and content tests** | The result states “distinct listed words entered in this one round,” enumerates correct/missed words, and disclaims inference about overall memory, working-memory capacity, attention, intelligence, health, long-term retention, or future performance. It also notes that repeating the list is not an independent measurement. |
| Reach related concepts and evidence without losing result context | **Pass in component/route tests** | Result links to the evidence section in the same `/lab` document and to retrieval practice and memory concept routes. Production route smoke checks passed. |
| Keyboard/screen-reader semantics, visible focus, reduced motion, and failure states | **Partial — source/DOM review and automated checks pass; manual assistive-tech verification open** | Native links/buttons/form controls, persistent label/help, named navigation, skip link, semantic landmarks/headings, a text alternative plus direct links for the map, `role="status"`, `role="alert"`, error association/`aria-invalid`, and phase-change heading focus are present. Global `:focus-visible` styles include links, buttons, form controls, and disclosure summaries; reduced-motion CSS disables smooth scrolling/transitions/animations. Loading/error component tests and unknown-route 404 smoke test pass. No real keyboard-only run or screen reader/browser combination was available. |

## Verification commands and results

Run from `cognitive-fitness/` on Node `v22.22.3` / npm `10.9.8`:

| Check | Result | Notes |
|---|---|---|
| `node content/validate.mjs` | **Pass** | Validated content 1.1.0: 5 concepts, 7 claims, 5 sources, 9 limitations, 1 activity, and 5 relationships. |
| `python3 scripts/agent_flow.py validate` | **Pass** | 14 stages and 10 roles; no dependency cycles. S6 remains the active stage. |
| `npm test` | **Pass — 40 tests in 10 files** | Scoring, page content/routes, game/challenge engine, weekly goals, local save/clear, activity phases/results, navigation, loading, and error components. |
| `npm run lint` | **Pass** | ESLint. |
| `npm run typecheck` | **Pass** | `tsc --noEmit`, including test files. |
| `npm run build` | **Pass** | Next.js 16.3.8 production build; home, explore, evidence, lab, and train pages prerender; five concept slugs generate as static pages. |
| Production server route smoke (`next start`) | **Pass for expected routes; warning on negative route** | `/`, `/explore`, `/explore/memory`, `/lab`, `/evidence`, and `/train` returned 200; `/explore/no-such-concept` returned 404. That negative request also logged an internal Next.js `NoFallbackError`; the user-visible 404 is correct, but the framework log should be investigated. `dynamicParams = false` restricts the concept route to reviewed static slugs. |
| Browser/device/screen-reader session | **Not run** | No browser binary, mobile device, or screen reader is available in this environment. The live preview is not a Vercel deployment. |

## Accessibility review notes

- The HTML uses a skip link, labeled primary navigation, one page-level heading per route, breadcrumbs, named sections, and native disclosure controls.
- The SVG map has a title/description and figcaption; equivalent concept links are rendered as ordinary HTML, so the visual is not the only navigation path.
- Phase transitions focus the new heading. The result uses a polite status region; invalid input is announced and remains editable. The list is hidden by an explicit button, not a timer.
- A reduced-motion media query disables smooth scrolling, transitions, and animations. There is no auto-advancing or animated task content.
- `/train` uses native answer buttons, manually hidden memory stimuli, semantic table markup for the visual-search grid, announced feedback, an untimed challenge, and no color/sound-only input. These are source/DOM checks, not a conformance claim.
- Keyboard-operable native controls and `:focus-visible` rules were inspected; actual tab order and focus visibility across browser/zoom combinations remain to be exercised.
- Selected text-color tokens were spot-checked against the base dark canvas, but there is no automated full-palette contrast scan. Real rendering over gradients and at zoom still needs review.

## Vercel readiness

The production build succeeds on the declared Node 22.x runtime. The app lives in `cognitive-fitness/`, uses ordinary Next.js App Router/static generation, has no required environment variables, and adds no custom Vercel configuration or static-export setting. Configure Vercel’s Root Directory as `cognitive-fitness/`, select the Next.js preset, and use the normal `npm ci` / `npm run build` flow. No Vercel account deployment, hosted preview, domain, plan eligibility, or production environment was tested here; see the deployment caveats in `README.md` and `docs/FOUNDATION-VERIFICATION.md`.

## Remaining before S6 close

- Run Home → concept → `/lab` → result → evidence → back using keyboard only in a real browser; inspect focus order/visibility and the same-page evidence anchor.
- On `/train`, test each game's study/answer/feedback/continue/leave/result flow with keyboard and touch; verify screen-reader announcement and focus between phases, including the Target Finder table.
- Test a daily challenge and a loaded friend code on two devices; verify the same UTC challenge set, share-link import, clipboard fallback, tie behavior, and that elapsed time is never ranked.
- Exercise save, export, and clear on `/train`; test private browsing/storage denial, quota failure, and whether the UI remains usable without persistence.
- Test at 320px, common phone/tablet/desktop widths, landscape, 200% zoom, and reflow; check touch spacing and horizontal overflow.
- Test with at least one desktop screen reader and one mobile screen reader; verify control labels, list hiding, validation, and result announcements.
- Review contrast and reduced-motion behavior in rendered browsers and get an independent accessibility/content review where available.
- Do not describe the activity as a validated assessment or infer far transfer from its score. Do not describe the live preview as a deployed Vercel site.
