import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTab, PRIMARY_NAV_TABS } from '../src/lab/navigation.js';

test('includes exactly 5 primary ribbon destinations with Real Ads promoted', () => {
  assert.equal(PRIMARY_NAV_TABS.length, 5);
  const ids = PRIMARY_NAV_TABS.map((t) => t.id);
  assert.deepEqual(ids, ['overview', 'results', 'real-ads', 'methodology', 'settings']);
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
