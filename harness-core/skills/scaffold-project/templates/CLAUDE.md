# CLAUDE.md — {{PROJECT_NAME}}

Auto-loaded by Claude Code at the start of every session. Read the referenced docs before making non-trivial changes.

---

## Project in one sentence

{{PROJECT_DESCRIPTION}}

## Aesthetic in one sentence

{{AESTHETIC}}

## Read these first (in this order)

1. `DESIGN.md` — the tool-neutral design harness: how the human directs, the pipeline, sources of truth, hard gates
2. `docs/project.md` — mission, audiences, goals
3. `docs/prd.md` — product requirements
4. `docs/design-system.md` — tokens, type, color, motion
5. `docs/ux-principles.md` — UX heuristics and anti-patterns
6. `docs/trust-scaffolding.md` — T.R.U.S.T. standard for AI-powered features
7. `docs/user-flows.md` — user journeys and flow maps
8. `docs/tech.md` — stack, folder structure, performance budget
9. `design/tokens.json` — DTCG token source of truth
10. `design/tokens.md` — human-readable token reference
11. `design/components.md` — component inventory + Figma mapping
12. `design/patterns.md` — reusable UI and interaction patterns
13. `design/accessibility.md` — WCAG 2.2 AA checklist

Research and ideation artifacts live in `docs/research/` (raw data, insights, problems, personas) and `docs/ideation/` (feature tree, wireframe matrices) — the traceability chain is `quote → INS → PROB → FEAT → screen region → token`.

For specific tasks, Claude Code auto-invokes the matching skill from the library below.

## The skill library

**REBUILT (2026-08-13).** The previous 31-skill batch is archived at `.claude/skills-legacy-2026-08-13.tar.gz`; the harness-first batch is built around the Design Harness structure in `DESIGN.md`: the 5 evidence loops, their dependencies, and the restored 9-skill quality-gate suite, shipped via the `harness-core` plugin. Role packs (role-designer, role-engineer, role-pm, role-copywriter, ...) add role-specific skills when installed.

19 skills ship with `harness-core`. Claude Code picks them by description; you can also invoke one directly with `/<name>`.

**Research & ideation loops — evidence-first, each iterates (max 5 rounds) until its convergence check passes, keeps a director's ledger, and exits only on your verdict:**

| Skill | What |
|---|---|
| `insight-loop` | Raw research → traced insights; adversarial trace-back until zero meaning drift → `docs/research/insights.md` |
| `problem-loop` | Insights → problem statements; challenge rounds until every clause maps to evidence → `docs/research/problems.md` |
| `ideation-loop` | Problems → empathy map/JTBD/journey/HMW (picked per problem) → MoSCoW feature tree, every node traced → `docs/ideation/feature-tree.md` |
| `wireframe-loop` | Lo-fi Figma frames cross-checked against problems + MoSCoW: no orphan UI, no homeless Musts → `docs/ideation/wireframes.md` |
| `hifi-gate` | Wireframe → high fidelity under a hard gate: zero token drift, every value token-bound. **Not 100% right = no push-through** |

**Loop dependencies (kept so nothing dangles):**

| Skill | What |
|---|---|
| `design-tokens-sync` | Reconcile Figma variables ↔ `design/tokens.json` drift — hifi-gate runs this as lock 1 |
| `from-figma` | Build from a Figma design — two-source rule; consumes hifi-gate's evidence |
| `art-direction` | Once per project, before ANY visual work: interview → written art direction. **Visual work stops if this doesn't exist** |
| `taste-retro` | Every design correction becomes a standing rule in `design/taste-rules.md` — how loop steering compounds |
| `storybook-component` | Story-per-component discipline; the Storybook MCP is queried before building anything new |

**Quality gates — evidence required, no gate = no ship:**

| Skill | What |
|---|---|
| `ship` | Pre-ship gate: parallel lens reviews → honest SHIP / NO-SHIP verdict |
| `verify-before-done` | Before the words "done" / "fixed" — evidence required |
| `visual-qa` | Playwright screenshots at the three review widths (360/768/1440, dark-first) + design review |
| `a11y-audit` | WCAG 2.2 AA, automation-first (axe via Playwright) |
| `performance-check` | Core Web Vitals budget gate — fail = no ship |
| `e2e-test` | Playwright suites per feature (5-spec structure) |
| `design-system-audit` | Token-compliance sweep of the codebase |
| `review-ux` | State-coverage matrix + UX completeness |
| `parallel-review` | Fan out subagent lens-reviews for big audits |

