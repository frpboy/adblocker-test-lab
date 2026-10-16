const IRREVERSIBLE_KINDS = new Set(['popunder']);

export function createRealAdsSession({ document, window, onEvidence = () => {}, timeoutMs = 15000 }) {
  let state = 'IDLE';
  let activePlacement = null;
  let ownedNodes = [];
  let cleanup = [];
  let timeoutId = null;
  let observer = null;
  let completeAttempt = null;

  const emit = (status, detail = {}) => onEvidence({ placementId: activePlacement?.id ?? null, status, ...detail });

  function clearOwnedState() {
    cleanup.forEach((remove) => remove());
    cleanup = [];
    if (timeoutId !== null && window?.clearTimeout) window.clearTimeout(timeoutId);
    timeoutId = null;
    observer?.disconnect?.();
    observer = null;
    ownedNodes.forEach((node) => node.remove?.());
    ownedNodes = [];
  }

  function start(placement) {
    if (state === 'STARTING' || state === 'ACTIVE') return { started: false, reason: 'already-started' };
    if (!placement?.id || !placement?.scriptUrl?.startsWith('https://')) {
      state = 'ERROR';
      return { started: false, reason: 'invalid-placement' };
    }

    state = 'STARTING';
    activePlacement = placement;
    const mount = document.createElement('div');
    if (placement.containerId) mount.id = placement.containerId;
    mount.dataset.realAdsOwned = placement.id;
    mount.setAttribute('data-real-ads-owned', placement.id);
    const script = document.createElement('script');
    script.async = !placement.options;
    script.src = placement.scriptUrl;
    Object.entries(placement.scriptAttributes ?? {}).forEach(([name, value]) => script.setAttribute(name, value));
    script.setAttribute('data-real-ads-owned', placement.id);

    let resolveAttempt;
    const completion = new Promise((resolve) => { resolveAttempt = resolve; });
    completeAttempt = (outcome) => { resolveAttempt(outcome); completeAttempt = null; };
    const onLoad = () => { emit('SCRIPT_LOADED'); completeAttempt?.('loaded'); };
    const onError = () => { emit('REQUEST_FAILED', { alternatives: ['CSP', 'DNS', 'connectivity', 'provider'] }); completeAttempt?.('error'); };
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    cleanup.push(() => script.removeEventListener('load', onLoad), () => script.removeEventListener('error', onError));
    document.body.append(mount);
    document.head.append(script);
    ownedNodes = [mount, script];
    observer = window?.MutationObserver ? new window.MutationObserver(() => {}) : null;
    observer?.observe?.(mount, { childList: true, subtree: true });
    if (window?.setTimeout) {
      timeoutId = window.setTimeout(() => { emit('INCONCLUSIVE', { reason: 'script-timeout' }); completeAttempt?.('timeout'); }, timeoutMs);
    }
    state = 'ACTIVE';
    emit('SCRIPT_LOADING');
    return { started: true, completion };
  }

  function stop() {
    const requiresReload = IRREVERSIBLE_KINDS.has(activePlacement?.kind);
    state = 'STOPPING';
    clearOwnedState();
    completeAttempt?.('stopped');
    activePlacement = null;
    state = 'STOPPED';
    return { stopped: true, requiresReload };
  }

  function reload(placement = activePlacement) {
    stop();
    return start(placement);
  }

  return { start, stop, reload, getState: () => ({ status: state, placement: activePlacement }) };
}
