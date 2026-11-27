import React, { useEffect, useRef } from 'react';
import { Share2, Download, Copy, X } from 'lucide-react';
import { CARD_FILE_NAME } from '../lab/share-actions.js';

// Shows the prepared card. The parent opens the system share sheet in the same click
// that opens this dialog; the Share button here is for sharing again.
export default function ShareResultsDialog({
  open,
  onClose,
  card,
  shareText,
  canShare,
  onShare,
  notify,
  surface,
  subSurface,
  muted,
  focusRing
}) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

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

  const handleClose = () => {
    onClose();
    const opener = openerRef.current;
    if (opener && typeof opener.focus === 'function') setTimeout(() => opener.focus(), 0);
  };

  const download = () => {
    if (!card.url) return;
    const a = document.createElement('a');
    a.href = card.url;
    a.download = CARD_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify('Image downloaded', 'success');
  };

  const copy = () => {
    const failed = () => notify("Couldn't copy automatically. Select the text below and copy it yourself.", 'error');
    if (!navigator.clipboard?.writeText) {
      failed();
      return;
    }
    navigator.clipboard.writeText(shareText).then(() => notify('Text and link copied', 'success'), failed);
  };

  const button = `inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-sm text-sm font-semibold cursor-pointer ${focusRing}`;
  const primary = 'bg-[#b84a1c] hover:bg-[#9a3d17] text-white border border-transparent';

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
            <p className={`text-sm ${muted}`}>
              {canShare
                ? 'Your device share menu opens with this card attached. If it did not open, use Share below.'
                : 'Download the card or copy the text and link. This browser has no share menu.'}{' '}
              The card shows your score, how many tests it is based on, and a code that opens this site. Nothing about your device is included.
            </p>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className={`w-11 h-11 shrink-0 rounded-sm border flex items-center justify-center cursor-pointer ${subSurface} ${focusRing}`}>
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <div className={`rounded-sm border overflow-hidden aspect-[1200/630] flex items-center justify-center ${subSurface}`} aria-live="polite">
          {card.status === 'loading' && <p className="text-sm">Creating your card…</p>}
          {card.status === 'error' && (
            <p className="text-sm p-4 text-center">Couldn&apos;t create the image. You can still copy the text and link below.</p>
          )}
          {card.status === 'ready' && <img src={card.url} alt={`Result card. ${shareText}`} className="w-full h-full object-contain" />}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {canShare && (
            <button type="button" onClick={onShare} disabled={card.status === 'loading'} className={`${button} ${primary} disabled:opacity-60`}>
              <Share2 aria-hidden="true" className="w-4 h-4" />
              Share
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={card.status !== 'ready'}
            className={`${button} ${canShare ? `border ${subSurface}` : primary} disabled:opacity-60`}
          >
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
