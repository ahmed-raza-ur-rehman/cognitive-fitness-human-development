# Cognitive Fitness & Human Development

An evidence-informed learning space for exploring how people think, learn,
focus, sleep, connect, and develop. The prototype combines plain-language
concepts, inspectable evidence, guided learning journeys, untimed practice,
local progress, and an optional user-pays AI guide.

> **Prototype boundary:** this is an educational self-development prototype,
> not a medical product, diagnostic tool, validated curriculum, intelligence
> test, or verified competition service. Activity scores are task-specific and
> must not be interpreted as proof of broad cognitive change.

## What is included

- **Explore and evidence:** concepts, sources, evidence summaries, and visible
  limits for each topic.
- **Guided journeys:** short paths connecting understand → experience → inspect
  → practice → apply → reflect.
- **Development atlas:** 14 whole-person areas with starter ideas, routes,
  reflection prompts, boundaries, and sources.
- **Practice:** eight untimed activity modes and four user-owned four-week
  schedules.
- **Local progress:** opt-in, browser-only session summaries with no pooled
  score, public ranking, analytics, or account database.
- **Coach:** defaults to “This device only (no AI)”. Puter.js is opt-in and
  user-pays; the operator OpenAI path is disabled unless explicitly
  configured.
- **Quality contract:** route and journey registries are validated in CI so
  every page has a purpose, audience, primary action, and deliberate onward
  path.

## Team

The project is led by **Ahmed Raza Ur Rehman**, with contributions from Nabi
Bakhsh and Arooj Fatima. Personal contact details are intentionally excluded
from this public repository.

## Run locally

Requirements: Node.js 22.x and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Next.js. The core experience needs no API key,
account, database, analytics service, or remote AI provider.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
node content/validate.mjs
npm run build
```

The GitHub Actions workflow runs the same checks on pushes and pull requests.
Automated checks do not replace manual keyboard, screen-reader, contrast,
zoom, touch, privacy, legal, and evidence review.

## Submission materials

- [Product Requirements Document](docs/PRD.md)
- [Presentation slide outline](docs/presentation/SLIDES.md)
- [PowerPoint deck](docs/presentation/cognitive-fitness-slides.pptx)
- [Demo recording guide](docs/presentation/DEMO-VIDEO-GUIDE.md)
- [English transcript](docs/presentation/TRANSCRIPT-EN.md)
- [Urdu transcript](docs/presentation/TRANSCRIPT-UR.md)

Regenerate the deck from the source script:

```bash
python docs/presentation/build_slides.py
```

The deck is designed for the required 4–5 minute presentation and covers the
problem, solution, technology stack, high-level architecture, and live demo.

## Deployment notes

The app is static-first and can be deployed from this repository as a Next.js
project on Node.js 22.x. No environment variables are required for the
non-AI experience. Do not enable the operator AI route for a general audience
without completing the documented privacy, security, evidence, and live
provider checks.

## License

MIT. See [LICENSE](LICENSE).
