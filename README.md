# Bee Design Harness

An HX-first design harness for AI-assisted product design, packaged as Claude Code plugins. The human directs; agents execute inside evidence loops and hard gates.

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

```bash
claude plugin marketplace add <this-repo-url-or-path>
claude plugin install harness-core@bee-design-harness --scope project
claude plugin install role-designer@bee-design-harness --scope project   # the default role
# add other roles as needed
```

Then in the project: `/harness-core:scaffold-project` — runs the intake (existing design system / branding / voice / research / executors) and installs DESIGN.md, AGENTS.md, docs/, design/, registry/, and the token pipeline (plugins ship behaviors; the scaffold skill writes the documents).

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
