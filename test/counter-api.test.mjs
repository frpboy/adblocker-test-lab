import test from 'node:test';
import assert from 'node:assert/strict';
import { handleCounterRequest, isAllowedOrigin } from '../api/_counter-core.js';

// Fake tagged-template sql that keeps two counters in memory and records queries.
function fakeSql(start = { visits: 5, tests_run: 2 }) {
  const state = { ...start };
  const queries = [];
  const sql = (strings, ...values) => {
    const text = strings.join('?');
    queries.push({ text, values });
    if (text.startsWith('UPDATE')) state[values[0]] += 1;
    return Promise.resolve(Object.entries(state).map(([name, value]) => ({ name, value: String(value) })));
  };
  return { sql, state, queries };
}

const SITE = 'https://lab.frpboy.in';

test('GET returns the public totals with a short shared cache', async () => {
  const { sql } = fakeSql();
  const r = await handleCounterRequest({ method: 'GET', sql });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { visits: 5, testsRun: 2 });
  assert.match(r.headers['Cache-Control'], /s-maxage=30/);
});

test('POST visit and test each add exactly one', async () => {
  const { sql, state } = fakeSql();
  const v = await handleCounterRequest({ method: 'POST', origin: SITE, body: { event: 'visit' }, sql });
  const t = await handleCounterRequest({ method: 'POST', origin: SITE, body: { event: 'test' }, sql });
  assert.deepEqual(v.body, { visits: 6, testsRun: 2 });
  assert.deepEqual(t.body, { visits: 6, testsRun: 3 });
  assert.deepEqual(state, { visits: 6, tests_run: 3 });
  assert.equal(t.headers['Cache-Control'], 'no-store');
});

test('rejects other sites, unknown events, and other methods without touching the totals', async () => {
  const { sql, state } = fakeSql();
  assert.equal((await handleCounterRequest({ method: 'POST', origin: 'https://evil.example', body: { event: 'visit' }, sql })).status, 403);
  assert.equal((await handleCounterRequest({ method: 'POST', origin: undefined, body: { event: 'visit' }, sql })).status, 403);
  assert.equal((await handleCounterRequest({ method: 'POST', origin: SITE, body: { event: 'drop table' }, sql })).status, 400);
  assert.equal((await handleCounterRequest({ method: 'POST', origin: SITE, body: null, sql })).status, 400);
  assert.equal((await handleCounterRequest({ method: 'DELETE', origin: SITE, sql })).status, 405);
  assert.deepEqual(state, { visits: 5, tests_run: 2 });
});

test('event values reach the database only as a fixed counter name, as a query parameter', async () => {
  const { sql, queries } = fakeSql();
  await handleCounterRequest({ method: 'POST', origin: SITE, body: { event: 'test' }, sql });
  const update = queries.find((q) => q.text.startsWith('UPDATE'));
  assert.deepEqual(update.values, ['tests_run']);
});

test('reports unavailable instead of throwing when unconfigured or the database fails', async () => {
  assert.equal((await handleCounterRequest({ method: 'GET', sql: null })).status, 503);
  const failing = () => Promise.reject(new Error('connection refused'));
  const r = await handleCounterRequest({ method: 'GET', sql: failing });
  assert.equal(r.status, 500);
  assert.ok(!JSON.stringify(r.body).includes('connection refused'), 'internal errors are not exposed');
});

test('allows the site, local dev, and this project previews only', () => {
  assert.ok(isAllowedOrigin('https://lab.frpboy.in'));
  assert.ok(isAllowedOrigin('http://localhost:8080'));
  assert.ok(isAllowedOrigin('https://adblocker-test-5refq85ot-k4nn4ns-projects.vercel.app'));
  assert.ok(!isAllowedOrigin('https://adblocker-test-x-someone-else.vercel.app'));
  assert.ok(!isAllowedOrigin('https://lab.frpboy.in.evil.example'));
});
