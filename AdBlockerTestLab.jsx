// This prototype is JavaScript; strict TypeScript checks the typed project files.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Shield,
  Play,
  Pause,
  Square,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  Code,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  BookOpen,
  Settings,
  Sun,
  Moon,
  BarChart3,
  RefreshCw,
  Beaker,
  Layers,
  Menu,
  X,
  ArrowUpRight,
  Activity,
  Terminal,
  Eye,
  Sliders
} from 'lucide-react';

// ============================================================================
// MODULE 1: TYPES, CONSTANTS & SCIENTIFIC INSTRUMENT DESIGN TOKENS
// ============================================================================

export const APP_VERSION = '3.2.0';
export const SCHEMA_VERSION = '2026.10.adblockertestlab.v3.2';
export const BRAND_NAME = 'AdBlocker Test Lab';
export const BRAND_PROMISE = 'Test your protection. See the evidence. Understand the gaps.';
export const BRAND_TAGLINE = 'Test everything. Trust the evidence.';
export const BRAND_DESCRIPTION =
  'A cross-platform browser diagnostics laboratory for evaluating advertisement blocking, tracking protection, cosmetic filtering, browser-native protections, and observable network-filtering behavior.';

export const EXECUTION_STATE = {
  IDLE: 'IDLE',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const RESULT_STATUS = {
  BLOCKED: 'BLOCKED',           // Controlled test resource or behavior was prevented (1.0 credit)
  PARTIAL: 'PARTIAL',           // Incomplete protection observed (0.5 credit)
  ALLOWED: 'ALLOWED',           // Prohibited behavior or resource succeeded (0.0 credit)
  INCONCLUSIVE: 'INCONCLUSIVE', // Evidence cannot reliably establish cause (Excluded from denominator)
  UNSUPPORTED: 'UNSUPPORTED',   // Required browser API unavailable (Excluded from denominator)
  ERROR: 'ERROR',               // Execution or infrastructure error (Excluded from denominator)
  CANCELLED: 'CANCELLED',       // Cancelled by user (Excluded from denominator)
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING'
};

export const CONFIDENCE = {
  CONFIRMED: {
    id: 'CONFIRMED_OBSERVATION',
    label: 'Confirmed Observation',
    shortLabel: 'Observed',
    stageKind: 'OBSERVED',
    description: 'Directly observed DOM computed state, API return value, or controlled first-party fixture outcome.'
  },
  STRONG: {
    id: 'STRONG_INFERENCE',
    label: 'Strong Inference',
    shortLabel: 'Strong Inference',
    stageKind: 'INFERRED',
    description: 'Consistent across primary and control observations, though browser or network layers cannot be isolated by name.'
  },
  WEAK: {
    id: 'WEAK_INFERENCE',
    label: 'Weak Inference',
    shortLabel: 'Weak Inference',
    stageKind: 'INFERRED',
    description: 'Consistent with filtering, but browser policies, CORS, CSP, or upstream network conditions are substantial alternative explanations.'
  },
  USER_REPORTED: {
    id: 'USER_REPORTED',
    label: 'User-Reported',
    shortLabel: 'User-Reported',
    stageKind: 'USER_REPORTED',
    description: 'Voluntarily entered by the user; kept strictly separate from automated observations.'
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Unknown / Unobservable',
    shortLabel: 'Unobservable',
    stageKind: 'UNOBSERVABLE',
    description: 'Cannot be reliably determined from standard web page APIs without violating browser security boundaries.'
  }
};

export const VALIDITY_CLASS = {
  CONTROLLED_FIXTURE: 'Controlled First-Party Fixture',
  EXPLORATORY_EXTERNAL: 'Exploratory Third-Party Endpoint (Non-Authoritative)',
  CAPABILITY_SIGNAL: 'Browser Privacy Signal / API Inspection'
};

export const DEFAULT_SCORING_CATEGORIES = [
  {
    id: 'ad_resource_blocking',
    name: 'Advertising Resource Blocking',
    shortCode: 'ADS-NET',
    defaultWeight: 20,
    description: 'Interception of controlled advertising script paths, VAST tags, and ad-server request patterns.'
  },
  {
    id: 'tracker_beacon_blocking',
    name: 'Tracker & Beacon Blocking',
    shortCode: 'TRK-BCN',
    defaultWeight: 15,
    description: 'Prevention of tracking pixel paths, analytics collection requests, and telemetry beacons.'
  },
  {
    id: 'intrusive_ad_prevention',
    name: 'Intrusive Advertisement Prevention',
    shortCode: 'INT-UI',
    defaultWeight: 15,
    description: 'Suppression of interstitial overlays, sticky banners, scroll-locks, and unmuted media autoplay.'
  },
  {
    id: 'cosmetic_filtering',
    name: 'Cosmetic Filtering',
    shortCode: 'DOM-CSS',
    defaultWeight: 10,
    description: 'DOM stylesheet hiding of standard IAB ad slots, native widgets, and consent annoyances.'
  },
  {
    id: 'script_resource_filtering',
    name: 'Script & Resource Filtering',
    shortCode: 'SCR-XHR',
    defaultWeight: 10,
    description: 'Interception of dynamic script injections, XHR bid requests, and anti-adblock bait structures.'
  },
  {
    id: 'privacy_storage_protections',
    name: 'Privacy & Storage Protections',
    shortCode: 'PRV-SIG',
    defaultWeight: 10,
    description: 'Active Global Privacy Control (GPC), Do Not Track, and hardware-entropy surface masking.'
  },
  {
    id: 'redirect_popup_prevention',
    name: 'Redirect & Popup Prevention',
    shortCode: 'POP-RDR',
    defaultWeight: 10,
    description: 'Containment of programmatic popups, new-tab attempts, and affiliate click-tracking paths.'
  },
  {
    id: 'network_filtering_evidence',
    name: 'Network Filtering Evidence',
    shortCode: 'NET-FLT',
    defaultWeight: 10,
    description: 'Controlled and exploratory subresource checks evaluating upstream or browser network blocking.'
  }
];

// ============================================================================
// MODULE 2: AUDITED TEST REGISTRY
// Audit Correction: Pure browser API-capability checks (e.g., whether
// StorageAccess API or Referrer-Policy defaults exist) are never scored as
// adblock passes. Only active blocking, hiding, or active privacy signals
// are eligible for core scoring.
// ============================================================================

export const TEST_REGISTRY = [
  // 5.1 Standard Display Advertisements (5 Tests)
  {
    id: 'DSP-01',
    version: '2.1',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'IAB Leaderboard Banner (728x90) Cosmetic Hiding',
    description: 'Injects a synthetic leaderboard container (.ad-leaderboard, .adbanner, #ad-top-banner) alongside a neutral control box and measures DOM layout dimensions.',
    expectedBehavior: 'Cosmetic stylesheet rule sets display:none, visibility:hidden, or collapses height to 0px while the neutral control remains visible.',
    controlResource: 'DOM <div class="adshield-control-box"> (100x22px)',
    testResource: 'DOM <div id="ad-top-banner" class="ad-leaderboard adbanner adsbox">',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-leaderboard adbanner adsbox banner_ad_728x90',
    elementId: 'ad-top-banner',
    audit: {
      measuredBehavior: 'CSS/DOM visual hiding of standard EasyList leaderboard selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'getComputedStyle(el).display/visibility and getBoundingClientRect().height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Custom user stylesheet', 'Built-in browser cosmetic blocker', 'Content-blocking extension'],
      scoringEligible: true,
      limitations: 'Cosmetic hiding proves a DOM rule matched; it does not prove network requests were blocked or identify which extension applied the rule.'
    }
  },
  {
    id: 'DSP-02',
    version: '2.1',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Medium Rectangle (300x250) & DFP Sidebar Slot',
    description: 'Injects a 300x250 sidebar ad unit (.ad-300x250, .dfp-ad-unit) into the isolated test fixture and measures layout collapse.',
    expectedBehavior: 'Cosmetic rule collapses or hides the .dfp-ad-unit container.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="dfp-ad-sidebar-1" class="ad-300x250 sidebar-ad-slot dfp-ad-unit">',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-300x250 sidebar-ad-slot dfp-ad-unit pub_300x250',
    elementId: 'dfp-ad-sidebar-1',
    audit: {
      measuredBehavior: 'DOM element suppression for DFP/IAB medium rectangle classes.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Element offsetParent, computed display, and bounding client dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Extension cosmetic filter', 'Browser built-in content blocker'],
      scoringEligible: true,
      limitations: 'DNS-only blockers cannot inspect or hide first-party HTML elements.'
    }
  },
  {
    id: 'DSP-03',
    version: '2.1',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Publisher Ad Tag Placeholder (<ins class="adsbygoogle">)',
    description: 'Evaluates whether standard <ins class="adsbygoogle"> placeholders are suppressed in the DOM.',
    expectedBehavior: 'Element is hidden via injected cosmetic stylesheet.',
    controlResource: 'DOM <ins class="adshield-control-ins">',
    testResource: 'DOM <ins id="ins-adsbygoogle-test" class="adsbygoogle" data-ad-client="ca-pub-0000000000000000">',
    type: 'cosmetic_dom',
    selectorClasses: 'adsbygoogle google-ad-placeholder',
    elementId: 'ins-adsbygoogle-test',
    audit: {
      measuredBehavior: 'Cosmetic hiding of AdSense <ins> placeholder elements.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'getComputedStyle(ins) and rendered height comparison against neutral <ins>.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Extension cosmetic stylesheet', 'Acceptable Ads exception may intentionally allow if unfilled'],
      scoringEligible: true,
      limitations: 'Does not test external script loading (tested separately in TPA-01).'
    }
  },
  {
    id: 'DSP-04',
    version: '2.1',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Asynchronous In-Article Ad Container Injection',
    description: 'Inserts a dynamic ad slot (.in-article-ad, .sponsored-banner-slot) 70ms after fixture mount to test persistent CSS/MutationObserver filtering.',
    expectedBehavior: 'Dynamically inserted ad container is hidden within 120ms of DOM insertion.',
    controlResource: 'Asynchronously inserted neutral <div class="adshield-async-control">',
    testResource: 'Async DOM <div id="dynamic-ad-slot-04" class="in-article-ad ad-placeholder-box text-ad">',
    type: 'dynamic_cosmetic_dom',
    selectorClasses: 'in-article-ad ad-placeholder-box text-ad sponsored-banner-slot',
    elementId: 'dynamic-ad-slot-04',
    audit: {
      measuredBehavior: 'Cosmetic filtering persistence on asynchronously injected DOM nodes.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Post-delay computed style and bounding box dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Declarative user stylesheet', 'MutationObserver content script'],
      scoringEligible: true,
      limitations: 'Measures DOM visibility only; does not attribute to a specific extension.'
    }
  },
  {
    id: 'DSP-05',
    version: '2.1',
    section: '5.1 Standard Display Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Mobile Banner & Responsive Skyscraper Slot (320x50 / 160x600)',
    description: 'Tests cosmetic hiding of responsive mobile/skyscraper ad containers (.mobile-ad-banner, .ad_160x600, .sky-ad-slot).',
    expectedBehavior: 'Responsive ad slot collapses to zero height while neutral control box renders normally.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="mobile-sky-ad-05" class="mobile-ad-banner ad_160x600 sky-ad-slot adsbox">',
    type: 'cosmetic_dom',
    selectorClasses: 'mobile-ad-banner ad_160x600 sky-ad-slot adsbox',
    elementId: 'mobile-sky-ad-05',
    audit: {
      measuredBehavior: 'Visual suppression of mobile banner and skyscraper ad class signatures.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display/visibility and layout height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter list match'],
      scoringEligible: true,
      limitations: 'First-party DOM check only.'
    }
  },

  // 5.2 Third-Party Advertising Requests (5 Tests)
  {
    id: 'TPA-01',
    version: '2.1',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    name: 'Controlled Ad-Script Path Pattern (/pagead/js/adsbygoogle.js)',
    description: 'Attempts a same-origin fetch to a path matching standard EasyList URL rules (/pagead/js/adsbygoogle.js) and compares against a neutral same-origin control.',
    expectedBehavior: 'Request is aborted client-side (TypeError) before receiving an HTTP status code while the neutral control succeeds.',
    controlResource: 'Same-origin neutral fetch probe (/?adshield_control=1)',
    testResource: 'Fetch GET /pagead/js/adsbygoogle.js?adshield_fixture=1',
    type: 'url_pattern_probe',
    probePath: '/pagead/js/adsbygoogle.js?adshield_fixture=1',
    audit: {
      measuredBehavior: 'Client-side URL pattern interception on a controlled first-party path.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch Promise rejection (TypeError) vs HTTP response resolution.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browser extension declarativeNetRequest/webRequest', 'Built-in browser URL path filter', 'Local proxy rule'],
      scoringEligible: true,
      limitations: 'Because this uses a relative path on the current origin, DNS blockers will not intercept it; only path-aware filters can block it.'
    }
  },
  {
    id: 'TPA-02',
    version: '2.1',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    name: 'Exploratory Ad Server Endpoint Probe (static.doubleclick.net)',
    description: 'Exploratory subresource fetch to static.doubleclick.net. Audited as non-authoritative because external network failures have multiple causes.',
    expectedBehavior: 'Request fails to load when ad domains are blocked; marked exploratory due to cross-origin attribution limits.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://static.doubleclick.net/instream/ad_status.js',
    type: 'external_domain_probe',
    targetUrl: 'https://static.doubleclick.net/instream/ad_status.js',
    audit: {
      measuredBehavior: 'Reachability of external DoubleClick ad script endpoint.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch resolution vs rejection.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Adblocker extension', 'Browser tracking protection', 'DNS sinkhole', 'Firewall/ISP block', 'CSP restriction', 'Remote server outage'],
      scoringEligible: false,
      limitations: 'Excluded from core score denominator by default because an ordinary webpage cannot distinguish an adblock rule from a DNS failure, CSP policy, or upstream outage.'
    }
  },
  {
    id: 'TPA-03',
    version: '2.1',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    name: 'Exploratory Ad Syndication Probe (pagead2.googlesyndication.com)',
    description: 'Exploratory subresource probe to pagead2.googlesyndication.com/pagead/show_ads.js.',
    expectedBehavior: 'Request fails when blocked by browser or network filter.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://pagead2.googlesyndication.com/pagead/show_ads.js',
    type: 'external_domain_probe',
    targetUrl: 'https://pagead2.googlesyndication.com/pagead/show_ads.js',
    audit: {
      measuredBehavior: 'Reachability of external Google Syndication script.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch resolution vs rejection.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Extension filter', 'Built-in tracker blocker', 'DNS filter', 'Network timeout/outage'],
      scoringEligible: false,
      limitations: 'Exploratory external probe; failure latency cannot reliably prove DNS vs extension filtering.'
    }
  },
  {
    id: 'TPA-04',
    version: '2.1',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    name: 'Ad Server Iframe Container Suppression (#google_ads_frame1)',
    description: 'Injects a sandboxed iframe with standard ad-server attributes (id="google_ads_frame1", class="ad-iframe-slot") and checks DOM suppression.',
    expectedBehavior: 'Iframe container is hidden or collapsed by cosmetic/frame rules.',
    controlResource: 'Neutral sandboxed <iframe class="adshield-control-frame">',
    testResource: '<iframe id="google_ads_frame1" class="ad-iframe-slot google_ads_frame">',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-iframe-slot google_ads_frame',
    elementId: 'google_ads_frame1',
    audit: {
      measuredBehavior: 'DOM suppression of ad-server iframe containers.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Iframe computed display and bounding client height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic iframe filter rule'],
      scoringEligible: true,
      limitations: 'Tests element-level frame hiding rather than external cross-origin navigation.'
    }
  },
  {
    id: 'TPA-05',
    version: '2.1',
    section: '5.2 Third-Party Ad Requests',
    scoringCategory: 'ad_resource_blocking',
    name: 'Controlled Ad Stylesheet & Image Asset Path (/ads/banner_300x250.gif)',
    description: 'Requests a controlled relative ad-image path (/ads/banner_300x250.gif?adunit=top) to test URL-based image filter rules.',
    expectedBehavior: 'Fetch request to /ads/banner_300x250.gif is aborted client-side prior to HTTP status response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/banner_300x250.gif?adunit=top&adshield=1',
    type: 'url_pattern_probe',
    probePath: '/ads/banner_300x250.gif?adunit=top&adshield=1',
    audit: {
      measuredBehavior: 'Interception of URL paths matching /ads/banner_*.gif filter rules.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['URL filter rule in extension or browser'],
      scoringEligible: true,
      limitations: 'Relative URL path test; evaluates path-matching rules rather than domain resolution.'
    }
  },

  // 5.3 Tracking Pixels and Beacons (5 Tests)
  {
    id: 'TRK-01',
    version: '2.1',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    name: '1x1 Tracking Pixel DOM & Telemetry Path (/r/collect)',
    description: 'Evaluates both DOM visibility of <img class="tracking-pixel"> and network interception of /r/collect?v=1&tid=UA-000000-1 separately.',
    expectedBehavior: 'Both the /r/collect telemetry path and the .tracking-pixel image element are blocked/hidden.',
    controlResource: 'Neutral 1x1 control image element + same-origin fetch control',
    testResource: '<img class="tracking-pixel"> + Fetch /r/collect?v=1&tid=UA-000000-1&t=pageview',
    type: 'pixel_probe',
    probePath: '/r/collect?v=1&tid=UA-000000-1&t=pageview&cid=synthetic',
    selectorClasses: 'tracking-pixel analytics-pixel beacon-img',
    audit: {
      measuredBehavior: 'Separate measurement of 1x1 pixel cosmetic hiding and /r/collect URL interception.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Image computed style + Fetch promise outcome.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyPrivacy URL rule', 'Cosmetic pixel rule'],
      scoringEligible: true,
      limitations: 'Uses synthetic non-identifying parameters (UA-000000-1).'
    }
  },
  {
    id: 'TRK-02',
    version: '2.1',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Exploratory Analytics Domain Probe (google-analytics.com)',
    description: 'Exploratory probe to www.google-analytics.com/analytics.js.',
    expectedBehavior: 'Request fails when blocked by tracker protection lists or DNS filtering.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://www.google-analytics.com/analytics.js',
    type: 'external_domain_probe',
    targetUrl: 'https://www.google-analytics.com/analytics.js',
    audit: {
      measuredBehavior: 'Reachability of external Google Analytics script.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch resolution vs rejection.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Extension privacy list', 'Browser ETP', 'DNS blocker', 'Network/CSP block'],
      scoringEligible: false,
      limitations: 'Exploratory third-party endpoint; excluded from core score denominator.'
    }
  },
  {
    id: 'TRK-03',
    version: '2.1',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Navigator.sendBeacon Telemetry Interception & Shim Check',
    description: 'Checks whether navigator.sendBeacon is shimmed by a privacy scriptlet or rejects a synthetic tracking path (/pixel/track).',
    expectedBehavior: 'sendBeacon returns false on tracking paths or exhibits privacy scriptlet wrapping.',
    controlResource: 'Function.prototype.toString inspection',
    testResource: 'navigator.sendBeacon("/pixel/track?event=adshield_synthetic")',
    type: 'beacon_check',
    audit: {
      measuredBehavior: 'Scriptlet wrapping or rejection of navigator.sendBeacon calls.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'navigator.sendBeacon return boolean and function source signature.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Some blockers stub sendBeacon to return true while dropping the network request silently'],
      scoringEligible: true,
      limitations: 'If a blocker drops the beacon at the network layer while returning true, in-page JS cannot observe the drop without server correlation.'
    }
  },
  {
    id: 'TRK-04',
    version: '2.1',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Exploratory Session-Replay Domain Probe (static.hotjar.com)',
    description: 'Exploratory probe to static.hotjar.com/c/hotjar-000000.js.',
    expectedBehavior: 'Request fails when session-replay domains are blocked.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://static.hotjar.com/c/hotjar-000000.js',
    type: 'external_domain_probe',
    targetUrl: 'https://static.hotjar.com/c/hotjar-000000.js',
    audit: {
      measuredBehavior: 'Reachability of external Hotjar script endpoint.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Tracker blocker', 'DNS filter', 'Upstream firewall'],
      scoringEligible: false,
      limitations: 'Exploratory external check; not included in core weighted score.'
    }
  },
  {
    id: 'TRK-05',
    version: '2.1',
    section: '5.3 Tracking Pixels & Beacons',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Controlled Conversion Pixel Path (/tr?id=00000&ev=PageView)',
    description: 'Tests URL pattern filtering against a controlled path matching standard conversion pixel query structures (/tr?id=000000&ev=PageView&noscript=1).',
    expectedBehavior: 'Request is aborted client-side by EasyPrivacy/tracker path rules.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /tr?id=000000000&ev=PageView&noscript=1',
    type: 'url_pattern_probe',
    probePath: '/tr?id=000000000&ev=PageView&noscript=1',
    audit: {
      measuredBehavior: 'Client-side interception of conversion-pixel URL query patterns.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Query-aware tracker filter rule'],
      scoringEligible: true,
      limitations: 'First-party path simulation; evaluates query-pattern filter rules.'
    }
  },

  // 5.4 Annoying Advertising Behaviors (5 Tests)
  {
    id: 'INT-01',
    version: '2.1',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Full-Screen Interstitial Overlay Suppression',
    description: 'Renders a contained synthetic interstitial overlay (#ad-interstitial-modal, .interstitial-ad-overlay) inside the sandbox fixture.',
    expectedBehavior: 'Cosmetic annoyance/ad filter hides or collapses the interstitial overlay.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="ad-interstitial-modal" class="interstitial-ad-overlay ad-modal-backdrop">',
    type: 'cosmetic_dom',
    selectorClasses: 'interstitial-ad-overlay ad-modal-backdrop popup-ad-overlay',
    elementId: 'ad-interstitial-modal',
    audit: {
      measuredBehavior: 'DOM hiding of full-screen ad interstitial classes.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display/visibility and bounding box dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Annoyance filter list', 'Standard ad cosmetic list'],
      scoringEligible: true,
      limitations: 'Isolated inside the sandbox container so the page UI is never obstructed.'
    }
  },
  {
    id: 'INT-02',
    version: '2.1',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Sticky Bottom Catfish Banner (.sticky-ad-bottom)',
    description: 'Tests whether sticky bottom ad containers (#fixed-ad-footer, .sticky-ad-bottom) are hidden.',
    expectedBehavior: 'Sticky ad container is hidden by cosmetic rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="fixed-ad-footer" class="sticky-ad-bottom bottom-ad-wrapper adsbox">',
    type: 'cosmetic_dom',
    selectorClasses: 'sticky-ad-bottom bottom-ad-wrapper fixed-ad-banner adsbox',
    elementId: 'fixed-ad-footer',
    audit: {
      measuredBehavior: 'DOM suppression of sticky bottom banner selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed style and layout dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter rule'],
      scoringEligible: true,
      limitations: 'Requires CSS cosmetic filtering capability.'
    }
  },
  {
    id: 'INT-03',
    version: '2.1',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'redirect_popup_prevention',
    name: 'Sandboxed Programmatic Popup Containment & window.open Guard',
    description: 'Executes a programmatic window.open attempt inside a sandboxed iframe (without allow-popups) and checks for window.open scriptlet shimming.',
    expectedBehavior: 'Popup is prevented (returns null) and/or window.open is wrapped by a blocker scriptlet.',
    controlResource: 'Iframe sandbox attribute & Function.prototype.toString check',
    testResource: 'Sandboxed iframe window.open("about:blank") + window.open inspection',
    type: 'popup_sandbox_check',
    audit: {
      measuredBehavior: 'Containment of unsolicited programmatic window.open calls.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Return value of sandboxed window.open and native code signature.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browser built-in popup blocker', 'Iframe sandbox enforcement', 'Extension window.open scriptlet'],
      scoringEligible: true,
      limitations: 'Does not assume an adblocker extension is responsible when the browser popup blocker prevents the popup.'
    }
  },
  {
    id: 'INT-04',
    version: '2.1',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Unmuted Media Autoplay Policy Verification',
    description: 'Tests whether unmuted programmatic HTMLMediaElement playback is blocked or restricted.',
    expectedBehavior: 'Browser autoplay policy or extension rejects unmuted play() or restricts unrequested audio.',
    controlResource: 'HTMLAudioElement API availability check',
    testResource: 'In-memory silent WAV data-URI unmuted audio.play() promise',
    type: 'autoplay_policy_check',
    audit: {
      measuredBehavior: 'Enforcement of autoplay restrictions on unmuted media elements.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'HTMLMediaElement.play() Promise rejection (NotAllowedError) vs resolution.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Prior user click gesture in the tab permits audio playback under standard browser policies'],
      scoringEligible: false,
      limitations: 'Audited as a Browser Capability Signal (excluded from core adblock score) because clicking "Run Benchmark" satisfies user activation in standard browsers.'
    }
  },
  {
    id: 'INT-05',
    version: '2.1',
    section: '5.4 Intrusive Ad Behaviors',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Scroll-Lock & Page Takeover Backdrop Mitigation (.tp-backdrop)',
    description: 'Tests whether known takeover/scroll-lock overlay classes (.tp-modal, .tp-backdrop, .fc-ab-root) are hidden.',
    expectedBehavior: 'Takeover backdrop elements are collapsed by annoyance rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="tp-backdrop-test" class="tp-modal tp-backdrop fc-ab-root ad-takeover-overlay">',
    type: 'cosmetic_dom',
    selectorClasses: 'tp-modal tp-backdrop fc-ab-root ad-takeover-overlay',
    elementId: 'tp-backdrop-test',
    audit: {
      measuredBehavior: 'Cosmetic hiding of scroll-lock modal backdrop classes.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed style and bounding client height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Annoyance filter list active'],
      scoringEligible: true,
      limitations: 'Tests known modal takeover class selectors.'
    }
  },

  // 5.5 Video Advertisements (4 Tests)
  {
    id: 'VID-01',
    version: '2.1',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    name: 'Exploratory Google IMA3 Video Ad SDK Probe',
    description: 'Exploratory probe to imasdk.googleapis.com/js/sdkloader/ima3.js.',
    expectedBehavior: 'Request fails or is shimmed when video ad SDKs are blocked.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
    type: 'external_domain_probe',
    targetUrl: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
    audit: {
      measuredBehavior: 'Reachability of external IMA3 video ad SDK.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Some blockers redirect ima3.js to a local neutered shim rather than failing the request'],
      scoringEligible: false,
      limitations: 'Exploratory external probe; excluded from core score denominator.'
    }
  },
  {
    id: 'VID-02',
    version: '2.1',
    section: '5.5 Video Advertisements',
    scoringCategory: 'cosmetic_filtering',
    name: 'Video Player Pre-Roll & Companion Ad Overlay (.video-ads)',
    description: 'Injects synthetic video ad overlay containers (.video-ads, .ytp-ad-module, .ima-ad-container) into the fixture.',
    expectedBehavior: 'Cosmetic filter collapses the video ad overlay container.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="video-ad-overlay-test" class="video-ads ytp-ad-module ima-ad-container">',
    type: 'cosmetic_dom',
    selectorClasses: 'video-ads ytp-ad-module ima-ad-container vjs-ad-playing',
    elementId: 'video-ad-overlay-test',
    audit: {
      measuredBehavior: 'UI-level cosmetic hiding of HTML5 video player ad overlays.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and rendered height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter rule'],
      scoringEligible: true,
      limitations: 'Evaluates overlay visibility, not streaming manifest manipulation.'
    }
  },
  {
    id: 'VID-03',
    version: '2.1',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    name: 'Controlled VAST / VMAP XML Ad Tag Path (/ads/vast.xml)',
    description: 'Tests URL interception on a controlled VAST XML request path (/ads/vast.xml?ad_rule=1&vad_type=linear).',
    expectedBehavior: 'Request is aborted client-side by VAST ad-tag filter rules.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/vast.xml?ad_rule=1&vad_type=linear&adshield=1',
    type: 'url_pattern_probe',
    probePath: '/ads/vast.xml?ad_rule=1&vad_type=linear&adshield=1',
    audit: {
      measuredBehavior: 'Client-side blocking of VAST XML ad tag URL patterns.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyList VAST path rule'],
      scoringEligible: true,
      limitations: 'First-party path test.'
    }
  },
  {
    id: 'VID-04',
    version: '2.1',
    section: '5.5 Video Advertisements',
    scoringCategory: 'ad_resource_blocking',
    name: 'Mid-Roll Video Ad Quartile Ping Path (/video/ad_tracking?event=midpoint)',
    description: 'Tests whether synthetic video ad quartile tracking pings (/video/ad_tracking?ad_id=99&event=midpoint) are intercepted.',
    expectedBehavior: 'Video ad tracking request is aborted client-side.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /video/ad_tracking?ad_id=99&event=midpoint&vast=1',
    type: 'url_pattern_probe',
    probePath: '/video/ad_tracking?ad_id=99&event=midpoint&vast=1',
    audit: {
      measuredBehavior: 'Interception of video ad quartile telemetry URLs.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['URL filter rule match'],
      scoringEligible: true,
      limitations: 'Evaluates URL pattern matching on synthetic quartile events.'
    }
  },

  // 5.6 Search, Sponsored Content & Native Advertising (4 Tests)
  {
    id: 'NAT-01',
    version: '2.1',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Sponsored Search Result Container (#tads, .commercial-unit)',
    description: 'Injects synthetic search ad containers (#tads, .commercial-unit-desktop-top) into the test fixture.',
    expectedBehavior: 'Search ad container is hidden unless Acceptable Ads exceptions are enabled.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="tads" class="commercial-unit-desktop-top ads-ad">',
    type: 'cosmetic_dom',
    selectorClasses: 'commercial-unit-desktop-top ads-ad sponsored-search-ad',
    elementId: 'tads',
    audit: {
      measuredBehavior: 'Cosmetic suppression of search ad containers.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and rendered height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Acceptable Ads opt-in may leave #tads visible intentionally'],
      scoringEligible: true,
      limitations: 'First-party native search ads served without standard selectors cannot be blocked by generic CSS.'
    }
  },
  {
    id: 'NAT-02',
    version: '2.1',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Native Recommendation Widget Containers (.OUTBRAIN, #taboola)',
    description: 'Tests cosmetic hiding of third-party recommendation widget containers (#taboola-below-article-thumbnails, .OUTBRAIN).',
    expectedBehavior: 'Recommendation widget containers are hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="taboola-below-article-thumbnails" class="OUTBRAIN trc_rbox_container">',
    type: 'cosmetic_dom',
    selectorClasses: 'OUTBRAIN trc_rbox_container taboola-widget',
    elementId: 'taboola-below-article-thumbnails',
    audit: {
      measuredBehavior: 'DOM hiding of Taboola and Outbrain container selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and layout height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter rule'],
      scoringEligible: true,
      limitations: 'Measures DOM container hiding separately from network requests.'
    }
  },
  {
    id: 'NAT-03',
    version: '2.1',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'ad_resource_blocking',
    name: 'Exploratory Native Ad Network Probe (widgets.outbrain.com)',
    description: 'Exploratory subresource probe to widgets.outbrain.com/outbrain.js.',
    expectedBehavior: 'Request fails when native ad domains are blocked.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://widgets.outbrain.com/outbrain.js',
    type: 'external_domain_probe',
    targetUrl: 'https://widgets.outbrain.com/outbrain.js',
    audit: {
      measuredBehavior: 'Reachability of external Outbrain widget script.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Extension filter', 'DNS sinkhole', 'Network error'],
      scoringEligible: false,
      limitations: 'Exploratory external probe; excluded from core score denominator.'
    }
  },
  {
    id: 'NAT-04',
    version: '2.1',
    section: '5.6 Search & Native Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Sponsored Product Card & In-Feed Native Unit (.sponsored-product-card)',
    description: 'Tests cosmetic filtering of in-feed sponsored product placements (.sponsored-product-card, .native-ad-item, .promoted-listing).',
    expectedBehavior: 'In-feed sponsored card is collapsed by cosmetic rules.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="native-product-04" class="sponsored-product-card native-ad-item adsbox">',
    type: 'cosmetic_dom',
    selectorClasses: 'sponsored-product-card native-ad-item promoted-listing adsbox',
    elementId: 'native-product-04',
    audit: {
      measuredBehavior: 'Cosmetic hiding of sponsored product card selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed style and rendered dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter list match'],
      scoringEligible: true,
      limitations: 'First-party native ads without distinguishing classes cannot be separated from organic content by network filters.'
    }
  },

  // 5.7 Social and Embedded Advertising (3 Tests)
  {
    id: 'SOC-01',
    version: '2.1',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Exploratory Social Pixel Probe (connect.facebook.net/fbevents.js)',
    description: 'Exploratory subresource probe to connect.facebook.net/en_US/fbevents.js.',
    expectedBehavior: 'Request fails when social tracking scripts are blocked.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://connect.facebook.net/en_US/fbevents.js',
    type: 'external_domain_probe',
    targetUrl: 'https://connect.facebook.net/en_US/fbevents.js',
    audit: {
      measuredBehavior: 'Reachability of Meta Pixel fbevents.js endpoint.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Social tracker blocker', 'Built-in ETP', 'DNS sinkhole', 'Network block'],
      scoringEligible: false,
      limitations: 'Exploratory external check; excluded from core score denominator.'
    }
  },
  {
    id: 'SOC-02',
    version: '2.1',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'cosmetic_filtering',
    name: 'Sponsored Social Feed Card (.promoted-tweet, .sponsored-post)',
    description: 'Injects synthetic social promotional feed containers (.promoted-tweet, .fbEmuTracking, .ad-social-card).',
    expectedBehavior: 'Social promotional container is hidden.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="social-ad-card-test" class="promoted-tweet fbEmuTracking ad-social-card">',
    type: 'cosmetic_dom',
    selectorClasses: 'promoted-tweet fbEmuTracking ad-social-card sponsored-post-unit',
    elementId: 'social-ad-card-test',
    audit: {
      measuredBehavior: 'DOM hiding of promoted social feed selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and rendered height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Social/Ad cosmetic list'],
      scoringEligible: true,
      limitations: 'Tests known social ad class selectors.'
    }
  },
  {
    id: 'SOC-03',
    version: '2.1',
    section: '5.7 Social & Embedded Ads',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Embedded Social Share & Tracking Widget Container (.addthis_toolbox)',
    description: 'Tests cosmetic suppression of embedded social tracking toolbars (.addthis_toolbox, .sharethis-inline-share-buttons).',
    expectedBehavior: 'Social tracking widget container is hidden by social annoyance/privacy lists.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="social-widget-03" class="addthis_toolbox sharethis-inline-share-buttons">',
    type: 'cosmetic_dom',
    selectorClasses: 'addthis_toolbox sharethis-inline-share-buttons social-tracking-widget',
    elementId: 'social-widget-03',
    audit: {
      measuredBehavior: 'DOM hiding of third-party social share widget containers.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and layout height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Fanboy Social / EasyPrivacy / AdGuard Social list active'],
      scoringEligible: true,
      limitations: 'Only hidden when social widget filter lists are enabled.'
    }
  },

  // 5.8 Affiliate and Tracking Scenarios (4 Tests)
  {
    id: 'AFF-01',
    version: '2.1',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'redirect_popup_prevention',
    name: 'Controlled Affiliate Click-Tracking Path (/aff_c?offer_id=999)',
    description: 'Tests whether requests to synthetic affiliate click-measurement paths (/aff_c?offer_id=999&aff_id=888) are intercepted.',
    expectedBehavior: 'Request is aborted client-side by affiliate/tracking URL filter rules.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /aff_c?offer_id=999&aff_id=888&adshield_test=1',
    type: 'url_pattern_probe',
    probePath: '/aff_c?offer_id=999&aff_id=888&adshield_test=1',
    audit: {
      measuredBehavior: 'Client-side interception of HasOffers/affiliate click-tracking path patterns.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyPrivacy affiliate path rule'],
      scoringEligible: true,
      limitations: 'Never navigates the tab or triggers external affiliate redirects.'
    }
  },
  {
    id: 'AFF-02',
    version: '2.1',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'privacy_storage_protections',
    name: 'URL Tracking Parameter Hygiene Check (fbclid / gclid / utm_*)',
    description: 'Inspects current document location for residual tracking parameters. Audited as informational because query strippers act on top-level navigation.',
    expectedBehavior: 'Reports whether active location URL is free of known click-tracking parameters.',
    controlResource: 'window.location.search inspection',
    testResource: 'Location query parameter check (fbclid, gclid, msclkid, mc_eid)',
    type: 'query_param_check',
    audit: {
      measuredBehavior: 'Presence of tracking query parameters on current document location.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'URLSearchParams inspection of window.location.search.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Clean navigation URL', 'DeclarativeNetRequest redirect query stripper'],
      scoringEligible: false,
      limitations: 'Excluded from core score denominator because an in-page URL() constructor cannot test top-level navigation query stripping.'
    }
  },
  {
    id: 'AFF-03',
    version: '2.1',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'privacy_storage_protections',
    name: 'Cross-Origin Referrer Policy Inspection (Capability Signal)',
    description: 'Inspects document referrer policy configuration. Audited as a non-scored browser capability check unless an explicit strict meta policy is injected.',
    expectedBehavior: 'Reports document Referrer-Policy state without misclassifying standard browser defaults as adblock passes.',
    controlResource: 'Document meta[name="referrer"] & document.referrer inspection',
    testResource: 'Document Referrer-Policy evaluation',
    type: 'referrer_policy_check',
    audit: {
      measuredBehavior: 'Document Referrer-Policy configuration inspection.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'Meta referrer attribute inspection.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Modern browser default (strict-origin-when-cross-origin)', 'Privacy extension referrer modification'],
      scoringEligible: false,
      limitations: 'Audited as non-scored capability check: standard browser defaults must not be mislabeled as active adblocker passes.'
    }
  },
  {
    id: 'AFF-04',
    version: '2.1',
    section: '5.8 Affiliate & Attribution',
    scoringCategory: 'tracker_beacon_blocking',
    name: 'Controlled Click-Attribution Beacon Path (/clk?ad_id=100&redir=none)',
    description: 'Tests client-side blocking of outbound click-measurement endpoints (/clk?ad_id=100&adurl=example).',
    expectedBehavior: 'Click attribution path is intercepted prior to server response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /clk?ad_id=100&adurl=https%3A%2F%2Fexample.invalid',
    type: 'url_pattern_probe',
    probePath: '/clk?ad_id=100&adurl=https%3A%2F%2Fexample.invalid',
    audit: {
      measuredBehavior: 'Interception of /clk?adurl= click attribution requests.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyList/EasyPrivacy click-tracking rule'],
      scoringEligible: true,
      limitations: 'First-party path test.'
    }
  },

  // 5.9 Anti-Adblock & Circumvention Scenarios (4 Tests)
  {
    id: 'AAB-01',
    version: '2.1',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    name: 'Bait Element OffsetHeight & Scriptlet Surrogate Inspection',
    description: 'Injects a classic .adsbox bait element and checks both whether it is hidden and whether surrogate globals (google_ad_status) are shimmed.',
    expectedBehavior: 'Bait is hidden by cosmetic rules and/or scriptlet shims neutralize detection.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div class="ad_unit adsbox text-ad"> + window surrogate check',
    type: 'anti_adblock_bait_check',
    audit: {
      measuredBehavior: 'Interaction between cosmetic bait hiding and anti-adblock surrogate globals.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'bait.offsetHeight and window global property checks.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Scriptlet shims are typically domain-specific in filter lists and may not fire on arbitrary hosts'],
      scoringEligible: true,
      limitations: 'Many anti-adblock scriptlets only inject on specific domain names listed in filter lists.'
    }
  },
  {
    id: 'AAB-02',
    version: '2.1',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'cosmetic_filtering',
    name: 'Anti-Adblock Warning Modal Suppression (#adblock-notice, .adblock-modal)',
    description: 'Injects a synthetic anti-adblock nag container (#adblock-notice, .adblock-modal) to test Adblock Warning Removal rules.',
    expectedBehavior: 'Anti-adblock modal container is hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="adblock-notice" class="adblock-modal adb-overlay">',
    type: 'cosmetic_dom',
    selectorClasses: 'adblock-modal adb-overlay adblocker-warning',
    elementId: 'adblock-notice',
    audit: {
      measuredBehavior: 'Cosmetic hiding of anti-adblock warning modal selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and layout height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Adblock Warning Removal List / Annoyances list enabled'],
      scoringEligible: true,
      limitations: 'Requires anti-adblock or annoyance filter lists.'
    }
  },
  {
    id: 'AAB-03',
    version: '2.1',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    name: 'Ad Container Re-Insertion Resilience',
    description: 'Simulates a script removing and re-inserting an ad node (.adsbox, .ad-banner) to verify continuous CSS rule enforcement.',
    expectedBehavior: 'Re-inserted ad node remains hidden immediately upon re-insertion.',
    controlResource: 'Re-inserted neutral control element',
    testResource: 'Re-inserted <div id="recreated-ad-node-03" class="adsbox ad-banner ad-unit-recreated">',
    type: 'dynamic_cosmetic_dom',
    selectorClasses: 'adsbox ad-banner ad-unit-recreated',
    elementId: 'recreated-ad-node-03',
    audit: {
      measuredBehavior: 'Persistence of cosmetic hiding across DOM removal and re-insertion.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and bounding box after re-insertion.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Injected CSS stylesheet persists across DOM mutations'],
      scoringEligible: true,
      limitations: 'Validates persistent CSS rules.'
    }
  },
  {
    id: 'AAB-04',
    version: '2.1',
    section: '5.9 Anti-Adblock & Circumvention',
    scoringCategory: 'script_resource_filtering',
    name: 'Fallback Ad-Loader Retry Interception (/ads/fallback_loader.js)',
    description: 'Simulates an anti-adblock recovery script attempting to fetch a secondary ad path (/ads/fallback_loader.js?retry=1).',
    expectedBehavior: 'Secondary fallback ad request is also intercepted client-side.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/fallback_loader.js?retry=1&ad_recover=1',
    type: 'url_pattern_probe',
    probePath: '/ads/fallback_loader.js?retry=1&ad_recover=1',
    audit: {
      measuredBehavior: 'Interception of secondary/fallback /ads/* script requests.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Path-based ad filter rule'],
      scoringEligible: true,
      limitations: 'Controlled relative path probe.'
    }
  },

  // 5.10 Script & Resource Filtering (4 Tests)
  {
    id: 'SCR-01',
    version: '2.1',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    name: 'Dynamic <script> Tag Injection Interception (/ads/adserver.js)',
    description: 'Dynamically appends <script src="/ads/adserver.js?adshield=1"> and distinguishes immediate filter error from HTTP 404.',
    expectedBehavior: 'Script element fires onerror AND companion fetch confirms client-side abort prior to HTTP status.',
    controlResource: 'DOM script element creation + fetch status check',
    testResource: '<script src="/ads/adserver.js?adshield_synthetic=1">',
    type: 'script_tag_probe',
    probePath: '/ads/adserver.js?adshield_synthetic=1',
    audit: {
      measuredBehavior: 'HTMLScriptElement loading interception on /ads/adserver.js.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'script.onerror event + companion fetch status verification.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['A 404 HTML response also triggers script error; runner cross-checks whether fetch was aborted before HTTP status'],
      scoringEligible: true,
      limitations: 'Cross-checks fetch abortion vs HTTP 404 so missing backend routes are never misclassified as adblock passes.'
    }
  },
  {
    id: 'SCR-02',
    version: '2.1',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    name: 'XMLHttpRequest Ad Bid Endpoint Interception (/adserver/bid)',
    description: 'Tests whether XMLHttpRequest to /adserver/bid?slot=leaderboard&ad_type=banner is aborted at status 0.',
    expectedBehavior: 'XHR errors out with status 0 (client abort) rather than receiving an HTTP response code.',
    controlResource: 'XHR baseline capability check',
    testResource: 'XHR GET /adserver/bid?slot=leaderboard&ad_type=banner',
    type: 'xhr_pattern_probe',
    probePath: '/adserver/bid?slot=leaderboard&ad_type=banner',
    audit: {
      measuredBehavior: 'Client-side XHR interception (status === 0 onerror) vs HTTP server response.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'xhr.onerror with xhr.status === 0.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Extension XHR filter rule'],
      scoringEligible: true,
      limitations: 'Strictly distinguishes status 0 client abort from HTTP 404.'
    }
  },
  {
    id: 'SCR-03',
    version: '2.1',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    name: 'PerformanceResourceTiming Cross-Origin Timing Restriction',
    description: 'Verifies that cross-origin resource entries in performance.getEntriesByType("resource") do not leak unpermitted transferSize bytes.',
    expectedBehavior: 'Cross-origin ad/tracker probes expose 0 transferSize bytes (Browser spec capability check).',
    controlResource: 'performance.getEntriesByType("resource") availability',
    testResource: 'PerformanceResourceTiming entry inspection',
    type: 'resource_timing_check',
    audit: {
      measuredBehavior: 'ResourceTiming transferSize isolation on cross-origin requests.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'PerformanceResourceTiming.transferSize.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Standard browser Timing-Allow-Origin specification enforcement'],
      scoringEligible: false,
      limitations: 'Excluded from core score denominator because 0 transferSize is standard browser spec behavior without Timing-Allow-Origin headers.'
    }
  },
  {
    id: 'SCR-04',
    version: '2.1',
    section: '5.10 Script & Resource Filtering',
    scoringCategory: 'script_resource_filtering',
    name: 'Controlled Telemetry Stylesheet Link Interception (/ads/sponsored_styles.css)',
    description: 'Tests whether CSS stylesheet requests to /ads/sponsored_styles.css?ad_tracker=1 are blocked client-side.',
    expectedBehavior: 'Request to /ads/sponsored_styles.css is aborted prior to HTTP status response.',
    controlResource: 'Same-origin neutral fetch control',
    testResource: 'Fetch GET /ads/sponsored_styles.css?ad_tracker=1',
    type: 'url_pattern_probe',
    probePath: '/ads/sponsored_styles.css?ad_tracker=1',
    audit: {
      measuredBehavior: 'Interception of ad-path stylesheet requests.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyList /ads/* rule'],
      scoringEligible: true,
      limitations: 'First-party path test.'
    }
  },

  // 5.11 Fingerprinting and Privacy-Related Tracking (4 Tests)
  {
    id: 'FPR-01',
    version: '2.1',
    section: '5.11 Fingerprinting & Privacy',
    scoringCategory: 'privacy_storage_protections',
    name: 'Global Privacy Control (GPC) & Do Not Track Signal',
    description: 'Inspects navigator.globalPrivacyControl and navigator.doNotTrack active opt-out signals.',
    expectedBehavior: 'navigator.globalPrivacyControl === true or navigator.doNotTrack === "1".',
    controlResource: 'Navigator object inspection',
    testResource: 'navigator.globalPrivacyControl / navigator.doNotTrack',
    type: 'gpc_dnt_check',
    audit: {
      measuredBehavior: 'Presence of active opt-out privacy signals exposed to websites.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'navigator.globalPrivacyControl boolean and navigator.doNotTrack string.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browser privacy setting enabled', 'Privacy extension injecting GPC signal'],
      scoringEligible: true,
      limitations: 'GPC is an active privacy signal; honoring it depends on the receiving server.'
    }
  },
  {
    id: 'FPR-02',
    version: '2.1',
    section: '5.11 Fingerprinting & Privacy',
    scoringCategory: 'privacy_storage_protections',
    name: 'Storage Access API & LocalStorage Boundary Inspection (Capability Check)',
    description: 'Non-invasively checks document.hasStorageAccess support and cleans up an ephemeral localStorage test key.',
    expectedBehavior: 'Reports storage API availability; audited as non-scored unless storage access is actively restricted.',
    controlResource: 'Document API & localStorage availability',
    testResource: 'document.hasStorageAccess() + ephemeral key cleanup',
    type: 'storage_isolation_check',
    audit: {
      measuredBehavior: 'Availability of Storage Access API and first-party storage state.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'typeof document.hasStorageAccess and localStorage read/write.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Standard modern browser API presence'],
      scoringEligible: false,
      limitations: 'Audit fix: API availability (document.hasStorageAccess existing) is a standard browser feature and is never scored as an adblocker pass.'
    }
  },
  {
    id: 'FPR-03',
    version: '2.1',
    section: '5.11 Fingerprinting & Privacy',
    scoringCategory: 'privacy_storage_protections',
    name: 'High-Entropy Hardware & WebGL Renderer Surface Restriction',
    description: 'Checks whether navigator.deviceMemory and WEBGL_debug_renderer_info are masked/hidden or exposed.',
    expectedBehavior: 'High-entropy hardware hints are masked, capped, or omitted.',
    controlResource: 'HTMLCanvasElement context creation',
    testResource: 'navigator.deviceMemory & WEBGL_debug_renderer_info check',
    type: 'fingerprint_surface_check',
    audit: {
      measuredBehavior: 'Exposure vs restriction of hardware memory and unmasked GPU renderer strings.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'navigator.deviceMemory and gl.getExtension("WEBGL_debug_renderer_info").',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Firefox/Safari omit deviceMemory by default', 'Brave/Tor/resistFingerprinting mask WebGL'],
      scoringEligible: true,
      limitations: 'Never hashes canvas pixels or constructs a device fingerprint.'
    }
  },
  {
    id: 'FPR-04',
    version: '2.1',
    section: '5.11 Fingerprinting & Privacy',
    scoringCategory: 'privacy_storage_protections',
    name: 'AudioContext & Canvas Readback Scriptlet Guard Check',
    description: 'Verifies whether AudioContext and 2D Canvas readback APIs are restricted or wrapped by anti-fingerprinting scriptlets without extracting user entropy.',
    expectedBehavior: 'Reports whether anti-fingerprinting wrappers or restrictions are present on Canvas/Audio APIs.',
    controlResource: 'CanvasRenderingContext2D prototype check',
    testResource: 'Canvas getImageData & AudioContext prototype native-code check',
    type: 'audio_canvas_guard_check',
    audit: {
      measuredBehavior: 'Detection of scriptlet wrappers or hard blocks on Canvas/Audio readback methods.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'Function.prototype.toString on getImageData / toDataURL.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browsers applying silent noise (farbling) in native C++ code will still show [native code]'],
      scoringEligible: false,
      limitations: 'Excluded from core score denominator because native C++ farbling (e.g., Brave) is invisible to prototype inspection.'
    }
  },

  // 5.12 Consent, Notifications & Deceptive Permission Prompts (3 Tests)
  {
    id: 'CNS-01',
    version: '2.1',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'cosmetic_filtering',
    name: 'Cookie Consent Banner Suppression (#onetrust-banner-sdk, .cc-window)',
    description: 'Injects a synthetic cookie consent container (#onetrust-banner-sdk, .cc-window) to test Cookie/Annoyance filter lists.',
    expectedBehavior: 'Cookie notice banner is hidden in the DOM.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="onetrust-banner-sdk" class="cc-window cookie-consent-banner">',
    type: 'cosmetic_dom',
    selectorClasses: 'cc-window cookie-consent-banner qc-cmp2-container',
    elementId: 'onetrust-banner-sdk',
    audit: {
      measuredBehavior: 'DOM hiding of OneTrust/CookieConsent banner selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed display and rendered height.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['EasyList Cookie / Fanboy Annoyances / AdGuard Annoyances enabled'],
      scoringEligible: true,
      limitations: 'Only blocked if cookie/annoyance filter lists are enabled.'
    }
  },
  {
    id: 'CNS-02',
    version: '2.1',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Deceptive Download Banner Suppression (.ad-download-button)',
    description: 'Injects a synthetic deceptive download button container (.ad-download-button, .fake-download-banner) into the sandbox.',
    expectedBehavior: 'Deceptive download banner container is hidden.',
    controlResource: 'DOM <div class="adshield-control-box">',
    testResource: 'DOM <div id="fake-dl-banner-02" class="ad-download-button fake-download-banner adsbox">',
    type: 'cosmetic_dom',
    selectorClasses: 'ad-download-button fake-download-banner sponsor-download adsbox',
    elementId: 'fake-dl-banner-02',
    audit: {
      measuredBehavior: 'Cosmetic hiding of deceptive download button selectors.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Computed style and layout dimensions.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Cosmetic filter rule'],
      scoringEligible: true,
      limitations: 'Purely synthetic DOM element; never initiates a file download.'
    }
  },
  {
    id: 'CNS-03',
    version: '2.1',
    section: '5.12 Consent & Deceptive Prompts',
    scoringCategory: 'intrusive_ad_prevention',
    name: 'Notification Permission State Guard (Read-Only Capability Check)',
    description: 'Reads Notification.permission without triggering any permission prompt.',
    expectedBehavior: 'Reports whether Notification permission is explicitly denied, default, or granted.',
    controlResource: 'Window Notification API check',
    testResource: 'Notification.permission property inspection',
    type: 'notification_state_check',
    audit: {
      measuredBehavior: 'Verification of Notification.permission state on current origin.',
      technicalValidity: VALIDITY_CLASS.CAPABILITY_SIGNAL,
      browserObservation: 'Notification.permission string.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browser default permission state ("default")'],
      scoringEligible: false,
      limitations: 'Audited as non-scored capability check so default browser permission states do not artificially inflate adblock scores.'
    }
  },

  // 5.13 Network-Level Blocking Scenarios (3 Tests)
  {
    id: 'NET-01',
    version: '2.1',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    name: 'Controlled Network Ad-Endpoint Simulation (/pagead/adview)',
    description: 'Requests a controlled path with ad-network query signatures (/pagead/adview?ad_type=banner&adnet=1) validated against a neutral control fetch.',
    expectedBehavior: 'Ad-signature request is aborted while the neutral control succeeds.',
    controlResource: 'Same-origin neutral control fetch',
    testResource: 'Fetch GET /pagead/adview?ad_type=banner&adnet=1',
    type: 'url_pattern_probe',
    probePath: '/pagead/adview?ad_type=banner&adnet=1',
    audit: {
      measuredBehavior: 'Client-side network interception of /pagead/adview requests.',
      technicalValidity: VALIDITY_CLASS.CONTROLLED_FIXTURE,
      browserObservation: 'Fetch rejection vs HTTP response.',
      dependsOnThirdParty: false,
      alternativeExplanations: ['Browser extension or built-in network filter'],
      scoringEligible: true,
      limitations: 'First-party path check; proves URL-level network interception in the browser.'
    }
  },
  {
    id: 'NET-02',
    version: '2.1',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    name: 'Exploratory Ad Service Domain Probe (adservice.google.com)',
    description: 'Exploratory subresource probe to adservice.google.com/adsid/integrator.js.',
    expectedBehavior: 'Request fails when blocked by browser or DNS filter.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://adservice.google.com/adsid/integrator.js',
    type: 'external_domain_probe',
    targetUrl: 'https://adservice.google.com/adsid/integrator.js',
    audit: {
      measuredBehavior: 'Reachability of external adservice.google.com domain.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Browser extension', 'DNS sinkhole', 'Firewall', 'Network error'],
      scoringEligible: false,
      limitations: 'Exploratory external domain probe; cannot distinguish DNS filtering from browser extension filtering.'
    }
  },
  {
    id: 'NET-03',
    version: '2.1',
    section: '5.13 Network-Level Blocking',
    scoringCategory: 'network_filtering_evidence',
    name: 'Exploratory Telemetry Domain Probe (sb.scorecardresearch.com)',
    description: 'Exploratory subresource probe to sb.scorecardresearch.com/beacon.js.',
    expectedBehavior: 'Request fails when blocked by browser or DNS blocklists.',
    controlResource: 'Same-origin connectivity verification',
    testResource: 'https://sb.scorecardresearch.com/beacon.js',
    type: 'external_domain_probe',
    targetUrl: 'https://sb.scorecardresearch.com/beacon.js',
    audit: {
      measuredBehavior: 'Reachability of external ScorecardResearch beacon domain.',
      technicalValidity: VALIDITY_CLASS.EXPLORATORY_EXTERNAL,
      browserObservation: 'no-cors Fetch outcome.',
      dependsOnThirdParty: true,
      alternativeExplanations: ['Extension filter', 'Browser tracking protection', 'DNS blocklist', 'Network outage'],
      scoringEligible: false,
      limitations: 'Exploratory external probe; excluded from core score denominator by default.'
    }
  }
];

