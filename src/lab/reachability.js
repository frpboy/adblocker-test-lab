// Third-party reachability: do ad and tracker servers answer from this browser, compared
// with ordinary servers that should answer on any working connection?
//
// A page cannot tell WHY a cross-origin request failed (DNS filter, VPN, firewall,
// request-blocking extension, or a server problem all look the same). So this module never
// claims a cause and never feeds the 0-100 score. It only counts what was reachable, and
// refuses to interpret failures when the control servers were not reachable either.

// Control servers: unrelated operators, static files, not on the StevenBlack, AdGuard DNS or
// OISD (small) lists when checked on 2026-11-28. Requests carry no cookies and no referrer.
export const CONTROL_ENDPOINTS = [
  { id: 'CTL-1', host: 'www.gstatic.com', operator: 'Google', url: 'https://www.gstatic.com/generate_204' },
  { id: 'CTL-2', host: 'github.githubassets.com', operator: 'GitHub', url: 'https://github.githubassets.com/favicons/favicon.png' },
  { id: 'CTL-3', host: 'cdn.jsdelivr.net', operator: 'jsDelivr', url: 'https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.css' }
];

export const MIN_CONTROLS_REACHED = 2;
export const MIN_MEASURED_SERVERS = 3;

const UNREACHABLE_STATUSES = new Set(['REQUEST_FAILED_CAUSE_UNKNOWN', 'BLOCKED', 'CONSISTENT_WITH_FILTERING']);

/** reached / unreachable for an extra (third-party) check status, or null when it gave no clear answer. */
export function classifyExternalStatus(status) {
  if (status === 'ALLOWED') return 'reached';
  if (UNREACHABLE_STATUSES.has(status)) return 'unreachable';
  return null;
}

/** One cross-origin request, the same way the lab's third-party checks make it. */
export async function probeEndpoint(url, { fetchImpl = globalThis.fetch, timeoutMs = 2500, signal } = {}) {
  const t0 = Date.now();
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetchImpl(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    });
    return { reached: true, ms: Date.now() - t0 };
  } catch (err) {
    return { reached: false, ms: Date.now() - t0, aborted: Boolean(signal?.aborted), error: err?.name || 'NetworkError' };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function runControls({ endpoints = CONTROL_ENDPOINTS, fetchImpl, timeoutMs, signal } = {}) {
  const results = await Promise.all(endpoints.map((e) => probeEndpoint(e.url, { fetchImpl, timeoutMs, signal })));
  return endpoints.map((e, i) => ({ id: e.id, host: e.host, operator: e.operator, ...results[i] }));
}

/**
 * probes: [{ id, name, status }] for the third-party checks in the run.
 * controls: result of runControls for the same run, or null/undefined when none were run.
 */
export function summarizeReachability({ probes = [], controls } = {}) {
  const measured = probes
    .map((p) => ({ ...p, outcome: classifyExternalStatus(p.status) }))
    .filter((p) => p.outcome);
  const unreachableList = measured.filter((p) => p.outcome === 'unreachable');
  const reachedList = measured.filter((p) => p.outcome === 'reached');
  const controlsTotal = Array.isArray(controls) ? controls.length : 0;
  const controlsReached = Array.isArray(controls) ? controls.filter((c) => c.reached).length : 0;
  const base = {
    measured: measured.length,
    unreachable: unreachableList.length,
    reached: reachedList.length,
    unreachableList,
    reachedList,
    controlsTotal,
    controlsReached
  };

  if (!probes.length || !controlsTotal) {
    return {
      ...base,
      state: 'not_run',
      title: 'Third-party servers: not checked in this run',
      body: 'Run the full test to see whether ad and tracker servers could be reached, next to ordinary control servers.'
    };
  }
  if (controlsReached < Math.min(MIN_CONTROLS_REACHED, controlsTotal)) {
    return {
      ...base,
      state: 'controls_failed',
      title: 'Third-party servers: not interpretable',
      body: `Only ${controlsReached} of ${controlsTotal} ordinary control servers could be reached, so failures to reach ad and tracker servers say nothing here. The connection may be offline or restricted.`
    };
  }
  if (measured.length < MIN_MEASURED_SERVERS) {
    return {
      ...base,
      state: 'too_few',
      title: 'Third-party servers: too few clear answers',
      body: `Only ${measured.length} ad and tracker checks gave a clear answer in this run.`
    };
  }
  if (!unreachableList.length) {
    return {
      ...base,
      state: 'none_unreachable',
      title: `Third-party servers: ${reachedList.length} of ${measured.length} ad and tracker servers answered`,
      body: `${controlsReached} of ${controlsTotal} control servers answered too. A content blocker can still answer a request with a stand-in, so this does not show that nothing was filtered.`
    };
  }
  return {
    ...base,
    state: 'some_unreachable',
    title: `Third-party servers: ${unreachableList.length} of ${measured.length} ad and tracker servers could not be reached`,
    body: `${controlsReached} of ${controlsTotal} ordinary control servers could be reached in the same run. Network-level filtering, such as a DNS filter, VPN or firewall, or a request-blocking extension can produce this pattern. This page cannot tell which, and cannot rule out a server problem. It is not part of the score.`
  };
}
