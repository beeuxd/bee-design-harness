---
name: app-bootstrap
description: Turns a freshly scaffolded persona project (docs + .claude, no app code) into a running dark-mode Next.js app with live design tokens, fonts, shadcn, and Playwright — verified with screenshots before it counts as done. Use once per project, before any feature work. Triggers: "bootstrap the app", "set up the app", "there's no app yet", "initialize the project", "create the next.js app", "start building from scratch".
---

# Bootstrap the app

Every other skill in this library assumes a running Next.js app. This skill creates it. Run it exactly once per project, before any feature work.

The dependencies this skill installs (`next-themes`, shadcn and its `tw-animate-css`, `@playwright/test`, `@axe-core/playwright`) are the persona's standard stack and count as pre-approved — CLAUDE.md's "stop and ask before a new dependency" rule applies to anything *beyond* this list.

## Step 0 — Preconditions and entry state

Check, in order:

1. **Is there already an app?**
   ```bash
   ls package.json app 2>/dev/null
   ```
   If `package.json` exists → **STOP. This skill is for empty projects only.** Tell the user what you found and ask how to proceed (an existing app means someone bootstrapped already — duplicating it would destroy work).
2. **Are the persona files here?** `CLAUDE.md`, `design/tokens.json`, and `scripts/build-tokens.mjs` must exist. If not, the harness isn't scaffolded — run `/harness-core:scaffold-project` first, or ask where the project root is.
3. **Toolchain:** `node --version` (need ≥ 20) and `pnpm --version`. If pnpm is missing, STOP and ask — installing a package manager is a machine-level change the user makes.
4. **Git:** `git rev-parse --is-inside-work-tree || git init`. Commit any uncommitted persona files first, so the bootstrap diff is clean — check `git status --porcelain`; if it prints anything, run `git add -A && git commit -m "chore: persona scaffold"` (if it prints nothing, the tree is clean — skip the commit, it would error). Then work on a branch:
   ```bash
   git checkout -b feature/bootstrap
   ```
