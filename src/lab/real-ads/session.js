const IRREVERSIBLE_KINDS = new Set(['popunder']);

export function createRealAdsSession({ document, window, onEvidence = () => {}, timeoutMs = 15000 }) {
  let state = 'IDLE';
  let activePlacement = null;
  let ownedNodes = [];
  let cleanup = [];
  let timeoutId = null;
  let observer = null;

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
    mount.dataset.realAdsOwned = placement.id;
    mount.setAttribute('data-real-ads-owned', placement.id);
    const script = document.createElement('script');
    script.async = true;
    script.src = placement.scriptUrl;
    script.setAttribute('data-real-ads-owned', placement.id);

    const onLoad = () => emit('SCRIPT_LOADED');
    const onError = () => emit('REQUEST_FAILED', { alternatives: ['CSP', 'DNS', 'connectivity', 'provider'] });
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    cleanup.push(() => script.removeEventListener('load', onLoad), () => script.removeEventListener('error', onError));
    document.body.append(mount);
    document.head.append(script);
    ownedNodes = [mount, script];
    observer = window?.MutationObserver ? new window.MutationObserver(() => {}) : null;
    observer?.observe?.(mount, { childList: true, subtree: true });
    if (window?.setTimeout) {
      timeoutId = window.setTimeout(() => emit('INCONCLUSIVE', { reason: 'script-timeout' }), timeoutMs);
    }
    state = 'ACTIVE';
    emit('SCRIPT_LOADING');
    return { started: true };
  }

  function stop() {
    const requiresReload = IRREVERSIBLE_KINDS.has(activePlacement?.kind);
    state = 'STOPPING';
    clearOwnedState();
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
