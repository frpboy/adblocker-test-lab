// Only constants and fresh random identity/time cross this boundary.
// Never serialize the incoming envelope, header, event or hint.
const URL = 'https://o4510460282601472.ingest.us.sentry.io/api/4512436422901760/envelope/?sentry_key=98d400030fed6f4093eae00b839abf3b';
export function createMinimalTransport({ fetcher = (...args) => globalThis.fetch(...args), now = Date.now, uuid = () => crypto.randomUUID() } = {}) {
  let inflight = false, next = 0, windowAt = 0, count = 0;
  return {
    async send(envelope) {
      try {
        if (!Array.isArray(envelope?.[1]) || !envelope[1].some(item => item?.[0]?.type === 'event')) return { statusCode: 200 };
        const t = now();
        if (inflight || t < next) return { statusCode: 200 };
        if (t - windowAt >= 3600000) { windowAt = t; count = 0; }
        if (count >= 10) return { statusCode: 200 };
        const id = uuid().replaceAll('-', '');
        if (!/^[a-f0-9]{32}$/.test(id)) return { statusCode: 200 };
        const body = JSON.stringify({ event_id: id }) + '\n' + JSON.stringify({ type: 'event' }) + '\n' + JSON.stringify({
          event_id: id, timestamp: t / 1000, platform: 'javascript', level: 'error',
          message: 'AdBlocker Test Lab application error', environment: 'production',
          release: 'adblocker-test-lab@0.1.0',
        });
        count++; next = t + 60000; inflight = true;
        const controller = new AbortController(); let timer;
        // Busy remains set until the actual fetch/body operation settles,
        // even if abort is ignored and the cooperative outer deadline wins.
        const operation = Promise.resolve().then(async () => {
          try {
            const response = await fetcher(URL, { method: 'POST', body,
              headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, redirect: 'error', signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true });
            const retry = response?.headers?.get('retry-after');
            const limits = response?.headers?.get('x-sentry-rate-limits');
            if (response?.status === 429 || limits) {
              const retrySeconds = Number(retry);
              const retryDate = retry && !Number.isFinite(retrySeconds) ? Date.parse(retry) : 0;
              const periods = (limits || '').split(',').map(value => Number(value.trim().split(':')[0])).filter(Number.isFinite);
              next = Math.max(t + 3600000, t + (Number.isFinite(retrySeconds) ? retrySeconds * 1000 : 0), retryDate || 0, ...periods.map(seconds => t + seconds * 1000));
            }
            // We never consume response content. Await cancellation before release.
            await response?.body?.cancel();
            return { statusCode: response?.status || 200 };
          } catch { return { statusCode: 200 }; }
          finally { inflight = false; }
        });
        try {
          return await Promise.race([operation,
            new Promise(resolve => { timer = setTimeout(() => { controller.abort(); resolve({ statusCode: 200 }); }, 500); }),
          ]);
        } finally { clearTimeout(timer); }
      } catch { return { statusCode: 200 }; }
    },
    flush() { return Promise.resolve(!inflight); },
  };
}
