---
name: handoff-summary
description: Generates a copy-paste handoff block that lets a fresh chat resume this project's work with zero context loss, and syncs any doc-level decisions into docs/ or design/ before the session ends. Use when a session runs long (>90 min or >40 messages), context usage passes ~60% of the window, context is degrading, scope is switching, or the user asks to wrap up — trigger phrases include "handoff summary", "write a handoff", "let's start a new chat", "this is getting slow", "save our progress", "context is heavy". Pasting a received Handoff block into a fresh chat triggers the CLAUDE.md new-chat resume protocol, not this.
---

# Handoff Summary — session continuity

Produces one markdown block the user pastes into a new chat. The block is the ONLY thing that survives this conversation, so every fact needed to resume must be in it — or, better, in a file.

## 1. When to offer a handoff

Offer proactively when ANY of these fires (per `CLAUDE.md` new-chat protocol):

1. Session running > ~90 minutes (estimate from message/tool-output timestamps if visible; if you can't measure time, rely on triggers 2–7 instead)
2. Thread has > ~40 back-and-forth messages
3. You catch yourself repeating work, losing earlier context, or re-asking questions the user already answered
4. The next task is a clearly different scope from the current one
5. User says "this is getting slow" or similar
6. Context is clearly heavy — large diffs repeating, long tool-call chains, truncated recall
7. Token usage crosses the thresholds below

**Token thresholds.** The context window is 200k tokens; the user can check exact usage with `/context` (the statusline also shows it if configured). The working bands:

| Usage | State | Action |
|---|---|---|
| < 50% (~100k) | Healthy | Keep working |
| 60–70% (~120–140k) | **Handoff zone** | Offer a handoff at the next natural break — this is the ideal clearing point |
| > 80% (~160k) | Urgent | Offer immediately, mid-task if necessary |
| ~95% | Auto-compact fires | Too late — compaction is lossy and unreviewed; never rely on it as the save mechanism |

**Write the handoff BEFORE context degrades, not after.** A handoff written from a degraded context is itself degraded. Quality drops well before the window is full — the 60–70% band exists because the last clean handoff beats the first confused one. If trigger 3 or 6 fires, treat it as urgent regardless of the token count.

How to offer: ONE short sentence, then wait for confirmation. Example: "Context is getting heavy (~65% used) — want me to generate a handoff so you can resume in a fresh chat?" Do not generate the block until the user confirms. Exception: if the user explicitly asked for a handoff, skip the offer and generate it.

## 2. Gather evidence — do not write from memory

Files touched must come from git, not recollection. Run these from the project root:

```bash
git branch --show-current
git status --porcelain          # uncommitted work (staged + unstaged)
git diff --stat                 # unstaged change sizes
git diff --cached --stat        # staged change sizes
git log --oneline -15           # recent commits — include ONLY the ones made this session (cross-check hashes against commits you actually created; the older ones are pre-session history)
git diff --name-only main...HEAD 2>/dev/null || git diff --name-only origin/main...HEAD
# if the default branch isn't main, find it offline with: git symbolic-ref --short refs/remotes/origin/HEAD — then diff against that branch instead
date +%F                        # date for the header
```

Rules:

- If degraded context makes commit attribution uncertain (you can't tell which of the last 15 commits you made this session), run `git log --format='%h %ci %s' -15` and match timestamps against the session; anything still uncertain goes in the handoff marked `(attribution uncertain)` — never silently claim or drop a commit.
- The "Files touched" list = union of `git status --porcelain` paths and branch-diff paths. Add any files you edited earlier this session that git can no longer show (e.g., already merged) from memory, marked `(merged)`.
- If `git branch --show-current` prints `main`, note that in the handoff under Open decisions — work should be on `feature/*` per repo conventions. Do not fix it silently.
- If there is uncommitted work, ask the user whether to commit it (conventional message, current feature branch) before handing off. Never commit to `main`: if the current branch IS `main`, ask the user for a `feature/short-description` branch name first. Uncommitted work is the #1 thing lost between sessions. If they decline, record the exact uncommitted file list in the handoff. If the working tree is in a risky state (half-applied change, mixed concerns), make a checkpoint commit on the feature branch first — `git add -A && git commit -m "chore: checkpoint before handoff"` — so nothing can be lost; it can be reworded or squashed later.

## 3. Sync doc-level decisions into files

Chat history dies with the session; files persist. Before writing the block, check: did any decision this session change a doc-level fact? If yes, update the file as part of the handoff:

| Decision made this session | File to update |
|---|---|
| Scope or requirements changed | `docs/prd.md` (or `docs/project.md` for mission-level) |
| New reusable UI/interaction pattern established | `design/patterns.md` |
| New component created | `design/components.md` — with a working usage example (house rule) |
| Token added/renamed/retired | `design/tokens.md` AND `design/tokens.json` — see STOP below |
| Type, color, or motion system rule changed | `docs/design-system.md` |
| User flow or journey changed | `docs/user-flows.md` |
| Stack, folder, or perf-budget decision | `docs/tech.md` |
| Accessibility exception or ruling | `design/accessibility.md` |
| Visual correction the user made | `design/taste-rules.md` — via the `taste-retro` skill |

Keep each doc edit minimal — record the decision, don't rewrite the doc. List every doc you updated in "Files touched".

**STOP conditions — ask the user before proceeding:**

- STOP before editing `design/tokens.json` or `CLAUDE.md` — both are protected files; a PreToolUse hook enforces explicit user approval.
- STOP if a decision contradicts something already written in `docs/` or `design/` — surface the conflict, let the user pick which is true.
- STOP if you cannot reconstruct what was actually decided (degraded context) — ask the user to confirm the decision in one line rather than guessing and writing a wrong fact into a doc.

## 4. Output format — use EXACTLY this

Wrap the entire handoff in a single markdown code block so it copy-pastes cleanly. Fill every section; write "None" rather than omitting a heading. Additionally save a copy to `docs/handoffs/HANDOFF-YYYY-MM-DD.md` (append `-2`, `-3` for same-day sessions) so the handoff survives even if the chat is closed before the user copies it.

```markdown
# Handoff — YYYY-MM-DD, session N

## Current scope
[What we were working on — specific page / component / task. One sentence. Branch: feature/xxx]

## Completed this session
- [Bullet: what shipped or merged]
- [Bullet: what was decided — and which doc now records it]
- [Bullet: files created or significantly changed]

## In progress
- [What's partially done — file path, line/section, and exactly what's blocking]

## Open decisions
- [Any design / content / scope questions the user still owes an answer on]

## Next immediate step
[Single next action when we resume — one sentence, concrete enough to start on directly]

## Files touched
- path/to/file.tsx — [one-line description]
- path/to/file.tsx — [one-line description]
```

Session N: increment from the previous handoff if the user pasted one at the start of this session (or from the latest file in `docs/handoffs/`); otherwise omit ", session N".

## 5. Quality bar

- **Specific over general.** "Built the hero section with container-query responsive grid" — not "worked on hero."
- **Include blockers.** If you were stuck, say on what and why — the next session should not rediscover it.
- **List every file touched.** Even small edits. Derived from git (step 2), not memory.
- **Verification state is a fact.** If work is unverified (no screenshots in both themes, no viewport sweep per `verify-before-done`), say so in "In progress" — "compiles" does not mean "renders".
- **No meta-commentary.** No "great session!", no apologies, no process narration. Just the facts.
- **Under 400 words.** Context, not diary. If it runs long, the doc-sync in step 3 was incomplete — move durable facts into files and shorten the block.

## 6. At the start of a NEW chat (resume protocol)

If the user's first message contains a Handoff block, follow the `CLAUDE.md` new-chat protocol: acknowledge it in one line, re-read `CLAUDE.md` plus the docs named under "Current scope", ask exactly one clarifying question before writing code, and never echo the handoff back at the user.
