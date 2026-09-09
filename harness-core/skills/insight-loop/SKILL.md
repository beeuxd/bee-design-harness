---
name: insight-loop
description: Turns raw research (interview transcripts, notes, survey data in docs/research/raw/) into evidence-traced insights in docs/research/insights.md, looping through an adversarial trace-back pass until every insight is 100% backed by verbatim quotes with zero meaning drift. Use when research material needs synthesis or existing insights need re-validation. Trigger phrases: "synthesize the research", "analyze these interviews", "extract insights", "code this transcript", "do the insights hold", "run the insight loop". (Defining the problem from finished insights is problem-loop; asking the user discovery questions with no research data is PM discovery — role-pm.)
---

# Insight Loop — raw research ↔ analysis fidelity

The loop that guarantees analysis never says more, less, or different than the raw data supports. Output is `docs/research/insights.md`; the standard is: every insight traces to verbatim quotes, and a skeptical re-read finds zero drift between quote and claim.

## Loop discipline (applies to every round)

- **Max 5 iterations.** Not converged after 5 → STOP, present the ledger and the specific insights that won't stabilize, and ask the user how to proceed.
- **Director's ledger** after every iteration — one line: what changed, why, confidence shift. Written to the ledger table in `docs/research/insights.md`. Raw evidence sits in the inventory table, never dumped into chat.
- **Exit is the user's verdict.** When the exit condition passes, present the ledger + insight inventory and ask for sign-off. Never self-approve.
- Narrate progress between long steps ("coding transcript 2 of 4") — no silent stretches.

## Step 0 — Locate the raw material

1. Read `docs/research/raw/` — every file is in scope unless the user names a subset.
2. **STOP conditions:**
   - Folder empty or missing → STOP: "No raw research found. Paste the material, point me at files, or — if you want to proceed from your own knowledge — say so and everything downstream will be marked `unvalidated`."
   - User pastes material instead of files → **scan it for PII first** (real names, emails, phone numbers); if found, STOP and ask before persisting anything. Once clean/approved, save it to `docs/research/raw/` (naming per that folder's README), then proceed. Never analyze material that isn't persisted — the traceability chain needs a stable source to point at.
   - The user chose the no-raw-data path → Steps 1–2 run against their stated knowledge instead of files: each "insight" cites `user assertion, <date>` in place of quotes, confidence is capped at Low, status is `unvalidated`, and the orphan check does not delete them (their label is the honesty mechanism). Say once, plainly, that nothing downstream can exceed the confidence of this input.
3. Read `docs/research/insights.md`. Existing INS-IDs are permanent — this run appends or revises rows, never renumbers.

## Step 1 — Code the data (first pass)

1. Read every source file in full. No sampling, no skimming — a skipped page is a silent bias.
2. Tag recurring observations across sources (open coding: needs, struggles, workarounds, quotes with emotional charge, contradictions).
3. Draft candidate insights. Each is **one sentence, in the users' terms** — not solution language. For each, collect every supporting verbatim quote with source file + participant ID, **and** every quote that cuts against it.
4. Assign confidence per the rubric in `docs/research/insights.md` (High ≥3 independent sources; Medium 2; Low 1 or unvalidated).

## Step 2 — Adversarial trace-back pass (the loop core)

Re-read each draft insight as a skeptic whose stance is "this insight misrepresents the data." For each, check in order:

1. **Abstraction drift** — does the insight generalize beyond what the quotes say? ("Users hate the export flow" from one participant's "the CSV button confused me" is drift.) If yes → narrow the wording or lower confidence.
2. **Cherry-picking** — do quotes elsewhere in the raw data contradict it? If yes → record them in the Contradictory Evidence table and re-weigh. Contradictions are recorded, never dropped.
3. **Merged-but-distinct** — does one insight actually contain two findings with different evidence? If yes → split into two INS rows.
4. **Solution smuggling** — does the insight prescribe a fix ("users need a dashboard")? If yes → rewrite as the observed struggle.
5. **Orphan check** — any insight with zero verbatim quotes is deleted or marked `unvalidated`, no exceptions.

Fix everything found, update the ledger, and **repeat Step 2 on the revised set**. Each iteration re-checks all insights, not just the changed ones (a split or reword can create new drift).

## Exit condition

All of the following, verified on the final pass:

- Every insight row has ≥1 verbatim quote with source; none marked `unvalidated` unless the user chose that path in Step 0
- The trace-back pass completes with zero findings (a clean pass, not a tired one)
- Every contradiction found anywhere in the process appears in the Contradictory Evidence table
- Confidence levels match the rubric arithmetic — no gut-feel "High"

Then write the final `docs/research/insights.md`, add `Verdict: PENDING — <date>, iteration N` beneath its Director's Ledger, present the ledger + inventory summary (counts by confidence, contradictions logged), and ask for the user's verdict. Once the director rules, replace PENDING with the ruling and date — the pipeline statusline surfaces PENDING as the top item until then. Alongside the marker, append an entry to `docs/review-queue.md` — what needs ruling, where the draft lives, 2–3 lines of reasoning, evidence links, `Status: OPEN` — and flip it to RESOLVED with the ruling recorded. Before presenting, scan `docs/decisions.md` and `design/taste-rules.md` for standing rulings that already answer part of what you'd ask — apply them and cite the rule ID in the ledger instead of re-asking (the exit verdict itself is never auto-resolved). A ruling phrased as standing ("always…", "never ask again…") gets recorded: visual → `taste-retro`, process/scope → `docs/decisions.md`.

## Forbidden moves

- **No invented quotes, no paraphrases presented as quotes.** Quotation marks mean verbatim.
- **No dropping inconvenient data.** Contradictions get a table row, not deletion.
- **No confidence inflation.** One enthusiastic participant is Low confidence however compelling the quote.
- **No renumbering INS-IDs.** Downstream docs cite them.

## Handoffs

- Exit passed → propose `/problem-loop` to derive problem statements from these insights.
- Insights reveal missing research (empty persona coverage, one-sided sample) → say so plainly; more raw data beats another synthesis pass.
- User corrected your analysis style mid-loop (altitude, wording, what counts as evidence) → offer `/taste-retro` to make it a standing rule.
