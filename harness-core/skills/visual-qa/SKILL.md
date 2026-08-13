---
name: visual-qa
description: Captures full-page Playwright screenshots of a running route at 360/768/1440px in dark mode, reviews them against the design-system rubric, and returns a Pass/Issues/Suggestions report with screenshot evidence. Use after building or changing any page or component and before shipping — UX-completeness reviews of flows route to review-ux, not here. Trigger phrases — "visual QA", "screenshot check", "how does it look", "check the visuals", "does this page look right", "eyeball the page".
---

# Visual QA — Screenshot-Based Design Review

Self-sufficient: uses Playwright directly. Do NOT ask the user for screenshots unless Playwright is truly unavailable (see Fallback).

## Step 0 — Preflight

1. Confirm the dev server is up:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   ```
   - `200`/`3xx` → proceed. Anything else → start the dev server with `pnpm dev` **as a background process** (use the Bash tool's `run_in_background` option — never run it in the foreground, it blocks forever), then poll until ready (max 60s):
     ```bash
     for i in $(seq 1 30); do curl -sf http://localhost:3000 > /dev/null && echo READY && break; sleep 2; done
     ```
   - If the project's dev server uses a different port (check the `dev` script in `package.json` and the server's startup output), use that port everywhere in this skill and run the capture with `QA_BASE_URL=http://localhost:<port>`.
   - **STOP and ask the user** if the server fails to start after one fix attempt, or if the route returns 401/403/redirects to a login (you need a test route or credentials — do not fake auth).
2. Confirm Playwright: `npx playwright --version`. If a later step errors with "Executable doesn't exist", run `npx playwright install chromium` once, then retry.
3. Identify the exact route(s) to review. If the user didn't name one, ask — do not guess.

## Step 1 — Capture at 360 / 768 / 1440, dark mode

