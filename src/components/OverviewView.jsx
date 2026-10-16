import React from 'react';
import { Play, ArrowRight, Shield, ShieldCheck, CheckCircle2, Info, Sparkles } from 'lucide-react';

export default function OverviewView({
  startRun,
  quickScanTests,
  testRegistry,
  expectedRegistryCount,
  isActiveRun,
  setActiveTab,
  envDiagnostics,
  scoreSummary,
  resultsMap,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const hasCompletedRun = scoreSummary && scoreSummary.eligibleTotalTests > 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:items-start" aria-labelledby="overview-title">
        <div className="py-2 sm:py-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm text-[11px] font-mono font-semibold bg-[#c65322]/10 text-[#c65322] border border-[#c65322]/30 mb-4">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>EVIDENCE-FIRST BROWSER DIAGNOSTICS</span>
            </div>
            <h1 id="overview-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02]">
              Inspect browser behavior without inventing the cause.
            </h1>
            <p className={`mt-5 max-w-2xl text-base sm:text-lg leading-relaxed ${muted}`}>
              Run controlled fixtures to measure observable ad blocking, tracker interception, cosmetic filtering, and privacy signals.
              We record direct browser-visible evidence and its limitations — without guessing your extensions, VPN, or DNS resolver.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => startRun(quickScanTests)}
              disabled={isActiveRun}
              className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm font-semibold bg-[#c65322] hover:bg-[#a9431c] text-white disabled:opacity-50 shadow-xs cursor-pointer transition-colors ${focusRing}`}
            >
              <Play aria-hidden="true" className="w-4 h-4 fill-current shrink-0" />
              <span>Run Quick Scan (6 checks · ~1.5s)</span>
            </button>
            <button
              type="button"
              onClick={() => startRun(testRegistry)}
              disabled={isActiveRun}
              className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-sm border font-semibold disabled:opacity-50 cursor-pointer ${surface} hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${focusRing}`}
            >
              <Play aria-hidden="true" className="w-4 h-4 shrink-0" />
              <span>Run Full Diagnostic ({expectedRegistryCount} cases)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`inline-flex items-center justify-center gap-2 min-h-12 px-4 rounded-sm border text-xs font-semibold cursor-pointer ${subSurface} ${focusRing}`}
            >
              <span>View Workbench</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* First-Run Standby Banner or Last Run Summary */}
          {!hasCompletedRun ? (
            <div className={`p-4 rounded-sm border border-dashed border-slate-300 dark:border-slate-700 ${subSurface}`}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#c65322] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    No Eligible Tests Run Yet
                  </div>
                  <p className={`text-xs leading-relaxed ${muted}`}>
                    Diagnostic score begins in standby. Launch <strong>Quick Scan</strong> to verify core ad and tracker interception in ~1.5 seconds, or choose <strong>Full Diagnostic</strong> to benchmark all 55 vectors across 14 categories.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 rounded-sm border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-200">
                      Previous Benchmark Score: {scoreSummary.overallScore}/100
                    </span>
                    <span className={`block text-[11px] ${muted}`}>
                      {scoreSummary.passedCount} Blocked · {scoreSummary.partialCount} Partial · {scoreSummary.failedCount} Allowed ({scoreSummary.eligibleTotalTests} eligible fixtures)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('results')}
                  className={`text-xs font-bold underline underline-offset-4 text-[#c65322] ${focusRing}`}
                >
                  Inspect Results &amp; Audit Trace →
                </button>
              </div>
            </div>
          )}

          {/* 3-Step Visitor Explanation */}
          <div className="pt-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
              What Happens During A Diagnostic Run
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3.5 rounded-sm border ${surface} space-y-1`}>
                <div className="font-mono text-[11px] font-bold text-[#c65322]">1. Controlled Fixtures</div>
                <p className={`text-[11px] leading-relaxed ${muted}`}>
                  Standard network requests, tracking pixels, and ad containers are dispatched into an isolated sandbox.
                </p>
              </div>
              <div className={`p-3.5 rounded-sm border ${surface} space-y-1`}>
                <div className="font-mono text-[11px] font-bold text-[#c65322]">2. Objective Telemetry</div>
                <p className={`text-[11px] leading-relaxed ${muted}`}>
                  Observes network arrival, element dimensions, and script execution without guessing installed extensions.
                </p>
              </div>
              <div className={`p-3.5 rounded-sm border ${surface} space-y-1`}>
                <div className="font-mono text-[11px] font-bold text-[#c65322]">3. Unbiased Audit Score</div>
                <p className={`text-[11px] leading-relaxed ${muted}`}>
                  Calculates score strictly from 35 core ad/tracker vectors. Privacy signals and exploratory probes remain separate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scope & Context Sidebar Column */}
        <div className="space-y-4">
          {/* Quick Scan Scope Card */}
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
              className={`mt-4 text-xs font-semibold underline underline-offset-4 cursor-pointer text-[#c65322] ${focusRing}`}
            >
              Read the evidence methodology →
            </button>
          </aside>

          {/* Detected Browser Context (Collapsible Disclosure) */}
          <details className={`p-4 rounded-xs border text-xs group ${surface}`}>
            <summary className="font-mono text-xs font-bold uppercase tracking-wider cursor-pointer list-none flex items-center justify-between select-none">
              <span>Detected Browser Context</span>
              <span className={`text-[11px] font-sans font-normal ${muted} group-open:hidden`}>Expand context ▾</span>
              <span className={`text-[11px] font-sans font-normal ${muted} hidden group-open:inline`}>Hide context ▴</span>
            </summary>
            <div className="mt-3 space-y-3">
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
                Note: Visible browser properties are diagnostic context only and cannot prove installed extensions, VPNs, or local router filter lists.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
