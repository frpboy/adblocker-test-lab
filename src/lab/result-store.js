// Keeps the visitor's own results across reloads, on their device only. Nothing is
// sent anywhere. Storage can be blocked (private windows, strict settings), so every
// read and write is guarded and the app works the same without it.

export const STORAGE_KEY = 'adblocker-test-lab:results:v1';
const VERSION = 1;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const UNFINISHED = new Set(['QUEUED', 'RUNNING']);

function defaultStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

/** Saves finished results and the last run. Returns false when storage is unavailable. */
export function saveResults({ resultsMap, lastRun }, storage = defaultStorage(), now = Date.now()) {
  if (!storage) return false;
  const finished = Object.fromEntries(
    Object.entries(resultsMap || {}).filter(([, r]) => r && r.status && !UNFINISHED.has(r.status))
  );
  try {
    if (!Object.keys(finished).length) {
      storage.removeItem(STORAGE_KEY);
      return true;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, savedAt: now, resultsMap: finished, lastRun: lastRun || null }));
    return true;
  } catch {
    return false;
  }
}

/** Loads saved results, or null when there are none, they are old, or they are unreadable. */
export function loadResults({ knownIds } = {}, storage = defaultStorage(), now = Date.now()) {
  if (!storage) return null;
  let parsed;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || parsed.version !== VERSION || typeof parsed.resultsMap !== 'object' || !parsed.resultsMap) return null;
  if (typeof parsed.savedAt !== 'number' || now - parsed.savedAt > MAX_AGE_MS) return null;

  const allowed = knownIds ? new Set(knownIds) : null;
  const resultsMap = Object.fromEntries(
    Object.entries(parsed.resultsMap).filter(
      ([id, r]) => (!allowed || allowed.has(id)) && r && typeof r.status === 'string' && !UNFINISHED.has(r.status)
    )
  );
  if (!Object.keys(resultsMap).length) return null;

  const lastRun =
    parsed.lastRun && Array.isArray(parsed.lastRun.testIds)
      ? { ...parsed.lastRun, testIds: parsed.lastRun.testIds.filter((id) => !allowed || allowed.has(id)) }
      : null;
  return { resultsMap, lastRun, savedAt: parsed.savedAt };
}

export function clearResults(storage = defaultStorage()) {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
