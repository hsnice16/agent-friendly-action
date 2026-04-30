# Changelog

All notable changes to `agent-friendly-action` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the action follows [Semantic Versioning](https://semver.org/).

This file is the consumer-facing log: it records what changed in each release of the action — including changes to the **vendored scorer** (signals, weights, scoring logic) that come in from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. Anything that affects the score a PR receives belongs here.

What does **not** belong here: pure CI / build / lint / test plumbing, dev-only refactors, or doc-only edits that don't change behaviour. Those stay in commit messages and PR descriptions.

## [0.1.1] - 2026-05-01

### Changed

- `size` signal now respects the repo's `.gitignore` in addition to the existing baseline (`node_modules`, `.git`, `vendor`, `target`, `dist`, `build`, `.next`). Repos with operational dirs that are gitignored (clone workspaces, build caches, generated data) no longer have those files counted toward the "manageable size" bucket — the score now matches what the dashboard sees on a fresh shallow clone. New runtime dep: `ignore@7.0.5`.

## [0.1.0] - 2026-04-30

### Added

- Vendored scorer from upstream `agent-friendly-code` — 16 signals (`agents_md`, `aider_conf`, `ci`, `contributing`, `cursor_rules`, `deps_manifest`, `dev_env`, `gemini_md`, `license`, `linter`, `openhands_setup`, `pre_commit`, `readme`, `size`, `tests`, `type_config`) and weight profiles for 8 models (Claude Code, Cursor, Devin, OpenHands, Gemini CLI, GPT-5 Codex, Aider, Pi). Lives under `src/scoring/`.
- Action entrypoint (`src/index.ts`) — opt-in via `agents-badge-token`, scores PR head + base via a temporary `git worktree`, posts (or edits) a single PR comment with overall delta, per-model table, and changed signals. Comment is tagged with `<!-- agent-friendly-action -->` so subsequent runs update the same comment instead of stacking duplicates.
- CI workflows — `ci.yml` runs typecheck / tests / `ncc build` on every PR and push to `main`, and fails if `dist/` has drifted from `src/`. `smoke.yml` self-dogfoods the action against its own PR (skipped on fork PRs where the GitHub token is read-only).
- Biome + Lefthook tooling — `biome.json` for formatting + linting (vendored `src/scoring/` and `src/constants/` excluded), `lefthook.yml` runs biome / `tsc --noEmit` / tests / a 300-line file-length cap on every commit. New `npm run prepare-hooks` / `format` / `lint` scripts.
- LICENSE file (MIT) at the repo root — required for Marketplace publish.
- `tasks/0.1.0/` version plans documenting the v0.1.0 cut: vendor scorer, action runtime, PR comment, CI + smoke, Marketplace publish.

[0.1.1]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hsnice16/agent-friendly-action/releases/tag/v0.1.0