`design/taste-rules.md` ships seeded with universal anti-slop rules and is read before every visual build and review.

## Safeguards (hooks)

Two hooks run automatically via `.claude/settings.json`:

- **`design-system-guard`** (PostToolUse) — after every file write, hardcoded colors / arbitrary spacing / inline color styles are reported straight back to Claude so they get fixed in the same turn.
- **`protected-files-guard`** (PreToolUse) — edits to `design/tokens.json`, `CLAUDE.md`, or `.claude/settings.json` always trigger a user-confirmation prompt, even in auto-accept mode.

## The team (agents)

This project uses 7 specialized agents under `.claude/agents/`. Delegate to the right one:

| Agent | Role | When to invoke |
|---|---|---|
| `pm` | The Strategist | Product questions, PRDs, requirements, scoping, prioritization |
| `researcher` | The Devil's Advocate | Challenge assumptions, find faults in PRD/architecture, ask "why do we need this?" |
| `architect` | The Architect | Page structure, IA, user flows, interaction patterns, responsive specs |
| `backend-dev` | The API Architect | Define API contracts, endpoints, data models — specs for developer handoff |
| `ui-designer` | The Crafter | Design system, Figma, tokens, visual consistency, component styling |
| `frontend-engineer` | The Builder | React/TS implementation, performance, accessibility, code quality |
| `qa` | The Gatekeeper | E2E Playwright tests, auto-launches after frontend is done |

### Typical flow for a new feature

0. Research exists? Run the loops first: `/insight-loop` → `/problem-loop` → `/ideation-loop` — evidence-traced problems and a MoSCoW feature tree seed everything below. (No research material → start at 1; PM discovery will note the evidence-first path.)
1. **pm** defines requirements, asks hard questions, writes to `docs/prd.md` (seeded from the feature tree when it exists)
2. **researcher** challenges the PRD — finds faults, asks "why?", stress-tests assumptions
3. **architect** structures the experience — IA, flows, hierarchy, responsive specs; `/wireframe-loop` validates the screens against problems + MoSCoW
4. **backend-dev** defines API contracts and data models needed — writes specs for developer handoff
5. **ui-designer** applies visual system via `/hifi-gate` — no hi-fi on drifted tokens, no build handoff with unbound values
6. **frontend-engineer** implements it all (via `from-figma`, citing the gate evidence)
7. **qa** runs E2E Playwright tests across all viewports
8. Run `/ship` macro — review-ux + a11y-audit + performance-check + design-system-audit (+ T.R.U.S.T. lens on AI surfaces)

### Ticket workflow

