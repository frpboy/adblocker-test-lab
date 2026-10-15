# Quality and Release Strategy

## Quality objective

Release only when the product's evidence claims are narrower than or equal to what the implementation can prove. A green build alone is insufficient for a browser diagnostics tool.

## Test layers

| Layer | Scope | Required evidence |
| --- | --- | --- |
| Static | TypeScript/build/configuration | `npm run typecheck`, `npm run build`, clean Git diff check |
| Pure unit | Registry validation, score calculation, escaping, report schema | Deterministic tests for normal and invalid inputs |
| Executor unit | Each test type, timeout, retry, cleanup, abort, capability classification | Mocked browser APIs and controlled fixtures |
| Fixture integration | Request correlation, durable arrival verification, expiry, rate limiting | Service tests across independent process/instance boundaries |
| UI integration | Navigation, run state, filters, modal, settings, export, focus | Browser automation |
| Browser matrix | Chromium, Firefox, WebKit against controlled fixture origin | Captured outcome per engine/version |
| Deployed smoke | Production host, HTTPS, assets, environment configuration | Captured deployed-origin result |
| Security/privacy | Report escaping, secrets, provider isolation, headers, retention | Review checklist and automated checks where feasible |

## Current validation baseline

The checked-in project has recorded successful strict typecheck, Vite production build, production dependency audit, a Chromium browser smoke test, and eight passing in-app verification assertions. This is a baseline, not a full release gate. No committed test runner, fixture service, Firefox/WebKit evidence, or deployed-origin evidence exists yet.

## Required pre-release gates

1. Working tree is reviewed; `git diff --check` is clean.
2. Dependencies install from the lockfile.
3. Typecheck and production build pass.
4. Full dependency audit is reviewed; unresolved findings have a documented risk decision.
5. Registry validation passes, including uniqueness, mandatory audit fields, score eligibility, and category reference checks.
6. Score/report tests pass for empty, partial, all-inconclusive, invalid-weight, hostile-text, and exploratory-inclusion cases.
7. Every score-affecting executor path has a controlled fixture and evidence of valid control behavior.
8. Cancellation aborts active operations and cleans up resources.
9. Chromium, Firefox, and WebKit validation succeeds on the actual deployed fixture origin.
10. Accessibility keyboard/focus/reduced-motion/mobile checks pass.
11. Any provider/ad integration has a documented written approval, policy review, and isolated exploratory test plan.
12. Release notes identify known limits, environment versions, and any unavailable/inconclusive test classes.

## Evidence record template

For every release, capture:

| Field | Required value |
| --- | --- |
| Release/commit | Immutable commit SHA and version |
| Date | Local release date/time and operator |
| Dependency state | Lockfile hash and audit summary |
| Build state | Exact commands and exit codes |
| Browser matrix | Browser/version/OS, result, screenshot/log artifact |
| Fixture state | Fixture deployment/version and request-correlation evidence |
| Accessibility | Keyboard, focus, contrast, motion, mobile result |
| Security/privacy | Escaping, secret scan, headers/provider review result |
| Known limits | Explicit unresolved risks and user-facing wording |

## Defect severity guide

| Severity | Definition | Release action |
| --- | --- | --- |
| Critical | Data exposure, unsafe third-party behavior, fabricated score, or systemic false attribution | Block release and remediate |
| High | Score-affecting fixture/executor defect, broken export escaping, active cancellation failure, inaccessible primary flow | Block release unless scope excludes the affected feature |
| Medium | Incorrect display count, misleading copy, partial browser incompatibility, non-primary accessibility defect | Fix before broad release or document/restrict scope |
| Low | Cosmetic inconsistency, non-blocking wording, minor layout defect | Track and schedule |

## Ownership checklist

- Product owner approves user claims and non-goals.
- Engineering owner approves registry/executor/scoring changes.
- Security/privacy owner approves data handling and third-party scripts.
- Publisher/account owner obtains provider approval before any live-ad mode.
- Release owner collects gate evidence and publishes known limitations.

## Post-release monitoring

Monitor build/deployment failures, browser-console errors, fixture verification mismatches, score-distribution anomalies, export failures, accessibility reports, and provider-policy notices. Do not collect additional user telemetry merely for convenience; add only data that is necessary, disclosed, retained for a defined period, and protected by the backend/privacy design.
