# Palette's Journal

Critical UX and accessibility learnings and codebase-specific patterns.

## 2026-11-08 - Table Filter Empty States & Keyboard Navigation Landmarks
**Learning:** In diagnostic workbenches with multi-parameter filter matrices (domain sections, metric groups, outcome states, and text query), complex filter combinations often yield 0 results. Without an explicit empty-state row spanning all columns, the table silently collapses to a blank pane, giving keyboard and screen reader users zero feedback on whether the app crashed, is still loading, or filtered everything out. Providing a focused empty state with an actionable "Reset all filters" button gives immediate visual and keyboard recovery. Paired with a skip-to-content landmark link, keyboard navigation across heavy ribbon navigation headers remains fluid and accessible.
**Action:** Always provide an explicit empty state inside data tables with clear explanations and a one-click reset action, and ensure top-level landmark navigation includes accessible skip links.
