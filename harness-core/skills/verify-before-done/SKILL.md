---
name: verify-before-done
description: Gates the words "done", "fixed", or "complete" behind concrete evidence — build output, lint, dark-mode screenshots at 360/768/1440px, and a keyboard walkthrough — and produces a Done report listing what was and was not verified. Use it as the final step of every implementation task, before any completion claim, commit, or handoff. Trigger phrases: "is this done?", "mark it done", "that's fixed", "can I commit this", "verify before done", "run the done check". (This verifies one task's completion claim; the go/no-go gate on a whole page, feature, or release is ship.)
---

# Verify Before Done

You may not say **"done"**, **"fixed"**, **"complete"**, **"ready"**, or **"works"** until every step below has produced an artifact you can show. "Compiles" is not "renders". A completion claim without artifacts is a violation of house rules (see CLAUDE.md, "Boil the ocean").

Run this skill at the end of ANY task that changed code, styles, or content. No exceptions for "trivial" changes — a one-line CSS edit can break 360px layout.

## Step 0 — Scope the claim

Write down, in one sentence, exactly what you are claiming. Example: "The pricing card renders correctly in dark mode at all viewports and is keyboard-operable." You will verify THAT sentence, nothing vaguer.

## Step 1 — Build must pass (show output)

```bash
cd "<project root>" && pnpm build
```

- Paste the tail of the output (route table + first-load JS sizes) into your Done report.
- If first-load JS for any changed route is >= 150KB gzipped, the performance budget is broken: the work is NOT done. Fix, or STOP, report what you found, and ask the user how to proceed.
- If the build fails: fix it. Do not rationalize a failing build as "unrelated". If it genuinely pre-dates your change, prove it (`git stash && pnpm build`), record the result, then restore with `git stash pop`.

## Step 2 — Lint must pass

```bash
pnpm lint
```

Zero errors. Warnings introduced by your change must be fixed, not suppressed. Never add `eslint-disable` or `any` to pass this step without a `// TODO` explaining why (CLAUDE.md rule).

## Step 3 — Screenshots: 360 / 768 / 1440px, dark mode

Dark mode is the primary theme — screenshots that show light mode are invalid evidence.

**Which routes:** every route the change affects — not just one. For a page-level change that is the page itself; for a shared component, find the consumers (`grep -rln 'ComponentName' app/ --include='*.tsx'`, plus any consumer list a prior refactor already produced) and screenshot each route that renders it. If a changed component is not mounted on any route yet, render it on a scratch route (`app/_debug/page.tsx`, deleted before commit) — do not skip the screenshot.

Serve the production build (dev mode hides hydration and CSS-order bugs). Step 1 already ran `pnpm build`, so do NOT rebuild here. If a dev server is already occupying port 3000 (common when one was left running earlier in the session), stop it first — `lsof -ti:3000 | xargs kill` — otherwise `pnpm start` fails or silently picks 3001 and every URL below hits the wrong server. Then start the server in the background and wait until it responds before taking any screenshot:

```bash
pnpm start &   # serves the Step 1 build on http://localhost:3000
until curl -sf http://localhost:3000 > /dev/null; do sleep 1; done   # wait until the server answers
```

(If your shell does not persist between commands, launch `pnpm start` with your run-in-background mechanism instead of `&`.) When Steps 3–4 are finished, stop the server: `lsof -ti:3000 | xargs kill`. If you killed a dev server to free the port and the session continues after this gate, restart it — don't leave the next task without a server and no explanation.

**Option A — CLI (works when dark mode follows `prefers-color-scheme`):**

```bash
mkdir -p .claude/evidence
npx playwright screenshot --color-scheme=dark --viewport-size=360,800  --full-page http://localhost:3000/<route> .claude/evidence/<route>-360.png
npx playwright screenshot --color-scheme=dark --viewport-size=768,1024 --full-page http://localhost:3000/<route> .claude/evidence/<route>-768.png
npx playwright screenshot --color-scheme=dark --viewport-size=1440,900 --full-page http://localhost:3000/<route> .claude/evidence/<route>-1440.png
```

**Option B — spec file (required when dark mode is class-based, e.g. next-themes puts `.dark` on `<html>`):** create `e2e/verify-screenshots.spec.ts`:

```ts
import { test } from "@playwright/test";

const route = process.env.ROUTE ?? "/";
for (const [w, h] of [[360, 800], [768, 1024], [1440, 900]]) {
  test(`screenshot ${w}px dark`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`http://localhost:3000${route}`);
    // Force class-based dark mode if the toggle uses next-themes/localStorage:
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `.claude/evidence/${w}.png`, fullPage: true });
  });
}
```

Run it: `ROUTE=/<route> npx playwright test e2e/verify-screenshots.spec.ts`

Prerequisites for Option B: `@playwright/test` must be a dependency with browsers installed (`pnpm add -D @playwright/test && npx playwright install chromium` if missing — a new dependency requires STOP-and-ask per CLAUDE.md). If the repo's `playwright.config.ts` sets a `testDir` other than `e2e/`, put the spec inside that directory instead, or Playwright will report "no tests found".

**Then LOOK at each screenshot** (open with the Read tool). Check: no overflow/horizontal scroll at 360, no clipped text, no light-mode flash artifacts, tap targets look >= 44px, layout matches the Figma spec (two-source rule — compare against Figma variables/specs, never eyeball "close enough"). If anything is off, it is not done.

House rule sweeps all of 360/768/1024/1440/1920px; 360/768/1440 is the minimum evidence set for the Done report. If the change is layout-level (grid, nav, section stacking), capture 1024 and 1920 too.

## Step 4 — Keyboard walkthrough (anything interactive)

If the change includes ANY interactive element (link, button, input, dialog, menu), verify with a Playwright script and record the results. (Manually tabbing around in a desktop browser is a human-only check — it cannot serve as your evidence; if only a human can perform it, list it under "Not verified" and ask the user.) Verify:

- **Tab**: focus reaches every interactive element in a logical order; focus ring is visible in dark mode.
- **Enter / Space**: activates buttons and links.
- **Escape**: closes dialogs, popovers, menus; focus returns to the trigger.
- **Arrow keys**: work where the shadcn/Radix primitive defines them (tabs, menus, radio groups) — behavior comes from the primitive's actual source, never invented.

Minimal runnable check — create `e2e/verify-keyboard.spec.ts` (same location/config notes as the screenshot spec above):

```ts
import { test } from "@playwright/test";

