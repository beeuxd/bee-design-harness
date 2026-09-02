---
name: ideation-loop
description: Takes validated problem statements and turns them into evidence-backed ideation — picking the right UX diagram per problem (empathy map, JTBD, journey map, HMW), building personas from insights, and producing a MoSCoW feature tree where every node traces to a problem. Use after problem-loop, or when features need prioritizing against evidence. Trigger phrases: "ideate on this problem", "build the feature tree", "empathy map", "MoSCoW this", "what features should this have", "run the ideation loop". (Writing REQ rows from a settled scope is PM spec work — role-pm; validating wireframes against this tree is wireframe-loop.)
---

# Ideation Loop — problem → diagrams → feature tree

The loop that keeps ideation tethered to evidence: the right UX diagram for the problem type, personas built only from insights, and a feature tree where every Must/Should node traces back to a PROB-ID. Outputs: `docs/research/personas/*.md` and `docs/ideation/feature-tree.md`.

## Loop discipline (applies to every round)

- **Max 5 iterations** → then STOP, present the ledger and the untraceable features / unaddressed problems, ask the user.
- **Director's ledger**: one row per iteration (features added/cut/re-prioritized and why) in the **Director's Ledger** table of `docs/ideation/feature-tree.md`, plus a one-line summary per iteration in chat.
- **Exit is the user's verdict** on the tree + coverage tables. Never self-approve.
- Solution creativity is welcome **inside** the loop; unevidenced solutions just can't leave it unlabeled.

## Step 0 — Locate the upstream evidence

1. Read `docs/research/problems.md`, `docs/research/insights.md`, and the audiences table in `docs/project.md`.
2. **Soft gate:** problems missing or all `Unvalidated` → offer: "Run `/problem-loop` first (recommended), or name the problem directly — the whole tree will carry the `unvalidated bet` label." Record the user's choice.
3. Read `docs/ideation/feature-tree.md`. Existing FEAT-IDs are permanent — append or revise, never renumber.

## Step 1 — Pick the diagram for the problem type

Don't default to one diagram; choose per problem with this table (and say which you chose and why):

| The open question is… | Use | Because |
|------------------------|-----|---------|
| Who is this user, really — what do they say/think/do/feel? | **Empathy map** | Thin user understanding produces feature guesses |
| Why would they use this — motivation, situation, switching trigger? | **Jobs-to-be-Done** | Motivation beats demographics for feature decisions |
| Where in a multi-step experience does the struggle live? | **Journey map** | Point problems hide in flow context |
| Understanding is solid — we need solution directions | **How-Might-We reframing** | Turns an evidenced problem into generative prompts |

More than one may apply; run each that does. If understanding is already strong everywhere, say so and skip to Step 3 — a diagram nobody needed is theater.

## Step 2 — Build the diagram(s), evidence-only

1. Personas: one file per persona in `docs/research/personas/` using that folder's template. **Every cell cites INS-IDs.** No evidence for a quadrant → the cell stays empty and goes in the file's Gaps section. An empty cell is honest; a plausible guess is contamination.
2. Journey maps (when chosen) → add to `docs/user-flows.md` as a flow section per that file's format, stages annotated with INS-IDs.
3. HMW statements (when chosen) → listed at the top of `docs/ideation/feature-tree.md`, each derived from a named PROB-ID.

## Step 3 — Generate the feature tree

1. Ideate broadly against the problems/HMWs — quantity first, judgment second. Include the unconventional candidates; the cross-check pass is what disciplines them.
2. Structure into the tree format of `docs/ideation/feature-tree.md`: FEAT-IDs, parent/child capability nesting.
3. Tag **every node** with the PROB-ID(s) it serves.
4. MoSCoW every leaf with a written rationale (the discipline definitions live in the feature-tree file). Priority follows evidence strength and problem impact — not novelty, not effort.

## Step 4 — Cross-check pass (the loop core)

Run both directions; record results in the Coverage Check tables:

1. **Feature → evidence:** every node with no PROB-ID is cut, demoted to Could, or explicitly labeled `unvalidated bet: <rationale>`. A bet is allowed; a stowaway isn't.
2. **Evidence → feature:** every Validated problem maps to ≥1 Must/Should feature, or gets an explicit deferral the user agrees to.
3. **Priority sanity:** any Must serving only a Low-confidence insight chain → flag; any Could sitting on the highest-impact problem → flag.

Fix, update ledger, repeat until a full pass produces zero changes and both Coverage Check tables are empty.

## Exit condition

- 100% of Must/Should features trace to PROB-IDs
- Every problem addressed or explicitly deferred
- Unvalidated bets labeled, MoSCoW rationales written, both coverage tables empty

Add `Verdict: PENDING — <date>, iteration N` beneath the Director's Ledger, present the tree summary (counts per MoSCoW tier, bets flagged), the ledger, and ask for the verdict. Once the director rules, replace PENDING with the ruling and date.

## Forbidden moves

- **No invented persona traits** — the empathy map is an evidence view, not a creative-writing exercise.
- **No priority by enthusiasm.** "This would be cool" is a Could with an `unvalidated bet` label, whoever said it.
- **No silent cuts.** Every removed feature appears once in the ledger with its disposition.
- **No renumbering FEAT-IDs.**

## Handoffs

- Verdict accepted → propose PRD REQ writing (role-pm's discovery/spec skills; Must/Should rows seed the REQ tables) or `/wireframe-loop` if the PRD already holds.
- Gaps sections in personas grew → more raw research needed; name what's missing.
- The tree implies pages not in `docs/prd.md` → per CLAUDE.md, stop and ask before adding pages.
