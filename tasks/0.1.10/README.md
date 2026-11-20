# 0.1.10 — every language's standard files

**Status**: shipped (2026-11-20)

Mirrors upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) 0.9.5's scorer changes. The full list is in [CHANGELOG.md](../../CHANGELOG.md#0110---2026-11-20).

## Impact on PR comments

Most repos score higher, mainly on the linter, type, tests and dev-env checks: each language's own config, manifest and test layouts now count, one folder down too, and tests beside the code earn full credit. A `setup.cfg` with no linter section no longer counts as a linter config.
