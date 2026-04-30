# 04 · CI and smoke test

**Status**: done

## Goal

Two GitHub Actions workflows guarding this repo:

1. **CI** — typecheck, run tests, bundle, and gate on `dist/` drift so a published tag never points at stale bundle output.
2. **Smoke** — self-dogfood: run the action against its own PRs to catch end-to-end breakage that unit tests miss (git operations, Octokit calls, real comment posting).

## `ci.yml`

Triggers: `push` to `main`, every `pull_request`.

Steps in order:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` with `node-version: 20` and npm cache.
3. `npm ci` — exact lockfile resolution.
4. `npm run typecheck` — `tsc --noEmit`.
5. `npm test` — `node --test --import tsx tests/**/*.test.ts`.
6. `npm run build` — `ncc build src/index.ts -o dist`.
7. **dist drift gate**: `git status --porcelain dist/` must be empty after `npm run build`. If not, the bundle was committed out of sync with `src/` — fail the build with a clear error message pointing the contributor at `npm run build && git add dist/`.

The drift gate exists because consumers pin `hsnice16/agent-friendly-action@v0` (or `@v1` once we cut 1.0.0) and load `dist/index.js`, not `src/`. A merged PR with a stale `dist/` would silently ship old code under a tag.

## `smoke.yml`

Triggers: `pull_request`. Skipped on fork PRs (`if: github.event.pull_request.head.repo.full_name == github.repository`) — fork PRs receive a read-only `GITHUB_TOKEN`, so commenting would 403.

Steps:

1. `actions/checkout@v4` with `fetch-depth: 0` (so the worktree+fetch dance has access to base history).
2. `uses: ./` — runs the local action against the PR.
3. Pass `agents-badge-token: smoke-test` to satisfy the opt-in.

Permissions: `contents: read`, `pull-requests: write` (write needed for the comment upsert).

## Acceptance

- A PR that edits `src/` without rebuilding `dist/` fails CI with the drift-gate message.
- A non-fork PR sees the action post a comment to itself within a minute or two of opening.
- Fork PRs do not run the smoke job (no permission errors in their workflow logs).
- All four steps before the drift gate (typecheck, tests, build) pass on a clean main.
