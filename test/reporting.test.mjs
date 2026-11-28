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

test('mitigates CSV formula injection (CWE-1236) by neutralizing formula trigger characters', () => {
  assert.equal(formatCsvField('=1+1'), `"'=1+1"`);
  assert.equal(formatCsvField('+123'), ` "'+123"`.trim());
  assert.equal(formatCsvField('-cmd|calc'), `"'-cmd|calc"`);
  assert.equal(formatCsvField('@SUM(A1:A10)'), `"'@SUM(A1:A10)"`);
  assert.equal(formatCsvField('\tcmd'), `"'\tcmd"`);
  assert.equal(formatCsvField('\rcmd'), `"'\rcmd"`);
  assert.equal(formatCsvField('safe text'), `"safe text"`);
  assert.equal(formatCsvField('text "with" quotes'), `"text ""with"" quotes"`);
  assert.equal(formatCsvField(null), `""`);
  assert.equal(formatCsvField(undefined), `""`);
});

test('the report states that scored fixtures are same-site probes', async () => {
  const { generateHtmlReport } = await import('../src/lab/reporting.js');
  const html = generateHtmlReport({
    brandName: 'Lab', appVersion: '1', brandPromise: 'x', registry: [],
    scoreSummary: { overallScore: 0, coveragePercentage: 100, eligibleTotalTests: 35, maxScoredTests: 35, privacySignalsSummary: { activeCount: 0, totalSignals: 0 } },
    resultsMap: {}, userReported: {}
  });
  assert.match(html, /scored fixtures are same-site probes/);
});

// ---- export run context (measured vs blocked, controls, run metadata) ----
const reg = [
  { id: 'S1', name: 'Scored one', section: 's', metricGroup: 'AD_TRACKER_BLOCKING', audit: {} },
  ...Array.from({ length: 4 }, (_, i) => ({ id: `E${i}`, name: `Extra ${i}`, section: 's', metricGroup: 'EXPLORATORY_PROBE', audit: {} }))
];
const score = { overallScore: 0, coveragePercentage: 100, eligibleTotalTests: 35, maxScoredTests: 35, privacySignalsSummary: { activeCount: 3, totalSignals: 9 } };
const results = { S1: { status: 'ALLOWED' }, E0: { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' }, E1: { status: 'REQUEST_FAILED_CAUSE_UNKNOWN' }, E2: { status: 'ALLOWED' }, E3: { status: 'ALLOWED' } };
const okControls = [
  { host: 'www.gstatic.com', reached: true, ms: 70 },
  { host: 'github.githubassets.com', reached: true, ms: 80 },
  { host: 'cdn.jsdelivr.net', reached: true, ms: 90 }
];
const run = (over = {}) => ({ testIds: Object.keys(results), label: 'full', finishedAt: '2026-11-28T10:00:00.000Z', cancelled: false, timeoutMs: 2500, concurrency: 6, appVersion: '4.1.0', controls: okControls, ...over });
const html = (lastRun) => generateHtmlReport({ brandName: 'Lab', appVersion: '4.1.0', brandPromise: 'x', registry: reg, scoreSummary: score, resultsMap: results, userReported: {}, lastRun });

test('export no longer calls measured tests "blocking coverage" and separates measured from blocked', () => {
  const h = html(run());
  assert.doesNotMatch(h, /Core Blocking Coverage|core blocking fixtures/);
  assert.match(h, /Scored tests measured across all stored results: 35 of 35\. This counts scored tests that gave a result, not tests that blocked\./);
  assert.match(h, /Scored outcome in the most recent run only: 0 blocked, 0 partly blocked, 1 got through/);
});

test('export with healthy controls and failed third-party probes prints the reachability card, controls and run metadata', () => {
  const h = html(run());
  assert.match(h, /Third-party servers: 2 of 4 ad and tracker servers could not be reached/);
  assert.match(h, /3 of 3 ordinary control servers/);
  assert.match(h, /www\.gstatic\.com: answered in 70 ms/);
  assert.match(h, /finished: 2026-11-28T10:00:00\.000Z/);
  assert.match(h, /request time limit: 2500 ms/);
  assert.doesNotMatch(h, /blocker is active|DNS is working/i);
});

test('export with failed controls says not interpretable', () => {
  const bad = okControls.map((c) => ({ ...c, reached: false, error: 'TypeError' }));
  const h = html(run({ controls: bad }));
  assert.match(h, /not interpretable/);
  assert.match(h, /www\.gstatic\.com: not reached \(TypeError\)/);
});

test('export of a stopped run says it was stopped and does not interpret reachability', () => {
  const h = html(run({ cancelled: true, controls: okControls.map((c) => ({ ...c, reached: false, aborted: true })) }));
  assert.match(h, /run stopped early/);
  assert.match(h, /run was stopped before it finished/);
  assert.doesNotMatch(h, /not interpretable/);
});

test('export without a recorded run or controls says so and invents nothing', () => {
  const none = html(null);
  assert.match(none, /Run details: not recorded for these results\./);
  assert.match(none, /no control-server results were recorded/);
  assert.doesNotMatch(none, /Control servers \(ordinary/);
  const noControls = html(run({ controls: undefined }));
  assert.match(noControls, /no control-server results were recorded/);
  assert.doesNotMatch(noControls, /answered in/);
});

test('export escapes hostile control host and error text', () => {
  const h = html(run({ controls: [{ host: '<img src=x onerror=alert(1)>', reached: false, error: '<b>x</b>' }, ...okControls] }));
  assert.doesNotMatch(h, /<img src=x|<b>x<\/b>/);
  assert.match(h, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('a partial/custom run after a full run keeps the two scopes distinct in the export', () => {
  const all = { S1: { status: 'ALLOWED' }, S2: { status: 'ALLOWED' }, E0: { status: 'ALLOWED' } };
  const reg2 = [
    { id: 'S1', name: 'One', section: 's', metricGroup: 'AD_TRACKER_BLOCKING', audit: {} },
    { id: 'S2', name: 'Two', section: 's', metricGroup: 'AD_TRACKER_BLOCKING', audit: {} },
    { id: 'E0', name: 'Extra', section: 's', metricGroup: 'EXPLORATORY_PROBE', audit: {} }
  ];
  // Earlier full run left 35 of 35 stored; the latest run re-ran only S2 and had no controls.
  const h = generateHtmlReport({
    brandName: 'Lab', appVersion: '4.1.0', brandPromise: 'x', registry: reg2, scoreSummary: score, resultsMap: { ...all, S2: { status: 'BLOCKED' } }, userReported: {},
    lastRun: { testIds: ['S2'], label: 'custom', finishedAt: '2026-11-28T11:00:00.000Z', cancelled: false, timeoutMs: 2500, concurrency: 6, appVersion: '4.1.0' }
  });
  assert.match(h, /Scored tests measured across all stored results: 35 of 35/);
  assert.match(h, /Scored outcome in the most recent run only: 1 blocked, 0 partly blocked, 0 got through\./);
  assert.match(h, /scope: custom/);
  assert.match(h, /no control-server results were recorded/);
});
