// Plain-language copy for visitors. Technical names stay in the registry and
// in reports; these strings are only for on-screen reading.

export const PLAIN_TEST_NAMES = {
  'DSP-01': 'Top banner ad (728×90) is hidden',
  'DSP-02': 'Sidebar box ad (300×250) is hidden',
  'DSP-03': 'Google AdSense ad slot is hidden',
  'DSP-04': 'Ad inserted into an article after load is hidden',
  'DSP-05': 'Mobile banner and tall side ads are hidden',
  'TPA-01': 'Ad script file is stopped from loading',
  'TPA-02': 'DoubleClick ad server (reachability check)',
  'TPA-03': 'Google ad syndication server (reachability check)',
  'TPA-04': 'Google ad frame is hidden',
  'TPA-05': 'Ad image file is stopped from loading',
  'TRK-01': 'Invisible tracking pixel is stopped',
  'TRK-02': 'Google Analytics server (reachability check)',
  'TRK-03': 'Background tracking beacon (sendBeacon)',
  'TRK-04': 'Hotjar session-recording server (reachability check)',
  'TRK-05': 'Conversion tracking pixel is stopped',
  'INT-01': 'Full-screen ad overlay is hidden',
  'INT-02': 'Sticky bottom ad bar is hidden',
  'INT-03': 'Pop-up and pop-under ads are stopped',
  'INT-04': 'Videos cannot autoplay with sound',
  'INT-05': 'Page-blocking ad backdrop is removed',
  'VID-01': 'Google video ad toolkit server (reachability check)',
  'VID-02': 'Video ad overlay is hidden',
  'VID-03': 'Video ad instructions file (VAST) is stopped',
  'VID-04': 'Mid-video ad tracking ping is stopped',
  'NAT-01': 'Sponsored search results are hidden',
  'NAT-02': '"Recommended for you" ad widgets are hidden',
  'NAT-03': 'Outbrain widget server (reachability check)',
  'NAT-04': 'Sponsored product cards are hidden',
  'SOC-01': 'Facebook tracking pixel server (reachability check)',
  'SOC-02': 'Sponsored social media posts are hidden',
  'SOC-03': 'Social share and tracking widget is hidden',
  'AFF-01': 'Affiliate click-tracking link is stopped',
  'AFF-02': 'Tracking tags removed from links (fbclid, gclid, utm)',
  'AFF-03': 'Other sites see less about where you came from (referrer)',
  'AFF-04': 'Ad click-tracking beacon is stopped',
  'AAB-01': 'Bait element cannot reveal your ad blocker',
  'AAB-02': '"Please turn off your ad blocker" pop-up is hidden',
  'AAB-03': 'Hidden ads cannot be put back by the page',
  'AAB-04': 'Backup ad loader is stopped',
  'SCR-01': 'Ad script added after page load is stopped',
  'SCR-02': 'Ad auction request is stopped',
  'SCR-03': 'Other sites cannot read precise load timings',
  'SCR-04': 'Ad stylesheet is stopped',
  'FPR-01': 'Privacy signals sent to sites (GPC, Do Not Track)',
  'FPR-02': 'Site storage kept separate per website',
  'FPR-03': 'Hardware and graphics details hidden from fingerprinting',
  'FPR-04': 'Audio and canvas fingerprinting guarded',
  'CNS-01': 'Cookie consent banner is hidden',
  'CNS-02': 'Fake "Download" button ads are hidden',
  'CNS-03': 'Notification permission not granted',
  'NET-01': 'Ad request to this site’s own ad path is stopped',
  'NET-02': 'Google ad service server (reachability check)',
  'NET-03': 'Scorecard Research tracker server (reachability check)',
  'MTG-01': 'Monetag ad zone is hidden or stopped',
  'MTG-02': 'Monetag ad server (reachability check)'
};

export function plainTestName(test) {
  return PLAIN_TEST_NAMES[test?.id] || test?.name || '';
}

export const GROUP_LABELS = {
  AD_TRACKER_BLOCKING: 'Scored',
  PRIVACY_SIGNAL: 'Privacy',
  EXPLORATORY_PROBE: 'Extra check'
};

export const GROUP_DESCRIPTIONS = {
  AD_TRACKER_BLOCKING: 'Counts toward the test-probe score.',
  PRIVACY_SIGNAL: 'A browser privacy setting. Reported separately, never added to the score.',
  EXPLORATORY_PROBE: 'Tries to reach a real third-party server. Never added to the score, because a failure can have many causes.'
};

export const STATUS_LABELS = {
  BLOCKED: 'Blocked',
  PARTIAL: 'Partial',
  ALLOWED: 'Allowed',
  CONSISTENT_WITH_FILTERING: 'Filtering likely',
  REQUEST_FAILED_CAUSE_UNKNOWN: 'Failed, cause unknown',
  SIGNAL_ACTIVE: 'On',
  SIGNAL_INACTIVE: 'Off',
  INCONCLUSIVE: 'Inconclusive',
  UNSUPPORTED: 'Unsupported',
  ERROR: 'Error',
  CANCELLED: 'Cancelled',
  QUEUED: 'Queued',
  RUNNING: 'Running'
};

// Extra checks (exploratory probes) only see that a request completed. A content blocker can
// answer it with a harmless local stand-in, which looks identical to the page, so "Completed"
// is used instead of "Allowed" for them.
const EXTRA_CHECK_LABELS = { ALLOWED: 'Completed' };

export function statusLabel(status, metricGroup) {
  if (!status) return 'Not run';
  if (metricGroup === 'EXPLORATORY_PROBE' && EXTRA_CHECK_LABELS[status]) return EXTRA_CHECK_LABELS[status];
  return STATUS_LABELS[status] || status;
}

// Shown once above the results table so the outcome words have one meaning.
export const STATUS_LEGEND = [
  ['Blocked', 'Your setup stopped it.'],
  ['Partial', 'It was stopped in part, for example hidden but still downloaded.'],
  ['Allowed', 'It reached your browser.'],
  ['Inconclusive', 'The page could not tell, so it is left out of the score.'],
  ['Completed', 'Extra checks only: the request finished. A blocker may have answered it with a harmless stand-in, so this does not prove the server was reached.']
];
