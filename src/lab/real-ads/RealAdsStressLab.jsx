import { useMemo, useRef, useState } from 'react';
import { getAvailableFormats, getRealAdsConfig, REAL_ADS_LEVELS } from './config.js';
import { createAdsterraPlacements } from './adsterra.js';
import { createMonetagPlacements } from './monetag.js';
import { createExoClickPlacements } from './exoclick.js';
import { createRealAdsSession } from './session.js';
import { normalizeRealAdsObservation } from './evidence.js';

function placementsFor(config, level, provider) {
  const byProvider = {
    adsterra: createAdsterraPlacements(config, level),
    monetag: createMonetagPlacements(config, level),
    exoclick: createExoClickPlacements(config, level)
  };
  return provider === 'all' ? Object.values(byProvider).flat() : byProvider[provider];
}

export default function RealAdsStressLab({ surface, subSurface, muted, focusRing }) {
  const config = useMemo(() => getRealAdsConfig(import.meta.env), []);
  const [level, setLevel] = useState('baseline');
  const [provider, setProvider] = useState('adsterra');
  const [formatId, setFormatId] = useState('');
  const [viewport, setViewport] = useState('1280x720');
  const [events, setEvents] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const sessions = useRef([]);

  const available = getAvailableFormats(config);
  const providerFormats = placementsFor(config, 'maximum', provider);
  const levelPlacements = placementsFor(config, level, provider);
  const planned = level === 'individual' && formatId
    ? levelPlacements.filter((placement) => placement.id === formatId)
    : levelPlacements;
  const stop = () => {
    const reloadNeeded = sessions.current.some((session) => session.stop().requiresReload);
    sessions.current = [];
    setSessionActive(false);
    if (reloadNeeded) setEvents((items) => [{ status: 'INCONCLUSIVE', placementId: 'document', provider: 'adsterra', note: 'A Popunder may require a full page reload to reset third-party effects.' }, ...items]);
  };
  const start = async () => {
    if (level === 'baseline') return;
    stop();
    const next = planned.filter((placement) => !placement.manualOnly);
    setSessionActive(next.length > 0);
    for (const placement of next) {
      const session = createRealAdsSession({
        document,
        window,
        onEvidence: (observation) => setEvents((items) => [normalizeRealAdsObservation({ ...observation, provider: placement.provider, format: placement.kind, dimensions: placement.size ?? 'provider-defined', viewport, visible: false }), ...items].slice(0, 30))
      });
      if (placement.options) window.atOptions = placement.options;
      const attempt = session.start(placement);
      sessions.current.push(session);
      await attempt.completion;
      delete window.atOptions;
    }
    setSessionActive(sessions.current.length > 0);
  };

  return <section className={`border rounded-sm p-5 space-y-5 ${surface}`} aria-labelledby="real-ads-title">
    <div className="border-b pb-4 border-slate-200 dark:border-[#354955]">
      <p className="text-[11px] font-mono font-bold text-[#c65322]">EXPLORATORY LIVE PROVIDER ENVIRONMENT</p>
      <h3 id="real-ads-title" className="mt-1 text-lg font-bold">Real Ads Stress Lab</h3>
      <p className={`mt-1 text-xs leading-relaxed ${muted}`}>Starts no provider by default. Scripts only load after an explicit session start, remain outside the 55-case score, and script presence is never reported as a real creative.</p>
    </div>
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-xs">
      <label className="font-mono">LEVEL<select value={level} onChange={(event) => setLevel(event.target.value)} className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing}`}>{REAL_ADS_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label className="font-mono">PROVIDER<select value={provider} onChange={(event) => { setProvider(event.target.value); setFormatId(''); }} className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing}`}><option value="adsterra">Adsterra</option><option value="monetag">Monetag</option><option value="exoclick">ExoClick</option><option value="all">All compatible providers</option></select></label>
      <label className="font-mono">INDIVIDUAL FORMAT<select value={formatId} onChange={(event) => setFormatId(event.target.value)} disabled={level !== 'individual'} className={`mt-1 w-full p-2 border rounded-sm disabled:opacity-50 ${subSurface} ${focusRing}`}><option value="">First available format</option>{providerFormats.map((placement) => <option key={placement.id} value={placement.id}>{placement.id}</option>)}</select></label>
      <label className="font-mono">COMPARISON VIEWPORT<select value={viewport} onChange={(event) => setViewport(event.target.value)} className={`mt-1 w-full p-2 border rounded-sm ${subSurface} ${focusRing}`}><option value="1280x720">Desktop 1280 × 720</option><option value="390x844">Mobile 390 × 844</option></select></label>
      <div className={`p-2 border rounded-sm ${subSurface}`}><span className={muted}>AVAILABLE FORMATS</span><strong className="block mt-1 text-base">{available.length}</strong></div>
    </div>
    <p className={`text-[11px] ${muted}`}>Viewport is captured as comparison metadata; use browser device emulation or a matching window before starting. This control does not resize a visitor's browser.</p>
    <div className="flex flex-wrap gap-2"><button type="button" onClick={start} disabled={sessionActive || level === 'baseline' || planned.length === 0} className={`px-3 py-2 rounded-sm text-xs font-bold bg-[#c65322] text-white disabled:opacity-50 ${focusRing}`}>Start Session</button><button type="button" onClick={stop} disabled={!sessionActive} className={`px-3 py-2 rounded-sm text-xs font-bold border disabled:opacity-50 ${subSurface} ${focusRing}`}>Stop Session</button><button type="button" onClick={() => setEvents([])} className={`px-3 py-2 rounded-sm text-xs border ${subSurface} ${focusRing}`}>Clear Evidence</button></div>
    {level === 'intrusive' && <p className="text-xs border border-amber-600/50 bg-amber-50 dark:bg-amber-950/30 p-3">Popunder is opt-in and may open a window only when the provider/browser allows it. Stop Session cannot undo an already-opened third-party surface; reload for a clean document.</p>}
    <div className={`p-3 border rounded-sm ${subSurface}`}><div className="font-mono text-[11px] font-bold">PLANNED PLACEMENTS</div>{planned.length === 0 ? <p className={`mt-2 text-xs ${muted}`}>No approved configuration is available for this provider and level. Add values only through local or deployment environment configuration.</p> : <ul className="mt-2 grid gap-2 sm:grid-cols-2">{planned.map((placement) => <li key={placement.id} className="border p-2 text-xs"><strong>{placement.id}</strong>{placement.size && <span className={`ml-2 ${muted}`}>{placement.size}</span>}{placement.manualOnly && <a className="ml-2 underline" href={placement.href} target="_blank" rel="noreferrer">Open advertising destination manually</a>}</li>)}</ul>}</div>
    <div className={`p-3 border rounded-sm ${subSurface}`}><div className="font-mono text-[11px] font-bold">PLACEMENT EVIDENCE</div>{events.length === 0 ? <p className={`mt-2 text-xs ${muted}`}>No live-provider observation recorded. A configured script loading will remain separate from verified creative rendering.</p> : <ul className="mt-2 space-y-1 text-[11px] font-mono">{events.map((event, index) => <li key={`${event.placementId}-${index}`}>{event.provider} / {event.placementId} / {event.viewport}: <strong>{event.status}</strong>{event.note ? ` - ${event.note}` : ''}</li>)}</ul>}</div>
  </section>;
}
