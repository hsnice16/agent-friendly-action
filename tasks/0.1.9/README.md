# 0.1.9 — agent skills check, current agent names

**Status**: shipped (2026-10-24)

Mirrors upstream [`agent-friendly-code`](https://github.com/hsnice16/agent-friendly-code) 0.9.3's scorer changes. The full list is in [CHANGELOG.md](../../CHANGELOG.md#019---2026-10-24).

## Impact on PR comments

Most repos score a few points lower for Codex, Cursor, Devin, Gemini CLI, Kimi Code CLI, OpenHands and Pi: the new agent-skills check counts for them, and few repos have `.agents/skills/`. Claude Code and Aider scores change only through the Aider, AGENTS.md and dev-env check fixes.
