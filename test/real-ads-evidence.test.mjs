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

test('does not treat visible iframe dimensions alone as a rendered creative', () => {
  const iframe = {
    tagName: 'IFRAME',
    offsetWidth: 728,
    offsetHeight: 90,
    getBoundingClientRect: () => ({ width: 728, height: 90 }),
    contentDocument: { querySelectorAll: () => [], querySelector: () => null }
  };
  const container = { children: [], querySelectorAll: (selector) => selector === 'iframe' ? [iframe] : [] };

  const result = inspectPlacementEvidence(container, { size: '728x90' });
  assert.equal(result.status, 'EMPTY_OR_NO_FILL');
  assert.equal(result.visible, false);
});

test('keeps visible opaque iframe content inconclusive instead of claiming a render', () => {
  const iframe = {
    tagName: 'IFRAME',
    offsetWidth: 728,
    offsetHeight: 90,
    getBoundingClientRect: () => ({ width: 728, height: 90 })
    // No accessible contentDocument represents an opaque/cross-origin frame.
  };
  const container = { children: [], querySelectorAll: (selector) => selector === 'iframe' ? [iframe] : [] };

  const result = inspectPlacementEvidence(container, { size: '728x90' });
  assert.equal(result.status, 'INCONCLUSIVE');
  assert.equal(result.visible, false);
  assert.deepEqual(result.alternatives, ['cross_origin_frame', 'opaque_provider_content']);
});

test('detects visible inspectable creative content inside a visible iframe', () => {
  const child = {
    tagName: 'IMG',
    naturalWidth: 300,
    naturalHeight: 250,
    getBoundingClientRect: () => ({ width: 300, height: 250 })
  };
  const frameDocument = {
    querySelectorAll: (selector) => selector.includes('img') ? [child] : [],
    querySelector: () => null
  };
  child.ownerDocument = { defaultView: { getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }) } };
  const iframe = {
    tagName: 'IFRAME',
    getBoundingClientRect: () => ({ width: 728, height: 90 }),
    contentDocument: frameDocument
  };
  const container = { children: [], querySelectorAll: (selector) => selector === 'iframe' ? [iframe] : [] };

  const result = inspectPlacementEvidence(container, { size: '728x90' });
  assert.equal(result.status, 'REAL_CREATIVE_RENDERED');
  assert.equal(result.visible, true);
  assert.deepEqual(result.metrics, { width: 300, height: 250 });
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


test('does not treat text in hidden or zero-sized native children as rendered', () => {
  const cases = [
    {
      label: 'zero-sized text child',
      dimensions: { width: 0, height: 0 },
      childStyle: { display: 'block', visibility: 'visible', opacity: '1' }
    },
    {
      label: 'display-hidden text child',
      dimensions: { width: 300, height: 250 },
      childStyle: { display: 'none', visibility: 'visible', opacity: '1' }
    },
    {
      label: 'transparent text child',
      dimensions: { width: 300, height: 250 },
      childStyle: { display: 'block', visibility: 'visible', opacity: '0' }
    }
  ];

  for (const scenario of cases) {
    const child = {
      tagName: 'DIV',
      innerText: 'ad creative',
      getBoundingClientRect: () => scenario.dimensions
    };
    const document = {
      defaultView: {
        getComputedStyle: (element) => element === child
          ? scenario.childStyle
          : { display: 'block', visibility: 'visible', opacity: '1' }
      }
    };
    child.ownerDocument = document;
    const container = {
      children: [child],
      querySelectorAll: () => [],
      ownerDocument: document
    };

    assert.equal(inspectPlacementEvidence(container).status, 'EMPTY_OR_NO_FILL', scenario.label);
  }
});

test('does not infer a rendered creative from iframe document content without visible outer geometry', () => {
  const iframe = {
    tagName: 'IFRAME',
    offsetWidth: 0,
    offsetHeight: 0,
    getBoundingClientRect: () => ({ width: 0, height: 0 }),
    contentDocument: {
      querySelectorAll: () => [{}],
      body: { children: [{}], innerText: 'provider creative' }
    }
  };
  const container = { children: [], querySelectorAll: (selector) => selector === 'iframe' ? [iframe] : [] };

  const result = inspectPlacementEvidence(container);
  assert.equal(result.status, 'EMPTY_OR_NO_FILL');
  assert.equal(result.visible, false);
});

test('continues to recognize a visible native creative with non-zero dimensions', () => {
  const child = {
    tagName: 'DIV',
    innerText: 'ad creative',
    getBoundingClientRect: () => ({ width: 300, height: 250 })
  };
  const document = {
    defaultView: {
      getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' })
    }
  };
  child.ownerDocument = document;
  const container = {
    children: [child],
    querySelectorAll: () => [],
    ownerDocument: document
  };

  const result = inspectPlacementEvidence(container);
  assert.equal(result.status, 'REAL_CREATIVE_RENDERED');
  assert.equal(result.visible, true);
  assert.equal(result.metrics.childCount, 1);
});
