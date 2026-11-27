import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSharePayload, openShareSheet } from '../src/lab/share-actions.js';

const file = { name: 'card.png' };

test('shares the card image when the browser can share files', () => {
  const nav = { share() {}, canShare: ({ files }) => files.length === 1 };
  const payload = buildSharePayload({ file, text: 'My score', url: 'https://lab.frpboy.in', nav });
  assert.deepEqual(payload.files, [file]);
  assert.equal(payload.text, 'My score');
});

test('falls back to text and link when files cannot be shared', () => {
  const nav = { share() {}, canShare: () => false };
  const payload = buildSharePayload({ file, text: 'My score', url: 'https://lab.frpboy.in', nav });
  assert.equal(payload.files, undefined);
  assert.equal(payload.url, 'https://lab.frpboy.in');
});

test('returns no payload when there is no share sheet', () => {
  assert.equal(buildSharePayload({ file, text: 't', url: 'u', nav: {} }), null);
});

test('calls share synchronously, before any await', () => {
  let calledSync = false;
  const nav = { share: () => { calledSync = true; return Promise.resolve(); } };
  const result = openShareSheet({ text: 't' }, nav);
  assert.equal(calledSync, true);
  return result.then((r) => assert.equal(r, 'shared'));
});

test('reports a dismissed sheet separately from a failure', async () => {
  const dismissed = { share: () => Promise.reject(Object.assign(new Error('x'), { name: 'AbortError' })) };
  const failed = { share: () => Promise.reject(Object.assign(new Error('x'), { name: 'NotAllowedError' })) };
  const throws = { share: () => { throw new TypeError('bad'); } };
  assert.equal(await openShareSheet({ text: 't' }, dismissed), 'dismissed');
  assert.equal(await openShareSheet({ text: 't' }, failed), 'failed');
  assert.equal(await openShareSheet({ text: 't' }, throws), 'failed');
  assert.equal(await openShareSheet(null, dismissed), 'unavailable');
});