Before implementation begins, set up a GitHub Projects board, then generate work tickets for each module/feature from the specs — GitHub Issues with labels and acceptance criteria, linked to the board (use `gh`, or a role pack's ticket skills if installed).

For small tasks, skip agents and just do the work directly. Agents are for delegation when context or specialization helps.

---

## Non-negotiables

- **Accessibility first.** Semantic HTML, keyboard nav, visible focus rings, contrast AA minimum. WCAG 2.2 AA is the baseline. Every animation respects `prefers-reduced-motion`.
- **Responsive by default — not as an afterthought.** Every component, section, and page must work at **360 / 768 / 1024 / 1440 / 1920+ px**. Don't ship desktop-first layouts with a "mobile fix" bolted on.
- **Mobile-first.** Works on 360px before desktop.
- **Three-layer responsive.** Viewport breakpoints (`sm:`/`md:`) for page layout. Container queries (`@container` + `@sm:`/`@md:`) for reusable components. Fluid `clamp()` for typography and gradual scaling.
- **Sizing hits real humans.** Interactive elements meet **44×44px minimum tap target** on touch. Primary CTAs are generous (44–52px tall). Never ship shadcn defaults unchanged — they're app-sized, not site-sized.
- **No layout shift.** Reserve space for images, fonts, dynamic content. CLS ≤ 0.1.
- **Performance budget.** LCP ≤ 2.5s, INP ≤ 200ms, TBT < 200ms on mid-tier mobile. JS first-load < 150KB gzipped.
- **Dark mode is primary.** The default theme is dark. Design, build, and test in dark mode first. Light mode is secondary — implement only when explicitly requested.
- **No generic AI aesthetic.** No default Inter, no purple gradients, no glassmorphism unless it's in your design system.
- **Content-first.** If copy is missing, flag it — don't invent marketing claims.

---

## How I want Claude Code to work

- **Orient before coding.** Re-read this file and the current scope at the top of every session. Stuck after 2 attempts? Stop, report findings, ask. Nothing is "done" without `verify-before-done` evidence.
- **No visual work without direction.** If `docs/design-system.md` has no art direction section, stop and run `art-direction` first. Read `design/taste-rules.md` before building or reviewing anything visual.
- **Small, verifiable steps.** One component or section at a time. Show me the file before moving on.
- **Ask before assuming.** Design or content unclear? Ask — don't pick for me.
- **shadcn as foundation, then restyle.** Never ship default shadcn look. Every primitive gets the project treatment (see `docs/design-system.md`).
- **Token-only styling.** All colors, spacing, radius, and typography reference design tokens from `design/tokens.json`. No hardcoded hex, no arbitrary px values. The CSS is generated: after any approved token change, run `pnpm tokens` (`scripts/build-tokens.mjs` → `app/tokens.css`) — never hand-edit `tokens.css`.
- **Comment the "why", not the "what".** Especially in complex layouts and interaction patterns.

---

## Context & new-chat protocol

This project will run across many chat sessions. To stay efficient and avoid context drift:

### When to suggest a new chat

Proactively tell me to start a new chat when **any** of these happen:

1. We've been working for more than ~90 minutes in one thread
2. The conversation has more than ~40 back-and-forth messages
3. You notice you're repeating yourself, losing earlier context, or re-asking questions I already answered
4. We're switching to a clearly different scope
5. I say "this is getting slow" or similar
6. You can tell the context window is getting heavy

### What to do when you suggest it

Generate a **handoff summary** — one copy-paste block: current scope, decisions made, files touched, next steps. I'll paste it into the new chat to resume.

### At the start of any new chat

If my first message contains a Handoff block:
1. Acknowledge it in one line.
2. Re-read `CLAUDE.md` and any docs mentioned under "Current scope."
3. Ask one clarifying question before writing code.
4. Do NOT dump the handoff back at me.

---

## Repo conventions

- Branch: `feature/short-description` — no commits directly to `main`
- Commits: conventional (`feat:`, `fix:`, `chore:`, `style:`, `docs:`)
- Every new component gets a working usage example in `design/components.md`
- No hardcoded colors — use tokens from the design system
- No hardcoded spacing — use the Tailwind scale
- TypeScript strict mode. No `any` without a `// TODO` comment explaining why

---

## Stop and ask me before

- Introducing a new dependency (weigh against existing stack)
- Changing design system tokens
- Adding a new page not in `docs/prd.md`
- Anything that touches analytics, privacy, or third-party embeds
- Deploying to production

---

## The standard — boil the ocean

> The marginal cost of completeness is near zero with AI. Do the whole thing. Do it right. Do it with tests. Do it with documentation. Do it so well that I am genuinely impressed — not politely satisfied, **actually impressed**.
>
> Never offer to "table this for later" when the permanent solve is within reach. Never leave a dangling thread when tying it off takes five more minutes. Never present a workaround when the real fix exists. The standard isn't "good enough" — it's **"holy shit, that's done."**
>
> Search before building. Test before shipping. Ship the complete thing. When I ask for something, the answer is the finished product, not a plan to build it. Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse. **Boil the ocean.**

### What this means in practice

- **Real fix, not a patch.** If a symptom shows up, find the root cause. Don't paper over it.
- **Verify with screenshots / logs / actual page state.** Don't trust that "compile passed" means "renders correctly."
- **Sweep all viewports.** 360, 768, 1024, 1440, 1920+ — every change.
- **Search the codebase first.** Existing helpers, patterns, components — find them before adding new ones.
- **Tie off the thread the same turn.** If a queued sub-task is "5 more minutes," do it now.
- **Show evidence of completeness.** Screenshot the result. List what was verified.
- **No "I'll come back to this."** If you say it, you don't ship. Either fix it or hand off with a clear next step.
