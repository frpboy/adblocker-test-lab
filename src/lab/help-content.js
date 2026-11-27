// Help page content. Every answer must stay true to how the site actually works;
// update it when behaviour changes. Voice per DESIGN.md: plain, calm, honest about limits.
// `action` values are handled by HelpView: a tab id, or 'run-full' / 'run-quick'.

export const HELP_SECTIONS = [
  {
    id: 'score',
    title: 'Your score',
    items: [
      {
        q: 'What does the score mean?',
        a: [
          'It shows how many of the 35 scored tests your setup stopped, out of 100. Each test is a small, fake ad or tracker served from this site.',
          'A blocked test counts fully, a partly blocked one counts half, and one that got through counts zero. Tests that could not be measured are left out, so they never count against you. Categories are weighted; you can see the weights in Settings.'
        ],
        action: { label: 'See the weights in Settings', target: 'settings' }
      },
      {
        q: 'Why does the quick check say "Partial result"?',
        a: [
          'The quick check runs 6 of the 35 scored tests, so the number can move a lot. The full test runs all 55 checks, including the 35 scored tests, and gives a score you can rely on.'
        ],
        action: { label: 'Run the full test', target: 'run-full' }
      },
      {
        q: 'I use an ad blocker. Why is my score low?',
        a: [
          'The most common reasons: the blocker is paused or set to allow this site; element hiding (sometimes called cosmetic filtering) is turned off; or you rely on a DNS blocker or VPN.',
          'A DNS blocker stops requests to known ad servers, but the scored tests are served from this site’s own address, so it cannot tell them apart from the rest of the page. Those setups are better reflected in the extra checks, which are reported but not scored.'
        ]
      },
      {
        q: 'How can I improve my score?',
        a: [
          'Make sure your blocker is on for this site, turn on element hiding, and consider adding filter lists for annoyances such as cookie notices and "please turn off your ad blocker" pop-ups. Then run the full test again.',
          'After a run, open the detailed view and look at the "Got through" list to see exactly what was missed.'
        ],
        action: { label: 'Open your results', target: 'results' }
      }
    ]
  },
  {
    id: 'results',
    title: 'Reading the results',
    items: [
      {
        q: 'What do Blocked, Partial, Allowed, and Inconclusive mean?',
        a: [
          'Blocked: your setup stopped it. Partial: it was stopped in part, for example hidden on screen but still downloaded. Allowed: it reached your browser. Inconclusive: the page could not tell, so the test is left out of the score.'
        ]
      },
      {
        q: 'Why could some tests not be measured?',
        a: [
          'A few checks need a browser feature your browser does not offer, or a server that this site does not run. Rather than guess, the site marks them as not measured and leaves them out of the score. The detailed view of each run lists the reason for every one.'
        ]
      },
      {
        q: 'Why can’t the site tell me which ad blocker I use?',
        a: [
          'Web pages cannot see your extensions, DNS settings, or VPN. This site only sees whether each test item reached your browser. It reports that, and says so when it cannot tell more.',
          'If you want your setup recorded in your downloaded reports, you can type it in under Settings, Your setup. That is your own note, not something the site detected.'
        ],
        action: { label: 'Add your setup', target: 'settings' }
      },
      {
        q: 'What are the privacy settings?',
        a: [
          'Signals your browser can send or features it can switch on, such as Global Privacy Control, which asks sites not to sell or share your data. They are shown separately and never added to the blocking score.'
        ]
      },
      {
        q: 'Why are my results different on another browser or device?',
        a: [
          'Each browser has its own extensions and settings, so results describe this browser at the moment you ran the test. Run the test in each browser you use to compare them.'
        ]
      }
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy and safety',
    items: [
      {
        q: 'Does this site show me ads or track me?',
        a: [
          'The test pages show no ads and load no analytics or tracking scripts. Real ads appear only in the Live ads lab, and only after you press Start there.'
        ]
      },
      {
        q: 'What does the test connect to?',
        a: [
          'The quick check only contacts this site. The full test also checks whether 10 well-known ad and tracker servers, such as DoubleClick and Google Analytics, can be reached from your browser.',
          'Those requests carry nothing from this site about you or your results. As with any web request, those servers can see your IP address. If you would rather avoid that, use the quick check.'
        ]
      },
      {
        q: 'Where are my results saved?',
        a: [
          'Only in this browser, for up to 30 days, so they are still there after a reload. They are never sent to a server. Use "Clear results" on the Results page to remove them at any time.'
        ],
        action: { label: 'Open your results', target: 'results' }
      },
      {
        q: 'What does the share card include?',
        a: [
          'Your score, how many tests it is based on, the counts of blocked, partial, and allowed tests, the date, and a code that opens this site. Nothing about your device or browser is included. Nothing is shared until you choose where to send it.'
        ]
      }
    ]
  },
  {
    id: 'site',
    title: 'Using the site',
    items: [
      {
        q: 'What is the Live ads lab?',
        a: [
          'An optional page that loads real ads from ad networks into boxes on the page, so you can see what your blocker does with live ads. Nothing loads until you press Start, pop-unders are only possible at the highest level you opt into, and these results never affect your score.'
        ],
        action: { label: 'Open the Live ads lab', target: 'real-ads' }
      },
      {
        q: 'How are the tests actually measured?',
        a: [
          'Most tests place a fake ad or make a request next to a neutral reference that no blocker should touch, then compare the two. The methodology page explains each step and what a web page cannot observe.'
        ],
        action: { label: 'Read how it’s measured', target: 'methodology' }
      }
    ]
  }
];
