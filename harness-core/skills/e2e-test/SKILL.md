---
name: e2e-test
description: Generates and runs a Playwright E2E suite for a feature or page — five spec files (happy path, responsive, accessibility, dark mode, edge cases) across mobile/tablet/desktop projects with dark-mode emulation, then reports results with evidence. Use after a feature is implemented and before shipping, or whenever test coverage is requested. Triggers on "write e2e tests", "playwright tests", "generate tests for", "test suite for", "run the e2e suite", "add test coverage".
---

# E2E Test Suite — Generate & Run

Scope: one feature/page per invocation. Ask for the route(s) if not given. Never test against production — the config below runs the local dev server.

## Step 1 — Verify setup (run these, don't assume)

```bash
npx playwright --version
```

If that fails, these are new dependencies — **STOP and ask the user for approval first** (new-dependency rule in CLAUDE.md). On approval, install (dependencies + browsers):

```bash
pnpm add -D @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium
```

If Playwright IS present, still check `pnpm ls @axe-core/playwright` — `accessibility.spec.ts` needs it. Missing = a new dependency: **STOP and ask**, then `pnpm add -D @axe-core/playwright`.

Then check for config: `ls playwright.config.ts`.
- **Missing** → create it from the template in Step 2.
- **Exists** → read it. If it already has mobile/tablet/desktop projects, use it as-is. If it's missing pieces (no dark `colorScheme`, no `webServer`, wrong viewports), add only the missing pieces. If your changes would conflict with existing settings someone chose deliberately (different ports, extra projects, CI reporters), **STOP and ask the user** before editing.

## Step 2 — playwright.config.ts template

Complete and self-sufficient — `webServer` auto-starts the dev server, so no manual `pnpm dev` needed.

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1, // flake policy: one retry maximum — see Flake policy below
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    colorScheme: 'dark', // the intake default — run the suite in both schemes; both themes always ship
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile',  use: { viewport: { width: 360,  height: 800  }, isMobile: true, hasTouch: true } },
    { name: 'tablet',  use: { viewport: { width: 768,  height: 1024 }, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900  } } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

**STOP and ask the user** if the dev server fails to start within the timeout (paste the error output). Do not write tests against a server you haven't seen respond.

## Step 3 — Generate five spec files

Create `e2e/[feature-name]/` with exactly these five files. Use accessible locators (`getByRole`, `getByLabel`) — never CSS class selectors, they break on restyle.

### 1. `happy-path.spec.ts`
- Primary user flow works end-to-end
- Content renders (assert on real headings/text from the page, not placeholders)
- CTAs navigate to correct destinations
- Forms submit and show success state

### 2. `responsive.spec.ts`
- No horizontal scroll at 360px (pattern below)
- Navigation adapts (hamburger/sheet on mobile — check the shadcn primitive's actual behavior, don't invent it)
- Grid layouts reflow correctly per project
- The two standard widths the projects don't cover: inside this spec, `await page.setViewportSize({ width: 1024, height: 768 })` and `await page.setViewportSize({ width: 1920, height: 1080 })`, re-asserting layout at each — the house standard is all five viewports (360/768/1024/1440/1920), not just the three projects
- Tap targets ≥ 44×44px on mobile (pattern below)
- Images scale without distortion

### 3. `accessibility.spec.ts`
- axe WCAG 2.2 AA scan passes (pattern below)
- Tab order is logical; focus visible on all interactive elements
- ARIA labels on icon-only buttons
- Dialog focus trap works (only if the feature has a dialog)
- Reduced motion respected: `await page.emulateMedia({ reducedMotion: 'reduce' })`, then assert animations are disabled/instant

### 4. `dark-mode.spec.ts`
- Page renders dark by default (pattern below) — dark is primary, no theme toggle needed to get it
- No white flash on initial load: `await page.goto('/route', { waitUntil: 'domcontentloaded' })` and assert `getComputedStyle(document.body).backgroundColor` is already dark (same brightness check as the pattern below) before waiting for full load — a light value here means the dark class is applied client-side too late
- Expected colors come from `design/tokens.json` semantic tokens — assert "is dark", never a hardcoded hex
- If the page renders light in these tests: the theme is class-/localStorage-based (e.g. next-themes), so the config's `colorScheme: 'dark'` alone won't apply it — add `await page.addInitScript(() => localStorage.setItem('theme', 'dark'))` before `page.goto` (storage key per `docs/design-system.md`) and re-run; the no-white-flash assertion above is then only meaningful for the `prefers-color-scheme` path, so note that in the report

### 5. `edge-cases.spec.ts` — cover this menu, skip only what genuinely doesn't apply:
- Long text (200+ char strings in titles/inputs) doesn't break layout or overflow
- Empty states render correctly (no data, zero results)
- Error states display properly — force failures with `page.route('**/api/**', r => r.abort())` for failed submits, and `page.goto('/nonexistent-route')` for the 404 page
- Browser back button returns to the previous state
- Deep links: navigate directly to the feature URL in a fresh page — it resolves without going through the homepage

