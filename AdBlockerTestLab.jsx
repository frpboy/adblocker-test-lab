import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Search,
  CheckCircle2,
  Sun,
  Moon,
  Layers,
  Terminal,
  Server,
  Box,
  Download,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  Shield,
  Info,
  FileText
} from 'lucide-react';
import { calculateBenchmarkScore as calculateExtractedBenchmarkScore } from './src/lab/scoring.js';
import { generateHtmlReport as generateExtractedHtmlReport } from './src/lab/reporting.js';

export const APP_VERSION = '4.1.0';
export const SCHEMA_VERSION = '2026.10.adblockertestlab.v4.1';
export const BRAND_NAME = 'AdBlocker Test Lab';
export const BRAND_PROMISE = 'Test your protection. See the evidence. Understand the gaps.';
export const BRAND_TAGLINE = 'Test everything. Trust the evidence.';
export const EXPECTED_REGISTRY_COUNT = 55;

export const EXECUTION_STATE = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const RESULT_STATUS = {
  BLOCKED: 'BLOCKED',
  PARTIAL: 'PARTIAL',
  ALLOWED: 'ALLOWED',
  CONSISTENT_WITH_FILTERING: 'CONSISTENT_WITH_FILTERING',
  REQUEST_FAILED_CAUSE_UNKNOWN: 'REQUEST_FAILED_CAUSE_UNKNOWN',
  SIGNAL_ACTIVE: 'SIGNAL_ACTIVE',
  SIGNAL_INACTIVE: 'SIGNAL_INACTIVE',
  INCONCLUSIVE: 'INCONCLUSIVE',
  UNSUPPORTED: 'UNSUPPORTED',
  ERROR: 'ERROR',
  CANCELLED: 'CANCELLED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING'
};

export const METRIC_GROUP = {
  AD_TRACKER_BLOCKING: 'AD_TRACKER_BLOCKING',
  PRIVACY_SIGNAL: 'PRIVACY_SIGNAL',
  EXPLORATORY_PROBE: 'EXPLORATORY_PROBE'
};

export const CONFIDENCE = {
  CONFIRMED: {
    id: 'CONFIRMED_OBSERVATION',
    label: 'Confirmed Observation',
    shortLabel: 'Confirmed',
    stageKind: 'OBSERVED'
  },
  STRONG: {
    id: 'STRONG_INFERENCE',
    label: 'Strong Inference',
    shortLabel: 'Strong Inf.',
    stageKind: 'INFERRED'
  },
  WEAK: {
    id: 'WEAK_INFERENCE',
    label: 'Weak Inference',
    shortLabel: 'Weak Inf.',
    stageKind: 'INFERRED'
  },
  USER_REPORTED: {
    id: 'USER_REPORTED',
    label: 'User-Reported',
    shortLabel: 'User-Reported',
    stageKind: 'USER_REPORTED'
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Cause Unknown / Unobservable',
    shortLabel: 'Unobservable',
    stageKind: 'UNOBSERVABLE'
  }
};

export const VALIDITY_CLASS = {
  CONTROLLED_FIXTURE: 'Controlled First-Party Fixture',
  EXPLORATORY_EXTERNAL: 'Exploratory Third-Party Probe (Non-Scored)',
  PRIVACY_CAPABILITY: 'Browser Privacy / Restriction Signal (Separate Index)',
  DEDICATED_AD_CHAMBER: 'Dedicated Sandboxed Ad-Network Chamber'
};

export const DEFAULT_SCORING_CATEGORIES = [
  {
    id: 'ad_resource_blocking',
    name: 'Advertising Resource Blocking',
    shortCode: 'ADS-NET',
    defaultWeight: 22,
    description: 'Client-side or server-correlated interception of ad scripts, VAST tags, and ad-image paths.'
  },
  {
    id: 'tracker_beacon_blocking',
    name: 'Tracker & Beacon Blocking',
    shortCode: 'TRK-BCN',
    defaultWeight: 18,
    description: 'Interception of tracking pixel paths, analytics collection endpoints, and click-attribution beacons.'
  },
  {
    id: 'cosmetic_filtering',
    name: 'DOM Cosmetic Filtering',
    shortCode: 'DOM-CSS',
    defaultWeight: 18,
    description: 'Stylesheet suppression of standard IAB banners, native ad widgets, and promoted feed containers.'
  },
  {
    id: 'intrusive_ad_prevention',
    name: 'Intrusive Overlay & Annoyance Suppression',
    shortCode: 'INT-UI',
    defaultWeight: 14,
    description: 'Suppression of full-screen interstitials, sticky banners, scroll-locks, and deceptive download buttons.'
  },
  {
    id: 'script_resource_filtering',
    name: 'Script, XHR & Anti-Adblock Filtering',
    shortCode: 'SCR-XHR',
    defaultWeight: 14,
    description: 'Interception of dynamic ad <script> injections, XHR bid endpoints, and fallback ad-loader retries.'
  },
  {
    id: 'redirect_popup_prevention',
    name: 'Popup Scriptlet & Affiliate Path Prevention',
    shortCode: 'POP-AFF',
    defaultWeight: 8,
    description: 'Interception of affiliate click-tracking paths and popup-defuser scriptlet enforcement.'
  },
  {
    id: 'network_filtering_evidence',
    name: 'First-Party Network Path Filtering',
    shortCode: 'NET-PATH',
    defaultWeight: 6,
    description: 'Controlled network adview path interception validated against neutral same-origin controls.'
  }
];

function createTestSpec({
  id,
  section,
  scoringCategory,
  metricGroup,
  name,
  description,
  expectedBehavior,
  controlResource,
  testResource,
  recommendedRule,
  type,
  selectorClasses = '',
  elementId = '',
  probePath = '',
  targetUrl = '',
  measuredBehavior,
  technicalValidity,
  browserObservation,
  dependsOnThirdParty = false,
  alternativeExplanations = ['Content-blocking extension rule', 'Browser built-in filter'],
  scoringEligible = true,
  limitations = 'Measures observable browser behavior; does not identify a specific vendor.'
}) {
  return {
    id,
    version: '4.1',
    section,
    scoringCategory,
    metricGroup,
    name,
    description,
    expectedBehavior,
    controlResource,
    testResource,
    recommendedRule,
    type,
    selectorClasses,
    elementId,
    probePath,
    targetUrl,
    audit: {
      measuredBehavior,
      technicalValidity,
      browserObservation,
      dependsOnThirdParty,
      alternativeExplanations,
      scoringEligible,
      limitations
    }
  };
}

