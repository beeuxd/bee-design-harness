# Raw Research — Drop Zone

Put unprocessed research material here: interview transcripts, usability-session notes, survey exports, support-ticket dumps, field observations. One file per source.

## Naming

`<YYYY-MM-DD>-<method>-<participant-or-source>.md` — e.g. `2026-08-13-interview-p03.md`, `2026-08-13-survey-nps-export.md`

Each file starts with a two-line header:

```markdown
Method: interview | survey | usability test | support tickets | field observation
Context: who, when, how recruited, any caveats (incentivized, internal user, etc.)
```

## Rules

- **Verbatim in, verbatim out.** Never clean up quotes, summarize on ingest, or delete "irrelevant" passages — the `insight-loop` skill decides relevance with traceability, not this folder.
- Anonymize names/PII before committing. Participant IDs (`p01`, `p02`…) instead of names.
- If this folder contains sensitive data that must not be committed, add it to `.gitignore` and note here where the originals live.
- Files here are the ground truth the entire traceability chain hangs from (`quote → INS → PROB → FEAT → screen region → token`). Nothing downstream may cite evidence that isn't in this folder or explicitly marked `unvalidated`.

Processed by: `/insight-loop` → writes `docs/research/insights.md`.
