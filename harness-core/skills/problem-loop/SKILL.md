---
name: problem-loop
description: Derives problem statements from docs/research/insights.md and validates them in challenge-style rounds until every clause maps to insight evidence and no high-confidence insight is left contradicting or unexplained — then writes docs/research/problems.md and the PRD's Problem Statement. Use after insight-loop, or to pressure-test an existing problem statement against research. Trigger phrases: "define the problem", "what's the real problem", "validate the problem statement", "does the problem match the research", "run the problem loop". (Stress-testing a full PRD is challenge; synthesizing raw transcripts is insight-loop.)
---

# Problem Loop — problem statement ↔ analysis

The loop that guarantees the problem we commit to actually answers the analysis — not the plausible-sounding problem, the evidenced one. Output is `docs/research/problems.md` plus the Problem Statement section of `docs/prd.md`.

## Loop discipline (applies to every round)

- **Max 5 iterations** → then STOP, present the ledger and unresolved gaps, ask the user.
- **Director's ledger** per round in the Validation Ledger table of `docs/research/problems.md`: challenge asked, verdict, change made.
- **Exit is the user's verdict** on ledger + problem inventory. Never self-approve.
- Narrate progress between rounds.

## Step 0 — Locate the upstream evidence

1. Read `docs/research/insights.md` in full. Also read `docs/project.md` (audiences) if not in context.
2. **Soft gate:** insights file missing or still the empty template →
   - Offer: "No validated insights exist. Run `/insight-loop` first (recommended), or give me your problem understanding directly — it will be marked `Unvalidated` and that label follows it downstream."
   - If the user supplies the problem directly, record it with status `Unvalidated` and skip to Step 2 (validation still runs; it just runs against whatever evidence exists).
3. **STOP:** user asks you to "just write a problem statement" with neither insights nor their own input → there is nothing to derive from; ask what the evidence is.

## Step 1 — Draft the problem statement(s)

1. Cluster Active insights by the struggle they describe. One cluster = one candidate problem. Fewer, sharper problems beat a laundry list — more than 3 candidates usually means clusters need merging.
2. Draft each in the four-part form from `docs/research/problems.md`:
   > When **[context]**, **[user]** struggles to **[goal]** because **[obstacle]**, which costs them **[impact]**.
3. **No embedded solutions.** "Users can't find X" is a problem; "users need a search bar" is a solution wearing a problem's clothes. Rewrite any clause that names a feature.
4. Map every clause — context, user, goal, obstacle, impact — to specific INS-IDs in the inventory row. A clause with no INS-ID gets flagged now, not discovered later.

## Step 2 — Validation rounds (the loop core)

One challenge per round, `challenge`-style: state it, answer it from the evidence, record the verdict. The canonical probes, run against each problem in turn:

1. **Support probe** — *Which INS-IDs support this clause?* Any clause resting on Low-confidence or `unvalidated` evidence → say so in the inventory; any clause with none → cut or reword.
2. **Omission probe** — *Which Active insights does this problem ignore?* Check every High-confidence insight against the problem set; unaccounted ones go to the Unexplained Insights table.
3. **Rival-explanation probe** — *Would a different problem explain the same insights better?* Construct the strongest rival honestly. If it wins or draws, present both to the user rather than picking silently.
4. **Contradiction probe** — *Does anything in the Contradictory Evidence table of insights.md cut against this problem?* A High-confidence contradiction is disqualifying until resolved.
5. **Sufferer probe** — *Is the user in this statement a real persona from `docs/project.md` / the research, coping somehow today?* "Everyone" or an invented persona → fail.

Revise after each round, update the ledger, repeat until a full pass over all five probes produces zero changes.

## Exit condition

- Every clause of every problem maps to INS-IDs (or carries an explicit `Unvalidated` label the user accepted)
- No High-confidence insight contradicts any problem
- The Unexplained Insights table is empty, or every row in it has a disposition the user agreed to ("out of scope because…", "needs more research")
- Status column set: Validated / Open / Unvalidated per the rubric

Then: write `docs/research/problems.md`, update the **Problem Statement** section of `docs/prd.md` (append/replace that section only — never touch REQ tables from this skill), present the ledger, ask for the verdict.

## Forbidden moves

- **No solutions in problems.** Feature language is a defect wherever it appears.
- **No inventing evidence.** If a clause needs support that doesn't exist, the clause changes — the evidence doesn't materialize.
- **No silent rival-burying.** If a competing problem framing survived probe 3, the user sees it.
- **No renumbering PROB-IDs.**

## Handoffs

- Verdict accepted → propose `/ideation-loop` (problems → personas, diagrams, feature tree).
- Problems reshape scope materially → suggest re-running `/challenge` on the PRD afterward.
- Unexplained-insight rows keep growing → the research has more than one product in it; flag that to the user explicitly.
