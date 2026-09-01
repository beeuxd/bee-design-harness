---
name: next-step
description: Answers "what's next?" for the project by reading the pipeline's actual artifact state — which loops have run, what's stale, which gate is unmet — and routing to the right skill or agent. Use when the user asks "what's next", "where are we", "what now", "status", "which loop do we run", or seems unsure what stage the project is in.
---

# Next step — pipeline-aware routing

The pipeline's position is never a matter of memory — it's derivable from the artifacts on
disk. This skill reads them and routes. It never advances anything itself.

## Step 1 — run the detector

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/pipeline-status.js"
```

(The same detector runs automatically on session start.) It prints the chain
(research → insights → problems → features → prd → wireframes → art-direction → hifi-gate),
the suggested next step, and any staleness flags (upstream artifact changed after its
downstream was derived).

## Step 2 — verify before recommending

The detector reads file state; you confirm meaning before routing:

- **Open the artifact at the boundary.** If the detector says "/problem-loop next", skim
  `docs/research/insights.md` — are the insights Active (not all Parked/Killed)? A chain
  position built on dead artifacts routes backward, not forward.
- **Check for an unanswered verdict.** Each loop ends awaiting the director's ruling — look at
  the ledger sections (e.g., the Gate Ledger, loop ledgers) for a final entry with no
  recorded verdict. An awaiting-verdict loop outranks any next step: surface it to the user
  first.
- **Honor the hard gates.** No visual work without `## Art direction` in
  `docs/design-system.md`; no build handoff without Gate Ledger evidence; both themes and all
  five widths before "done". If the user asks to skip ahead, name the gate and what it costs.

## Step 3 — recommend

One short recommendation: current position (one line), the next step and *why the artifacts
say so*, and — only if present — staleness or pending-verdict warnings. Offer to run the
routed skill; don't auto-run it.

## Redesigns and brownfield projects

A redesign of an existing product often enters mid-pipeline. That's legitimate — but the
entry point must be evidenced, not assumed: an existing product's analytics, support tickets,
and user complaints ARE raw research — file them under `docs/research/raw/` with sources and
run the loops on them. What a redesign never skips: art-direction (re-run the interview; the
old aesthetic is a *candidate*, not a default) and the gates.
