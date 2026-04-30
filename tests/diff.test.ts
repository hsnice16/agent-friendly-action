import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { COMMENT_MARKER, renderDiffComment } from "../src/diff";
import type { ModelScore, RepoScore } from "../src/scoring/scorer";
import type { SignalResult } from "../src/scoring/signals/types";

function model(id: string, score: number, label = id): ModelScore {
  return { modelId: id as ModelScore["modelId"], modelLabel: label, score, contributions: [] };
}

function signal(id: string, pass: number, detail = "fixture", label = id): SignalResult {
  return { id, label, pass, detail };
}

function repoScore(overall: number, modelScores: ModelScore[], signals: SignalResult[]): RepoScore {
  return { overall, modelScores, signals };
}

describe("renderDiffComment", () => {
  test("includes the HTML marker so the comment can be edited later", () => {
    const r = repoScore(50, [model("claude-code", 50, "Claude Code")], [signal("ci", 1)]);
    const out = renderDiffComment(r, r);

    assert.ok(out.startsWith(COMMENT_MARKER));
  });

  test("formats a negative overall delta with a leading minus and bold", () => {
    const base = repoScore(80, [model("claude-code", 80, "Claude Code")], [signal("ci", 1)]);
    const head = repoScore(75.9, [model("claude-code", 75.9, "Claude Code")], [signal("ci", 0.5)]);
    const out = renderDiffComment(base, head);

    assert.match(out, /\*\*-4\.1\*\*/);
    assert.match(out, /80\.0 → 75\.9/);
  });

  test("formats a zero delta as ±0.0 (no bold)", () => {
    const r = repoScore(72, [model("claude-code", 72, "Claude Code")], [signal("ci", 1)]);
    const out = renderDiffComment(r, r);

    assert.match(out, /±0\.0/);
  });

  test("renders a per-model row for every model present in either side", () => {
    const base = repoScore(70, [model("claude-code", 70, "Claude Code"), model("cursor", 70, "Cursor")], []);
    const head = repoScore(72, [model("claude-code", 80, "Claude Code"), model("devin", 64, "Devin")], []);
    const out = renderDiffComment(base, head);

    assert.match(out, /\| Claude Code \|/);
    assert.match(out, /\| Cursor \|/);
    assert.match(out, /\| Devin \|/);
  });

  test("lists changed signals sorted by absolute delta", () => {
    const base = repoScore(0, [], [signal("ci", 1, "ci was here"), signal("tests", 1, "tests passed")]);
    const head = repoScore(0, [], [signal("ci", 0, "ci removed"), signal("tests", 0.5, "tests partial")]);

    const out = renderDiffComment(base, head);
    const ciIdx = out.indexOf("**ci**");
    const testsIdx = out.indexOf("**tests**");

    assert.ok(ciIdx > 0 && testsIdx > 0);
    assert.ok(ciIdx < testsIdx, "expected larger-delta signal (ci) listed before smaller (tests)");
  });

  test("notes 'no signals changed' when both sides match", () => {
    const r = repoScore(50, [model("claude-code", 50, "Claude Code")], [signal("ci", 1), signal("tests", 1)]);
    const out = renderDiffComment(r, r);

    assert.match(out, /No signals changed/);
  });

  test("treats a signal missing from base as base=0", () => {
    const base = repoScore(0, [], []);
    const head = repoScore(0, [], [signal("ci", 1, "added")]);

    const out = renderDiffComment(base, head);
    assert.match(out, /\*\*ci\*\* ↑ 0\.00 → 1\.00/);
  });
});
