# Accessibility plan — initial prototype

**Target:** design and test toward WCAG 2.2 Level AA for the first journey. This is a target, not a conformance claim or legal certification. Use the [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/) and test with real browser/assistive-technology combinations.

## Requirements

### Structure and semantics

- Use semantic landmarks (`header`, labeled `nav`, `main`, section headings, footer) and one clear page-level heading.
- Use links for navigation and buttons for actions; use native form controls with persistent labels and useful instructions.
- Keep DOM and reading order aligned with visual order. Do not expose a canvas-only graph or duplicate decorative nodes to assistive technology.
- Provide an equivalent concept/relationship list. Label relationship types in text.
- Announce the completed task result through a polite status region; do not rely on color, animation, or a chart alone.

### Keyboard, focus, and pointer

- Every action is keyboard operable, with a logical tab order and a visible high-contrast focus indicator.
- Focus is not hidden by sticky headers, dialogs, or scroll containers. After route/dialog changes, focus behavior is deliberate and documented.
- No drag, hover, or gesture-only interaction. Every node selection and task transition has a tap/click/keyboard equivalent.
- Target interactive controls at least 44×44 CSS px where practical; meet the WCAG 2.2 AA minimum target/spacing criterion where applicable.
- Do not put essential help or controls only at the bottom of a long page.

### Vision and motion

- Meet WCAG text contrast requirements: at least 4.5:1 for normal text and 3:1 for large text; ensure meaningful UI boundaries/focus indicators are also distinguishable.
- Do not communicate correctness, difficulty, or relationship type by color alone; pair color with text, shape, or icon labels.
- Support 200% zoom and reflow at narrow widths without horizontal page scrolling for normal content; keep the journey usable at 320 CSS px where the layout permits.
- Respect `prefers-reduced-motion`; avoid flashing, pulsing synapse effects, parallax, auto-advancing content, and decorative animations that compete with reading.
- Use readable line length, typography, and spacing; allow browser text resizing.

### Cognition, learning, and task pacing

- Use short sentences, predictable navigation, one primary action per step, and instructions before starting.
- Make all task timing optional; the first demo is self-paced and has no timed response.
- Let users stop, return, or retry. Explain errors in plain text and preserve entered answers after a correctable validation issue.
- Avoid unnecessary memory burden: keep the current instructions available while the user responds; don't ask users to remember previous form entries.
- Avoid stress-inducing scores, streaks, leaderboards, or “your brain” labels.
- Every timed/ranked game also has a noncompetitive practice route with adjustable/untimed settings where its mechanics permit; disclose event settings before a user joins.
- Competition status, rank changes, and challenge rules are explained in text and do not rely on color, animation, or sound. The noncompetitive path remains first-class.

### Hearing, speech, and permissions

- No audio, speech, microphone, camera, or sound is required in the first slice.
- If voice is introduced later, provide captions/transcript, clear permission rationale, a visible recording state, keyboard controls, and an equivalent non-voice path.

### Responsive and device support

- Verify at narrow phone, large phone, tablet, laptop, and wide desktop widths, plus portrait and landscape.
- Touch targets remain separated; content does not depend on hover; the graph becomes a selected-node view/list on small screens.
- Avoid heavy client-only visuals and use graceful fallback if JavaScript is unavailable or delayed.

## Manual review checklist

- [ ] Complete Home → Explore → Lab → Result → Evidence → back using keyboard only.
- [ ] Inspect focus order, focus appearance, and focus visibility through responsive/sticky states.
- [ ] Test with at least one screen reader on desktop and VoiceOver/TalkBack or equivalent on mobile.
- [ ] Confirm control labels, input instructions, list hiding, and results are announced in a useful order.
- [ ] Test contrast, text zoom, 320px reflow, touch target/spacing, and reduced-motion preference.
- [ ] Verify no state depends on color, sound, animation, drag, a precise reaction time, or a visual-only graph.
- [ ] Audit each game for instructions, focus order, keyboard/touch input, pause/exit, time pressure, reduced motion, and a text alternative; do not assume a shared engine makes every game accessible.
- [ ] Test challenge joining, rules/settings disclosure, result announcements, leaving/resetting, privacy toggles, and friend/leaderboard controls with keyboard and assistive technology.
- [ ] Ask a user with relevant access needs to review when available; automated checks are not a substitute.

## Automated checks

Run an accessibility scanner in component/page tests or browser automation once the app exists. Treat results as signals, not proof of conformance. Keep a manual findings log and record the tested browser, assistive technology, viewport, and build revision in the stage handoff.

## S15 implementation notes (self-review only; manual verification still open)

- Reading options now cover text size, contrast, line spacing, serif face, reduced motion, reading guide, and underlining every link; all are presentation-only and announced once through a live region.
- The saved preference set is applied by an inline pre-paint script, so a returning reader does not experience a layout jump. The script reads one `localStorage` key, wraps everything in `try/catch`, and sets only `data-*` attributes.
- Panel interaction: the trigger exposes `aria-expanded`/`aria-controls`; opening moves focus into the panel; Escape closes it and returns focus to the trigger; a Reset control restores defaults and removes the stored key; storage failures degrade silently for the session.
- New pages share one structural pattern (skip link, breadcrumbs, page purpose from the route registry, one primary action set, visible boundary, and a "where this leads" region), which reduces relearning between areas. Guided paths render all steps in the document with in-page anchors, so they work without JavaScript and remain operable by keyboard, screen reader, or browser find-in-page.
- Search is an interactive enhancement: without JavaScript the page still states its purpose and links to every browsable index; results are ordinary links, and the "closest matches" mode is disclosed in text rather than implied by colour.
- Not yet verified — carried forward as blocking release evidence: real browser/assistive-technology traversal, 320 CSS px reflow and 200–400% zoom, contrast measurement, forced-colours behaviour, target sizes on the new controls, and comprehension testing of the new step structure. Automated tests and source reading do not substitute for these.
