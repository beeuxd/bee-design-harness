---
name: from-figma
description: Builds a React component or page from a Figma design by pulling exact specs from Figma variables (never eyeballing screenshots) and interaction behavior from shadcn/Radix source, then verifies the build against the Figma screenshot with Playwright. Use when the user shares a figma.com link to be built, or asks to implement a design. Triggers: "build this from Figma", "implement this design", "here's the Figma", "make this screen", "code up this mockup", "from the figma". (A Figma or site link shared as inspiration to save — not to build — is filed under design/references/ with notes, not built here.)
---

# Build from Figma

Turn a Figma node into working code with zero guessed values.

**The two-source rule is the spine of this skill:**
1. **Visual specs** (color, spacing, radius, typography) come from **Figma variables** (`get_variable_defs`, `get_design_context`) mapped to semantic tokens in `design/tokens.json`. NEVER read a color or size off a screenshot.
2. **Interaction behavior** (hover, focus, keyboard, aria) comes from the **shadcn/Radix primitive's actual source** in `components/ui/`. NEVER invent behavior from the picture. Read the primitive's file before styling it.

A screenshot is only for layout comprehension and final visual comparison — never a source of spec values.

## Step 0 — Preconditions

- [ ] Confirm the Figma MCP is connected (any `get_metadata` call succeeds). **If no Figma MCP is available: STOP and ask the user for (a) exported PNGs of the frame at desktop and mobile widths, and (b) the variable/spec values (colors, spacing, radius, type styles) as text. Do not proceed by guessing from an image alone.**
- [ ] **Art-direction hard gate:** `docs/design-system.md` must contain a written art direction, and read `design/taste-rules.md` before building — if the art direction section is missing, STOP and run the `art-direction` skill first.
- [ ] Read `design/tokens.md`, `design/components.md`, and `docs/design-system.md`. Fonts and brand colors are project-specific — take them from these files, never from memory.
- [ ] **hifi-gate check:** if the frame came through `/hifi-gate` (a `hifi/*` frame with gate evidence in the ledger), cite that evidence — every value is already token-bound and drift is zero, so any unmapped variable you hit below is a defect to report, not ambiguity to resolve. If the design did NOT pass the gate and this feature used the wireframe pipeline (`docs/ideation/wireframes.md` covers these screens), flag it: the gate exists so builds never start on token-dirty designs — offer to run `/hifi-gate` first.
- [ ] You are on a feature branch (`feature/short-description`), never `main`. Check first, then create only if needed:
  ```bash
  git branch --show-current
  ```
  If it prints `main` (or is empty):
  ```bash
  git checkout -b feature/from-figma-<component-name>
  ```
  If already on a `feature/*` branch for this work, stay on it.

## Step 1 — Parse the Figma URL

From `https://www.figma.com/design/<fileKey>/<fileName>?node-id=123-456`:
- `fileKey` = the path segment after `/design/` (or `/file/`).
- `nodeId` = the `node-id` query param with the dash converted to a colon: `123-456` → `123:456`.
- No `node-id` in the URL? Call `get_metadata` with no node id — the Figma MCP falls back to the user's current selection in the Figma desktop app. If that returns an error or an unexpected node, STOP and ask the user to right-click the frame in Figma → "Copy link to selection" and paste it.

## Step 2 — Pull the design (fixed tool sequence)

Call in this order; each feeds the next:

1. `get_metadata` — node tree, names, sizes. Identify the target frame and its children.
2. `get_design_context` — layout, structure, auto-layout values, and reference code for the node.
3. `get_screenshot` — visual reference for layout comprehension and the final comparison in Step 6. **Record the frame's width from metadata — you need it for the pixel-match screenshot later.**
4. `get_variable_defs` — every variable used by the node. This is the ONLY legitimate source for colors/spacing/radius/type.

Optional: `search_design_system` to find published Figma components the node instantiates; `download_assets` for image/icon exports the design needs (place under `public/`, then serve via `next/image`).

