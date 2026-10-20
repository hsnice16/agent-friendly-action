import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as core from "@actions/core";
import { type RepoScore, scoreRepo } from "./scoring/scorer";

export function scoreCurrentTree(): RepoScore {
  return scoreRepo(process.cwd());
}

// `base-ref` is a workflow input and may be a branch name or a revision like
// `HEAD~1`, so a SHA-only check would break it. What must never pass is a
// leading "-" (git would read it as an option); `--end-of-options` below is the
// second guard.
const REVISION = /^(?!-)(?!.*\.\.)(?!.*\/\/)([A-Za-z0-9._/-]+)((?:~\d*|\^\d*|@\{\d+\})*)$/;

export function isSafeRef(ref: string): boolean {
  const name = REVISION.exec(ref)?.[1];
  return name !== undefined && !name.endsWith("/") && !name.endsWith(".lock");
}

export function scoreAtRef(ref: string): RepoScore {
  if (!isSafeRef(ref)) {
    throw new Error(`refusing to check out unsafe ref ${JSON.stringify(ref.slice(0, 100))}`);
  }

  const path = mkdtempSync(join(tmpdir(), "agent-friendly-base-"));

  try {
    const added = tryWorktreeAdd(path, ref);

    if (!added) {
      const fetched = spawnSync("git", ["fetch", "--no-tags", "--depth=1", "--end-of-options", "origin", ref], {
        stdio: "pipe",
      });

      if (fetched.status !== 0) {
        throw new Error(`git fetch ${ref} failed: ${stderr(fetched)}`);
      }

      // A fetched branch lands in FETCH_HEAD, not under its own name.
      const retried = tryWorktreeAdd(path, "FETCH_HEAD");
      if (!retried) {
        throw new Error(`git worktree add failed for ${ref} after fetch`);
      }
    }

    return scoreRepo(path);
  } finally {
    cleanupWorktree(path);
  }
}

function tryWorktreeAdd(path: string, ref: string): boolean {
  const result = spawnSync("git", ["worktree", "add", "--detach", "--end-of-options", path, ref], {
    stdio: "pipe",
  });

  if (result.status === 0) {
    return true;
  }

  core.debug(`worktree add ${ref} → ${path} failed: ${stderr(result)}`);
  return false;
}

function cleanupWorktree(path: string): void {
  spawnSync("git", ["worktree", "remove", "--force", path], { stdio: "pipe" });

  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup — the runner is ephemeral anyway.
  }
}

function stderr(r: { stderr: Buffer | string | null }): string {
  if (!r.stderr) {
    return "";
  }

  return (typeof r.stderr === "string" ? r.stderr : r.stderr.toString()).slice(0, 400);
}
