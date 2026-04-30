# 02 · Action runtime

**Status**: done

## Goal

Define the action's manifest (`action.yml`) and runtime contract: inputs, opt-in semantics, and the bundled-`dist/` execution model that Marketplace and consumers actually load.

## Manifest

```yaml
name: Agent-friendly score diff
description: Comment a per-PR delta of your repo's Agent Friendly Code score…
author: hsnice16
branding:
  icon: bar-chart-2
  color: gray-dark
runs:
  using: node20
  main: dist/index.js
```

`branding` makes the listing show up with a recognisable icon/color in Marketplace search. `node20` is the only currently-supported Node runtime for actions; `dist/index.js` is the ncc-bundled output (committed — that's what consumers run).

## Inputs

| Input                | Required | Default              | Behaviour                                          |
| -------------------- | -------- | -------------------- | -------------------------------------------------- |
| `agents-badge-token` | yes      | —                    | Opt-in marker. **Empty string → action exits 0 silently** (lets us ship the workflow inside starter templates without firing for unenrolled forks). |
| `github-token`       | no       | `${{ github.token }}`| Used to read `listComments` and post / edit one PR comment. |
| `base-ref`           | no       | event base SHA       | Override only — usually unneeded.                  |

The opt-in is an env-shape **marker, not a credential**. It can be promoted to a real key later — the upstream `1.0.0/03` benchmark harness is the trigger for that promotion, when a runtime weights endpoint actually exists.

## Runtime guards

The orchestrator (`src/index.ts`) exits early — without writing a comment — in any of these cases:

1. `agents-badge-token` is empty (opt-out).
2. The triggering event is not `pull_request` or `pull_request_target`.
3. The event payload has no `pull_request` field.
4. Neither `base-ref` input nor `pull_request.base.sha` resolves to a SHA.

Each early exit logs at `info` (or `warning` for the unexpected ones) and returns 0 — the action never fails the workflow for "expected" non-applicable cases.

## Acceptance

- `action.yml` validates against the GitHub Actions schema (Marketplace publish UI lints it).
- Branding renders in the Marketplace listing preview.
- An empty-token run logs `agents-badge-token not set; exiting silently.` and exits 0.
- A non-PR event (e.g. `push`) logs the event-name guard and exits 0.
