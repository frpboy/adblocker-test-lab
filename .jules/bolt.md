# Bolt's Performance Journal

## 2026-11-06 - Protection Layer Analysis Pass Consolidation
**Learning:** In AdBlocker Test Lab, `analyzeProtectionLayers` is memoized against `resultsMap`, which updates dozens of times per diagnostic batch execution. The function was performing 9 independent `.filter()` passes over `TEST_REGISTRY` and sub-arrays to compute cosmetic, controlled-path, and exploratory probe counts, allocating intermediate arrays on every update. Consolidating the count aggregations into a single linear O(N) loop and using `.some()` with early exit for active runs drops evaluation time by ~65% and eliminates intermediate array allocations.
**Action:** When computing layered multi-category telemetry metrics from a test registry and dynamic result map, count matching statuses in a single linear pass rather than cascading multiple array filter passes.

## 2026-11-05 - Results Workbench Table Row Memoization
**Learning:** During test batch execution in AdBlocker Test Lab, test completions are streamed into state via requestAnimationFrame flushes, updating `resultsMap` dozens of times during a single diagnostic run. When table rows in `ResultsWorkbenchView` are rendered inline within `.map()`, all 55 test vector rows re-render and re-evaluate layout/waterfall bars on every state update, even though only 1 vector's state changed.
**Action:** Always wrap list/table row items in `React.memo` with discrete scalar/callback props (`test`, `result`, `isSelected`, `onSelect`, `onRunSingle`, `isRunning`, `darkMode`, etc.) so that unaffected rows skip reconciliation during batch execution and interactive filtering.
# Bolt's Journal

Critical performance learnings and architectural patterns.

## 2025-05-18 - Benchmark Scoring Pipeline Pass Consolidation
**Learning:** In AdBlocker Test Lab, `calculateBenchmarkScore` is invoked on every single test execution update (via batch/rAF state updates during runs) and recomputed across all categories. Previously, it executed multiple array passes: separate `filter` passes across the test registry for privacy signals and scorable tests, plus a nested `filter` pass for each category (O(C * N)). Pre-indexing categories with Map counters consolidates all categorizations, totals, and privacy signals into a single O(N + C) pass.
**Action:** When working on benchmark scoring and metrics processing pipelines, avoid nested filter operations over registry collections by indexing categories first and calculating in a single pass.
