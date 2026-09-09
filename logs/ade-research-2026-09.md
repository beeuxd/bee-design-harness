# ADE research — patterns to apply to the harness (researched 2026-09-03→09)

Deep-research run: 25 sources fetched, 125 claims extracted, 25 adversarially verified (3-vote panels), 21 confirmed / 4 refuted, synthesized to 14 findings. 107 agents.

## Verdict

The ADE category was named and defined by Warp in June 2025 as an environment built primarily for prompting, multi-threading, agent management, and human-agent collaboration rather than hand-editing code; its defining interface patterns — verified across Warp, GitHub Copilot's coding agent, Amp's Neo CLI, and the OpenDev research system — are (1) fleet/status surfaces with completion and needs-attention notifications, (2) isolated background execution producing an artifact trail (draft PRs, session logs, reasoning-annotated descriptions), (3) structured plan artifacts gated by explicit human approval, and (4) layered, persistent approval systems designed to prevent approval fatigue. The verified failure evidence is consistent and stark: human review capacity, not agent throughput, is the binding constraint (Willison, Ronacher, and the METR RCT where experienced developers were 19% slower with AI while believing they were 20% faster), and the 2025 Stack Overflow survey shows usage rising to 84% while distrust rose to 46%. For a terminal-based design harness, the strongest proven, transferable patterns are: terminal-first remains a fully supported ADE modality (Warp's terminal-only mode; Amp's Neo CLI with web remote-control), structured fixed-schema plan/evidence artifacts make gates reviewable (OpenDev, Copilot session logs), fleet-status dashboards with needs-attention states map directly onto the harness statusline, and approval persistence across sessions is the documented antidote to gate fatigue. The category's own data argues the harness's existing hard gates and director-verdict loops address the field's biggest verified failure mode — unreviewed slop and unreliable self-assessed trust.

## Confirmed findings

### Warp coined and defined the 'Agentic Development Environment' category with its June 2025 Warp 2.0 launch: an …

- **Confidence:** high (3-0 (both merged claims))
- **Sources:** https://time.com/collections/best-inventions-2025/7318249/warp-agentic-development-environment/, https://www.warp.dev/blog/reimagining-coding-agentic-development-environment
- **Evidence & harness mapping:** TIME (independent editorial): ADE 'launched in June' and 'allows software engineers to task AI agents with developing their code, then intervene when they notice errors.' Warp's launch post: 'primarily designed for prompting, multi-threading, agent management, and human-agent collaboration across real-world codebases and infrastructure.' Third parties (SD Times, Turing Post, competitor Augment Code) independently adopted the term; later entrants (Google Antigravity, Nov 2025) postdate it. Merges two unanimous claims (11, 19).

### Warp 2.0 ships the canonical agent fleet-management surface: a management UI showing the status of all running…

- **Confidence:** high (3-0)
- **Sources:** https://www.warp.dev/blog/reimagining-coding-agentic-development-environment, https://docs.warp.dev/agents/using-agents/managing-agents
- **Evidence & harness mapping:** Launch post verbatim: 'see the status of all your running agents as well as in-app and system notifications when a running agent completes or needs your help'; confirmed shipped (not announcement-only) via live product docs. Harness mapping: the file-derived statusline can adopt the proven state vocabulary (in-progress / completed / requires-attention / error) per loop or worktree, plus terminal-bell or system notifications on 'needs director verdict' — the exact needs-attention pattern users already understand.

### Terminal-first remains a fully supported ADE modality: Warp's open-sourced ADE offers customizable interface m…

- **Confidence:** high (3-0)
- **Sources:** https://www.warp.dev/newsroom/2026/4/28/warp-open-sources-its-agentic-development-environment
- **Evidence & harness mapping:** Press release: 'A flexible UI that can be configured from a pure terminal experience to a minimal agent setup with diff view and file tree or a full-featured ADE' and 'a new settings system that allows both users and agents to configure Warp programmatically.' Corroborated by The New Stack, Help Net Security. Harness mapping: directly validates a Claude Code CLI harness as a legitimate ADE surface; the agent-editable programmatic settings pattern maps to the harness's settings.json/hooks (with the protected-files-guard preserving the human gate Warp lacks).

