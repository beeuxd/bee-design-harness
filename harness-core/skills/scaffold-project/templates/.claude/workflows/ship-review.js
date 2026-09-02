export const meta = {
  name: 'ship-review',
  description: 'Pre-ship gate: parallel lens reviews, every finding adversarially verified before it reaches the director',
  whenToUse: 'Invoked by the ship skill (or directly) when work is claimed finished and needs a go/no-go review. Token-heavy: spawns ~10-20 agents.',
  phases: [
    { title: 'Review', detail: 'one agent per lens (a11y, tokens, performance, ux-states, visual)' },
    { title: 'Verify', detail: 'one adversarial verifier per finding' },
  ],
}

// args: a string describing the review target — pages/routes/components/diff scope,
// and how to reach the running app if one is needed (e.g. "http://localhost:3000 — /pricing and /signup, both themes").
const target = typeof args === 'string' && args.trim() ? args.trim() : 'the full current diff and every page it touches'

const SOURCES = `Sources of truth (read them, never invent values): design/tokens.json, docs/design-system.md (incl. the Art direction section), design/taste-rules.md, design/accessibility.md, docs/tech.md (performance budget).`

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'evidence', 'severity', 'lens'],
        properties: {
          title: { type: 'string' },
          file: { type: 'string', description: 'file path if applicable' },
          line: { type: 'number' },
          evidence: { type: 'string', description: 'file:line or a measured value (e.g. "LCP 3.1s at /pricing, 360px"). Findings without hard evidence are discarded.' },
          severity: { type: 'string', enum: ['blocker', 'should-fix', 'nit'] },
          lens: { type: 'string' },
          fix: { type: 'string', description: 'what right looks like, one line' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['isReal', 'reasoning'],
  properties: {
    isReal: { type: 'boolean' },
    reasoning: { type: 'string' },
    adjustedSeverity: { type: 'string', enum: ['blocker', 'should-fix', 'nit'] },
  },
}

const LENSES = [
  { key: 'a11y', prompt: `You are the accessibility lens of a pre-ship review. Target: ${target}. ${SOURCES} Audit against WCAG 2.2 AA and the house rules that exceed it (44x44px targets, visible focus, both themes contrast-checked, prefers-reduced-motion on every animation). Keyboard-walk the flows if a running app is reachable. Report only violations you can evidence.` },
  { key: 'tokens', prompt: `You are the design-token lens of a pre-ship review. Target: ${target}. ${SOURCES} Find every hardcoded color/spacing/radius/type value that bypasses design/tokens.json, every arbitrary value (p-[13px]), every unlisted font, and any default-shadcn styling that shipped unstyled. Each finding cites file:line.` },
  { key: 'performance', prompt: `You are the performance lens of a pre-ship review. Target: ${target}. ${SOURCES} Check against the budget in docs/tech.md (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, JS first-load < 150KB gzipped). Measure where possible (build output, Lighthouse if available); flag unmeasurable claims as such rather than guessing.` },
  { key: 'ux-states', prompt: `You are the UX-states lens of a pre-ship review. Target: ${target}. ${SOURCES} Walk every state the happy path hides: empty, loading, error, long-content, offline-ish failures, and both themes at 360/768/1024/1440/1920px. A state that renders broken or was never designed is a finding.` },
  { key: 'visual', prompt: `You are the visual-QA lens of a pre-ship review. Target: ${target}. ${SOURCES} Compare what renders against the art direction and taste rules: hierarchy, spacing rhythm, alignment, type scale, anti-slop rules from design/taste-rules.md. Screenshot evidence via Playwright if a running app is reachable; otherwise review the code's rendered structure and say screenshots were unavailable.` },
]

phase('Review')
log(`ship-review: ${LENSES.length} lenses over "${target}"`)

const results = await pipeline(
  LENSES,
  (l) => agent(l.prompt + ' Return findings via the schema; no prose report.', { label: `lens:${l.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  (review, l) =>
    review && review.findings.length
      ? parallel(
          review.findings.map((f) => () =>
            agent(
              `Adversarially verify this pre-ship finding — your default stance is REFUTE. Finding: "${f.title}" | lens: ${f.lens} | evidence: ${f.evidence} | file: ${f.file || 'n/a'}:${f.line || ''}. Re-check the evidence yourself in the codebase/app. It is real only if the evidence holds AND it violates a written standard (tokens.json, design-system.md, taste-rules.md, accessibility.md, tech.md budget) — style opinions without a standard are not findings. If uncertain, isReal=false.`,
              { label: `verify:${f.lens}:${(f.file || f.title).slice(0, 30)}`, phase: 'Verify', schema: VERDICT_SCHEMA }
            ).then((v) => ({ ...f, verdict: v }))
          )
        )
      : []
)

const all = results.filter(Boolean).flat().filter(Boolean)
const confirmed = all.filter((f) => f.verdict && f.verdict.isReal)
  .map((f) => ({ ...f, severity: (f.verdict.adjustedSeverity || f.severity) }))
const refuted = all.length - confirmed.length
const order = { blocker: 0, 'should-fix': 1, nit: 2 }
confirmed.sort((a, b) => order[a.severity] - order[b.severity])

log(`ship-review: ${confirmed.length} confirmed (${refuted} refuted by verification)`)
return {
  target,
  confirmed,
  refutedCount: refuted,
  blockers: confirmed.filter((f) => f.severity === 'blocker').length,
  note: 'The SHIP / NO-SHIP verdict is the director\'s, made in-session per the ship skill — this workflow only gathers verified evidence. Zero blockers is necessary, not sufficient.',
}
