import test from 'node:test';
import assert from 'node:assert/strict';
import { waitForFrame } from '../src/lab/frame-wait.js';

const neverFires = { raf: () => 1, caf: () => {} };

test('resolves in a background tab where animation frames never fire', async () => {
  const started = Date.now();
  await waitForFrame(null, { ...neverFires, fallbackMs: 20 });
  assert.ok(Date.now() - started < 1000);
});

test('resolves on the frame when one arrives first, and clears the timer', async () => {
  let cleared = false;
  await waitForFrame(null, {
    raf: (cb) => { setTimeout(cb, 0); return 7; },
    caf: () => {},
    setTimer: () => 99,
    clearTimer: (id) => { cleared = id === 99; }
  });
  assert.equal(cleared, true);
});

test('rejects with AbortError when stopped, and when already stopped', async () => {
  const controller = new AbortController();
  const pending = waitForFrame(controller.signal, { ...neverFires, fallbackMs: 10_000 });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
  await assert.rejects(waitForFrame(controller.signal, neverFires), { name: 'AbortError' });
});

test('does not leave abort listeners behind after resolving', async () => {
  const controller = new AbortController();
  let added = 0;
  let removed = 0;
  const signal = {
    aborted: false,
    addEventListener: () => { added++; },
    removeEventListener: () => { removed++; }
  };
  await waitForFrame(signal, { ...neverFires, fallbackMs: 5 });
  assert.equal(added, 1);
  assert.equal(removed, 1);
  controller.abort();
});
