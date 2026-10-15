export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function generateHtmlReport({ brandName, appVersion, brandPromise, registry, scoreSummary, resultsMap, userReported }) {
  const reported = userReported || {};
  const rows = registry.map((test) => {
    const result = resultsMap[test.id] || {};
    return `<tr><td><code>${escapeHtml(test.id)}</code></td><td>${escapeHtml(test.section)}</td><td><code>${escapeHtml(test.metricGroup)}</code></td><td><strong>${escapeHtml(test.name)}</strong><br/><small>${escapeHtml(test.audit?.technicalValidity)}</small></td><td><strong>${escapeHtml(result.status || 'NOT_RUN')}</strong></td><td>${escapeHtml(result.confidence?.label || 'N/A')}</td><td>${escapeHtml(result.actualOutcome || 'Not executed')}</td><td><code>${escapeHtml(test.recommendedRule || '')}</code></td></tr>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>${escapeHtml(brandName)} v${escapeHtml(appVersion)}: Benchmark Report</title></head><body><h1>${escapeHtml(brandName)} v${escapeHtml(appVersion)}: Diagnostic Benchmark Report</h1><p><strong>${escapeHtml(brandPromise)}</strong></p><div><h2>Ad &amp; Tracker Blocking Score: ${scoreSummary.overallScore !== null ? `${escapeHtml(scoreSummary.overallScore)} / 100` : 'No Scored Blocking Tests Executed'}</h2><p>Core Blocking Coverage: ${escapeHtml(scoreSummary.coveragePercentage)}% (${escapeHtml(scoreSummary.eligibleTotalTests)}/${escapeHtml(scoreSummary.maxScoredTests)} core blocking fixtures)</p><p>Browser Privacy &amp; Hardening Signals Active: ${escapeHtml(scoreSummary.privacySignalsSummary.activeCount)} / ${escapeHtml(scoreSummary.privacySignalsSummary.totalSignals)}</p><p><strong>User-Reported Context:</strong> Extension: ${escapeHtml(reported.installedExtension || 'unspecified')} | DNS: ${escapeHtml(reported.privateDns || 'unspecified')} | Notes: ${escapeHtml(reported.notes || 'None')}</p></div><table><thead><tr><th>ID</th><th>Domain</th><th>Metric Group</th><th>Test &amp; Validity</th><th>Status</th><th>Confidence</th><th>Observed Evidence</th><th>Target Rule</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}