5. **ASK THE USER — do not assume.** This is the standing question from `DESIGN.md` Step 0: *"Is there an existing design system we should integrate — an npm package, a Figma library, an internal DS — beyond our own style guidelines? Or do we build on plain React + Tailwind?"* Whatever the answer, record it under a `## Design system source` section in `docs/design-system.md` so no skill re-asks it this project (if that section already has an answer, use it and don't re-ask).
   - **No, or unsure** (the default): continue with this skill's main path — React + Tailwind + token pipeline + shadcn.
   - **Yes, a package exists** (e.g. a company `@org/ui` kit): install it, read its README/docs for provider and token setup, and adapt: if the package ships its own token CSS, wire that instead of Step 2's generated `tokens.css` (keep `design/tokens.json` as the Figma-mapping reference); **skip Step 5 (shadcn) entirely** — the package is the component source; record the package name + version at the top of `design/components.md` as the component source of truth. Components then come from the package first, `components/site/` second — never install shadcn primitives alongside a company kit without the user's explicit OK.

## Step 1 — Create the Next.js app

`create-next-app` refuses to run in a non-empty directory, so scaffold into a temp folder and merge:

```bash
pnpm dlx create-next-app@latest bootstrap-tmp --typescript --app --tailwind --eslint \
  --no-src-dir --import-alias "@/*" --use-pnpm --yes
```

- If the CLI rejects a flag (versions change), run `pnpm dlx create-next-app@latest --help`, adapt, and note the substitution in your report. If it still fails after one adaptation, STOP and show the user the error.
- Merge into the project root. **`mv` overwrites silently by default — the persona's `CLAUDE.md` is a known casualty (newer create-next-app generates its own `CLAUDE.md`/`AGENTS.md`). Use exactly this sequence:**
  ```bash
  ls -A bootstrap-tmp                          # review before moving
  rm -rf bootstrap-tmp/.git bootstrap-tmp/.next
  rm -f bootstrap-tmp/README.md bootstrap-tmp/CLAUDE.md bootstrap-tmp/AGENTS.md   # persona owns these
  mv -n bootstrap-tmp/* bootstrap-tmp/.[!.]* . 2>/dev/null   # -n = never overwrite
  rmdir bootstrap-tmp
  ```
  If `rmdir` fails, whatever is left inside `bootstrap-tmp` collided with an existing file — STOP, show the user both versions, and resolve each by hand (for `.gitignore`, concatenate: `cat bootstrap-tmp/.gitignore >> .gitignore`, then dedupe). After the merge, verify the persona survived: `head -1 CLAUDE.md` must still show the project header, and `docs/`, `design/`, `.claude/` must be intact.
- Checkpoint: `git add -A && git commit -m "chore: create-next-app scaffold"`

## Step 2 — Generate the design tokens

```bash
node scripts/build-tokens.mjs
```

This writes `app/tokens.css` from `design/tokens.json` (dark values in `:root`, light overrides in `.light`, Tailwind v4 mappings in `@theme inline`). Then:

1. Add the run script to `package.json`: `"tokens": "node scripts/build-tokens.mjs"`.
2. Replace the generated `app/globals.css` wholesale with:
   ```css
   @import "tailwindcss";
   @import "./tokens.css";

   body {
     background: var(--background);
     color: var(--foreground);
     font-family: var(--font-sans);
   }
   ```
   (create-next-app ships its own `:root { --background: … }` and `@theme inline` blocks — they conflict with the token pipeline and must not survive.)
3. `app/tokens.css` is generated output: never edit it by hand, and re-run `pnpm tokens` after any *approved* change to `design/tokens.json` (protected file — the PreToolUse hook forces a confirmation).

## Step 3 — Dark mode as the default

```bash
pnpm add next-themes
```

In `app/layout.tsx`:

```tsx
import { ThemeProvider } from "next-themes";

// inside the return:
<html lang="en" suppressHydrationWarning>
  <body className={/* font variables, Step 4 */}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  </body>
</html>
```

Dark is primary: no system preference, no flash. The `.light` class (emitted by the token pipeline) is how light mode switches on later — only if the project ever requests it.

## Step 4 — Fonts, from the tokens

The required family names are listed in the header of `app/tokens.css` (source: `design/tokens.json` → `primitive.fontFamily`). Load each via `next/font/google` in `app/layout.tsx` with the matching CSS variable:

Both family names below are **placeholders** — substitute the families your `tokens.css` header names, never these:

```tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"; // ← EXAMPLES ONLY — use the families the tokens name

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" }); // ← example family
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });    // ← example family

<body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
```

Remove the Geist imports create-next-app added. **If a family is not on Google Fonts, STOP and ask the user for the font files** (they'll be loaded with `next/font/local`) — never substitute a "close" font.

## Step 5 — shadcn

```bash
pnpm dlx shadcn@latest init --yes --defaults --css-variables
```

(Flags change between releases — if one is rejected, check `pnpm dlx shadcn@latest init --help`, adapt once, and note the substitution. If it still fails, STOP and show the user the error. There is no `--base-color` anymore.)

**shadcn's init rewrites files you already configured. Reconcile both, immediately:**

1. `app/globals.css` — init appends its own `@theme inline`, `:root`, and `.dark` blocks (oklch values). The token pipeline owns all variables, so the final file keeps ONLY:
   ```css
   @import "tailwindcss";
   @import "./tokens.css";
   @import "tw-animate-css";          /* keep — shadcn component animations */
   @import "shadcn/tailwind.css";     /* keep — shadcn base styles */

   @custom-variant dark (&:is(.dark *));   /* keep — class-based dark: variant */

   @layer base {
     * { @apply border-border outline-ring/50; }
     body { @apply bg-background text-foreground font-sans; }
   }
   ```
   Delete everything else init added (`@theme inline` block, `:root` block, `.dark` block). If init's `@import` lines differ from the two shown (names shift between shadcn releases), keep whatever `@import` lines init actually wrote — only the variable blocks get deleted. The `@custom-variant dark` line is load-bearing — without it, `dark:` utilities silently stop matching the class strategy.
2. `app/layout.tsx` — **init may swap your token fonts for Geist and inject its own markup.** Re-open it and restore Step 3 + Step 4 exactly (token fonts with `--font-sans`/`--font-mono` variables, ThemeProvider, `suppressHydrationWarning`).
3. `git diff --stat` — review anything else init touched before committing.

`components.json` stays. Do not install primitives yet — primitives are installed per component when a feature needs one (reuse-first; restyle every primitive to tokens; never ship shadcn defaults).

## Step 6 — Playwright

```bash
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
```

Create `playwright.config.ts` from the template in the `e2e-test` skill (three projects: mobile 360×800, tablet 768×1024, desktop 1440×900, dark color scheme, `webServer` auto-start). That skill owns the config — copy it from there, don't improvise one.

## Step 6b — Storybook + MCP (ask, then install)

Ask: *"Set up Storybook with its MCP server? It makes the component library queryable by agents and gives every component an executable spec (recommended; ~5 min)."* If declined, record the decision in `docs/tech.md` and skip — `storybook-component` will honor it.

If accepted:

```bash
pnpm dlx storybook@latest init --yes
pnpm add -D @storybook/addon-mcp
```

1. Register the addon in `.storybook/main.ts` (`addons: [..., "@storybook/addon-mcp"]`). If either CLI rejects a flag, check its `--help`, adapt once, and note the substitution; still failing → STOP and show the user the error.
2. Storybook previews must load the token pipeline: import `../app/globals.css` in `.storybook/preview.ts` and default the preview to dark (dark is primary).
3. The MCP endpoint is `/mcp` on the Storybook dev server (`pnpm storybook`). Note in `docs/tech.md` how executors connect (see the Storybook section there).
4. Verify: `pnpm storybook` starts clean and serves the example story; then delete the example stories shadcn/Storybook shipped — real stories come per-component via `storybook-component`.
5. Checkpoint: `git add -A && git commit -m "chore: storybook + mcp addon"`.

## Step 7 — Proof page

Replace the create-next-app hero in `app/page.tsx` with a minimal token proof:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-3xl font-semibold">{/* project name from CLAUDE.md */}</h1>
      <p className="text-muted-foreground">Design tokens are live.</p>
      <button className="h-11 rounded-lg bg-primary px-6 text-primary-foreground">
        Primary action
      </button>
    </main>
  );
}
```

Every class above resolves through `tokens.css` — if any renders as browser defaults, the pipeline is mis-wired; fix before proceeding. The button is `h-11` (44px): the tap-target floor is real from the first commit.

## Step 8 — Verify with evidence (gate)

Run the `verify-before-done` skill in full. Bootstrap-specific additions:

1. `pnpm lint && pnpm build` — both clean.
2. Start the dev server in the background (Bash tool with `run_in_background: true`, or `nohup pnpm dev > /tmp/dev-server.log 2>&1 &` — never foreground). **Then read the ACTUAL port from the log — do not assume 3000.** If anything else on the machine holds 3000, Next silently moves to 3001+, and a blind `curl localhost:3000` will happily return 200 *from the wrong app* — your screenshots would show someone else's site and the whole verification is void:
   The port line takes a few seconds to appear in the log — poll for it, and never proceed with an empty `$PORT`:
   ```bash
   PORT=""
   for i in $(seq 1 30); do
     PORT=$(grep -m1 -Eo "localhost:[0-9]+" /tmp/dev-server.log 2>/dev/null | cut -d: -f2)
     [ -n "$PORT" ] && break
     sleep 1
   done
   [ -n "$PORT" ] && echo "dev server on port $PORT" || echo "NO PORT FOUND — read /tmp/dev-server.log"
   curl -s -o /dev/null -w "%{http_code}" --retry 30 --retry-delay 1 --retry-all-errors "http://localhost:$PORT"
   ```
   If `NO PORT FOUND` prints, the server crashed or logs elsewhere — read the log and root-cause before any curl or screenshot (an empty `$PORT` makes the URL malformed and the whole verification void). Expect `200` from the curl.
3. Screenshot at 360 and 1440, dark, using that `$PORT`:
   ```bash
   pnpm exec playwright screenshot --viewport-size "1440,900" --color-scheme dark \
     "http://localhost:$PORT" /tmp/bootstrap-1440.png
   pnpm exec playwright screenshot --viewport-size "360,800" --color-scheme dark \
     "http://localhost:$PORT" /tmp/bootstrap-360.png
   ```
   **Read the screenshots and confirm it is THIS project's page** (the Step 7 proof content). The page background and text must match this project's dark tokens, and the button must render in the token `--primary` color — check the expected values in `design/tokens.md` / `design/tokens.json` before judging. If the page is white/light, the theme default or globals.css wiring is wrong; if the button renders as a browser-default grey, the token→Tailwind mapping is broken (classic cause: class-based theme not applied — check ThemeProvider and the `@custom-variant dark` line).
4. Token-pipeline round-trip: append a junk value to a component file (e.g. `text-[#ff0000]` in `page.tsx`), save, confirm the design-system-guard hook flags it, then remove it. This proves the safeguard is live in this project.
5. Commit: `git add -A && git commit -m "feat: bootstrap app with design tokens"` on `feature/bootstrap`, then tell the user the branch is ready to merge — do not merge or push yourself.

## Done report

Per `verify-before-done`: claim, evidence (build output, both screenshots, hook round-trip result), what was NOT verified (light mode — intentionally unbuilt; real content — none yet), next step (merge `feature/bootstrap`, then begin feature work — the loops if research exists, `art-direction` before visuals).

## STOP conditions (summary)

- `package.json` already exists (Step 0) — never bootstrap twice.
- Persona files (`CLAUDE.md`, `design/tokens.json`, `scripts/build-tokens.mjs`) missing (Step 0) — wrong directory or `setup.sh` not run.
- pnpm missing (Step 0) — machine-level install is the user's call.
- Design-system-package question unanswered (Step 0.5) — always ASK; default to plain React + Tailwind only when the user says no or is unsure.
- Unexpected file collision during merge (Step 1).
- create-next-app flags fail twice (Step 1); shadcn init still failing after one flag adaptation (Step 5).
- Token font family not on Google Fonts (Step 4).
- Dev server port never appears in the log (Step 8) — no curl/screenshot until root-caused.
- Any lint/build/screenshot failure you can't root-cause in 2 attempts → STOP, write up findings and what you ruled out, ask the user.