## Proven test patterns (use verbatim, adjust routes)

```typescript
// Every spec file starts with this import — test/expect are not globals:
import { test, expect } from '@playwright/test';

// axe — WCAG 2.2 AA (this one import is only needed in accessibility.spec.ts)
import AxeBuilder from '@axe-core/playwright';
test('meets WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/route');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

// no horizontal scroll at 360
test('no horizontal scroll on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/route');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(overflow).toBe(false);
});

// dark background (token-agnostic: asserts darkness, not a specific color)
test('renders dark by default', async ({ page }) => {
  await page.goto('/route');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const [r, g, b] = bg.match(/\d+/g)!.map(Number);
  expect((r + g + b) / 3).toBeLessThan(128);
});

// 44px tap targets
test('tap targets meet 44px minimum', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/route');
  for (const button of await page.getByRole('button').all()) {
    const box = await button.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
```

## Step 4 — Run

**Run suites as a background task** (Bash `run_in_background: true`, no `&`) so the session
keeps working — queue the next build or review while Playwright grinds, then collect results
when the task completes. Never report pass/fail before reading the finished output; a started
suite is not evidence. Foreground only when the user is waiting on this single answer.

```bash
npx playwright test e2e/[feature-name]/            # all three projects
npx playwright test e2e/[feature-name]/ --project=mobile
npx playwright test e2e/[feature-name]/ --ui       # interactive GUI — human-only, offer it, never run it yourself
npx playwright show-report                          # serves the HTML report in a browser and blocks — human-only, tell the user to run it
```

Replace `[feature-name]` with the actual directory name before running. Run the full suite headless first (`npx playwright test`) — the last two commands open interactive windows and are for the user, not for you. Paste the actual terminal output — never summarize a run you didn't execute. Machine-readable failure detail is already on disk in `test-results/` (screenshots, traces) — you don't need the HTML report to write the Step 5 report.

## Flake policy

- `retries: 1` in config is the maximum. Never raise it to make a suite pass.
- A test that fails then passes on retry is **flaky, not fixed**: debug it to root cause before moving on (usually a missing `await expect(...)` wait, animation timing, or a race with the dev server).
- Never delete, `.skip`, or `.fixme` a failing test to go green. If you cannot fix it this session, **STOP and report it to the user** as a known failure with your findings.

## STOP conditions

- Dev server won't start, or the target route 404s → STOP, paste the error, ask.
- A failure's real fix requires editing `design/tokens.json` or `CLAUDE.md` → STOP; these are protected files needing explicit user approval.
- A failure's fix requires new ARIA/keyboard behavior → check the shadcn/Radix primitive's actual source first (two-source rule); if the primitive doesn't cover it, ask.
- axe reports contrast violations → the fix is a token change, not a hardcoded color. STOP and ask.
- You need a new dependency beyond `@playwright/test` + `@axe-core/playwright` → STOP and ask (house rule).
- Committing the suite → never commit to `main` (repo convention). Use a feature branch, e.g. `feature/e2e-[feature-name]`, and only commit when the user asks.

## Step 5 — Report (evidence required)

```
## E2E Report: [feature-name]
Files created: e2e/[feature]/... (N tests total, list per file)
Results: mobile X/Y pass | tablet X/Y | desktop X/Y
Failures: [test name] — [one-line cause] — screenshot: test-results/<path>.png
Suggested fixes: [file:line → change, per failure]
Flaky (passed on retry): [list — each gets a root-cause debugging follow-up, none ignored]
```

Failure screenshots and traces land in `test-results/` automatically (config above). Reference their paths — a claim without a run log and screenshot paths is not a passing suite. For visual polish beyond functional checks, follow up with the `visual-qa` skill; before declaring done, run `verify-before-done`.


## Visual regression baselines

Approved screens become machine-checked baselines — unintended visual drift fails CI instead of relying on reviewer eyes (the automated twin of `visual-qa`'s judgment pass).

1. One `visual.spec.ts` per feature: `await expect(page).toHaveScreenshot('<screen>-<width>.png', { fullPage: true, maxDiffPixelRatio: 0.01 })` at 360 / 768 / 1440, dark mode (same contexts as the suites above).
2. **Baselines are created deliberately, never accidentally**: run `pnpm exec playwright test --update-snapshots` ONLY after the screen passed the ship gate — a baseline is an approval artifact. Commit the snapshots.
3. A CI diff failure means either a regression (fix the code) or an intentional redesign (re-run the gates, then update the baseline in the same PR — with the ship evidence cited in the commit message). Never update snapshots to silence a failure.
4. Mask genuinely dynamic regions (`mask: [locator]`) rather than raising the diff threshold — a loose threshold is a blind gate.
