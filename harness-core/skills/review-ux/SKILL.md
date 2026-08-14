---
name: review-ux
description: Reviews a built flow or screen for UX completeness across six lenses — state coverage, mobile fit, design-system adherence, accessibility, performance, and interaction quality — plus a conditional T.R.U.S.T. lens for AI surfaces, and outputs a states matrix plus findings backed by file:line evidence. Use after a flow is implemented or before shipping, when the user says "review this flow", "ux check", "review the ux", "what states am I missing?", "state coverage", or "is the flow complete?". (Completion-evidence claims route to verify-before-done; visual look routes to visual-qa.)
---

# Review a flow for UX completeness

Critical review pass. You produce findings, not fixes — do NOT edit any source file during this skill. Every finding needs evidence (file:line, screenshot path, or script output) or it gets dropped. Anything you could not verify at runtime is labeled **unverified** in the report, never asserted as fact.

## Step 0 — Scope

1. Identify the screens in the flow: read `docs/user-flows.md`, then map each screen to a route with `ls app` and `find app -type f -name 'page.tsx'` (in the Next.js App Router, each `page.tsx` path IS the route — `app/checkout/page.tsx` → `/checkout`).
2. Write down the list: route → main file(s). This list drives everything below.

**STOP and ask the user when:**
- You cannot tell which flow or screens are in scope.
- A screen requires auth, seeded data, or a completed prior step you cannot reach — ask how to get there instead of skipping silently.
- The scope is 4+ pages — recommend running this via the `parallel-review` skill (one reviewer per page, same checklist) instead of one serial pass.

## Step 1 — Gather runtime evidence (do this before judging anything)

Start the dev server and screenshot every screen at all five widths, **both themes — default first** (dark is the primary theme).

```bash
mkdir -p /tmp/ux-review
nohup pnpm dev > /tmp/ux-review/dev.log 2>&1 &   # nohup + log file: survives the shell exiting, and the port is readable
sleep 5
PORT=$(grep -m1 -oE 'localhost:[0-9]+' /tmp/ux-review/dev.log | cut -d: -f2); PORT=${PORT:-3000}
for i in $(seq 1 30); do curl -sf "http://localhost:$PORT" > /dev/null && echo "READY on $PORT" && break; sleep 2; done
echo "$PORT"
```

Shell variables do NOT persist between separate tool calls — note the echoed port number and write it literally into every URL below (shown as `<port>`).

```bash
cat > /tmp/ux-review/audit.mjs <<'EOF'
import { chromium } from 'playwright';
const url = process.argv[2];
const slug = url.replace(/[^a-z0-9]+/gi, '-');
const browser = await chromium.launch();
for (const width of [360, 768, 1024, 1440, 1920]) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: 'dark',
    hasTouch: width < 1024,
  });
  // Cover class-/localStorage-based dark themes too (next-themes) — colorScheme alone won't apply them:
  await ctx.addInitScript(() => localStorage.setItem('theme', 'dark'));
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // networkidle can hang on dev servers (HMR keeps sockets busy) — tolerate a miss, don't fail the run:
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const smallTargets = await page.evaluate(() =>
    [...document.querySelectorAll('a,button,[role="button"],input:not([type=hidden]),select,textarea')]
      .map(el => { const r = el.getBoundingClientRect();
        return { tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter(t => t.w > 0 && t.h > 0 && (t.w < 44 || t.h < 44)));  // both > 0: skip hidden/collapsed elements
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll('button, a')]
      .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label')
        && !el.getAttribute('aria-labelledby') && !el.querySelector('img[alt]'))
      .length);
  console.log(JSON.stringify({ url, width, overflow, smallTargets, unnamedControls: unnamed }));
  await page.screenshot({ path: `/tmp/ux-review/${slug}-${width}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
