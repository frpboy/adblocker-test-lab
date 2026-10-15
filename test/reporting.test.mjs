import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHtmlReport } from '../src/lab/reporting.js';

test('escapes hostile user-reported text in standalone HTML', () => {
  const html = generateHtmlReport({
    brandName: 'Lab',
    appVersion: '1.0.0',
    brandPromise: 'Evidence first',
    registry: [],
    scoreSummary: { overallScore: null, coveragePercentage: 0, eligibleTotalTests: 0, maxScoredTests: 0, privacySignalsSummary: { activeCount: 0, totalSignals: 0 } },
    resultsMap: {},
    userReported: { notes: '<script>alert(1)</script>' }
  });

  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
