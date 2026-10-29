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

  // A visible iframe is not proof that the creative inside it rendered.
  // Only inspectable, visible creative content is positive evidence; cross-origin
  // or opaque frame contents remain inconclusive.
  const iframes = Array.from(containerElement.querySelectorAll?.('iframe') ?? []);
  if (iframes.length > 0) {
    let unknownFrameContent = false;

    for (const iframe of iframes) {
      if (!getVisibleDimensions(iframe)) continue;

      let frameDocument;
      try {
        frameDocument = iframe.contentDocument;
      } catch {
        unknownFrameContent = true;
        continue;
      }

      if (!frameDocument) {
        unknownFrameContent = true;
        continue;
      }

      const candidates = Array.from(
        frameDocument.querySelectorAll?.('img, video, canvas, svg, a, [role="img"], p, span, div') ?? []
      );
      const visibleCreative = candidates.find((element) => {
        if (!getVisibleDimensions(element)) return false;

        const tagName = String(element.tagName ?? '').toUpperCase();
        if (tagName === 'IMG') {
          return Number(element.naturalWidth) > 0 && Number(element.naturalHeight) > 0;
        }
        if (tagName === 'VIDEO') {
          return Number(element.videoWidth) > 0 && Number(element.videoHeight) > 0;
        }
        if (tagName === 'CANVAS') {
          // Canvas dimensions do not prove that pixels were actually drawn.
          return false;
        }
        if (tagName === 'SVG') {
          return Boolean(element.querySelector?.('path, text, image, use'));
        }
        if (tagName === 'A') {
          return Boolean(String(element.innerText ?? element.textContent ?? '').trim() ||
            element.querySelector?.('img, svg, [role="img"]'));
        }
        if (element.getAttribute?.('role') === 'img') {
          return Boolean(element.getAttribute?.('aria-label') || element.getAttribute?.('title') ||
            String(element.innerText ?? element.textContent ?? '').trim());
        }
        return Boolean(String(element.innerText ?? element.textContent ?? '').trim());
      });

      if (visibleCreative) {
        const dimensions = getVisibleDimensions(visibleCreative);
        return {
          status: 'REAL_CREATIVE_RENDERED',
          visible: true,
          note: 'Visible creative content observed inside a non-zero frame',
          metrics: { width: dimensions.width, height: dimensions.height }
        };
      }

      // A nested frame may contain a creative we cannot inspect. Do not promote
      // the nested iframe itself into rendered-creative evidence.
      if (frameDocument.querySelector?.('iframe')) unknownFrameContent = true;
    }

    if (unknownFrameContent) {
      return {
        status: 'INCONCLUSIVE',
        visible: false,
        note: 'Visible frame detected, but creative content could not be independently inspected',
        alternatives: ['cross_origin_frame', 'opaque_provider_content']
      };
    }

    return {
      status: 'EMPTY_OR_NO_FILL',
      visible: false,
      note: 'Visible frame detected without inspectable creative content'
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
