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

## 2026-10-15 — Mobile navigation correction

- Mobile review found that the advanced controls and 55-cell index consumed too much first-viewport space.
- Replaced the always-visible mobile advanced controls with a labelled `More tools` disclosure and replaced the mobile grid with a labelled route to the complete catalog.
- Validation: `npm run typecheck`, `npm run build`, and `git diff --check` passed. Browser inspection at a 390px viewport verified both the collapsed state and expanded `More tools` state.
- Updated the document theme color to match the default light evidence workspace.
- Deployment status: no deployment was performed.

## 2026-10-15 — Production provider verification follow-up

- Direct production inspection confirmed `https://lab.frpboy.in/` serves the v4.1 evidence workspace, the Monetag verification meta tag, and the approved AdSense loader.
- Direct Monetag dashboard inspection now marks `lab.frpboy.in` as `Verified`.
- The dashboard still reports a zone-installation error for the configured live zone. No zone script was added because the repository policy requires explicit provider approval and a documented isolated exploratory-mode design before mounting live-ad code.

## 2026-10-15 — Browser validation, module extraction, and local fixture protocol

- Baseline: local `main` and `origin/main` both resolved to `3c4ef61315edddcff727548576fdd9efa26a79c2` before this change.
- Production validation: `https://lab.frpboy.in/` rendered v4.1.0 at 1920x873 and showed the six Quick Scan IDs. A 390x844 capture showed labelled `More tools`, `Browse all 55 test records`, and no horizontal overflow (`scrollWidth=375`, `clientWidth=375`). Captured Chrome user agent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36`. Desktop and 390px screenshots were captured through browser automation during this validation.
- Deployment evidence: the Vercel production deployment `3b3FBXfy1PuRAsnz3RLWjj4r6RoG` was Ready and identified source commit `8dd638df37f78ec28ea71c5f9afdd26f4a94dc22`; it is behind local/current `main` at `3c4ef61`. Production therefore cannot be claimed to be deployed from latest `main`.
- Local interaction evidence at `http://127.0.0.1:8080`: empty Results view showed an unavailable score with zero completed results; Quick Scan completed six cases and showed a 0/100 score from 6/35 eligible results in this Chrome profile; DSP-01 detail showed all six trace stages. The Full Diagnostic run reached 51 completed cases during observation. Pause/cancel controls and escaped-HTML download could not be conclusively exercised because the run completed before the control action was delivered and the browser download wait timed out; no pass claim is made for those paths.
- Change: added standard-library Node tests, extracted the active score-display and HTML-export seams to `src/lab/`, and added `scripts/fixture-service.mjs`. The fixture service records and verifies an opaque run/test receipt in a local JSON file; it is development-only and not a deployed multi-instance fixture backend.
- Validation: `npm test` passed (3 tests); `npm run typecheck` passed; `npm run build` passed (Vite 6.4.4, `dist/assets/index-COA8O12O.js`); `git diff --check` passed.
- Deployment status: no commit, push, deployment, provider action, or production fixture activation was performed.

## 2026-10-15 — In-app audit follow-up

- Browser validation at `http://127.0.0.1:8080` opened the Audit suite after the module extraction. The visible suite summary reported `15 / 15` passed assertions.
- The local `Export Escaped HTML` action displayed the `Exported adblocker-test-lab-v4.1.html` success toast. The automation download-event wait remains unavailable, so no downloaded-file artifact path is recorded.
- Deployment status: no deployment was performed.

## 2026-10-16 — Technical SEO foundations

- Added a truthful canonical root URL, descriptive title and description, crawl directive, Open Graph/Twitter card metadata, and `WebApplication` structured data to the Vite document shell.
- Added public `robots.txt` and `sitemap.xml` for the single public root route; documented post-deployment Search Console submission and the ranking/indexing boundary.
- No keyword stuffing, fake reviews, provider changes, tracking, or misleading structured data were added.
- Validation and deployment status: pending final typecheck, build, diff check, and local browser validation; no deployment performed.

## 2026-10-16 — Technical SEO validation follow-up

- `npm run typecheck` and `npm run build` passed; `git diff --check` completed without diff errors. The production build contains the canonical link, Open Graph/Twitter metadata, `WebApplication` JSON-LD, `robots.txt`, and `sitemap.xml`.
- Browser validation at `http://127.0.0.1:8080` confirmed the updated title, description, canonical URL, robots directive, JSON-LD, and rendered Overview copy.
- Deployment status: no commit, push, sitemap submission, Search Console action, or deployment was performed.

## 2026-10-16 - ExoClick ownership verification baseline

