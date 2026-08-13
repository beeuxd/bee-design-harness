---
name: performance-check
description: Runs the performance gate before any page ships — builds production, measures route bundle sizes and Lighthouse Core Web Vitals against the project budget, audits images/fonts/JS/CLS/INP, and reports Pass/Warning/Fail per metric with the offending file and fix. Use before shipping any page, after adding heavy assets (video, large images, animations), or as part of /ship. Triggers: "check performance", "run Lighthouse", "is this fast", "perf check", "bundle size", "optimize this page".
---

# Performance Check

Gate rule: **any budget fail = do not ship.** Report evidence (actual numbers), never claims. "Compiles" does not mean "fast".

## Budget

| Metric | Budget | Measured by |
|--------|--------|-------------|
| LCP | <= 2.5s (mobile) | Lighthouse |
| INP | <= 200ms | Field metric — TBT is the lab proxy (see below) |
| CLS | <= 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |
| JS first-load | < 150KB gzipped | `pnpm build` output, per route |
| Total first-load | < 400KB | `pnpm build` output + Lighthouse network summary |

**INP replaced FID (March 2024).** It measures every interaction over the whole page lifecycle. Lighthouse cannot measure INP without real user interactions — treat TBT < 200ms as the lab pass condition, plus the code-level INP audit below.

## Step 1 — Production build + bundle sizes

```bash
cd "<project root>" && pnpm build
```

- If the build fails: STOP the perf check, report the build error. Do not audit a broken build.
- In the route table, read the **"First Load JS"** column — that is the gzip-compressed JS shipped on first load for each route. Compare it directly against **150 kB**.
- Routes between 130–150 kB = **Warning**. Any route > 150 kB = **Fail** (record the route path and the number).
- "First Load JS shared by all" counts toward every route — if it alone is near 150 kB, the problem is a global import in `app/layout.tsx` or a heavy shared dependency.

## Step 2 — Lighthouse (headless CLI, no extensions, no manual DevTools)

Lighthouse must run against a **production server**, never `pnpm dev`.

Start the production server as a **background process** (it blocks the shell if run in the foreground — use your background-execution option, or append `&`), then poll until it responds; the server takes a few seconds to boot:

```bash
pnpm start &          # serves the build on :3000; must run in the background
for i in $(seq 1 30); do curl -sf http://localhost:3000 > /dev/null && echo READY && break; sleep 1; done
```

