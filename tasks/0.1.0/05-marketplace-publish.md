# 05 · Marketplace publish

**Status**: done

## Goal

Get `agent-friendly-action` listed on the GitHub Marketplace under Code Quality / Continuous Integration so it surfaces in the workflow add-action picker. This is the only task in v0.1.0 that requires manual steps in the GitHub UI — the agent can't run it.

## Prerequisites

- Repo is public.
- `action.yml` lives at the repo root (already true).
- `branding.icon` and `branding.color` are set in `action.yml` (already true: `bar-chart-2`, `gray-dark`).
- Repo has a `README.md` with install snippet and a `LICENSE` file at root (both true).
- Publishing account has 2FA enabled.
- Publishing account has accepted the GitHub Marketplace Developer Agreement.

## Tag scheme

Standard semver with a major-version floating tag:

- **Per-release tags** are precise: `v0.1.0`, `v0.2.0`, `v0.3.0`, …, `v1.0.0`, `v1.1.0`, …
- **Floating tag** tracks the latest release within a single major version. The number after `v` is the **major version**, not "release N":
  - During pre-1.0, the floating tag is `v0` and tracks the latest 0.x.y. So `v0.1.0` and `v0.2.0` both float on `v0` (the second release does **not** become `v2`).
  - When we cut `v1.0.0` (breaking change vs 0.x), the floating tag becomes `v1` and tracks the latest 1.x.y.
- **Consumers pin the floating tag** (`@v0` for now, `@v1` after 1.0.0). They get bug-fix releases for free; breaking changes require a deliberate bump to the next major.
- `dist/` is committed at every release tag — Marketplace + `uses:` consumers load `dist/index.js` from the resolved tag.

## Release flow (manual)

1. Cut a release branch / commit, ensure CI is green and `dist/` is in sync.
2. Move bullets from `## [Unreleased]` to a new `## [0.1.0] - YYYY-MM-DD` section in `CHANGELOG.md`. Commit.
3. Tag the precise release: `git tag -a v0.1.0 -m "v0.1.0" && git push origin v0.1.0`.
4. Repoint the floating major tag at the same commit: `git tag -fa v0 -m "v0 → v0.1.0" && git push origin v0 --force` (force is allowed for the floating tag only — never force-push the precise tag). On the next pre-1.0 release, repeat step 4 against `v0`. After cutting `v1.0.0`, switch to maintaining `v1` instead.
5. Open the GitHub Releases UI for the tag, fill in the description (mirror the changelog section), check **"Publish this Action to the GitHub Marketplace"**, pick categories: `Code Quality` (primary), `Continuous Integration` (secondary).
6. Submit. Marketplace review is automatic for already-listed authors and can take minutes; first-time listings may take longer.

## Acceptance

- `https://github.com/marketplace/actions/agent-friendly-score-diff` (or the Marketplace-allocated URL) renders the listing with the action's branding, description, and install snippet.
- `uses: hsnice16/agent-friendly-action@v0` resolves and runs in a consumer workflow (pinning the floating major tag, which today points at `v0.1.0`).
- Search for "agent friendly" in the workflow editor's action picker surfaces this action.

## Out of scope

- Auto-publishing on tag push (lands when we have multiple releases under our belt and the manual flow has stabilised).
- Versioned `v0.1` floating tag (only `v0` is maintained for now — semver minors aren't expected to break consumers).
