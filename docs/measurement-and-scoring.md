# Measurement and Scoring

## Evidence classes

Every test is labelled with one of three validity classes.

| Validity class | Meaning | Core-score treatment |
| --- | --- | --- |
| Controlled First-Party Fixture | A local DOM or same-origin behavior can be observed with a stated control | Eligible only when the record is marked scoring eligible and has a usable result |
| Exploratory Third-Party Endpoint | An external resource probe that cannot isolate the cause of failure | Excluded by default; an optional setting can include exploratory results |
| Browser Privacy Signal or API Inspection | A browser capability or privacy-signal observation | Usually diagnostic; individual active signals may be eligible when the registry says so |

The current registry has 53 entries. The UI derives rather than hardcodes its current breakdown: 37 entries are marked scoring eligible, 9 have exploratory-external validity, and 9 have capability-signal validity. Validity class and score eligibility are separate fields; do not infer one from the other.

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

Queued and running are operational states, not scored outcomes.

## Score calculation

`calculateBenchmarkScore` validates each configured category weight: non-finite or negative values become zero and values are capped at 100. It then calculates category scores from eligible completed results, applies partial credit, and renormalizes participating category weights. If no eligible evidence exists, the UI should present no meaningful score rather than fabricate a baseline.

The engine excludes `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, and `CANCELLED` outcomes from the denominator. Non-eligible records are also excluded unless the user enables the exploratory-score setting. The verification suite checks empty state handling, all-inconclusive handling, exclusion of third-party exploratory probes by default, deterministic partial-credit calculation, and zero-weight safety.

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
