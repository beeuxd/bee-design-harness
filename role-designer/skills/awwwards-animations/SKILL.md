---
name: awwwards-animations
description: Direct premium, award-tier web motion — smooth scroll (Lenis), scroll-driven scenes (GSAP ScrollTrigger), page transitions, text reveals, parallax, custom cursors, micro-interactions — at 60fps and inside the house motion gates. Use when the user asks for Awwwards/FWA-level animation, premium scroll experiences, pinned sections, stagger reveals, magnetic effects, kinetic typography, or "make this feel expensive". React-first.
---

# Awwwards-tier motion, the harness way

This skill is the *direction* layer: what to animate, with which tool, and inside which limits.
The *implementation* API lives in the official GSAP skills (`gsap-core`, `gsap-react`,
`gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `gsap-utils`) — defer
to them for syntax. Critique of existing motion is `review-animations`; codebase-wide audits are
`improve-animations`.

## Non-negotiables (before any wow)

- **Art direction first.** No motion work without the art direction section in
  `docs/design-system.md` — motion has a personality and it's decided there, not per-tween.
  Read `design/taste-rules.md` before animating anything.
- **`prefers-reduced-motion` always.** Every effect ships a reduced variant (opacity-only or
  none). Use `gsap.matchMedia()` so it's structural, not an afterthought.
- **The performance budget outranks the effect.** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on mid-tier
  mobile. A scroll scene that busts the budget is a NO-SHIP, not a style choice.
- **Mobile first, all five widths.** Design the 360px version of every scene before the 1440px
  one. Pinned/horizontal scenes usually need a simpler mobile variant — plan it, don't clamp it.
- **Animate transforms and opacity only.** Nothing that triggers layout. Reserve space for
  everything that moves (CLS). Details in `gsap-performance`.

## Choosing the stack

| Need | Reach for |
|---|---|
| Smooth scroll feel | Lenis (`lenis` npm) + ScrollTrigger ticker wiring |
| Scroll-driven scenes, pinning, scrub, parallax | GSAP ScrollTrigger |
| Sequenced hero/entrance choreography | GSAP timelines |
| Component enter/exit tied to React state | Motion (Framer Motion) `AnimatePresence` |
| Text splitting/reveals | GSAP SplitText (see `gsap-plugins`) |
| Draggable/inertia interactions | GSAP Draggable + Inertia |

One library per concern — don't run Motion and GSAP on the same element.

## The premium patterns (with restraint rules)

- **Hero reveal** — one timeline: mask/clip reveal of the headline, staggered supporting
  elements (0.05–0.1s stagger), custom ease. Runs once; never replays on scroll-up.
- **Pinned scene** — pin a section, scrub a timeline through it. Max 1–2 per page; each pin must
  *earn* its scroll distance (rule of thumb: ≤ 150vh of scrub per idea).
- **Parallax** — depth cue, not a carnival: ±10–15% translate on background layers, less on
  mid-ground. If the user notices the mechanic, it's too much.
- **Text reveal on scroll** — split by lines (not chars, at body sizes), mask upward, once per
  element. Chars are for display-size moments only.
- **Custom cursor / magnetic elements** — desktop-only, gated behind `(pointer: fine)`, and the
  native cursor stays functional. Magnetic pull ≤ 30% of the target's size; targets stay ≥ 44×44px.
- **Page transitions** — cover-and-reveal beats crossfade. Keep total lockout under 800ms;
  the user's click must never feel swallowed.

## React discipline

`useGSAP` with a scope ref for every GSAP effect — cleanup is not optional (see `gsap-react`).
Lenis lives once at the layout level, not per page. Kill ScrollTriggers on route change.
SSR: guard everything behind mount; never measure in render.

## Verify before done

- Replay at 10% speed in DevTools' Animations panel — what feels off slow is wrong at speed.
- Performance trace while scrolling the heaviest scene: 60fps on a 4× CPU throttle.
- Toggle `prefers-reduced-motion` and walk the page: every scene has its answer.
- Sweep 360/768/1024/1440/1920 and both themes. Screenshot evidence per the house standard.
