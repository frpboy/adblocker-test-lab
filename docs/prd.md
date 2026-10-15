# Product Requirements Document

## Product summary

AdBlocker Test Lab is an evidence-focused browser diagnostics product. A visitor runs a selection of tests and receives observable results about ad-resource patterns, trackers, cosmetic filtering, privacy signals, popups, and network-loading behavior. The product must show evidence and limitations, not invent results or claim to identify an installed blocker.

The implemented product is a client-side Vite/React single-page application with a 55-case registry: 35 core blocking cases, 9 privacy signals, and 11 exploratory probes. The target product adds reliable controlled fixtures, stronger automated validation, and an optional approved live-ad exploratory mode without weakening the benchmark's evidence standards.

## Problem

People cannot easily tell what their browser privacy configuration blocks, hides, permits, or leaves unresolved. Existing tools often reduce a complicated set of browser, extension, network, DNS, policy, and availability conditions to a single unsupported claim. This product must make the observation and its uncertainty visible.

## Users

| User | Need | Product response |
| --- | --- | --- |
| Privacy-conscious visitor | Understand whether common ad/tracker patterns are visibly affected | Run a benchmark, see per-test evidence, and export results |
| Technical reviewer | Inspect methodology and avoid false attribution | Read test metadata, controls, limitations, alternative explanations, and confidence |
| Maintainer | Add a test without weakening the score model | Use an auditable registry record and documented acceptance requirements |
| Publisher/operator | Operate a laboratory without contaminating its evidence | Keep any provider script isolated, labelled, policy-approved, and non-authoritative |

## Product principles

1. Observation before attribution. State what the page observed, not which product caused it.
2. Controls before scores. A test cannot become authoritative merely because it looks ad-like.
3. Inconclusive is a valid result. Missing evidence must not become a pass or a zero.
4. User-reported context is separate from automated telemetry.
5. Commercial scripts must never silently define the benchmark outcome.
6. Accessible, keyboard-operable evidence is more valuable than decorative density.

## Goals

### Implemented goals

- Present a registry of diagnostic cases with audit metadata.
- Run all, selected, filtered, or individual tests from the browser UI.
- Show lifecycle state, per-test result, six-stage trace, score summary, environmental context, and methodology.
- Calculate a weighted score only from eligible usable results.
- Export/copy result summaries and reports.
- Explain unobservable boundaries for extensions, DNS, VPNs, and browser-internal privacy settings.

### Target goals

- Provide a controlled first-party fixture service that records test-resource arrival using a per-run identifier.
- Produce reproducible browser-matrix evidence for Chromium, Firefox, and WebKit.
- Separate application modules so tests, scoring, fixture protocol, reporting, and UI can evolve safely.
- Provide a dedicated optional live-ad exploratory mode only after written provider approval and a documented measurement protocol.

## Non-goals

- Detecting or naming a visitor's extension, DNS resolver, VPN, router filter list, or browser privacy mode.
- Guaranteeing that a third-party failure came from a blocker.
- Generating ad clicks, impressions, reloads, or revenue through automation.
- Treating API availability, ordinary sandbox behavior, or a blank ad slot as proof of protection.
- Collecting persistent personal telemetry without an explicit future design, notice, and consent model.

## Functional requirements

| ID | Requirement | Current state | Acceptance evidence |
| --- | --- | --- | --- |
| PRD-01 | Show the benchmark purpose, limits, and current run state before tests run | Implemented | Browser UI snapshot and copy review |
| PRD-02 | Display 55 registry cases with ID, category, audit data, filters, and search | Implemented | Registry integrity verification plus laboratory UI |
| PRD-03 | Run selected cases and surface queued, running, terminal, paused, and cancelled states | Implemented with abort propagation | Browser interaction test |
| PRD-04 | Show a six-stage evidence trace for every executed case | Implemented | Trace component inspection and browser test |
| PRD-05 | Keep `BLOCKED`, `PARTIAL`, `ALLOWED`, `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, and `CANCELLED` semantically distinct | Implemented | Unit/in-app verification and score tests |
| PRD-06 | Score only eligible usable results and surface no score when there is no eligible evidence | Implemented | Score unit tests |
| PRD-07 | Export user-readable and machine-readable results safely | Implemented | HTML/JSON export inspection with escaping test |
| PRD-08 | Verify controlled network fixtures independently of browser request outcome | Planned | Fixture protocol integration test |
| PRD-09 | Stop active execution promptly when the user cancels | Implemented; browser-matrix proof pending | Abort/cancellation end-to-end test |
| PRD-10 | Isolate approved live-ad experiments from authoritative scoring | Planned | Provider approval record and exploratory-mode test |

## Core user journeys

### Run an evidence-based benchmark

1. Visitor opens the overview and reads the attribution boundary.
2. Visitor starts the full benchmark or configures a subset.
3. The UI queues selected tests, exposes current progress, and updates traces/results.
4. Visitor inspects one result, including control, observation, confidence, alternatives, and limitation.
5. Visitor receives a score only if eligible evidence exists.
6. Visitor copies or exports a report without the app claiming more than it observed.

### Investigate a suspicious result

1. Visitor filters by status, validity class, section, or text search.
2. Visitor opens the test record and reads its expected behavior and audit record.
3. Visitor distinguishes direct observation from inference and external-probe uncertainty.
4. Visitor retries a failed/inconclusive case only after understanding that a retry is another observation, not proof of cause.

### Configure display and scoring context

1. Visitor opens Settings.
2. Visitor adjusts category weights, reduced motion, theme, exploratory-score preference, concurrency, timeout, or retry policy as available.
3. The UI recalculates presentation/score using validated weights and preserves the boundary between user input and telemetry.

## Success measures

- All registry records have unique IDs and complete audit metadata.
- Zero fabricated score is shown when no eligible results exist.
- A reviewer can explain every score-influencing result from the UI alone.
- Controlled fixture tests have a confirmed origin-arrival record when that architecture is implemented.
- Release evidence includes successful build, unit tests, browser matrix, and deployed-origin verification.
- No publisher policy breach, automated ad interaction, or unapproved live-ad use is introduced.

## Open decisions

- Hosting/runtime for the future fixture service and its durable request-arrival store.
- Privacy notice, retention policy, and consent model if any telemetry leaves the browser.
- Monetag's written approval of this exact testing/monetization use case.
- Final production subdomain and DNS/hosting configuration for `lab.frpboy.in`.
