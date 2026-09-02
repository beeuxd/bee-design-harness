#!/usr/bin/env bash
# test-harness.sh — structural integrity suite for the design harness.
# Run from the repo root after any skill edit, restoration, or pack change:
#   ./test-harness.sh [path-to-project-workshop]
# Exit 0 = all green. Any FAIL line = fix before shipping.

set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
WORKSHOP="${1:-}"
FAILURES=0

fail() { echo "FAIL  $1"; FAILURES=$((FAILURES + 1)); }
pass() { echo "ok    $1"; }

# ── 1. JSON validity: plugin manifests, marketplace, hooks ──────────────
for f in "$ROOT"/*/.claude-plugin/plugin.json "$ROOT"/.claude-plugin/*.json \
         "$ROOT"/harness-core/hooks/hooks.json \
         "$ROOT"/harness-core/skills/scaffold-project/templates/.lighthouserc.json \
         "$ROOT"/harness-core/skills/scaffold-project/templates/design/tokens.json; do
  [ -e "$f" ] || { fail "missing: $f"; continue; }
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null \
    && pass "json: ${f#$ROOT/}" || fail "invalid JSON: ${f#$ROOT/}"
done

# ── 2. Skill frontmatter: opens with ---, name matches dir, has description ──
while IFS= read -r f; do
  dir="$(basename "$(dirname "$f")")"
  head -1 "$f" | grep -q '^---$' || fail "no frontmatter: ${f#$ROOT/}"
  name="$(sed -n '2,10p' "$f" | grep -m1 '^name:' | sed 's/name:[[:space:]]*//')"
  [ "$name" = "$dir" ] || fail "name/dir mismatch: ${f#$ROOT/} (name=$name)"
  sed -n '2,10p' "$f" | grep -q '^description:' || fail "no description: ${f#$ROOT/}"
done < <(find "$ROOT"/harness-core/skills "$ROOT"/role-*/skills -name SKILL.md -maxdepth 2 2>/dev/null)
pass "frontmatter sweep complete"

# ── 3. Name collisions across core + role packs ─────────────────────────
DUPES="$(for d in "$ROOT"/harness-core/skills "$ROOT"/role-*/skills; do ls "$d" 2>/dev/null; done | sort | uniq -d)"
[ -z "$DUPES" ] && pass "no cross-pack name collisions" || fail "collisions: $DUPES"

