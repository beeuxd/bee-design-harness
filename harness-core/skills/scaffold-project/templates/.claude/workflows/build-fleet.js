export const meta = {
  name: 'build-fleet',
  description: 'Build several independent components/sections in parallel, each in its own git worktree, each verified before it reports back — no file conflicts, no waiting in line',
  whenToUse: 'When 3+ independent components/sections are specced and ready to build (gate evidence exists). NOT for interdependent work (shared new files, one component consuming another in the same run). Grounding: human review capacity is the verified bottleneck on parallel agents (see harness logs/ade-research-2026-09.md) — fleet only work whose review is cheap (isolated diffs, glanceable), and merge serially. Token- and disk-heavy: 2 agents + 1 worktree per component.',
  phases: [
    { title: 'Build', detail: 'one builder per component, worktree-isolated' },
    { title: 'Verify', detail: 'fresh verifier reads each worktree diff against the standards' },
  ],
}

// args: an array of component briefs, each a string:
//   ["PricingCard — spec docs/specs/pricing-card.md, Figma <url>, gate evidence in wireframes.md Gate Ledger",
//    "Testimonials section — spec docs/specs/testimonials.md, ..."]
// Every brief must point at its spec/Figma source and its gate evidence.
const briefs = Array.isArray(args) ? args.filter((b) => typeof b === 'string' && b.trim()) : []
if (briefs.length < 2) throw new Error('build-fleet needs an array of 2+ independent component briefs (each naming its spec + gate evidence). For a single component, build it directly — no fleet needed.')

const HOUSE = `House standard (non-negotiable): token-only styling from design/tokens.json (no hardcoded hex, no arbitrary px), responsive at 360/768/1024/1440/1920, WCAG 2.2 AA (44x44 targets, visible focus, reduced-motion), both themes, follow docs/design-system.md Art direction + design/taste-rules.md. shadcn primitives get the project restyle, never the default look.`

const BUILD_SCHEMA = {
  type: 'object',
  required: ['component', 'branch', 'worktreePath', 'files', 'status', 'notes'],
  properties: {
    component: { type: 'string' },
    branch: { type: 'string', description: 'output of `git branch --show-current` in the worktree' },
    worktreePath: { type: 'string', description: 'output of `pwd` in the worktree' },
    files: { type: 'array', items: { type: 'string' }, description: 'files created/modified' },
    status: { type: 'string', enum: ['built', 'blocked'] },
    notes: { type: 'string', description: 'if blocked: exactly what is missing (spec gap, missing token, dependency). Never guess past a gap.' },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['component', 'pass', 'findings'],
  properties: {
    component: { type: 'string' },
    pass: { type: 'boolean' },
    findings: { type: 'array', items: { type: 'object', required: ['title', 'evidence', 'severity'], properties: {
      title: { type: 'string' }, evidence: { type: 'string', description: 'file:line' }, severity: { type: 'string', enum: ['blocker', 'should-fix', 'nit'] },
    } } },
  },
}

phase('Build')
log(`build-fleet: ${briefs.length} components, one worktree each`)

const results = await pipeline(
  briefs,
  (brief) =>
    agent(
      `Build exactly one component in this isolated worktree. Brief: ${brief}. Follow the from-figma discipline where a Figma source is named (variables as truth, never eyeball screenshots; cite the gate evidence) and the component's written spec otherwise. ${HOUSE} Commit your work in the worktree (conventional message). Report branch (git branch --show-current), worktree path (pwd), and files. If the spec has a gap, status=blocked with the exact question — do not invent design decisions.`,
      { label: `build:${brief.slice(0, 40)}`, phase: 'Build', isolation: 'worktree', agentType: 'frontend-engineer', schema: BUILD_SCHEMA }
    ),
  (built, brief) => {
    if (!built || built.status === 'blocked') return built
    return agent(
      `Verify a freshly built component — you did not build it; be strict. Worktree: ${built.worktreePath}, branch: ${built.branch}, files: ${built.files.join(', ')}. Read the diff there and check against the written standards: token-only styling (design/tokens.json), responsive classes/container queries for all five widths, a11y (44x44 targets, focus, reduced-motion, semantic HTML), both themes, taste-rules. Evidence (file:line) per finding; pass=false if any blocker.`,
      { label: `verify:${(built.component || brief).slice(0, 40)}`, phase: 'Verify', schema: VERIFY_SCHEMA }
    ).then((v) => ({ ...built, verification: v }))
  }
)

const fleet = results.filter(Boolean)
const ready = fleet.filter((r) => r.status === 'built' && r.verification && r.verification.pass)
const needsWork = fleet.filter((r) => r.status === 'built' && (!r.verification || !r.verification.pass))
const blocked = fleet.filter((r) => r.status === 'blocked')

log(`build-fleet: ${ready.length} ready, ${needsWork.length} need fixes, ${blocked.length} blocked`)
return {
  ready,
  needsWork,
  blocked,
  note: 'Nothing is merged. Present per-component branches + verification to the director; merge approved branches one at a time from the main session (review diff → merge → delete worktree). Screenshot evidence at the five widths still happens post-merge per verify-before-done — worktree verification is code-level, not pixel-level.',
}
