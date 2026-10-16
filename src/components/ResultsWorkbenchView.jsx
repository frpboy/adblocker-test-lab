import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Search,
  Download,
  Copy,
  Check,
  FileText,
  Filter,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function StatusBadge({ status, darkMode, RESULT_STATUS }) {
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

export default function ResultsWorkbenchView({
  isActiveRun,
  isPaused,
  handleTogglePause,
  handleCancelRun,
  runProgress,
  scoreSummary,
  resultsMap,
  fixtureServerStatus,
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
  RESULT_STATUS
}) {
  const [exportNotice, setExportNotice] = useState('');

  const showExportNotice = (msg) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(''), 3000);
  };

  const isFiltered = groupFilter !== 'ALL' || statusFilter !== 'ALL' || sectionFilter !== 'ALL' || searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setGroupFilter('ALL');
    setStatusFilter('ALL');
    setSectionFilter('ALL');
    setSearchQuery('');
  };

  const hasRuns = scoreSummary && scoreSummary.eligibleTotalTests > 0;

  // Derive dynamic plain-English insight
  let insightText = 'Ready for diagnostics. Launch Quick Scan to evaluate core display and tracking interception.';
  let insightType = 'neutral';
  if (hasRuns) {
    const score = scoreSummary.overallScore ?? 0;
    if (score >= 85) {
      insightText = 'Robust ad and tracker suppression detected. Observable network endpoints and cosmetic styles successfully intercept ad delivery without breaking page flow.';
      insightType = 'positive';
    } else if (score >= 50) {
      insightText = 'Moderate ad blocking active. Common standard banners were blocked, but dynamic script injections or affiliate paths passed through to the browser.';
      insightType = 'warning';
    } else {
      insightText = 'Low ad blocking detected. The majority of ad requests, trackers, and dynamic scripts reached the browser uninhibited. Check your extension or filter settings.';
      insightType = 'alert';
    }
  }

  return (
    <div className="space-y-6">
      {/* Active Execution HUD */}
      {isActiveRun && (
        <div
          className={`p-4 rounded-xs border-2 border-[#c65322] space-y-3 shadow-md ${surface}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c65322] animate-ping" />
              <span className="font-bold uppercase tracking-wider text-[#c65322]">
                {isPaused ? 'Diagnostic Paused' : 'Diagnostic in Progress'}
              </span>
              <span className={muted}>
                · Current: <strong>{runProgress.currentTestId || 'Starting'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePause}
                className={`px-3 py-1 rounded-xs border text-xs font-semibold cursor-pointer ${subSurface} ${focusRing}`}
              >
                {isPaused ? 'Resume Run' : 'Pause Run'}
              </button>
              <button
                type="button"
                onClick={handleCancelRun}
                className={`px-3 py-1 rounded-xs bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer ${focusRing}`}
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

      {/* Coverage & Score Summary Cards */}
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
              ? `Calculated from ${scoreSummary.eligibleTotalTests} eligible controlled ad/tracker blocking fixtures.`
              : 'Launch Quick Scan or Full Diagnostic to evaluate score.'}
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono tabular-nums flex-wrap">
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
            Browser privacy features (GPC, DNT, referrer policy) harden browser defense without inflating the core ad score.
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
            Direct client-side observations from relative-path fixtures; no speculative inference on unseen network layers.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded-xs border ${subSurface}`}>
              Mode: {fixtureServerStatus?.mode || 'standalone'}
            </span>
            <span className={`text-[11px] ${muted}`}>
              {scoreSummary.inconclusiveCount} Inconclusive
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Actionable Insight Box */}
      <div className={`p-4 rounded-xs border flex items-start gap-3 ${subSurface}`}>
        {insightType === 'positive' && <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
        {insightType === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
        {insightType === 'alert' && <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
        {insightType === 'neutral' && <Sparkles className="w-5 h-5 text-[#c65322] shrink-0 mt-0.5" />}
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Audit Observation &amp; Next Action
          </div>
          <p className={`text-xs leading-relaxed ${muted}`}>{insightText}</p>
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
            className={`text-xs font-semibold underline underline-offset-4 cursor-pointer text-[#c65322] ${focusRing}`}
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
                  const matchingTest = testRegistry.find((t) => t.scoringCategory === cat.id);
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
          <FileText className="w-4 h-4 text-[#c65322] shrink-0" />
          <div>
            <span className="font-bold uppercase font-mono tracking-wider">Sanitized Benchmark Exports</span>
            <div className={`text-[11px] ${muted}`}>
              Export verified telemetry with HTML escaping, separated privacy indices, and audit boundaries.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {exportNotice && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
              {exportNotice}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              triggerDownload(
                generateExtractedHtmlReport({
                  brandName,
                  appVersion,
                  brandPromise,
                  registry: testRegistry,
                  scoreSummary,
                  resultsMap,
                  userReported
                }),
                'adblocker-test-lab-report.html',
                'text/html;charset=utf-8;'
              );
              showExportNotice('Exported HTML report');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${focusRing}`}
          >
            <Download className="w-3.5 h-3.5" />
            Export HTML
          </button>
          <button
            type="button"
            onClick={() => {
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
              );
              showExportNotice('Exported JSON benchmark');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${focusRing}`}
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => {
              triggerDownload(
                generateCsvReport(resultsMap),
                'adblocker-test-lab-results.csv',
                'text/csv;charset=utf-8;'
              );
              showExportNotice('Exported CSV data');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border font-mono text-xs font-semibold cursor-pointer ${subSurface} hover:bg-black/5 dark:hover:bg-white/5 ${focusRing}`}
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
              { id: 'ALL', label: `ALL (${testRegistry.length})` },
              { id: metricGroups.AD_TRACKER_BLOCKING, label: `CORE BLOCKING (${coreBlockingTests.length})` },
              { id: metricGroups.PRIVACY_SIGNAL, label: `PRIVACY SIGNALS (${privacySignalTests.length})` },
              { id: metricGroups.EXPLORATORY_PROBE, label: `EXPLORATORY (${exploratoryTests.length})` }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroupFilter(g.id)}
                className={`px-2.5 py-1 rounded-xs border text-[11px] font-semibold cursor-pointer transition-colors ${
                  groupFilter === g.id
                    ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] font-bold'
                    : `${subSurface} ${muted}`
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

            {/* Reset Filters Pill (visible when filtered) */}
            {isFiltered && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs border border-amber-600/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold cursor-pointer hover:bg-amber-500/20"
                title="Reset active query and filters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset ({filteredTests.length})
              </button>
            )}

            {/* Toggle 55-Pin Matrix */}
            <button
              type="button"
              onClick={() => setShowWaferMatrix((prev) => !prev)}
              className={`px-2.5 py-1 rounded-xs border text-xs font-mono font-semibold cursor-pointer ${subSurface} ${focusRing}`}
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
              {testRegistry.map((t) => {
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

        {/* Workbench Results & Detail Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Main List Column (Desktop Table / Mobile Cards) */}
          <div className={`lg:col-span-7 border rounded-xs overflow-hidden ${surface}`}>
            <div className={`p-2.5 border-b flex items-center justify-between text-xs font-mono ${subSurface}`}>
              <span className="font-bold">Showing {filteredTests.length} Test Vectors</span>
              <span className={muted}>Navigate with ↑/↓ keys · Press R to probe</span>
            </div>

            <div className="max-h-[620px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px]">
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
                  {filteredTests.map((t) => {
                    const res = resultsMap[t.id];
                    const status = res?.status;
                    const duration = res?.durationMs || 0;
                    const barWidthPct = status ? Math.min(100, Math.max(8, Math.round((duration / 180) * 100))) : 0;
                    let barColor = 'bg-slate-400 dark:bg-slate-600';
                    if (status === RESULT_STATUS.BLOCKED) barColor = 'bg-emerald-600 dark:bg-emerald-500';
                    else if (status === RESULT_STATUS.PARTIAL) barColor = 'bg-amber-500';
                    else if (status === RESULT_STATUS.ALLOWED) barColor = 'bg-rose-600 dark:bg-rose-500';
                    else if (status === RESULT_STATUS.SIGNAL_ACTIVE) barColor = 'bg-teal-600 dark:bg-teal-500';
                    else if (status === RESULT_STATUS.REQUEST_FAILED_CAUSE_UNKNOWN) barColor = 'bg-purple-600 dark:bg-purple-500';

                    const groupBadge =
                      t.metricGroup === metricGroups.AD_TRACKER_BLOCKING
                        ? 'CORE_BLK'
                        : t.metricGroup === metricGroups.PRIVACY_SIGNAL
                        ? 'PRIV_SIG'
                        : 'EXPL_NET';

                    const isSelected = inspectedTestId === t.id;

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setInspectedTestId(t.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setInspectedTestId(t.id);
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
                                t.audit.scoringEligible
                                  ? 'bg-sky-500'
                                  : t.metricGroup === metricGroups.PRIVACY_SIGNAL
                                  ? 'bg-teal-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>{t.id}</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] whitespace-nowrap opacity-75">{groupBadge}</td>
                        <td className="py-1.5 px-2.5 max-w-[270px] truncate font-medium" title={t.name}>
                          {t.name}
                        </td>
                        <td className="py-1.5 px-2 whitespace-nowrap">
                          <StatusBadge status={status} darkMode={darkMode} RESULT_STATUS={RESULT_STATUS} />
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[10px] whitespace-nowrap opacity-80">
                          {res?.confidence?.shortLabel || '-'}
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
                            onClick={() => runTestsBatch([t])}
                            disabled={isActiveRun}
                            title={`Probe ${t.id}`}
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
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Audit Drawer / Inspection Panel Column */}
          {inspectedTest && (
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
                  className={`px-2.5 py-1 rounded-xs font-mono text-[11px] font-semibold bg-sky-700 hover:bg-sky-600 text-white cursor-pointer disabled:opacity-40 shrink-0 ${focusRing}`}
                >
                  Re-Probe (R)
                </button>
              </div>

              <div className={`p-2.5 rounded-xs border font-mono text-[11px] space-y-1.5 ${subSurface}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold ${muted}`}>OUTCOME CLASSIFICATION</span>
                  <StatusBadge status={inspectedResult?.status} darkMode={darkMode} RESULT_STATUS={RESULT_STATUS} />
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

              {/* 6-Stage Protection Trace */}
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

              {/* Target Filter Rule */}
              <div className={`p-3 rounded-xs border font-mono text-xs space-y-1.5 ${subSurface}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#c65322]">
                    TARGET FILTER RULE (SYNTHESIS)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRule(inspectedTest.recommendedRule)}
                    className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold cursor-pointer underline underline-offset-2 ${focusRing}`}
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
          )}
        </div>
      </div>
    </div>
  );
}
