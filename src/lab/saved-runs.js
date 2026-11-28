// Runs the visitor chose to keep for comparison, on this device only. Nothing is sent anywhere.
export const SAVED_RUNS_KEY = 'adblocker-test-lab:saved-runs:v1';
export const MAX_SAVED_RUNS = 4;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function defaultStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

const valid = (r) =>
  r && typeof r.id === 'string' && typeof r.label === 'string' && Array.isArray(r.testIds) && r.results && typeof r.results === 'object';

export function loadSavedRuns(storage = defaultStorage(), now = Date.now()) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(SAVED_RUNS_KEY) || 'null');
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.runs)) return [];
    return parsed.runs.filter((r) => valid(r) && now - (r.savedAt || 0) <= MAX_AGE_MS);
  } catch {
    return [];
  }
}

function write(runs, storage) {
  if (!storage) return false;
  try {
    if (!runs.length) storage.removeItem(SAVED_RUNS_KEY);
    else storage.setItem(SAVED_RUNS_KEY, JSON.stringify({ version: 1, runs }));
    return true;
  } catch {
    return false;
  }
}

/** Adds a run, newest first, keeping at most MAX_SAVED_RUNS. Saving the same finished run again replaces it. */
export function saveRun(snapshot, storage = defaultStorage(), now = Date.now()) {
  const kept = loadSavedRuns(storage, now).filter((r) => !(snapshot.finishedAt && r.finishedAt === snapshot.finishedAt));
  const runs = [snapshot, ...kept].slice(0, MAX_SAVED_RUNS);
  return { ok: write(runs, storage), runs };
}

export function deleteSavedRun(id, storage = defaultStorage(), now = Date.now()) {
  const runs = loadSavedRuns(storage, now).filter((r) => r.id !== id);
  return { ok: write(runs, storage), runs };
}
