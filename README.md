# agent-friendly-action

GitHub Action that checks AI agent readiness on every pull request: it comments with how the PR changes the repo's [Agent Friendly Code](https://agentfriendlycode.com) score — _"this PR drops your Claude Code score by 4.1 points because it removed CI config."_

## What it does

On every pull request, the action:

1. Scores the PR head (the checked-out tree) and the base commit (in a temporary `git worktree`) with the bundled scorer.
2. Posts one comment with the overall and per-agent change and the checks that moved, and edits that same comment on later pushes.

It reads files only — nothing from the PR is executed — and calls no server besides the GitHub API. The [checks](https://agentfriendlycode.com/check) and [per-agent weights](https://agentfriendlycode.com/methodology) are the same as on the website.

## Install

Walkthrough and FAQ: <https://agentfriendlycode.com/action>.

```yaml
# .github/workflows/agent-friendly.yml
name: Agent-friendly score diff

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  score-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: hsnice16/agent-friendly-action@v0
        with:
          agents-badge-token: ${{ secrets.AGENTS_BADGE_TOKEN }}
```

`AGENTS_BADGE_TOKEN` is an **opt-in marker**, not a credential: set it to any non-empty value in the repo's secrets to enable the comment. Unset, the action exits silently — which is also what happens on fork PRs, where secrets aren't passed. `fetch-depth: 0` keeps the base commit local; without it the action fetches it from `origin`.

Use the `pull_request` trigger. The action also accepts `pull_request_target`, but that runs with a write token on fork PRs; it is safe only because the action never executes PR code, so don't add steps that do.

## Inputs

| Input                | Required | Default               | Description                                                              |
| -------------------- | -------- | --------------------- | ------------------------------------------------------------------------ |
| `agents-badge-token` | yes      | —                     | Opt-in marker. The action exits silently when empty.                     |
| `github-token`       | no       | `${{ github.token }}` | Posts and edits the comment. A GitHub App installation token or a PAT also works. |
| `base-ref`           | no       | the PR's base commit  | A branch, tag, SHA or revision such as `HEAD~1` to compare against instead. |

## Why opt-in?

A template or starter repo can ship this workflow without it commenting on every copy; only repos that set the secret get the comment.

## Self-contained

The scorer is vendored from [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) and bundled into `dist/`, so the action keeps working if the website is down.

## Related

- [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) — the website and the canonical scorer.
- [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) — the same scorer in your editor; scores the local repo and recommends a model class. Install: `npx skills add hsnice16/agent-friendly-skill#v0`. Details: <https://agentfriendlycode.com/skill>.

## Changelog

[`CHANGELOG.md`](./CHANGELOG.md).

## Sponsor

[github.com/sponsors/hsnice16](https://github.com/sponsors/hsnice16).

## License

[MIT](./LICENSE)
