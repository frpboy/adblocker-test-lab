# Design Rationale

## Status

Draft without direction. The repository has no owner-authored visual brief, so this redesign uses the conservative design read below and remains easy to revise when a product direction is supplied.

## Design read

Reading this as: an evidence-focused browser diagnostic workspace for people deciding what their browser visibly does, in a calm editorial laboratory style, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

## Audit and fixes

| Finding | Fix |
| --- | --- |
| The dark technical shell made every control, telemetry value, and test cell compete for attention. | Light becomes the default for readable evidence review; dark mode remains a working preference. |
| The first action competed with dense telemetry and equal-weight controls. | The Overview now leads with a focused scan choice and puts scope in a separate, readable evidence panel. |
| Primary and advanced navigation crowded one compact row. | Navigation uses larger touch targets, wraps by content, and reserves dense fixture detail for wide screens. |
| Blue was used both for navigation and the primary run action. | Safety orange is reserved for beginning a diagnostic run and active keyboard focus; semantic outcome colors retain their result meaning. |

## Major decisions

- **Ink, paper, and safety orange:** paper surfaces make limitations and long evidence readable; orange is limited to the action that starts work and focus visibility.
- **DM Sans with small monospace details:** the sans face carries prose and hierarchy, while the existing mono face remains limited to identifiers, timings, and system context.
- **No decorative imagery or gradients:** the product's actual evidence and test index are the visual material, avoiding unsupported visual claims.
- **Asymmetric Overview:** the action and the selected test scope answer different user questions, so they use different compositions rather than identical cards.
- **Minimal motion:** transitions only clarify hover and focus; no looping movement is used because diagnostics should read as stable evidence.

## Plain-language pass (2026-11-27)

| Decision | Reason |
| --- | --- |
| Shield, flask and blocked-ad logo (`src/components/LogoMark.jsx`, `public/favicon.svg`) | Owner-supplied artwork redrawn in the site palette: shield for protection, flask for testing, and a crossed-out ad box as the sample. Ink outlines; safety orange only on the blocked ad (3.6:1 or better against both backgrounds). |
| Plain test names (`src/lab/plain-language.js`) | Registry names stay for reports and search; visitors read what each test checks in everyday words. A unit test keeps the map in sync with all 55 IDs. |
| Result words kept (Blocked, Partial, Allowed, Inconclusive) in title case, with a one-line legend | The UI/UX spec requires one consistent vocabulary; the legend gives each word a single meaning. |
| Coverage before score, and a "Partial result" verdict under 50% coverage | A score from 4 of 35 tests must not read as a final verdict. |
| No uppercase monospace labels, no text under 12px | Mono stays for test IDs and timings only, per the existing type decision. |
| Removed eyebrow pill, three-step cards, sparkle icons, and the decorative "Sandbox isolated" badge | None carried information; the Overview now states what a page can and cannot see instead. |
| Neutral grey for non-outcome statuses; sky and purple removed | Colour means stopped / partial / got through. Everything else is neutral so it never reads as a verdict. |
| `dark` class applied on the app root, plus a global reduced-motion rule | Tailwind uses class-based dark mode, but the class was never set, so every `dark:` style was dead. |
| Control edges #857d6e (light) / #74909e (dark), set in `src/styles.css` | WCAG 1.4.11: inputs, selects, and outlined buttons need 3:1 against their surface. The old #c9c1b2 edge measured 1.76:1. Card hairlines stay light because they separate, not identify. |
| Primary button fill #b84a1c instead of #c65322 | White text on #c65322 measured exactly 4.50:1; #b84a1c gives 5.21:1. The original orange stays for strokes, focus, and the logo. |
| Result grid cells carry a shape (✓ ◐ ✕ ● ? ·) and a key | Status no longer depends on seeing colour. |
| Skip link, `role="alert"` error toasts, honest copy and download feedback | Keyboard users can bypass the header; failures are announced and never reported as success. |
| Developer material (self-checks, reference server code) moved behind "For developers" | Kept for audit, out of the way for everyone else. The self-check count is computed, not hard-coded. |

## Invariants

This redesign does not change the test registry, executor, score eligibility, result-state meanings, reports, provider boundary, or the distinction between direct observation and inference.