test("keyboard walkthrough (dark)", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`http://localhost:3000${process.env.ROUTE ?? "/"}`);
  await page.evaluate(() => document.documentElement.classList.add("dark")); // class-based dark mode
  // Tab through; bump 8 up until every interactive element in the change is covered.
  for (let i = 1; i <= 8; i++) {
    await page.keyboard.press("Tab");
    await page.screenshot({ path: `.claude/evidence/focus-${i}.png` }); // focus ring visible?
  }
  // Then, per element under test: press "Enter" / "Space" / "Escape" and
  // screenshot the result to .claude/evidence/key-<element>-<key>.png.
});
```

Run it: `ROUTE=/<route> npx playwright test e2e/verify-keyboard.spec.ts` — then open every `focus-*.png` with the Read tool and confirm the focus ring is visible in dark mode and the order is logical.

If `prefers-reduced-motion` gating was touched, also capture one run with `page.emulateMedia({ reducedMotion: "reduce" })` and confirm animations are disabled.

For deeper coverage, chain into the `a11y-audit` and `visual-qa` skills; for Core Web Vitals claims, run `performance-check` — do not assert LCP/INP/CLS numbers without it.

## Step 5 — State what was NOT verified

Every Done report must contain a "Not verified" list. Common honest entries: light mode, Safari/WebKit, real-device touch, screen reader output, 1920px, slow-3G performance, states requiring auth or seeded data. An empty "Not verified" section is almost always a lie — think harder.

## Step 6 — Write the Done report

Post this in chat (do not create a report file unless the user asks):

```
## Done report
Claim: <the one sentence from Step 0>

Evidence:
- pnpm build: PASS — <first-load JS for changed routes> (output above)
- pnpm lint:  PASS
- Screenshots (dark): .claude/evidence/<...>-360.png, -768.png, -1440.png — reviewed, no overflow/clipping
- Keyboard: Tab order OK, Enter/Space OK, Escape OK, focus visible — <or N/A: no interactive changes>

Not verified:
- <explicit list>

Known risks:
- <anything fragile, assumptions made, follow-ups>
```

## Cleanup rule — verification artifacts never ship

- Delete `e2e/verify-screenshots.spec.ts` and `e2e/verify-keyboard.spec.ts` before committing — they are throwaway harnesses, not part of the suite (keep them only if the user explicitly asks).
- `.claude/evidence/` is scratch output: never commit it. If `git status` shows it as untracked, add `.claude/evidence/` to `.gitignore` (that edit is allowed — `.gitignore` is not a protected file).

## Hard rules

- **"Compiles" is not "renders".** Build passing without screenshots proves nothing about the UI.
- **No artifacts, no claim.** If you cannot produce the evidence, say "implemented but unverified" — never "done".
- **Any failed step = not done.** Fix it in this turn if the fix is clear; otherwise STOP and report to the user with the failing output attached.
- **Never "fix" evidence by editing protected files.** `design/tokens.json` and `CLAUDE.md` require explicit user approval (PreToolUse hook enforces this).
- **Token violations block done.** If the PostToolUse hook flagged a hardcoded hex or arbitrary px value during the work, resolve it against `design/tokens.json` before claiming done.
- **Never on `main`.** Before any commit that follows this gate, check the branch (`git branch --show-current`). If it prints `main`, stop and move the work to a `feature/short-description` branch first (CLAUDE.md repo conventions) — verified work still may not land directly on `main`.

## STOP and ask the user when

- The dev/prod server will not start and the fix is not obvious within two attempts.
- Dark mode cannot be triggered (no `.dark` class, no media-query support) — the theming setup itself may be broken.
- A screenshot reveals a visual problem whose correct fix requires a design decision (spacing/color not in `design/tokens.md` or the Figma spec).
- Verification requires credentials, seeded data, or a third-party service you do not have.
- The performance budget fails and the cause is a dependency or asset the user chose.