### Warp open-sourced its core product on April 28, 2026 and introduced Oz, a cloud agent orchestration platform, …

- **Confidence:** high (3-0 (both merged claims))
- **Sources:** https://www.warp.dev/newsroom/2026/4/28/warp-open-sources-its-agentic-development-environment, https://www.helpnetsecurity.com/2026/04/30/warp-open-source-client/, https://github.com/warpdotdev/warp
- **Evidence & harness mapping:** Press release: 'Oz manages the lifecycle by triaging issues, asking clarifying questions, generating implementation plans, writing code, and opening pull requests, all in the open... with session links, reviews, and progress visible to anyone.' Verified live repo (MIT/AGPL dual license) and independent press. Harness mapping: publish-the-session-link as a trust artifact is a cheap addition to harness evidence bundles — every gate verdict can reference the transcript/worktree that produced it. Merges claims 0 and 2. Note: the client is open source; Oz itself is hosted.

### GitHub Copilot's coding agent established the isolated background-execution pattern: it runs in a GitHub Actio…

- **Confidence:** high (3-0)
- **Sources:** https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/, https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent
- **Evidence & harness mapping:** Announcement verbatim: 'It boots a virtual machine, clones the repository, configures the environment, and analyzes the codebase'; work starts 'in the background.' Confirmed current via GitHub docs ('Copilot cloud agent') and independent press (The Register). Harness mapping: the harness's parallel-worktree builds are the local analog; the transferable piece is the pre-work orientation step (environment + codebase analysis before acting), which the harness already encodes as session-start — commercial ADEs validate making it mandatory.

### The proven review/diff-queue + evidence-artifact pattern: Copilot's agent pushes commits regularly to a draft …

- **Confidence:** high (3-0)
- **Sources:** https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/, https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/use-cloud-agent-on-github
- **Evidence & harness mapping:** Verbatim: work is pushed 'to a draft pull request as git commits'; 'you'll see the agent's reasoning and validation steps in the session logs, making it easy to trace decisions'; 'Once Copilot is done, it'll tag you for review.' Behavior confirmed in current 2026 docs. Harness mapping: this is the strongest commercial validation of the harness's evidence-bundle philosophy — draft-state output + reasoning artifact + explicit review handoff. A design analog: hifi-gate and loops could emit a standing 'director review queue' file (draft artifacts + reasoning + screenshots) instead of inline chat, so verdicts batch like PR reviews.

### The trust gap is the category's defining tension (2025 Stack Overflow survey, 49,000+ respondents): AI tool us…

- **Confidence:** high (3-0 (both merged claims))
- **Sources:** https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/, https://survey.stackoverflow.co/2025
- **Evidence & harness mapping:** Press release verbatim: '84% saying they use or plan to use AI tools... up from 76%'; '46% of developers said they don't trust the accuracy... a significant increase from 31% last year'; 'A key frustration from 45% of respondents was that debugging AI-generated code is time-consuming.' Distrust (46%) now exceeds trust (33%). Corroborated by InfoWorld, ADTmag. Merges claims 5 and 6. Harness mapping: usage-up/trust-down is the market argument for hard gates the agent cannot bypass — the harness's differentiator addresses the field's measured pain, not a hypothetical one.

### Agent adoption was still a minority position in mid-2025: only 31% of developers used AI agents, 17% planned t…

- **Confidence:** high (3-0)
- **Sources:** https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/
- **Evidence & harness mapping:** Verbatim: 'only 31% using them currently, 17% planning to, and 38% of respondents not planning to use AI agents'; among users, '69% agree they have experienced an increase in productivity.' Nuance: agent users reported much weaker effects on collaboration (17%) and code quality (36%) — productivity gains without quality confidence, again pointing at verification as the gap.

### Human review capacity — not agent throughput — is the binding constraint on parallel agent execution: practiti…

