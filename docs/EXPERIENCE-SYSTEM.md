# Experience system: structure, linkage, and reading load

**Status:** implemented for the current prototype (S15). Manual browser, assistive-technology, and real-device verification remains open.

## The claim this system exists to keep

Every page, panel, link, and label should answer four questions without the reader hunting: *what is this for*, *what do I do here*, *where does this lead*, and *what must I not overread*. The implementation is deliberately structural rather than stylistic:

1. **One registry of meaning.** `content/routes-v1.json` records each page's kind, purpose, audience, primary action, and where it leads. `src/lib/routes.ts` is the only reader. Navigation, the footer index, breadcrumbs, search, guided paths, and every `RouteOutlook` panel are generated from it, so a destination cannot appear without a reason, and a page cannot exist unregistered — `tests/routes-registry.test.ts` fails on either.
2. **One page opening.** `src/components/page-shell.tsx` gives every route the same first screen: breadcrumbs, an eyebrow naming the area, the title, a plain-language lead, the registry's purpose statement, one primary action set, and the boundary sentence where one is needed. Pages stopped re-inventing their own introductions; the reader relearns nothing between areas.
3. **One exit structure.** `RouteOutlook` renders the registry's `leadsTo` entries with their purposes, so "where to next" carries meaning instead of decoration. `docs/RELEASE-CHECKLIST.md` records that no page may end at a dead end.
4. **Guided paths as the connective tissue.** `content/journeys-v1.json` composes existing pages into ordered routes with six fixed step kinds (`understand`, `experience`, `inspect`, `practice`, `apply`, `reflect`). Each step carries a purpose, an action, a takeaway, a caution, and one link. `content/validate.mjs` fails if a step links to an unregistered page or a non-existent anchor, so the paths cannot rot into stale links.
5. **Progressive depth without hidden depth.** Simple copy first; claim, population, design, source, and limitation one disclosure away. Nothing meaningful is gated behind a click that the reader must discover.

## What was changed to reduce visual and cognitive load

- **Home:** the previous screen offered four hero actions, a four-tab switcher, and four quick-start cards describing the same choices. Those three competing entry points became one intent chooser (four links, each with its destination's stated purpose) plus one system map that names all eight areas and their jobs. Redundant utility bars and an in-page "on this page" index were removed; the honest-result example, atlas doorways, and boundaries were kept.
- **Density control:** new panels reuse one surface, one radius scale, one kicker style, and one arrow affordance. Cards gained no carousels, no animation, and no colour-only status. The atlas page keeps its own module styles; the new pages reuse the existing `.journey-page`, `.breadcrumbs`, and `.section-kicker` language rather than adding a second design system.
- **Direction on completion:** `/train` ends with a strip that says what saved sessions can and cannot say and links to four registered destinations, instead of leaving the practice space at a bottom edge.

## Reading and access controls

`src/lib/preferences.ts` is the single preference model; `src/components/accessibility-controls.tsx` is its UI, and a small pre-paint bootstrap script in `src/app/layout.tsx` applies saved preferences before first paint so text never jumps.

- Text size (three steps), higher contrast, extra line spacing, an alternative serif face, reduced motion, a pointer-aligned reading guide, and a "underline every link" option.
- Every control states that it changes presentation only, never an activity's rules or the meaning of a result.
- Escape closes the panel and focus returns to the trigger; opening moves focus into the panel; each change is announced once in a live region.
- Settings persist under one `localStorage` key, degrade silently when storage is blocked, and a reset removes it. `docs/PRIVACY.md` documents this.

## Deliberate limits

- Paths do not record completion or time. There is no streak, no "resume where you left off" promise, and no profile built from reading behaviour.
- `/progress` describes saved sessions per activity with counts, ranges, and median only. No combined score, percentile, or trend claim exists in the analytics types, and a test asserts no key resembling an aggregate ability score is produced.
- `/search` is a browser-side lookup over reviewed product content, not a knowledge engine. Its empty state says so and offers browsable indexes instead.
- The atlas remains an orientation map, not a validated curriculum.

## What still needs real-world checking

Keyboard-only and screen-reader traversal of the new pages, 320 CSS px reflow and 200–400% zoom, forced colours, contrast measurement of the new surfaces, and reading-comprehension testing with target users — none of which could be performed in this environment. See `docs/RELEASE-CHECKLIST.md`.
