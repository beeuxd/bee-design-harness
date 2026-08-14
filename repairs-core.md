# repairs-core.md — dangling-reference fixes, 2026-08-13

Log of every reference repair made while restoring the 9-skill quality-gate suite from
`/Users/bee/Bee Design Persona/.claude/skills-legacy-2026-08-13.tar.gz` into `harness-core/skills/`.

Live skill set after this build: harness-core ships [insight-loop, problem-loop, ideation-loop,
wireframe-loop, hifi-gate, design-tokens-sync, from-figma, art-direction, taste-retro,
storybook-component, scaffold-project] + the restored gate suite [ship, verify-before-done,
visual-qa, a11y-audit, performance-check, e2e-test, design-system-audit, review-ux,
parallel-review]. Role packs are optional: role-copywriter ships `ux-copy-review`;
role-engineer ships deploy/browser/review-loop skills; role-designer ships animate/review-animations.

## Restored gate skills

### ship/SKILL.md
- `ux-copy-review` (Step 1 lens list) → made conditional: if the role-copywriter plugin is installed, add its `ux-copy-review` lens; otherwise flag copy review as a human follow-up in the report.
- `design-flow` (Step 3.3, reference citations) → "the `from-figma` output or the feature's design spec".
- Stale path `.claude/skills/parallel-review/SKILL.md` (Step 1) → plain "the `parallel-review` skill" (skills now ship via the plugin, not `.claude/skills/`).

### verify-before-done/SKILL.md
- `escalation-protocol` (Step 1, JS budget breach) → "STOP, report what you found, and ask the user how to proceed".
- `safe-refactor` (Step 3, consumer list) → "any consumer list a prior refactor already produced".
- `session-start` (Step 3, port-3000 note) → "common when one was left running earlier in the session".
- `session-start` Step 6 (Step 3, server restart note) → generic "restart it" (no skill pointer).
- `escalation-protocol` (Hard rules) → "STOP and report to the user with the failing output attached".

### visual-qa/SKILL.md
- `responsive-implementation` (scope note) → "the project's responsive test matrix (run it as part of `e2e-test` or the ship gate)".
- `escalation-protocol` (Step 4.4, 3-iteration cap) → "Report honestly: ..." (same content, no skill pointer).
- `escalation-protocol` (STOP conditions) → "stop, report findings honestly, and hand the remainder to the user".

### a11y-audit/SKILL.md
- `motion` skill (Step 1c, opacity-0 failure) → inlined the fix ("gate the animation behind a `prefers-reduced-motion` check") and pointed to role-designer's animate/review-animations skills.

### e2e-test/SKILL.md
- `debugging-protocol` (flake policy) → "debug it to root cause before moving on" with the same hint list.
- `escalation-protocol` (flake policy, no-skip rule) → dropped the pointer; the rule itself stays ("Never delete, `.skip`, or `.fixme` ... STOP and report").
- `debugging-protocol` (Step 5 report template) → "root-cause debugging follow-up".

### design-system-audit/SKILL.md
- `checkpoint-recovery` (Step 6.1) → "create a checkpoint commit on the feature branch ... so any batch can be reverted cleanly".
- `safe-refactor` (Step 6.2) → inlined the discipline: list consumers first, change, verify every consumer renders.
- `responsive-implementation` (Step 6.3) → "Playwright screenshots per viewport" (visual-qa pointer kept — it is live).

### review-ux/SKILL.md
- No dangling references found (the `motion/` grep pattern on line 88 targets the Motion library import path, not the retired skill). No changes.

### performance-check/SKILL.md
- No dangling references found. No changes.

### parallel-review/SKILL.md
- `ux-copy-review` (lens table) → annotated: requires the role-copywriter plugin; if not installed, drop the lens and flag copy review as a human follow-up.
- `checkpoint-recovery` Part 3A (Step 3, stray-edit recovery) → inlined the recovery commands (`git diff`, `git checkout --`, `git clean -fd`).
- Stale path `.claude/skills/{SKILL_NAME}/SKILL.md` (agent prompt template) → "Follow the {SKILL_NAME} skill step by step".

## Existing core skills (swept per the verification requirement)

### storybook-component/SKILL.md
- `bootstrap-app` (description + Step 0.2) → self-contained install: `pnpm dlx storybook@latest init --yes && pnpm add -D @storybook/addon-mcp`, register the addon in `.storybook/main.ts`, import `../app/globals.css` in `.storybook/preview.ts`, dark default.
- `new-site-component` / `add-shadcn-component` (description, reuse check, handoffs) → generic "before any new component is built" / "whichever build path produced it".
- `design-flow` / `prd-to-ui` (handoffs, states matrix owner) → "the feature's design spec owns states (wireframe-loop/hifi-gate output)".

