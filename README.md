# Bee Design Harness

An HX-first design harness for AI-assisted product design, packaged as Claude Code plugins. The human directs; agents execute inside evidence loops and hard gates.

## Why I made this

I'm a product designer, and I built this because raw AI is not usable for real product work — not for designers, not for PMs, not for founders. Point a model at a one-line prompt and you get generic output: invented requirements, hardcoded values, the same interchangeable aesthetic, claims of "done" with nothing verified. The problem was never the model's capability. It's that nobody hands a new team member zero context and expects craft.

This harness is the context. It gives AI what a good team gives a new hire: written direction (art direction, taste rules, a voice), sources of truth it may not contradict (design tokens, Figma variables, the codebase), a process with evidence at every step (research → insights → problems → features → wireframes → hi-fi → built UI, every link traceable back to a real user quote), and hard gates it cannot talk its way past (token-only styling, WCAG 2.2 AA, performance budgets, "not 100% right = no push-through").

The point is who it's for. Designers direct visual quality without babysitting every prompt — corrections become standing rules that compound. PMs run discovery and validation loops where every feature traces to evidence, not vibes. Founders ship with a full product team's discipline before they can afford the team. You stay the director: the AI executes inside the structure, shows its work, and stops at the decisions that are yours.

```
quote → INS → PROB → FEAT (MoSCoW) → wireframe region → token/Figma value
```

## Plugins

| Plugin | What | Install when |
|---|---|---|
| `harness-core` | 27 skills — 5 evidence loops + dependencies, the 9-skill quality-gate suite, session lifecycle (session-start / handoff-summary / escalation-protocol), ticket workflow (setup-kanban / write-tickets), scaffold-project (full intake: DS/branding/voice/research/executors), recipe-harvest, sync-executor-context (AGENTS.md / replit.md / Figma Make guidelines) | Always — every role pack depends on it |
| `role-designer` | The **default** design agent: design system, a11y, motion, polish, critique, hand-off | Doing design work |
| `role-engineer` | app-bootstrap (Next.js + tokens + Playwright/axe + Storybook), implement from Figma, ship polished UI, GSAP, deploy | Shipping code |
| `role-pm` | Discover & validate (feeds the loops), spec & prioritize | Defining product |
| `role-copywriter` | UX writing, product copy, voice — the harness Content block | Words exist |
| `role-marketer` | SEO, CRO, analytics, launch, brand — post-ship growth | Growing it |
| `role-founder` | Validate, scope ruthlessly, launch, fundraise | Making bets |

## Install

### Before you start

You need two things:

1. **Claude Code** — install it if you haven't: `npm install -g @anthropic-ai/claude-code` (or download the desktop app), then run `claude` once and log in.
2. **Access to this repo** — it's private for now, so you must be logged into a GitHub account that can see it. Check with `gh auth status`; if that fails, run `gh auth login` first.

### Step 1 — Add the marketplace (once per machine)

This tells Claude Code where the plugins live. You only ever do this once:

```bash
claude plugin marketplace add beeuxd/bee-design-harness
```

### Step 2 — Install the plugins into your project (once per project)

`cd` into your project folder (create an empty one if you're starting fresh), then:

```bash
claude plugin install harness-core@bee-design-harness --scope project
claude plugin install role-designer@bee-design-harness --scope project
```

`harness-core` is always required. `role-designer` is the default second install — swap or add roles from the table above based on what the project needs (shipping code? add `role-engineer`; in discovery? add `role-pm`). You can add more roles later at any time.

`--scope project` records the install in the project itself, so anyone else opening this project in Claude Code gets prompted to install the same plugins.

> Prefer working inside a session? The same two steps work as slash commands: `/plugin marketplace add beeuxd/bee-design-harness`, then `/plugin install harness-core@bee-design-harness`.

### Step 3 — Scaffold the project (once per project)

Open Claude Code in the project folder and run:

```
/harness-core:scaffold-project
```

It asks one batch of intake questions (project name, aesthetic, existing design system / branding / voice, research material, which other AI tools you use), then writes the whole document tree: `DESIGN.md`, `CLAUDE.md`, `AGENTS.md`, `docs/`, `design/`, `registry/`, the token pipeline, and the CI gate workflow. Plugins ship the *behaviors*; this step writes the *documents* they operate on.

### Step 4 — Verify it worked

- Type `/` in the session — you should see skills like `/harness-core:insight-loop` and `/harness-core:art-direction` in the list.
- `ls` the project — `DESIGN.md`, `docs/`, and `design/tokens.json` should exist.
- Try writing a hardcoded hex color into a `.tsx` file — the design-system guard should flag it immediately. That's the hooks working.

### What to run first

| Your situation | First command |
|---|---|
| Any visual work planned | `art-direction` — the taste interview; visual builds refuse to start without it |
| User-facing copy planned | `voice-guide` — same idea, for words |
| You have research material (interviews, tickets, surveys) | `/harness-core:insight-loop` — starts the evidence pipeline |
| None of the above yet | Just start working — the skills route themselves |

### Updating later

When the harness improves, pull the update into any project:

```bash
claude plugin marketplace update bee-design-harness
```

Never copy skill files into a project's `.claude/skills/` by hand — that's how drift happens (see Integrity below).

## Integrity — keep one source of truth

- **Install, never copy.** Skills reach projects only via the plugin install above. Copying SKILL.md files into a project's `.claude/skills/` creates silent drift the moment the harness improves (this failure was caught in the field on 2026-08-14 — see `repairs-core.md`).
- **Test after every change.** `./test-harness.sh` validates manifests, frontmatter, name collisions, dangling retired-skill references, template completeness, and executes the guard hooks against violation payloads. Pass a project path (`./test-harness.sh ~/my-project`) to also detect copy drift. All green or don't ship.
- **Version on change.** Bump the plugin `version` in `.claude-plugin/plugin.json` when its skills change, so installed projects can see they're behind.
- **Restorations are logged.** Anything revived from a legacy archive gets its dangling references repaired and an entry in `repairs-*.md` — and the RETIRED list in `test-harness.sh` updated.

## How it works

Read `harness-core/skills/scaffold-project/templates/DESIGN.md` — it's the whole philosophy: director model (steerability, transparency at the right altitude, intervention points), sources of truth with precedence (tokens.json > Figma > Storybook > narrative docs), the loop pipeline, and the hard gates no executor may bypass (token-only styling, hifi-gate's "not 100% right = no push-through", WCAG 2.2 AA, the performance budget, dark-first at 360–1920px).

## Status

- `harness-core` — complete (27 skills: loops + gates + session lifecycle + tickets + scaffold + recipe-harvest + sync-executor-context; 3 hooks incl. post-compaction handoff reminder; all 7 agents)
- `role-*` — built (agents defined, skill packs installed per role; engineer includes app-bootstrap, the toolchain installer the gates depend on)
- Guardrails complete: agent-run gate suite + CI twin (`.github/workflows/gates.yml`: e2e/axe/visual-regression, token-guard, security, perf budget) + security lens in /ship