# ── 4. Dangling references to retired skills ────────────────────────────
# Retired = archived 2026-08-13 and NOT restored. Update this list if more
# skills are restored from .claude/skills-legacy-2026-08-13.tar.gz.
RETIRED='add-shadcn-component|api-spec|bootstrap-app|challenge|checkpoint-recovery|debugging-protocol|design-flow|design-options|design-references|flow-map|kickoff|new-site-component|prd-to-ui|responsive-implementation|safe-refactor'
HITS="$(grep -rEl "\`($RETIRED)\`" "$ROOT"/harness-core/skills/*/SKILL.md "$ROOT"/role-*/skills/*/SKILL.md 2>/dev/null)"
[ -z "$HITS" ] && pass "no dangling retired-skill refs in harness" || fail "dangling refs in: $HITS"

# ── 5. Template completeness: everything DESIGN.md's read-order names ───
T="$ROOT/harness-core/skills/scaffold-project/templates"
for f in docs/project.md docs/prd.md docs/design-system.md docs/ux-principles.md \
         docs/trust-scaffolding.md docs/user-flows.md docs/tech.md docs/content-guidelines.md \
         design/tokens.json design/tokens.md design/components.md design/patterns.md \
         design/accessibility.md design/taste-rules.md design/recipes.md design/templates.md \
         AGENTS.md CLAUDE.md DESIGN.md .github/workflows/gates.yml; do
  [ -e "$T/$f" ] || fail "template missing: $f"
done
pass "template read-order files present"

# ── 6. Guard hooks execute correctly (uses harness-core/scripts copies) ──
TMP="$(mktemp -d)"
cat > "$TMP/violate.tsx" <<'EOF'
export const X = () => <div style={{color: "#ff0000"}} className="p-[13px]">x</div>
EOF
OUT="$(echo "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$TMP/violate.tsx\"}}" | node "$ROOT/harness-core/scripts/design-system-guard.js" 2>/dev/null)"
echo "$OUT" | grep -q "violation" && pass "design-system-guard flags violations" || fail "design-system-guard silent on violations"
OUT="$(echo '{"tool_name":"Edit","tool_input":{"file_path":"/some/project/design/tokens.json"}}' | node "$ROOT/harness-core/scripts/protected-files-guard.js" 2>/dev/null)"
echo "$OUT" | grep -q '"ask"' && pass "protected-files-guard asks on tokens.json" || fail "protected-files-guard did not ask"
OUT="$(echo '{"tool_name":"Edit","tool_input":{"file_path":"/some/project/app/page.tsx"}}' | node "$ROOT/harness-core/scripts/protected-files-guard.js" 2>/dev/null)"
[ -z "$OUT" ] && pass "protected-files-guard passes free files" || fail "protected-files-guard blocked a free file"
rm -rf "$TMP"

# pipeline-status: template stubs must read as an un-started pipeline; a filled
# insights row must advance the suggestion; a non-harness dir must stay silent.
TPL="$ROOT/harness-core/skills/scaffold-project/templates"
OUT="$(cd "$TPL" && node "$ROOT/harness-core/scripts/pipeline-status.js" 2>/dev/null)"
echo "$OUT" | grep -q "gather raw research" && pass "pipeline-status: stubs read as phase 0" || fail "pipeline-status misread template stubs: $OUT"
TMP="$(mktemp -d)"; mkdir -p "$TMP/docs/research/raw"; cp -r "$TPL/docs/." "$TMP/docs/"; touch "$TMP/DESIGN.md"
echo quotes > "$TMP/docs/research/raw/q.md"
echo '| INS-001 | pattern | "q" — raw/q.md | x | High | Active |' >> "$TMP/docs/research/insights.md"
OUT="$(cd "$TMP" && node "$ROOT/harness-core/scripts/pipeline-status.js" 2>/dev/null)"
echo "$OUT" | grep -q "problem-loop" && pass "pipeline-status: advances on filled artifacts" || fail "pipeline-status did not advance: $OUT"
rm -rf "$TMP"
TMP="$(mktemp -d)"
OUT="$(cd "$TMP" && node "$ROOT/harness-core/scripts/pipeline-status.js" 2>/dev/null)"
[ -z "$OUT" ] && pass "pipeline-status: silent outside harness projects" || fail "pipeline-status noisy in non-harness dir"
rm -rf "$TMP"

# pipeline-status statusline + verdict inbox + template-copy identity
diff -q "$ROOT/harness-core/scripts/pipeline-status.js" "$TPL/scripts/pipeline-status.js" >/dev/null 2>&1 \
  && pass "pipeline-status: template copy identical to plugin script" || fail "pipeline-status template copy drifted from plugin script"
TMP="$(mktemp -d)"; mkdir -p "$TMP/docs/research/raw"; cp -r "$TPL/docs/." "$TMP/docs/"; touch "$TMP/DESIGN.md"
echo quotes > "$TMP/docs/research/raw/q.md"
echo '| INS-001 | pattern | "q" — raw/q.md | x | High | Active |' >> "$TMP/docs/research/insights.md"
OUT="$(cd "$TMP" && echo '{}' | node "$ROOT/harness-core/scripts/pipeline-status.js" --statusline 2>/dev/null)"
echo "$OUT" | grep -q "next: /problem-loop" && pass "pipeline-status: statusline renders next step" || fail "statusline wrong: $OUT"
echo 'Verdict: PENDING — test' >> "$TMP/docs/research/insights.md"
OUT="$(cd "$TMP" && echo '{}' | node "$ROOT/harness-core/scripts/pipeline-status.js" --statusline 2>/dev/null)"
echo "$OUT" | grep -q "verdict: insight-loop" && pass "pipeline-status: statusline surfaces pending verdict" || fail "verdict inbox missed PENDING: $OUT"
OUT="$(cd "$TMP" && node "$ROOT/harness-core/scripts/pipeline-status.js" 2>/dev/null)"
echo "$OUT" | grep -q "VERDICT NEEDED" && pass "pipeline-status: session output surfaces pending verdict" || fail "session output missed PENDING"
rm -rf "$TMP"

# ── 7. Workshop/project drift (optional arg): skill copies match core ────
if [ -n "$WORKSHOP" ] && [ -d "$WORKSHOP/.claude/skills" ]; then
  for d in "$WORKSHOP"/.claude/skills/*/; do
    s="$(basename "$d")"
    src="$ROOT/harness-core/skills/$s/SKILL.md"
    [ -e "$src" ] || continue  # project-local skill, no core twin
    diff -q "$src" "$d/SKILL.md" > /dev/null 2>&1 \
      && pass "in sync: $s" || fail "DRIFT vs harness-core: $s (re-sync from core)"
  done
fi

echo
[ $FAILURES -eq 0 ] && echo "ALL GREEN ($(date +%F))" || echo "$FAILURES FAILURE(S) — fix before shipping"
exit $FAILURES
