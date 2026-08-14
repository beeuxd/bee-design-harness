---
name: design-system-audit
description: Sweeps the existing codebase for design-system violations — hardcoded hex colors, arbitrary px values, font declarations outside the token layer, and reusable components using viewport breakpoints instead of container queries — then reports every hit with file, line, and the closest semantic token from design/tokens.json. Use it before ship gates, after merges, or when adopting an existing codebase, on phrases like "check design system", "audit token usage in code", "token compliance", "are we on system", "design system check", "sweep for hardcoded colors". (Figma-to-tokens.json drift is design-tokens-sync, not this.)
---

# Design System Audit

Codebase-wide compliance sweep. Division of labor:

- The **design-system-guard PostToolUse hook** catches NEW violations at write time.
- **This skill** finds violations already in the codebase — pre-hook code, merged branches, pasted snippets.
- Run it: before every ship gate, after every merge to the feature branch, and once when adopting an existing codebase.

This skill is **report-first**. It never edits files unless the user explicitly asks for fixes (Step 6).

## Step 0 — Preflight

1. Confirm you are at the repo root and identify source dirs (skip any that don't exist):
   ```bash
   ls -d app components lib src 2>/dev/null
   ```
2. Read `design/tokens.json` (source of truth), `design/tokens.md` (human-readable mapping), and `docs/design-system.md` (how the tokens are meant to be used). You need these to propose replacements in Step 3.
3. **STOP and ask the user** if `design/tokens.json` is missing or empty — there is nothing to audit against.

## Step 1 — Four sweeps

Run all four. Save raw output (redirect each sweep, e.g. `... | tee /tmp/ds-audit-1a.txt`); the report must quote real `file:line` hits, never summaries from memory.

### 1a. Hardcoded hex colors

```bash
grep -rnE '#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b' \
  --include='*.tsx' --include='*.jsx' --include='*.ts' --include='*.css' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.claude \
  app components lib src 2>/dev/null \
  | grep -v 'globals.css' | grep -v 'tailwind.config' | grep -v 'design/tokens'
```

Triage every hit before reporting:
- **Not a color** (git SHA, URL fragment, id selector like `#root`, hex-encoded data): exclude from the table, list count in a footnote.
- **Hex inside a comment or commented-out code**: report as Warning, not Critical.
- **Hex in a live style context** (className, `style={}`, CSS property, SVG `fill`/`stroke`): real violation.

### 1b. Arbitrary px values

```bash
grep -rnE '\[[0-9]+(\.[0-9]+)?px\]' \
  --include='*.tsx' --include='*.jsx' --include='*.ts' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.claude \
  app components lib src 2>/dev/null \
  | grep -v 'tailwind.config' | grep -v 'design/tokens'
```

`*.ts` matters: class strings also live in cva/variant definitions and `lib/` helpers, not just JSX.

Allowed exceptions (exclude from the table, note them):
- px values **inside a `clamp()` expression** used for fluid type — that is the sanctioned third responsive layer.
- `1px` / `2px` border widths that match the border-width tokens in `design/tokens.md`.
Everything else is a violation, including `w-[Npx]`, `p-[Npx]`, `top-[Npx]`, `text-[Npx]`.

### 1c. Font declarations outside the token layer

```bash
grep -rn -e 'font-family' -e 'fontFamily' -e 'font-\[' \
  --include='*.tsx' --include='*.jsx' --include='*.ts' --include='*.css' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.claude \
  app components lib src 2>/dev/null \
  | grep -v 'globals.css' | grep -v 'app/layout.tsx' | grep -v 'tailwind.config'
```

`globals.css`, `app/layout.tsx` (next/font loading), and the Tailwind config are the only legitimate homes for font-family. Any other hit is a violation — the fix is always the project's font token (see `design/tokens.md` → Font Families), never a literal font name.

### 1d. Reusable components using viewport breakpoints

Three-layer rule: viewport breakpoints (`sm:` … `2xl:`) are for **page-level layout in `app/` only**. Reusable components must use `@container` variants (`@sm:`, `@md:`). Sweep only the reusable-component dirs — `components/ui components/site` below; substitute whatever Step 0 actually found (e.g. `src/components/ui`):

```bash
grep -rnE '(^|[^@a-zA-Z])(sm|md|lg|xl|2xl):' \
  --include='*.tsx' \
  components/ui components/site 2>/dev/null
```

The `[^@a-zA-Z]` guard keeps `@sm:` container variants out of the results; the `^|` alternative still catches a breakpoint at the start of a line inside a multiline class string. Then list flagged files that never declare a container root (this pipeline feeds the same match into `grep -L`, which prints files NOT containing `@container`; on Linux use `xargs -r` so an empty first result doesn't hang):

```bash
grep -rlE '(^|[^@a-zA-Z])(sm|md|lg|xl|2xl):' \
  --include='*.tsx' \
  components/ui components/site 2>/dev/null \
  | xargs grep -L '@container'
```

Recommended fix: wrap the component root in `@container` and convert `sm:`/`md:` → `@sm:`/`@md:`. Conversions change rendered layout — they are Step 6 work, never silent fixes.

## Step 2 — Severity

Classify every violation:

- **Critical — shipped component**: the file is imported (directly or via barrel) from a route in `app/`, or is listed in `design/components.md`. Files under `app/` itself are Critical by definition. Check by grepping `app/` for the flagged file's basename — set `f` to the flagged path first:
  ```bash
  f='components/ui/card.tsx'   # <- replace with the flagged file
  grep -rln "$(basename "$f" .tsx)" app/ --include='*.tsx' | head -5
  ```
  Short basenames (`card`, `nav`, `button`) over-match as substrings — open each hit and confirm it is an actual import of the flagged file's path before classifying; prose or unrelated identifiers containing the word don't count. This grep only catches direct imports. If it returns 0 hits, also check barrel files:
  ```bash
  find components src -name 'index.ts*' -not -path '*/node_modules/*' \
    -exec grep -n "$(basename "$f" .tsx)" {} + 2>/dev/null
  ```
  and whether any barrel that re-exports it is imported from `app/` — only then downgrade to Warning.
- **Warning — work in progress**: not reachable from any route, comment-only hits, story/demo files.

## Step 3 — Map each violation to a token

For every table row:

1. Look the raw value up in `design/tokens.json`.
2. **Exact match** → recommend the *semantic* token that references that primitive (e.g., the primitive behind `primary` → recommend `bg-primary`/`text-primary`, not the raw primitive). `design/tokens.md` → "Semantic Colors" and "Figma Variable Mapping" give the utility-class names.
3. **Near match** (off-scale spacing like `[13px]`, hex within a shade of an existing primitive) → recommend the nearest token and mark the row `verify visually` — the fix must be confirmed on screen in dark mode.
4. **No plausible token** → do NOT invent one and do NOT eyeball a substitute. Per the two-source rule, a new visual value must come from Figma variables. Mark the row `needs design decision` and **STOP and ask the user** before any fix — adding a token means editing `design/tokens.json`, which is hook-protected and requires explicit approval.

## Step 4 — Figma drift

Do not duplicate token comparison here. If the user wants code-vs-Figma drift checked, run the **design-tokens-sync** skill and merge its findings into the report under a separate "Figma drift" section.

## Step 5 — Report (required output format)

```
| File | Line | Category | Current Value | Recommended Token | Severity |
|------|------|----------|---------------|-------------------|----------|
| components/site/hero.tsx | 42 | Hardcoded color | #<hex> | bg-primary | Critical |
| components/ui/card.tsx | 17 | Arbitrary px | p-[13px] | p-3 (12px) — verify visually | Critical |
| components/site/nav.tsx | 8 | Viewport breakpoint in reusable component | md:flex-row | @md:flex-row (add @container root) | Warning |
```

Then totals:
- Violations by category (color / px / font / container query)
- Violations by severity (Critical / Warning)
- Excluded hits (non-color hex, clamp() px, allowed border widths) with counts
- Verdict: **PASS** (0 Critical) or **FAIL** — a FAIL blocks the ship gate; say so explicitly.

Evidence requirement: every row must come from actual grep output produced this session. If a sweep returns nothing, paste the command and state "0 hits" — do not just claim clean.

## Step 6 — Fixing (only when the user asks)

Bulk token fixes touch many files. Guardrails, in order:

1. **Checkpoint first**: create a checkpoint commit on the feature branch (never on `main`) so any batch can be reverted cleanly.
2. For any component imported in 2+ places, refactor safely — list the consumers first (`grep -rln`), change, verify every consumer still renders, then move on.
3. Fix in small batches (one category or one directory at a time). After each batch:
   - Re-run the relevant Step 1 sweep — the fixed hits must be gone (paste the output).
   - `pnpm build` must pass — but compiling is not rendering: for every visually-affected component, verify in the browser in **both themes** at 360 / 768 / 1024 / 1440 / 1920px (Playwright screenshots per viewport; design review per **visual-qa**).
4. Rows marked `verify visually` need a before/after screenshot comparison; if the nearest token visibly changes the design, **STOP and ask the user** which way to go.
5. Close with **verify-before-done**, then re-run this entire audit — the final report must show 0 Critical.

## STOP conditions (recap)

- `design/tokens.json` missing, empty, or itself containing values that contradict `design/tokens.md`.
- A violation has no plausible token (Step 3.4) — new tokens require Figma sourcing and user approval.
- A fix would edit protected files (`design/tokens.json`, `CLAUDE.md`) — PreToolUse hook enforces this; ask first.
- The user asked for an audit only, but you're tempted to "just fix" something — don't; report first.
- A container-query conversion changes rendered layout at any of the five viewports — show screenshots and ask.
