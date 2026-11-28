// Privacy Policy and Terms of Use. Every statement must stay true to how the site
// actually works (see CLAUDE.md); update this file whenever data flows change.
// Voice per DESIGN.md: plain, calm, honest about limits. No em dashes.

export const OPERATOR = 'Rahul Muraleedharan';
export const CONTACT_EMAIL = 'frpboy12@gmail.com';
export const EFFECTIVE_DATE = '2026-11-27';
export const SITE_NAME = 'AdBlocker Test Lab';
export const SITE_URL = 'https://lab.frpboy.in';
export const SOURCE_URL = 'https://github.com/frpboy/adblocker-test-lab';

// Servers the full test checks for reachability (see TEST_REGISTRY external_domain_probe).
export const EXTERNAL_TEST_SERVERS = [
  { host: 'static.doubleclick.net', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'pagead2.googlesyndication.com', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'www.google-analytics.com', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'imasdk.googleapis.com', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'adservice.google.com', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'static.hotjar.com', owner: 'Hotjar', policy: 'https://www.hotjar.com/legal/policies/privacy/' },
  { host: 'widgets.outbrain.com', owner: 'Outbrain', policy: 'https://www.outbrain.com/legal/privacy' },
  { host: 'connect.facebook.net', owner: 'Meta', policy: 'https://www.facebook.com/privacy/policy/' },
  { host: 'sb.scorecardresearch.com', owner: 'Scorecard Research (Comscore)', policy: 'https://www.scorecardresearch.com/privacy.aspx' },
  { host: 'alwingulla.com', owner: 'Monetag', policy: 'https://monetag.com/privacy/' }
];

