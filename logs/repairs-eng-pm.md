# Repairs log — role-engineer + role-pm packs (2026-08-13)

Companion to `CURATION.md`. Every recovery, softening, merge, and adaptation made while packaging
the **role-engineer (13)** and **role-pm (12)** skill packs. Bodies preserved verbatim except where
noted below. No git commands were run.

Sources:
- Downloads exports: `/Users/bee/Downloads/Skills/Engineer/`, `/Users/bee/Downloads/Skills/PM/`
- Locally installed full versions: `/Users/bee/.claude/skills/`
- Origin repos (recovered via web): `github.com/jakubkrehel/skills` (better-* family),
  `github.com/mattpocock/skills` (prototype/triage companions), `github.com/firecrawl/cli`
  (firecrawl rules + sub-skills), `github.com/wshobson/agents` (tailwind-design-system references)

---

## role-engineer (13)

### tailwind-design-system
- Source: `Build design systems/Tailwind Design System Skill.md` → `SKILL.md`, verbatim.
- **Recovered**: `references/advanced-patterns.md` and `references/details.md` from origin repo
  `wshobson/agents` (`plugins/frontend-mobile-development/skills/tailwind-design-system/`). The
  export referenced `references/advanced-patterns.md` twice; both pointers now resolve.
  `details.md` was fetched as a bonus (part of the same reference set).
- **Fixed**: `references/details.md` internally linked `references/advanced-patterns.md`
  (wrong relative path from inside `references/`) → corrected to `advanced-patterns.md` (2×).

### vercel-composition-patterns / vercel-react-best-practices / vercel-react-view-transitions / web-design-guidelines
- Downloads copies were bare indexes; copied the **full installed skill directories** from
  `/Users/bee/.claude/skills/<name>/` instead (rule bodies, references, AGENTS.md, metadata).
  Note: the installed entries are symlinks into `~/.agents/skills`; copied with `cp -RL` to
  dereference (a first pass copied broken symlinks; replaced with real files, verified with
  `diff -rq` = identical).
- **Fixed** (vercel-react-best-practices): upstream `AGENTS.md` linked `./async-defer-await.md`,
  `./async-cheap-condition-before-await.md`, `./server-hoist-static-io.md` — those files live in
  `rules/`; corrected to `./rules/<file>.md` (3 links). SKILL.md itself was already correct.

### better-ui
- Source: `Ship polished UI/Better UI Skill.md` → `SKILL.md`.
- **Merged** three sections from `Ship polished UI/Design Engineering Skill.md`
  (frontmatter name `emil-design-eng`), inserted before "## Review Output Format":
  - `## Component Building Principles`
  - `## The Sonner Principles (Building Loved Components)`
  - `## Debugging Animations`
- **Dropped** that file's "Initial Response" instruction (reply-only-with-course-ad for
  animations.dev) — it's an ad; not carried over. The rest of Design Engineering was not merged
  (only the three sections named in CURATION.md).
- **Recovered** companion docs from origin `jakubkrehel/skills`: `surfaces.md`, `animations.md`,
  `icons.md`, `performance.md` (referenced by the Quick Reference table) plus `enter-exit.md` and
  `icon-transitions.md` (referenced from within `animations.md`/`icons.md`).
- **Softened**: "When `better-interface` orchestrates the review" → generic "a broader review
  skill (e.g. an orchestrating interface review) coordinates this review". `better-interface`
  is not shipped in any pack (cut in curation).

### better-accessibility
- Source: `Ship polished UI/Better Accessibility Skill.md`, verbatim body.
- **Recovered** all 6 companions from origin: `focus-and-keyboard.md`, `semantics-and-aria.md`,
  `forms.md`, `screen-readers.md`, `hit-areas.md`, `motion-and-zoom.md`.
- **Softened**: same `better-interface` orchestrator sentence as above.
- Cross-references to `better-colors`, `better-typography`, `better-layout` kept — all ship in
  this pack. (Note: CURATION's "24px→44px patch" applies to the Designer pack's
  wcag-accessibility, not here; this skill's hit-area principle already states WCAG's 24px
  baseline *and* recommends 44px for touch, consistent with the house rule.)

