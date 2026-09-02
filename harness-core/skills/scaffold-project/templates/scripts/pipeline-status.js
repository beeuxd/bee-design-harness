#!/usr/bin/env node
// pipeline-status — derives the project's position in the design pipeline from
// artifact state on disk and suggests the next step. Runs on SessionStart, on
// demand via the next-step skill, and as the statusline (--statusline).
// Read-only; prints nothing it can't prove.
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
//
// Verdict inbox: loops write "Verdict: PENDING" beneath their ledger at exit and
// replace it with the ruling once the director rules. A pending verdict outranks
// any next step.

const fs = require('fs');
const path = require('path');

const STATUSLINE = process.argv.includes('--statusline');

// Statusline invocations receive session JSON on stdin (cwd of the workspace).
if (STATUSLINE) {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf8'));
    const dir = (input.workspace && (input.workspace.current_dir || input.workspace.project_dir)) || input.cwd;
    if (dir) process.chdir(dir);
  } catch { /* run from cwd */ }
}

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
  if (!STATUSLINE && (fs.existsSync('.claude') || fs.existsSync('CLAUDE.md'))) {
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
const [wfBody, gateLedger] = wf ? (() => { const parts = wf.split(/^##\s*Gate Ledger.*$/im); return [parts[0], parts[1] || '']; })() : ['', ''];
const gateRows = count(gateLedger, /\b\d{4}-\d{2}-\d{2}\b/g);

// Verdict inbox: "Verdict: PENDING" markers written by the loops at exit.
const PENDING = /Verdict:\s*PENDING/i;
const verdicts = [];
if (insights && PENDING.test(insights)) verdicts.push('insight-loop');
if (problems && PENDING.test(problems)) verdicts.push('problem-loop');
if (tree && PENDING.test(tree)) verdicts.push('ideation-loop');
if (PENDING.test(wfBody)) verdicts.push('wireframe-loop');
if (PENDING.test(gateLedger)) verdicts.push('hifi-gate');

const stages = [
  ['research', rawFiles > 0, `${rawFiles} files`],
  ['insights', ins > 0, `INS×${ins}`],
  ['problems', prob > 0, `PROB×${prob}`],
  ['features', feat > 0, `FEAT×${feat}`],
  ['prd', req > 0, `REQ×${req}`],
  ['wireframes', wfLinks > 0, `${wfLinks} frames`],
  ['art-direction', artDir, ''],
  ['hifi-gate', gateRows > 0, `${gateRows} entries`],
];
const chain = stages.map(([l, done, d]) => (done ? `${l} ✓${d ? ` (${d})` : ''}` : `${l} ✗`)).join(' → ');
const phase = (() => { let last = 'phase 0'; for (const [l, done] of stages) if (done) last = l; return last; })();

let next, nextShort;
if (rawFiles === 0 && ins === 0) {
  next = 'gather raw research into docs/research/raw/ (quotes with source URLs — the firecrawl skill mines Reddit/G2/forums). No research material? The evidence-less path starts at docs/prd.md with the pm agent — kickoff should note it.';
  nextShort = 'gather research';
} else if (ins === 0) { next = '/insight-loop — raw research exists but no traced insights yet.'; nextShort = '/insight-loop'; }
else if (prob === 0) { next = '/problem-loop — insights exist but no evidenced problem statements yet.'; nextShort = '/problem-loop'; }
else if (feat === 0) { next = '/ideation-loop — problems exist but no MoSCoW feature tree yet.'; nextShort = '/ideation-loop'; }
else if (req === 0) { next = 'seed docs/prd.md from the feature tree (pm agent) — features exist but no REQ-IDs yet.'; nextShort = 'pm → prd'; }
else if (wfLinks === 0) { next = 'architect structures the flows, then /wireframe-loop — PRD exists but no validated wireframes yet.'; nextShort = '/wireframe-loop'; }
else if (!artDir) { next = '/art-direction — wireframes are validated but docs/design-system.md has no "## Art direction" section. HARD GATE: no hi-fi or visual build until it exists.'; nextShort = '/art-direction ⛔'; }
else if (gateRows === 0) { next = '/hifi-gate — art direction is set; take wireframes to high fidelity under the gate.'; nextShort = '/hifi-gate'; }
else { next = 'build & ship — /from-figma (citing the gate evidence) → qa E2E → /ship.'; nextShort = 'build & ship'; }

// Staleness: upstream artifact newer than its derived downstream → flag, don't nag.
const stale = [];
if (ins > 0 && rawNewest > mtime('docs/research/insights.md')) stale.push('raw research changed after insights.md — consider re-running /insight-loop');
if (prob > 0 && mtime('docs/research/insights.md') > mtime('docs/research/problems.md')) stale.push('insights.md changed after problems.md — consider re-running /problem-loop');
if (feat > 0 && mtime('docs/research/problems.md') > mtime('docs/ideation/feature-tree.md')) stale.push('problems.md changed after feature-tree.md — consider re-running /ideation-loop');

if (STATUSLINE) {
  const bits = [`⬡ ${phase}`];
  if (verdicts.length) bits.push(`⚠ verdict: ${verdicts.join(', ')}`);
  else bits.push(`next: ${nextShort}`);
  if (stale.length) bits.push(`↻ stale ×${stale.length}`);
  console.log(bits.join(' · '));
  process.exit(0);
}

console.log(`[harness] Pipeline: ${chain}`);
if (verdicts.length) console.log(`[harness] VERDICT NEEDED: ${verdicts.join(', ')} — a loop is waiting on the director's ruling (see its ledger). This outranks the next step below.`);
console.log(`[harness] Next: ${next}`);
if (stale.length) console.log(`[harness] Stale: ${stale.join('; ')}`);
