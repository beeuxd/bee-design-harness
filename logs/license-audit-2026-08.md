# License audit — third-party skill content (2026-08-24)

Scope: every skill shipped in harness-core + 6 role packs (118 skills), audited for upstream
provenance and redistribution rights ahead of taking the repo public. Method: frontmatter/license
sweep of all SKILL.md files, LICENSE files in-repo, fingerprint searches of distinctive skill
names/phrases against live upstream repos (verified 2026-08-24).

## Verdict

**The repo cannot go public as-is.** Two skills carry a proprietary Anthropic license that
prohibits redistribution outright; one is AGPL-3.0 (copyleft, incompatible with a blanket MIT
repo); ~25 imported skills have unknown provenance and no license; and none of the ~60 confirmed
MIT/Apache imports currently carry the upstream copyright notices those licenses require.
All fixable. Blockers and actions below.

## Blockers (must fix before public)

### 1. `pdf` + `docx` (role-designer) — Anthropic proprietary, redistribution prohibited
Both ship Anthropic's LICENSE.txt: "users may not… reproduce or copy… create derivative works…
distribute, sublicense, or transfer these materials to any third party." These are Anthropic's
source-available document skills (same terms as anthropics/skills — explicitly *not* open source).
**No active violation while the repo is private; publishing them would be one.**
**Action:** remove both from role-designer before any public release. Users get these capabilities
anyway — they're bundled with Claude products. Update role-designer plugin.json + CURATION note.

### 2. `firecrawl` (role-pm) — AGPL-3.0
Firecrawl's Claude plugin/skill is AGPL-3.0 (SDKs MIT, but the plugin follows the core's AGPL).
Redistributable, but copyleft — it cannot sit unlabeled inside an MIT-declared repo.
**Action (pick one):** (a) drop the copy and replace with a thin in-house pointer skill that
instructs installing the official `firecrawl/firecrawl-claude-plugin`; or (b) keep the copy with
its AGPL-3.0 text and per-skill license labeling. Recommend (a) — it also ends version drift.

### 3. Missing attribution on all confirmed imports
MIT and Apache-2.0 both require preserving copyright + license text. None of the imported copies
carry upstream notices today.
**Action:** add a repo-level `THIRD-PARTY-NOTICES.md` (per-upstream copyright line + license text)
and add `source:` + `license:` frontmatter to every imported SKILL.md.

## Confirmed provenance (safe to redistribute with attribution)

| Upstream | License | Harness skills |
|---|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | MIT | role-marketer: the CRO/SEO/growth set (~24 of 26) · role-copywriter: `copywriting`, `copy-editing` |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) (official) | MIT | role-engineer: `gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-plugins`, `gsap-performance`, `gsap-utils` |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT | role-engineer: `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions`, `web-design-guidelines` |
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | MIT | role-engineer: `better-ui`, `better-typography`, `better-colors`, `better-accessibility`, `better-layout` |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT | role-designer: `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design` |
| [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | role-pm: `grilling` (grill-me merged in), `wayfinder`, `triage`, `to-prd`, `to-issues` (adapted per CURATION) |
| [stripe/ai](https://github.com/stripe/ai) | MIT | role-founder: `stripe-best-practices` |
| [anthropics/skills](https://github.com/anthropics/skills) (example skills) | Apache-2.0 | role-pm: `doc-co-authoring` · role-copywriter: `internal-comms` |

harness-core's 27 skills, the 7 agents, hooks, templates, and DESIGN.md are in-house work
(loops/gates authored here; `session-start`/`handoff-summary`/etc. restored from our own legacy
archive) — no third-party constraint beyond ideas.

## Unresolved provenance (~25 skills — no license, upstream not identified)

- **role-designer:** `extract-design-system`, `design-taste-frontend`, `imagegen-frontend-web`,
  `imagegen-frontend-mobile`, `design-handoff`, `design-critique`, `text-to-lottie`,
  `awwwards-animations`, `wcag-accessibility` (declares MIT, author unknown)
- **role-engineer:** `tailwind-design-system`, `review-loop`, `agent-browser` (likely
  vercel-labs/agent-browser — verify), `deploy-to-vercel` (likely Vercel — verify)
- **role-pm:** `customer-journey-map`, `opportunity-solution-tree`, `usability-testing`,
  `user-research`, `prototype`
- **role-founder:** `fundraising`, `pitch-deck`, `scoping-cutting`,
  `measuring-product-market-fit`, `founder-sales`, `vibe-coding`, `ai-product`,
  `ai-product-strategy` (searched; no upstream match found)
- **role-copywriter:** `ux-writing`
- **role-marketer:** `brandkit`, `ppt-visual-design` (declares MIT, author "claude-office-skills"
  — locate repo to confirm)

**Action (per skill, pick one):** trace upstream via fingerprint search and attribute; rewrite
in-house (founder pack is short prose — cheapest path); or exclude from the public build and keep
in a private overlay. Unlicensed third-party text cannot ship publicly by default.

## Licensing model recommendation

Own work under MIT at repo root; imported skills keep their upstream license, declared per-skill
in frontmatter and aggregated in THIRD-PARTY-NOTICES.md. If firecrawl stays (option b), its
AGPL-3.0 must be called out explicitly at the top of the README's license section.

## Order of work to unblock going public

1. Remove `pdf` + `docx`; replace `firecrawl` with pointer skill. (30 min)
2. Add `source:`/`license:` frontmatter to the ~60 confirmed imports + THIRD-PARTY-NOTICES.md. (1–2 h, scriptable)
3. Disposition the ~25 unresolved skills (trace / rewrite / exclude). (the long pole — batch by pack)
4. Root LICENSE (MIT, own work) + README license section. (15 min)
5. Re-run `test-harness.sh`; update CURATION.md and role-designer/role-pm plugin manifests for removals.