### better-colors
- Source: `Ship polished UI/Better Colors Skill.md`, verbatim body.
- **Recovered** all 5 companions: `color-conversion.md`, `palette-generation.md`,
  `accessibility-contrast.md`, `gamut-and-tailwind.md`, `color-usage.md`.
- **Softened**: `better-interface` orchestrator sentence.

### better-layout
- Source: `Ship polished UI/Better Layout UX Design Skill.md`, verbatim body.
- **Recovered** both companions: `grouping-and-alignment.md`, `spacing-and-adaptivity.md`.
- **Softened**: `better-interface` orchestrator sentence.

### better-typography
- Source: `Ship polished UI/Better Typography Skill.md`, verbatim body.
- **Recovered** all 6 companions: `choosing-fonts.md`, `variable-fonts-and-opentype.md`,
  `spacing-and-sizing.md`, `wrapping-and-punctuation.md`, `details-and-accessibility.md`,
  `css-cheat-sheet.md`.
- **Softened**: `better-interface` orchestrator sentence; and the pointer to the unshipped
  `better-writing` skill ("The words themselves … are covered by the `better-writing` skill")
  → "are out of scope for this skill (UX copy has its own review path)".

> better-* recovery summary: all ~23 referenced companion docs recovered from the origin repo
> (github.com/jakubkrehel/skills, found via web search) + 2 transitively-referenced extras
> (enter-exit.md, icon-transitions.md) = 25 files. Nothing had to be inlined; zero 404s remain.
> The repo's separate `review-output.md` files were not taken — the exports already inline the
> review-output format in each SKILL.md.

### agent-browser
- Source: `Ship & deploy/Agent Browser Skill.md`, verbatim body.
- **Adapted**: removed `hidden: true` from frontmatter — it would make the skill undiscoverable
  as a plugin skill, defeating the pack. `allowed-tools` kept. The skill is a self-updating CLI
  stub by design (content loads via `agent-browser skills get core`); no file pointers to recover.

### deploy-to-vercel
- Copied the **full installed version** from `/Users/bee/.claude/skills/deploy-to-vercel/`
  (SKILL.md + `resources/deploy.sh`, `resources/deploy-codex.sh`), per CURATION. Verbatim.

### review-loop
- Source: `Ship & deploy/Review Loop Engineering Agent Skill.md` → `SKILL.md`, verbatim.
  Self-contained; no repairs needed.

---

## role-pm (12)

### customer-journey-map
- Source: `Discover & validate/Customer Journey Map Skill.md`, verbatim. External links only
  (productcompass.pm); no repairs.

### firecrawl
- Source: `Discover & validate/Firecrawl Marketing Agent Skill.md`, verbatim body.
- **Recovered** from origin `github.com/firecrawl/cli` (`skills/firecrawl-cli/`):
  `rules/install.md`, `rules/security.md`.
- **Recovered** the 9 referenced sibling sub-skills (`firecrawl-search/-scrape/-map/-crawl/
  -agent/-interact/-download/-parse/-monitor`) into `references/firecrawl-<name>.md` — kept
  inside this one skill dir so the pack stays at 12 skills.
- **Adapted links**: `../firecrawl-X/SKILL.md` → `references/firecrawl-X.md` in SKILL.md (10
  links); inside the recovered files, `../firecrawl-cli/SKILL.md` → `../SKILL.md` and sibling
  refs → same-dir `firecrawl-X.md`. Zero dangling pointers remain.
- Mentions of the `firecrawl-build` / `firecrawl-workflows` skill families kept as-is: they are
  explicitly described as "installed alongside this CLI skill when you run `firecrawl init`",
  which remains true.

### grilling
- Source: `Discover & validate/Grilling Product Agent Skill.md`, verbatim body.
- **Merged** the one rule from `Discover & validate/Grill Me Career Agent Skill.md`:
  "If a question can be answered by exploring the codebase, explore the codebase instead of
  asking." — added to the facts-finding paragraph. Nothing else from grill-me carried over.

### opportunity-solution-tree
- Source: `Discover & validate/Opportunity Solution Tree Skill.md`, verbatim. No repairs.

