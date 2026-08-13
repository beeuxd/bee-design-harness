# Skill Curation — consolidated verdicts (2026-08-13)

Source: 192 files / 125 unique skills in `/Users/bee/Downloads/Skills/`, audited by three independent reviewers (Designer; Engineer+PM; Copywriter+Marketer+Founder), reconciled here. Result: **80 skills across 6 role packs** (16+13+12+5+26+9 — copywriter gained ux-copy-review from the gate-suite archive) + the 20 in harness-core (11 + the 9-skill gate suite).

## Final pack shapes

### role-designer (16)
extract-design-system · wcag-accessibility (patch: 24px target-size line → house 44px) · animate · review-animations · improve-animations · find-animation-opportunities · apple-design · animation-vocabulary · text-to-lottie · design-taste-frontend (+merge: redesign-existing-projects' Design Audit + Strategic Omissions sections) · imagegen-frontend-web · imagegen-frontend-mobile · design-handoff · design-critique · docx · pdf

### role-engineer (13)
tailwind-design-system · vercel-composition-patterns · better-ui (+merge: design-engineering's Component Building / Sonner / Debugging Animations sections) · better-accessibility (+merge: better-accessibility review method noted by Designer auditor) · better-colors · better-layout · better-typography · vercel-react-best-practices · vercel-react-view-transitions · web-design-guidelines · agent-browser · deploy-to-vercel · review-loop

### role-pm (12)
customer-journey-map · firecrawl · grilling (+merge: grill-me's "explore the codebase before asking" rule) · opportunity-solution-tree · usability-testing · user-research · doc-co-authoring · prototype · to-prd (adapt: strip matt-pocock tracker dep; output → docs/prd.md REQ-IDs) · to-issues (adapt: same; align with GitHub Projects flow) · triage (adapt: same) · wayfinder

### role-copywriter (4)
copywriting · copy-editing · ux-writing · internal-comms

### role-marketer (26)
brandkit · ppt-visual-design · ab-testing · analytics-tracking · marketing-psychology · onboarding-cro · page-cro · product-marketing-context · cold-email · email-sequences · ad-creative · churn-prevention · competitor-alternatives · directory-submissions · lead-magnets · paid-ads · pricing-strategy · product-launch · referral-program · content-strategy · marketing-ideas · social-content · ai-seo (+merge: seo-geo's AI-crawler robots.txt allowlist + validate-and-monitor checklist) · programmatic-seo · seo-audit · schema-markup
*(rename short generic frontmatter names on import: launch→product-launch, emails→email-sequences, ads→paid-ads, etc.)*

### role-founder (9)
fundraising · pitch-deck · scoping-cutting · measuring-product-market-fit · founder-sales (relocated from Marketer) · stripe-best-practices (needs refs restored) · vibe-coding · ai-product ⚠ · ai-product-strategy ⚠
*(⚠ = auditors disagreed on quality — Founder auditor: operational; PM auditor: quote-prose. Kept per role-owning auditor; user may cut.)*

## Cross-role ownership calls (byte-identical duplicates → one owner)

| Skill | Owner | Loser(s) | Why |
|---|---|---|---|
| better-* five | Engineer | Designer | Code-craft set that cross-references itself; design-heavy projects install both packs |
| Motion suite (animate/review/improve/find) + apple-design + vocabulary | Designer | Engineer | Its named home; designers direct motion |
| tailwind-design-system | Engineer | Designer | Pure code implementation |
| extract-design-system | Designer | Engineer | Feeds art-direction/references |
| design-handoff | Designer | Engineer, PM | A designer deliverable |
| design-critique | Designer | PM, Copywriter | Critique of design work |
| ux-writing | Copywriter | Designer | Its named territory |
| usability-testing, user-research | PM | Designer | Discovery methods feeding the loops |
| grilling | PM | Founder, Designer | Center of the grill family |
| opportunity-solution-tree | PM | Founder | Discovery method; PM auditor claimed it |
| firecrawl | PM | Marketer, Founder | The loops' research engine; one scraping stack harness-wide (just-scrape cut) |
| review-loop | Engineer | PM, Designer | Quality-iteration on built artifacts |
| doc-co-authoring | PM | Designer | PRD/spec work |
| docx + pdf | Designer | PM | Document deliverables live with Designer |
| copywriting, copy-editing | Copywriter | Marketer | Core craft |
| pitch-deck, founder-sales | Founder | Marketer | Fundraise/founder-led-sales are founder work |
| product-launch, ad-creative, churn-prevention, lead-magnets, marketing-ideas, onboarding-cro, page-cro, referral-program, marketing-psychology, product-marketing-context | Marketer | Founder, Copywriter | Founder's Launch & grow group was 100% byte-identical re-shipment |

## Cuts (46 unique skills) — by reason

- **Contradict house non-negotiables**: gpt-taste (mandatory heavy motion, no reduced-motion; placeholder imagery), high-end-visual-design & minimalist-ui & industrial-brutalist-ui (hard-prescribe fonts/palettes → fight art-direction; brutalist is light-first), image-to-code (eyeballs images → violates two-source rule), frontend-design (per-build aesthetic invention), brand-guidelines (hardcodes *Anthropic's* brand as "official colors")
- **Territory owned by harness-core**: wireframe-prototyping, product-agent-research, notion-research-documentation, user-research(Designer copy), pm-handoff (×2; handoff discipline is core), design-motion-principles (broken + suite covers), review-loop(PM/Designer copies)
- **Broken beyond repair as shipped**: skill-creator, hyperframes (router to 8 missing skills), grill-with-docs, ui-ux-pro-max (missing search DB), impeccable-file (missing scripts — two salvage ideas folded into core art-direction instead), web-artifacts-builder, product-manager-toolkit (value was in missing .py), gstack (×2)
- **Wrong ecosystem / vendor lock-in**: stitch-design (×2), taste-design (Stitch), sleek (API key), ai-image-generation (belt CLI), xlsx (stock utility misfiled)
- **Served by MCP / meta-utilities**: figma-use, figma-generate-design (the Figma MCP serves both — shipping copies = version drift), find-skills (×3, installed globally)
- **Quality (vibes, not method)**: ai-evals, ai-product(PM copy), vibe-coding(Engineer copy — Founder's kept), loop-me, data-visualization, accessibility-expert (WCAG 2.1, superseded), animation-vocabulary(Engineer copy), remotion (broken index + peripheral), design-an-interface (misfile), ai-native-product-designer (hiring rubric), just-scrape (second scraping stack), cro (byte-twin of page-cro), wayfinder(Discover copy), 3 within-role byte-dups (apple-design, design-taste-frontend ×2 groups)

## Repairs required before packaging

1. **Re-fetch companion files from origin repos** (export shipped bare .md only): better-ui/-accessibility/-colors/-layout/-typography (~28 refs), review-animations (STANDARDS.md), improve-animations (AUDIT.md, PLAN-TEMPLATE.md), wcag-accessibility (A11Y-PATTERNS.md), prototype (LOGIC.md, UI.md), triage (AGENT-BRIEF.md, OUT-OF-SCOPE.md), stripe-best-practices (6 refs), firecrawl (refs; usable degraded), pdf/docx (REFERENCE.md, FORMS.md), vercel-* rule bodies (can copy from the locally installed full versions in ~/.claude/skills)
2. **Patches**: wcag 24px→44px; extract-design-system output path → `design/tokens.json` flow (guarded path); remove design-engineering's "reply only with course ad" instruction before merging its sections; strip matt-pocock deps from to-prd/to-issues/triage; rename `Figma Generate Design Skill (1).md` artifacts; normalize all frontmatter names to kebab-case, no collisions with core or each other
3. **Merges** (unique sections folded into keepers): listed inline per pack above + impeccable's register-split & seed-color ideas → core `art-direction`
