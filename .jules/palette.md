# Palette's Journal

Critical UX and accessibility learnings and design patterns.

## 2026-11-05 - Filtered Data Table Empty State and Accessible Row Announcements
**Learning:** In data-dense diagnostic interfaces with multi-axis filtering (search query, section, status, group), clearing all rows when no items match creates confusion and makes the UI look blank or broken. Without live region feedback (`aria-live="polite"`), screen reader users are unaware that the count changed to 0. Additionally, in table rows that support selection/inspection and per-row action buttons ("Probe"), rows without `aria-selected` and buttons without scoped `aria-label` context violate accessibility principles (WCAG 2.4.4) by presenting repetitive uncontextualized actions.
**Action:** Always render an in-table empty state spanning `colSpan` with an icon, clear explanation, and a 1-click filter recovery button (`Reset All Filters`). Pair results counters with `aria-live="polite"` and ensure interactive table rows and item-specific action buttons communicate their selection state and item context to assistive technologies.
