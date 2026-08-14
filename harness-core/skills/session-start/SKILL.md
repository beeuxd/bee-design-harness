---
name: session-start
description: Orients Claude at the start of any session in this project — reads CLAUDE.md, scopes the docs to read, verifies git branch and dev server state, and produces a short plan before any code is written. Use at the beginning of every new conversation, when resuming work, or when a Handoff block is pasted. Trigger phrases: "let's get started", "new session", "resume work", "pick up where we left off", "here's the handoff", "orient yourself". (Discovery questions and PRD writing for a new feature — "let's start on feature X" — belongs to the pm agent per CLAUDE.md's feature flow; this skill only orients the session.)
---

# Session Start — Orientation Protocol

Run this at the top of ANY session before touching code. Total budget: a few minutes. Do NOT read the whole repo.

## Step 1 — Read CLAUDE.md

Read `CLAUDE.md` at the repo root. It is the house-rules contract; nothing you do this session may contradict it. Note especially: dark mode is primary, mobile-first at 360px, token-only styling, the "Stop and ask me before" list, and the protected files (`design/tokens.json`, `CLAUDE.md`, `.claude/settings.json` — a PreToolUse hook blocks edits without explicit user approval).

## Step 2 — Classify the entry state

Determine which of three states you are in, then follow that branch:

| State | Signal | Go to |
|---|---|---|
| A. Handoff block present | User's first message contains a "Handoff" block (from the `handoff-summary` skill) | Step 3A |
| B. Fresh start | Normal request, no handoff | Step 3B |
| C. Dirty working tree | `git status` (Step 5) shows ANY uncommitted changes — at session start you have made none yet, so every dirty tree is state C | Step 5, STOP branch |

Run Step 5 (git check) early regardless — state C overrides A and B.

### Step 3A — Handoff block present

1. Acknowledge the handoff in ONE line. Do not echo it back.
2. Read `CLAUDE.md` (Step 1) plus ONLY the docs named under the handoff's "Current scope".
3. Treat the handoff's "Next steps" as the scope. Ask exactly one clarifying question before writing code (required by CLAUDE.md). If nothing is genuinely unclear, the question is a confirmation: restate the first next step from the handoff and ask "start here?" — do not invent a filler question.

### Step 3B — Fresh start

Derive scope from the user's message, then pick docs in Step 4. If the request is ambiguous (no clear feature, page, or component named), STOP and ask the user to name the target before reading further.

## Step 4 — Read ONLY the docs relevant to scope

Full read-order list from CLAUDE.md (never read all of it in one session):

1. `docs/project.md` — mission, audiences, goals
2. `docs/prd.md` — product requirements
3. `docs/design-system.md` — tokens, type, color, motion
4. `docs/ux-principles.md` — UX heuristics and anti-patterns
5. `docs/user-flows.md` — user journeys and flow maps
6. `docs/tech.md` — stack, folder structure, performance budget
7. `design/tokens.json` — DTCG token source of truth (protected file)
8. `design/tokens.md` — human-readable token reference
9. `design/components.md` — component inventory + Figma mapping
10. `design/patterns.md` — reusable UI and interaction patterns
11. `design/accessibility.md` — WCAG 2.2 AA checklist

Selection rule — read the subset matching the task type, in list order:

- **Building/styling UI (component, section, page):** 3, 6, 8, 9, 10. Check 9 (`design/components.md`) plus `components/ui/` and `components/site/` BEFORE creating anything new — reuse before build.
- **New feature / scoping / requirements question:** 1, 2, 5, then the UI subset if you'll build.
- **Interaction/UX behavior question:** 4, 10, plus the shadcn/Radix primitive's actual source (two-source rule: visuals from Figma variables mapped to our tokens, behavior from the primitive's source — never invented, never eyeballed).
- **Accessibility work:** 11, 4.
- **Performance/tooling/build:** 6 only.
- **Pure copy/content:** 1, 2.

If a doc still contains `{{PLACEHOLDER}}` values relevant to your task, STOP and ask the user for the real values — do not invent project names, fonts, or brand colors. Fonts and colors live in `docs/design-system.md` and `design/tokens.json`; never assume them.

