# Claude Repository Context

Read [AGENTS.md](AGENTS.md) before acting. It is the shared engineering authority for this repository.

## Claude-specific operating rules

- Inspect the relevant source and documentation before proposing or applying changes.
- Use `docs/measurement-and-scoring.md` as the authority for result semantics and attribution boundaries.
- For UI and copy work, follow the owner's brand direction in `DESIGN.md` (audience, voice, palette, dials) and record decisions in `docs/design-rationale.md`.
- Keep `src/lab/help-content.js` true to how the site works; update it when behaviour changes.
- The local Vite dev and preview default is `http://localhost:8080`; do not assume Vite's normal 5173 fallback.
- Preserve the separation between implemented browser-only behavior and planned fixture/backend/live-ad work.
- Treat third-party failures, browser capabilities, sandbox behavior, and user-reported inputs with the documented uncertainty model.
- Do not add secret material, live ad tags, or monetization automation.
- Run `npm run typecheck` and `npm run build` after code/config changes; update the appropriate docs when behavior or operational process changes.

Use `docs/README.md` to locate the PRD, TRD, UI/UX, technology, and quality specifications.
