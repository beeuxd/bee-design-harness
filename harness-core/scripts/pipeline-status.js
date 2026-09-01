#!/usr/bin/env node
// pipeline-status — derives the project's position in the design pipeline from
// artifact state on disk and suggests the next step. Runs on SessionStart and
// on demand via the next-step skill. Read-only; prints nothing it can't prove.
//
// The pipeline state machine reads the same sources of truth the skills write:
//   docs/research/raw/           quotes gathered        → else: gather research
//   docs/research/insights.md    INS-IDs (insight-loop) → else: /insight-loop
//   docs/research/problems.md    PROB-IDs (problem-loop)→ else: /problem-loop
//   docs/ideation/feature-tree.md FEAT-IDs (ideation-loop) → else: /ideation-loop
//   docs/prd.md                  REQ-IDs (pm)           → else: pm seeds PRD
//   docs/ideation/wireframes.md  figma links (wireframe-loop) → else: /wireframe-loop
//   docs/design-system.md        "## Art direction" (art-direction) — hard gate
//   wireframes.md Gate Ledger    dated rows (hifi-gate) → else: /hifi-gate
//   after the gate               build & ship flow (from-figma → qa → /ship)

const fs = require('fs');
const path = require('path');

const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
// Distinct IDs, ignoring template placeholder lines (they carry …, <angle>, or [bracket] markers).
const count = (s, re) => {
  if (!s) return 0;
  const ids = new Set();
  for (const line of s.split('\n')) {
    if (/…|<[a-z-]+>|\[(persona|context|user|action|outcome)\]/.test(line)) continue;
    (line.match(re) || []).forEach((m) => ids.add(m));
  }
  return ids.size;
};
const mtime = (p) => { try { return fs.statSync(p).mtimeMs; } catch { return 0; } };

// Not a harness project at all → stay silent (plugin may be installed org-wide).
if (!fs.existsSync('DESIGN.md') && !fs.existsSync('docs')) {
  if (fs.existsSync('.claude') || fs.existsSync('CLAUDE.md')) {
    console.log('[harness] No DESIGN.md/docs found — if this project should run the design harness, start with /harness-core:scaffold-project.');
  }
  process.exit(0);
}

// Raw research: any file under docs/research/raw/ that isn't the README stub.
let rawFiles = 0, rawNewest = 0;
const rawDir = 'docs/research/raw';
try {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (e.name.toLowerCase() === 'readme.md') return;
    rawFiles++; rawNewest = Math.max(rawNewest, mtime(p));
  });
  walk(rawDir);
} catch { /* no raw dir yet */ }

const insights = read('docs/research/insights.md');
const problems = read('docs/research/problems.md');
const tree     = read('docs/ideation/feature-tree.md');
const prd      = read('docs/prd.md');
const wf       = read('docs/ideation/wireframes.md');
const ds       = read('docs/design-system.md');

const ins  = count(insights, /\bINS-\d+\b/g);
const prob = count(problems, /\bPROB-\d+\b/g);
const feat = count(tree, /\bFEAT-\d+\b/g);
const req  = count(prd, /\bREQ-\d+\b/g);
const wfLinks = count(wf, /figma\.com\/[^\s|)]+/g);
const artDir = ds ? /^##\s*Art direction/im.test(ds) : false;
const gateLedger = wf ? wf.split(/^##\s*Gate Ledger/im)[1] || '' : '';
const gateRows = count(gateLedger, /\b\d{4}-\d{2}-\d{2}\b/g);

const seg = (label, done, detail) => (done ? `${label} ✓${detail ? ` (${detail})` : ''}` : `${label} ✗`);
const chain = [
  seg('research', rawFiles > 0, `${rawFiles} files`),
  seg('insights', ins > 0, `INS×${ins}`),
  seg('problems', prob > 0, `PROB×${prob}`),
  seg('features', feat > 0, `FEAT×${feat}`),
  seg('prd', req > 0, `REQ×${req}`),
  seg('wireframes', wfLinks > 0, `${wfLinks} frames`),
  seg('art-direction', artDir),
  seg('hifi-gate', gateRows > 0, `${gateRows} entries`),
].join(' → ');

let next;
if (rawFiles === 0 && ins === 0)
  next = 'gather raw research into docs/research/raw/ (quotes with source URLs — the firecrawl skill mines Reddit/G2/forums). No research material? The evidence-less path starts at docs/prd.md with the pm agent — kickoff should note it.';
else if (ins === 0) next = '/insight-loop — raw research exists but no traced insights yet.';
else if (prob === 0) next = '/problem-loop — insights exist but no evidenced problem statements yet.';
else if (feat === 0) next = '/ideation-loop — problems exist but no MoSCoW feature tree yet.';
else if (req === 0) next = 'seed docs/prd.md from the feature tree (pm agent) — features exist but no REQ-IDs yet.';
else if (wfLinks === 0) next = 'architect structures the flows, then /wireframe-loop — PRD exists but no validated wireframes yet.';
else if (!artDir) next = '/art-direction — wireframes are validated but docs/design-system.md has no "## Art direction" section. HARD GATE: no hi-fi or visual build until it exists.';
else if (gateRows === 0) next = '/hifi-gate — art direction is set; take wireframes to high fidelity under the gate.';
else next = 'build & ship — /from-figma (citing the gate evidence) → qa E2E → /ship.';

console.log(`[harness] Pipeline: ${chain}`);
console.log(`[harness] Next: ${next}`);

// Staleness: upstream artifact newer than its derived downstream → flag, don't nag.
const stale = [];
if (ins > 0 && rawNewest > mtime('docs/research/insights.md')) stale.push('raw research changed after insights.md — consider re-running /insight-loop');
if (prob > 0 && mtime('docs/research/insights.md') > mtime('docs/research/problems.md')) stale.push('insights.md changed after problems.md — consider re-running /problem-loop');
if (feat > 0 && mtime('docs/research/problems.md') > mtime('docs/ideation/feature-tree.md')) stale.push('problems.md changed after feature-tree.md — consider re-running /ideation-loop');
if (stale.length) console.log(`[harness] Stale: ${stale.join('; ')}`);
