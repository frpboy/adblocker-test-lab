# Palette's Journal

Critical UX and accessibility learnings and codebase-specific patterns.

## 2026-11-08 - Table Filter Zero-State Recovery
**Learning:** In dense diagnostic interfaces like AdBlocker Test Lab's Results Workbench, users actively filter 55+ test vectors across multiple dimensions (status, category, text search). When filters match 0 results, an empty table body without explanatory messaging or action causes disorientation, as users cannot easily discern whether tests were cleared or merely filtered out.
**Action:** Always render an accessible `colSpan` empty-state row with an explanatory message and a prominent one-click "Reset all filters" button to allow users to quickly recover without having to manually identify and toggle every individual filter control.