If the frame is huge (a whole page), repeat 2–4 per top-level section rather than one giant call.

## Step 3 — Map every element to an existing component

Reuse before build. For **each** element in the frame, in order:

1. Check the "Figma-to-Code Component Mapping" table in `design/components.md`.
2. Search existing code:
   ```bash
   ls components/ui/ components/site/ 2>/dev/null
   grep -ril "<keyword>" components/ --include="*.tsx"
   ```
3. Check the shadcn inventory table in `design/components.md` for a primitive that fits.

**STOP and ask the user when an element matches nothing.** Present exactly three options and wait:
- (a) use the closest existing component (name it and state what will differ),
- (b) add a variant to an existing component,
- (c) build a new component.

Never silently invent a component. If (c) is chosen and a shadcn primitive is the right base, install the primitive and restyle visuals only — never behavior — and add the new component to `design/components.md` with a usage example.

## Step 4 — Map Figma variables to tokens

For each variable from `get_variable_defs`, resolve it through the "Figma Variable Mapping" table in `design/tokens.md` to a semantic token in `design/tokens.json`.

- **Exact semantic match** → use the mapped Tailwind class (`bg-primary`, `text-muted-foreground`, …).
- **Raw value exists as a primitive but has no semantic mapping, or the variable is missing entirely** → this is token drift. STOP building that element and run the `design-tokens-sync` skill to reconcile. Do NOT approximate with a "close enough" token and do NOT hardcode the hex.
- `design/tokens.json` is a **protected file** — never edit it without explicit user approval (a PreToolUse hook enforces this; `design-tokens-sync` handles the approval flow).
- A raw px value in Figma (e.g. gap 24) maps to the Tailwind spacing scale (`gap-6`). A value that fits no scale step is also drift — same route.

The PostToolUse hook flags hardcoded hex and arbitrary px at write time. If it fires, fix the token — don't work around the hook.

## Step 5 — Build

- Compose from `components/ui/` (shadcn) and `components/site/` (custom). Pages assemble components; components own their styles.
- **Interaction:** open the actual primitive source in `components/ui/` and preserve its hover/focus/keyboard/aria wiring. Restyle with tokens; never re-implement Radix behavior or invent states the primitive doesn't have.
- **Both themes:** build and check light AND dark — both always ship; review the intake default first.
- **Mobile-first, three layers:** viewport breakpoints (`sm:`/`md:`) for page-level layout only; `@container` queries inside reusable components; `clamp()` for fluid type. If Figma only shows desktop, derive the 360px layout yourself and list it as a judgment call in Step 6.
- **Tap targets** ≥ 44×44px; primary CTAs 44–52px tall — override shadcn's default heights if smaller.
- **Images:** `next/image` with an explicit `sizes` prop and reserved dimensions (CLS ≤ 0.1).
- **Motion:** every animation wrapped in a `prefers-reduced-motion` guard.
- **Content:** if Figma shows lorem or real PII/keys/addresses, replace with sensible placeholders; if real copy is missing, flag it — don't invent marketing claims.
- If the Figma design contradicts `CLAUDE.md` (e.g. sub-44px buttons, hardcoded colors), **CLAUDE.md wins** — build to the house rules and report the deviation in Step 6.

Small verifiable steps: one component/section at a time; show the file before moving on.

## Step 6 — Verify with evidence (side-by-side)

"Compiles" is not evidence. Render it and compare.

