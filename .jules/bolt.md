# Bolt's Journal

Critical performance learnings and architectural patterns.

## 2025-05-18 - Benchmark Scoring Pipeline Pass Consolidation
**Learning:** In AdBlocker Test Lab, `calculateBenchmarkScore` is invoked on every single test execution update (via batch/rAF state updates during runs) and recomputed across all categories. Previously, it executed multiple array passes: separate `filter` passes across the test registry for privacy signals and scorable tests, plus a nested `filter` pass for each category (O(C * N)). Pre-indexing categories with Map counters consolidates all categorizations, totals, and privacy signals into a single O(N + C) pass.
**Action:** When working on benchmark scoring and metrics processing pipelines, avoid nested filter operations over registry collections by indexing categories first and calculating in a single pass.
