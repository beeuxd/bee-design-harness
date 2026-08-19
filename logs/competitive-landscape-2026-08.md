# Competitive landscape — does anything like this exist? (researched 2026-08-17→20)

Deep-research run: 20 sources fetched, 99 claims extracted, 25 adversarially verified (3-vote panels), 21 confirmed / 4 refuted.

## Verdict

Nothing on the market combines all of the Bee Design Harness's pillars, but every individual pillar already exists somewhere — so the defensible position is the integrated system, not any single mechanism. The closest structural competitor is designagent (sherizan/designagent), an existing designer-focused Claude Code plugin marketplace with ~10 plugins including token drift detection and DESIGN.md/BRAND.md/VOICE.md scaffolding, though it is a tiny solo project with no agent team, no evidence-traced pipeline, and advisory (not blocking) review. The deepest functional overlap is ux-ui-agent-skills (502 stars), which ships a taste layer (anti-slop doctrine, 138 design systems) plus real hard gates — token-only linting, WCAG 2.2 AA contrast checks, and axe-core audits enforced in CI. "Taste capture" and "anti-AI-slop" positioning are already crowded (Superdesign across 70+ agents, taste-skill's Trigger/Decision/Reason/Trade-off format), and multi-agent PM/designer/engineer/QA rosters are commodity (VoltAgent's 158+ subagents, contains-studio's design department, SuperClaude). What appears genuinely novel is the combination of: compounding taste rules captured from the user's own corrections (competitors extract taste from other sites or ship static libraries), the evidence-traced quote→insight→problem→feature→UI pipeline with human-verdict iteration loops, and DTCG tokens.json synced with Figma variables as a hook+CI-enforced source of truth.

## Confirmed findings

### A designer-focused Claude Code plugin marketplace already exists: designagent (github.com/sherizan/designagent...

- **Confidence:** high (12-0 across 4 merged claims (3-0 each))
- **Sources:** https://designagent.dev/, https://github.com/sherizan/designagent
- **Evidence:** designagent.dev: 'a curated marketplace of Claude Code plugins built specifically for designers'; repo contains a real .claude-plugin/marketplace.json declaring ~10 plugins. tokens plugin: 'Extract your design tokens from code (colors, spacing, type, radius) with deterministic clustering and hardcoded-value drift detection, and keep DESIGN.md in sync.' design-qa 'screenshots your running UI, diffs it against the Figma frame / DESIGN.md, and reports... drift by severity' — advisory, no blocking gate. No mention of taste rules, correction capture, agents, or research pipeline anywhere in site or repo.

### Superdesign is a direct competitor on the anti-'AI-slop' positioning — the exact same core problem framing as ...

- **Confidence:** high (9-0 across 3 merged claims (3-0 each))
- **Sources:** https://github.com/superdesigndev/superdesign-skill, https://superdesign.dev/blog/claude-code-ui-design, https://github.com/vercel-labs/skills
- **Evidence:** README: 'Stop shipping AI-slop UI. Coding agents write great code and mediocre interfaces: generic layouts, default shadcn everything, no taste.' and 'Superdesign designs into your existing design system: it reads your code for context... produces branchable drafts.' Install: npx skills add superdesigndev/superdesign-skill; 'Claude Code, Cursor, Codex, and 70+ others'. Superdesign's own blog confirms enforcement is via 'deliberate prompting' and CLAUDE.md rules — soft constraint, no programmatic gates. Repo active: 129 commits, 425 stars.

### ux-ui-agent-skills (plugin87, 502 stars, v2.4.0) is the deepest functional overlap on two harness pillars simu...

- **Confidence:** high (9-0 across 3 merged claims (3-0 each); a 4th related claim asserting DTCG token architecture was refuted 0-3)
- **Sources:** https://github.com/plugin87/ux-ui-agent-skills
- **Evidence:** README verbatim: 'Turn Claude into a Senior Design Architect'; 'Native anti-slop doctrine, aesthetic archetypes, and a library of 138 design systems'; 'Color contrast: 4.5:1 (text), 3:1 (UI components)'. Verifier fetched package.json ('verify': accuracy_report.mjs), ci.yml (validate_tokens.py, validate_contrast.py, lint_hardcodes.py, Playwright real-render contrast), scripts/axe_audit.mjs, scripts/taste_audit.mjs. None of the 17 skills records user corrections into a persistent taste ledger.

