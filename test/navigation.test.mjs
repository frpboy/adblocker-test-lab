import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTab, PRIMARY_NAV_TABS } from '../src/lab/navigation.js';

test('includes exactly 6 primary ribbon destinations with Real Ads promoted', () => {
  assert.equal(PRIMARY_NAV_TABS.length, 6);
  const ids = PRIMARY_NAV_TABS.map((t) => t.id);
  assert.deepEqual(ids, ['overview', 'results', 'real-ads', 'methodology', 'settings', 'help']);
});

test('normalizes legacy and alias routes to authoritative parent tabs', () => {
  assert.equal(normalizeTab('workbench'), 'results');
  assert.equal(normalizeTab('layers'), 'results');
  assert.equal(normalizeTab('run'), 'results');
  assert.equal(normalizeTab('learn'), 'methodology');
  assert.equal(normalizeTab('verification'), 'methodology');
  assert.equal(normalizeTab('scoring'), 'settings');
  assert.equal(normalizeTab('monetag'), 'settings');
  assert.equal(normalizeTab('architecture'), 'settings');
  assert.equal(normalizeTab('stress-lab'), 'real-ads');
  assert.equal(normalizeTab('real-ads'), 'real-ads');
  assert.equal(normalizeTab('overview'), 'overview');
});

test('maps every primary tab to its own address and back', async () => {
  const { pathForTab, tabFromPath, titleForTab, TAB_PATHS } = await import('../src/lab/navigation.js');
  for (const { id } of PRIMARY_NAV_TABS) {
    assert.equal(tabFromPath(pathForTab(id)), id);
    assert.ok(TAB_PATHS[id]);
    assert.ok(titleForTab(id).includes('AdBlocker Test Lab'));
  }
  assert.equal(pathForTab('workbench'), '/results');
  assert.equal(tabFromPath('/results/'), 'results');
  assert.equal(tabFromPath('/RESULTS'), 'results');
  assert.equal(tabFromPath('/no-such-page'), 'overview');
  assert.equal(tabFromPath(''), 'overview');
});

test('the host rewrites exactly the app tab addresses, and nothing else', async () => {
  const { readFileSync } = await import('node:fs');
  const { TAB_PATHS } = await import('../src/lab/navigation.js');
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const sources = config.rewrites.map((r) => r.source).sort();
  const expected = Object.values(TAB_PATHS).filter((p) => p !== '/').sort();
  assert.deepEqual(sources, expected);
  // A catch-all would answer the diagnostic fixture paths (e.g. /ads/...) with the app page.
  assert.ok(config.rewrites.every((r) => !r.source.includes('(') && !r.source.includes('*')));
});
