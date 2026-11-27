import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { buildRunSummary, buildShareText, SITE_URL } from '../lab/run-summary.js';
import { renderShareCard, canvasToPngBlob } from '../lab/share-card.js';
import { buildSharePayload, openShareSheet, CARD_FILE_NAME } from '../lab/share-actions.js';
import ShareResultsDialog from './ShareResultsDialog.jsx';

function TestList({ title, mark, items, muted, empty, showReason = false, defaultOpen = false }) {
  return (
    <details className="group border-t border-current/10 pt-3" open={defaultOpen && items.length > 0}>
      <summary className="min-h-10 flex items-center gap-2 cursor-pointer select-none font-semibold">
        <span aria-hidden="true" className="w-5 text-center">{mark}</span>
        <span>{title}</span>
        <span className={`font-normal ${muted}`}>({items.length})</span>
      </summary>
      {items.length === 0 ? (
        <p className={`pl-7 pb-2 text-sm ${muted}`}>{empty}</p>
      ) : (
        <ul className="pl-7 pb-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm">
          {items.map((t) => (
            <li key={t.id}>
              <span>{t.name}</span> <span className={`font-mono text-xs ${muted}`}>{t.id}</span>
              {showReason && t.reason && <span className={`block text-xs ${muted}`}>{t.reason}</span>}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

export default function RunSummary({
  scoreSummary,
  resultsMap,
  registry,
  lastRun,
  savedAt,
  restoredFromEarlierVisit,
  onClearResults,
  notify,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const [view, setView] = useState('simple');
  const [shareOpen, setShareOpen] = useState(false);
  const [card, setCard] = useState({ status: 'loading', url: '', file: null });
  const [announcement, setAnnouncement] = useState('');
  const announcedFor = useRef(null);

  const summary = useMemo(
    () => buildRunSummary({ scoreSummary, resultsMap, registry, lastRun }),
    [scoreSummary, resultsMap, registry, lastRun]
  );

  // Prepare the card as soon as there is a result: the share sheet must open inside the
  // click itself, so the image has to be ready before the user presses Share.
  useEffect(() => {
    if (!summary.hasRun) return undefined;
    let cancelled = false;
    let objectUrl = '';
    setCard({ status: 'loading', url: '', file: null });
    renderShareCard(summary)
      .then(canvasToPngBlob)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setCard({ status: 'ready', url: objectUrl, file: new File([blob], CARD_FILE_NAME, { type: 'image/png' }) });
      })
      .catch(() => {
        if (!cancelled) setCard({ status: 'error', url: '', file: null });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [summary]);

  const shareText = buildShareText(summary, SITE_URL);
  const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  // Called straight from a click handler; no awaits before navigator.share.
  const shareNow = () => {
    const payload = buildSharePayload({ file: card.status === 'ready' ? card.file : null, text: shareText, url: SITE_URL });
    openShareSheet(payload).then((outcome) => {
      if (outcome === 'failed') notify("Couldn't open the share menu. Download the image or copy the text instead.", 'error');
    });
  };

  // Announce once per finished run for screen-reader users.
  useEffect(() => {
    if (restoredFromEarlierVisit || !lastRun?.finishedAt || announcedFor.current === lastRun.finishedAt) return;
    announcedFor.current = lastRun.finishedAt;
    setAnnouncement(`Run finished. ${summary.verdict.title}. ${summary.simple.join(' ')}`);
  }, [lastRun, summary, restoredFromEarlierVisit]);

  if (!summary.hasRun) return null;

  const finished = summary.finishedAt
    ? new Date(summary.finishedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;
  const scopeLabel = { quick: 'Quick check', full: 'Full test', custom: 'Selected tests' }[summary.scope] || 'Run';
  const toggle = (active) =>
    `min-h-10 px-3 text-sm cursor-pointer border ${focusRing} ${
      active
        ? 'bg-[#24373f] text-white border-[#24373f] dark:bg-[#edf2ee] dark:text-[#182024] dark:border-[#edf2ee] font-semibold'
        : subSurface
    }`;

  return (
    <section className={`p-5 sm:p-7 rounded-sm border space-y-5 ${surface}`} aria-labelledby="run-summary-title">
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-sm ${muted}`}>
            {scopeLabel}
            {finished ? `, finished at ${finished}` : ''}
            {summary.cancelled ? ', stopped early' : ''}
          </p>
          <h2 id="run-summary-title" className="text-2xl font-bold tracking-[-0.02em] mt-1">What happened in this run</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-sm overflow-hidden" role="group" aria-label="Summary detail">
            <button type="button" aria-pressed={view === 'simple'} onClick={() => setView('simple')} className={`${toggle(view === 'simple')} rounded-l-sm`}>
              Simple
            </button>
            <button type="button" aria-pressed={view === 'detailed'} onClick={() => setView('detailed')} className={`${toggle(view === 'detailed')} rounded-r-sm -ml-px`}>
              Detailed
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setShareOpen(true);
              if (canShare && card.status === 'ready') shareNow();
            }}
            className={`inline-flex items-center gap-2 min-h-10 px-4 rounded-sm text-sm font-semibold bg-[#b84a1c] hover:bg-[#9a3d17] text-white cursor-pointer ${focusRing}`}
          >
            <Share2 aria-hidden="true" className="w-4 h-4" />
            Share result
          </button>
        </div>
      </div>

      <div className="space-y-2 max-w-prose">
        <p className="text-lg font-semibold">{summary.verdict.title}</p>
        <ul className="list-disc pl-5 space-y-1.5 text-base leading-relaxed">
          {summary.simple.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {view === 'detailed' && (
        <div className="space-y-1">
          <TestList title="Blocked" mark={'✓'} items={summary.blocked} muted={muted} empty="Nothing in this run was fully blocked." defaultOpen />
          <TestList title="Partly blocked" mark={'◐'} items={summary.partly} muted={muted} empty="Nothing in this run was partly blocked." defaultOpen />
          <TestList title="Got through" mark={'✕'} items={summary.allowed} muted={muted} empty="Nothing in this run got through." defaultOpen />
          <TestList title="Could not be measured" mark="?" items={summary.unmeasured} muted={muted} empty="Every test in this run gave a clear answer." showReason defaultOpen />
          <TestList title="Privacy settings on" mark={'●'} items={summary.privacyOn} muted={muted} empty="No privacy settings were found on, or none were checked in this run." />
          <TestList title="Privacy settings off" mark={'○'} items={summary.privacyOff} muted={muted} empty="None were found off in this run." />
          <TestList
            title="Ad and tracker servers that could not be reached"
            mark="~"
            items={summary.extraFailed}
            muted={muted}
            empty="None in this run. These checks are never scored, because a failure can also mean the server is down."
          />
          <TestList title="Requests to ad and tracker servers that completed (a blocker may have answered with a stand-in)" mark={'→'} items={summary.extraReached} muted={muted} empty="None in this run." />
        </div>
      )}

      <div className={`flex flex-wrap items-center justify-between gap-3 text-sm border-t border-current/10 pt-4 ${muted}`}>
        <p>
          {restoredFromEarlierVisit && savedAt
            ? `These are your results from ${new Date(savedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}, saved on this device. `
            : 'Saved on this device, so they stay after a reload. '}
          Your results are not sent to any server.
        </p>
        <button
          type="button"
          onClick={onClearResults}
          className={`min-h-10 px-3 rounded-sm border text-sm font-semibold cursor-pointer text-current ${subSurface} ${focusRing}`}
        >
          Clear results
        </button>
      </div>

      {summary.nextSteps.length > 0 && (
        <div className={`rounded-sm border p-4 ${subSurface}`}>
          <h3 className="text-sm font-bold">What to do next</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
            {summary.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <ShareResultsDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        card={card}
        shareText={shareText}
        canShare={canShare}
        onShare={shareNow}
        notify={notify}
        surface={surface}
        subSurface={subSurface}
        muted={muted}
        focusRing={focusRing}
      />
    </section>
  );
}
