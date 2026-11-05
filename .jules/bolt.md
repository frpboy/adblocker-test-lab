# Bolt's Performance Journal

## 2026-11-05 - Results Workbench Table Row Memoization
**Learning:** During test batch execution in AdBlocker Test Lab, test completions are streamed into state via requestAnimationFrame flushes, updating `resultsMap` dozens of times during a single diagnostic run. When table rows in `ResultsWorkbenchView` are rendered inline within `.map()`, all 55 test vector rows re-render and re-evaluate layout/waterfall bars on every state update, even though only 1 vector's state changed.
**Action:** Always wrap list/table row items in `React.memo` with discrete scalar/callback props (`test`, `result`, `isSelected`, `onSelect`, `onRunSingle`, `isRunning`, `darkMode`, etc.) so that unaffected rows skip reconciliation during batch execution and interactive filtering.