1. Start the dev server if not running. Run it as a background task (in Claude Code: Bash tool with `run_in_background: true` — do NOT append `&`):
   ```bash
   pnpm dev
   ```
   Then poll until it answers instead of sleeping a fixed time:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" --retry 30 --retry-delay 1 --retry-all-errors http://localhost:3000
   ```
   Expect `200`. If the dev server output says it picked another port (e.g. 3000 was busy → 3001), use that port in every URL below. If it never answers, read the server output for the compile error and fix it — do not proceed to screenshots.
2. Screenshot the build at the **same width as the Figma frame**, in dark mode. `<route>` is the page that renders what you built; if the user didn't say where it mounts, ask — don't place it yourself. If the component intentionally isn't mounted anywhere yet, render it on a temporary scratch route (`app/_debug/page.tsx`, deleted before commit) and verify there — never skip the visual comparison because "there's no page for it":
   ```bash
   pnpm exec playwright screenshot --viewport-size "<figmaWidth>,900" \
     --color-scheme dark --full-page \
     "http://localhost:3000/<route>" /tmp/build-<name>.png
   ```
3. Compare `/tmp/build-<name>.png` against the Step 2 Figma screenshot **element by element**: structure, spacing rhythm, type hierarchy, color usage, alignment, radius. Read both images.
4. Sweep all required viewports (repeat the screenshot command at each):
   360, 768, 1024, 1440, 1920.
5. Interaction check — scripted, not eyeballed. Write a throwaway Playwright spec — put it inside the repo's configured `testDir` (check `playwright.config.ts`; default here is `e2e/`) or Playwright will report "no tests found", and delete it before committing — (or use the project's `e2e-test` skill) that: Tabs through the section asserting every interactive element receives focus in a sensible order, asserts the focused element shows a visible focus indicator, and exercises Escape/Enter per the primitive's source. Anything genuinely unscriptable (e.g. the feel of a hover transition) is a human check — explicitly hand it to the user as "please verify by hand", never claim you ran it.
6. Accessibility gate (WCAG 2.2 AA, per `design/accessibility.md`): run axe via Playwright on the route (the `a11y-audit` skill has the harness) and check text contrast of every new element against AA. Contrast failures are build defects, not design deviations — but if the Figma values themselves fail AA, STOP and ask the user rather than silently changing the design.

**Report to the user — all four, every time:**
- The two screenshots (Figma vs build) side by side, same width.
- **Every deviation** from the Figma, each labeled token-drift / house-rule override / ambiguity, **with the file:line where that style is set** so the user can inspect it.
- **Every judgment call** you made (derived mobile layout, placeholder content, closest-component substitutions the user approved).
- Viewports verified, with evidence.

**STOP conditions during verification:**
- A deviation you cannot explain by a token or house rule → investigate root cause before presenting; don't hand-wave.
- The build needs a value that exists nowhere in `design/tokens.json` → back to Step 4 / `design-tokens-sync`.
- Perf smells (layout shift on load, heavy client JS for a static section) → fix before presenting; the budget (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, JS < 150KB gz) is a ship gate.

## Step 7 — Close out

- [ ] New/changed components documented in `design/components.md` with a usage example and Figma mapping row.
- [ ] No hardcoded hex, no arbitrary px (hooks clean).
- [ ] Typecheck passes — paste the (empty) output as evidence:
  ```bash
  pnpm exec tsc --noEmit
  ```
- [ ] Conventional commit on the feature branch; do not push or open a PR unless asked.

## Parallel builds (3+ independent components)

One component at a time is the default (small, verifiable steps). But when 3+ *independent*
components are specced and gate-passed, don't queue them — run the `build-fleet` workflow
(`.claude/workflows/build-fleet.js`, scaffolded by harness ≥1.5.0): one frontend-engineer agent
per component, each in an isolated git worktree (no file conflicts), each code-verified before
reporting. Independence test: no shared new files, and none consumes another built in the same
run — fail it and you build sequentially. Merging stays here in the main session, one reviewed
branch at a time, and the Step 6 screenshot evidence happens after merge as usual.

## Guardrails (summary)

- Two-source rule always: Figma variables for visuals, primitive source for behavior. A screenshot is never a spec.
- STOP-and-ask: no component match (Step 3); token drift (Step 4); protected-file edits; anything ambiguous where you'd otherwise pick for the user.
- Evidence over claims: no "done" without same-width screenshot comparison plus the 5-viewport sweep.
