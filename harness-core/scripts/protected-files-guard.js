#!/usr/bin/env node

/**
 * PreToolUse hook: Protected Files Guard
 * Forces a user-confirmation dialog (permissionDecision: "ask") before any
 * Write/Edit to files that define the project's source of truth — even when
 * the session is running in auto-accept mode. This is the hard enforcement
 * behind CLAUDE.md's "stop and ask me before changing design system tokens".
 */

const fs = require("fs");

const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));

const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const PROTECTED = [
  { suffix: "design/tokens.json", reason: "design/tokens.json is the design-token source of truth — changing a value silently restyles every component that uses it." },
  { suffix: "CLAUDE.md", reason: "CLAUDE.md defines the house rules for every future session." },
  { suffix: ".claude/settings.json", reason: ".claude/settings.json controls hooks and safeguards." },
];

const hit = PROTECTED.find((p) => filePath.endsWith(p.suffix));

if (hit) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `Protected file: ${hit.reason} Confirm this edit?`,
      },
    })
  );
}
process.exit(0);
