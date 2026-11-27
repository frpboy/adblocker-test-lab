import { plainTestName } from './plain-language.js';

export const SITE_URL = 'https://lab.frpboy.in';
export const SITE_LABEL = 'lab.frpboy.in';

const UNMEASURED_REASONS = {
  INCONCLUSIVE: 'The page could not tell whether it was blocked.',
  UNSUPPORTED: 'This browser does not support the check.',
  ERROR: 'The test ran into an error.',
  CANCELLED: 'The run was stopped before this test finished.'
};

// One verdict, shared by the Results screen, the run summary, and the share card.
export function scoreVerdict(scoreSummary) {
  const { overallScore, eligibleTotalTests, maxScoredTests, passedCount, failedCount } = scoreSummary;
  if (!eligibleTotalTests) {
    return {
      tone: 'none',
      title: 'No results yet',
      body: 'Run the quick check or the full test. Your score appears once at least one scored test gives a clear answer.'
    };
  }
  if (eligibleTotalTests * 2 < maxScoredTests) {
    return {
      tone: 'partial',
      title: 'Partial result',
      body: `Only ${eligibleTotalTests} of ${maxScoredTests} scored tests gave a clear answer, so this number can still move a lot. Run the full test before drawing conclusions.`
    };
  }
  if (overallScore >= 85) {
    return {
      tone: 'strong',
      title: 'Most test probes were blocked',
      body: `${passedCount} of ${eligibleTotalTests} scored test probes were blocked outright.`
    };
  }
  if (overallScore >= 50) {
    return {
      tone: 'mixed',
      title: 'Some test probes were not blocked',
      body: `${failedCount} of ${eligibleTotalTests} scored test probes were not blocked.`
    };
  }
  return {
    tone: 'weak',
    title: "Most test probes weren't blocked",
    body: 'The scored tests use made-up ad-like paths and page elements on this site (no real ads are loaded), so the score describes how this browser setup handled them, not how well it blocks ads on the web. If you use a blocker, check that it is on for this site and that element hiding is on, then run the test again. DNS or network-level blockers are not measured by the scored tests.'
  };
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Plain-language account of the most recent run.
 * Lists cover only the tests in that run; the score covers every result so far.
 */
export function buildRunSummary({ scoreSummary, resultsMap, registry, lastRun, nameOf = plainTestName }) {
  const inRun = lastRun?.testIds?.length ? new Set(lastRun.testIds) : new Set(Object.keys(resultsMap || {}));
  const tests = registry.filter((t) => inRun.has(t.id) && resultsMap?.[t.id]?.status);
  const item = (t) => ({ id: t.id, name: nameOf(t), outcome: resultsMap[t.id]?.actualOutcome || '' });
  const statusOf = (t) => resultsMap[t.id].status;

  const scored = tests.filter((t) => t.metricGroup === 'AD_TRACKER_BLOCKING');
  const privacy = tests.filter((t) => t.metricGroup === 'PRIVACY_SIGNAL');
  const extra = tests.filter((t) => t.metricGroup === 'EXPLORATORY_PROBE');

  const blocked = scored.filter((t) => statusOf(t) === 'BLOCKED').map(item);
  const partly = scored.filter((t) => statusOf(t) === 'PARTIAL').map(item);
  const allowed = scored.filter((t) => statusOf(t) === 'ALLOWED').map(item);
  const unmeasured = tests
    .filter((t) => UNMEASURED_REASONS[statusOf(t)])
    .map((t) => ({ ...item(t), reason: UNMEASURED_REASONS[statusOf(t)] }));

  const privacyOn = privacy.filter((t) => statusOf(t) === 'SIGNAL_ACTIVE').map(item);
  const privacyOff = privacy.filter((t) => statusOf(t) === 'SIGNAL_INACTIVE').map(item);
  const extraFailed = extra
    .filter((t) => ['REQUEST_FAILED_CAUSE_UNKNOWN', 'BLOCKED', 'CONSISTENT_WITH_FILTERING'].includes(statusOf(t)))
    .map(item);
  const extraReached = extra.filter((t) => statusOf(t) === 'ALLOWED').map(item);

  const scoredIds = new Set(scored.map((t) => t.id));
  const scoredUnmeasured = unmeasured.filter((t) => scoredIds.has(t.id));
  const otherUnmeasured = unmeasured.length - scoredUnmeasured.length;

  // Did the blocker do anything at all, and how well did it hide ad elements?
  const blockerActive = blocked.length + partly.length + extraFailed.length > 0;
  const cosmetic = (scoreSummary.categoryBreakdown || []).find((c) => c.id === 'cosmetic_filtering');
  const cosmeticWeak = Boolean(cosmetic && cosmetic.eligibleCount >= 3 && cosmetic.rawScore !== null && cosmetic.rawScore < 50);

  const verdict = scoreVerdict(scoreSummary);
  const partial = verdict.tone === 'partial';
  const total = registry.length;
  const scope =
    tests.length === total ? 'full' : lastRun?.label === 'quick' ? 'quick' : tests.length ? 'custom' : 'none';

  const simple = [];
  if (tests.length) {
    simple.push(
      `This run checked ${plural(tests.length, 'test')}${scope === 'full' ? ', the complete set' : ''}.`
    );
  }
  if (scored.length) {
    simple.push(
      `Of the scored test probes: ${blocked.length} blocked, ${partly.length} partly blocked, ${allowed.length} got through.`
    );
  }
  if (scoredUnmeasured.length) {
    simple.push(
      `${plural(scoredUnmeasured.length, 'scored test')} could not be measured, so ${scoredUnmeasured.length === 1 ? 'it is' : 'they are'} left out of the score.`
    );
  }
  if (otherUnmeasured) {
    simple.push(`${plural(otherUnmeasured, 'privacy or extra check')} could not be measured. These never count toward the score.`);
  }
  if (privacy.length) {
    simple.push(`Privacy settings: ${privacyOn.length} of ${privacy.length} checked ${privacyOn.length === 1 ? 'is' : 'are'} on.`);
  }

  const nextSteps = [];
  if (scored.length && !blockerActive) {
    nextSteps.push('Nothing was blocked. If you expected an ad blocker to be active, check that it is installed, switched on, and not paused for this site.');
  } else if (blockerActive && cosmeticWeak) {
    nextSteps.push(
      `Your blocker is active (it stopped some requests) but hid only ${cosmetic.catBlocked} of ${cosmetic.eligibleCount} ad elements on the page. Turn on element hiding, sometimes called cosmetic filtering. Some blockers only hide common ad elements in their strongest mode; in uBlock Origin Lite that mode is called "Complete".`
    );
  }
  if (partial || scope !== 'full') nextSteps.push('Run the full test for a score you can rely on.');
  if (allowed.length) nextSteps.push('Look at the "Got through" list to see which kinds of ads your setup misses.');
  if (unmeasured.length) nextSteps.push('Open "Could not be measured" in the detailed view for the reason behind each one. Some checks need a browser feature or a server this site does not run, so they stay unmeasured.');
  if (!allowed.length && blocked.length && !partial) nextSteps.push('Share your result, or test again after changing your blocker settings to compare.');

  return {
    hasRun: tests.length > 0,
    finishedAt: lastRun?.finishedAt || null,
    cancelled: Boolean(lastRun?.cancelled),
    scope,
    testsInRun: tests.length,
    totalTests: total,
    score: scoreSummary.overallScore,
    eligible: scoreSummary.eligibleTotalTests,
    maxScored: scoreSummary.maxScoredTests,
    partial,
    verdict,
    simple,
    blocked,
    partly,
    allowed,
    unmeasured,
    scoredUnmeasured,
    otherUnmeasured,
    blockerActive,
    privacyOn,
    privacyOff,
    extraFailed,
    extraReached,
    categories: (scoreSummary.categoryBreakdown || []).map((c) => ({
      id: c.id,
      name: c.name,
      score: c.eligibleCount ? c.rawScore : null,
      blocked: c.catBlocked,
      eligible: c.eligibleCount
    })),
    nextSteps
  };
}

// Text that travels with the shared image (and is the whole message where images cannot be shared).
export function buildShareText(summary, url = SITE_URL) {
  if (summary.score === null || summary.score === undefined) {
    return `Try the AdBlocker Test Lab probes in your browser: ${url}`;
  }
  const coverage = summary.partial
    ? ` (partial result, ${summary.eligible} of ${summary.maxScored} scored tests)`
    : ` (${summary.eligible} of ${summary.maxScored} scored tests)`;
  return `My browser setup scored ${summary.score}/100 on the AdBlocker Test Lab test probes${coverage}. One setup, one moment. Test yours: ${url}`;
}
