import assert from 'node:assert/strict';
import test from 'node:test';
import { createRealAdsSession, buildBannerDocument, AD_FRAME_PATH, FRAME_MESSAGES } from '../src/lab/real-ads/session.js';

function createDocument() {
  const createContainer = () => ({ children: [], append(node) { this.children.push(node); node.parentNode = this; } });
  const document = { body: createContainer(), head: createContainer() };
  document.createElement = (tagName) => {
    const element = {
      tagName,
      listeners: new Map(),
      setAttribute(name, value) { this[name] = value; },
      addEventListener(name, listener) { this.listeners.set(name, listener); },
      removeEventListener(name) { this.listeners.delete(name); },
      remove() { this.parentNode.children = this.parentNode.children.filter((node) => node !== this); }
    };
    // Browsers expose dataset as a getter only; assigning to it throws in module (strict) code.
    const dataset = {};
    Object.defineProperty(element, 'dataset', { get: () => dataset, enumerable: true });
    return element;
  };
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

// A fake window that can deliver postMessage events, for the frame handshake.
function createWindow() {
  const listeners = new Map();
  return {
    location: { origin: 'https://lab.frpboy.in' },
    addEventListener(name, fn) { listeners.set(name, fn); },
    removeEventListener(name) { listeners.delete(name); },
    dispatch(name, event) { listeners.get(name)?.(event); },
    has: (name) => listeners.has(name)
  };
}

function frameWindow() {
  const posted = [];
  return { posted, postMessage(data, targetOrigin) { posted.push({ data, targetOrigin }); } };
}

const banner = {
  id: 'adsterra-banner-728x90',
  kind: 'banner',
  size: '728x90',
  scriptUrl: 'https://example.test/invoke.js',
  options: { key: 'sample-key', format: 'iframe', height: 90, width: 728, params: {} }
};

test('mounts a banner in the same-site frame page, not a srcdoc frame', () => {
  const document = createDocument();
  const session = createRealAdsSession({ document, window: createWindow() });
  const slotContainer = { children: [], append(node) { this.children.push(node); node.parentNode = this; } };

  assert.equal(session.start(banner, slotContainer).started, true);
  assert.equal(slotContainer.children.length, 1);
  assert.equal(document.head.children.length, 0);

  const iframe = slotContainer.children[0];
  assert.equal(iframe.tagName, 'iframe');
  assert.equal(iframe.width, '728');
  assert.equal(iframe.height, '90');
  assert.equal(iframe.src, AD_FRAME_PATH, 'ad loaders need a real page address, not about:srcdoc');
  assert.equal(iframe.srcdoc, undefined);

  session.stop();
  assert.equal(slotContainer.children.length, 0);
});

test('sends the banner document once, only to this site, and reports the script outcome', () => {
  const document = createDocument();
  const win = createWindow();
  const events = [];
  const session = createRealAdsSession({ document, window: win, onEvidence: (e) => events.push(e.status) });
  const slotContainer = { children: [], append(node) { this.children.push(node); node.parentNode = this; } };
  session.start(banner, slotContainer);
  const iframe = slotContainer.children[0];
  iframe.contentWindow = frameWindow();

  iframe.listeners.get('load')();
  iframe.listeners.get('load')(); // the frame fires load again after writing itself
  assert.equal(iframe.contentWindow.posted.length, 1);
  const [{ data, targetOrigin }] = iframe.contentWindow.posted;
  assert.equal(targetOrigin, 'https://lab.frpboy.in');
  assert.equal(data.type, FRAME_MESSAGES.render);
  assert.match(data.html, /sample-key/);
  assert.match(data.html, /https:\/\/example\.test\/invoke\.js/);
  const token = data.html.match(/token:'([^']+)'/)[1];

  // Messages from elsewhere, or with the wrong token, are ignored.
  win.dispatch('message', { source: {}, origin: 'https://lab.frpboy.in', data: { type: FRAME_MESSAGES.done, token } });
  win.dispatch('message', { source: iframe.contentWindow, origin: 'https://evil.example', data: { type: FRAME_MESSAGES.done, token } });
  win.dispatch('message', { source: iframe.contentWindow, origin: 'https://lab.frpboy.in', data: { type: FRAME_MESSAGES.done, token: 'other' } });
  assert.ok(!events.includes('SCRIPT_LOADED'));

  win.dispatch('message', { source: iframe.contentWindow, origin: 'https://lab.frpboy.in', data: { type: FRAME_MESSAGES.done, token } });
  assert.ok(events.includes('SCRIPT_LOADED'));

  session.stop();
  assert.equal(win.has('message'), false, 'message listener is removed on stop');
});

test('a blocked ad script is reported as a failed request', () => {
  const document = createDocument();
  const win = createWindow();
  const events = [];
  const session = createRealAdsSession({ document, window: win, onEvidence: (e) => events.push(e.status) });
  const slotContainer = { children: [], append(node) { this.children.push(node); node.parentNode = this; } };
  session.start(banner, slotContainer);
  const iframe = slotContainer.children[0];
  iframe.contentWindow = frameWindow();
  iframe.listeners.get('load')();
  const token = iframe.contentWindow.posted[0].data.html.match(/token:'([^']+)'/)[1];
  win.dispatch('message', { source: iframe.contentWindow, origin: 'https://lab.frpboy.in', data: { type: FRAME_MESSAGES.failed, token } });
  assert.ok(events.includes('REQUEST_FAILED'));
  session.stop();
});

test('safely escapes hostile values in the banner document', () => {
  const html = buildBannerDocument(
    {
      id: 'adsterra-banner-malicious',
      scriptUrl: 'https://example.test/invoke.js?foo="><script>alert(2)</script>',
      options: { key: '</script><script>alert(1)</script>', nested: '<img src=x onerror=alert(3)>' }
    },
    "tok'en<x>"
  );

  // Options must not contain raw unescaped </script>
  assert.doesNotMatch(html, /<\/script><script>alert\(1\)<\/script>/);
  assert.match(html, /\\u003c\/script>\\u003cscript>alert\(1\)\\u003c\/script>/);

  // scriptUrl must not contain unescaped quotes or raw tags
  assert.doesNotMatch(html, /foo="><script>alert\(2\)<\/script>/);
  assert.match(html, /&quot;&gt;&lt;script&gt;alert\(2\)&lt;\/script&gt;/);

  // The token is reduced to safe characters before it is written into the page
  assert.match(html, /token:'tokenx'/);
});
