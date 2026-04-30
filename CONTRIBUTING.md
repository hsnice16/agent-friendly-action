# Contributing

Thanks for considering a contribution to `agent-friendly-action`. This guide covers setup, branch + commit conventions, the PR description bar, and the release flow.

Read [AGENTS.md](./AGENTS.md) first — it's the source of truth for stack, layout, the vendored-scorer sync rule, and the file-length / no-`what`-comments conventions. AI coding agents and humans are held to the same rules.

## Getting started

```bash
npm install
npm run prepare-hooks   # once — installs lefthook git hooks
npm run typecheck
npm test
npm run build           # ncc → dist/index.js (committed; this is what consumers load)
npm run format          # biome check --write (skips vendored src/scoring/ + src/constants/)
npm run lint            # biome check (read-only)
```

Requires **Node ≥ 20.9.0** (matches `engines.node` in `package.json` and `runs.using: node20` in `action.yml`).

## Branch naming

Lowercase, kebab-case, prefixed by intent:

- `feat/<short-name>` — new capability (new input, new comment field, etc.).
- `fix/<short-name>` — bug fix.
- `chore/<short-name>` — tooling, deps, infra (no consumer-observable change).
- `docs/<short-name>` — docs-only.
- `refactor/<short-name>` — internal restructure; no observable change.

## Commit style

One logical change per commit. Short imperative subject (≤72 chars), body only when the change needs explanation.

Don't squash-amend published commits. Don't skip hooks (`--no-verify`); if a hook fails, fix the underlying issue.

## Pre-commit hook

`lefthook` runs four jobs on every commit (config in `lefthook.yml`):

1. **Biome** — `check --write` on staged JS/TS/JSON. Fixes and re-stages. Vendored `src/scoring/` and `src/constants/` are skipped — upstream owns their style.
2. **tsc** — `--noEmit`. Blocks commits that don't typecheck.
3. **test** — `node --test` runs the suite when `*.ts` files are staged.
4. **file-length** — blocks staged `src/**/*.ts` over 300 lines. Split into modules or pull helpers into a sibling file.

Run `npm run prepare-hooks` once after cloning. CI (`.github/workflows/ci.yml`) runs the same jobs on every PR plus a `dist/` drift check.

## `dist/` is committed

`dist/index.js` is the bundle that consumers actually load via `uses: hsnice16/agent-friendly-action@v0`. CI fails the PR if `dist/` has drifted from `src/` — always run `npm run build` before pushing source changes.

## PR workflow

Open against `main`. Keep the branch rebased; avoid merge commits from `main`.

### PR description — required sections

New PRs auto-populate from [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md). Every PR description must include Summary / Motivation / Changes / Testing / Docs + changelog sync / `dist/` sync / Risks-rollback. The template covers all seven sections.

### When to update `CHANGELOG.md`

The action's `CHANGELOG.md` is the **consumer-facing log** — it tracks anything that changes the score a PR receives or the comment maintainers see. That includes:

- Vendored scorer changes coming in from upstream `agent-friendly-code` (new signal, weight change, scoring logic).
- Action runtime behaviour (new input, new comment field, comment-marker change).
- Marketplace branding / metadata (`action.yml` `branding` or `description`).

It does **not** include: pure CI / build / lint / test plumbing, dev-only refactors, or doc-only edits that don't change behaviour. Those stay in commit messages and PR descriptions.

When the change qualifies, append a one-line bullet under `## [Unreleased]` in [`CHANGELOG.md`](./CHANGELOG.md). On release, bullets move from `## [Unreleased]` into a new dated `## [vX.Y.Z]` section as part of the release commit.

### Size

PRs under ~300 lines of diff review fastest. If your change is larger, split by layer (vendored scorer sync → action runtime → CI) so each PR is independently reviewable.

## Review bar

A PR is ready to merge when:

1. CI is green.
2. `dist/` is in sync with `src/` (CI verifies).
3. At least one review with an explicit `LGTM` or equivalent.
4. No unresolved review comments.
5. PR description has all required sections.
6. If the change is consumer-affecting, the `## [Unreleased]` bullet is in the diff.

## Release flow

See [`tasks/0.1.0/05-marketplace-publish.md`](./tasks/0.1.0/05-marketplace-publish.md) for the full release runbook. Short version:

1. Move bullets from `## [Unreleased]` into a new `## [vX.Y.Z] - YYYY-MM-DD` section in `CHANGELOG.md`. Commit.
2. Tag the precise release: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.
3. Repoint the floating major tag (`v0` during pre-1.0; `v1` after 1.0.0): `git tag -fa v0 -m "v0 → vX.Y.Z" && git push origin v0 --force`. Force-push is allowed for the **floating** tag only — never for the precise tag.
4. Open the GitHub Release UI for the tag, mirror the changelog section into the description, tick **"Publish this Action to the GitHub Marketplace"**, pick categories `Code Quality` (primary) + `Continuous Integration` (secondary), submit.

## Vendored scorer

`src/scoring/` and `src/constants/` are vendored from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. There is **no automatic sync**. When upstream changes a signal, weight, or `scorer.ts` shape, copy the change here by hand and log it under `## [Unreleased]` in `CHANGELOG.md`. Upstream's [`AGENTS.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/AGENTS.md) (the "Sibling repos" section) owns the propagation rule.

## Reporting bugs + requesting features

- **Bugs**: open an issue using the bug-report template. Include the action version (`@v0.1.0` or `@v0`), your workflow file, and a link to a PR run if possible.
- **Features**: open an issue using the feature-request template before sending a PR for non-trivial changes — alignment first avoids wasted work.

## Security

See the [Security section of AGENTS.md](./AGENTS.md#security) for the threat model and the runtime trust boundary. For vulnerability reports that shouldn't be public, email <hsnice16@gmail.com> rather than opening an issue.

## Code of conduct

Be decent. Technical disagreement is fine; personal attacks, harassment, and dismissiveness are not. If you wouldn't say it in a work 1:1, don't write it in a review.
