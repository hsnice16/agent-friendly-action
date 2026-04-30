# AGENTS.md

Instructions for AI coding agents working on `agent-friendly-action`.

## What this project is

A GitHub Action — published on the GitHub Marketplace — that posts a per-PR delta of the [Agent Friendly Code](https://github.com/hsnice16/agent-friendly-code) score on every pull request. Self-contained: the scorer is bundled into `dist/` so the action keeps working independently of the web app.

Companion to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app. The action is read-only (PR comments only); the web app is the source of truth for score history and the public dashboard.

## Stack

- **Node 20** runtime — `action.yml` declares `runs.using: node20`. Local dev needs Node ≥ 20.9.0 (matches `engines.node`).
- **TypeScript** — strict mode.
- **`@actions/core`, `@actions/github`** — only first-party action utilities.
- **`@vercel/ncc`** — bundles `src/index.ts` + scorer into a single `dist/index.js` that consumers actually load.
- **Biome** — formatter + linter. Config at `biome.json` (lineWidth 120, parent-aligned). Vendored `src/scoring/` and `src/constants/` are excluded — upstream owns their style.
- **Lefthook** — git pre-commit hooks run Biome / `tsc --noEmit` / tests / a 300-line file-length cap on `src/**/*.ts`.

## Layout

```text
action.yml              # Marketplace listing manifest. Lives at repo root (Marketplace requirement).
biome.json              # formatter + linter config
lefthook.yml            # pre-commit jobs (biome, typecheck, test, file-length)
src/
  index.ts              # entry point — orchestration only
  diff.ts               # pure renderer: RepoScore × RepoScore → markdown (owns COMMENT_MARKER)
  comment.ts            # Octokit upsert by marker
  score-tree.ts         # git worktree mgmt + scoreRepo wrapper
  scoring/              # vendored from upstream lib/scoring/ (do not reformat — sync rule below)
  constants/            # vendored from upstream lib/constants/scoring.ts
dist/                   # bundled output (committed — this is what consumers run)
tests/
  diff.test.ts
tasks/
  0.1.0/                # version plans (per-task files + README)
CHANGELOG.md            # consumer-facing release log
LICENSE                 # MIT
```

## Build + dev loop

```bash
npm install
npm run prepare-hooks   # once — installs lefthook git hooks
npm run typecheck
npm test
npm run build           # ncc → dist/
npm run format          # biome check --write (full repo)
npm run lint            # biome check (read-only)
```

`dist/` is **committed**. CI verifies it's in sync on every push so the published action always matches the source.

## Conventions

- **Exact-pinned deps** in `package.json` (no `^`, no `latest`). Mirrors the upstream rule — deterministic builds, reproducible bundles.
- **File length**: `src/**/*.ts` stays ≤ 300 lines. Enforced by the lefthook `file-length` job.
- **No comments** explaining *what* the code does. Only *why* — the `COMMENT_MARKER` rationale in `src/diff.ts` is the model.
- **Vendored code is exempt** from this repo's biome config (see `biome.json`'s ignore list). Do not run `npm run format` against `src/scoring/` or `src/constants/`.

## Versioning

> **Two kinds of tags, don't confuse them:**
>
> - **Precise** (e.g. `v0.1.0`) — immutable. Points at exactly one commit, forever.
> - **Floating** (e.g. `v0`) — mutable. The number after `v` is the **major version**, not "release N". `v0` always points at the latest 0.x.y release; today that's `v0.1.0`, tomorrow it might be `v0.2.0`. Same way `actions/checkout@v4` works.

Semver tags with a major-version floating tag:

- Each release gets a precise tag: `v0.1.0`, `v0.2.0`, …, `v1.0.0`, `v1.1.0`, …
- The floating tag tracks the latest release within a single major version:
  - During pre-1.0, `v0` is maintained. `v0.1.0` and `v0.2.0` both float on `v0` — the second release does **not** become `v2`.
  - Once `v1.0.0` ships, `v1` is maintained alongside (and continues to follow the latest 1.x.y). Repeat for future majors. Old floating tags are not deleted; they just stop moving.
- Consumers pin the floating tag in their workflow (`@v0` for now). Pinning a precise tag (`@v0.1.0`) is also valid for users who want to opt out of automatic minor/patch updates. Marketplace submission happens via the GitHub Releases UI.

Every release tag must be reflected in [`CHANGELOG.md`](./CHANGELOG.md). Move the relevant bullets out of `## [Unreleased]` into a new dated version section as part of the release commit.

## Self-containment rule

The action must keep working with no network access to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app. Bundle whatever scoring code is required. The web app is **not** contacted at runtime in v1 — if a future runtime weights endpoint ships (upstream `1.0.0/03`), it must be a strict enhancement: behind a feature toggle, with the bundled defaults still serving when the network is unavailable.

## Vendored scorer (sync rule)

`src/scoring/` is a vendored copy of `lib/scoring/` from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. There is no automatic sync — when upstream changes a signal, weight, or `scorer.ts` shape, those changes are copied here by hand and logged under `## [Unreleased]` in `CHANGELOG.md`.

Upstream's [`AGENTS.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/AGENTS.md) (under "Sibling repos") owns the propagation rule — agents working over there are instructed to mirror their scorer changes into this repo. If you find drift, the upstream is the source of truth for signal logic and weight values.

Extracting the scorer to a standalone npm package (`agent-friendly-scorer`) is on the upstream's `1.0.0/03` benchmark-harness task. When that lands, this repo will install the package instead of vendoring, and the sync rule disappears.

## Security

The action runs with the workflow's `GITHUB_TOKEN` and reads the consumer's repo contents inside their CI runner — no network egress to third-party services, no token forwarded anywhere. The `agents-badge-token` input is an opt-in **marker only** (the action exits silently when empty); do not treat it as a credential to validate against an upstream service.

If you spot a vulnerability — e.g. a way to make the action exfiltrate the token, comment on a PR it shouldn't, or run code it shouldn't — email <hsnice16@gmail.com> rather than opening a public issue. Coordinated disclosure preferred.
