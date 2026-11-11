# Palette's UX & Accessibility Journal

Critical UX learnings, accessibility patterns, and UI design insights.

## 2026-11-06 - Accessible Data Table Empty State & Direct Filter Recovery
**Learning:** In complex diagnostic tables with compound multi-axis filtering (metrics group, outcome status, domain section, and free-text search), over-constraining filter combinations frequently results in an empty table body. Without an explicit empty state, the table collapses or displays a blank space with active sticky headers, leaving keyboard and screen reader users without immediate feedback on why results vanished.
**Action:** Always provide an explicit empty state row (`<tr role="status" aria-live="polite"><td colSpan={columnCount}>...</td></tr>`) with descriptive explanation text and a prominent "Reset all filters" button so users can recover the full dataset in a single keyboard/pointer interaction.
