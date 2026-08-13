# Bee Design Harness

An HX-first design harness for AI-assisted product design, packaged as Claude Code plugins. The human directs; agents execute inside evidence loops and hard gates.

```
quote → INS → PROB → FEAT (MoSCoW) → wireframe region → token/Figma value
```

## Plugins

| Plugin | What | Install when |
|---|---|---|
| `harness-core` | 22 skills — 5 evidence loops + dependencies, the 9-skill quality-gate suite, scaffold-project (full intake: DS/branding/voice/research/executors), recipe-harvest, sync-executor-context (AGENTS.md / replit.md / Figma Make guidelines) | Always — every role pack depends on it |
| `role-designer` | The **default** design agent: design system, a11y, motion, polish, critique, hand-off | Doing design work |
| `role-engineer` | Implement from Figma, ship polished UI, design systems in code, deploy | Shipping code |
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

## How it works

Read `harness-core/skills/scaffold-project/templates/DESIGN.md` — it's the whole philosophy: director model (steerability, transparency at the right altitude, intervention points), sources of truth with precedence (tokens.json > Figma > Storybook > narrative docs), the loop pipeline, and the hard gates no executor may bypass (token-only styling, hifi-gate's "not 100% right = no push-through", WCAG 2.2 AA, the performance budget, dark-first at 360–1920px).

## Status

- `harness-core` — complete (22 skills: loops + gates + scaffold + recipe-harvest + sync-executor-context; 2 hooks; 2 agents)
- `role-*` — built (agents defined, skill packs installed per role)
