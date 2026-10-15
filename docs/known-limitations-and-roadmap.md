# Known Limitations and Roadmap

## Proven current limitations

### Single-file prototype

The registry, execution engine, scoring, diagnostics, exports, and UI live in one 5,000-plus-line JSX file. This is workable as a prototype but makes reviews, targeted testing, and changes to the measurement model unnecessarily difficult.

### No controlled fixture service

This repository has no server routes, fixture service, or request-arrival store. Several diagnostics exercise relative paths or browser constructs, but the static client cannot independently prove that a controlled resource reached and was served by a fixture endpoint. Add a fixture service before treating network-path observations as strong authoritative evidence.

### In-flight cancellation

Queue cancellation is cooperative. A currently executing request, timeout, or iframe action can continue until its existing operation completes. Future executor work should accept an `AbortSignal`, pass it to fetches where supported, clear timers, and retire generated DOM/iframe resources deterministically.

### Attribution limits

Web content cannot enumerate extensions or inspect private operating-system/network state. Product copy and result language must continue to say what was observed rather than claiming which blocker, DNS provider, VPN, or browser mode caused it.

### Cross-browser evidence is incomplete

Only Chromium smoke validation has been recorded. Browser API support and behavior vary across engines, privacy modes, extensions, and network conditions. No release should claim cross-browser verification until it has current evidence from Chromium, Firefox, and WebKit.

### Test-suite scope

The in-app verification suite tests registry integrity, score guardrails, escaping, and selected capability rules. It does not replace unit tests for every test type, end-to-end tests against controlled fixtures, security review, or browser matrix testing.

## Recommended implementation order

1. Split the prototype into registry, executor, scoring, diagnostics, reporting, and UI modules without changing evidence semantics.
2. Build a controlled first-party fixture service with per-run identifiers and durable request-arrival verification appropriate for the chosen hosting model.
3. Add tests for score rules, each executor type, cancellation, report escaping, and fixture protocol behavior.
4. Add browser automation for Chromium, Firefox, and WebKit against local and deployed fixture origins.
5. Define a release evidence checklist that requires captured outputs for build, automated tests, browser matrix, and deployed-origin verification.
6. Only then evaluate an approved, separately labelled live-ad exploratory mode.
7. Redesign the UI around evidence density and clear hierarchy after the measurement system is reliable.

## Non-goals until evidence exists

- Detecting the exact blocker or extension installed by a visitor.
- Proving that a third-party request failure came from a specific network layer.
- Calling API presence a successful ad-blocking result.
- Treating browser sandbox/popup policy as ad-blocker proof.
- Reporting a score when no eligible test result exists.
- Claiming monetization, provider approval, or deployed-domain readiness merely because configuration placeholders or documentation exist.
