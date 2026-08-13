---
name: ux-copy-review
description: Reviews all user-facing copy (CTAs, errors, empty states, labels, nav, alt text, toasts) against the project voice and accessibility rules, producing a file:line inventory and per-issue rewrites. Use when copy is written, changed, or suspected weak — before ship review or on request. Triggers on "review the copy", "check the text", "ux copy review", "is this copy good", "improve the microcopy", "audit the strings".
---

# UX Copy Review

Review-only by default. Do NOT edit files unless the user explicitly asks you to apply fixes (see "Applying fixes"). Output is an inventory + issue list in chat.

## Prerequisites

1. Read `docs/project.md` — the voice/tone section is the standard for the Tone checklist.
2. Read `docs/ux-principles.md` — the anti-patterns list ("Click here", placeholder-as-label, color-only references) is binding.
3. **STOP and ask the user** if the voice/tone section in `docs/project.md` is missing or still contains `{{PLACEHOLDER}}` values. Ask for 3 adjectives describing the voice plus one example sentence; do not judge tone against an invented voice.

## Step 0 — Build the copy inventory (never skip)

You cannot review what you haven't found. Run all of these from the repo root (quote the path — it contains a space: `cd "/path/to/project"`).

First confirm where the source lives — if this shows only `src`, replace `app/ components/` in every command below with `src/app/ src/components/`. Also drop any dir the listing does NOT show from the commands below (command 3 greps `lib/` too; grep errors on paths that don't exist):

```bash
ls -d app components lib src 2>/dev/null
```

```bash
# 1. Literal JSX text content (text between tags); the second grep drops comment lines and import lines
grep -rn --include='*.tsx' --exclude='*.test.*' --exclude='*.spec.*' -E '>[[:space:]]*[A-Za-z][^<>{}]*<' app/ components/ | grep -vE ':[0-9]+:[[:space:]]*//|from ["'\'']'

# 2. Attribute strings: aria-label, placeholder, title, alt, aria-description
grep -rn --include='*.tsx' --exclude='*.test.*' --exclude='*.spec.*' -E '(aria-label|aria-description|placeholder|title|alt)=\{?["'\''`]' app/ components/

