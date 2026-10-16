const STATUSES = new Set(['NOT_STARTED', 'SCRIPT_LOADING', 'SCRIPT_LOADED', 'REAL_CREATIVE_RENDERED', 'EMPTY_OR_NO_FILL', 'REQUEST_FAILED', 'BLOCKED_OR_FILTERED_POSSIBLE', 'PROVIDER_ERROR', 'INCONCLUSIVE']);

export function normalizeRealAdsObservation(input = {}) {
  const requestedStatus = STATUSES.has(input.status) ? input.status : 'INCONCLUSIVE';
  const status = requestedStatus === 'REAL_CREATIVE_RENDERED' && !input.visible ? 'INCONCLUSIVE' : requestedStatus;

  return {
    provider: input.provider ?? 'unknown',
    placementId: input.placementId ?? 'unknown',
    status,
    benchmarkEligible: false,
    alternatives: input.alternatives ?? []
  };
}
