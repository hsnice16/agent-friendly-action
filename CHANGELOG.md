# Changelog

All notable changes to `agent-friendly-action` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the action follows [Semantic Versioning](https://semver.org/).

This file is the consumer-facing log: it records what changed in each release of the action — including changes to the **vendored scorer** (signals, weights, scoring logic) that come in from the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) repo. Anything that affects the score a PR receives belongs here.

What does **not** belong here: pure CI / build / lint / test plumbing, dev-only refactors, or doc-only edits that don't change behaviour. Those stay in commit messages and PR descriptions.

## [Unreleased]

### Added

- A seventeenth check, agent skills: at least one `.agents/skills/<name>/SKILL.md`. It counts for Codex, Cursor, Devin, Gemini CLI, Kimi Code CLI, OpenHands and Pi, which load that folder, so their scores drop slightly for repos without one. Vendored from the upstream scorer.

### Changed

- Agent labels follow the products' current names: "GPT-5 Codex" is now "Codex" and "Kimi CLI" is "Kimi Code CLI". Model ids are unchanged. Vendored from the upstream scorer.
- The AGENTS.md / CLAUDE.md check also finds `.claude/CLAUDE.md` and `.claude/AGENTS.md`, after the root files. Vendored from the upstream scorer.
- The Cursor-rules check counts `.mdc` files in subfolders of `.cursor/rules/` and in `.cursor/rules/` folders up to three directories down, and gives Devin a small weight, since Devin pulls those files into its Knowledge. Vendored from the upstream scorer.
- The GEMINI.md check counts an AGENTS.md, CLAUDE.md or AGENT.md imported with an `@AGENTS.md` line toward its length. Vendored from the upstream scorer.
- The dev-env check accepts `.devin/blueprint.yaml` and `.cursor/environment.json`. Vendored from the upstream scorer.
- The Aider check gives full credit only when `.aider.conf.yml` sets `test-cmd`, `lint-cmd`, `auto-test` or `read`; other configs score 50%, an empty one 20%. Vendored from the upstream scorer.

### Fixed

- The Aider check no longer passes on `.aider.conf.yaml`, which Aider never loads. Vendored from the upstream scorer.

## [0.1.8] - 2026-10-21

### Changed

- The dev-env check also accepts `docker-compose.yaml`, and the contributing check `.github/CONTRIBUTING.adoc`. Repos whose only such file has that name score higher. Vendored from the upstream scorer.
- The AGENTS.md / CLAUDE.md check reads the first of AGENTS.md, CLAUDE.md and AGENT.md that has content, so an empty AGENTS.md no longer hides a full CLAUDE.md. Repos with that pair score higher. Vendored from the upstream scorer.
- Marketplace `description` in `action.yml` reworded: "Check AI agent readiness on every pull request, with a comment on how it changes your score per coding agent."

### Fixed

- The size check's detail adds "+" to the file count only when counting stopped at its 10,000-file cap; a repo with 5,000 to 10,000 files now shows its exact count. Scores are unchanged. Vendored from the upstream scorer.
- A directory named like a file (`ci.yml` in `.github/workflows`, `x.mdc` in `.cursor/rules`, `package.json`, `tsconfig.json`, `Cargo.toml`) no longer passes the CI, Cursor-rules, dependency-manifest or type-config check. Only repos relying on such a directory score lower. Vendored from the upstream scorer.
- A chain of symlinks whose `..` steps through another link can no longer make a check read a file outside the repo. Scores of ordinary repos are unchanged. Vendored from the upstream scorer.
- `base-ref` set to a branch or tag name now works on a shallow checkout; it failed with 'invalid reference' after fetching.

## [0.1.7] - 2026-10-16

### Changed

- Check details print counts as "14,688 characters" instead of "14688 chars", and say "1 GitHub Actions workflow" / "2 … workflows" instead of "workflow(s)". Check descriptions are reworded in plain language. Scores are unchanged. Vendored from the upstream scorer.
- The comment's "Signals that changed" section is now "Checks that changed", the name the website uses.

### Fixed