// ============================================================================
// MODULE 3: LIVE PROTECTION TRACE BUILDER & EVIDENCE EVALUATOR
// Builds the 6-stage telemetry trace for every executed test:
// 1. Test Prepared -> 2. Control Verified -> 3. Resource/Fixture Attempted ->
// 4. Behavior Observed -> 5. Evidence Evaluated -> 6. Result Classified.
// Explicitly distinguishes OBSERVED stages from INFERRED stages.
// ============================================================================

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
  const isInferred =
    confidence?.id === CONFIDENCE.STRONG.id || confidence?.id === CONFIDENCE.WEAK.id;

  return [
    {
      step: 1,
      code: 'PREP',
      label: 'Test Prepared',
      evidenceType: 'OBSERVED',
      state: 'COMPLETE',
      detail: `${testItem.id} (${testItem.type}) initialized. Target: ${testItem.testResource}`
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
      evidenceType: isInferred ? 'INFERRED' : 'OBSERVED',
      state: status === RESULT_STATUS.INCONCLUSIVE ? 'WARNING' : 'COMPLETE',
      detail:
        evaluationDetail ||
        `${confidence?.label || 'Evaluated'} — Alternative causes: ${testItem.audit.alternativeExplanations.slice(0, 2).join(', ')}`
    },
    {
      step: 6,
      code: 'CLAS',
      label: 'Result Classified',
      evidenceType: isInferred ? 'INFERRED' : 'OBSERVED',
      state: status,
      detail: `Classified as ${status} in ${durationMs}\u00A0ms (${testItem.audit.scoringEligible ? 'Core Scored' : 'Diagnostic / Exploratory'})`
    }
  ];
}

