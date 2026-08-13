---
name: wireframe-loop
description: Creates lo-fi wireframes as Figma frames and cross-checks them against the problem statements and MoSCoW feature tree until every screen region maps to a Must/Should feature and every Must feature has a home — recording the proof in docs/ideation/wireframes.md. Use when moving from feature list to screens, or to audit existing wireframes against scope. Trigger phrases: "wireframe this", "sketch the screens", "lo-fi first", "does the wireframe cover the features", "run the wireframe loop". (Applying visual styling to validated wireframes is hifi-gate; a written spec with component/token mapping is design-flow.)
---

# Wireframe Loop — wireframes ↔ problem + MoSCoW

The loop that guarantees screens serve the evidenced scope: no orphan UI, no homeless Must features, hierarchy that matches priority. Wireframes are **lo-fi Figma frames**; the audit trail is `docs/ideation/wireframes.md`.

## Loop discipline (applies to every round)

- **Max 5 iterations** → then STOP, present the ledger and what won't converge, ask the user.
- **Director's ledger** per iteration in `docs/ideation/wireframes.md`: what changed, why.
- **Exit is the user's verdict** on the matrix + frames. Never self-approve.
- Narrate progress ("screen 2 of 4 framed, starting matrix").

## Step 0 — Preconditions

1. Read `docs/ideation/feature-tree.md`, `docs/research/problems.md`, `docs/user-flows.md`, and `design/patterns.md`. If `docs/specs/<feature-slug>.md` exists for this feature (from `design-flow`), read it — the wireframe must not contradict a committed spec.
2. **Soft gate:** feature tree missing/empty → offer: "Run `/ideation-loop` first (recommended), or list the features directly — they'll be labeled `unvalidated` in the matrix."
3. **Figma check:** confirm the Figma MCP connection works (e.g., `get_metadata` on the project file from `docs/design-system.md`). Unavailable → **STOP and ask:** "Figma MCP is not reachable. Fix the connection, or approve a markdown-only matrix as fallback?" Never silently fall back.
4. Screens implied that aren't in `docs/prd.md`/`docs/user-flows.md` → STOP and ask (house rule: no new pages without approval).

## Step 1 — Frame the screens (lo-fi only)

For each screen in the flow:

1. Create a Figma frame named `wf/<screen-name>` — desktop-width base plus a 360px variant frame for any screen whose mobile layout isn't a trivial stack (mobile-first is house law; a wireframe that only works wide is a defect).
2. **Lo-fi discipline:** greyscale fills only, rectangles + text labels, real information hierarchy (position, size, order), placeholder type. No colors, no imagery, no component styling — fidelity at this stage is a lie about certainty.
3. Label every region with a short name — these labels are the keys the matrix uses.
4. Real content structure over lorem: name what each region holds ("last 5 transactions", not "list").

## Step 2 — Build the validation matrix

In `docs/ideation/wireframes.md`, one section per screen (format lives in that file): each region → FEAT-ID → PROB-ID, top-to-bottom as framed, with the Figma frame link.

## Step 3 — Cross-check pass (the loop core)

1. **Orphan regions:** any region mapping to no Must/Should FEAT-ID → remove it, or write the justification in the matrix (navigation chrome, legal requirement, and pattern-mandated states from `design/patterns.md` are valid justifications; "felt empty" is not).
2. **Homeless Musts:** any Must feature with no region on any screen → add it, or take the scope question to the user. Should-features missing → list them; deferral is allowed but explicit.
3. **Hierarchy check:** Must features hold the dominant positions (higher, larger, earlier in flow) — visual-hierarchy rules live in `docs/ux-principles.md`. A Could sitting above a Must is a defect unless the matrix says why.
4. **Flow check:** screens connect per `docs/user-flows.md` — entry/exit points and error/empty branches have somewhere to land (states matrix discipline comes from the flow doc; a wireframe with only the happy path fails).

Fix in Figma, update the matrix and ledger, repeat until a full pass finds nothing.

## Exit condition

- Zero orphan regions (or each carries a written justification)
- Zero homeless Must features
- Hierarchy matches MoSCoW priority; flow/error branches land somewhere
- Matrix links and frame names match the actual Figma file

Present the matrix summary + frame links + ledger; ask for the verdict.

## Forbidden moves

- **No visual design.** A styled wireframe pre-empts art direction and hides structural defects behind polish.
- **No unmapped additions.** Every region added during iteration enters the matrix in the same iteration.
- **No screenshot-guessing.** Frame contents are created and read through the Figma tools, not inferred from images.

## Handoffs

- Verdict accepted → propose `/hifi-gate` (visual system application with the hard token gate).
- Structural questions about states/interactions beyond wireframe scope → `/design-flow` for the full spec.
- The cross-check reshaped scope (features cut/added) → update `docs/ideation/feature-tree.md` via `/ideation-loop` so the tree stays true.
