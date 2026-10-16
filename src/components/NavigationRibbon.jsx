import React from 'react';
import {
  Play,
  Pause,
  Square,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Layers,
  Sliders
} from 'lucide-react';

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
  coreBlockingTests,
  testRegistry,
  expectedRegistryCount,
  darkMode,
  setDarkMode,
  normalizedTab,
  setActiveTab,
  fixtureServerStatus,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const tabs = [
    { id: 'overview', label: 'Overview & Scanner', icon: ShieldCheck },
    { id: 'results', label: 'Results & Workbench', icon: CheckCircle2 },
    { id: 'real-ads', label: 'Real Ads Stress Lab', icon: Zap },
    { id: 'methodology', label: 'Methodology & Audit', icon: Layers },
    { id: 'settings', label: 'Settings & Lab', icon: Sliders }
  ];

  return (
    <>
      {/* Top Header */}
      <header className={`sticky top-0 z-30 border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 ${surface}`}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full border-2 border-[#c65322] text-[#c65322] flex items-center justify-center font-bold text-sm select-none"
            aria-hidden="true"
          >
            AB
          </div>
          <div>
            <div className="font-bold text-base tracking-[-0.02em]">{brandName}</div>
            <div className={`text-[11px] ${muted}`}>Evidence-led browser diagnostics · v{appVersion}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs tabular-nums">
          {/* Core Score Badge */}
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

          {/* Privacy Signals Badge */}
          <div
            title="Browser Privacy & Hardening Signals: Evaluated separately so GPC/DNT or WebGL masking never inflate the Ad-Blocking Score."
            className={`hidden md:flex px-3 py-1.5 rounded-sm border items-center gap-2 ${subSurface}`}
          >
            <span className={`text-[10px] ${muted}`}>PRIVACY SIGNALS</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {scoreSummary.privacySignalsSummary.activeCount}/{scoreSummary.privacySignalsSummary.totalSignals} ACTIVE
            </span>
          </div>

          {/* Run / Abort Action Controls */}
          {!isActiveRun ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => runTestsBatch(coreBlockingTests)}
                className={`hidden lg:inline-flex items-center gap-1 px-3 min-h-10 rounded-sm text-[11px] font-semibold border border-[#355f50] text-[#216447] dark:text-[#52b788] hover:bg-[#e5f1e8] dark:hover:bg-[#1a3028] cursor-pointer transition-colors ${focusRing}`}
                title={`Run only the ${coreBlockingTests.length} Core Controlled Ad & Tracker Blocking Fixtures`}
              >
                <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                Run core ({coreBlockingTests.length})
              </button>
              <button
                type="button"
                onClick={() => runTestsBatch(testRegistry)}
                className={`inline-flex items-center gap-1 px-3.5 min-h-10 rounded-sm text-[11px] font-semibold bg-[#c65322] hover:bg-[#a9431c] text-white cursor-pointer shadow-xs transition-colors ${focusRing}`}
                title={`Run all ${expectedRegistryCount} tests across all 14 domains`}
              >
                <Play aria-hidden="true" className="w-3 h-3 fill-current" />
                Run full diagnostic
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5" role="group" aria-label="Run controls">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`inline-flex items-center gap-1 px-2.5 min-h-10 rounded-xs text-[11px] font-semibold border cursor-pointer ${subSurface} ${focusRing}`}
              >
                {isPaused ? <Play aria-hidden="true" className="w-3 h-3 fill-current" /> : <Pause aria-hidden="true" className="w-3 h-3" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={handleCancelRun}
                className={`inline-flex items-center gap-1 px-3 min-h-10 rounded-xs text-[11px] font-semibold bg-rose-700 hover:bg-rose-600 text-white cursor-pointer ${focusRing}`}
                title="Immediately aborts in-flight fetch/XHR requests via AbortController"
              >
                <Square aria-hidden="true" className="w-3 h-3 fill-current" />
                Abort Now ({runProgress.completed}/{runProgress.total})
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`min-w-10 min-h-10 p-2 rounded-sm border cursor-pointer flex items-center justify-center transition-colors ${subSurface} ${focusRing}`}
          >
            {darkMode ? <Sun aria-hidden="true" className="w-4 h-4 text-amber-400" /> : <Moon aria-hidden="true" className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Primary 5-Tab Navigation Ribbon */}
      <div className={`border-b px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs ${subSurface}`}>
        <nav className="flex items-center gap-1.5 flex-wrap overflow-x-auto max-w-full py-0.5" aria-label="Primary navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = normalizedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 min-h-10 sm:min-h-9 px-3.5 py-1.5 rounded-sm border text-xs cursor-pointer transition-all ${focusRing} ${
                  active
                    ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] dark:border-[#edf2ee] font-bold shadow-xs'
                    : `border-transparent ${muted} hover:text-[#182024] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5`
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
          <span className={muted}>
            Mode: <strong className="text-current">{fixtureServerStatus?.mode || 'standalone'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-sm border border-slate-300 dark:border-slate-700 bg-black/5 dark:bg-white/5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            SANDBOX ISOLATED
          </span>
        </div>
      </div>
    </>
  );
}
