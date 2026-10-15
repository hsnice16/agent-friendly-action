import { strict as assert } from "node:assert";
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
