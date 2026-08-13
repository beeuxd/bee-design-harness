# Bee Design Harness

An HX-first design harness for AI-assisted product design, packaged as Claude Code plugins. The human directs; agents execute inside evidence loops and hard gates.

```
quote → INS → PROB → FEAT (MoSCoW) → wireframe region → token/Figma value
```

## Plugins

| Plugin | What | Install when |
|---|---|---|
| `harness-core` | The 5 evidence loops (insight → problem → ideation → wireframe → hifi-gate), token/Figma gates, guard hooks, `scaffold-project`, qa + researcher agents | Always — every role pack depends on it |
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

Then in the project: `/harness-core:scaffold-project` — installs DESIGN.md, docs/, design/, and the token pipeline into the repo (plugins ship behaviors; the scaffold skill writes the documents).

## How it works

Read `harness-core/skills/scaffold-project/templates/DESIGN.md` — it's the whole philosophy: director model (steerability, transparency at the right altitude, intervention points), sources of truth with precedence (tokens.json > Figma > Storybook > narrative docs), the loop pipeline, and the hard gates no executor may bypass (token-only styling, hifi-gate's "not 100% right = no push-through", WCAG 2.2 AA, the performance budget, dark-first at 360–1920px).

## Status

- `harness-core` — complete (10 skills, 2 hooks, 2 agents, scaffold templates)
- `role-*` — agents defined; skill packs being curated from a 125-skill library (dedupe in progress)
