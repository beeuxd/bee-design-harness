# Design Tokens Reference

**Source of truth:** `design/tokens.json` (W3C DTCG format)

This file is a human-readable reference. If tokens.json and this file disagree, tokens.json wins.

**Figma source:** {{FIGMA_URL}}

## Color Palette

### Primitives

| Token | Value | Usage |
|-------|-------|-------|
| purple-500 | `#9d7bf1` | Primary brand color |
| purple-600 | `#764ae2` | Sidebar ring, deeper purple |
| purple-accent | `#a29bfd` | Accent base (used with alpha) |
| prism | `#B6B1F6` | Border prism effect |
| red-400 | `#f87171` | Destructive actions |
| red-50 | `#fef2f2` | Destructive foreground |
| black | `#000000` | Dark mode background |
| white | `#ffffff` | Light mode background |
| zinc-900 | `#18181b` | Deep dark surfaces |
| neutral-900 | `#0a0a0a` | Primary foreground text |
| neutral-800 | `#262626` | Secondary surfaces |
| neutral-500 | `#737373` | Muted text |
| neutral-200 | `#e5e5e5` | Borders |
| neutral-100 | `#f5f5f5` | Muted backgrounds |
| neutral-50 | `#fafafa` | Text on dark surfaces |

### Semantic Colors

| Token | References | Usage |
|-------|-----------|-------|
| background | black | Page background |
| foreground | neutral-900 | Primary text |
| primary | purple-500 | Primary action / brand |
| primary-foreground | neutral-50 | Text on primary |
| secondary | neutral-800 | Secondary action |
| secondary-foreground | neutral-50 | Text on secondary |
| accent | #a29bfd66 | Accent highlight (translucent) |
| accent-foreground | neutral-50 | Text on accent |
| muted | neutral-100 | Muted background |
| muted-foreground | neutral-500 | Muted/secondary text |
| border | neutral-200 | Default border |
| destructive-foreground | red-50 | Text on destructive |
| sidebar-ring | purple-600 | Sidebar focus ring |

### Alpha Values

| Token | Value | Usage |
|-------|-------|-------|
| alpha/60 | `#ffffff66` (white 40%) | Overlay, translucent white |
| alpha/10 | `#0a0a0ae5` (black 90%) | Deep overlay |
| alpha/80 | `#0a0a0a33` (black 20%) | Light overlay |
| alpha/90 | `#0a0a0a1a` (black 10%) | Subtle overlay |

## Typography

### Font Families

| Token | Value |
|-------|-------|
| font-sans | Plus Jakarta Sans |
| font-mono | Geist Mono |

### Type Scale

| Name | Size | Line Height | Typical Weight |
|------|------|------------|----------------|
| xs | 12px | 16px | medium (500) |
| sm | 14px | 20px | medium (500) |
| base | 16px | 24px | normal (400) |
| lg | 18px | 28px | normal (400) / semibold (600) |
| xl | 20px | 28px | semibold (600) |
| 2xl | 24px | 32px | semibold (600) |
| 3xl | 30px | 36px | semibold (600) |
| 4xl | 36px | 40px | extrabold (800) |
| 5xl | 48px | 48px | extrabold (800) |

### Font Weights

| Name | Value |
|------|-------|
| light | 300 |
| normal | 400 |
| medium | 500 |
| semibold | 600 |
| bold | 700 |
| extrabold | 800 |

## Spacing

Follows the Tailwind scale. All spacing is multiples of 4px.

| Token | Value | Tailwind |
|-------|-------|---------|
| 0 | 0px | `p-0` |
| 1 | 4px | `p-1` |
| 2 | 8px | `p-2` |
| 3 | 12px | `p-3` |
| 4 | 16px | `p-4` |
| 6 | 24px | `p-6` |
| 8 | 32px | `p-8` |
| 10 | 40px | `p-10` |
| 16 | 64px | `p-16` |
| 32 | 128px | `p-32` |

## Border Radius

| Token | Value | Tailwind |
|-------|-------|---------|
| sm | 6px | `rounded-sm` |
| md | 8px | `rounded-md` |
| lg | 10px | `rounded-lg` |
| xl | 14px | `rounded-xl` |
| 2xl | 16px | `rounded-2xl` |

## Border Width

| Token | Value |
|-------|-------|
| default | 1px |
| 2 | 2px |

## Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |

**Responsive strategy:** Viewport breakpoints for page layout only. Container queries (`@container`) for reusable components. Fluid `clamp()` for typography.

## Sizes

| Token | Value | Usage |
|-------|-------|-------|
| h-8 | 32px | Button sm height |
| h-9 | 36px | Button default height |
| h-10 | 40px | Button lg height |
| max-w-xl | 576px | Narrow content |
| max-w-2xl | 672px | Medium content |
| max-w-7xl | 1280px | Full-width container |

## Shadow

| Token | Value |
|-------|-------|
| shadow-xs | `0 1px 2px 0 #0000000d` |

## Focus Rings

| Token | Value | Usage |
|-------|-------|-------|
| focus/default | Purple ring (`#a29bfd66`) + dark border | Default focus state |
| focus/destructive | Red ring (`#f8717166`) + dark border | Destructive focus state |

## Figma Variable Mapping

Figma variables map to code tokens as follows:

| Figma Variable | Code Token |
|---------------|-----------|
| `base/primary` | `--primary` / `bg-primary` |
| `base/secondary` | `--secondary` / `bg-secondary` |
| `base/background` | `--background` / `bg-background` |
| `base/foreground` | `--foreground` / `text-foreground` |
| `base/muted` | `--muted` / `bg-muted` |
| `base/muted-foreground` | `--muted-foreground` / `text-muted-foreground` |
| `base/border` | `--border` / `border-border` |
| `base/accent` | `--accent` / `bg-accent` |

## Style Dictionary Setup (optional)

To generate CSS custom properties from `tokens.json`:

```bash
npm install -D style-dictionary
```

Create `style-dictionary.config.json` and run `npx style-dictionary build` to generate CSS output. See https://styledictionary.com/info/dtcg/ for DTCG integration.
