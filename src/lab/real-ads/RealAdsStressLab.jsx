import { useEffect, useMemo, useRef, useState } from 'react';
import { getAvailableFormats, getRealAdsConfig, REAL_ADS_LEVELS } from './config.js';
import { createAdsterraPlacements } from './adsterra.js';
import { createMonetagPlacements } from './monetag.js';
import { createExoClickPlacements } from './exoclick.js';
import { createRealAdsSession } from './session.js';
import { inspectPlacementEvidence, normalizeRealAdsObservation } from './evidence.js';

function placementsFor(config, level, provider) {
  const byProvider = {
    adsterra: createAdsterraPlacements(config, level),
    monetag: createMonetagPlacements(config, level),
    exoclick: createExoClickPlacements(config, level)
  };
  return provider === 'all' ? Object.values(byProvider).flat() : (byProvider[provider] ?? []);
}

const STATUS_BADGES = {
  REAL_CREATIVE_RENDERED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  SCRIPT_LOADED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  SCRIPT_LOADING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse',
  EMPTY_OR_NO_FILL: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  REQUEST_FAILED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  BLOCKED_OR_FILTERED_POSSIBLE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  PROVIDER_ERROR: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  INCONCLUSIVE: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30',
  NOT_STARTED: 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
};

export default function RealAdsStressLab({ surface, subSurface, muted, focusRing }) {
  const config = useMemo(() => getRealAdsConfig(import.meta.env), []);
  const [level, setLevel] = useState('banner-grid');
  const [provider, setProvider] = useState('adsterra');
  const [formatId, setFormatId] = useState('');
  const [viewport, setViewport] = useState('1280x720');
  const [events, setEvents] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [requiresReloadNotice, setRequiresReloadNotice] = useState(false);
  const [slotStatuses, setSlotStatuses] = useState({});

  const sessionsRef = useRef([]);
  const slotRefs = useRef({});
  const isStartingRef = useRef(false);
  const sessionActiveRef = useRef(false);

  const available = getAvailableFormats(config);
  const providerFormats = placementsFor(config, 'maximum', provider);
  const levelPlacements = placementsFor(config, level, provider);
  const planned = level === 'individual' && formatId
    ? levelPlacements.filter((placement) => placement.id === formatId)
    : levelPlacements;

  const stop = () => {
    let reloadNeeded = false;
    for (const session of sessionsRef.current) {
      const outcome = session.stop();
      if (outcome.requiresReload) reloadNeeded = true;
    }
    sessionsRef.current = [];
    sessionActiveRef.current = false;
    isStartingRef.current = false;
    setSessionActive(false);

    if (reloadNeeded) {
      setRequiresReloadNotice(true);
      setEvents((items) => [
        normalizeRealAdsObservation({
          status: 'INCONCLUSIVE',
          placementId: 'session-controller',
          provider,
          note: 'Popunder attached third-party window listeners. A page reload is required for a clean document.'
        }),
        ...items
      ]);
    }

    setSlotStatuses({});
  };

  // Ensure teardown when unmounting or switching tabs
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const start = async () => {
    if (isStartingRef.current || sessionActiveRef.current || level === 'baseline' || planned.length === 0) return;

    isStartingRef.current = true;
    stop();
    setRequiresReloadNotice(false);

    const next = planned.filter((placement) => !placement.manualOnly);
    if (next.length === 0) {
      isStartingRef.current = false;
      return;
    }

    sessionActiveRef.current = true;
    setSessionActive(true);

    const initialStatuses = {};
    next.forEach((p) => { initialStatuses[p.id] = 'SCRIPT_LOADING'; });
    setSlotStatuses(initialStatuses);

    for (const placement of next) {
      if (!sessionActiveRef.current) break;

      const slotEl = slotRefs.current[placement.id] || null;

      const session = createRealAdsSession({
        document,
        window,
        onEvidence: (observation) => {
          let verifiedVisible = Boolean(observation.visible);
          let detectedStatus = observation.status;
          let note = observation.note;
          let metrics = observation.metrics;
          let alternatives = observation.alternatives;

          // If script finished loading or error occurred, perform evidence inspection on target container
          if (observation.status === 'SCRIPT_LOADED' && slotEl) {
            const inspected = inspectPlacementEvidence(slotEl, placement);
            detectedStatus = inspected.status;
            verifiedVisible = inspected.visible;
            note = inspected.note;
            metrics = inspected.metrics;
            alternatives = inspected.alternatives;
          }

          setSlotStatuses((prev) => ({ ...prev, [placement.id]: detectedStatus }));

          const normalized = normalizeRealAdsObservation({
            ...observation,
            status: detectedStatus,
            visible: verifiedVisible,
            provider: placement.provider,
            format: placement.kind,
            dimensions: placement.size ?? 'provider-defined',
            viewport,
            note,
            metrics,
            alternatives
          });

          setEvents((items) => [normalized, ...items].slice(0, 50));
        }
      });

      sessionsRef.current.push(session);
      const attempt = session.start(placement, slotEl);

      // Re-inspect after creative has time to render inside the frame
      attempt.completion.then(() => {
        if (!sessionActiveRef.current || !slotEl) return;
        setTimeout(() => {
          if (!sessionActiveRef.current || !slotEl) return;
          const delayedCheck = inspectPlacementEvidence(slotEl, placement);
          if (delayedCheck.status === 'REAL_CREATIVE_RENDERED') {
            setSlotStatuses((prev) => ({ ...prev, [placement.id]: 'REAL_CREATIVE_RENDERED' }));
            setEvents((items) => [
              normalizeRealAdsObservation({
                placementId: placement.id,
                provider: placement.provider,
                format: placement.kind,
                dimensions: placement.size ?? 'provider-defined',
                status: 'REAL_CREATIVE_RENDERED',
                visible: true,
                viewport,
                note: delayedCheck.note,
                metrics: delayedCheck.metrics
              }),
              ...items
            ].slice(0, 50));
          }
        }, 600);
      });

      await attempt.completion;
    }

    isStartingRef.current = false;
    setSessionActive(sessionsRef.current.length > 0);
  };

  const allBanners = useMemo(() => {
    return [
      { id: 'adsterra-banner-728x90', label: 'Leaderboard (728 × 90)', size: '728x90', width: 728, height: 90 },
      { id: 'adsterra-banner-468x60', label: 'Standard Banner (468 × 60)', size: '468x60', width: 468, height: 60 },
      { id: 'adsterra-banner-300x250', label: 'Medium Rectangle MPU (300 × 250)', size: '300x250', width: 300, height: 250 },
      { id: 'adsterra-banner-160x600', label: 'Wide Skyscraper (160 × 600)', size: '160x600', width: 160, height: 600 },
      { id: 'adsterra-banner-160x300', label: 'Half Skyscraper (160 × 300)', size: '160x300', width: 160, height: 300 },
      { id: 'adsterra-banner-320x50', label: 'Mobile Leaderboard (320 × 50)', size: '320x50', width: 320, height: 50 }
    ];
  }, []);

  const nativePlacement = useMemo(() => {
    return planned.find((p) => p.kind === 'native') || config.adsterra.native;
  }, [planned, config]);

  const socialBarPlacement = useMemo(() => {
    return planned.find((p) => p.kind === 'social-bar') || config.adsterra.socialBar;
  }, [planned, config]);

  const popunderPlacement = useMemo(() => {
    return planned.find((p) => p.kind === 'popunder') || config.adsterra.popunder;
  }, [planned, config]);

  const smartlinkPlacement = useMemo(() => {
    return planned.find((p) => p.kind === 'smartlink') || config.adsterra.smartlink;
  }, [planned, config]);

  return (
    <section className={`border rounded-sm p-5 space-y-6 ${surface}`} aria-labelledby="real-ads-title">
      {/* Header and Scope Notice */}
      <div className="border-b pb-4 border-slate-200 dark:border-[#354955]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c65322]/10 text-[#c65322] border border-[#c65322]/30">
            EXPLORATORY LIVE PROVIDER STRESS LAB
          </span>
          <span className="text-xs font-mono text-slate-400">ISOLATED STAGE</span>
        </div>
        <h3 id="real-ads-title" className="mt-2 text-xl font-bold tracking-tight">
          Real Ads Stress Lab
        </h3>
        <p className={`mt-1 text-xs leading-relaxed max-w-3xl ${muted}`}>
          Delivers live third-party placements in dedicated, isolated containers to observe actual ad network delivery, script loading, and creative rendering.
          All live-ad observations are strictly exploratory and <strong>never affect the 55-vector authoritative compliance score</strong>.
        </p>
      </div>

      {/* Configuration & Controls */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-xs">
        <label className="font-mono">
          TEST INTENSITY LEVEL
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={sessionActive}
            className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing} disabled:opacity-50`}
          >
            {REAL_ADS_LEVELS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="font-mono">
          PROVIDER
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setFormatId('');
            }}
            disabled={sessionActive}
            className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing} disabled:opacity-50`}
          >
            <option value="adsterra">Adsterra (Configured)</option>
            <option value="monetag">Monetag (Unconfigured)</option>
            <option value="exoclick">ExoClick (Unconfigured)</option>
            <option value="all">All compatible providers</option>
          </select>
        </label>

        <label className="font-mono">
          INDIVIDUAL FORMAT
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            disabled={level !== 'individual' || sessionActive}
            className={`mt-1 w-full p-2 border rounded-sm disabled:opacity-50 ${subSurface} ${focusRing}`}
          >
            <option value="">First available format</option>
            {providerFormats.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.size || p.kind})
              </option>
            ))}
          </select>
        </label>

        <label className="font-mono">
          COMPARISON VIEWPORT
          <select
            value={viewport}
            onChange={(e) => setViewport(e.target.value)}
            className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing}`}
          >
            <option value="1280x720">Desktop (1280 × 720)</option>
            <option value="390x844">Mobile (390 × 844)</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs border p-3 rounded-sm border-slate-200 dark:border-[#354955]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={sessionActive || level === 'baseline' || planned.length === 0}
            className={`px-4 py-2 rounded-sm text-xs font-bold bg-[#c65322] hover:bg-[#b0471b] text-white disabled:opacity-40 transition-colors ${focusRing}`}
          >
            {sessionActive ? 'Session Running...' : 'Start Session'}
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={!sessionActive}
            className={`px-4 py-2 rounded-sm text-xs font-bold border disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${subSurface} ${focusRing}`}
          >
            Stop Session
          </button>
          <button
            type="button"
            onClick={() => setEvents([])}
            className={`px-3 py-2 rounded-sm text-xs border ${subSurface} ${focusRing}`}
          >
            Clear Evidence
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            AVAILABLE FORMATS: <strong>{available.length}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>
            ACTIVE PLACEMENTS: <strong>{sessionActive ? planned.filter((p) => !p.manualOnly).length : 0}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
            />
            {sessionActive ? 'LIVE ACTIVE' : 'IDLE'}
          </span>
        </div>
      </div>

      {requiresReloadNotice && (
        <div className="p-3 border border-amber-600/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs rounded-sm flex items-center justify-between">
          <div>
            <strong>Notice:</strong> An active popunder or background script attached irreversible listeners. Reload the page for a clean document state.
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-sm text-xs"
          >
            Reload Page
          </button>
        </div>
      )}

      {level === 'intrusive' && (
        <p className="text-xs border border-amber-500/30 bg-amber-500/10 p-3 rounded-sm text-amber-700 dark:text-amber-300">
          <strong>Opt-in Warning:</strong> Level 4 (Intrusive) enables popunders that trigger upon viewport click.
          Browser pop-up blockers or extensions may prevent the new window. Stop Session cannot undo an already opened tab.
        </p>
      )}

      {/* ========================================================= */}
      {/* AD PLACEMENT STAGE: VISIBLE, ACCURATELY SIZED AD CONTAINERS */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-[#354955]">
          <div>
            <h4 className="font-mono text-sm font-bold uppercase tracking-wider">
              Ad Placement Stage (Visible Mount Targets)
            </h4>
            <p className={`text-[11px] ${muted}`}>
              Each configured banner renders within an isolated provider iframe to isolate atOptions and preserve layout stability.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Viewport Target: {viewport}
          </div>
        </div>

        {/* TOP LEADERBOARD ROW */}
        <div className="space-y-3">
          {/* 728x90 Leaderboard */}
          {(() => {
            const banner = allBanners[0];
            const isPlanned = planned.some((p) => p.id === banner.id);
            const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

            return (
              <div className={`border rounded-sm p-3 ${subSurface}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{banner.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">#{banner.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                    {status}
                  </span>
                </div>
                <div className="overflow-x-auto flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                  <div
                    ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                    id={`slot-${banner.id}`}
                    style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                    className="flex items-center justify-center relative bg-transparent"
                  >
                    {!sessionActive && (
                      <span className="text-[11px] font-mono text-slate-400 select-none">
                        728 × 90 Leaderboard Slot [Awaiting Session Start]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 468x60 Standard Banner */}
          {(() => {
            const banner = allBanners[1];
            const isPlanned = planned.some((p) => p.id === banner.id);
            const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

            return (
              <div className={`border rounded-sm p-3 ${subSurface}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{banner.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">#{banner.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                    {status}
                  </span>
                </div>
                <div className="overflow-x-auto flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                  <div
                    ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                    id={`slot-${banner.id}`}
                    style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                    className="flex items-center justify-center relative bg-transparent"
                  >
                    {!sessionActive && (
                      <span className="text-[11px] font-mono text-slate-400 select-none">
                        468 × 60 Standard Banner Slot [Awaiting Session Start]
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* TWO-COLUMN GRID: CONTENT BANNERS + SIDEBAR SKYSCRAPERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT 2 COLUMNS: MPU 300x250, NATIVE BANNER, MOBILE 320x50 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 300x250 Medium Rectangle */}
            {(() => {
              const banner = allBanners[2];
              const isPlanned = planned.some((p) => p.id === banner.id);
              const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

              return (
                <div className={`border rounded-sm p-3 ${subSurface}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">{banner.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">#{banner.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                    <div
                      ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                      id={`slot-${banner.id}`}
                      style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                      className="flex items-center justify-center relative bg-transparent"
                    >
                      {!sessionActive && (
                        <span className="text-[11px] font-mono text-slate-400 select-none text-center p-4">
                          300 × 250 Medium Rectangle Slot
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Native Banner Container */}
            <div className={`border rounded-sm p-3 ${subSurface}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">Native Banner Container</span>
                  <span className="font-mono text-[10px] text-slate-400">#adsterra-native</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[slotStatuses['adsterra-native'] || (sessionActive && planned.some((p) => p.kind === 'native') ? 'SCRIPT_LOADING' : 'NOT_STARTED')]}`}>
                  {slotStatuses['adsterra-native'] || (sessionActive && planned.some((p) => p.kind === 'native') ? 'SCRIPT_LOADING' : 'NOT_STARTED')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                <div
                  ref={(el) => { if (el) slotRefs.current['adsterra-native'] = el; }}
                  id={nativePlacement?.containerId || 'slot-adsterra-native'}
                  className="w-full min-h-[140px] flex items-center justify-center"
                >
                  {!sessionActive && (
                    <span className="text-[11px] font-mono text-slate-400 select-none text-center">
                      Dedicated Native Multi-Card Container [Awaiting Session Start]
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 320x50 Mobile Leaderboard */}
            {(() => {
              const banner = allBanners[5];
              const isPlanned = planned.some((p) => p.id === banner.id);
              const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

              return (
                <div className={`border rounded-sm p-3 ${subSurface}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">{banner.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">#{banner.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                    <div
                      ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                      id={`slot-${banner.id}`}
                      style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                      className="flex items-center justify-center relative bg-transparent"
                    >
                      {!sessionActive && (
                        <span className="text-[11px] font-mono text-slate-400 select-none">
                          320 × 50 Mobile Banner Slot
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* RIGHT COLUMN: SKYSCRAPERS 160x600 & 160x300 */}
          <div className="space-y-4 flex flex-col items-center">
            {/* 160x600 Wide Skyscraper */}
            {(() => {
              const banner = allBanners[3];
              const isPlanned = planned.some((p) => p.id === banner.id);
              const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

              return (
                <div className={`border rounded-sm p-3 w-full ${subSurface}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">160 × 600</span>
                      <span className="font-mono text-[10px] text-slate-400">Skyscraper</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                    <div
                      ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                      id={`slot-${banner.id}`}
                      style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                      className="flex items-center justify-center relative bg-transparent text-center"
                    >
                      {!sessionActive && (
                        <span className="text-[11px] font-mono text-slate-400 select-none rotate-90 sm:rotate-0">
                          160 × 600 Skyscraper
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 160x300 Half Skyscraper */}
            {(() => {
              const banner = allBanners[4];
              const isPlanned = planned.some((p) => p.id === banner.id);
              const status = slotStatuses[banner.id] || (isPlanned && sessionActive ? 'SCRIPT_LOADING' : 'NOT_STARTED');

              return (
                <div className={`border rounded-sm p-3 w-full ${subSurface}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">160 × 300</span>
                      <span className="font-mono text-[10px] text-slate-400">Half-Skyscraper</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[status] || STATUS_BADGES.NOT_STARTED}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-center py-2 bg-slate-50 dark:bg-black/20 rounded border border-dashed border-slate-200 dark:border-slate-800">
                    <div
                      ref={(el) => { if (el) slotRefs.current[banner.id] = el; }}
                      id={`slot-${banner.id}`}
                      style={{ width: `${banner.width}px`, minHeight: `${banner.height}px` }}
                      className="flex items-center justify-center relative bg-transparent text-center"
                    >
                      {!sessionActive && (
                        <span className="text-[11px] font-mono text-slate-400 select-none">
                          160 × 300
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* OVERLAYS & SPECIAL FORMATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Social Bar */}
          <div className={`p-3 border rounded-sm ${subSurface}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-bold">Social Bar Overlay</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[slotStatuses['adsterra-social-bar'] || 'NOT_STARTED']}`}>
                {slotStatuses['adsterra-social-bar'] || 'NOT_STARTED'}
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${muted}`}>
              Sticky/floating overlay notifications injected into the viewport margin.
            </p>
            <div
              ref={(el) => { if (el) slotRefs.current['adsterra-social-bar'] = el; }}
              id="slot-adsterra-social-bar"
              className="mt-2 text-[10px] font-mono text-slate-400"
            >
              Mount target: Document body overlay
            </div>
          </div>

          {/* Popunder Flow */}
          <div className={`p-3 border rounded-sm ${subSurface}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-bold">Popunder Flow</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${STATUS_BADGES[slotStatuses['adsterra-popunder'] || 'NOT_STARTED']}`}>
                {slotStatuses['adsterra-popunder'] || 'NOT_STARTED'}
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${muted}`}>
              Requires Level 4 (Intrusive) opt-in. Triggers on background tab upon user interaction.
            </p>
            <div
              ref={(el) => { if (el) slotRefs.current['adsterra-popunder'] = el; }}
              id="slot-adsterra-popunder"
              className="mt-2 text-[10px] font-mono text-slate-400"
            >
              Mount target: Window click dispatcher
            </div>
          </div>

          {/* Smartlink (Manual Only) */}
          <div className={`p-3 border rounded-sm ${subSurface}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs font-bold">Smartlink (Direct Link)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700">
                MANUAL ONLY
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${muted}`}>
              Direct advertising offer URL. Never automated or clicked programmatically.
            </p>
            <div className="mt-2">
              {smartlinkPlacement?.href ? (
                <a
                  href={smartlinkPlacement.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-3 py-1.5 rounded text-[11px] font-bold bg-[#c65322] hover:bg-[#b0471b] text-white transition-colors"
                >
                  Open Smartlink in New Tab ↗
                </a>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">No destination configured</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PLANNED PLACEMENTS SUMMARY */}
      <div className={`p-3 border rounded-sm ${subSurface}`}>
        <div className="font-mono text-[11px] font-bold uppercase tracking-wider">
          Configured Placements for Active Selection ({planned.length})
        </div>
        {planned.length === 0 ? (
          <p className={`mt-2 text-xs ${muted}`}>
            No approved configuration is available for this provider and level. Add values through local or deployment environment variables.
          </p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {planned.map((placement) => (
              <li key={placement.id} className="border p-2 text-xs rounded-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <strong className="block font-mono text-[11px]">{placement.id}</strong>
                <span className={`text-[10px] ${muted}`}>Kind: {placement.kind}</span>
                {placement.size && <span className={`block text-[10px] font-mono ${muted}`}>Size: {placement.size}</span>}
                {placement.manualOnly && (
                  <span className="inline-block mt-1 text-[10px] text-amber-600 font-bold">Manual Trigger Only</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PLACEMENT EVIDENCE TELEMETRY LOG */}
      <div className={`p-3 border rounded-sm ${subSurface}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider">
            Evidence Observations Log ({events.length})
          </div>
          <span className={`text-[10px] ${muted}`}>Non-scoring live-ad telemetry</span>
        </div>

        {events.length === 0 ? (
          <p className={`text-xs ${muted}`}>
            No live-provider observation recorded yet. Start a session to observe script requests and creative delivery.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1.5 text-[11px] font-mono">
            {events.map((event, index) => (
              <div
                key={`${event.placementId}-${index}`}
                className="p-2 border rounded-sm flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {event.provider}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span>{event.placementId}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{event.viewport}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_BADGES[event.status] || STATUS_BADGES.INCONCLUSIVE}`}>
                    {event.status}
                  </span>
                  {event.note && (
                    <span className="text-[10px] text-slate-500 max-w-xs truncate" title={event.note}>
                      ({event.note})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