// Ordinary servers the full test contacts as controls, to tell "this network cannot reach third-party servers" from "these ad servers are unreachable".
export const CONTROL_TEST_SERVERS = [
  { host: 'www.gstatic.com', owner: 'Google', policy: 'https://policies.google.com/privacy' },
  { host: 'github.githubassets.com', owner: 'GitHub', policy: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement' },
  { host: 'cdn.jsdelivr.net', owner: 'jsDelivr', policy: 'https://www.jsdelivr.com/terms/privacy-policy-jsdelivr-net' }
];

export const LIVE_AD_NETWORKS = [
  { name: 'Adsterra', policy: 'https://adsterra.com/privacy-policy/' },
  { name: 'Monetag', policy: 'https://monetag.com/privacy/' },
  { name: 'ExoClick', policy: 'https://www.exoclick.com/privacy-policy/' }
];

export const PRIVACY_POLICY = {
  id: 'privacy',
  title: 'Privacy Policy',
  summary: [
    'This site has no accounts, no analytics, no tracking scripts, and sets no cookies.',
    'It keeps two anonymous running totals, visits and tests run, shown at the top of every page. They store nothing about who you are.',
    'Your test results stay in your own browser. They are never sent to me or to any server.',
    'Like any website, the hosting provider keeps basic server logs, which include your IP address.',
    'The full test and the optional Live ads lab contact other companies’ servers. This page lists them.'
  ],
  sections: [
    {
      id: 'who',
      heading: 'Who runs this site',
      paragraphs: [
        `${SITE_NAME} (${SITE_URL}) is run by ${OPERATOR}, an individual based in India. For the purposes of India’s Digital Personal Data Protection Act, 2023, and, for visitors in the European Union, the GDPR, I am responsible for the personal data described here.`,
        `You can contact me about anything in this policy at ${CONTACT_EMAIL}.`
      ]
    },
    {
      id: 'visit',
      heading: 'When you visit the site',
      paragraphs: [
        'The site is hosted by Vercel. When your browser loads a page, Vercel’s servers record standard request details: your IP address, your browser’s user agent, the page requested, and the time. Vercel keeps these logs for a limited period under its own policy. I can see some of them in the hosting dashboard and use them only to keep the site running and secure.',
        'The legal basis for this, where the GDPR applies, is legitimate interest in operating a secure website. I do not combine these logs with anything else, and I do not use them to identify or profile visitors.'
      ],
      links: [{ label: 'Vercel privacy policy', href: 'https://vercel.com/legal/privacy-policy' }]
    },
    {
      id: 'cookies',
      heading: 'Cookies, analytics, and tracking',
      paragraphs: [
        'This site sets no cookies and runs no analytics or tracking scripts. The test pages show no ads. It does keep two anonymous totals, described under Visit and test counters.',
        'Fonts are served from this site, so loading a page does not contact a font provider. The page contains ownership-verification tags, which services use to confirm that I run the site; these are text only and load nothing.'
      ]
    },
    {
      id: 'storage',
      heading: 'What is stored on your device',
      paragraphs: [
        'After a test, your results are saved in your browser’s local storage so they are still there after a reload. They are kept for up to 30 days, never leave your device, and you can remove them at any time with "Clear results" on the Results page.',
        'One privacy test writes a temporary value to local storage and deletes it immediately, to check whether your browser allows storage.',
        'A small flag in your browser’s session storage (not a cookie) remembers that this visit has already been counted, so reloading does not count it again. Your browser removes it when you close the tab or browser.',
        'Anything you type under Settings, Your setup, stays in the page and is only included in reports you choose to download.'
      ]
    },
    {
      id: 'counter',
      heading: 'Visit and test counters',
      paragraphs: [
        'The numbers next to the version at the top of each page are running totals of visits and of test runs. When you open the site (once per browser session) and each time a test run finishes, your browser sends a single word, "visit" or "test", to this site’s own server, which adds one to the matching total.',
        'Only the two totals are stored, in a database run by Neon in the United States. The counter does not store your IP address, browser details, cookies, test results, or any identifier, so the totals cannot be linked to you. The request itself passes through Vercel, whose standard request logs are described above.',
        'The legal basis, where the GDPR applies, is legitimate interest in showing how much the site is used. Because the totals contain no personal data, there is nothing in them to access or erase.'
      ],
      links: [{ label: 'Neon privacy policy', href: 'https://neon.com/privacy-policy' }]
    },
    {
      id: 'tests',
      heading: 'What the tests contact',
      paragraphs: [
        'The quick check only contacts this site.',
        'The full test also checks whether the following ad and tracker servers can be reached from your browser. Your browser asks each one for a file. No cookies are sent with these requests and nothing from this site about you or your results is included, but, as with any web request, each server can see your IP address and browser details. Those companies handle that under their own policies. If you prefer to avoid these requests, use the quick check.'
      ],
      serverList: true
    },
    {
      id: 'live-ads',
      heading: 'The Live ads lab',
      paragraphs: [
        'The Live ads lab is optional. Nothing loads until you press Start. When you do, the page loads real ads from the ad networks below, as configured. These networks run their own code and may set their own cookies, collect device information, and open pop-unders at the highest level, which you have to choose. They act independently of this site, under their own privacy policies.',
        'Live ads lab results stay in the page and never affect your score.'
      ],
      networkList: true
    },
    {
      id: 'sharing',
      heading: 'Sharing and downloading results',
      paragraphs: [
        'When you share a result, the image contains your score, how many tests it is based on, the counts of blocked, partial, and allowed tests, the date, and a code that links to this site. It contains nothing about your device or browser. You choose where to send it, and the app or person you send it to handles it under their own terms.',
        'Downloaded reports are created in your browser and saved to your device. They are not uploaded anywhere.'
      ]
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'Under India’s Digital Personal Data Protection Act, 2023, you can ask for a summary of personal data about you, ask for it to be corrected or erased, nominate someone to act for you, and raise a grievance. If you are in the European Union, the GDPR also gives you rights of access, correction, erasure, restriction, objection, and to complain to your data protection authority.',
        `Because this site does not keep personal data beyond the hosting logs, most requests can be answered quickly. Results saved on your device are under your control and can be cleared at any time. To make a request or raise a grievance, email ${CONTACT_EMAIL}. I will respond as soon as I can and within the time the law requires. If you are in India and not satisfied with the response, you can complain to the Data Protection Board of India.`
      ]
    },
    {
      id: 'children',
      heading: 'Children',
      paragraphs: [
        'This site is not directed at children. Under Indian law a child is anyone under 18. The site does not knowingly collect personal data from children, and it does not show ads on the test pages. The Live ads lab loads third-party ads and is meant for adults.'
      ]
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: [
        'If the way the site handles data changes, this page will be updated and the effective date at the top will change. The current version always applies.'
      ]
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [`${OPERATOR}, ${CONTACT_EMAIL}.`]
    }
  ]
};

