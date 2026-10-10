# 0.1.6 — node24 runtime; AGENTS.md check stops crediting Cursor files

**Status**: shipped (2026-10-10)

GitHub deprecated Node 20 for actions and was already running this action on Node 24, with a warning annotation on every consumer's run. The action now declares `node24`.

The scorer change mirrors upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code): the AGENTS.md / CLAUDE.md check also passed on `.cursor/rules` and `.cursorrules`, a leftover from before Cursor rules had their own check.

## What shipped

- **`runs.using: node24`** in `action.yml`. Self-hosted runners need a runner version that supports `node24`.
- **AGENTS.md / CLAUDE.md check** matches `AGENTS.md`, `CLAUDE.md` and `AGENT.md` only.
- **Rationales and source links** for Cursor, Devin, Kimi CLI, OpenHands and Pi follow those agents' current docs. No weights changed.
- **PR comment** heads its per-agent table "Per agent" / "Agent"; "model" is kept for the LLM.
- **Marketplace description** reworded.

## Impact on PR comments

A repo whose only instruction file is a Cursor rules file shows a one-time **negative delta** on the first run after upgrading, for every agent. That reflects the correction, not a change in the repo. Repos with an `AGENTS.md` or `CLAUDE.md` are unaffected.
