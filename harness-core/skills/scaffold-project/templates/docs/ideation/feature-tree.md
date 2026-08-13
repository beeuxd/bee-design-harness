# Feature Tree — MoSCoW

Produced and maintained by `/ideation-loop`. Every node traces to PROB-IDs in `docs/research/problems.md`. A feature with no PROB-ID is either cut or explicitly labeled an **unvalidated bet** — it never hides among evidenced features. FEAT-IDs are permanent; never renumber.

## How-Might-We statements

Each derived from a named problem.

| HMW | From |
|-----|------|
| How might we … ? | PROB-… |

## Tree

```
<Product / feature area>
├── FEAT-001 <capability>            [Must]   → PROB-001
│   ├── FEAT-002 <sub-capability>    [Must]   → PROB-001
│   └── FEAT-003 <sub-capability>    [Should] → PROB-001, PROB-002
└── FEAT-004 <capability>            [Could]  → unvalidated bet: <rationale>
```

## Feature Inventory

| ID | Feature | MoSCoW | Traces to | Rationale (why this priority) | Status |
|----|---------|--------|-----------|-------------------------------|--------|
| FEAT-001 | | Must / Should / Could / Won't | PROB-… | | Active |

**MoSCoW discipline** — Must: the problem is unsolved without it. Should: materially improves the solution, workaround exists. Could: valuable, deferrable. Won't (this cycle): recorded so it stays a decision, not an accident.

## Coverage Check

Maintained by the loop's cross-check pass. Both tables must be empty at loop exit.

**Features without evidence** (cut, demote, or label as unvalidated bet):

| FEAT-ID | Disposition |
|---------|-------------|
| | |

**Problems without features** (gap — every problem is addressed or explicitly deferred):

| PROB-ID | Disposition |
|---------|-------------|
| | |

## Director's Ledger

One row per `ideation-loop` iteration.

| Date | Iteration | What changed (added / cut / re-prioritized) | Why |
|------|-----------|---------------------------------------------|-----|
| | | | |

---

Feeds: PRD REQ prioritization (Must/Should rows seed the REQ tables — role-pm's spec skills) and `/wireframe-loop` (`docs/ideation/wireframes.md`).
