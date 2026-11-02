import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHtmlReport, formatCsvField } from '../src/lab/reporting.js';

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

test('neutralizes formula injection characters in formatCsvField (CWE-1236)', () => {
  assert.equal(formatCsvField('=1+1'), `"'=1+1"`);
  assert.equal(formatCsvField('+cmd|'), ` "'+cmd|"`.trim());
  assert.equal(formatCsvField('-SUM(A1:A10)'), `"'-SUM(A1:A10)"`);
  assert.equal(formatCsvField('@calc'), `"'@calc"`);
  assert.equal(formatCsvField('\tcmd'), `"'\tcmd"`);
  assert.equal(formatCsvField('\rcmd'), `"'\rcmd"`);
  assert.equal(formatCsvField('Normal Text'), '"Normal Text"');
  assert.equal(formatCsvField('Quotes "here"'), '"Quotes ""here"""');
  assert.equal(formatCsvField(null), '""');
  assert.equal(formatCsvField(undefined), '""');
});
