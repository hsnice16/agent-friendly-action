import type { ModelScore, RepoScore } from "./scoring/scorer";
import type { SignalResult } from "./scoring/signals/types";

export const COMMENT_MARKER = "<!-- agent-friendly-action -->";

export function renderDiffComment(base: RepoScore, head: RepoScore): string {
  const overallDelta = head.overall - base.overall;
  const lines: string[] = [];

  lines.push(COMMENT_MARKER);
  lines.push("## Agent Friendly Code — score diff");
  lines.push("");
  lines.push(`**Overall**: ${base.overall.toFixed(1)} → ${head.overall.toFixed(1)} (${formatDelta(overallDelta)})`);
  lines.push("");

  lines.push("### Per model");
  lines.push("");
  lines.push("| Model | Base | Head | Δ |");
  lines.push("| --- | ---: | ---: | ---: |");

  for (const row of perModelRows(base.modelScores, head.modelScores)) {
    lines.push(`| ${row.label} | ${row.base.toFixed(1)} | ${row.head.toFixed(1)} | ${formatDelta(row.delta)} |`);
  }

  const changed = changedSignals(base.signals, head.signals);

  if (changed.length > 0) {
    lines.push("");
    lines.push("### Signals that changed");
    lines.push("");

    for (const c of changed) {
      const arrow = c.head > c.base ? "↑" : "↓";

      lines.push(`- **${c.label}** ${arrow} ${c.base.toFixed(2)} → ${c.head.toFixed(2)} — ${c.detail}`);
    }
  } else {
    lines.push("");
    lines.push("_No signals changed between base and head._");
  }

  lines.push("");
  lines.push("---");
  lines.push("_Posted by [agent-friendly-action](https://github.com/hsnice16/agent-friendly-action)._");

  return lines.join("\n");
}

type ModelRow = { label: string; base: number; head: number; delta: number };

function perModelRows(baseScores: ModelScore[], headScores: ModelScore[]): ModelRow[] {
  const baseById = new Map(baseScores.map((m) => [m.modelId, m]));
  const headById = new Map(headScores.map((m) => [m.modelId, m]));

  const ids = Array.from(new Set([...baseById.keys(), ...headById.keys()]));

  return ids.map((id) => {
    const b = baseById.get(id);
    const h = headById.get(id);
    const baseScore = b?.score ?? 0;
    const headScore = h?.score ?? 0;

    return {
      base: baseScore,
      head: headScore,
      delta: headScore - baseScore,
      label: h?.modelLabel ?? b?.modelLabel ?? id,
    };
  });
}

type SignalRow = {
  id: string;
  base: number;
  head: number;
  label: string;
  detail: string;
};

function changedSignals(baseSignals: SignalResult[], headSignals: SignalResult[]): SignalRow[] {
  const baseById = new Map(baseSignals.map((s) => [s.id, s]));
  const out: SignalRow[] = [];

  for (const h of headSignals) {
    const b = baseById.get(h.id);
    const basePass = b?.pass ?? 0;

    if (basePass !== h.pass) {
      out.push({
        id: h.id,
        head: h.pass,
        base: basePass,
        label: h.label,
        detail: h.detail,
      });
    }
  }

  out.sort((a, b) => Math.abs(b.head - b.base) - Math.abs(a.head - a.base));
  return out;
}

function formatDelta(n: number): string {
  const rounded = n.toFixed(1);
  if (rounded === "0.0" || rounded === "-0.0") {
    return "±0.0";
  }

  const sign = n > 0 ? "+" : "";
  return `**${sign}${rounded}**`;
}
