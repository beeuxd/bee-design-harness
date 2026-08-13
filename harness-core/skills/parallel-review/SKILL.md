---
name: parallel-review
description: Fans out multiple subagents in parallel — one per review lens (accessibility, tokens, performance, UX states, copy) — then dedups, spot-checks, and merges their findings into one severity-ordered report. Use for multi-page audits, mid-project health checks, or any review needing 3 or more independent lenses; do NOT use for a single component or quick fix. Triggers on "full review", "audit everything", "review in parallel", "run all the checks", "review with multiple lenses". (A go/no-go verdict before merge is the ship skill — ship uses this as its review engine; "pre-ship check" and "ready to ship" route to ship.)
---

# Parallel Review — fan out lens agents, merge one report

One serial review pass misses things and burns context. Instead: launch one subagent per review lens, each with a disjoint mandate, then synthesize. Each lens agent runs the matching skill from this library.

## Step 0 — Decide if this skill applies

Run parallel review when ANY of these is true:
- Pre-ship gate on a page, feature, or PR (the `/ship` flow in CLAUDE.md)
- Audit spans multiple pages or routes
- The job has >= 3 independent lenses (a11y, tokens, performance, UX states, copy)

Do NOT run it when:
- Reviewing a single component or a small diff — review inline yourself, referencing the relevant skill directly
- The user asked for exactly one lens (e.g. "check accessibility") — run that skill alone
- The dev server cannot start — fix that first; agents reviewing a broken build return garbage

STOP and ask the user when:
- It is unclear which pages/routes are in scope
- The build is red or `pnpm dev` fails — do not fan out against a broken app

## Step 1 — Establish shared ground truth (before launching anything)

Agents cannot share state, so pin down the facts they all need:

```bash
git branch --show-current   # must be feature/*; if it prints "main", STOP:
                            # any fixes need a branch first — git checkout -b feature/<short-description>
pnpm build                  # must pass; if it fails, STOP — fix the build first
```

Then start the dev server as a true background process — a bare `pnpm dev &` dies when the shell call ends. Use the Bash tool's background/run_in_background mode, or:

```bash
nohup pnpm dev > /tmp/dev-server.log 2>&1 &
echo $! > /tmp/dev-server.pid   # so it can be stopped cleanly in Step 5
```

The server takes several seconds to boot, so poll the log until the URL line appears (Next.js prints the real port — 3000, or 3001+ if 3000 is busy), then confirm it actually responds:

```bash
for i in $(seq 1 30); do grep -m1 -oE "localhost:[0-9]+" /tmp/dev-server.log && break; sleep 1; done
curl -s -o /dev/null -w "%{http_code}\n" "http://$(grep -m1 -oE 'localhost:[0-9]+' /tmp/dev-server.log)"   # expect 200
```

If the loop ends without printing a port, or curl does not print 200, read `/tmp/dev-server.log`, fix the startup error, and do not launch any agents until this passes.

**Exception — the performance lens never measures the dev server.** Dev mode is unminified and uncached, so LCP/INP/TBT numbers from it are garbage. Give the performance agent the production build instead: serve the Step 1 `pnpm build` output with `pnpm start` on a separate port, backgrounded and verified the same way as the dev server, with its own log and pid file:

```bash
nohup env PORT=3100 pnpm start > /tmp/prod-server.log 2>&1 &
echo $! > /tmp/prod-server.pid
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:3100 | grep -q 200 && echo up && break; sleep 1; done   # must print "up"
```

Put THAT URL (`http://localhost:3100`) in the performance agent's prompt. All other lenses use the dev server.

Write down for the prompt template: the exact URLs in scope, the dev server port (and the production port for the performance lens), and the reference docs (`design/tokens.json`, `design/tokens.md`, `docs/design-system.md`, `design/accessibility.md`, `design/components.md`). Never paste specific font names or hex values into agent prompts — point agents at those files (this is a template repo; values differ per project).

## Step 2 — Pick lenses and map them to skills

