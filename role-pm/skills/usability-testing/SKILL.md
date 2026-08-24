---
name: usability-testing
description: Plan, run, and synthesize usability tests — task-based protocols, screeners, moderation guides, severity-rated findings. Use when someone is planning user tests, validating a prototype or wireframe, preparing a usability study, or asking why users struggle with their product. Session quotes feed the evidence pipeline as raw research.
---

# Usability testing

Watching five real people fail a task beats fifty opinions. This skill produces the protocol,
keeps the moderation honest, and turns sessions into evidence the loops can consume.

## Plan

- **One study, one question.** "Can a first-time visitor complete checkout on mobile?" — not
  "is the app good?" If there are three questions, that's three (short) studies.
- **5 participants per user segment per round.** Past five, you're re-watching the same failures;
  spend the budget on another round after fixes instead.
- **Recruit by behavior, not demographics.** The screener asks what they *do* ("bought something
  on a phone this month?"), never whether they'd like the product.
- **Tasks are scenarios, not instructions.** "You want to send this to a friend — go ahead" beats
  "click the share button." Each task has a written success criterion before the first session.
- **Test at the fidelity you have.** Paper/wireframe finds flow problems; hi-fi finds label and
  affordance problems; production finds performance and trust problems. Don't wait for polish —
  `wireframe-loop` output is testable.

## Moderate

- Think-aloud, and then **shut up**. Silence is the tool: the urge to help is data about the UI.
- Never lead: "what do you expect that to do?" not "did you see the menu?"
- When they fail, let it land (that's the finding), then move on — no rescuing mid-task.
- Record with consent; capture verbatim quotes with timestamps. A paraphrase is not evidence.

## Measure

Per task: completion (unassisted / assisted / failed), time on task, errors and wrong turns,
and a post-task confidence rating. Post-study: SUS if you need a trackable benchmark score.
Numbers with n=5 are directional — the *why* in the recordings is the product.

## Synthesize

- Findings, not anecdotes: **what happened → how many of n → severity → evidence (quote/clip)**.
- Severity scale: **blocker** (task failed) / **major** (completed with serious struggle) /
  **minor** (friction, recovered) / **polish**.
- Write raw session notes and quotes into `docs/research/` with source attribution — usability
  quotes are first-class raw research: `insight-loop` traces them into insights, and from there
  the chain runs quote → INS → PROB → FEAT. A finding that traces to nothing fixes nothing.
- Blockers and majors become problem candidates for `problem-loop`; polish items go straight to
  the backlog via `to-issues`.

## Anti-patterns to refuse

Testing with teammates, demoing instead of testing, fixing the prototype between participants
mid-round (finish the round; version the fix), and reporting averages without the failure clips.
