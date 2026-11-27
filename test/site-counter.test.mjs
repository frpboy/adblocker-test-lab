import test from 'node:test';
import assert from 'node:assert/strict';
import { recordVisitAndLoad, recordTestRun, formatCount } from '../src/lab/site-counter.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

function fakeFetch(totals = { visits: 10, testsRun: 3 }, { fail = false } = {}) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, method: options.method, body: options.body });
    if (fail) throw new TypeError('Failed to fetch');
    if (options.method === 'POST') {
      const { event } = JSON.parse(options.body);
      if (event === 'visit') totals.visits += 1;
      if (event === 'test') totals.testsRun += 1;
    }
    return { ok: true, json: async () => ({ ...totals }) };
  };
  return { fn, calls };
}

test('counts a visit once per session, then only reads', async () => {
  const storage = memoryStorage();
  const { fn, calls } = fakeFetch();
  assert.deepEqual(await recordVisitAndLoad({ fetchImpl: fn, storage }), { visits: 11, testsRun: 3 });
  assert.deepEqual(await recordVisitAndLoad({ fetchImpl: fn, storage }), { visits: 11, testsRun: 3 });
  assert.deepEqual(calls.map((c) => c.method), ['POST', 'GET']);
  assert.equal(JSON.parse(calls[0].body).event, 'visit');
});

test('counts a finished test run', async () => {
  const { fn } = fakeFetch();
  assert.deepEqual(await recordTestRun({ fetchImpl: fn }), { visits: 10, testsRun: 4 });
});

test('returns null instead of throwing when the counter is unreachable', async () => {
  const { fn } = fakeFetch({ visits: 1, testsRun: 1 }, { fail: true });
  assert.equal(await recordVisitAndLoad({ fetchImpl: fn, storage: memoryStorage() }), null);
  assert.equal(await recordTestRun({ fetchImpl: fn }), null);
  const notFound = async () => ({ ok: false, json: async () => ({}) });
  assert.equal(await recordVisitAndLoad({ fetchImpl: notFound, storage: memoryStorage() }), null);
});

test('formats counts in the visitor locale with correct plurals', () => {
  assert.equal(formatCount(1, 'visit', 'visits'), '1 visit');
  assert.equal(formatCount(1248000, 'visit', 'visits'), `${new Intl.NumberFormat().format(1248000)} visits`);
  assert.equal(formatCount(0, 'test run', 'tests run'), '0 tests run');
});

test('two overlapping calls on startup count the visit only once', async () => {
  const storage = memoryStorage();
  const { fn, calls } = fakeFetch();
  await Promise.all([recordVisitAndLoad({ fetchImpl: fn, storage }), recordVisitAndLoad({ fetchImpl: fn, storage })]);
  assert.equal(calls.filter((c) => c.method === 'POST').length, 1);
});
