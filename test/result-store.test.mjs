import test from 'node:test';
import assert from 'node:assert/strict';
import { saveResults, loadResults, clearResults, STORAGE_KEY } from '../src/lab/result-store.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data
  };
}

const lastRun = { testIds: ['DSP-01', 'TPA-01', 'OLD-99'], label: 'quick', finishedAt: '2026-11-27T07:00:00.000Z' };

test('round-trips finished results and drops unfinished ones', () => {
  const storage = memoryStorage();
  const resultsMap = {
    'DSP-01': { status: 'BLOCKED', durationMs: 12 },
    'TPA-01': { status: 'RUNNING' },
    'TPA-05': { status: 'QUEUED' }
  };
  assert.equal(saveResults({ resultsMap, lastRun }, storage, 1000), true);
  const loaded = loadResults({}, storage, 2000);
  assert.deepEqual(Object.keys(loaded.resultsMap), ['DSP-01']);
  assert.equal(loaded.savedAt, 1000);
  assert.equal(loaded.lastRun.label, 'quick');
});

test('ignores tests that no longer exist', () => {
  const storage = memoryStorage();
  saveResults({ resultsMap: { 'DSP-01': { status: 'ALLOWED' }, 'OLD-99': { status: 'BLOCKED' } }, lastRun }, storage, 0);
  const loaded = loadResults({ knownIds: ['DSP-01', 'TPA-01'] }, storage, 0);
  assert.deepEqual(Object.keys(loaded.resultsMap), ['DSP-01']);
  assert.deepEqual(loaded.lastRun.testIds, ['DSP-01', 'TPA-01']);
});

test('returns nothing for old, corrupt, or foreign data', () => {
  const storage = memoryStorage();
  saveResults({ resultsMap: { 'DSP-01': { status: 'BLOCKED' } }, lastRun }, storage, 0);
  assert.equal(loadResults({}, storage, 31 * 24 * 60 * 60 * 1000), null);

  storage.setItem(STORAGE_KEY, '{not json');
  assert.equal(loadResults({}, storage), null);

  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, savedAt: Date.now(), resultsMap: {} }));
  assert.equal(loadResults({}, storage), null);
});

test('saving an empty run removes saved data, and clear removes it too', () => {
  const storage = memoryStorage();
  saveResults({ resultsMap: { 'DSP-01': { status: 'BLOCKED' } }, lastRun }, storage, 0);
  saveResults({ resultsMap: {}, lastRun: null }, storage, 0);
  assert.equal(storage.data.has(STORAGE_KEY), false);

  saveResults({ resultsMap: { 'DSP-01': { status: 'BLOCKED' } }, lastRun }, storage, 0);
  assert.equal(clearResults(storage), true);
  assert.equal(storage.data.has(STORAGE_KEY), false);
});

test('never throws when storage is blocked or full', () => {
  const blocked = {
    getItem: () => { throw new Error('SecurityError'); },
    setItem: () => { throw new Error('QuotaExceededError'); },
    removeItem: () => { throw new Error('SecurityError'); }
  };
  assert.equal(saveResults({ resultsMap: { 'DSP-01': { status: 'BLOCKED' } }, lastRun }, blocked), false);
  assert.equal(loadResults({}, blocked), null);
  assert.equal(clearResults(blocked), false);
  assert.equal(saveResults({ resultsMap: {}, lastRun: null }, null), false);
});
