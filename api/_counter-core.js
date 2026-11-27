// Core of the public visit and test-run counter. Kept free of framework and driver
// details so it can be unit-tested with a fake `sql` function.
//
// Privacy: the counter stores two running totals and nothing else. No IP address,
// cookie, user agent, or identifier is read, stored, or logged here.

export const COUNTER_EVENTS = { visit: 'visits', test: 'tests_run' };

const ALLOWED_ORIGINS = new Set(['https://lab.frpboy.in', 'http://localhost:8080']);
// Vercel preview deployments of this project only.
const PREVIEW_ORIGIN = /^https:\/\/adblocker-test-[a-z0-9-]+-k4nn4ns-projects\.vercel\.app$/;

export function isAllowedOrigin(origin) {
  return typeof origin === 'string' && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin));
}

function toTotals(rows) {
  const totals = { visits: 0, testsRun: 0 };
  for (const row of rows || []) {
    if (row.name === 'visits') totals.visits = Number(row.value) || 0;
    if (row.name === 'tests_run') totals.testsRun = Number(row.value) || 0;
  }
  return totals;
}

/**
 * Handles one request. Returns { status, body, headers }.
 * `sql` is a tagged-template query function (the Neon serverless driver, or a fake in tests).
 */
export async function handleCounterRequest({ method, origin, body, sql }) {
  const noStore = { 'Cache-Control': 'no-store' };
  if (!sql) return { status: 503, body: { error: 'Counter is not configured' }, headers: noStore };

  try {
    if (method === 'GET') {
      const rows = await sql`SELECT name, value FROM site_counters`;
      // Not cached: a cached copy can be older than the total a visitor just saw after their
      // own visit was counted, which made the number appear to go down on reload.
      return { status: 200, body: toTotals(rows), headers: noStore };
    }

    if (method === 'POST') {
      if (!isAllowedOrigin(origin)) return { status: 403, body: { error: 'Origin not allowed' }, headers: noStore };
      const counter = COUNTER_EVENTS[body && body.event];
      if (!counter) return { status: 400, body: { error: 'Unknown event' }, headers: noStore };
      await sql`UPDATE site_counters SET value = value + 1, updated_at = now() WHERE name = ${counter}`;
      const rows = await sql`SELECT name, value FROM site_counters`;
      return { status: 200, body: toTotals(rows), headers: noStore };
    }

    return { status: 405, body: { error: 'Method not allowed' }, headers: { ...noStore, Allow: 'GET, POST' } };
  } catch {
    return { status: 500, body: { error: 'Counter unavailable' }, headers: noStore };
  }
}
