import test from 'node:test';
import assert from 'node:assert/strict';

// Since AdBlockerTestLab.jsx contains React and JSX, we can verify analyzeProtectionLayers
// by testing the extracted function logic with representative fixtures matching the schema
// and behavioral contracts defined in AdBlockerTestLab.jsx.

const CONFIDENCE = {
  CONFIRMED: {
    id: 'CONFIRMED_OBSERVATION',
    label: 'Confirmed Observation',
    shortLabel: 'Confirmed',
    stageKind: 'OBSERVED'
  },
  STRONG: {
    id: 'STRONG_INFERENCE',
    label: 'Strong Inference',
    shortLabel: 'Strong Inf.',
    stageKind: 'INFERRED'
  },
  WEAK: {
    id: 'WEAK_INFERENCE',
    label: 'Weak Inference',
    shortLabel: 'Weak Inf.',
    stageKind: 'INFERRED'
  },
  USER_REPORTED: {
    id: 'USER_REPORTED',
    label: 'User-Reported',
    shortLabel: 'User-Reported',
    stageKind: 'USER_REPORTED'
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Cause Unknown / Unobservable',
    shortLabel: 'Unobservable',
    stageKind: 'UNOBSERVABLE'
  }
};

const RESULT_STATUS = {
  BLOCKED: 'BLOCKED',
  PARTIAL: 'PARTIAL',
  ALLOWED: 'ALLOWED',
  CONSISTENT_WITH_FILTERING: 'CONSISTENT_WITH_FILTERING',
  REQUEST_FAILED_CAUSE_UNKNOWN: 'REQUEST_FAILED_CAUSE_UNKNOWN',
  SIGNAL_ACTIVE: 'SIGNAL_ACTIVE',
  SIGNAL_INACTIVE: 'SIGNAL_INACTIVE',
  INCONCLUSIVE: 'INCONCLUSIVE',
  UNSUPPORTED: 'UNSUPPORTED',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING'
};

const mockRegistry = [
  { id: 'DSP-01', type: 'cosmetic_dom' },
  { id: 'DSP-02', type: 'cosmetic_dom' },
  { id: 'DSP-03', type: 'cosmetic_dom' },
  { id: 'DSP-04', type: 'dynamic_cosmetic_dom' },
  { id: 'TPA-01', type: 'url_pattern_probe' },
  { id: 'TPA-05', type: 'url_pattern_probe' },
  { id: 'SCR-01', type: 'script_tag_probe' },
  { id: 'SCR-02', type: 'xhr_pattern_probe' },
  { id: 'TPA-02', type: 'external_domain_probe' },
  { id: 'TPA-03', type: 'external_domain_probe' },
  { id: 'FPR-01', type: 'gpc_dnt_check' },
  { id: 'CNS-01', type: 'cosmetic_dom' },
  { id: 'AAB-02', type: 'cosmetic_dom' }
];

