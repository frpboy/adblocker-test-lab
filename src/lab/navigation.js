export const PRIMARY_NAV_TABS = [
  { id: 'overview', label: 'Overview & Scanner' },
  { id: 'results', label: 'Results & Workbench' },
  { id: 'real-ads', label: 'Real Ads Stress Lab' },
  { id: 'methodology', label: 'Methodology & Audit' },
  { id: 'settings', label: 'Settings & Lab' }
];

export function normalizeTab(activeTab) {
  if (activeTab === 'workbench' || activeTab === 'layers' || activeTab === 'run') return 'results';
  if (activeTab === 'learn' || activeTab === 'verification') return 'methodology';
  if (activeTab === 'scoring' || activeTab === 'monetag' || activeTab === 'architecture') return 'settings';
  if (activeTab === 'real-ads' || activeTab === 'stress-lab') return 'real-ads';
  return activeTab;
}
