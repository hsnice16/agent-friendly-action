# 0.1.0 — first cut

**Status**: in_progress

The minimum lovable thing: a Marketplace-listable GitHub Action that drops a per-PR score-delta comment, runs entirely inside maintainer CI, and is independent of the upstream web app for its core function.

Companion to `agent-friendly-code`'s [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md). Read that one for the cross-repo plan; this folder breaks the action-side work into reviewable chunks.

## Tasks

- [01-vendor-scorer.md](./01-vendor-scorer.md) — vendor `lib/scoring/` from upstream into `src/scoring/`, mirror `lib/constants/scoring.ts`. Sync rule lives in upstream's `AGENTS.md` ("Sibling repos") and this repo's `AGENTS.md` ("Vendored scorer").
- [02-action-runtime.md](./02-action-runtime.md) — `action.yml` manifest with branding + inputs, opt-in via `agents-badge-token`, `node20` runtime, single-comment-per-PR upsert pattern.
- [03-pr-comment.md](./03-pr-comment.md) — score head + base via `git worktree`, render markdown diff (overall delta + per-model table + changed signals), upsert via Octokit using an HTML-comment marker.
- [04-ci-and-smoke.md](./04-ci-and-smoke.md) — `ci.yml` (typecheck / tests / `ncc build` / `dist/` drift gate) and `smoke.yml` (self-dogfood the action against its own PRs).
- [05-marketplace-publish.md](./05-marketplace-publish.md) — semver tags, floating `v1` tag, GitHub Release UI publish, Marketplace listing under Code Quality / Continuous Integration.

## Acceptance for the release as a whole

- `dist/index.js` runs end-to-end against a real PR and posts a comment.
- Comment shows: overall delta, per-model rows, changed-signals list with detail strings.
- Comment is **edited** (not duplicated) on subsequent runs of the same PR.
- Action exits silently when `agents-badge-token` is empty.
- `dist/` is committed and CI fails any PR that drifts source vs. bundle.
- Repo is published under `hsnice16/agent-friendly-action`, tagged `v0.1.0` (precise), with `v0` (the major-version floating tag) repointed to the same commit. Consumers pin `@v0`; we'll switch to `@v1` only after a `v1.0.0` breaking release.
- Marketplace listing live (manual step via the Releases UI on the publishing account).

## Out of scope (lands in a later 0.x.y)

- Runtime weights refresh from a future upstream weights endpoint (waits on the upstream `1.0.0/03` benchmark harness — that task is what actually creates the endpoint).
- DB writeback / webhook integration (lives in upstream's `0.6.0/01`).
- Per-language or per-agent comment customisation.
- Locale-aware delta formatting.