- Added exactly one ExoClick ownership-verification meta tag to the document head. It is static verification metadata only: no ExoClick runtime loader, zone, provider request, or benchmark scoring behavior was added.
- Added a built-document test that requires one tag with the expected ownership value; the test initially failed against the prior build (zero matching tags), then passed after the change.
- Validation: `npm run typecheck`, `npm run build`, focused document-head test, full `npm test` (4 passing tests), and `git diff --check` passed. Local Chromium at `http://127.0.0.1:8080` rendered the Overview; its document title remained correct.
- Dashboard acceptance and production availability remain unverified. No provider request, creative, no-fill result, or filtering conclusion is implied by this metadata.

## 2026-10-16 - Real Ads Stress Lab configuration boundary

- Added a pure configuration catalog for six optional Adsterra banner sizes, optional Adsterra Native/Popunder/Social Bar/Smartlink formats, and optional Monetag and ExoClick format lists. It accepts only valid HTTPS values and leaves malformed or absent values unavailable.
- Added blank `VITE_REAL_ADS_*` variable names to `.env.example` and deployment guidance. No provider tag, zone ID, publisher identifier, Smartlink, or live script was committed.
- Validation: focused configuration tests cover blank configuration, an individual banner, six distinct banners, and unavailable malformed Monetag/ExoClick input. Live-provider delivery remains unverified and no app UI starts a provider session yet.

## 2026-10-16 - Real Ads Stress Lab session ownership

- Added an explicit client-side session lifecycle with `IDLE`, `STARTING`, `ACTIVE`, `STOPPING`, `STOPPED`, and `ERROR` states. It creates only app-owned mount/script nodes after a caller invokes Start, refuses duplicate Starts, and removes owned nodes/listeners/observers on Stop.
- Popunder Stop responses flag that an already-triggered third-party effect can require a document reload; the implementation never clicks, reloads, or generates impressions automatically.
- Validation: focused lifecycle tests cover idle/start/duplicate-start, cleanup and popunder reload flag, and replacement reload. No provider configuration was supplied and no live script was loaded during this validation.

## 2026-10-16 - Real Ads Stress Lab provider adapters

- Added inert adapters for Adsterra, Monetag, and ExoClick. Adsterra exposes level-based banner/native/social/popunder composition, labels Smartlinks as manual-only, and excludes Popunder from compatible maximum mode. Monetag and ExoClick return no placements until valid configured formats exist.
- Added sequential Adsterra option consumption so one supplied options object is set immediately before its corresponding placement start and removed afterward. The adapter never appends a script itself.
- Validation: focused adapter tests cover six distinct banners, popunder exclusion, manual Smartlink handling, empty provider fallback, and sequential options. No live provider request or creative was observed.

## 2026-10-16 - Real Ads Stress Lab evidence normalization

- Added independent statuses for not-started, script-loading, script-loaded, rendered creative, no-fill, request failure, possible filtering, provider error, and inconclusive observations. A rendered-creative label now requires a direct visible-layout observation.
- Every normalized live-ad observation explicitly remains ineligible for the authoritative benchmark score and privacy-signal index.
- Validation: focused evidence tests cover every status and reject hidden/indirect rendered claims. No provider creative was observed.

## 2026-10-16 - Real Ads Stress Lab local UI and Adsterra configuration

- Change: added an explicit Real Ads Stress Lab settings view with Level 0-5, provider selection, Start/Stop/Clear controls, planned-placement disclosure, and independent placement evidence. The default is Level 0 with no provider initialization.
- Provider and formats: local ignored configuration now contains the owner-supplied Adsterra six-banner inventory (160x300, 160x600, 300x250, 320x50, 468x60, 728x90), Native Banner, Popunder, Social Bar, and manual Smartlink. ExoClick has verification metadata only; Monetag has no approved live tag configured.
- Configuration status: provider values are confined to ignored `.env.local`; no provider tag, zone identifier, Smartlink, or production value was added to tracked files. Banner loading is sequential around the shared `atOptions` value; Popunder remains Level-4 opt-in and Smartlink remains manual.
- Verification performed: `npm test` passed (24 tests), `npm run typecheck` passed, `npm run build` passed, and local Chromium rendered the Lab control surface with zero configured formats before the development server reloads its ignored environment file.
- Observed results: no live session was started by automation. Therefore no provider request, impression, no-fill result, creative, uBlock Lite comparison, or provider-attributed failure is recorded.
- Errors and limitations: actual delivery requires a Vite development-server restart or an explicitly configured deployment environment, then a user-initiated session on the approved host. A loaded script remains insufficient evidence of a rendered creative.
- Deployment status: no deployment, account change, dashboard action, commit, or push was performed for this local configuration work.

## 2026-10-16 - Real Ads Stress Lab configuration refresh observation

- Verification performed: after the ignored local configuration was written, the existing Vite server at `http://127.0.0.1:8080` rendered the Real Ads Stress Lab with `10` available configured formats while Level 0 remained selected and Start Session remained disabled.
- Observed results: this confirms configuration discovery only. No provider level was started, no script was intentionally requested, and no creative/no-fill/blocking conclusion is recorded.
- Errors and limitations: an attempted automation-only select action used an unsupported selector syntax and did not alter the page state. The user-owned Vite process was not stopped or restarted.

