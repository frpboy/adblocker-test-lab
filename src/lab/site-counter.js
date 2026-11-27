// Browser side of the public counter (see api/_counter-core.js).
// A visit is counted once per browser session (a flag in sessionStorage, not a cookie);
// a test is counted each time a run finishes. Failures are silent: the chip just hides.

export const COUNTER_URL = '/api/counter';
const SESSION_FLAG = 'adblocker-test-lab:visit-counted';

function sessionStore() {
  try {
    return globalThis.sessionStorage || null;
  } catch {
    return null;
  }
}

function parseTotals(data) {
  if (!data || typeof data.visits !== 'number' || typeof data.testsRun !== 'number') return null;
  return { visits: data.visits, testsRun: data.testsRun };
}

async function request(fetchImpl, options) {
  try {
    const res = await fetchImpl(COUNTER_URL, options);
    if (!res.ok) return null;
    return parseTotals(await res.json());
  } catch {
    return null;
  }
}

function post(fetchImpl, event) {
  return request(fetchImpl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event }),
    keepalive: true
  });
}

/** Counts this visit once per session, then returns the totals (or null if unavailable). */
export async function recordVisitAndLoad({ fetchImpl = globalThis.fetch, storage = sessionStore() } = {}) {
  let alreadyCounted = false;
  try {
    alreadyCounted = storage?.getItem(SESSION_FLAG) === '1';
  } catch {
    alreadyCounted = false;
  }
  if (alreadyCounted) return request(fetchImpl, { method: 'GET' });

  // Mark before sending, so a second call made while this one is in flight only reads.
  // If storage is blocked, the visit may be counted again next load, which is acceptable.
  try {
    storage?.setItem(SESSION_FLAG, '1');
  } catch {
    // ignore
  }
  const totals = await post(fetchImpl, 'visit');
  if (totals) return totals;
  try {
    storage?.removeItem?.(SESSION_FLAG);
  } catch {
    // ignore
  }
  return request(fetchImpl, { method: 'GET' });
}

/** Counts one finished test run and returns the new totals (or null). */
export function recordTestRun({ fetchImpl = globalThis.fetch } = {}) {
  return post(fetchImpl, 'test');
}

export function formatCount(n, one, many) {
  return `${new Intl.NumberFormat().format(n)} ${n === 1 ? one : many}`;
}
