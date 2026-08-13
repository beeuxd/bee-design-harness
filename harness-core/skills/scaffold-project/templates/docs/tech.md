# Tech Stack & Conventions

## Stack

<!-- Adjust to your project -->

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (restyled) |
| Component workshop | Storybook + `@storybook/addon-mcp` (optional, set up via the `storybook-component` skill) |
| Fonts | Plus Jakarta Sans + Geist Mono via `next/font` |
| Package manager | pnpm |
| Deployment | Vercel |

## Storybook (when adopted)

- `pnpm storybook` runs the dev instance; the MCP server is exposed at `/mcp` on that server (registered via `@storybook/addon-mcp` in `.storybook/main.ts`) — agents connect there to query components, props, variants, and stories before building anything new.
- Storybook is a **source of truth** for coded component behavior (precedence in `DESIGN.md`: tokens.json > Figma > Storybook > components.md).
- Story-per-component is the discipline: every component in `design/components.md` has a story covering its full states matrix, dark-first (`storybook-component` skill owns this).
- Previews import `app/globals.css` so tokens are live in stories.
- If the project declined Storybook, that decision is recorded here: <!-- Storybook: adopted / declined YYYY-MM-DD -->


## Folder Structure

```
/app                    # Next.js App Router pages
  /api                  # API routes
  layout.tsx            # Root layout
  page.tsx              # Home page
/components
  /ui                   # shadcn/ui primitives (restyled)
  /site                 # Bespoke project components
/lib
  utils.ts              # cn() and shared utilities
/docs                   # Project documentation
  /research             # raw data, insights.md, problems.md, personas/
  /ideation             # feature-tree.md, wireframes.md
/design                 # Design system documentation + tokens
/.storybook             # Storybook config (when adopted)
/.claude                # Claude Code config (agents, skills, hooks)
/public                 # Static assets
```

## Performance Budget

| Metric | Budget | Tool |
|--------|--------|------|
| LCP | <= 2.5s (mobile) | Lighthouse |
| INP | <= 200ms | Chrome DevTools / CrUX |
| CLS | <= 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |
| JS first-load | < 150KB gzipped | Next.js build output |
| Total first-load | < 400KB | Next.js build output |

**INP replaced FID in March 2024.** INP measures every interaction across the entire page lifecycle (not just the first). 40% of sites that passed FID fail INP.

## Component Conventions

- **Files:** `kebab-case.tsx` (e.g., `tower-scroll.tsx`)
- **Components:** `PascalCase` (e.g., `TowerScroll`)
- **Prop types:** `PascalCaseProps`, exported alongside component
- **Default export** the component, named export the prop type
- **Accepts `className` prop**, merges via `cn()` from `lib/utils.ts`

### Template

```tsx
import { cn } from "@/lib/utils";

export type MyComponentProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function MyComponent({
  title,
  description,
  className,
}: MyComponentProps) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      {/* ... */}
    </section>
  );
}
```

## Client vs Server Components

**Server Components by default.** Only add `"use client"` when you need:
- `useState`, `useEffect`, `useRef`
- Browser APIs (`window`, `document`, `IntersectionObserver`)
- Event handlers (`onClick`, `onChange`)
- Third-party client libraries

**Decision tree:**
1. Does it need state or effects? -> Client
2. Does it need browser APIs? -> Client
3. Does it handle user events? -> Client
4. Everything else -> Server

Keep client components minimal and leaf-level. Server components wrap them.

**Never use `useMediaQuery` hooks for layout** — prefer CSS-driven responsive patterns to avoid hydration mismatches and layout shifts.

## Responsive Approach

Three-layer strategy:

1. **Viewport breakpoints** (`sm:`, `md:`, `lg:`, `xl:`) — page-level layout only (grid columns, nav mode, section stacking)
2. **Container queries** (`@container` + `@sm:`, `@md:`, `@lg:`) — all reusable components (cards, widgets, sidebars). Add `@container` to parent, use `@sm:` etc. on children.
3. **Fluid techniques** (`clamp()`, flex/grid intrinsic sizing) — typography, spacing, anything that scales gradually

### Tailwind v4 Container Queries

```tsx
{/* Parent: declare container */}
<div className="@container">
  {/* Child: respond to container width */}
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    ...
  </div>
</div>
```

## Image Rules

- `next/image` always, with explicit `width` and `height`
- `priority` only on the single LCP image (above-fold)
- **`sizes` prop is critical** — without it, browser downloads the largest srcset variant. Example: `sizes="(max-width: 768px) 100vw, 33vw"` for a 3-column grid
- `alt` always — meaningful or `""` for decorative
- Serve AVIF/WebP (default for `next/image`)
- No images > 200KB after optimization

## Testing

- `pnpm lint` — clean before commit
- `pnpm build` — must pass before merge
- Lighthouse (mobile profile) — all Core Web Vitals green
- Manual keyboard navigation check
- VoiceOver spot-check for dynamic content
- Viewport sweep: 360, 768, 1024, 1440, 1920px
