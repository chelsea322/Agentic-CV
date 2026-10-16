# UX evaluation: Agentic CV (pre-redesign, commit 7e070d4)

Method: read the markup and CSS, ran the site locally, captured screenshots at 375, 768 and 1280px, computed contrast ratios for the design tokens, and walked through the page by keyboard logic (tab order, focus styles, ARIA). Not tested with a real screen reader.

Severity: **High** blocks or seriously hurts a task, **Med** noticeable friction or an AA risk, **Low** polish.

## Findings

| # | Sev | Area | Finding | Resolution in this branch |
|---|-----|------|---------|---------------------------|
| 1 | High | Contrast | `.composer-note` (11px mono) used bone at 48% opacity: about 4.2:1, and the placeholder at 42% about 3.4:1. Both fail WCAG AA for small text. | All text now uses solid tokens with at least 4.5:1 in both themes; no text relies on low-alpha white. |
| 2 | High | Mobile | At 375px the input placeholder ("Ask about experience, process, or perspective...") was truncated mid-word, so the main call to action read as broken. | Shorter placeholder, input given priority width, SEND button shrinks on narrow screens. |
| 3 | Med | Accessibility | The whole chat history was `aria-live="polite"`, so a screen reader would re-announce the growing text while streaming. | Chat is now `role="log"` and `aria-busy` while streaming; a separate visually hidden status announces "typing". |
| 4 | Med | Accessibility | The pending ("typing") message was `aria-hidden`, so non-sighted users got no feedback after sending. | Added a `role="status"` announcement. |
| 5 | Med | Accessibility | No skip link; the first tab stop is the logo. | Added a skip link to the main content. |
| 6 | Med | Hierarchy | 11px, widely tracked, uppercase mono was used for nearly all secondary text (eyebrows, notes, dates, suggestion toggle). Legible only with effort and heavy on a dark background. | Mono is reserved for small labels at 12px+; body and helper copy use the sans face at 14-16px. |
| 7 | Med | Focus | A global `:focus-visible` ring existed, but the composer input suppressed its own outline and relied on a decorative orbiting beam, which is not a reliable focus indicator under reduced motion. | One consistent 2px outline plus offset ring everywhere, including a focus-within ring on the composer that does not depend on animation. |
| 8 | Med | Mobile | The CV view was a long static scroll with no structure for scanning; dates and organisations were tiny mono text stacked under every title. | Entries are collapsible with a short summary visible, a timeline rail, and a one-line meta row. |
| 9 | Low | Mobile | Header: logo text, mode switch and (new) theme toggle cannot fit at 375px. | Name text collapses to the monogram under 480px. |
| 10 | Low | Interaction | The suggestion list was hidden behind a toggle, so first-time visitors saw an empty prompt with no examples. | Kept as progressive disclosure (it keeps the hero calm) but the toggle is larger and clearer ("A few places to begin"); suggestions animate in. |
| 11 | Low | Persona | UI labels referred to Chelsea in the third person ("CHELSEA / AI", "Ask about Chelsea's experience"), which clashes with a chat meant to feel like a conversation with her, and did not say plainly that it is an AI. | First-person copy; author label "CHELSEA (AI)"; a note under the composer states it is an AI version of her. |
| 12 | Low | Motion | Reduced motion was handled, but the flashlight, grain and blinds were purely decorative and costly (large filtered layers, constant animation). | Replaced by a light canvas aurora (pauses when hidden, caps frame rate, static frame under reduced motion). |
| 13 | Low | Contrast | The ember accent (#d4462e) on near-black is 4.55:1: passable for large text, tight for small. | New accent palette checked at 4.5:1 or better for text use. |

## What was already good

- Single clear task on the first screen; strong typographic hierarchy in the hero.
- `inert` and `aria-hidden` used correctly on the inactive mode.
- Mode choice persisted; tap targets of at least 44px on the send button.
- No horizontal overflow at 375, 768 or 1280px.

## Known limits

- Dev-only Next.js badge appears over the page when run with `next dev`; it does not ship in production.
- Contrast was computed from tokens, not measured over the animated glow; glows are capped low in opacity and kept away from text columns.
