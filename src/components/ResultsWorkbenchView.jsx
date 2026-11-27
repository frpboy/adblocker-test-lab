import React from 'react';
import { Search, Download, Copy, Check, RotateCcw, X } from 'lucide-react';
import RunSummary from './RunSummary.jsx';
import { scoreVerdict } from '../lab/run-summary.js';
import {
  plainTestName,
  statusLabel,
  GROUP_LABELS,
  GROUP_DESCRIPTIONS,
  STATUS_LEGEND
} from '../lab/plain-language.js';

const INK_ACTIVE = 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] dark:border-[#edf2ee]';

// Outcome colors carry meaning (stopped / in part / got through). Everything
// that is not a clear outcome stays neutral so it does not read as a verdict.
export function StatusBadge({ status, darkMode, RESULT_STATUS, metricGroup }) {
  // An extra check that "succeeded" may have been answered by a blocker's stand-in,
  // so it is shown neutrally as "Completed" rather than as a red "Allowed".
  const extraCompleted = metricGroup === 'EXPLORATORY_PROBE' && status === RESULT_STATUS.ALLOWED;
  const tone = {
    [RESULT_STATUS.BLOCKED]: darkMode ? 'bg-emerald-950 text-emerald-200 border-emerald-700' : 'bg-emerald-50 text-emerald-900 border-emerald-300',
    [RESULT_STATUS.PARTIAL]: darkMode ? 'bg-amber-950 text-amber-200 border-amber-700' : 'bg-amber-50 text-amber-900 border-amber-300',
    [RESULT_STATUS.ALLOWED]: darkMode ? 'bg-rose-950 text-rose-200 border-rose-700' : 'bg-rose-50 text-rose-900 border-rose-300',
    [RESULT_STATUS.SIGNAL_ACTIVE]: darkMode ? 'bg-teal-950 text-teal-200 border-teal-700' : 'bg-teal-50 text-teal-900 border-teal-300'
  }[extraCompleted ? '' : status];
  const neutral = status
    ? darkMode
      ? 'bg-slate-800 text-slate-200 border-slate-600'
      : 'bg-slate-100 text-slate-800 border-slate-300'
    : darkMode
    ? 'bg-transparent text-slate-300 border-slate-700 border-dashed'
    : 'bg-transparent text-slate-600 border-slate-300 border-dashed';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold border whitespace-nowrap ${tone || neutral}`}>
      {status === RESULT_STATUS.RUNNING ? 'Running…' : statusLabel(status, metricGroup)}
    </span>
  );
}

// Memoized (from main, #25): a status change for one test re-renders only that row,
// not all 55. Props are primitives or stable callbacks so the memo holds.
export const TestRow = React.memo(function TestRow({
  test: t,
  result: res,
  isSelected,
  onSelect,
  onRun,
  isActiveRun,
  darkMode,
  muted,
  subSurface,
  focusRing,
  RESULT_STATUS
}) {
  const status = res?.status;
  return (
    <tr
      onClick={() => onSelect(t.id)}
      tabIndex={0}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(t.id);
        }
      }}
      className={`cursor-pointer border-b text-sm align-top ${focusRing} ${darkMode ? 'border-[#26343d]' : 'border-[#e2dbcd]'} ${
        isSelected ? (darkMode ? 'bg-[#22313a]' : 'bg-[#f6e6dc]') : darkMode ? 'hover:bg-[#1b262e]' : 'hover:bg-[#f7f3ea]'
      }`}
    >
      <td className="py-2.5 px-3">
        <span className="block font-medium leading-snug">{plainTestName(t)}</span>
        <span className={`block font-mono text-xs mt-0.5 ${muted}`}>{t.id}</span>
      </td>
      <td className={`py-2.5 px-2 whitespace-nowrap hidden md:table-cell text-xs ${muted}`}>{GROUP_LABELS[t.metricGroup]}</td>
      <td className="py-2.5 px-2">
        <StatusBadge status={status} darkMode={darkMode} RESULT_STATUS={RESULT_STATUS} metricGroup={t.metricGroup} />
      </td>
      <td className={`py-2.5 px-2 hidden sm:table-cell text-right font-mono text-xs tabular-nums whitespace-nowrap ${muted}`}>
        {res?.durationMs ? `${res.durationMs} ms` : '\u2013'}
      </td>
      <td className="py-1.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onRun([t])}
          disabled={isActiveRun}
          aria-label={`Run ${t.id}`}
          className={`min-h-10 min-w-12 px-2.5 rounded-sm border text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${subSurface} hover:border-[#c65322] ${focusRing}`}
        >
          Run
        </button>
      </td>
    </tr>
  );
});

