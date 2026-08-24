# repairs-designer — role-designer (16) build log (2026-08-13)

Executed the CURATION.md "role-designer (16)" list. Sources: `/Users/bee/Downloads/Skills/Designer/`. Bodies preserved verbatim except the edits logged below. All frontmatter `name:` fields normalized to match directory names.

## Per-skill log

### extract-design-system
- Companions: none referenced.
- Patch (CURATION repair #2, "output path → design/tokens.json flow, guarded"): added step 7 — generated `design-system/tokens.json`/`tokens.css` are starter artifacts only; folding into `design/tokens.json` (protected file) requires explicit approval, then `pnpm tokens` regenerates `app/tokens.css`. Old step 7 renumbered to 8.

### wcag-accessibility
- Frontmatter: renamed `name: accessibility` → `name: wcag-accessibility` (dir match; also avoids clashing with generic names elsewhere).
- Companions recovered: `references/A11Y-PATTERNS.md` and `references/WCAG.md` fetched from the origin repo `addyosmani/web-quality-skills` (raw.githubusercontent.com, main branch). Origin SKILL.md diffs from the export only in em-dash sanitization — same revision. All 8 anchor links (`#modal-focus-trap`, `#skip-link`, `#dragging-movements`, `#form-labels`, `#error-handling`, `#aria-tabs`, `#live-regions-and-notifications`, `#screen-reader-commands`) verified against the recovered file's headings.
- Patch (required edit #1): after the Target size (2.5.8) 24px paragraph, added: house rule overrides the WCAG minimum — interactive targets are ≥44×44px on touch; 24px is a hard floor for edge cases, not a target.
- Pointer softened: removed `[Web Quality Audit](../web-quality-audit/SKILL.md)` from References (that sibling skill is not in this pack; link would 404).

### animate
- Companion recovered: `RECIPES.md` from origin `emilkowalski/skills` (skills/animate/RECIPES.md). Origin SKILL.md is byte-identical to the export — same revision confirmed.
- No patches.

### review-animations
- Companion recovered: `STANDARDS.md` from `emilkowalski/skills` (skills/review-animations/STANDARDS.md). Same revision confirmed (byte-identical SKILL.md).
- No patches. (Frontmatter `disable-model-invocation: true` preserved as shipped.)

### improve-animations
- Companions recovered: `AUDIT.md` and `PLAN-TEMPLATE.md` from `emilkowalski/skills` (skills/improve-animations/). Same revision confirmed.
- Note: `plans/README.md` mentions are output files the skill creates, not companions — left as-is.

### find-animation-opportunities
- No companion references; no patches. (Origin: emilkowalski/skills suite.)

### apple-design
- No companion references; no patches. Reduced-motion guidance already present.

### animation-vocabulary
- No companion references; no patches.

### text-to-lottie
- No missing companions: the skill scaffolds its own player via `npx degit diffusionstudio/lottie` — self-contained.
- Patch (non-negotiables, reduced-motion): added one line under Best practices — when the Lottie ships inside product UI, gate autoplay behind `prefers-reduced-motion` and show a static frame for opted-out users.

### design-taste-frontend
- Merge (required edit #2), from `Polish & Prototype/Redesign Existing Projects Skill.md`:
  - **Design Audit** checklist (8 categories: Typography, Color and Surfaces, Layout, Interactivity and States, Content, Component Patterns, Iconography, Code Quality) integrated into §11.B "Audit Before Touching" (its redesign/audit mode), introduced as the diagnostic checklist run after the current-state documentation. Bullet style adapted to the file's `*` convention; content otherwise verbatim; no attribution.
  - **Strategic Omissions (What AI Typically Forgets)** added as new §9.H under "9. AI TELLS" (build guidance), with a one-line integration lead-in.
  - Checked for conflicts before merging: the checklist's picsum.photos guidance matches the skill's own §4.8 image policy; no em-dashes introduced (the skill bans them); no light/dark contradictions.
- Patch: §12.A block-library path `skills/taste-skill/blocks/` → `skills/design-taste-frontend/blocks/` (the skill's directory was renamed on import; old path would never exist).
- The other `.md` mentions in §12 (`asymmetric-split.md` etc.) describe output files the Block Library will create iteratively — contract, not missing companions. Left as-is.

### imagegen-frontend-web
- No companion references.
- Patch (non-negotiables, dark-first): Theme Paradigm "Choose 1" now notes — when the brief/art direction doesn't decide it, default to Deep Dark Mode (house-primary theme).

### imagegen-frontend-mobile
- No companion references.
- Patch (non-negotiables, dark-first): same one-line default-to-deep-dark note on its Theme Paradigm chooser.

### design-handoff
- Pointer softened: `see [CONNECTORS.md](../../CONNECTORS.md)` (file not in export, would 404) replaced with an inline one-line explanation of the `~~design tool` / `~~project tracker` placeholder convention and the fallback when nothing is connected.
- No other changes.

### design-critique
- Clean: no companion references, no conflicts, no patches.

### docx
- Companions recovered: full `scripts/` tree (`accept_changes.py`, `comment.py`, `office/unpack.py`, `office/pack.py`, `office/validate.py`, `office/soffice.py`, plus `templates/`, `office/validators/`, `office/helpers/`, `office/schemas/`, `__init__.py`) and `LICENSE.txt`, copied from the local Anthropic skills copy at `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/97987c96-…/a4735e8c-…/skills/docx/`. That copy's SKILL.md matches the export except two punctuation-sanitization characters — the revision whose scripts the export body actually references (`unpack.py`/`pack.py` exist only in this revision). Every `scripts/…` path referenced in SKILL.md verified to exist.
- Export SKILL.md kept verbatim (frontmatter `name: docx` already correct).

### pdf
- Companions recovered: `REFERENCE.md`, `FORMS.md`, full `scripts/` (7 form/image helpers), `LICENSE.txt` from the same local Anthropic skills copy. Local SKILL.md is byte-identical to the export — exact revision. All referenced script paths verified.
- No patches.

## Verification (all passed)

- **16** skill directories under `role-designer/skills/`, each with a `SKILL.md`.
- Frontmatter `name:` equals directory name for all 16; no duplicates; every skill has a `description:` (originals kept).
- Zero dangling references: grepped all `.md` files for `references/`, `workflows/`, markdown `.md` links, bare "see X.md" mentions, and `scripts/*` paths — every target exists on disk (`RECIPES.md`, `STANDARDS.md`, `AUDIT.md`, `PLAN-TEMPLATE.md`, `references/A11Y-PATTERNS.md`, `references/WCAG.md`, `REFERENCE.md`, `FORMS.md`, all docx/pdf scripts). Remaining relative mentions (`plans/README.md`, block-library filenames) are files the skills generate as output.
- Anchor-level check: all 8 `A11Y-PATTERNS.md#…` fragments resolve to headings in the recovered file.
- Non-negotiables sweep: no WCAG 2.0/2.1 leftovers; animation suite already reduced-motion-aware; `outline: none` occurrences in wcag-accessibility are the documented anti-pattern example plus the standard `:focus-visible` pattern (keyboard focus stays visible) — not violations; dark-first and 44px patches applied as logged above.
- No git commands run.

## 2026-08-24 — license compliance (see logs/license-audit-2026-08.md)

- **Removed `pdf` + `docx`** — Anthropic proprietary document skills; LICENSE.txt prohibits
  redistribution and derivative works. Capability is bundled with Claude products anyway.
  README skill list updated; role-designer → 1.1.0.
- Emil Kowalski's six (animate, review-animations, improve-animations,
  find-animation-opportunities, animation-vocabulary, apple-design) attributed in frontmatter
  (source: emilkowalski/skills, MIT).

## 2026-08-24 (later) — trace pass results
- Attributed: design-handoff (anthropics/knowledge-work-plugins, Apache-2.0), design-taste-frontend +
  imagegen-frontend-web/mobile (Leonxlnx/taste-skill, MIT), text-to-lottie (diffusionstudio/lottie, MIT),
  extract-design-system (arvindrk, MIT). role-designer → 1.1.1.
- Flagged for rewrite/cut: awwwards-animations (upstream unlicensed), design-critique + wcag-accessibility
  (untraced). See logs/license-audit-2026-08.md disposition list.

## 2026-08-24 (final) — disposition executed
- Rewritten in-house from scratch: awwwards-animations (now a direction layer over the official
  gsap-* seven + Lenis, motion gates baked in; 15 unlicensed reference files removed),
  design-critique (standards-grounded, three-pass), wcag-accessibility (WCAG 2.2 AA house
  baseline; bogus MIT/web-quality-skills attribution dropped). role-designer → 1.2.0 (15 skills).