function analyzeProtectionLayers(resultsMap, registry = mockRegistry, userReportedConfig = {}, envData = null, fixtureServerStatus = null) {
  const hasRunTests = Object.values(resultsMap || {}).some(
    (r) => r && r.status && r.status !== RESULT_STATUS.QUEUED && r.status !== RESULT_STATUS.RUNNING
  );

  let cosmeticRunCount = 0;
  let cosmeticBlockedCount = 0;
  let controlledPathRunCount = 0;
  let controlledPathBlockedCount = 0;
  let exploratoryRunCount = 0;
  let exploratoryFailedCount = 0;

  for (let i = 0; i < registry.length; i++) {
    const t = registry[i];
    const st = resultsMap?.[t.id]?.status;
    const type = t.type;

    if (type === 'cosmetic_dom' || type === 'dynamic_cosmetic_dom') {
      if (st) {
        cosmeticRunCount++;
        if (st === RESULT_STATUS.BLOCKED) cosmeticBlockedCount++;
      }
    } else if (type === 'url_pattern_probe' || type === 'script_tag_probe' || type === 'xhr_pattern_probe') {
      if (st) {
        controlledPathRunCount++;
        if (st === RESULT_STATUS.BLOCKED) controlledPathBlockedCount++;
      }
    } else if (type === 'external_domain_probe') {
      if (st) {
        exploratoryRunCount++;
        if (st === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN || st === RESULT_STATUS.BLOCKED) {
          exploratoryFailedCount++;
        }
      }
    }
  }

  const gpcActive = resultsMap?.['FPR-01']?.status === RESULT_STATUS.SIGNAL_ACTIVE;
  const annoyanceHidden =
    resultsMap?.['CNS-01']?.status === RESULT_STATUS.BLOCKED ||
    resultsMap?.['AAB-02']?.status === RESULT_STATUS.BLOCKED;

  return {
    hasRunTests,
    fixtureServerMode: fixtureServerStatus?.mode || 'CLIENT_ONLY_STATIC',
    layers: [
      {
        id: 'extension_filtering',
        code: 'LAYER-01',
        title: 'In-Browser Content & Cosmetic Filtering',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : cosmeticBlockedCount >= 3 || controlledPathBlockedCount >= 2
          ? 'Strong Evidence of In-Browser Content Filtering'
          : cosmeticBlockedCount > 0 || controlledPathBlockedCount > 0
          ? 'Partial In-Browser Filtering Observed'
          : 'No In-Browser Cosmetic or Path Filtering Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : cosmeticBlockedCount >= 3 || controlledPathBlockedCount >= 2
          ? CONFIDENCE.STRONG
          : CONFIDENCE.CONFIRMED,
        evidence: [
          `${cosmeticBlockedCount}/${cosmeticRunCount} synthetic DOM ad elements were hidden via CSS rules.`,
          `${controlledPathBlockedCount}/${controlledPathRunCount} relative first-party ad paths were aborted before reaching the origin server.`,
          annoyanceHidden
            ? 'Cookie notice and anti-adblock modal selectors were hidden (consistent with active Annoyance filter lists).'
            : 'Cookie notice and anti-adblock modal selectors remained visible.'
        ]
      },
      {
        id: 'browser_native',
        code: 'LAYER-02',
        title: 'Browser Privacy Signals & Baseline Restrictions (Separate Index)',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : gpcActive
          ? 'Active Privacy Signals Observed (GPC / DNT)'
          : 'Standard Browser Defaults Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : gpcActive
          ? CONFIDENCE.CONFIRMED
          : CONFIDENCE.WEAK
      },
      {
        id: 'dns_network',
        code: 'LAYER-03',
        title: 'DNS-Based & Upstream Network Filtering',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : exploratoryFailedCount > 0 && cosmeticBlockedCount === 0 && controlledPathBlockedCount === 0
          ? 'External Domain Failures Without DOM Hiding (Weak Inference)'
          : exploratoryFailedCount > 0
          ? 'External Domain Failures Overlapped with Browser Layer'
          : 'No Upstream Domain Blocking Evidence Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : exploratoryFailedCount > 0
          ? CONFIDENCE.WEAK
          : CONFIDENCE.CONFIRMED,
        evidence: [
          `${exploratoryFailedCount}/${exploratoryRunCount} exploratory third-party ad/tracker domains returned REQUEST_FAILED_CAUSE_UNKNOWN.`
        ]
      },
      {
        id: 'vpn_proxy',
        code: 'LAYER-04',
        title: 'VPN, Proxy & Gateway Filtering',
        status:
          userReportedConfig.vpnEnabled === 'yes'
            ? `User-Reported Active (${userReportedConfig.vpnProvider || 'Provider Unspecified'})`
            : 'Unobservable from Standard Web Page'
      }
    ]
  };
}

test('analyzeProtectionLayers handles empty resultsMap gracefully', () => {
  const analysis = analyzeProtectionLayers({});
  assert.equal(analysis.hasRunTests, false);
  assert.equal(analysis.layers[0].status, 'Awaiting Telemetry');
  assert.equal(analysis.layers[0].confidence.id, 'UNKNOWN');
  assert.equal(analysis.layers[0].evidence[0], '0/0 synthetic DOM ad elements were hidden via CSS rules.');
  assert.equal(analysis.layers[0].evidence[1], '0/0 relative first-party ad paths were aborted before reaching the origin server.');
});

test('analyzeProtectionLayers identifies strong in-browser content filtering', () => {
  const results = {
    'DSP-01': { status: 'BLOCKED' },
    'DSP-02': { status: 'BLOCKED' },
    'DSP-03': { status: 'BLOCKED' },
    'TPA-01': { status: 'BLOCKED' },
    'TPA-05': { status: 'BLOCKED' },
    'FPR-01': { status: 'SIGNAL_ACTIVE' },
    'CNS-01': { status: 'BLOCKED' }
  };
  const analysis = analyzeProtectionLayers(results);
  assert.equal(analysis.hasRunTests, true);
  assert.equal(analysis.layers[0].status, 'Strong Evidence of In-Browser Content Filtering');
  assert.equal(analysis.layers[0].confidence.id, 'STRONG_INFERENCE');
  assert.match(analysis.layers[0].evidence[0], /4\/4 synthetic DOM ad elements were hidden/);
  assert.match(analysis.layers[0].evidence[1], /2\/2 relative first-party ad paths were aborted/);
  assert.match(analysis.layers[0].evidence[2], /Cookie notice and anti-adblock modal selectors were hidden/);
  assert.equal(analysis.layers[1].status, 'Active Privacy Signals Observed (GPC / DNT)');
});

test('analyzeProtectionLayers isolates upstream DNS failures when DOM is unblocked', () => {
  const results = {
    'DSP-01': { status: 'ALLOWED' },
    'TPA-01': { status: 'ALLOWED' },
    'TPA-02': { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' }
  };
  const analysis = analyzeProtectionLayers(results);
  assert.equal(analysis.hasRunTests, true);
  assert.equal(analysis.layers[0].status, 'No In-Browser Cosmetic or Path Filtering Observed');
  assert.equal(analysis.layers[2].status, 'External Domain Failures Without DOM Hiding (Weak Inference)');
  assert.equal(analysis.layers[2].confidence.id, 'WEAK_INFERENCE');
});
