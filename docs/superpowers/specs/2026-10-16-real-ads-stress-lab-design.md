# Real Ads Stress Lab Design

## Status and purpose

This is the approved design for a separately operated, evidence-first live-ad
exploration surface in AdBlocker Test Lab. It lets a visitor deliberately load
an approved Monetag placement, observe the browser-visible consequences, and
compare those observations with a separate run where their filtering setup is
changed. It does not identify an extension, DNS resolver, VPN, filter list, or
root cause of a network failure.

The existing 55-case registry, its core score, the privacy index, and all
synthetic fixture semantics remain unchanged. A Real Ads Stress Lab session is
not a benchmark run and never changes the authoritative score.

## Audited starting point

- `index.html` contains a Monetag verification meta tag, but no Monetag ad
  channel tag. It also contains the independent approved AdSense loader.
- The existing `MTG-01` and `MTG-02` records are a controlled DOM/path fixture
  and an external reachability probe. The current UI explicitly never mounts a
  live provider tag.
- `.env.example` has an empty `VITE_MONETAG_SCRIPT_URL` placeholder.
- The root `sw.js` exactly matches Monetag zone `12037379`, but root files are
  not emitted by Vite. `dist/sw.js` and `https://lab.frpboy.in/sw.js` are both
  absent/404, so it cannot support a deployed HTTPS Multitag/Push integration.
- The connected Monetag account identifies `lab.frpboy.in` as verified and
  lists Push/Onclick-related zones. The integration must use the exact tag
  source obtained from the provider dashboard; this repository must not invent
  a tag, zone ID, or provider URL.
- `scripts/fixture-service.mjs` is a local development service, not a Vite
  route or deployed multi-instance backend. Production
  `/api/fixture/verify` returns 404.

## Scope

### Included

1. A `Real Ads Stress Lab` route/view under the existing application shell.
2. Explicit Start, Stop, Reload Provider Slot, Clear Session Results, provider
   selection, desktop/mobile viewport presets, evidence disclosure, and a
   visible third-party-content warning.
3. Monetag as the first provider adapter, configured only with an operator
   supplied exact tag and zone label.
4. Stress levels 0 through 4, with Level 5 reserved for one-provider-at-a-time
   comparison after the adapter boundary is stable.
5. Session evidence for script insertion attempts, observable resource timing,
   iframe/container count, visible rendered containers, DOM mutations, errors,
   timeouts, empty/no-fill observations, viewport, and user-reported protection
   configuration.
6. Documentation, deterministic tests for session state/evidence normalization,
   and manual live-provider validation instructions.

### Excluded

- Automatic provider loading when the route opens.
- Ad clicks, reload loops, impression farming, anti-adblock circumvention, or
  fake live-ad results.
- Adding a provider outcome to the existing core score or privacy index.
- Declaring a failed request blocked by a named extension or filter list.
- Integrating a second provider before Monetag has real creative-rendering
  evidence and a stable adapter boundary.

## User experience

The normal Overview, Results, Methodology, and Settings surfaces remain
ad-free. A visitor enters **Real Ads Stress Lab** and first sees a warning:
third-party ads may contain tracking, redirects, prompts, or unexpected
creative content; a normal web page cannot attribute a load failure to a
specific blocker.

The initial Level 0 state contains only the existing synthetic baseline.
Selecting a live level does not load a tag by itself. The user must press
**Start Real Ads Session** after selecting a provider, a permitted format, and
a viewport preset.

During a session, the workspace displays:

- the selected provider, format, zone label, stress level, session timestamps,
  and the user-reported protection context;
- a clearly bordered **Live provider content** mount separate from synthetic
  fixtures;
- a session timeline that labels direct observations rather than conclusions;
- a request/resource evidence table where browser visibility permits it;
- counts for provider containers, frames, visible creatives, and empty/no-fill
  observations; and
- Stop, one-shot Reload Provider Slot, and Clear Session Results controls.

Onclick/popunder is unavailable until the user separately enables the
disruptive-format acknowledgement in that same session. It must never be
started from page load or an automated action.

## Monetag adapter and configuration

`src/lab/real-ads/monetag.js` will own the provider-specific, browser-facing
adapter. It accepts a normalized public configuration record and returns a
session-owned script/mount descriptor; it does not calculate scores.

The deployment provides the exact tag configuration using Vite environment
variables, for example:

```text
VITE_REAL_ADS_MONETAG_ENABLED=true
VITE_REAL_ADS_MONETAG_MULTITAG_URL=<exact-dashboard-tag-url>
VITE_REAL_ADS_MONETAG_MULTITAG_LABEL=Approved Multitag
VITE_REAL_ADS_MONETAG_ONCLICK_URL=<exact-dashboard-tag-url>
VITE_REAL_ADS_MONETAG_ONCLICK_LABEL=Approved Onclick
```

These values are public client configuration once built, not credentials. They
remain uncommitted because repository policy forbids committing publisher tags
or production identifiers. `.env.example` documents names only, with blank
values. If the provider requires its downloaded HTTPS service worker, the exact
provider artifact is placed as `public/sw.js` so Vite emits `dist/sw.js`; it is
never handwritten or inferred.

The adapter loads exactly one selected, approved tag once per explicit session.
It rejects starts when configuration is absent, disabled, malformed, or already
active. Reload performs one user-initiated teardown and reinsertion; it has no
timer, retry loop, or automatic reloading.

