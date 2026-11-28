import { classifyExternalStatus } from './reachability.js';
import { plainTestName } from './plain-language.js';

export const GAP_WARN_MS = 24 * 60 * 60 * 1000;

export const CAVEAT =
  'This shows what differed between two runs. It cannot show why. The network, DNS answers a device has remembered, other apps and the page itself can also change between runs.';

const SCORED = { BLOCKED: 'blocked', PARTIAL: 'partial', ALLOWED: 'not_blocked' };
export const CLASS_LABEL = {
  blocked: 'Blocked',
  partial: 'Partly blocked',
  not_blocked: 'Got through',
  reached: 'Request completed',
  unreachable: 'Could not be reached'
};

/** What a test's status means for comparing: scored tests and third-party checks only. */
export function comparableClass(test, status) {
  if (test.metricGroup === 'AD_TRACKER_BLOCKING' && test.audit?.scoringEligible) return SCORED[status] || null;
  if (test.metricGroup === 'EXPLORATORY_PROBE') return classifyExternalStatus(status);
  return null;
}

/** A compact, storable record of one finished run. */
export function buildSnapshot({ label, lastRun, resultsMap, appVersion, id, now = Date.now() }) {
  if (!lastRun || !Array.isArray(lastRun.testIds) || !lastRun.testIds.length) return null;
  const results = {};
  for (const tid of lastRun.testIds) {
    const status = resultsMap?.[tid]?.status;
    if (status) results[tid] = status;
  }
  return {
    id: id || `run-${now.toString(36)}`,
    label: String(label || '').trim().slice(0, 40) || 'Untitled run',
    savedAt: now,
    appVersion: appVersion || null,
    scope: lastRun.label || 'custom',
    startedAt: lastRun.startedAt || null,
    finishedAt: lastRun.finishedAt || null,
    cancelled: Boolean(lastRun.cancelled),
    timeoutMs: lastRun.timeoutMs ?? null,
    concurrency: lastRun.concurrency ?? null,
    testIds: lastRun.testIds.slice(),
    results,
    controls: Array.isArray(lastRun.controls)
      ? lastRun.controls.map((c) => ({ id: c.id, host: c.host, reached: Boolean(c.reached), ms: c.ms ?? null }))
      : null
  };
}

function controlsUsable(snap) {
  if (!Array.isArray(snap.controls) || !snap.controls.length) return { ok: false, why: 'has no control-server results' };
  const reached = snap.controls.filter((c) => c.reached).length;
  if (reached < Math.min(2, snap.controls.length)) return { ok: false, why: `reached only ${reached} of ${snap.controls.length} control servers` };
  return { ok: true };
}

/**
 * Neutral per-test comparison of two saved runs. The earlier run (by finish time) is `a`, whatever order the caller passes them in.
 * Never says one run is better, and never gives a cause.
 */
export function compareRuns(first, second, registry) {
  const issues = [];
  const block = (text) => issues.push({ level: 'block', text });
  const warn = (text) => issues.push({ level: 'warn', text });

  if (!first || !second) return { ok: false, issues: [{ level: 'block', text: 'Pick two runs to compare.' }], rows: [], summary: null };
  const [a, b] = [first, second].sort((x, y) => String(x.finishedAt).localeCompare(String(y.finishedAt)));

  if (first.id === second.id || (first.finishedAt && first.finishedAt === second.finishedAt)) block('These are the same run. Pick two different runs.');
  if (a.cancelled || b.cancelled) block('A run that was stopped early cannot be compared. Run it again to the end.');

  const byId = new Map(registry.map((t) => [t.id, t]));
  const comparableTest = (id) => ['AD_TRACKER_BLOCKING', 'EXPLORATORY_PROBE'].includes(byId.get(id)?.metricGroup);
  const shared = a.testIds.filter((id) => b.testIds.includes(id) && comparableTest(id));
  if (!shared.length) block('The two runs have no tests in common.');
  if (a.appVersion !== b.appVersion) warn(`The runs used different lab versions (${a.appVersion || 'unknown'} and ${b.appVersion || 'unknown'}). Tests may differ.`);
  if (a.timeoutMs !== b.timeoutMs) warn('The runs used different request time limits, which can change which slow requests count as failed.');
  if (a.testIds.length !== b.testIds.length || a.testIds.some((id) => !b.testIds.includes(id))) {
    warn(`The runs covered different tests (${a.scope} and ${b.scope}). Only the ${shared.length} tests in both are compared.`);
  }
  if (a.finishedAt && b.finishedAt && Date.parse(b.finishedAt) - Date.parse(a.finishedAt) > GAP_WARN_MS) warn('The runs are more than a day apart.');

  const ca = controlsUsable(a);
  const cb = controlsUsable(b);
  const externalComparable = ca.ok && cb.ok;
  if (!ca.ok) warn(`The earlier run ${ca.why}, so third-party server results are not compared.`);
  if (!cb.ok) warn(`The later run ${cb.why}, so third-party server results are not compared.`);

  if (issues.some((i) => i.level === 'block')) return { ok: false, a, b, issues, rows: [], summary: null };

  const rows = [];
  let dropped = 0;
  for (const id of shared) {
    const test = byId.get(id);
    const ka = comparableClass(test, a.results[id]);
    const kb = comparableClass(test, b.results[id]);
    if (test.metricGroup !== 'AD_TRACKER_BLOCKING' && test.metricGroup !== 'EXPLORATORY_PROBE') continue;
    const group = test.metricGroup === 'EXPLORATORY_PROBE' ? 'external' : 'scored';
    if (group === 'external' && !externalComparable) continue;
    if (!ka && !kb) continue;
    if (!ka || !kb) {
      dropped++;
      continue;
    }
    rows.push({ id, name: plainTestName(test), group, a: ka, b: kb, changed: ka !== kb });
  }
  if (dropped) warn(`${dropped} test${dropped === 1 ? '' : 's'} had no clear answer in only one of the runs and ${dropped === 1 ? 'is' : 'are'} left out.`);

  const part = (group) => {
    const r = rows.filter((x) => x.group === group);
    return { total: r.length, changed: r.filter((x) => x.changed).length };
  };
  return {
    ok: true,
    a,
    b,
    issues,
    rows,
    externalComparable,
    summary: { scored: part('scored'), external: part('external') }
  };
}
