# Current System

## Purpose and scope

AdBlocker Test Lab is a browser-side diagnostics application for examining observable advertising, tracking, cosmetic-filtering, privacy-signal, popup, and resource-loading behavior. It is not an extension detector and it does not claim to identify a user's exact blocker, DNS resolver, VPN, or browser privacy mode.

The app presents evidence, its confidence, and alternative explanations. This boundary is essential: a failed request may be due to a filter, DNS, a firewall, CSP, CORS, server failure, or ordinary connectivity conditions.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `AdBlockerTestLab.jsx` | Main prototype: registry, evidence/tracing helpers, executor, and React UI views; delegates live score display and HTML export to focused modules |
| `src/lab/scoring.js` | Pure core-score calculation; accepts a registry and normalized result map |
| `src/lab/reporting.js` | Escaped standalone HTML report builder |
| `scripts/fixture-service.mjs` | Local-only first-party fixture receipt service for development and protocol tests |
| `src/main.tsx` | React entry point that mounts the lab in `React.StrictMode` |
| `src/styles.css` | Global stylesheet entry |
| `index.html` | HTML shell, metadata, inline SVG favicon, and module entry |
| `tailwind.config.js` | Tailwind content discovery, including the root-level JSX prototype |
| `package.json` | Scripts and dependencies |
| `README.md` | Public project overview and integrity principles |
| `DEPLOYMENT.md` | Manual deployment checklist |

The application deliberately remains a single root-level JavaScript/JSX prototype. The file was renamed from `.tsx` to `.jsx` because it contains untyped JavaScript; TypeScript remains strict for actual TypeScript project files. This avoids masking type errors globally merely to accommodate the prototype.

## Runtime architecture

`src/main.tsx` creates the React root and renders the default component from `AdBlockerTestLab.jsx`. The main component owns application state for navigation, display settings, user-reported context, queued/running results, execution controls, filters, reports, and environment diagnostics.

At mount the app:

1. Collects browser environment diagnostics.
2. Executes the in-app verification suite and stores its results for the Methodology view.
3. Reads `prefers-reduced-motion` when available.

The initial route is an Overview with a Quick Scan and Full Diagnostic. Quick Scan runs exactly `DSP-01`, `TPA-01`, `TPA-05`, `TRK-01`, `INT-03`, and `AAB-01`; Full Diagnostic uses `TEST_REGISTRY`. Both invoke the same batch runner and route to the Results view.

The application organizes all functionality into a streamlined 4-tab navigation structure:
1. **Overview & Scanner**: Hero header, instant primary actions (Quick Scan & Full 55-Vector Diagnostic), diagnostic scope details, and detected browser context.
2. **Results & Workbench**: Live execution HUD, high-level metrics (Score, Privacy Signals, Inconclusive count), 7-category progress breakdown, sanitized benchmark exports (HTML, JSON, CSV), collapsible 55-pin vector matrix, outcome filters (All, Blocked, Partial, Allowed, Other), keyboard-navigable results table, and vector inspection pane with rule-copying.
3. **Methodology & Audit**: Foundational principles (evidence boundaries, inconclusive honesty, fixtures vs probes), 6-stage execution lifecycle breakdown, heuristic protection layers, and the automated 15-assertion verification suite with re-run capabilities.
4. **Settings & Lab**: Sub-tab navigation for category weights & denominator audit, user-reported environment configuration, isolated Monetag test chamber (MTG-01/MTG-02), and first-party backend route handler architecture.

## Registry and configuration

`TEST_REGISTRY` is the catalog of diagnostic cases. Each record carries an ID, version, section, scoring category, resource/behavior description, type, expected behavior, and audit metadata. Audit metadata includes the measurement, validity class, browser observation, alternative explanations, scoring eligibility, and stated limitations.

The registry is the source of count displays and integrity checking. Do not add or remove entries without keeping their audit metadata complete. The internal verification only asserts registry uniqueness and audit metadata completeness; it does not validate that every live browser result is correct in every engine or network environment.

The seven default weighted categories cover core ad/tracker blocking only. Privacy signals and exploratory probes are rendered separately and do not contribute to the weighted score. Default core-category weights total 100 percent.

## Execution lifecycle

`runTestsBatch` queues selected records, creates a worker pool based on the user-selected concurrency, and calls `executeAuditedTest` for each record. Each completed result replaces its queued placeholder in `resultsMap`.

The lifecycle state is `IDLE`, `QUEUED`, `RUNNING`, `PAUSED`, `COMPLETED`, or `CANCELLED`. Result statuses include `BLOCKED`, `PARTIAL`, `ALLOWED`, `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, `CANCELLED`, `REQUEST_FAILED_CAUSE_UNKNOWN`, `CONSISTENT_WITH_FILTERING`, `SIGNAL_ACTIVE`, and `SIGNAL_INACTIVE`.

Pause waits before another queued case is claimed. Cancel aborts the active batch through `AbortController`, marks remaining queued work as cancelled, and propagates the signal into cancellable execution work. Executor cleanup still needs browser-engine coverage before claiming universal behavior.

## Six-stage protection trace

Each result is rendered as a six-stage trace:

1. Test prepared.
2. Control verified.
3. Resource or fixture attempted.
4. Resource or behavior observed.
5. Evidence evaluated.
6. Result classified.

The trace labels direct observation separately from inference. Strong and weak confidence are inference states; user-reported and unobservable conditions are also represented explicitly.

## Browser/environment collection

The application reads ordinary browser-visible properties such as user agent hints, viewport, screen dimensions, locale, timezone, connectivity, GPC/DNT signals, selected capabilities, and availability of browser APIs. These values are diagnostic context only. They cannot prove extension installation, browser-internal tracking-protection level, operating-system DNS configuration, router blocklists, local network interfaces, or VPN state.

## Reports and user data

The application can create a summary, JSON report, and standalone HTML report in the browser and trigger downloads with a temporary Blob URL. Report generation escapes HTML user-controlled/test strings before inserting them into the HTML export; the in-app verification suite includes an escaping assertion.

User-reported extension, VPN, and notes data are deliberately distinguished from automated observations. The current repository contains no server, database, analytics pipeline, or persistent backend; browser session data therefore remains in client memory unless the user exports it.

## Local fixture protocol

`scripts/fixture-service.mjs` provides a development-only HTTP fixture service. It creates opaque run IDs, records a fixture arrival against an exact run/test pair in a local JSON receipt file, and exposes a verification response for that pair. Its test proves correlation in one local process. It is not configured for Vercel or production and its file receipt store is not a shared durable store; do not treat it as multi-instance or deployed fixture evidence.

## Approved third-party ad loader

The document head contains an operator-approved asynchronous Google AdSense loader. It is third-party code, not a test fixture or a result signal. The runner never reads its presence or outcome into the core score, privacy-signal index, or attribution analysis. A blocked or loaded ad-loader request must not be interpreted as proof of a particular extension, DNS service, VPN, or browser setting.

The document head also contains one static ExoClick ownership-verification meta tag. It does not load an ExoClick zone, request an ad, or provide filtering evidence. ExoClick delivery remains unavailable until approved publisher zone configuration is supplied through the isolated Real Ads Stress Lab configuration boundary.
