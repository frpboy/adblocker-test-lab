import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('built document contains exactly one ExoClick ownership verification meta tag', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const matches = html.match(/<meta\b[^>]*\bname=["']6a97888e-site-verification["'][^>]*>/gi) ?? [];

  assert.equal(matches.length, 1);
  assert.match(matches[0], /\bcontent=["']02bc07b27f13a2b347f5648defd4f903["']/i);
});
