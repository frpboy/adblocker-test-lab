export const PRIMARY_NAV_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'results', label: 'Results' },
  { id: 'real-ads', label: 'Live ads lab' },
  { id: 'methodology', label: "How it's measured" },
  { id: 'settings', label: 'Settings' }
];

export function normalizeTab(activeTab) {
  if (activeTab === 'workbench' || activeTab === 'layers' || activeTab === 'run') return 'results';
  if (activeTab === 'learn' || activeTab === 'verification') return 'methodology';
  if (activeTab === 'scoring' || activeTab === 'monetag' || activeTab === 'architecture') return 'settings';
  if (activeTab === 'real-ads' || activeTab === 'stress-lab') return 'real-ads';
  return activeTab;
}

// Each primary tab has its own address, so it can be bookmarked, shared, and reached
// with the browser's Back and Forward buttons.
export const TAB_PATHS = {
  overview: '/',
  results: '/results',
  'real-ads': '/live-ads',
  methodology: '/how-it-works',
  settings: '/settings'
};

const PAGE_TITLES = {
  overview: 'AdBlocker Test Lab | Evidence-led browser diagnostics',
  results: 'Results | AdBlocker Test Lab',
  'real-ads': 'Live ads lab | AdBlocker Test Lab',
  methodology: "How it's measured | AdBlocker Test Lab",
  settings: 'Settings | AdBlocker Test Lab'
};

export function pathForTab(tab) {
  return TAB_PATHS[normalizeTab(tab)] || '/';
}

export function tabFromPath(pathname = '/') {
  const clean = `/${String(pathname).replace(/^\/+|\/+$/g, '').toLowerCase()}`;
  const match = Object.entries(TAB_PATHS).find(([, path]) => path === clean);
  return match ? match[0] : 'overview';
}

export function titleForTab(tab) {
  return PAGE_TITLES[normalizeTab(tab)] || PAGE_TITLES.overview;
}
