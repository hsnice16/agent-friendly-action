import * as github from "@actions/github";
import { COMMENT_MARKER } from "./diff";

export type UpsertArgs = {
  repo: string;
  body: string;
  owner: string;
  token: string;
  issueNumber: number;
};

// No login means "any bot": what an installation token resolves to.
export type Identity = { login?: string; type?: string };

type CommentLike = { body?: string | null; user?: { login?: string; type?: string } | null };

const ANY_BOT: Identity = { type: "Bot" };

// Anyone can paste the marker into a PR comment; matching on it alone would let
// them get their comment overwritten with ours, or ours edited into theirs.
export function isOwnComment(c: CommentLike, me: Identity): boolean {
  if (typeof c.body !== "string" || !c.body.includes(COMMENT_MARKER)) return false;
  if (me.login !== undefined && c.user?.login !== me.login) return false;
  return me.type === undefined || c.user?.type === me.type;
}

// Installation tokens (the built-in GITHUB_TOKEN, or a GitHub App's) are
// rejected by /user, and an App token posts as `<app-slug>[bot]`, so neither
// login is knowable up front. Only bot accounts have type Bot, so a user still
// can't claim our comment. A PAT answers with its own login.
async function whoAmI(octokit: ReturnType<typeof github.getOctokit>): Promise<Identity> {
  try {
    const { data } = await octokit.rest.users.getAuthenticated();
    return { login: data.login, type: data.type };
  } catch {
    return ANY_BOT;
  }
}

export async function upsertCommentByMarker(args: UpsertArgs): Promise<{ action: "created" | "updated"; id: number }> {
  const octokit = github.getOctokit(args.token);
  const me = await whoAmI(octokit);

  const comments = await octokit.paginate(octokit.rest.issues.listComments, {
    per_page: 100,
    repo: args.repo,
    owner: args.owner,
    issue_number: args.issueNumber,
  });

  const existing = comments.find((c: CommentLike & { id: number }) => isOwnComment(c, me));

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