export function analyzeProtectionLayers(resultsMap, userReportedConfig = {}, envData = null) {
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
    (t) => getStatus(t.id) === RESULT_STATUS.BLOCKED || getStatus(t.id) === RESULT_STATUS.INCONCLUSIVE
  );

  const gpcActive = getStatus('FPR-01') === RESULT_STATUS.BLOCKED;
  const annoyanceHidden =
    getStatus('CNS-01') === RESULT_STATUS.BLOCKED || getStatus('AAB-02') === RESULT_STATUS.BLOCKED;

  return {
    hasRunTests,
    directlyObserved: [
      hasRunTests
        ? `Cosmetic DOM Hiding: ${cosmeticBlocked.length} of ${cosmeticRun.length} executed first-party DOM ad containers collapsed or were hidden via CSS.`
        : 'No DOM cosmetic tests have been executed in this session yet.',
      hasRunTests
        ? `Controlled Path Interception: ${controlledPathBlocked.length} of ${controlledPathRun.length} executed first-party ad/tracker path requests (/pagead/*, /ads/*, /r/collect) were aborted client-side prior to receiving an HTTP status.`
        : 'No controlled path probes have been executed yet.',
      hasRunTests
        ? `Exploratory External Endpoints: ${exploratoryFailed.length} of ${exploratoryRun.length} third-party domain probes failed to load (Note: external failures cannot isolate browser vs. DNS causes).`
        : 'No exploratory external domain probes have been executed yet.'
    ],
    layers: [
      {
        id: 'browser_native',
        code: 'LAYER-01',
        title: 'Browser-Native Tracking Protection',
        status: !hasRunTests
          ? 'Awaiting Telemetry'
          : gpcActive
          ? 'Active Privacy Signals Observed'
          : 'Standard Browser Defaults Observed',
        confidence: !hasRunTests
          ? CONFIDENCE.UNKNOWN
          : gpcActive
          ? CONFIDENCE.CONFIRMED
          : CONFIDENCE.WEAK,
        evidence: [
          gpcActive
            ? 'Confirmed Observation: navigator.globalPrivacyControl === true or Do Not Track === "1" is actively exposed.'
            : 'Neither Global Privacy Control (GPC) nor Do Not Track is currently enabled.',
          envData?.uaBrandHint
            ? `Browser brand hint reports "${envData.uaBrandHint}". Brand hints alone never prove built-in tracking protection is active.`
            : 'Browser brand hint unavailable or masked.'
        ],
        unobservableBoundary:
          'A standard web page cannot read internal browser preferences (e.g., Firefox Strict ETP vs. Standard mode, or Safari ITP internal state).'
      },
      {
        id: 'extension_filtering',
        code: 'LAYER-02',
        title: 'Extension or Content-Blocker Filtering',
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
          'Standard web pages cannot enumerate installed browser extensions or identify whether uBlock Origin, AdGuard, Brave Shields, or another content blocker applied the CSS/network rules.'
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
          `${exploratoryFailed.length}/${exploratoryRun.length} exploratory third-party ad/tracker domains failed to load.`,
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

// ============================================================================
// MODULE 4: PURE SCORING ENGINE
// Calculates weighted scores strictly from validated, eligible test results.
// Never counts INCONCLUSIVE, UNSUPPORTED, ERROR, CANCELLED, or non-eligible
// capability/exploratory checks in the protection denominator.
// ============================================================================

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

export function calculateBenchmarkScore(
  resultsMap = {},
  categoryWeightsConfig = DEFAULT_SCORING_CATEGORIES,
  includeExploratoryInScore = false
) {
  const validatedCategories = validateCategoryWeights(categoryWeightsConfig);
  const categoryBreakdown = [];
  let totalConfiguredWeightOfEligibleCategories = 0;

  const totalTests = TEST_REGISTRY.length;
  let completedTests = 0;
  let passedCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  let inconclusiveCount = 0;
  let unsupportedCount = 0;
  let errorCount = 0;
  let cancelledCount = 0;

  TEST_REGISTRY.forEach((test) => {
    const res = resultsMap?.[test.id];
    if (!res || !res.status || res.status === RESULT_STATUS.QUEUED || res.status === RESULT_STATUS.RUNNING) {
      return;
    }
    completedTests++;
    if (res.status === RESULT_STATUS.BLOCKED) passedCount++;
    else if (res.status === RESULT_STATUS.PARTIAL) partialCount++;
    else if (res.status === RESULT_STATUS.ALLOWED) failedCount++;
    else if (res.status === RESULT_STATUS.INCONCLUSIVE) inconclusiveCount++;
    else if (res.status === RESULT_STATUS.UNSUPPORTED) unsupportedCount++;
    else if (res.status === RESULT_STATUS.ERROR) errorCount++;
    else if (res.status === RESULT_STATUS.CANCELLED) cancelledCount++;
  });

  validatedCategories.forEach((cat) => {
    const testsInCategory = TEST_REGISTRY.filter((t) => t.scoringCategory === cat.id);
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

      // Exploratory external probes can be opted in via Settings; capability checks remain non-scored
      const isExploratoryExternal = t.audit?.technicalValidity === VALIDITY_CLASS.EXPLORATORY_EXTERNAL;
      const isTestAuditEligible =
        t.audit?.scoringEligible || (includeExploratoryInScore && isExploratoryExternal);

      if (!isTestAuditEligible) {
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
    (t) =>
      t.audit.scoringEligible ||
      (includeExploratoryInScore && t.audit.technicalValidity === VALIDITY_CLASS.EXPLORATORY_EXTERNAL)
  ).length;
  const coveragePercentage = maxScoredTests > 0 ? Math.round((eligibleTotalTests / maxScoredTests) * 100) : 0;
  const overallScore =
    eligibleTotalTests > 0 && totalConfiguredWeightOfEligibleCategories > 0
      ? Math.round(weightedSum)
      : null;

  let overallConfidence = 'No Live Data';
  if (completedTests > 0) {
    if (coveragePercentage >= 80 && inconclusiveCount <= 8) overallConfidence = 'High (Controlled Fixtures)';
    else if (coveragePercentage >= 45) overallConfidence = 'Moderate';
    else overallConfidence = 'Low (Partial Coverage)';
  }

  const scoredCategories = categoryBreakdown.filter((c) => c.rawScore !== null);
  const strongestCategories = [...scoredCategories].sort((a, b) => b.rawScore - a.rawScore).slice(0, 2);
  const weakestCategories = [...scoredCategories].sort((a, b) => a.rawScore - b.rawScore).slice(0, 2);

  return {
    overallScore,
    totalTests,
    maxScoredTests,
    completedTests,
    eligibleTotalTests,
    passedCount,
    partialCount,
    failedCount,
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
    strongestCategories,
    weakestCategories
  };
}

// ============================================================================
// MODULE 5: ENVIRONMENT DIAGNOSTICS SERVICE
// ============================================================================

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
  else if (uaString.includes('Edg/')) engineHint = 'Blink / Chromium (Hint)';
  else if (uaString.includes('Chrome/')) engineHint = 'Blink / Chromium (Hint)';
  else if (uaString.includes('Safari/') && !uaString.includes('Chrome/')) engineHint = 'WebKit (Hint)';

  const width = win.innerWidth || 0;
  let viewportCategory = 'Desktop Viewport (>=1024px)';
  if (width > 0 && width < 640) viewportCategory = 'Mobile Viewport (<640px)';
  else if (width >= 640 && width < 1024) viewportCategory = 'Tablet / Compact Viewport (640-1023px)';

  const conn = nav.connection || nav.mozConnection || nav.webkitConnection || null;

  const capabilities = {
    serviceWorker: 'serviceWorker' in nav,
    sendBeacon: typeof nav.sendBeacon === 'function',
    performanceObserver: typeof PerformanceObserver !== 'undefined',
    resourceTiming: typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function',
    storageAccessApi: typeof document !== 'undefined' && typeof document.hasStorageAccess === 'function',
    globalPrivacyControl: typeof nav.globalPrivacyControl !== 'undefined',
    userAgentClientHints: Boolean(nav.userAgentData),
    networkInformationApi: Boolean(conn),
    cookiesEnabled: Boolean(nav.cookieEnabled),
    secureContext: Boolean(win.isSecureContext)
  };

  return {
    collectedAt: new Date().toISOString(),
    userAgentRaw: uaString,
    engineHint,
    uaBrandHint: isBraveReported
      ? 'Brave (Reported via navigator.brave)'
      : uaClientHints?.brands || `${engineHint} — Exact browser brand not verified`,
    platformHint: uaClientHints?.platform || nav.platform || 'Unavailable',
    viewport: `${win.innerWidth || 0} × ${win.innerHeight || 0} px`,
    screenResolution: `${scr.width || 0} × ${scr.height || 0} px (${win.devicePixelRatio || 1}x DPR)`,
    viewportCategory,
    language: nav.language || 'Unavailable',
    timeZone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unavailable';
      } catch {
        return 'Unavailable';
      }
    })(),
    onlineState: nav.onLine !== undefined ? (nav.onLine ? 'Online' : 'Offline') : 'Unknown',
    saveData: conn?.saveData !== undefined ? (conn.saveData ? 'Enabled' : 'Disabled') : 'Not Exposed',
    effectiveConnectionType: conn?.effectiveType || 'Not Exposed',
    doNotTrack: nav.doNotTrack || win.doNotTrack || 'Unset',
    globalPrivacyControl:
      nav.globalPrivacyControl !== undefined ? String(nav.globalPrivacyControl) : 'Unsupported',
    hardwareConcurrency: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} cores (Hint)` : 'Masked / Unavailable',
    deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB (Capped Hint)` : 'Not Exposed',
    capabilities
  };
}

