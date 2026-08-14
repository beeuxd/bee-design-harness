---
name: write-tickets
description: Generates GitHub Issues from the project specs (docs/prd.md, docs/user-flows.md) — structured tickets with REQ-ID links, acceptance criteria, labels, and dependencies, created in dependency order and organized on the kanban board. Use after specs are written and before implementation begins. Triggers on "write tickets", "create issues", "break this into tickets", "generate work items", "task breakdown", "plan the sprint".
---

# Write Work Tickets

Turn specs into GitHub Issues. Plan first, get approval, then create in dependency order so blockers get lower issue numbers.

## Step 0 — Prerequisites (run these, verify output)

```bash
gh auth status                                    # must show "Logged in"
gh repo view --json nameWithOwner -q .nameWithOwner   # must print owner/repo
ls docs/prd.md docs/user-flows.md                 # both files must exist
OWNER=$(gh repo view --json owner -q .owner.login)
gh project list --owner "$OWNER" --format json --jq '.projects[].title'  # empty output = no kanban board
```

- **Shell variables do not persist between separate command invocations.** Every block in Steps 6–8 that uses `$OWNER` or `$PROJECT_TITLE` re-derives or re-sets them at the top of the block — keep those lines when you run it, and if you split a block, re-run the variable lines first.
- If `gh project list` (or later `gh issue create --project`) fails with a scope/permission error, project commands need the `project` scope — ask the user to run `gh auth refresh -s project` (it is interactive; do not run it yourself), then retry.
- Set `$PROJECT_TITLE` (used in Steps 6–8): if `gh project list` printed exactly one title, use that; if it printed several, **ask the user which board** — never pick one silently. It is a literal string, e.g. `PROJECT_TITLE="My Board"`.
- **STOP if `gh auth status` fails** — ask the user to run `gh auth login` (interactive; do not run it yourself); do not continue.
- **STOP if no project board exists** (empty `gh project list` output) — tell the user to run `/setup-kanban` first.
- **STOP if `docs/prd.md` or `docs/user-flows.md` is missing** — ask the user to write the specs first (the `pm` and `architect` agents produce them); do not invent requirements.
- **STOP if `docs/prd.md` has no filled requirement rows** (empty tables or `{{PLACEHOLDER}}` values) — do not invent requirements; ask the user to complete the PRD or run the `pm` agent.

## Step 1 — Read the specs

Read, in order: `docs/prd.md` (REQ-IDs + priorities), `docs/user-flows.md`, `docs/tech.md`, `design/components.md` (what already exists — reuse before build), plus any architect / backend-dev / ui-designer output in the repo.

- **STOP if a requirement has no acceptance criteria or an ambiguous priority** — ask; never guess P0.

## Step 2 — Break down into tickets

Hierarchy — one epic per large feature:

```
[EPIC] Feature Name
├── [DESIGN]   Design system additions (tokens, new primitives)
├── [BACKEND]  API resource group
├── [FRONTEND] Component or page (one ticket each)
├── [QA]       E2E suite for the feature
└── [DOCS]     Documentation
```

Granularity rules:
- One ticket per component or page (not per line of code)
- One ticket per API resource group (CRUD for one resource = 1 ticket)
- One ticket per design system addition
- One ticket per E2E test suite — **every epic with frontend work gets a [QA] ticket whose body says: "Run the `e2e-test` skill for this feature (5-spec structure, all viewports)."**
- Anything estimated over 1 day (`L`/`XL`): split it before creating
- **Labels — every ticket gets exactly one type label, one priority label, and one size label.** Priority comes from the REQ's priority in `docs/prd.md` (highest priority among the ticket's REQ-IDs — never guess P0; if a REQ has no priority, STOP per Step 1). Size is estimated from acceptance-criteria scope against the Step 5 definitions (XS < 1h … XL 2+ days); torn between two sizes → pick the larger

## Step 3 — Write each ticket body

Template for every ticket:

```markdown
## Description
[1-2 sentences: what this delivers and why]

## Requirements
- REQ-IDs from docs/prd.md: REQ-001, REQ-002
- User flow: [flow name from docs/user-flows.md]

## Acceptance Criteria
- [ ] [Specific, testable criterion per requirement]
<!-- frontend tickets: append the Standard Gates block below, verbatim -->

## Technical Notes
- Reuse first: [existing components from design/components.md / components/ui/ / components/site/]
- Visual source: [Figma frame link — specs come from Figma variables mapped to design/tokens.json, never eyeballed]
- Interaction source: [shadcn/Radix primitive whose source defines hover/focus/keyboard/aria — never invented]
- API dependencies: [endpoints]

## Dependencies
- Blocked by: #N
- Blocks: #N
```

**Standard Gates — copy verbatim into EVERY frontend ticket's acceptance criteria:**

```markdown
- [ ] Responsive at 360/768/1024/1440/1920px, mobile-first (viewport breakpoints for page layout, @container queries for reusable components, clamp() for fluid type)
- [ ] WCAG 2.2 AA with full keyboard nav, visible focus, AA contrast; animations gated on prefers-reduced-motion
- [ ] Dark mode renders correctly as the primary theme (built and verified dark-first)
- [ ] Token-only styling from design/tokens.json — no hardcoded hex, no arbitrary px values
- [ ] Tap targets >= 44x44px; primary CTAs 44-52px tall
```

Page-level frontend tickets additionally get:

