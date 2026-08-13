---
name: a11y-audit
description: Runs a WCAG 2.2 AA accessibility audit on pages or components — automated lint and axe-core Playwright scans first, then keyboard, semantics, contrast, motion, and tap-target verification — and reports Pass/Warning/Fail with file:line and a concrete fix per failure. Use before shipping any page or section, after finishing any motion-heavy component, or as the a11y step of /ship. Triggers: "check accessibility", "a11y audit", "is this accessible", "wcag check", "run axe", "accessibility review".
---

# Accessibility Audit — WCAG 2.2 AA

Full standard: `design/accessibility.md`. Evidence over claims: every Pass needs command output, a screenshot, or a file:line reference. "Compiles" does not mean "renders", and "renders" does not mean "accessible".

## 0. Scope and preconditions

1. Determine target routes. If the user didn't specify, audit pages touched on the current branch (`git diff main --name-only`; if the repo's default branch isn't `main`, diff against the actual default: `git remote show origin | grep 'HEAD branch'`). Changed files under `app/**/page.tsx` map directly to routes; for changed component files, find the routes that import them (`grep -rln "<ComponentName>" app/`). If still ambiguous, **STOP and ask** which routes to audit.
2. Start the dev server (`pnpm dev`, run in background) and confirm each route returns 200: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/<route>`. If the dev server logs a different port, substitute it in every URL in this skill. **STOP** if the build is broken or routes 404 — do not audit a broken build.
3. Check the dependencies: `pnpm ls @axe-core/playwright @playwright/test`. If either is missing, **STOP and ask** for approval to add it (new-dependency rule in CLAUDE.md). On approval: `pnpm add -D @axe-core/playwright` (and, if Playwright itself is absent, set it up per Step 1 of the `e2e-test` skill, including `npx playwright install chromium`). Never use a browser extension — extensions require a human; this must run headless.
4. Dark mode is the primary theme — audit dark first. Check `docs/design-system.md` for how dark mode is applied (class on `<html>` vs `prefers-color-scheme`). If class-based (e.g. next-themes), `test.use({ colorScheme: 'dark' })` alone will NOT apply it — force it in the spec before navigation, e.g. `page.addInitScript(() => localStorage.setItem('theme', 'dark'))` (next-themes reads that key; check `docs/design-system.md` for the storage key this project uses). Then verify it actually rendered dark before trusting any contrast result: `await expect(page.locator('html')).toHaveClass(/dark/)` or screenshot the page and look.

## 1. Automated gates (run first)

### 1a. Lint
Run `pnpm lint`. Any `jsx-a11y` error = **Fail** with file:line. Zero errors before continuing.

### 1b. axe scan — the real gate
Lighthouse's accessibility score is a weak proxy: it runs a subset of axe and 100/100 does not mean accessible. Do not report it as the gate. The gate is a full axe scan via `@axe-core/playwright`.

Find the Playwright test dir (`testDir` in `playwright.config.ts`; default `e2e/`). If there is no `playwright.config.ts`, create one from the template in Step 2 of the `e2e-test` skill first. Confirm the config sets `use: { baseURL: 'http://localhost:3000' }` (matching the actual dev port) — the spec below navigates with relative routes and `page.goto('/')` throws without a baseURL. Write `a11y.spec.ts` there:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/']; // <-- replace with the routes under audit
const VIEWPORTS = [
  { width: 360, height: 800 },   // mobile-first: this one must pass
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]; // the full house standard — all five, every time (CLAUDE.md)

test.use({ colorScheme: 'dark' }); // dark is the primary theme
// Class-based theme (e.g. next-themes)? colorScheme alone will NOT apply it (Step 0.4) — uncomment and set the project's storage key:
// test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem('theme', 'dark')); });

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`axe ${route} @ ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();
      for (const v of results.violations) {
        console.log(`[${v.impact}] ${v.id}: ${v.help} (${v.helpUrl})`);
        for (const n of v.nodes) console.log(`  ${n.target} — ${n.failureSummary}`);
      }
      expect(results.violations).toEqual([]);
    });
  }
}
```

Run: `pnpm exec playwright test a11y.spec.ts --reporter=list`

- Every violation = **Fail**. Map each reported selector back to source (grep the class/testid/text) and report file:line + fix.
- Fix, re-run, repeat until zero violations at all five viewports. Paste the final passing output as evidence.
- If the project also ships light mode, re-run with `colorScheme: 'light'`.
- Keep the spec committed as a regression gate (see `e2e-test` skill) — do not delete it after the audit. Commit it on the current feature branch, never directly to `main` (repo convention).
- axe cannot judge text over gradients or images — handle those in step 5.

### 1c. Reduced-motion render
For each route, add a test to the same `a11y.spec.ts`, wrapped in a `test('reduced-motion <route>', async ({ page }) => { ... })` block like the ones in 1b. One viewport is enough — set `await page.setViewportSize({ width: 1440, height: 900 })` first (reduced-motion rendering is not width-dependent). `name` is the route slug (`home` for `/`, otherwise the route with `/` replaced by `-`); write screenshots to `.qa/` (scratch dir — never commit it):

```ts
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(route);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `.qa/a11y-rm-${name}.png`, fullPage: true });
```

Open each screenshot and look at it. All content must be visible in its final static state. Elements stuck at `opacity: 0` waiting for an entrance animation = **Fail** — this is the most common failure with GSAP/Motion entrance animations (the fix: gate the animation behind a `prefers-reduced-motion` check so content renders in its final state; role-designer's animate/review-animations skills cover the pattern).

### 1d. Tap-target probe
Add another test to the same spec with `page.setViewportSize({ width: 360, height: 800 })`, then measure every interactive element:

```ts
const small = await page.evaluate(() =>
  [...document.querySelectorAll('a,button,[role="button"],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .map((el) => { const r = el.getBoundingClientRect();
      return { html: el.outerHTML.slice(0, 80), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((t) => t.w > 0 && t.h > 0 && (t.w < 44 || t.h < 44))
);
console.log(JSON.stringify(small, null, 2));
expect(small).toEqual([]);
```

House standard is 44x44px minimum (stricter than WCAG 2.2's 24px), primary CTAs 44–52px tall, >=8px gap between adjacent targets. Anything smaller = **Fail**, except inline links inside a sentence (2.5.8 exception) = **Warning**. Fix by expanding padding or pseudo-elements — sizes come from the token scale in `design/tokens.json`, never arbitrary px.

## 2. Keyboard (verify with Playwright + source, never assume)

Probe with Playwright — add this as another test in the same `a11y.spec.ts`, one per route, at 1440×900 (re-run at 360×800 if navigation collapses into a different widget on mobile). Loop `page.keyboard.press('Tab')` (30–50 presses or until focus cycles back to the first stop), and after each press record the focused element and its focus styling:

```ts
const stop = await page.evaluate(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40),
    outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0,
    boxShadow: s.boxShadow !== 'none' };
});
```

`outline: false` AND `boxShadow: false` on a focused element = likely invisible focus = **Fail** (confirm visually). Computed styles can lie about visibility (e.g. outline color matching the background), so also screenshot 3–4 focus stops on dark surfaces (`page.screenshot()` into `.qa/`) and look at them.

- [ ] Tab order is logical and matches visual order
- [ ] Focus visible at every stop — including against dark surfaces
- [ ] No traps; focus can always move on
- [ ] Skip link present to bypass navigation
- [ ] Escape closes dialogs/sheets/popovers; focus returns to the trigger
- [ ] Enter/Space activate buttons; Enter follows links
- [ ] Arrow keys work inside composite widgets (tabs, menus, radio groups)

Two-source rule: keyboard/focus/aria behavior must come from the shadcn/Radix primitive's actual source, never invented. If a widget's keyboard handling was hand-rolled, diff it against the Radix source and the W3C APG pattern — mismatch = **Fail**.

## 3. Semantics and forms (read the rendered HTML and the source)

- [ ] Exactly one `<h1>`; heading levels never skip (h1 -> h2 -> h3)
- [ ] Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Buttons are `<button>`, links are `<a href>` — no `<div onClick>`
- [ ] Every input has a visible `<label>` (placeholder is not a label)
- [ ] Required fields indicated in text, not asterisk color alone
- [ ] Errors identify the field, say how to fix, announced via `aria-live`/`aria-describedby`
- [ ] Lists are `<ul>`/`<ol>` + `<li>`; `autocomplete` attributes where applicable

## 4. Images and media

- [ ] Meaningful images: descriptive `alt`. Decorative: `alt=""`
- [ ] Meaningful SVGs: `<title>` or `aria-label`
- [ ] Videos have captions; audio has transcripts; no autoplay with sound

## 5. Color and contrast

- axe (1b) covers flat-color text. For text over a **gradient**: don't sample pixels — read the gradient's color stops from the source (the CSS/token values in code) and take the worst-case stop behind the text (lightest stop under light text, darkest under dark text). For text over a **photo/image**: get the worst-case pixel programmatically in the live page — `page.evaluate` draws the image into a `<canvas>` and reads `getImageData` over the text's bounding box, taking the extreme luminance (never eyeball a hex from a screenshot). Then compute the WCAG contrast ratio with a small inline Node script — ratio = (L1 + 0.05) / (L2 + 0.05) where L1/L2 are the higher/lower WCAG relative luminances of the two colors (formula in `design/accessibility.md`; a 10-line script, no new dependency needed). Thresholds: body 4.5:1; large text (24px+ regular / ~18.7px+ bold) 3:1; UI components and focus rings 3:1 against adjacent colors.
- Focus ring must be visible on every background it can appear on — verify on dark surfaces specifically.
- Never rely on color alone (state, errors, links inside prose).
- All color fixes go through tokens in `design/tokens.json` mapped from Figma variables (two-source rule — never eyeball a hex from a screenshot). `design/tokens.json` is protected: **STOP and get user approval** before changing it (see `design-tokens-sync`).

## 6. Motion

- [ ] Reduced-motion evidence from 1c is clean
- [ ] Nothing flashes more than 3 times per second
- [ ] Durations match `docs/design-system.md`; `transform`/`opacity` only (see `performance-check`)

## 7. WCAG 2.2-specific criteria

- [ ] **2.4.11 Focus Not Obscured** — with sticky headers/footers, scroll so a focused element sits near the edge and screenshot: it must be at least partially visible, never fully under the sticky bar
- [ ] **2.5.7 Dragging Movements** — every drag interaction has a single-pointer alternative (buttons, tap targets)
- [ ] **2.5.8 Target Size** — covered by 1d at the stricter 44px house standard
- [ ] **3.3.7 Redundant Entry** — never re-ask for info already entered this session
- [ ] **3.3.8 Accessible Authentication** — no cognitive tests; paste allowed in auth fields (no `onPaste` preventDefault)

## 8. Zoom and reflow

Add one more test to `a11y.spec.ts` per route at 320px width (equivalent to 400% zoom on 1280 — WCAG 1.4.10):

```ts
await page.setViewportSize({ width: 320, height: 800 });
await page.goto(route);
await page.waitForLoadState('networkidle');
const overflow = await page.evaluate(
  () => document.scrollingElement.scrollWidth - window.innerWidth
);
expect(overflow, `horizontal overflow of ${overflow}px at 320px width`).toBeLessThanOrEqual(0);
```

Content must reflow to one column with no horizontal scroll. Overflow > 0 = **Fail** — find the offending element by walking the DOM for `getBoundingClientRect().right > window.innerWidth` and report its file:line.

## 9. What this audit CANNOT verify — required human follow-up

Do not silently skip these and do not claim them as Pass. List them in the report under "Human follow-up required" with exact steps:

- **Real screen reader pass** — VoiceOver (Cmd+F5, Mac) or NVDA (Win): headings announced, roles + state on interactive elements, decorative content silent, `aria-live` updates actually spoken. Static analysis approximates this; it does not replace it.
- **Color-blindness simulations** — Chrome DevTools > Rendering > Emulate vision deficiencies (deuteranopia, protanopia, tritanopia).
- **Browser text zoom to 200%** with real user font settings (viewport resizing is only an approximation).

## STOP conditions (recap)

- STOP before adding `@axe-core/playwright` or any dependency — user approval required.
- STOP if a fix requires editing `design/tokens.json` or `CLAUDE.md` — protected files.
- STOP if a fix would change interaction behavior of a shared shadcn/Radix-based component — confirm blast radius with the user first.
- STOP if the build is broken, routes 404, or the page renders light when dark is expected — fix the environment before auditing.

## Output

Report exactly this structure — nothing ships with an open Fail:

```
## A11y Audit — <routes> — <date> — dark mode, 360/768/1024/1440/1920px
### Pass       — item + evidence (command output line, screenshot path, or file:line)
### Warning    — borderline item + how to fix
### Fail       — WCAG criterion + file:line + concrete fix (one line each)
### Human follow-up required — screen reader / vision-deficiency / 200% zoom steps
```

Fix every Fail, re-run steps 1a–1d until clean, and paste the final passing axe output as closing evidence (see `verify-before-done`).
