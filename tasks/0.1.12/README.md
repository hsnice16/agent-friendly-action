# 0.1.12 — hostile trees can't stall a run, pull_request_target guard

**Status**: shipped (2026-11-27)

Mirrors the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) fixes that keep folder links and wide trees from stalling the scorer, and stops `pull_request_target` runs from scoring the base as the head. The full list is in [CHANGELOG.md](../../CHANGELOG.md#0112---2026-11-27).

## Impact on PR comments

A repo of folder links or thousands of folders can no longer stall a run. Only a repo with links to folders can score differently. A `pull_request_target` workflow that doesn't check out the head gets a warning instead of a comment.
