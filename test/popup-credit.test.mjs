import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The popup executor lives in the single-file prototype, so this guards its decision order:
// a changed window.open without a hidden trigger must not be returned as BLOCKED.
const src = readFileSync(new URL('../AdBlockerTestLab.jsx', import.meta.url), 'utf8');
const start = src.indexOf("if (testItem.type === 'popup_filter_check')");
const end = src.indexOf("if (testItem.type === 'autoplay_policy_check')");
const block = src.slice(start, end);

test('popup test returns INCONCLUSIVE for a changed window.open alone', () => {
  const wrapperOnly = block.indexOf('hasScriptletWrapper && !linkHidden');
  const firstBlocked = block.indexOf('RESULT_STATUS.BLOCKED');
  assert.ok(wrapperOnly > -1, 'wrapper-only branch exists');
  assert.ok(block.slice(wrapperOnly, firstBlocked).includes('RESULT_STATUS.INCONCLUSIVE'));
  assert.ok(!/if \(linkHidden \|\| hasScriptletWrapper\)/.test(block), 'no OR-credit remains');
});
