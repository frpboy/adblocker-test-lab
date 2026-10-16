import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRealAdsObservation } from '../src/lab/real-ads/evidence.js';

for (const status of ['NOT_STARTED', 'SCRIPT_LOADING', 'SCRIPT_LOADED', 'REAL_CREATIVE_RENDERED', 'EMPTY_OR_NO_FILL', 'REQUEST_FAILED', 'BLOCKED_OR_FILTERED_POSSIBLE', 'PROVIDER_ERROR', 'INCONCLUSIVE']) {
  test(`normalizes ${status} without benchmark attribution`, () => {
    const evidence = normalizeRealAdsObservation({ provider: 'adsterra', placementId: 'slot', status, visible: status === 'REAL_CREATIVE_RENDERED' });
    assert.equal(evidence.status, status);
    assert.equal(evidence.benchmarkEligible, false);
  });
}

test('does not call a hidden or indirect observation a rendered creative', () => {
  assert.equal(normalizeRealAdsObservation({ provider: 'adsterra', placementId: 'slot', status: 'REAL_CREATIVE_RENDERED', visible: false }).status, 'INCONCLUSIVE');
});

test('keeps session context with non-scoring placement evidence', () => {
  const evidence = normalizeRealAdsObservation({
    provider: 'adsterra', placementId: 'slot', status: 'SCRIPT_LOADING', viewport: '390x844', format: 'banner', dimensions: '320x50'
  });

  assert.equal(evidence.viewport, '390x844');
  assert.equal(evidence.format, 'banner');
  assert.equal(evidence.dimensions, '320x50');
});
