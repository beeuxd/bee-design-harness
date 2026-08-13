# Component Inventory

**Figma source:** {{FIGMA_URL}}

## shadcn/ui Primitives

All shadcn components must be restyled to project tokens before shipping — visuals get the project treatment; interaction behavior stays the primitive's.

| Component | Status | Notes |
|-----------|--------|-------|
| Accordion | Available | |
| Alert | Available | |
| Alert Dialog | Available | |
| Aspect Ratio | Available | |
| Avatar | Available | |
| Badge | Available | |
| Breadcrumb | Available | |
| Button | Available | 6 variants (Default, Secondary, Destructive, Outline, Ghost, Link), 6 states (Default, Hover, Focus, Pressed, Disabled, Loading), 4 sizes (sm/default/icon/lg) |
| Calendar | Available | |
| Card | Available | |
| Carousel | Available | |
| Checkbox | Available | |
| Collapsible | Available | |
| Combobox | Available | |
| Command | Available | |
| Context Menu | Available | |
| Data Table | Available | |
| Date Picker | Available | |
| Dialog | Available | Use Drawer on mobile (Dialog->Drawer responsive pattern) |
| Drawer | Available | Mobile replacement for Dialog |
| Dropdown Menu | Available | |
| Form | Available | |
| Hover Card | Available | |
| Input | Available | |
| Input OTP | Available | |
| Label | Available | |
| Menubar | Available | |
| Navigation Menu | Available | |
| Pagination | Available | |
| Popover | Available | |
| Progress | Available | |
| Radio Group | Available | |
| Resizable | Available | |
| Scroll Area | Available | |
| Select | Available | |
| Separator | Available | |
| Sheet | Available | Use for mobile navigation |
| Sidebar | Available | |
| Skeleton | Available | |
| Slider | Available | |
| Sonner | Available | Toast notifications |
| Switch | Available | |
| Table | Available | Needs horizontal scroll wrapper or card layout on mobile |
| Tabs | Available | |
| Textarea | Available | |
| Toggle | Available | |
| Toggle Group | Available | |
| Tooltip | Available | |

## Custom Components

| Component | File Path | Description | Props |
|-----------|----------|-------------|-------|
| | | | |

## Figma-to-Code Component Mapping

| Figma Component | Code Component | Props Mapping |
|----------------|----------------|--------------|
| Button (Variant=Default) | `<Button>` | variant="default" |
| Button (Variant=Secondary) | `<Button variant="secondary">` | |
| Button (Variant=Destructive) | `<Button variant="destructive">` | |
| Button (Variant=Outline) | `<Button variant="outline">` | |
| Button (Variant=Ghost) | `<Button variant="ghost">` | |
| Button (Variant=Link) | `<Button variant="link">` | |
| Button (Size=sm) | `<Button size="sm">` | h-8 (32px) |
| Button (Size=default) | `<Button size="default">` | h-9 (36px) |
| Button (Size=icon) | `<Button size="icon">` | h-9 w-9 (36x36) |
| Button (Size=lg) | `<Button size="lg">` | h-10 (40px) |

## Component Rules

### Do

- Use existing shadcn primitives before building custom
- Restyle every primitive to project tokens (no defaults)
- Accept `className` prop and merge via `cn()`
- Type all props with exported type
- Use `@container` for responsive behavior in reusable components
- Meet 44x44px touch target minimum
- Support keyboard navigation
- Include `aria-label` when visual label is absent

### Don't

- Ship unstyled shadcn defaults
- Create a component that only works on desktop
- Hardcode colors, spacing, or radius
- Use `<div onClick>` instead of `<button>`
- Mix component libraries (shadcn only)
- Create a new component when an existing one can be extended
