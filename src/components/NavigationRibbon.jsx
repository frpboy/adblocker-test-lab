import React from 'react';
import { Play, Pause, Square, Sun, Moon } from 'lucide-react';
import LogoMark from './LogoMark.jsx';
import { PRIMARY_NAV_TABS } from '../lab/navigation.js';

export default function NavigationRibbon({
  brandName,
  appVersion,
  scoreSummary,
  isActiveRun,
  isPaused,
  handleTogglePause,
  handleCancelRun,
  runProgress,
  runTestsBatch,
  testRegistry,
  expectedRegistryCount,
  darkMode,
  setDarkMode,
  normalizedTab,
  setActiveTab,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const hasScore = scoreSummary.overallScore !== null;
  const partial = hasScore && scoreSummary.eligibleTotalTests * 2 < scoreSummary.maxScoredTests;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-3 focus:rounded-sm focus:bg-[#24373f] focus:text-white focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#c65322] focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <header className={`md:sticky md:top-0 z-30 border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 ${surface}`}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 min-h-11 text-left cursor-pointer rounded-sm ${focusRing}`}
          aria-label={`${brandName}, go to overview`}
        >
          <LogoMark className="w-9 h-9 shrink-0 text-[#24373f] dark:text-[#edf2ee]" />
          <span>
            <span className="block font-bold text-base tracking-[-0.02em] leading-tight">{brandName}</span>
            <span className={`block text-xs ${muted}`}>Version {appVersion}</span>
          </span>
        </button>

        <div className="flex items-center gap-2 flex-wrap text-sm">
          <div
            className={`px-3 min-h-10 rounded-sm border flex items-center gap-2 tabular-nums ${subSurface}`}
            title={`Ad and tracker blocking score, from up to ${scoreSummary.maxScoredTests} scored tests.`}
          >
            <span className={muted}>Score</span>
            {hasScore ? (
              <span>
                <strong className="font-bold">{scoreSummary.overallScore}</strong>
                <span className={muted}>/100</span>
                <span className={`ml-1.5 text-xs ${muted}`}>
                  {partial ? 'partial, ' : ''}
                  {scoreSummary.eligibleTotalTests} of {scoreSummary.maxScoredTests} tests
                </span>
              </span>
            ) : (
              <span className="font-semibold">Not run yet</span>
            )}
          </div>

          {!isActiveRun ? (
            <button
              type="button"
              onClick={() => runTestsBatch(testRegistry)}
              className={`inline-flex items-center gap-1.5 px-4 min-h-10 rounded-sm font-semibold bg-[#b84a1c] hover:bg-[#9a3d17] text-white cursor-pointer transition-colors ${focusRing}`}
            >
              <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" />
              Full test ({expectedRegistryCount})
            </button>
          ) : (
            <div className="flex items-center gap-2" role="group" aria-label="Run controls">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`inline-flex items-center gap-1.5 px-3 min-h-10 rounded-sm font-semibold border cursor-pointer ${subSurface} ${focusRing}`}
              >
                {isPaused ? <Play aria-hidden="true" className="w-3.5 h-3.5 fill-current" /> : <Pause aria-hidden="true" className="w-3.5 h-3.5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={handleCancelRun}
                className={`inline-flex items-center gap-1.5 px-3 min-h-10 rounded-sm font-semibold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer tabular-nums ${focusRing}`}
              >
                <Square aria-hidden="true" className="w-3 h-3 fill-current" />
                Stop ({runProgress.completed}/{runProgress.total})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`w-10 h-10 rounded-sm border cursor-pointer flex items-center justify-center transition-colors ${subSurface} ${focusRing}`}
          >
            {darkMode ? <Sun aria-hidden="true" className="w-4 h-4" /> : <Moon aria-hidden="true" className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <nav className={`border-b px-2 sm:px-6 ${subSurface}`} aria-label="Primary">
        <ul className="flex flex-wrap md:flex-nowrap gap-x-1 max-w-[1440px] mx-auto">
          {PRIMARY_NAV_TABS.map((tab) => {
            const active = normalizedTab === tab.id;
            return (
              <li key={tab.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-12 px-3 sm:px-4 text-sm whitespace-nowrap border-b-[3px] cursor-pointer transition-colors ${focusRing} ${
                    active
                      ? 'border-[#c65322] font-bold text-current'
                      : `border-transparent ${muted} hover:text-current`
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
