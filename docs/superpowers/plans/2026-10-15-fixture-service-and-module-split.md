# Fixture Service and Module Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) or superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a locally verifiable first-party fixture protocol and move pure score/report code out of the JSX prototype without changing evidence or score semantics.

**Architecture:** A Node standard-library local fixture server will create bounded, opaque run IDs, record each fixture arrival, and expose a verification endpoint. It is explicitly local-only until a shared durable store and production host are selected. Pure scoring and report builders move to `src/lab/` behind unchanged exports so the React coordinator stays behaviorally stable.

**Tech Stack:** Node.js 20 standard library, React 18, Vite 6, Node test runner.

**Spec:** `docs/trd.md`, `docs/measurement-and-scoring.md`, `docs/quality-and-release-strategy.md`

## Global Constraints

- External or failed requests never prove filtering; exploratory probes never affect the core score.
- Fixture arrival is authoritative only when a correlation is independently recorded and verified.
- No provider or ad scripts, secrets, persistent telemetry, deployment, commit, or push.
- A local file receipt store is development-only; production requires a shared durable store.

## Review Focus

- Concurrent fixture runs must not verify a receipt from another run; Task 1 covers run/test correlation.
- Expired receipts must report absent rather than remain indefinitely; Task 1 covers bounded retention.
- Browser-side fixture fetch failure must remain inconclusive when verification is unavailable; Task 2 covers the response boundary.
- Privacy and exploratory records must remain unable to affect the core score; Task 3 covers score exclusion.
- HTML export must retain escaping after extraction; Task 3 covers hostile input.

---

### Task 1: Local fixture receipt service

**Files:**
- Create: `scripts/fixture-service.mjs`
- Create: `test/fixture-service.test.mjs`
- Modify: `package.json`
- Modify: `docs/current-system.md`

**Interfaces:**
- Produces: `POST /api/fixture/runs`, `GET /api/fixture/resource`, and `GET /api/fixture/verify` for a locally started server.

- [ ] Write tests for run/test correlation and expiry.
- [ ] Run the test and observe the missing-service failure.
- [ ] Implement bounded receipt recording with Node standard library only.
- [ ] Run fixture tests and the whole Node test command.

### Task 2: Fixture client boundary

**Files:**
- Create: `src/lab/fixture-client.js`
- Create: `test/fixture-client.test.mjs`
- Modify: `AdBlockerTestLab.jsx`
- Modify: `docs/measurement-and-scoring.md`

**Interfaces:**
- Consumes: fixture HTTP endpoints from Task 1.
- Produces: a normalized `{ available, runId, reason }` fixture session and verified arrival result for eligible fixture paths.

- [ ] Write tests showing unavailable verification returns no authoritative arrival claim.
- [ ] Run the test and observe the missing-client failure.
- [ ] Implement the minimal client protocol and connect only eligible controlled paths.
- [ ] Run fixture/client tests, typecheck, and browser interaction validation.

### Task 3: Pure scoring and reporting modules

**Files:**
- Create: `src/lab/scoring.js`, `src/lab/reporting.js`
- Create: `test/scoring.test.mjs`, `test/reporting.test.mjs`
- Modify: `AdBlockerTestLab.jsx`
- Modify: `docs/current-system.md`, `log.md`

**Interfaces:**
- Produces: the existing score and report-builder exports with unchanged output contracts.

- [ ] Write score-exclusion and report-escaping tests before extraction.
- [ ] Run tests and observe missing-module failures.
- [ ] Extract pure implementations and retain JSX compatibility exports.
- [ ] Run all tests, typecheck, build, diff check, and browser smoke validation.
