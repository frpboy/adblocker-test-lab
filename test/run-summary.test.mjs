import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRunSummary, buildShareText, scoreVerdict } from '../src/lab/run-summary.js';

const registry = [
  { id: 'DSP-01', name: 'Leaderboard', metricGroup: 'AD_TRACKER_BLOCKING' },
  { id: 'TPA-01', name: 'Ad script', metricGroup: 'AD_TRACKER_BLOCKING' },
  { id: 'TRK-01', name: 'Pixel', metricGroup: 'AD_TRACKER_BLOCKING' },
  { id: 'FPR-01', name: 'GPC', metricGroup: 'PRIVACY_SIGNAL' },
  { id: 'TRK-02', name: 'Analytics domain', metricGroup: 'EXPLORATORY_PROBE' }
];

const summaryOf = (overrides) => ({
  overallScore: 50,
  eligibleTotalTests: 2,
  maxScoredTests: 3,
  passedCount: 1,
  partialCount: 0,
  failedCount: 1,
  categoryBreakdown: [],
  ...overrides
});

test('groups the last run by outcome and explains what could not be measured', () => {
  const resultsMap = {
    'DSP-01': { status: 'INCONCLUSIVE' },
    'TPA-01': { status: 'BLOCKED' },
    'TRK-01': { status: 'ALLOWED' },
    'FPR-01': { status: 'SIGNAL_INACTIVE' },
    'TRK-02': { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' }
  };
  const s = buildRunSummary({ scoreSummary: summaryOf(), resultsMap, registry, lastRun: { testIds: registry.map((t) => t.id) } });

  assert.equal(s.scope, 'full');
  assert.deepEqual(s.blocked.map((t) => t.id), ['TPA-01']);
  assert.deepEqual(s.allowed.map((t) => t.id), ['TRK-01']);
  assert.deepEqual(s.unmeasured.map((t) => t.id), ['DSP-01']);
  assert.match(s.unmeasured[0].reason, /could not tell/);
  assert.deepEqual(s.extraFailed.map((t) => t.id), ['TRK-02']);
  assert.equal(s.privacyOff.length, 1);
  assert.ok(s.simple.some((line) => line.includes('1 blocked, 0 partly blocked, 1 got through')));
});

test('lists only tests from the last run', () => {
  const resultsMap = { 'TPA-01': { status: 'BLOCKED' }, 'TRK-01': { status: 'ALLOWED' } };
  const s = buildRunSummary({ scoreSummary: summaryOf(), resultsMap, registry, lastRun: { testIds: ['TPA-01'], label: 'quick' } });
  assert.equal(s.testsInRun, 1);
  assert.equal(s.scope, 'quick');
  assert.deepEqual(s.allowed, []);
});

test('a partial result is labelled partial everywhere, including the share text', () => {
  const partial = summaryOf({ overallScore: 13, eligibleTotalTests: 4, maxScoredTests: 35 });
  assert.equal(scoreVerdict(partial).title, 'Partial result');
  const s = buildRunSummary({ scoreSummary: partial, resultsMap: {}, registry, lastRun: null });
  assert.equal(s.partial, true);
  assert.equal(
    buildShareText(s, 'https://lab.frpboy.in'),
    'My ad blocker scored 13/100 on AdBlocker Test Lab (partial result, 4 of 35 scored tests). Test yours: https://lab.frpboy.in'
  );
});

test('no score means no score claim in the share text', () => {
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: null, eligibleTotalTests: 0 }), resultsMap: {}, registry, lastRun: null });
  assert.equal(buildShareText(s), 'Check what your ad blocker really stops: https://lab.frpboy.in');
});

test('summary copy never uses em dashes', () => {
  const resultsMap = { 'TPA-01': { status: 'BLOCKED' }, 'DSP-01': { status: 'ERROR' } };
  const s = buildRunSummary({ scoreSummary: summaryOf(), resultsMap, registry, lastRun: null });
  const text = JSON.stringify(s) + buildShareText(s);
  assert.ok(!text.includes('—'));
});
