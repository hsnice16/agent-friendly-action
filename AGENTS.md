# AGENTS.md

Instructions for AI coding agents working on `agent-friendly-action`.

## What this project is

A GitHub Action (on the Marketplace) that comments on each pull request with how it changes the repo's [Agent Friendly Code](https://agentfriendlycode.com) score. The scorer is vendored from [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code), the source of truth, and bundled into `dist/` so the action never needs the website. [agent-friendly-skill](https://github.com/hsnice16/agent-friendly-skill) vendors the same scorer.

## Stack

- **Node 24** runtime — `action.yml` declares `runs.using: node24`. Local dev needs Node ≥ 20.9.0 (`engines.node`).
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
  comment.ts            # upsert of the action's own marked comment
  score-tree.ts         # git worktree mgmt + scoreRepo wrapper
  scoring/              # vendored from upstream lib/scoring/ (do not reformat — sync rule below)
  constants/            # vendored from upstream lib/constants/scoring.ts
dist/                   # bundled output (committed — this is what consumers run)
tests/
  comment.test.ts
  diff.test.ts
  score-tree.test.ts
tasks/
  <version>/            # one folder per release: a README, plus per-task files for multi-task releases
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

Semver tags plus a floating major tag, like `actions/checkout@v7`. A precise tag (`v0.1.6`) never moves; the floating tag (`v0`, later `v1`) is repointed to the latest release of that major, and an old major's tag stays where it last pointed. Consumers use `@v0`, or a precise tag to opt out of updates.

Every release tag gets a dated `CHANGELOG.md` section (bullets moved out of `## [Unreleased]`); [CONTRIBUTING.md](./CONTRIBUTING.md#release-flow) has the steps, including the Marketplace release.

## Self-containment rule

The action must keep working with no network access to the [agent-friendly-code](https://github.com/hsnice16/agent-friendly-code) web app. Bundle whatever scoring code is required. The web app is **not** contacted at runtime. If a future runtime weights endpoint ships (upstream `1.0.0/03`), it must be a strict enhancement: behind a feature toggle, with the bundled defaults still serving when the network is unavailable.

## Vendored scorer (sync rule)

`src/scoring/` and `src/constants/` are vendored copies of `lib/scoring/` and `lib/constants/scoring.ts` from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. There is no automatic sync — when upstream changes a signal, weight, or `scorer.ts` shape, those changes are copied here by hand and logged under `## [Unreleased]` in `CHANGELOG.md`.

Upstream's [`AGENTS.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/AGENTS.md) (under "Sibling repos") owns the propagation rule — agents working over there are instructed to mirror their scorer changes into this repo **and** into `agent-friendly-skill`. If you find drift, the upstream is the source of truth — **except** for the deliberate prunes listed below.

**Local prunes from upstream** (intentional, do not re-add on sync):

- `src/constants/scoring.ts` — only `SCORE_THRESHOLD_MID`, `SCORE_THRESHOLD_GOOD`, and `DEFAULT_SUGGESTION_LIMIT` are kept. Every other upstream constant sizes website UI (pagination, list limits, search length); nothing in `lib/scoring/` imports them.
- `src/scoring/weights.ts` — `MODEL_BY_ID` (a `Record<ModelId, ModelProfile>`) is dropped; the action iterates `MODELS` and never indexes by id, and ncc does not tree-shake the eager `Object.fromEntries` call.

When syncing upstream changes, copy the substantive change (new signal, weight tweak, scoring-logic edit) and re-apply these prunes on top.

Extracting the scorer to a standalone npm package (`agent-friendly-scorer`) is on the upstream's `1.0.0/03` benchmark-harness task. When that lands, this repo will install the package instead of vendoring, and the sync rule plus these prunes both disappear.

## Security

The action runs on PR content, so treat the scored tree as untrusted:

- Never execute anything from it. The scorer only reads files, doesn't follow symlinks out of the tree, and caps each read at 1 MiB.
- Text from the tree (file names in check details) goes into the comment as a code span (`codeSpan` in `src/diff.ts`), never raw Markdown.
- Only a comment the token's own account posted is edited (`isOwnComment` in `src/comment.ts`); the marker alone can be copied by anyone.
- `base-ref` is validated and passed to git after `--end-of-options` (`isSafeRef` in `src/score-tree.ts`).
- The token is used only for the GitHub API and never logged. `agents-badge-token` is an opt-in marker, not a credential.

Report a vulnerability to <hsnice16@gmail.com>, not a public issue.
