# Engineering Log

This is an append-only record of repository changes and their verification. Add a new dated entry for each material change; do not rewrite earlier entries. Record only commands and outcomes that were actually observed.

## 2026-10-15 — Evidence workspace visual redesign

- Reworked the application shell, primary navigation, test index, first-run overview, run selection, and results summary into a restrained evidence workspace without changing registry, execution, scoring, report, or provider behavior.
- Made the readable light theme the default while preserving the existing working theme toggle; safety orange is reserved for run actions and keyboard focus, and result colors remain semantic.
- Added `docs/design-rationale.md` with the UI audit, design read, decision reasons, and explicit draft-without-direction status.
- Validation: `npm run typecheck` and `npm run build` passed; `git diff --check` completed without diff errors. Contrast checks passed for body text, muted text, the orange action color, and dark-mode foreground pairs.
- Browser validation: a user-owned Vite server already held port 8080. Browser automation timed out while attaching to that session, so no rendered local UI claim is recorded for this change.
- Deployment status: no deployment was performed. Current production remains stale and provider verification cannot be resolved from the local source until the current build is deployed to the exact verified host.

## 2026-10-15 — Integration readiness

- Verified the complete `feature/simplified-first-run` branch before integration.
- Validation: `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Branch inventory: only `main` and `feature/simplified-first-run` existed locally/remotely; no additional worktrees or unrelated branch histories required merging.
- Integration: merged into `main` as `03c77a5 Merge feature/simplified-first-run` and pushed to `origin/main`.

## 2026-10-15 — Approved provider metadata and loader

- Added the Monetag ownership-verification meta tag to `index.html`.
- Added the operator-approved asynchronous Google AdSense loader to `index.html`.
- Documented that the loader is third-party/exploratory and excluded from scoring, privacy-signal, and attribution results.
- Validation: `npm run build` passed; the generated `dist/index.html` was confirmed to contain the AdSense loader.
- Git commit: `24415c5 Add approved AdSense loader` on `feature/simplified-first-run`.
- Deployment status: not pushed, merged, or deployed. The deployed `https://lab.frpboy.in/` page was observed without the Monetag verification meta tag before this local change is deployed.

## 2026-10-15 — First-run UX simplification

- Added an Overview-first experience with primary navigation for Overview, Run a Test, Results, Learn & Methodology, and Settings.
- Added Quick Scan using real registry cases `DSP-01`, `TPA-01`, `TPA-05`, `TRK-01`, `INT-03`, and `AAB-01`.
- Full Diagnostic uses the full 55-case `TEST_REGISTRY`; both routes use the existing batch runner and route to Results.
- Kept catalog, analysis/exports, score configuration, Monetag chamber, audit suite, and diagnostics reachable under Advanced Tools.
- Validation: `npm run typecheck` and `npm run build` passed; Chromium local validation rendered Overview, completed Quick Scan, routed to Results, and showed no failed in-app audit assertions.
- Git commits: `5a000c1 Refactor app navigation and enhance first-run experience`; `196ac5b Document simplified first-run flow`.

## 2026-10-15 — v4.1 registry integrity repair

- Integrated the v4.1 lab implementation and reconciled the registry/UI/verification counts to 55 total cases: 35 core ad/tracker-blocking cases, 9 privacy signals, and 11 exploratory probes.
- Kept privacy signals and exploratory probes outside the authoritative score.
- Validation: typecheck, production build, dependency audit (`0 vulnerabilities`), Chromium smoke test, and all 15 in-app assertions passed.
- Git commit: `d5d1e15 Update lab to v4.1 implementation`.

## Entry template

## YYYY-MM-DD — Short change title

- Change:
- Files:
- Verification:
- Deployment status:
- Follow-up / known limitation:

## 2026-10-15 — Evidence workspace browser follow-up

- Local Vite validation at `http://127.0.0.1:8080` rendered the redesigned Overview with the 55-case index and all six Quick Scan IDs.
- Verified primary navigation from Overview to Methodology and back, plus light and dark theme rendering.
- No diagnostic run was started during this UI validation; registry, result, and score evidence remain untouched.
- Deployment status: no deployment or provider re-verification was performed.