## Stress-level mapping

| Level | Name | Live behavior |
| --- | --- | --- |
| 0 | Synthetic Baseline | Existing fixtures only; no provider tag. |
| 1 | Real Display Ads | One approved display/banner-capable Monetag format, if provided by the account. |
| 2 | Multiple Display Placements | Distinct approved placement zones only; never a duplicated tag. |
| 3 | In-Page Push and Overlay | Approved In-Page Push and/or Vignette only, with real DOM evidence. |
| 4 | Aggressive Approved Format Mix | Distinct approved formats, each explicitly configured; Onclick requires separate opt-in. |
| 5 | Provider Comparison | Deferred; one provider per session after a second verified adapter exists. |

An unavailable format is rendered as unavailable with its configuration reason;
the application never substitutes a synthetic creative and calls it real.

## Evidence model

`src/lab/real-ads/evidence.js` will normalize session evidence without making
causal claims. A record carries the session ID, provider/zone label, origin
(`LIVE_PROVIDER` or `SYNTHETIC_FIXTURE`), time, viewport, direct observation,
and limitation.

Terminal session observations are:

- `REAL_AD_RENDERED`: a session-owned provider container/frame is present and
  visibly occupies layout space. This is not an assertion about its content.
- `PROVIDER_SCRIPT_LOADED`: the script load event occurred.
- `REQUEST_BLOCKED_OR_FAILED`: the script emitted an error or an observable
  related resource failed; alternative causes remain visible.
- `EMPTY_OR_NO_FILL`: a configured mount has no observable creative after the
  bounded observation window. It is not a blocker result.
- `PROVIDER_ERROR`: an explicit provider-visible error was observed.
- `INCONCLUSIVE`: browser boundaries prevent a reliable classification.
- `SYNTHETIC_FIXTURE`: the existing controlled baseline only.

Evidence sources are `script-load/error`, `PerformanceObserver` resource
entries where Timing-Allow-Origin permits them, `MutationObserver`, owned-node
inspection, layout visibility checks, and browser error events. Cross-origin
iframe internals, provider-side auction/fill status, and service-worker internals
remain unobservable unless the provider exposes them safely.

## Lifecycle and cleanup

`src/lab/real-ads/session.js` owns session state: `IDLE`, `STARTING`, `ACTIVE`,
`STOPPING`, `STOPPED`, and `ERROR`. It creates a unique session ID, tags every
owned node with that ID, installs bounded observers/listeners, and retains only
session-local evidence in memory.

Stop disconnects observers, removes the session-owned script and mount nodes,
clears app-owned timers/listeners, and prevents further app-initiated loads. It
does not claim to cancel an already dispatched request, close a provider-created
window, revoke a browser notification permission, or undo a completed provider
action. Clear Session Results removes only local app evidence after confirmation.

## Accessibility, security, and privacy

- Every control has a visible label, keyboard operation, focus treatment, and
  disabled state while transition work is underway.
- Status language is textual and never relies on color alone.
- Warning copy precedes any disruptive format. Onclick has a second deliberate
  opt-in and no programmatic click.
- Provider values are never inserted through unsafe HTML. The existing escaped
  report path stays covered by its hostile-text test.
- No telemetry is sent by the app beyond the user-initiated provider tag. The
  app stores session evidence only in browser memory until the user exports it.

## Validation plan

Automated tests use deterministic fake adapters and never real ad inventory:

1. configuration validation and no-tag default;
2. one-session/one-script injection guard;
3. stop cleanup, observer disconnect, and no automatic retry;
4. evidence normalization for rendering, no-fill, errors, and inconclusive;
5. core-score regression proving real-ad evidence cannot change the 55-case
   score; and
6. report escaping regression.

Manual live validation is recorded separately for each exact provider tag:

1. Chromium with uBlock Lite disabled; start one session and capture the script
   attempt, console/network evidence, and whether a creative is visible.
2. Repeat with uBlock Lite enabled using the same viewport and selected format.
3. Repeat in a clean profile and a mobile viewport.
4. Verify Stop prevents further app-owned injection and leaves the rest of the
   lab usable.
5. Re-run the synthetic benchmark to establish unchanged behavior.

Failure to render a real creative is reported as provider delivery unverified,
no-fill, provider error, or inconclusive according to captured evidence; it is
never silently presented as a blocker pass.

## Documentation and operational changes

Implementation updates `docs/current-system.md`,
`docs/measurement-and-scoring.md`, `docs/prd.md`, `docs/trd.md`,
`docs/ui-ux-specification.md`, `docs/quality-and-release-strategy.md`,
`docs/operations-and-deployment.md`, `docs/known-limitations-and-roadmap.md`,
`.env.example`, and append-only `log.md` as behavior becomes real.

The separate user-requested ExoClick verification meta tag is a bounded
verification-only change. It does not authorize an ExoClick script, provider
adapter, placement, or score change and is implemented/validated independently.

## Three-provider extension

ExoClick is the third provider. The supplied verification meta tag belongs in
the static document head and must be present exactly once in the built HTML.
It establishes neither account acceptance nor ad delivery. ExoClick live zones
remain unavailable until exact publisher-generated snippets are supplied through
untracked local/deployment configuration; the adapter presents those formats as
unavailable rather than inventing values. All three providers share the same
explicit-session, no-duplicate, evidence-first lifecycle.