### art-direction/SKILL.md
- Builder lists (description + hard gate) naming `bootstrap-app`, `new-site-component`, `design-flow`, `prd-to-ui`, `design-options`, `motion` → live set: `from-figma`, `hifi-gate`, `storybook-component`, plus "any scratch-route variant exploration or animation work".
- `bootstrap-app` (Step 0, missing docs) → `scaffold-project` (its live equivalent — it creates the doc set).
- `motion` skill (interview Q6 + Step 3 template) → "animation work (role-designer's animate/review-animations skills)".
- `design-references` skill (description, Step 5 handoff, STOP conditions) → the capability described directly: capture references into `design/references/` with screenshots + `notes.md`, indexed in its README.
- Stale path `.claude/skills/taste-retro/SKILL.md` (Step 4.2) → plain "`taste-retro` Step 1".
- (Also merged per instruction: interview question 8 "Register split" and a `### Registers` template section; "seven questions" → "eight".)

### hifi-gate/SKILL.md
- `/design-options` (handoffs) → "run a scratch-route variant exploration (3 distinct variants, screenshotted; the user picks)".

### wireframe-loop/SKILL.md
- `design-flow` (description) → "a written spec with component/token mapping lives in docs/specs/".
- `design-flow` (Step 0.1 spec source) → "a committed design spec".
- `/design-flow` (handoffs) → "write the full design spec (structure + tokens + states) to `docs/specs/<feature-slug>.md`".

### taste-retro/SKILL.md
- `design-options` (description + trigger 2) → "variant-exploration round" / "scratch-route variant exploration".
- `design-references` (description) → "external inspiration is filed under design/references/".
- Load-rule skill list naming `new-site-component`, `design-flow`, `prd-to-ui`, `design-options`, `motion` and the old project agents → live set (`from-figma`, `hifi-gate`, `wireframe-loop`, `storybook-component`, the gate skills) plus "any scratch-route variant exploration or animation work, and the designer / engineer / qa agents".

### problem-loop/SKILL.md
- `challenge` (description) → "Stress-testing a full PRD is the researcher agent's job".
- `` `challenge` ``-style (Step 2) → "devil's-advocate style".
- `/challenge` (handoffs) → "suggest having the researcher agent re-stress-test the PRD".

### insight-loop/SKILL.md
- `kickoff` (description) → "PM discovery — role-pm".

### ideation-loop/SKILL.md
- `kickoff` (description) → "PM spec work — role-pm".
- `/kickoff` (handoffs) → "PRD REQ writing (role-pm's discovery/spec skills)".

### design-tokens-sync/SKILL.md
- `responsive-implementation` (Step, visual verification) → "Playwright screenshots per viewport".

### from-figma/SKILL.md
- `design-references` (description) → "filed under design/references/ with notes, not built here".
- `add-shadcn-component` (Step 3, option c) → inlined the rule: "install the primitive and restyle visuals only — never behavior".

## Scaffold templates (ship inside scaffold-project, also swept)

### scaffold-project/templates/CLAUDE.md
- "REBUILD IN PROGRESS" note (which pre-flagged these dangling refs) → updated: rebuild landed, 19 skills ship via harness-core, role packs optional. Added the 9-row quality-gates table to the skill library.
- `/setup-kanban` / `/write-tickets` (ticket workflow) → generic: GitHub Projects board + Issues via `gh`, "or a role pack's ticket skills if installed".
- `session-start` / `escalation-protocol` (How I want Claude Code to work) → "Re-read this file and the current scope ... Stuck after 2 attempts? Stop, report findings, ask."
- `handoff-summary` skill (new-chat protocol) → described the block itself (scope, decisions, files touched, next steps).
- `kickoff` (typical-flow step 0) → "PM discovery will note the evidence-first path".

### scaffold-project/templates/DESIGN.md
- Pipeline diagram `──kickoff/challenge──▶ ... ──flow-map/design-flow──▶` → `──PM discovery + researcher stress-test──▶ PRD ──flow mapping / design specs──▶`.

### scaffold-project/templates/docs/tech.md
- `bootstrap-app` (Storybook row) → "set up via the `storybook-component` skill".

