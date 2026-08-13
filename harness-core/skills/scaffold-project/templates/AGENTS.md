# AGENTS.md — {{PROJECT_NAME}}

Instructions for any coding agent working in this repo (generated from DESIGN.md — do not hand-edit; regenerate via `sync-executor-context`).

## Project

{{PROJECT_DESCRIPTION}}

## Read before designing or building

`DESIGN.md` (the design harness: pipeline, gates, roles) → `docs/design-system.md` (art direction) → `design/taste-rules.md` (standing taste rules — they override your defaults) → `design/tokens.md` + `design/components.md` + `design/recipes.md` (what exists — reuse before building) → `docs/content-guidelines.md` (voice — never invent product claims).

## Sources of truth (higher wins)

1. `design/tokens.json` — every color, spacing, radius, type value
2. Figma — visual intent, read via variables, never eyeballed from screenshots
3. Storybook — coded component behavior and states
4. Narrative docs — descriptive, not authoritative

## Hard rules (no exceptions)

- **Token-only styling.** No hardcoded hex, no arbitrary px. All values from `design/tokens.json`. Never hand-edit `app/tokens.css` (generated — `pnpm tokens`).
- **Dark mode first**, mobile first: works at 360px before desktop; verify at 360 / 768 / 1024 / 1440 / 1920px.
- **WCAG 2.2 AA**: semantic HTML, keyboard nav, visible focus, contrast AA, tap targets ≥ 44×44px, every animation gated on `prefers-reduced-motion`.
- **Performance budget**: LCP ≤ 2.5s, INP ≤ 200ms, TBT < 200ms, CLS ≤ 0.1, JS first-load < 150KB gz.
- **No visual work without art direction** in `docs/design-system.md`.
- **Content-first**: missing copy gets flagged, never invented.
- **Evidence before "done"**: build output, screenshots, test results — claims without artifacts don't count.
- **Ask before**: new dependencies, token changes, new pages not in `docs/prd.md`, anything touching analytics/privacy/third-party embeds, production deploys.
- **Protected files** (require explicit human approval): `design/tokens.json`, `CLAUDE.md`, `.claude/settings.json`.

## Workflow

- Branch `feature/<short-description>`; never commit to main. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Experiments live in sandboxes: Storybook stories, `app/dev-preview/<slug>/` scratch routes (never linked from production nav, deleted after verdict), worktrees, preview deploys.
- TypeScript strict; no `any` without a `// TODO` explaining why.
- Reuse first: check `design/components.md`, `design/recipes.md`, Storybook, and the shadcn registry before creating anything new.
