function getVisibleDimensions(element) {
  try {
    const style = element.ownerDocument?.defaultView?.getComputedStyle?.(element);
    const opacity = style?.opacity;
    if (
      style &&
      (style.display === 'none' ||
        style.visibility === 'hidden' ||
        (opacity !== undefined && opacity !== null && opacity !== '' && Number(opacity) === 0))
    ) {
      return null;
    }

    const rect = typeof element.getBoundingClientRect === 'function'
      ? element.getBoundingClientRect()
      : null;
    const width = rect && Number.isFinite(rect.width) ? rect.width : Number(element.offsetWidth) || 0;
    const height = rect && Number.isFinite(rect.height) ? rect.height : Number(element.offsetHeight) || 0;
    return width > 20 && height > 20 ? { width, height } : null;
  } catch {
    return null;
  }
}

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
      const dimensions = getVisibleDimensions(iframe);
      if (!dimensions) continue;

      renderedCreativeFound = true;
      measuredWidth = Math.max(measuredWidth, dimensions.width);
      measuredHeight = Math.max(measuredHeight, dimensions.height);
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
    const visibleChildren = children.filter((child) => getVisibleDimensions(child));

    if (visibleChildren.length > 0) {
      return {
        status: 'REAL_CREATIVE_RENDERED',
        visible: true,
        note: `Rendered ${visibleChildren.length} creative elements in container`,
        metrics: { childCount: visibleChildren.length }
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
