const SCORABLE_STATUSES = new Map([
  ['BLOCKED', 1],
  ['PARTIAL', 0.5],
  ['ALLOWED', 0]
]);

export function validateCategoryWeights(categories = []) {
  return categories.map((category) => {
    const value = Number(category.defaultWeight);
    const validatedWeight = Number.isFinite(value) && value >= 0 ? Math.min(100, value) : 0;
    return { ...category, defaultWeight: validatedWeight, validatedWeight };
  });
}

export function calculateBenchmarkScore(resultsMap = {}, categoryWeights = [], registry = []) {
  const categories = validateCategoryWeights(categoryWeights);
  const privacy = registry.filter((test) => test.metricGroup === 'PRIVACY_SIGNAL');
  const privacySignalsSummary = { totalSignals: privacy.length, executedSignals: 0, activeCount: 0, inactiveCount: 0, inconclusiveCount: 0 };
  let completedTests = 0;
  let passedCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  let consistentWithFilteringCount = 0;
  let causeUnknownCount = 0;
  let inconclusiveCount = 0;
  let unsupportedCount = 0;
  let errorCount = 0;
  let cancelledCount = 0;

  for (const test of registry) {
    const status = resultsMap[test.id]?.status;
    if (!status || status === 'QUEUED' || status === 'RUNNING') continue;
    completedTests++;
    if (test.metricGroup === 'PRIVACY_SIGNAL') {
      privacySignalsSummary.executedSignals++;
      if (status === 'SIGNAL_ACTIVE') privacySignalsSummary.activeCount++;
      else if (status === 'SIGNAL_INACTIVE') privacySignalsSummary.inactiveCount++;
      else privacySignalsSummary.inconclusiveCount++;
      continue;
    }
    if (status === 'BLOCKED') passedCount++;
    else if (status === 'PARTIAL') partialCount++;
    else if (status === 'ALLOWED') failedCount++;
    else if (status === 'CONSISTENT_WITH_FILTERING') consistentWithFilteringCount++;
    else if (status === 'REQUEST_FAILED_CAUSE_UNKNOWN') causeUnknownCount++;
    else if (status === 'INCONCLUSIVE') inconclusiveCount++;
    else if (status === 'UNSUPPORTED') unsupportedCount++;
    else if (status === 'ERROR') errorCount++;
    else if (status === 'CANCELLED') cancelledCount++;
  }

  const categoryBreakdown = categories.map((category) => {
    const tests = registry.filter((test) => test.metricGroup === 'AD_TRACKER_BLOCKING' && test.scoringCategory === category.id);
    let eligibleCount = 0;
    let earnedCredits = 0;
    let catBlocked = 0;
    let catPartial = 0;
    let catAllowed = 0;
    let catExcluded = 0;
    for (const test of tests) {
      const status = resultsMap[test.id]?.status;
      if (!status || status === 'QUEUED' || status === 'RUNNING') continue;
      const credit = SCORABLE_STATUSES.get(status);
      if (!test.audit?.scoringEligible || credit === undefined) {
        catExcluded++;
        continue;
      }
      eligibleCount++;
      earnedCredits += credit;
      if (status === 'BLOCKED') catBlocked++;
      else if (status === 'PARTIAL') catPartial++;
      else catAllowed++;
    }
    return { ...category, totalTests: tests.length, eligibleCount, earnedCredits, catBlocked, catPartial, catAllowed, catExcluded, rawScore: eligibleCount ? Math.round((earnedCredits / eligibleCount) * 1000) / 10 : null, configuredWeight: category.validatedWeight, renormalizedWeight: 0 };
  });

  const activeWeight = categoryBreakdown.reduce((total, category) => total + (category.rawScore !== null ? category.configuredWeight : 0), 0);
  let weightedSum = 0;
  for (const category of categoryBreakdown) {
    if (category.rawScore !== null && activeWeight > 0 && category.configuredWeight > 0) {
      const normalized = (category.configuredWeight / activeWeight) * 100;
      category.renormalizedWeight = Math.round(normalized * 10) / 10;
      weightedSum += (category.rawScore * normalized) / 100;
    }
  }
  const eligibleTotalTests = categoryBreakdown.reduce((total, category) => total + category.eligibleCount, 0);
  const maxScoredTests = registry.filter((test) => test.metricGroup === 'AD_TRACKER_BLOCKING' && test.audit?.scoringEligible).length;
  const coveragePercentage = maxScoredTests ? Math.round((eligibleTotalTests / maxScoredTests) * 100) : 0;
  const overallScore = eligibleTotalTests && activeWeight ? Math.round(weightedSum) : null;
  return { overallScore, totalTests: registry.length, maxScoredTests, completedTests, eligibleTotalTests, passedCount, partialCount, failedCount, consistentWithFilteringCount, causeUnknownCount, inconclusiveCount, unsupportedCount, errorCount, cancelledCount, coveragePercentage, overallConfidence: !eligibleTotalTests ? 'No Live Data' : coveragePercentage >= 80 && inconclusiveCount <= 4 ? 'High (Controlled Fixtures)' : coveragePercentage >= 45 ? 'Moderate' : 'Low (Partial Coverage)', weightsWereRenormalized: activeWeight > 0 && Math.abs(activeWeight - 100) > 0.01, totalConfiguredWeightAll: categories.reduce((total, category) => total + category.validatedWeight, 0), totalConfiguredWeightOfEligibleCategories: activeWeight, categoryBreakdown, privacySignalsSummary };
}
