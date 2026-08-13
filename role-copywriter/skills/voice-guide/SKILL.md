---
name: voice-guide
description: Captures the project's voice via a one-batch interview and writes docs/content-guidelines.md — voice, tone by moment, terminology, mechanics, error-message patterns, AI-output copy rules, banned list — or adopts existing brand guidelines and records the deltas. Use before any user-facing copy ships, when the user says "set the voice", "content guidelines", "how should this product sound", "voice and tone", or when copy review finds no standard to review against. Runs once per project; re-runs append a dated revision. (Reviewing copy against the finished guide is ux-copy-review; writing the copy is copywriting/ux-writing — this skill creates the law they apply.)
---

# Voice Guide — the per-project content law

Voice is project-specific and comes from the user — never from shipped defaults. This is `art-direction`'s exact pattern applied to words: interview once, write it down, everything downstream cites it.

## Step 0 — Detect state

1. Read `docs/content-guidelines.md`. Already filled → STOP and ask: revise (append a dated `## Revision — YYYY-MM-DD` section) or keep? Never silently overwrite.
2. Check the intake record (`docs/design-system.md`, recorded by `scaffold-project`): **existing brand/content guidelines named at intake → adoption mode.** Read them (ask for the file/link if not in the repo), fill the guide's sections FROM them, and interview only the gaps and product-UI specifics they don't cover (error patterns, AI-output rules are usually missing from brand docs). Record "adopted from <source>, deltas below" in the Source line.
3. Read `docs/project.md` (audience), `docs/design-system.md` (art direction — voice and visual mood must not fight), and `docs/research/insights.md` if present (users' own words are voice evidence).

## Step 1 — Interview in ONE batch, then WAIT

Ask all of these in a single message, numbered. Never answer for the user; unanswered items are recorded as `OPEN`, never filled in.

1. **Voice** — 3–5 words this product should sound like (offer 2–3 contrasting example sets if they're stuck — clinical/warm/direct vs playful/quick/casual — but they choose).
2. **Tone shifts** — how does it sound in failure vs success vs destructive confirmation? (Most products should get *quieter* in failure — confirm, don't assume.)
3. **Terminology** — words the product must always use for its core objects/actions, and words it must never use (competitors' terms, internal jargon, corporate filler).
4. **Person & mechanics** — "you"/"we"? contractions? sentence case? how formal?
5. **AI-output copy** (if the product has AI features) — how should AI-generated content identify itself, and what may it never claim? (Baseline: `docs/trust-scaffolding.md`; this captures the project's voice on top.)
6. **Banned list** — phrases that make the user cringe ("oops!", "we're sorry for the inconvenience", exclamation-point enthusiasm…).

If the user defers an item: push back once with concrete options, then record `OPEN — user deferred`.

## Step 2 — Draft, show, then write

1. Draft the full `docs/content-guidelines.md` per its template structure, filling the tone-by-moment and terminology tables with the user's answers plus derived examples **labeled `[DRAFT — confirm]`** (examples are illustrations of their rules, not new rules).
2. Show the draft in chat; get an explicit yes before writing the file.
3. Write it. Update the Source line. `OPEN` items go in a final section with what each blocks.

## Step 3 — Hand off

- Copy review now has law: point `ux-copy-review` (and the ship gate's copy lens) at the guide.
- Voice conflicts with a standing taste rule or the art direction → surface it; the user rules.
- Report: file written, sections filled vs OPEN, adoption source if any.

## Forbidden

- Inventing voice the user didn't choose. An empty section is honest; a plausible default is contamination.
- Marketing superlatives smuggled into examples.
- Overwriting a previous guide without the revision protocol.