- The Cursor-rules check's detail for a legacy `.cursorrules` file no longer contains backticks, which would print literally now that details render as code spans. Scores are unchanged. Vendored from the upstream scorer.
- The file a check names as its match (the first test file, `.cursor/rules/*.mdc` or `*.csproj`-style manifest) is now picked by name instead of directory-listing order, so the same commit reports the same file on every machine. Scores are unchanged. Vendored from the upstream scorer.

### Security

- The scorer no longer follows a symlink out of the scored repo, reads only regular files, and reads at most 1 MiB of any file. A tree with `README.md` linked to `/dev/zero` could exhaust memory, and one linked to a file elsewhere on the machine leaked that file's length into the score. An escaping link still counts as one file for the size check; a README over 1 MiB is measured on its first 1 MiB. Scores of ordinary repos are unchanged. Vendored from the upstream scorer.
- The action now edits only a comment it posted itself. It used to update any PR comment carrying its hidden marker, so anyone could paste the marker into a comment and have the score diff overwrite it. With a PAT, "itself" is the PAT's account. With an installation token (the default `GITHUB_TOKEN`, or a GitHub App's, which comments as `<app-slug>[bot]`) it is any bot account, so App tokens keep updating one comment; a user account's comment is never edited.
- Signal details in the comment render as code spans. A detail can quote a file name from the PR, which could otherwise inject Markdown, links, images or @-mentions into the bot's comment.
- `base-ref` values that git could read as an option (a leading `-`, or characters no ref name allows) are refused, and refs are passed to git after `--end-of-options`. Branch names, SHAs and revisions such as `HEAD~1`, `HEAD^2` and `main@{1}` still work.

## [0.1.6] - 2026-10-10

### Changed

- The AGENTS.md / CLAUDE.md check no longer passes on Cursor rule files (`.cursor/rules`, `.cursorrules`); the separate Cursor-rules check already covers them. A repo with only Cursor rules scores lower on this check for every agent, and a `.cursor/rules` directory no longer reads as an empty instructions file. Vendored from the upstream scorer.
- Agent rationales and source links for Cursor, Devin, Kimi CLI, OpenHands and Pi follow the agents' current docs. No weights changed.
- The PR comment's per-agent table is headed "Per agent" / "Agent" instead of "Per model" / "Model", matching the website; "model" is kept for the LLM.
- Action runtime moved from `node20` to `node24`. GitHub has deprecated Node 20 for actions and was already forcing this action onto Node 24 with a warning annotation on every run; the annotation goes away. Self-hosted runners need a runner version that supports `node24` (v2.327.1 or later).
- Marketplace `description` in `action.yml` reworded: "Comment on each pull request with how it changes your repo's score for AI coding agents."

## [0.1.5] - 2026-08-23

### Fixed

- Repo file lookups are now case-insensitive. Candidate paths previously had to match exactly, so a repo spelling its files `readme.md`, `Readme.md`, `license`, or `contributing.md` scored as though they were missing — on case-sensitive filesystems, which is where this action runs. Repos missing all three of README / LICENSE / CONTRIBUTING for this reason score up to 18 points higher now.
- A single `Makefile` no longer counts as two dev-env artifacts, which could push `dev_env` from 0.7 to a full 1.0 on case-insensitive filesystems.

## [0.1.4] - 2026-07-21

### Added

- **Kimi CLI** weight profile — Moonshot AI's terminal coding agent is now the 9th scored model. `agents_md` weighted 1.0 (AGENTS.md is its only instruction surface; there is no CLAUDE.md fallback and `/init` generates one), `tests` 0.9, `deps_manifest` / `dev_env` / `readme` 0.7. PR comments now show a Kimi CLI row.

### Changed

- `aider` reweighted — `aider_conf` 0.8 → 1.0, `agents_md` 0.8 → 0.3. Aider does not natively read AGENTS.md or CONVENTIONS.md; those load only when wired through `.aider.conf.yml`'s `read:` key, so the config file is what actually determines whether Aider sees repo conventions. Measured −3.4 on this repo's own Aider score.

