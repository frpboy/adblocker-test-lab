# Technology Stack

## Current stack

| Area | Technology | Current version/range | Use |
| --- | --- | --- | --- |
| Runtime/tooling | Node.js | 20 or later required by project documentation | Local install/build runtime |
| Build tool | Vite | 6.4.4 installed | Development server and production bundle |
| UI | React and React DOM | 18.3.1 | Browser user interface |
| Language boundary | JavaScript/JSX plus TypeScript | TypeScript 5.9.3 installed | Root prototype is JSX; entry/configuration use TypeScript |
| Styling | Tailwind CSS | 3.4.19 | Utility generation and dark-mode classes |
| CSS processing | PostCSS and Autoprefixer | 8.5.30 and 10.6.1 | CSS transform pipeline |
| Icons | Lucide React | 0.468.0 | Accessible visual icons paired with text/labels |
| React build plugin | `@vitejs/plugin-react` | 4.7.0 | JSX transform and development integration |
| Type information | `@types/react`, `@types/react-dom` | 18.3.x | TypeScript support for typed project files |

Installed versions are verified from the current lockfile/npm dependency tree; package ranges in `package.json` may permit compatible future installs. Commit the lockfile with dependency changes.

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Restore dependencies according to package manifest/lockfile |
| `npm run dev` | Start Vite on all interfaces for local development |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run build` | Type-check project build references and create `dist` with Vite |
| `npm run preview` | Serve the production bundle locally |

## Configuration notes

- `tailwind.config.js` scans `index.html`, `src` JS/TS/JSX/TSX sources, and `AdBlockerTestLab.jsx`. Removing the root entry will purge the prototype's utility classes from production CSS.
- Vite configuration currently only enables the React plugin; no backend proxy, headers, environment injection, or server routes exist.
- TypeScript is strict with `allowJs` enabled so the root JSX prototype can be included without pretending it is fully typed.
- `.env.example` reserves `VITE_MONETAG_SCRIPT_URL`, but no ad provider is integrated.

## Hosting assumptions

The current output is static Vite content and can be hosted by Vercel or another static host. A future controlled-fixture architecture requires a separate server/runtime capable of persisting and verifying request arrival across instances. Do not rely on Vite development-server behavior as a production fixture service.

## Dependency adoption rules

1. Prefer platform/browser APIs and existing dependencies before adding a package.
2. Add a dependency only when it removes meaningful maintenance/security risk or provides a required capability.
3. Pin/lock updates through `package-lock.json`, run build/typecheck/audit, and record migration impact.
4. Do not force major dependency upgrades solely to silence audit output; review framework/configuration compatibility first.
5. Avoid adding analytics, ad SDKs, or browser fingerprinting packages without an explicit privacy, policy, and measurement review.

## Known tooling risk

Production-only audit is clean. The development dependency graph still has seven transitive Tailwind 3 advisories. The available automated remedy proposes Tailwind 4, a major change. A future migration must include configuration conversion, visual regression checks, build validation, and review of all generated CSS before merge.
