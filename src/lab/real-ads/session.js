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

  function start(placement, targetContainer = null) {
    if (state === 'STARTING' || state === 'ACTIVE') return { started: false, reason: 'already-started' };
    if (!placement?.id || !placement?.scriptUrl?.startsWith('https://')) {
      state = 'ERROR';
      return { started: false, reason: 'invalid-placement' };
    }

    state = 'STARTING';
    activePlacement = placement;

    let resolveAttempt;
    const completion = new Promise((resolve) => { resolveAttempt = resolve; });
    completeAttempt = (outcome) => { resolveAttempt(outcome); completeAttempt = null; };

    // Case 1: Banner with options using an isolated provider document (iframe)
    // Prevents global atOptions collisions and parser-stream disruption.
    if (placement.options) {
      const iframe = document.createElement('iframe');
      if (placement.containerId) iframe.id = placement.containerId;
      iframe.dataset = iframe.dataset || {};
      iframe.dataset.realAdsOwned = placement.id;
      iframe.setAttribute('data-real-ads-owned', placement.id);
      iframe.title = `Adsterra ${placement.id}`;
      iframe.scrolling = 'no';
      iframe.frameBorder = '0';

      const [widthStr, heightStr] = (placement.size ?? '300x250').split('x');
      const width = Number(widthStr) || placement.options?.width || 300;
      const height = Number(heightStr) || placement.options?.height || 250;
      iframe.width = String(width);
      iframe.height = String(height);
      if (iframe.style) {
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
      }

      const safeOptions = JSON.stringify(placement.options);
      const safeScriptUrl = placement.scriptUrl.replace(/"/g, '&quot;');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body><script type="text/javascript">var atOptions = ${safeOptions};</script><script type="text/javascript" src="${safeScriptUrl}"></script></body></html>`;
      iframe.srcdoc = html;

      const onLoad = () => { emit('SCRIPT_LOADED'); completeAttempt?.('loaded'); };
      const onError = () => { emit('REQUEST_FAILED', { alternatives: ['CSP', 'DNS', 'connectivity', 'provider'] }); completeAttempt?.('error'); };

      iframe.addEventListener('load', onLoad);
      iframe.addEventListener('error', onError);
      cleanup.push(
        () => iframe.removeEventListener('load', onLoad),
        () => iframe.removeEventListener('error', onError)
      );

      const mountParent = targetContainer || document.body;
      mountParent.append(iframe);
      ownedNodes = [iframe];

      observer = window?.MutationObserver ? new window.MutationObserver(() => {}) : null;
      observer?.observe?.(iframe, { attributes: true, childList: true });

      if (window?.setTimeout) {
        timeoutId = window.setTimeout(() => { emit('INCONCLUSIVE', { reason: 'script-timeout' }); completeAttempt?.('timeout'); }, timeoutMs);
      }
      state = 'ACTIVE';
      emit('SCRIPT_LOADING');
      return { started: true, completion };
    }

    // Case 2: Standard/Direct placement (native banner, social bar, popunder, or basic scripts)
    const mount = document.createElement('div');
    if (placement.containerId) mount.id = placement.containerId;
    mount.dataset = mount.dataset || {};
    mount.dataset.realAdsOwned = placement.id;
    mount.setAttribute('data-real-ads-owned', placement.id);

    const script = document.createElement('script');
    script.async = !placement.options;
    script.src = placement.scriptUrl;
    Object.entries(placement.scriptAttributes ?? {}).forEach(([name, value]) => script.setAttribute(name, value));
    script.setAttribute('data-real-ads-owned', placement.id);

    const onLoad = () => { emit('SCRIPT_LOADED'); completeAttempt?.('loaded'); };
    const onError = () => { emit('REQUEST_FAILED', { alternatives: ['CSP', 'DNS', 'connectivity', 'provider'] }); completeAttempt?.('error'); };
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    cleanup.push(
      () => script.removeEventListener('load', onLoad),
      () => script.removeEventListener('error', onError)
    );

    const mountParent = targetContainer || document.body;
    mountParent.append(mount);
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

  function reload(placement = activePlacement, targetContainer = null) {
    stop();
    return start(placement, targetContainer);
  }

  return { start, stop, reload, getState: () => ({ status: state, placement: activePlacement }) };
}
