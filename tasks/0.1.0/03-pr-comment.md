# 03 · PR comment

**Status**: done

## Goal

Score the PR's head and base trees, render a readable score-delta into a single Markdown comment, and edit-not-duplicate on subsequent runs of the same PR.

## Scoring head + base

`actions/checkout` already populated the working directory with the PR's merge ref (or head SHA, depending on how the maintainer configures it). That's what gets scored as **head**.

For **base**, the action creates a temporary `git worktree` pointing at `pull_request.base.sha`:

```text
mkdtempSync('/tmp/agent-friendly-base-XXXXXX')
git worktree add --detach <tmp> <baseSha>
scoreRepo(<tmp>)
git worktree remove --force <tmp>
```

If `git worktree add` fails (the base SHA isn't reachable, e.g. `fetch-depth: 1` checkouts), the action falls back to `git fetch --depth=1 --no-tags origin <baseSha>` and retries. This makes the action robust to a wider range of `actions/checkout` configurations.

## Comment body

Single Markdown blob with:

1. **HTML-comment marker** — `<!-- agent-friendly-action -->` — used as the lookup key on subsequent runs.
2. **Overall delta** — `base.overall → head.overall (±X.Y)` formatted with bold for non-zero deltas, neutral `±0.0` for zero.
3. **Per-model table** — Markdown table of base / head / delta for every model present on either side. Models that exist only on one side are shown as a 0 baseline.
4. **Changed signals** — bulleted list, sorted by absolute delta. If nothing changed: a single `_No signals changed between base and head._` line.
5. **Footer** — link back to this repo for attribution.

## Upsert pattern

```text
listComments(issue_number=PR#)
  → find first comment whose body contains COMMENT_MARKER
    → updateComment(id=…, body=newBody)
  → else
    → createComment(issue_number=PR#, body=newBody)
```

`paginate` is used so the lookup works on PRs with >100 comments. The action holds one comment per PR — re-runs on new commits replace the body in place rather than stacking.

## Acceptance

- A PR with no scorer-relevant changes produces a comment with `±0.0` overall and the "no signals changed" line.
- A PR that removes `.github/workflows/` produces a comment showing `ci` as a changed signal with a negative delta.
- Re-running the action on the same PR updates the existing comment (not a new one).
- Comment is readable inline — no images, no JS, no link-out for the headline numbers.
