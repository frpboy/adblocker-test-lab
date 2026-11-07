import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('ResultsWorkbenchView source includes empty state handling and reset CTA for zero matches', async () => {
  const source = await readFile(new URL('../src/components/ResultsWorkbenchView.jsx', import.meta.url), 'utf8');

  assert.match(
    source,
    /filteredTests\.length === 0/,
    'Workbench table must check for empty filtered tests'
  );

  assert.match(
    source,
    /No matching test vectors found/,
    'Workbench empty state must communicate when no test vectors match'
  );

  assert.match(
    source,
    /Reset all filters/,
    'Workbench empty state must provide a reset CTA button'
  );

  assert.match(
    source,
    /colSpan=\{7\}/,
    'Workbench empty state table cell must span all 7 columns'
  );
});
