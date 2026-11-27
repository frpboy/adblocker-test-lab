import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBenchmarkScore } from '../src/lab/scoring.js';

const registry = [
  { id: 'CORE-01', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
  { id: 'PRIV-01', metricGroup: 'PRIVACY_SIGNAL', scoringCategory: 'privacy', audit: { scoringEligible: false } },
  { id: 'EXP-01', metricGroup: 'EXPLORATORY_PROBE', scoringCategory: 'core', audit: { scoringEligible: false } }
];

test('keeps privacy and exploratory statuses out of the authoritative score', () => {
  const score = calculateBenchmarkScore({
    'CORE-01': { status: 'ALLOWED' },
    'PRIV-01': { status: 'SIGNAL_ACTIVE' },
    'EXP-01': { status: 'BLOCKED' }
  }, [{ id: 'core', defaultWeight: 100 }], registry);

  assert.equal(score.overallScore, 0);
  assert.equal(score.eligibleTotalTests, 1);
  assert.equal(score.privacySignalsSummary.activeCount, 1);
});

test('outcome counts cover scored tests only, with extra checks summarised separately', () => {
  const reg = [
    { id: 'C1', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'C2', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'C3', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'X1', metricGroup: 'EXPLORATORY_PROBE', scoringCategory: 'core', audit: { scoringEligible: false } },
    { id: 'X2', metricGroup: 'EXPLORATORY_PROBE', scoringCategory: 'core', audit: { scoringEligible: false } },
    { id: 'X3', metricGroup: 'EXPLORATORY_PROBE', scoringCategory: 'core', audit: { scoringEligible: false } }
  ];
  const s = calculateBenchmarkScore(
    {
      C1: { status: 'BLOCKED' },
      C2: { status: 'ALLOWED' },
      C3: { status: 'INCONCLUSIVE' },
      X1: { status: 'ALLOWED' },
      X2: { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' },
      X3: { status: 'INCONCLUSIVE' }
    },
    [{ id: 'core', defaultWeight: 100 }],
    reg
  );
  assert.equal(s.passedCount, 1);
  assert.equal(s.failedCount, 1, 'extra-check ALLOWED must not count as "got through"');
  assert.equal(s.inconclusiveCount, 1);
  assert.equal(s.scoredUnmeasuredCount, 1);
  assert.equal(s.passedCount + s.partialCount + s.failedCount + s.scoredUnmeasuredCount, 3);
  assert.deepEqual(s.exploratorySummary, { executed: 3, completed: 1, failed: 1, unmeasured: 1 });
  assert.equal(s.causeUnknownCount, 1);
});
