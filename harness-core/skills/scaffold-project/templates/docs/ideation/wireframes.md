# Wireframe Validation Matrix

Produced and maintained by `/wireframe-loop`. Wireframes live as **lo-fi frames in Figma** (greyscale boxes + labels, real hierarchy, no visual styling); this file is the audit trail proving every screen region earns its place. At loop exit: zero orphan regions, zero homeless Must features.

## Screen Inventory

| Screen | Figma frame (link) | Flow (docs/user-flows.md) | Status |
|--------|--------------------|---------------------------|--------|
| | | | Draft / Validated |

## Per-screen matrix

One section per screen:

```markdown
## <Screen name>

Figma frame: <link>

| Region (top → bottom, as labeled in the frame) | FEAT-ID | PROB-ID | Hierarchy note |
|------------------------------------------------|---------|---------|----------------|
| | | | Must features hold the dominant positions (see design/patterns.md) |

Orphan regions (no Must/Should FEAT-ID — remove or justify): none
Missing Musts (Must features with no home on any screen): none
```

## Director's Ledger

| Date | Iteration | What changed | Why |
|------|-----------|--------------|-----|
| | | | |

## Gate Ledger (maintained by /hifi-gate)

One row per hifi-gate audit iteration; the final row is the gate evidence `from-figma` cites at build time.

| Date | Iteration | Unbound values found → fixed | Drift result (design-tokens-sync) | Matrix holds? |
|------|-----------|------------------------------|-----------------------------------|---------------|
| | | | | |

---

Consumed by: `/hifi-gate` (which hard-blocks until tokens ↔ Figma are 100% clean), then `/from-figma` to build.
