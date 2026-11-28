import { buildRunSummary } from './run-summary.js';

export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function formatCsvField(val) {
  let s = String(val ?? '').replace(/"/g, '""');
  // Security: Mitigate CSV / Formula Injection (CWE-1236)
  // Prefix cells starting with formula trigger characters with a single quote
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  return `"${s}"`;
}

/**
 * Run-specific context for exports: how many scored tests were MEASURED (not how many blocked),
 * the actual scored outcome, run metadata and the third-party reachability summary with its
 * control servers. Only what was recorded for this run is printed. Missing data is said to be missing.
 */
export function exportRunContextHtml({ scoreSummary, resultsMap, registry, lastRun }) {
  const summary = buildRunSummary({ scoreSummary, resultsMap: resultsMap || {}, registry: registry || [], lastRun: lastRun || null });
  const measured = scoreSummary?.eligibleTotalTests ?? 0;
  const maxScored = scoreSummary?.maxScoredTests ?? 0;
  const parts = [];
  parts.push(
    `<p>Scored tests measured across all stored results: ${escapeHtml(measured)} of ${escapeHtml(maxScored)}. This counts scored tests that gave a result, not tests that blocked.</p>`,
    `<p>Scored outcome in the most recent run only: ${escapeHtml(summary.blocked.length)} blocked, ${escapeHtml(summary.partly.length)} partly blocked, ${escapeHtml(summary.allowed.length)} got through.</p>`
  );
  if (lastRun?.finishedAt) {
    const bits = [
      `scope: ${lastRun.label || 'unknown'}`,
      `finished: ${lastRun.finishedAt}`,
      lastRun.timeoutMs ? `request time limit: ${lastRun.timeoutMs} ms` : null,
      lastRun.concurrency ? `parallel requests: ${lastRun.concurrency}` : null,
      lastRun.appVersion ? `lab version: ${lastRun.appVersion}` : null,
      lastRun.cancelled ? 'run was stopped before it finished' : null
    ].filter(Boolean);
    parts.push(`<p>Run details: ${escapeHtml(bits.join(' | '))}.</p>`);
  } else {
    parts.push('<p>Run details: not recorded for these results.</p>');
  }
  const r = summary.reachability;
  if (r.state === 'not_run') {
    parts.push('<p>Third-party reachability: no control-server results were recorded for these results, so failed third-party requests below cannot be read against controls.</p>');
  } else {
    parts.push(`<p><strong>${escapeHtml(r.title)}</strong> ${escapeHtml(r.body)}</p>`);
  }
  const controls = Array.isArray(lastRun?.controls) ? lastRun.controls : [];
  if (controls.length) {
    const items = controls
      .map((c) => {
        const why = c.timedOut ? ' (timed out)' : c.aborted ? ' (run stopped)' : c.error ? ` (${c.error})` : '';
        const took = Number.isFinite(c.ms) ? ` in ${c.ms} ms` : '';
        return `<li>${escapeHtml(`${c.host}: ${c.reached ? 'answered' : `not reached${why}`}${took}`)}</li>`;
      })
      .join('');
    parts.push(`<p>Control servers (ordinary sites, not ad servers):</p><ul>${items}</ul>`);
  }
  return parts.join('');
}

export function generateHtmlReport({ brandName, appVersion, brandPromise, registry, scoreSummary, resultsMap, userReported, lastRun }) {
  const reported = userReported || {};
  const rows = registry.map((test) => {
    const result = resultsMap[test.id] || {};
    return `<tr><td><code>${escapeHtml(test.id)}</code></td><td>${escapeHtml(test.section)}</td><td><code>${escapeHtml(test.metricGroup)}</code></td><td><strong>${escapeHtml(test.name)}</strong><br/><small>${escapeHtml(test.audit?.technicalValidity)}</small></td><td><strong>${escapeHtml(result.status || 'NOT_RUN')}</strong></td><td>${escapeHtml(result.confidence?.label || 'N/A')}</td><td>${escapeHtml(result.actualOutcome || 'Not executed')}</td><td><code>${escapeHtml(test.recommendedRule || '')}</code></td></tr>`;
  }).join('\n');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>${escapeHtml(brandName)} v${escapeHtml(appVersion)}: Benchmark Report</title></head><body><h1>${escapeHtml(brandName)} v${escapeHtml(appVersion)}: Diagnostic Benchmark Report</h1><p><strong>${escapeHtml(brandPromise)}</strong></p><div><h2>Test-probe score: ${scoreSummary.overallScore !== null ? `${escapeHtml(scoreSummary.overallScore)} / 100` : 'No Scored Blocking Tests Executed'}</h2>${exportRunContextHtml({ scoreSummary, resultsMap, registry, lastRun })}<p>Scope: the scored fixtures are same-site probes. Requests to third-party servers and network-level filtering are not scored; see the extra checks below.</p><p>Browser Privacy &amp; Hardening Signals Active: ${escapeHtml(scoreSummary.privacySignalsSummary.activeCount)} / ${escapeHtml(scoreSummary.privacySignalsSummary.totalSignals)}</p><p><strong>User-Reported Context:</strong> Extension: ${escapeHtml(reported.installedExtension || 'unspecified')} | DNS: ${escapeHtml(reported.privateDns || 'unspecified')} | Notes: ${escapeHtml(reported.notes || 'None')}</p></div><table><thead><tr><th>ID</th><th>Domain</th><th>Metric Group</th><th>Test &amp; Validity</th><th>Status</th><th>Confidence</th><th>Observed Evidence</th><th>Target Rule</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}
