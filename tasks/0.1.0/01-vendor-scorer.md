# 01 · Vendor scorer

**Status**: done

## Goal

Bundle the upstream scorer (`lib/scoring/` from `agent-friendly-code`) into this repo so the action can score base + head locally inside CI without any network round-trip to the web app.

## Why vendor (not depend on a package)

The cleaner long-term answer is an extracted `agent-friendly-scorer` npm package. It's deferred until the upstream `1.0.0/03` benchmark harness shows up — that's the second sibling consumer that makes a published package pay off. Until then, vendoring is one less repo to coordinate, one less publish step to remember, and zero ceremony for sync.

## Scope

- `src/scoring/` — mirror of upstream's `lib/scoring/` (16 signals + `MODELS` + `scoreRepo` / `topImprovements`).
- `src/constants/scoring.ts` — mirror of upstream's `lib/constants/scoring.ts` (scorer pulls `DEFAULT_SUGGESTION_LIMIT` from there).

Both directories are flagged in `biome.json`'s ignore list — they're upstream-formatted and shouldn't be reformatted on this side, otherwise sync diffs become noisy.

## Sync rule

Owned by upstream's `AGENTS.md` ("Sibling repos" section): every change to `lib/scoring/` upstream must be mirrored here, and a line added under `## [Unreleased]` in `CHANGELOG.md` describing the change. This repo's `AGENTS.md` ("Vendored scorer (sync rule)" section) names upstream as the source of truth.

## Acceptance

- `src/scoring/` is byte-aligned (modulo formatting) with upstream's `lib/scoring/` at the same upstream commit.
- `tsc --noEmit` passes after the copy with no import-path changes (mirrored layout means relative imports work as-is).
- `scoreRepo` reproduces the same overall score the upstream CLI produces for the same commit.