## [0.1.3] - 2026-05-08

### Changed

- `tests` signal file regex now also recognises `*Test.php` (PHPUnit), `*_test.rb` / `*_spec.rb` (Minitest / RSpec), and `*Tests?.cs` (xUnit / NUnit / MSTest). Monorepos that nest tests in subdirectories (e.g. ASP.NET Core, Rails) now correctly hit the test signal even without a recognised root-level test directory.

## [0.1.2] - 2026-05-05

### Changed

- Six static signals now recognise more language-ecosystem conventions, so repos correctly scaffolded in non-Node idioms (JVM, .NET, Swift, Ruby, Elixir, Haskell, OCaml, Erlang, Crystal, Zig, Dart, PHP, Lua, Clojure, Nim, C/C++) no longer score low for the ecosystem-equivalent setup:
  - `contributing` — accepts `CONTRIBUTING.rst` (Python/Sphinx, e.g. pytest/Django) and `CONTRIBUTING.adoc` (AsciiDoc / JVM), in root, `.github/`, and `docs/`.
  - `dev_env` — accepts `tox.ini` and `noxfile.py` (Python), `mvnw` / `gradlew` (JVM build wrappers), `bin/setup` (Ruby/Rails), and `compose.yaml` (the Docker-preferred canonical name, alongside the existing `compose.yml` / `docker-compose.yml`).
  - `deps_manifest` — accepts `mix.exs` (Elixir), `Package.swift` (Swift), `build.gradle.kts` (Kotlin DSL), `build.sbt` (Scala), `deps.edn` / `project.clj` (Clojure), `stack.yaml` + root `*.cabal` (Haskell), `dune-project` (OCaml), `rebar.config` (Erlang), `shard.yml` (Crystal), `build.zig` (Zig), `CMakeLists.txt` / `meson.build` / `conanfile.txt`/`.py` / `vcpkg.json` (C/C++), root-level `*.csproj` / `*.fsproj` / `*.vbproj` / `*.sln` (.NET), and root `*.nimble` (Nim). `global.json` is intentionally **not** counted here — it pins the .NET SDK version, not dependencies (real .NET deps live in `*.csproj`).
  - `type_config` — typed-by-default credit extended to JVM (`pom.xml` / `build.gradle[.kts]`), Scala (`build.sbt`), Swift (`Package.swift`), C# (`global.json` or root `*.csproj` / `.sln`), OCaml (`dune-project`), Haskell (`stack.yaml` / root `*.cabal`), and Zig (`build.zig`), in addition to the existing Rust/Go credit.
  - `linter` — accepts `.rubocop.yml` / `.standard.yml` (Ruby), `.swiftlint.yml` / `.swiftformat` / `.swift-format` (Swift, both Nick Lockwood's and Apple's tools), `detekt.yml` + `config/detekt/detekt.yml` / `.scalafmt.conf` (JVM), `phpstan.neon[.dist]` / `psalm.xml[.dist]` / `.php-cs-fixer.dist.php` (PHP), `.credo.exs` / `.formatter.exs` (Elixir), `stylua.toml` (Lua), `checkstyle.xml` + `config/checkstyle/checkstyle.xml` (Java, including the canonical Gradle plugin path), `analysis_options.yaml` (Dart/Flutter — the canonical lint config), `.clang-format` / `.clang-tidy` (C/C++), and `.clj-kondo/config.edn` (Clojure). Intentionally **not** counted: `.editorconfig` (formatting baseline, no feedback loop) and `.ktlint` (not a real config file — ktlint reads `.editorconfig`).
  - `tests` — adds `Tests/` (Swift convention, case-sensitive filesystems) and `src/test/` (Java/Kotlin) to the directory list. File regex now also recognises `*Test.java`, `*Test[s].kt`, `*_test.exs` (Elixir), `*_test.dart` (Dart), and `*Spec.scala` / `*Test.scala`.

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

[0.1.7]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/hsnice16/agent-friendly-action/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/hsnice16/agent-friendly-action/releases/tag/v0.1.0