- **Confidence:** high (3-0 (both merged claims))
- **Sources:** https://blog.pragmaticengineer.com/new-trend-programming-by-kicking-off-parallel-ai-agents/, https://simonwillison.net/2025/Oct/5/parallel-coding-agents/, https://lucumr.pocoo.org/
- **Evidence & harness mapping:** Willison: 'I can only focus on reviewing and landing one significant change at a time'; Ronacher: 'it's only so much my mind can review!' and (Feb 2026) 'the pull request review clearly turns into the bottleneck.' Verifier corroboration: GitLab survey (85% say the bottleneck shifted from writing to reviewing), PR review time up 91% with AI-heavy usage. Merges claims 12 and 13. Harness mapping: this is the central design constraint for the design-tournament and parallel-worktree workflows — parallelize divergent exploration (cheap to glance-review: screenshots, variants) but serialize significant builds; design output is actually advantaged here because visual review is faster than code review.

### The METR RCT (Feb–June 2025, 16 experienced OSS developers, 246 real issues) found AI tools made developers 19…

- **Confidence:** high (3-0 (all three merged claims))
- **Sources:** https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/, https://arxiv.org/abs/2507.09089, https://www.theregister.com/software/2025/07/11/ai-coding-tools-make-developers-slower-study-finds/1143832
- **Evidence & harness mapping:** Primary study verified: 19% measured slowdown vs. self-belief of 20% speedup; five attributed factors including 'low AI reliability (acceptance rate under 44%)' and implicit repository context. METR's Feb 2026 update leaves the original finding standing. Merges claims 14, 15, 16. Harness mapping: the perception-reality gap is the strongest argument for the harness's evidence-over-vibes rule ('verify-before-done', screenshots, traceability chain) — neither the agent's nor the human's felt sense of progress is trustworthy; only artifacts are. Scope caveat: experienced devs in highly familiar 1M+-line repos, early-2025 tools.

### OpenDev (arXiv 2603.05344, 2026) demonstrates the hard human-approval gate pattern for terminal agents: a read…

- **Confidence:** high (3-0 (both merged claims))
- **Sources:** https://arxiv.org/html/2603.05344v1
- **Evidence & harness mapping:** Paper verbatim: Planner 'writes a structured plan... containing seven sections'; present_plan() 'displays the plan to the user for review. The user has two choices: revise... or approve'; 'Upon approval, the system transitions to Normal Mode.' The gate is enforced at the tool-schema level, not by prompt. Merges claims 8 and 9. Harness mapping: this is the closest published analog to the harness's director-verdict loops; the transferable upgrades are (a) schema-enforced read-only phases via hook/tool restrictions rather than instructions, and (b) a fixed plan schema — the harness's loop kickoffs could standardize on a verdict-ready template including verification criteria and risks so every gate is reviewable in the same shape.

### OpenDev's trust architecture is defense-in-depth via five independent layers (prompt guardrails, schema-level …

- **Confidence:** high (3-0)
- **Sources:** https://arxiv.org/html/2603.05344v1
- **Evidence & harness mapping:** Paper verbatim: five layers where 'failure of any single layer does not compromise the remaining four'; 'Approval persistence prevents fatigue... Without persistence, users must re-approve the same operations every session, causing approval fatigue that leads to blanket auto-approval.' Harness mapping: the harness already has layers (CLAUDE.md rules, hooks, protected-files-guard); the documented gap-closer is persistence and graduated approval levels (manual/semi-auto/auto with pattern rules) for director verdicts — e.g., taste-retro rules acting as persisted 'pre-approvals' so the director is only asked about genuinely new decisions. Caveat: authors' self-description of design intent, not independently measured effectiveness.

### Amp's rebuilt Neo CLI (May 2026) proves the terminal-as-control-surface pattern: a locally started terminal th…

- **Confidence:** high (3-0)
- **Sources:** https://thenewstack.io/amp-neo-cli-agents/, https://ampcode.com/news/neo
- **Evidence & harness mapping:** Amp primary source verbatim: 'you can now remote control it from ampcode.com... live updates but you can also send messages, queue and dequeue them, or cancel what the agent is currently doing.' Independent coverage in The New Stack. Harness mapping: the harness's statusline is a read surface; Neo shows the category moving to read-and-steer — a lightweight web/local page rendered from the same harness state files (plus a message-queue file the loops poll) would let the director issue verdicts away from the terminal without changing the CLI-first architecture. No independent evidence yet on how well it works for users, only that it shipped as described.

### Neo also ships CLI-native transparency/status patterns: a plugin API, a 'compaction-first' architecture for lo…

