# Logs — curation record and repair trails

Process history, not product. Nothing here is read by skills at runtime; everything here
exists so decisions stay auditable instead of evaporating.

| File | What it records |
|---|---|
| `CURATION.md` | The master verdict of the 2026-08-13 rebuild — which of 125 audited skills were kept, cut, merged, and why, per role pack. **Read this first for the license audit** before the repo goes public: it names every third-party source. |
| `repairs-core.md` | harness-core's running log — legacy-skill restorations, dangling-reference fixes, doctrine changes, test-suite findings. Appended to after every structural change. |
| `repairs-designer.md` | role-designer pack build log (imports, merges, patches). |
| `repairs-eng-pm.md` | role-engineer + role-pm pack build log. |
| `repairs-cmf.md` | role-copywriter + role-marketer + role-founder pack build log. |

House rule: any skill restoration or reference repair gets an entry in the matching log
AND updates the RETIRED list in `../test-harness.sh` when a skill comes back from the
legacy archive.