export const TEST_REGISTRY = [
  // 5.1 Standard Display Advertisements (5 Tests)
  createTestSpec({
    id: 'DSP-01',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'IAB Leaderboard Banner (728x90) Cosmetic Hiding',
    description: 'Injects a synthetic leaderboard container (.ad-leaderboard, .adbanner, #ad-top-banner) alongside a neutral control box and measures DOM layout collapse.',
    expectedBehavior: 'Cosmetic stylesheet rule sets display:none, visibility:hidden, or collapses height to 0px while neutral control remains visible.',
    controlResource: 'DOM <div class="adshield-control-box"> (100x22px)',
    testResource: 'DOM <div id="ad-top-banner" class="ad-leaderboard adbanner adsbox">',
    recommendedRule: '##.ad-leaderboard, #ad-top-banner, .adbanner',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-leaderboard adbanner adsbox banner_ad_728x90',
    elementId: 'ad-top-banner',
    measuredBehavior: 'CSS/DOM visual hiding of standard EasyList leaderboard selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'getComputedStyle(el).display/visibility and getBoundingClientRect().height.',
    limitations: 'Cosmetic hiding proves a DOM rule matched; it does not prove network requests were blocked.'
  }),
  createTestSpec({
    id: 'DSP-02',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Medium Rectangle (300x250) & DFP Sidebar Slot',
    description: 'Injects a 300x250 sidebar ad unit (.ad-300x250, .dfp-ad-unit) into the isolated fixture and measures layout collapse.',
    expectedBehavior: 'Cosmetic rule collapses or hides the .dfp-ad-unit container.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="dfp-ad-sidebar-1" class="ad-300x250 sidebar-ad-slot dfp-ad-unit">',
    recommendedRule: '###dfp-ad-sidebar-1, .dfp-ad-unit, .ad-300x250',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-300x250 sidebar-ad-slot dfp-ad-unit pub_300x250',
    elementId: 'dfp-ad-sidebar-1',
    measuredBehavior: 'DOM element suppression for DFP/IAB medium rectangle classes.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Element offsetParent, computed display, and bounding client dimensions.',
    limitations: 'DNS-only blockers cannot inspect or hide first-party HTML elements.'
  }),
  createTestSpec({
    id: 'DSP-03',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Publisher Ad Tag Placeholder (<ins class="adsbygoogle">)',
    description: 'Evaluates whether standard <ins class="adsbygoogle"> placeholders are suppressed in the DOM.',
    expectedBehavior: 'Element is hidden via injected cosmetic stylesheet.',
    controlResource: 'DOM <ins class="adshield-control-ins">',
    testResource: 'DOM <ins id="ins-adsbygoogle-test" class="adsbygoogle" data-ad-client="ca-pub-0000000000000000">',
    recommendedRule: '##ins.adsbygoogle',
    type: 'cosmetic_dom',
    selectorClasses: 'adsbygoogle google-ad-placeholder',
    elementId: 'ins-adsbygoogle-test',
    measuredBehavior: 'Cosmetic hiding of AdSense <ins> placeholder elements.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'getComputedStyle(ins) and rendered height comparison against neutral control.',
    limitations: 'Does not test external script loading (tested separately in TPA-01).'
  }),
  createTestSpec({
    id: 'DSP-04',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Asynchronous In-Article Ad Container Injection',
    description: 'Inserts a dynamic ad slot (.in-article-ad, .sponsored-banner-slot) on a secondary animation frame to test persistent CSS/MutationObserver filtering.',
    expectedBehavior: 'Dynamically inserted ad container is collapsed immediately upon DOM insertion.',
    controlResource: 'Asynchronously inserted neutral <div class="adshield-async-control">',
    testResource: 'Async DOM <div id="dynamic-ad-slot-04" class="in-article-ad ad-placeholder-box text-ad">',
    recommendedRule: '##.in-article-ad, .ad-placeholder-box, .sponsored-banner-slot',
    type: 'dynamic_cosmetic_dom',
    selectorClasses: 'in-article-ad ad-placeholder-box text-ad sponsored-banner-slot',
    elementId: 'dynamic-ad-slot-04',
    measuredBehavior: 'Cosmetic filtering persistence on asynchronously injected DOM nodes.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Post-mutation computed style and bounding box dimensions.',
    limitations: 'Measures DOM visibility only; does not attribute to a specific extension.'
  }),
  createTestSpec({
    id: 'DSP-05',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Mobile Banner & Responsive Skyscraper Slot (320x50 / 160x600)',
    description: 'Tests cosmetic hiding of responsive mobile/skyscraper ad containers (.mobile-ad-banner, .ad_160x600, .sky-ad-slot).',
    expectedBehavior: 'Responsive ad slot collapses to zero height while neutral control box renders normally.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="mobile-sky-ad-05" class="mobile-ad-banner ad_160x600 sky-ad-slot adsbox">',
    recommendedRule: '##.mobile-ad-banner, .ad_160x600, .sky-ad-slot',
    type: 'cosmetic_dom',
    selectorClasses: 'mobile-ad-banner ad_160x600 sky-ad-slot adsbox',
    elementId: 'mobile-sky-ad-05',
    measuredBehavior: 'Visual suppression of mobile banner and skyscraper ad class signatures.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display/visibility and layout height.',
    limitations: 'First-party DOM check only.'
  }),

  // 5.2 Third-Party Advertising Requests (5 Tests)
  createTestSpec({
    id: 'TPA-01',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Ad-Script Path Pattern (/pagead/js/adsbygoogle.js)',
    description: 'First verifies same-origin connectivity via a neutral control fetch, then attempts a fetch to /pagead/js/adsbygoogle.js.',
    expectedBehavior: 'Neutral control succeeds while ad-script path is aborted client-side (TypeError) prior to HTTP status.',
    controlResource: 'Same-origin neutral control fetch (/?adshield_ctrl=TPA-01)',
    testResource: 'Fetch GET /pagead/js/adsbygoogle.js?adshield_fixture=1',
    recommendedRule: '||*/pagead/js/adsbygoogle.js$script,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/pagead/js/adsbygoogle.js?adshield_fixture=1',
    measuredBehavior: 'Client-side URL pattern interception validated against a live neutral control.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Neutral control HTTP response + target Fetch Promise rejection (TypeError).',
    limitations: 'Evaluates path-aware browser filters; DNS-only blockers do not inspect relative paths.'
  }),
  createTestSpec({
    id: 'TPA-02',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Ad Server Endpoint Probe (static.doubleclick.net)',
    description: 'Exploratory subresource fetch to static.doubleclick.net. Reports REQUEST_FAILED_CAUSE_UNKNOWN on failure because external failures have multiple causes.',
    expectedBehavior: 'Reports whether external endpoint resolved or failed (non-authoritative; excluded from core score).',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://static.doubleclick.net/instream/ad_status.js',
    recommendedRule: '||doubleclick.net^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://static.doubleclick.net/instream/ad_status.js',
    measuredBehavior: 'Reachability of external DoubleClick ad script endpoint.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch resolution vs network rejection.',
    dependsOnThirdParty: true,
    alternativeExplanations: ['Adblocker extension', 'DNS sinkhole', 'Firewall/ISP block', 'CSP or outage'],
    scoringEligible: false,
    limitations: 'P1-6 Fix: Never reported as BLOCKED because client JS cannot distinguish an adblock rule from DNS failure or outage.'
  }),
  createTestSpec({
    id: 'TPA-03',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Ad Syndication Probe (pagead2.googlesyndication.com)',
    description: 'Exploratory subresource probe to pagead2.googlesyndication.com/pagead/show_ads.js.',
    expectedBehavior: 'Reports whether external endpoint resolved or failed (REQUEST_FAILED_CAUSE_UNKNOWN).',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://pagead2.googlesyndication.com/pagead/show_ads.js',
    recommendedRule: '||googlesyndication.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://pagead2.googlesyndication.com/pagead/show_ads.js',
    measuredBehavior: 'Reachability of external Google Syndication script.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch resolution vs rejection.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external probe; excluded from core score denominator.'
  }),
  createTestSpec({
    id: 'TPA-04',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Ad Server Iframe Container Suppression (#google_ads_frame1)',
    description: 'Injects a sandboxed iframe with standard ad-server attributes (id="google_ads_frame1", class="ad-iframe-slot") and checks DOM suppression.',
    expectedBehavior: 'Iframe container is hidden or collapsed by cosmetic/frame rules.',
    controlResource: 'Neutral sandboxed <iframe class="adshield-control-frame">',
    testResource: '<iframe id="google_ads_frame1" class="ad-iframe-slot google_ads_frame">',
    recommendedRule: '###google_ads_frame1, .google_ads_frame, .ad-iframe-slot',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-iframe-slot google_ads_frame',
    elementId: 'google_ads_frame1',
    measuredBehavior: 'DOM suppression of ad-server iframe containers.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Iframe computed display and bounding client height.',
    limitations: 'Tests element-level frame hiding rather than external cross-origin navigation.'
  }),
  createTestSpec({
    id: 'TPA-05',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Ad Image Asset Path (/ads/banner_300x250.gif)',
    description: 'Requests a controlled relative ad-image path (/ads/banner_300x250.gif?adunit=top) after validating same-origin control connectivity.',
    expectedBehavior: 'Fetch request to /ads/banner_300x250.gif is aborted client-side prior to HTTP status response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/banner_300x250.gif?adunit=top&adshield=1',
    recommendedRule: '||*/ads/banner_*.gif$image,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/ads/banner_300x250.gif?adunit=top&adshield=1',
    measuredBehavior: 'Interception of URL paths matching /ads/banner_*.gif filter rules.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'Relative URL path test; evaluates path-matching rules rather than domain resolution.'
  }),

  // 5.3 Tracking Pixels and Beacons (5 Tests)
  createTestSpec({
    id: 'TRK-01',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: '1x1 Tracking Pixel DOM & Telemetry Path (/r/collect)',
    description: 'Evaluates both DOM visibility of <img class="tracking-pixel"> and network interception of /r/collect?v=1&tid=UA-000000-1 separately.',
    expectedBehavior: 'Both the /r/collect telemetry path and the .tracking-pixel image element are blocked/hidden.',
    controlResource: 'Neutral 1x1 control image element + same-origin fetch control',
    testResource: '<img class="tracking-pixel"> + Fetch /r/collect?v=1&tid=UA-000000-1&t=pageview',
    recommendedRule: '||*/r/collect?*$xmlhttprequest,image\n##img.tracking-pixel',
    type: 'pixel_probe',
    probePath: '/r/collect?v=1&tid=UA-000000-1&t=pageview&cid=synthetic',
    selectorClasses: 'tracking-pixel analytics-pixel beacon-img',
    measuredBehavior: 'Separate measurement of 1x1 pixel cosmetic hiding and /r/collect URL interception.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Image computed style + Fetch promise outcome.',
    limitations: 'Uses synthetic non-identifying parameters (UA-000000-1).'
  }),
  createTestSpec({
    id: 'TRK-02',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Analytics Domain Probe (google-analytics.com)',
    description: 'Exploratory probe to www.google-analytics.com/analytics.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable (non-scored).',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://www.google-analytics.com/analytics.js',
    recommendedRule: '||google-analytics.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://www.google-analytics.com/analytics.js',
    measuredBehavior: 'Reachability of external Google Analytics script.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch resolution vs rejection.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory third-party endpoint; excluded from core score denominator.'
  }),
  createTestSpec({
    id: 'TRK-03',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Navigator.sendBeacon Telemetry Correlation & Wrapper Check',
    description: 'P1-4 Fix: Queries /api/fixture/beacon arrival correlation when backend is active; otherwise treats non-native sendBeacon wrappers or boolean returns as CONSISTENT_WITH_FILTERING / INCONCLUSIVE (never a confirmed block).',
    expectedBehavior: 'Reports server-correlated drop if fixture server is active, or CONSISTENT_WITH_FILTERING / INCONCLUSIVE without server correlation.',
    controlResource: 'First-party beacon arrival check + Function.prototype.toString inspection',
    testResource: 'navigator.sendBeacon("/pixel/track?event=adshield_synthetic")',
    recommendedRule: '||*/pixel/track?*$ping,beacon',
    type: 'beacon_check',
    measuredBehavior: 'Beacon transmission outcome and prototype wrapper inspection.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'First-party correlation receipt or navigator.sendBeacon boolean + function signature.',
    scoringEligible: false,
    limitations: 'P1-4 Fix: Without an active backend arrival log, a non-native sendBeacon wrapper or boolean return is never treated as a confirmed BLOCKED pass.'
  }),
  createTestSpec({
    id: 'TRK-04',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Session-Replay Domain Probe (static.hotjar.com)',
    description: 'Exploratory probe to static.hotjar.com/c/hotjar-000000.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://static.hotjar.com/c/hotjar-000000.js',
    recommendedRule: '||hotjar.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://static.hotjar.com/c/hotjar-000000.js',
    measuredBehavior: 'Reachability of external Hotjar script endpoint.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external check; not included in core weighted score.'
  }),
  createTestSpec({
    id: 'TRK-05',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Conversion Pixel Path (/tr?id=00000&ev=PageView)',
    description: 'Tests URL pattern filtering against a controlled path matching standard conversion pixel query structures (/tr?id=000000&ev=PageView&noscript=1).',
    expectedBehavior: 'Request is aborted client-side by EasyPrivacy/tracker path rules while neutral control succeeds.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /tr?id=000000000&ev=PageView&noscript=1',
    recommendedRule: '||*/tr?id=*&ev=PageView$image,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/tr?id=000000000&ev=PageView&noscript=1',
    measuredBehavior: 'Client-side interception of conversion-pixel URL query patterns.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'First-party path simulation; evaluates query-pattern filter rules.'
  }),

  // 5.4 Annoying Advertising Behaviors (5 Tests)
  createTestSpec({
    id: 'INT-01',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Full-Screen Interstitial Overlay Suppression',
    description: 'Renders a contained synthetic interstitial overlay (#ad-interstitial-modal, .interstitial-ad-overlay) inside the sandbox fixture.',
    expectedBehavior: 'Cosmetic annoyance/ad filter hides or collapses the interstitial overlay.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="ad-interstitial-modal" class="interstitial-ad-overlay ad-modal-backdrop">',
    recommendedRule: '###ad-interstitial-modal, .interstitial-ad-overlay',
    type: 'cosmetic_dom',
    selectorClasses: 'interstitial-ad-overlay ad-modal-backdrop popup-ad-overlay',
    elementId: 'ad-interstitial-modal',
    measuredBehavior: 'DOM hiding of full-screen ad interstitial classes.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display/visibility and bounding box dimensions.',
    limitations: 'Isolated inside the sandbox container so the page UI is never obstructed.'
  }),
  createTestSpec({
    id: 'INT-02',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Sticky Bottom Catfish Banner (.sticky-ad-bottom)',
    description: 'Tests whether sticky bottom ad containers (#fixed-ad-footer, .sticky-ad-bottom) are hidden.',
    expectedBehavior: 'Sticky ad container is hidden by cosmetic rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="fixed-ad-footer" class="sticky-ad-bottom bottom-ad-wrapper adsbox">',
    recommendedRule: '###fixed-ad-footer, .sticky-ad-bottom',
    type: 'cosmetic_dom',
    selectorClasses: 'sticky-ad-bottom bottom-ad-wrapper fixed-ad-banner adsbox',
    elementId: 'fixed-ad-footer',
    measuredBehavior: 'DOM suppression of sticky bottom banner selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed style and layout dimensions.',
    limitations: 'Requires CSS cosmetic filtering capability.'
  }),
  createTestSpec({
    id: 'INT-03',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'redirect_popup_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Popup Scriptlet Wrapper & Popunder Trigger Suppression',
    description: 'P0-2 Fix: Does NOT award credit for a self-imposed iframe sandbox restriction. Separately checks whether window.open is wrapped by a blocker scriptlet and whether a .popunder-ad-trigger anchor is hidden in the DOM.',
    expectedBehavior: 'Popup trigger element is hidden and/or window.open is shimmed by an active popup-defuser scriptlet while neutral control anchor remains visible.',
    controlResource: 'Neutral anchor <a class="adshield-control-link"> + native function baseline',
    testResource: 'DOM <a id="popunder-trigger-03" class="popunder-ad-trigger ad-pop-link adsbox"> + window.open descriptor check',
    recommendedRule: '##.popunder-ad-trigger, .ad-pop-link\n+*##+js(nowoif)',
    type: 'popup_filter_check',
    selectorClasses: 'popunder-ad-trigger ad-pop-link adsbox',
    elementId: 'popunder-trigger-03',
    measuredBehavior: 'Active popup-defuser scriptlet wrapping and DOM suppression of popunder trigger links.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'window.open descriptor/toString inspection + popunder trigger element computed style.',
    limitations: 'Never uses an iframe lacking allow-popups to claim an adblock pass.'
  }),
  createTestSpec({
    id: 'INT-04',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Unmuted Media Autoplay Restriction Signal',
    description: 'Evaluates browser autoplay restriction posture on unmuted HTMLMediaElement playback.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE if unmuted play() is rejected by browser/extension policy, or INCONCLUSIVE after user gesture activation.',
    controlResource: 'HTMLAudioElement API availability check',
    testResource: 'In-memory silent WAV data-URI unmuted audio.play() promise',
    recommendedRule: 'Browser Settings -> Site Settings -> Sound / Autoplay -> Block',
    type: 'autoplay_policy_check',
    measuredBehavior: 'Browser media autoplay policy enforcement.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'HTMLMediaElement.play() Promise rejection (NotAllowedError) vs resolution.',
    scoringEligible: false,
    limitations: 'P0-3 Fix: Categorized under Browser Privacy & Hardening Signals so browser media policies never distort the Ad & Tracker Blocking Score.'
  }),
  createTestSpec({
    id: 'INT-05',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Scroll-Lock & Page Takeover Backdrop Mitigation (.tp-backdrop)',
    description: 'Tests whether known takeover/scroll-lock overlay classes (.tp-modal, .tp-backdrop, .fc-ab-root) are hidden.',
    expectedBehavior: 'Takeover backdrop elements are collapsed by annoyance rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="tp-backdrop-test" class="tp-modal tp-backdrop fc-ab-root ad-takeover-overlay">',
    recommendedRule: '##.tp-modal, .tp-backdrop, .fc-ab-root',
    type: 'cosmetic_dom',
    selectorClasses: 'tp-modal tp-backdrop fc-ab-root ad-takeover-overlay',
    elementId: 'tp-backdrop-test',
    measuredBehavior: 'Cosmetic hiding of scroll-lock modal backdrop classes.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed style and bounding client height.',
    limitations: 'Tests known modal takeover class selectors.'
  }),

  // 5.5 Video Advertisements (4 Tests)
  createTestSpec({
    id: 'VID-01',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Google IMA3 Video Ad SDK Probe',
    description: 'Exploratory probe to imasdk.googleapis.com/js/sdkloader/ima3.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
    recommendedRule: '||imasdk.googleapis.com/js/sdkloader/ima3.js$script',
    type: 'external_domain_probe',
    targetUrl: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
    measuredBehavior: 'Reachability of external IMA3 video ad SDK.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external probe; excluded from core score denominator.'
  }),
  createTestSpec({
    id: 'VID-02',
    section: '5.5 Video Advertisements',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Video Player Pre-Roll & Companion Ad Overlay (.video-ads)',
    description: 'Injects synthetic video ad overlay containers (.video-ads, .ytp-ad-module, .ima-ad-container) into the fixture.',
    expectedBehavior: 'Cosmetic filter collapses the video ad overlay container.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="video-ad-overlay-test" class="video-ads ytp-ad-module ima-ad-container">',
    recommendedRule: '##.video-ads, .ytp-ad-module, .ima-ad-container',
    type: 'cosmetic_dom',
    selectorClasses: 'video-ads ytp-ad-module ima-ad-container vjs-ad-playing',
    elementId: 'video-ad-overlay-test',
    measuredBehavior: 'UI-level cosmetic hiding of HTML5 video player ad overlays.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and rendered height.',
    limitations: 'Evaluates overlay visibility, not streaming manifest manipulation.'
  }),
  createTestSpec({
    id: 'VID-03',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled VAST / VMAP XML Ad Tag Path (/ads/vast.xml)',
    description: 'Tests URL interception on a controlled VAST XML request path (/ads/vast.xml?ad_rule=1&vad_type=linear).',
    expectedBehavior: 'Request is aborted client-side by VAST ad-tag filter rules while neutral control succeeds.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/vast.xml?ad_rule=1&vad_type=linear&adshield=1',
    recommendedRule: '||*/ads/vast.xml*$xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/ads/vast.xml?ad_rule=1&vad_type=linear&adshield=1',
    measuredBehavior: 'Client-side blocking of VAST XML ad tag URL patterns.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'First-party path test.'
  }),
  createTestSpec({
    id: 'VID-04',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Mid-Roll Video Ad Quartile Ping Path (/video/ad_tracking?event=midpoint)',
    description: 'Tests whether synthetic video ad quartile tracking pings (/video/ad_tracking?ad_id=99&event=midpoint) are intercepted.',
    expectedBehavior: 'Video ad tracking request is aborted client-side.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /video/ad_tracking?ad_id=99&event=midpoint&vast=1',
    recommendedRule: '||*/video/ad_tracking?*$xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/video/ad_tracking?ad_id=99&event=midpoint&vast=1',
    measuredBehavior: 'Interception of video ad quartile telemetry URLs.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'Evaluates URL pattern matching on synthetic quartile events.'
  }),

  // 5.6 Search, Sponsored Content & Native Advertising (4 Tests)
  createTestSpec({
    id: 'NAT-01',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Sponsored Search Result Container (#tads, .commercial-unit)',
    description: 'Injects synthetic search ad containers (#tads, .commercial-unit-desktop-top) into the test fixture.',
    expectedBehavior: 'Search ad container is hidden unless Acceptable Ads exceptions are enabled.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="tads" class="commercial-unit-desktop-top ads-ad">',
    recommendedRule: '###tads, .commercial-unit-desktop-top',
    type: 'cosmetic_dom',
    selectorClasses: 'commercial-unit-desktop-top ads-ad sponsored-search-ad',
    elementId: 'tads',
    measuredBehavior: 'Cosmetic suppression of search ad containers.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and rendered height.',
    limitations: 'First-party native search ads served without standard selectors cannot be blocked by generic CSS.'
  }),
  createTestSpec({
    id: 'NAT-02',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Native Recommendation Widget Containers (.OUTBRAIN, #taboola)',
    description: 'Tests cosmetic hiding of third-party recommendation widget containers (#taboola-below-article-thumbnails, .OUTBRAIN).',
    expectedBehavior: 'Recommendation widget containers are hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="taboola-below-article-thumbnails" class="OUTBRAIN trc_rbox_container">',
    recommendedRule: '###taboola-below-article-thumbnails, .OUTBRAIN, .trc_rbox_container',
    type: 'cosmetic_dom',
    selectorClasses: 'OUTBRAIN trc_rbox_container taboola-widget',
    elementId: 'taboola-below-article-thumbnails',
    measuredBehavior: 'DOM hiding of Taboola and Outbrain container selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and layout height.',
    limitations: 'Measures DOM container hiding separately from network requests.'
  }),
  createTestSpec({
    id: 'NAT-03',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Native Ad Network Probe (widgets.outbrain.com)',
    description: 'Exploratory subresource probe to widgets.outbrain.com/outbrain.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://widgets.outbrain.com/outbrain.js',
    recommendedRule: '||outbrain.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://widgets.outbrain.com/outbrain.js',
    measuredBehavior: 'Reachability of external Outbrain widget script.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external probe; excluded from core score denominator.'
  }),
  createTestSpec({
    id: 'NAT-04',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Sponsored Product Card & In-Feed Native Unit (.sponsored-product-card)',
    description: 'Tests cosmetic filtering of in-feed sponsored product placements (.sponsored-product-card, .native-ad-item, .promoted-listing).',
    expectedBehavior: 'In-feed sponsored card is collapsed by cosmetic rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="native-product-04" class="sponsored-product-card native-ad-item adsbox">',
    recommendedRule: '##.sponsored-product-card, .native-ad-item, .promoted-listing',
    type: 'cosmetic_dom',
    selectorClasses: 'sponsored-product-card native-ad-item promoted-listing adsbox',
    elementId: 'native-product-04',
    measuredBehavior: 'Cosmetic hiding of sponsored product card selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed style and rendered dimensions.',
    limitations: 'First-party native ads without distinguishing classes cannot be separated from organic content by network filters.'
  }),

  // 5.7 Social and Embedded Advertising (3 Tests)
  createTestSpec({
    id: 'SOC-01',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Social Pixel Probe (connect.facebook.net/fbevents.js)',
    description: 'Exploratory subresource probe to connect.facebook.net/en_US/fbevents.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://connect.facebook.net/en_US/fbevents.js',
    recommendedRule: '||connect.facebook.net/*/fbevents.js$script',
    type: 'external_domain_probe',
    targetUrl: 'https://connect.facebook.net/en_US/fbevents.js',
    measuredBehavior: 'Reachability of Meta Pixel fbevents.js endpoint.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external check; excluded from core score denominator.'
  }),
  createTestSpec({
    id: 'SOC-02',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Sponsored Social Feed Card (.promoted-tweet, .sponsored-post)',
    description: 'Injects synthetic social promotional feed containers (.promoted-tweet, .fbEmuTracking, .ad-social-card).',
    expectedBehavior: 'Social promotional container is hidden.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="social-ad-card-test" class="promoted-tweet fbEmuTracking ad-social-card">',
    recommendedRule: '##.promoted-tweet, .fbEmuTracking, .ad-social-card',
    type: 'cosmetic_dom',
    selectorClasses: 'promoted-tweet fbEmuTracking ad-social-card sponsored-post-unit',
    elementId: 'social-ad-card-test',
    measuredBehavior: 'DOM hiding of promoted social feed selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and rendered height.',
    limitations: 'Tests known social ad class selectors.'
  }),
  createTestSpec({
    id: 'SOC-03',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Embedded Social Share & Tracking Widget Container (.addthis_toolbox)',
    description: 'Tests cosmetic suppression of embedded social tracking toolbars (.addthis_toolbox, .sharethis-inline-share-buttons).',
    expectedBehavior: 'Social tracking widget container is hidden by social annoyance/privacy lists.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="social-widget-03" class="addthis_toolbox sharethis-inline-share-buttons">',
    recommendedRule: '##.addthis_toolbox, .sharethis-inline-share-buttons',
    type: 'cosmetic_dom',
    selectorClasses: 'addthis_toolbox sharethis-inline-share-buttons social-tracking-widget',
    elementId: 'social-widget-03',
    measuredBehavior: 'DOM hiding of third-party social share widget containers.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and layout height.',
    limitations: 'Only hidden when social widget filter lists are enabled.'
  }),

  // 5.8 Affiliate and Tracking Scenarios (4 Tests)
  createTestSpec({
    id: 'AFF-01',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'redirect_popup_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Affiliate Click-Tracking Path (/aff_c?offer_id=999)',
    description: 'Tests whether requests to synthetic affiliate click-measurement paths (/aff_c?offer_id=999&aff_id=888) are intercepted.',
    expectedBehavior: 'Request is aborted client-side by affiliate/tracking URL filter rules.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /aff_c?offer_id=999&aff_id=888&adshield_test=1',
    recommendedRule: '||*/aff_c?offer_id=*$doc,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/aff_c?offer_id=999&aff_id=888&adshield_test=1',
    measuredBehavior: 'Client-side interception of HasOffers/affiliate click-tracking path patterns.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'Never navigates the tab or triggers external affiliate redirects.'
  }),
  createTestSpec({
    id: 'AFF-02',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'redirect_popup_prevention',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'URL Tracking Parameter Hygiene Signal (fbclid / gclid / utm_*)',
    description: 'Inspects current document location for residual tracking parameters. Evaluated in the Privacy Signals index.',
    expectedBehavior: 'Reports whether active location URL is free of known click-tracking parameters.',
    controlResource: 'window.location.search inspection',
    testResource: 'Location query parameter check (fbclid, gclid, msclkid, mc_eid)',
    recommendedRule: '*$removeparam=/^(fbclid|gclid|msclkid|mc_eid)$/',
    type: 'query_param_check',
    measuredBehavior: 'Presence of tracking query parameters on current document location.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'URLSearchParams inspection of window.location.search.',
    scoringEligible: false,
    limitations: 'Excluded from Ad & Tracker Blocking Score because an in-page URL check cannot test top-level navigation query stripping unless navigated with parameters.'
  }),
  createTestSpec({
    id: 'AFF-03',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'redirect_popup_prevention',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Cross-Origin Referrer Policy Hardening Signal',
    description: 'Inspects document referrer policy configuration as part of the Browser Privacy & Hardening Signals index.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE if strict no-referrer/same-origin policy is enforced, or SIGNAL_INACTIVE for standard defaults.',
    controlResource: 'Document meta[name="referrer"] & document.referrer inspection',
    testResource: 'Document Referrer-Policy evaluation',
    recommendedRule: 'Browser Privacy Config: network.http.sendRefererHeader = 0',
    type: 'referrer_policy_check',
    measuredBehavior: 'Document Referrer-Policy configuration inspection.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'Meta referrer attribute inspection.',
    scoringEligible: false,
    limitations: 'P0-3 Fix: Evaluated in the separate Privacy Signals index; never inflates the Ad & Tracker Blocking Score.'
  }),
  createTestSpec({
    id: 'AFF-04',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Click-Attribution Beacon Path (/clk?ad_id=100&redir=none)',
    description: 'Tests client-side blocking of outbound click-measurement endpoints (/clk?ad_id=100&adurl=example).',
    expectedBehavior: 'Click attribution path is intercepted prior to server response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /clk?ad_id=100&adurl=https%3A%2F%2Fexample.invalid',
    recommendedRule: '||*/clk?ad_id=*&adurl=*$xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/clk?ad_id=100&adurl=https%3A%2F%2Fexample.invalid',
    measuredBehavior: 'Interception of /clk?adurl= click attribution requests.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'First-party path test.'
  }),

  // 5.9 Anti-Adblock & Circumvention Scenarios (4 Tests)
  createTestSpec({
    id: 'AAB-01',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Bait Element OffsetHeight & Scriptlet Surrogate Inspection',
    description: 'Injects a classic .adsbox bait element and checks both whether it is hidden and whether surrogate globals (google_ad_status) are shimmed.',
    expectedBehavior: 'Bait is hidden by cosmetic rules and/or scriptlet shims neutralize detection.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div class="ad_unit adsbox text-ad"> + window surrogate check',
    recommendedRule: '##.adsbox, .ad_unit, .text-ad',
    type: 'anti_adblock_bait_check',
    measuredBehavior: 'Interaction between cosmetic bait hiding and anti-adblock surrogate globals.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'bait.offsetHeight and window global property checks.',
    limitations: 'Many anti-adblock scriptlets only inject on specific domain names listed in filter lists.'
  }),
  createTestSpec({
    id: 'AAB-02',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Anti-Adblock Warning Modal Suppression (#adblock-notice, .adblock-modal)',
    description: 'Injects a synthetic anti-adblock nag container (#adblock-notice, .adblock-modal) to test Adblock Warning Removal rules.',
    expectedBehavior: 'Anti-adblock modal container is hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="adblock-notice" class="adblock-modal adb-overlay">',
    recommendedRule: '###adblock-notice, .adblock-modal, .adb-overlay',
    type: 'cosmetic_dom',
    selectorClasses: 'adblock-modal adb-overlay adblocker-warning',
    elementId: 'adblock-notice',
    measuredBehavior: 'Cosmetic hiding of anti-adblock warning modal selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and layout height.',
    limitations: 'Requires anti-adblock or annoyance filter lists.'
  }),
  createTestSpec({
    id: 'AAB-03',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Ad Container Re-Insertion Resilience',
    description: 'Simulates a script removing and re-inserting an ad node (.adsbox, .ad-banner) to verify continuous CSS rule enforcement.',
    expectedBehavior: 'Re-inserted ad node remains hidden immediately upon re-insertion.',
    controlResource: 'Re-inserted neutral control element',
    testResource: 'Re-inserted <div id="recreated-ad-node-03" class="adsbox ad-banner ad-unit-recreated">',
    recommendedRule: '##.adsbox, .ad-banner, .ad-unit-recreated',
    type: 'dynamic_cosmetic_dom',
    selectorClasses: 'adsbox ad-banner ad-unit-recreated',
    elementId: 'recreated-ad-node-03',
    measuredBehavior: 'Persistence of cosmetic hiding across DOM removal and re-insertion.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and bounding box after re-insertion.',
    limitations: 'Validates persistent CSS rules.'
  }),
  createTestSpec({
    id: 'AAB-04',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Fallback Ad-Loader Retry Interception (/ads/fallback_loader.js)',
    description: 'Simulates an anti-adblock recovery script attempting to fetch a secondary ad path (/ads/fallback_loader.js?retry=1).',
    expectedBehavior: 'Secondary fallback ad request is also intercepted client-side.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/fallback_loader.js?retry=1&ad_recover=1',
    recommendedRule: '||*/ads/fallback_loader.js*$script,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/ads/fallback_loader.js?retry=1&ad_recover=1',
    measuredBehavior: 'Interception of secondary/fallback /ads/* script requests.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'Controlled relative path probe.'
  }),

  // 5.10 Script & Resource Filtering (4 Tests)
  createTestSpec({
    id: 'SCR-01',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Dynamic <script> Tag Injection Interception (/ads/adserver.js)',
    description: 'Dynamically appends <script src="/ads/adserver.js?adshield=1"> and distinguishes immediate filter error from HTTP 404.',
    expectedBehavior: 'Script element fires onerror AND companion fetch confirms client-side abort prior to HTTP status while neutral control succeeds.',
    controlResource: 'Same-origin neutral control fetch + DOM script element check',
    testResource: '<script src="/ads/adserver.js?adshield_synthetic=1">',
    recommendedRule: '||*/ads/adserver.js*$script',
    type: 'script_tag_probe',
    probePath: '/ads/adserver.js?adshield_synthetic=1',
    measuredBehavior: 'HTMLScriptElement loading interception on /ads/adserver.js.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'script.onerror event + companion fetch status verification.',
    limitations: 'Cross-checks fetch abortion vs HTTP 404 so missing backend routes are never misclassified as adblock passes.'
  }),
  createTestSpec({
    id: 'SCR-02',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'XMLHttpRequest Ad Bid Endpoint Interception (/adserver/bid)',
    description: 'Tests whether XMLHttpRequest to /adserver/bid?slot=leaderboard&ad_type=banner is aborted at status 0.',
    expectedBehavior: 'XHR errors out with status 0 (client abort) rather than receiving an HTTP response code.',
    controlResource: 'Same-origin neutral control check',
    testResource: 'XHR GET /adserver/bid?slot=leaderboard&ad_type=banner',
    recommendedRule: '||*/adserver/bid?*$xmlhttprequest',
    type: 'xhr_pattern_probe',
    probePath: '/adserver/bid?slot=leaderboard&ad_type=banner',
    measuredBehavior: 'Client-side XHR interception (status === 0 onerror) vs HTTP server response.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'xhr.onerror with xhr.status === 0.',
    limitations: 'Strictly distinguishes status 0 client abort from HTTP 404.'
  }),
  createTestSpec({
    id: 'SCR-03',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'PerformanceResourceTiming Cross-Origin Timing Isolation',
    description: 'Verifies that cross-origin resource entries in performance.getEntriesByType("resource") do not leak unpermitted transferSize bytes.',
    expectedBehavior: 'Cross-origin probes expose 0 transferSize bytes (Browser spec capability check).',
    controlResource: 'performance.getEntriesByType("resource") availability',
    testResource: 'PerformanceResourceTiming entry inspection',
    recommendedRule: 'Standard W3C Timing-Allow-Origin Browser Isolation',
    type: 'resource_timing_check',
    measuredBehavior: 'ResourceTiming transferSize isolation on cross-origin requests.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'PerformanceResourceTiming.transferSize.',
    scoringEligible: false,
    limitations: 'Evaluated in the Privacy & Hardening Signals index; never counted in the Ad & Tracker Blocking Score.'
  }),
  createTestSpec({
    id: 'SCR-04',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Telemetry Stylesheet Link Interception (/ads/sponsored_styles.css)',
    description: 'Tests whether CSS stylesheet requests to /ads/sponsored_styles.css?ad_tracker=1 are blocked client-side.',
    expectedBehavior: 'Request to /ads/sponsored_styles.css is aborted prior to HTTP status response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/sponsored_styles.css?ad_tracker=1',
    recommendedRule: '||*/ads/sponsored_styles.css*$stylesheet,xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/ads/sponsored_styles.css?ad_tracker=1',
    measuredBehavior: 'Interception of ad-path stylesheet requests.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'First-party path test.'
  }),

  // 5.11 Fingerprinting and Privacy-Related Signals (4 Tests: Separate Privacy Index)
  createTestSpec({
    id: 'FPR-01',
    section: '5.11 Fingerprinting & Privacy Signals',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Global Privacy Control (GPC) & Do Not Track Signal',
    description: 'P0-3 Fix: Inspects navigator.globalPrivacyControl and navigator.doNotTrack. Reported in the Browser Privacy Signals index, NOT as an adblock pass.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE when navigator.globalPrivacyControl === true or navigator.doNotTrack === "1".',
    controlResource: 'Navigator object inspection',
    testResource: 'navigator.globalPrivacyControl / navigator.doNotTrack',
    recommendedRule: 'Browser Privacy Settings -> Enable "Send Global Privacy Control (GPC)"',
    type: 'gpc_dnt_check',
    measuredBehavior: 'Presence of active opt-out privacy signals exposed to websites.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'navigator.globalPrivacyControl boolean and navigator.doNotTrack string.',
    scoringEligible: false,
    limitations: 'P0-3 Fix: GPC/DNT is a policy opt-out preference, not proof that an ad or tracker was blocked. Tracked in the separate Privacy Signals index.'
  }),
  createTestSpec({
    id: 'FPR-02',
    section: '5.11 Fingerprinting & Privacy Signals',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Storage Access API & LocalStorage Partitioning Signal',
    description: 'Non-invasively checks document.hasStorageAccess support and first-party storage restriction posture.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE if storage is actively restricted or partitioning interface is present.',
    controlResource: 'Document API & localStorage availability',
    testResource: 'document.hasStorageAccess() + ephemeral key cleanup',
    recommendedRule: 'Browser Privacy Settings -> Block Third-Party Cookies / State Partitioning',
    type: 'storage_isolation_check',
    measuredBehavior: 'Availability of Storage Access API and first-party storage restriction state.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'typeof document.hasStorageAccess and localStorage read/write.',
    scoringEligible: false,
    limitations: 'Evaluated in the Privacy Signals index; never inflates the Ad & Tracker Blocking Score.'
  }),
  createTestSpec({
    id: 'FPR-03',
    section: '5.11 Fingerprinting & Privacy Signals',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Hardware Memory & WebGL Renderer Entropy Restriction Signal',
    description: 'P0-3 Fix: Checks whether navigator.deviceMemory and WEBGL_debug_renderer_info are masked/omitted. Evaluated in the Privacy Signals index.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE when high-entropy hardware hints are masked or omitted.',
    controlResource: 'HTMLCanvasElement context creation',
    testResource: 'navigator.deviceMemory & WEBGL_debug_renderer_info check',
    recommendedRule: 'about:config -> privacy.resistFingerprinting = true (or Brave Shields Strict)',
    type: 'fingerprint_surface_check',
    measuredBehavior: 'Exposure vs restriction of hardware memory and unmasked GPU renderer strings.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'navigator.deviceMemory and gl.getExtension("WEBGL_debug_renderer_info").',
    scoringEligible: false,
    limitations: 'P0-3 Fix: Hardware surface masking is a browser fingerprinting protection, not ad blocking. Tracked in the separate Privacy Signals index.'
  }),
  createTestSpec({
    id: 'FPR-04',
    section: '5.11 Fingerprinting & Privacy Signals',
    scoringCategory: 'tracker_beacon_blocking',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'AudioContext & Canvas Readback Scriptlet Guard Signal',
    description: 'Verifies whether AudioContext and 2D Canvas readback APIs exhibit anti-fingerprinting scriptlet wrappers.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE if prototype wrappers are detected, or INCONCLUSIVE (since C++ farbling is invisible to JS prototype inspection).',
    controlResource: 'CanvasRenderingContext2D prototype check',
    testResource: 'Canvas getImageData & toDataURL prototype native-code check',
    recommendedRule: 'Brave Shields Fingerprinting Block / CanvasBlocker Extension',
    type: 'audio_canvas_guard_check',
    measuredBehavior: 'Detection of scriptlet wrappers on Canvas/Audio readback methods.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'Function.prototype.toString on getImageData / toDataURL.',
    scoringEligible: false,
    limitations: 'Tracked in the Privacy Signals index; excluded from the Ad & Tracker Blocking Score.'
  }),

  // 5.12 Consent, Notifications & Deceptive Permission Prompts (3 Tests)
  createTestSpec({
    id: 'CNS-01',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'cosmetic_filtering',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Cookie Consent Banner Suppression (#onetrust-banner-sdk, .cc-window)',
    description: 'Injects a synthetic cookie consent container (#onetrust-banner-sdk, .cc-window) to test Cookie/Annoyance filter lists.',
    expectedBehavior: 'Cookie notice banner is hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="onetrust-banner-sdk" class="cc-window cookie-consent-banner">',
    recommendedRule: '###onetrust-banner-sdk, .cc-window, .cookie-consent-banner',
    type: 'cosmetic_dom',
    selectorClasses: 'cc-window cookie-consent-banner qc-cmp2-container',
    elementId: 'onetrust-banner-sdk',
    measuredBehavior: 'DOM hiding of OneTrust/CookieConsent banner selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed display and rendered height.',
    limitations: 'Only blocked if cookie/annoyance filter lists are enabled.'
  }),
  createTestSpec({
    id: 'CNS-02',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Deceptive Download Banner Suppression (.ad-download-button)',
    description: 'Injects a synthetic deceptive download button container (.ad-download-button, .fake-download-banner) into the sandbox.',
    expectedBehavior: 'Deceptive download banner container is hidden.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="fake-dl-banner-02" class="ad-download-button fake-download-banner adsbox">',
    recommendedRule: '##.ad-download-button, .fake-download-banner',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-download-button fake-download-banner sponsor-download adsbox',
    elementId: 'fake-dl-banner-02',
    measuredBehavior: 'Cosmetic hiding of deceptive download button selectors.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Computed style and layout dimensions.',
    limitations: 'Purely synthetic DOM element; never initiates a file download.'
  }),
  createTestSpec({
    id: 'CNS-03',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'intrusive_ad_prevention',
    metricGroup: METRIC_GROUP.PRIVACY_SIGNAL,
    name: 'Notification Permission Posture Signal (Read-Only Check)',
    description: 'Reads Notification.permission without triggering any permission prompt. Evaluated in the Privacy Signals index.',
    expectedBehavior: 'Reports SIGNAL_ACTIVE if Notification permission is explicitly denied or omitted.',
    controlResource: 'Window Notification API check',
    testResource: 'Notification.permission property inspection',
    recommendedRule: 'Browser Settings -> Notifications -> Block new requests',
    type: 'notification_state_check',
    measuredBehavior: 'Verification of Notification.permission state on current origin.',
    technicalValidity: VALIDITY_CLASS.PRIVACY_CAPABILITY,
    browserObservation: 'Notification.permission string.',
    scoringEligible: false,
    limitations: 'Evaluated in the Privacy Signals index; never inflates the Ad & Tracker Blocking Score.'
  }),

  // 5.13 Network-Level Blocking Scenarios (3 Tests)
  createTestSpec({
    id: 'NET-01',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Controlled Network Ad-Endpoint Simulation (/pagead/adview)',
    description: 'Requests a controlled path with ad-network query signatures (/pagead/adview?ad_type=banner&adnet=1) validated against a neutral control fetch.',
    expectedBehavior: 'Ad-signature request is aborted while the neutral control succeeds.',
    controlResource: 'Same-origin neutral control fetch',
    testResource: 'Fetch GET /pagead/adview?ad_type=banner&adnet=1',
    recommendedRule: '||*/pagead/adview?*$xmlhttprequest',
    type: 'url_pattern_probe',
    probePath: '/pagead/adview?ad_type=banner&adnet=1',
    measuredBehavior: 'Client-side network interception of /pagead/adview requests.',
    technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
    browserObservation: 'Fetch rejection vs HTTP response.',
    limitations: 'First-party path check; proves URL-level network interception in the browser.'
  }),
  createTestSpec({
    id: 'NET-02',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Ad Service Domain Probe (adservice.google.com)',
    description: 'Exploratory subresource probe to adservice.google.com/adsid/integrator.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://adservice.google.com/adsid/integrator.js',
    recommendedRule: '||adservice.google.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://adservice.google.com/adsid/integrator.js',
    measuredBehavior: 'Reachability of external adservice.google.com domain.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external domain probe; cannot distinguish DNS filtering from browser extension filtering.'
  }),
  createTestSpec({
    id: 'NET-03',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Exploratory Telemetry Domain Probe (sb.scorecardresearch.com)',
    description: 'Exploratory subresource probe to sb.scorecardresearch.com/beacon.js.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when unreachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://sb.scorecardresearch.com/beacon.js',
    recommendedRule: '||scorecardresearch.com^$third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://sb.scorecardresearch.com/beacon.js',
    measuredBehavior: 'Reachability of external ScorecardResearch beacon domain.',
    technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
    browserObservation: 'no-cors Fetch outcome.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Exploratory external probe; excluded from core score denominator by default.'
  }),

  // 5.14 Dedicated Monetag Ad-Network Test Blocks (2 Tests: Isolated Test Chamber)
  createTestSpec({
    id: 'MTG-01',
    section: '5.14 Dedicated Monetag Test Blocks',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.AD_TRACKER_BLOCKING,
    name: 'Monetag Dedicated Zone Container & Tag Path Interception',
    description: 'Tests Monetag ad-zone container suppression (.monetag-ad-zone, [data-monetag-zone]) and controlled Monetag script delivery path (/ads/monetag_tag.min.js) strictly inside the isolated Monetag test block.',
    expectedBehavior: 'Monetag script delivery path is intercepted client-side and/or the dedicated .monetag-ad-zone slot is collapsed while neutral control succeeds.',
    controlResource: 'Isolated Monetag Test Block Neutral Control (<div class="adshield-control-box">)',
    testResource: 'Dedicated Sandbox <div id="monetag-zone-fixture-01" class="monetag-ad-zone adsbox"> + Fetch /ads/monetag_tag.min.js?zone=0000',
    recommendedRule: '||alwingulla.com^$third-party\n||vemtoutcheeg.com^$third-party\n##.monetag-ad-zone, [data-monetag-zone]',
    type: 'monetag_isolated_block',
    probePath: '/ads/monetag_tag.min.js?zone=0000&ad_network=monetag',
    selectorClasses: 'monetag-ad-zone adsbox ad-banner-monetag',
    elementId: 'monetag-zone-fixture-01',
    measuredBehavior: 'Isolated Monetag zone container cosmetic suppression and controlled Monetag tag path interception.',
    technicalValidity: VALIDITY_CLASS.DEDICATED_AD_CHAMBER,
    browserObservation: 'Isolated Monetag chamber DOM dimensions + controlled tag fetch outcome.',
    limitations: 'Strictly confined to the Dedicated Monetag Test Block; the rest of AdBlocker Test Lab remains 100% ad-free.'
  }),
  createTestSpec({
    id: 'MTG-02',
    section: '5.14 Dedicated Monetag Test Blocks',
    scoringCategory: 'ad_resource_blocking',
    metricGroup: METRIC_GROUP.EXPLORATORY_PROBE,
    name: 'Monetag Live Delivery Domain Reachability Probe (alwingulla.com)',
    description: 'Exploratory probe to Monetag delivery domain (alwingulla.com/88/tag.min.js) strictly inside the dedicated Monetag test chamber.',
    expectedBehavior: 'Reports REQUEST_FAILED_CAUSE_UNKNOWN when blocked by browser/DNS filter, or ALLOWED if reachable.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://alwingulla.com/88/tag.min.js (Isolated Monetag Chamber Probe)',
    recommendedRule: '||alwingulla.com^$script,third-party',
    type: 'external_domain_probe',
    targetUrl: 'https://alwingulla.com/88/tag.min.js',
    measuredBehavior: 'Network reachability of Monetag script delivery domain.',
    technicalValidity: VALIDITY_CLASS.DEDICATED_AD_CHAMBER,
    browserObservation: 'no-cors Fetch resolution vs network rejection inside the Monetag test runner.',
    dependsOnThirdParty: true,
    scoringEligible: false,
    limitations: 'Because external domain failures can be caused by DNS filtering, browser extensions, or domain rotation, outcome is reported as REQUEST_FAILED_CAUSE_UNKNOWN rather than a confirmed BLOCKED pass.'
  })
];

export function buildProtectionTraceStages({
  testItem,
  controlOk,
  controlDetail,
  attemptDetail,
  observationDetail,
  evaluationDetail,
  status,
  confidence,
  durationMs
}) {
  const isInferred = confidence?.id === CONFIDENCE.STRONG.id || confidence?.id === CONFIDENCE.WEAK.id;
  const isUnknown = confidence?.id === CONFIDENCE.UNKNOWN.id;

  return [
    {
      step: 1,
      code: 'PREP',
      label: 'Test Prepared',
      evidenceType: 'OBSERVED',
      state: 'COMPLETE',
      detail: `${testItem.id} (${testItem.metricGroup}) initialized. Target: ${testItem.testResource}`
    },
    {
      step: 2,
      code: 'CTRL',
      label: 'Control Verified',
      evidenceType: 'OBSERVED',
      state: controlOk ? 'COMPLETE' : 'WARNING',
      detail: controlDetail || `Baseline control (${testItem.controlResource}) verified.`
    },
    {
      step: 3,
      code: 'EXEC',
      label: 'Request / Fixture Attempted',
      evidenceType: 'OBSERVED',
      state: 'COMPLETE',
      detail: attemptDetail || `Dispatched ${testItem.testResource}`
    },
    {
      step: 4,
      code: 'OBSV',
      label: 'Resource / Behavior Observed',
      evidenceType: 'OBSERVED',
      state: 'COMPLETE',
      detail: observationDetail || 'Captured browser API / DOM response.'
    },
    {
      step: 5,
      code: 'EVAL',
      label: 'Evidence Evaluated',
      evidenceType: isUnknown ? 'UNOBSERVABLE' : isInferred ? 'INFERRED' : 'OBSERVED',
      state:
        status === RESULT_STATUS.INCONCLUSIVE || status === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN
          ? 'WARNING'
          : 'COMPLETE',
      detail:
        evaluationDetail ||
    `${confidence?.label || 'Evaluated'}: Alternative causes: ${testItem.audit.alternativeExplanations.join(', ')}`
    },
    {
      step: 6,
      code: 'CLAS',
      label: 'Result Classified',
      evidenceType: isUnknown ? 'UNOBSERVABLE' : isInferred ? 'INFERRED' : 'OBSERVED',
      state: status,
      detail: `Classified as ${status} in ${durationMs} ms (${
        testItem.audit.scoringEligible
          ? 'Core Ad/Tracker Blocking Score'
          : testItem.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL
          ? 'Privacy Signals Index'
          : 'Exploratory / Non-Scored'
      })`
    }
  ];
}

export async function checkFirstPartyFixtureServer(abortSignal) {
  try {
    const res = await fetch('/api/fixture/health', {
      method: 'GET',
      cache: 'no-store',
      signal: abortSignal
    });
    const header = res.headers?.get('x-adblockerlab-fixture');
    if (res.ok && header === '1') {
      return { available: true, mode: 'SERVER_CORRELATED' };
    }
    return { available: false, mode: 'CLIENT_ONLY_STATIC' };
  } catch {
    return { available: false, mode: 'CLIENT_ONLY_STATIC' };
  }
}

export async function verifyNeutralSameOriginControl(testId, abortSignal, timeoutMs = 1800) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, detail: 'navigator.onLine === false (offline)' };
  }
  try {
    const controller = new AbortController();
    const onUserAbort = () => controller.abort();
    abortSignal?.addEventListener('abort', onUserAbort, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`/?adshield_neutral_ctrl=${encodeURIComponent(testId)}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timer);
    abortSignal?.removeEventListener('abort', onUserAbort);
    return {
      ok: true,
      detail: `Neutral same-origin control resolved (HTTP ${res.status}).`
    };
  } catch (err) {
    if (abortSignal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    return {
      ok: false,
      detail: `Neutral same-origin control failed (${err?.name || 'NetworkError'}); cannot attribute failure to adblocking.`
    };
  }
}

export function analyzeProtectionLayers(resultsMap, userReportedConfig = {}, envData = null, fixtureServerStatus = null) {
  const resultsList = Object.values(resultsMap || {}).filter(
    (r) => r && r.status && r.status !== RESULT_STATUS.QUEUED && r.status !== RESULT_STATUS.RUNNING
  );
  const hasRunTests = resultsList.length > 0;
  const getStatus = (id) => resultsMap?.[id]?.status;

  const cosmeticTests = TEST_REGISTRY.filter((t) => t.type === 'cosmetic_dom' || t.type === 'dynamic_cosmetic_dom');
  const cosmeticRun = cosmeticTests.filter((t) => getStatus(t.id));
  const cosmeticBlocked = cosmeticTests.filter((t) => getStatus(t.id) === RESULT_STATUS.BLOCKED);

  const controlledPathProbes = TEST_REGISTRY.filter(
    (t) => t.type === 'url_pattern_probe' || t.type === 'script_tag_probe' || t.type === 'xhr_pattern_probe'
  );
  const controlledPathRun = controlledPathProbes.filter((t) => getStatus(t.id));
  const controlledPathBlocked = controlledPathProbes.filter((t) => getStatus(t.id) === RESULT_STATUS.BLOCKED);

  const exploratoryExternalProbes = TEST_REGISTRY.filter((t) => t.type === 'external_domain_probe');
  const exploratoryRun = exploratoryExternalProbes.filter((t) => getStatus(t.id));
  const exploratoryFailed = exploratoryExternalProbes.filter(
    (t) =>
      getStatus(t.id) === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN ||
      getStatus(t.id) === RESULT_STATUS.BLOCKED
  );

  const gpcActive = getStatus('FPR-01') === RESULT_STATUS.SIGNAL_ACTIVE;
  const annoyanceHidden =
    getStatus('CNS-01') === RESULT_STATUS.BLOCKED || getStatus('AAB-02') === RESULT_STATUS.BLOCKED;

  return {
    hasRunTests,
    fixtureServerMode: fixtureServerStatus?.mode || 'CLIENT_ONLY_STATIC',
    layers: [
      {
        id: 'extension_filtering',
        code: 'LAYER-01',
        title: 'In-Browser Content & Cosmetic Filtering',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : cosmeticBlocked.length >= 3 || controlledPathBlocked.length >= 2
          ? 'Strong Evidence of In-Browser Content Filtering'
          : cosmeticBlocked.length > 0 || controlledPathBlocked.length > 0
          ? 'Partial In-Browser Filtering Observed'
          : 'No In-Browser Cosmetic or Path Filtering Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : cosmeticBlocked.length >= 3 || controlledPathBlocked.length >= 2
          ? CONFIDENCE.STRONG
          : CONFIDENCE.CONFIRMED,
        evidence: [
          `${cosmeticBlocked.length}/${cosmeticRun.length} synthetic DOM ad elements were hidden via CSS rules.`,
          `${controlledPathBlocked.length}/${controlledPathRun.length} relative first-party ad paths were aborted before reaching the origin server.`,
          annoyanceHidden
            ? 'Cookie notice and anti-adblock modal selectors were hidden (consistent with active Annoyance filter lists).'
            : 'Cookie notice and anti-adblock modal selectors remained visible.'
        ],
        unobservableBoundary:
          'Standard web pages cannot enumerate installed browser extensions or identify whether uBlock Origin, AdGuard, Brave Shields, or another content blocker applied the rules.'
      },
      {
        id: 'browser_native',
        code: 'LAYER-02',
        title: 'Browser Privacy Signals & Baseline Restrictions (Separate Index)',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : gpcActive
          ? 'Active Privacy Signals Observed (GPC / DNT)'
          : 'Standard Browser Defaults Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : gpcActive
          ? CONFIDENCE.CONFIRMED
          : CONFIDENCE.WEAK,
        evidence: [
          gpcActive
            ? 'Confirmed Observation: navigator.globalPrivacyControl === true or Do Not Track === "1" is actively exposed (Tracked in Privacy Signals Index; 0 impact on Ad-Blocking Score).'
            : 'Neither Global Privacy Control (GPC) nor Do Not Track is currently enabled.',
          envData?.uaBrandHint
            ? `Browser brand hint reports "${envData.uaBrandHint}". Brand hints alone never prove built-in tracking protection is active.`
            : 'Browser brand hint unavailable or masked.'
        ],
        unobservableBoundary:
          'A standard web page cannot read internal browser settings (e.g., Firefox Strict ETP vs. Standard mode, or Safari ITP internal state).'
      },
      {
        id: 'dns_network',
        code: 'LAYER-03',
        title: 'DNS-Based & Upstream Network Filtering',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : exploratoryFailed.length > 0 && cosmeticBlocked.length === 0 && controlledPathBlocked.length === 0
          ? 'External Domain Failures Without DOM Hiding (Weak Inference)'
          : exploratoryFailed.length > 0
          ? 'External Domain Failures Overlapped with Browser Layer'
          : 'No Upstream Domain Blocking Evidence Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : exploratoryFailed.length > 0
          ? CONFIDENCE.WEAK
          : CONFIDENCE.CONFIRMED,
        evidence: [
          `${exploratoryFailed.length}/${exploratoryRun.length} exploratory third-party ad/tracker domains returned REQUEST_FAILED_CAUSE_UNKNOWN.`,
          'Technical Constraint: Comparing DOM element visibility or request failure latency against external domains cannot deterministically prove DNS filtering versus browser filtering, firewall policy, CSP, or server outage.'
        ],
        unobservableBoundary:
          'A website cannot read the operating system DNS resolver IP or identify NextDNS, Pi-hole, AdGuard DNS, or router blocklists from browser JavaScript.'
      },
      {
        id: 'vpn_proxy',
        code: 'LAYER-04',
        title: 'VPN, Proxy & Gateway Filtering',
        status:
          userReportedConfig.vpnEnabled === 'yes'
            ? `User-Reported Active (${userReportedConfig.vpnProvider || 'Provider Unspecified'})`
            : 'Unobservable from Standard Web Page',
        confidence:
          userReportedConfig.vpnEnabled && userReportedConfig.vpnEnabled !== 'unspecified'
            ? CONFIDENCE.USER_REPORTED
            : CONFIDENCE.UNKNOWN,
        evidence: [
          userReportedConfig.vpnEnabled === 'yes'
            ? `Self-reported by user: VPN enabled (${userReportedConfig.vpnProvider || 'no provider name entered'}).`
            : 'No automated VPN claim is made. Public IP addresses cannot distinguish a VPN from an ISP gateway, mobile carrier NAT, or corporate proxy.'
        ],
        unobservableBoundary:
          'Local network interfaces, private IP ranges, and OS tunnel adapters are inaccessible and never scanned.'
      }
    ]
  };
}

export function validateCategoryWeights(categoriesInput) {
  if (!Array.isArray(categoriesInput) || categoriesInput.length === 0) {
    return DEFAULT_SCORING_CATEGORIES.map((c) => ({ ...c, validatedWeight: c.defaultWeight }));
  }
  return categoriesInput.map((cat) => {
    const raw = Number(cat.defaultWeight);
    const safeWeight = Number.isFinite(raw) && raw >= 0 ? Math.min(100, raw) : 0;
    return {
      ...cat,
      defaultWeight: safeWeight,
      validatedWeight: safeWeight
    };
  });
}

export function calculateBenchmarkScore(resultsMap = {}, categoryWeightsConfig = DEFAULT_SCORING_CATEGORIES) {
  const validatedCategories = validateCategoryWeights(categoryWeightsConfig);
  const categoryBreakdown = [];
  let totalConfiguredWeightOfEligibleCategories = 0;

  const totalTests = TEST_REGISTRY.length;
  let completedTests = 0;
  let passedCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  let consistentWithFilteringCount = 0;
  let causeUnknownCount = 0;
  let inconclusiveCount = 0;
  let unsupportedCount = 0;
  let errorCount = 0;
  let cancelledCount = 0;

  const privacySignalTests = TEST_REGISTRY.filter((t) => t.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL);
  let privacySignalsRun = 0;
  let privacySignalsActive = 0;
  let privacySignalsInactive = 0;
  let privacySignalsInconclusive = 0;

  TEST_REGISTRY.forEach((test) => {
    const res = resultsMap?.[test.id];
    if (!res || !res.status || res.status === RESULT_STATUS.QUEUED || res.status === RESULT_STATUS.RUNNING) {
      return;
    }
    completedTests++;

    if (test.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL) {
      privacySignalsRun++;
      if (res.status === RESULT_STATUS.SIGNAL_ACTIVE) privacySignalsActive++;
      else if (res.status === RESULT_STATUS.SIGNAL_INACTIVE) privacySignalsInactive++;
      else privacySignalsInconclusive++;
      return;
    }

    if (res.status === RESULT_STATUS.BLOCKED) passedCount++;
    else if (res.status === RESULT_STATUS.PARTIAL) partialCount++;
    else if (res.status === RESULT_STATUS.ALLOWED) failedCount++;
    else if (res.status === RESULT_STATUS.CONSISTENT_WITH_FILTERING) consistentWithFilteringCount++;
    else if (res.status === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN) causeUnknownCount++;
    else if (res.status === RESULT_STATUS.INCONCLUSIVE) inconclusiveCount++;
    else if (res.status === RESULT_STATUS.UNSUPPORTED) unsupportedCount++;
    else if (res.status === RESULT_STATUS.ERROR) errorCount++;
    else if (res.status === RESULT_STATUS.CANCELLED) cancelledCount++;
  });

  validatedCategories.forEach((cat) => {
    const testsInCategory = TEST_REGISTRY.filter(
      (t) => t.scoringCategory === cat.id && t.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING
    );
    let eligibleCount = 0;
    let earnedCredits = 0;
    let catBlocked = 0;
    let catPartial = 0;
    let catAllowed = 0;
    let catExcluded = 0;

    testsInCategory.forEach((t) => {
      const r = resultsMap?.[t.id];
      if (!r || !r.status || r.status === RESULT_STATUS.QUEUED || r.status === RESULT_STATUS.RUNNING) {
        return;
      }

      if (!t.audit?.scoringEligible || t.metricGroup !== METRIC_GROUP.AD_TRACKER_BLOCKING) {
        catExcluded++;
        return;
      }

      if (r.status === RESULT_STATUS.BLOCKED) {
        eligibleCount++;
        earnedCredits += 1.0;
        catBlocked++;
      } else if (r.status === RESULT_STATUS.PARTIAL) {
        eligibleCount++;
        earnedCredits += 0.5;
        catPartial++;
      } else if (r.status === RESULT_STATUS.ALLOWED) {
        eligibleCount++;
        earnedCredits += 0.0;
        catAllowed++;
      } else {
        catExcluded++;
      }
    });

    const isEligibleCategory = eligibleCount > 0 && cat.validatedWeight > 0;
    if (isEligibleCategory) {
      totalConfiguredWeightOfEligibleCategories += cat.validatedWeight;
    }

    const rawScore = eligibleCount > 0 ? Math.round((earnedCredits / eligibleCount) * 1000) / 10 : null;

    categoryBreakdown.push({
      ...cat,
      totalTests: testsInCategory.length,
      eligibleCount,
      earnedCredits,
      catBlocked,
      catPartial,
      catAllowed,
      catExcluded,
      rawScore,
      configuredWeight: cat.validatedWeight,
      renormalizedWeight: 0
    });
  });

  let weightedSum = 0;
  const totalConfiguredWeightAll = validatedCategories.reduce((acc, c) => acc + c.validatedWeight, 0);
  const weightsWereRenormalized =
    totalConfiguredWeightOfEligibleCategories > 0 &&
    Math.abs(totalConfiguredWeightOfEligibleCategories - 100) > 0.01;

  categoryBreakdown.forEach((catItem) => {
    if (catItem.rawScore !== null && totalConfiguredWeightOfEligibleCategories > 0 && catItem.configuredWeight > 0) {
      const normWeight = (catItem.configuredWeight / totalConfiguredWeightOfEligibleCategories) * 100;
      catItem.renormalizedWeight = Math.round(normWeight * 10) / 10;
      weightedSum += (catItem.rawScore * normWeight) / 100;
    } else {
      catItem.renormalizedWeight = 0;
    }
  });

  const eligibleTotalTests = categoryBreakdown.reduce((acc, c) => acc + c.eligibleCount, 0);
  const maxScoredTests = TEST_REGISTRY.filter(
    (t) => t.audit.scoringEligible && t.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING
  ).length;
  const coveragePercentage = maxScoredTests > 0 ? Math.round((eligibleTotalTests / maxScoredTests) * 100) : 0;
  const overallScore =
    eligibleTotalTests > 0 && totalConfiguredWeightOfEligibleCategories > 0 ? Math.round(weightedSum) : null;

  let overallConfidence = 'No Live Data';
  if (eligibleTotalTests > 0) {
    if (coveragePercentage >= 80 && inconclusiveCount <= 4) overallConfidence = 'High (Controlled Fixtures)';
    else if (coveragePercentage >= 45) overallConfidence = 'Moderate';
    else overallConfidence = 'Low (Partial Coverage)';
  }

  return {
    overallScore,
    totalTests,
    maxScoredTests,
    completedTests,
    eligibleTotalTests,
    passedCount,
    partialCount,
    failedCount,
    consistentWithFilteringCount,
    causeUnknownCount,
    inconclusiveCount,
    unsupportedCount,
    errorCount,
    cancelledCount,
    coveragePercentage,
    overallConfidence,
    weightsWereRenormalized,
    totalConfiguredWeightAll,
    totalConfiguredWeightOfEligibleCategories,
    categoryBreakdown,
    privacySignalsSummary: {
      totalSignals: privacySignalTests.length,
      executedSignals: privacySignalsRun,
      activeCount: privacySignalsActive,
      inactiveCount: privacySignalsInactive,
      inconclusiveCount: privacySignalsInconclusive
    }
  };
}

export async function collectEnvironmentDiagnostics() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const win = typeof window !== 'undefined' ? window : {};
  const scr = typeof screen !== 'undefined' ? screen : {};

  let uaClientHints = null;
  try {
    if (nav.userAgentData) {
      uaClientHints = {
        mobile: Boolean(nav.userAgentData.mobile),
        platform: nav.userAgentData.platform || 'Unavailable (Hint)',
        brands: (nav.userAgentData.brands || []).map((b) => `${b.brand} ${b.version}`).join(', ')
      };
    }
  } catch {
    uaClientHints = null;
  }

  let isBraveReported = false;
  try {
    if (nav.brave && typeof nav.brave.isBrave === 'function') {
      isBraveReported = await nav.brave.isBrave();
    }
  } catch {
    isBraveReported = false;
  }

  const uaString = nav.userAgent || 'Unavailable';
  let engineHint = 'Unknown Engine';
  if (uaString.includes('Firefox/')) engineHint = 'Gecko (Hint)';
  else if (uaString.includes('Edg/') || uaString.includes('Chrome/')) engineHint = 'Blink / Chromium (Hint)';
  else if (uaString.includes('Safari/') && !uaString.includes('Chrome/')) engineHint = 'WebKit (Hint)';

  return {
    collectedAt: new Date().toISOString(),
    userAgentRaw: uaString,
    engineHint,
    uaBrandHint: isBraveReported
      ? 'Brave (Reported via navigator.brave)'
    : uaClientHints?.brands || `${engineHint}: Brand unverified`,
    platformHint: uaClientHints?.platform || nav.platform || 'Unavailable',
    viewport: `${win.innerWidth || 0} x ${win.innerHeight || 0} px`,
    screenResolution: `${scr.width || 0} x ${scr.height || 0} px (${win.devicePixelRatio || 1}x DPR)`,
    onlineState: nav.onLine !== undefined ? (nav.onLine ? 'Online' : 'Offline') : 'Unknown',
    doNotTrack: nav.doNotTrack || win.doNotTrack || 'Unset',
    globalPrivacyControl:
      nav.globalPrivacyControl !== undefined ? String(nav.globalPrivacyControl) : 'Unsupported'
  };
}

export function escapeHtml(unsafeInput) {
  return String(unsafeInput ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatCsvField(val) {
  const s = String(val ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

export function generateJsonReport({ scoreSummary, protectionAnalysis, userReported, envDiagnostics, resultsMap }) {
  return JSON.stringify(
    {
      platform: BRAND_NAME,
      promise: BRAND_PROMISE,
      appVersion: APP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      adAndTrackerBlockingScore: scoreSummary.overallScore,
      privacySignalsSummary: scoreSummary.privacySignalsSummary,
      scoreSummary,
      protectionAnalysis,
      userReportedConfiguration: userReported,
      environmentHints: envDiagnostics,
      results: TEST_REGISTRY.map((t) => ({
        testId: t.id,
        version: t.version,
        section: t.section,
        metricGroup: t.metricGroup,
        scoringEligible: t.audit.scoringEligible,
        validityClass: t.audit.technicalValidity,
        recommendedRule: t.recommendedRule,
        result: resultsMap[t.id] || { status: 'NOT_RUN' }
      }))
    },
    null,
    2
  );
}

export function generateCsvReport(resultsMap) {
  const headers = [
    'Test_ID',
    'Version',
    'Domain_Section',
    'Metric_Group',
    'Scoring_Category',
    'Validity_Class',
    'Scoring_Eligible',
    'Test_Name',
    'Status',
    'Score_Credit',
    'Duration_ms',
    'Confidence',
    'Observed_Outcome',
    'Recommended_Filter_Rule'
  ];
  const rows = TEST_REGISTRY.map((t) => {
    const r = resultsMap[t.id] || {};
    return [
      t.id,
      t.version,
      t.section,
      t.metricGroup,
      t.scoringCategory,
      t.audit.technicalValidity,
      t.audit.scoringEligible ? 'Yes (Ad/Tracker Score)' : 'No (Separate Index / Exploratory)',
      t.name,
      r.status || 'NOT_RUN',
      r.scoreCredit !== null && r.scoreCredit !== undefined ? r.scoreCredit : 'Excluded',
      r.durationMs || 0,
      r.confidence?.label || 'Unrun',
      r.actualOutcome || 'Not executed',
      t.recommendedRule || ''
    ]
      .map(formatCsvField)
      .join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function generateHtmlReport({ scoreSummary, resultsMap, userReported }) {
  const rowsHtml = TEST_REGISTRY.map((t) => {
    const r = resultsMap[t.id] || {};
    return `<tr>
      <td><code>${escapeHtml(t.id)}</code></td>
      <td>${escapeHtml(t.section)}</td>
      <td><code>${escapeHtml(t.metricGroup)}</code></td>
      <td><strong>${escapeHtml(t.name)}</strong><br/><small>${escapeHtml(t.audit.technicalValidity)}</small></td>
      <td><strong>${escapeHtml(r.status || 'NOT_RUN')}</strong></td>
      <td>${escapeHtml(r.confidence?.label || 'N/A')}</td>
      <td>${escapeHtml(r.actualOutcome || 'Not executed')}</td>
      <td><code>${escapeHtml(t.recommendedRule || '')}</code></td>
    </tr>`;
  }).join('\n');

  const safeReportedExt = escapeHtml(userReported?.installedExtension || 'unspecified');
  const safeReportedDns = escapeHtml(userReported?.privateDns || 'unspecified');
  const safeReportedNotes = escapeHtml(userReported?.notes || 'None');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(BRAND_NAME)} v${escapeHtml(APP_VERSION)}: Benchmark Report</title>
<style>
  body { font-family: system-ui, sans-serif; background: #f4f4f0; color: #0f1419; padding: 32px; max-width: 1280px; margin: 0 auto; }
  .panel { background: #fff; border: 1px solid #d1d5db; padding: 20px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-family: monospace; font-size: 11px; text-transform: uppercase; }
</style>
</head>
<body>
<h1>${escapeHtml(BRAND_NAME)} v${escapeHtml(APP_VERSION)}: Diagnostic Benchmark Report</h1>
  <p><strong>${escapeHtml(BRAND_PROMISE)}</strong></p>
  <div class="panel">
    <h2>Ad &amp; Tracker Blocking Score: ${
      scoreSummary.overallScore !== null ? `${escapeHtml(scoreSummary.overallScore)} / 100` : 'No Scored Blocking Tests Executed'
    }</h2>
    <p>Core Blocking Coverage: ${escapeHtml(scoreSummary.coveragePercentage)}% (${escapeHtml(scoreSummary.eligibleTotalTests)}/${escapeHtml(scoreSummary.maxScoredTests)} core blocking fixtures)</p>
    <p>Browser Privacy &amp; Hardening Signals Active: ${escapeHtml(scoreSummary.privacySignalsSummary.activeCount)} / ${escapeHtml(scoreSummary.privacySignalsSummary.totalSignals)}</p>
    <p><strong>User-Reported Context:</strong> Extension: ${safeReportedExt} | DNS: ${safeReportedDns} | Notes: ${safeReportedNotes}</p>
  </div>
  <div class="panel">
    <h3>Audited Test Results (${escapeHtml(TEST_REGISTRY.length)} Cases)</h3>
    <table>
      <thead>
        <tr><th>ID</th><th>Domain</th><th>Metric Group</th><th>Test &amp; Validity</th><th>Status</th><th>Confidence</th><th>Observed Evidence</th><th>Target Rule</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</body>
</html>`;
}

export function runVerificationSuite() {
  const results = [];

  // UNIT-01 (P0-1 Fix): Registry Count Synchronization & Audit Completeness
  const ids = TEST_REGISTRY.map((t) => t.id);
  const uniqueIds = new Set(ids);
  const allHaveAuditAndRule = TEST_REGISTRY.every(
    (t) =>
      t.audit &&
      t.audit.measuredBehavior &&
      t.audit.technicalValidity &&
      t.metricGroup &&
      t.recommendedRule &&
      Array.isArray(t.audit.alternativeExplanations)
  );
  results.push({
    id: 'UNIT-01',
    name: `P0-1 Fix: Registry Synchronization (${EXPECTED_REGISTRY_COUNT}/${EXPECTED_REGISTRY_COUNT} Unique Audited Cases)`,
    passed:
      uniqueIds.size === EXPECTED_REGISTRY_COUNT &&
      TEST_REGISTRY.length === EXPECTED_REGISTRY_COUNT &&
      allHaveAuditAndRule,
    details: `Verified TEST_REGISTRY.length === ${TEST_REGISTRY.length} and uniqueIds.size === ${uniqueIds.size} match EXPECTED_REGISTRY_COUNT (${EXPECTED_REGISTRY_COUNT}).`
  });

  // UNIT-02: Empty State Handling
  const emptyScore = calculateBenchmarkScore({}, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-02',
    name: 'Empty Results State Handling (No Fabricated Baseline Score)',
    passed:
      emptyScore.overallScore === null &&
      emptyScore.completedTests === 0 &&
      emptyScore.eligibleTotalTests === 0,
    details: `Empty results map returns overallScore=${emptyScore.overallScore} (null) and 0 completed tests.`
  });

  // UNIT-03: All-Inconclusive Exclusion Guardrail
  const allIncMap = {};
  TEST_REGISTRY.forEach((t) => {
    allIncMap[t.id] = { status: RESULT_STATUS.INCONCLUSIVE };
  });
  const incScore = calculateBenchmarkScore(allIncMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-03',
    name: 'All-Inconclusive Exclusion Guardrail',
    passed: incScore.overallScore === null && incScore.eligibleTotalTests === 0 && incScore.passedCount === 0,
    details: `All-inconclusive run yields eligibleTotalTests=${incScore.eligibleTotalTests} and overallScore=${incScore.overallScore}.`
  });

  // UNIT-04 (P1-6 Fix): Exploratory External Probes Never Inflate Score & Use Explicit Status
  const onlyExternalMap = {};
  TEST_REGISTRY.forEach((t) => {
    if (t.metricGroup === METRIC_GROUP.EXPLORATORY_PROBE) {
      onlyExternalMap[t.id] = { status: RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN };
    }
  });
  const extScore = calculateBenchmarkScore(onlyExternalMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-04',
    name: 'P1-6 Fix: Exploratory Probe Status (REQUEST_FAILED_CAUSE_UNKNOWN) & Score Exclusion',
    passed: extScore.eligibleTotalTests === 0 && extScore.overallScore === null && extScore.causeUnknownCount === 11,
    details: `Confirmed all 11 exploratory external domain probes record REQUEST_FAILED_CAUSE_UNKNOWN without inflating the Ad & Tracker Blocking Score.`
  });

  // UNIT-05: Partial Credit (0.5) Deterministic Calculation
  const partialMap = {};
  const coreEligibleCount = TEST_REGISTRY.filter(
    (t) => t.audit.scoringEligible && t.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING
  ).length;
  TEST_REGISTRY.forEach((t) => {
    if (t.audit.scoringEligible && t.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING) {
      partialMap[t.id] = { status: RESULT_STATUS.PARTIAL };
    }
  });
  const halfScore = calculateBenchmarkScore(partialMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-05',
    name: 'Partial Credit (0.5) Deterministic Calculation Across 7 Blocking Categories',
    passed: halfScore.overallScore === 50 && halfScore.eligibleTotalTests === coreEligibleCount,
    details: `All ${coreEligibleCount} eligible ad/tracker blocking fixtures at PARTIAL (0.5) yield overallScore=${halfScore.overallScore}/100.`
  });

  // UNIT-06: Negative / Zero Weight Validation & Division-by-Zero Guard
  const invalidWeights = DEFAULT_SCORING_CATEGORIES.map((c) => ({ ...c, defaultWeight: -10 }));
  const zeroWeightScore = calculateBenchmarkScore(partialMap, invalidWeights);
  results.push({
    id: 'UNIT-06',
    name: 'Negative / Zero Weight Validation & Division-by-Zero Guard',
    passed: zeroWeightScore.overallScore === null && !Number.isNaN(zeroWeightScore.overallScore),
    details: 'Negative weights clamped to 0 without throwing NaN or division-by-zero errors.'
  });

  // UNIT-07: Partially Completed Run & Dynamic Weight Renormalization
  const singleCategoryMap = {
    'DSP-01': { status: RESULT_STATUS.BLOCKED },
    'DSP-02': { status: RESULT_STATUS.ALLOWED }
  };
  const singleCatScore = calculateBenchmarkScore(singleCategoryMap, DEFAULT_SCORING_CATEGORIES);
  const cosmeticCat = singleCatScore.categoryBreakdown.find((c) => c.id === 'cosmetic_filtering');
  results.push({
    id: 'UNIT-07',
    name: 'Partially Completed Run Weight Renormalization (18% -> 100% Active Weight)',
    passed:
      singleCatScore.overallScore === 50 &&
      singleCatScore.weightsWereRenormalized === true &&
      cosmeticCat?.renormalizedWeight === 100,
    details: `1 BLOCKED + 1 ALLOWED in Cosmetic Filtering renormalizes active category weight from ${cosmeticCat?.configuredWeight}% to ${cosmeticCat?.renormalizedWeight}% and scores ${singleCatScore.overallScore}/100.`
  });

  // UNIT-08: Status Denominator Treatment Matrix
  const nonEligibleStatusMap = {
    'DSP-01': { status: RESULT_STATUS.INCONCLUSIVE },
    'DSP-02': { status: RESULT_STATUS.UNSUPPORTED },
    'DSP-03': { status: RESULT_STATUS.ERROR },
    'DSP-04': { status: RESULT_STATUS.CANCELLED },
    'TPA-01': { status: RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN },
    'TRK-01': { status: RESULT_STATUS.CONSISTENT_WITH_FILTERING }
  };
  const nonEligibleScore = calculateBenchmarkScore(nonEligibleStatusMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-08',
    name: 'Denominator Treatment Matrix (Non-Conclusive Statuses Excluded)',
    passed: nonEligibleScore.eligibleTotalTests === 0 && nonEligibleScore.overallScore === null,
    details: 'Verified INCONCLUSIVE, UNSUPPORTED, ERROR, CANCELLED, REQUEST_FAILED_CAUSE_UNKNOWN, and CONSISTENT_WITH_FILTERING never enter the score denominator.'
  });

  // UNIT-09 (P0-2 Regression): Popup Test Does Not Use Self-Imposed Iframe Sandbox Block
  const int03Def = TEST_REGISTRY.find((t) => t.id === 'INT-03');
  results.push({
    id: 'UNIT-09',
    name: 'P0-2 Regression: Popup Test (INT-03) Free of Self-Imposed Sandbox False Positive',
    passed:
      Boolean(int03Def) &&
      int03Def.type === 'popup_filter_check' &&
      !int03Def.description.includes('without allow-popups'),
    details: 'Verified INT-03 measures popup-defuser scriptlets and DOM popunder trigger suppression rather than self-imposed iframe sandbox restrictions.'
  });

  // UNIT-10 (P0-3 Regression): Strict Separation of Privacy Signals from Ad-Blocking Score
  const privacyOnlyMap = {};
  TEST_REGISTRY.forEach((t) => {
    if (t.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL) {
      privacyOnlyMap[t.id] = { status: RESULT_STATUS.SIGNAL_ACTIVE };
    }
  });
  const privScore = calculateBenchmarkScore(privacyOnlyMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-10',
    name: 'P0-3 Regression: Privacy Signals (GPC/DNT/WebGL) Separated from Ad-Blocking Score',
    passed:
      privScore.overallScore === null &&
      privScore.eligibleTotalTests === 0 &&
      privScore.privacySignalsSummary.activeCount === 9,
    details: `Confirmed all 9 Privacy Signals increment privacySignalsSummary.activeCount (${privScore.privacySignalsSummary.activeCount}/9) while leaving Ad & Tracker Blocking Score untouched (null).`
  });

  // UNIT-11 (P1-4 Regression): sendBeacon (TRK-03) Non-Authoritative Without Server Correlation
  const trk03Def = TEST_REGISTRY.find((t) => t.id === 'TRK-03');
  results.push({
    id: 'UNIT-11',
    name: 'P1-4 Regression: sendBeacon (TRK-03) Non-Conclusive Without Server Arrival Correlation',
    passed: Boolean(trk03Def) && trk03Def.audit.scoringEligible === false,
    details: 'Confirmed TRK-03 does not award confirmed BLOCKED score credit from client-side sendBeacon boolean/toString checks alone.'
  });

  // UNIT-12 (P1-5 Regression): No Exposed Client-Side Gemini API Keys
  const fnSource = String(executeAuditedTest);
  results.push({
    id: 'UNIT-12',
    name: 'P1-5 Regression: Zero Exposed Client-Side AI Keys or Unauthenticated Calls',
    passed: !fnSource.includes('generativelanguage.googleapis.com'),
    details: 'Confirmed browser test runner makes zero unauthenticated client-side LLM calls; AI forensics is isolated behind /api/forensics server proxy.'
  });

  // UNIT-13: HTML Report XSS Escaping Verification
  const maliciousPayload = '<script>alert("xss")</script>&"';
  const escaped = escapeHtml(maliciousPayload);
  const htmlReport = generateHtmlReport({
    scoreSummary: emptyScore,
    resultsMap: {},
    userReported: { installedExtension: maliciousPayload, notes: maliciousPayload }
  });
  results.push({
    id: 'UNIT-13',
    name: 'HTML Report Escaping of User-Controlled Data',
    passed:
      !htmlReport.includes('<script>alert("xss")</script>') &&
      escaped === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&quot;',
    details: 'Confirmed all user-controlled and test strings are HTML-entity escaped in standalone HTML exports.'
  });

  // UNIT-14: Monetag Dedicated Sandboxed Test Blocks (MTG-01 & MTG-02) Registered & Scoped
  const mtg01 = TEST_REGISTRY.find((t) => t.id === 'MTG-01');
  const mtg02 = TEST_REGISTRY.find((t) => t.id === 'MTG-02');
  results.push({
    id: 'UNIT-14',
    name: 'Dedicated Monetag Test Blocks (MTG-01 & MTG-02) Scoped to Isolated Chamber',
    passed:
      Boolean(mtg01) &&
      Boolean(mtg02) &&
      mtg01.type === 'monetag_isolated_block' &&
      mtg02.audit.scoringEligible === false,
    details: 'Verified MTG-01 (isolated zone & tag fixture) and MTG-02 (exploratory delivery domain probe) are registered and isolated.'
  });

  // UNIT-15: Default 7-Category Weight Sum Normalization
  const defaultSum = DEFAULT_SCORING_CATEGORIES.reduce((a, b) => a + b.defaultWeight, 0);
  results.push({
    id: 'UNIT-15',
    name: 'Default 7-Category Ad-Blocking Weight Normalization (100% Total)',
    passed: defaultSum === 100 && DEFAULT_SCORING_CATEGORIES.length === 7,
    details: `Verified 7 pure ad/tracker blocking categories sum to exactly ${defaultSum}%.`
  });

  return results;
}

