# Accessibility Standards — WCAG 2.2 AA

Baseline: WCAG 2.2 Level AA. The European Accessibility Act (EAA) took effect June 2025 and references this standard.

## Automated Checks (run first)

- [ ] `pnpm lint` — no errors
- [ ] Lighthouse on the page (mobile profile) — Accessibility score >= 95
- [ ] axe DevTools extension on the page — no violations

## Keyboard Navigation

- [ ] Tab through every interactive element in order — focus is visible, order is logical
- [ ] All interactive elements reachable without a mouse
- [ ] Escape closes dialogs, sheets, popovers
- [ ] Enter / Space activate buttons and links
- [ ] Arrow keys navigate within composite widgets (tabs, menus, radio groups)
- [ ] Skip link present to bypass navigation
- [ ] No keyboard traps (focus can always escape)

## Semantic HTML

- [ ] One `<h1>` per page
- [ ] Heading hierarchy descends without skipping (h1 -> h2 -> h3)
- [ ] Landmarks present: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] Buttons are `<button>`, links are `<a href>` — no `<div onClick>`
- [ ] Form inputs have associated `<label>` or `aria-label`
- [ ] Lists use `<ul>`/`<ol>` + `<li>`, not styled divs

## Images & Media

- [ ] All meaningful images have descriptive `alt`
- [ ] Decorative images have `alt=""`
- [ ] SVGs that convey meaning have `<title>` or `aria-label`
- [ ] Videos have captions
- [ ] Audio has transcripts

## Color & Contrast

- [ ] Body text on background passes 4.5:1 contrast ratio
- [ ] Large display text (18px+ bold or 24px+ regular) passes 3:1
- [ ] Don't rely on color alone (e.g., required fields need more than red border)
- [ ] Focus rings visible against every background they appear on
- [ ] UI components and graphical objects pass 3:1 against adjacent colors
- [ ] Verify with deuteranopia, protanopia, and tritanopia simulations (Chrome DevTools > Rendering)

## Motion & Animation

- [ ] `prefers-reduced-motion: reduce` renders static final state — page fully usable
- [ ] Use progressive approach: animations only play when `prefers-reduced-motion: no-preference`
- [ ] No auto-playing video with sound
- [ ] No flashing > 3 times per second
- [ ] Animation durations: 150-300ms for micro, 300-500ms for transitions
- [ ] Prefer `transform` and `opacity` (GPU-composited, no layout thrash)

## Touch Targets (WCAG 2.2)

- [ ] All interactive elements >= 44x44px (exceeds WCAG 2.2 AA minimum of 24px)
- [ ] Primary CTAs: 44-52px tall
- [ ] Use CSS padding or pseudo-elements to expand touch targets without changing visual size
- [ ] Spacing between adjacent targets >= 8px

## Forms

- [ ] Every input has a visible label (not just placeholder)
- [ ] Required fields indicated with text, not just asterisk color
- [ ] Error messages identify the field and explain how to fix
- [ ] Form validation announced to screen readers via `aria-live` or `aria-describedby`
- [ ] Autocomplete attributes present where applicable

## WCAG 2.2 Specific Criteria

- [ ] **2.4.11 Focus Not Obscured (Minimum)** — focused element is at least partially visible
- [ ] **2.5.7 Dragging Movements** — single-pointer alternative exists for any drag operation
- [ ] **2.5.8 Target Size (Minimum)** — targets are at least 24x24 CSS pixels (we enforce 44x44)
- [ ] **3.3.7 Redundant Entry** — don't ask for the same info twice in a session
- [ ] **3.3.8 Accessible Authentication** — no cognitive function tests (copy-paste allowed for auth)

## Screen Reader Spot-Check

- [ ] Turn on VoiceOver (Mac) or NVDA (Win), tab through page
- [ ] Headings announced correctly
- [ ] Interactive elements announce role + state
- [ ] Decorative elements don't get announced
- [ ] Dynamic content changes announced via `aria-live`

## Mobile Accessibility

- [ ] Page usable at 360px wide without horizontal scroll
- [ ] Text zoom to 200% doesn't break layout
- [ ] 400% zoom on 1280px viewport reflows to single column (WCAG 1.4.10)
- [ ] Orientation works (portrait + landscape)
- [ ] Touch targets meet 44x44px minimum

## Per-Component ARIA Patterns

Reference W3C APG: https://www.w3.org/WAI/ARIA/apg/patterns/

For each component, document:
- Required ARIA roles/attributes
- Keyboard interaction spec (which keys do what)
- Focus management (where focus goes on open/close)
- Live region announcements for dynamic content

## Output

Give the user:
1. Pass — what passed
2. Warning — what's borderline (and how to fix)
3. Fail — what's failing (with exact file + line + suggested fix)