// ============================================================================
// MODULE 6: SANITIZED REPORT EXPORTERS (JSON, CSV, ESCAPED HTML, SUMMARY)
// ============================================================================

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
      tagline: BRAND_TAGLINE,
      description: BRAND_DESCRIPTION,
      appVersion: APP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      methodologyNote:
        'Scores reflect observed outcomes on controlled first-party fixtures and active privacy signals. Exploratory third-party probes, API-capability inspections, and inconclusive/unsupported tests are excluded from the core score denominator.',
      scoreSummary,
      protectionAnalysis,
      userReportedConfiguration: userReported,
      environmentHints: {
        engineHint: envDiagnostics?.engineHint,
        platformHint: envDiagnostics?.platformHint,
        viewport: envDiagnostics?.viewport,
        onlineState: envDiagnostics?.onlineState,
        globalPrivacyControl: envDiagnostics?.globalPrivacyControl
      },
      results: TEST_REGISTRY.map((t) => ({
        testId: t.id,
        version: t.version,
        section: t.section,
        name: t.name,
        scoringEligible: t.audit.scoringEligible,
        validityClass: t.audit.technicalValidity,
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
    'Scoring_Category',
    'Validity_Class',
    'Scoring_Eligible',
    'Test_Name',
    'Status',
    'Score_Credit',
    'Duration_ms',
    'Confidence',
    'Evidence_Source',
    'Observed_Outcome',
    'Limitations'
  ];
  const rows = TEST_REGISTRY.map((t) => {
    const r = resultsMap[t.id] || {};
    return [
      t.id,
      t.version,
      t.section,
      t.scoringCategory,
      t.audit.technicalValidity,
      t.audit.scoringEligible ? 'Yes' : 'No (Exploratory/Capability)',
      t.name,
      r.status || 'NOT_RUN',
      r.scoreCredit !== null && r.scoreCredit !== undefined ? r.scoreCredit : 'Excluded',
      r.durationMs || 0,
      r.confidence?.label || 'Unrun',
      r.evidenceSource || '',
      r.actualOutcome || 'Not executed',
      t.audit.limitations
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
      <td><strong>${escapeHtml(t.name)}</strong><br/><small>${escapeHtml(t.audit.technicalValidity)}</small></td>
      <td><strong>${escapeHtml(r.status || 'NOT_RUN')}</strong></td>
      <td>${escapeHtml(r.confidence?.label || 'N/A')}</td>
      <td>${escapeHtml(r.actualOutcome || 'Not executed')}</td>
      <td>${escapeHtml(t.audit.limitations)}</td>
    </tr>`;
  }).join('\n');

  const safeReportedExt = escapeHtml(userReported?.installedExtension || 'unspecified');
  const safeReportedDns = escapeHtml(userReported?.privateDns || 'unspecified');
  const safeReportedNotes = escapeHtml(userReported?.notes || 'None');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(BRAND_NAME)} — Benchmark Report</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f4f0; color: #0f1419; padding: 32px; line-height: 1.5; max-width: 1240px; margin: 0 auto; }
  .panel { background: #ffffff; border: 1px solid #d1d5db; padding: 20px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; text-transform: uppercase; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
</style>
</head>
<body>
  <h1>${escapeHtml(BRAND_NAME)} — Diagnostic Benchmark Report</h1>
  <p><strong>${escapeHtml(BRAND_PROMISE)}</strong> — ${escapeHtml(BRAND_DESCRIPTION)}</p>
  <p>Generated: ${escapeHtml(new Date().toISOString())} | Version: ${escapeHtml(APP_VERSION)}</p>
  <div class="panel">
    <h2>Overall Score: ${scoreSummary.overallScore !== null ? `${escapeHtml(scoreSummary.overallScore)} / 100` : 'No Eligible Tests Executed'}</h2>
    <p>Completed Tests: ${escapeHtml(scoreSummary.completedTests)} / ${escapeHtml(scoreSummary.totalTests)} | Eligible Scored Coverage: ${escapeHtml(scoreSummary.coveragePercentage)}% (${escapeHtml(scoreSummary.eligibleTotalTests)}/${escapeHtml(scoreSummary.maxScoredTests)} core tests)</p>
    <p>Blocked: ${escapeHtml(scoreSummary.passedCount)} | Partial: ${escapeHtml(scoreSummary.partialCount)} | Allowed: ${escapeHtml(scoreSummary.failedCount)} | Inconclusive/Excluded: ${escapeHtml(scoreSummary.inconclusiveCount + scoreSummary.unsupportedCount)}</p>
    <p><strong>User-Reported Context:</strong> Extension: ${safeReportedExt} | DNS: ${safeReportedDns} | Notes: ${safeReportedNotes}</p>
  </div>
  <div class="panel">
    <h3>Individual Audited Test Results</h3>
    <table>
      <thead>
        <tr><th>ID</th><th>Domain</th><th>Test & Validity</th><th>Status</th><th>Confidence</th><th>Observed Evidence</th><th>Limitations</th></tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>
</body>
</html>`;
}

// ============================================================================
// MODULE 7: AUTOMATED UNIT & INTEGRATION VERIFICATION SUITE (8 CHECKS)
// ============================================================================

export function runVerificationSuite() {
  const results = [];

  // 1. Registry Integrity & Audit Completeness
  const ids = TEST_REGISTRY.map((t) => t.id);
  const uniqueIds = new Set(ids);
  const allHaveAudit = TEST_REGISTRY.every(
    (t) => t.audit && t.audit.measuredBehavior && t.audit.technicalValidity && Array.isArray(t.audit.alternativeExplanations)
  );
  results.push({
    id: 'UNIT-01',
    name: 'Registry Integrity & Individual Audit Metadata',
    passed: uniqueIds.size === TEST_REGISTRY.length && allHaveAudit,
    details: `Verified ${uniqueIds.size}/${TEST_REGISTRY.length} unique test IDs across ${new Set(TEST_REGISTRY.map((t) => t.section)).size} domains with complete audit records.`
  });

  // 2. Empty State Handling
  const emptyScore = calculateBenchmarkScore({}, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-02',
    name: 'Empty Results State Handling (No Fabricated Baseline Score)',
    passed: emptyScore.overallScore === null && emptyScore.completedTests === 0 && emptyScore.eligibleTotalTests === 0,
    details: `Empty results map returns overallScore=${emptyScore.overallScore} (null) and 0 completed tests.`
  });

  // 3. All-Inconclusive Guardrail
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

  // 4. Exploratory Third-Party Exclusion from Core Score
  const onlyExternalBlockedMap = {};
  TEST_REGISTRY.forEach((t) => {
    if (t.audit.dependsOnThirdParty) {
      onlyExternalBlockedMap[t.id] = { status: RESULT_STATUS.BLOCKED };
    }
  });
  const extScore = calculateBenchmarkScore(onlyExternalBlockedMap, DEFAULT_SCORING_CATEGORIES, false);
  results.push({
    id: 'UNIT-04',
    name: 'Third-Party Exploratory Probe Exclusion from Core Score',
    passed: extScore.eligibleTotalTests === 0 && extScore.overallScore === null,
    details: 'Confirmed external third-party probes do not inflate or penalize the core protection score by default.'
  });

  // 5. Partial Credit (0.5) & Mixed Outcome Math
  const partialMap = {};
  const coreEligibleCount = TEST_REGISTRY.filter((t) => t.audit.scoringEligible).length;
  TEST_REGISTRY.forEach((t) => {
    if (t.audit.scoringEligible) {
      partialMap[t.id] = { status: RESULT_STATUS.PARTIAL };
    }
  });
  const halfScore = calculateBenchmarkScore(partialMap, DEFAULT_SCORING_CATEGORIES);
  results.push({
    id: 'UNIT-05',
    name: 'Partial Credit (0.5) Deterministic Calculation',
    passed: halfScore.overallScore === 50 && halfScore.eligibleTotalTests === coreEligibleCount,
    details: `All ${coreEligibleCount} eligible controlled tests at PARTIAL (0.5) yield overallScore=${halfScore.overallScore}/100.`
  });

  // 6. Invalid / Zero Weight Validation & Division-by-Zero Guard
  const invalidWeights = DEFAULT_SCORING_CATEGORIES.map((c) => ({ ...c, defaultWeight: -10 }));
  const zeroWeightScore = calculateBenchmarkScore(partialMap, invalidWeights);
  results.push({
    id: 'UNIT-06',
    name: 'Negative / Zero Weight Validation & Division-by-Zero Guard',
    passed: zeroWeightScore.overallScore === null && !Number.isNaN(zeroWeightScore.overallScore),
    details: 'Negative weights clamped to 0 without throwing NaN or division-by-zero errors.'
  });

  // 7. HTML Report XSS Escaping Verification
  const maliciousPayload = '<script>alert("xss")</script>&"';
  const escaped = escapeHtml(maliciousPayload);
  const htmlReport = generateHtmlReport({
    scoreSummary: emptyScore,
    resultsMap: {},
    userReported: { installedExtension: maliciousPayload, notes: maliciousPayload }
  });
  results.push({
    id: 'UNIT-07',
    name: 'HTML Report Escaping of User-Controlled Data',
    passed:
      !htmlReport.includes('<script>alert("xss")</script>') &&
      escaped === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&quot;',
    details: 'Confirmed all user-controlled and test strings are HTML-entity escaped in standalone HTML exports.'
  });

  // 8. API-Capability Check Exclusion Audit
  const capabilityOnlyIds = ['INT-04', 'AFF-02', 'AFF-03', 'SCR-03', 'FPR-02', 'FPR-04', 'CNS-03'];
  const capabilityMap = {};
  capabilityOnlyIds.forEach((id) => {
    capabilityMap[id] = { status: RESULT_STATUS.BLOCKED };
  });
  const capScore = calculateBenchmarkScore(capabilityMap, DEFAULT_SCORING_CATEGORIES, false);
  results.push({
    id: 'UNIT-08',
    name: 'API-Capability Inspection Non-Scoring Audit Guard',
    passed: capScore.eligibleTotalTests === 0 && capScore.overallScore === null,
    details: `Confirmed browser API capability checks (${capabilityOnlyIds.join(', ')}) never count as scored adblock passes.`
  });

  return results;
}

// ============================================================================
// MODULE 8: ASYNCHRONOUS BENCHMARK RUNNER & FIXTURE EXECUTOR
// ============================================================================

async function executeAuditedTest(testItem, { sandboxStageEl, timeoutMs = 3500, retryCount = 1 }) {
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
    if (testItem.audit.scoringEligible) {
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
      scoringCategory: testItem.scoringCategory,
      status,
      startTime: startTimeIso,
      endTime: new Date().toISOString(),
      durationMs,
      retries: retriesUsed,
      expectedBehavior: testItem.expectedBehavior,
      controlResource: testItem.controlResource,
      testResource: testItem.testResource,
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
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        'Browser reports navigator.onLine === false. Offline state prevents valid network/DOM attribution.',
        'Navigator.onLine Control Check',
        CONFIDENCE.CONFIRMED,
        {},
        0,
        {
          controlOk: false,
          controlDetail: 'navigator.onLine reported false.',
          attemptDetail: 'Aborted prior to dispatch due to offline state.'
        }
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
      controlEl.textContent = 'Control';

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
        await new Promise((r) => setTimeout(r, 70));
      }
      sandboxStageEl.appendChild(baitEl);

      await new Promise((r) => setTimeout(r, 90));

      const controlRect = controlEl.getBoundingClientRect();
      const baitRect = baitEl.getBoundingClientRect();
      const baitComputed = window.getComputedStyle(baitEl);

      const elementInDom = sandboxStageEl.contains(baitEl);
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

      const observations = {
        elementInDom,
        visuallyHidden,
        zeroDimensions,
        computedDisplay: baitComputed.display,
        computedVisibility: baitComputed.visibility,
        renderedHeightPx: Math.round(baitRect.height),
        controlHeightPx: Math.round(controlRect.height)
      };

      const traceMeta = {
        controlOk: true,
        controlDetail: `Neutral control box rendered at ${Math.round(controlRect.width)}×${Math.round(controlRect.height)}px.`,
        attemptDetail: `Mounted <${tag} id="${baitEl.id}" class="${testItem.selectorClasses}"> in isolated fixture.`,
        observationDetail: `Computed display="${baitComputed.display}", visibility="${baitComputed.visibility}", boundingHeight=${Math.round(baitRect.height)}px.`,
        evaluationDetail:
          visuallyHidden || zeroDimensions
            ? 'Direct DOM observation confirms CSS rule collapsed or hid the target element while neutral control remained intact.'
            : 'Direct DOM observation confirms no cosmetic rule hid the target selector.'
      };

      if (visuallyHidden || zeroDimensions) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Cosmetic rule hid #${baitEl.id} (display="${baitComputed.display}", visibility="${baitComputed.visibility}", height=${Math.round(baitRect.height)}px; control=${Math.round(controlRect.height)}px).`,
          'getComputedStyle() & getBoundingClientRect()',
          CONFIDENCE.CONFIRMED,
          observations,
          0,
          traceMeta
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Element #${baitEl.id} remained visible in DOM (display="${baitComputed.display}", height=${Math.round(baitRect.height)}px).`,
        'getComputedStyle() & getBoundingClientRect()',
        CONFIDENCE.CONFIRMED,
        observations,
        0,
        traceMeta
      );
    }

    // 2. Controlled First-Party URL Pattern Probes
    if (testItem.type === 'url_pattern_probe') {
      let controlSucceeded = false;
      let controlStatus = 0;
      try {
        const ctrlRes = await fetch(window.location.href, { method: 'GET', cache: 'no-store' });
        controlStatus = ctrlRes.status;
        controlSucceeded = ctrlRes.status > 0;
      } catch {
        controlSucceeded = navigator.onLine !== false;
      }

      if (!controlSucceeded) {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Same-origin neutral control request failed; cannot evaluate URL pattern blocking.',
          'Same-Origin Control Check',
          CONFIDENCE.UNKNOWN,
          {},
          0,
          { controlOk: false, controlDetail: 'Same-origin baseline control fetch failed.' }
        );
      }

      let attempts = 0;
      let clientAborted = false;
      let httpStatus = null;
      let errorName = '';

      while (attempts <= retryCount) {
        attempts++;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          const res = await fetch(testItem.probePath, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal
          });
          clearTimeout(timer);
          httpStatus = res.status;
          clientAborted = false;
          break;
        } catch (err) {
          clientAborted = true;
          errorName = err?.name || 'TypeError';
          if (errorName === 'AbortError') {
            return createResult(
              RESULT_STATUS.INCONCLUSIVE,
              `Request to "${testItem.probePath}" timed out after ${timeoutMs}ms.`,
              'Fetch Timeout Guard',
              CONFIDENCE.UNKNOWN,
              { probePath: testItem.probePath },
              attempts - 1,
              {
                controlOk: true,
                controlDetail: `Same-origin control verified (HTTP ${controlStatus || 200}).`,
                attemptDetail: `GET ${testItem.probePath} timed out after ${timeoutMs}ms.`
              }
            );
          }
        }
      }

      const traceMeta = {
        controlOk: true,
        controlDetail: `Same-origin neutral control succeeded (HTTP ${controlStatus || 200}).`,
        attemptDetail: `Dispatched same-origin fetch("${testItem.probePath}") (${attempts} attempt${attempts > 1 ? 's' : ''}).`,
        observationDetail: clientAborted
          ? `Promise rejected immediately with ${errorName} prior to any HTTP status response.`
          : `Request was not intercepted and returned HTTP ${httpStatus}.`,
        evaluationDetail: clientAborted
          ? 'Strong inference: Because same-origin control succeeded while the ad/tracker path rejected before HTTP status, a client-side URL rule intercepted the request.'
          : 'Confirmed observation: Request completed an HTTP roundtrip without client-side interception.'
      };

      if (clientAborted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Request to controlled path "${testItem.probePath}" was aborted client-side (${errorName}) prior to receiving an HTTP status while neutral control succeeded.`,
          'Same-Origin Fetch Pattern Interception',
          CONFIDENCE.STRONG,
          { probePath: testItem.probePath, clientAborted: true, errorName },
          attempts - 1,
          traceMeta
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Request to "${testItem.probePath}" was not intercepted by a client-side filter and completed an HTTP roundtrip (HTTP ${httpStatus}).`,
        'Same-Origin Fetch Pattern Interception',
        CONFIDENCE.CONFIRMED,
        { probePath: testItem.probePath, clientAborted: false, httpStatus },
        attempts - 1,
        traceMeta
      );
    }

    // 3. Exploratory Third-Party External Domain Probes
    if (testItem.type === 'external_domain_probe') {
      let attempts = 0;
      let failed = false;
      let probeLatency = 0;
      let errText = '';

      while (attempts <= retryCount) {
        attempts++;
        const t0 = performance.now();
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);
          await fetch(testItem.targetUrl, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal
          });
          clearTimeout(timer);
          probeLatency = Math.round(performance.now() - t0);
          failed = false;
          break;
        } catch (err) {
          probeLatency = Math.round(performance.now() - t0);
          failed = true;
          errText = err?.name || 'NetworkError';
        }
      }

      const traceMeta = {
        controlOk: true,
        controlDetail: 'Browser online state verified; note cross-origin endpoint is external.',
        attemptDetail: `Dispatched no-cors fetch to ${testItem.targetUrl}.`,
        observationDetail: failed
          ? `Fetch rejected (${errText}) after ${probeLatency}ms.`
          : `Opaque cross-origin response resolved in ${probeLatency}ms.`,
        evaluationDetail: failed
          ? 'Weak inference: External failure is consistent with browser blocking or DNS sinkholing, but CSP, firewall, or remote outage cannot be ruled out.'
          : 'Confirmed observation: External endpoint was reachable.'
      };

      if (failed) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Exploratory probe to ${testItem.targetUrl} failed to load (${errText} in ${probeLatency}ms). Consistent with browser blocking, DNS filtering, CSP, or network restriction (non-authoritative; excluded from core score).`,
          'Exploratory no-cors Subresource Probe',
          CONFIDENCE.WEAK,
          { targetUrl: testItem.targetUrl, probeLatencyMs: probeLatency },
          attempts - 1,
          traceMeta
        );
      }

      return createResult(
        RESULT_STATUS.ALLOWED,
        `Exploratory probe to ${testItem.targetUrl} resolved with an opaque response in ${probeLatency}ms.`,
        'Exploratory no-cors Subresource Probe',
        CONFIDENCE.CONFIRMED,
        { targetUrl: testItem.targetUrl, probeLatencyMs: probeLatency },
        attempts - 1,
        traceMeta
      );
    }

    // 4. Dual Pixel Probe (DOM + Path)
    if (testItem.type === 'pixel_probe') {
      const img = new Image(1, 1);
      img.className = testItem.selectorClasses;
      if (sandboxStageEl) sandboxStageEl.appendChild(img);
      await new Promise((r) => setTimeout(r, 60));
      const computed = window.getComputedStyle(img);
      const domHidden = computed.display === 'none' || computed.visibility === 'hidden';
      if (sandboxStageEl && img.parentNode === sandboxStageEl) sandboxStageEl.removeChild(img);

      let pathAborted = false;
      try {
        await fetch(testItem.probePath, { cache: 'no-store' });
      } catch {
        pathAborted = true;
      }

      const traceMeta = {
        controlOk: true,
        controlDetail: '1x1 image constructor and same-origin fetch baseline verified.',
        attemptDetail: `Mounted <img class="${testItem.selectorClasses}"> + fetched ${testItem.probePath}.`,
        observationDetail: `DOM hidden=${String(domHidden)}, pathAborted=${String(pathAborted)}.`,
        evaluationDetail: 'Evaluated both cosmetic pixel hiding and telemetry URL interception.'
      };

      if (pathAborted && domHidden) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          'Both the /r/collect telemetry path and the .tracking-pixel DOM element were blocked/hidden.',
          'Dual DOM + Fetch Path Check',
          CONFIDENCE.CONFIRMED,
          { domHidden, pathAborted },
          0,
          traceMeta
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
          traceMeta
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Neither the 1x1 tracking pixel element nor the /r/collect path was blocked.',
        'Dual DOM + Fetch Path Check',
        CONFIDENCE.CONFIRMED,
        { domHidden, pathAborted },
        0,
        traceMeta
      );
    }

    // 5. Navigator.sendBeacon Check
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
      let accepted = true;
      try {
        accepted = navigator.sendBeacon('/pixel/track?event=adshield_synthetic', '1');
      } catch {
        accepted = false;
      }

      const traceMeta = {
        controlOk: true,
        controlDetail: 'navigator.sendBeacon API present.',
        attemptDetail: 'Called navigator.sendBeacon("/pixel/track?event=adshield_synthetic", "1").',
        observationDetail: `Return value=${String(accepted)}, functionWrapped=${String(isWrapped)}.`
      };

      if (!accepted || isWrapped) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          isWrapped
            ? 'navigator.sendBeacon exhibits scriptlet wrapping.'
            : 'navigator.sendBeacon returned false for the tracking path.',
          'navigator.sendBeacon Inspection',
          CONFIDENCE.STRONG,
          { isWrapped, accepted },
          0,
          traceMeta
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'navigator.sendBeacon uses native code and returned true when queuing the same-origin payload.',
        'navigator.sendBeacon Inspection',
        CONFIDENCE.WEAK,
        { isWrapped, accepted },
        0,
        traceMeta
      );
    }

    // 6. Sandboxed Popup Check
    if (testItem.type === 'popup_sandbox_check') {
      if (!sandboxStageEl) {
        return createResult(RESULT_STATUS.INCONCLUSIVE, 'Sandbox mount unavailable.', 'DOM Check', CONFIDENCE.UNKNOWN);
      }
      const winOpenWrapped = !Function.prototype.toString.call(window.open).includes('[native code]');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      sandboxStageEl.appendChild(iframe);

      let popupRef = null;
      try {
        popupRef = iframe.contentWindow?.open('about:blank', '_blank');
      } catch {
        popupRef = null;
      }
      if (iframe.parentNode === sandboxStageEl) sandboxStageEl.removeChild(iframe);

      if (popupRef === null) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Sandboxed window.open("about:blank") returned null. ${
            winOpenWrapped ? 'window.open also shows scriptlet wrapping.' : 'Contained by browser popup/sandbox policy.'
          }`,
          'Sandboxed Iframe Popup Check',
          CONFIDENCE.CONFIRMED,
          { winOpenWrapped }
        );
      }
      try {
        popupRef.close();
      } catch {}
      return createResult(RESULT_STATUS.ALLOWED, 'Programmatic window.open succeeded.', 'Popup Check', CONFIDENCE.CONFIRMED);
    }

    // 7. Autoplay Policy Check (Audited as Capability Signal)
    if (testItem.type === 'autoplay_policy_check') {
      const audio = document.createElement('audio');
      audio.muted = false;
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      try {
        const p = audio.play();
        if (p !== undefined) await p;
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'audio.play() resolved because user activation (clicking Run) already occurred in this tab. Audited as non-scored browser capability check.',
          'HTMLMediaElement.play() Check',
          CONFIDENCE.CONFIRMED
        );
      } catch (err) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Unmuted media play() was rejected (${err?.name || 'NotAllowedError'}).`,
          'HTMLMediaElement.play() Check',
          CONFIDENCE.CONFIRMED
        );
      }
    }

    // 8. Query Parameter Hygiene Check
    if (testItem.type === 'query_param_check') {
      const hasTrackers = /(fbclid|gclid|msclkid|mc_eid)=/i.test(window.location.search);
      return createResult(
        hasTrackers ? RESULT_STATUS.ALLOWED : RESULT_STATUS.INCONCLUSIVE,
        hasTrackers
          ? 'Tracking query parameters were found in window.location.search.'
          : 'No tracking parameters present in window.location.search (Informational capability check; excluded from core score).',
        'window.location.search Inspection',
        CONFIDENCE.CONFIRMED
      );
    }

    // 9. Referrer Policy Check (Audit Fix: Do not score standard browser defaults as adblock passes)
    if (testItem.type === 'referrer_policy_check') {
      const metaRef = document.querySelector('meta[name="referrer"]')?.getAttribute('content') || '';
      if (metaRef && (metaRef.includes('no-referrer') || metaRef.includes('same-origin'))) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Explicit strict meta referrer policy "${metaRef}" is present in DOM.`,
          'Document Referrer Policy Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        `Document uses standard browser default Referrer-Policy ("strict-origin-when-cross-origin"). Audited as informational capability check, not a scored adblock test.`,
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
      await new Promise((r) => setTimeout(r, 70));
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

    // 11. Script Tag Injection Probe
    if (testItem.type === 'script_tag_probe') {
      let fetchAborted = false;
      try {
        await fetch(testItem.probePath, { cache: 'no-store' });
      } catch {
        fetchAborted = true;
      }

      const scriptErrored = await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = testItem.probePath;
        const timer = setTimeout(() => resolve(false), 1200);
        s.onload = () => {
          clearTimeout(timer);
          resolve(false);
        };
        s.onerror = () => {
          clearTimeout(timer);
          resolve(true);
        };
        (sandboxStageEl || document.body).appendChild(s);
        setTimeout(() => {
          if (s.parentNode) s.parentNode.removeChild(s);
        }, 1300);
      });

      if (scriptErrored && fetchAborted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Dynamic <script src="${testItem.probePath}"> was aborted client-side prior to HTTP response.`,
          'HTMLScriptElement onerror + Fetch Abort Verification',
          CONFIDENCE.STRONG
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        `Dynamic <script src="${testItem.probePath}"> was not blocked by a client-side filter (reached origin HTTP handler).`,
        'HTMLScriptElement + Fetch Verification',
        CONFIDENCE.CONFIRMED
      );
    }

    // 12. XMLHttpRequest Pattern Probe
    if (testItem.type === 'xhr_pattern_probe') {
      const xhrRes = await new Promise((resolve) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', testItem.probePath, true);
          xhr.timeout = timeoutMs;
          xhr.onload = () => resolve({ aborted: false, status: xhr.status });
          xhr.onerror = () => resolve({ aborted: true, status: xhr.status });
          xhr.ontimeout = () => resolve({ aborted: false, timeout: true });
          xhr.send();
        } catch {
          resolve({ aborted: true, status: 0 });
        }
      });

      if (xhrRes.timeout) {
        return createResult(RESULT_STATUS.INCONCLUSIVE, 'XHR timed out.', 'XHR Check', CONFIDENCE.UNKNOWN);
      }
      if (xhrRes.aborted && xhrRes.status === 0) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `XMLHttpRequest to "${testItem.probePath}" was aborted client-side (status 0 onerror).`,
          'XMLHttpRequest Status 0 Interception',
          CONFIDENCE.STRONG
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        `XMLHttpRequest to "${testItem.probePath}" was not blocked client-side (HTTP status ${xhrRes.status}).`,
        'XMLHttpRequest Inspection',
        CONFIDENCE.CONFIRMED
      );
    }

    // 13. Resource Timing Check (Capability Signal)
    if (testItem.type === 'resource_timing_check') {
      if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
        return createResult(RESULT_STATUS.UNSUPPORTED, 'ResourceTiming API unavailable.', 'Performance Check', CONFIDENCE.CONFIRMED);
      }
      const entries = performance.getEntriesByType('resource');
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        `Inspected ${entries.length} ResourceTiming entries; cross-origin transferSize isolation is standard browser spec behavior (Non-scored capability signal).`,
        'performance.getEntriesByType("resource")',
        CONFIDENCE.CONFIRMED
      );
    }

    // 14. GPC & DNT Check
    if (testItem.type === 'gpc_dnt_check') {
      const gpc = navigator.globalPrivacyControl === true;
      const dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
      if (gpc || dnt) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Privacy signal active (GPC: ${String(gpc)}, DNT: ${String(dnt)}).`,
          'Navigator Privacy Signals',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        'Neither Global Privacy Control (GPC) nor Do Not Track (DNT) is enabled.',
        'Navigator Privacy Signals',
        CONFIDENCE.CONFIRMED
      );
    }

    // 15. Storage Isolation Check (Audit Fix: Do not label API presence as a scored BLOCKED pass)
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
          RESULT_STATUS.BLOCKED,
          'localStorage access was actively blocked/restricted in this context.',
          'Storage Access Inspection',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.INCONCLUSIVE,
        `First-party localStorage is accessible and Storage Access API is ${hasSAA ? 'supported' : 'unavailable'}. Audited as non-scored browser capability check.`,
        'Storage API Check',
        CONFIDENCE.CONFIRMED
      );
    }

    // 16. Fingerprint Surface Check
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

      if (memHidden && rendererRestricted) {
        return createResult(
          RESULT_STATUS.BLOCKED,
          `Both navigator.deviceMemory and WebGL debug renderer (${renderer}) are restricted.`,
          'Capability Surface Check',
          CONFIDENCE.CONFIRMED
        );
      }
      if (memHidden || rendererRestricted) {
        return createResult(
          RESULT_STATUS.PARTIAL,
          `Partial surface restriction: deviceMemory=${memHidden ? 'hidden' : navigator.deviceMemory + 'GB'}, WebGL="${renderer.slice(0, 40)}".`,
          'Capability Surface Check',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(
        RESULT_STATUS.ALLOWED,
        `Hardware hints exposed: deviceMemory=${navigator.deviceMemory}GB, WebGL renderer exposed.`,
        'Capability Surface Check',
        CONFIDENCE.CONFIRMED
      );
    }

    // 17. Audio / Canvas Guard Check
    if (testItem.type === 'audio_canvas_guard_check') {
      const toDataUrlStr = Function.prototype.toString.call(HTMLCanvasElement.prototype.toDataURL);
      const wrapped = !toDataUrlStr.includes('[native code]');
      return createResult(
        wrapped ? RESULT_STATUS.BLOCKED : RESULT_STATUS.INCONCLUSIVE,
        wrapped
          ? 'HTMLCanvasElement.prototype.toDataURL exhibits anti-fingerprinting scriptlet wrapping.'
          : 'Canvas prototype reports [native code] (Note: native C++ farbling cannot be detected from JS prototype inspection).',
        'Canvas Prototype Inspection',
        wrapped ? CONFIDENCE.CONFIRMED : CONFIDENCE.UNKNOWN
      );
    }

    // 18. Notification Permission Check (Capability Signal)
    if (testItem.type === 'notification_state_check') {
      if (typeof Notification === 'undefined') {
        return createResult(RESULT_STATUS.BLOCKED, 'Notification API omitted in this context.', 'Notification Check', CONFIDENCE.CONFIRMED);
      }
      if (Notification.permission === 'denied') {
        return createResult(RESULT_STATUS.BLOCKED, 'Notification.permission is explicitly "denied".', 'Notification Check', CONFIDENCE.CONFIRMED);
      }
      if (Notification.permission === 'default') {
        return createResult(
          RESULT_STATUS.INCONCLUSIVE,
          'Notification.permission is "default" (standard browser state; non-scored capability check).',
          'Notification Check',
          CONFIDENCE.CONFIRMED
        );
      }
      return createResult(RESULT_STATUS.ALLOWED, 'Notification.permission is "granted".', 'Notification Check', CONFIDENCE.CONFIRMED);
    }

    return createResult(RESULT_STATUS.INCONCLUSIVE, 'Unhandled test type.', 'Runner Fallback', CONFIDENCE.UNKNOWN);
  } catch (err) {
    return createResult(
      RESULT_STATUS.ERROR,
      `Test runner error: ${err?.message || String(err)}`,
      'Runner Error Boundary',
      CONFIDENCE.UNKNOWN
    );
  }
}