export const TERMS_OF_USE = {
  id: 'terms',
  title: 'Terms of Use',
  summary: [
    'The site is free to use and has no accounts.',
    'Results describe one browser at one moment. They are information, not a guarantee or a product review.',
    'Please use the site fairly: do not attack it, overload it, or automate the Live ads lab.'
  ],
  sections: [
    {
      id: 'acceptance',
      heading: 'Using this site',
      paragraphs: [
        `These terms apply to ${SITE_NAME} at ${SITE_URL}, run by ${OPERATOR}. By using the site you agree to them. If you do not agree, please do not use the site.`
      ]
    },
    {
      id: 'service',
      heading: 'What the site does',
      paragraphs: [
        'The site runs tests in your browser to show what your ad blocking and privacy setup visibly does. It is free, has no accounts, and may change, pause, or stop at any time.'
      ]
    },
    {
      id: 'results',
      heading: 'What results mean',
      paragraphs: [
        'Results describe one browser at the moment you ran the test. A web page cannot see your extensions, DNS settings, or VPN, so results are evidence about what reached your browser, not a certification, a security audit, or a rating of any product. Do not rely on them alone for decisions about security or privacy.'
      ]
    },
    {
      id: 'brands',
      heading: 'Names of other companies',
      paragraphs: [
        'The site mentions ad blockers, browsers, ad networks, and tracker services to describe what is being tested. It is not affiliated with, endorsed by, or sponsored by any of them. Their names and trademarks belong to their owners.'
      ]
    },
    {
      id: 'use',
      heading: 'Fair use',
      paragraphs: [
        'Please do not try to break, overload, or get around the site’s security, and do not use it to harm others.',
        'In the Live ads lab, do not automate starts, clicks, page reloads, or ad impressions, and do not use it to generate ad revenue or fake traffic. This protects the ad networks involved and keeps the lab usable.'
      ]
    },
    {
      id: 'third-party',
      heading: 'Third-party ads and servers',
      paragraphs: [
        'The Live ads lab loads ads from third-party networks only after you press Start. Those ads, and any pages they open, come from the networks and their advertisers, not from this site, and I do not control or endorse them. The full test also contacts some third-party servers, as described in the Privacy Policy.'
      ]
    },
    {
      id: 'sharing',
      heading: 'Sharing results',
      paragraphs: [
        'You can share your result card and copy its text. You are responsible for where you share it. Please do not edit a card to show a result you did not get.'
      ]
    },
    {
      id: 'licence',
      heading: 'Open-source code',
      paragraphs: [
        `The site’s source code is published at ${SOURCE_URL} under the Apache License 2.0, which sets out how you may use, change, and share the code. That licence covers the code. The ${SITE_NAME} name and logo are not licensed for use in a way that suggests your version is this site.`
      ],
      links: [
        { label: 'Source code on GitHub', href: SOURCE_URL },
        { label: 'Apache License 2.0', href: 'https://www.apache.org/licenses/LICENSE-2.0' }
      ]
    },
    {
      id: 'warranty',
      heading: 'No guarantees',
      paragraphs: [
        'The site is provided as it is and as available, without guarantees of any kind, including that it is accurate, complete, uninterrupted, or fit for a particular purpose.'
      ]
    },
    {
      id: 'liability',
      heading: 'Limits on liability',
      paragraphs: [
        'To the extent the law allows, I am not liable for any loss or damage arising from your use of the site, its results, or third-party ads and servers it connects to. Nothing in these terms limits any liability that cannot be limited under applicable law.'
      ]
    },
    {
      id: 'law',
      heading: 'Governing law',
      paragraphs: [
        'These terms are governed by the laws of India. Any dispute will be handled by the competent courts in India. If you live elsewhere, you keep any protections the law where you live gives you.'
      ]
    },
    {
      id: 'changes',
      heading: 'Changes to these terms',
      paragraphs: [
        'These terms may be updated. The effective date at the top shows the current version, and continuing to use the site means you accept it.'
      ]
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [`${OPERATOR}, ${CONTACT_EMAIL}.`]
    }
  ]
};

export const LEGAL_PAGES = { privacy: PRIVACY_POLICY, terms: TERMS_OF_USE };
