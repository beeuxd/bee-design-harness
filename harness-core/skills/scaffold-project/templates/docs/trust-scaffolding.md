# Trust Scaffolding — T.R.U.S.T.

The design standard for any feature in this product that shows AI-generated output or takes AI-driven action. Sibling of `docs/ux-principles.md` and `design/accessibility.md`; applied as a review lens by `review-ux` and `ship` whenever a feature contains AI.

**Design principle:** design so people can say — *I know what this system did, what it based that on, where it may be wrong, and what I can do about it.*

**Scaffold strength matches the moment of reliance.** A one-line summary needs a light scaffold. A hiring, financial, medical, legal, or customer-impacting recommendation needs evidence, assumptions, uncertainty, alternatives, accountable review, and a clear route to override. Decide the stakes tier first; it sets how much of each pillar below is mandatory.

| Stakes | Examples | Minimum scaffold |
|--------|----------|------------------|
| Light | summaries, drafts, suggestions the user immediately edits | role label + undo |
| Medium | recommendations the user acts on (rankings, categorization, autofill) | + provenance, confidence, override |
| High | hiring / financial / medical / legal / customer-impacting actions | + evidence, assumptions, alternatives, accountable human review, audit trail |

## The five pillars

### T — Truthful expectations
*What can this AI do, how well, and where does it fail?* Trust begins before the first output: set an accurate mental model of role, capabilities, data boundaries, and non-capabilities. Informed use, not disclaimer overload.

**Breaks as:** "AI-powered" with no stated benefit or limit; human-like certainty the system doesn't have; fine-print limits revealed only after someone acts on bad output.

**Build:**
- Clear AI role label on every AI surface: **draft**, **recommendation**, or **assisted result**
- Capability framing in task language ("finds duplicate invoices in your uploads"), never model marketing ("powered by advanced AI")
- A boundary statement for what the system does *not* do, adjacent to what it does
- First-use orientation at the moment the feature is used, not in onboarding slides
- Sandbox/preview mode for low-stakes trial before real work
- Model or mode disclosure when speed, quality, privacy, or cost change

### R — Reasons & provenance
*Why did it produce this, and from what?* Every AI output the user relies on has an inspectable basis.

**Breaks as:** black-box answers; citations that don't support the claim; "based on your data" with no way to see which data.

**Build:**
- Source attribution on claims (which document, record, or input produced this)
- "Why this?" affordance on recommendations — expandable, one level deep, plain language
- Inputs summary: what the system considered (and notably didn't)
- Legibility at the right altitude: flight manifest, not cockpit telemetry — no raw log dumps

### U — Uncertainty & limits
*How sure is it, and where does it stop?* Calibrated caution beats false precision.

**Breaks as:** uniform confident tone at every confidence level; precise-looking numbers from vague estimates; edge-of-competence outputs indistinguishable from core-competence ones.

**Build:**
- Confidence expressed honestly and categorically (High/Medium/Low with what that means), never fake decimals
- Visual/verbal distinction for low-confidence output (hedged phrasing, distinct styling — tokens from `design/tokens.json`)
- Explicit "I can't do this / not enough data" states — designed, not error-fallback
- Freshness/staleness marking when data age matters

### S — Safeguards & user control
*What can I do about it?* Agency is preserved at every step the AI takes.

**Breaks as:** auto-applied changes with no review; undo that doesn't fully restore; opt-outs buried in settings; the human needed most exactly when automation hands back control worst.

**Build:**
- Review-before-apply as the default for consequential actions; auto-apply only opt-in
- Undo/rollback that provably restores prior state, discoverable at the moment of regret
- Override route on every recommendation (choose differently without friction or guilt-tripping)
- Escalation to a human path for High-stakes tiers — accountable review, not a support form
- Clean interruption: pausing/stopping the AI mid-task doesn't corrupt state, and the human can step back out

### T — Track record & repair
*Has it earned reliance, and what happens when it's wrong?* Durable trust is built from history and repair, not first impressions.

**Breaks as:** errors vanish without acknowledgment; no way to see how often it's right; feedback that goes nowhere.

**Build:**
- Visible history/audit trail of AI actions (what it did, when, on what basis) — retention matched to stakes tier
- Correction feedback loop: user fixes are captured and visibly improve behavior
- Error acknowledgment pattern: when wrong, say so, show impact, show the fix — never silent correction
- Accuracy/track-record surface for repeated-reliance features (High tier)

## Review checklist (used by `review-ux` and `/ship`)

For each AI surface in the feature: stakes tier stated → role label present → boundary statement present → provenance inspectable → confidence honest → override + undo reachable → failure/refusal states designed → repair loop exists. Any unchecked item at Medium+ stakes is a NO-SHIP finding.
