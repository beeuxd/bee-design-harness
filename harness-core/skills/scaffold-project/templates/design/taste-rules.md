# Taste rules

Standing design rules for this project. **Read this file before any visual build or review.** Every rule is a checkable gate: a build that violates one is not done until the violation is fixed or the user explicitly waives it.

Rules get added by the `taste-retro` skill — when the user corrects visual output, the correction becomes a rule here, dated, in their spirit. Never argue with a rule; if a new rule contradicts an old one, surface both and let the user resolve it.

---

## Universal anti-slop rules (seeded — apply to every project)

These are the known tells of AI-generated design. Each one is banned by default; a project's art direction in `docs/design-system.md` may consciously override one, but silence means banned.

**Color & theme**
- One accent color per viewport. If two things compete for "look at me," neither wins.
- No purple-gradient-on-white default aesthetic. No glassmorphism unless the art direction names it.
- Don't reach for the three cliché "tasteful AI" looks: warm-cream + serif + terracotta; near-black + acid accent; hairline-rule broadsheet. They read as generated because everyone's generator reaches for them.
- Dark mode is designed, not inverted: surfaces get their own values, shadows become borders/elevation changes, saturated colors get desaturated a step.

**Type & hierarchy**
- Hierarchy comes from weight and color before size. If everything important is just "bigger," the scale escalates until nothing is important.
- Stick to the project type scale — no one-off font sizes. De-emphasize secondary text with `text-muted-foreground`, not smaller-and-smaller sizes.
- Line length: body text 45–75 characters. Full-width paragraphs on desktop are a defect.

**Layout & spacing**
- Not everything centered. Centered-everything is the single strongest generated-page tell. Choose an alignment system and commit.
- Spacing from the scale only; when in doubt between two steps, take the larger — cramped reads cheap, air reads intentional.
- No uniform card-grid-of-everything. If every section is three equal cards with an icon, a heading, and two lines, the page has no ideas.
- Borders are the last resort for separation — try spacing first, then background shifts, then borders.

**Depth & decoration**
- Shadows form a deliberate elevation system (small set, consistent), not a per-component garnish.
- Decoration must earn its place: if removing an element loses nothing, remove it.

**Content**
- Real content pressure-tests design: long names, empty lists, error states. Lorem-shaped design breaks on contact with reality.
- Never invent marketing copy — flag `[COPY NEEDED]` instead.

---

## This project's rules

_Added by `taste-retro` as the user gives corrections. Format:_

<!--
- **YYYY-MM-DD — Rule as one imperative sentence.**
  Why (user's words): "…"
  Example: path/to/file.tsx:line or screenshot
-->

_None yet — the art direction interview (`art-direction` skill) seeds the first entries._

---

## Resolved contradictions

_When a new rule overrides an old one, the resolution is recorded here with its date._