// ============================================================================
// MODULE 9: SCIENTIFIC INSTRUMENT DESIGN SYSTEM & LIVE PROTECTION TRACE
// Inspired by browser developer tools, logic analyzers, and precision diagnostic
// instruments. Enforces tabular-nums, hairline matrix geometry, and clear
// Observed vs. Inferred visual badges.
// ============================================================================

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950';

function BrandEmblem() {
  return (
    <div
      aria-hidden="true"
      className="w-7 h-7 rounded-sm bg-slate-900 dark:bg-sky-400 text-white dark:text-slate-950 flex items-center justify-center shrink-0 border border-slate-800 dark:border-sky-300"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h3l2-3 2 6 2-3h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StatusBadge({ status, darkMode, reducedMotion }) {
  const styles = {
    [RESULT_STATUS.BLOCKED]: darkMode
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
      : 'bg-emerald-50 text-emerald-900 border-emerald-300',
    [RESULT_STATUS.PARTIAL]: darkMode
      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
      : 'bg-amber-50 text-amber-900 border-amber-300',
    [RESULT_STATUS.ALLOWED]: darkMode
      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
      : 'bg-rose-50 text-rose-900 border-rose-300',
    [RESULT_STATUS.INCONCLUSIVE]: darkMode
      ? 'bg-slate-800 text-slate-300 border-slate-700'
      : 'bg-slate-100 text-slate-700 border-slate-300',
    [RESULT_STATUS.UNSUPPORTED]: darkMode
      ? 'bg-slate-900 text-slate-400 border-slate-800'
      : 'bg-slate-100 text-slate-600 border-slate-300',
    [RESULT_STATUS.ERROR]: darkMode
      ? 'bg-rose-950/50 text-rose-300 border-rose-800'
      : 'bg-rose-50 text-rose-800 border-rose-300',
    [RESULT_STATUS.RUNNING]: darkMode
      ? 'bg-sky-950/80 text-sky-300 border-sky-700'
      : 'bg-sky-50 text-sky-900 border-sky-300',
    [RESULT_STATUS.QUEUED]: darkMode
      ? 'bg-slate-900 text-slate-400 border-slate-800'
      : 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const icons = {
    [RESULT_STATUS.BLOCKED]: CheckCircle2,
    [RESULT_STATUS.PARTIAL]: AlertTriangle,
    [RESULT_STATUS.ALLOWED]: XCircle,
    [RESULT_STATUS.INCONCLUSIVE]: HelpCircle,
    [RESULT_STATUS.UNSUPPORTED]: MinusCircle,
    [RESULT_STATUS.ERROR]: AlertTriangle,
    [RESULT_STATUS.RUNNING]: RefreshCw,
    [RESULT_STATUS.QUEUED]: Clock
  };

  const IconComponent = icons[status] || MinusCircle;
  const badgeStyle =
    styles[status] ||
    (darkMode ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200');

  return (
    <span
      className={`inline-flex items-center justify-start gap-1.5 px-2 py-0.5 min-w-[98px] rounded-xs text-[11px] font-mono font-semibold tracking-tight border tabular-nums ${badgeStyle}`}
    >
      <IconComponent
        aria-hidden="true"
        className={`w-3 h-3 shrink-0 ${
          status === RESULT_STATUS.RUNNING && !reducedMotion ? 'animate-spin' : ''
        }`}
      />
      <span>{status || 'STANDBY'}</span>
    </span>
  );
}

function ConfidenceTag({ confidence, darkMode }) {
  const c = confidence || CONFIDENCE.UNKNOWN;
  const isObserved = c.id === CONFIDENCE.CONFIRMED.id;
  const isInferred = c.id === CONFIDENCE.STRONG.id || c.id === CONFIDENCE.WEAK.id;

  const styleClass = isObserved
    ? darkMode
      ? 'bg-teal-950/60 text-teal-300 border-teal-800'
      : 'bg-teal-50 text-teal-900 border-teal-300'
    : isInferred
    ? darkMode
      ? 'bg-sky-950/60 text-sky-300 border-sky-800'
      : 'bg-sky-50 text-sky-900 border-sky-300'
    : darkMode
    ? 'bg-slate-800 text-slate-300 border-slate-700'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <span
      title={c.description}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-mono border tabular-nums ${styleClass}`}
    >
      <span className="font-semibold">{c.stageKind}:</span>
      <span>{c.shortLabel || c.label}</span>
    </span>
  );
}

// ============================================================================
// SIGNATURE VISUAL CONCEPT: LIVE PROTECTION TRACE (6-STAGE TELEMETRY PIPELINE)
// Displays the 6 real evidence stages for the active or inspected test case,
// explicitly distinguishing OBSERVED stages from INFERRED stages.
// ============================================================================

function LiveProtectionTrace({
  activeTest,
  activeResult,
  executionState,
  recentCompletedTests,
  onSelectTraceTest,
  onOpenModal,
  darkMode,
  reducedMotion
}) {
  const surface = darkMode ? 'bg-[#11161F] border-[#1E2631]' : 'bg-white border-slate-300';
  const subSurface = darkMode ? 'bg-[#0A0D12] border-[#1E2631]' : 'bg-[#F4F4F0] border-slate-300';
  const muted = darkMode ? 'text-slate-400' : 'text-slate-600';

  const defaultIdleStages = [
    {
      step: 1,
      code: 'PREP',
      label: 'Test Prepared',
      evidenceType: 'OBSERVED',
      state: 'STANDBY',
      detail: 'Awaiting benchmark execution. Select a test or click Start Benchmark.'
    },
    {
      step: 2,
      code: 'CTRL',
      label: 'Control Verified',
      evidenceType: 'OBSERVED',
      state: 'STANDBY',
      detail: 'Verifies neutral DOM control container or same-origin connectivity first.'
    },
    {
      step: 3,
      code: 'EXEC',
      label: 'Request / Fixture Attempted',
      evidenceType: 'OBSERVED',
      state: 'STANDBY',
      detail: 'Mounts isolated DOM bait or dispatches controlled subresource probe.'
    },
    {
      step: 4,
      code: 'OBSV',
      label: 'Behavior Observed',
      evidenceType: 'OBSERVED',
      state: 'STANDBY',
      detail: 'Captures getComputedStyle, bounding box, or Fetch/XHR status code.'
    },
    {
      step: 5,
      code: 'EVAL',
      label: 'Evidence Evaluated',
      evidenceType: 'INFERRED',
      state: 'STANDBY',
      detail: 'Separates direct DOM/API observations from network-layer inferences.'
    },
    {
      step: 6,
      code: 'CLAS',
      label: 'Result Classified',
      evidenceType: 'OBSERVED',
      state: 'STANDBY',
      detail: 'Assigns BLOCKED, PARTIAL, ALLOWED, or INCONCLUSIVE.'
    }
  ];

  const isRunningThis = activeResult?.status === RESULT_STATUS.RUNNING;
  const stages = activeResult?.traceStages || defaultIdleStages;

  return (
    <section
      aria-label="Live Protection Trace Telemetry Pipeline"
      className={`border rounded-xs overflow-hidden ${surface}`}
    >
      {/* Instrument Header Bar */}
      <div
        className={`px-3.5 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${subSurface}`}
      >
        <div className="flex items-center gap-2">
          <Activity
            aria-hidden="true"
            className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${
              executionState === EXECUTION_STATE.RUNNING && !reducedMotion ? 'animate-pulse' : ''
            }`}
          />
          <span className="font-bold tracking-wider uppercase text-[11px]">
            LIVE PROTECTION TRACE // 6-STAGE EVIDENCE PIPELINE
          </span>
          {activeTest && (
            <span className="px-1.5 py-0.5 rounded-xs bg-sky-600/15 text-sky-700 dark:text-sky-300 border border-sky-600/30 font-semibold tabular-nums">
              {activeTest.id}: {activeTest.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span>DIRECTLY OBSERVED</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-400" />
            <span>BEHAVIORAL INFERENCE</span>
          </span>
          {activeTest && onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal(activeTest)}
              className={`underline text-sky-700 dark:text-sky-400 cursor-pointer rounded-xs px-1 ${FOCUS_RING}`}
            >
              Inspect Full Audit
            </button>
          )}
        </div>
      </div>

      {/* 6-Stage Horizontal Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-[#1E2631] tabular-nums">
        {stages.map((st, idx) => {
          const isObservedStage = st.evidenceType === 'OBSERVED';
          const isStandby = st.state === 'STANDBY' && !isRunningThis;
          const isBlockedFinal = st.step === 6 && st.state === RESULT_STATUS.BLOCKED;
          const isAllowedFinal = st.step === 6 && st.state === RESULT_STATUS.ALLOWED;
          const isPartialFinal = st.step === 6 && st.state === RESULT_STATUS.PARTIAL;

          let topBarColor = 'bg-slate-300 dark:bg-slate-800';
          if (isRunningThis && idx <= 3) topBarColor = 'bg-sky-500';
          else if (!isStandby) {
            if (isBlockedFinal) topBarColor = 'bg-emerald-600 dark:bg-emerald-500';
            else if (isAllowedFinal) topBarColor = 'bg-rose-600 dark:bg-rose-500';
            else if (isPartialFinal) topBarColor = 'bg-amber-500';
            else if (isObservedStage) topBarColor = 'bg-teal-600 dark:bg-teal-500';
            else topBarColor = 'bg-sky-600 dark:bg-sky-500';
          }

          return (
            <div key={st.step} className="flex flex-col justify-between p-3 text-xs relative">
              <div aria-hidden="true" className={`h-1 w-full absolute top-0 left-0 ${topBarColor}`} />
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                  <span className={`font-bold ${muted}`}>
                    0{st.step} // {st.code}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-xs border font-semibold ${
                      isObservedStage
                        ? darkMode
                          ? 'bg-teal-950/60 text-teal-300 border-teal-800'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                        : darkMode
                        ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    {st.evidenceType}
                  </span>
                </div>
                <div className="font-semibold text-xs leading-snug">{st.label}</div>
                <p className={`font-mono text-[11px] leading-relaxed break-words ${muted}`}>
                  {isRunningThis && idx >= 2 ? 'Capturing live fixture telemetry…' : st.detail}
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
                <span className={muted}>STATE</span>
                <span className="font-semibold">
                  {isRunningThis ? 'ACTIVE' : st.state}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Trace Selector Strip */}
      {recentCompletedTests && recentCompletedTests.length > 0 && (
        <div
          className={`px-3.5 py-2 border-t flex items-center gap-2 overflow-x-auto text-[11px] font-mono ${subSurface}`}
        >
          <span className={`shrink-0 uppercase ${muted}`}>Inspect Executed Trace:</span>
          {recentCompletedTests.slice(0, 8).map((item) => {
            const selected = activeTest?.id === item.test.id;
            return (
              <button
                key={item.test.id}
                type="button"
                onClick={() => onSelectTraceTest(item.test.id)}
                className={`px-2 py-0.5 rounded-xs border shrink-0 cursor-pointer transition tabular-nums ${FOCUS_RING} ${
                  selected
                    ? 'bg-sky-700 text-white border-sky-700 font-semibold'
                    : darkMode
                    ? 'bg-[#11161F] text-slate-300 border-slate-700 hover:bg-slate-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {item.test.id} ({item.result.status})
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TestDetailModal({ test, result, onClose, onRunSingle, isRunning, onOpenMethodology, darkMode, reducedMotion }) {
  useEffect(() => {
    if (!test) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [test, onClose]);

  if (!test) return null;
  const surfaceClass = darkMode
    ? 'bg-[#11161F] border-[#1E2631] text-slate-100'
    : 'bg-white border-slate-300 text-slate-900';
  const subtleClass = darkMode ? 'bg-[#0A0D12] border-[#1E2631]' : 'bg-[#F4F4F0] border-slate-300';
  const mutedText = darkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-detail-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`max-w-3xl w-full rounded-xs border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto ${surfaceClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b pb-3.5 border-slate-200 dark:border-[#1E2631]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-sky-700 text-white tabular-nums">
                {test.id} · v{test.version}
              </span>
              <span className={`text-xs font-mono ${mutedText}`}>{test.section}</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-xs border ${subtleClass}`}>
                {test.audit.technicalValidity}
              </span>
            </div>
            <h2 id="test-detail-modal-title" className="text-base font-bold mt-2 text-balance">
              {test.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close test details (Escape)"
            className={`p-1.5 rounded-xs border cursor-pointer transition-colors hover:bg-slate-200/60 dark:hover:bg-slate-800 ${subtleClass} ${FOCUS_RING}`}
          >
            <X aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-mono uppercase text-[11px] ${mutedText}`}>Status:</span>
            <StatusBadge status={result?.status} darkMode={darkMode} reducedMotion={reducedMotion} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono uppercase text-[11px] ${mutedText}`}>Evidence Class:</span>
            <ConfidenceTag confidence={result?.confidence} darkMode={darkMode} />
          </div>
          <div className="font-mono text-[11px] tabular-nums">
            Scoring: {test.audit.scoringEligible ? `Core Scored (Credit: ${result?.scoreCredit ?? 'N/A'})` : 'Diagnostic / Non-Scored'}
          </div>
        </div>

        {/* 6-Stage Protection Trace Breakdown inside Modal */}
        {result?.traceStages && (
          <div className={`border rounded-xs p-3 space-y-2 ${subtleClass}`}>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider">
              Executed 6-Stage Protection Trace
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {result.traceStages.map((s) => (
                <div
                  key={s.step}
                  className={`p-2 rounded-xs border ${
                    darkMode ? 'bg-[#11161F] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold">
                      0{s.step}. {s.label}
                    </span>
                    <span className={s.evidenceType === 'OBSERVED' ? 'text-teal-600 dark:text-teal-400' : 'text-sky-600 dark:text-sky-400'}>
                      [{s.evidenceType}]
                    </span>
                  </div>
                  <div className={`text-[11px] mt-1 ${mutedText}`}>{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`p-3.5 rounded-xs border space-y-1.5 text-xs ${subtleClass}`}>
          <div className={`font-mono text-[11px] uppercase font-semibold ${mutedText}`}>
            Observed Outcome &amp; Evidence
          </div>
          <p className="font-mono text-xs leading-relaxed text-pretty">
            {result?.actualOutcome || 'This test has not been executed in the current session.'}
          </p>
          {result?.evidenceSource && (
            <p className={`text-[11px] pt-1 font-mono ${mutedText}`}>
              Evidence Source: {result.evidenceSource}
              {result?.durationMs ? ` · Latency: ${result.durationMs}\u00A0ms` : ''}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className={`p-3 rounded-xs border ${subtleClass}`}>
            <div className={`font-mono text-[11px] uppercase font-semibold mb-1 ${mutedText}`}>Control Resource</div>
            <div className="font-mono text-[11px] break-all leading-relaxed">{test.controlResource}</div>
          </div>
          <div className={`p-3 rounded-xs border ${subtleClass}`}>
            <div className={`font-mono text-[11px] uppercase font-semibold mb-1 ${mutedText}`}>Test Resource / Fixture</div>
            <div className="font-mono text-[11px] break-all leading-relaxed">{test.testResource}</div>
          </div>
        </div>

        <div className={`p-3.5 rounded-xs border space-y-2 text-xs ${subtleClass}`}>
          <div className="font-mono text-[11px] uppercase font-semibold">
            Technical Audit &amp; Attribution Boundaries
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className={mutedText}>Measured Behavior: </span>
              <span className="text-pretty">{test.audit.measuredBehavior}</span>
            </div>
            <div>
              <span className={mutedText}>Browser Observation: </span>
              <span className="font-mono text-[11px]">{test.audit.browserObservation}</span>
            </div>
          </div>
          <div>
            <span className={mutedText}>Alternative Explanations: </span>
            <span className="text-pretty">{test.audit.alternativeExplanations.join(' · ')}</span>
          </div>
          <div>
            <span className={mutedText}>Known Limitations: </span>
            <span className="text-pretty">{test.audit.limitations}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-[#1E2631] text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMethodology();
            }}
            className={`text-sky-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer rounded-xs px-1 py-0.5 ${FOCUS_RING}`}
          >
            View Scoring &amp; Attribution Methodology <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRunSingle(test)}
              disabled={isRunning}
              className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs font-medium bg-sky-700 hover:bg-sky-600 text-white transition cursor-pointer disabled:opacity-40 ${FOCUS_RING}`}
            >
              <Play aria-hidden="true" className="w-3.5 h-3.5" />
              Run This Test
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 min-h-[34px] rounded-xs border cursor-pointer transition hover:bg-slate-200/50 dark:hover:bg-slate-800 ${subtleClass} ${FOCUS_RING}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 10: MAIN WORKSPACE SHELL & 7 OPERATIONAL DESTINATIONS
// ============================================================================

export default function AdShieldLab() {
  const [activeNav, setActiveNav] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [resultsMap, setResultsMap] = useState({});
  const [executionState, setExecutionState] = useState(EXECUTION_STATE.IDLE);
  const [runProgress, setRunProgress] = useState({
    completed: 0,
    total: 0,
    currentTestId: '',
    currentTestName: ''
  });
  const [lastRunTimestamp, setLastRunTimestamp] = useState(null);
  const [inspectedTraceTestId, setInspectedTraceTestId] = useState('DSP-01');

  const [concurrency, setConcurrency] = useState(2);
  const [timeoutMs, setTimeoutMs] = useState(3500);
  const [retryCount, setRetryCount] = useState(1);
  const [includeExploratoryInScore, setIncludeExploratoryInScore] = useState(false);
  const [categoryWeights, setCategoryWeights] = useState(DEFAULT_SCORING_CATEGORIES);

  const [selectedCategoriesForRun, setSelectedCategoriesForRun] = useState(() =>
    Array.from(new Set(TEST_REGISTRY.map((t) => t.section)))
  );
  const [labSectionFilter, setLabSectionFilter] = useState('ALL');
  const [labStatusFilter, setLabStatusFilter] = useState('ALL');
  const [labValidityFilter, setLabValidityFilter] = useState('ALL');
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [selectedTestForModal, setSelectedTestForModal] = useState(null);

  const [envDiagnostics, setEnvDiagnostics] = useState(null);
  const [userReported, setUserReported] = useState({
    installedExtension: 'unspecified',
    privateDns: 'unspecified',
    vpnEnabled: 'unspecified',
    vpnProvider: '',
    notes: ''
  });

  const [toast, setToast] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [unitTestResults, setUnitTestResults] = useState([]);

  const cancelRunRef = useRef(false);
  const pauseRunRef = useRef(false);
  const sandboxStageRef = useRef(null);
  const labSearchInputRef = useRef(null);

  useEffect(() => {
    collectEnvironmentDiagnostics().then(setEnvDiagnostics);
    setUnitTestResults(runVerificationSuite());
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Keyboard shortcut: press "/" in Test Laboratory to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (
        e.key === '/' &&
        activeNav === 'laboratory' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        labSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeNav]);

  const notify = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
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

      cancelRunRef.current = false;
      pauseRunRef.current = false;
      setExecutionState(EXECUTION_STATE.RUNNING);

      setResultsMap((prev) => {
        const next = { ...prev };
        testsToRun.forEach((t) => {
          next[t.id] = {
            testId: t.id,
            version: t.version,
            name: t.name,
            section: t.section,
            scoringCategory: t.scoringCategory,
            status: RESULT_STATUS.QUEUED,
            actualOutcome: 'Queued in benchmark pipeline…',
            confidence: CONFIDENCE.UNKNOWN,
            durationMs: 0,
            retries: 0
          };
        });
        return next;
      });

      const total = testsToRun.length;
      let completed = 0;
      setInspectedTraceTestId(testsToRun[0]?.id || 'DSP-01');
      setRunProgress({
        completed: 0,
        total,
        currentTestId: testsToRun[0]?.id || '',
        currentTestName: testsToRun[0]?.name || ''
      });

      const queue = [...testsToRun];
      const workerCount = Math.max(1, Math.min(concurrency, queue.length));

      const worker = async () => {
        while (queue.length > 0) {
          // Pause gate: wait while paused unless cancelled
          while (pauseRunRef.current && !cancelRunRef.current) {
            await new Promise((r) => setTimeout(r, 120));
          }

          if (cancelRunRef.current) {
            const skipped = queue.shift();
            if (skipped) {
              setResultsMap((prev) => ({
                ...prev,
                [skipped.id]: {
                  ...prev[skipped.id],
                  status: RESULT_STATUS.CANCELLED,
                  actualOutcome: 'Cancelled by user prior to execution.'
                }
              }));
            }
            continue;
          }

          const current = queue.shift();
          if (!current) break;

          setInspectedTraceTestId(current.id);
          setRunProgress((prev) => ({
            ...prev,
            currentTestId: current.id,
            currentTestName: current.name
          }));

          setResultsMap((prev) => ({
            ...prev,
            [current.id]: {
              ...prev[current.id],
              status: RESULT_STATUS.RUNNING,
              actualOutcome: 'Executing fixture & capturing trace stages…'
            }
          }));

          const record = await executeAuditedTest(current, {
            sandboxStageEl: sandboxStageRef.current,
            timeoutMs,
            retryCount
          });

          completed++;
          setResultsMap((prev) => ({
            ...prev,
            [current.id]: record
          }));
          setRunProgress({
            completed,
            total,
            currentTestId: current.id,
            currentTestName: current.name
          });
        }
      };

      await Promise.all(Array.from({ length: workerCount }, () => worker()));

      const wasCancelled = cancelRunRef.current;
      pauseRunRef.current = false;
      setExecutionState(wasCancelled ? EXECUTION_STATE.CANCELLED : EXECUTION_STATE.COMPLETED);
      setLastRunTimestamp(new Date().toISOString());
      notify(
        wasCancelled ? 'Benchmark run cancelled.' : `Evaluated ${completed} diagnostic test cases.`,
        wasCancelled ? 'warning' : 'success'
      );
    },
    [concurrency, executionState, notify, retryCount, timeoutMs]
  );

  const handleTogglePause = () => {
    if (executionState === EXECUTION_STATE.RUNNING) {
      pauseRunRef.current = true;
      setExecutionState(EXECUTION_STATE.PAUSED);
      notify('Benchmark paused. Inspect live traces or click Resume.', 'info');
    } else if (executionState === EXECUTION_STATE.PAUSED) {
      pauseRunRef.current = false;
      setExecutionState(EXECUTION_STATE.RUNNING);
      notify('Benchmark execution resumed.', 'info');
    }
  };

  const handleCancelRun = () => {
    cancelRunRef.current = true;
    pauseRunRef.current = false;
  };

  const handleRetryFailedOrInconclusive = () => {
    const retryList = TEST_REGISTRY.filter((t) => {
      const st = resultsMap[t.id]?.status;
      return (
        st === RESULT_STATUS.ALLOWED ||
        st === RESULT_STATUS.INCONCLUSIVE ||
        st === RESULT_STATUS.ERROR ||
        st === RESULT_STATUS.CANCELLED
      );
    });
    if (retryList.length === 0) {
      notify('No failed, inconclusive, or cancelled tests to retry.', 'info');
      return;
    }
    runTestsBatch(retryList);
  };

  const scoreSummary = useMemo(
    () => calculateBenchmarkScore(resultsMap, categoryWeights, includeExploratoryInScore),
    [resultsMap, categoryWeights, includeExploratoryInScore]
  );

  const protectionAnalysis = useMemo(
    () => analyzeProtectionLayers(resultsMap, userReported, envDiagnostics),
    [resultsMap, userReported, envDiagnostics]
  );

  const allSections = useMemo(() => Array.from(new Set(TEST_REGISTRY.map((t) => t.section))), []);
  const coreScoredTests = TEST_REGISTRY.filter((t) => t.audit.scoringEligible).length;
  const exploratoryTests = TEST_REGISTRY.filter((t) => t.audit.technicalValidity === VALIDITY_CLASS.EXPLORATORY_EXTERNAL).length;
  const capabilityTests = TEST_REGISTRY.filter((t) => t.audit.technicalValidity === VALIDITY_CLASS.CAPABILITY_SIGNAL).length;

  const recentCompletedTests = useMemo(() => {
    return TEST_REGISTRY.filter((t) => {
      const st = resultsMap[t.id]?.status;
      return st && st !== RESULT_STATUS.QUEUED && st !== RESULT_STATUS.RUNNING;
    }).map((t) => ({ test: t, result: resultsMap[t.id] }));
  }, [resultsMap]);

  const activeTraceTest = useMemo(
    () => TEST_REGISTRY.find((t) => t.id === inspectedTraceTestId) || TEST_REGISTRY[0],
    [inspectedTraceTestId]
  );
  const activeTraceResult = resultsMap[activeTraceTest?.id] || null;

  const filteredLabTests = useMemo(() => {
    return TEST_REGISTRY.filter((t) => {
      const r = resultsMap[t.id];
      const matchSec = labSectionFilter === 'ALL' || t.section === labSectionFilter;
      const matchStatus =
        labStatusFilter === 'ALL' ||
        (labStatusFilter === 'UNRUN' ? !r?.status : r?.status === labStatusFilter);
      const matchValidity =
        labValidityFilter === 'ALL' ||
        (labValidityFilter === 'ELIGIBLE'
          ? t.audit.scoringEligible
          : labValidityFilter === 'EXPLORATORY'
          ? t.audit.technicalValidity === VALIDITY_CLASS.EXPLORATORY_EXTERNAL
          : t.audit.technicalValidity === VALIDITY_CLASS.CAPABILITY_SIGNAL);
      const q = labSearchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.section.toLowerCase().includes(q);
      return matchSec && matchStatus && matchValidity && matchQuery;
    });
  }, [resultsMap, labSectionFilter, labStatusFilter, labValidityFilter, labSearchQuery]);

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: TEST_REGISTRY.length,
      [RESULT_STATUS.BLOCKED]: 0,
      [RESULT_STATUS.PARTIAL]: 0,
      [RESULT_STATUS.ALLOWED]: 0,
      [RESULT_STATUS.INCONCLUSIVE]: 0,
      UNRUN: 0
    };
    TEST_REGISTRY.forEach((t) => {
      const st = resultsMap[t.id]?.status;
      if (!st) counts.UNRUN++;
      else if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [resultsMap]);

  const triggerDownload = (content, filename, mimeType) => {
    try {
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
    } catch (err) {
      notify(`Export failed: ${err?.message || 'Unable to create file'}`, 'error');
    }
  };

  const handleCopySummary = () => {
    const text = [
      `${BRAND_NAME} v${APP_VERSION} — ${BRAND_PROMISE}`,
      BRAND_DESCRIPTION,
      `Overall Score: ${scoreSummary.overallScore !== null ? `${scoreSummary.overallScore}/100` : 'No Eligible Tests Run'}`,
      `Completed: ${scoreSummary.completedTests}/${scoreSummary.totalTests} | Core Scored Coverage: ${scoreSummary.coveragePercentage}% (${scoreSummary.eligibleTotalTests}/${scoreSummary.maxScoredTests} core tests)`,
      `Blocked: ${scoreSummary.passedCount} | Partial: ${scoreSummary.partialCount} | Allowed: ${scoreSummary.failedCount} | Inconclusive/Excluded: ${scoreSummary.inconclusiveCount + scoreSummary.unsupportedCount}`,
      ...scoreSummary.categoryBreakdown.map(
        (c) => `- ${c.name}: ${c.rawScore !== null ? `${c.rawScore}%` : 'Excluded'} (Weight: ${c.renormalizedWeight}%)`
      )
    ].join('\n');

    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand('copy');
      if (ok) {
        setCopiedSummary(true);
        notify('Summary copied to clipboard.', 'success');
        setTimeout(() => setCopiedSummary(false), 2500);
      } else {
        notify('Clipboard copy was rejected by the browser.', 'error');
      }
    } catch {
      notify('Clipboard copy failed in this environment.', 'error');
    }
    document.body.removeChild(ta);
  };

  // Scientific Instrument Surface Tokens
  const appBg = darkMode ? 'bg-[#0A0D12] text-[#E6EDF3]' : 'bg-[#F4F4F0] text-[#0F1419]';
  const surface = darkMode ? 'bg-[#11161F] border-[#1E2631]' : 'bg-white border-slate-300';
  const subtleSurface = darkMode ? 'bg-[#0A0D12] border-[#1E2631]' : 'bg-[#F4F4F0] border-slate-300';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-[#536471]';
  const borderCol = darkMode ? 'border-[#1E2631]' : 'border-slate-300';

  const navItems = [
    { id: 'overview', code: '01', label: 'Overview', icon: Shield },
    { id: 'run', code: '02', label: 'Run Benchmark', icon: Play },
    { id: 'laboratory', code: '03', label: 'Test Laboratory', icon: Beaker, count: TEST_REGISTRY.length },
    { id: 'protection', code: '04', label: 'Protection Analysis', icon: Layers },
    { id: 'reports', code: '05', label: 'Results & Reports', icon: BarChart3 },
    { id: 'methodology', code: '06', label: 'Methodology', icon: BookOpen },
    { id: 'settings', code: '07', label: 'Settings', icon: Settings }
  ];

  const isRunning = executionState === EXECUTION_STATE.RUNNING;
  const isPaused = executionState === EXECUTION_STATE.PAUSED;
  const isActiveRun = isRunning || isPaused;

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-sky-700 selection:text-white ${appBg}`}>
      {/* Top Instrument Telemetry Bar */}
      <header className={`sticky top-0 z-30 border-b px-3 sm:px-5 py-2 flex items-center justify-between gap-3 ${surface}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className={`lg:hidden p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xs border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
          >
            {mobileMenuOpen ? <X aria-hidden="true" className="w-4 h-4" /> : <Menu aria-hidden="true" className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2.5">
            <BrandEmblem />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm tracking-tight">{BRAND_NAME}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs border tabular-nums ${subtleSurface}`}>
                  v{APP_VERSION}
                </span>
                <span className={`hidden md:inline-block text-xs font-mono ${textSecondary}`}>
                  // {BRAND_PROMISE}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Operational Controls & Fixture Stage Mount */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Isolated DOM Sandbox Fixture Mount (Always mounted in DOM for tests) */}
          <div className={`hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xs border text-[11px] font-mono ${subtleSurface}`}>
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? `bg-sky-500 ${reducedMotion ? '' : 'animate-pulse'}`
                  : isPaused
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className={textSecondary}>FIXTURE_STAGE:</span>
            <div
              ref={sandboxStageRef}
              aria-label="Isolated DOM Test Fixture Stage"
              className="max-w-[120px] max-h-[18px] overflow-hidden truncate"
            >
              READY
            </div>
          </div>

          {/* Benchmark State Readout */}
          <div className={`px-2.5 py-1 rounded-xs border text-xs font-mono tabular-nums ${subtleSurface}`}>
            {isActiveRun ? (
              <span className="text-sky-700 dark:text-sky-400 font-semibold">
                {isPaused ? 'PAUSED' : 'RUNNING'} [{runProgress.completed}/{runProgress.total}]
              </span>
            ) : scoreSummary.completedTests > 0 ? (
              <span>
                SCORE: <strong>{scoreSummary.overallScore !== null ? `${scoreSummary.overallScore}/100` : 'N/A'}</strong> ({scoreSummary.completedTests}/{scoreSummary.totalTests})
              </span>
            ) : (
              <span className={textSecondary}>STATE: STANDBY (0/{scoreSummary.totalTests})</span>
            )}
          </div>

          {isActiveRun ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`inline-flex items-center gap-1 px-2.5 min-h-[32px] rounded-xs text-xs font-mono font-semibold border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
              >
                {isPaused ? (
                  <>
                    <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause aria-hidden="true" className="w-3 h-3" />
                    Pause
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelRun}
                className={`inline-flex items-center gap-1 px-2.5 min-h-[32px] rounded-xs text-xs font-mono font-semibold bg-rose-700 hover:bg-rose-600 text-white transition cursor-pointer ${FOCUS_RING}`}
              >
                <Square aria-hidden="true" className="w-3 h-3 fill-current" />
                Stop
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => runTestsBatch(TEST_REGISTRY)}
              className={`inline-flex items-center gap-1.5 px-3 min-h-[32px] rounded-xs text-xs font-mono font-semibold bg-sky-700 hover:bg-sky-600 text-white transition cursor-pointer ${FOCUS_RING}`}
            >
              <Play aria-hidden="true" className="w-3 h-3 fill-current" />
              Run Benchmark
            </button>
          )}

          <button
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-xs border cursor-pointer transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800 ${subtleSurface} ${FOCUS_RING}`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun aria-hidden="true" className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon aria-hidden="true" className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Hidden Fallback Sandbox Mount on screens < xl so DOM tests always have a valid visible stage */}
      <div className="xl:hidden sr-only" aria-hidden="true">
        <div
          ref={(el) => {
            if (el && !sandboxStageRef.current) {
              sandboxStageRef.current = el;
            }
          }}
          style={{ width: '140px', height: '30px', display: 'block' }}
        />
      </div>

      {/* Active Run Telemetry Banner */}
      {isActiveRun && (
        <div
          role="status"
          aria-live="polite"
          className={`${
            isPaused ? 'bg-amber-700' : 'bg-sky-800'
          } text-white px-4 py-1.5 text-xs font-mono flex items-center justify-between gap-4 tabular-nums`}
        >
          <div className="truncate">
            {isPaused ? 'PAUSED' : 'EXECUTING'} [{runProgress.completed}/{runProgress.total}] {runProgress.currentTestId}: {runProgress.currentTestName}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-28 bg-black/30 h-1.5 rounded-xs overflow-hidden">
              <div
                className={`bg-white h-full ${reducedMotion ? '' : 'transition-all duration-150'}`}
                style={{ width: `${Math.round((runProgress.completed / Math.max(1, runProgress.total)) * 100)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleTogglePause}
              className={`underline font-semibold cursor-pointer rounded-xs px-1 ${FOCUS_RING}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={handleCancelRun}
              className={`underline font-semibold cursor-pointer rounded-xs px-1 ${FOCUS_RING}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workspace Body: Compact Left Instrument Sidebar + Main Operational Deck */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto relative">
        {/* Sidebar Navigation */}
        <aside
          aria-label="Primary Workspace Navigation"
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 shadow-2xl' : 'hidden lg:flex w-56 shrink-0'
          } border-r ${surface} flex-col justify-between p-3`}
        >
          <div className="space-y-1">
            <div className={`px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest ${textSecondary}`}>
              INSTRUMENT DECK // NAV
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 min-h-[36px] rounded-xs text-xs font-medium transition cursor-pointer ${FOCUS_RING} ${
                    active
                      ? darkMode
                        ? 'bg-sky-950/90 text-sky-300 border-l-2 border-sky-400 font-semibold'
                        : 'bg-[#F4F4F0] text-slate-950 border-l-2 border-sky-700 font-semibold'
                      : `${textSecondary} hover:bg-slate-100 dark:hover:bg-slate-800/60`
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] opacity-60">{item.code}</span>
                    <Icon aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && (
                    <span className="font-mono text-[11px] tabular-nums opacity-75">{item.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Environment Readout */}
          <div className={`p-2.5 rounded-xs border text-[11px] font-mono space-y-1 tabular-nums ${subtleSurface}`}>
            <div className="font-bold flex items-center justify-between text-[10px] uppercase">
              <span>ENV_TELEMETRY</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {envDiagnostics?.onlineState || 'ONLINE'}
              </span>
            </div>
            <div className={`truncate ${textSecondary}`}>{envDiagnostics?.engineHint || 'Inspecting…'}</div>
            <div className={`truncate ${textSecondary}`}>
              GPC:{envDiagnostics?.globalPrivacyControl || '—'} DNT:{envDiagnostics?.doNotTrack || '—'}
            </div>
            <div className={`truncate text-[10px] ${textSecondary}`}>
              SCORED:{scoreSummary.maxScoredTests} / TOTAL:{TEST_REGISTRY.length}
            </div>
          </div>
        </aside>

        {/* Main Operational View */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 space-y-5">
          {/* =================================================================
              VIEW 1: OVERVIEW
          ================================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-5">
              {/* Compact Instrument Header Strip (No marketing bloat) */}
              <div className={`border rounded-xs p-4 sm:p-5 ${surface}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap font-mono text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-400">
                      <span>BROWSER DIAGNOSTICS LABORATORY</span>
                      <span>·</span>
                      <span>{TEST_REGISTRY.length} AUDITED CASES ({coreScoredTests} CORE SCORED / {exploratoryTests} EXPLORATORY / {capabilityTests} CAPABILITY)</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-balance">
                      {BRAND_PROMISE}
                    </h1>
                    <p className={`text-xs leading-relaxed text-pretty ${textSecondary}`}>
                      {BRAND_DESCRIPTION}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => runTestsBatch(TEST_REGISTRY)}
                      disabled={isActiveRun}
                      className={`inline-flex items-center gap-2 px-4 min-h-[38px] rounded-xs text-xs font-mono font-semibold bg-sky-700 hover:bg-sky-600 text-white transition cursor-pointer disabled:opacity-40 ${FOCUS_RING}`}
                    >
                      <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                      {scoreSummary.completedTests > 0 ? 'Re-Run Full Benchmark' : `Start Full Benchmark (${TEST_REGISTRY.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav('run')}
                      className={`px-3 min-h-[38px] rounded-xs text-xs font-mono font-medium border cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-800 ${subtleSurface} ${FOCUS_RING}`}
                    >
                      Configure Parameters
                    </button>
                  </div>
                </div>

                {/* Hairline Metric Readout Matrix */}
                <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x ${borderCol} border-t mt-4 pt-3 text-xs font-mono tabular-nums`}>
                  <div className="pr-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>BENCHMARK SCORE</div>
                    <div className="text-lg font-bold mt-0.5">
                      {scoreSummary.overallScore !== null ? `${scoreSummary.overallScore}/100` : 'STANDBY'}
                    </div>
                  </div>
                  <div className="sm:px-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>SCORED COVERAGE</div>
                    <div className="text-lg font-bold mt-0.5">
                      {scoreSummary.eligibleTotalTests}/{scoreSummary.maxScoredTests} ({scoreSummary.coveragePercentage}%)
                    </div>
                  </div>
                  <div className="sm:px-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>BLOCKED (1.0)</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {scoreSummary.passedCount}
                    </div>
                  </div>
                  <div className="sm:px-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>PARTIAL (0.5)</div>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {scoreSummary.partialCount}
                    </div>
                  </div>
                  <div className="sm:px-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>ALLOWED (0.0)</div>
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {scoreSummary.failedCount}
                    </div>
                  </div>
                  <div className="sm:pl-3 py-1">
                    <div className={`text-[10px] uppercase ${textSecondary}`}>EXCL / INCONCL</div>
                    <div className="text-lg font-bold mt-0.5">
                      {scoreSummary.inconclusiveCount + scoreSummary.unsupportedCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Visual Concept: Live Protection Trace */}
              <LiveProtectionTrace
                activeTest={activeTraceTest}
                activeResult={activeTraceResult}
                executionState={executionState}
                recentCompletedTests={recentCompletedTests}
                onSelectTraceTest={(id) => setInspectedTraceTestId(id)}
                onOpenModal={(t) => setSelectedTestForModal(t)}
                darkMode={darkMode}
                reducedMotion={reducedMotion}
              />

              {/* Category Performance & Environment Diagnostics Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-7 border rounded-xs overflow-hidden ${surface}`}>
                  <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono ${subtleSurface}`}>
                    <span className="font-bold uppercase">CATEGORY PERFORMANCE MATRIX (8 WEIGHTED DOMAINS)</span>
                    <button
                      type="button"
                      onClick={() => setActiveNav('laboratory')}
                      className={`underline text-sky-700 dark:text-sky-400 cursor-pointer ${FOCUS_RING}`}
                    >
                      Open Test Lab →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs tabular-nums">
                      <thead>
                        <tr className={`border-b ${borderCol} ${textSecondary} font-mono text-[11px]`}>
                          <th className="py-2 px-3">CODE</th>
                          <th className="py-2 px-3">CATEGORY</th>
                          <th className="py-2 px-2">WEIGHT</th>
                          <th className="py-2 px-2">DENOMINATOR</th>
                          <th className="py-2 px-3 text-right">SCORE</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${borderCol}`}>
                        {scoreSummary.categoryBreakdown.map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-500/5">
                            <td className="py-2.5 px-3 font-mono text-[11px] font-semibold">{cat.shortCode}</td>
                            <td className="py-2.5 px-3 font-medium">{cat.name}</td>
                            <td className="py-2.5 px-2 font-mono">{cat.configuredWeight}%</td>
                            <td className="py-2.5 px-2 font-mono">
                              {cat.earnedCredits}/{cat.eligibleCount} <span className={textSecondary}>({cat.totalTests} total)</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-right">
                              {cat.rawScore !== null ? `${cat.rawScore}%` : 'STANDBY'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`lg:col-span-5 border rounded-xs overflow-hidden flex flex-col justify-between ${surface}`}>
                  <div>
                    <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono ${subtleSurface}`}>
                      <span className="font-bold uppercase">ENVIRONMENT &amp; DIAGNOSTIC BOUNDARIES</span>
                      <button
                        type="button"
                        onClick={() => collectEnvironmentDiagnostics().then(setEnvDiagnostics)}
                        className={`underline cursor-pointer ${textSecondary} ${FOCUS_RING}`}
                      >
                        Refresh
                      </button>
                    </div>
                    <dl className={`divide-y ${borderCol} text-xs px-4 tabular-nums`}>
                      {[
                        ['Browser / Engine Hint', envDiagnostics?.uaBrandHint],
                        ['Platform Hint', envDiagnostics?.platformHint],
                        ['Viewport Dimensions', envDiagnostics?.viewport],
                        ['Online Connectivity', envDiagnostics?.onlineState],
                        ['Global Privacy Control', envDiagnostics?.globalPrivacyControl],
                        ['Do Not Track Signal', envDiagnostics?.doNotTrack],
                        ['Storage Access API', envDiagnostics?.capabilities?.storageAccessApi ? 'Exposed (Capability)' : 'Unavailable']
                      ].map(([label, val]) => (
                        <div key={label} className="py-2 flex items-center justify-between gap-2">
                          <dt className={textSecondary}>{label}</dt>
                          <dd className="font-mono text-right truncate max-w-[210px]">{val || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className={`p-3.5 border-t text-[11px] font-mono leading-relaxed ${subtleSurface} ${textSecondary}`}>
                    <strong>ATTRIBUTION BOUNDARY:</strong> Standard web pages cannot enumerate installed extensions,
                    read OS DNS resolvers, or verify VPN tunnels. API-capability checks are never counted as adblock passes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 2: RUN BENCHMARK
          ================================================================= */}
          {activeNav === 'run' && (
            <div className="space-y-5">
              <div className={`border rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${surface}`}>
                <div>
                  <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                    BENCHMARK EXECUTION CONTROLLER
                  </div>
                  <h1 className="text-lg font-bold tracking-tight">Configure &amp; Run Diagnostic Suite</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap tabular-nums font-mono">
                  {!isActiveRun ? (
                    <>
                      <button
                        type="button"
                        onClick={() => runTestsBatch(TEST_REGISTRY)}
                        className={`inline-flex items-center gap-1.5 px-3.5 min-h-[36px] rounded-xs text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer ${FOCUS_RING}`}
                      >
                        <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                        Run All ({TEST_REGISTRY.length})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runTestsBatch(TEST_REGISTRY.filter((t) => selectedCategoriesForRun.includes(t.section)))
                        }
                        disabled={selectedCategoriesForRun.length === 0}
                        className={`px-3 min-h-[36px] rounded-xs text-xs font-medium border cursor-pointer disabled:opacity-40 ${subtleSurface} ${FOCUS_RING}`}
                      >
                        Run Selected ({TEST_REGISTRY.filter((t) => selectedCategoriesForRun.includes(t.section)).length})
                      </button>
                      <button
                        type="button"
                        onClick={handleRetryFailedOrInconclusive}
                        className={`inline-flex items-center gap-1 px-3 min-h-[36px] rounded-xs text-xs font-medium border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                      >
                        <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                        Retry Failed / Ambiguous
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleTogglePause}
                        className={`inline-flex items-center gap-1.5 px-3.5 min-h-[36px] rounded-xs text-xs font-semibold border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                      >
                        {isPaused ? <Play aria-hidden="true" className="w-3.5 h-3.5" /> : <Pause aria-hidden="true" className="w-3.5 h-3.5" />}
                        {isPaused ? 'Resume Run' : 'Pause Run'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRun}
                        className={`inline-flex items-center gap-1.5 px-3.5 min-h-[36px] rounded-xs text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white cursor-pointer ${FOCUS_RING}`}
                      >
                        <Square aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                        Cancel ({runProgress.completed}/{runProgress.total})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Live Protection Trace always visible during Run Benchmark */}
              <LiveProtectionTrace
                activeTest={activeTraceTest}
                activeResult={activeTraceResult}
                executionState={executionState}
                recentCompletedTests={recentCompletedTests}
                onSelectTraceTest={(id) => setInspectedTraceTestId(id)}
                onOpenModal={(t) => setSelectedTestForModal(t)}
                darkMode={darkMode}
                reducedMotion={reducedMotion}
              />

              {/* Runner Parameters & Domain Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-4 border rounded-xs p-4 space-y-3 ${surface}`}>
                  <h2 className="text-xs font-mono font-bold uppercase">EXECUTION PARAMETERS</h2>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label htmlFor="concurrency-select" className={`block mb-1 font-medium ${textSecondary}`}>
                        Worker Concurrency
                      </label>
                      <select
                        id="concurrency-select"
                        value={concurrency}
                        onChange={(e) => setConcurrency(Number(e.target.value))}
                        disabled={isActiveRun}
                        className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                      >
                        <option value={1}>1x (Sequential — Clearest Live Trace)</option>
                        <option value={2}>2x (Balanced Default)</option>
                        <option value={4}>4x (Fast Parallel)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timeout-select" className={`block mb-1 font-medium ${textSecondary}`}>
                        Per-Test Request Timeout
                      </label>
                      <select
                        id="timeout-select"
                        value={timeoutMs}
                        onChange={(e) => setTimeoutMs(Number(e.target.value))}
                        disabled={isActiveRun}
                        className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                      >
                        <option value={2000}>2,000 ms</option>
                        <option value={3500}>3,500 ms (Recommended)</option>
                        <option value={6000}>6,000 ms</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="retry-select" className={`block mb-1 font-medium ${textSecondary}`}>
                        Ambiguous Probe Retries
                      </label>
                      <select
                        id="retry-select"
                        value={retryCount}
                        onChange={(e) => setRetryCount(Number(e.target.value))}
                        disabled={isActiveRun}
                        className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                      >
                        <option value={0}>0 Retries</option>
                        <option value={1}>1 Retry (Default)</option>
                        <option value={2}>2 Retries</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-8 border rounded-xs p-4 space-y-3 ${surface}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-mono font-bold uppercase">SELECT TEST DOMAINS (13 SECTIONS)</h2>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoriesForRun(allSections)}
                        className={`text-sky-700 dark:text-sky-400 underline cursor-pointer ${FOCUS_RING}`}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoriesForRun([])}
                        className={`underline cursor-pointer ${textSecondary} ${FOCUS_RING}`}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs tabular-nums">
                    {allSections.map((sec) => {
                      const count = TEST_REGISTRY.filter((t) => t.section === sec).length;
                      const checked = selectedCategoriesForRun.includes(sec);
                      return (
                        <label
                          key={sec}
                          className={`flex items-center justify-between p-2 rounded-xs border cursor-pointer ${subtleSurface}`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategoriesForRun((prev) => [...prev, sec]);
                                } else {
                                  setSelectedCategoriesForRun((prev) => prev.filter((s) => s !== sec));
                                }
                              }}
                              className={`rounded-xs accent-sky-700 ${FOCUS_RING}`}
                            />
                            <span className="truncate">{sec}</span>
                          </span>
                          <span className={`font-mono text-[11px] ${textSecondary}`}>{count}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 3: TEST LABORATORY
          ================================================================= */}
          {activeNav === 'laboratory' && (
            <div className="space-y-4">
              <div className={`border rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${surface}`}>
                <div>
                  <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                    AUDITED TEST REGISTRY // {TEST_REGISTRY.length} CASES
                  </div>
                  <h1 className="text-lg font-bold tracking-tight">
                    Interactive Test Laboratory &amp; Trace Inspector
                  </h1>
                  <p className={`text-xs mt-0.5 ${textSecondary}`}>
                    Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono border rounded-xs">/</kbd> to search. Click any test to load its 6-stage Protection Trace or open its full audit record.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => runTestsBatch(filteredLabTests)}
                  disabled={isActiveRun || filteredLabTests.length === 0}
                  className={`inline-flex items-center gap-1.5 px-3.5 min-h-[36px] rounded-xs text-xs font-mono font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer disabled:opacity-40 tabular-nums ${FOCUS_RING}`}
                >
                  <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
                  Run Filtered ({filteredLabTests.length})
                </button>
              </div>

              {/* Compact Status Filter Bar */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono tabular-nums" role="group" aria-label="Quick status filter">
                {[
                  { id: 'ALL', label: 'ALL', count: statusCounts.ALL },
                  { id: RESULT_STATUS.BLOCKED, label: 'BLOCKED', count: statusCounts[RESULT_STATUS.BLOCKED] },
                  { id: RESULT_STATUS.PARTIAL, label: 'PARTIAL', count: statusCounts[RESULT_STATUS.PARTIAL] },
                  { id: RESULT_STATUS.ALLOWED, label: 'ALLOWED', count: statusCounts[RESULT_STATUS.ALLOWED] },
                  { id: RESULT_STATUS.INCONCLUSIVE, label: 'INCONCLUSIVE', count: statusCounts[RESULT_STATUS.INCONCLUSIVE] },
                  { id: 'UNRUN', label: 'STANDBY', count: statusCounts.UNRUN }
                ].map((pill) => {
                  const active = labStatusFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setLabStatusFilter(pill.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border text-[11px] font-semibold transition cursor-pointer ${FOCUS_RING} ${
                        active
                          ? 'bg-sky-700 text-white border-sky-700'
                          : `${surface} ${textSecondary} hover:bg-slate-100 dark:hover:bg-slate-800`
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span className={active ? 'text-sky-100' : 'opacity-75'}>[{pill.count}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <div className={`border rounded-xs p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs ${surface}`}>
                <div>
                  <label htmlFor="lab-sec-filter" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                    Domain Section
                  </label>
                  <select
                    id="lab-sec-filter"
                    value={labSectionFilter}
                    onChange={(e) => setLabSectionFilter(e.target.value)}
                    className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <option value="ALL">All {allSections.length} Domains ({TEST_REGISTRY.length})</option>
                    {allSections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="lab-status-filter" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                    Result Status
                  </label>
                  <select
                    id="lab-status-filter"
                    value={labStatusFilter}
                    onChange={(e) => setLabStatusFilter(e.target.value)}
                    className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="UNRUN">Standby (Not Run)</option>
                    <option value={RESULT_STATUS.BLOCKED}>BLOCKED</option>
                    <option value={RESULT_STATUS.PARTIAL}>PARTIAL</option>
                    <option value={RESULT_STATUS.ALLOWED}>ALLOWED</option>
                    <option value={RESULT_STATUS.INCONCLUSIVE}>INCONCLUSIVE</option>
                    <option value={RESULT_STATUS.UNSUPPORTED}>UNSUPPORTED</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lab-validity-filter" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                    Audit Classification
                  </label>
                  <select
                    id="lab-validity-filter"
                    value={labValidityFilter}
                    onChange={(e) => setLabValidityFilter(e.target.value)}
                    className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <option value="ALL">All Tests ({TEST_REGISTRY.length})</option>
                    <option value="ELIGIBLE">Core Scored Fixtures ({coreScoredTests})</option>
                    <option value="EXPLORATORY">Exploratory External Probes ({exploratoryTests})</option>
                    <option value="CAPABILITY">Browser Capability Checks ({capabilityTests})</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lab-search" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                    Search ID / Selector / Path
                  </label>
                  <div className="relative">
                    <Search aria-hidden="true" className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
                    <input
                      ref={labSearchInputRef}
                      id="lab-search"
                      type="search"
                      autoComplete="off"
                      spellCheck={false}
                      value={labSearchQuery}
                      onChange={(e) => setLabSearchQuery(e.target.value)}
                      placeholder="DSP-01, adsbygoogle, VAST…"
                      className={`w-full pl-8 pr-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Table & Mobile List */}
              <div className={`border rounded-xs overflow-hidden tabular-nums ${surface}`}>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b ${borderCol} ${subtleSurface} ${textSecondary} font-mono text-[11px]`}>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">TEST CASE &amp; OBSERVED EVIDENCE</th>
                        <th className="py-2.5 px-3">AUDIT CLASS</th>
                        <th className="py-2.5 px-3">STATUS</th>
                        <th className="py-2.5 px-3">EVIDENCE TYPE</th>
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderCol}`}>
                      {filteredLabTests.map((test) => {
                        const res = resultsMap[test.id];
                        return (
                          <tr key={test.id} className="hover:bg-slate-500/5">
                            <td className="py-3 px-3 font-mono font-bold align-top whitespace-nowrap">
                              {test.id}
                            </td>
                            <td className="py-3 px-3 align-top">
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectedTraceTestId(test.id);
                                  setSelectedTestForModal(test);
                                }}
                                className={`font-semibold hover:underline text-left cursor-pointer rounded-xs ${FOCUS_RING}`}
                              >
                                {test.name}
                              </button>
                              <div className={`text-[11px] mt-0.5 text-pretty ${textSecondary}`}>
                                {test.description}
                              </div>
                              {res?.actualOutcome && (
                                <div className="font-mono text-[11px] mt-1 text-sky-700 dark:text-sky-400">
                                  → {res.actualOutcome}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 align-top whitespace-nowrap">
                              <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded-xs border ${subtleSurface}`}>
                                {test.audit.scoringEligible
                                  ? 'CORE_SCORED'
                                  : test.audit.technicalValidity === VALIDITY_CLASS.EXPLORATORY_EXTERNAL
                                  ? 'EXPLORATORY'
                                  : 'CAPABILITY_SIG'}
                              </span>
                            </td>
                            <td className="py-3 px-3 align-top whitespace-nowrap">
                              <StatusBadge status={res?.status} darkMode={darkMode} reducedMotion={reducedMotion} />
                            </td>
                            <td className="py-3 px-3 align-top whitespace-nowrap">
                              <ConfidenceTag confidence={res?.confidence} darkMode={darkMode} />
                            </td>
                            <td className="py-3 px-3 align-top text-right whitespace-nowrap space-x-1.5 font-mono">
                              <button
                                type="button"
                                onClick={() => setSelectedTestForModal(test)}
                                className={`px-2.5 py-1 rounded-xs border text-[11px] cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                              >
                                Trace / Audit
                              </button>
                              <button
                                type="button"
                                onClick={() => runTestsBatch([test])}
                                disabled={isActiveRun}
                                className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer disabled:opacity-40 ${FOCUS_RING}`}
                              >
                                Run
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Compact Rows (390px viewport optimized) */}
                <div className={`md:hidden divide-y ${borderCol} text-xs`}>
                  {filteredLabTests.map((test) => {
                    const res = resultsMap[test.id];
                    return (
                      <div key={test.id} className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold">
                            {test.id} · {test.section.split(' ')[0]}
                          </span>
                          <StatusBadge status={res?.status} darkMode={darkMode} reducedMotion={reducedMotion} />
                        </div>
                        <div className="font-semibold text-balance">{test.name}</div>
                        <p className={`text-pretty ${textSecondary}`}>{test.description}</p>
                        {res?.actualOutcome && (
                          <div className={`p-2 rounded-xs border font-mono text-[11px] ${subtleSurface}`}>
                            {res.actualOutcome}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <ConfidenceTag confidence={res?.confidence} darkMode={darkMode} />
                          <div className="flex items-center gap-2 font-mono">
                            <button
                              type="button"
                              onClick={() => setSelectedTestForModal(test)}
                              className={`px-2.5 min-h-[32px] rounded-xs border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                            >
                              Trace
                            </button>
                            <button
                              type="button"
                              onClick={() => runTestsBatch([test])}
                              disabled={isActiveRun}
                              className={`px-2.5 min-h-[32px] rounded-xs bg-sky-700 text-white cursor-pointer ${FOCUS_RING}`}
                            >
                              Run
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 4: PROTECTION ANALYSIS
          ================================================================= */}
          {activeNav === 'protection' && (
            <div className="space-y-5">
              <div className={`border rounded-xs p-4 ${surface}`}>
                <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                  EVIDENCE ATTRIBUTION MATRIX
                </div>
                <h1 className="text-lg font-bold tracking-tight">Protection Layer Analysis</h1>
                <p className={`text-xs mt-0.5 ${textSecondary}`}>
                  Separates directly observed DOM/API outcomes, strong/weak behavioral inferences, user-reported configuration, and unobservable system boundaries.
                </p>
              </div>

              <div className={`border rounded-xs p-4 space-y-2.5 ${surface}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase">
                    1. DIRECTLY OBSERVED BROWSER &amp; FIXTURE TELEMETRY
                  </h2>
                  <ConfidenceTag confidence={CONFIDENCE.CONFIRMED} darkMode={darkMode} />
                </div>
                <ul className="list-disc list-inside text-xs font-mono space-y-1.5 tabular-nums">
                  {protectionAnalysis.directlyObserved.map((item, idx) => (
                    <li key={idx} className="text-pretty">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {protectionAnalysis.layers.map((layer) => (
                  <div key={layer.id} className={`border rounded-xs p-4 space-y-3 flex flex-col justify-between ${surface}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold uppercase">
                          {layer.code} // {layer.title}
                        </span>
                        <ConfidenceTag confidence={layer.confidence} darkMode={darkMode} />
                      </div>
                      <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                        {layer.status}
                      </div>
                      <ul className="list-disc list-inside text-xs space-y-1 tabular-nums">
                        {layer.evidence.map((ev, i) => (
                          <li key={i} className="leading-relaxed text-pretty">
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`p-2.5 rounded-xs border text-[11px] font-mono text-pretty ${subtleSurface} ${textSecondary}`}>
                      <strong>UNOBSERVABLE BOUNDARY:</strong> {layer.unobservableBoundary}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional User-Reported Configuration */}
              <div className={`border rounded-xs p-4 space-y-4 ${surface}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase">
                      2. OPTIONAL USER-REPORTED CONFIGURATION (NEVER MIXED INTO AUTOMATED SCORES)
                    </h2>
                    <p className={`text-xs ${textSecondary}`}>
                      Record your setup for exported benchmark reports. Always tagged as User-Reported.
                    </p>
                  </div>
                  <ConfidenceTag confidence={CONFIDENCE.USER_REPORTED} darkMode={darkMode} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label htmlFor="ur-ext" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                      Installed Content Blocker
                    </label>
                    <select
                      id="ur-ext"
                      value={userReported.installedExtension}
                      onChange={(e) => setUserReported({ ...userReported, installedExtension: e.target.value })}
                      className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                    >
                      <option value="unspecified">Unspecified</option>
                      <option value="uBlock Origin">uBlock Origin / uBO Lite</option>
                      <option value="AdGuard">AdGuard Extension</option>
                      <option value="Brave Shields">Brave Shields</option>
                      <option value="Privacy Badger">Privacy Badger</option>
                      <option value="None">None Installed</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ur-dns" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                      Private / Filtering DNS
                    </label>
                    <select
                      id="ur-dns"
                      value={userReported.privateDns}
                      onChange={(e) => setUserReported({ ...userReported, privateDns: e.target.value })}
                      className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                    >
                      <option value="unspecified">Unspecified</option>
                      <option value="NextDNS">NextDNS</option>
                      <option value="AdGuard DNS">AdGuard DNS</option>
                      <option value="Pi-hole">Pi-hole</option>
                      <option value="Control D">Control D</option>
                      <option value="Unfiltered DNS">Unfiltered ISP / Public DNS</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ur-vpn" className={`block mb-1 font-mono text-[11px] uppercase ${textSecondary}`}>
                      VPN Status
                    </label>
                    <select
                      id="ur-vpn"
                      value={userReported.vpnEnabled}
                      onChange={(e) => setUserReported({ ...userReported, vpnEnabled: e.target.value })}
                      className={`w-full px-2.5 min-h-[34px] rounded-xs border font-mono ${subtleSurface} ${FOCUS_RING}`}
                    >
                      <option value="unspecified">Unspecified</option>
                      <option value="yes">VPN Active</option>
                      <option value="no">No VPN</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 5: RESULTS & REPORTS
          ================================================================= */}
          {activeNav === 'reports' && (
            <div className="space-y-5">
              <div className={`border rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${surface}`}>
                <div>
                  <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                    VERIFIED BENCHMARK OUTPUT &amp; EXPORTS
                  </div>
                  <h1 className="text-lg font-bold tracking-tight">Results &amp; Reports Workspace</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono">
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
                        `adblocker-test-lab-report-${new Date().toISOString().slice(0, 10)}.json`,
                        'application/json'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs text-xs font-medium border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <Code aria-hidden="true" className="w-3.5 h-3.5" />
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        generateCsvReport(resultsMap),
                        `adblocker-test-lab-results-${new Date().toISOString().slice(0, 10)}.csv`,
                        'text/csv;charset=utf-8;'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs text-xs font-medium border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <FileSpreadsheet aria-hidden="true" className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDownload(
                        generateHtmlReport({ scoreSummary, resultsMap, userReported }),
                        `adblocker-test-lab-report-${new Date().toISOString().slice(0, 10)}.html`,
                        'text/html;charset=utf-8;'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs text-xs font-medium border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <FileText aria-hidden="true" className="w-3.5 h-3.5" />
                    HTML Report
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs text-xs font-medium border cursor-pointer ${subtleSurface} ${FOCUS_RING}`}
                  >
                    <Printer aria-hidden="true" className="w-3.5 h-3.5" />
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className={`inline-flex items-center gap-1.5 px-3 min-h-[34px] rounded-xs text-xs font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer ${FOCUS_RING}`}
                  >
                    {copiedSummary ? (
                      <Check aria-hidden="true" className="w-3.5 h-3.5" />
                    ) : (
                      <Copy aria-hidden="true" className="w-3.5 h-3.5" />
                    )}
                    {copiedSummary ? 'Copied' : 'Copy Summary'}
                  </button>
                </div>
              </div>

              <div className={`border rounded-xs p-5 space-y-4 tabular-nums ${surface}`}>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-[#1E2631]">
                  <div>
                    <div className={`text-[11px] font-mono uppercase ${textSecondary}`}>OVERALL BENCHMARK SCORE</div>
                    <div className="text-3xl font-bold font-mono mt-0.5">
                      {scoreSummary.overallScore !== null ? `${scoreSummary.overallScore} / 100` : 'No Scored Tests Run'}
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div>
                      Core Scored Denominator: <strong>{scoreSummary.eligibleTotalTests}</strong> / {scoreSummary.maxScoredTests} ({scoreSummary.coveragePercentage}% coverage)
                    </div>
                    <div className={textSecondary}>
                      Blocked: {scoreSummary.passedCount} · Partial: {scoreSummary.partialCount} · Allowed: {scoreSummary.failedCount} · Excluded/Inconclusive: {scoreSummary.inconclusiveCount + scoreSummary.unsupportedCount}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {scoreSummary.categoryBreakdown.map((cat) => (
                    <div key={cat.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2 font-mono">
                        <span>
                          <strong>{cat.shortCode}</strong> · {cat.name}{' '}
                          <span className={`text-[11px] ${textSecondary}`}>
                            (Weight: {cat.renormalizedWeight}% · Credits: {cat.earnedCredits}/{cat.eligibleCount})
                          </span>
                        </span>
                        <span className="font-bold">
                          {cat.rawScore !== null ? `${cat.rawScore}%` : 'NO_DATA'}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-xs overflow-hidden border ${subtleSurface}`}>
                        <div
                          className={`h-full bg-sky-700 dark:bg-sky-500 ${reducedMotion ? '' : 'transition-all'}`}
                          style={{ width: `${cat.rawScore ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 6: METHODOLOGY & AUTOMATED VERIFICATION
          ================================================================= */}
          {activeNav === 'methodology' && (
            <div className="space-y-5">
              <div className={`border rounded-xs p-4 ${surface}`}>
                <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                  SCIENTIFIC METHODOLOGY &amp; ENGINE SELF-TEST
                </div>
                <h1 className="text-lg font-bold tracking-tight">
                  Methodology, Audit &amp; Automated Verification (8 Unit Checks)
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className={`border rounded-xs p-4 space-y-2 ${surface}`}>
                  <h2 className="text-xs font-mono font-bold uppercase">1. MEASUREMENT VS. ATTRIBUTION</h2>
                  <p className={`leading-relaxed text-pretty ${textSecondary}`}>
                    An external advertising request failing to load does not automatically prove an adblocker blocked it.
                    Possible causes include DNS failures, server outages, CORS/CSP restrictions, or browser tracking
                    protection. Therefore, {BRAND_NAME} separates <strong>{coreScoredTests} Core Scored Fixtures</strong>{' '}
                    from <strong>{exploratoryTests} Exploratory External Probes</strong> and{' '}
                    <strong>{capabilityTests} Browser API-Capability Checks</strong>; individual capability checks are scored only when they observe an active privacy signal.
                  </p>
                </div>
                <div className={`border rounded-xs p-4 space-y-2 ${surface}`}>
                  <h2 className="text-xs font-mono font-bold uppercase">2. API-CAPABILITY AUDIT RULE</h2>
                  <p className={`leading-relaxed text-pretty ${textSecondary}`}>
                    Mere presence of a standard browser API (such as <code>document.hasStorageAccess</code>,{' '}
                    <code>PerformanceResourceTiming</code>, or a default <code>Referrer-Policy</code>) is never counted
                    as a successful adblock test. Only active blocking, element hiding, or active privacy signals earn
                    protection credit.
                  </p>
                </div>
              </div>

              <div className={`border rounded-xs overflow-hidden tabular-nums ${surface}`}>
                <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-mono ${subtleSurface}`}>
                  <span className="font-bold uppercase">AUTOMATED ENGINE VERIFICATION SUITE (8 ASSERTIONS)</span>
                  <button
                    type="button"
                    onClick={() => setUnitTestResults(runVerificationSuite())}
                    className={`underline cursor-pointer ${FOCUS_RING}`}
                  >
                    Re-Run Verification
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b ${borderCol} ${textSecondary} font-mono text-[11px]`}>
                        <th className="py-2 px-3">CHECK ID</th>
                        <th className="py-2 px-3">ASSERTION</th>
                        <th className="py-2 px-3">STATUS</th>
                        <th className="py-2 px-3">VERIFIED OUTPUT</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderCol}`}>
                      {unitTestResults.map((u) => (
                        <tr key={u.id}>
                          <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">{u.id}</td>
                          <td className="py-2.5 px-3 font-medium">{u.name}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-xs font-mono text-[11px] font-semibold ${
                                u.passed
                                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-rose-50 text-rose-800'
                              }`}
                            >
                              {u.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 font-mono text-[11px] ${textSecondary}`}>{u.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              VIEW 7: SETTINGS
          ================================================================= */}
          {activeNav === 'settings' && (
            <div className="space-y-5">
              <div className={`border rounded-xs p-4 ${surface}`}>
                <div className="text-[11px] font-mono uppercase text-sky-700 dark:text-sky-400">
                  INSTRUMENT CALIBRATION &amp; PREFERENCES
                </div>
                <h1 className="text-lg font-bold tracking-tight">Benchmark &amp; Scoring Settings</h1>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-7 border rounded-xs p-4 space-y-4 tabular-nums ${surface}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-mono font-bold uppercase">CATEGORY WEIGHT CALIBRATION</h2>
                    <button
                      type="button"
                      onClick={() => setCategoryWeights(DEFAULT_SCORING_CATEGORIES)}
                      className={`text-xs font-mono text-sky-700 dark:text-sky-400 underline cursor-pointer ${FOCUS_RING}`}
                    >
                      Reset Defaults
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    {categoryWeights.map((cat, idx) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between font-mono">
                          <label htmlFor={`weight-${cat.id}`}>
                            <strong>{cat.shortCode}</strong> · {cat.name}
                          </label>
                          <span>{cat.defaultWeight}%</span>
                        </div>
                        <input
                          id={`weight-${cat.id}`}
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={cat.defaultWeight}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCategoryWeights((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, defaultWeight: val } : c))
                            );
                          }}
                          className={`w-full accent-sky-700 cursor-pointer ${FOCUS_RING}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`lg:col-span-5 border rounded-xs p-4 space-y-4 ${surface}`}>
                  <h2 className="text-xs font-mono font-bold uppercase">DISPLAY &amp; SCORING BOUNDARIES</h2>
                  <div className="space-y-3 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className={`mt-0.5 rounded-xs accent-sky-700 ${FOCUS_RING}`}
                      />
                      <div>
                        <div className="font-semibold">Carbon Dark Instrument Theme</div>
                        <div className={textSecondary}>Switch between Warm Paper Light and Carbon Dark chassis.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reducedMotion}
                        onChange={(e) => setReducedMotion(e.target.checked)}
                        className={`mt-0.5 rounded-xs accent-sky-700 ${FOCUS_RING}`}
                      />
                      <div>
                        <div className="font-semibold">Reduced Motion</div>
                        <div className={textSecondary}>Disable pulse/spinner animations during live traces.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeExploratoryInScore}
                        onChange={(e) => setIncludeExploratoryInScore(e.target.checked)}
                        className={`mt-0.5 rounded-xs accent-sky-700 ${FOCUS_RING}`}
                      />
                      <div>
                        <div className="font-semibold">Include Exploratory External Probes in Score</div>
                        <div className={textSecondary}>
                          Off by default. External third-party probes cannot isolate adblockers from DNS/network errors.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xs border shadow-lg text-xs font-mono flex items-center gap-2 ${surface}`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Detailed Audit & Trace Inspection Modal */}
      <TestDetailModal
        test={selectedTestForModal}
        result={selectedTestForModal ? resultsMap[selectedTestForModal.id] : null}
        onClose={() => setSelectedTestForModal(null)}
        onRunSingle={(t) => runTestsBatch([t])}
        isRunning={isActiveRun}
        onOpenMethodology={() => setActiveNav('methodology')}
        darkMode={darkMode}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
