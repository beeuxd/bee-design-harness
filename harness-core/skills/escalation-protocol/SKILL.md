---
name: escalation-protocol
description: Detects when a debugging or build session is thrashing and forces a structured stop — a findings block with error text, attempts, ranked hypotheses, and 2-3 options — instead of more guessing. Use the moment a fix attempt fails twice, a fix would weaken lint/types/tests, or a "small bug" keeps growing. Trigger phrases — "I'm stuck", "still failing", "same error again", "should I just disable this rule", "let me try one more thing", "this fix keeps growing".
---

# Escalation Protocol — stop thrashing, ask well

Asking after 2 failed attempts is the senior move. Burning an hour guessing is the junior move.
This skill defines exactly when to stop, what evidence to collect, and how to hand the decision to the user.

## Step 1 — Run the thrash check after EVERY failed fix attempt

After any attempt that did not fully fix the problem, check this list. If ANY line is true, go straight to Step 3. Do not start another fix.

- [ ] The same error text (or same root symptom) has survived **2 distinct fix attempts**.
- [ ] The fix you are about to try would **disable or weaken a lint rule, TypeScript strictness, or a test** (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `any` cast, `test.skip`, deleting a test, loosening `tsconfig.json`).
- [ ] You are about to **delete a file and regenerate it wholesale** instead of editing it.
- [ ] The **docs contradict the code** (e.g., `design/tokens.md` describes a token that does not exist in `design/tokens.json`, or `docs/design-system.md` disagrees with what's implemented). You cannot know which side is the intended truth.
- [ ] A "small bug" fix has grown past **~30 changed lines** (`git diff --stat` to check).
- [ ] You are considering **upgrading or downgrading a dependency** to make an unrelated error disappear.
- [ ] The fix requires editing a **protected file** (`design/tokens.json`, `CLAUDE.md`, `.claude/settings.json`) — e.g., changing a token so a color "works". Protected files always require explicit user approval (the `protected-files-guard` PreToolUse hook enforces this).
- [ ] Your next idea is a **guess** — you cannot state a concrete hypothesis for why it would work.

If none are true: you may try exactly one more attempt, then re-run this check.

## Step 2 — Count attempts honestly

An "attempt" is any change intended to fix the problem, whether or not you reverted it. Two variations of the same idea count as two attempts. Keep a running list as you go:

```
Attempt 1: <what you changed> → <exact result / error text>
Attempt 2: <what you changed> → <exact result / error text>
```

If you cannot reconstruct this list from memory, that is itself a thrash signal — stop.

## Step 3 — On ANY signal: stop and produce a findings block

Do not write more code. If half-applied changes leave the tree broken, park them with `git stash push -u -m "escalation: half-applied fix"` (`-u` includes brand-new untracked files, which stash otherwise skips) — stash is recoverable (`git stash pop`), so nothing is lost. Never use `git checkout -- <file>` or `git restore <file>` here: those destroy uncommitted changes irreversibly, and the tree may contain the user's own edits. Then post this block to the user, filled in completely:

````markdown
## Findings — stopping to ask before I make this worse

**Problem:** <one sentence — what is broken, where it appears>

**Exact error:**
```
<verbatim error text / failing test output / console message — copy-pasted, not paraphrased>
```

**Environment:** <command that reproduces it, e.g. `pnpm build`, `pnpm exec playwright test`, viewport if visual>

**What I tried:**
1. <attempt> → <result, verbatim if it changed the error>
2. <attempt> → <result>

**Hypotheses (ranked, with evidence):**
1. <most likely cause> — because <specific evidence: file:line, log output, doc reference>
2. <next> — because <evidence>
3. <long shot> — because <evidence>

**Options:**
- **A (recommended):** <concrete action, effort estimate, what it risks>
- **B:** <alternative, effort, risk>
- **C (if applicable):** <alternative, effort, risk>

**My recommendation:** <A/B/C> because <one sentence>.

**Waiting for your call before touching anything else.**
````

Rules for the block:
- Error text is **verbatim**. Paraphrased errors hide the clue.
- Every hypothesis cites evidence (a file path + line, a log line, a doc section). "Maybe it's a cache thing" with no evidence does not go in the list.
- Options are actions the user can approve in one word, not research projects.
- If the trigger was a docs-vs-code contradiction, Option A is always "tell me which source is correct" — never silently pick one.

Then STOP and wait. Do not "try one more thing while waiting."

## Step 4 — Evidence to gather BEFORE writing the block (cheap, read-only)

Collect what you can of the following — these sharpen hypotheses without changing anything:

```bash
git diff --stat                              # how big has this really gotten?
git log --oneline -5                         # what changed recently?
pnpm exec tsc --noEmit                       # full type errors, not just the first
pnpm lint 2>&1 | head -40                    # lint state (Next.js "lint" script)
git grep -n "MySymbol"                       # where else is this used? (replace MySymbol; searches all tracked files, no folder guessing)
```

For rendering/visual problems, "compiles" is not evidence — capture actual page state and include what you observed in the findings block. You need the dev server up (default `http://localhost:3000`); if it isn't, bring it up per the dev-server procedure in `session-start` Step 6 (reuse a server already running on another port; otherwise start one in the background — never run `pnpm dev` in the foreground).

Then take a dark-mode, mobile-first, full-page screenshot:

```bash
pnpm exec playwright screenshot --viewport-size=360,780 --color-scheme=dark --full-page --wait-for-timeout=3000 "http://localhost:3000/<route>" /tmp/findings-360.png
```

Or run the `visual-qa` skill, which covers the three review widths (360/768/1440); for the full 360/768/1024/1440/1920px sweep, run the project's responsive matrix via `e2e-test` or the ship gate.

## FORBIDDEN MOVES — never without explicit user instruction

These are not fixes. They are damage. Even if one would make the error disappear, it goes in the Options list for the user to approve — you never do it unilaterally:

1. `git push --force` (or `--force-with-lease`) — in any form.
2. `rm -rf` on any tracked directory.
3. Deleting or skipping tests (`test.skip`, `xit`, removing assertions) to go green.
4. Casting to `any` (or `as unknown as X`) to silence a type error. House rule: no `any` without a `// TODO` comment, and even that needs user sign-off in a fix context.
5. `eslint-disable` / `@ts-ignore` / `@ts-expect-error` to silence a rule instead of fixing the cause.
6. Editing `design/tokens.json` to make a color, spacing, or contrast issue "work". Tokens come from Figma variables (two-source rule) — a token edit is a design decision, not a bug fix.
7. Wholesale dependency bumps (`pnpm up`, changing a version range, adding `overrides`/`resolutions`) to make an unrelated error disappear.

If your plan includes any of these, that IS the escalation — write the findings block and ask.

## Also STOP and ask (no thrash required) when

- The fix would add a new dependency (CLAUDE.md "Stop and ask me before").
- The fix would add a page not in `docs/prd.md`, or touch analytics, privacy, or third-party embeds.
- Two house standards conflict in this specific case (e.g., the only token-compliant color fails WCAG AA contrast in dark mode) — surface the conflict, do not quietly break one.
- You realize the original request was ambiguous and your interpretation drove the failure — re-confirm scope before rebuilding.

## After the user answers

1. Restate the chosen option in one line.
2. If you stashed half-applied changes in Step 3: `git stash pop` them first ONLY if the chosen option builds on them; if the chosen option abandons that approach, leave the stash parked, tell the user it exists (`git stash list` shows it as "escalation: half-applied fix"), and start clean.
3. Execute it as a small verifiable step; show evidence it worked (rerun the exact reproduction command; screenshot for visual issues — dark mode, mobile-first viewports).
4. If the chosen fix ALSO fails: that is one attempt against a fresh problem statement — one more thrash-check cycle, then escalate again with the updated findings block. Do not restart the guessing loop.
5. If the session is long or the context is heavy, generate a handoff with the `handoff-summary` skill so the next session inherits the findings block instead of rediscovering it.
