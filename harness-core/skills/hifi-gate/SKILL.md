---
name: hifi-gate
description: Takes validated lo-fi wireframes to high fidelity in Figma under a hard gate — design-tokens-sync must show zero HIGH/MEDIUM drift before any hi-fi work starts, and every hi-fi value must bind to a Figma variable that maps to design/tokens.json before anything moves to build. Not 100% right = no push-through. Use when wireframes are validated and it's time for visual design, or to audit whether hi-fi frames are token-clean. Trigger phrases: "go high fidelity", "apply the visual system", "hi-fi this", "is the Figma token-clean", "ready to build?", "run the hifi gate". (Building React from finished hi-fi is from-figma; reconciling token drift itself is design-tokens-sync.)
---

# HiFi Gate — wireframe → high fidelity, token-clean or blocked

The hard gate between structure and polish. Two locks: the system must be clean **before** hi-fi work starts (no designing on drifted tokens), and the hi-fi output must be 100% token-bound **before** it reaches `from-figma`. There is no partial pass. **Not 100% right = no push-through.**

## Loop discipline

- **Max 5 audit iterations** → then STOP with the remaining violations listed by frame; ask the user.
- **Director's ledger** per iteration: violations found → violations fixed, reported as counts with the full table beneath — written to the **Gate Ledger** section of `docs/ideation/wireframes.md` (this is the "gate evidence" `from-figma` cites at build time), never dumped into chat.
- **Exit is the user's verdict** — and even the user cannot waive lock 2 into a "ship anyway": unbound values reaching `from-figma` would be guessed values in code, which token-only styling forbids. If the user wants an exception, the token gets added to `design/tokens.json` properly (via `design-tokens-sync` approval flow) — the system bends by growing, not by leaking.

## Step 0 — Preconditions (all hard)

1. **Art direction:** `docs/design-system.md` has no "Art direction" section → STOP, run `/art-direction` first. House law: no visual work without direction.
2. **Taste rules:** read `design/taste-rules.md` in full. These apply to every visual choice below.
3. **Validated wireframes:** `docs/ideation/wireframes.md` shows the target screens with a clean matrix (zero orphans, zero homeless Musts). Missing/unvalidated → offer `/wireframe-loop` first, or record the user's explicit choice to proceed on unvalidated structure (labeled in the ledger).
4. **Figma MCP reachable** (same check as wireframe-loop Step 0). Unreachable → STOP; there is no markdown fallback for hi-fi.

## Step 1 — Lock 1: clean system before design

Run `/design-tokens-sync` (the full skill, not a shortcut):

- **Any HIGH or MEDIUM drift → BLOCKED.** Report the drift table, resolve it through that skill's approval flow (user approves token patches; the PreToolUse hook enforces confirmation on `design/tokens.json`), then re-run until HIGH/MEDIUM are zero.
- LOW drift: list it in the ledger; it does not block, but any LOW-drift token this feature actually uses gets resolved now, not later.
- Do not touch a single fill in Figma while lock 1 is open. Designing on drifted tokens produces work that is wrong the moment it's made.

## Step 2 — Apply the visual system

**Figma tool sequence** — read state with `get_metadata` (frame inventory), `get_design_context` (layer values), and `get_variable_defs` (variable bindings); make changes through the Figma MCP's write path (`use_figma` — read its skill first, as its own instructions require). Duplicating a frame, applying a variable binding, and re-reading the result are all done through these tools — never assumed, never eyeballed from screenshots.

Working frame-by-frame from the `wf/*` lo-fi frames (duplicate to `hifi/<screen-name>` — never restyle the wireframes in place; they are the structural record):

1. Every fill, stroke, text style, spacing value, and radius binds to a **Figma variable** that appears in the mapping table of `design/tokens.md`. Values come from variables — never typed-in raw hex/px that "matches" a token.
2. Structure is law: the region layout, order, and hierarchy validated by the wireframe matrix must survive styling. Moving/removing a region is a `wireframe-loop` change, not a styling choice.
3. Both themes — design light and dark variants (the intake default is reviewed first); house rules (44×44px tap targets, focus states, contrast AA) apply inside Figma, not just in code.
4. Missing token (the design genuinely needs a value the system lacks) → STOP, propose the token through `/design-tokens-sync`'s add flow, get approval, then bind to it. Never park a raw value "temporarily".

## Step 3 — Lock 2: the audit pass (the loop core)

Audit every `hifi/*` frame:

1. Walk each frame's layers via `get_design_context` + `get_variable_defs`; a value with no variable binding in the response is **unbound** (raw fill, detached style, hand-typed dimension where a spacing variable exists) — list each with frame + layer path.
2. Verify each bound variable resolves through `design/tokens.md`'s mapping to a real path in `design/tokens.json` — a variable bound to nothing is drift being born.
3. Re-check the wireframe matrix against the hi-fi frames: every region still present, still in validated order, no features lost in translation and no new unmapped UI smuggled in with the polish.
4. Fix everything found; update the ledger; repeat until a full audit finds **zero** violations.

## Exit condition (no exceptions)

- Zero unbound values across all hi-fi frames
- Every variable maps to `design/tokens.json` via `design/tokens.md`
- `/design-tokens-sync` re-run confirms zero HIGH/MEDIUM drift (the hi-fi work itself introduced none)
- Wireframe validation matrix still holds against the hi-fi frames

Present the gate evidence — drift result, unbound-value count (0), matrix confirmation, frame links — and ask for the verdict.

## Forbidden moves

- **No "fix it in code".** A value that isn't right in Figma does not get quietly corrected during build — that splits the source of truth.
- **No partial gates.** "Only three raw values left" is BLOCKED, not almost-done.
- **No restyling wireframe frames in place.**
- **No editing `design/tokens.json` outside `/design-tokens-sync`'s approval flow.**

## Handoffs

- Gate passed + user verdict → `/from-figma` builds it, citing this gate's evidence in its Step 0.
- Visual direction feels wrong even though it's token-clean → run a scratch-route variant exploration (3 distinct variants, screenshotted; the user picks), then `/taste-retro` for the corrections.
- Drift keeps reappearing between runs → someone is editing Figma variables outside the sync flow; flag it to the user as a process problem, not a token problem.
