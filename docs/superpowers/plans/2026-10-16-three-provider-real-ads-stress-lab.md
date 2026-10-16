# Three-Provider Real Ads Stress Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an isolated, explicitly activated three-provider Real Ads Stress Lab while preserving the existing evidence-first benchmark and score.

**Architecture:** Add pure configuration, session, adapter, and evidence modules under `src/lab/real-ads/`; render their state in a dedicated React view. Exact Adsterra, Monetag, and ExoClick values stay in local/deployment configuration, never Git.

**Tech Stack:** React 18, Vite 6, JavaScript/JSX, Node built-in test runner, browser script/observer APIs.

**Spec:** `docs/superpowers/specs/2026-10-16-real-ads-stress-lab-design.md`

## Global Constraints

- Preserve all 55 benchmark cases and keep live-ad evidence outside core scoring.
- Never load a provider before an explicit Start Session action.
- Never commit publisher tags, zone IDs, Smartlinks, or production-specific scripts.
- Exactly one Popunder and one Social Bar loader may exist per document/session.
- Do not automate clicks, impressions, navigation, reload loops, or anti-adblock circumvention.
- Record no-fill and request failure as non-attributed observations.
- Append only verified facts to `log.md`; update current-system, scoring, operations, requirements, and limitations documents.
- Before each completed task, inspect the staged diff; after validation, commit and push to `main` under the standing user authorization.

## Review Focus

- Absent or malformed configuration must keep the application ad-free (Task 2).
- Re-rendering, retrying Start, or changing levels must not duplicate provider scripts (Task 3).
- Shared Adsterra `atOptions` must be consumed sequentially per uniquely sized banner (Task 4).
- Script/iframe presence without visible occupied layout must not become a rendered creative (Task 5).
- Stop must remove app-owned state and clearly flag irreversible third-party effects (Task 3).

---

### Task 1: ExoClick verification and baseline documentation

**Files:**
- Modify: `index.html`
- Modify: `log.md`
- Modify: `docs/current-system.md`
- Test: built `dist/index.html`

**Interfaces:**
- Produces: exactly one static ExoClick verification meta tag; no ExoClick runtime script.

- [ ] Write a source/build assertion that counts the exact verification meta name once.
- [ ] Add the supplied verification tag immediately before `</head>` in `index.html`.
- [ ] Append a dated `log.md` entry distinguishing local insertion, built output, unverified dashboard acceptance, and unverified production status.
- [ ] Run `npm run typecheck`, `npm run build`, `git diff --check`; inspect `dist/index.html` for exactly one tag.
- [ ] Commit only `index.html`, the affected documentation, and `log.md`; push `main`.

### Task 2: Provider configuration and availability catalog

**Files:**
- Create: `src/lab/real-ads/config.js`
- Create: `test/real-ads-config.test.mjs`
- Modify: `.env.example`
- Modify: `docs/operations-and-deployment.md`

**Interfaces:**
- Produces: `getRealAdsConfig(env)`, `getAvailableFormats(config)`, and `REAL_ADS_LEVELS`.

- [ ] Write tests for blank config, a valid individual placement, six distinct Adsterra banner descriptors, and unavailable ExoClick/Monetag formats.
- [ ] Implement pure configuration validation for Adsterra Popunder, Native, Social Bar, Smartlink, and six individual banners; Monetag approved tags; and future ExoClick zones.
- [ ] Define only blank variable names in `.env.example`; document deployment/local configuration and no-tag default.
- [ ] Run focused tests, then `npm test`, typecheck, build, and diff check; commit and push the task.

### Task 3: Session lifecycle and script ownership

**Files:**
- Create: `src/lab/real-ads/session.js`
- Create: `test/real-ads-session.test.mjs`

**Interfaces:**
- Produces: `createRealAdsSession({ document, window, onEvidence, timeoutMs })` with `start`, `stop`, `reload`, `getState`.

- [ ] Write tests proving default `IDLE`, one Start creates one owned mount/script, duplicate Start is refused, Stop cleans owned nodes/listeners/observers, and irreversible third-party effects require document reload.
- [ ] Implement owned-node attributes, bounded load/error/timeout handlers, MutationObserver and resource observation where exposed, plus `IDLE`, `STARTING`, `ACTIVE`, `STOPPING`, `STOPPED`, `ERROR` states.
- [ ] Run focused and full tests, typecheck, build, diff check; commit and push the task.

### Task 4: Provider adapters and level composition

