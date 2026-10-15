# AdBlocker Test Lab

**Test your protection. See the evidence. Understand the gaps.**

A browser-based lab for exploring ad-resource blocking, tracking protection, cosmetic filtering, privacy signals, popup containment, and observable resource-loading behavior.

## Documentation

See [docs/README.md](docs/README.md) for the current architecture, measurement model, operational guidance, known limitations, roadmap, and the detailed review of the supplied project attachments.

## Current status

This repository begins with the supplied React/TSX prototype. Treat its tests and scores as a work in progress until each test is verified in target browsers. Browser APIs cannot always distinguish an extension block from DNS filtering, CSP, browser-native protections, firewalls, or ordinary network failures; inconclusive outcomes must remain inconclusive.

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The local server runs at `http://localhost:8080` by default. It fails fast if port 8080 is already occupied.

Create a production build:

```bash
npm run build
npm run preview
```

## Deploying to Vercel

Import the repository into Vercel, use the Vite framework preset, and keep the default build command (`npm run build`) and output directory (`dist`). After deployment, add the chosen subdomain (planned: `lab.frpboy.in`) in the Vercel project settings and configure the DNS record Vercel specifies.

## Monetag integration

Monetag is the planned advertising provider, but no ad tag is included by default. Add a provider script only after publisher approval for this site's ad-blocker-testing use case. Keep any approved live ad placement inside an explicitly labelled ad-test block; don't automate clicks or reloads, and never score an empty/no-fill slot alone as proof of blocking. Record script load, ad response/no-fill, creative rendering, and request failure as distinct observations.

## Integrity principles

- Never invent test results, block counts, scores, or performance metrics.
- Distinguish controlled first-party fixtures from exploratory third-party probes.
- Separate confirmed observations from inferences and unknown causes.
- Don't identify a particular blocker unless evidence actually supports that attribution.
- Live ads and test resources must not generate artificial impressions or clicks.

## License

No license has been selected yet. All rights reserved by default until a license is added.
