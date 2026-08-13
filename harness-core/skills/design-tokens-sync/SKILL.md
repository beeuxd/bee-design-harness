---
name: design-tokens-sync
description: Detects and reconciles drift between Figma variables and design/tokens.json by pulling live variable definitions, diffing them against the DTCG token file, and producing a classified drift table with a proposed patch that is never applied without explicit user approval. Use when tokens may be out of date, after a designer changes Figma variables, or before starting visual work on a new feature. Trigger phrases: "sync tokens", "are our tokens up to date", "check token drift", "Figma variables changed", "compare Figma to tokens.json", "diff tokens against Figma". (Auditing how tokens are used in code is design-system-audit, not this.)
---

# Design Tokens Sync

Reconcile `design/tokens.json` with the Figma variables that define this project's visual language.

**Doctrine (memorize before diffing):**
- **Figma is the source of truth for VALUES** (the hex, the px, the weight).
- **`design/tokens.json` is the source of truth for the semantic NAMES code uses** (`semantic.color.primary`, `primitive.borderRadius.md`). A Figma rename never forces a code rename; a Figma value change always wins.
- **`design/tokens.json` is a PROTECTED file.** Never edit it without the user's explicit approval in this session. The `protected-files-guard` PreToolUse hook (see CLAUDE.md → Safeguards) will additionally force a user-confirmation prompt on any edit, even in auto-accept mode — that prompt is a backstop, not the approval itself, and do not try to route around it (no `sed`, no `jq` writes, no temp-file swaps).

## Step 0 — Locate the sources

1. Read `design/tokens.json` (DTCG format; groups: `primitive`, `semantic`, `component`).
2. Read `design/tokens.md` — the "Figma Variable Mapping" table maps Figma variable names (e.g. `base/primary`) to code tokens (e.g. `semantic.color.primary` / `--primary`). This table defines what "same token" means across the two systems. If the table is missing or still contains `{{PLACEHOLDER}}` rows, don't stop the diff: fall back to normalized-name matching only (Step 3), mark every such pair "name-matched — unconfirmed" in the drift table, and include "create/complete the Figma Variable Mapping table" as a recommended action in the report.
3. Find the design-system Figma file URL: `design/tokens.md` line "**Figma source:**", falling back to `docs/design-system.md`.
   - **STOP and ask the user** if the URL is still the `{{FIGMA_URL}}` placeholder or missing. Do not guess a file.

## Step 1 — Pull Figma variables

Use the Figma MCP tool `get_variable_defs` against the design-system file URL (a node URL within that file also works — prefer the page/frame that holds the token documentation; use `get_metadata` first if you need to find it). If variables span multiple pages, call `get_variable_defs` per relevant node and merge.

Optional cross-checks (allowed tools only):
- `search_design_system` — locate token/style documentation frames.
- `get_design_context` or `get_screenshot` on a token sheet frame — visual confirmation of a suspicious value, never a substitute for `get_variable_defs`.

**Fallback — no Figma MCP connected this session:** do NOT guess and do NOT skip. Ask the user for (a) exported screenshots of the variable panels/token sheets AND (b) the literal variable names and values (copy-pasted or exported JSON). Screenshots alone are insufficient for values — per the two-source rule, specs come from variables, never eyeballed from images.

## Step 2 — Parse the code tokens

Flatten `design/tokens.json` to `path → resolved value` (resolve `{primitive.color.x}` references one level so semantic tokens compare by final value):

```bash
node -e '
const t = JSON.parse(require("fs").readFileSync("design/tokens.json", "utf8"));
const flat = {};
(function walk(o, p) {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith("$")) continue;
    if (v && typeof v === "object" && "$value" in v) flat[[...p, k].join(".")] = v.$value;
    else if (v && typeof v === "object") walk(v, [...p, k]);
  }
})(t, []);
// resolve {a.b.c} references (one level is enough for this file)
for (const [k, v] of Object.entries(flat))
  if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) flat[k] = flat[v.slice(1, -1)] ?? v;
console.log(JSON.stringify(flat, null, 2));
'
```

