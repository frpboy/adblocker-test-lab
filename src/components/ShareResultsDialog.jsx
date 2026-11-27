import React, { useEffect, useRef, useState } from 'react';
import { Share2, Download, Copy, X } from 'lucide-react';
import { renderShareCard, canvasToPngBlob } from '../lab/share-card.js';
import { buildShareText, SITE_URL } from '../lab/run-summary.js';

const FILE_NAME = 'adblocker-test-lab-result.png';

export default function ShareResultsDialog({ open, onClose, summary, notify, surface, subSurface, muted, focusRing }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const [state, setState] = useState({ status: 'idle', url: '', blob: null });
  const shareText = buildShareText(summary, SITE_URL);

  // Native modal: Escape closes it and focus stays inside while open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    let objectUrl = '';
    setState({ status: 'loading', url: '', blob: null });
    renderShareCard(summary)
      .then(canvasToPngBlob)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ status: 'ready', url: objectUrl, blob });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', url: '', blob: null });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, summary]);

  const handleClose = () => {
    onClose();
    const opener = openerRef.current;
    if (opener && typeof opener.focus === 'function') setTimeout(() => opener.focus(), 0);
  };

  const file = state.blob ? new File([state.blob], FILE_NAME, { type: 'image/png' }) : null;
  const canShareFile = Boolean(file && navigator.canShare && navigator.canShare({ files: [file] }));
  const canShareText = Boolean(navigator.share);

  const share = async () => {
    try {
      if (canShareFile) {
        await navigator.share({ files: [file], title: 'AdBlocker Test Lab result', text: shareText });
      } else {
        await navigator.share({ title: 'AdBlocker Test Lab result', text: shareText, url: SITE_URL });
      }
    } catch (err) {
      if (err?.name !== 'AbortError') notify("Couldn't open sharing. Download the image or copy the text instead.", 'error');
    }
  };

  const download = () => {
    if (!state.url) return;
    const a = document.createElement('a');
    a.href = state.url;
    a.download = FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify('Image downloaded', 'success');
  };

  const copy = () => {
    if (!navigator.clipboard?.writeText) {
      notify("Couldn't copy automatically. Select the text below and copy it yourself.", 'error');
      return;
    }
    navigator.clipboard.writeText(shareText).then(
      () => notify('Text and link copied', 'success'),
      () => notify("Couldn't copy automatically. Select the text below and copy it yourself.", 'error')
    );
  };

  const button = `inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-sm text-sm font-semibold cursor-pointer ${focusRing}`;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      aria-labelledby="share-title"
      className={`w-[min(100%-2rem,760px)] max-h-[calc(100vh-2rem)] overflow-y-auto p-0 rounded-sm border text-[#182024] dark:text-[#edf2ee] backdrop:bg-black/50 ${surface}`}
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="share-title" className="text-xl font-bold">Share your result</h2>
            <p className={`text-sm ${muted}`}>The card shows your score, how many tests it is based on, and a code that opens this site. Nothing about your device is included.</p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className={`w-11 h-11 shrink-0 rounded-sm border flex items-center justify-center cursor-pointer ${subSurface} ${focusRing}`}>
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <div className={`rounded-sm border overflow-hidden aspect-[1200/630] flex items-center justify-center ${subSurface}`} aria-live="polite">
          {state.status === 'loading' && <p className="text-sm">Creating your card…</p>}
          {state.status === 'error' && (
            <p className="text-sm p-4 text-center">Couldn&apos;t create the image. You can still copy the text and link below.</p>
          )}
          {state.status === 'ready' && <img src={state.url} alt={`Result card. ${shareText}`} className="w-full h-full object-contain" />}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {canShareText && (
            <button type="button" onClick={share} disabled={state.status === 'loading'} className={`${button} bg-[#b84a1c] hover:bg-[#9a3d17] text-white disabled:opacity-60`}>
              <Share2 aria-hidden="true" className="w-4 h-4" />
              Share
            </button>
          )}
          <button type="button" onClick={download} disabled={state.status !== 'ready'} className={`${button} border ${canShareText ? subSurface : 'bg-[#b84a1c] hover:bg-[#9a3d17] text-white border-transparent'} disabled:opacity-60`}>
            <Download aria-hidden="true" className="w-4 h-4" />
            Download image
          </button>
          <button type="button" onClick={copy} className={`${button} border ${subSurface}`}>
            <Copy aria-hidden="true" className="w-4 h-4" />
            Copy text and link
          </button>
        </div>

        <p className={`text-sm rounded-sm border p-3 select-all ${subSurface}`}>{shareText}</p>
      </div>
    </dialog>
  );
}
