---
name: setup-kanban
description: Creates or reuses the GitHub Projects kanban board for the current repo, idempotently — verifies gh auth and the 'project' token scope, creates the project and the standard label set, and configures the five board columns. Use once per project before /write-tickets or when the board/labels are missing or broken. Triggers on "set up the kanban", "create the project board", "set up GitHub Projects", "make a kanban board", "prepare the board for tickets", "initialize the ticket board".
---

# Setup Kanban

Create the GitHub Projects (v2) board and label set for this repo. Idempotent: safe to re-run. Never delete or rename any existing project, column, or label — only create what is missing.

UPPERCASE tokens in the commands below (`OWNER`, `REPO_NAME`, `NUMBER`, `STATUS_FIELD_ID`, `NAME`/`HEX`/`DESC`) are placeholders — substitute the real values captured in earlier steps before running; never run them literally.

## Step 1 — Preconditions (STOP conditions live here)

Run each check; do not proceed past a failure.

```bash
gh auth status
```

- If not logged in → STOP. Tell the user to run `gh auth login` themselves (interactive).
- Read the `Token scopes:` line of the output. If there is NO `Token scopes:` line at all (fine-grained PAT or a token from an env var — scopes aren't listed), treat it the same as a missing scope: STOP with the message below.
- If the scopes do NOT include `project` (note: `read:project` alone is NOT enough — creating a board needs the full `project` scope) → STOP and tell the user, verbatim:
  > Your gh token is missing the `project` scope. Run this yourself (it opens an interactive login I can't complete): `gh auth refresh -s project --hostname github.com` — then re-run /setup-kanban.

```bash
gh repo view --json nameWithOwner --jq .nameWithOwner
```

- If this fails, you are not in a GitHub-connected repo → STOP and ask the user which repo to use.
- Save the result as `OWNER/REPO`. The part after the `/` is `REPO_NAME` — the project title. The part before the `/` is `OWNER` — use it as `--owner` in every project command below. This matters: a project can only be linked to a repo with the same owner, so for an org-owned repo the project must be created under the org, not under `@me`. Never hardcode a project name, owner, or repo; they always come from this command.

## Step 2 — Check for an existing project (do not duplicate)

```bash
gh project list --owner OWNER --limit 500 --format json --jq '.projects[] | {number, title, url}'
```

(`--limit 500` matters: the default is 30, and a missed match here would create a duplicate project.)

- If this errors with a permissions/scopes message, the token can't see projects for this owner → go back to the Step 1 STOP message (`gh auth refresh -s project`).

- If a project's `title` matches `REPO_NAME` (case-insensitive) → reuse it. Note its `number` and `url`, skip Step 3, and in Step 5 do NOT rewrite the Status field (see the warning there).
- If none matches → continue to Step 3.

## Step 3 — Create the project

```bash
gh project create --owner OWNER --title "REPO_NAME" --format json
```

Capture `number` and `url` from the JSON output.

## Step 4 — Link the project to the repo

```bash
gh project link NUMBER --owner OWNER --repo OWNER/REPO
```

If it errors with "already linked", that is fine — continue.

## Step 5 — Configure the board columns

Target columns, in order: **Backlog / Ready / In progress / In review / Done**. New projects ship with Todo / In Progress / Done, so a fresh project always needs this step.

**If you are reusing an existing project (Step 2 match): do NOT run the mutation below** — it replaces ALL Status options and would orphan items already assigned to a status. Instead, list current options (`gh project field-list NUMBER --owner OWNER --format json`), report which target columns are missing, and give the user the manual UI path below to add only the missing ones.

**For a freshly created project**, get the Status field id, then replace its options:

```bash
gh project field-list NUMBER --owner OWNER --format json \
  --jq '.fields[] | select(.name=="Status") | .id'
```

```bash
gh api graphql -f query='
mutation {
  updateProjectV2Field(input: {
    fieldId: "STATUS_FIELD_ID"
    singleSelectOptions: [
      {name: "Backlog",     color: GRAY,   description: "Not yet ready for work"},
      {name: "Ready",       color: BLUE,   description: "Unblocked, can be picked up"},
      {name: "In progress", color: YELLOW, description: "Being worked on"},
      {name: "In review",   color: PURPLE, description: "PR open, awaiting review"},
      {name: "Done",        color: GREEN,  description: "Shipped and verified"}
    ]
  }) { projectV2Field { ... on ProjectV2SingleSelectField { name options { name } } } }
}'
```

**If the CLI/API path fails** (scope error, schema change, anything), column setup is manual in the GitHub UI. Tell the user exactly this:
1. Open the project URL in a browser.
2. Click the **⋯** menu (top right) → **Settings**.
3. Under **Fields**, click **Status**.
4. Use **+ Add option** to add any missing column names; drag to reorder to Backlog / Ready / In progress / In review / Done; edit the default "Todo" to "Backlog" rather than deleting it if items exist. Click **Save options**.

Do not proceed to "done" claiming columns exist without evidence: re-run `gh project field-list NUMBER --owner OWNER --format json` and confirm the five option names appear, or state clearly that manual UI setup is pending on the user.

## Step 6 — Create the label set

The single source of truth for the label table (names, colors, descriptions) is the **write-tickets** skill: read `.claude/skills/write-tickets/SKILL.md` and use its table exactly — do not invent labels or colors here.

Create each label with `--force` so re-runs update rather than fail (this never deletes labels):

```bash
gh label create "NAME" --color "HEX" --description "DESC" --force --repo OWNER/REPO
```

Then verify:

```bash
gh label list --repo OWNER/REPO
```

Compare against the write-tickets table and record which labels were newly created vs already existed.

## Step 7 — Report (required output)

Output exactly these facts, with evidence — no vague "all set":

- **Project:** URL + whether it was created or reused (number included).
- **Columns:** the five names confirmed via `field-list`, or "manual UI step pending" with the click path.
- **Labels:** list created vs already-existing, per Step 6 verification.
- **Next step:** suggest `/write-tickets <feature>` to populate the board.

## Guardrails

- Never delete or rename existing projects, columns, or labels. Additive only.
- Never guess scopes or auth state — read the actual `gh auth status` output.
- No hardcoded project names, owners, or repos — everything derives from `gh repo view` in Step 1.
- This skill touches GitHub only; it must not modify repo files (and never `design/tokens.json` or `CLAUDE.md`, which are protected).
- Stuck after 2 attempts on any step → follow `escalation-protocol`: stop, report findings, ask.