### scaffold-project/templates/docs/ideation/feature-tree.md
- `/kickoff` (Feeds line) → "PRD REQ prioritization (... role-pm's spec skills)".

### scaffold-project/templates/design/components.md
- `add-shadcn-component` (shadcn intro) → inlined the rule: restyle visuals to tokens, behavior stays the primitive's.

### scaffold-project/templates/design/references/README.md
- `design-references` skill (intro) → "To file a reference: give Claude a URL ..." (same mechanics, no skill pointer).

## Plugin metadata

- `harness-core/.claude-plugin/plugin.json` — description now lists the 9-skill quality-gate suite.
- `README.md` — harness-core row updated to "19 skills — 5 evidence loops + dependencies + 9-skill quality-gate suite (+ scaffold)"; Status: harness-core complete with gates; role packs built.

## Deliberately left in place (not dangling)

- `ux-copy-review` mentions in ship and parallel-review — kept as explicit conditionals on the role-copywriter plugin (it ships that skill).
- `design/references/` and `design/taste-rules.md` — file/directory paths, not skill names; still the source of truth.
- `.claude/skills-legacy-2026-08-13.tar.gz` in templates/CLAUDE.md — the archive path itself, historical context.
- Generic uses of "challenge(s)" as a plain verb/noun (e.g. "researcher challenges the PRD", "challenge round" ledger columns) — not references to the retired `challenge` skill.
- review-ux line 88's `motion/` — a grep pattern for the Motion animation library import path, not the retired `motion` skill.

## Could not fully resolve

- **role-designer's animate/review-animations skills** are referenced by name (a11y-audit, art-direction) per the build spec, but the role-designer pack's `skills/` directory is empty on disk at repair time — the names could not be verified against shipped SKILL.md files. If the pack ships different names, update those two pointers.
- **role-pm's discovery/spec skill names** are unknown, so kickoff-replacement references say "PM discovery / role-pm's discovery/spec skills" generically rather than naming a skill.
- **T.R.U.S.T. checklist** (`docs/trust-scaffolding.md`) is referenced by ship and templates/CLAUDE.md and exists in the scaffold templates — verified present, nothing to fix; noted here because it originated in the legacy batch.

## Addendum (2026-08-14): handoff-summary restored

Restored `handoff-summary` from the legacy archive into `harness-core/skills/` and the workshop's
`.claude/skills/` — CLAUDE.md's "Context & new-chat protocol" section depended on it but no live
copy existed anywhere. Repairs made during restoration:

- `session-start` (description + Section 6 resume protocol) → inlined the CLAUDE.md new-chat
  protocol (acknowledge in one line, re-read CLAUDE.md + scope docs, one clarifying question,
  never echo the handoff back). Re-point at `session-start` if/when it is restored.
- `checkpoint-recovery` (Section 2, risky working tree) → inlined a checkpoint-commit command.
- Added Section 1 token-threshold table (200k window; offer handoff at 60–70% used, urgent >80%,
  never rely on ~95% auto-compact) — new capability, not in the legacy version.
- Added durable-save requirement: handoff block is also written to `docs/handoffs/HANDOFF-YYYY-MM-DD.md`.
- `taste-retro` added to the doc-sync table (visual corrections row) — it is live in core.

Still dangling from CLAUDE.md with no live skill (all present in the legacy archive, restorable
the same way): `session-start`, `escalation-protocol`, `setup-kanban`, `write-tickets`.

Proposed but NOT applied (needs user approval — settings.json is guarded): a SessionStart
hook with matcher "compact" that injects a reminder to run handoff-summary whenever
compaction fires. Snippet lives in the workshop conversation of 2026-08-14.

## Addendum (2026-08-14, later same day): session-start + escalation-protocol restored

Restored both from the legacy archive into `harness-core/skills/` and the workshop's
`.claude/skills/`, closing the two remaining load-bearing CLAUDE.md references
("Run session-start at the top of every session" / "When stuck, escalation-protocol").
The earlier inlined repairs in the gate suite (verify-before-done, visual-qa, e2e-test,
parallel-review) that replaced escalation-protocol pointers with "STOP and report" text
remain valid — the inlined text matches the restored skill's Step 3 behavior, so no
re-pointing is required.

Repairs made during restoration:

- session-start description: "is kickoff" → "belongs to the pm agent per CLAUDE.md's
  feature flow" (`kickoff` remains retired).
- escalation-protocol Step 4: "the test matrix in `responsive-implementation`" → "run the
  project's responsive matrix via `e2e-test` or the ship gate" (`responsive-implementation`
  remains retired).
