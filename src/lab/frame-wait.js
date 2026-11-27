// Browsers pause requestAnimationFrame in background tabs and hidden panes, so a
// run that waited only on frames would hang until the user came back. Resolve on
// whichever comes first: the next frame, or a short timer (throttled, but never
// paused, in the background). Layout reads such as getBoundingClientRect do not
// need a paint, so measurements taken after the timer are still valid.
export const FRAME_FALLBACK_MS = 100;

export function waitForFrame(
  abortSignal,
  {
    fallbackMs = FRAME_FALLBACK_MS,
    raf = globalThis.requestAnimationFrame?.bind(globalThis),
    caf = globalThis.cancelAnimationFrame?.bind(globalThis),
    setTimer = globalThis.setTimeout.bind(globalThis),
    clearTimer = globalThis.clearTimeout.bind(globalThis)
  } = {}
) {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    let settled = false;
    let rafId = null;
    let timerId = null;
    const cleanup = () => {
      settled = true;
      if (rafId !== null && caf) caf(rafId);
      if (timerId !== null) clearTimer(timerId);
      abortSignal?.removeEventListener('abort', onAbort);
    };
    const done = () => {
      if (settled) return;
      cleanup();
      resolve();
    };
    function onAbort() {
      if (settled) return;
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    }
    if (raf) rafId = raf(done);
    timerId = setTimer(done, fallbackMs);
    abortSignal?.addEventListener('abort', onAbort, { once: true });
  });
}
