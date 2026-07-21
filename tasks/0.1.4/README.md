# 0.1.4 — Kimi CLI as the 9th scored agent

**Status**: shipped (2026-07-21)

Single-purpose patch release that mirrors upstream [`e165a00`](https://github.com/hsnice16/agent-friendly-code/commit/e165a00) into the vendored scorer. Mirrored in the [`agent-friendly-skill`](https://github.com/hsnice16/agent-friendly-skill) sibling at the same version.

Moonshot AI's Kimi Code CLI is a terminal coding agent whose only instruction surface is AGENTS.md — there is no CLAUDE.md fallback, and its `/init` generates one. That makes it the strictest AGENTS.md-only adherent of any agent profiled here, and a repo that ships AGENTS.md should see that reflected in a Kimi row on the PR comment. The same upstream commit corrects Aider's profile: the weight had been sitting on `agents_md` on the assumption Aider reads it natively, which it does not.

## What shipped

Vendored weights update (copied verbatim from upstream `lib/scoring/weights.ts`, modulo the documented prunes in `AGENTS.md`):

- **`kimi-cli` profile added** — `agents_md` 1.0, `tests` 0.9, `deps_manifest` / `dev_env` / `readme` 0.7, `type_config` 0.6, `linter` 0.6, `ci` / `size` / `pre_commit` / `contributing` 0.4, `license` 0.3, and 0 for the four agent-specific surfaces it doesn't read (`gemini_md`, `aider_conf`, `cursor_rules`, `openhands_setup`). Weight sum 7.1. `ci` and `size` sit low deliberately: Kimi runs shell commands step-by-step behind an approval gate rather than in a sandbox VM, and dispatches `explore` sub-agents with isolated contexts to map a tree, so repo size costs it less than it costs a single-context agent.
- **`aider` reweighted** — `aider_conf` 0.8 → 1.0, `agents_md` 0.8 → 0.3, with the rationale and a second source (`aider_conf.html`) updated to match.
- **`gpt-5-codex` source URL** — the OpenAI Codex AGENTS.md guide moved to `learn.chatgpt.com`; the superlative in the rationale was dropped now that Kimi shares the AGENTS.md-strictest position.
- **`openhands` rationale** — the deprecated `.openhands/microagents/` path is now described as renamed to Skills (`.agents/skills/`), matching the current upstream docs.

`ModelId` gains `"kimi-cli"`. `src/diff.ts` needed no change — it iterates `modelScores` and never enumerates ids, so the new row renders for free.

## Consumer impact

A new profile cannot **manufacture** a delta: the action scores base and head with the same bundled scorer, so a PR that changes nothing still reports ±0.0. What does move is magnitude. `overall` is the mean across profiled agents, so both the absolute numbers and the distance the mean travels for a given signal change shift. Absolute overall on this repo steps 90.1 → 90.3, and Aider steps 85.9 → 82.5.

The two weight changes push the aggregate delta in **opposite** directions, and on this repo the Aider correction wins. Measured on a synthetic head tree that deletes `.github/workflows/ci.yml`, `AGENTS.md`, and `CLAUDE.md` (all three — `agents_md` falls back to `CLAUDE.md`, so deleting `AGENTS.md` alone does not zero the signal), the overall delta goes −10.1 (8 models) → −9.8 (9 models): Kimi's `agents_md` 1.0 pulls the mean further, but Aider's 0.8 → 0.3 pulls it back harder. Repos whose Aider score is not the outlier should expect the opposite sign on that shift.

None of this is surfaced as a band or recommendation — `SCORE_THRESHOLD_MID` / `SCORE_THRESHOLD_GOOD` are carried in `src/constants/scoring.ts` but unreferenced here; `src/diff.ts` renders numbers and a table only. The band-crossing caveat in the sibling skill's changelog is specific to that repo, where `src/format.ts` does consume the thresholds.

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` (7/7) green on Node 20+.
- `npm run build` reproduces `dist/` byte-identically; the CI dist-sync gate passes.
- Bundle smoke-tested directly (`node dist/index.js`) across the four early-exit paths — no opt-in token, non-PR event, missing `pull_request` payload, unresolvable base SHA — each exits 0 without posting, leaving no stray git worktrees.
- Full pipeline exercised against a real PR-shaped payload (base `v0.1.2` → `HEAD`): both trees scored, comment rendered, only the Octokit call failing on the deliberately fake token.
- Synthetic delta checked end-to-end: a tree that deletes `.github/workflows/ci.yml` + `AGENTS.md` + `CLAUDE.md` penalises Kimi CLI (−14.1) far harder than Aider (−4.2), confirming the new weights reach the rendered output.

## Tracking task

Upstream: [`tasks/0.5.0/02-score-diff-on-pr.md`](https://github.com/hsnice16/agent-friendly-code/blob/main/tasks/0.5.0/02-score-diff-on-pr.md) (the cross-repo plan).

Upstream commit: [`e165a00`](https://github.com/hsnice16/agent-friendly-code/commit/e165a00) — `feat: add Kimi CLI as the 9th scored agent`.