## Step 5 — Git state and branch

```bash
git status --porcelain && git branch --show-current
```

- **Dirty tree you didn't create (state C):** STOP. Run `git diff --stat HEAD` (covers staged + unstaged changes; untracked files show as `??` lines in the `git status --porcelain` output above — include them). Summarize for the user (files touched, rough size), and ask whether to keep working on top of it, stash it, or commit it. Touch NOTHING until they answer.
- **On `main` (or `master`):** never work here. Create a branch first, replacing the slug with 2–4 kebab-case words derived from the scope (e.g. `feature/pricing-card-mobile`):

```bash
git checkout -b feature/<short-kebab-slug>
```

- **Already on a `feature/*` branch:** confirm it matches the current scope. If it clearly belongs to a different task, ask before reusing it.

## Step 6 — Dev server check

The commands in this step assume the template default: pnpm + Next.js on port 3000. The authoritative dev command and port live in `docs/tech.md` and `package.json` `scripts` — if they differ from the default, substitute them everywhere below (and in every other skill's server commands this session).

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000
```

- `200` (or any 2xx/3xx): server is up — reuse it, do not start a second one.
- `000` / connection refused: FIRST check whether a dev server is already running on a different port — `pgrep -fl "next dev"` (or `next-server`). If one exists, find its port (`lsof -nP -iTCP -sTCP:LISTEN -p <pid>` or its log) and use that port everywhere below — do NOT start a second server. Only if nothing is running, start the server in the background — never run `pnpm dev` in the foreground, it blocks forever. Use your shell tool's background/run-in-background mode if it has one; otherwise detach it and log to a file:

```bash
nohup pnpm dev > /tmp/dev-server.log 2>&1 &
```

Then wait ~10 seconds and re-check:

```bash
sleep 10 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000
```

- If Next.js picked a different port (3000 was taken), the log says so — check with `grep -i 'local\|port' /tmp/dev-server.log` — and use that port for all later verification, don't fight it.

You only need the server up before your first visual verification, not before reading docs — but check it now so a broken install surfaces early. If `pnpm dev` fails on missing deps, run `pnpm install` once; if it still fails, STOP and show the user the error.

## Step 7 — Verify tools lazily

Do NOT preflight every tool. Verify each one immediately before its first use this session:

- Before first `pnpm` script: `pnpm --version`
- Before first browser check: `pnpm exec playwright --version` (install browsers via `pnpm exec playwright install chromium` only if the run fails on missing browsers)
- Before first PR/issue command: `gh auth status`

If a tool is missing or unauthenticated, STOP and tell the user exactly what failed and the one command that fixes it — don't silently install global software.

## Step 8 — Restate scope and plan (REQUIRED before any code)

In at most 3 sentences, tell the user: (1) the scope as you understand it, (2) a 3-step plan, (3) the first file you'll touch or doc you still need. Example shape:

> Scope: restyle the pricing cards for mobile, dark-first. Plan: 1) map Figma variables to our tokens for the card, 2) rebuild `components/site/pricing-card.tsx` on the shadcn Card primitive with container queries, 3) verify at 360/768/1024/1440/1920 in dark mode. Starting with `design/tokens.md` — anything I'm missing?

Wait for pushback only if you asked a question; otherwise proceed.

## Hard rules carried into the rest of the session

- Dark mode first; verify every change at 360/768/1024/1440/1920px.
- WCAG 2.2 AA baseline; interactive elements meet the 44×44px minimum tap target on touch.
- Token-only styling — a PostToolUse hook flags hardcoded hex and arbitrary px at write time; fix flags immediately, don't suppress.
- Evidence over claims: "compiles" is not "renders". Screenshot or curl the actual page state, and cite `file:line` when reporting what you changed or found.
- Performance budget (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, TBT < 200ms, JS first-load < 150KB gzipped) is a ship gate, not advice.
- If the session later needs to pause mid-task, hand off with the `handoff-summary` skill rather than leaving a dirty tree unexplained.
