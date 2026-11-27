# DESIGN.md

Brand direction for AdBlocker Test Lab, set by the owner on 2026-11-27. This file is the
source of direction for UI and copy work. `docs/design-rationale.md` records how each
decision was applied.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

## Audience

Everyone, plain first. Everyday people who want to know whether their ad blocker works
come first: every screen opens with a simple answer. Technical detail (test IDs, traces,
filter rules, exports) stays one click away for enthusiasts, filter-list authors, and
developers, never in the way and never removed.

## Personality and voice

Calm and trustworthy, like a careful lab report written for normal people.

- Plain words before technical terms. When a technical term is needed, explain it once.
- Honest about limits. Say what the page cannot see, and say "could not tell" rather than guess.
- Never hype, never alarm. No exclamation marks, no buzzwords, no fear language about privacy.
- Lead with the answer, then the reason, then the detail.

## Palette

Keep ink, paper, and safety orange.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Ink (text, marks) | #182024 / #24373f | #edf2ee | Body text, logo outline, active states |
| Paper (surfaces) | #f4f0e7 page, #fffdf8 card, #ebe5d9 inset | #10191f page, #172129 card, #111a20 inset | Backgrounds |
| Muted text | #536266 | #b3c0c2 | Supporting text |
| Safety orange (one accent) | #c65322 marks, #b84a1c buttons, #a9431c text | #f08a5d text | Starting a run, the blocked-ad mark, focus, links that matter |
| Outcome colours | emerald, amber, rose | same, darker fills | Only for Blocked, Partial, Allowed; always paired with a word or shape |

Orange stays rare: one accent per screen, at the moment that matters.

## Typography

DM Sans for everything people read; DM Mono only for test IDs, timings, and filter rules.
Sentence case everywhere. No uppercase labels with wide tracking.

## Energy, rhythm, and motion

Calm, with a bit more personality.

- **Energy 2 (low end):** quiet, readable layouts, but the score and the verdict get real
  presence: large numbers, a score bar, and the verdict written as a sentence.
- **Rhythm 2:** consistent spacing and components, with sections that vary in composition
  (prose next to lists, wide panels next to narrow ones) rather than repeated card grids.
- **Motion 1:** hover and focus feedback only, plus progress during a run. No looping
  animation. Reduced-motion settings are always respected.

## Identity

- Logo: the owner-supplied shield, flask, and blocked-ad mark (`src/components/LogoMark.jsx`).
- Motif: the orange strike through an ad, used sparingly (logo, active tab underline, score bar
  ends) rather than as decoration.
- No stock illustrations, no gradients, no glow, no decorative badges.