- All other cross-references verified live: handoff-summary (restored earlier today),
  visual-qa (harness-core), and the mutual session-start ↔ escalation-protocol ↔
  handoff-summary pointers now form a closed triangle with no dangling edges.

Still dangling from CLAUDE.md (legacy archive has both, restore on demand):
`setup-kanban`, `write-tickets`.

## Addendum (2026-08-14, evening): diagram-audit closeout — user-approved batch

Four decisions approved by the user and executed:

1. **Workshop synced to current template (design-context files only, no git/CI).** Copied into
   the persona workshop: AGENTS.md, docs/content-guidelines.md, design/recipes.md,
   design/templates.md, docs/specs/. Inserted the template DESIGN.md's three newer sections
   (Recipes and templates / Executor context files / Sandbox environment) into the workshop
   DESIGN.md between "Sources of truth" and "The pipeline". Deliberately NOT synced: git init,
   .github/workflows/gates.yml, .lighthouserc.json — the workshop is meta, not a product repo.
2. **SessionStart(compact) hook added** to both the workshop .claude/settings.json and
   harness-core/hooks/hooks.json: after any compaction, an injected reminder tells the agent to
   sync doc-level decisions, save a handoff to docs/handoffs/, and suggest a fresh chat.
3. **setup-kanban + write-tickets restored** from the legacy archive into the workshop and
   harness-core, unmodified — their only cross-reference (escalation-protocol) is live again,
   so no repairs were needed. Every CLAUDE.md skill reference now resolves.
4. **All 7 agents now ship in harness-core/agents/**: pm, architect, backend-dev, ui-designer,
   frontend-engineer copied from the workshop, joining qa and researcher.

Live counts after this batch: harness-core 27 skills + 7 agents; workshop 15 skills + 7 agents.
Diagram audit (DESIGN.md harness map, 2026-08-14): every box covered — no known gaps remain.

## Addendum (2026-08-14, night): structural test suite — first run + findings

New: `test-harness.sh` at the repo root — repeatable integrity suite (JSON validity, skill
frontmatter + name collisions, dangling retired-skill refs, template completeness against the
DESIGN.md read-order, live guard-hook execution with violation payloads, and optional
workshop-drift check via `./test-harness.sh <project-path>`). Run it after any skill edit or
restoration. The RETIRED list inside it must be updated whenever a skill is restored from the
legacy archive.

Findings from the first run (both fixed):
1. **Workshop skill drift (real bug, the exact disease the harness exists to prevent):** the
   persona workshop's 10 original skills were pre-repair legacy copies still referencing
   retired skills (bootstrap-app, design-references, design-flow, prd-to-ui, new-site-component,
   add-shadcn-component, responsive-implementation, design-options, motion). Fixed by syncing
   all 10 from harness-core (the repaired source of truth). Lesson: projects that COPY skills
   drift; prefer plugin installs, and run the drift check when copies are unavoidable.
2. **False negative in manual guard testing:** design-system-guard reads the written file from
   disk (correct PostToolUse behavior) — testing it against a nonexistent path passes silently.
   The suite now tests with a real file on disk; guard correctly flags hex, arbitrary px, and
   inline color styles (4/4), and protected-files-guard correctly returns "ask" on tokens.json
   and stays silent on free files.

Suite result 2026-08-14: ALL GREEN (33 checks) including workshop in-sync ×15.

## Addendum (2026-08-14, late): anti-drift hardening

- scaffold-project Step 2 now carries the **distribution rule**: skills are installed via
  plugin, never copied into `.claude/skills/`; scaffold checks for copies and flags them.
- README gained an "Integrity — keep one source of truth" section (install-never-copy,
  test-harness.sh after every change, version-on-change, restorations logged).
- harness-core plugin version bumped 1.0.0 → 1.1.0 (5 restored skills, 5 added agents,
  SessionStart(compact) hook since 1.0.0). README counts corrected: 27 skills / 7 agents / 3 hooks.
- Suite re-run after all edits: ALL GREEN.

## Addendum (2026-08-14, late II): model tiering on verification agents

`qa` and `researcher` now carry `model: sonnet` in frontmatter (workshop + harness-core) —
verification passes run on Sonnet 4.6 for cost while the judgment agents (pm, architect,
ui-designer, backend-dev, frontend-engineer) inherit the session model (Opus tier). Rationale:
the gate suite's pass/fail checks are procedural and evidence-based; design judgment is not.
