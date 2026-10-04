# Presentation Slides — outline & speaker notes

Deck: [`cognitive-fitness-slides.pptx`](cognitive-fitness-slides.pptx)
(13 slides, 16:9, speaker notes embedded). Regenerate:
`/home/user/.pptxenv/bin/python docs/presentation/build_slides.py`
(needs `pip install python-pptx` in a venv). This markdown is the
reviewable source of truth for what each slide says.

| # | Slide | Key content | Notes = transcript section |
|---|-------|-------------|---------------------------|
| 1 | Title | Cognitive Fitness & Human Development — "Every page earns its place." + repo/preview links | 0:00 |
| 2 | The problem | Overclaiming; fragmented learning; cognitive overload; AI demos that need operator keys | 0:25 |
| 3 | Evidence stance | Simons et al. 2016 transfer critique (in our own evidence ledger); boundary notes on every page | 0:25 |
| 4 | Our approach | the every-page contract: registry → validator → build gate; 23 pages, 6 journeys, 29 steps | 1:05 |
| 5 | What we built | journeys · search · 7 reading settings · local-only progress · 3-mode coach · atlas (14 areas) · 8 practice modes | 1:05 |
| 6 | User-pays AI | Puter.js: user signs in, free monthly allowance, then *their* bill; consent per message; kill switch; no app-held key; operator OpenAI path disabled by default | 4:10 (previewed early) |
| 7 | Technology stack | Next 16.3.8 / React 19.3 / TS 5.9 / Tailwind 4 / Vitest 5 / Node 22 / Vercel / Puter SDK / content-as-JSON validators | 1:45 |
| 8 | High-level diagram | Browser ⇄ CDN (22 static), localStorage, opt-in browser→Puter→model path, `/coach/api` fail-closed, CI gate | 2:20 |
| 9 | Privacy posture | no accounts/DB/analytics; single storage key; security headers; `/privacy` lists every data path | 4:35 |
| 10 | Verified & honest | 187 tests green, lint 0, tsc clean, CI Actions+Vercel; manual a11y matrix, legal review, CSP/SRI decision **open** (R-04…R-06) | 4:35 |
| 11 | Finance | $0/mo today: hobby hosting, user-pays AI, no analytics; what changes at scale | 9 in PRD |
| 12 | Roadmap & asks | branch protection; accessibility matrix; adversarial AI testing; mobile/device QA; optional: guardian flow research | — |
| 13 | Demo / thanks | "Live demo" card with QR-free plain URLs (repo + preview) | 2:50 onward |

Design: light background, one accent (deep teal), big type, ≤ 6 bullets,
diagrams real (shapes, not screenshots). Speaker notes carry the matching
transcript paragraphs so the presenter can read them straight from the deck.
