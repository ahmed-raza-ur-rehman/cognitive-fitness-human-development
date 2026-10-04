# Demo Video — English narration transcript (read aloud; ~4:50)

Product/UI names stay in English. Bracketed cues are actions, not spoken.
Total ≈ 640 words ≈ 4:40–5:00 at a calm pace. Practice twice with the page
open; the timing targets in the [guide](DEMO-VIDEO-GUIDE.md) match section
starts.

---

**[0:00 — title card → home page]**

This is **Cognitive Fitness and Human Development** — an evidence-informed
learning space for how people think, learn, focus, sleep, and build habits.
The problem it attacks: "brain training" products overclaim, learning tools
are scattered, and most interfaces bury the next step under decoration.

**[0:25 — scroll a Boundary block on a concept or evidence page]**

Research — Simons and colleagues' 2016 review is one example we cite — shows
game-based training rarely transfers. Yet most apps still sell "your brain,
now at 20 percent." So every page in this app must carry a *boundary*: what
the task score does **not** prove. You can see it here — scores stay
task-specific, never a diagnosis, never IQ.

**[1:05 — home, then journeys index]**

Our solution is structure you can verify. Every one of the twenty-three
pages is registered in a content manifest with an audience, a stated
purpose, one primary action, and explicit links onward. A build-time
validator fails if any of that is missing — so "every page has meaning" is
enforced by the pipeline, not by taste. On top of it: six guided journeys
that chain understand, experience, inspect, practice, apply, and reflect —
with no account and no tracking.

**[1:45 — slide: technology stack]**

The stack: Next.js sixteen with React nineteen, strict TypeScript, content
as JSON data with custom validators, Vitest with Testing Library — one
hundred eighty-seven tests, Tailwind and CSS modules, deployed on Vercel,
and Puter dot JS for the optional AI guide.

**[2:20 — slide: diagram]**

High level: the browser talks to a static CDN — twenty-two of the pages are
prerendered files. Preferences and practice history live only in local
storage. If you opt into the AI guide, your browser calls the provider
directly through Puter; there is no key in our infrastructure. And CI —
lint, types, tests, validators, build — gates every deploy.

**[2:50 — demo: journeys]**

Live demo. The Start Here journey: each step states why you're doing it,
what to do, a takeaway, and a caution — and links deeper. One link, one
back, and the "where this leads" panel shows the page's neighborhood.

**[3:15 — demo: search]**

Search is entirely client-side: type "spac" with a typo — spacing effect,
found, zero network requests. Opening a concept, its evidence and boundary
are anchored right there.

**[3:35 — demo: preferences]**

Reading settings — text size, contrast, spacing, serif, reduced motion, a
reading guide, link underlining — applied before first paint, stored on the
device, in sync across tabs.

**[3:55 — demo: progress]**

Progress describes only sessions I chose to save: counts and cadence per
activity — deliberately no combined score.

**[4:10 — demo: coach]**

The coach defaults to "this device only, no AI." Opt in, and it runs on
**user-pays billing**: you sign into Puter in the browser, every visitor gets
a free monthly allowance, then they pay their own usage. We never hold
credentials, every message needs explicit consent, and one kill switch turns
it off.

**[4:35 — privacy page → closing card]**

No accounts, no database, no analytics — the privacy page lists every path
data takes, because this is a research prototype with honest gates, not a
launch claim. Thank you.

---

*Read-aloud notes:* pause a beat at every "[time]" cut; say numbers slowly
(twenty-three pages, one hundred eighty-seven tests); when the Puter popup
appears on camera, stay silent 3 s and let it be seen. If you record per
scene, re-read the first sentence of the next scene as your warm-up.
