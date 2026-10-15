# Operations and Deployment

## Local development

Requirements are Node.js 20 or later and npm.

```powershell
npm install
npm run dev
```

The development and production-preview server default to port `8080`. Open `http://localhost:8080`; `strictPort` makes startup fail rather than silently selecting another port when 8080 is unavailable.

Use these gates before pushing or deploying:

```powershell
npm run typecheck
npm run build
npm audit --omit=dev
```

`npm run build` runs `tsc -b` and a Vite production build. The root prototype is JavaScript by design; strict TypeScript validation covers the typed entry/configuration portion of the project. Tailwind must retain `AdBlockerTestLab.jsx` in its content list. If it is omitted, the production CSS can be incorrectly purged even when development appears usable.

The repository intentionally ignores `node_modules`, `dist`, local environment files, TypeScript build info, and Playwright CLI artifacts. `package-lock.json` is committed for repeatable installs.

## Browser validation

The build does not prove browser behavior. Before a release, validate the application in Chromium, Firefox, and WebKit where possible, execute the in-app verification suite, and exercise at least one controlled fixture, one external-probe inconclusive path, pause, cancellation, report export, keyboard search, and responsive navigation.

The current recorded local validation was Chromium-only: typecheck/build passed and the in-app suite showed eight passed assertions. It is not evidence of Firefox or WebKit compatibility, publisher approval, or production deployment.

## Deployment

The repository is prepared for Vite hosting. The existing deployment checklist names Vercel with `npm run build` and `dist` as the output directory. The intended domain from the supplied project material is `lab.frpboy.in`, but it is not configured or verified by this repository.

To deploy safely:

1. Import the repository into the hosting provider.
2. Use the Vite build preset or configure build command `npm run build` and output directory `dist`.
3. Add the subdomain in the host project, then configure exactly the DNS record the host provides.
4. Verify HTTPS, responsive behavior, privacy/contact material, and error handling on the deployed origin.
5. Run browser validation against the deployed origin, not only the local dev server.

## Environment configuration

The production HTML includes an operator-approved asynchronous Google AdSense loader. It is not a benchmark fixture, does not contribute to any score, and must not be used to infer protection status. Any future provider script must receive equivalent explicit approval, remain labelled as third-party/exploratory, and stay outside authoritative score evidence.

## Live-ad integration boundary

The project may eventually offer an explicitly labelled live-ad test block, but there are hard integrity and policy constraints:

- A blank slot, no-fill response, or failed request is not proof that a blocker acted.
- Record script loading, ad response/no-fill, creative rendering, and request failure as distinct observations.
- Do not automate clicks, reloads, or impression generation.
- Do not treat a monetized placement as an authoritative benchmark fixture without the provider's explicit approval and a documented measurement design.
- Keep publisher ads out of unrelated UI so the laboratory remains usable and results remain interpretable.

The supplied attachments discussed Monetag and `lab.frpboy.in`; they are plans, not evidence that either party has approved, configured, or deployed the integration.

## Dependency risk

The production-only dependency audit is clean. A full development audit currently reports seven transitive advisories from the Tailwind 3 toolchain. The automated fix proposes Tailwind 4, a major migration. Do not run a force upgrade as a maintenance shortcut; plan, test, and review a Tailwind 4 migration separately.
