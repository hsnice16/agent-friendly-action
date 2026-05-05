# 0.1.2 — broaden language coverage across 6 static signals

**Status**: shipped (2026-05-05)

Single-purpose patch release that mirrors upstream [`0da7ca2`](https://github.com/hsnice16/agent-friendly-code/commit/0da7ca2) into the vendored scorer. Mirrored in the [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) sibling at the same version.

Detection was biased toward the JS/TS ecosystem — repos correctly scaffolded in non-Node idioms scored lower than they should. Six static signals now recognise the canonical config files for JVM languages (Java/Kotlin/Scala/Clojure), Swift, .NET, Elixir, Haskell, OCaml, Erlang, Crystal, Zig, Dart, PHP, Lua, Ruby, Nim, and C/C++.

## What shipped

Vendored signal updates (copied verbatim from upstream `lib/scoring/signals/`, modulo the documented prunes in `AGENTS.md`):

- **`contributing`** — accepts `CONTRIBUTING.rst` (Python/Sphinx) and `CONTRIBUTING.adoc` (AsciiDoc / JVM), in root, `.github/`, and `docs/`.
- **`dev_env`** — accepts `tox.ini`, `noxfile.py` (Python), `mvnw` / `gradlew` (JVM build wrappers), `bin/setup` (Ruby/Rails), and `compose.yaml` (the Docker-preferred canonical name).
- **`deps_manifest`** — accepts `mix.exs`, `Package.swift`, `build.gradle.kts`, `build.sbt`, `deps.edn`, `project.clj`, `stack.yaml`, `dune-project`, `rebar.config`, `shard.yml`, `build.zig`, `CMakeLists.txt`, `meson.build`, `conanfile.txt`/`.py`, `vcpkg.json`, plus root-level glob matches for `*.csproj` / `*.fsproj` / `*.vbproj` / `*.sln` (.NET), `*.cabal` (Haskell), and `*.nimble` (Nim).
- **`type_config`** — typed-by-default credit extended to JVM (`pom.xml` / `build.gradle[.kts]`), Scala (`build.sbt`), Swift (`Package.swift`), C# (`global.json` or root `*.csproj` / `.sln`), OCaml (`dune-project`), Haskell (`stack.yaml` / root `*.cabal`), and Zig (`build.zig`), in addition to the existing Rust/Go credit.
- **`linter`** — accepts `.rubocop.yml` / `.standard.yml` (Ruby), `.swiftlint.yml` / `.swiftformat` / `.swift-format` (Swift), `detekt.yml` + `config/detekt/detekt.yml` / `.scalafmt.conf` (JVM), `phpstan.neon[.dist]` / `psalm.xml[.dist]` / `.php-cs-fixer.dist.php` (PHP), `.credo.exs` / `.formatter.exs` (Elixir), `stylua.toml` (Lua), `checkstyle.xml` + `config/checkstyle/checkstyle.xml` (Java), `analysis_options.yaml` (Dart/Flutter), `.clang-format` / `.clang-tidy` (C/C++), and `.clj-kondo/config.edn` (Clojure).
- **`tests`** — adds `Tests/` (Swift) and `src/test/` (Java/Kotlin) to the directory list; file regex now also recognises `*Test.java`, `*Test[s].kt`, `*_test.exs`, `*_test.dart`, `*Spec.scala` / `*Test.scala`.

Deliberate exclusions (documented in upstream and in `CHANGELOG.md`):

- `global.json` is **not** counted in `deps_manifest` — it pins the .NET SDK version, not dependencies. Real .NET deps live in `*.csproj`.
- `.editorconfig` is **not** counted in `linter` — formatting baseline with no feedback loop.
- `.ktlint` is **not** counted in `linter` — not a real config file (ktlint reads `.editorconfig`).

## Tracking task

Upstream: [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md) (the cross-repo plan).

Upstream commit: [`0da7ca2`](https://github.com/hsnice16/agent-friendly-code/commit/0da7ca2) — `feat: broaden language coverage across 6 static signals`.
