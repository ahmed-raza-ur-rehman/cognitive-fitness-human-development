# S14 experience and accessibility review — development atlas

- **Reviewed:** 2026-10-04
- **Role pass:** UX/accessibility (same Arena coding agent as implementation; manual browser and assistive-technology review remain open).
- **Primary need:** A new visitor can see the scope of whole-person development without taking a questionnaire or mistaking a game catalog for a validated curriculum.

## Proposed flow

1. **Discover:** a `Develop` primary-navigation item and home entry open `/develop`. The page explains the difference between task practice, everyday skills, health/context supports, and topics for exploration.
2. **Orient:** four in-page cluster links (`Think & learn`, `Feel & connect`, `Body & foundations`, `Life, context & science`) provide landmarks. All 14 pathways remain available in the document; navigation is not a JavaScript-only filter.
3. **Explore:** each pathway uses a consistent card structure: what it covers, what the product can offer, a short starter with numbered steps, a real-world application/support option, something safe to notice, boundaries, and source links.
4. **Choose:** an optional `Add to my practice menu` button lets a user select up to three pathways. Each button exposes its pressed state; the selected count and limit are announced.
5. **Use:** the practice menu groups each choice into `Try`, `Apply`, and `Reflect`. It adds no due dates, dose/frequency, streak, score, diagnosis, or progress tracking.
6. **Leave in control:** the user can copy the generated text where browser permissions allow or clear it. Page reload discards the menu. No health or emotion input is required.

## Interaction details

- Default is a complete, server-rendered atlas with working links. All domain text is readable when JavaScript is unavailable; only optional selection/copy controls require JavaScript.
- All selection controls are native buttons with clear names and `aria-pressed`. A polite status communicates added/removed/full/error states without moving focus.
- A visible counter says how many pathways are selected and that the limit is three. When full, unselected add buttons become disabled and an explanatory status is announced; selected buttons remain available to remove items.
- A labeled plan region contains an ordered list; after selection, focus stays on the button rather than jumping. Copy failure gives a manual-selection fallback. The clear control remains in the page after clearing so its focus target does not disappear.
- External sources are clearly marked as opening in a new tab; internal product links remain same-tab. Anchor links use native browser behavior.
- No timer, audio, pointer-only graph, color-only status, required open-ended text, or automatic network request is used.

## Accessibility / responsive requirements

- Use landmark headings, one page-level heading, nested cluster headings, article headings, list semantics for steps, and a labeled primary/cluster navigation.
- Keep focus visible on links, buttons, and native summary controls. Preserve logical DOM order; do not trap focus or move it unexpectedly.
- Ensure control targets are comfortably tappable (at least 44 CSS px where practical), text wraps without horizontal scroll, and cards collapse to one column on narrow screens.
- Use meaningful text labels for pathway types; do not rely on color or icon shape alone.
- Keep copy readable and non-judgmental. Avoid dense evidence detail by using native disclosure, while keeping the core boundary visible without opening it.
- Respect system reduced-motion settings; do not add decorative motion or animation as a cue.
- Provide no time pressure. Practice recipes can be adapted, skipped, stopped, or performed away from the screen.
- Use no personally sensitive free-text field, local storage, third-party widget, analytics, or account. Explain the plan's transient state before use.

## Content and safety presentation

- Put `This is not medical advice, diagnosis, or treatment` and the immediate-care boundary near the atlas introduction, not only in a footer.
- The stress prompt is optional; tell users they may skip or stop if it feels uncomfortable. Do not imply grounding removes a real threat.
- Diet and movement suggestions must be adaptable and link to population-level sources without setting an individualized target. Avoid weight/food shame, calorie tracking, and universal prescriptions.
- Social connection practice must not assume a conversation or relationship is safe. No facial-expression/emotion classifier, EQ ranking, or social comparison.
- A task practice result belongs to its own task. No aggregate score or transfer label is shown.

## What to manually test before public release

- Keyboard-only traversal from skip link → header → cluster links → card controls → plan copy/clear, with visible focus and no focus jump.
- Screen-reader reading order for pathway type, headings, instructions, limitations, selected count, and live status; confirm add/remove/full/copy-failure states are announced once, not repeatedly.
- 320 CSS-pixel viewport, 200% and 400% zoom/reflow, touch target sizing, contrast, text spacing, and horizontal scroll.
- Reduced-motion preference, high-contrast/forced-colors behavior, browser clipboard denied, no secure clipboard context, and reload clearing all plan choices.
- Source links and all in-app route/anchor destinations after deployment; test with network disabled to confirm the main atlas remains readable.
- Ask diverse users (including people using screen readers and people with different mobility/sensory/cognitive needs) whether the labels distinguish practice from support and whether the plan feels optional rather than prescriptive.

No actual browser, screen reader, real mobile device, user test, or independent accessibility audit was available during this role pass. Automated tests and source inspection do not replace the checks above.
