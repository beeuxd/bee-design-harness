---
name: ship
description: Runs the pre-ship quality gate on a page, feature, or PR diff — fans out parallel lens reviews (a11y, performance, tokens, UX states, visual QA), a deterministic anti-slop detector, and a taste gate, then returns one honest SHIP / NO-SHIP verdict with evidence. Use when work is claimed finished and needs a go/no-go before merge. Triggers on "ship it", "ready to ship?", "pre-ship check", "can we merge this", "final review before merge", "run the ship gate". (A multi-lens audit without a merge verdict is parallel-review; evidence for a single task's "done" claim is verify-before-done.)
---

# Ship — the pre-ship quality gate

One verdict: SHIP or NO-SHIP. Never anything in between. This skill aggregates every quality lens into a single honest call. It never merges anything itself.

## Step 0 — Pin the scope

1. Scope is one of: a **page** (URL/route), a **feature** (routes + components), or a **PR diff** (`git diff main...HEAD --stat`). If the user did not say which, STOP and ask — do not guess.
2. Preconditions, in order:
   ```bash
   git branch --show-current   # must be feature/*; if "main", STOP — never ship from main.
                               # Ask the user before creating feature/<short-description>.
   pnpm build                  # must pass; red build = STOP, fix first. "Compiles" is still not "renders".
   ```
3. Check the taste layer exists:
   ```bash
   ls docs/design-system.md design/taste-rules.md design/references/ 2>&1
   ```
   - `docs/design-system.md` missing, or present but with **no written art direction section** → **hard NO-SHIP**. Tell the user to run the `art-direction` skill first, then re-run `/ship`. Do not proceed to reviews.
   - `design/taste-rules.md` missing → note "no standing taste rules yet (taste-retro creates this)" in the report and continue; the taste gate then checks art direction only.
   - `design/references/` missing or empty → soft finding: the build cannot cite references per section.

## Step 1 — Fan out the lens reviews (via `parallel-review`)

Run the `parallel-review` skill end to end — it owns server startup, agent contracts, evidence discarding, dedup, and adversarial spot-checks. Non-negotiables for this invocation:

- Lenses, each executing its library skill: `a11y-audit`, `performance-check`, `design-system-audit`, `review-ux`, `visual-qa`. If user-facing copy changed in scope — check `git diff main...HEAD` for string changes in components/pages; if the scope is a page/feature with no branch diff to inspect, ask the user whether copy changed rather than guessing — then: if the role-copywriter plugin is installed, add its `ux-copy-review` lens; otherwise flag copy review as a human follow-up in the report. If the scope contains AI-generated output or AI-driven actions, `review-ux`'s T.R.U.S.T. lens (checklist in `docs/trust-scaffolding.md`) is in play — its Medium+-stakes findings land in the gate table below.
- Performance lens measures the **production build** (`pnpm start`), never the dev server.
- Visual lenses verify **both themes** (default first) at 360 / 768 / 1024 / 1440 / 1920px via Playwright.
- Every finding needs file:line or a measured value (e.g. "LCP 3.1s at /pricing, 360px"); findings without evidence are discarded — that is parallel-review's contract, hold it to it.
- Point agents at `design/tokens.json`, `docs/design-system.md`, `design/accessibility.md` for truth. Never paste font names or hex values into prompts — this is a template repo; values live in those files.

Keep the merged P0/P1/P2 list; Step 4 maps it onto gates.

## Step 2 — Deterministic anti-slop detector (bonus gate)

```bash
npx --yes impeccable detect; echo "exit: $?"
```

- Exit 0 → record "impeccable: pass".
- Non-zero exit → treat the output as findings; list each one verbatim in the report (these are 45 machine-checked, non-LLM rules — do not paraphrase or second-guess them).
- Command not found, network error, or the tool itself crashes → say so honestly in the report ("impeccable unavailable: <error>") and continue. This is a bonus gate, never a blocker, and never a silent skip.

## Step 2b — Security lens

1. `pnpm audit --prod --audit-level high; echo "exit: $?"` — non-zero → each advisory is a finding.
2. Secrets sweep over the diff/scope: `git diff main...HEAD | grep -inE "(api[_-]?key|secret|token|password)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}" || echo "secrets: clean"` — any hit is a finding (rotate, don't just delete).
3. If the scope touches auth, sessions, file upload, payments, or PII: walk it against a minimal checklist — inputs validated server-side, authz checked on every route (not just UI), no PII in logs/URLs/analytics, third-party embeds approved (house rule). Each miss is a finding with file:line.
4. This lens is scoped, not a pentest — say plainly what it did not cover.

## Step 3 — Taste gate

1. Read `docs/design-system.md` (the art direction) and `design/taste-rules.md` (standing taste rules, if present).
2. Walk the in-scope screens against both, section by section, using the dark-mode Playwright screenshots the `visual-qa` lens produced in Step 1 (do not judge from memory; if a screen has no screenshot, capture one the same way before judging it). Every violated rule is a finding formatted as: `[taste] <rule quoted> — <file:line or URL+viewport> — <what violates it>`. No file:line or screenshot evidence = not a finding.
3. Check that the build cites which reference in `design/references/` each major section follows (the `from-figma` output or the feature's design spec should contain this). Missing citations = soft finding.

## Step 4 — Aggregate into the verdict table

Classify every finding into a gate:

| Gate | Type | Fails when |
|---|---|---|
| WCAG 2.2 AA | HARD | Any AA violation (contrast, keyboard, semantics, focus, reduced-motion, tap targets < 44x44px) |
| Performance budget | HARD | LCP > 2.5s, INP > 200ms, TBT ≥ 200ms, CLS > 0.1, or JS first-load ≥ 150KB gzipped (production build, mid-tier mobile throttling — the budget in `docs/tech.md`) |
| Token compliance | HARD | Any hardcoded color/spacing/type value not from `design/tokens.json` in shipped code |
| State coverage | HARD | A shipped screen missing loading/empty/error/hover/focus/disabled state |
| 360px integrity | HARD | Horizontal scroll at 360px |
| Art direction exists | HARD | `docs/design-system.md` has no written art direction (caught in Step 0) |
| T.R.U.S.T. (AI surfaces only) | HARD | Any unchecked `docs/trust-scaffolding.md` checklist item at Medium+ stakes on an AI surface in scope (no AI in scope → gate auto-passes, note "n/a") |
| Security | HARD | Any high+ dependency advisory, exposed secret, or auth/PII checklist miss in scope (Step 2b) |
| Taste rules | SOFT | Any Step 3 taste-rule finding |
| Impeccable | SOFT | Any Step 2 finding |

Rules:
- **Any hard gate fails → NO-SHIP.** No exceptions, no "ship with caveats", no softening because the user seems eager. The user may explicitly overrule and merge anyway — that is their call — but this report's verdict stays NO-SHIP.
- **Soft gates do not block**, but every soft finding must be listed and **explicitly acknowledged by the user** before the gate reads "pass (acknowledged)". Unacknowledged soft findings → present them and ask; do not auto-pass.

## Step 5 — Report

Output exactly this shape in chat (no report files):

```
## Ship Report: <scope>

### Verdict: SHIP / NO-SHIP

| Gate | Result | Evidence |
|---|---|---|
| WCAG 2.2 AA        | PASS/FAIL | e.g. axe: 0 violations across 5 routes / Button.tsx:23 contrast 2.9:1 |
| Performance budget | PASS/FAIL | LCP 1.8s, INP 90ms, TBT 120ms, CLS 0.02, JS 128KB gz (prod, /route) |
| Token compliance   | PASS/FAIL | design-system-audit: 0 hardcoded values / Hero.tsx:42 `#7C3AED` |
| State coverage     | PASS/FAIL | review-ux matrix complete / Settings page missing error state |
| 360px integrity    | PASS/FAIL | Playwright: no horizontal scroll, 5 viewports, dark mode |
| Art direction      | PASS/FAIL | docs/design-system.md §Art direction present |
| Taste rules        | pass / N findings (need acknowledgment) | quoted rule + file:line each |
| Impeccable         | pass / N findings / unavailable: <reason> | verbatim tool output |
```

- **SHIP**: state that branch `feature/<name>` is ready for the **user** to merge. Never run `git merge`, never push to main, never open-and-merge a PR yourself. Offer to open a PR with `gh pr create` if asked.
- **NO-SHIP**: append an **ordered fix list** — hard-gate failures first, ordered by severity, each as `N. <file:line> — <issue> — <exact fix: token name, code change, or command>`. Fix (or hand off) the list, then **re-run `/ship` from Step 0** — a partial re-check is not a verdict. If any fix touches `design/tokens.json`, `CLAUDE.md`, or `.claude/settings.json`, STOP for user confirmation first (protected files, PreToolUse hook).
- Stop any servers parallel-review started (its Step 5 kill commands).

## Stop-and-ask conditions (summary)

- Scope ambiguous (page vs feature vs diff) → ask.
- On `main` → ask before branching.
- Build red → report the error, fix before any review.
- Art direction missing → route to `art-direction`, do not review.
- Soft findings unacknowledged → ask, do not auto-pass.
- Fix touches protected files → user confirmation first.