## 2026-10-16 - Real Ads Stress Lab comparison controls

- Change: added explicit individual-format and comparison-viewport controls to the Real Ads Stress Lab. A selected viewport is evidence metadata only; it does not alter the visitor's browser dimensions. Placement evidence now preserves timestamp, format, dimensions, and viewport while remaining benchmark-ineligible.
- Verification performed: added a focused evidence-context test; `npm test` passed with 25 tests, `npm run typecheck` passed, `npm run build` passed, and `git diff --check` completed without diff errors.
- Observed results: no provider session was started during validation. No provider request, creative, no-fill, failure attribution, or uBlock Lite comparison is recorded.
- Deployment status: no deployment, commit, push, dashboard action, click, reload, or impression generation was performed.

## 2026-10-16 - User-observed Adsterra live-delivery evidence

- Observed result: user-provided Chromium evidence at local `localhost:8080` shows the Real Ads Stress Lab reporting `SCRIPT_LOADING` and `SCRIPT_LOADED` for supplied Adsterra banner, Native Banner, and Social Bar placements, with multiple visible third-party ad creatives in the page and an on-screen Social Bar creative.
- Attribution boundary: this is evidence that Adsterra delivery occurred in that local browser state; it does not establish a production result, a fill guarantee, or any conclusion about uBlock Lite because the screenshot is an unprotected-state observation only.
- Provider status: ExoClick still has ownership-verification metadata but no supplied zone snippet. Monetag still has no configured approved live tag. Their absence from the shown session is a configuration gap, not evidence that either provider was filtered or returned no-fill.

## 2026-10-16 - Real Ads Stress Lab primary navigation, placement stage, and isolated loader

- Primary navigation: promoted Real Ads Stress Lab (`real-ads`) directly into the application's primary top-level ribbon navigation alongside the Benchmark, Filter Analyzer, and Settings tabs, with its own dedicated route and icon (`Zap`). Removed it from nested settings sub-tabs to ensure exactly one authoritative route.
- Placement stage: created an explicit, visible, dimension-locked Ad Placement Stage within `RealAdsStressLab.jsx`. All six configured Adsterra banner dimensions (728x90 Leaderboard, 468x60 Banner, 300x250 Medium Rectangle, 160x600 Wide Skyscraper, 160x300 Half Skyscraper, 320x50 Mobile Leaderboard), a dedicated Native Banner multi-card container, and status cards for Social Bar, Popunder, and manual Smartlink have reserved layout targets with real-time status badges.
- Provider loader correction: updated `session.js` to support mounting synchronous Adsterra banner snippets inside isolated provider iframes within the designated target container. Each iframe encapsulates `atOptions` and script execution, preventing global scope collisions between banners, preventing parser-stream disruption, and ensuring clean teardown without document pollution or DOM leaks.
- Sandbox containment: moved the hidden test fixture sandbox in `AdBlockerTestLab.jsx` out of the top navigation bar into a strictly-contained, off-screen root container, preventing fixture flashes and DOM leakage into unrelated app sections.
- Evidence classification: enhanced `src/lab/real-ads/evidence.js` with `inspectPlacementEvidence` to evaluate real rendered creative dimensions and frames rather than passing unconditional false visibility. Accurately distinguishes `SCRIPT_LOADING`, `SCRIPT_LOADED`, `REAL_CREATIVE_RENDERED` (requiring verified positive layout dimensions), `EMPTY_OR_NO_FILL`, `REQUEST_FAILED`, `BLOCKED_OR_FILTERED_POSSIBLE`, `PROVIDER_ERROR`, and `INCONCLUSIVE`. All live-ad evidence remains strictly outside the authoritative 55-vector benchmark score.
- Teardown & session safety: implemented unmount cleanup in `useEffect` and duplicate-start prevention via active refs. Stop Session disposes of all provider iframes and scripts, resets slot statuses, and alerts if an active Popunder requires a document reload.
- Tests and verification executed:
  - `npm test` executed and passed (29 unit tests passing across all test suites, including new tests for isolated provider iframe mounting and evidence inspection).
  - `npm run typecheck` executed and passed with 0 errors.
  - `npm run build` executed and passed (Vite production bundle built cleanly).
  - `git diff --check` passed with 0 whitespace issues.
- Observed local behavior: navigation ribbon cleanly switches to Real Ads Stress Lab; placement stage renders organized, dimension-locked slots awaiting session start; no automated network requests or impressions occur until the user explicitly clicks Start Session.
- Provider limitations: Adsterra remains the only provider with local live-delivery configuration; ExoClick has verification metadata only, and Monetag has no approved live tag configured.
- Deployment status: no deployment, commit, push, dashboard modification, or live credential creation was performed.
