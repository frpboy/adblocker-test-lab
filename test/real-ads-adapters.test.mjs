import assert from 'node:assert/strict';
import test from 'node:test';
import { createAdsterraPlacements, runAdsterraPlacementSequence } from '../src/lab/real-ads/adsterra.js';
import { createMonetagPlacements } from '../src/lab/real-ads/monetag.js';
import { createExoClickPlacements } from '../src/lab/real-ads/exoclick.js';

const config = {
  adsterra: {
    banners: ['728x90', '300x250', '160x600', '300x100', '320x50', '468x60'].map((size) => ({ id: size, kind: 'banner', size, scriptUrl: `https://example.test/${size}.js`, options: { size } })),
    native: { id: 'native', kind: 'native', scriptUrl: 'https://example.test/native.js' },
    popunder: { id: 'popunder', kind: 'popunder', scriptUrl: 'https://example.test/pop.js' },
    socialBar: { id: 'social', kind: 'social-bar', scriptUrl: 'https://example.test/social.js' },
    smartlink: { id: 'smart', kind: 'smartlink', href: 'https://example.test/click' }
  },
  monetag: { formats: [{ id: 'mtg', kind: 'tag', scriptUrl: 'https://example.test/mtg.js', compatible: true }] },
  exoclick: { formats: [] }
};

test('maps six distinct Adsterra banners and excludes popunder from maximum mode', () => {
  const grid = createAdsterraPlacements(config, 'banner-grid');
  const maximum = createAdsterraPlacements(config, 'maximum');

  assert.equal(grid.length, 6);
  assert.equal(new Set(grid.map(({ size }) => size)).size, 6);
  assert.equal(maximum.some(({ kind }) => kind === 'popunder'), false);
});

test('marks Smartlink manual-only and returns unavailable providers as empty', () => {
  const nativeSocial = createAdsterraPlacements(config, 'native-social');

  assert.equal(nativeSocial.find(({ kind }) => kind === 'smartlink').manualOnly, true);
  assert.deepEqual(createMonetagPlacements({ monetag: { formats: [] } }, 'maximum'), []);
  assert.deepEqual(createExoClickPlacements(config, 'maximum'), []);
});

test('consumes shared Adsterra options sequentially', async () => {
  const observed = [];
  const window = {};
  await runAdsterraPlacementSequence(createAdsterraPlacements(config, 'banner-grid').slice(0, 2), {
    start: async (placement) => observed.push({ id: placement.id, size: window.atOptions.size })
  }, window);

  assert.deepEqual(observed, [{ id: '728x90', size: '728x90' }, { id: '300x250', size: '300x250' }]);
  assert.equal('atOptions' in window, false);
});
