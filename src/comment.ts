import * as github from "@actions/github";
import { COMMENT_MARKER } from "./diff";

export type UpsertArgs = {
  repo: string;
  body: string;
  owner: string;
  token: string;
  issueNumber: number;
};

export async function upsertCommentByMarker(args: UpsertArgs): Promise<{ action: "created" | "updated"; id: number }> {
  const octokit = github.getOctokit(args.token);

  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    per_page: 100,
    repo: args.repo,
    owner: args.owner,
    issue_number: args.issueNumber,
  });

  const existing = comments.find((c) => typeof c.body === "string" && c.body.includes(COMMENT_MARKER));

  if (existing) {
    const { data } = await octokit.rest.issues.updateComment({
      body: args.body,
      repo: args.repo,
      owner: args.owner,
      comment_id: existing.id,
    });

    return { action: "updated", id: data.id };
  }

  const { data } = await octokit.rest.issues.createComment({
    body: args.body,
    repo: args.repo,
    owner: args.owner,
    issue_number: args.issueNumber,
  });

  return { action: "created", id: data.id };
}
