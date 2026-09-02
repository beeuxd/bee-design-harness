---
name: scaffold-project
description: Scaffolds the design harness into the current project — writes DESIGN.md, CLAUDE.md, the docs/ and design/ template set (including research/ideation loop artifacts and trust-scaffolding), and the token pipeline script, replacing placeholders with the user's answers. Use once per project, before any other harness skill. Trigger phrases: "scaffold the harness", "set up the design harness", "initialize this project", "install the persona docs", "new harness project". (Creating the Next.js app itself is a build concern for the Engineer role; this skill installs the harness's documents and conventions only.)
---

# Scaffold Project — install the harness docs into a project

The harness's skills assume a document set (DESIGN.md, docs/, design/) that plugins cannot auto-install. This skill writes it. Templates live in this skill's `templates/` directory — resolve it relative to this SKILL.md file's own location.

## Step 0 — Preconditions

1. Identify the project root (the user's cwd unless they say otherwise).
2. **Never overwrite silently.** Check each target before writing: `DESIGN.md`, `CLAUDE.md`, `docs/`, `design/`, `scripts/build-tokens.mjs`, `scripts/pipeline-status.js`. Any that already exist → list them and STOP: "These exist — overwrite, skip, or merge per file?" A project that already has a `CLAUDE.md` almost certainly wants a merge (append the harness sections), not a replacement.
3. **The intake — ask in ONE batch, then WAIT.** These answers shape everything downstream; unanswered items are recorded as `OPEN`, never guessed:
   1. Project name?
   2. One-line project description?
   3. Aesthetic direction in a sentence (placeholder-level is fine — `art-direction` captures the real one later)?
   4. Figma design-system file URL (or none yet)?
   5. **Existing design system?** npm package, Figma library, internal DS — beyond the harness's own conventions? (Yes → integration mode: adopt its tokens/components, docs record deltas.)
   6. **Existing branding?** Brand kit, logo system, brand guidelines? (Yes → note where they live; `art-direction` adopts rather than invents.)
   7. **Existing content voice?** Voice/tone/content guidelines? (Yes → `voice-guide` runs in adoption mode against them; no → `voice-guide` interviews before user-facing copy ships.)
   8. **Research material?** Interviews, tickets, surveys to seed `docs/research/raw/`? (Determines whether the loops or direct build is the next step.)
   9. **Which executors besides Claude Code?** Cursor/Codex/Copilot-family (AGENTS.md standard), Replit, Figma Make? (Determines which executor context files `sync-executor-context` maintains.)
   10. **Default theme?** Light or dark — decides which theme's values `:root` carries in the token pipeline. Both themes ALWAYS ship; this only picks the default the project opens in.

   Record answers 5–10 under a `## Intake` section in `docs/design-system.md` (with the design-system answer as its own `## Design system source` line) so no skill re-asks them.

## Step 1 — Write the tree

Copy from `templates/` into the project, preserving structure:

```
DESIGN.md
AGENTS.md        (cross-tool executor context — Cursor/Codex/Copilot/Gemini read this)
CLAUDE.md
docs/            (project, prd, user-flows, ux-principles, design-system, tech, trust-scaffolding, content-guidelines)
docs/research/   (insights.md, problems.md, raw/README.md, personas/README.md)
docs/ideation/   (feature-tree.md, wireframes.md)
docs/specs/      (empty — design specs land here)
design/          (tokens.json, tokens.md, components.md, patterns.md, recipes.md, templates.md, accessibility.md, taste-rules.md, references/README.md)
registry/        (empty — recipe-harvest writes shadcn registry items here)
scripts/build-tokens.mjs
scripts/pipeline-status.js   (project-local statusline copy — byte-identical to the plugin's, verified by test-harness.sh)
.claude/workflows/       (ship-review.js, variant-tournament.js — deterministic multi-agent routines, run via the Workflow tool)
.github/workflows/gates.yml   (CI gate suite: e2e + axe + visual baselines, token-guard, security, perf budget)
.lighthouserc.json            (Lighthouse budget assertions — LCP/TBT/CLS from docs/tech.md)
```

The CI files only bite once the repo is on GitHub and `app-bootstrap` (role-engineer) has installed the toolchain — say so in the report if either isn't true yet.

Then replace placeholders in every copied `.md`/`.json`: `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, `{{AESTHETIC}}`, `{{FIGMA_URL}}`, `{{THEME}}` with the Step 0 answers (empty answer → leave the placeholder and note it in the report). Record the intake answers per Step 0.3. If intake named Replit or Figma Make as executors, run `sync-executor-context` at the end to generate their context files (AGENTS.md ships from the template either way).

## Step 1.5 — Pipeline statusline (the dashboard)

Wire the pipeline dashboard into the project's statusline so every session shows position,
next step, and pending director verdicts at a glance. Create or merge `.claude/settings.json`:

```json
{
  "statusLine": { "type": "command", "command": "node scripts/pipeline-status.js --statusline" }
}
```

If `.claude/settings.json` already exists with a `statusLine`, ask before replacing it. The
same detector runs automatically on session start via the plugin's hook — the statusline is
the always-on version. It renders like: `⬡ wireframes · next: /hifi-gate` or
`⬡ insights · ⚠ verdict: insight-loop` when a loop awaits the director's ruling.

## Step 1.6 — Workflows (push-button multi-agent routines)

Two deterministic orchestration scripts land in `.claude/workflows/`:

- **`ship-review`** — the ship gate's review engine as a pipeline: parallel lens agents, every
  finding adversarially verified before it reaches the director. The `ship` skill prefers it
  when present.
- **`variant-tournament`** — five agents design the same screen from different angles
  (type/color/layout/motion/density-led), three judges score against the art direction and
  taste rules, the director rules on the bracket. Requires `## Art direction` to exist.

Both are token-heavy (8–20 agents per run) and both end at a human verdict. Mention them in the
scaffold report so the user knows they exist.

## Step 2 — Project-level protections

The harness's guard hooks ship with this plugin and run automatically. But `design/tokens.json` protection assumes the file exists at the project root path the guard expects — confirm `design/tokens.json` landed there. If the project keeps tokens elsewhere, STOP and ask before adapting.

**Distribution rule — skills are installed, never copied.** Harness skills reach a project ONLY via the plugin install (`claude plugin install harness-core@bee-design-harness`); never copy them into the project's `.claude/skills/`. Copies drift silently the moment the harness improves — this exact failure was caught in the field on 2026-08-14 (see logs/repairs-core.md in the harness repo). During scaffold, check `.claude/skills/` for copies of harness skills: if any exist, flag them, recommend deleting in favor of the plugin, and point at `test-harness.sh <project-path>` (harness repo root) which detects copy drift. Project-local skills that have no harness twin are fine.

## Step 3 — Git

If the project is not a git repo, recommend `git init` (the harness's checkpoint and branch conventions depend on it) — ask, don't just run it. If it is one, note the current branch; scaffolding commits should go on a `feature/harness-scaffold` branch, conventional message `chore: scaffold design harness`.

## Step 4 — Verify + report

1. `ls` the written tree and diff the file count against the template list — every template accounted for.
2. Grep the project for any `{{` placeholders that should have been replaced; list survivors honestly.
3. Report: files written, placeholders replaced/remaining, the intake record location, and next steps — `/harness-core:insight-loop` if intake found research material, `art-direction` before any visual work, `voice-guide` (role-copywriter) before user-facing copy, `sync-executor-context` whenever direction or tokens change.

## STOP and ask when

- Any target file already exists (Step 0.2).
- The project keeps tokens somewhere other than `design/tokens.json` (Step 2).
- The user answers none of the Step 0 questions — a scaffold full of placeholders is legal but say plainly what that leaves undone.
