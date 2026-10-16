const STATUSES = new Set([
  'NOT_STARTED',
  'SCRIPT_LOADING',
  'SCRIPT_LOADED',
  'REAL_CREATIVE_RENDERED',
  'EMPTY_OR_NO_FILL',
  'REQUEST_FAILED',
  'BLOCKED_OR_FILTERED_POSSIBLE',
  'PROVIDER_ERROR',
  'INCONCLUSIVE'
]);

export function normalizeRealAdsObservation(input = {}) {
  const requestedStatus = STATUSES.has(input.status) ? input.status : 'INCONCLUSIVE';
  const isVisible = Boolean(input.visible);
  const status = requestedStatus === 'REAL_CREATIVE_RENDERED' && !isVisible ? 'INCONCLUSIVE' : requestedStatus;

  return {
    provider: input.provider ?? 'unknown',
    placementId: input.placementId ?? 'unknown',
    status,
    visible: isVisible,
    benchmarkEligible: false,
    alternatives: input.alternatives ?? [],
    timestamp: input.timestamp ?? new Date().toISOString(),
    viewport: input.viewport ?? 'unknown',
    format: input.format ?? 'unknown',
    dimensions: input.dimensions ?? 'unknown',
    note: input.note ?? null,
    metrics: input.metrics ?? null
  };
}

export function inspectPlacementEvidence(containerElement, placement = {}) {
  if (!containerElement) {
    return {
      status: 'INCONCLUSIVE',
      visible: false,
      note: 'Container element not found'
    };
  }

  // Check if container itself is hidden by styling or ad blocker cosmetic filtering
  try {
    const style = containerElement.ownerDocument?.defaultView?.getComputedStyle?.(containerElement);
    if (style && (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0')) {
      return {
        status: 'BLOCKED_OR_FILTERED_POSSIBLE',
        visible: false,
        note: 'Container hidden by cosmetic/display filtering',
        alternatives: ['cosmetic_filter', 'custom_css', 'element_hiding']
      };
    }
  } catch {
    // Non-DOM or restricted environment
  }

  // Look for iframes (either provider iframe or nested creative iframe)
  const iframes = Array.from(containerElement.querySelectorAll?.('iframe') ?? []);
  if (iframes.length > 0) {
    let renderedCreativeFound = false;
    let measuredWidth = 0;
    let measuredHeight = 0;

    for (const iframe of iframes) {
      try {
        const rect = iframe.getBoundingClientRect?.() ?? { width: iframe.offsetWidth ?? 0, height: iframe.offsetHeight ?? 0 };
        const iframeStyle = iframe.ownerDocument?.defaultView?.getComputedStyle?.(iframe);
        if (iframeStyle && (iframeStyle.display === 'none' || iframeStyle.visibility === 'hidden')) {
          continue;
        }

        let innerContentVisible = false;
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            const innerIframes = doc.querySelectorAll('iframe');
            const images = doc.querySelectorAll('img');
            const links = doc.querySelectorAll('a');
            const body = doc.body;
            if (innerIframes.length > 0 || images.length > 0 || links.length > 0 || (body && (body.children.length > 0 || body.innerText.trim().length > 0))) {
              innerContentVisible = true;
            }
          }
        } catch {
          // Cross-origin iframe: inaccessible contentDocument is expected for real third-party creatives
          innerContentVisible = true;
        }

        const width = rect.width || iframe.offsetWidth || 0;
        const height = rect.height || iframe.offsetHeight || 0;

        if ((width > 20 && height > 20) || innerContentVisible) {
          renderedCreativeFound = true;
          measuredWidth = Math.max(measuredWidth, width);
          measuredHeight = Math.max(measuredHeight, height);
        }
      } catch {
        // Fallback for mock environments
      }
    }

    if (renderedCreativeFound) {
      return {
        status: 'REAL_CREATIVE_RENDERED',
        visible: true,
        note: `Creative rendered in frame (${measuredWidth || placement.size || 'detected'}px)`,
        metrics: { width: measuredWidth, height: measuredHeight }
      };
    }

    return {
      status: 'EMPTY_OR_NO_FILL',
      visible: false,
      note: 'Frame present but empty or zero-sized'
    };
  }

  // Check for native creative elements or custom injected DOM
  const children = Array.from(containerElement.children ?? []).filter(
    (el) => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE'
  );

  if (children.length > 0) {
    const hasVisibleChild = children.some((child) => {
      try {
        const rect = child.getBoundingClientRect?.() ?? { width: child.offsetWidth ?? 0, height: child.offsetHeight ?? 0 };
        return (rect.width > 20 && rect.height > 20) || (child.innerText && child.innerText.trim().length > 0);
      } catch {
        return false;
      }
    });

    if (hasVisibleChild) {
      return {
        status: 'REAL_CREATIVE_RENDERED',
        visible: true,
        note: `Rendered ${children.length} creative elements in container`,
        metrics: { childCount: children.length }
      };
    }

    return {
      status: 'EMPTY_OR_NO_FILL',
      visible: false,
      note: 'Container contains elements but none have visible dimensions'
    };
  }

  return {
    status: 'EMPTY_OR_NO_FILL',
    visible: false,
    note: 'No creative elements or frames rendered in container'
  };
}
