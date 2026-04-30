# 0.1.1 — gitignore-aware size signal

**Status**: shipped (2026-05-01)

Single-purpose patch release that brings the vendored `size` signal in line with the upstream `agent-friendly-code` change. Mirrored in the [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) sibling at the same version.

## What shipped

- **`size` signal respects `.gitignore`** — in addition to the existing baseline (`node_modules`, `.git`, `vendor`, `target`, `dist`, `build`, `.next`), the recursive file count now consults the consumer repo's `.gitignore`. PRs in repos with operationally-gitignored dirs (clone workspaces, build caches, generated data) no longer have those files counted toward the "manageable size" bucket — the action's score now matches the dashboard's fresh-clone score. Pulls in `ignore@7.0.5` as a runtime dep — bundled into `dist/index.js` by `@vercel/ncc`, so consumers see no install-time change.

## Tracking task

Upstream: [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md).
