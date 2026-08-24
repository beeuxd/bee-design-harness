---
name: scoping-cutting
description: Scope projects and cut features without cutting quality — MVP definition, scope-creep triage, ship-faster tradeoffs. Use when someone is defining an MVP, drowning in scope, deciding what to drop to hit a date, or asking "what's the smallest version of this worth shipping?"
---

# Scoping and cutting

Cutting scope is a design act: the goal is the smallest product that still proves the thesis,
not the biggest product that fits the deadline.

## The house frame

- **The MoSCoW feature tree is the scoping instrument.** If `docs/ideation/feature-tree.md`
  exists, scope decisions are edits to it: cutting = moving a node below the Must line, with the
  evidence trail intact. If it doesn't exist and the project has research, run `ideation-loop`
  first — scoping without evidence is guessing in a spreadsheet.
- **Cut scope, never quality.** The gates are not scope: accessibility, both themes, responsive
  at all five widths, the performance budget, and token-only styling apply to whatever ships,
  however small. A half-broken feature costs more than the feature it displaced.
- **Whole slices, not layers.** Ship "one user can complete one job end-to-end", never "the
  backend for everything." A walking skeleton that does one real thing beats scaffolding for ten.

## Deciding what's a Must

A feature is a Must only if the answer to *"does the thesis survive without it at launch?"* is
no. Everything else is a Should until a user's behavior — not a stakeholder's enthusiasm —
promotes it. Tie-breakers, in order: evidence weight (how many PROBs trace to it), reversibility
(cheap-to-add-later loses to hard-to-retrofit), and dependency (what unlocks other Musts).

## Cutting moves (in order of preference)

1. **Narrow the audience** — same product, one segment. Sharpest cut with the least rework.
2. **Narrow the job** — support the core path; drop admin, settings, edge flows behind a
   "contact us" seam.
3. **Degrade gracefully** — manual-behind-the-scenes where automation was planned (concierge);
   a default where a preference was planned.
4. **Defer polish that isn't craft** — animations and delight moments can wait; alignment,
   contrast, and tap targets cannot (that's quality, see above).
5. **Cut whole features** — last, and always back into the tree as Won't-this-round, never
   deleted; the evidence that motivated them doesn't expire.

## Scope creep triage

New ask mid-build → three questions, in writing: which PROB does it trace to? what currently
scoped Must does it displace? who accepts the delay if nothing is displaced? A request that
can't answer the first question goes to the backlog via `to-issues`, not into the sprint.
When the pressure is coming from the founder themselves, run `grilling` on the ask.

## Output

Update the feature tree (or write a one-page scope memo if no tree exists): what ships, what
moved, why, and the single metric that decides whether the cut was right. Update `docs/prd.md`
REQ-IDs so the PRD and the tree never disagree.
