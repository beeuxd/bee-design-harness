# DESIGN.md — {{PROJECT_NAME}}

The tool-neutral entry point to this project's design harness. Any executor — Claude Code, Cursor, Codex, or a human — reads this before doing design work. (Claude Code additionally loads `CLAUDE.md`, which carries Claude-specific mechanics; nothing here contradicts it.)

---

## How this harness works

The human **directs**; the agent **executes**. The human is not here to approve every click — they set intent in layers, watch a legible ledger of what changed and why, and intervene at defined points. Three rules any executor must honor:

1. **Steerability** — intent arrives in layers, not one-line prompts: art direction and `design/taste-rules.md` are standing intent; MoSCoW priorities in `docs/ideation/feature-tree.md` are per-feature intent; corrections given mid-task are per-iteration intent. Record corrections durably (taste rules, the owning doc) so steering compounds instead of evaporating.
2. **Transparency at the right altitude** — report in flight-manifest form (what changed, why, current confidence — honestly stated, never false precision). Keep raw evidence (quotes, drift tables, screenshots) linked beneath, available for audit, never dumped first. Long-running work narrates progress; unexplained silence breeds distrust faster than failure.
3. **Intervention points** — loop exits are the human's verdict, never agent self-approval. Iteration caps escalate with findings instead of grinding. Hard gates (token gate, protected files, budgets) refuse to proceed regardless of agent confidence.

In T.R.U.S.T. terms (`docs/trust-scaffolding.md`): the ledger is *Reasons & provenance*; honest confidence is *Uncertainty & limits*; verdict exits, caps, gates, and hooks are *Safeguards & user control*; taste-retro's compounding rules are *Track record & repair*; this document's role and gate statements are *Truthful expectations*.

## Step 0 — the standing question

Before ANY visual work on a new project or feature, ask:

> **"Is there an existing design system we should integrate — an npm package, a Figma library, an internal DS — beyond our own style guidelines?"**

- **Yes → integration mode.** Adopt its tokens and components as the base; our docs record only the deltas (overrides, extensions, gaps). Do not build a parallel system.
- **No → our system applies.** `docs/design-system.md` + `design/tokens.json` are law.

Record the answer under "Design system source" in `docs/design-system.md` so it is asked **once per project**, not once per session. If that section already has an answer, don't re-ask.

## The design context (read in this order)

1. `docs/project.md` — mission, audiences, goals
2. `docs/prd.md` — requirements (REQ-IDs)
3. `docs/design-system.md` — art direction, tokens, type, color, motion
4. `docs/ux-principles.md` — UX heuristics and anti-patterns
5. `docs/trust-scaffolding.md` — T.R.U.S.T. standard for AI-powered features
6. `docs/user-flows.md` — user journeys and flow maps
7. `docs/tech.md` — stack, structure, performance budget
8. `design/tokens.json` — DTCG token source of truth
9. `design/tokens.md` — token reference + Figma variable mapping
10. `design/components.md` — component inventory + Figma mapping
11. `design/patterns.md` — reusable UI and interaction patterns
12. `design/accessibility.md` — WCAG 2.2 AA checklist
13. `design/taste-rules.md` — standing taste rules (read before every visual build/review)
14. `docs/research/` + `docs/ideation/` — insights, problems, personas, feature tree, wireframe matrices

## Sources of truth and precedence

When sources disagree, higher wins. Never eyeball what a source of truth can state exactly.

1. **`design/tokens.json`** — every color, spacing, radius, and type value
2. **Figma** — visual intent (layout, composition, component visuals), read via variables, never via screenshot-guessing
3. **Storybook** — coded component behavior and states; its MCP server (`/mcp` on the Storybook dev server, via `@storybook/addon-mcp`) is how agents query what exists before building anything new
4. **`design/components.md` / `design/patterns.md`** — narrative documentation; descriptive, not authoritative

House rules in `CLAUDE.md` override Figma when they conflict (e.g., tap-target minimums).

## The pipeline

```
raw research ──insight-loop──▶ insights ──problem-loop──▶ problems
   ──ideation-loop──▶ personas + feature tree (MoSCoW)
   ──kickoff/challenge──▶ PRD ──flow-map/design-flow──▶ flows + specs
   ──wireframe-loop──▶ validated lo-fi wireframes
   ──hifi-gate──▶ token-clean hi-fi ──from-figma──▶ built UI ──ship──▶ shipped
```

Each `*-loop` iterates (max 5 rounds) until its convergence condition passes, keeps a director's ledger, and exits only on the human's verdict. The spine is one unbroken **traceability chain**:

```
verbatim quote → INS-ID → PROB-ID → FEAT-ID (MoSCoW) → wireframe region → token/Figma value
```

Any link an executor cannot produce evidence for is marked `unvalidated` — visibly, all the way downstream.

## Hard gates (no executor may bypass)

- **Token-only styling.** No hardcoded hex, no arbitrary px. All values reference `design/tokens.json`. Generated CSS (`app/tokens.css`) is never hand-edited.
- **hifi-gate.** No high-fidelity work while HIGH/MEDIUM Figma ↔ tokens drift exists; no build handoff with unbound values. Not 100% right = no push-through.
- **Art direction before visuals.** No art direction section in `docs/design-system.md` → visual work stops.
- **Accessibility.** WCAG 2.2 AA, keyboard nav, visible focus, 44×44px tap targets, `prefers-reduced-motion` respected.
- **Performance budget.** LCP ≤ 2.5s, INP ≤ 200ms, TBT < 200ms, CLS ≤ 0.1, JS first-load < 150KB gz (details: `docs/tech.md`).
- **Responsive.** 360 / 768 / 1024 / 1440 / 1920px, dark mode first.
- **Evidence before "done".** Screenshots, build output, test results — claims without artifacts don't count.
- **Protected files.** `design/tokens.json`, `CLAUDE.md`, `.claude/settings.json` require explicit human confirmation to edit.
