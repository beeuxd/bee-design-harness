#!/usr/bin/env node

/**
 * PostToolUse hook: Design System Guard
 * Runs after every Write/Edit on component files and reports design-system
 * violations back to Claude via hookSpecificOutput.additionalContext, so the
 * model sees them on its next turn and fixes them immediately.
 *
 * Catches:
 *   - hardcoded hex colors (should be semantic tokens)
 *   - arbitrary pixel values in Tailwind classes (should be the spacing scale)
 *   - inline style={{ color/background }} literals
 */

const fs = require("fs");
const path = require("path");

const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));

const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const ext = path.extname(filePath);
const skipPaths = ["tokens", "globals.css", "tailwind", "node_modules", ".claude", ".next", "e2e"];

if (skipPaths.some((p) => filePath.includes(p))) process.exit(0);
if (![".tsx", ".jsx", ".ts"].includes(ext)) process.exit(0);

let content;
try {
  content = fs.readFileSync(filePath, "utf8");
} catch {
  process.exit(0);
}

const lines = content.split("\n");
const violations = [];

lines.forEach((line, i) => {
  const lineNum = i + 1;
  const trimmed = line.trim();

  // Skip comments and imports
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("import")) return;

  // Hardcoded hex colors (3, 4, 6, or 8 char hex)
  const hexMatch = line.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hexMatch) {
    hexMatch.forEach((hex) => {
      // Skip pure-numeric short "hex" that is usually an id/anchor, not a color
      if (hex.length <= 4 && /^#[0-9]+$/.test(hex)) return;
      violations.push(
        `line ${lineNum}: hardcoded color ${hex} — use a semantic token from design/tokens.json (e.g. bg-primary, text-muted-foreground)`
      );
    });
  }

  // Arbitrary pixel values in Tailwind classes, e.g. p-[13px]
  const arbitraryMatch = line.match(/\[(\d+)px\]/g);
  if (arbitraryMatch) {
    const tailwindMap = {
      4: "1", 8: "2", 12: "3", 16: "4", 20: "5", 24: "6",
      28: "7", 32: "8", 36: "9", 40: "10", 44: "11", 48: "12", 64: "16", 128: "32",
    };
    arbitraryMatch.forEach((match) => {
      const px = parseInt(match.match(/\d+/)[0], 10);
      const hint = tailwindMap[px]
        ? `use Tailwind scale value ${tailwindMap[px]} (= ${px}px)`
        : `use the nearest Tailwind scale value instead of ${px}px`;
      violations.push(`line ${lineNum}: arbitrary spacing ${match} — ${hint}`);
    });
  }

  // Inline style color/background literals
  if (/style=\{\{[^}]*(color|background)\s*:/i.test(line)) {
    violations.push(
      `line ${lineNum}: inline style sets color/background — move to a Tailwind class backed by a semantic token`
    );
  }
});

if (violations.length > 0) {
  const fileName = path.basename(filePath);
  const message =
    `Design System Guard: ${violations.length} violation(s) in ${fileName} (${filePath}). ` +
    `Fix these now — token-only styling is a non-negotiable (see CLAUDE.md):\n` +
    violations.map((v) => `  - ${v}`).join("\n");

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message,
      },
    })
  );
}
process.exit(0);
