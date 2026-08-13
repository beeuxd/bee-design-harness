---
name: scaffold-project
description: Scaffolds the design harness into the current project — writes DESIGN.md, CLAUDE.md, the docs/ and design/ template set (including research/ideation loop artifacts and trust-scaffolding), and the token pipeline script, replacing placeholders with the user's answers. Use once per project, before any other harness skill. Trigger phrases: "scaffold the harness", "set up the design harness", "initialize this project", "install the persona docs", "new harness project". (Creating the Next.js app itself is a build concern for the Engineer role; this skill installs the harness's documents and conventions only.)
---

# Scaffold Project — install the harness docs into a project

The harness's skills assume a document set (DESIGN.md, docs/, design/) that plugins cannot auto-install. This skill writes it. Templates live in this skill's `templates/` directory — resolve it relative to this SKILL.md file's own location.

## Step 0 — Preconditions

1. Identify the project root (the user's cwd unless they say otherwise).
2. **Never overwrite silently.** Check each target before writing: `DESIGN.md`, `CLAUDE.md`, `docs/`, `design/`, `scripts/build-tokens.mjs`. Any that already exist → list them and STOP: "These exist — overwrite, skip, or merge per file?" A project that already has a `CLAUDE.md` almost certainly wants a merge (append the harness sections), not a replacement.
3. Ask, in ONE batch, then WAIT:
   1. Project name?
   2. One-line project description?
   3. Aesthetic direction in a sentence (placeholder-level is fine — `art-direction` captures the real one later)?
   4. Figma design-system file URL (or none yet)?
   5. **The standing question (DESIGN.md Step 0):** is there an existing design system to integrate — npm package, Figma library, internal DS — beyond the harness's own conventions?

## Step 1 — Write the tree

Copy from `templates/` into the project, preserving structure:

```
DESIGN.md
CLAUDE.md
docs/            (project, prd, user-flows, ux-principles, design-system, tech, trust-scaffolding)
docs/research/   (insights.md, problems.md, raw/README.md, personas/README.md)
docs/ideation/   (feature-tree.md, wireframes.md)
docs/specs/      (empty — design specs land here)
design/          (tokens.json, tokens.md, components.md, patterns.md, accessibility.md, taste-rules.md, references/README.md)
scripts/build-tokens.mjs
```

Then replace placeholders in every copied `.md`/`.json`: `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, `{{AESTHETIC}}`, `{{FIGMA_URL}}` with the Step 0 answers (empty answer → leave the placeholder and note it in the report). Record the Step 0.3.5 design-system answer under a `## Design system source` section in `docs/design-system.md` so no skill re-asks it.

## Step 2 — Project-level protections

The harness's guard hooks ship with this plugin and run automatically. But `design/tokens.json` protection assumes the file exists at the project root path the guard expects — confirm `design/tokens.json` landed there. If the project keeps tokens elsewhere, STOP and ask before adapting.

## Step 3 — Git

If the project is not a git repo, recommend `git init` (the harness's checkpoint and branch conventions depend on it) — ask, don't just run it. If it is one, note the current branch; scaffolding commits should go on a `feature/harness-scaffold` branch, conventional message `chore: scaffold design harness`.

## Step 4 — Verify + report

1. `ls` the written tree and diff the file count against the template list — every template accounted for.
2. Grep the project for any `{{` placeholders that should have been replaced; list survivors honestly.
3. Report: files written, placeholders replaced/remaining, the design-system-source answer recorded, and next steps — `/harness-core:insight-loop` if research material exists, or the Designer role's build path if not, and `art-direction` before any visual work.

## STOP and ask when

- Any target file already exists (Step 0.2).
- The project keeps tokens somewhere other than `design/tokens.json` (Step 2).
- The user answers none of the Step 0 questions — a scaffold full of placeholders is legal but say plainly what that leaves undone.
