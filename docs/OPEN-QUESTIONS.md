# Open product and deployment questions

These questions are intentionally visible. Unless marked as a release blocker, agents should use the provisional choice and continue rather than stopping for a preference that can be reversed.

| Question | Provisional choice | Needed by | Why / decision rule |
|---|---|---|---|
| Is the first public deployment a personal, non-commercial project or a commercial product/service? | Prototype/development can target Vercel Hobby, but do not assume it is appropriate for a commercial service. | Before production deployment | [Vercel's current Hobby documentation](https://vercel.com/docs/plans/hobby) says it is for personal, non-commercial use. If the product is commercial, verify applicable terms and plan requirements; do not build the business plan around Hobby. |
| What is the first learning concept/activity? | Memory/recall is selected for the prototype; use it only as an educational demonstration. | S3/S6 | It directly follows the res4 examples, has reviewed sources, and tests the concept → activity → result → evidence loop. Revisit only if usability research shows a better first journey. |
| What is the minimum supported age and what rules apply to minors? | First slice has no accounts, no AI, and no remote personal data. | Before public AI/accounts or sensitive data | Audience spans age groups; AI, consent, retention, and child-safety obligations require explicit research and policy before adding these features. |
| Should the initial UI support Urdu/RTL as well as English? | English first, with content and components kept localization-friendly. | Before broader launch | The product should be understandable across ages and regions; Urdu/RTL should be evaluated in usability research rather than assumed. |
| Which competition model should ship first: local/pass-and-play, asynchronous friends, public leagues, or real-time multiplayer? | `/train` now prototypes account-free CF2 daily and CF3 weekly friend challenges with unverified CR1 same-event result comparison; CF1/CF2 links remain compatible. Public rankings, accounts, and real-time play remain gated on the owner's choice. | Before any public/ranked service | The prototype is untimed/self-reported, with no identity, server verification, participant registry, or attempt enforcement. A production service changes identity, anti-cheat, moderation, privacy, cost, and Vercel architecture. Scores must rank a named game/event only, never overall cognitive ability. |
| Can the Arena GitHub integration inspect the source repository for the existing games? | The public site is readable, but `gh api` for `ahmed-raza-ur-rehman/ahmed-raza-ur-rehman.github.io` returned 403 “Resource not accessible by integration”. Audit the rendered catalog now; request repository access through Arena before source migration. | S7 | Do not ask for passwords/tokens. Avoid claiming the games were code-audited, tested, or fixed until source access and interaction testing are available. |
| Is durable progress worth the privacy and implementation cost? | `/train` now has optional local-only goal/session summaries with inspect/export/clear; no remote profile or sync. | Before public accounts/sync | Validate the local pilot and its browser-storage failure modes; require a demonstrated benefit before remote accounts/database. |
| Which AI provider, if any, should be used for a first coach? | No provider before game/goal foundations. Evaluate free/low-friction, explicitly connected, and secure server-side modes separately. | S12 | Verify current terms, billing/limits, consent, browser support, data retention, CORS, and authorization. Google sign-in is not Gemini/API authorization. |
| How immersive should the first Coach session be? | Shared workspace with text and actual validated tools; voice/avatar later and always optional. | S12 | Prove value and accessibility before adding speech permissions, provider-specific real-time APIs, or synthetic identity cues. |
| How should success be evaluated? | Comprehension, completion, evidence understanding, accessibility, and reliability—not time-on-site or “brain score” change. | S1 and ongoing | Avoid manipulative engagement targets and unsupported cognitive outcomes. |

## S1 decisions made for forward progress

- Keep the first version account-free and AI-free.
- Select memory recall as the prototype first slice, not a diagnostic assessment; this is an initial proof, not the complete product.
- Use English as the initial working language, while avoiding hard-coded copy that prevents later localization.
- Keep basic training account-free; provisional competition starts with fixed-seed, shareable challenges, while online/global/ranked and real-time modes require the product owner's explicit choice.
- Preserve and audit the existing public games before migrating; source-level review is blocked until Arena integration access to the games repository is granted.
- Verify Vercel plan suitability before production; avoid unnecessary infrastructure.

## S2 decisions made for forward progress

- Use Next.js App Router, TypeScript, ESLint, Tailwind, npm, and Node.js 22.x for the Vercel-targeted app.
- Put the deployable app/package in `cognitive-fitness/`, selected as Vercel's Root Directory.
- Keep the initial routes static/prerendered, use the standard Vercel Next.js build integration, and require no env secrets for the first slice.
- Continue to treat Vercel Hobby as conditional on personal/non-commercial eligibility; this must be confirmed before production.
- Defer AI provider, account, remote persistence, voice, and analytics choices until user value, current terms, and privacy/safety controls are reviewed.
