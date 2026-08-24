---
name: wcag-accessibility
description: Audit and build for accessibility to WCAG 2.2 AA — the house baseline. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make this accessible", and as the reference while designing or reviewing any component or flow.
---

# WCAG 2.2 accessibility — the house baseline

WCAG 2.2 AA is the harness's floor, not its ceiling — several house rules exceed it (notably
44×44px targets where WCAG asks 24×24). This skill guides build-time decisions and hands-on
audits; the automated ship gate is harness-core's `a11y-audit` — passing here feeds evidence
there, not the other way around.

## How to audit (in this order)

1. **Automated pass** — axe/Lighthouse. Catches roughly a third of real issues (contrast,
   missing names, ARIA misuse). Zero automated findings means the audit *starts* now.
2. **Keyboard walk** — unplug the mouse. Tab through every flow: everything interactive is
   reachable, in a sensible order, with a visible focus ring; nothing traps; `Esc` closes what
   opened; skip link works.
3. **Screen reader pass** — VoiceOver (Safari) at minimum. Landmarks navigate, headings outline
   the page truthfully, controls announce name/role/state, async updates get announced.
4. **Zoom & reflow** — 200% zoom loses nothing; 400% (≈320px viewport) reflows without
   horizontal scrolling. The house 360px-first rule makes this nearly free — verify it anyway.
5. **Both themes** — run the contrast checks in light *and* dark; dark mode is where contrast
   quietly dies.

## The checklist that catches most failures

- **Semantics first**: native elements before ARIA (`button`, `a`, `label`, headings in order,
  landmarks). No ARIA beats bad ARIA.
- **Contrast**: text ≥ 4.5:1 (large ≥ 3:1); UI components and focus indicators ≥ 3:1 against
  adjacent colors. Check disabled-looking-but-enabled states.
- **Never color alone** — pair with icon, text, or pattern.
- **Focus**: visible always (`:focus-visible` styled per the design system, ≥ 3:1); order follows
  visual order; focus moves *into* dialogs and returns on close.
- **Forms**: visible labels tied to inputs, errors named at the field and announced,
  `autocomplete` where relevant.
- **Motion**: every animation respects `prefers-reduced-motion`; nothing flashes > 3×/second;
  auto-playing movement over 5s is pausable.
- **Media**: images get purpose-driven alt (or `alt=""` when decorative); video gets captions.
- **Touch**: targets ≥ 44×44px (house rule), adequate spacing between adjacent targets.

## New in 2.2 — the criteria older checklists miss

- **Focus not obscured**: sticky headers/footers must never fully hide the focused element.
- **Dragging movements**: any drag interaction has a single-pointer alternative (buttons, tap).
- **Target size**: 24×24 CSS px minimum — house standard is 44, so meet that.
- **Consistent help**: help mechanisms (chat, contact) appear in the same place on every page.
- **Redundant entry**: never ask for the same information twice in one flow — carry it forward.
- **Accessible authentication**: no cognitive test to log in — allow paste, password managers,
  no transcription puzzles.

## When it's a design decision, not a fix

Contrast failures traced to the palette, focus styles that fight the art direction, or motion
that can't be reduced gracefully are token/design-system problems — route them to the
`design/tokens.json` flow and `taste-retro`, don't patch them per-component.
