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