### 'Taste as the rationale behind design tokens' already exists as a concept in the wild: taste-skill (senlindesi...

- **Confidence:** high (9-0 across 3 merged claims (3-0 each))
- **Sources:** https://github.com/senlindesign/taste-skill
- **Evidence:** Repo tagline: 'reverse-engineer any website's design taste: concrete tokens + opinionated trade-offs (WHY, not just WHAT)'. SKILL.md: 'Trigger → Decision → Reason → Evidence trade-offs explaining WHY the design works'; 'design tokens alone are useless for an AI agent... The Reason is what makes the same agent generate good design for a different page.' README export table confirms .cursor/rules/{domain}-taste.mdc, taste-tokens.css (v0), CLAUDE.md, and more. Run-once /taste <url> extraction; no sync or correction-capture mechanism. Caveat: MIT license only self-declared (no LICENSE file).

### Agent OS (buildermethods, 5.3k stars, v3.0) validates the 'structured context injected per-task across multipl...

- **Confidence:** high (9-0 across 3 merged claims (3-0 each))
- **Sources:** https://github.com/buildermethods/agent-os, https://buildermethods.com/agent-os/adaptability
- **Evidence:** README: 'Discover Standards — Extract patterns and conventions from your codebase into documented standards... Deploy Standards — Intelligently inject relevant standards based on what you're building'; 'Works alongside Claude Code, Cursor, Antigravity, and other AI tools.' Verifier confirmed zero mentions of design tokens, art direction, taste, or Figma in README/CHANGELOG; v3.0 (2026-01-20) 'focuses on... establishing standards, injecting them smartly, and enhancing spec-driven development.' Tool-neutrality is tiered: native Claude Code integration, generated markdown for others.

### A multi-agent product-team roster (PM / researcher / designer / engineers / QA) is not novel by itself. VoltAg...

