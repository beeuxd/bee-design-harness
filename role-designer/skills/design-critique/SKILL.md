---
name: design-critique
description: Run a structured design critique — of a screen, flow, component, or Figma frame — grounded in the project's written standards rather than personal taste. Use when someone asks to "critique this design", "give feedback on this screen", "review this mockup", or wants a design feedback session structured.
---

# Design critique

Critique is comparison against a standard. In this harness the standards are written down, so a
critique cites them — `docs/design-system.md` (art direction), `design/taste-rules.md`,
`design/tokens.md`, `docs/ux-principles.md` — instead of arguing taste. Read those first;
if there's no art direction section, stop and run `art-direction` before critiquing anything.

## Before the critique — three questions

1. **What stage is this?** Concept sketch, wireframe, or hi-fi? Critiquing polish on a wireframe
   or structure on a near-final screen wastes the round.
2. **What decision does this feedback serve?** "Choosing between these two" needs comparative
   critique; "about to build this" needs a blocking-issues pass.
3. **What's already locked?** Don't relitigate settled decisions — flag disagreement once,
   point at the record, move on.

## The three passes (in order — don't skip ahead)

1. **Purpose & hierarchy.** What is this screen for, and does the visual weight agree? Squint
   test: does the most important thing win? Does the primary action read as primary at 360px?
2. **Flow & state.** Walk it as the user: entry point, happy path, and then every state the
   mockup forgot — empty, loading, error, long-content, both themes. Per problem/MoSCoW
   cross-check: any UI serving no traced need, any Must with no home on screen (`wireframe-loop`
   territory — cite it).
3. **Craft.** Token compliance (any value not in `design/tokens.json` is a finding, not a
   preference), spacing rhythm, type scale, contrast ≥ AA, tap targets ≥ 44×44px, alignment,
   taste-rules violations by name.

## Delivering findings

- Format per finding: **observation → standard it violates → severity → suggestion**.
  "The CTA is `#7C3AED`, which isn't in the palette (tokens.md) — blocker — use `accent.primary`."
- Severity: **blocker** (violates a gate or standard) / **should-fix** (hurts the goal) /
  **consider** (judgment call, stated as one).
- Questions before verdicts where intent is unclear: "what's the intended reading order here?"
  beats guessing wrong.
- Praise what works and *why it works* — a critique that only lists faults teaches nothing.

## Receiving critique (when the user critiques our output)

Every correction is an asset: capture it as a standing rule via `taste-retro` so the same note
never has to be given twice. Push back only with evidence (a standard, a constraint, data) —
then the user rules.