# 3. Toast, error, validation, and message strings in logic files
grep -rn --include='*.ts' --include='*.tsx' --exclude='*.test.*' --exclude='*.spec.*' -iE '(toast|error|message|description|label|heading|success)[A-Za-z]*[[:space:]]*[:=(][[:space:]]*["'\''`][^"'\''`]{3,}' app/ components/ lib/
```

(These patterns deliberately use `[[:space:]]` instead of `\s`, and `*` instead of `+` in the bracket-class repeats — macOS grep variants (BSD grep, ugrep) don't all handle `\s` or those `+` repeats consistently in `-E` patterns. Verified on both. Don't "simplify" them back.)

Then close the gaps grep misses:

- **Read every file that matched** — grep finds the line, not the sibling strings (template literals, ternary copy, arrays of strings, zod `.min(1, "...")` messages).
- Check for centralized copy files: `ls lib/ content/ constants/ messages/ 2>/dev/null` and grep those too.
- Check `app/**/metadata` exports, `not-found.tsx`, `error.tsx`, `loading.tsx` — high-traffic copy hides there.

**Evidence requirement:** produce an inventory table before any judgment. One row per user-facing string: `file:line | string (verbatim) | type (CTA / error / empty state / label / nav / placeholder / alt / aria / toast / body)`. State the total count. If the count is 0, something is wrong with your commands — STOP and ask the user where copy lives before concluding "no copy".

Exclude from the inventory: code comments, `console.*` strings, test files, class names, keys/IDs, dev-only strings.

## Step 1 — Apply the checklist to every inventory row

### Clarity
- [ ] One idea per sentence
- [ ] No jargon the target user (per `docs/project.md` audience) wouldn't know — if jargon is unavoidable, it's explained on first use
- [ ] Actionable — user knows what to do after reading
- [ ] Active voice in instructions ("Enter your email", not "Your email should be entered")

### CTAs
- [ ] Verb + outcome ("Create account", not "Submit")
- [ ] Never "Click here", "Submit", "OK", or "Go"
- [ ] Label matches what actually happens on click (no bait-and-switch — verify against the handler/route, not just the label)

### Error messages
- [ ] Says what happened — specific, not "An error occurred"
- [ ] Says what to do next ("Check the email format and try again")
- [ ] Plain language, no error codes shown to users
- [ ] Never blames the user ("That email isn't registered", not "You entered a wrong email")
- [ ] No exclamation marks

### Empty states
- [ ] Explains why it's empty ("No projects yet")
- [ ] Says what to do next
- [ ] Has a primary CTA to take the first action
- [ ] Never a blank area — if a list/table/grid has no empty-state branch in the code, flag it as a missing state

### Labels & navigation
- [ ] Scannable — skim-readable, front-loaded keywords
- [ ] Consistent terminology — never "Delete" and "Remove" for the same action; grep both terms across the inventory to verify
- [ ] Nav labels match the page titles they lead to (compare against `metadata` titles)
- [ ] No abbreviations that aren't universally understood

### Tone
- [ ] Matches the voice defined in `docs/project.md`
- [ ] Consistent across the experience (same person, same formality)
- [ ] Context-appropriate: errors are calm, success is encouraging
- [ ] No exclamation marks in error states

### Accessibility in copy (cross-reference: `a11y-audit` skill for the full audit)
- [ ] No color- or position-only references ("Click the red button", "the box on the right")
- [ ] Link text is descriptive out of context ("View pricing details", not "Learn more" / "Click here")
- [ ] Alt text describes the image's purpose, not its appearance; decorative images get `alt=""`
- [ ] Form instructions are visible text, not placeholder-only (placeholders disappear on focus)
- [ ] Every icon-only button in the inventory has an `aria-label` — if one is missing, that's a finding

## Step 2 — Report findings

For **each** issue:

1. Quote the current text verbatim with `file:line`
2. Diagnose in one sentence (vague? hedged? off-voice? blames user? color-only?)
3. Offer exactly 2 rewrites
4. Mark the recommended one and say why in one clause

End the report with: inventory count, issues found, issues by category, and any STOP items awaiting the user.

## STOP conditions

STOP and ask the user before proceeding when:

- The voice/tone in `docs/project.md` is a `{{PLACEHOLDER}}` or absent (see Prerequisites).
- A rewrite requires inventing a marketing claim, statistic, price, or legal/compliance wording. Content-first rule: flag missing copy, never fabricate it.
- Fixing a terminology inconsistency means renaming a route, nav item, or a term used across 5+ files — that's an IA decision, not a copy edit.
- Correct copy depends on product behavior you can't verify from the code (e.g., "Does the trial actually last 14 days?").
- The fix touches a protected file (`design/tokens.json`, `CLAUDE.md`) — a PreToolUse hook enforces this anyway.

## Applying fixes (only when the user asks)

1. Branch first: `git checkout -b feature/copy-review-<scope>`. Never commit to `main`.
2. Apply only the recommended rewrites the user approved. Copy edits only — no styling, markup, or logic changes in the same pass.
3. Verify rendering, not compilation ("compiles" ≠ "renders"). Longer strings break layouts. Replace `<changed-page>` with the real route (e.g. `/settings`) and keep the URL quoted; run the whole block as ONE shell invocation so `$DEV_PID` survives:
   ```bash
   pnpm dev > /tmp/copy-review-dev.log 2>&1 &
   DEV_PID=$!
   for i in $(seq 1 30); do curl -sf http://localhost:3000 > /dev/null && break; sleep 2; done
   curl -sf http://localhost:3000 > /dev/null || { echo "Server never came up — check /tmp/copy-review-dev.log (port 3000 may already be in use)"; kill $DEV_PID; exit 1; }
   pnpm exec playwright screenshot --color-scheme=dark --viewport-size=360,800 "http://localhost:3000/<changed-page>" copy-360.png
   pnpm exec playwright screenshot --color-scheme=dark --viewport-size=1440,900 "http://localhost:3000/<changed-page>" copy-1440.png
   kill $DEV_PID
   ```
   Check every changed page at 360 and 1440 minimum (full sweep 360/768/1024/1440/1920 if a string changed length significantly), in dark mode (the primary theme). `--color-scheme=dark` only works for `prefers-color-scheme` themes — open the PNGs, and if they render light the theme is class-/localStorage-based: capture with the `visual-qa` skill's `.qa/visual-capture.mjs` script instead. Look for truncation, overflow, wrapped CTAs, and buttons dropping below the 44px tap-target height.
4. Re-run inventory command #1 on the changed files to confirm no stale strings remain.
5. Evidence before "done": screenshots + list of changed `file:line` pairs. See the `verify-before-done` and `visual-qa` skills.
