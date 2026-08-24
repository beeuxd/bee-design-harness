---
name: firecrawl
description: Web research engine for the discovery loops — search the web, scrape pages, crawl docs sites, and pull real user quotes from forums/reviews via Firecrawl. Use when research needs live web content: "search the web for", "scrape this page", "pull the content from", "crawl these docs", "mine Reddit/G2 for quotes", or any URL the user wants fetched at scale. Not for local files, git, or code edits.
allowed-tools:
  - Bash(firecrawl *)
  - Bash(npx firecrawl *)
---

# Firecrawl — web research engine (pointer skill)

The harness does not bundle Firecrawl's own skill (it is AGPL-3.0-licensed; we keep this repo's
licensing simple by pointing at the official distribution instead of redistributing it).

## Setup (once per machine)

Check availability first: `firecrawl --version` or `npx -y firecrawl --version`.

If missing, install the official plugin or CLI — both are maintained by the Firecrawl team:

- Plugin: `claude plugin marketplace add firecrawl/firecrawl-claude-plugin`, then install it —
  ships the full official skill with current flags and auth guidance.
- CLI only: `npm i -g firecrawl` (or use `npx firecrawl`). Needs `FIRECRAWL_API_KEY` in the
  environment — if absent, ask the user for their key from firecrawl.dev; never hardcode it.

If the official plugin is installed, defer to its skill — it is the source of truth for usage.

## Fallback usage (CLI present, official skill absent)

- Search: `firecrawl search "<query>"` — returns results with page content.
- Scrape one page: `firecrawl scrape <url>` — markdown of the page.
- Crawl a site/docs: `firecrawl crawl <url> --limit <n>` — start small (≤ 25 pages), widen only
  if the loop's evidence demands it.
- Consult `firecrawl --help` for current flags rather than guessing.

## House rules

- This is the harness's one scraping stack (per CURATION: `just-scrape` was cut to avoid a second).
- Quotes harvested for `insight-loop` keep their source URL — the traceability chain starts at the
  quote, so a quote without provenance is inadmissible as evidence.
- Respect robots.txt and site terms; don't crawl behind logins without the user's say-so.
