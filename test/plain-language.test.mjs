import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLAIN_TEST_NAMES, STATUS_LABELS, statusLabel } from '../src/lab/plain-language.js';

const source = readFileSync(new URL('../AdBlockerTestLab.jsx', import.meta.url), 'utf8');
const registryBlock = source.slice(source.indexOf('export const TEST_REGISTRY'));
const registryIds = [...new Set([...registryBlock.matchAll(/^\s{4}id: '([A-Z]{3}-\d{2})'/gm)].map((m) => m[1]))];

test('every registered test has a plain-language name and no stale names exist', () => {
  assert.equal(registryIds.length, 55);
  assert.deepEqual([...registryIds].sort(), Object.keys(PLAIN_TEST_NAMES).sort());
});

test('plain names avoid em dashes', () => {
  for (const name of Object.values(PLAIN_TEST_NAMES)) assert.ok(!name.includes('—'), name);
});

test('every result status has a label and unrun tests read as not run', () => {
  const start = source.indexOf('export const RESULT_STATUS = {');
  const block = source.slice(start, source.indexOf('};', start));
  const statuses = [...block.matchAll(/^\s{2}([A-Z_]+): '\1',?$/gm)].map((m) => m[1]);
  assert.ok(statuses.length >= 10);
  for (const status of statuses) assert.ok(STATUS_LABELS[status], status);
  assert.equal(statusLabel(undefined), 'Not run');
});