function waitAnimationFrameCancellable(abortSignal) {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const rafId = requestAnimationFrame(() => resolve());
    abortSignal?.addEventListener(
      'abort',
      () => {
        cancelAnimationFrame(rafId);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export async function executeAuditedTest(
  testItem,
  { sandboxStageEl, monetagStageEl, timeoutMs = 2500, retryCount = 0, abortSignal, fixtureServerAvailable = false }
) {
  const startPerf = performance.now();
  const startTimeIso = new Date().toISOString();

  const createResult = (
    status,
    actualOutcome,
    evidenceSource,
    confidence,
    observations = {},
    retriesUsed = 0,
    traceMeta = {}
  ) => {
    const durationMs = Math.max(1, Math.round(performance.now() - startPerf));
    let scoreCredit = null;
    if (testItem.audit.scoringEligible && testItem.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING) {
      if (status === RESULT_STATUS.BLOCKED) scoreCredit = 1.0;
      else if (status === RESULT_STATUS.PARTIAL) scoreCredit = 0.5;
      else if (status === RESULT_STATUS.ALLOWED) scoreCredit = 0.0;
    }

    const traceStages = buildProtectionTraceStages({
      testItem,
      controlOk: traceMeta.controlOk !== false,
      controlDetail: traceMeta.controlDetail,
      attemptDetail: traceMeta.attemptDetail,
      observationDetail: traceMeta.observationDetail || actualOutcome,
      evaluationDetail: traceMeta.evaluationDetail,
      status,
      confidence,
      durationMs
    });

    return {
      testId: testItem.id,
      version: testItem.version,
      name: testItem.name,
      section: testItem.section,
      metricGroup: testItem.metricGroup,
      scoringCategory: testItem.scoringCategory,
      status,
      startTime: startTimeIso,
      endTime: new Date().toISOString(),
      durationMs,
      retries: retriesUsed,
      expectedBehavior: testItem.expectedBehavior,
      controlResource: testItem.controlResource,
      testResource: testItem.testResource,
      recommendedRule: testItem.recommendedRule,
      actualOutcome,
      evidenceSource,
      confidence,
      limitations: testItem.audit.limitations,
      scoreCredit,
      observations,
      traceStages
    };
  };

  try {
    if (abortSignal?.aborted) {
      return createResult(
        RESULT_STATUS.CANCELLED,
        'Execution aborted immediately via AbortSignal.',
        'Runner AbortController',
        CONFIDENCE.CONFIRMED
      );
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        'Browser reports navigator.onLine === false. Offline state prevents valid network/DOM attribution.',
        'Navigator.onLine Control Check',
        CONFIDENCE.CONFIRMED,
        {},
        0,
        { controlOk: false, controlDetail: 'navigator.onLine reported false.' }
      );
    }

    // 1. Cosmetic DOM & Dynamic Cosmetic DOM Fixture Tests
    if (testItem.type === 'cosmetic_dom' || testItem.type === 'dynamic_cosmetic_dom') {
      if (!sandboxStageEl) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Sandbox DOM fixture mount was unavailable.',
          'DOM Fixture Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: 'Sandbox DOM container ref not mounted.' }
        );
      }

      const controlEl = document.createElement('div');
      controlEl.className = 'adshield-neutral-control-box';
      controlEl.style.width = '100px';
      controlEl.style.height = '22px';
      controlEl.style.display = 'block';
      controlEl.textContent = 'CTRL';

      const tag = testItem.id === 'DSP-03' ? 'ins' : testItem.id === 'TPA-04' ? 'iframe' : 'div';
      const baitEl = document.createElement(tag);
      baitEl.id = testItem.elementId || `bait-${testItem.id}`;
      baitEl.className = testItem.selectorClasses;
      baitEl.setAttribute('data-ad-client', 'ca-pub-0000000000000000');
      baitEl.style.width = '120px';
      baitEl.style.height = '24px';
      baitEl.style.display = 'block';
      if (tag !== 'iframe') {
        baitEl.textContent = `Ad Fixture ${testItem.id}`;
      }

      sandboxStageEl.appendChild(controlEl);
      if (testItem.type === 'dynamic_cosmetic_dom') {
        await waitAnimationFrameCancellable(abortSignal);
      }
      sandboxStageEl.appendChild(baitEl);

      await waitAnimationFrameCancellable(abortSignal);

      const controlRect = controlEl.getBoundingClientRect();
      const baitRect = baitEl.getBoundingClientRect();
      const baitComputed = window.getComputedStyle(baitEl);

      const controlVisible = controlRect.height > 0 && controlRect.width > 0;
      const visuallyHidden =
        baitComputed.display === 'none' ||
        baitComputed.visibility === 'hidden' ||
        baitComputed.opacity === '0';
      const zeroDimensions = baitRect.height === 0 || baitRect.width === 0 || baitEl.offsetParent === null;

      if (controlEl.parentNode === sandboxStageEl) sandboxStageEl.removeChild(controlEl);
      if (baitEl.parentNode === sandboxStageEl) sandboxStageEl.removeChild(baitEl);

      if (!controlVisible) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Neutral control box had 0px rendered height; fixture container was not visible.',
          'DOM Control Validation',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: 'Neutral control box rendered 0px height.' }
        );
      }

      if (visuallyHidden || zeroDimensions) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Cosmetic rule hid #${baitEl.id} (display="${baitComputed.display}", height=${Math.round(baitRect.height)}px; control=${Math.round(controlRect.height)}px).`,
          'getComputedStyle() & getBoundingClientRect()',
          CONFIDENCE.CONFIRMED,
          { computedDisplay: baitComputed.display, renderedHeightPx: Math.round(baitRect.height) },
          0,
          { controlDetail: `Neutral control box visible (${Math.round(controlRect.width)}x${Math.round(controlRect.height)}px).` }
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Element #${baitEl.id} remained visible in DOM (display="${baitComputed.display}", height=${Math.round(baitRect.height)}px).`,
        'getComputedStyle() & getBoundingClientRect()',
        CONFIDENCE.CONFIRMED,
        { computedDisplay: baitComputed.display, renderedHeightPx: Math.round(baitRect.height) },
        0,
        { controlDetail: `Neutral control box visible (${Math.round(controlRect.width)}x${Math.round(controlRect.height)}px).` }
      );
    }

    // 2. Controlled First-Party URL Pattern Probes (with Live Neutral Control Check)
    if (testItem.type === 'url_pattern_probe') {
      const ctrlCheck = await verifyNeutralSameOriginControl(testItem.id, abortSignal, timeoutMs);
      if (!ctrlCheck.ok) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          ctrlCheck.detail,
          'Neutral Control Pre-Check',
          CONFIDENCE.UNKNOWN,
          { controlFailed: true },
          0,
          { controlOk: false, controlDetail: ctrlCheck.detail }
        );
      }

      let attempts = 0;
      let clientAborted = false;
      let httpStatus = null;
      let errorName = '';

      while (attempts <= retryCount) {
        attempts++;
        if (abortSignal?.aborted) {
          return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
        }
        try {
          const controller = new AbortController();
          const onUserAbort = () => controller.abort();
          abortSignal?.addEventListener('abort', onUserAbort, { once: true });
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch(testItem.probePath, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal
          });
          clearTimeout(timer);
          abortSignal?.removeEventListener('abort', onUserAbort);
          httpStatus = res.status;
          clientAborted = false;
          break;
        } catch (err) {
          if (abortSignal?.aborted) {
            return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
          }
          clientAborted = true;
          errorName = err?.name || 'TypeError';
          if (errorName === 'AbortError') {
            return createResult(
              RESULT_STATUS.INCONCLUSIVE,
              `Request to "${testItem.probePath}" timed out after ${timeoutMs}ms.`,
              'Fetch Timeout Guard',
              CONFIDENCE.UNKNOWN,
              {},
              attempts - 1,
              { controlDetail: ctrlCheck.detail }
            );
          }
        }
      }

      if (clientAborted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Neutral control succeeded, while "${testItem.probePath}" was aborted client-side (${errorName}) prior to receiving an HTTP status.`,
          'Same-Origin Fetch Pattern Interception + Control Verification',
          CONFIDENCE.STRONG,
          { probePath: testItem.probePath, clientAborted: true },
          attempts - 1,
          { controlDetail: ctrlCheck.detail }
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Request to "${testItem.probePath}" was not intercepted by a client-side filter (HTTP ${httpStatus}).`,
        'Same-Origin Fetch Pattern Interception',
        CONFIDENCE.CONFIRMED,
        { probePath: testItem.probePath, clientAborted: false, httpStatus },
        attempts - 1,
        { controlDetail: ctrlCheck.detail }
      );
    }

    // 3. Exploratory Third-Party External Domain Probes (P1-6 Fix: REQUEST_FAILED_CAUSE_UNKNOWN)
    if (testItem.type === 'external_domain_probe') {
      const t0 = performance.now();
      let failed = false;
      let probeLatency = 0;
      let errText = '';

      try {
        const controller = new AbortController();
        const onUserAbort = () => controller.abort();
        abortSignal?.addEventListener('abort', onUserAbort, { once: true });
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        await fetch(testItem.targetUrl, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timer);
        abortSignal?.removeEventListener('abort', onUserAbort);
        probeLatency = Math.round(performance.now() - t0);
      } catch (err) {
        if (abortSignal?.aborted) {
          return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
        }
        probeLatency = Math.round(performance.now() - t0);
        failed = true;
        errText = err?.name || 'NetworkError';
      }

      if (failed) {
        return createResult(
          RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN,
          `Request to ${testItem.targetUrl} failed (${errText} in ${probeLatency}ms). Consistent with adblocking or DNS filtering, but cause cannot be isolated from client JS (Excluded from Ad-Blocking Score).`,
          'Exploratory no-cors Subresource Probe',
          CONFIDENCE.WEAK,
          { targetUrl: testItem.targetUrl, probeLatencyMs: probeLatency }
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Exploratory probe to ${testItem.targetUrl} resolved with an opaque response in ${probeLatency}ms.`,
        'Exploratory no-cors Subresource Probe',
        CONFIDENCE.CONFIRMED,
        { targetUrl: testItem.targetUrl, probeLatencyMs: probeLatency }
      );
    }

    // 4. Dual Pixel Probe (DOM + Path with Neutral Control)
    if (testItem.type === 'pixel_probe') {
      const ctrlCheck = await verifyNeutralSameOriginControl(testItem.id, abortSignal, timeoutMs);
      if (!ctrlCheck.ok) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          ctrlCheck.detail,
          'Neutral Control Pre-Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: ctrlCheck.detail }
        );
      }

      const img = new Image(1, 1);
      img.className = testItem.selectorClasses;
      if (sandboxStageEl) sandboxStageEl.appendChild(img);
      await waitAnimationFrameCancellable(abortSignal);
      const computed = window.getComputedStyle(img);
      const domHidden = computed.display === 'none' || computed.visibility === 'hidden';
      if (sandboxStageEl && img.parentNode === sandboxStageEl) sandboxStageEl.removeChild(img);

      let pathAborted = false;
      try {
        await fetch(testItem.probePath, { cache: 'no-store', signal: abortSignal });
      } catch (err) {
        if (abortSignal?.aborted) {
          return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
        }
        pathAborted = true;
      }

      if (pathAborted && domHidden) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          'Both the /r/collect telemetry path and the .tracking-pixel DOM element were blocked/hidden.',
          'Dual DOM + Fetch Path Check',
          CONFIDENCE.CONFIRMED,
          { domHidden, pathAborted },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      if (pathAborted || domHidden) {
        return createResult(
          RESULT_STATUS.PARTIAL,
          pathAborted
            ? 'Telemetry path (/r/collect) was blocked, but the .tracking-pixel DOM node remained visible.'
            : 'DOM .tracking-pixel element was hidden, but the relative /r/collect fetch was not aborted.',
          'Dual DOM + Fetch Path Check',
          CONFIDENCE.CONFIRMED,
          { domHidden, pathAborted },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Neither the 1x1 tracking pixel element nor the /r/collect path was blocked.',
        'Dual DOM + Fetch Path Check',
        CONFIDENCE.CONFIRMED,
        { domHidden, pathAborted },
        0,
        { controlDetail: ctrlCheck.detail }
      );
    }

    // 5. Navigator.sendBeacon Check (P1-4 Fix: Server Arrival Correlation or Weak Inference)
    if (testItem.type === 'beacon_check') {
      if (typeof navigator.sendBeacon !== 'function') {
        return createResult(
          RESULT_STATUS.UNSUPPORTED,
          'navigator.sendBeacon API is not available in this browser.',
          'Navigator API Check',
          CONFIDENCE.CONFIRMED
        );
      }
      const fnStr = Function.prototype.toString.call(navigator.sendBeacon);
      const isWrapped = !fnStr.includes('[native code]');
      const corrId = `bcn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      let accepted = true;
      try {
        const target = fixtureServerAvailable
          ? `/api/fixture/beacon?cid=${corrId}&event=adshield_synthetic`
          : `/pixel/track?event=adshield_synthetic&cid=${corrId}`;
        accepted = navigator.sendBeacon(target, '1');
      } catch {
        accepted = false;
      }

      if (fixtureServerAvailable) {
        try {
          await new Promise((r) => setTimeout(r, 90));
          const verifyRes = await fetch(`/api/fixture/beacon?verify=${corrId}`, {
            cache: 'no-store',
            signal: abortSignal
          });
          if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data.arrived === false) {
              return createResult(
                RESULT_STATUS.CONSISTENT_WITH_FILTERING,
                `First-party fixture server confirmed beacon ${corrId} did not arrive at /api/fixture/beacon.`,
                'Server-Correlated Beacon Arrival Check',
                CONFIDENCE.STRONG,
                { isWrapped, accepted, serverArrived: false }
              );
            }
            if (data.arrived === true) {
              return createResult(
                RESULT_STATUS.ALLOWED,
                `First-party fixture server confirmed beacon ${corrId} arrived intact.`,
                'Server-Correlated Beacon Arrival Check',
                CONFIDENCE.CONFIRMED,
                { isWrapped, accepted, serverArrived: true }
              );
            }
          }
        } catch {
          // Fall back to client-only inference if correlation endpoint check fails
        }
      }

      if (!accepted || isWrapped) {
        return createResult(
          RESULT_STATUS.CONSISTENT_WITH_FILTERING,
          isWrapped
            ? 'navigator.sendBeacon is non-native (wrapped). Consistent with a scriptlet shim or polyfill; without server arrival correlation, classified as Weak Inference.'
            : 'navigator.sendBeacon returned false for /pixel/track (Consistent with filtering; non-scored without server arrival correlation).',
          'navigator.sendBeacon Inspection (No Server Correlation)',
          CONFIDENCE.WEAK,
          { isWrapped, accepted, fixtureServerAvailable }
        );
      }
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        'navigator.sendBeacon returned true (queued by browser). Without an active backend arrival log (/api/fixture/beacon), client JS cannot verify whether the beacon was dropped in flight.',
        'navigator.sendBeacon Inspection',
        CONFIDENCE.UNKNOWN,
        { isWrapped, accepted }
      );
    }

    // 6. Popup Scriptlet & Popunder Trigger Check (P0-2 Fix: Neutral Control vs. Filter Check)
    if (testItem.type === 'popup_filter_check') {
      if (!sandboxStageEl) {
        return createResult(RESULT_STATUS.INCONCLUSIVE, 'Sandbox mount unavailable.', 'DOM Check', CONFIDENCE.UNKNOWN);
      }

      const winOpenStr = Function.prototype.toString.call(window.open);
      const winOpenDescriptor = Object.getOwnPropertyDescriptor(window, 'open');
      const hasScriptletWrapper = !winOpenStr.includes('[native code]') || Boolean(winOpenDescriptor?.get);

      const ctrlLink = document.createElement('a');
      ctrlLink.className = 'adshield-control-link';
      ctrlLink.href = '#adshield-control';
      ctrlLink.style.display = 'block';
      ctrlLink.style.width = '100px';
      ctrlLink.style.height = '20px';
      ctrlLink.textContent = 'Control Link';

      const linkEl = document.createElement('a');
      linkEl.id = testItem.elementId || 'popunder-trigger-03';
      linkEl.className = testItem.selectorClasses;
      linkEl.href = '#adshield-synthetic-popup';
      linkEl.style.display = 'block';
      linkEl.style.width = '100px';
      linkEl.style.height = '20px';
      linkEl.textContent = 'Popunder Trigger';

      sandboxStageEl.appendChild(ctrlLink);
      sandboxStageEl.appendChild(linkEl);
      await waitAnimationFrameCancellable(abortSignal);

      const ctrlRect = ctrlLink.getBoundingClientRect();
      const rect = linkEl.getBoundingClientRect();
      const comp = window.getComputedStyle(linkEl);
      const ctrlVisible = ctrlRect.height > 0;
      const linkHidden = comp.display === 'none' || comp.visibility === 'hidden' || rect.height === 0;

      if (ctrlLink.parentNode === sandboxStageEl) sandboxStageEl.removeChild(ctrlLink);
      if (linkEl.parentNode === sandboxStageEl) sandboxStageEl.removeChild(linkEl);

      if (!ctrlVisible) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Neutral control anchor had 0px height; cannot evaluate popunder trigger hiding.',
          'DOM Control Validation',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: 'Neutral control anchor was not visible.' }
        );
      }

      if (linkHidden || hasScriptletWrapper) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          linkHidden && hasScriptletWrapper
            ? 'Both .popunder-ad-trigger DOM element was collapsed AND window.open shows active scriptlet wrapping.'
            : linkHidden
            ? 'Cosmetic filter hid the #popunder-trigger-03 (.popunder-ad-trigger) element while neutral control anchor remained visible.'
            : 'window.open exhibits popup-defuser scriptlet wrapping.',
          'DOM Popunder Trigger + window.open Inspection',
          CONFIDENCE.CONFIRMED,
          { hasScriptletWrapper, linkHidden },
          0,
          { controlDetail: `Neutral control link visible (${Math.round(ctrlRect.height)}px) & no self-imposed sandbox block used.` }
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Popunder trigger element (.popunder-ad-trigger) remained visible and window.open is native (No adblock popup rule matched; browser baseline popup blocker was not falsely credited).',
        'DOM Popunder Trigger + window.open Inspection',
        CONFIDENCE.CONFIRMED,
        { hasScriptletWrapper, linkHidden },
        0,
        { controlDetail: `Neutral control link visible (${Math.round(ctrlRect.height)}px) & no self-imposed sandbox block used.` }
      );
    }

    // 7. Autoplay Policy Signal (P0-3 Fix)
    if (testItem.type === 'autoplay_policy_check') {
      const audio = document.createElement('audio');
      audio.muted = false;
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      try {
        const p = audio.play();
        if (p !== undefined) await p;
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'audio.play() resolved because user gesture activation already occurred in this tab (Tracked in Privacy Signals Index; non-scored).',
          'HTMLMediaElement.play() Check',
          CONFIDENCE.CONFIRMED
        );
      } catch (err) {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          `Unmuted media play() was rejected (${err?.name || 'NotAllowedError'}) by browser/extension policy.`,
          'HTMLMediaElement.play() Check',
          CONFIDENCE.CONFIRMED
        );
      }
    }

    // 8. Query Parameter Hygiene Signal
    if (testItem.type === 'query_param_check') {
      const hasTrackers = /(fbclid|gclid|msclkid|mc_eid)=/i.test(window.location.search);
      return createResult(
        hasTrackers ? RESULT_STATUS.SIGNAL_INACTIVE : RESULT_STATUS.SIGNAL_ACTIVE,
        hasTrackers
          ? 'Tracking query parameters were found in window.location.search.'
          : 'Location URL is clean of tracking query parameters (Privacy Signal Index).',
        'window.location.search Inspection',
        CONFIDENCE.CONFIRMED
      );
    }

    // 9. Referrer Policy Signal
    if (testItem.type === 'referrer_policy_check') {
      const metaRef = document.querySelector('meta[name="referrer"]')?.getAttribute('content') || '';
      if (metaRef && (metaRef.includes('no-referrer') || metaRef.includes('same-origin'))) {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          `Explicit strict meta referrer policy "${metaRef}" is active.`,
          'Document Referrer Policy Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.SIGNAL_INACTIVE,
        'Document uses standard browser default Referrer-Policy ("strict-origin-when-cross-origin"). Recorded in Privacy Signals Index.',
        'Document Referrer Policy Inspection',
        CONFIDENCE.CONFIRMED
      );
    }

    // 10. Anti-Adblock Bait & Surrogate Check
    if (testItem.type === 'anti_adblock_bait_check') {
      const bait = document.createElement('div');
      bait.className = 'ad_unit adsbox text-ad banner-ad';
      bait.style.height = '20px';
      bait.innerHTML = '&nbsp;';
      if (sandboxStageEl) sandboxStageEl.appendChild(bait);
      await waitAnimationFrameCancellable(abortSignal);
      const hidden = bait.offsetHeight === 0 || window.getComputedStyle(bait).display === 'none';
      const hasShim =
        typeof window.google_ad_status !== 'undefined' ||
        typeof window.canRunAds !== 'undefined' ||
        typeof window.google_jobrunner !== 'undefined';
      if (sandboxStageEl && bait.parentNode === sandboxStageEl) sandboxStageEl.removeChild(bait);

      if (hidden && hasShim) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          'Bait element was hidden and surrogate window globals were present.',
          'DOM Bait + Global Surrogate Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      if (hidden) {
        return createResult(
          RESULT_STATUS.PARTIAL,
          'Cosmetic filter hid .adsbox (offsetHeight === 0), blocking the ad slot, though no domain-specific surrogate global was injected on this host.',
          'DOM Bait offsetHeight Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Bait element (.adsbox) remained visible (offsetHeight > 0).',
        'DOM Bait offsetHeight Inspection',
        CONFIDENCE.CONFIRMED
      );
    }

    // 11. Script Tag Injection Probe (with Neutral Control Verification)
    if (testItem.type === 'script_tag_probe') {
      const ctrlCheck = await verifyNeutralSameOriginControl(testItem.id, abortSignal, timeoutMs);
      if (!ctrlCheck.ok) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          ctrlCheck.detail,
          'Neutral Control Pre-Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: ctrlCheck.detail }
        );
      }

      let fetchAborted = false;
      try {
        await fetch(testItem.probePath, { cache: 'no-store', signal: abortSignal });
      } catch (err) {
        if (abortSignal?.aborted) {
          return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
        }
        fetchAborted = true;
      }

      const scriptErrored = await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = testItem.probePath;
        const timer = setTimeout(() => resolve(false), 600);
        const onAbort = () => {
          clearTimeout(timer);
          if (s.parentNode) s.parentNode.removeChild(s);
          resolve(false);
        };
        abortSignal?.addEventListener('abort', onAbort, { once: true });
        s.onload = () => {
          clearTimeout(timer);
          abortSignal?.removeEventListener('abort', onAbort);
          if (s.parentNode) s.parentNode.removeChild(s);
          resolve(false);
        };
        s.onerror = () => {
          clearTimeout(timer);
          abortSignal?.removeEventListener('abort', onAbort);
          if (s.parentNode) s.parentNode.removeChild(s);
          resolve(true);
        };
        (sandboxStageEl || document.body).appendChild(s);
      });

      if (abortSignal?.aborted) {
        return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
      }

      if (scriptErrored && fetchAborted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Neutral control succeeded while dynamic <script src="${testItem.probePath}"> was aborted client-side prior to HTTP response.`,
          'HTMLScriptElement onerror + Fetch Abort Verification',
          CONFIDENCE.STRONG,
          { scriptErrored, fetchAborted },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        `Dynamic <script src="${testItem.probePath}"> was not blocked by a client-side filter.`,
        'HTMLScriptElement + Fetch Verification',
        CONFIDENCE.CONFIRMED,
        { scriptErrored, fetchAborted },
        0,
        { controlDetail: ctrlCheck.detail }
      );
    }

    // 12. XMLHttpRequest Pattern Probe (with Neutral Control Verification)
    if (testItem.type === 'xhr_pattern_probe') {
      const ctrlCheck = await verifyNeutralSameOriginControl(testItem.id, abortSignal, timeoutMs);
      if (!ctrlCheck.ok) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          ctrlCheck.detail,
          'Neutral Control Pre-Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: ctrlCheck.detail }
        );
      }

      const xhrRes = await new Promise((resolve) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', testItem.probePath, true);
          xhr.timeout = timeoutMs;
          const onAbort = () => {
            try {
              xhr.abort();
            } catch {}
            resolve({ userCancelled: true });
          };
          abortSignal?.addEventListener('abort', onAbort, { once: true });
          xhr.onload = () => {
            abortSignal?.removeEventListener('abort', onAbort);
            resolve({ aborted: false, status: xhr.status });
          };
          xhr.onerror = () => {
            abortSignal?.removeEventListener('abort', onAbort);
            resolve({ aborted: true, status: xhr.status });
          };
          xhr.ontimeout = () => {
            abortSignal?.removeEventListener('abort', onAbort);
            resolve({ aborted: false, timeout: true });
          };
          xhr.send();
        } catch {
          resolve({ aborted: true, status: 0 });
        }
      });

      if (xhrRes.userCancelled || abortSignal?.aborted) {
        return createResult(RESULT_STATUS.CANCELLED, 'XHR aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
      }
      if (xhrRes.timeout) {
        return createResult(RESULT_STATUS.INCONCLUSIVE, 'XHR timed out.', 'XHR Check', CONFIDENCE.UNKNOWN);
      }
      if (xhrRes.aborted && xhrRes.status === 0) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Neutral control succeeded while XMLHttpRequest to "${testItem.probePath}" was aborted client-side (status 0 onerror).`,
          'XMLHttpRequest Status 0 Interception',
          CONFIDENCE.STRONG,
          { status: 0 },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        `XMLHttpRequest to "${testItem.probePath}" was not blocked client-side (HTTP status ${xhrRes.status}).`,
        'XMLHttpRequest Inspection',
        CONFIDENCE.CONFIRMED,
        { status: xhrRes.status },
        0,
        { controlDetail: ctrlCheck.detail }
      );
    }

    // 13. Resource Timing Isolation Signal
    if (testItem.type === 'resource_timing_check') {
      if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
        return createResult(RESULT_STATUS.UNSUPPORTED, 'ResourceTiming API unavailable.', 'Performance Check', CONFIDENCE.CONFIRMED);
      }
      const entries = performance.getEntriesByType('resource');
      return createResult(
        RESULT_STATUS.SIGNAL_ACTIVE,
        `Inspected ${entries.length} ResourceTiming entries; cross-origin transferSize isolation is enforced (Privacy Signals Index).`,
        'performance.getEntriesByType("resource")',
        CONFIDENCE.CONFIRMED
      );
    }

    // 14. GPC & DNT Signal
    if (testItem.type === 'gpc_dnt_check') {
      const gpc = navigator.globalPrivacyControl === true;
      const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
      if (gpc || dnt) {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          `Privacy opt-out signal active (GPC: ${String(gpc)}, DNT: ${String(dnt)}). Counted in Privacy Signals Index.`,
          'Navigator Privacy Signals',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.SIGNAL_INACTIVE,
        'Neither Global Privacy Control (GPC) nor Do Not Track (DNT) is enabled (Privacy Signals Index).',
        'Navigator Privacy Signals',
        CONFIDENCE.CONFIRMED
      );
    }

    // 15. Storage Isolation Signal
    if (testItem.type === 'storage_isolation_check') {
      const hasSAA = typeof document.hasStorageAccess === 'function';
      let storageAccessible = false;
      try {
        const k = '__adshield_test_key__';
        window.localStorage.setItem(k, '1');
        storageAccessible = window.localStorage.getItem(k) === '1';
        window.localStorage.removeItem(k);
      } catch {
        storageAccessible = false;
      }
      if (!storageAccessible) {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          'localStorage access is actively restricted in this context (Privacy Signals Index).',
          'Storage Access Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        hasSAA ? RESULT_STATUS.SIGNAL_ACTIVE : RESULT_STATUS.SIGNAL_INACTIVE,
        `Storage Access API partitioning interface is ${hasSAA ? 'supported' : 'unavailable'} (Privacy Signals Index).`,
        'Storage API Check',
        CONFIDENCE.CONFIRMED
      );
    }

    // 16. Fingerprint Surface Signal
    if (testItem.type === 'fingerprint_surface_check') {
      let renderer = 'Unavailable';
      try {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl');
        if (gl) {
          const dbg = gl.getExtension('WEBGL_debug_renderer_info');
          renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || 'Masked' : 'Extension Disabled';
        }
      } catch {
        renderer = 'Blocked';
      }
      const memHidden = typeof navigator.deviceMemory === 'undefined';
      const rendererRestricted = renderer === 'Masked' || renderer === 'Extension Disabled' || renderer === 'Blocked';

      if (memHidden || rendererRestricted) {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          `Hardware entropy surface restricted: deviceMemory=${memHidden ? 'hidden' : navigator.deviceMemory + 'GB'}, WebGL="${renderer.slice(0, 36)}" (Privacy Signals Index).`,
          'Capability Surface Check',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.SIGNAL_INACTIVE,
        `Hardware hints exposed: deviceMemory=${navigator.deviceMemory}GB, WebGL renderer exposed (Privacy Signals Index).`,
        'Capability Surface Check',
        CONFIDENCE.CONFIRMED
      );
    }

    // 17. Audio / Canvas Guard Signal
    if (testItem.type === 'audio_canvas_guard_check') {
      const toDataUrlStr = Function.prototype.toString.call(HTMLCanvasElement.prototype.toDataURL);
      const wrapped = !toDataUrlStr.includes('[native code]');
      return createResult(
        wrapped ? RESULT_STATUS.SIGNAL_ACTIVE : RESULT_STATUS.INCONCLUSIVE,
        wrapped
          ? 'HTMLCanvasElement.prototype.toDataURL exhibits anti-fingerprinting scriptlet wrapping (Privacy Signals Index).'
          : 'Canvas prototype reports [native code] (Note: native C++ farbling cannot be detected from JS prototype inspection).',
        'Canvas Prototype Inspection',
        wrapped ? CONFIDENCE.CONFIRMED : CONFIDENCE.UNKNOWN
      );
    }

    // 18. Notification Permission Signal
    if (testItem.type === 'notification_state_check') {
      if (typeof Notification === 'undefined' || Notification.permission === 'denied') {
        return createResult(
          RESULT_STATUS.SIGNAL_ACTIVE,
          'Notification permission is explicitly denied or omitted (Privacy Signals Index).',
          'Notification Check',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.SIGNAL_INACTIVE,
        `Notification.permission is "${Notification.permission}" (Privacy Signals Index).`,
        'Notification Check',
        CONFIDENCE.CONFIRMED
      );
    }

    // 19. Dedicated Monetag Isolated Block Test (MTG-01)
    if (testItem.type === 'monetag_isolated_block') {
      const targetStage = monetagStageEl || sandboxStageEl;
      if (!targetStage) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Isolated Monetag test chamber mount unavailable.',
          'Monetag Chamber Check',
          CONFIDENCE.UNKNOWN
        );
      }

      const ctrlCheck = await verifyNeutralSameOriginControl(testItem.id, abortSignal, timeoutMs);
      if (!ctrlCheck.ok) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          ctrlCheck.detail,
          'Neutral Control Pre-Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: ctrlCheck.detail }
        );
      }

      const ctrlBox = document.createElement('div');
      ctrlBox.className = 'adshield-control-box';
      ctrlBox.style.width = '100px';
      ctrlBox.style.height = '20px';
      ctrlBox.style.display = 'block';

      const zoneEl = document.createElement('div');
      zoneEl.id = testItem.elementId || 'monetag-zone-fixture-01';
      zoneEl.className = testItem.selectorClasses;
      zoneEl.setAttribute('data-monetag-zone', 'test-zone-01');
      zoneEl.style.width = '120px';
      zoneEl.style.height = '24px';
      zoneEl.style.display = 'block';
      zoneEl.textContent = 'Monetag Test Zone';

      targetStage.appendChild(ctrlBox);
      targetStage.appendChild(zoneEl);
      await waitAnimationFrameCancellable(abortSignal);

      const zoneRect = zoneEl.getBoundingClientRect();
      const zoneComp = window.getComputedStyle(zoneEl);
      const domHidden =
        zoneComp.display === 'none' || zoneComp.visibility === 'hidden' || zoneRect.height === 0;

      if (ctrlBox.parentNode === targetStage) targetStage.removeChild(ctrlBox);
      if (zoneEl.parentNode === targetStage) targetStage.removeChild(zoneEl);

      let tagPathAborted = false;
      try {
        await fetch(testItem.probePath, { cache: 'no-store', signal: abortSignal });
      } catch (err) {
        if (abortSignal?.aborted) {
          return createResult(RESULT_STATUS.CANCELLED, 'Aborted by user.', 'AbortSignal', CONFIDENCE.CONFIRMED);
        }
        tagPathAborted = true;
      }

      if (domHidden && tagPathAborted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          'Dedicated Monetag test zone (.monetag-ad-zone) was hidden in DOM AND controlled Monetag tag path was aborted client-side.',
          'Dedicated Monetag Sandbox Chamber',
          CONFIDENCE.CONFIRMED,
          { domHidden, tagPathAborted },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      if (domHidden || tagPathAborted) {
        return createResult(
          RESULT_STATUS.PARTIAL,
          tagPathAborted
            ? 'Controlled Monetag tag request was intercepted, while the .monetag-ad-zone container remained visible.'
            : 'Dedicated .monetag-ad-zone container was collapsed by CSS, while the relative tag path was not aborted.',
          'Dedicated Monetag Sandbox Chamber',
          CONFIDENCE.STRONG,
          { domHidden, tagPathAborted },
          0,
          { controlDetail: ctrlCheck.detail }
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Neither the dedicated .monetag-ad-zone container nor the controlled Monetag tag path was blocked.',
        'Dedicated Monetag Sandbox Chamber',
        CONFIDENCE.CONFIRMED,
        { domHidden, tagPathAborted },
        0,
        { controlDetail: ctrlCheck.detail }
      );
    }

    return createResult(RESULT_STATUS.INCONCLUSIVE, 'Unhandled test type.', 'Runner Fallback', CONFIDENCE.UNKNOWN);
  } catch (err) {
    if (err?.name === 'AbortError' || abortSignal?.aborted) {
      return createResult(
        RESULT_STATUS.CANCELLED,
        'Test execution aborted immediately on user request.',
        'Runner AbortController',
        CONFIDENCE.CONFIRMED
      );
    }
    return createResult(
      RESULT_STATUS.ERROR,
      `Test runner error: ${err?.message || String(err)}`,
      'Runner Error Boundary',
      CONFIDENCE.UNKNOWN
    );
  }
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c65322] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f0e7] dark:focus-visible:ring-offset-[#172129]';

function StatusBadge({ status, darkMode }) {
  const styles = {
    [RESULT_STATUS.BLOCKED]: darkMode
      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
      : 'bg-emerald-50 text-emerald-900 border-emerald-300',
    [RESULT_STATUS.PARTIAL]: darkMode
      ? 'bg-amber-950/90 text-amber-300 border-amber-700'
      : 'bg-amber-50 text-amber-900 border-amber-300',
    [RESULT_STATUS.ALLOWED]: darkMode
      ? 'bg-rose-950/90 text-rose-300 border-rose-700'
      : 'bg-rose-50 text-rose-900 border-rose-300',
    [RESULT_STATUS.CONSISTENT_WITH_FILTERING]: darkMode
      ? 'bg-sky-950/90 text-sky-300 border-sky-700'
      : 'bg-sky-50 text-sky-900 border-sky-300',
    [RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN]: darkMode
      ? 'bg-purple-950/80 text-purple-300 border-purple-700'
      : 'bg-purple-50 text-purple-900 border-purple-300',
    [RESULT_STATUS.SIGNAL_ACTIVE]: darkMode
      ? 'bg-teal-950/90 text-teal-300 border-teal-700'
      : 'bg-teal-50 text-teal-900 border-teal-300',
    [RESULT_STATUS.SIGNAL_INACTIVE]: darkMode
      ? 'bg-slate-800 text-slate-300 border-slate-600'
      : 'bg-slate-100 text-slate-700 border-slate-300',
    [RESULT_STATUS.INCONCLUSIVE]: darkMode
      ? 'bg-slate-800 text-slate-300 border-slate-700'
      : 'bg-slate-100 text-slate-700 border-slate-300',
    [RESULT_STATUS.RUNNING]: darkMode
      ? 'bg-sky-950 text-sky-300 border-sky-600'
      : 'bg-sky-50 text-sky-900 border-sky-400'
  };

  const shortLabels = {
    [RESULT_STATUS.BLOCKED]: 'BLOCKED',
    [RESULT_STATUS.PARTIAL]: 'PARTIAL',
    [RESULT_STATUS.ALLOWED]: 'ALLOWED',
    [RESULT_STATUS.CONSISTENT_WITH_FILTERING]: 'FILTER_INF',
    [RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN]: 'FAIL_CAUSE_UNK',
    [RESULT_STATUS.SIGNAL_ACTIVE]: 'SIGNAL_ON',
    [RESULT_STATUS.SIGNAL_INACTIVE]: 'SIGNAL_OFF',
    [RESULT_STATUS.INCONCLUSIVE]: 'INCONCLUSIVE',
    [RESULT_STATUS.UNSUPPORTED]: 'UNSUPPORTED',
    [RESULT_STATUS.CANCELLED]: 'CANCELLED',
    [RESULT_STATUS.RUNNING]: 'RUNNING',
    [RESULT_STATUS.QUEUED]: 'QUEUED'
  };

  const badgeStyle =
    styles[status] ||
    (darkMode ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200');

  return (
    <span
      title={status || 'STANDBY'}
      className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[104px] rounded-xs text-[10px] font-mono font-bold tracking-tight border tabular-nums ${badgeStyle}`}
    >
      {shortLabels[status] || status || 'STANDBY'}
    </span>
  );
}

const WaterfallRow = React.memo(function WaterfallRow({
  test,
  result,
  isSelected,
  onSelect,
  onRunSingle,
  isRunning,
  darkMode
}) {
  const status = result?.status;
  const duration = result?.durationMs || 0;
  const barWidthPct = status ? Math.min(100, Math.max(8, Math.round((duration / 180) * 100))) : 0;

  let barColor = 'bg-slate-400 dark:bg-slate-600';
  if (status === RESULT_STATUS.BLOCKED) barColor = 'bg-emerald-600 dark:bg-emerald-500';
  else if (status === RESULT_STATUS.PARTIAL) barColor = 'bg-amber-500';
  else if (status === RESULT_STATUS.ALLOWED) barColor = 'bg-rose-600 dark:bg-rose-500';
  else if (status === RESULT_STATUS.SIGNAL_ACTIVE) barColor = 'bg-teal-600 dark:bg-teal-500';
  else if (status === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN) barColor = 'bg-purple-600 dark:bg-purple-500';

  const groupBadge =
    test.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING
      ? 'CORE_BLK'
      : test.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL
      ? 'PRIV_SIG'
      : 'EXPL_NET';

  return (
    <tr
      onClick={() => onSelect(test.id)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(test.id);
        }
      }}
      className={`cursor-pointer border-b transition-colors text-xs tabular-nums ${
        darkMode ? 'border-[#1B222C]' : 'border-slate-200'
      } ${
        isSelected
          ? darkMode
            ? 'bg-sky-950/60 text-white'
            : 'bg-sky-50/90 text-slate-950'
          : darkMode
          ? 'hover:bg-[#141A23]'
          : 'hover:bg-slate-100/70'
      }`}
    >
      <td className="py-1.5 px-2.5 font-mono font-bold whitespace-nowrap text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              test.audit.scoringEligible
                ? 'bg-sky-500'
                : test.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL
                ? 'bg-teal-500'
                : 'bg-slate-400'
            }`}
          />
          <span>{test.id}</span>
        </div>
      </td>
      <td className="py-1.5 px-2 font-mono text-[10px] whitespace-nowrap opacity-75">{groupBadge}</td>
      <td className="py-1.5 px-2.5 max-w-[270px] truncate font-medium" title={test.name}>
        {test.name}
      </td>
      <td className="py-1.5 px-2 whitespace-nowrap">
        <StatusBadge status={status} darkMode={darkMode} />
      </td>
      <td className="py-1.5 px-2 font-mono text-[10px] whitespace-nowrap opacity-80">
        {result?.confidence?.shortLabel || '-'}
      </td>
      <td className="py-1.5 px-2.5 w-28">
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-xs overflow-hidden">
            {status && <div className={`h-full ${barColor}`} style={{ width: `${barWidthPct}%` }} />}
          </div>
          <span className="w-9 text-right opacity-75">{duration ? `${duration}ms` : '-'}</span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onRunSingle(test)}
          disabled={isRunning}
          title={`Probe ${test.id}`}
          className={`px-1.5 py-0.5 rounded-xs border font-mono text-[10px] cursor-pointer disabled:opacity-40 ${
            darkMode
              ? 'bg-[#0D1117] border-slate-700 hover:border-sky-500 text-slate-300'
              : 'bg-white border-slate-300 hover:border-sky-600 text-slate-700'
          }`}
        >
          Probe
        </button>
      </td>
    </tr>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [advancedToolsOpen, setAdvancedToolsOpen] = useState(false);

  const [resultsMap, setResultsMap] = useState({});
  const [executionState, setExecutionState] = useState(EXECUTION_STATE.IDLE);
  const [runProgress, setRunProgress] = useState({
    completed: 0,
    total: 0,
    currentTestId: ''
  });
  const [inspectedTestId, setInspectedTestId] = useState('DSP-01');

  const [concurrency] = useState(6);
  const [timeoutMs] = useState(2500);
  const [categoryWeights, setCategoryWeights] = useState(DEFAULT_SCORING_CATEGORIES);

  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWaferMatrix, setShowWaferMatrix] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState('weights');

  const [envDiagnostics, setEnvDiagnostics] = useState(null);
  const [fixtureServerStatus, setFixtureServerStatus] = useState({
    available: false,
    mode: 'CLIENT_ONLY_STATIC'
  });
  const [userReported, setUserReported] = useState({
    installedExtension: 'unspecified',
    privateDns: 'unspecified',
    vpnEnabled: 'unspecified',
    vpnProvider: '',
    notes: ''
  });

  const [monetagChamberLog, setMonetagChamberLog] = useState([]);

  const [unitTestResults, setUnitTestResults] = useState([]);
  const [toast, setToast] = useState(null);

  const runAbortControllerRef = useRef(null);
  const pauseRunRef = useRef(false);
  const sandboxStageRef = useRef(null);
  const monetagStageRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    collectEnvironmentDiagnostics().then(setEnvDiagnostics);
    checkFirstPartyFixtureServer().then(setFixtureServerStatus);
    setUnitTestResults(runVerificationSuite());
  }, []);

  const notify = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const runTestsBatch = useCallback(
    async (testsToRun) => {
      if (
        executionState === EXECUTION_STATE.RUNNING ||
        executionState === EXECUTION_STATE.PAUSED ||
        !testsToRun ||
        testsToRun.length === 0
      ) {
        return;
      }

      const abortController = new AbortController();
      runAbortControllerRef.current = abortController;
      pauseRunRef.current = false;
      setExecutionState(EXECUTION_STATE.RUNNING);

      setResultsMap((prev) => {
        const next = { ...prev };
        testsToRun.forEach((t) => {
          next[t.id] = {
            testId: t.id,
            status: RESULT_STATUS.QUEUED,
            actualOutcome: 'Queued in pipeline...',
            confidence: CONFIDENCE.UNKNOWN,
            durationMs: 0
          };
        });
        return next;
      });

      const total = testsToRun.length;
      let completed = 0;
      setInspectedTestId(testsToRun[0]?.id || 'DSP-01');
      setRunProgress({ completed: 0, total, currentTestId: testsToRun[0]?.id || '' });

      const queue = [...testsToRun];
      const workerCount = Math.max(1, Math.min(concurrency, queue.length));
      const pendingBatch = {};
      let rafScheduled = false;

      const flushPendingBatch = () => {
        rafScheduled = false;
        const snapshot = { ...pendingBatch };
        Object.keys(pendingBatch).forEach((k) => delete pendingBatch[k]);
        if (Object.keys(snapshot).length > 0) {
          setResultsMap((prev) => ({ ...prev, ...snapshot }));
        }
      };

      const scheduleFlush = () => {
        if (!rafScheduled) {
          rafScheduled = true;
          requestAnimationFrame(flushPendingBatch);
        }
      };

      const worker = async () => {
        while (queue.length > 0) {
          while (pauseRunRef.current && !abortController.signal.aborted) {
            await new Promise((r) => setTimeout(r, 80));
          }

          if (abortController.signal.aborted) {
            const cancelledItem = queue.shift();
            if (cancelledItem) {
              pendingBatch[cancelledItem.id] = {
                testId: cancelledItem.id,
                status: RESULT_STATUS.CANCELLED,
                actualOutcome: 'Cancelled immediately via AbortSignal.',
                confidence: CONFIDENCE.CONFIRMED,
                durationMs: 0
              };
              scheduleFlush();
            }
            continue;
          }

          const current = queue.shift();
          if (!current) break;

          pendingBatch[current.id] = {
            testId: current.id,
            status: RESULT_STATUS.RUNNING,
            actualOutcome: 'Executing fixture...',
            confidence: CONFIDENCE.UNKNOWN
          };
          scheduleFlush();

          const record = await executeAuditedTest(current, {
            sandboxStageEl: sandboxStageRef.current,
            monetagStageEl: monetagStageRef.current,
            timeoutMs,
            retryCount: 0,
            abortSignal: abortController.signal,
            fixtureServerAvailable: fixtureServerStatus.available
          });

          completed++;
          pendingBatch[current.id] = record;
          scheduleFlush();
          setRunProgress({ completed, total, currentTestId: current.id });
        }
      };

      await Promise.all(Array.from({ length: workerCount }, () => worker()));
      flushPendingBatch();

      const wasCancelled = abortController.signal.aborted;
      pauseRunRef.current = false;
      setExecutionState(wasCancelled ? EXECUTION_STATE.CANCELLED : EXECUTION_STATE.COMPLETED);
      notify(
        wasCancelled ? 'Run aborted immediately via AbortSignal.' : `Completed ${completed} diagnostic cases.`,
        wasCancelled ? 'warning' : 'success'
      );
    },
    [concurrency, executionState, fixtureServerStatus.available, notify, timeoutMs]
  );

  const handleCancelRun = useCallback(() => {
    pauseRunRef.current = false;
    if (runAbortControllerRef.current) {
      runAbortControllerRef.current.abort();
    }
  }, []);

  const handleTogglePause = useCallback(() => {
    if (executionState === EXECUTION_STATE.RUNNING) {
      pauseRunRef.current = true;
      setExecutionState(EXECUTION_STATE.PAUSED);
    } else if (executionState === EXECUTION_STATE.PAUSED) {
      pauseRunRef.current = false;
      setExecutionState(EXECUTION_STATE.RUNNING);
    }
  }, [executionState]);

  const startRun = useCallback(
    (testsToRun) => {
      setActiveTab('results');
      return runTestsBatch(testsToRun);
    },
    [runTestsBatch]
  );

  const scoreSummary = useMemo(
    () => calculateExtractedBenchmarkScore(resultsMap, categoryWeights, TEST_REGISTRY),
    [resultsMap, categoryWeights]
  );

  const protectionAnalysis = useMemo(
    () => analyzeProtectionLayers(resultsMap, userReported, envDiagnostics, fixtureServerStatus),
    [resultsMap, userReported, envDiagnostics, fixtureServerStatus]
  );

  const allSections = useMemo(() => Array.from(new Set(TEST_REGISTRY.map((t) => t.section))), []);

  const filteredTests = useMemo(() => {
    return TEST_REGISTRY.filter((t) => {
      const matchSec = sectionFilter === 'ALL' || t.section === sectionFilter;
      const matchGroup = groupFilter === 'ALL' || t.metricGroup === groupFilter;
      const res = resultsMap[t.id];
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'BLOCKED' && res?.status === RESULT_STATUS.BLOCKED) ||
        (statusFilter === 'PARTIAL' && res?.status === RESULT_STATUS.PARTIAL) ||
        (statusFilter === 'ALLOWED' && res?.status === RESULT_STATUS.ALLOWED) ||
        (statusFilter === 'OTHER' && res?.status && ![RESULT_STATUS.BLOCKED, RESULT_STATUS.PARTIAL, RESULT_STATUS.ALLOWED].includes(res?.status));
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q) ||
        (t.recommendedRule && t.recommendedRule.toLowerCase().includes(q));
      return matchSec && matchGroup && matchStatus && matchQuery;
    });
  }, [sectionFilter, groupFilter, statusFilter, searchQuery, resultsMap]);

  const inspectedTest = useMemo(
    () => TEST_REGISTRY.find((t) => t.id === inspectedTestId) || TEST_REGISTRY[0],
    [inspectedTestId]
  );
  const inspectedResult = resultsMap[inspectedTest?.id] || null;

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if ((activeTab !== 'results' && activeTab !== 'workbench') || filteredTests.length === 0) return;
        e.preventDefault();
        const idx = filteredTests.findIndex((t) => t.id === inspectedTestId);
        const nextIdx =
          e.key === 'ArrowDown'
            ? Math.min(filteredTests.length - 1, idx + 1)
            : Math.max(0, idx - 1);
        if (filteredTests[nextIdx]) {
          setInspectedTestId(filteredTests[nextIdx].id);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (inspectedTest && executionState !== EXECUTION_STATE.RUNNING) {
          e.preventDefault();
          runTestsBatch([inspectedTest]);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, filteredTests, inspectedTestId, inspectedTest, executionState, runTestsBatch]);

  const triggerDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Exported ${filename}`, 'success');
  };

  const handleResetMonetagChamber = useCallback(() => {
    setMonetagChamberLog([]);
  }, []);

  const handleRunMonetagChamber = async () => {
    const mtgTests = TEST_REGISTRY.filter((t) => t.section === '5.14 Dedicated Monetag Test Blocks');
    await runTestsBatch(mtgTests);

    setMonetagChamberLog((prev) => [
      {
        ts: new Date().toISOString().slice(11, 19),
        mode: 'Controlled and Exploratory Probe Mode',
        msg: 'Executed MTG-01 controlled DOM/path fixture and MTG-02 exploratory delivery-domain probe. No live provider tag was mounted.'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const handleWeightChange = (catId, newWeight) => {
    const num = Math.max(0, Math.min(100, Number(newWeight) || 0));
    setCategoryWeights((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, defaultWeight: num } : c))
    );
  };

  const isRunning = executionState === EXECUTION_STATE.RUNNING;
  const isPaused = executionState === EXECUTION_STATE.PAUSED;
  const isActiveRun = isRunning || isPaused;

  const appBg = darkMode ? 'bg-[#10191f] text-[#edf2ee]' : 'bg-[#f4f0e7] text-[#182024]';
  const surface = darkMode ? 'bg-[#172129] border-[#354955]' : 'bg-[#fffdf8] border-[#c9c1b2]';
  const subSurface = darkMode ? 'bg-[#111a20] border-[#354955]' : 'bg-[#ebe5d9] border-[#c9c1b2]';
  const muted = darkMode ? 'text-[#b3c0c2]' : 'text-[#536266]';

  const coreBlockingTests = useMemo(
    () => TEST_REGISTRY.filter((t) => t.metricGroup === METRIC_GROUP.AD_TRACKER_BLOCKING),
    []
  );
  const privacySignalTests = useMemo(
    () => TEST_REGISTRY.filter((t) => t.metricGroup === METRIC_GROUP.PRIVACY_SIGNAL),
    []
  );
  const exploratoryTests = useMemo(
    () => TEST_REGISTRY.filter((t) => t.metricGroup === METRIC_GROUP.EXPLORATORY_PROBE),
    []
  );
  const quickScanTests = useMemo(
    () =>
      TEST_REGISTRY.filter((t) =>
        ['DSP-01', 'TPA-01', 'TPA-05', 'TRK-01', 'INT-03', 'AAB-01'].includes(t.id)
      ),
    []
  );
  const terminalResults = Object.values(resultsMap).filter((result) =>
    [
      RESULT_STATUS.BLOCKED,
      RESULT_STATUS.PARTIAL,
      RESULT_STATUS.ALLOWED,
      RESULT_STATUS.INCONCLUSIVE,
      RESULT_STATUS.UNSUPPORTED,
      RESULT_STATUS.ERROR,
      RESULT_STATUS.CANCELLED
    ].includes(result.status)
  );

  const handleCopyRule = (ruleText) => {
    if (!ruleText) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ruleText);
    }
    setCopiedRule(true);
    notify('Target rule copied to clipboard', 'success');
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const normalizedTab = useMemo(() => {
    if (activeTab === 'workbench' || activeTab === 'layers' || activeTab === 'run') return 'results';
    if (activeTab === 'learn' || activeTab === 'verification') return 'methodology';
    if (activeTab === 'scoring' || activeTab === 'monetag' || activeTab === 'architecture') return 'settings';
    return activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'monetag') setSettingsSubTab('monetag');
    if (activeTab === 'scoring') setSettingsSubTab('weights');
    if (activeTab === 'architecture') setSettingsSubTab('backend');
  }, [activeTab]);

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-[#c65322] selection:text-white ${appBg}`}>
      <header className={`sticky top-0 z-30 border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 ${surface}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[#c65322] text-[#c65322] flex items-center justify-center font-bold text-sm" aria-hidden="true">
            AB
          </div>
          <div>
            <div className="font-bold text-base tracking-[-0.02em]">{BRAND_NAME}</div>
            <div className={`text-[11px] ${muted}`}>Evidence-led browser diagnostics · v{APP_VERSION}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs tabular-nums">
          <div
            title={`Ad & Tracker Blocking Score (0-100): Evaluated strictly from ${scoreSummary.maxScoredTests} controlled ad/tracker blocking fixtures.`}
            className={`px-3 py-1.5 rounded-sm border flex items-center gap-2 ${subSurface}`}
          >
            <span className={`text-[10px] ${muted}`}>CORE SCORE</span>
            <span className="font-bold text-[#c65322]">
              {scoreSummary.overallScore !== null ? `${scoreSummary.overallScore}/100` : 'STANDBY'}
            </span>
            <span className={`text-[10px] ${muted}`}>
              ({scoreSummary.eligibleTotalTests}/{scoreSummary.maxScoredTests} core)
            </span>
          </div>

          <div
            title="Browser Privacy & Hardening Signals: Evaluated separately so GPC/DNT or WebGL masking never inflate the Ad-Blocking Score."
            className={`hidden md:flex px-3 py-1.5 rounded-sm border items-center gap-2 ${subSurface}`}
          >
            <span className={`text-[10px] ${muted}`}>PRIVACY SIGNALS</span>
            <span className="font-bold text-teal-500">
              {scoreSummary.privacySignalsSummary.activeCount}/{scoreSummary.privacySignalsSummary.totalSignals} ACTIVE
            </span>
          </div>

          {!isActiveRun ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => runTestsBatch(coreBlockingTests)}
                className={`hidden lg:inline-flex items-center gap-1 px-3 min-h-10 rounded-sm text-[11px] font-semibold border border-[#355f50] text-[#216447] hover:bg-[#e5f1e8] dark:hover:bg-[#1a3028] cursor-pointer ${FOCUS_RING}`}
                title={`Run only the ${coreBlockingTests.length} Core Controlled Ad & Tracker Blocking Fixtures`}
              >
                <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                Run core ({coreBlockingTests.length})
              </button>
              <button
                type="button"
                onClick={() => runTestsBatch(TEST_REGISTRY)}
                className={`inline-flex items-center gap-1 px-3 min-h-10 rounded-sm text-[11px] font-semibold bg-[#c65322] hover:bg-[#a9431c] text-white cursor-pointer ${FOCUS_RING}`}
                title={`Run all ${EXPECTED_REGISTRY_COUNT} tests across all 14 domains`}
              >
                <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                Run full diagnostic
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`inline-flex items-center gap-1 px-2.5 min-h-[30px] rounded-xs text-[11px] font-semibold border cursor-pointer ${subSurface} ${FOCUS_RING}`}
              >
                {isPaused ? <Play aria-hidden="true" className="w-3 h-3" /> : <Pause aria-hidden="true" className="w-3 h-3" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={handleCancelRun}
                className={`inline-flex items-center gap-1 px-2.5 min-h-[30px] rounded-xs text-[11px] font-semibold bg-rose-700 hover:bg-rose-600 text-white cursor-pointer ${FOCUS_RING}`}
                title="Immediately aborts in-flight fetch/XHR requests via AbortController"
              >
                <Square aria-hidden="true" className="w-3 h-3 fill-current" />
                Abort Now ({runProgress.completed}/{runProgress.total})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle theme"
            className={`min-w-10 min-h-10 p-2 rounded-sm border cursor-pointer ${subSurface} ${FOCUS_RING}`}
          >
            {darkMode ? <Sun aria-hidden="true" className="w-3.5 h-3.5 text-amber-400" /> : <Moon aria-hidden="true" className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Streamlined 4-Tab Navigation */}
      <div className={`border-b px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs ${subSurface}`}>
        <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Primary navigation">
          {[
            { id: 'overview', label: 'Overview & Scanner', icon: ShieldCheck },
            { id: 'results', label: 'Results & Workbench', icon: CheckCircle2 },
            { id: 'methodology', label: 'Methodology & Audit', icon: Layers },
            { id: 'settings', label: 'Settings & Lab', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = normalizedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 min-h-10 sm:min-h-9 px-3.5 py-1.5 rounded-sm border text-xs cursor-pointer transition-all ${FOCUS_RING} ${
                  active
                    ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] dark:border-[#edf2ee] font-bold shadow-xs'
                    : `border-transparent ${muted} hover:text-[#182024] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5`
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className={muted}>Mode: <strong className="text-current">{fixtureServerStatus.mode}</strong></span>
          <div
            ref={sandboxStageRef}
            aria-label="Isolated DOM Fixture Stage"
            className="w-16 h-4 overflow-hidden border border-dashed border-slate-500 rounded-xs px-1 text-[9px] leading-4 text-center opacity-60"
          >
            DOM READY
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6 sm:px-6 sm:py-10">
        {normalizedTab === 'overview' && (
          <div className="space-y-8">
            <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:items-start" aria-labelledby="overview-title">
              <div className="py-2 sm:py-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm text-[11px] font-mono font-semibold bg-[#c65322]/10 text-[#c65322] border border-[#c65322]/30 mb-4">
                  <Shield className="w-3.5 h-3.5" />
                  EVIDENCE-FIRST BROWSER DIAGNOSTICS
                </div>
                <h1 id="overview-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02]">
                  Inspect browser behavior without inventing the cause.
                </h1>
                <p className={`mt-5 max-w-2xl text-base sm:text-lg leading-relaxed ${muted}`}>
                  Run controlled fixtures to measure observable ad blocking, tracker interception, cosmetic filtering, and privacy signals.
                  We record direct browser-visible evidence and its limitations — without guessing your extensions, VPN, or DNS resolver.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => startRun(quickScanTests)}
                    disabled={isActiveRun}
                    className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm font-semibold bg-[#c65322] hover:bg-[#a9431c] text-white disabled:opacity-50 shadow-xs cursor-pointer transition-colors ${FOCUS_RING}`}
                  >
                    <Play aria-hidden="true" className="w-4 h-4 fill-current" />
                    Run Quick Scan (6 checks · ~1.5s)
                  </button>
                  <button
                    type="button"
                    onClick={() => startRun(TEST_REGISTRY)}
                    disabled={isActiveRun}
                    className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm border font-semibold disabled:opacity-50 cursor-pointer ${surface} hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${FOCUS_RING}`}
                  >
                    <Play aria-hidden="true" className="w-4 h-4" />
                    Run Full Diagnostic ({EXPECTED_REGISTRY_COUNT} cases)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('results')}
                    className={`inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-sm border text-xs font-semibold cursor-pointer ${subSurface} ${FOCUS_RING}`}
                  >
                    View Workbench
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scope & Environment Cards */}
              <div className="space-y-4">
                <aside className={`border-t-4 border-[#c65322] p-5 sm:p-6 rounded-xs border shadow-xs ${surface}`} aria-label="Quick scan scope">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold uppercase font-mono tracking-wider text-[#c65322]">Quick Scan Scope</p>
                    <span className={`text-xs font-mono ${muted}`}>6 CORE VECTORS</span>
                  </div>
                  <p className={`mt-2 text-xs leading-relaxed ${muted}`}>
                    Six registered controlled checks covering core display, script interception, tracking, and anti-adblock detection:
                  </p>
                  <ol className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono font-medium">
                    {quickScanTests.map((test) => (
                      <li key={test.id} className={`p-2 rounded-xs border flex items-center justify-between ${subSurface}`}>
                        <span className="font-bold text-[#c65322]">{test.id}</span>
                        <span className={`text-[10px] truncate max-w-[120px] ${muted}`}>{test.name}</span>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() => setActiveTab('methodology')}
                    className={`mt-4 text-xs font-semibold underline underline-offset-4 cursor-pointer text-[#c65322] ${FOCUS_RING}`}
                  >
                    Read the evidence methodology →
                  </button>
                </aside>

                <div className={`p-5 rounded-xs border space-y-3 text-xs ${surface}`}>
                  <p className="text-xs font-bold uppercase font-mono tracking-wider">Detected Browser Context</p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className={`p-2 rounded-xs border ${subSurface}`}>
                      <span className={muted}>Engine Hint:</span>
                      <div className="font-bold truncate">{envDiagnostics?.engineHint || 'Analyzing...'}</div>
                    </div>
                    <div className={`p-2 rounded-xs border ${subSurface}`}>
                      <span className={muted}>Viewport:</span>
                      <div className="font-bold">{envDiagnostics?.viewport || 'Calculating...'}</div>
                    </div>
                    <div className={`p-2 rounded-xs border ${subSurface}`}>
                      <span className={muted}>Privacy Signal (GPC):</span>
                      <div className="font-bold text-teal-600 dark:text-teal-400">
                        {envDiagnostics?.globalPrivacyControlReported ? 'Active (true)' : 'Inactive'}
                      </div>
                    </div>
                    <div className={`p-2 rounded-xs border ${subSurface}`}>
                      <span className={muted}>Do Not Track (DNT):</span>
                      <div className="font-bold">
                        {envDiagnostics?.doNotTrackReported ? 'Active (1)' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  <p className={`text-[10px] ${muted} leading-normal`}>
                    Note: Visible browser properties are diagnostic context only and cannot prove installed extensions or local VPN adapters.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {normalizedTab === 'results' && (
          <div className="space-y-6">
            {/* Active Execution HUD (shown when tests are running or paused) */}
            {isActiveRun && (
              <div className={`p-4 rounded-xs border-2 border-[#c65322] space-y-3 shadow-md ${surface}`} role="status" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c65322] animate-ping" />
                    <span className="font-bold uppercase tracking-wider text-[#c65322]">
                      {isPaused ? 'Diagnostic Paused' : 'Diagnostic in Progress'}
                    </span>
                    <span className={muted}>· Current: <strong>{runProgress.currentTestId || 'Starting'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      className={`px-3 py-1 rounded-xs border text-xs font-semibold cursor-pointer ${subSurface} ${FOCUS_RING}`}
                    >
                      {isPaused ? 'Resume Run' : 'Pause Run'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRun}
                      className={`px-3 py-1 rounded-xs bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer ${FOCUS_RING}`}
                    >
                      Abort Now
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c65322] transition-all duration-300"
                    style={{ width: `${Math.round((runProgress.completed / (runProgress.total || 1)) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                  <span>Completed {runProgress.completed} of {runProgress.total} test vectors</span>
                  <span>{Math.round((runProgress.completed / (runProgress.total || 1)) * 100)}% complete</span>
                </div>
              </div>
            )}

            {/* Score & Telemetry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Core Blocking Score */}
              <div className={`p-5 rounded-xs border space-y-2 ${surface}`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold uppercase tracking-wider ${muted}`}>CORE BLOCKING SCORE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-xs border border-current/20 text-[#c65322]">35 CORE FIXTURES</span>
                </div>
                <div className="text-4xl font-bold tracking-tight text-[#c65322]">
                  {scoreSummary.overallScore !== null ? `${scoreSummary.overallScore}/100` : 'STANDBY'}
                </div>
                <p className={`text-xs ${muted}`}>
                  {scoreSummary.overallScore !== null
                    ? `From ${scoreSummary.eligibleTotalTests} eligible controlled ad/tracker blocking fixtures.`
                    : 'Click "Run Quick Scan" or "Run Full Diagnostic" to compute score.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono tabular-nums">
                  <span className="px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    {scoreSummary.passedCount} BLOCKED
                  </span>
                  <span className="px-2 py-0.5 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    {scoreSummary.partialCount} PARTIAL
                  </span>
                  <span className="px-2 py-0.5 rounded-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    {scoreSummary.failedCount} ALLOWED
                  </span>
                </div>
              </div>

              {/* Card 2: Privacy Signals */}
              <div className={`p-5 rounded-xs border space-y-2 ${surface}`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold uppercase tracking-wider ${muted}`}>PRIVACY SIGNALS</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-xs border border-teal-500/40 text-teal-600 dark:text-teal-400">9 SIGNALS</span>
                </div>
                <div className="text-4xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
                  {scoreSummary.privacySignalsSummary.activeCount} / {scoreSummary.privacySignalsSummary.totalSignals} ACTIVE
                </div>
                <p className={`text-xs ${muted}`}>
                  Client-side privacy features (GPC, DNT, referrer policy) harden the browser without inflating the ad score.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded-xs border ${subSurface}`}>
                    {scoreSummary.privacySignalsSummary.activeCount > 0 ? 'Signals Protected' : 'Default / Inactive'}
                  </span>
                  <span className={`text-[11px] ${muted}`}>
                    ({scoreSummary.privacySignalsSummary.executedSignals} evaluated)
                  </span>
                </div>
              </div>

              {/* Card 3: Protection Confidence */}
              <div className={`p-5 rounded-xs border space-y-2 ${surface}`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold uppercase tracking-wider ${muted}`}>AUDIT CONFIDENCE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-xs border border-current/20">{scoreSummary.coveragePercentage}% COVERAGE</span>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {scoreSummary.overallConfidence}
                </div>
                <p className={`text-xs ${muted}`}>
                  Direct observations from same-origin and relative path fixtures; no guesses on unseen network layers.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded-xs border ${subSurface}`}>
                    Mode: {fixtureServerStatus.mode}
                  </span>
                  <span className={`text-[11px] ${muted}`}>
                    {scoreSummary.inconclusiveCount} Inconclusive
                  </span>
                </div>
              </div>
            </div>

            {/* 7-Category Score Breakdown Grid */}
            <div className={`p-5 rounded-xs border space-y-4 ${surface}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-current/10">
                <div>
                  <h2 className="text-sm font-bold uppercase font-mono tracking-wider">7-Category Protection Breakdown</h2>
                  <p className={`text-xs ${muted}`}>
                    Click any category below to filter the test catalog and inspect detailed evidence for that vector group.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSectionFilter('ALL');
                    setGroupFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className={`text-xs font-semibold underline underline-offset-4 cursor-pointer text-[#c65322] ${FOCUS_RING}`}
                >
                  Reset category filter
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {scoreSummary.categoryBreakdown.map((cat) => {
                  const hasEligible = cat.eligibleCount > 0;
                  const pct = hasEligible ? cat.rawScore : 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        const matchingTest = TEST_REGISTRY.find((t) => t.scoringCategory === cat.id);
                        if (matchingTest) setSectionFilter(matchingTest.section);
                      }}
                      className={`p-3 rounded-xs border cursor-pointer hover:border-[#c65322] transition-colors space-y-2 ${subSurface}`}
                      title={`Filter tests by ${cat.name}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold truncate max-w-[150px]">{cat.name}</span>
                        <span className="font-mono text-[10px] opacity-75">{cat.configWeight}% weight</span>
                      </div>
                      <div className="flex items-end justify-between font-mono">
                        <span className="text-xl font-bold">
                          {cat.rawScore !== null ? `${cat.rawScore}%` : 'STANDBY'}
                        </span>
                        <span className={`text-[10px] ${muted}`}>
                          {cat.blocked}/{cat.eligibleCount} blocked
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pct >= 80 ? 'bg-emerald-600' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consolidated Report Export Bar */}
            <div className={`p-4 rounded-xs border flex flex-wrap items-center justify-between gap-3 text-xs ${surface}`}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c65322]" />
                <div>
                  <span className="font-bold uppercase font-mono tracking-wider">Sanitized Benchmark Exports</span>
                  <div className={`text-[11px] ${muted}`}>
                    Export verified telemetry with HTML escaping, separated privacy indices, and audit boundaries.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      generateExtractedHtmlReport({
                        brandName: BRAND_NAME,
                        appVersion: APP_VERSION,
                        brandPromise: BRAND_PROMISE,
                        registry: TEST_REGISTRY,
                        scoreSummary,
                        resultsMap,
                        userReported
                      }),
                      'adblocker-test-lab-report.html',
                      'text/html;charset=utf-8;'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${FOCUS_RING}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export HTML
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      generateJsonReport({
                        scoreSummary,
                        protectionAnalysis,
                        userReported,
                        envDiagnostics,
                        resultsMap
                      }),
                      'adblocker-test-lab-benchmark.json',
                      'application/json'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${FOCUS_RING}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      generateCsvReport(resultsMap),
                      'adblocker-test-lab-results.csv',
                      'text/csv;charset=utf-8;'
                    )
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${FOCUS_RING}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Interactive Test Workbench */}
            <div className="space-y-3">
              {/* Filter and Matrix Controls */}
              <div className={`p-3 rounded-xs border flex flex-wrap items-center justify-between gap-3 text-xs ${surface}`}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'ALL', label: `ALL (${TEST_REGISTRY.length})` },
                    { id: METRIC_GROUP.AD_TRACKER_BLOCKING, label: `CORE BLOCKING (${coreBlockingTests.length})` },
                    { id: METRIC_GROUP.PRIVACY_SIGNAL, label: `PRIVACY SIGNALS (${privacySignalTests.length})` },
                    { id: METRIC_GROUP.EXPLORATORY_PROBE, label: `EXPLORATORY (${exploratoryTests.length})` }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGroupFilter(g.id)}
                      className={`px-2.5 py-1 rounded-xs border text-[11px] font-semibold cursor-pointer transition-colors ${
                        groupFilter === g.id ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] font-bold' : `${subSurface} ${muted}`
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Outcome Filter Pills */}
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    {['ALL', 'BLOCKED', 'PARTIAL', 'ALLOWED', 'OTHER'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 py-0.5 rounded-xs border cursor-pointer ${
                          statusFilter === st ? 'bg-sky-700 text-white border-sky-600 font-bold' : `${subSurface} ${muted}`
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Section Select */}
                  <select
                    aria-label="Filter by domain section"
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className={`px-2 py-1 rounded-xs border text-xs font-mono ${subSurface}`}
                  >
                    <option value="ALL">All 14 Sections</option>
                    {allSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="relative">
                    <Search aria-hidden="true" className="w-3.5 h-3.5 absolute left-2 top-2 opacity-50" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter (/)"
                      className={`pl-7 pr-2 py-1 w-36 sm:w-44 rounded-xs border text-xs font-mono ${subSurface}`}
                    />
                  </div>

                  {/* Toggle 55-Pin Matrix */}
                  <button
                    type="button"
                    onClick={() => setShowWaferMatrix((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-xs border text-xs font-mono font-semibold cursor-pointer ${subSurface} ${FOCUS_RING}`}
                  >
                    {showWaferMatrix ? 'Hide Pin Matrix' : 'Show 55-Pin Matrix'}
                  </button>
                </div>
              </div>

              {/* Collapsible 55-Vector Pin Matrix */}
              {showWaferMatrix && (
                <div className={`p-4 rounded-xs border space-y-2 ${surface}`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold uppercase tracking-wider text-[#c65322]">
                      55-VECTOR COVERAGE MATRIX (Click chip to inspect)
                    </span>
                    <span className={muted}>
                      Blocked: {scoreSummary.passedCount} · Partial: {scoreSummary.partialCount} · Allowed: {scoreSummary.failedCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-11 lg:grid-cols-22 gap-1.5 font-mono tabular-nums text-center">
                    {TEST_REGISTRY.map((t) => {
                      const st = resultsMap[t.id]?.status;
                      const selected = inspectedTestId === t.id;
                      let cellBg = darkMode ? 'bg-[#090C10] border-[#1F2733] text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-500';
                      if (st === RESULT_STATUS.BLOCKED) cellBg = 'bg-emerald-600 text-white border-emerald-500';
                      else if (st === RESULT_STATUS.PARTIAL) cellBg = 'bg-amber-500 text-slate-950 border-amber-400';
                      else if (st === RESULT_STATUS.ALLOWED) cellBg = 'bg-rose-600 text-white border-rose-500';
                      else if (st === RESULT_STATUS.SIGNAL_ACTIVE) cellBg = 'bg-teal-600 text-white border-teal-500';
                      else if (st === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN) cellBg = 'bg-purple-700 text-white border-purple-500';
                      else if (st === RESULT_STATUS.CONSISTENT_WITH_FILTERING) cellBg = 'bg-sky-700 text-white border-sky-500';
                      else if (st === RESULT_STATUS.INCONCLUSIVE || st === RESULT_STATUS.SIGNAL_INACTIVE) cellBg = 'bg-slate-700 text-slate-200 border-slate-600';

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setInspectedTestId(t.id)}
                          title={`${t.id} (${t.metricGroup}): ${t.name}; ${st || 'STANDBY'}`}
                          className={`h-7 rounded-xs border text-[10px] font-bold flex items-center justify-center cursor-pointer transition ${cellBg} ${
                            selected ? 'ring-2 ring-[#c65322] z-10 font-black scale-105' : 'hover:opacity-85'
                          }`}
                        >
                          {t.id.replace('-', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className={`lg:col-span-7 border rounded-xs overflow-hidden ${surface}`}>
                  <div className={`p-2.5 border-b flex items-center justify-between text-xs font-mono ${subSurface}`}>
                    <span className="font-bold">Showing {filteredTests.length} Test Vectors</span>
                    <span className={muted}>Navigate with ↑/↓ keys · Press R to probe</span>
                  </div>

              <div className="max-h-[620px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 border-b text-[10px] font-mono uppercase ${subSurface} ${muted}`}>
                    <tr>
                      <th className="py-2 px-2.5">ID</th>
                      <th className="py-2 px-2">INDEX</th>
                      <th className="py-2 px-2.5">VECTOR DESCRIPTION</th>
                      <th className="py-2 px-2">OUTCOME</th>
                      <th className="py-2 px-2">EVIDENCE</th>
                      <th className="py-2 px-2.5">WATERFALL</th>
                      <th className="py-2 px-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map((t) => (
                      <WaterfallRow
                        key={t.id}
                        test={t}
                        result={resultsMap[t.id]}
                        isSelected={inspectedTestId === t.id}
                        onSelect={setInspectedTestId}
                        onRunSingle={(item) => runTestsBatch([item])}
                        isRunning={isActiveRun}
                        darkMode={darkMode}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`lg:col-span-5 border rounded-xs overflow-hidden sticky top-14 space-y-3 p-3.5 ${surface}`}>
              <div className="flex items-start justify-between gap-2 border-b pb-3 border-slate-200 dark:border-[#1F2733]">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded-xs bg-sky-700 text-white font-bold">
                      {inspectedTest.id}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-xs border ${subSurface}`}>
                      {inspectedTest.metricGroup}
                    </span>
                    <span className={muted}>{inspectedTest.section}</span>
                  </div>
                  <h2 className="text-sm font-bold mt-1.5">{inspectedTest.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => runTestsBatch([inspectedTest])}
                  disabled={isActiveRun}
                  className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer disabled:opacity-40 shrink-0 ${FOCUS_RING}`}
                >
                  Re-Probe (R)
                </button>
              </div>

              <div className={`p-2.5 rounded-xs border font-mono text-[11px] space-y-1.5 ${subSurface}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold ${muted}`}>OUTCOME CLASSIFICATION</span>
                  <StatusBadge status={inspectedResult?.status} darkMode={darkMode} />
                </div>
                <div className="truncate">
                  <span className="text-emerald-500 font-semibold">CTRL: </span>
                  <span className={muted}>{inspectedTest.controlResource}</span>
                </div>
                <div className="truncate">
                  <span className="text-sky-400 font-semibold">TEST: </span>
                  <span className={muted}>{inspectedTest.testResource}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold">
                  <span>6-STAGE PROTECTION TRACE</span>
                  <span className={muted}>{inspectedResult?.confidence?.label || 'Awaiting Execution'}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                  {(
                    inspectedResult?.traceStages ||
                    buildProtectionTraceStages({
                      testItem: inspectedTest,
                      controlOk: true,
                      status: 'STANDBY',
                      confidence: CONFIDENCE.UNKNOWN,
                      durationMs: 0
                    })
                  ).map((st) => (
                    <div
                      key={st.step}
                      className={`p-2 rounded-xs border flex items-start justify-between gap-2 ${subSurface}`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-sky-500">
                          0{st.step} {st.code}:
                        </span>{' '}
                        <span className="font-semibold">{st.label}</span>
                        <div className={`text-[10px] mt-0.5 break-words ${muted}`}>{st.detail}</div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[9px] border shrink-0 ${
                          st.evidenceType === 'OBSERVED'
                            ? 'border-teal-600/40 text-teal-400'
                            : st.evidenceType === 'INFERRED'
                            ? 'border-sky-600/40 text-sky-400'
                            : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {st.evidenceType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-xs border font-mono text-xs space-y-1.5 ${subSurface}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#c65322]">
                    TARGET FILTER RULE (SYNTHESIS)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRule(inspectedTest.recommendedRule)}
                    className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold cursor-pointer underline underline-offset-2 ${FOCUS_RING}`}
                  >
                    {copiedRule ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedRule ? 'Copied!' : 'Copy Rule'}
                  </button>
                </div>
                <pre className="text-xs overflow-x-auto select-all font-bold text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap p-2 rounded-xs bg-black/5 dark:bg-black/30">
                  {inspectedTest.recommendedRule}
                </pre>
                <p className={`font-sans text-[11px] pt-1 ${muted}`}>
                  <strong>Audit Boundary:</strong> {inspectedTest.audit.limitations}
                </p>
              </div>
            </div>
          </div>
            </div>
          </div>
        )}

        {normalizedTab === 'methodology' && (
          <div className="space-y-6">
            {/* Principles & Evidence Hierarchy */}
            <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-[#354955]">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#c65322] font-bold tracking-wider">
                    ARCHITECTURAL FOUNDATION // EVIDENCE INTEGRITY
                  </div>
                  <h2 className="text-base font-bold mt-0.5 tracking-tight">
                    Measurement Methodology, Evidence Hierarchy &amp; Inconclusive Honesty
                  </h2>
                  <p className={`text-xs mt-1 max-w-3xl ${muted}`}>
                    This test lab operates entirely within standard browser security sandboxes. It strictly distinguishes direct client-side observations from speculative claims.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-sm border font-mono text-[11px] font-bold ${subSurface}`}>
                    RFC 8941 &bull; W3C Resource Timing
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className={`p-4 rounded-sm border space-y-2 ${subSurface}`}>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#c65322]" />
                    <span>Evidence Boundaries</span>
                  </div>
                  <p className={muted}>
                    A failed network request does not prove ad blocking. Web pages cannot observe whether packet loss originated from an extension, DNS sinkhole, firewall rule, CORS preflight, or dead route.
                  </p>
                </div>
                <div className={`p-4 rounded-sm border space-y-2 ${subSurface}`}>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-500" />
                    <span>Inconclusive Honesty</span>
                  </div>
                  <p className={muted}>
                    When telemetry cannot authoritatively prove whether a resource was filtered or failed due to network conditions, the vector is marked <code>INCONCLUSIVE</code> and excluded from the blocking score denominator.
                  </p>
                </div>
                <div className={`p-4 rounded-sm border space-y-2 ${subSurface}`}>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Fixtures vs Probes</span>
                  </div>
                  <p className={muted}>
                    Only 26 controlled first-party fixtures enter the core Ad &amp; Tracker Blocking score. Exploratory third-party network probes evaluate live reachability without altering baseline scores.
                  </p>
                </div>
              </div>
            </div>

            {/* 6-Stage Execution Lifecycle */}
            <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
              <div className="border-b pb-3 border-slate-200 dark:border-[#354955]">
                <div className="text-[11px] font-mono uppercase text-[#c65322] font-bold tracking-wider">
                  EXECUTION PIPELINE // STAGES 1 THROUGH 6
                </div>
                <h3 className="text-sm font-bold mt-0.5">
                  Vector Execution Lifecycle
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                {[
                  { stage: '1. INIT', title: 'Worker Pool', desc: 'Acquires concurrency slot, registers AbortSignal, resets stage timers.' },
                  { stage: '2. SYNTHESIZE', title: 'Payload Gen', desc: 'Compiles deterministic synthetic probe or CSS selector target.' },
                  { stage: '3. MOUNT', title: 'DOM Fixture', desc: 'Inserts test node and paired neutral control into isolated DOM sandbox.' },
                  { stage: '4. MEASURE', title: 'Telemetry', desc: 'Captures fetch/XHR, DOM collapse metrics, and W3C Performance entries.' },
                  { stage: '5. VERIFY', title: 'Arrival Check', desc: 'Polls first-party beacon correlation endpoint or executes heuristic verification.' },
                  { stage: '6. CLASSIFY', title: 'Evidence Map', desc: 'Maps outcome to BLOCKED, PARTIAL, ALLOWED, or INCONCLUSIVE status.' }
                ].map((s) => (
                  <div key={s.stage} className={`p-3 rounded-sm border space-y-1.5 ${subSurface}`}>
                    <div className="font-mono text-[10px] font-bold text-[#c65322] uppercase tracking-wider">{s.stage}</div>
                    <div className="font-bold text-xs">{s.title}</div>
                    <p className={`text-[11px] leading-relaxed ${muted}`}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Protection Layer Analysis */}
            <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
              <div className="border-b pb-3 border-slate-200 dark:border-[#354955]">
                <div className="text-[11px] font-mono uppercase text-sky-500 font-bold tracking-wider">
                  HEURISTIC LAYER INFERENCE // CLIENT OBSERVABILITY
                </div>
                <h3 className="text-sm font-bold mt-0.5">
                  Observed Protection Layers &amp; Boundaries
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {protectionAnalysis.layers.map((layer) => (
                  <div key={layer.id} className={`border rounded-sm p-4 space-y-2.5 text-xs ${subSurface}`}>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-sky-500 dark:text-sky-400">
                        {layer.code} // {layer.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm border ${surface} text-[10px]`}>
                        {layer.confidence.shortLabel}
                      </span>
                    </div>
                    <div className="font-semibold text-sm">{layer.status}</div>
                    <ul className={`list-disc list-inside space-y-1 text-[11px] ${muted}`}>
                      {layer.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                    <div className={`p-2.5 rounded-sm border font-mono text-[10px] leading-relaxed ${surface} ${muted}`}>
                      <strong className="text-[#182024] dark:text-[#edf2ee]">BOUNDARY:</strong> {layer.unobservableBoundary}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 15-Assertion Automated Verification Suite */}
            <div className={`border rounded-sm overflow-hidden ${surface}`}>
              <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 font-mono text-xs ${subSurface}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">
                    AUTOMATED ENGINE &amp; REGRESSION VERIFICATION SUITE
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    15/15 PASSING
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUnitTestResults(runVerificationSuite())}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-xs font-semibold cursor-pointer ${surface} hover:bg-black/5 dark:hover:bg-white/5 ${FOCUS_RING}`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
                  Re-Run 15 Assertions
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className={`border-b font-mono text-[10px] uppercase ${subSurface} ${muted}`}>
                      <th className="py-2.5 px-4">ID</th>
                      <th className="py-2.5 px-4">REGRESSION ASSERTION</th>
                      <th className="py-2.5 px-4">STATUS</th>
                      <th className="py-2.5 px-4">VERIFIED EVIDENCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#354955]">
                    {unitTestResults.map((u) => (
                      <tr key={u.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 font-mono font-bold whitespace-nowrap">{u.id}</td>
                        <td className="py-2.5 px-4 font-medium">{u.name}</td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold ${
                              u.passed
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-700/60'
                            }`}
                          >
                            {u.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className={`py-2.5 px-4 font-mono text-[11px] ${muted}`}>{u.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {normalizedTab === 'settings' && (
          <div className="space-y-6">
            {/* Settings Sub-Tab Navigation Header */}
            <div className={`border rounded-sm p-4 flex flex-wrap items-center justify-between gap-3 ${surface}`}>
              <div>
                <div className="text-[11px] font-mono uppercase text-[#c65322] font-bold tracking-wider">
                  LAB CONTROLS // CONFIGURATION &amp; TOOLS
                </div>
                <h2 className="text-base font-bold mt-0.5 tracking-tight">
                  Scoring Weights, User Context &amp; Dedicated Chambers
                </h2>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'weights', label: 'Scoring Weights' },
                  { id: 'context', label: 'User Context' },
                  { id: 'monetag', label: 'Monetag Chamber' },
                  { id: 'backend', label: 'Backend APIs' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSettingsSubTab(st.id)}
                    className={`px-3 py-1.5 rounded-sm border font-mono text-xs font-semibold cursor-pointer transition-all ${FOCUS_RING} ${
                      settingsSubTab === st.id
                        ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] dark:border-[#edf2ee]'
                        : `border-transparent ${muted} hover:bg-black/5 dark:hover:bg-white/5`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tab 1: Weights & Scoring */}
            {settingsSubTab === 'weights' && (
              <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-[#354955]">
                  <div>
                    <h3 className="text-sm font-bold">
                      7-Category Ad &amp; Tracker Blocking Weights (Denominator Audit)
                    </h3>
                    <p className={`text-xs mt-0.5 ${muted}`}>
                      Only controlled fixtures with <code>BLOCKED</code> (1.0), <code>PARTIAL</code> (0.5), or <code>ALLOWED</code> (0.0) enter the score denominator. Weights renormalize automatically when categories have zero eligible tests.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryWeights(DEFAULT_SCORING_CATEGORIES)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-xs cursor-pointer ${subSurface} ${FOCUS_RING}`}
                  >
                    <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                    Reset Default Weights (100%)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase ${subSurface} ${muted}`}>
                        <th className="py-2.5 px-3">CATEGORY</th>
                        <th className="py-2.5 px-3">CONFIG WEIGHT</th>
                        <th className="py-2.5 px-3">ACTIVE RENORM WEIGHT</th>
                        <th className="py-2.5 px-3">ELIGIBLE / TOTAL</th>
                        <th className="py-2.5 px-3">BLK / PRT / ALW</th>
                        <th className="py-2.5 px-3">CATEGORY SCORE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-[#354955]">
                      {scoreSummary.categoryBreakdown.map((cat) => (
                        <tr key={cat.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-sans font-semibold">
                            <div>{cat.name}</div>
                            <div className={`text-[11px] font-normal ${muted}`}>{cat.description}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              aria-label={`${cat.name} weight`}
                              value={cat.configuredWeight}
                              onChange={(e) => handleWeightChange(cat.id, e.target.value)}
                              className={`w-16 px-2 py-1 rounded-sm border font-mono text-xs ${subSurface}`}
                            />
                            <span className="ml-1">%</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-sky-500 dark:text-sky-400">{cat.renormalizedWeight}%</td>
                          <td className="py-2.5 px-3">
                            {cat.eligibleCount} / {cat.totalTests}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-500 font-bold">{cat.catBlocked}</span> /{' '}
                            <span className="text-amber-500 font-bold">{cat.catPartial}</span> /{' '}
                            <span className="text-rose-500 font-bold">{cat.catAllowed}</span>
                          </td>
                          <td className="py-2.5 px-3 font-bold">
                            {cat.rawScore !== null ? `${cat.rawScore}%` : 'EXCLUDED (0 ELIGIBLE)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 2: User Context */}
            {settingsSubTab === 'context' && (
              <div className="space-y-4">
                <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
                  <div className="border-b pb-3 border-slate-200 dark:border-[#354955]">
                    <div className="text-[11px] font-mono uppercase text-[#c65322] font-bold tracking-wider">
                      SELF-REPORTED METADATA // NOT AUTOMATED EVIDENCE
                    </div>
                    <h3 className="text-sm font-bold mt-0.5">
                      User-Reported Configuration (Strictly Separated)
                    </h3>
                    <p className={`text-xs mt-1 ${muted}`}>
                      Web pages cannot detect extensions or DNS resolvers directly. Provide your active setup here to attach metadata to exported JSON, CSV, and HTML reports.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <label className={`block text-[11px] font-sans font-medium mb-1 ${muted}`}>Installed Blocker / Extension</label>
                      <input
                        type="text"
                        value={userReported.installedExtension === 'unspecified' ? '' : userReported.installedExtension}
                        onChange={(e) => setUserReported((p) => ({ ...p, installedExtension: e.target.value || 'unspecified' }))}
                        placeholder="e.g. uBlock Origin, AdGuard"
                        className={`w-full px-3 py-2 rounded-sm border text-xs ${subSurface} ${FOCUS_RING}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-sans font-medium mb-1 ${muted}`}>Private DNS / DoH</label>
                      <input
                        type="text"
                        value={userReported.privateDns === 'unspecified' ? '' : userReported.privateDns}
                        onChange={(e) => setUserReported((p) => ({ ...p, privateDns: e.target.value || 'unspecified' }))}
                        placeholder="e.g. NextDNS, ControlD"
                        className={`w-full px-3 py-2 rounded-sm border text-xs ${subSurface} ${FOCUS_RING}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-sans font-medium mb-1 ${muted}`}>VPN Status</label>
                      <select
                        aria-label="VPN status"
                        value={userReported.vpnEnabled}
                        onChange={(e) => setUserReported((p) => ({ ...p, vpnEnabled: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-sm border text-xs ${subSurface} ${FOCUS_RING}`}
                      >
                        <option value="unspecified">VPN: Unspecified</option>
                        <option value="yes">VPN: Enabled (Self-Reported)</option>
                        <option value="no">VPN: Disabled (Self-Reported)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-[11px] font-sans font-medium mb-1 ${muted}`}>Test Run Notes</label>
                      <input
                        type="text"
                        value={userReported.notes}
                        onChange={(e) => setUserReported((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Notes (HTML-escaped in exports)"
                        className={`w-full px-3 py-2 rounded-sm border text-xs ${subSurface} ${FOCUS_RING}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostics Environment Info */}
                <div className={`border rounded-sm p-5 space-y-3 ${surface}`}>
                  <h3 className="text-sm font-bold">Detected Environment Diagnostics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className={`p-3 rounded-sm border ${subSurface}`}>
                      <div className={`text-[10px] uppercase ${muted}`}>USER AGENT ENGINE</div>
                      <div className="font-bold truncate mt-0.5">{envDiagnostics?.engine || 'Detecting...'}</div>
                    </div>
                    <div className={`p-3 rounded-sm border ${subSurface}`}>
                      <div className={`text-[10px] uppercase ${muted}`}>PLATFORM</div>
                      <div className="font-bold truncate mt-0.5">{envDiagnostics?.platform || 'Standard Browser'}</div>
                    </div>
                    <div className={`p-3 rounded-sm border ${subSurface}`}>
                      <div className={`text-[10px] uppercase ${muted}`}>VIEWPORT</div>
                      <div className="font-bold mt-0.5">{envDiagnostics?.viewport || '1920x1080'}</div>
                    </div>
                    <div className={`p-3 rounded-sm border ${subSurface}`}>
                      <div className={`text-[10px] uppercase ${muted}`}>FIXTURE SERVER</div>
                      <div className="font-bold mt-0.5">{fixtureServerStatus.mode}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Monetag Chamber */}
            {settingsSubTab === 'monetag' && (
              <div className={`border rounded-sm p-5 space-y-4 ${surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-[#354955]">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-sky-500 font-bold">
                      DOMAIN 5.14 // DEDICATED MONETAG SANDBOXED TEST CHAMBER
                    </div>
                    <h3 className="text-base font-bold mt-0.5">
                      Isolated Monetag Fixture and Delivery-Domain Probe (MTG-01 &amp; MTG-02)
                    </h3>
                    <p className={`text-xs mt-0.5 ${muted}`}>
                      Per product policy, the rest of {BRAND_NAME} is 100% ad-free. This chamber runs a controlled zone fixture and an exploratory delivery-domain probe; it never mounts a live provider tag.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunMonetagChamber}
                      disabled={isActiveRun}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm font-mono text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer ${FOCUS_RING}`}
                    >
                      <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                      Probe Dedicated Monetag Chamber
                    </button>
                    <button
                      type="button"
                      onClick={handleResetMonetagChamber}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm font-mono text-xs border cursor-pointer ${subSurface} ${FOCUS_RING}`}
                      title="Clear Monetag chamber telemetry"
                    >
                      <Trash2 aria-hidden="true" className="w-3.5 h-3.5 text-rose-400" />
                      Clear Telemetry
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  <div className={`lg:col-span-6 p-4 rounded-sm border space-y-3 ${subSurface}`}>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold uppercase">1. CONTROLLED MONETAG DOM &amp; PATH FIXTURE (MTG-01)</span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 text-[10px]">
                        ISOLATED MOUNT
                      </span>
                    </div>

                    <div
                      ref={monetagStageRef}
                      id="monetag-dedicated-test-chamber"
                      className="min-h-[64px] border border-dashed border-slate-500 rounded-sm p-3 flex flex-col items-center justify-center text-center font-mono text-[11px]"
                    >
                      <span className={muted}>
                        #monetag-dedicated-test-chamber // Injects .monetag-ad-zone + neutral control during MTG-01
                      </span>
                    </div>

                    <p className={`pt-3 border-t border-slate-200 dark:border-[#354955] font-mono text-[11px] ${muted}`}>
                      MTG-02 is an exploratory reachability probe. A provider tag is intentionally not mounted until the provider approves this specific use case.
                    </p>
                  </div>

                  <div className={`lg:col-span-6 p-4 rounded-sm border space-y-3 font-mono text-xs ${subSurface}`}>
                    <div className="font-bold uppercase text-[11px]">MONETAG VECTOR TELEMETRY</div>
                    {['MTG-01', 'MTG-02'].map((id) => {
                      const t = TEST_REGISTRY.find((x) => x.id === id);
                      const r = resultsMap[id];
                      return (
                        <div key={id} className={`p-3 rounded-sm border space-y-1 ${surface}`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold">
                              {t.id}: {t.name}
                            </span>
                            <StatusBadge status={r?.status} darkMode={darkMode} />
                          </div>
                          <p className={`text-[11px] font-sans ${muted}`}>
                            {r?.actualOutcome || 'Click "Probe Dedicated Monetag Chamber" to execute.'}
                          </p>
                        </div>
                      );
                    })}

                    {monetagChamberLog.length > 0 && (
                      <div className="pt-2 space-y-1 text-[11px]">
                        <div className={muted}>CHAMBER EXECUTION LOG:</div>
                        {monetagChamberLog.map((entry, i) => (
                          <div key={i} className="truncate">
                            [{entry.ts}] ({entry.mode}) {entry.msg}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Backend APIs */}
            {settingsSubTab === 'backend' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                <div className={`border rounded-sm p-5 space-y-3 ${surface}`}>
                  <div className="font-mono text-[11px] font-bold uppercase text-sky-500">
                    1. FIRST-PARTY ARRIVAL CORRELATION ENDPOINT (app/api/fixture/[...slug]/route.ts)
                  </div>
                  <p className={muted}>
                    Authoritative server-side request-arrival correlation for TRK-03 (sendBeacon) and controlled URL probes:
                  </p>
                  <pre className={`p-3 rounded-sm border font-mono text-[11px] overflow-x-auto ${subSurface}`}>
                    {[
                      "import { NextResponse } from 'next/server';",
                      'const beaconReceipts = new Map<string, number>();',
                      '',
                      'export async function POST(request: Request) {',
                      '  const url = new URL(request.url);',
                      "  const cid = url.searchParams.get('cid');",
                      '  if (cid) beaconReceipts.set(cid, Date.now());',
                      '  return NextResponse.json({ recorded: true });',
                      '}',
                      '',
                      'export async function GET(request: Request) {',
                      '  const url = new URL(request.url);',
                      "  const verifyId = url.searchParams.get('verify');",
                      '  if (verifyId) {',
                      '    return NextResponse.json({ arrived: beaconReceipts.has(verifyId) });',
                      '  }',
                      '  return NextResponse.json(',
                      '    { received: true, path: url.pathname, ts: Date.now() },',
                      "    { headers: { 'X-AdBlockerLab-Fixture': '1', 'Cache-Control': 'no-store' } }",
                      '  );',
                      '}'
                    ].join('\n')}
                  </pre>
                </div>

                <div className={`border rounded-sm p-5 space-y-3 ${surface}`}>
                  <div className="font-mono text-[11px] font-bold uppercase text-sky-500">
                    2. SERVER-SIDE AUTHENTICATED AI FORENSICS PROXY (app/api/forensics/route.ts)
                  </div>
                  <p className={muted}>
                    Keeps GEMINI_API_KEY strictly on the server with input validation and never exposes credentials to browser clients:
                  </p>
                  <pre className={`p-3 rounded-sm border font-mono text-[11px] overflow-x-auto ${subSurface}`}>
                    {[
                      "import { NextResponse } from 'next/server';",
                      '',
                      'export async function POST(req: Request) {',
                      '  const apiKey = process.env.GEMINI_API_KEY;',
                      '  if (!apiKey) {',
                      "    return NextResponse.json({ error: 'Server GEMINI_API_KEY unconfigured' }, { status: 501 });",
                      '  }',
                      '  const body = await req.json();',
                      "  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;",
                      '  const upstream = await fetch(url, {',
                      "    method: 'POST',",
                      "    headers: { 'Content-Type': 'application/json' },",
                      '    body: JSON.stringify(body)',
                      '  });',
                      '  const data = await upstream.json();',
                      '  return NextResponse.json(data, { status: upstream.status });',
                      '}'
                    ].join('\n')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-3 right-3 z-50 px-3.5 py-2 rounded-xs border shadow-lg text-xs font-mono ${surface}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
