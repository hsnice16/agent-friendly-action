import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

import { isSafeRef, scoreAtRef } from "../src/score-tree";

describe("isSafeRef", () => {
  test("accepts SHAs and ordinary branch names", () => {
    for (const ref of ["a1b2c3d", "0123456789abcdef0123456789abcdef01234567", "main", "release/v1.2", "feat_x-y"]) {
      assert.equal(isSafeRef(ref), true, ref);
    }
  });

  test("accepts revision suffixes after a safe name", () => {
    for (const ref of ["HEAD~1", "HEAD~", "HEAD^", "HEAD^2", "main@{1}", "origin/main~3^2", "a1b2c3d~1"]) {
      assert.equal(isSafeRef(ref), true, ref);
    }
  });

  test("rejects option-shaped and malformed refs", () => {
    for (const ref of [
      "",
      "-h",
      "--upload-pack=touch /tmp/x",
      "a..b",
      "a//b",
      "main/",
      "x.lock",
      "a b",
      "a;b",
      "$(id)",
      "-HEAD~1",
      "~1",
      "main@{-1}",
      "main@{now}",
      "main~1 x",
      "x.lock~1",
    ]) {
      assert.equal(isSafeRef(ref), false, ref);
    }
  });

  test("scoreAtRef refuses an unsafe ref before running git", () => {
    assert.throws(() => scoreAtRef("--output=/tmp/pwn"), /unsafe ref/);
  });
});

describe("scoreAtRef", () => {
  test("scores a branch that exists only on origin", () => {
    const root = mkdtempSync(join(tmpdir(), "afa-test-"));
    const git = (cwd: string, ...args: string[]) => execFileSync("git", args, { cwd, stdio: "pipe" });
    const cwd = process.cwd();
    // A pre-commit hook exports GIT_INDEX_FILE and friends, which would point
    // these git calls at the outer repo.
    const hookEnv = Object.entries(process.env).filter(([k]) => k.startsWith("GIT_"));
    for (const [k] of hookEnv) delete process.env[k];

    try {
      const origin = join(root, "origin");
      git(root, "init", "-q", "-b", "main", origin);
      writeFileSync(join(origin, "README.md"), "# base\n");
      git(origin, "add", ".");
      git(origin, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "base");
      git(origin, "checkout", "-qb", "feat");
      git(origin, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "--allow-empty", "-m", "head");
      git(root, "clone", "-q", "--depth=1", "--branch", "feat", `file://${origin}`, "work");

      process.chdir(join(root, "work"));
      assert.ok(scoreAtRef("main").signals.length > 0);
    } finally {
      process.chdir(cwd);
      Object.assign(process.env, Object.fromEntries(hookEnv));
      rmSync(root, { recursive: true, force: true });
    }
  });
});
