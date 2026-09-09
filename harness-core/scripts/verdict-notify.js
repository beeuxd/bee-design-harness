#!/usr/bin/env node

/**
 * PostToolUse hook: Verdict Notify
 * The Warp needs-attention pattern: when a loop writes "Verdict: PENDING" into a
 * pipeline artifact, fire an OS notification so the director gets pinged instead
 * of noticing. Fires only on the write that ADDS the marker (checks the written
 * content, not the file), so it never re-notifies on unrelated edits.
 * macOS only (osascript); silent elsewhere. HARNESS_NOTIFY_DRYRUN=1 prints instead.
 */

const fs = require("fs");
const { execFileSync } = require("child_process");

const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf8"));
const filePath = input.tool_input?.file_path || "";

const ARTIFACTS = ["insights.md", "problems.md", "feature-tree.md", "wireframes.md"];
if (!ARTIFACTS.some((a) => filePath.endsWith(a))) process.exit(0);

// Only the content this tool call wrote — Write's `content` or Edit's `new_string`.
const written = `${input.tool_input?.content || ""}\n${input.tool_input?.new_string || ""}`;
if (!/Verdict:\s*PENDING/i.test(written)) process.exit(0);

const loop = { "insights.md": "insight-loop", "problems.md": "problem-loop", "feature-tree.md": "ideation-loop", "wireframes.md": "wireframe-loop / hifi-gate" }[
  ARTIFACTS.find((a) => filePath.endsWith(a))
];
const msg = `${loop} is waiting on your verdict`;

if (process.env.HARNESS_NOTIFY_DRYRUN) {
  console.log(`notify: ${msg}`);
  process.exit(0);
}
if (process.platform === "darwin") {
  try {
    execFileSync("osascript", ["-e", `display notification ${JSON.stringify(msg)} with title "Design Harness" sound name "Glass"`], { timeout: 3000 });
  } catch { /* notification is best-effort, never block the session */ }
}
process.exit(0);
