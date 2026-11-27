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

test('splits the scored tests by what they observe and counts only measured ones', () => {
  const reg = [
    { id: 'H1', type: 'cosmetic_dom', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'H2', type: 'anti_adblock_bait_check', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'R1', type: 'url_pattern_probe', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'R2', type: 'xhr_pattern_probe', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'P1', type: 'popup_filter_check', metricGroup: 'AD_TRACKER_BLOCKING', scoringCategory: 'core', audit: { scoringEligible: true } },
    { id: 'X1', type: 'external_domain_probe', metricGroup: 'EXPLORATORY_PROBE', scoringCategory: 'core', audit: { scoringEligible: false } }
  ];
  const s = calculateBenchmarkScore(
    {
      H1: { status: 'BLOCKED' },
      H2: { status: 'PARTIAL' },
      R1: { status: 'ALLOWED' },
      R2: { status: 'INCONCLUSIVE' },
      P1: { status: 'INCONCLUSIVE' },
      X1: { status: 'BLOCKED' }
    },
    [{ id: 'core', defaultWeight: 100 }],
    reg
  );
  const byId = Object.fromEntries(s.evidenceGroups.map((g) => [g.id, g]));
  assert.deepEqual([byId.element_hiding.blocked, byId.element_hiding.partial, byId.element_hiding.share], [1, 1, 75]);
  assert.deepEqual([byId.request_blocking.allowed, byId.request_blocking.eligible, byId.request_blocking.share], [1, 1, 0]);
  assert.equal(byId.popup_behaviour.eligible, 0);
  assert.equal(byId.popup_behaviour.share, null, 'an unmeasured group has no percentage');
  assert.equal(byId.other, undefined, 'exploratory probes never appear in the scored groups');
});
