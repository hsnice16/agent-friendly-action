# 0.1.8 — AGENTS.md fallback, safer symlinks, base-ref by name

**Status**: shipped (2026-10-21)

Mirrors upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) 0.9.1's scorer changes. The full list is in [CHANGELOG.md](../../CHANGELOG.md#018---2026-10-21).

## Impact on PR comments

Scores change only for repos with an empty AGENTS.md next to a full CLAUDE.md, a `docker-compose.yaml` or `.github/CONTRIBUTING.adoc` as their only such file (higher), or a directory named like a checked file (lower). A PR comment shows a delta only if the PR itself touches one of those.
