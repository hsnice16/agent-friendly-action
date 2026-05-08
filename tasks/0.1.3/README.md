# 0.1.3 — broaden tests signal to PHP, Ruby, C#

**Status**: shipped (2026-05-08)

Single-purpose patch release that mirrors upstream [`90b650d`](https://github.com/hsnice16/agent-friendly-code/commit/90b650d) into the vendored scorer. Mirrored in the [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) sibling at the same version.

The 0.1.2 language-coverage sweep extended the `tests` signal to JVM, Swift, Elixir, Dart, and Scala but left three large ecosystems uncovered: PHP (PHPUnit), Ruby (Minitest / RSpec), and C# (xUnit / NUnit / MSTest). Repos that scaffold tests in nested directories — common in ASP.NET Core (`Tests/<Project>.Tests/*Tests.cs`) and Rails (`spec/**/*_spec.rb`, `test/**/*_test.rb`) — and don't surface a recognised root-level test directory were dropping the signal entirely.

## What shipped

Vendored signal update (copied verbatim from upstream `lib/scoring/signals/tests.ts`, modulo the documented prunes in `AGENTS.md`):

- **`tests`** — file regex now also recognises `*Test.php` (PHPUnit), `*_test.rb` / `*_spec.rb` (Minitest / RSpec), and `*Tests?.cs` (xUnit / NUnit / MSTest). Directory list is unchanged — these conventions live in nested `tests/` / `spec/` / `test/` trees that the existing `DIRS` already covers, but the file regex is what fires when the directory check misses (e.g. a monorepo where the test tree sits under `apps/api/tests/...`).

## Tracking task

Upstream: [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md) (the cross-repo plan).

Upstream commit: [`90b650d`](https://github.com/hsnice16/agent-friendly-code/commit/90b650d) — `feat: broaden tests signal to PHP, Ruby, C#`.
