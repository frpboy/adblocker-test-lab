# Technical Requirements Document

## Scope and status

This TRD describes both the current browser-only implementation and the target architecture required for reliable evidence. Current implementation facts use **implemented**. Requirements that need new work use **required**.

## Current architecture

| Layer | Implementation | Responsibility |
| --- | --- | --- |
| Application shell | Vite + React 18 | Mount the SPA and bundle production assets |
| Main feature module | `AdBlockerTestLab.jsx` | Registry, executor, scoring, diagnostics, exports, and UI |
| Styling | Tailwind CSS + global stylesheet | Utility generation, theme classes, and base styles |
| Browser executor | `executeAuditedTest` | DOM, fetch, XHR, iframe, API-capability, and privacy-signal observations |
| Scoring | `calculateBenchmarkScore` | Eligible-result selection, partial credit, weighting, renormalization |
| Reporting | Browser Blob download | JSON, HTML, and copied summary output |
| Persistence | None | Current state is browser-memory only |

## Target architecture

The monolith must be decomposed without changing the existing evidence model.

```text
UI and state
  -> test-run coordinator
      -> executor by test type
          -> controlled-fixture client
          -> browser-observation adapters
      -> evidence normalizer
  -> scoring engine
  -> report builders

Fixture service
  -> signed or unguessable run token validation
  -> fixture response handlers
  -> durable request-arrival store
  -> verification endpoint
```

Recommended module boundaries:

| Module | Required responsibility |
| --- | --- |
| `test-registry` | Immutable test definitions and validation of mandatory audit fields |
| `executor` | Dispatch test types and return normalized evidence records |
| `fixture-client` | Create/verify per-run fixture identifiers and handle retry rules |
| `scoring` | Pure computation with no DOM, network, or React dependency |
| `diagnostics` | Browser-visible environment collection and unobservable-boundary messaging |
| `reporting` | Escaped HTML, JSON schema, text summary, download helpers |
| `ui` | Navigation, forms, trace display, accessibility, and presentation only |
| `fixture-service` | Controlled responses, request recording, retention, rate limits, and auth/abuse controls |

## Domain model

### Test definition

Each definition must include a stable ID, semantic version, section, scoring category, display name, description, expected behavior, control resource, tested resource, executor type, and audit object.

The audit object must include measured behavior, validity class, browser observation, alternative explanations, scoring eligibility, and limitations. A registry validator must reject duplicate IDs, missing audit fields, unknown result/category identifiers, and entries marked scoring eligible without an appropriate control.

### Result record

Each terminal record must include test ID/version, status, actual outcome, evidence source, confidence, duration, retry count, timestamps, control result/detail, attempt detail, observation detail, evaluation detail, and trace stages. Never store raw user notes in a field later inserted into HTML without escaping.

### Fixture protocol requirement

For a controlled network case, the app must create a new run ID and test ID correlation value. The fixture request must carry the correlation value. The fixture service must persist arrival with a bounded retention period and return an independently verifiable result. A browser fetch resolving, rejecting, timing out, or returning status zero is not sufficient by itself to prove fixture arrival or blocker attribution.

The service must not use process-local/in-memory state if deployment can route verification and fixture requests to different instances.

## Executor requirements

| ID | Requirement |
| --- | --- |
| TRD-01 | Treat every test type as an explicit dispatcher case; unknown types end as `INCONCLUSIVE` with a diagnostic message. |
| TRD-02 | Validate a neutral control before interpreting a fixture attempt. |
| TRD-03 | Capture direct observation separately from evaluation/inference. |
| TRD-04 | Pass an `AbortSignal` into all supported active operations and clean up DOM nodes, iframes, object URLs, event handlers, and timers on completion/cancel. |
| TRD-05 | Bound request timeouts, retries, concurrent workers, and fixture retention. |
| TRD-06 | Classify browser capability presence as diagnostic unless a documented active protection signal justifies eligibility. |
| TRD-07 | Preserve alternative explanations in every result shown or exported. |
| TRD-08 | Do not name a blocker, DNS provider, VPN, or browser mode unless a separately authorized and reliable source exists. |

## Scoring requirements

- Input must be a registry plus normalized terminal results; no DOM/network work belongs in scoring.
- Eligible `BLOCKED`, `PARTIAL`, and `ALLOWED` values contribute 1.0, 0.5, and 0.0 respectively.
- Inconclusive, unsupported, error, cancelled, queued, running, and absent results do not affect the eligible denominator.
- Category weights must be finite, non-negative, capped, and renormalized only across categories with usable eligible evidence.
- If no eligible evidence exists, the score must be `null`/not available rather than zero.
- Exploratory inclusion must be opt-in, visibly labelled, and retained in report metadata.

## Security and privacy requirements

1. Escape all user-controlled and test-derived content before HTML report output.
2. Treat provider scripts as untrusted third-party code; load only on an explicit exploratory route/block after approval.
3. Do not commit provider tokens, publisher IDs, or production URLs that carry secrets.
4. Do not scan local network interfaces, private addresses, installed extensions, or operating-system settings.
5. If a backend is added, validate input schemas, apply per-user/IP-aware abuse controls, log minimally, set retention, and publish a privacy notice before collecting identifiable data.
6. CSP must be evaluated against the actual application build; do not call a policy strict if it relies on broad unsafe execution allowances.
7. Exported reports must make user-reported data, inferred data, and direct observations distinguishable.

## Non-functional requirements

| Area | Requirement |
| --- | --- |
| Accessibility | Keyboard operation, visible focus, semantic labels, reduced-motion support, and readable status meaning without color alone |
| Performance | Bounded concurrency, cancellation cleanup, lazy/limited expensive checks, and no background loops after navigation |
| Reliability | Timeouts/retries are explicit; external failures remain inconclusive unless independently controlled |
| Compatibility | Verify actual behavior in current Chromium, Firefox, and WebKit releases before release claims |
| Observability | Record sanitized execution and fixture evidence sufficient to reproduce a result without storing unnecessary personal data |
| Maintainability | Pure scoring/tests, type boundaries for new modules, and one change owner for each registry/executor/report schema change |

## Migration acceptance criteria

The modular migration is complete only when registry/scoring outputs match the baseline for controlled unit fixtures, all test types have automated coverage, fixture arrival can be verified across deployment instances, cancellation stops active work, reports retain escaped output, and the browser matrix passes against the deployed fixture origin.