```markdown
- [ ] Performance budget passes (LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, TBT < 200ms, JS first-load < 150KB gzipped) — run the `performance-check` skill; fail = do not ship
```

## Step 4 — State dependencies, then get approval

Before creating anything:
1. List every planned ticket: `[TYPE] Title — labels — blocked by / blocks`.
2. Draw the dependency graph (design tokens → backend → frontend → QA is the usual spine).
3. Topologically sort it. **STOP if you find a circular dependency** — resolve with the user.
4. **STOP and show the full plan to the user. Do not run any `gh issue create` until they approve.** Issues are hard to delete; get the plan right first.

## Step 5 — Ensure labels exist

```bash
# --force makes this idempotent (updates the label if it already exists)
while IFS='|' read -r name color desc; do
  gh label create "$name" --color "$color" --description "$desc" --force
done <<'EOF'
frontend|1d76db|Frontend implementation
backend|5319e7|Backend/API work
design|e99695|Design system / Figma
qa|0e8a16|Testing
docs|c5def5|Documentation
P0|b60205|Must have (launch blocker)
P1|d93f0b|Should have
P2|fbca04|Nice to have
XS|ededed|< 1 hour
S|ededed|1-4 hours
M|ededed|4-8 hours
L|ededed|1-2 days (split before creating)
XL|ededed|2+ days (must split)
blocked|000000|Waiting on dependency
EOF
```

| Label | Color | Description |
|-------|-------|------------|
| `frontend` | `1d76db` | Frontend implementation |
| `backend` | `5319e7` | Backend/API work |
| `design` | `e99695` | Design system / Figma |
| `qa` | `0e8a16` | Testing |
| `docs` | `c5def5` | Documentation |
| `P0` | `b60205` | Must have (launch blocker) |
| `P1` | `d93f0b` | Should have |
| `P2` | `fbca04` | Nice to have |
| `XS` | `ededed` | < 1 hour |
| `S` | `ededed` | 1-4 hours |
| `M` | `ededed` | 4-8 hours |
| `L` | `ededed` | 1-2 days (split before creating — see Step 2) |
| `XL` | `ededed` | 2+ days (must split) |
| `blocked` | `000000` | Waiting on dependency |

Verify: `gh label list` shows all 14.

## Step 6 — Create issues in dependency order

Create in topological order (blockers first, so they get lower issue numbers). Capture each new number and substitute it into dependents' `Blocked by: #N` lines. Use the real project title discovered in Step 0 — never a hardcoded name.

The `[EPIC]` itself is also a GitHub Issue: create it FIRST (labels: its priority only — no type/size), with a placeholder task list in the body. After all of its child tickets exist, update the epic body with the real task list so GitHub tracks progress: `gh issue edit <epic-num> --body "..."` containing one `- [ ] #N` line per child. Child tickets do not list the epic under `Blocked by:` — the epic is a container, not a blocker.

```bash
PROJECT_TITLE="<literal board title from Step 0>"
ISSUE_URL=$(gh issue create \
  --title "[FRONTEND] Build hero section" \
  --label "frontend,P0,M" \
  --project "$PROJECT_TITLE" \
  --body "$(cat <<'EOF'
## Description
...full template from Step 3, Standard Gates included verbatim...
EOF
)")
ISSUE_NUM=${ISSUE_URL##*/}   # issue number for dependents' "Blocked by: #N" lines
echo "$ISSUE_URL"
```

Add the `blocked` label to any ticket whose blocker is not yet closed:
`gh issue edit <num> --add-label blocked`

## Step 7 — Organize on kanban

All new items land in the project via `--project`. Set Status per priority:

```bash
OWNER=$(gh repo view --json owner -q .owner.login)
PROJECT_TITLE="<literal board title from Step 0>"
PROJECT_NUM=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number")
PROJECT_ID=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .id")   # node ID for item-edit
gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json                # get Status field id + option ids
gh project item-list  "$PROJECT_NUM" --owner "$OWNER" --format json --limit 200    # get item ids (default limit is 30 — always raise it)
gh project item-edit --id <ITEM_ID> --project-id "$PROJECT_ID" \
  --field-id <STATUS_FIELD_ID> --single-select-option-id <READY_OPTION_ID>
```

Rules: P0 and unblocked → **Ready**. P1/P2 → **Backlog**. Anything with an open blocker stays in **Backlog** with the `blocked` label regardless of priority. If the board's Status field has no options named "Ready"/"Backlog", list its actual options and **ask the user** which maps to which — do not guess.

## Step 8 — Evidence and report

Claims require proof. Run and include the output:

```bash
OWNER=$(gh repo view --json owner -q .owner.login)
PROJECT_TITLE="<literal board title from Step 0>"
PROJECT_NUM=$(gh project list --owner "$OWNER" --format json --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number")
gh issue list --limit 200 --json number,title,labels --jq '.[] | "\(.number)\t\(.title)"'
gh project item-list "$PROJECT_NUM" --owner "$OWNER" --format json --limit 200 --jq '.items | length'
```

Report to the user:
- Total tickets created; counts must match the approved plan (**STOP and reconcile if they don't**)
- Breakdown by type (frontend/backend/design/qa/docs) and by priority (P0/P1/P2)
- Dependency graph: `#12 → #14 → #15` (blocker → dependent)
- Suggested execution order: the topological sort from Step 4, P0 first within each tier
