# Bolt's Performance Journal

## 2026-11-05 - Results Workbench Table Row Memoization
**Learning:** During test batch execution in AdBlocker Test Lab, test completions are streamed into state via requestAnimationFrame flushes, updating `resultsMap` dozens of times during a single diagnostic run. When table rows in `ResultsWorkbenchView` are rendered inline within `.map()`, all 55 test vector rows re-render and re-evaluate layout/waterfall bars on every state update, even though only 1 vector's state changed.
**Action:** Always wrap list/table row items in `React.memo` with discrete scalar/callback props (`test`, `result`, `isSelected`, `onSelect`, `onRunSingle`, `isRunning`, `darkMode`, etc.) so that unaffected rows skip reconciliation during batch execution and interactive filtering.
# Bolt's Journal

Critical performance learnings and architectural patterns.

## 2026-11-08 - Single-Pass Protection Layer Telemetry Analysis & Dead Computation Removal
**Learning:** In AdBlocker Test Lab, `analyzeProtectionLayers` is re-evaluated via `useMemo` on every streamed test completion. Previously, it executed 10 separate array allocations and nested `.filter()` passes across `TEST_REGISTRY` to count cosmetic, controlled path, and exploratory outcomes. Additionally, an unmemoized and unused `terminalResults` array allocation was executing on every render of `App`. Consolidating layer telemetry evaluation into a single linear pass and eliminating dead array allocations reduced execution time by ~82% while lowering GC pressure during batch test runs.
**Action:** Consolidate multi-category filtering over static registries into a single O(N) loop accumulating scalar counters rather than allocating multiple filtered intermediate arrays.

## 2025-05-18 - Benchmark Scoring Pipeline Pass Consolidation
**Learning:** In AdBlocker Test Lab, `calculateBenchmarkScore` is invoked on every single test execution update (via batch/rAF state updates during runs) and recomputed across all categories. Previously, it executed multiple array passes: separate `filter` passes across the test registry for privacy signals and scorable tests, plus a nested `filter` pass for each category (O(C * N)). Pre-indexing categories with Map counters consolidates all categorizations, totals, and privacy signals into a single O(N + C) pass.
**Action:** When working on benchmark scoring and metrics processing pipelines, avoid nested filter operations over registry collections by indexing categories first and calculating in a single pass.