- **Confidence:** high (12-0 across 4 merged claims (3-0 each); two adjacent contrast claims about contains-studio's scope were refuted (0-3, 1-2), so its lack of enforcement mechanisms is asserted here only via verifier caveat, not a surviving claim)
- **Sources:** https://github.com/VoltAgent/awesome-claude-code-subagents, https://github.com/contains-studio/agents, https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/user-guide/commands.md
- **Evidence:** VoltAgent README: '158+ Claude Code subagents across 10 categories', installable via 'claude plugin marketplace add VoltAgent/awesome-claude-code-subagents'; all six named roles verified verbatim. contains-studio design/ directory contains exactly the five agent .md files; verifier notes they are single-file markdown prompt personas with no token enforcement or pipeline. SuperClaude docs: PM agent 'Delegates to requirements-analyst → system-architect → security-engineer → backend-architect → quality-engineer'; 17-agent roster has no ui-designer; /sc:design = 'Architecture diagrams, API specifications, Database schemas, Component interfaces.'

### Novelty assessment: three harness mechanisms have no verified equivalent anywhere in the scanned landscape — (...

- **Confidence:** medium (synthesis across all 21 confirmed claims; medium because absence-of-equivalent is inferred from the scanned set, not exhaustively proven)
- **Sources:** https://designagent.dev/, https://github.com/plugin87/ux-ui-agent-skills, https://github.com/senlindesign/taste-skill, https://github.com/superdesigndev/superdesign-skill, https://github.com/buildermethods/agent-os, https://github.com/VoltAgent/awesome-claude-code-subagents
- **Evidence:** Verifiers explicitly checked each competitor for correction-capture, evidence-traced pipelines, and Figma-variables sync and found none: designagent 'no compounding taste rules... no evidence-traced research pipeline'; ux-ui-agent-skills 'none records user corrections into a persistent per-project taste-rules ledger... no evidence-traced research pipeline'; taste-skill 'no mechanism for capturing/compounding a user's own corrections'; designagent tokens plugin has 'no mention of DTCG, tokens.json, or Figma variables'. Conversely, every other pillar was found occupied by at least one verified competitor.

## Refuted claims (killed by the verification panel)

- (0-3) The repo uses DTCG-format design tokens (14 token files) with a three-tier architecture as its styling source of truth, overlapping with the Bee Design Harness's 'design tokens as AI guardrails' pillar — though no Figma-variables sync is described. — https://github.com/plugin87/ux-ui-agent-skills
- (0-3) contains-studio/agents is a widely adopted (12.4k stars, 2.5k forks) collection of 40+ specialized Claude Code sub-agents organized into 8 departments, making it a real multi-agent product-team framework comparable in scope to the Bee Design Harness's 7-agent team. — https://github.com/contains-studio/agents
- (1-2) The project contains no design-token enforcement, art-direction capture, taste-rule accumulation, evidence-traced research pipeline, or hard quality gates — the mechanisms the Bee Design Harness treats as core are absent here. — https://github.com/contains-studio/agents
- (0-3) The SuperClaude commands reference contains zero coverage of the harness's core design concerns: the terms 'design token', 'Figma', 'art direction', 'taste', 'accessibility', 'WCAG', 'wireframe', 'UI design', and 'design system' do not appear anywhere on the page (per a term-by-term search of the fetched content). — https://github.com/SuperClaude-Org/SuperClaude_Framework/blob/master/docs/user-guide/commands.md

## Caveats

Time-sensitivity: all verifications were performed 2026-08-17 to 2026-08-20 against live repos and sites; this space moves fast (Superdesign 129 commits, ux-ui-agent-skills on v2.4.0 with recent releases), so competitor gaps — especially correction-capture taste features — could close within months. Coverage gap: research question 2 (commercial AI design tools — v0, Lovable, Figma Make, Subframe, Onlook, Polymet, Magic Patterns) produced no surviving verified claims, so the commercial-tool comparison is entirely unanswered by this synthesis; likewise BMAD-method and design-system MCP servers were named in the research question but yielded no confirmed findings. Refuted-claim implications: the claim that ux-ui-agent-skills uses DTCG-format tokens was refuted 0-3, and both broad claims about contains-studio/agents (its scope-comparability AND its lack of enforcement mechanisms) were refuted or split — so contrasts involving contains-studio rest only on verifier caveats within surviving claims, not independently verified claims. Adoption signals are asymmetric: designagent (closest structural competitor) has only 5 stars, while contains-studio (prompt personas only) has 12.4k — star counts here measure discoverability, not capability. taste-skill's MIT license is self-declared only (no LICENSE file), relevant if evaluating it for reuse. Finally, the novelty finding is an absence claim: it is only as strong as the scan's coverage, and niche or unlisted projects (private betas, agency-internal harnesses) would not have been surfaced.

## Open questions

- How do commercial AI design tools (v0, Lovable, Figma Make, Subframe, Onlook, Magic Patterns) handle design-token grounding and taste capture — do any already sync Figma variables or DTCG tokens as generation guardrails? (No verified claims survived on this half of the research question.)
- Does BMAD-method or any spec-driven agile framework include an evidence-traced research-to-UI pipeline (user quote → insight → problem → feature) comparable to the harness's loops, or is that traceability chain genuinely unoccupied territory?
- Is anyone shipping Figma-variables ↔ DTCG tokens.json bi-directional sync as an AI-agent enforcement mechanism specifically (vs. general token-sync tools like Tokens Studio used manually), and could designagent's tokens plugin or ux-ui-agent-skills add this quickly?
- What is the actual adoption/retention of the closest competitors (designagent at 5 stars vs ux-ui-agent-skills at 502) — is the designer-plugin-marketplace category failing to find users, or just early? This matters for whether open-sourcing the harness enters an empty market or a validated-but-crowded one.
