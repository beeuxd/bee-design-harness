# UX Principles

## Core Principles

These apply to every project, every screen, every interaction.

### 1. One job per screen

Every screen or section has a single job: hook, prove, teach, or convert. If it can't state its job in one sentence, it's too diffuse — split it or cut it.

### 2. Visual hierarchy guides the eye

Size, weight, color, whitespace, and position all vote. If you squint at a wireframe, what do you see first, second, third? That order must match the intent.

### 3. Whitespace is a feature

Generous vertical rhythm. Tight spacing on mobile kills usability and conversion. Give elements room to breathe.

### 4. The first viewport communicates purpose

What's visible in the first viewport on mobile and desktop must: (a) signal what this is, (b) show a CTA or a clear path to one. The fold is a fiction, but the first screen isn't.

### 5. Every interaction has visible feedback

Buttons respond on press. Forms validate inline. Loading states are visible. Success is confirmed. Errors explain what happened and what to do next. No silent failures.

## Project-Specific Principles

<!-- Add 2-3 principles specific to your product -->

## Anti-Patterns — Never Do These

- Auto-advancing carousels (users miss content, accessibility breaks)
- Full-viewport hero videos with autoplay sound
- Modal-on-load popups (destroy trust)
- Hover-only reveals (excludes touch users)
- Color-only status indicators (excludes color-blind users)
- "Click here" or "Submit" CTAs (always name the outcome)
- Placeholder text as labels (disappears on focus)
- Infinite scroll without a way to reach the footer
- Disabling the back button or browser zoom

## Decision Framework

When principles conflict, this is the priority order:

**Accessibility > Usability > Aesthetics > Novelty**

An accessible, usable feature that looks plain ships before a beautiful feature that breaks for screen readers.
