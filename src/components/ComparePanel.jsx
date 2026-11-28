import React, { useMemo, useState } from 'react';
import { buildSnapshot, compareRuns, CAVEAT, CLASS_LABEL } from '../lab/run-compare.js';
import { loadSavedRuns, saveRun, deleteSavedRun } from '../lab/saved-runs.js';

const LATEST = '__latest__';
const APP_VERSION_FALLBACK = null;

export default function ComparePanel({ resultsMap, registry, lastRun, notify, surface, subSurface, muted, focusRing, appVersion = APP_VERSION_FALLBACK }) {
  const [saved, setSaved] = useState(() => loadSavedRuns());
  const [label, setLabel] = useState('');
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState(LATEST);
  const [showSame, setShowSame] = useState(false);

  const hasRun = Boolean(lastRun?.testIds?.length);
  const latest = useMemo(
    () => (hasRun ? buildSnapshot({ label: 'Latest run', lastRun, resultsMap, appVersion: lastRun.appVersion || appVersion, id: LATEST }) : null),
    [hasRun, lastRun, resultsMap, appVersion]
  );
  const alreadySaved = Boolean(latest && saved.some((r) => r.finishedAt && r.finishedAt === latest.finishedAt));
  const pick = (id) => (id === LATEST ? latest : saved.find((r) => r.id === id) || null);
  // With nothing chosen yet, the first run is the newest saved run that is not the latest run itself.
  const defaultA = saved.find((r) => !latest || r.finishedAt !== latest.finishedAt)?.id || '';
  const effA = aId && saved.some((r) => r.id === aId) ? aId : defaultA;

  const save = () => {
    const snap = buildSnapshot({ label, lastRun, resultsMap, appVersion: lastRun?.appVersion || appVersion });
    if (!snap) return;
    const out = saveRun(snap);
    setSaved(out.runs);
    if (!out.ok) notify?.("Couldn't save this run on this device.", 'error');
    else {
      notify?.(`Saved "${snap.label}".`, 'success');
      setLabel('');
      if (!aId) setAId(snap.id);
    }
  };
  const remove = (id) => {
    setSaved(deleteSavedRun(id).runs);
    if (aId === id) setAId('');
    if (bId === id) setBId(LATEST);
  };

  const result = useMemo(() => {
    const a = pick(effA);
    const b = pick(bId);
    return a && b ? compareRuns(a, b, registry) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effA, bId, saved, latest, registry]);

  const runName = (r) => `${r.label} (${r.finishedAt ? new Date(r.finishedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'time unknown'})`;
  const field = `min-h-10 w-full px-3 rounded-sm border text-sm ${subSurface} ${focusRing}`;
  const btn = `min-h-10 px-4 rounded-sm text-sm font-semibold cursor-pointer border ${subSurface} ${focusRing}`;
  const changedRows = result?.ok ? result.rows.filter((r) => r.changed) : [];
  const sameRows = result?.ok ? result.rows.filter((r) => !r.changed) : [];
  const Row = ({ r }) => (
    <li className="text-sm">
      <span>{r.name}</span> <span className={`font-mono text-xs ${muted}`}>{r.id}</span>
      <span className={`block text-xs ${muted}`}>
        Earlier run: {CLASS_LABEL[r.a]}. Later run: {CLASS_LABEL[r.b]}.
      </span>
    </li>
  );

  return (
    <section className={`p-5 sm:p-7 rounded-sm border space-y-4 ${surface}`} aria-labelledby="compare-title">
      <div>
        <h2 id="compare-title" className="text-xl font-bold tracking-[-0.01em]">Compare two runs</h2>
        <p className={`text-sm mt-1 max-w-prose ${muted}`}>
          Save a full run with a label, change one thing on your device, run the full test again, then compare. Runs stay on this device.
        </p>
      </div>

      {hasRun && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-sm font-semibold grow max-w-xs">
            Label for the latest run
            <input
              type="text"
              value={label}
              maxLength={40}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="For example: blocker on"
              className={field}
            />
          </label>
          <button type="button" onClick={save} className={btn}>
            {alreadySaved ? 'Save again with this label' : 'Save latest run'}
          </button>
        </div>
      )}

      {saved.length > 0 && (
        <ul className="grid gap-1 text-sm" aria-label="Saved runs">
          {saved.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              <span>{runName(r)}</span>
              <span className={muted}>
                {r.scope}, {r.testIds.length} tests{r.cancelled ? ', stopped early' : ''}
              </span>
              <button type="button" onClick={() => remove(r.id)} className={`min-h-10 px-2 underline underline-offset-4 cursor-pointer ${focusRing}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {saved.length === 0 && !hasRun && <p className={`text-sm ${muted}`}>Run a test first. Then you can save it here.</p>}

      {(saved.length > 0 || hasRun) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">
            First run to compare
            <select value={effA} onChange={(e) => setAId(e.target.value)} className={field}>
              <option value="">Choose a saved run</option>
              {saved.map((r) => <option key={r.id} value={r.id}>{runName(r)}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Second run to compare
            <select value={bId} onChange={(e) => setBId(e.target.value)} className={field}>
              {hasRun && <option value={LATEST}>Latest run (not saved)</option>}
              {saved.map((r) => <option key={r.id} value={r.id}>{runName(r)}</option>)}
            </select>
          </label>
        </div>
      )}

      {result && (
        <div className="space-y-3" aria-live="polite">
          {result.issues.length > 0 && (
            <ul className={`rounded-sm border p-3 list-disc pl-7 space-y-1 text-sm ${subSurface}`}>
              {result.issues.map((i) => <li key={i.text}>{i.text}</li>)}
            </ul>
          )}
          {result.ok && (
            <>
              <p className="text-base font-semibold">
                Earlier run (by finish time): {result.a.label}. Later run: {result.b.label}. The order you picked them in does not matter.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-base">
                <li>Scored tests: {result.summary.scored.changed} of {result.summary.scored.total} differ between the runs.</li>
                {result.externalComparable ? (
                  <li>Third-party servers: {result.summary.external.changed} of {result.summary.external.total} differ between the runs.</li>
                ) : (
                  <li>Third-party servers: not compared (see above).</li>
                )}
              </ul>
              {changedRows.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold">Differ between the runs</h3>
                  <ul className="mt-1 grid gap-2 sm:grid-cols-2">{changedRows.map((r) => <Row key={r.id} r={r} />)}</ul>
                </div>
              )}
              {changedRows.length === 0 && <p className="text-sm">No compared test changed between the two runs.</p>}
              {sameRows.length > 0 && (
                <details open={showSame} onToggle={(e) => setShowSame(e.currentTarget.open)}>
                  <summary className="min-h-10 flex items-center cursor-pointer select-none text-sm font-semibold">Same in both runs ({sameRows.length})</summary>
                  <ul className="mt-1 grid gap-2 sm:grid-cols-2">{sameRows.map((r) => <Row key={r.id} r={r} />)}</ul>
                </details>
              )}
            </>
          )}
          <p className={`text-sm ${muted}`}>{CAVEAT}</p>
        </div>
      )}
    </section>
  );
}
