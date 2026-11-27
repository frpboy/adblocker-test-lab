import test from 'node:test';
import assert from 'node:assert/strict';
import { HELP_SECTIONS } from '../src/lab/help-content.js';
import { TAB_PATHS } from '../src/lab/navigation.js';

const items = HELP_SECTIONS.flatMap((s) => s.items);
const ACTIONS = new Set([...Object.keys(TAB_PATHS), 'run-full', 'run-quick']);

test('every question has an answer, and questions are unique', () => {
  assert.ok(items.length >= 10);
  assert.equal(new Set(items.map((i) => i.q)).size, items.length);
  for (const item of items) {
    assert.ok(item.q.endsWith('?'), item.q);
    assert.ok(item.a.length > 0 && item.a.every((p) => p.trim().length > 20), item.q);
  }
});

test('every help button points at something that exists', () => {
  for (const item of items.filter((i) => i.action)) {
    assert.ok(ACTIONS.has(item.action.target), `${item.q} -> ${item.action.target}`);
    assert.ok(item.action.label.length > 0);
  }
});

test('help copy follows the voice rules: no em dashes, no exclamation marks', () => {
  const text = JSON.stringify(HELP_SECTIONS);
  assert.ok(!text.includes('—'));
  assert.ok(!text.includes('!'));
});

test('section ids are unique so topic links land in the right place', () => {
  assert.equal(new Set(HELP_SECTIONS.map((s) => s.id)).size, HELP_SECTIONS.length);
});
