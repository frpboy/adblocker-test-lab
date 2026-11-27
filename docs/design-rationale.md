# Design Rationale

## Status

Direction set by the owner on 2026-11-27 and recorded in [`DESIGN.md`](../DESIGN.md): everyone, plain first; calm and trustworthy voice; ink, paper, and safety orange; calm with a bit more personality (ENERGY 2 / RHYTHM 2 / MOTION 1). Earlier entries below were made as a draft without direction and remain where they agree with it.

## Design read

Reading this as: an evidence-focused browser diagnostic for everyone, plain first, in a calm and trustworthy editorial laboratory style, dial ENERGY 2 / RHYTHM 2 / MOTION 1 (per `DESIGN.md`).

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
| "What happened in this run" panel (`src/components/RunSummary.jsx`, `src/lab/run-summary.js`) | After every run, a Simple view (verdict, three or four plain sentences, next steps) and a Detailed view (every test grouped as blocked, partial, got through, or could not be measured, with the reason). Announced once to screen readers. Lists cover the last run; the score covers all results so far. |
| Landscape share card (`src/lab/share-card.js`, `src/components/ShareResultsDialog.jsx`) | 1200 x 630 PNG drawn on canvas: logo, score with bar, verdict, coverage, counts with shapes, date, and a QR code plus `lab.frpboy.in`. Partial results always say "Partial result". The card holds no device or user data. Share uses the system share sheet (with the image where the browser supports files), with Download image and Copy text and link as fallbacks. QR generation uses the `qrcode` package, pinned. |
| Developer material (self-checks, reference server code) moved behind "For developers" | Kept for audit, out of the way for everyone else. The self-check count is computed, not hard-coded. |

## Help page and brand brief (2026-11-27)

| Decision | Reason |
| --- | --- |
| Help tab at `/help` (`src/components/HelpView.jsx`, `src/lab/help-content.js`) | Plain answers to the questions this site actually raises: low scores with a blocker, partial results, unmeasured tests, why the blocker cannot be named, what the test contacts, where results are stored, what the share card holds. Native disclosures for keyboard and screen readers; topic links on the left on wide screens. A test keeps every action pointed at a real tab and the copy free of em dashes and exclamation marks. |
| Score bar on Results, larger score and verdict | DESIGN.md asks for real presence for the score and verdict. Ink fill (9:1 or better against its track), orange end mark as the brand motif, exposed as a `meter` to assistive technology. |
| Counts carry the same shapes as the share card | One visual language for outcomes across the screen and the card. |

## Legal pages and self-hosted fonts (2026-11-27)

| Decision | Reason |
| --- | --- |
| Privacy Policy at `/privacy` and Terms of Use at `/terms` (`src/components/LegalView.jsx`, `src/lab/legal-content.js`) | Owner-supplied operator name, contact, and governing law (India). Written in the DESIGN.md voice: an "In short" summary first, then a contents list and numbered sections. Every data flow stated was checked against the code; a test keeps the external-server list equal to the registry. |
| Single-row footer (`src/components/SiteFooter.jsx`) | Help, Privacy Policy, Terms of Use, and the Apache-2.0 source link are real destinations; no template columns. |
| Fonts bundled from `@fontsource` | Removes a request to Google on every page load and keeps the Privacy Policy simpler. DM Mono is now actually used for `font-mono`, as DESIGN.md intended. |

## Invariants

This redesign does not change the test registry, executor, score eligibility, result-state meanings, reports, provider boundary, or the distinction between direct observation and inference.
