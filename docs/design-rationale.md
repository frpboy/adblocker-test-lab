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

## Invariants

This redesign does not change the test registry, executor, score eligibility, result-state meanings, reports, provider boundary, or the distinction between direct observation and inference.
