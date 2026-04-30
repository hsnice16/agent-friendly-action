# agent-friendly-action

GitHub Action that posts a per-PR delta of the [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) score — _"this PR drops your Claude Code score by 4.1 points because it removed CI config."_

> **Version**: `v0.1.1` — plans for the initial cut live in [`tasks/0.1.0/`](./tasks/0.1.0/). Pin `@v0` to follow the latest 0.x release; pin a precise tag (`@v0.1.1`) if you want to opt out of automatic minor/patch updates. Tracking task in the parent project: [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md).

## What it does

On every pull request, the action:

1. Reads the PR head and base refs from the GitHub event payload.
2. Fetches the base ref locally (no network clone — `actions/checkout` already gave us the head).
3. Scores both trees with the bundled scorer.
4. Posts (or edits) a single PR comment with the delta + per-signal breakdown.

It runs entirely **inside your CI** — no third-party server is required. The bundled scorer is the only thing that decides the delta; the [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) web app is not contacted at runtime.

## Install

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
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: hsnice16/agent-friendly-action@v0
        with:
          agents-badge-token: ${{ secrets.AGENTS_BADGE_TOKEN }}
```

`AGENTS_BADGE_TOKEN` is the **opt-in marker**, not an API credential. Set it in the repo's secrets to enable the comment; leave it unset and the action exits silently.

## Inputs

| Input                | Required | Default              | Description                                          |
| -------------------- | -------- | -------------------- | ---------------------------------------------------- |
| `agents-badge-token` | yes      | —                    | Opt-in marker. Action no-ops when empty.             |
| `github-token`       | no       | `${{ github.token }}`| Used to post / edit the PR comment.                  |
| `base-ref`           | no       | event base           | Override the base ref (advanced — usually unneeded). |

## Why opt-in?

Two reasons:

1. **Templates / starter repos** can ship the workflow file without it firing for forks or unenrolled users — only repos that explicitly set the secret get the comment.
2. **Future-proofing** — when the upstream web app exposes a runtime weights endpoint (deferred to its `1.0.0/03` benchmark harness), the same env var can be promoted to a real key with no workflow change.

## Self-contained

The scorer is bundled into `dist/` via `@vercel/ncc`. The action does not call the [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) web app at runtime — weights and signal logic ship inside the bundle. If the web app goes offline tomorrow, this action keeps producing PR comments unchanged.

## Want this in your editor too?

The [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) sibling vendors the same scorer for your editor. Profiles the same 8 agents this action does (Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Aider, OpenHands, Pi); installs into any [`vercel-labs/skills`](https://github.com/vercel-labs/skills)-compatible agent. Recommendation is score-driven — the skill picks the highest-scoring profile as the best fit and tells you which model class to switch to; you do the actual switch.

```bash
npx skills add hsnice16/agent-friendly-skill
```

## Sponsor

If this action is useful to you, consider sponsoring its development: [github.com/sponsors/hsnice16](https://github.com/sponsors/hsnice16).

## License

[MIT](./LICENSE)
