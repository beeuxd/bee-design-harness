export const meta = {
  name: 'variant-tournament',
  description: 'Parallel design exploration: 5 agents design the same screen from different angles, a judge panel scores them against the art direction and taste rules, the director picks the winner',
  whenToUse: 'When a screen/section needs real visual exploration, not one attempt iterated. Requires an "## Art direction" section in docs/design-system.md (hard gate). Token-heavy: ~8 agents.',
  phases: [
    { title: 'Generate', detail: 'five design directions, one angle each' },
    { title: 'Judge', detail: 'three judges score all variants against the written standards' },
  ],
}

// args: a string naming the screen/section and any constraints,
// e.g. "pricing page hero — must hold 3 tiers, CTA above the fold at 360px".
const brief = typeof args === 'string' && args.trim() ? args.trim() : null
if (!brief) throw new Error('variant-tournament needs a brief: which screen/section, and its constraints.')

const STANDARDS = `Read first, treat as law: docs/design-system.md (especially the "## Art direction" section — if it does not exist, STOP and report that art-direction must run first), design/taste-rules.md, design/tokens.json (every value you specify must be an existing token or an explicitly proposed new one), docs/ux-principles.md.`

const VARIANT_SCHEMA = {
  type: 'object',
  required: ['angle', 'summary', 'layout', 'type', 'color', 'motion', 'standout', 'specPath'],
  properties: {
    angle: { type: 'string' },
    summary: { type: 'string', description: 'the direction in two sentences' },
    layout: { type: 'string', description: 'structure and hierarchy, mobile-first (360px described first)' },
    type: { type: 'string', description: 'type treatment using the token scale' },
    color: { type: 'string', description: 'color usage — token names only, both themes' },
    motion: { type: 'string', description: 'motion notes incl. the reduced-motion variant' },
    standout: { type: 'string', description: 'the one idea that makes this variant worth stealing even if it loses' },
    specPath: { type: 'string', description: 'where the full spec was written (docs/specs/variants/<angle>.md)' },
  },
}

const SCORES_SCHEMA = {
  type: 'object',
  required: ['scores'],
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        required: ['angle', 'score', 'reasoning', 'stealWorthy'],
        properties: {
          angle: { type: 'string' },
          score: { type: 'number', minimum: 1, maximum: 10 },
          reasoning: { type: 'string' },
          stealWorthy: { type: 'string', description: 'best idea in this variant worth grafting onto the winner, or "none"' },
        },
      },
    },
  },
}

const ANGLES = [
  ['type-led', 'Typography carries the design: scale contrast, editorial rhythm, type as the hero element. Color and ornament recede.'],
  ['color-led', 'Color does the heavy lifting: bold use of the palette within its per-color rules, blocking, contrast moments. Type stays disciplined.'],
  ['layout-led', 'Structure is the statement: an unexpected but readable grid, asymmetry, negative space as material. Type and color stay quiet.'],
  ['motion-led', 'Designed around its motion moments: what animates, when, and why — the static frame is composed to make the motion land. Within the performance budget and reduced-motion always answered.'],
  ['density-led', 'Interrogate density: either radically minimal (cut until it hurts) or confidently dense (rich, layered, information-forward) — whichever the art direction can carry. Justify the choice.'],
]

phase('Generate')
log(`variant-tournament: 5 angles on "${brief}"`)

const variants = (
  await parallel(
    ANGLES.map(([key, stance]) => () =>
      agent(
        `You are one of five designers in a variant tournament. Brief: ${brief}. Your assigned angle — ${key}: ${stance} ${STANDARDS} Produce a full design-direction spec (not code): layout/hierarchy mobile-first, type treatment, color mapping (token names, both themes), motion notes, states (empty/loading/error). Write the complete spec to docs/specs/variants/${key}.md, then return the structured summary. Stay inside the art direction — the angle is an emphasis within it, never a replacement for it.`,
        { label: `design:${key}`, phase: 'Generate', schema: VARIANT_SCHEMA }
      )
    )
  )
).filter(Boolean)

if (variants.length < 2) throw new Error(`Only ${variants.length} variant(s) produced — not enough for a tournament. Check the art-direction gate.`)

// Barrier is deliberate: every judge must see ALL variants to rank them.
phase('Judge')
const summaries = variants.map((v) => `[${v.angle}] ${v.summary} | layout: ${v.layout} | standout: ${v.standout} | full spec: ${v.specPath}`).join('\n')

const JUDGES = [
  ['art-direction-fidelity', 'Which variant most IS the written art direction — not generically nice, but this project\'s aesthetic executed with conviction? Penalize anything that could ship on any other product.'],
  ['taste-and-craft', 'Judge against design/taste-rules.md rule by rule, plus craft: hierarchy, spacing rhythm, restraint, anti-slop. Cite rules by name in your reasoning.'],
  ['problem-fit', 'Judge against the brief\'s job and docs/ux-principles.md: does the design serve the user\'s task at 360px first, are the Musts dominant, do the states hold up? Beauty that fights the task loses points.'],
]

const judgeResults = (
  await parallel(
    JUDGES.map(([key, charge]) => () =>
      agent(
        `You are the ${key} judge in a design variant tournament. ${STANDARDS} Read each variant's full spec file. Your charge: ${charge}\nThe ${variants.length} variants:\n${summaries}\nScore every variant 1-10 with reasoning; name each variant's steal-worthy idea.`,
        { label: `judge:${key}`, phase: 'Judge', schema: SCORES_SCHEMA }
      )
    )
  )
).filter(Boolean)

const totals = {}
for (const jr of judgeResults) for (const s of jr.scores) totals[s.angle] = (totals[s.angle] || 0) + s.score
const bracket = variants
  .map((v) => ({ angle: v.angle, total: totals[v.angle] || 0, summary: v.summary, specPath: v.specPath, standout: v.standout }))
  .sort((a, b) => b.total - a.total)

const steals = judgeResults
  .flatMap((jr) => jr.scores)
  .filter((s) => s.stealWorthy && s.stealWorthy.toLowerCase() !== 'none' && s.angle !== bracket[0].angle)
  .map((s) => `[from ${s.angle}] ${s.stealWorthy}`)

log(`variant-tournament: winner ${bracket[0].angle} (${bracket[0].total} pts)`)
return {
  brief,
  bracket,
  judgeDetail: judgeResults,
  stealList: [...new Set(steals)],
  note: 'The winner is a recommendation, not a decision — present the bracket, spec paths, and steal-list to the director. On approval, the winning spec (plus approved steals) feeds hifi-gate; record why it won in design/taste-rules.md via taste-retro.',
}
