---
name: sync-executor-context
description: Regenerates the project's executor context files — AGENTS.md (Cursor/Codex/Copilot/Gemini and other AGENTS.md-standard tools), replit.md, and figma-make-guidelines.md — from the source design docs, so every executor works from current truth instead of stale copies. Use after any art-direction revision, token change, or intake-answer change. Trigger phrases: "sync the executor context", "regenerate AGENTS.md", "update the Figma Make guidelines", "refresh replit.md", "the context files are stale". (Writing the source docs themselves is art-direction/voice-guide/design-tokens-sync territory — this skill only derives from them.)
---

# Sync Executor Context — one source, every executor

Executor context files are **generated, never hand-edited**. Their source of truth: `DESIGN.md`, `docs/design-system.md`, `docs/content-guidelines.md`, `design/tokens.md`, `design/taste-rules.md`, `docs/tech.md`. Stale executor context is drift with a different name.

## Step 0 — Scope

1. Read the intake record in `docs/design-system.md` (which executors this project uses — recorded by `scaffold-project`). Generate only the files for executors in use; if the answer isn't recorded, ask once and record it there.
2. Read every source doc above. Do not generate from memory of them.

## Step 1 — AGENTS.md (always — it's the cross-tool standard)

Regenerate from the template shape (`scaffold-project`'s templates/AGENTS.md): project one-liner, read-order, sources-of-truth precedence, hard rules, workflow. Inject current values — if art direction now bans something, the ban appears here; if the voice guide exists, the content-first line points at it. Plain markdown, no tool-specific syntax, no Claude mechanics (CLAUDE.md carries those separately).

## Step 2 — replit.md (if Replit is in use)

Same distillation, Replit-Agent-framed: component library + token rules up front (Replit Agent applies design-system context from this file), then the hard rules and sandbox conventions. Keep it shorter than AGENTS.md — Replit consumes it as working instructions, not documentation.

## Step 3 — figma-make-guidelines.md (if Figma Make is in use)

A guidelines file the user uploads into Figma Make's Guidelines folder. Design-language content only (Make generates UI, it doesn't run your repo): art-direction summary in concrete terms, token palette by semantic name with values from `design/tokens.md`, type scale, spacing rhythm, dark-first, a11y floor (contrast AA, 44px targets), the banned list from `design/taste-rules.md`. End with: "components must map to the project's design system — flag anything that has no token."

## Step 4 — Verify + report

1. Each generated file carries the header line "generated from DESIGN.md — do not hand-edit; regenerate via `sync-executor-context`".
2. Diff against the previous version and present the changes (this is the drift report — what other executors were working with stale, and for how long if git history shows it).
3. Remind once: figma-make-guidelines.md requires a manual re-upload into Make — the file on disk doesn't update Make by itself. That step is human-only.

## Forbidden

- Hand-edits to generated files (fix the source doc, regenerate).
- Generating for executors the project doesn't use — context nobody reads is maintenance debt.
- Inventing values not present in the source docs.
