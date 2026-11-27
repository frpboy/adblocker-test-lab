import React from 'react';
import { Play } from 'lucide-react';
import { plainTestName } from '../lab/plain-language.js';

const CAN_SEE = [
  'Whether a test ad or tracker reached your browser, using files served from this site.',
  'Whether ad-shaped page elements were hidden on screen.',
  'Which privacy signals your browser sends to websites.'
];

const CANNOT_SEE = [
  'Which extension, browser feature, DNS service, or VPN did the blocking.',
  'Why a request to another company’s server failed. It could be a blocker, or that server being down.',
  'How well your setup handles sites that change their ads after this test was written.'
];

export default function OverviewView({
  startRun,
  quickScanTests,
  testRegistry,
  expectedRegistryCount,
  isActiveRun,
  setActiveTab,
  envDiagnostics,
  scoreSummary,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const hasResult = scoreSummary && scoreSummary.eligibleTotalTests > 0;
  const partial = hasResult && scoreSummary.eligibleTotalTests * 2 < scoreSummary.maxScoredTests;

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)] lg:items-start" aria-labelledby="overview-title">
        <div className="space-y-7">
          <div>
            <h1 id="overview-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.04] max-w-3xl">
              See what your ad blocker really stops.
            </h1>
            <p className={`mt-5 max-w-2xl text-base sm:text-lg leading-relaxed ${muted}`}>
              This page loads test ads, trackers, and pop-ups, then checks which ones reached your browser.
              It reports only what a web page can actually observe, and says so when it cannot tell.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => startRun(quickScanTests)}
              disabled={isActiveRun}
              className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm font-semibold bg-[#b84a1c] hover:bg-[#9a3d17] text-white disabled:opacity-50 cursor-pointer transition-colors ${focusRing}`}
            >
              <Play aria-hidden="true" className="w-4 h-4 fill-current shrink-0" />
              <span>Quick check ({quickScanTests.length} tests)</span>
            </button>
            <button
              type="button"
              onClick={() => startRun(testRegistry)}
              disabled={isActiveRun}
              className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm border font-semibold disabled:opacity-50 cursor-pointer ${surface} hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${focusRing}`}
            >
              <span>Full test (all {expectedRegistryCount})</span>
            </button>
          </div>

          {hasResult ? (
            <div className={`p-4 sm:p-5 rounded-sm border ${surface}`} role="status">
              <p className="text-sm">
                {partial && <strong className="font-semibold">Partial result. </strong>}
                Your last run scored <strong className="font-semibold">{scoreSummary.overallScore}/100</strong>, based on{' '}
                {scoreSummary.eligibleTotalTests} of {scoreSummary.maxScoredTests} scored tests.
                {partial && ' Run the full test before relying on this number.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('results')}
                className={`mt-3 min-h-10 text-sm font-semibold underline underline-offset-4 text-[#a9431c] dark:text-[#f08a5d] cursor-pointer ${focusRing}`}
              >
                Open the results
              </button>
            </div>
          ) : (
            <p className={`text-sm ${muted}`}>
              No results yet. The quick check runs {quickScanTests.length} core tests. The full test runs all {expectedRegistryCount}, including
              privacy settings and checks against real ad servers, which are reported but never added to the score.
            </p>
          )}
        </div>

        <aside className={`p-5 sm:p-6 rounded-sm border ${surface}`} aria-labelledby="quick-scope-title">
          <h2 id="quick-scope-title" className="text-base font-bold">What the quick check tests</h2>
          <ol className="mt-4 space-y-3">
            {quickScanTests.map((test) => (
              <li key={test.id} className="flex gap-3 text-sm leading-snug">
                <span className={`font-mono text-xs pt-0.5 w-14 shrink-0 ${muted}`}>{test.id}</span>
                <span>{plainTestName(test)}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`mt-5 min-h-10 text-sm font-semibold underline underline-offset-4 cursor-pointer ${focusRing}`}
          >
            Browse all {expectedRegistryCount} tests
          </button>
        </aside>
      </section>

      <section aria-labelledby="limits-title" className="grid gap-8 md:grid-cols-[minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="limits-title" className="text-2xl font-bold tracking-[-0.02em]">What a web page can and cannot know</h2>
          <p className={`mt-3 text-sm leading-relaxed ${muted}`}>
            Results are evidence about your browser, not a verdict on any product.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('methodology')}
            className={`mt-3 min-h-10 text-sm font-semibold underline underline-offset-4 cursor-pointer ${focusRing}`}
          >
            How results are measured
          </button>
        </div>
        <div>
          <h3 className="text-sm font-bold">It can see</h3>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed list-disc pl-5">
            {CAN_SEE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">It cannot see</h3>
          <ul className={`mt-3 space-y-3 text-sm leading-relaxed list-disc pl-5 ${muted}`}>
            {CANNOT_SEE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <details className={`p-4 sm:p-5 rounded-sm border text-sm group max-w-3xl ${subSurface}`}>
        <summary className={`min-h-10 flex items-center font-semibold cursor-pointer select-none ${focusRing}`}>
          What this page can read about your browser
        </summary>
        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt className={muted}>Browser engine (best guess)</dt>
            <dd className="font-semibold">{envDiagnostics ? envDiagnostics.engineHint : 'Checking…'}</dd>
          </div>
          <div>
            <dt className={muted}>Window size</dt>
            <dd className="font-semibold">{envDiagnostics?.viewport || 'Checking…'}</dd>
          </div>
          <div>
            <dt className={muted}>Global Privacy Control</dt>
            <dd className="font-semibold">
              {!envDiagnostics
                ? 'Checking…'
                : envDiagnostics.globalPrivacyControl === 'true'
                ? 'On'
                : envDiagnostics.globalPrivacyControl === 'Unsupported'
                ? 'Not supported by this browser'
                : 'Off'}
            </dd>
          </div>
          <div>
            <dt className={muted}>Do Not Track</dt>
            <dd className="font-semibold">{!envDiagnostics ? 'Checking…' : envDiagnostics.doNotTrack === '1' ? 'On' : 'Off'}</dd>
          </div>
        </dl>
        <p className={`mt-4 ${muted}`}>
          None of this reveals your extensions, VPN, or DNS settings.
        </p>
      </details>
    </div>
  );
}
