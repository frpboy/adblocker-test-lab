# UI and UX Specification

## Experience goal

The interface must help a visitor understand evidence without mistaking a visual dashboard for proof. It should make the current state, the next action, the observation, confidence, alternative explanations, and limitation easy to find in that order.

## Information architecture

| View | User task | Required information |
| --- | --- | --- |
| Overview | Decide whether to run a benchmark | Product boundary, current state, score availability, category summary, environment caveats |
| Run benchmark | Choose scope and execution settings | Test counts, selected sections, concurrency/timeout/retry policy, run controls |
| Test laboratory | Find and inspect one test | Search, filters, status, validity class, result, audit record, run action |
| Protection analysis | Understand patterns without over-attribution | Direct observations, inferred layers, confidence, and unobservable boundaries |
| Results and reports | Review/export a completed run | Coverage, category scores, result table, export/copy/print actions |
| Methodology | Audit the system | Evidence classes, scoring rules, automated verification results, limitations |
| Settings | Change display/scoring preferences | Theme, reduced motion, category weights, exploratory-score setting, user-reported context |

## Primary flow

1. On initial load, show a standby state and an attribution boundary before showing any score.
2. A primary benchmark action must identify the selected case count.
3. During a run, show current case, completed/total count, pause/cancel state, and an active trace.
4. On completion, show coverage before emphasizing the numeric score.
5. A result row must allow inspection of the full audit record rather than only its final status.
6. On inconclusive/error/unsupported results, lead with the reason and limitation, not a pass/fail color.

## Content requirements

### Result language

- Use `BLOCKED`, `PARTIAL`, `ALLOWED`, `INCONCLUSIVE`, `UNSUPPORTED`, `ERROR`, and `CANCELLED` consistently.
- Do not use "protected" as a synonym for every `BLOCKED` result.
- Pair every inference with at least one alternative explanation or a link to its audit record.
- Do not show a score as zero when no score can be calculated; use "No eligible tests run" or equivalent.
- Mark exploratory/third-party evidence as non-authoritative by default.
- Mark user-reported information as user reported.

### Score presentation

The score area must show:

- Whether a score is available.
- Completed tests/total tests.
- Core scored coverage and count.
- Blocked, partial, allowed, and excluded/inconclusive counts.
- Category weights and per-category usable evidence.
- Whether exploratory inclusion is enabled.

## Component behavior

| Component | Behavior |
| --- | --- |
| Navigation | Semantic landmark/label; mobile menu exposes the same views without hiding current location |
| Benchmark button | Disabled while a run is active; names selected/full count; does not reset completed evidence without clear user action |
| Test table/list | Supports search by ID/name/description/section and filters by status, section, and audit validity |
| Test detail modal | Closes with Escape, has a visible close control, returns focus to the invoking element, and provides run/methodology actions |
| Trace | Shows six ordered stages with observed vs inferred evidence type and no color-only meaning |
| Pause/cancel | Announces state changes and exposes immediate abort progress; browser-matrix validation remains required for active-work cleanup |
| Export | Provides format name and error feedback; never injects unsanitized text into HTML output |
| Theme/reduced motion | Theme has adequate contrast; reduced-motion preference is respected and can be changed |
| Notifications | Announce action success/failure without blocking keyboard use or persisting beyond relevance |

## Accessibility requirements

1. All interactive controls have accessible names, visible focus styling, and keyboard activation.
2. Icon-only actions require an accessible label.
3. Status uses text/icons/patterns in addition to color.
4. Tables use correct headers and responsive alternatives when width is constrained.
5. Modals trap focus only while open, support Escape, and restore focus after close.
6. Motion is suppressed or reduced when the user requests reduced motion.
7. Errors and run progress are programmatically announced through appropriate live regions.
8. Text, controls, and focus indicators meet WCAG AA contrast requirements in both themes.
9. Touch targets are large enough for mobile interaction and adjacent destructive controls are not easy to trigger accidentally.

## Responsive requirements

| Breakpoint context | Requirement |
| --- | --- |
| Narrow mobile | Collapsible navigation, single-column controls, horizontally safe data presentation, no essential hover-only interaction |
| Tablet | Two-column control groups where readable; preserve visible progress and test filters |
| Desktop | Persistent navigation and side-by-side evidence/summary only when reading order remains logical |

Do not hide limitation text on small screens. Prefer progressive disclosure through an accessible details/modal pattern over tiny text or truncated evidence.

## Visual system requirements

- Use one visual hierarchy for decisive actions, one for diagnostic/supporting data, and one for limitations; avoid making every region look equally urgent.
- Reserve strong status treatment for terminal results and active execution.
- Use compact tables for comparable test data, prose for limitations, and ordered trace stages for execution sequence.
- Keep spacing and typography systematic; a dense technical interface may be compact but must never become a wall of similarly styled cards.
- Prefer neutral surfaces and restrained accents; do not use animation to imply work that is not occurring.

## UI acceptance scenarios

| ID | Scenario | Pass condition |
| --- | --- | --- |
| UX-01 | First visit | No fabricated score; benchmark purpose and limitation visible |
| UX-02 | Keyboard laboratory search | Slash focuses search only in the laboratory and does not disrupt text fields |
| UX-03 | Inconclusive third-party probe | UI explains that failure cannot identify DNS/blocker cause |
| UX-04 | Modal | Escape closes and focus returns to the opener |
| UX-05 | Reduced motion | Spinners/pulses do not run when reduced motion is enabled |
| UX-06 | Export | Generated report preserves result/status distinctions and escapes hostile text |
| UX-07 | Mobile | All primary actions, filters, trace, and limitations remain reachable without hover |
