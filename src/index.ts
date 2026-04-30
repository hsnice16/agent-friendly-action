import * as core from "@actions/core";
import * as github from "@actions/github";

import { upsertCommentByMarker } from "./comment";
import { renderDiffComment } from "./diff";
import { scoreAtRef, scoreCurrentTree } from "./score-tree";

async function run(): Promise<void> {
  const optInToken = core.getInput("agents-badge-token");
  if (!optInToken) {
    core.info("agents-badge-token not set; exiting silently.");
    return;
  }

  const { eventName, payload, repo } = github.context;
  if (eventName !== "pull_request" && eventName !== "pull_request_target") {
    core.info(`event '${eventName}' is not a pull request; exiting.`);
    return;
  }

  const pr = payload.pull_request;
  if (!pr) {
    core.warning("no pull_request payload on the event; exiting.");
    return;
  }

  const baseSha: string = core.getInput("base-ref") || pr.base?.sha || "";
  if (!baseSha) {
    core.warning("could not resolve PR base SHA; exiting.");
    return;
  }

  core.info(`scoring head (${shortSha(pr.head?.sha)}) vs base (${shortSha(baseSha)})`);

  const headScore = scoreCurrentTree();
  const baseScore = scoreAtRef(baseSha);

  const overallDelta = (headScore.overall - baseScore.overall).toFixed(1);
  core.info(`overall: ${baseScore.overall.toFixed(1)} → ${headScore.overall.toFixed(1)} (Δ ${overallDelta})`);

  const body = renderDiffComment(baseScore, headScore);

  const ghToken = core.getInput("github-token", { required: true });
  const result = await upsertCommentByMarker({
    body,
    token: ghToken,
    repo: repo.repo,
    owner: repo.owner,
    issueNumber: pr.number,
  });

  core.info(`comment ${result.action} (id=${result.id})`);
}

function shortSha(sha: string | undefined): string {
  return sha ? sha.slice(0, 7) : "unknown";
}

run().catch((err) => {
  core.setFailed(err instanceof Error ? err.message : String(err));
});