**Files:**
- Create: `src/lab/real-ads/adsterra.js`
- Create: `src/lab/real-ads/monetag.js`
- Create: `src/lab/real-ads/exoclick.js`
- Create: `test/real-ads-adapters.test.mjs`

**Interfaces:**
- Produces: `createAdsterraPlacements(config, level)`, `createMonetagPlacements(config, level)`, and `createExoClickPlacements(config, level)`.

- [ ] Write adapter tests for six unique Adsterra dimensions, one Popunder/Social Bar maximum, a manual-only Smartlink, unavailable missing configurations, and provider-isolated Level 5 fallback.
- [ ] Implement Adsterra sequential injection: create the individual mount, configure the supplied format's options, append one script, await load/error/timeout, then process the next banner. Keep raw values out of source.
- [ ] Implement Monetag only for supplied approved configuration; implement ExoClick as a verification-aware but zone-unavailable adapter until publisher snippets exist.
- [ ] Map Levels 0–5, allowing a combined maximum mode only for explicitly marked compatible placements; otherwise provide comparable provider-specific modes.
- [ ] Run focused/full tests, typecheck, build, diff check; commit and push the task.

### Task 5: Evidence normalization and score regression

**Files:**
- Create: `src/lab/real-ads/evidence.js`
- Create: `test/real-ads-evidence.test.mjs`
- Modify: `test/scoring.test.mjs`
- Modify: `docs/measurement-and-scoring.md`

**Interfaces:**
- Produces: `normalizeRealAdsObservation(input)` returning independently labelled placement evidence.

- [ ] Write tests for `NOT_STARTED`, `SCRIPT_LOADING`, `SCRIPT_LOADED`, `REAL_CREATIVE_RENDERED`, `EMPTY_OR_NO_FILL`, `REQUEST_FAILED`, `BLOCKED_OR_FILTERED_POSSIBLE`, `PROVIDER_ERROR`, and `INCONCLUSIVE`.
- [ ] Require visible non-zero owned layout plus direct observation before rendered-creative status; retain CSP/DNS/connectivity/no-fill alternatives.
- [ ] Add regression coverage proving live-ad evidence cannot alter benchmark scoring.
- [ ] Run validation gates; commit and push the task.

### Task 6: Real Ads Stress Lab UI

**Files:**
- Modify: `AdBlockerTestLab.jsx`
- Modify: `src/styles.css`
- Create: `test/real-ads-ui.test.mjs`
- Modify: `docs/ui-ux-specification.md`

**Interfaces:**
- Consumes: Tasks 2–5.
- Produces: a dedicated route with Start/Stop/Reset, provider/format/placement selectors, levels, viewport presets, per-placement status, evidence, and diagnostic output.

- [ ] Write state tests for the ad-free default, explicit session start, Level 2 six-slot grid, Level 4 Popunder acknowledgement, and reachable mobile Stop control.
- [ ] Implement the route with Level 0 baseline, Level 1 selected format, Level 2 banner grid, Level 3 native/overlay, Level 4 intrusive opt-in, and Level 5 compatibility-gated high-density layout.
- [ ] Render Smartlink as a labelled manual anchor only; distinguish Live Provider Content from fixtures and show unavailability/no-fill/error directly.
- [ ] Validate local Chromium at `http://localhost:8080` without claiming provider delivery from localhost; run all validation gates; commit and push.

### Task 7: Provider evidence, docs, and release record

**Files:**
- Modify: `docs/current-system.md`
- Modify: `docs/prd.md`
- Modify: `docs/trd.md`
- Modify: `docs/quality-and-release-strategy.md`
- Modify: `docs/known-limitations-and-roadmap.md`
- Modify: `log.md`

**Interfaces:**
- Consumes: implemented behavior and captured browser/provider evidence.

- [ ] Document observed Monetag status, ExoClick verification-versus-zone boundary, all configured Adsterra labels, manual uBlock Lite comparison, and limitations.
- [ ] Append separate evidence entries for each material provider/configuration/test/deployment fact; never log raw tags or unrelated credentials.
- [ ] Run `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, and audit dependencies only if they changed.
- [ ] Perform production checks only after explicit deployment authorization: verify source/tag requests, creative/no-fill/error evidence, and protected/unprotected comparison.
- [ ] Commit and push documentation and captured validation evidence.

## Self-review

The seven tasks cover verification, configuration, lifecycle, all three adapters,
Adsterra's six banner dimensions and shared global ordering, status semantics,
score isolation, UI levels, documentation, log entries, local validation, and
deployment-gated real-creative evidence. No task treats a tag, script, iframe,
or build as proof of creative delivery.
