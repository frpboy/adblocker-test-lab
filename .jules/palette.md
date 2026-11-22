# Palette's Journal

Critical UX and accessibility learnings and patterns for AdBlocker Test Lab.

## 2026-11-06 - Test Vector Workbench Empty State & Keyboard Accessibility
**Learning:** In table-based diagnostic workbenches with multi-faceted filtering (search queries, metric group pills, section dropdown, outcome statuses), filtering down to 0 results previously caused the table body to render empty. Users who typed an unmatched query were left without clear context or an immediate way to reset their view. Additionally, interactive `tr` elements with `tabIndex={0}` and keyboard navigation lacked `focus-visible` styling, and icon/action buttons like "Probe" lacked descriptive context for screen reader users.
**Action:** Always provide an explicit empty state spanning table columns (`colSpan`) with a direct reset action (`Reset All Filters`). Ensure keyboard-navigable rows have `focus-visible:ring-inset` styling, and include full vector identifiers in action button `aria-label` attributes (`Probe ${test.id}: ${test.name}`).
