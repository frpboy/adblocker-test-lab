# Current System

## Purpose and scope

AdBlocker Test Lab is a browser-side diagnostics application for examining observable advertising, tracking, cosmetic-filtering, privacy-signal, popup, and resource-loading behavior. It is not an extension detector and it does not claim to identify a user's exact blocker, DNS resolver, VPN, or browser privacy mode.

The app presents evidence, its confidence, and alternative explanations. This boundary is essential: a failed request may be due to a filter, DNS, a firewall, CSP, CORS, server failure, or ordinary connectivity conditions.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `AdBlockerTestLab.jsx` | Main prototype: registry, evidence/tracing helpers, scoring, environment collection, exports, test executor, and all React UI views |
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

The initial route is an Overview with a Quick Scan and Full Diagnostic. Quick Scan runs exactly `DSP-01`, `TPA-01`, `TPA-05`, `TRK-01`, `INT-03`, and `AAB-01`; Full Diagnostic uses `TEST_REGISTRY`. Both invoke the same batch runner and route to the Results view. The live workbench, isolated Monetag chamber, scoring view, layer/export view, verification suite, and architecture view remain reachable under Advanced Tools.

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