### usability-testing
- Source: `Discover & validate/Usability Testing Product Agent Skill.md`.
- **Repaired structure**: the export had flattened the companion `references/guest-insights.md`
  into the bottom of the SKILL.md (after a `---` / "# Guest Insights" seam) while the body still
  pointed at `references/guest-insights.md`. Split it back out: SKILL.md now ends at "Related
  Skills"; the 11-guest/14-insight content lives at `references/guest-insights.md`. Pointer
  resolves; body text otherwise verbatim.
- "Related Skills" plain-text list (Customer Research, Writing PRDs, …) left as-is — names, not
  pointers; nothing to 404.

### user-research
- Source: `Discover & validate/User Research Product Agent Skill.md`, verbatim. No repairs.

### doc-co-authoring
- Source: `Spec & prioritize/Doc Co-Authoring Skill.md`, verbatim body.
- **Adapted**: frontmatter `name: doc-coauthoring` → `name: doc-co-authoring` to match the
  curated dir name (frontmatter must equal dir name).

### prototype
- Source: `Spec & prioritize/Product Agent Skill Prototype.md`, verbatim body.
- **Recovered** both missing companions from origin `mattpocock/skills`
  (`skills/engineering/prototype/`): `LOGIC.md`, `UI.md`. Checked clean of matt-pocock
  ecosystem references. Both branch pointers now resolve.

### to-prd
- Source: `Spec & prioritize/Product Agent Skill.md` (frontmatter name `to-prd`).
- **Stripped matt-pocock ecosystem dependency**:
  - Removed "The issue tracker and triage label vocabulary should have been provided to you.
    Run `/setup-matt-pocock-skills` if not." → replaced with the docs/prd.md + REQ-ID contract.
  - "publish it to the project issue tracker. Apply the `ready-for-agent` triage label" →
    "append it to `docs/prd.md` … assign each user story a permanent REQ-ID continuing the
    file's existing sequence."
  - Description retargeted to docs/prd.md accordingly.
- **Retargeted output**: user-story template now `- **REQ-NNN**: As an <actor>…`, with an
  explicit rule to continue the existing REQ-ID sequence and never renumber/reuse IDs (matches
  the house `kickoff` convention).
- **Kept intact**: the seam-sketching method, PRD template sections, prototype-snippet exception.