| Lens | Skill the agent must follow | Mandate (disjoint — no overlap) |
|---|---|---|
| Accessibility | `a11y-audit` | WCAG 2.2 AA: keyboard, semantics, contrast, focus, `prefers-reduced-motion` gating |
| Token compliance | `design-system-audit` | Only token/spec drift: hardcoded hex, arbitrary px, values not in `design/tokens.json`, deviation from Figma-sourced specs |
| Performance | `performance-check` | Budget only: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, TBT < 200ms, JS first-load < 150KB gzipped |
| UX state coverage | `review-ux` | States and responsive only: loading/empty/error/hover/focus/disabled, tap targets >= 44x44px, behavior at 360/768/1024/1440/1920px, dark mode first |
| Copy | `ux-copy-review` (requires the role-copywriter plugin; if it isn't installed, drop this lens and flag copy review as a human follow-up) | Words only: labels, errors, empty states, CTAs, tone, invented marketing claims |

Rules:
- Drop lenses that don't apply (no copy changes -> no copy lens). Minimum 3 lenses to justify fan-out; below that, review inline.
- Mandates must be disjoint. If two agents would inspect the same thing, tighten the mandates (e.g. contrast belongs to a11y, not tokens).
- For multi-page audits, prefer one agent per lens across all pages (not one per page) — cross-page inconsistency is a finding.

## Step 3 — Launch agents IN PARALLEL

Use the Task/Agent tool. Launch ALL lens agents in a single message (multiple tool calls in one block) — sequential launches defeat the purpose. Each agent gets this template, filled in:

```
You are a review agent with exactly one lens: {LENS}.
Follow the {SKILL_NAME} skill step by step.

Scope: {URLS / FILES / ROUTES}.
App under review: http://localhost:{PORT} — {the dev server; OR, for the
performance lens only: the production build, measure against this URL}.
Theme: dark mode is primary — verify dark-first.
Viewports (if your lens is visual): 360, 768, 1024, 1440, 1920px, via Playwright.
Reference truth: design/tokens.json, docs/design-system.md, design/accessibility.md.

Contract — non-negotiable:
1. Report findings ONLY within your lens. Ignore everything else, even obvious bugs.
2. Every finding MUST include: severity (P0 blocks ship / P1 fix before merge /
   P2 nice-to-have), file:line evidence (or URL + measured value for runtime
   findings, e.g. "LCP 3.1s at /pricing, 360px"), and a concrete fix
   (exact token, exact code change, or exact command).
3. Findings without file:line (or measured-value) evidence WILL BE DISCARDED.
   "Seems off" is not a finding. Quote the offending line.
4. Do NOT edit any files. Read-only review.
5. Return a markdown list of findings, or "PASS — no findings" with a one-line
   note of what you checked.
```

Set each agent read-only (no Write/Edit). If your agent tool cannot restrict tools per-agent, contract line 4 in the prompt is the enforcement — and you verify it: run `git status --porcelain` before launching and again after all agents return; any new diff means an agent edited files, which invalidates every lens's results — revert the stray edits (`git diff` first to see exactly what changed, then `git checkout -- <paths>` / `git clean -fd <paths>` for untracked strays) and re-run the affected lenses.

## Step 4 — Synthesize (you do this yourself, not another agent)

1. **Discard** any finding lacking file:line or a measured value. No exceptions — the contract said so.
2. **Dedup**: merge findings that share the same file:line root cause (e.g. a hardcoded color flagged by both tokens and a11y). Keep the highest severity; credit both lenses.
3. **Adversarial spot-check**: for every surprising or high-impact finding (any P0, anything contradicting the Figma spec or shadcn source, any "this whole page fails X"), verify it yourself before reporting:
   - Read the cited file:line — does the quoted code exist and do what the agent claims?
   - Runtime claims: reproduce at the cited viewport with the same method the lens skill prescribes — Playwright for visual/state/a11y claims, and for performance numbers rerun the measurement against the production URL (e.g. `npx lighthouse http://localhost:3100/pricing --only-categories=performance --quiet`).
   - Spec claims: check against `design/tokens.json` / Figma variables and the shadcn/Radix source (two-source rule) — an agent asserting "the primitive should do X" without source is guessing.
   Mark unverifiable findings "unconfirmed" and say why; never silently promote them.
4. **Order** the merged report: P0 (ship blockers, including any performance-budget breach — budget fail = do not ship), then P1, then P2. Group by file within each severity.

## Step 5 — Report

Present ONE merged report to the user in chat (do not write a report file):

```
## Parallel review — {scope} ({N} lenses, {M} findings after dedup)
Lenses run: {only the lenses actually launched in Step 3}
Discarded for missing evidence: {count}

### P0 — blocks ship
- [tokens + a11y] components/site/Hero.tsx:42 — hardcoded `#7C3AED` on text,
  contrast 2.9:1. Fix: use the semantic token from design/tokens.json. (verified)

### P1 — fix before merge
...
### P2 — nice to have
...
### Verdict: SHIP / DO NOT SHIP (list blocking items)
```

Verdict rules: any P0 -> DO NOT SHIP. Performance over budget -> DO NOT SHIP. Then either fix P0/P1 items yourself in small verifiable steps (with evidence per fix) or hand the list to the user — ask which they want if not stated. If fixes touch `design/tokens.json` or `CLAUDE.md`, STOP — those are protected files requiring explicit user approval.

When the review (and any fixes plus re-verification) is finished, stop the servers you started in Step 1 so they don't squat on ports for the next session:

```bash
kill "$(cat /tmp/dev-server.pid)" 2>/dev/null
kill "$(cat /tmp/prod-server.pid)" 2>/dev/null   # only exists if the performance lens ran
```