// Shape for each grid cell, so the result does not depend on seeing colour.
function gridMark(status, RESULT_STATUS, metricGroup) {
  if (!status) return '·';
  if (metricGroup === 'EXPLORATORY_PROBE' && status === RESULT_STATUS.ALLOWED) return '→';
  if (status === RESULT_STATUS.BLOCKED) return '✓';
  if (status === RESULT_STATUS.PARTIAL) return '◐';
  if (status === RESULT_STATUS.ALLOWED) return '✕';
  if (status === RESULT_STATUS.SIGNAL_ACTIVE) return '●';
  return '?';
}

export default function ResultsWorkbenchView({
  isActiveRun,
  isPaused,
  handleTogglePause,
  handleCancelRun,
  runProgress,
  scoreSummary,
  resultsMap,
  testRegistry,
  coreBlockingTests,
  privacySignalTests,
  exploratoryTests,
  metricGroups,
  groupFilter,
  setGroupFilter,
  statusFilter,
  setStatusFilter,
  sectionFilter,
  setSectionFilter,
  allSections,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  showWaferMatrix,
  setShowWaferMatrix,
  filteredTests,
  inspectedTestId,
  setInspectedTestId,
  inspectedTest,
  inspectedResult,
  runTestsBatch,
  copiedRule,
  handleCopyRule,
  triggerDownload,
  generateExtractedHtmlReport,
  generateJsonReport,
  generateCsvReport,
  protectionAnalysis,
  userReported,
  envDiagnostics,
  brandName,
  appVersion,
  brandPromise,
  darkMode,
  surface,
  subSurface,
  muted,
  focusRing,
  buildProtectionTraceStages,
  CONFIDENCE,
  RESULT_STATUS,
  notifyError = () => {},
  notify = () => {},
  lastRun = null,
  savedAt = null,
  restoredFromEarlierVisit = false,
  onClearResults = () => {}
}) {

  const isFiltered = groupFilter !== 'ALL' || statusFilter !== 'ALL' || sectionFilter !== 'ALL' || searchQuery.trim() !== '';
  const resetAllFilters = () => {
    setGroupFilter('ALL');
    setStatusFilter('ALL');
    setSectionFilter('ALL');
    setSearchQuery('');
  };

  const hasScore = scoreSummary.overallScore !== null;
  const { title: verdictTitle, body: verdictBody } = scoreVerdict(scoreSummary);
  const privacy = scoreSummary.privacySignalsSummary;
  const activeCategory = sectionFilter.startsWith('cat:')
    ? scoreSummary.categoryBreakdown.find((c) => `cat:${c.id}` === sectionFilter)
    : null;
  const progressPct = Math.round((runProgress.completed / (runProgress.total || 1)) * 100);

  const pill = (active) =>
    `min-h-10 sm:min-h-9 px-3 rounded-sm border text-sm cursor-pointer transition-colors ${focusRing} ${
      active ? `${INK_ACTIVE} font-semibold` : `${subSurface} hover:bg-black/5 dark:hover:bg-white/5`
    }`;

  return (
    <div className="space-y-8">
      {isActiveRun && (
        <div className={`p-4 sm:p-5 rounded-sm border-2 border-[#c65322] space-y-3 ${surface}`} role="status" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong className="font-semibold">{isPaused ? 'Paused' : 'Testing…'}</strong>{' '}
              <span className={muted}>
                {runProgress.completed} of {runProgress.total} done
                {runProgress.currentTestId ? `, now on ${runProgress.currentTestId}` : ''}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleTogglePause} className={`min-h-10 px-3 rounded-sm border text-sm font-semibold cursor-pointer ${subSurface} ${focusRing}`}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button type="button" onClick={handleCancelRun} className={`min-h-10 px-3 rounded-sm bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold cursor-pointer ${focusRing}`}>
                Stop
              </button>
            </div>
          </div>
          <div
            className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-sm overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label="Test run progress"
          >
            <div className="h-full bg-[#c65322] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Score: the one focal point of this screen. Coverage is stated before the number. */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" aria-labelledby="score-title">
        <div className={`p-5 sm:p-7 rounded-sm border ${surface}`}>
          <h1 id="score-title" className={`text-sm font-semibold ${muted}`}>
            Test-probe score
          </h1>
          <p className="mt-2 text-sm">
            {hasScore
              ? `Based on ${scoreSummary.eligibleTotalTests} of ${scoreSummary.maxScoredTests} scored tests`
              : `Up to ${scoreSummary.maxScoredTests} tests count toward this score`}
          </p>
          <div className="mt-3 flex items-baseline gap-2 tabular-nums">
            {hasScore ? (
              <>
                <span className="text-7xl sm:text-8xl font-bold tracking-[-0.05em] leading-none">{scoreSummary.overallScore}</span>
                <span className={`text-2xl ${muted}`}>/100</span>
              </>
            ) : (
              <span className="text-3xl font-bold tracking-[-0.02em]">Not run yet</span>
            )}
          </div>
          {hasScore && (
            // Score bar (DESIGN.md: the score gets real presence). Ink fill, orange end mark.
            <div
              role="meter"
              aria-label="Blocking score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={scoreSummary.overallScore}
              className="mt-4 relative h-3 max-w-xl rounded-sm bg-[#e2dbcd] dark:bg-[#2b3b45]"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-sm bg-[#24373f] dark:bg-[#edf2ee]"
                style={{ width: `${Math.max(0, Math.min(100, scoreSummary.overallScore))}%` }}
              />
              <div
                aria-hidden="true"
                className="absolute -top-1 -bottom-1 w-1 rounded-sm bg-[#c65322]"
                style={{ left: `calc(${Math.max(0, Math.min(100, scoreSummary.overallScore))}% - 2px)` }}
              />
            </div>
          )}
          <h2 className="mt-6 text-2xl font-bold tracking-[-0.02em]">{verdictTitle}</h2>
          <p className={`mt-2 text-base leading-relaxed max-w-prose ${muted}`}>{verdictBody}</p>
          {hasScore && (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm tabular-nums">
              <li><span aria-hidden="true">{'✓'} </span><strong className="font-semibold">{scoreSummary.passedCount}</strong> blocked</li>
              <li><span aria-hidden="true">{'◐'} </span><strong className="font-semibold">{scoreSummary.partialCount}</strong> partial</li>
              <li><span aria-hidden="true">{'✕'} </span><strong className="font-semibold">{scoreSummary.failedCount}</strong> got through</li>
              <li className={muted}>
                <span aria-hidden="true">? </span><strong className="font-semibold">{scoreSummary.scoredUnmeasuredCount}</strong> could not be measured
              </li>
            </ul>
          )}
          {hasScore && Array.isArray(scoreSummary.evidenceGroups) && scoreSummary.evidenceGroups.length > 0 && (
            <div className="mt-6" data-testid="evidence-groups">
              <h3 className={`text-sm font-semibold ${muted}`}>What the score is made of</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {scoreSummary.evidenceGroups.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span><strong className="font-semibold">{g.label}</strong> <span className={muted}>({g.scored} {g.scored === 1 ? 'test' : 'tests'})</span></span>
                    <span className="tabular-nums">
                      {g.blocked} blocked, {g.partial} partial, {g.allowed} got through
                      {g.share !== null ? <span className={muted}>{` · ${g.share}%`}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={`mt-3 text-xs leading-relaxed max-w-prose ${muted}`}>
                The headline number is a weighted average of {scoreSummary.categoryBreakdown.filter((c) => c.eligibleCount > 0).length} categories (weights in Settings), so it is not simply blocked tests divided by all tests. These are fake probes served from this site. A DNS or network-level blocker cannot hide page elements or match these paths, so it is not fairly measured here.
              </p>
            </div>
          )}
        </div>

        <div className={`p-5 sm:p-6 rounded-sm border flex flex-col ${subSurface}`}>
          <h2 className={`text-sm font-semibold ${muted}`}>Privacy settings</h2>
          <p className="mt-3 text-3xl font-bold tabular-nums">
            {privacy.executedSignals ? `${privacy.activeCount} of ${privacy.totalSignals} on` : 'Not checked yet'}
          </p>
          <p className={`mt-3 text-sm leading-relaxed ${muted}`}>
            Signals like Global Privacy Control and fingerprinting guards. They are reported here and never added to the test-probe score.
          </p>
          <button
            type="button"
            onClick={() => setGroupFilter(metricGroups.PRIVACY_SIGNAL)}
            className={`mt-auto pt-4 self-start min-h-10 text-sm font-semibold underline underline-offset-4 cursor-pointer ${focusRing}`}
          >
            Show privacy checks
          </button>
        </div>
      </section>

      {!isActiveRun && (
        <RunSummary
          scoreSummary={scoreSummary}
          resultsMap={resultsMap}
          registry={testRegistry}
          lastRun={lastRun}
          savedAt={savedAt}
          restoredFromEarlierVisit={restoredFromEarlierVisit}
          onClearResults={onClearResults}
          notify={notify}
          surface={surface}
          subSurface={subSurface}
          muted={muted}
          focusRing={focusRing}
        />
      )}

      <section aria-labelledby="categories-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="categories-title" className="text-xl font-bold tracking-[-0.01em]">Results by category</h2>
            <p className={`text-sm ${muted}`}>Select a category to list only its tests below.</p>
          </div>
          {activeCategory && (
            <button type="button" onClick={() => setSectionFilter('ALL')} className={`min-h-10 text-sm font-semibold underline underline-offset-4 cursor-pointer ${focusRing}`}>
              Show all categories
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {scoreSummary.categoryBreakdown.map((cat) => {
            const hasEligible = cat.eligibleCount > 0;
            const pct = hasEligible ? cat.rawScore : 0;
            const selected = sectionFilter === `cat:${cat.id}`;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSectionFilter(selected ? 'ALL' : `cat:${cat.id}`)}
                aria-pressed={selected}
                className={`p-4 rounded-sm border text-left cursor-pointer transition-colors space-y-2 ${focusRing} ${
                  selected ? 'border-[#c65322] ring-1 ring-[#c65322]' : 'hover:border-[#c65322]'
                } ${surface}`}
              >
                <span className="block text-sm font-semibold leading-snug">{cat.name}</span>
                <span className="flex items-baseline justify-between gap-2 tabular-nums">
                  <span className="text-2xl font-bold">{hasEligible ? `${cat.rawScore}%` : '–'}</span>
                  <span className={`text-xs ${muted}`}>
                    {hasEligible ? `${cat.catBlocked} of ${cat.eligibleCount} blocked` : 'No clear results yet'}
                  </span>
                </span>
                <span className="block w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-sm overflow-hidden" aria-hidden="true">
                  <span className={`block h-full ${pct >= 80 ? 'bg-emerald-600' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-600'}`} style={{ width: `${pct}%` }} />
                </span>
                <span className={`block text-xs ${muted}`}>Weight in score: {cat.configuredWeight}%</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="tests-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="tests-title" className="text-xl font-bold tracking-[-0.01em]">All tests</h2>
            <dl className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm ${muted}`}>
              {STATUS_LEGEND.map(([term, meaning]) => (
                <div key={term} className="flex gap-1.5">
                  <dt className="font-semibold text-current">{term}:</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className={`p-3 rounded-sm border space-y-3 ${surface}`}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Test type">
            {[
              { id: 'ALL', label: `All (${testRegistry.length})` },
              { id: metricGroups.AD_TRACKER_BLOCKING, label: `Scored (${coreBlockingTests.length})` },
              { id: metricGroups.PRIVACY_SIGNAL, label: `Privacy (${privacySignalTests.length})` },
              { id: metricGroups.EXPLORATORY_PROBE, label: `Extra checks (${exploratoryTests.length})` }
            ].map((g) => (
              <button key={g.id} type="button" onClick={() => setGroupFilter(g.id)} aria-pressed={groupFilter === g.id} className={pill(groupFilter === g.id)}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Result">
              {[
                ['ALL', 'Any result'],
                ['BLOCKED', 'Blocked'],
                ['PARTIAL', 'Partial'],
                ['ALLOWED', 'Allowed'],
                ['OTHER', 'Other']
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setStatusFilter(id)} aria-pressed={statusFilter === id} className={pill(statusFilter === id)}>
                  {label}
                </button>
              ))}
            </div>
            <select
              aria-label="Filter by section"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className={`min-h-10 sm:min-h-9 px-2 rounded-sm border text-sm max-w-full ${subSurface} ${focusRing}`}
            >
              <option value="ALL">All sections</option>
              {activeCategory && <option value={sectionFilter}>Category: {activeCategory.name}</option>}
              {allSections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <label className="relative flex-1 min-w-[12rem]">
              <span className="sr-only">Search tests</span>
              <Search aria-hidden="true" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchQuery) {
                    e.stopPropagation();
                    setSearchQuery('');
                  }
                }}
                placeholder="Search tests (press /)"
                className={`w-full min-h-10 sm:min-h-9 pl-8 ${searchQuery ? 'pr-11' : 'pr-2'} rounded-sm border text-sm [&::-webkit-search-cancel-button]:hidden ${subSurface} ${focusRing}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  title="Clear search (Esc)"
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:h-9 flex items-center justify-center rounded-sm cursor-pointer ${focusRing}`}
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                </button>
              )}
            </label>
            {isFiltered && (
              <button type="button" onClick={resetAllFilters} className={`inline-flex items-center gap-1.5 min-h-10 sm:min-h-9 px-3 rounded-sm border text-sm font-semibold cursor-pointer ${subSurface} ${focusRing}`}>
                <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
            <button type="button" onClick={() => setShowWaferMatrix((prev) => !prev)} aria-expanded={showWaferMatrix} className={`min-h-10 sm:min-h-9 px-3 rounded-sm border text-sm cursor-pointer ${subSurface} ${focusRing}`}>
              {showWaferMatrix ? 'Hide result grid' : 'Show result grid'}
            </button>
          </div>
        </div>

        {showWaferMatrix && (
          <div className={`p-4 rounded-sm border space-y-3 ${surface}`}>
            <p className={`text-sm ${muted}`}>Every test at a glance. Select one to see its details.</p>
            <div className="grid grid-cols-5 sm:grid-cols-11 gap-1.5 font-mono tabular-nums text-center">
              {testRegistry.map((t) => {
                const st = resultsMap[t.id]?.status;
                const selected = inspectedTestId === t.id;
                let cell = darkMode ? 'bg-[#111a20] border-[#354955] text-slate-300' : 'bg-[#f4f0e7] border-[#c9c1b2] text-slate-700';
                if (st === RESULT_STATUS.BLOCKED) cell = 'bg-emerald-700 text-white border-emerald-700';
                else if (st === RESULT_STATUS.PARTIAL) cell = 'bg-amber-400 text-slate-950 border-amber-500';
                else if (st === RESULT_STATUS.ALLOWED && t.metricGroup === 'EXPLORATORY_PROBE') cell = 'bg-slate-600 text-white border-slate-600';
                else if (st === RESULT_STATUS.ALLOWED) cell = 'bg-rose-700 text-white border-rose-700';
                else if (st === RESULT_STATUS.SIGNAL_ACTIVE) cell = 'bg-teal-700 text-white border-teal-700';
                else if (st) cell = 'bg-slate-600 text-white border-slate-600';
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setInspectedTestId(t.id)}
                    aria-label={`${t.id}: ${plainTestName(t)}. ${statusLabel(st, t.metricGroup)}`}
                    aria-pressed={selected}
                    className={`min-h-10 rounded-sm border text-xs font-semibold cursor-pointer ${cell} ${selected ? 'ring-2 ring-[#c65322] ring-offset-1' : ''} ${focusRing}`}
                  >
                    <span aria-hidden="true" className="mr-1">{gridMark(st, RESULT_STATUS, t.metricGroup)}</span>
                    {t.id}
                  </button>
                );
              })}
            </div>
            <p className={`text-xs ${muted}`}>
              Key: {'✓'} blocked, {'◐'} partial, {'✕'} allowed, {'→'} extra check completed, {'●'} privacy setting on, ? other result, {'·'} not run
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className={`lg:col-span-7 border rounded-sm overflow-hidden ${surface}`}>
            <div className={`px-3 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-sm ${subSurface}`}>
              <span className="font-semibold" aria-live="polite">
                {filteredTests.length === testRegistry.length ? `${filteredTests.length} tests` : `${filteredTests.length} of ${testRegistry.length} tests`}
              </span>
              <span className={`hidden md:inline text-xs ${muted}`}>Arrow keys move, R runs the selected test</span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="p-6 text-sm space-y-3">
                <p>No tests match these filters.</p>
                <button type="button" onClick={resetAllFilters} className={`min-h-10 font-semibold underline underline-offset-4 cursor-pointer ${focusRing}`}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="max-h-[640px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`sticky top-0 z-10 border-b text-xs ${subSurface} ${muted}`}>
                    <tr>
                      <th scope="col" className="py-2 px-3 font-semibold">Test</th>
                      <th scope="col" className="py-2 px-2 font-semibold hidden md:table-cell">Type</th>
                      <th scope="col" className="py-2 px-2 font-semibold">Result</th>
                      <th scope="col" className="py-2 px-2 font-semibold hidden sm:table-cell text-right">Time</th>
                      <th scope="col" className="py-2 px-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map((t) => (
                      <TestRow
                        key={t.id}
                        test={t}
                        result={resultsMap[t.id]}
                        isSelected={inspectedTestId === t.id}
                        onSelect={setInspectedTestId}
                        onRun={runTestsBatch}
                        isActiveRun={isActiveRun}
                        darkMode={darkMode}
                        muted={muted}
                        subSurface={subSurface}
                        focusRing={focusRing}
                        RESULT_STATUS={RESULT_STATUS}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {inspectedTest && (
            <aside className={`lg:col-span-5 border rounded-sm lg:sticky lg:top-20 p-4 sm:p-5 space-y-5 ${surface}`} aria-labelledby="detail-title">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-xs ${muted}`}>
                    <span className="font-mono">{inspectedTest.id}</span> · {GROUP_LABELS[inspectedTest.metricGroup]} · {inspectedTest.section}
                  </p>
                  <h2 id="detail-title" className="text-lg font-bold leading-snug mt-1">{plainTestName(inspectedTest)}</h2>
                  <p className={`text-xs mt-1 ${muted}`}>{inspectedTest.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => runTestsBatch([inspectedTest])}
                  disabled={isActiveRun}
                  className={`min-h-10 px-3 rounded-sm text-sm font-semibold border cursor-pointer disabled:opacity-40 shrink-0 ${subSurface} hover:border-[#c65322] ${focusRing}`}
                >
                  Run again
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${muted}`}>Result</span>
                  <StatusBadge status={inspectedResult?.status} darkMode={darkMode} RESULT_STATUS={RESULT_STATUS} metricGroup={inspectedTest.metricGroup} />
                </div>
                <p className={`text-sm leading-relaxed ${muted}`}>{GROUP_DESCRIPTIONS[inspectedTest.metricGroup]}</p>
                <dl className="text-sm space-y-1.5">
                  <div>
                    <dt className={`text-xs ${muted}`}>Compared against (reference)</dt>
                    <dd className="font-mono text-xs break-words">{inspectedTest.controlResource}</dd>
                  </div>
                  <div>
                    <dt className={`text-xs ${muted}`}>What was tested</dt>
                    <dd className="font-mono text-xs break-words">{inspectedTest.testResource}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold">How this result was reached</h3>
                  <span className={`text-xs ${muted}`}>{inspectedResult?.confidence?.label || 'Not run yet'}</span>
                </div>
                <ol className="space-y-2">
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
                    <li key={st.step} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-sm">
                      <span className={`font-mono text-xs pt-0.5 ${muted}`}>{st.step}.</span>
                      <div className="min-w-0">
                        <span className="font-semibold">{st.label}</span>{' '}
                        <span className={`text-xs ${muted}`}>
                          ({st.evidenceType === 'OBSERVED' ? 'observed' : st.evidenceType === 'INFERRED' ? 'inferred' : 'not observable'})
                        </span>
                        <p className={`text-xs mt-0.5 break-words leading-relaxed ${muted}`}>{st.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">Filter rule that targets this</h3>
                  <button
                    type="button"
                    onClick={() => handleCopyRule(inspectedTest.recommendedRule)}
                    className={`inline-flex items-center gap-1.5 min-h-10 px-2 text-sm font-semibold cursor-pointer ${focusRing}`}
                  >
                    {copiedRule ? <Check aria-hidden="true" className="w-4 h-4" /> : <Copy aria-hidden="true" className="w-4 h-4" />}
                    {copiedRule ? 'Copied' : 'Copy rule'}
                  </button>
                </div>
                <pre className={`text-xs font-mono whitespace-pre-wrap break-all p-3 rounded-sm border ${subSurface}`}>{inspectedTest.recommendedRule}</pre>
                <p className={`text-sm leading-relaxed ${muted}`}>
                  <strong className="font-semibold text-current">What this cannot prove: </strong>
                  {inspectedTest.audit.limitations}
                </p>
              </div>
            </aside>
          )}
        </div>
      </section>

      <section className={`p-4 sm:p-5 rounded-sm border flex flex-wrap items-center justify-between gap-4 ${subSurface}`} aria-labelledby="export-title">
        <div className="max-w-prose">
          <h2 id="export-title" className="text-base font-bold">Download your results</h2>
          <p className={`text-sm ${muted}`}>Each file includes every result, its evidence, and what the page could not see.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            {
              label: 'Report (HTML)',
              run: () => {
                triggerDownload(
                  generateExtractedHtmlReport({ brandName, appVersion, brandPromise, registry: testRegistry, scoreSummary, resultsMap, userReported }),
                  'adblocker-test-lab-report.html',
                  'text/html;charset=utf-8;'
                );
              }
            },
            {
              label: 'Data (JSON)',
              run: () => {
                triggerDownload(
                  generateJsonReport({ scoreSummary, protectionAnalysis, userReported, envDiagnostics, resultsMap }),
                  'adblocker-test-lab-benchmark.json',
                  'application/json'
                );
              }
            },
            {
              label: 'Spreadsheet (CSV)',
              run: () => {
                triggerDownload(generateCsvReport(resultsMap), 'adblocker-test-lab-results.csv', 'text/csv;charset=utf-8;');
              }
            }
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                try {
                  item.run();
                } catch {
                  notifyError(`Couldn't build the ${item.label.toLowerCase()}. Try again.`);
                }
              }}
              className={`inline-flex items-center gap-1.5 min-h-10 px-3 rounded-sm border text-sm font-semibold cursor-pointer ${surface} hover:border-[#c65322] ${focusRing}`}
            >
              <Download aria-hidden="true" className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
