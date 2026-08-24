---
name: review-loop
description: Run work through an iterative worker-reviewer cycle in one session — do the work, spawn an independent reviewer subagent with a written rubric, revise against its findings, repeat until the gate passes or the round cap escalates. Use when quality matters more than speed ("review this as you go", "make it airtight", "iterate until it's right") on implementation, specs, or refactors.
---

# Review loop — worker/reviewer in one session

First drafts don't ship. This loop bakes a critic into the session so revision happens before
the user ever sees a draft — the same discipline the harness's design loops apply, at code/spec
scale.

## The loop

1. **Do the work.** Complete the task fully — the reviewer critiques finished work, not sketches.
2. **Write the rubric first, then spawn the reviewer.** A fresh subagent, given: the task as the
   user stated it, the artifact, and an explicit rubric. Never "review this" bare — a rubric-less
   reviewer produces vibes. House rubric baseline:
   - Correct: does it actually do what was asked (not what was convenient)?
   - House rules: token-only styling, responsive at 360/768/1024/1440/1920, WCAG 2.2 AA,
     both themes, performance budget — whichever apply to the artifact.
   - Root cause: does it fix the problem or paper over a symptom?
   - Simplicity: could half the code do this? Any existing helper duplicated?
3. **The reviewer returns findings, not a grade.** Each finding: severity (blocker / should-fix /
   nit), location, why it's wrong, what right looks like. A bare score hides the work.
4. **Revise.** Fix blockers and should-fixes. Push back on findings that are wrong — with
   evidence — rather than blindly complying; note the disagreement.
5. **Re-review only what changed** (cheaper, and prevents rubric drift), plus a regression glance
   at previous findings.
6. **Exit** when a round produces zero blockers and zero should-fixes.

## Caps and escalation

Maximum **3 rounds**. Still failing after 3 → stop and escalate per `escalation-protocol`:
present the surviving findings and the disagreement, and let the user rule. Endless self-revision
burns the session and converges on mush — the cap is the feature.

## Rules that keep it honest

- The reviewer is a *fresh* subagent every round — no shared context with the worker beyond the
  artifact and rubric, or it inherits the worker's blind spots.
- Findings the user overrules become standing rules: visual ones go to `design/taste-rules.md`
  via `taste-retro`; code conventions get noted in the project's CLAUDE.md.
- This loop does not replace the ship gate — `verify-before-done` evidence (screenshots, test
  runs, all five widths) is still required after the loop exits.
