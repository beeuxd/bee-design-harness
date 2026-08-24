# Repairs log — role-copywriter / role-marketer / role-founder (2026-08-13)

Import of the Copywriter, Marketer, and Founder packs per `CURATION.md`. Sources: `/Users/bee/Downloads/Skills/{Copywriter,Marketer,Founder}/`, the legacy archive `Bee Design Persona/.claude/skills-legacy-2026-08-13.tar.gz`, and three origin repos for companion-file recovery. Bodies preserved verbatim except where noted.

## Count note

CURATION.md labels role-marketer "(25)" but its list contains **26** names (brandkit → schema-markup). All 26 were imported. Actual totals: **5 copywriter + 26 marketer + 9 founder = 40 skills**.

## Renames (frontmatter name → directory name)

Seven Marketer skills shipped with short generic frontmatter names; renamed so `name:` == directory everywhere:

| File | Was | Now |
|---|---|---|
| ppt-visual-design/SKILL.md | `ppt-visual` | `ppt-visual-design` |
| analytics-tracking/SKILL.md | `analytics` | `analytics-tracking` |
| email-sequences/SKILL.md | `emails` | `email-sequences` |
| paid-ads/SKILL.md | `ads` | `paid-ads` |
| product-launch/SKILL.md | `launch` | `product-launch` |
| social-content/SKILL.md | `social` | `social-content` |
| schema-markup/SKILL.md | `schema` | `schema-markup` |

All Copywriter and Founder frontmatter names already matched their kebab-case directories — no renames needed there.

## Twin disambiguation (per CURATION)