Run from the repo root (quote any paths in shell commands — this repo's parent directory may contain spaces). Normalize both sides before comparing, otherwise you will report false mismatches:
- Colors: lowercase hex; expand 3-digit hex to 6 (`#abc` → `#aabbcc`); treat `#rrggbbff` == `#rrggbb`; convert `rgb()/rgba()` strings from Figma to hex before comparing.
- Dimensions: Figma reports bare px numbers; if a code token uses `rem`, convert at 16px = 1rem (`1.5rem` == `24`). Strip units/whitespace before comparing the numbers.
- Only after normalization does a differing value count as a **value mismatch**.

## Step 3 — Diff and classify

Match Figma variables to code tokens via the mapping table from Step 0.2 first, then by normalized name — normalize both sides by lowercasing and stripping separators (`/`, `.`, `-`, `_`, spaces) plus common group prefixes (`base`, `primitive`, `semantic`, `color`), so `base/primary` matches `semantic.color.primary`. A normalized-name match is a candidate, not proof — confirm with the value before pairing; if neither table nor name matching pairs them, classify as missing (do not force a match). Classify every discrepancy:

| Class | Meaning | Default severity |
|---|---|---|
| **Value mismatch** | Same token, different value | HIGH for `semantic.*` and `component.*`; MEDIUM for `primitive.*` not referenced by any semantic token |
| **Missing in code** | Figma variable with no code token | MEDIUM (HIGH if a current ticket needs it) |
| **Missing in Figma** | Code token with no Figma variable | LOW — code-only tokens (breakpoints, maxWidth, opacity) are expected; flag as INFO unless it is a color/radius/type token designers should own |
| **Naming drift** | Same value, names no longer map (rename on either side) | LOW — fix the mapping table in `design/tokens.md`, NOT the code name |

Severity escalators: any drift on `semantic.color.background`, `semantic.color.foreground`, `semantic.color.primary`, or focus-ring tokens is always HIGH (dark-mode-primary surfaces and a11y-critical states).

## Step 4 — Report: drift table + proposed patch

Output to the user (in chat, not a new file):

1. **Drift table** — one row per finding: `token path | Figma name | Figma value | code value | class | severity | recommended action`.
2. **Proposed patch** — the exact JSON edits to `design/tokens.json` as a diff block, following the doctrine:
   - Value mismatch → change the `$value` in code to the Figma value; keep the code name.
   - Missing in code → propose a new token under the correct group (`primitive` for raw values, `semantic` if Figma treats it as an alias) plus a new row for the mapping table in `design/tokens.md`.
   - Missing in Figma → no code change; list for the user to raise with the designer (or offer to add the variable in Figma via `use_figma` / `create_new_file` — only if the user asks).
   - Naming drift → propose an edit to the mapping table in `design/tokens.md` only.
3. **Blast-radius note per value change** — state plainly: *a token value change silently restyles every consumer of that token; nothing will "break" in CI, it will just look different everywhere.* Grep for usage count as evidence:

```bash
grep -rn --include='*.tsx' --include='*.ts' --include='*.css' -E '(bg|text|border|ring)-primary\b|--primary\b' app components
```

(Adapt the pattern per changed token, and the directory list to this project's source folders — check `docs/tech.md` for the folder structure. `grep` exiting with status 1 means zero matches: report "no consumers found" as a finding, it is not an error. Cite the `file:line` hits in the report as evidence.)

## Step 5 — HARD STOP before writing

- Present the report. **Do not edit `design/tokens.json` until the user explicitly approves the patch** (a "looks good, apply it" or equivalent). No reply is not approval — apply nothing. Approval of only some rows means apply exactly those rows and nothing else.
- If the user rejects a Figma value (e.g. the designer made a mistake), do not edit tokens.json to a third value — the fix happens in Figma first, then re-run this skill.
- Never batch unrelated edits into the approved patch.

## Step 6 — After an approved change

1. **Branch first — before touching any file.** Never work on `main`. Check where you are (`git branch --show-current`): if already on a `feature/*` branch for this same piece of work, stay on it; only create a new one when on `main` or on a branch belonging to a different task:

   ```bash
   git checkout -b "feature/tokens-sync-$(date +%Y-%m-%d)"
   ```

2. Apply exactly the approved edits to `design/tokens.json` (and `design/tokens.md` so the human-readable reference stays true — tokens.json wins on conflict). Expect the protected-file confirmation prompt; that is the hook working, not an error.
3. Regenerate the CSS: `pnpm tokens` (the template's pipeline, `scripts/build-tokens.mjs` → `app/tokens.css`; if this project uses a different generator, the command is in `package.json` `scripts` — do not guess). Never hand-edit `app/tokens.css`. Evidence: `git diff --stat` must show the generated output changed — if it didn't, the build is not wired to the token file; STOP and tell the user.
4. **Run the `design-system-audit` skill** to find all code affected by the changed values.
5. Visual verification with Playwright screenshots, dark mode first, at 360 / 768 / 1024 / 1440 / 1920px (Playwright screenshots per viewport; design review per `visual-qa`), on at least one page that consumes each changed token — screenshot evidence, not "it compiles".
6. Commit with a conventional message, e.g. `style: sync tokens with Figma variables (<n> changes)`. Never commit to `main`.

## Out of scope

- Editing `CLAUDE.md` (also protected) or inventing tokens not present in either source.
- Component-level restyling — hand findings to `design-system-audit` / normal feature work.
- Figma MCP tools other than: `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`, `search_design_system`, `download_assets`, `use_figma`, `create_new_file`.
