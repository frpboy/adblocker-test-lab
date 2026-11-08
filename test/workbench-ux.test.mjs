import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('source code includes accessible skip to content link targeting main-content landmark', async () => {
  const source = await readFile(new URL('../AdBlockerTestLab.jsx', import.meta.url), 'utf8');

  assert.match(source, /href="#main-content"/, 'Must contain a skip-link targeting #main-content');
  assert.match(source, />\s*Skip to main content\s*<\/a>/, 'Must contain descriptive text for screen readers');
  assert.match(source, /<main\b[^>]*\bid="main-content"/, 'Main element must have id="main-content" landmark');
});

test('results workbench view includes accessible empty state and reset action', async () => {
  const source = await readFile(new URL('../src/components/ResultsWorkbenchView.jsx', import.meta.url), 'utf8');

  assert.match(source, /filteredTests\.length === 0 \?/, 'Must conditionally check for zero filtered tests');
  assert.match(source, /No matching test vectors/, 'Must display clear empty state headline');
  assert.match(source, /onClick=\{resetAllFilters\}/, 'Must provide one-click reset button for filters');
  assert.match(source, /Reset all filters/, 'Must have accessible Reset all filters button label');
});