- **page-cro** ← "Convert & measure/Page CRO Marketing Skill.md" (the keeper). "Marketing Agent Skill.md" in the same folder is the cut byte-twin (`cro`) — not imported.
- **product-launch** ← "Paid, launch & distribute/Product Launch Marketing Skill.md" (353-line keeper). The "Product Launch Marketing Agent Skill" variants (Copywriter and Founder folders) — not imported.
- **marketing-ideas** ← "Plan content & social/marketing-ideas_SKILL.md" (Founder's "Marketing Ideas Skill.md" copy not imported).
- **founder-sales** relocated from Marketer/Email & outbound into role-founder per CURATION ownership call.

## Merges

- **ai-seo** — folded in two unique sections from the cut `Rank & get found/SEO GEO Marketing Skill.md`:
  1. The robots.txt AI-crawler quick-check + explicit allowlist block (curl robots.txt / sitemap.xml + the six-bot allowlist) → appended inside "Step 4: AI Bot Access Check".
  2. The combined validate-and-monitor checklist (Rich Results Test + Schema.org validator commands, Google/Bing indexing checks, SEO/GEO report template) → new "Validate & Monitor Checklist" subsection at the end of "Monitoring AI Visibility".
  Rest of SEO GEO (workflow, platform sections, its own six dangling reference pointers) stays cut.

## Recoveries (companion files re-fetched from origin repos)

All keepers shipped as bare SKILL.md with dangling `references/*` pointers. Recovered rather than softened:

### coreyhaines31/marketingskills @ main (origin of the Marketer pack)

- Copied `references/` directories for 18 Marketer keepers: programmatic-seo, cold-email, ab-testing, social-content (← origin `social`), marketing-ideas, email-sequences (← `emails`), directory-submissions, analytics-tracking (← `analytics`), paid-ads (← `ads`), content-strategy, lead-magnets, ai-seo, page-cro (← `cro`), ad-creative, churn-prevention, onboarding-cro (← `onboarding`), schema-markup (← `schema`), referral-program (← `referrals`).
- Copied `copy-editing/references/` into **role-copywriter/skills/copy-editing/** (same origin).
- Copied `ad-creative/assets/` (creative-review-template.html, referenced by its references).
- Copied the repo-root `tools/` directory (REGISTRY.md + integrations/ + clis/ + composio/, 161 files) → **role-marketer/tools/** so every `../../tools/REGISTRY.md` and `../../tools/integrations/*.md` pointer resolves exactly as in the origin layout.
- *Version note:* our SKILL.md bodies are a slightly older, punctuation-normalized export (em-dashes replaced); no origin tag matches them byte-for-byte. Bodies kept verbatim per instructions; every referenced filename was verified to exist in main's references before copying.

### RefoundAI/lenny-skills @ v1.0.0 (origin of the guest-insights family)

Exact version match confirmed — guest/mention counts in each SKILL.md match v1.0.0's `guest-insights.md` exactly (main has diverged and dropped scoping-cutting/vibe-coding entirely). Copied `references/guest-insights.md` for:

- role-founder: founder-sales (16 guests/28), fundraising (2/2), scoping-cutting (15/19), vibe-coding (3/3), measuring-product-market-fit (46/64), ai-product-strategy (94/179)
- role-marketer: pricing-strategy (46/76)

SKILL.md bodies for founder-sales/scoping-cutting are byte-identical to v1.0.0; the others differ only by the same em-dash normalization.

### stripe/ai @ main (Stripe's official agent skill)

- Recovered all six references for **stripe-best-practices**: payments.md, billing.md, connect.md, tax.md, treasury.md, security.md. The inline routing table now resolves; no softening needed.
- *Version note:* our SKILL.md body is an earlier snapshot (pins API `2026-06-24.dahlia`; current main pins `2026-07-29.dahlia` and adds SDK-version/tax notes). Body kept verbatim; references are Stripe's current official ones and remain topic-compatible with the routing table.

## ux-copy-review (extracted from legacy archive)

- Extracted `ux-copy-review/` from `skills-legacy-2026-08-13.tar.gz` → role-copywriter/skills/ (fifth copywriter skill, the addition beyond CURATION's four).
- Grepped for retired-skill references (kickoff, design-flow, ship, etc.): the body only cross-references `a11y-audit`, `visual-qa`, and `verify-before-done` — all present in harness-core — plus "before ship review" in the description (`ship` kept, it's in harness-core). **No softening was required; body unchanged.**
- It reads project docs (`docs/project.md`, `docs/ux-principles.md`) at runtime — project-relative, not plugin pointers.

## Softenings

None ended up necessary — every dangling pointer was recovered from an origin repo instead.

## Known remaining (deliberately untouched, per "preserve bodies verbatim")

- Prose cross-references to skills cut in curation or to origin-repo names survive in some bodies (e.g., ad-creative mentions the cut **marketing-loops** loop; ai-seo's Related Skills list uses origin names **schema**/**competitors** for what are now schema-markup/competitor-alternatives; several descriptions mention cut skills like paywalls/popups/offers/signup-flow-cro). These are prose, not file pointers — nothing 404s.
- copy-editing keeps its origin `metadata: version: 2.0.0` frontmatter block (harmless).

## Verification

- Directory counts: role-copywriter 5, role-marketer 26 (see count note), role-founder 9 — each `skills/<kebab-name>/SKILL.md`.
- Frontmatter `name:` == directory name for all 40; every file has valid `---` frontmatter with name + description.
- Names unique across the three packs; zero collisions with harness-core (20 skills) or the role-designer/role-engineer/role-pm lists in CURATION.md.
- Pointer sweep (markdown links, `<references/...>`, backticked reference paths) across all .md in the three packs: **0 dangling** (one checker false-positive: a skill-root-relative prose path in ad-creative/references/creative-review-page.md whose target exists at `ad-creative/assets/`).

## 2026-08-24 — trace pass results (license audit)
- Attributed: brandkit + ppt-visual-design → role-marketer 1.0.2; fundraising, founder-sales,
  ai-product-strategy, measuring-product-market-fit (RefoundAI/lenny-skills, MIT w/ content caveat) → role-founder 1.0.2.
- Flagged for rewrite/cut: ux-writing (untraced); pitch-deck, scoping-cutting (untraced Lenny variants — rewrite);
  vibe-coding, ai-product (untraced + quality-disputed — recommend cut).
