---
name: taste-retro
description: Captures the user's design corrections as durable, checkable rules in design/taste-rules.md so taste compounds across sessions instead of evaporating. Use whenever the user corrects visual output in any words ("too boxy", "stop centering everything", "the spacing feels cramped", "not this shade", "that's not the vibe"), when a variant-exploration round reveals why a winner won, or at the end of a visual feature. Also invoked by other skills as the source of standing taste rules to load before visual work. (Setting the initial aesthetic via interview is art-direction; external inspiration is filed under design/references/ — this skill only records reactions to work we already produced.)
---

# Taste Retro — turn corrections into permanent rules

Every visual correction the user makes is a rule they should never have to repeat. This skill writes it down in `design/taste-rules.md` in a form future sessions can check against. If it isn't written down, it didn't happen.

## When to run (any ONE of these)

1. **The user corrects visual output** — in any wording: "too boxy", "stop centering everything", "the spacing feels cramped", "not this shade", "less rounded", "this feels cheap". Fix the immediate issue FIRST, then run this skill in the same turn.
2. **A scratch-route variant exploration produced a winner AND the user said why** — capture the why as a rule. If they only picked without explaining, do not invent a reason; you may ask once: "what made this one win?" If no answer, capture nothing.
3. **End of a visual feature** (before `/ship` or when the user says the visual work is done) — ask exactly once: **"any taste notes from this one?"** If the answer is no or silence, move on. Never nag.

Do NOT run for functional bugs, copy edits, or performance issues — visual/aesthetic judgments only.

## Step 1 — Read the existing file FIRST

From the project root:

```bash
cat "design/taste-rules.md" 2>/dev/null || echo "MISSING — create it (see below)"
```

- **If the command prints MISSING**, create the file with this exact skeleton before adding any rule (run `mkdir -p design` first — the directory may not exist yet):

```markdown
# Taste Rules

Standing design judgments from the user. Loaded before ALL visual work.
Each rule is a checkable gate: violating one is a defect, same as a failed contrast check.

## Universal (applies to every project)

## This project

## Resolved contradictions
```

- **If it exists**, read every rule before writing. You are checking for two things: a similar rule (Step 3) and a contradicting rule (Step 4).
- **Heading tolerance:** the seeded file that ships with the template words its headings differently (`## Universal anti-slop rules (seeded — apply to every project)`, `## This project's rules`, `## Resolved contradictions`). Match sections by prefix — any heading starting with "## Universal" is the Universal section, "## This project" is the project section. NEVER add a second heading for a section that already exists under different wording.

## Step 2 — Draft the rule entry

One entry per correction, in this exact format, filed under the matching section:

```markdown
- **[YYYY-MM-DD]** <One imperative, checkable sentence.>
  - Why (user's words): "<verbatim quote of what the user said>"
  - Example: <path/to/file.tsx:L42 or design/references/<name>.png, when available>
```

Requirements per entry:

- **Date**: today's date — get it with `date +%F` (prints `YYYY-MM-DD`); never guess it.
- **The rule**: ONE sentence, imperative, checkable by a reviewer with no context. "Cards use minimal borders, not heavy boxes" — checkable. "Make it feel premium" — not checkable; sharpen it ("Prefer whitespace and type hierarchy over boxes and dividers to signal hierarchy") or ask the user to.
- **Why**: the user's words VERBATIM. Do not paraphrase, do not soften, do not translate into designer-speak. The quote is the ground truth the rule was distilled from.
- **Example**: a `file:line` of the offending or corrected code, or a screenshot path (e.g. under `design/references/`), when one exists. If none exists, omit the line — never fabricate a path.
- **Scope**: decide universal vs this-project and file under that section:
  - **Universal** — a judgment about design itself ("stop centering everything", "too boxy").
  - **This project** — tied to this product's art direction, tokens, or audience ("not this shade" of a brand color, a density call for this app's data tables). Point at the defining doc (`docs/design-system.md`, `design/tokens.json`) rather than hardcoding hex values, font names, or project names in the rule text.
  - **If genuinely unsure, ask**: "should this apply to everything I build for you, or just this project?"

## Step 3 — Deduplicate: strengthen, don't repeat

If a similar rule already exists, do NOT add a duplicate. Instead edit the existing rule:

- Generalize the sentence if the new instance broadens it (e.g. "buttons" → "interactive elements").
- Append the new date and new verbatim quote under the existing entry's Why line.
- Add the new example `file:line` alongside the old one.

Two data points on the same instinct make one STRONGER rule, not two entries.

## Step 4 — Contradictions: surface, ask, record

If the new correction CONTRADICTS an existing rule (e.g. existing "Prefer tight vertical rhythm" vs new "the spacing feels cramped"):

1. **STOP. Do not silently pick a winner and do not average them.**
2. Show the user both, verbatim: the old rule with its date and quote, and today's correction.
3. Ask which wins, or whether both hold in different contexts (often the answer — then scope each rule to its context).
4. Record the resolution: update the surviving rule, and add one line to `## Resolved contradictions` with today's date (`date +%F`), what conflicted, and the ruling.

## Step 5 — Record in the user's spirit

- **NEVER argue with a correction.** Not in chat, not in the file. No "however", no "note that this conflicts with best practice", no hedging the rule into mush.
- **NEVER water it down.** If the user said "I hate drop shadows", the rule is "Do not use drop shadows", not "Use drop shadows sparingly".
- The user's taste is the spec. Your job is stenography plus distillation, not editorial review.

## Step 6 — Keep the file scannable

- Rules are atomic: one judgment per bullet. Split compound corrections into separate rules.
- Grouped by section (`Universal` / `This project`), newest last within a section.
- No essays, no design-theory preambles, no restating what's in `docs/design-system.md`.
- If the file exceeds ~50 rules, propose consolidation to the user — do not prune unilaterally.

`design/taste-rules.md` is NOT hook-protected (only `design/tokens.json`, `CLAUDE.md`, `.claude/settings.json` are), but it encodes the user's judgment — edit only via this skill's procedure.

## Step 7 — Confirm

Show the user the exact entry (or edit) as written, in one short block: "Logged to design/taste-rules.md under <section>: <the rule>." One line, then back to work.

## The load rule (for every OTHER skill)

Any skill doing visual build or review work — `from-figma`, `hifi-gate`, `wireframe-loop`, `storybook-component`, `visual-qa`, `review-ux`, `design-system-audit`, `ship`, any scratch-route variant exploration or animation work, and the designer / engineer / qa agents — MUST:

1. Read `design/taste-rules.md` before producing or reviewing anything visual (alongside `docs/design-system.md` and `design/references/`).
2. Treat EVERY rule as a checkable gate, same status as a contrast check: a violation is a defect, cite the rule and the offending `file:line`.
3. If a rule is ambiguous when applied to the case at hand, ask the user — do not guess, and do not skip the rule.

## STOP and ask the user when

- A new correction contradicts an existing rule (Step 4 — always).
- You cannot make the rule checkable without guessing what they meant.
- Scope (universal vs this-project) is genuinely ambiguous.
- The correction implies changing `design/tokens.json` or `docs/design-system.md` — logging the rule is fine; changing tokens or the art direction needs explicit approval (tokens.json is a protected file).
