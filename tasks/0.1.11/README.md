# 0.1.11 — hostile .gitignore, folder-named files, dev env once per tool

**Status**: shipped (2026-11-25)

Mirrors the upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) scorer fixes after 0.9.5. The full list is in [CHANGELOG.md](../../CHANGELOG.md#0111---2026-11-25).

## Impact on PR comments

Almost every repo scores the same. A folder named like an agent file, `LICENSE`, `CONTRIBUTING.md` or `.cursorrules` no longer passes as that file, and two spellings of one dev-env tool no longer count as two; on the upstream board this moved one repo of 435. A hostile `.gitignore` can no longer stall a run.
