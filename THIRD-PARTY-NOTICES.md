# Third-party notices

Some skills in the role packs are imported (and in places adapted — see `logs/CURATION.md` for
the adaptation record) from third-party open-source skill collections. Each imported skill
declares its origin in its SKILL.md frontmatter (`source:` + `license:`). This file aggregates
the upstream copyright notices. Everything not listed here — harness-core, the agents, hooks,
templates, DESIGN.md, and all unattributed skills — is original work under the repo's LICENSE.

| Upstream | Copyright | License | Skills |
|---|---|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | © 2025 Corey Haines | MIT | role-marketer (24: ab-testing … social-content), role-copywriter: copywriting, copy-editing |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | © 2026 GreenSock | MIT | role-engineer: gsap-core, gsap-react, gsap-scrolltrigger, gsap-timeline, gsap-plugins, gsap-performance, gsap-utils |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | © Vercel, Inc. (see upstream) | MIT | role-engineer: vercel-react-best-practices, vercel-composition-patterns, vercel-react-view-transitions, web-design-guidelines |
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | © 2026 Jakub Krehel | MIT | role-engineer: better-ui, better-typography, better-colors, better-accessibility, better-layout |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | © 2026 Emil Kowalski | MIT | role-designer: animate, review-animations, improve-animations, find-animation-opportunities, animation-vocabulary, apple-design |
| [mattpocock/skills](https://github.com/mattpocock/skills) | © 2026 Matt Pocock | MIT | role-pm: grilling, wayfinder, triage, to-prd, to-issues |
| [stripe/ai](https://github.com/stripe/ai) | © 2024–2025 Stripe | MIT | role-founder: stripe-best-practices |
| [anthropics/skills](https://github.com/anthropics/skills) | © Anthropic, PBC | Apache-2.0 | role-pm: doc-co-authoring, role-copywriter: internal-comms |

Not bundled, by design: Firecrawl's official skill (AGPL-3.0) — the `firecrawl` skill in role-pm
is an original pointer that installs the official distribution. Anthropic's document skills
(`pdf`, `docx`) were removed 2026-08-24; their license prohibits redistribution.

## MIT License (applies to each MIT-listed upstream, with its copyright line above)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Apache License 2.0 (anthropics/skills example skills)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files
except in compliance with the License. You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable law or agreed to in
writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