If `READY` never prints after 30s, STOP and report the server logs. If port 3000 is busy, use `pnpm start -- -p 3001` and adjust the URL everywhere below. Then, for the home page **and every route changed in this branch** — changed routes = `git diff main --name-only` (if the default branch isn't `main`, diff the actual default: `git remote show origin | grep 'HEAD branch'`); files under `app/**/page.tsx` map directly to routes, and for changed component files grep which pages import them (`grep -rln "<ComponentName>" app/`). If still ambiguous, ask the user which routes to measure:

```bash
npx --yes lighthouse http://localhost:3000/<route> \
  --only-categories=performance \
  --chrome-flags='--headless=new' \
  --output=json --output-path=/tmp/lh-<route-name>.json --quiet
```

Substitute both placeholders: for `/pricing` use URL `http://localhost:3000/pricing` and output `/tmp/lh-pricing.json`; for the home page use URL `http://localhost:3000/` and output `/tmp/lh-home.json`. For nested routes, replace `/` with `-` in the filename (`/blog/post` → `lh-blog-post.json`).

(`npx --yes` downloads lighthouse into the npx cache on first run and skips the "Ok to proceed?" prompt that would otherwise hang a non-interactive shell. It is a one-off runner — nothing is added to `package.json`, so the new-dependency approval rule does not apply.)

Lighthouse defaults to mobile emulation + throttling — do not pass `--preset=desktop`. Read the results:

```bash
node -e "
const r = require('/tmp/lh-<route-name>.json');
const a = r.audits;
console.log('Perf score:', r.categories.performance.score * 100);
console.log('LCP ms:', a['largest-contentful-paint'].numericValue.toFixed(0), '(budget 2500)');
console.log('CLS:', a['cumulative-layout-shift'].numericValue.toFixed(3), '(budget 0.1)');
console.log('TBT ms:', a['total-blocking-time'].numericValue.toFixed(0), '(budget 200)');
console.log('Total bytes:', a['total-byte-weight'].numericValue, '(budget 409600)');
"
```

Field-to-budget mapping: `largest-contentful-paint` → LCP, `cumulative-layout-shift` → CLS, `total-blocking-time` → TBT (lab proxy for INP), `total-byte-weight` → total first-load.

- If Chrome is unavailable in this environment: STOP, report which steps ran and ask the user to provide a preview URL (e.g., Vercel) — then run the same `npx lighthouse` command against that URL. Never report Lighthouse numbers you did not measure.
- Kill the `pnpm start` process when done: `lsof -ti:3000 | xargs kill 2>/dev/null || true` (use the actual port if you changed it).

## Step 3 — Code audits (grep-first, then read flagged files)

The greps below assume `app/` and `components/` at the repo root. Check with `ls -d app components src 2>/dev/null` first and substitute the dirs that actually exist (e.g. `src/app src/components`).

### INP audit — most sites fail this

- [ ] No synchronous layout reads (`offsetHeight`, `getBoundingClientRect`) inside event handlers that also write styles
- [ ] Non-urgent state updates wrapped in `startTransition` / `useDeferredValue`
- [ ] No blocking `await` inside click handlers — use optimistic updates, fire-and-forget with error rollback
- [ ] Handlers complete in < 200ms; long tasks split (`startTransition`, `requestIdleCallback`)

```bash
grep -rl "onClick\|onChange\|onSubmit" app components --include='*.tsx'
```
Read each flagged client component and check the four rules above.

### Image audit — `sizes` is the single biggest common win

```bash
grep -rn "<img" app components --include='*.tsx'          # should be empty — next/image only
grep -rn "priority" app components --include='*.tsx'      # inspect each hit; count only next/image `priority` props — at most ONE per page: the above-fold LCP image
grep -rl "<Image" app components --include='*.tsx'        # then verify each has width, height, AND sizes
find public -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.gif' \) -size +200k -exec ls -lh {} \;
```

- [ ] Every `<Image>` has explicit `width`, `height`, and an **accurate `sizes`** prop (e.g. `(max-width: 768px) 100vw, 33vw` for a 3-col grid) — without `sizes`, the browser downloads the largest srcset variant
- [ ] `priority` only on the above-fold LCP image; nothing below the fold has it
- [ ] AVIF/WebP served (next/image default) — flag any raw `.png`/`.jpg` over 200KB as Fail

### Font audit

- [ ] Fonts loaded via `next/font` only; zero hits for `fonts.googleapis` / external font `<link>` tags (`grep -rn "fonts.googleapis\|fonts.gstatic" app components`)
- [ ] Only weights actually used are subset — cross-check loaded weights against `docs/design-system.md` (the project's font spec lives there, not in this skill)

### JS audit

- [ ] Server components by default — `grep -rlE "['\"]use client['\"]" app components` (matches both quote styles) and justify each hit against the decision tree in `docs/tech.md`
- [ ] No unused dependencies: `npx depcheck` (report only; do not remove deps without approval — removing/adding a dependency requires asking the user per CLAUDE.md)
- [ ] Third-party scripts use `next/script` with `strategy="lazyOnload"` or `afterInteractive` — never bare synchronous `<script>`
- [ ] Heavy below-fold sections lazy-loaded via `next/dynamic`

### CLS audit

- [ ] Every image and iframe has reserved space (width/height or `aspect-ratio`)
- [ ] Fonts use `next/font` automatic fallback metrics (no FOUT reflow)
- [ ] Dynamic/async content (banners, embeds) renders into pre-reserved space
- [ ] Animations translate/scale only — no animating `height`/`top`/`margin`; all motion gated on `prefers-reduced-motion`

## Fix priority when a budget fails

Apply in order, re-run Step 1–2 after each fix, stop as soon as budgets pass:

1. Compress / resize oversized images (target < 200KB each)
2. Add or correct the `sizes` prop on `next/image` (often the biggest single win)
3. Remove unused dependencies (STOP and ask the user first)
4. Convert client components to server components where the decision tree allows
5. Lazy-load below-fold heavy sections with `next/dynamic`
6. Break up long tasks for INP (`startTransition`, `requestIdleCallback`)
7. STOP: discuss cutting the feature with the user. Never silently degrade the design to pass.

## STOP and ask the user when

- A fix requires adding, removing, or swapping a dependency
- A fix would change `design/tokens.json` or `CLAUDE.md` (protected files — PreToolUse hook blocks them anyway)
- A fix would visibly change the design (removing an animation, dropping an image, cutting a section)
- Budgets still fail after fixes 1–6
- Lighthouse cannot run locally and no preview URL exists

## Output format

One row per metric per audited route, with evidence:

```
Route: /pricing
  PASS  JS first-load    128 kB  (budget 150 kB, from pnpm build)
  WARN  LCP              2310 ms (budget 2500 ms — within 10%, monitor)
  FAIL  CLS              0.18    (budget 0.1)
        Cause: public/hero-team.jpg rendered without width/height in components/site/hero.tsx:42
        Fix: add width/height + sizes; reserve space with aspect-ratio
```

- **Pass** — met budget; state the measured number
- **Warning** — met budget but within 10% of it (for JS first-load, the 130–150 kB band from Step 1); flag for monitoring
- **Fail** — over budget; name the specific asset or file, the cause, and the fix applied or proposed

Run alongside `review-ux`, `a11y-audit`, and `design-system-audit` when invoked via `/ship`.
