# Palette's Journal

Critical UX and accessibility learnings and patterns for AdBlocker Test Lab.

## 2026-11-05 - Contextual ARIA Labels and Live Status Announcements for Copy Actions
**Learning:** In technical workbench and diagnostic interfaces, action buttons like "Copy Rule" often operate on a selected vector or data item that changes dynamically based on selection. A generic "Copy Rule" button lacks context for screen reader users and fails to announce clipboard success when the visual state changes transiently from "Copy Rule" to "Copied!".
**Action:** Always provide a contextual `aria-label` specifying the target item (e.g., `Copy filter rule for ${test.id}`), mark decorative icons as `aria-hidden="true"`, and include an `aria-live="polite"` element with `role="status"` and `className="sr-only"` so assistive technology users receive immediate confirmation when copying succeeds.
