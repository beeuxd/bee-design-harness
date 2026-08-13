# Design System

**Token source of truth:** `design/tokens.json` (W3C DTCG format)
**Human-readable reference:** `design/tokens.md`
**Figma file:** {{FIGMA_URL}}

## Aesthetic Direction

<!-- What should this product feel like? One sentence. -->
{{AESTHETIC}}

## Color Strategy

**Dark mode is primary.** Design, build, and test in dark mode first. Light mode is secondary — implement only when explicitly requested. All colors reference semantic tokens from `design/tokens.json`.

### Usage Rules

- **Primary (`#9d7bf1`)** — Brand, primary CTAs, active states. One primary CTA per section max.
- **Secondary (`#262626`)** — Secondary actions, surfaces.
- **Destructive (`#f87171`)** — Dangerous actions. Always requires confirmation dialog.
- **Muted (`#f5f5f5` / `#737373`)** — Backgrounds, secondary text, disabled states.
- **Border (`#e5e5e5`)** — Hairline borders (1px). Use for separation, not decoration.
- **Accent (`#a29bfd66`)** — Translucent highlights. Hover states, focus backgrounds.

### Rules

- No hardcoded hex in components — reference CSS variables or Tailwind semantic classes
- Every color pairing must pass WCAG 2.2 AA contrast (4.5:1 body text, 3:1 large text)
- Color is never the sole indicator of state (always pair with text, icon, or shape change)

## Typography

### Fonts

- **Sans:** Plus Jakarta Sans (via `next/font`) — all UI text
- **Mono:** Geist Mono (via `next/font`) — code, data, technical content

### Scale

Use fluid sizing with `clamp()` for headings. Body text stays fixed.

| Role | Size | Weight | Tailwind |
|------|------|--------|---------|
| Display | 48px / 48px | extrabold (800) | `text-5xl font-extrabold` |
| H1 | 36px / 40px | extrabold (800) | `text-4xl font-extrabold` |
| H2 | 30px / 36px | semibold (600) | `text-3xl font-semibold` |
| H3 | 24px / 32px | semibold (600) | `text-2xl font-semibold` |
| H4 | 20px / 28px | semibold (600) | `text-xl font-semibold` |
| Body | 16px / 24px | normal (400) | `text-base` |
| Body small | 14px / 20px | medium (500) | `text-sm font-medium` |
| Caption | 12px / 16px | medium (500) | `text-xs font-medium` |

### Rules

- Maximum 2 font weights per section (for visual clarity)
- Line length: 45-75 characters for body text
- Check line-counts at each breakpoint — a headline that's 2 lines on desktop and 6 on mobile is a design failure

## Spacing

8px grid. All spacing uses the Tailwind scale.

### Section Rhythm

- **Between major sections:** `py-16 md:py-24 lg:py-32`
- **Between subsections:** `py-8 md:py-12 lg:py-16`
- **Within components:** `p-3` to `p-6` depending on density

### Rules

- No arbitrary spacing values (`p-[13px]` is banned)
- Consistent vertical rhythm within a page
- Mobile spacing can be tighter but never cramped (min `p-3` for interactive areas)

## Borders & Depth

- **Borders:** Hairline (1px) using border token. For separation, not decoration.
- **Radius:** `rounded-sm` (6px) for small elements, `rounded-lg` (10px) for cards, `rounded-xl` (14px) for prominent containers, `rounded-2xl` (16px) for modals/sheets
- **Shadows:** `shadow-xs` only (0 1px 2px #0000000d). Shadows are subtle — depth comes from color and borders.

## Motion Principles

- **When to animate:** Reveal structure, direct attention, signal state change
- **When NOT to animate:** Decoration, showing off, anything that delays the user
- **Duration:** 150-300ms for micro-interactions, 300-500ms for transitions
- **Easing:** ease-out for entrances, ease-in for exits
- **Reduced motion:** Everything works without animation. Use `prefers-reduced-motion` progressive approach.
- **Mobile:** Simpler or disabled animations on mobile for performance

## Component Tiers

1. **shadcn/ui primitives** — installed and restyled to project tokens. Never ship defaults.
2. **Project wrappers** — lightly modified compositions of shadcn primitives
3. **Bespoke components** — custom-built for specific product needs

See `design/components.md` for the full inventory and `design/patterns.md` for reusable patterns.
