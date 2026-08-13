# UI & Interaction Patterns

Reusable patterns for layout, navigation, forms, feedback, and data display. Reference these when building — don't reinvent.

## Layout Patterns

### Page Shell

```
<header>   — fixed or sticky nav
<main>     — content area, max-w-7xl centered
<footer>   — site footer
```

- Max width: `max-w-7xl` (1280px) centered with `mx-auto`
- Padding: `px-4 md:px-6 lg:px-8`
- Section rhythm: `py-16 md:py-24 lg:py-32`

### Content Sections

- **Full-width:** Breaks out of max-width for backgrounds, contains inner content at max-w-7xl
- **Constrained:** Stays within max-w-7xl, uses grid or flex
- **Narrow:** `max-w-xl` (576px) or `max-w-2xl` (672px) for text-heavy content

### Grid System

- Mobile: single column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Use CSS Grid with `@container` queries for component-level responsiveness

```tsx
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-4 md:gap-6">
```

### Responsive Stacking

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero | Stacked (image below text) | Side-by-side | Side-by-side |
| Cards | Single column | 2-column grid | 3-column grid |
| Feature rows | Stacked | Alternating left/right | Alternating left/right |
| Stats | 2x2 grid | 4-column row | 4-column row |

## Navigation Patterns

### Desktop Nav

- Horizontal top bar, sticky
- Logo left, links center or right, CTA right
- Dropdown menus on hover (with keyboard support)

### Mobile Nav

- Hamburger icon -> Sheet (slide-in panel)
- Full-height, includes all nav items
- Close on link click, close on Escape
- Focus trap when open

### Breadcrumbs

- Show on detail pages, not on landing/home
- Current page is not a link
- Truncate on mobile (show parent + current only)

## Form Patterns

### Input Validation

- Validate on blur, not on every keystroke
- Show error message below the field
- Error text is red + descriptive (not just "Invalid")
- Required fields: text label says "Required" or asterisk with legend

### Progressive Disclosure

- Show only necessary fields first
- Reveal advanced options via "More options" toggle
- Multi-step forms: show step indicator, allow back navigation

### Multi-Step Forms

```
Step 1 of 3: [Basic Info]  →  Step 2: [Details]  →  Step 3: [Review]
[Back] [Continue]                                     [Back] [Submit]
```

- Progress indicator visible at all times
- Back button always available
- Review step before final submission
- Save partial progress when possible

## Feedback Patterns

### Loading States

- **Skeleton:** Use for content that takes shape (cards, lists, text blocks)
- **Spinner:** Use for actions (button click -> spinner in button)
- **Progress bar:** Use for known-duration operations

### Empty States

- Illustration or icon (optional)
- Clear message explaining why it's empty
- Primary CTA to take the first action
- Never show a blank white space

### Error States

- **Inline errors:** Below the field that failed, in red with descriptive text
- **Page-level errors:** Toast notification (Sonner) or alert banner at top
- **Network errors:** Retry button + explanation of what happened
- Every error tells the user: what happened, why, and what to do next

### Success States

- Toast notification for minor actions
- Full-page confirmation for major actions (purchase, signup)
- Include next step or redirect

### Toast / Notifications (Sonner)

- Auto-dismiss after 5 seconds
- Include dismiss button
- Stack vertically, newest on top
- Max 3 visible at once

## Data Display Patterns

### Tables

- Desktop: full table with sortable columns
- Mobile: card layout or horizontal scroll wrapper
- Sticky header for long tables
- Row hover state for interactivity

### Cards

- Use `@container` for responsive card layouts
- Content hierarchy: image -> title -> description -> metadata -> CTA
- Equal height in grid (stretch)
- Touch-friendly (entire card clickable or clear CTA button)

### Lists

- Vertical stack with separator between items
- Load more / pagination at bottom
- Consider virtual scrolling for 100+ items

### Detail Views

- Header section with title + metadata
- Content body with consistent spacing
- Sticky sidebar on desktop, collapsed on mobile
- Back navigation always visible

## Modal / Dialog Patterns

### When to Use

- **Dialog:** Confirmation, short forms, important decisions
- **Sheet:** Settings panels, filters, mobile navigation
- **Drawer:** Bottom sheet on mobile (replacement for Dialog)
- **Inline:** Edits that can happen in context without breaking flow

### Rules

- Focus trap: Tab stays within the modal
- Escape key closes
- Click outside closes (unless destructive action is in progress)
- Scroll lock on body when modal is open
- Return focus to trigger element on close
- Dialog on desktop, Drawer on mobile (use responsive pattern)

### Responsive Modal Pattern

```tsx
// Desktop: Dialog, Mobile: Drawer
const isDesktop = useMediaQuery("(min-width: 768px)");
// Or better: use CSS-only approach with Credenza pattern
```
