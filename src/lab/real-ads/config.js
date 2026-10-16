const ADSTERRA_BANNER_SIZES = ['728x90', '300x250', '160x600', '300x100', '320x50', '468x60'];

export const REAL_ADS_LEVELS = [
  { id: 'baseline', label: 'Level 0 — Baseline' },
  { id: 'individual', label: 'Level 1 — Individual placement' },
  { id: 'banner-grid', label: 'Level 2 — Banner grid' },
  { id: 'native-social', label: 'Level 3 — Native and social' },
  { id: 'intrusive', label: 'Level 4 — Intrusive opt-in' },
  { id: 'maximum', label: 'Level 5 — Compatible maximum' }
];

function parseJson(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function parseScriptDescriptor(value, descriptor) {
  const parsed = parseJson(value);
  if (!parsed || !isHttpsUrl(parsed.scriptUrl)) return null;

  return {
    ...descriptor,
    scriptUrl: parsed.scriptUrl,
    ...(parsed.options && typeof parsed.options === 'object' && !Array.isArray(parsed.options) ? { options: parsed.options } : {})
  };
}

function parseFormatList(value, provider) {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (!item || typeof item.id !== 'string' || typeof item.kind !== 'string' || !isHttpsUrl(item.scriptUrl)) return [];
    return [{ id: item.id, provider, kind: item.kind, scriptUrl: item.scriptUrl, compatible: item.compatible !== false }];
  });
}

export function getRealAdsConfig(env = {}) {
  const banners = ADSTERRA_BANNER_SIZES.flatMap((size) => {
    const name = size.toUpperCase();
    const descriptor = parseScriptDescriptor(env[`VITE_REAL_ADS_ADSTERRA_BANNER_${name}`], {
      id: `adsterra-banner-${size}`,
      provider: 'adsterra',
      kind: 'banner',
      size
    });
    return descriptor ? [descriptor] : [];
  });

  const adsterra = {
    banners,
    native: parseScriptDescriptor(env.VITE_REAL_ADS_ADSTERRA_NATIVE, { id: 'adsterra-native', provider: 'adsterra', kind: 'native' }),
    popunder: parseScriptDescriptor(env.VITE_REAL_ADS_ADSTERRA_POPUNDER, { id: 'adsterra-popunder', provider: 'adsterra', kind: 'popunder' }),
    socialBar: parseScriptDescriptor(env.VITE_REAL_ADS_ADSTERRA_SOCIAL_BAR, { id: 'adsterra-social-bar', provider: 'adsterra', kind: 'social-bar' }),
    smartlink: (() => {
      const href = env.VITE_REAL_ADS_ADSTERRA_SMARTLINK;
      return isHttpsUrl(href) ? { id: 'adsterra-smartlink', provider: 'adsterra', kind: 'smartlink', href } : null;
    })()
  };

  return {
    adsterra,
    monetag: { formats: parseFormatList(env.VITE_REAL_ADS_MONETAG_FORMATS, 'monetag') },
    exoclick: { formats: parseFormatList(env.VITE_REAL_ADS_EXOCLICK_FORMATS, 'exoclick') }
  };
}

export function getAvailableFormats(config) {
  return [
    ...config.adsterra.banners,
    ...[config.adsterra.native, config.adsterra.popunder, config.adsterra.socialBar, config.adsterra.smartlink].filter(Boolean),
    ...config.monetag.formats,
    ...config.exoclick.formats
  ];
}
