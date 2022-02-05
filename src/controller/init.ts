import { RouterMiddleware, shared } from "../../deps.ts";

import { createResponse } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

export const init: RouterMiddleware<string> = async (ctx) => {
  if (await configStorage.count({}) > 0) {
    ctx.throw(400, "Already initialized");
    return;
  }
  await postsStorage.add<shared.Post>({
    id: 1,
    title: "Hello World",
    content: "# Hello World\nYour first post!",
    excerpt: "Your first post!",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    status: "published",
    sticky: false,
    authors: [],
    categories: [],
    tags: [],
    postMetas: {},
  });
  await configStorage.add({
    name: "site",
    value: {},
  });
  await configStorage.add({
    name: "custom",
    value: {},
  });
  ctx.response.body = createResponse({ data: {} });
};
