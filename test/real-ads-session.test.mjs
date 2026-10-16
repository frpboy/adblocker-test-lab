import assert from 'node:assert/strict';
import test from 'node:test';
import { createRealAdsSession } from '../src/lab/real-ads/session.js';

function createDocument() {
  const createContainer = () => ({ children: [], append(node) { this.children.push(node); node.parentNode = this; } });
  const document = { body: createContainer(), head: createContainer() };
  document.createElement = (tagName) => ({
    tagName,
    dataset: {},
    listeners: new Map(),
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, listener) { this.listeners.set(name, listener); },
    removeEventListener(name) { this.listeners.delete(name); },
    remove() { this.parentNode.children = this.parentNode.children.filter((node) => node !== this); }
  });
  return document;
}

const placement = { id: 'test-banner', kind: 'banner', scriptUrl: 'https://example.test/banner.js' };

test('starts idle, owns one mount and script, and refuses a duplicate start', () => {
  const document = createDocument();
  const session = createRealAdsSession({ document, window: {} });

  assert.equal(session.getState().status, 'IDLE');
  assert.equal(session.start(placement).started, true);
  assert.equal(session.start(placement).started, false);
  assert.equal(document.body.children.length, 1);
  assert.equal(document.head.children.length, 1);
});

test('stop removes owned nodes and reports irreversible third-party effects', () => {
  const document = createDocument();
  const session = createRealAdsSession({ document, window: {} });

  session.start({ ...placement, kind: 'popunder' });
  const stopped = session.stop();

  assert.equal(stopped.requiresReload, true);
  assert.equal(session.getState().status, 'STOPPED');
  assert.equal(document.body.children.length, 0);
  assert.equal(document.head.children.length, 0);
});

test('reload replaces owned nodes with one new placement', () => {
  const document = createDocument();
  const session = createRealAdsSession({ document, window: {} });

  session.start(placement);
  assert.equal(session.reload({ ...placement, id: 'replacement' }).started, true);
  assert.equal(document.body.children.length, 1);
  assert.equal(document.head.children[0].src, 'https://example.test/banner.js');
});

test('mounts synchronous banner into isolated provider iframe within target container', () => {
  const document = createDocument();
  const session = createRealAdsSession({ document, window: {} });
  const slotContainer = { children: [], append(node) { this.children.push(node); node.parentNode = this; } };
  const bannerWithOptions = {
    id: 'adsterra-banner-728x90',
    kind: 'banner',
    size: '728x90',
    scriptUrl: 'https://example.test/invoke.js',
    options: { key: 'sample-key', format: 'iframe', height: 90, width: 728, params: {} }
  };

  const started = session.start(bannerWithOptions, slotContainer);
  assert.equal(started.started, true);
  assert.equal(slotContainer.children.length, 1);
  assert.equal(document.head.children.length, 0);

  const iframe = slotContainer.children[0];
  assert.equal(iframe.tagName, 'iframe');
  assert.equal(iframe.width, '728');
  assert.equal(iframe.height, '90');
  assert.match(iframe.srcdoc, /sample-key/);
  assert.match(iframe.srcdoc, /https:\/\/example\.test\/invoke\.js/);

  session.stop();
  assert.equal(slotContainer.children.length, 0);
});
