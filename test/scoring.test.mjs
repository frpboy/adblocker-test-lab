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
