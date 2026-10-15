import { strict as assert } from "node:assert";
import { describe, test } from "node:test";

import { isOwnComment } from "../src/comment";
import { COMMENT_MARKER } from "../src/diff";

const bot = { login: "github-actions[bot]", type: "Bot" };
const body = `${COMMENT_MARKER}\nscore`;

describe("isOwnComment", () => {
  test("matches the bot's own marked comment", () => {
    assert.equal(isOwnComment({ body, user: bot }, bot), true);
  });

  test("ignores a marked comment from anyone else", () => {
    assert.equal(isOwnComment({ body, user: { login: "mallory", type: "User" } }, bot), false);
  });

  test("ignores a user whose login imitates the bot", () => {
    assert.equal(isOwnComment({ body, user: { login: "github-actions[bot]", type: "User" } }, bot), false);
  });

  test("ignores the bot's comments without the marker", () => {
    assert.equal(isOwnComment({ body: "other", user: bot }, bot), false);
    assert.equal(isOwnComment({ body: null, user: bot }, bot), false);
  });

  test("matches a custom token's own login", () => {
    const me = { login: "release-bot", type: "User" };
    assert.equal(isOwnComment({ body, user: me }, me), true);
    assert.equal(isOwnComment({ body, user: bot }, me), false);
  });

  test("an App installation token matches its own bot comment, whatever the slug", () => {
    const anyBot = { type: "Bot" };
    assert.equal(isOwnComment({ body, user: { login: "my-app[bot]", type: "Bot" } }, anyBot), true);
  });

  test("the default token matches github-actions[bot]", () => {
    assert.equal(isOwnComment({ body, user: bot }, { type: "Bot" }), true);
  });

  test("without a login, a user-authored marker comment is still ignored", () => {
    const anyBot = { type: "Bot" };
    assert.equal(isOwnComment({ body, user: { login: "mallory", type: "User" } }, anyBot), false);
    assert.equal(isOwnComment({ body, user: { login: "my-app[bot]", type: "User" } }, anyBot), false);
    assert.equal(isOwnComment({ body, user: null }, anyBot), false);
  });
});
