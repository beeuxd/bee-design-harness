---
name: storybook-component
description: Maintains the story-per-component discipline — every component in design/components.md gets a Storybook story covering its full states matrix, and the running Storybook MCP server is queried for existing components before anything new is built. Use after building or restyling any component, when stories are missing or stale, or to check what components already exist. Trigger phrases: "write the story", "add it to Storybook", "story for this component", "what components exist", "check Storybook first", "stories are out of date". (This skill can install Storybook itself if missing; building the component happens elsewhere — this skill documents and verifies it as executable spec.)
---

# Storybook Component — stories as the executable spec

Stories make the coded component library machine-readable: a component without a story is invisible to agents and unverifiable in isolation. Storybook is a **source of truth** for coded behavior (precedence: tokens.json > Figma > Storybook > components.md — see `DESIGN.md`).

## Step 0 — Is Storybook available?

1. Check `package.json` for a `storybook` script and a `.storybook/` directory.
2. **Not installed** → STOP and ask: "Storybook isn't set up. Install it now (Storybook + `@storybook/addon-mcp`, ~5 min), or skip stories for this project?" If the user opts in, install it here:
   ```bash
   pnpm dlx storybook@latest init --yes && pnpm add -D @storybook/addon-mcp
   ```
   Then register `@storybook/addon-mcp` in the `addons` array of `.storybook/main.ts`, and import `../app/globals.css` in `.storybook/preview.ts` so stories get the app's tokens and styles — with dark mode as the default theme, matching the app. If they decline, record the decision in `docs/tech.md` so this question isn't re-asked every component.
3. Confirm the dev instance runs: `pnpm storybook` — MCP endpoint is `/mcp` on the Storybook dev server (registered via `@storybook/addon-mcp` in `.storybook/main.ts`).

## Reuse check (run BEFORE building any new component)

When invoked as the pre-build check before any new component is built:

1. Query the running Storybook MCP for existing components and their props/variants (fall back to `design/components.md` + a `grep` over `components/` if the server isn't running — but say which source you used).
2. Report: exact match / close match (name it and what differs) / no match. A close match goes back to the caller's reuse-first decision — extending an existing component beats a near-duplicate.

## Writing the story

For the component just built or restyled:

1. One story file next to Storybook convention for this repo (`<component>.stories.tsx`), typed with CSF3 (`Meta`/`StoryObj`).
2. **Cover the full states matrix** — the states come from the component's spec (`docs/specs/<feature>.md` or `design/components.md` entry): default, hover/focus/active where interactive, disabled, loading, empty, error, and content-extremes (long text, zero items, overflow). One named story per state. A story file with only `Default` is a stub, not coverage.
3. Stories render in both themes (theme switchable; default first, matching the app's intake setting).
4. Token-only styling applies inside stories too (the design-system-guard hook scans story files like any other write).
5. Controls (`argTypes`) for every public prop, so the MCP exposes real prop metadata to agents.

## Verify

1. Storybook dev server renders every new story without errors (check the terminal output; error boundaries in the Storybook UI count as failures).
2. If `@storybook/addon-vitest`/test runner is configured, run it for this component; otherwise state plainly that stories are render-verified only.
3. Record the story path in the component's row in `design/components.md` — in the **Notes** cell for shadcn primitives, appended to the **Description** cell for custom components. components.md stays the narrative index; the story is the executable entry.

## Forbidden moves

- **No stories with hardcoded values** that the component's props should carry — stories demonstrate the real API.
- **No skipping states because they're "obvious".** The states matrix is the contract; every row gets a story.
- **No treating a missing story as acceptable debt** for a shipped component — story-per-component is the discipline, same turn as the build.

## Handoffs

- Story reveals a visual defect → fix the component (route back to whichever build path produced it), not the story.
- States matrix doesn't exist for this component → the feature's design spec owns states (wireframe-loop/hifi-gate output); get the matrix before faking one.
- Many components missing stories → propose a sweep, one component at a time, oldest first.
