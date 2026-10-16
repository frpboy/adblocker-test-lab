import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAvailableFormats,
  getRealAdsConfig,
  REAL_ADS_LEVELS
} from '../src/lab/real-ads/config.js';

const sixBannerEnv = Object.fromEntries([
  ['728X90', '728x90'],
  ['300X250', '300x250'],
  ['160X600', '160x600'],
  ['160X300', '160x300'],
  ['320X50', '320x50'],
  ['468X60', '468x60']
].map(([name, size]) => [
  `VITE_REAL_ADS_ADSTERRA_BANNER_${name}`,
  JSON.stringify({ scriptUrl: `https://example.test/${size}.js` })
]));

test('keeps all providers unavailable for blank configuration', () => {
  const config = getRealAdsConfig({});

  assert.deepEqual(getAvailableFormats(config), []);
  assert.equal(config.adsterra.banners.length, 0);
  assert.equal(REAL_ADS_LEVELS[0].id, 'baseline');
});

test('accepts one valid Adsterra banner descriptor', () => {
  const config = getRealAdsConfig({
    VITE_REAL_ADS_ADSTERRA_BANNER_300X250: JSON.stringify({
      scriptUrl: 'https://example.test/banner.js'
    })
  });

  assert.deepEqual(config.adsterra.banners, [{
    id: 'adsterra-banner-300x250',
    provider: 'adsterra',
    kind: 'banner',
    size: '300x250',
    scriptUrl: 'https://example.test/banner.js'
  }]);
});

test('keeps six distinct configured Adsterra banner descriptors', () => {
  const config = getRealAdsConfig(sixBannerEnv);

  assert.equal(config.adsterra.banners.length, 6);
  assert.equal(new Set(config.adsterra.banners.map(({ size }) => size)).size, 6);
});

test('does not advertise unconfigured Monetag or ExoClick formats', () => {
  const config = getRealAdsConfig({
    VITE_REAL_ADS_MONETAG_FORMATS: 'not-json',
    VITE_REAL_ADS_EXOCLICK_FORMATS: JSON.stringify([{ id: 'bad' }])
  });

  assert.deepEqual(getAvailableFormats(config), []);
});