EOF
```

Run it once per route: `node /tmp/ux-review/audit.mjs "http://localhost:<port>/<route>"` (if `playwright` isn't installed but `@playwright/test` is, import from `@playwright/test` instead — don't add a dependency) — save every JSON line; those are your evidence for lenses 2 and 4. Open the first screenshot before reviewing any: if it rendered light, the theme wiring differs (check `docs/design-system.md` for the storage key or class) — adjust the init script and recapture; never review light screenshots when dark is the primary theme. If the server won't start or a route 500s, **STOP** — report the error to the user; do not review a broken build "from the code alone".

## Step 2 — Static evidence sweep

Run once for the whole flow (adjust paths to the files from Step 0):

```bash
# Token violations: hardcoded colors and arbitrary px (also flagged by the PostToolUse hook at write time)
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' app components --include='*.tsx' --include='*.css' | grep -v 'design/tokens'
grep -rnE '\[[0-9]+(\.[0-9]+)?px\]' app components --include='*.tsx'
# Images: every <Image usage must have a sizes prop — read each hit and check
grep -rn '<Image' app components --include='*.tsx'
# Client components: each one must justify itself (interactivity/hooks) — match both quote styles
grep -rlE "['\"]use client['\"]" app components
# Reduced-motion gating: any animation/transition must have a motion-reduce/prefers-reduced-motion counterpart
grep -rnE 'animate-|transition-|motion/' app components --include='*.tsx'
grep -rnE 'motion-reduce|prefers-reduced-motion' app components
# Container queries vs viewport breakpoints in reusable components
grep -rnE '@container|@sm:|@md:' components
# Fluid type: clamp() usage per the scale in docs/design-system.md
grep -rn 'clamp(' app components --include='*.tsx' --include='*.css'
# Safe areas near fixed headers / bottom CTAs
grep -rnE 'safe-area|env\(safe' app components
```

## Step 3 — The six lenses

Work through in order. Each checked item cites evidence; each failure becomes a "Needs work" entry with file:line.

### 1. State coverage → produce the states matrix (REQUIRED output)

For every screen, read its page + data components and trace: what renders when data is empty / loading / errored / succeeded / extreme (long text, slow network, denied permission, returning mid-flow)? Trigger states at runtime where possible (e.g. Playwright with `page.route('**/api/**', r => r.abort())` for error, `r => new Promise(()=>{})` for perpetual loading, throttling, or empty fixture data).

The matrix is mandatory — the report is incomplete without it:

| Screen | Empty | Loading | Error | Success | Edge |
|---|---|---|---|---|---|
| /checkout | present (page.tsx:41) | present (loading.tsx) | MISSING | present | unverified |

Cells are `present (file:line)`, `MISSING`, `n/a (reason)`, or `unverified (why you couldn't reach it)`.

### 2. Mobile fit — from Step 1 output, not from reading code

- [ ] `overflow` is 0 at width 360 for every screen (no horizontal scroll)
- [ ] `smallTargets` is empty — every interactive element ≥ 44×44px; primary CTAs 44–52px tall
- [ ] Reusable components respond via `@container` queries; viewport breakpoints (`sm:`/`md:`) appear only in page-level layout
- [ ] Fluid type uses `clamp()` per the scale in `docs/design-system.md` (Step 2 clamp grep — fixed px headings that should scale are findings)
- [ ] Safe-area insets handled on fixed headers and bottom CTAs (Step 2 grep)
- [ ] Compare the 360 / 768 / 1024 / 1440 / 1920 screenshots — layout is intentional at each, not desktop-squished

### 3. Design-system adherence

- [ ] Step 2 color/px greps return zero hits in flow files — token-only styling from `design/tokens.json`
- [ ] Composed from existing components (`design/components.md`, `components/ui/`, `components/site/`) — no inline reinvention
- [ ] Typography uses the project type scale defined in `docs/design-system.md` (never name-check fonts from memory — this repo is a template)
- [ ] Two-source rule: if judging hover/focus/keyboard/aria behavior, diff against the shadcn/Radix primitive's actual source in `components/ui/` — never against what you assume the primitive does. Visual specs trace to Figma-mapped tokens, never eyeballed from screenshots.

### 4. Accessibility quick check — WCAG 2.2 AA baseline per `design/accessibility.md` (deep audit = `a11y-audit` skill; note in report if it should run)

- [ ] `unnamedControls` is 0 in Step 1 output (buttons/links have accessible names)
- [ ] Every form input has an associated label — placeholder is not a label
- [ ] Status/feedback never uses color alone (icon or text alongside)
- [ ] Focus visible: tab through each screen in Playwright (`page.keyboard.press('Tab')` + screenshot) — `focus-visible` ring intact, not stripped
- [ ] Async updates announced via `aria-live` / `role="status"` (grep the flow files)
- [ ] Animations gated on `prefers-reduced-motion` (Step 2 grep — every animation, no exceptions)

### 5. Performance quick check (full budget check = `performance-check` skill)

Budget (from `docs/tech.md`): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1, JS first-load < 150KB gzipped.

- [ ] Every `<Image` has a `sizes` prop and reserved dimensions (CLS budget)
- [ ] `'use client'` only where interactivity requires it — flag data-only client components (JS first-load budget)
- [ ] No long synchronous work in event handlers (INP budget) — read the handlers in flow files
- [ ] If anything looks heavy, say "run performance-check" — do not assert budget pass/fail without measuring. Budget fail = do not ship.

### 6. Interaction quality

- [ ] Every action gives visible feedback within ~100ms (press state, spinner, optimistic update)
- [ ] Errors say what happened AND what to do next — no bare "Something went wrong"
- [ ] Success confirms completion and suggests the next step
- [ ] Back always works: at each step of the flow, call `page.goBack()` in Playwright and screenshot — no trapped states, no lost form input, no redirect loop back to where you came from
- [ ] No anti-patterns from `docs/ux-principles.md` (hover-only reveals, color-only status, "Submit" CTAs, modal-on-load…)

### 7. T.R.U.S.T. — conditional lens, only when the flow contains AI output or AI-driven actions

Skip entirely for non-AI features (say "no AI surfaces — lens 7 skipped"). Otherwise run the review checklist at the end of `docs/trust-scaffolding.md` against every AI surface in the flow: stakes tier stated → role label present → boundary statement → provenance inspectable → confidence honest → override + undo reachable → failure/refusal states designed → repair loop exists. Any unchecked item at Medium+ stakes is a finding, evidenced like all others (file:line or screenshot).

## Step 4 — Report

Kill the dev server: `lsof -ti:<port> | xargs kill` — use the port echoed in Step 1 (its output stays in `/tmp/ux-review/dev.log` if you need it). Then output exactly this structure:

1. **States matrix** (the table from lens 1)
2. **Strong** — 2–3 specific things that work, with file or screenshot evidence
3. **Needs work** — one line each: `file:line — what's wrong — concrete fix`. No file:line or runtime evidence = drop the finding. Could not verify = prefix `unverified:` and say what blocked verification.
4. **Decisions for the designer** — genuine UX calls (tradeoffs, flow-order questions, copy tone), not fixes you could make. Never decide these yourself.

No generic "consider improving X" — be specific or omit. Do not fix anything as part of this skill; if the user wants fixes applied afterward, that is a new task on a `feature/` branch (never `main`), and `design/tokens.json` / `CLAUDE.md` need explicit user approval to touch.
