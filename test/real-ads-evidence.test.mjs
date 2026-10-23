import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectPlacementEvidence, normalizeRealAdsObservation } from '../src/lab/real-ads/evidence.js';

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

test('inspectPlacementEvidence returns INCONCLUSIVE when container is null', () => {
  const result = inspectPlacementEvidence(null);
  assert.equal(result.status, 'INCONCLUSIVE');
  assert.equal(result.visible, false);
});

test('inspectPlacementEvidence detects visible iframe as REAL_CREATIVE_RENDERED', () => {
  const container = {
    children: [],
    querySelectorAll(selector) {
      if (selector === 'iframe') {
        return [{
          tagName: 'IFRAME',
          offsetWidth: 728,
          offsetHeight: 90,
          getBoundingClientRect: () => ({ width: 728, height: 90 })
        }];
      }
      return [];
    }
  };

  const result = inspectPlacementEvidence(container, { size: '728x90' });
  assert.equal(result.status, 'REAL_CREATIVE_RENDERED');
  assert.equal(result.visible, true);
  assert.equal(result.metrics.width, 728);
  assert.equal(result.metrics.height, 90);
});

test('inspectPlacementEvidence detects empty container as EMPTY_OR_NO_FILL', () => {
  const container = {
    children: [],
    querySelectorAll: () => []
  };

  const result = inspectPlacementEvidence(container);
  assert.equal(result.status, 'EMPTY_OR_NO_FILL');
  assert.equal(result.visible, false);
});

test('keeps request failures inconclusive when causal evidence is ambiguous', () => {
  for (const alternative of ['CSP', 'DNS', 'connectivity', 'provider']) {
    const evidence = normalizeRealAdsObservation({
      provider: 'adsterra',
      placementId: 'slot',
      status: 'REQUEST_FAILED',
      visible: false,
      alternatives: [alternative]
    });
    assert.equal(evidence.status, 'REQUEST_FAILED');
    assert.equal(evidence.benchmarkEligible, false);
    assert.deepEqual(evidence.alternatives, [alternative]);
  }
});

test('normalizes unknown or absent statuses to INCONCLUSIVE without scoring', () => {
  for (const input of [{}, { status: 'DNS_FAILURE' }, { status: 'CSP_BLOCKED' }]) {
    const evidence = normalizeRealAdsObservation(input);
    assert.equal(evidence.status, 'INCONCLUSIVE');
    assert.equal(evidence.benchmarkEligible, false);
  }
});

test('does not infer a block solely from a hidden container without causal confirmation', () => {
  const container = {
    children: [],
    querySelectorAll: () => [],
    ownerDocument: {
      defaultView: {
        getComputedStyle: () => ({ display: 'none', visibility: 'visible', opacity: '1' })
      }
    }
  };

  const result = inspectPlacementEvidence(container);
  assert.equal(result.status, 'BLOCKED_OR_FILTERED_POSSIBLE');
  assert.equal(result.visible, false);
  assert.deepEqual(result.alternatives, ['cosmetic_filter', 'custom_css', 'element_hiding']);
  const observation = normalizeRealAdsObservation(result);
  assert.equal(observation.benchmarkEligible, false);
  assert.equal(observation.status, 'BLOCKED_OR_FILTERED_POSSIBLE');
});

test('does not claim a creative rendered when its iframe is zero-sized or display-hidden', () => {
  const container = {
    children: [],
    querySelectorAll(selector) {
      return selector === 'iframe' ? [{
        tagName: 'IFRAME',
        offsetWidth: 728,
        offsetHeight: 90,
        getBoundingClientRect: () => ({ width: 728, height: 90 }),
        ownerDocument: { defaultView: { getComputedStyle: () => ({ display: 'none', visibility: 'hidden' }) } }
      }] : [];
    }
  };

  const result = inspectPlacementEvidence(container, { size: '728x90' });
  assert.equal(result.status, 'EMPTY_OR_NO_FILL');
  assert.equal(result.visible, false);
});

