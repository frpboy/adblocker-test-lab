# Gemini Repository Context

Read [AGENTS.md](AGENTS.md) before acting. It is the shared engineering authority for this repository.

## Gemini-specific operating rules

- Treat `docs/` and live source as the context window for this project; do not rely on historical Canvas or chat text when current files disagree.
- The current UI is a Vite/React prototype, not the proposed Next.js/backend architecture described in historical material.
- Start local browser work with `npm run dev` and use `http://localhost:8080`.
- Do not make an output look more certain than the browser evidence permits. Inconclusive is a correct outcome.
- Keep product, score, and ad-provider changes separate until the underlying fixture/backend evidence exists.
- After source/configuration changes, run `npm run typecheck` and `npm run build`; report any incomplete validation honestly.

For detailed requirements, read `docs/prd.md`, `docs/trd.md`, `docs/ui-ux-specification.md`, and `docs/quality-and-release-strategy.md`.
