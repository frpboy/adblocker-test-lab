import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot, compareRuns, comparableClass } from '../src/lab/run-compare.js';
import { saveRun, loadSavedRuns, deleteSavedRun, MAX_SAVED_RUNS, SAVED_RUNS_KEY } from '../src/lab/saved-runs.js';

const registry = [
  { id: 'S1', name: 'Banner', metricGroup: 'AD_TRACKER_BLOCKING', audit: { scoringEligible: true } },
  { id: 'S2', name: 'Pixel', metricGroup: 'AD_TRACKER_BLOCKING', audit: { scoringEligible: true } },
  { id: 'X1', name: 'Server one', metricGroup: 'EXPLORATORY_PROBE' },
  { id: 'X2', name: 'Server two', metricGroup: 'EXPLORATORY_PROBE' },
  { id: 'X3', name: 'Beacon', metricGroup: 'EXPLORATORY_PROBE' },
  { id: 'P1', name: 'GPC', metricGroup: 'PRIVACY_SIGNAL' }
];
const okControls = [{ id: 'C1', host: 'a', reached: true }, { id: 'C2', host: 'b', reached: true }, { id: 'C3', host: 'c', reached: true }];
const mk = (id, finishedAt, statuses, over = {}) => {
  const resultsMap = Object.fromEntries(Object.entries(statuses).map(([k, v]) => [k, { status: v }]));
  return buildSnapshot({
    label: id, id, appVersion: '4.1.0', now: Date.parse(finishedAt),
    lastRun: { testIds: Object.keys(statuses), label: 'full', finishedAt, cancelled: false, timeoutMs: 2500, concurrency: 6, controls: okControls, ...over },
    resultsMap
  });
};
const base = { S1: 'ALLOWED', S2: 'ALLOWED', X1: 'ALLOWED', X2: 'ALLOWED', X3: 'INCONCLUSIVE', P1: 'SIGNAL_ACTIVE' };

test('only scored tests and third-party checks are comparable', () => {
  assert.equal(comparableClass(registry[0], 'BLOCKED'), 'blocked');
  assert.equal(comparableClass(registry[2], 'REQUEST_FAILED_CAUSE_UNKNOWN'), 'unreachable');
  assert.equal(comparableClass(registry[4], 'INCONCLUSIVE'), null);
  assert.equal(comparableClass(registry[5], 'SIGNAL_ACTIVE'), null);
});

test('neutral per-test differences, earlier run is A regardless of argument order', () => {
  const a = mk('before', '2026-11-28T10:00:00Z', base);
  const b = mk('after', '2026-11-28T10:10:00Z', { ...base, X1: 'REQUEST_FAILED_CAUSE_UNKNOWN', X2: 'REQUEST_FAILED_CAUSE_UNKNOWN' });
  for (const [p, q] of [[a, b], [b, a]]) {
    const r = compareRuns(p, q, registry);
    assert.equal(r.ok, true);
    assert.equal(r.a.id, 'before');
    assert.deepEqual(r.summary, { scored: { total: 2, changed: 0 }, external: { total: 2, changed: 2 } });
    assert.deepEqual(r.rows.filter((x) => x.changed).map((x) => [x.id, x.a, x.b]), [['X1', 'reached', 'unreachable'], ['X2', 'reached', 'unreachable']]);
  }
  const r = compareRuns(a, b, registry);
  assert.ok(!JSON.stringify(r).match(/improv|better|worse|working|blocker (is|was)/i), 'no verdict or cause words');
});

test('a scored change is reported without a cause', () => {
  const r = compareRuns(mk('a', '2026-11-28T10:00:00Z', base), mk('b', '2026-11-28T10:05:00Z', { ...base, S1: 'BLOCKED' }), registry);
  assert.deepEqual(r.summary.scored, { total: 2, changed: 1 });
});

