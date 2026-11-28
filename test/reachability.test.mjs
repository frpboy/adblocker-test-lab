import test from 'node:test';
import assert from 'node:assert/strict';
import { probeEndpoint, runControls, summarizeReachability, classifyExternalStatus, CONTROL_ENDPOINTS } from '../src/lab/reachability.js';

const ok = async () => ({ type: 'opaque' });
const fail = async () => { throw new TypeError('Failed to fetch'); };

test('controls use cookie-less, referrer-less, no-cors requests', async () => {
  const seen = [];
  await runControls({ fetchImpl: async (url, init) => { seen.push([url, init]); return {}; } });
  assert.equal(seen.length, CONTROL_ENDPOINTS.length);
  for (const [, init] of seen) {
    assert.equal(init.mode, 'no-cors');
    assert.equal(init.credentials, 'omit');
    assert.equal(init.referrerPolicy, 'no-referrer');
    assert.equal(init.cache, 'no-store');
  }
});

test('probeEndpoint reports reached, failed, and timed out', async () => {
  assert.equal((await probeEndpoint('https://x.test/', { fetchImpl: ok })).reached, true);
  const f = await probeEndpoint('https://x.test/', { fetchImpl: fail });
  assert.equal(f.reached, false);
  assert.equal(f.error, 'TypeError');
  const slow = await probeEndpoint('https://x.test/', {
    timeoutMs: 20,
    fetchImpl: (u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' }))))
  });
  assert.equal(slow.reached, false);
  assert.equal(slow.error, 'TimeoutError');
  assert.equal(slow.timedOut, true);
});

test('only completed and unreachable statuses count; inconclusive does not', () => {
  assert.equal(classifyExternalStatus('ALLOWED'), 'reached');
  assert.equal(classifyExternalStatus('REQUEST_FAILED_CAUSE_UNKNOWN'), 'unreachable');
  assert.equal(classifyExternalStatus('INCONCLUSIVE'), null);
  assert.equal(classifyExternalStatus('ERROR'), null);
});

const probes = (statuses) => statuses.map((status, i) => ({ id: `P${i}`, name: `Probe ${i}`, status }));
const controls = (reached) => reached.map((r, i) => ({ id: `C${i}`, host: `c${i}.test`, reached: r }));

test('failures are only summarised against reachable controls, with no cause claimed', () => {
  const r = summarizeReachability({ probes: probes(['REQUEST_FAILED_CAUSE_UNKNOWN', 'REQUEST_FAILED_CAUSE_UNKNOWN', 'ALLOWED', 'ALLOWED', 'INCONCLUSIVE']), controls: controls([true, true, true]) });
  assert.equal(r.state, 'some_unreachable');
  assert.equal(r.unreachable, 2);
  assert.equal(r.measured, 4);
  assert.match(r.title, /2 of 4/);
  assert.match(r.body, /cannot tell which/);
  assert.doesNotMatch(r.body, /DNS is (on|working)|your blocker (is|was) (working|active)/i);
});

test('failed controls make the third-party result not interpretable', () => {
  const r = summarizeReachability({ probes: probes(['REQUEST_FAILED_CAUSE_UNKNOWN', 'REQUEST_FAILED_CAUSE_UNKNOWN', 'REQUEST_FAILED_CAUSE_UNKNOWN']), controls: controls([true, false, false]) });
  assert.equal(r.state, 'controls_failed');
  assert.match(r.body, /say nothing/);
});

test('all reached, too few, and not run', () => {
  assert.equal(summarizeReachability({ probes: probes(['ALLOWED', 'ALLOWED', 'ALLOWED']), controls: controls([true, true, true]) }).state, 'none_unreachable');
  assert.equal(summarizeReachability({ probes: probes(['ALLOWED', 'INCONCLUSIVE']), controls: controls([true, true, true]) }).state, 'too_few');
  assert.equal(summarizeReachability({ probes: probes(['ALLOWED', 'ALLOWED', 'ALLOWED']), controls: null }).state, 'not_run');
  assert.equal(summarizeReachability({ probes: [], controls: controls([true]) }).state, 'not_run');
});

test('two of three controls are enough; the none-unreachable text does not claim nothing was filtered', () => {
  const r = summarizeReachability({ probes: probes(['ALLOWED', 'ALLOWED', 'ALLOWED']), controls: controls([true, true, false]) });
  assert.equal(r.state, 'none_unreachable');
  assert.match(r.body, /does not show that nothing was filtered/);
});

test('a slow control fetch that never answers is a timeout, and a user abort is not', async () => {
  const hang = (u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(Object.assign(new Error('x'), { name: 'AbortError' }))));
  const slow = await runControls({ fetchImpl: hang, timeoutMs: 20 });
  assert.ok(slow.every((c) => c.reached === false && c.timedOut === true && c.error === 'TimeoutError'));
  const user = new AbortController();
  const p = runControls({ fetchImpl: hang, timeoutMs: 5000, signal: user.signal });
  user.abort();
  const stopped = await p;
  assert.ok(stopped.every((c) => c.reached === false && c.timedOut === false && c.aborted === true));
});

test('timeout uncertainty is stated whenever failures are shown', () => {
  const probes = Array.from({ length: 4 }, (_, i) => ({ id: `E${i}`, name: `E${i}`, status: i < 2 ? 'REQUEST_FAILED_CAUSE_UNKNOWN' : 'ALLOWED' }));
  const good = [{ reached: true }, { reached: true }, { reached: true }];
  const r = summarizeReachability({ probes, controls: good, timeoutMs: 2500 });
  assert.equal(r.state, 'some_unreachable');
  assert.match(r.body, /longer than 2\.5 seconds counts as not reached, so a slow connection can look the same/);
  const bad = summarizeReachability({ probes, controls: [{ reached: false }, { reached: false }, { reached: false }], timeoutMs: 2500 });
  assert.equal(bad.state, 'controls_failed');
  assert.match(bad.body, /slow/);
});

test('a stopped run gets a stopped-run summary, never "controls failed"', () => {
  const probes = [{ id: 'E1', name: 'E1', status: 'REQUEST_FAILED_CAUSE_UNKNOWN' }];
  const aborted = [{ reached: false, aborted: true }, { reached: false, aborted: true }, { reached: false, aborted: true }];
  const r = summarizeReachability({ probes, controls: aborted, cancelled: true, timeoutMs: 2500 });
  assert.equal(r.state, 'stopped');
  assert.match(r.title, /stopped early/);
  assert.doesNotMatch(r.body, /not be reached|offline/);
});

test('the lab own ad/tracker probe and the controls share one set of request options', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../AdBlockerTestLab.jsx', import.meta.url), 'utf8');
  assert.match(src, /fetch\(testItem\.targetUrl, \{ \.\.\.PROBE_FETCH_OPTIONS, signal/);
  const { PROBE_FETCH_OPTIONS } = await import('../src/lab/reachability.js');
  assert.deepEqual({ ...PROBE_FETCH_OPTIONS }, { method: 'GET', mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' });
});