### to-issues
- Source: `Spec & prioritize/To Issues Product Agent Skill.md`.
- **Stripped matt-pocock dependency**: removed the `/setup-matt-pocock-skills` line → "The issue
  tracker is **GitHub Issues** (use the `gh` CLI), with the **GitHub Projects** board as the
  kanban view… (see `/setup-kanban` if the board and labels don't exist yet)" — aligned with the
  house ticket workflow.
- **Retargeted publishing**: "publish to the issue tracker … correct triage label" → `gh issue
  create`, add to the GitHub Projects board, apply repo labels (e.g. `ready-for-agent`);
  "(mechanics in the issue-tracker doc)" → GitHub sub-issues / issue relationships, with the
  `## Parent` / `## Blocked by` body sections kept as fallback.
- **Softened** ecosystem-specific "domain glossary vocabulary … ADRs" phrasing to generic
  project-vocabulary/architecture-decision language (the glossary/ADR docs are matt-pocock
  ecosystem artifacts).
- Template's "User stories covered" now cites REQ-IDs from `docs/prd.md`.
- **Kept intact**: tracer-bullet vertical-slice method, prefactoring step, quiz-the-user loop,
  dependency-order publishing, issue template, `disable-model-invocation: true`.

### triage
- Source: `Spec & prioritize/Triage Product Agent Skill.md`.
- **Recovered** both missing companions from origin `mattpocock/skills`
  (`skills/engineering/triage/`): `AGENT-BRIEF.md`, `OUT-OF-SCOPE.md`. Checked clean of
  ecosystem references. (Their illustrative example filenames like `dark-mode.md` inside
  `.out-of-scope/` are workspace examples, not skill files.)
- **Stripped matt-pocock dependency**:
  - "The mapping should have been provided to you - run `/setup-matt-pocock-skills` if not." →
    canonical role names applied as **GitHub labels**, mapping to existing repo labels, pointer
    to house `/setup-kanban`.
  - "(see the issue-tracker config)" / "per the tracker config" → GitHub/`gh` phrasing;
    "the tracker config defines who counts as external" → "external = not a repo collaborator".
  - "Query the issue tracker" → "`gh issue list` / `gh pr list`".
  - "run the `/grilling` and `/domain-modeling` skills together … updating `CONTEXT.md`/ADRs" →
    "`/grilling` … updating the project docs" (`/domain-modeling`, `CONTEXT.md` are unshipped
    ecosystem pieces; `/grilling` ships in this pack).
- **Kept intact**: the full state machine (2 category roles × 5 state roles, transitions), the
  AI-disclaimer rule, verification/grilling steps, wontfix taxonomy incl. `.out-of-scope/` KB,
  needs-info template, `disable-model-invocation: true`.

### wayfinder
- Source: `Spec & prioritize/Wayfinder Product Agent Skill.md`, body otherwise verbatim.
- **Softened** (unshipped-ecosystem pointers; CURATION strips were only mandated for
  to-prd/to-issues/triage, but these would dangle):
  - Three `/domain-modeling` mentions removed (kept `/grilling`, which ships here).
  - "If that doc is absent, default to the local-markdown tracker" (an unshipped matt-pocock
    fallback) → default to GitHub Issues via `gh`: child tickets as sub-issues, blocking via
    GitHub issue relationships, frontier = open/unblocked/unassigned children. The
    `docs/agents/issue-tracker.md` consult is kept as an optional per-repo override with this
    graceful default.
- `/prototype` reference kept — ships in this pack.

---

## Verification (all passing)

- **Counts**: role-engineer/skills = 13 dirs; role-pm/skills = 12 dirs.
- **Frontmatter**: every `SKILL.md` frontmatter `name` == its directory name.
- **Uniqueness**: all 25 names unique across both packs; zero collisions with harness-core
  skill names (checked against the 20 listed core names *and* the actual
  `harness-core/skills/` directory listing).
- **Pointers**: zero dangling relative `.md` links across both packs (scripted check over every
  markdown link in every file). Remaining relative-looking mentions are intentional workspace
  paths the skills operate on (`docs/prd.md`, `docs/agents/issue-tracker.md` with a built-in
  default, `.out-of-scope/*.md` examples, `NOTES.md`-next-to-prototype convention,
  `decision-doc.md`/`technical-spec.md` example filenames) — not skill-file references.
- **Copied dirs**: `diff -rq` against `/Users/bee/.claude/skills/` = identical for the five
  installed-version copies (modulo the 3 AGENTS.md link fixes noted above).
- **Ad check**: `animations.dev` / "Initial Response" ad text absent from better-ui.

## 2026-08-24 — license compliance (see logs/license-audit-2026-08.md)

- **`firecrawl` (role-pm) replaced** with an original pointer skill (same name, routing intact):
  the upstream skill + references/rules were AGPL-3.0 (firecrawl/cli). The pointer installs the
  official firecrawl-claude-plugin or CLI and adds house rules (one scraping stack; quotes keep
  source URLs). role-pm → 1.1.0.
- Attribution frontmatter added: mattpocock/skills (grilling, wayfinder, triage, to-prd,
  to-issues), anthropics/skills (doc-co-authoring, Apache-2.0), greensock/gsap-skills (×7),
  vercel-labs/agent-skills (×4), jakubkrehel/skills (better-* ×5), stripe/ai
  (stripe-best-practices). role-engineer → 1.0.1.
- Repo-level: root LICENSE (MIT, own work) + THIRD-PARTY-NOTICES.md + README License section.
  role-marketer/copywriter/founder → 1.0.1 (Corey Haines + Anthropic attributions).

## 2026-08-24 (later) — trace pass results
- Attributed: agent-browser (vercel-labs/agent-browser, Apache-2.0), deploy-to-vercel (vercel-labs/agent-skills),
  tailwind-design-system (wshobson/agents), prototype (mattpocock/skills), user-research
  (anthropics/knowledge-work-plugins), customer-journey-map + opportunity-solution-tree (phuryn/pm-skills).
  role-engineer → 1.0.2, role-pm → 1.1.1.
- Flagged for rewrite/cut: review-loop (upstream unlicensed), usability-testing (untraced Lenny-template variant).