test('stopped-early, identical, and disjoint runs are refused', () => {
  const a = mk('a', '2026-11-28T10:00:00Z', base);
  assert.equal(compareRuns(a, mk('b', '2026-11-28T10:05:00Z', base, { cancelled: true }), registry).ok, false);
  assert.equal(compareRuns(a, a, registry).ok, false);
  assert.equal(compareRuns(a, mk('c', '2026-11-28T10:00:00Z', base), registry).ok, false, 'same finish time is the same run');
  const onlyS1 = mk('e', '2026-11-28T10:01:00Z', { S1: 'ALLOWED' });
  const onlyS2 = mk('f', '2026-11-28T10:02:00Z', { S2: 'ALLOWED' });
  assert.equal(compareRuns(onlyS1, onlyS2, registry).ok, false, 'no tests in common');
  assert.equal(compareRuns(a, mk('d', '2026-11-28T10:05:00Z', { P1: 'SIGNAL_ACTIVE' }), registry).ok, false);
});

test('warnings: version, timeout, coverage, gap', () => {
  const a = mk('a', '2026-11-28T10:00:00Z', base);
  const b = { ...mk('b', '2026-11-30T10:00:00Z', { S1: 'ALLOWED', X1: 'ALLOWED' }, { timeoutMs: 4000 }), appVersion: '4.2.0' };
  const text = compareRuns(a, b, registry).issues.map((i) => i.text).join(' | ');
  assert.match(text, /different lab versions/);
  assert.match(text, /different request time limits/);
  assert.match(text, /different tests/);
  assert.match(text, /more than a day apart/);
});

test('third-party results are not compared when either run lacks usable controls', () => {
  const a = mk('a', '2026-11-28T10:00:00Z', base);
  const failedControls = [{ id: 'C1', host: 'a', reached: false }, { id: 'C2', host: 'b', reached: false }, { id: 'C3', host: 'c', reached: true }];
  const b = mk('b', '2026-11-28T10:05:00Z', { ...base, X1: 'REQUEST_FAILED_CAUSE_UNKNOWN' }, { controls: failedControls });
  const r = compareRuns(a, b, registry);
  assert.equal(r.ok, true);
  assert.equal(r.externalComparable, false);
  assert.equal(r.rows.filter((x) => x.group === 'external').length, 0);
  assert.match(r.issues.map((i) => i.text).join('|'), /Run B reached only 1 of 3 control servers/);
  const none = compareRuns(a, mk('c', '2026-11-28T10:06:00Z', base, { controls: null }), registry);
  assert.match(none.issues.map((i) => i.text).join('|'), /has no control-server results/);
});

test('tests with no clear answer in one run are left out and said so', () => {
  const r = compareRuns(mk('a', '2026-11-28T10:00:00Z', base), mk('b', '2026-11-28T10:05:00Z', { ...base, S2: 'INCONCLUSIVE' }), registry);
  assert.equal(r.summary.scored.total, 1);
  assert.match(r.issues.map((i) => i.text).join('|'), /1 test had no clear answer/);
});

const memStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) }; };

test('saved runs: newest first, capped, replace same run, delete, ignore junk', () => {
  const st = memStore();
  for (let i = 0; i < MAX_SAVED_RUNS + 2; i++) saveRun(mk(`r${i}`, `2026-11-28T10:0${i}:00Z`, base, {}), st, Date.parse('2026-11-28T11:00:00Z'));
  const runs = loadSavedRuns(st, Date.parse('2026-11-28T11:00:00Z'));
  assert.equal(runs.length, MAX_SAVED_RUNS);
  assert.equal(runs[0].id, 'r5');
  saveRun({ ...mk('again', '2026-11-28T10:05:00Z', base), label: 'renamed' }, st, Date.parse('2026-11-28T11:00:00Z'));
  assert.equal(loadSavedRuns(st, Date.parse('2026-11-28T11:00:00Z')).filter((r) => r.finishedAt === '2026-11-28T10:05:00Z').length, 1);
  assert.equal(deleteSavedRun('r4', st, Date.parse('2026-11-28T11:00:00Z')).runs.some((r) => r.id === 'r4'), false);
  st.setItem(SAVED_RUNS_KEY, '{not json');
  assert.deepEqual(loadSavedRuns(st), []);
  assert.deepEqual(loadSavedRuns(null), []);
  st.setItem(SAVED_RUNS_KEY, JSON.stringify({ version: 1, runs: [{ id: 'old', label: 'x', testIds: [], results: {}, savedAt: 1 }] }));
  assert.deepEqual(loadSavedRuns(st, Date.parse('2026-11-28T11:00:00Z')), [], 'runs older than 30 days are dropped');
});
