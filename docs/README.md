# Documentation

This directory documents the current AdBlocker Test Lab repository and the two supplied historical attachments. It is written for maintainers, reviewers, and future implementers.

## Documentation map

| Document | Purpose | Authority |
| --- | --- | --- |
| [Current system](current-system.md) | Runtime architecture, source layout, state, execution, and exports | Current source code |
| [Measurement and scoring](measurement-and-scoring.md) | Test taxonomy, evidence model, classification, and score rules | Current source code |
| [Operations and deployment](operations-and-deployment.md) | Local workflow, deployment checklist, configuration, and ad-integration boundary | Current source code and repository documentation |
| [Known limitations and roadmap](known-limitations-and-roadmap.md) | Proven limitations, risks, and sequenced work | Current source code plus clearly labelled recommendations |
| [Attachment review](attachment-review.md) | Detailed record of the supplied Canvas/proposal discussion and what remains reference-only | Supplied attachments |
| [Product requirements document](prd.md) | Product purpose, users, functional requirements, success criteria, and non-goals | Current source and accepted product direction |
| [Technical requirements document](trd.md) | Target architecture, interfaces, data rules, security constraints, and implementation requirements | Current source and planned requirements |
| [UI and UX specification](ui-ux-specification.md) | Information architecture, interaction behavior, accessibility, responsive rules, and UI acceptance criteria | Current UI and planned requirements |
| [Technology stack](technology-stack.md) | Current dependencies, build pipeline, hosting assumptions, and adoption rules | Current package/configuration files |
| [Quality and release strategy](quality-and-release-strategy.md) | Test layers, release gates, evidence capture, and ownership checklist | Current validation and planned requirements |

## Source-of-truth rules

1. Current checked-in source and runtime verification override historical notes.
2. A browser observation is not automatically attribution to a specific ad blocker, DNS service, VPN, or browser setting.
3. Controlled first-party fixtures, exploratory third-party probes, and browser capability checks have different evidentiary value and must not be conflated.
4. No documentation claim about ads, deployment, publisher approval, or cross-browser behavior is evidence of approval or production operation.

## Current snapshot

- Product: AdBlocker Test Lab, version 3.2.0.
- Runtime: a Vite + React single-page application.
- Registry: 53 test entries across 13 sections; the live UI currently derives its counts from the registry.
- Current core-score display: 37 scoring-eligible entries, 9 exploratory external entries, and 9 browser capability entries. Some capability entries can still be scoring eligible only when an active privacy signal is observed; category labels are not score eligibility by themselves.
- Validation recorded before this documentation was added: strict TypeScript check passed, production Vite build passed, production dependency audit reported no vulnerabilities, and the in-app verification suite passed eight assertions in Chromium.

## How to update these documents

Update the relevant document in the same change as any new test type, result state, score rule, fixture endpoint, export field, publisher integration, or deployment process. Re-run the commands in Operations and Deployment and do not describe an unverified behavior as working.
