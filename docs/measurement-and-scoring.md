# Measurement and Scoring

## Real Ads Stress Lab evidence

Live-provider observations are exploratory placement evidence, never benchmark inputs. `REAL_CREATIVE_RENDERED` requires a direct observation of a visible, non-zero owned layout; a loaded script or iframe alone is insufficient. No-fill, request failures, provider errors, and possible filtering retain alternative causes such as CSP, DNS, connectivity, and provider availability. None of these observations can raise the authoritative core score or privacy-signal index.

A rendered-creative outcome requires visible computed styling and measured non-zero layout on the iframe or native creative node. DOM text or access to iframe document contents alone is insufficient; inaccessible frame contents remain unknown, not positive evidence.

## Evidence classes

Every test is labelled with one of three validity classes.

| Validity class | Meaning | Core-score treatment |
| --- | --- | --- |
| Controlled First-Party Fixture | A local DOM or same-origin behavior can be observed with a stated control | Eligible only when the record is marked scoring eligible and has a usable result |
| Exploratory Third-Party Endpoint | An external resource probe that cannot isolate the cause of failure | Always excluded from the authoritative core score |
| Browser Privacy Signal or API Inspection | A browser capability or privacy-signal observation | Reported in a separate privacy index; excluded from the authoritative core score |

The current registry has 55 entries: 35 core ad/tracker-blocking cases, 11 exploratory probes, and 9 privacy signals. The UI derives the group counts from the registry. Metric group and score eligibility are separate fields; do not infer one from the other.

## Result semantics

| Status | Meaning | Score value when eligible |
| --- | --- | --- |
| BLOCKED | Controlled behavior/resource was prevented | 1.0 |
| PARTIAL | Incomplete protection was observed | 0.5 |
| ALLOWED | The tested behavior/resource was allowed | 0.0 |
| INCONCLUSIVE | Cause cannot be established | Excluded |
| UNSUPPORTED | Required API is unavailable | Excluded |
| ERROR | Execution or infrastructure error | Excluded |
| CANCELLED | User stopped queued execution | Excluded |
| REQUEST_FAILED_CAUSE_UNKNOWN | External reachability failed, but client code cannot attribute the cause | Excluded |
| CONSISTENT_WITH_FILTERING | Observation is compatible with filtering but not sufficient to prove it | Excluded |
| SIGNAL_ACTIVE / SIGNAL_INACTIVE | Separate browser privacy/hardening observation | Excluded |

Queued and running are operational states, not scored outcomes.

## Score calculation

`calculateBenchmarkScore` validates each configured category weight: non-finite or negative values become zero and values are capped at 100. It then calculates category scores from eligible completed results, applies partial credit, and renormalizes participating category weights. If no eligible evidence exists, the UI should present no meaningful score rather than fabricate a baseline.

The engine excludes `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, `CANCELLED`, `REQUEST_FAILED_CAUSE_UNKNOWN`, and `CONSISTENT_WITH_FILTERING` from the denominator. Privacy signals and exploratory probes are always excluded. The verification suite checks empty state handling, all-inconclusive handling, exploratory exclusion, deterministic partial-credit calculation, and zero-weight safety.

## Important measurement boundaries

- CSS hiding of a synthetic DOM bait is evidence that a cosmetic rule matched; it does not prove a network request was blocked or identify the responsible product.
- A client-side abort or a status-zero XHR can be consistent with content filtering, but browser policy and network conditions remain alternative explanations where the control cannot isolate them.
- An external endpoint failure cannot distinguish DNS filtering, browser filtering, CSP/CORS, firewall policy, origin outage, or offline connectivity.
- Standard web pages cannot read installed extension names, browser-internal privacy settings, operating-system DNS resolvers, router filter lists, or VPN tunnel state.
- A sandboxed popup attempt may be blocked by sandbox or browser popup policy. It is not, by itself, evidence of an ad blocker.
- Capability availability is not equivalent to protection. The current executor treats the Resource Timing API as non-scored/inconclusive and describes Storage Access API availability as a non-scored capability observation when first-party storage is available.

## Operational guidance for new tests

Before adding a test, document all of the following in its registry record:

1. The exact behavior measured.
2. A neutral control and the expected outcome.
3. Whether the resource is first-party controlled, exploratory external, or capability-only.
4. Alternative explanations for the observation.
5. Whether it may affect the authoritative score and why.
6. The limitation a user must see before interpreting the result.

Prefer controlled first-party fixtures with independently verifiable request arrival. The current static Vite application has no fixture backend or request-arrival recorder, so relative-path probes alone cannot establish that a valid controlled resource was served. A resolved fetch can still represent an unexpected response, and a failure can still have many causes.

The repository includes a local-only fixture-protocol service for development testing. It can verify a correlated run/test arrival within one local process, but it is not mounted in the Vite app or deployed with a shared durable store. Until that production boundary exists, browser-only network outcomes retain their current non-authoritative limitations.