Dark is the primary theme (per CLAUDE.md); captures MUST be dark. Write this script (safe to overwrite; `.qa/` is scratch — never commit it; add a `.qa/` line to `.gitignore` if it isn't already there):

```js
// .qa/visual-capture.mjs — usage: node .qa/visual-capture.mjs /route
import { chromium } from "playwright";
import fs from "node:fs";

const route = process.argv[2] ?? "/";
const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
const slug = route === "/" ? "home" : route.replace(/\W+/g, "-").replace(/^-+|-+$/g, "");
fs.mkdirSync(".qa/visual", { recursive: true });

const browser = await chromium.launch();
for (const width of [360, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "dark" });
  // Cover both theme strategies: next-themes localStorage key AND prefers-color-scheme above.
  await ctx.addInitScript(() => localStorage.setItem("theme", "dark"));
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "domcontentloaded" });
  // networkidle can hang on dev servers (HMR keeps sockets busy) — tolerate a miss, don't fail the capture.
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  const audit = await page.evaluate(() => {
    const doc = document.documentElement;
    const targets = [...document.querySelectorAll("a,button,[role='button'],input,select,textarea")]
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44))
      .map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    return {
      darkClassOnHtml: doc.classList.contains("dark"),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      horizontalScroll: doc.scrollWidth > doc.clientWidth,
      scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth,
      smallTapTargets: targets.slice(0, 20),
    };
  });
  console.log(`--- ${width}px ---\n${JSON.stringify(audit, null, 2)}`);
  await page.screenshot({ path: `.qa/visual/${slug}-${width}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
```

Run it:

```bash
node .qa/visual-capture.mjs /pricing
```

If the import fails with "Cannot find package 'playwright'" but `@playwright/test` is installed, change the import to `import { chromium } from "@playwright/test";` — do not add the `playwright` package (new-dependency rule).

Quick alternative for a single ad-hoc shot (only works if the theme follows `prefers-color-scheme`; it cannot set localStorage):

```bash
mkdir -p .qa/visual && npx playwright screenshot --viewport-size="360,780" --color-scheme=dark --full-page --wait-for-timeout=3000 "http://localhost:3000/pricing" .qa/visual/pricing-360.png
```

### Validate the capture before reviewing

- Open each PNG with the Read tool. If any screenshot shows a light background, the capture is invalid — do not review it. Check how the theme is wired (theme provider setup, docs/design-system.md), adjust the init script (e.g., different localStorage key, or add `document.documentElement.classList.add("dark")` in `addInitScript`), and recapture. **STOP and ask the user** if it is still light after one adjustment.
- If the page shows an error boundary, blank body, or unstyled HTML: that is the finding — report it and stop the visual review. "Compiles" does not mean "renders".

## Step 2 — Review rubric (run per viewport)

View each screenshot with the Read tool and check, using the audit JSON as hard evidence:

### Layout integrity
- [ ] No horizontal scroll — `horizontalScroll: false` in the audit at every width (cite the numbers)
- [ ] No content overflow or clipping
- [ ] Consistent section spacing rhythm per the spacing scale in docs/design-system.md
- [ ] Grid alignment — elements align; no ragged edges between sections

### Visual hierarchy
- [ ] Primary CTA is the most prominent element on the page
- [ ] Clear first/second/third read — heading order is obvious
- [ ] Sufficient whitespace between sections; no "wall of text" without visual breaks

### Design-system compliance (two-source rule)
Two-source rule: visual values (color, type, spacing, radius, shadows) trace to Figma variables mapped into design/tokens.json; interaction behavior traces to shadcn/Radix source. Never eyeball either source.
- [ ] Colors, type scale, spacing, radius, shadows match docs/design-system.md and design/tokens.json
- [ ] Screenshots only raise suspicion — confirm against code, never eyeball values. If a color looks off, grep the component for hardcoded values (`grep -nE '#[0-9a-fA-F]{3,8}|\b[0-9]+px' <file>`) and check the token in design/tokens.json
- [ ] If the token source and the rendered result disagree and you cannot resolve it from tokens/docs, **STOP and ask the user** — never invent a spec value

### Component consistency
- [ ] Same patterns for similar elements; button sizes/variants consistent; card styles uniform
- [ ] No mix of styled and default-shadcn components (never ship shadcn defaults unchanged)
- [ ] Reused components come from components/ui/ or components/site/ per design/components.md

### State coverage
- [ ] Empty states have designed content (not blank)
- [ ] Loading skeletons exist for async content (reserve space — CLS ≤ 0.1)
- [ ] Error states are styled, not default browser errors
- [ ] If a state can't be triggered from the UI, note it as "not verified" — do not claim it passes

### Mobile-specific (360px only)
- [ ] `smallTapTargets` in the audit is empty (44x44px minimum; primary CTAs 44–52px tall). Review each hit before flagging: links inline within a sentence are exempt under WCAG 2.2 Target Size; every other hit is an Issue
- [ ] Text readable without zooming; fluid type via clamp() not collapsing too small
- [ ] Images scale correctly; nothing overlapped or hidden behind other elements
- [ ] Navigation reachable (hamburger or bottom nav)

Scope note: this skill judges the three review widths. The full 360/768/1024/1440/1920 sweep belongs to the project's responsive test matrix (run it as part of `e2e-test` or the ship gate); a11y and performance budgets belong to the ship-gate skills (a11y-audit, performance-check, design-system-audit) — recommend them in the report if relevant; don't duplicate them here.

## Step 3 — Report

Always output this structure, in this order:

### Pass — what looks good
2–3 bullets with specific observations, each citing a screenshot path (e.g., `.qa/visual/pricing-360.png`) or audit value.

### Issues — what needs fixing
For each issue:
- **Viewport:** 360 / 768 / 1440
- **Location:** section, component, approximate position
- **Issue:** specific description + evidence (audit value or what the screenshot shows)
- **File:** exact file path (find it — grep for the component; "unknown" only if genuinely not locatable)
- **Fix:** recommended action, token-only (no hardcoded hex or arbitrary px — the write hook will flag them)

### Suggestions — optional improvements
Only if clearly beneficial. Not nitpicks.

## Step 4 — Fix → recapture → recheck loop

1. Apply the smallest fix that resolves the issue. Tokens only. Reuse before build. If fixes get committed, commit on a `feature/*` branch — never directly to `main`.
2. Recapture with the exact same command from Step 1.
3. Recheck ONLY the previously failing items, plus a quick scan for regressions at all three widths.
4. **Maximum 3 iterations.** If issues remain after iteration 3, STOP fixing. Report honestly: what was fixed (with before/after screenshot paths), what still fails, what you tried, and your best hypothesis. Never claim a pass you did not verify.
5. Cleanup: if **this skill** started the dev server in Step 0 (it wasn't already up), kill it when the review is done — `lsof -ti:<port> | xargs kill 2>/dev/null || true`. If it was already running, leave it alone.

## STOP conditions (recap)

- Dev server won't start after one fix attempt, or the route needs auth → ask the user.
- Dark capture still light after one theme-wiring adjustment → ask the user.
- A fix requires editing design/tokens.json or CLAUDE.md → protected files; get explicit user approval first (a PreToolUse hook enforces this).
- A visual spec question can't be answered from design/tokens.json / docs/design-system.md → ask; do not eyeball from screenshots.
- 3 fix iterations exhausted → stop, report findings honestly, and hand the remainder to the user.

## Fallback — Playwright truly unavailable

Only if `npx playwright --version` fails AND `npx playwright install chromium` fails (e.g., no network):

1. Tell the user exactly: "I can't take automated screenshots here. Please share screenshots of `<route>` at 360px, 768px, and 1440px wide, in dark mode."
2. Review the shared images with the Step 2 rubric. Mark every check that needs the audit JSON (horizontal scroll numbers, tap-target sizes) as "not verified — needs live measurement" rather than guessing.
