---
name: ux-writing
description: Write microcopy for interfaces — buttons, errors, empty states, confirmations, labels, tooltips, loading and success moments. Use when the user needs interface copy written or improved, mentions "microcopy", "button label", "error message", "empty state copy", or when a build has placeholder text that needs real words.
---

# UX writing

Interface copy is navigation, not decoration: every string either moves the user forward or
stalls them. The words are part of the design system and follow the same discipline as tokens.

## The law

`docs/content-guidelines.md` (written by `voice-guide`) is the voice standard — tone by moment,
terminology, mechanics, banned list. **If it doesn't exist, run `voice-guide` before writing
user-facing copy**; microcopy written without a voice standard is the copy equivalent of
hardcoded hex. Finished copy gets reviewed by `ux-copy-review` against that same standard.

## Principles

- **Front-load the point.** First two words carry the meaning — users scan, screen-reader users
  hear them first, and truncation eats the rest.
- **Verbs over nouns for actions**; the user's words over the org chart's (what the team calls
  "provisioning" the user calls "setting up").
- **One idea per string.** If a sentence needs "and", it's usually two UI moments.
- **Consistency beats variety.** One name per concept everywhere — synonyms in navigation are
  bugs, not style.
- **Write for translation and layout**: expect +30–40% length in other locales, no idioms, no
  words doing double duty. Copy that only fits at 1440px doesn't fit — check it at 360px.

## Patterns

- **Buttons**: verb + object ("Save changes", not "Submit"/"OK"). The button alone, out of
  context, should say what happens next. Destructive confirms repeat the object ("Delete
  3 files"), never "Are you sure?" with Yes/No.
- **Errors**: what happened → why (if known) → what to do next, in the user's language. Never
  blame ("invalid input"), never bare codes, never dead ends — every error names an exit. Keep
  the user's data in the retelling ("couldn't save *pricing-v2*").
- **Empty states**: never actually empty — say what will live here and give the first action.
  First-run empties sell the value; cleared-inbox empties can celebrate; error empties explain.
- **Forms**: labels always visible (placeholders are not labels — they vanish and screen readers
  lose them), helper text before the mistake, error text at the field and specific.
- **Loading & progress**: name what's happening ("Importing 240 rows…") when it's slow;
  say nothing when it's fast. Never lie with fake progress.
- **Success**: confirm the outcome, not the click ("Invite sent to Ana"), and offer the natural
  next step.
- **Tooltips**: last resort — supplementary, never the only place an interaction is explained,
  and never holding content keyboard users can't reach.

## Accessibility is copy's job too

Icon-only buttons get accessible names; link text works out of context ("View pricing", never
"click here"); alt text describes purpose, not pixels; announcements for async results go through
live regions with the same voice rules as visible text.