- **Confidence:** medium (3-0 (verifier evidence graded medium))
- **Sources:** https://thenewstack.io/amp-neo-cli-agents/, https://ampcode.com/news/neo
- **Evidence & harness mapping:** Plugin API and auto-compaction confirmed on Amp's primary announcement; exposed reasoning and in-interface token/cost tracking corroborated only by secondary coverage (uncontradicted). Harness mapping: cost/context surfacing belongs in the harness statusline (loop round count, context pressure, cost per gate) — cheap to derive from files, and directly addresses long-loop sessions where the harness's max-5-round loops live. Confidence medium: announcement-derived, two of four features not verified on the primary source.

## Refuted claims (killed by the verification panel — do NOT rely on these)

- (0-3) Human-approval gates are hard-coded: the agent's pull requests require human approval before any CI/CD workflows run, and the developer who assigned the task is not allowed to approve the resulting PR (separation of duties). — https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/
- (0-3) The agent is sandboxed by policy the agent cannot bypass: it honors existing branch protections and repository rulesets, can only push to branches it created, and has internet access restricted to a trusted allowlist of destinations. — https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/
- (1-2) Warp's core interface/orchestration pattern is a plan-first, human-approval-gate design: the agent surfaces an explicit plan artifact before execution, and the human reviews and edits that plan collaboratively with the agent — directly analogous to the harness's director-verdict gates. — https://time.com/collections/best-inventions-2025/7318249/warp-agentic-development-environment/
- (0-3) The dominant parallel-agent workflow pattern in late 2025 is running several Claude Code or OpenAI Codex instances simultaneously, isolated via multiple checkouts or git worktrees — validating worktree-based parallel builds as a proven orchestration primitive. — https://blog.pragmaticengineer.com/new-trend-programming-by-kicking-off-parallel-ai-agents/

## Caveats

Time sensitivity: this field moves in months — Warp's ADE launched June 2025, was open-sourced April 2026, and Amp's Neo shipped May 2026; findings dated mid-2025 (Stack Overflow, METR) describe early-generation tools and may understate current agent reliability. Source quality: several architecture/feature findings rest on vendor announcements or the OpenDev authors' self-description — they establish that patterns exist and are shipped, not that they succeed with real users; independent usage/retention data exists only for the aggregate category (Stack Overflow, METR, practitioner reports), not per-product. METR's 19%-slowdown result has narrow external validity (n=16, experienced devs in highly familiar large repos, early-2025 tooling) — its robust core is the perception-reality gap, not a universal slowdown law. Four claims were refuted in verification and should NOT be relied on: (1) Copilot's separation-of-duties approval rule and (2) its sandbox/allowlist policy details did not survive checking as stated; (3) Warp being plan-first/approval-gated as its core pattern was rejected 1-2; (4) most importantly for this harness, the claim that git-worktree-isolated parallel agents are the 'dominant, proven' late-2025 workflow was refuted 0-3 — worktree parallelism is practiced by some but is not verified as a proven dominant primitive, so the harness's parallel-worktree workflow should be justified on the review-bottleneck evidence (parallelize only cheap-to-review work), not on category consensus. Coverage gaps: no verified claims survived on Google Antigravity, Cursor 2.x, Devin, Zed, Conductor, or JetBrains agent sessions, so the interface-pattern picture is built from Warp, Copilot, Amp, and OpenDev only. Nothing verified addresses design tooling directly — all applicability mappings to the Bee Design Harness are synthesis-level inference from code-ADE evidence.

## Open questions

- What are the actual fleet-management and artifact patterns in Google Antigravity, Cursor 2.x agent manager, Devin, and Conductor — the sources on these did not survive verification, leaving roughly half the named competitive set unmapped?
- Does approval persistence (OpenDev's anti-fatigue mechanism) measurably prevent blanket auto-approval in real usage, or is it only a plausible design argument — no field data surfaced?
- Is git-worktree-based parallel agent execution actually a widely adopted, retained practice (the claim asserting dominance was refuted 0-3), and if so for which task profiles?
- Does the review bottleneck bind differently for design artifacts than code — is visual review genuinely faster per unit of agent output, which would change how much parallelism a design harness can safely support?