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
    'My browser setup scored 13/100 on the AdBlocker Test Lab test probes (partial result, 4 of 35 scored same-site tests). One setup, one moment. Test yours: https://lab.frpboy.in'
  );
});

test('no score means no score claim in the share text', () => {
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: null, eligibleTotalTests: 0 }), resultsMap: {}, registry, lastRun: null });
  assert.equal(buildShareText(s), 'Try the AdBlocker Test Lab probes in your browser: https://lab.frpboy.in');
});

test('summary copy never uses em dashes', () => {
  const resultsMap = { 'TPA-01': { status: 'BLOCKED' }, 'DSP-01': { status: 'ERROR' } };
  const s = buildRunSummary({ scoreSummary: summaryOf(), resultsMap, registry, lastRun: null });
  const text = JSON.stringify(s) + buildShareText(s);
  assert.ok(!text.includes('—'));
});

test('a blocker that is on but hides few elements gets element-hiding advice (uBO Lite case)', () => {
  const reg = [
    { id: 'DSP-01', metricGroup: 'AD_TRACKER_BLOCKING' },
    { id: 'DSP-02', metricGroup: 'AD_TRACKER_BLOCKING' },
    { id: 'TPA-05', metricGroup: 'AD_TRACKER_BLOCKING' },
    { id: 'TRK-03', metricGroup: 'EXPLORATORY_PROBE' },
    { id: 'INT-04', metricGroup: 'PRIVACY_SIGNAL' },
    { id: 'TPA-02', metricGroup: 'EXPLORATORY_PROBE' }
  ];
  const resultsMap = {
    'DSP-01': { status: 'ALLOWED' },
    'DSP-02': { status: 'BLOCKED' },
    'TPA-05': { status: 'BLOCKED' },
    'TRK-03': { status: 'INCONCLUSIVE' },
    'INT-04': { status: 'INCONCLUSIVE' },
    'TPA-02': { status: 'ALLOWED' }
  };
  const scoreSummary = summaryOf({
    overallScore: 12,
    eligibleTotalTests: 35,
    maxScoredTests: 35,
    categoryBreakdown: [{ id: 'cosmetic_filtering', name: 'DOM Cosmetic Filtering', eligibleCount: 12, rawScore: 8.3, catBlocked: 1 }]
  });
  const s = buildRunSummary({ scoreSummary, resultsMap, registry: reg, lastRun: null });

  assert.equal(s.scoredFilteringSeen, true);
  assert.doesNotMatch(s.nextSteps[0], /Your blocker is active/);
  assert.match(s.nextSteps[0], /only 1 of 12 ad elements were hidden/);
  assert.match(s.nextSteps[0], /Complete/);
  assert.equal(s.scoredUnmeasured.length, 0);
  assert.equal(s.otherUnmeasured, 2);
  assert.ok(s.simple.some((l) => l === '2 privacy or extra checks could not be measured. These never count toward the score.'));
  assert.ok(!s.simple.some((l) => /left out of the score/.test(l)), 'non-scored checks must not be described as left out of the score');
});

test('nothing blocked at all explains the scored probes are same-site, without claiming a cause', () => {
  const reg = [{ id: 'DSP-01', metricGroup: 'AD_TRACKER_BLOCKING' }];
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: 0 }), resultsMap: { 'DSP-01': { status: 'ALLOWED' } }, registry: reg, lastRun: null });
  assert.equal(s.scoredFilteringSeen, false);
  assert.match(s.nextSteps[0], /^None of the scored probes were blocked/);
  assert.match(s.nextSteps[0], /network-level filtering is not measured/);
  assert.doesNotMatch(s.nextSteps[0], /DNS is working|blocker is (broken|failing)/i);
});

test('verdict titles say "scored" so they are not read as overall protection', () => {
  const mk = (score) => scoreVerdict({ overallScore: score, eligibleTotalTests: 35, maxScoredTests: 35, passedCount: 0, failedCount: 35 });
  for (const score of [0, 60, 95]) assert.match(mk(score).title, /scored probes/);
});

test('unreachable third-party servers alone never produce a claim that a blocker is active', () => {
  const reg = [
    { id: 'DSP-01', metricGroup: 'AD_TRACKER_BLOCKING' },
    { id: 'X1', metricGroup: 'EXPLORATORY_PROBE' }
  ];
  const s = buildRunSummary({
    scoreSummary: summaryOf({ overallScore: 0 }),
    resultsMap: { 'DSP-01': { status: 'ALLOWED' }, X1: { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' } },
    registry: reg,
    lastRun: null
  });
  assert.equal(s.scoredFilteringSeen, false);
  assert.match(s.nextSteps[0], /^None of the scored probes were blocked/);
  assert.ok(!s.nextSteps.join(' ').match(/blocker is active/i));
});

test('0 scored blocked + 7 failed third-party probes: no "blocker is active" claim anywhere in the summary', () => {
  const reg = [{ id: 'S1', metricGroup: 'AD_TRACKER_BLOCKING' }, ...Array.from({ length: 10 }, (_, i) => ({ id: `E${i}`, metricGroup: 'EXPLORATORY_PROBE' }))];
  const resultsMap = { S1: { status: 'ALLOWED' } };
  for (let i = 0; i < 10; i++) resultsMap[`E${i}`] = { status: i < 7 ? 'REQUEST_FAILED_CAUSE_UNKNOWN' : 'ALLOWED' };
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: 0 }), resultsMap, registry: reg, lastRun: null });
  const all = JSON.stringify(s);
  assert.doesNotMatch(all, /blocker is active|it stopped some requests/i);
  assert.match(s.nextSteps[0], /^None of the scored probes were blocked/);
});

test('rendered summary data: 0 scored blocked + 7 of 10 external failures + 3/3 controls reached', () => {
  const reg = [{ id: 'S1', metricGroup: 'AD_TRACKER_BLOCKING' }, ...Array.from({ length: 10 }, (_, i) => ({ id: `E${i}`, metricGroup: 'EXPLORATORY_PROBE' }))];
  const resultsMap = { S1: { status: 'ALLOWED' } };
  for (let i = 0; i < 10; i++) resultsMap[`E${i}`] = { status: i < 7 ? 'REQUEST_FAILED_CAUSE_UNKNOWN' : 'ALLOWED' };
  const controls = [{ reached: true }, { reached: true }, { reached: true }];
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: 0 }), resultsMap, registry: reg, lastRun: { controls, timeoutMs: 2500, cancelled: false } });
  const shown = [s.headline, ...s.simple, s.reachability.title, s.reachability.body, ...s.nextSteps].filter(Boolean).join('\n');
  assert.equal(s.reachability.state, 'some_unreachable');
  assert.match(shown, /7 of 10 ad and tracker servers could not be reached/);
  assert.match(shown, /3 of 3 ordinary control servers/);
  assert.match(shown, /None of the scored probes were blocked/);
  assert.doesNotMatch(shown, /blocker is active|stopped some requests|DNS is working|is blocking/i);
});

test('a cancelled run reports a stopped reachability state in the summary', () => {
  const reg = [{ id: 'E0', metricGroup: 'EXPLORATORY_PROBE' }];
  const s = buildRunSummary({ scoreSummary: summaryOf({ overallScore: 0 }), resultsMap: {}, registry: reg, lastRun: { cancelled: true, controls: [{ reached: false }, { reached: false }, { reached: false }] } });
  assert.equal(s.reachability.state, 'stopped');
});
