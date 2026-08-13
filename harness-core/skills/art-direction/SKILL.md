---
name: art-direction
description: Captures a real art direction from the user via a one-batch taste interview and writes it into docs/design-system.md before any visual build begins. Use when the user says "art direction", "set the visual direction", "what should this look like", "define the aesthetic", or "taste interview" — and automatically whenever a visual build skill (from-figma, hifi-gate, storybook-component, or any scratch-route variant exploration) finds no "Art direction" section in docs/design-system.md. Runs once per project; re-runs append a dated revision, never overwrite. (Recording a correction to output already produced is taste-retro; external inspiration is filed under design/references/ — this skill decides the project's own aesthetic upfront.)
---

# Art Direction — the taste gate

Capture the user's actual taste ONCE, in writing, BEFORE any visual build. Do not guess taste. Do not invent answers. An unanswered question is recorded as `OPEN`, never filled in.

**HARD GATE (all builders):** if `docs/design-system.md` has no `## Art direction` section, visual build skills (`from-figma`, `hifi-gate`, `storybook-component`, and any scratch-route variant exploration or animation work) must STOP and run this skill first. Every visual build must cite which reference each section follows.

## Step 0 — Detect state

```bash
grep -n "^## Art direction" docs/design-system.md || echo "NO ART DIRECTION SECTION"
```

- **`grep: docs/design-system.md: No such file or directory`** → the project's docs aren't in place. STOP and ask the user whether the project has been scaffolded (`scaffold-project` creates the doc set) — do not create `docs/design-system.md` yourself from this skill.
- **No match** (prints `NO ART DIRECTION SECTION`) → first run. Continue to Step 1.
- **Match** → a direction already exists. STOP and ask: "An art direction already exists (line N). Revise it, or keep it?" If revising, proceed but write the changes as a NEW dated subsection `### Revision — YYYY-MM-DD` under the existing section. Never silently overwrite or delete the prior direction.

## Step 1 — Read context (before asking anything)

Read, in order: `CLAUDE.md`, `DESIGN.md`, `docs/project.md`, `docs/design-system.md`, `design/taste-rules.md` (if present), `design/references/` (if present). Note the project's one-sentence aesthetic placeholder and any standing taste rules — reference them in the interview so the user isn't re-asked things already on record.

**The standing question first (DESIGN.md Step 0):** check `docs/design-system.md` for a `## Design system source` section. If it has no answer, ask before the taste interview: *"Is there an existing design system we should integrate — an npm package, a Figma library, an internal DS — beyond our own style guidelines?"* Record the answer in that section. If an external DS is adopted, this interview captures the deltas and this project's voice within it — not a parallel aesthetic that fights the adopted system.

## Step 2 — Interview in ONE batch, then WAIT

Ask all eight questions in a single message. Then STOP and wait for the user's reply. Never answer for the user. Never propose "defaults" as if accepted. If the user skips an item, record it as `OPEN — [question]` in the doc.

1. **Mood** — 3–5 words this product should feel like (e.g. "clinical, warm, fast").
2. **References** — 3–5 named products/sites, each with WHAT specifically to take from it ("Linear — the density of its sidebar", not just "Linear"). A name without a "what" is incomplete — ask for the what.
3. **Typography direction** — display vs body feel; how aggressive should the scale be (quiet editorial vs loud display)? Font choices live in `docs/design-system.md` / `design/tokens.json` — this captures intent, not families.
4. **Color story** — dominant color feel, temperature (warm/cool/neutral), and how many accents. Recommend ONE accent unless the user argues for more. Actual values land in `design/tokens.json` later via `design-tokens-sync`; this doc captures intent only. Do not write hex values here.
5. **Density** — airy vs dense, and spacing rhythm (generous section padding vs compact utility).
6. **Motion personality** — on a scale from static → expressive; this feeds animation work (role-designer's animate/review-animations skills).
7. **Banned list additions** — anything the user never wants to see (beyond the standing bans in `CLAUDE.md` and `design/taste-rules.md`).
8. **Register split** — does this product need distinct visual registers (e.g. marketing/brand voice vs in-product utility)? If yes, capture the boundary.

If the user answers "you decide" on any item: push back once with 2–3 concrete options and tradeoffs. If they still defer, record the item as `OPEN — user deferred` and STOP before any visual build that depends on it.

## Step 3 — Draft the section, show it BEFORE saving

`docs/design-system.md` is protected-adjacent: draft the full section in chat, show it to the user, and get an explicit "yes" before writing the file. Structure:

```markdown
## Art direction

_Captured YYYY-MM-DD from interview with the user. Builders: cite the reference each section follows._

### Mood
[3–5 words, verbatim from the user]

### References
| Reference | What to take from it |
|---|---|
| [name] | [specific element/quality] |

### Typography direction
[display vs body feel; scale aggressiveness. Intent only — families/sizes live in the type scale above and design/tokens.json]

### Color story
[dominant feel, temperature, accent count. Intent only — values land in design/tokens.json via design-tokens-sync]

### Density & spacing rhythm
[airy vs dense; rhythm notes]

### Motion personality
[static → expressive placement; notes for animation work]

### Banned
[items from this interview; full standing list lives in design/taste-rules.md]

### Registers
[brand vs product register boundary, if any]

### Open questions
[each unanswered item as: OPEN — question — blocks: what it blocks]
```

## Step 4 — Write the files

1. Insert the approved section into `docs/design-system.md` (Edit tool, exact-match). First locate the anchor: `grep -in "aesthetic" docs/design-system.md`. If an aesthetic/direction block exists, insert directly under it; if not, append the section at the end of the file — do not invent or rename headings to create an anchor. On a revision run, append the dated `### Revision — YYYY-MM-DD` subsection under the existing `## Art direction` section instead.
2. Append banned items to `design/taste-rules.md` under the existing project section — the seeded file's heading is `## This project's rules` (do NOT create a new heading; match whatever heading in the file starts with "## This project"). Use `taste-retro`'s entry format, one item per bullet, with the date from `date +%F` (never guess it) and `Why (user's words):` quoting the interview answer verbatim. If the file itself does not exist, flag that to the user first — it ships seeded with universal anti-slop rules, so its absence is unexpected — then create it using the skeleton in `taste-retro` Step 1 and continue. Append only — never edit or remove existing rules (that is `taste-retro`'s job).
3. `mkdir -p design/references` if missing.

Do NOT touch `design/tokens.json` or `CLAUDE.md` in this skill — both are protected (PreToolUse hook). Token value changes go through `design-tokens-sync` with user confirmation.

## Step 5 — Hand off

- Capture the named references (with their "what to take" notes) into `design/references/` — screenshot each source and write a `notes.md` of transferable observations per reference, indexed in `design/references/README.md`.
- If color/type intent implies token changes, tell the user to run `design-tokens-sync` next (then `pnpm tokens` to regenerate CSS).
- Report: section location (file + line), banned items appended, references handed off, and any `OPEN` items with what they block.

## Verification checklist (evidence, not claims)

- [ ] `grep -n "^## Art direction" docs/design-system.md` returns a line number — quote it.
- [ ] Every reference row has a non-empty "what to take" cell.
- [ ] No hex values, font family names, or brand names invented by you appear anywhere the user didn't say them.
- [ ] Every unanswered interview item appears under "Open questions" as `OPEN`.
- [ ] User explicitly approved the section text before it was saved.

## STOP and ask when

- An Art direction section already exists (Step 0) — never assume a rewrite is wanted.
- The user's references conflict with standing rules in `design/taste-rules.md` — surface the conflict, let the user rule.
- The user defers every question — do not fabricate a direction; propose filing 2–3 candidate directions into `design/references/` (screenshots + transferable notes) instead and wait.
- You are tempted to fill an `OPEN` item to unblock a build — don't. The gate exists so taste comes from the user.
