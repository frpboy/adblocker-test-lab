# Repository Agent Instructions

## Mission

Maintain AdBlocker Test Lab as an evidence-first browser diagnostics product. The application may observe filtering-related behavior, but it must never overstate what a standard web page can prove.

## Read first

Before changing behavior, read the relevant documents under `docs/`:

1. `docs/README.md` for the documentation map and source-of-truth rules.
2. `docs/current-system.md` for the current implementation.
3. `docs/measurement-and-scoring.md` for evidence and score boundaries.
4. `docs/prd.md`, `docs/trd.md`, and `docs/ui-ux-specification.md` for requirements.
5. `docs/quality-and-release-strategy.md` before release/validation work.

Current checked-in source and captured runtime evidence outrank historical attachment notes and proposed architecture.

## Repository map

- `AdBlockerTestLab.jsx`: current single-file prototype containing registry, executor, scoring, reports, and UI.
- `src/main.tsx`: React entry point.
- `vite.config.ts`: Vite server/preview defaults; use port 8080.
- `docs/`: requirements and operational record.

The root prototype is intentionally JavaScript/JSX. Do not disable strict TypeScript globally to accommodate it. If splitting it into modules, add correct types at the new boundaries.

## Evidence rules

- A failed network request does not automatically prove ad blocking; distinguish filtering from DNS, firewall, CSP, CORS, origin, and connectivity failures.
- Browser API presence is not a protection result.
- Do not infer an installed extension, DNS resolver, VPN, router filter list, or browser-internal privacy mode.
- Keep controlled first-party fixtures, exploratory third-party probes, and capability checks separate.
- Preserve `BLOCKED`, `PARTIAL`, `ALLOWED`, `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, and `CANCELLED` meanings and their score treatment.
- Do not fabricate a score when no eligible evidence exists.

## Security and provider boundary

- Escape user-controlled content in HTML reports and preserve the existing report-escaping verification.
- Never commit provider credentials, ad tags, publisher IDs, or production secrets.
- Do not add Monetag or another live-ad script without explicit provider approval for this testing use case and a documented isolated exploratory-mode design.
- Never automate ad clicks, reloads, or impressions.
- Do not turn a blank/no-fill slot into a blocker pass.

## Change workflow

1. Inspect callers, registry metadata, score effects, exports, documentation, and tests before editing.
2. Make the smallest complete change; preserve user-owned Git changes.
3. Update the relevant `docs/` file when behavior, evidence, configuration, dependency, fixture protocol, or release criteria changes.
4. Run at least `npm run typecheck` and `npm run build` for source/configuration changes.
5. Run `npm audit --omit=dev` for dependency changes; do not force major upgrades solely to silence advisories.
6. For browser-facing changes, validate the actual Vite app at `http://localhost:8080` and capture evidence appropriate to the scope.
7. Do not claim cross-browser, fixture-backend, provider, DNS, or deployment verification without current captured evidence.

## Known implementation limits

- There is no controlled fixture backend or durable request-arrival verification yet.
- Batch cancellation uses `AbortController`; validate executor cleanup in supported browser engines before claiming universal interruption behavior.
- Chromium smoke evidence exists; Firefox and WebKit release evidence does not.
- Full development audit findings from Tailwind 3 require a reviewed major-version migration; do not run `npm audit fix --force`.
