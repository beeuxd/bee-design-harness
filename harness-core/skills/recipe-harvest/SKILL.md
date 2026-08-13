---
name: recipe-harvest
description: Harvests a gate-passed composition into the project's recipe/template library — a design/recipes.md or design/templates.md entry plus a shadcn registry-item JSON, so proven compositions become reusable and CLI-installable instead of being rebuilt from memory. Use after a screen passes the ship gate, or to backfill recipes from already-shipped screens. Trigger phrases: "harvest this recipe", "save this as a recipe", "make this a template", "add to the recipe library", "backfill recipes from shipped screens". (Installing existing blocks from a registry is the shadcn MCP's job; this skill records what THIS project has proven.)
---

# Recipe Harvest — shipped compositions become reusable law

Recipes and templates are earned, never invented: only compositions that passed hifi-gate + the ship gate qualify. This skill records the proof and packages the reuse.

## Step 0 — Eligibility gate

1. Identify the screen/composition to harvest. **STOP** unless it has ship-gate evidence (a SHIP verdict covering it, or the user explicitly vouches for an already-shipped screen — record "user-vouched, pre-harness" as provenance in that case).
2. Decide granularity, and say which: **recipe** (a composition of primitives serving one situation — a settings form, a pricing table) → `design/recipes.md`; **template** (a full page archetype — dashboard, detail, empty state) → `design/templates.md`. A page harvest usually also yields 1–3 component recipes — list the candidates and harvest each separately.
3. Read `design/recipes.md` / `design/templates.md`. If an equivalent entry exists, STOP and ask: update it, or is this genuinely a second recipe for the same situation (usually a smell)?

## Step 1 — Extract the composition

1. Locate the source files (component/page under `components/` or `app/`). Read them.
2. Write the inventory entry per the table format in the target file: situation served, primitives composed (by name, citing `design/components.md` rows), states covered (from its story/spec), provenance (FEAT-ID, screen, ship date), responsive notes for templates.
3. The entry describes **composition**, not styling — colors/spacing live in tokens and would go stale here.

## Step 2 — Registry item (makes it installable)

1. Create `registry/<recipe-name>.json` in the project as a shadcn registry item: name, type (`registry:block` for recipes/templates), description = the situation served, `registryDependencies` (the shadcn primitives it uses), `files` (the component source paths with their content).
2. Follow the current schema — check an existing item in `registry/` or the shadcn registry docs via the shadcn MCP; do not guess fields.
3. Verify the item references only token-based styling (it inherits the project's tokens; a registry item with hardcoded values would spread violations — the design-system guard's rules apply to registry content too).

## Step 3 — Promote (optional, ask)

Ask the user: promote to the shared harness registry so other projects can install it? If yes, note the target (`registry/` in the bee-design-harness repo) — the promotion itself is a copy + commit in that repo, done with the user's confirmation, not silently.

## Step 4 — Verify + report

- Inventory row complete (no empty provenance), registry JSON parses (`node -e "JSON.parse(...)"`), file paths in it exist.
- Report: what was harvested, at which granularity, registry item path, promotion decision.

## Forbidden

- Harvesting unshipped work — the library's value IS the proof.
- Styling values in recipe entries — composition only.
- Silent overwrites of existing recipes.
