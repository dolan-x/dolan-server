import { RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, initValues } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

export const init: RouterMiddleware<string> = async (ctx) => {
  if (await configStorage.count() > 0) {
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
  await configStorage.addAll([
    {
      name: "site",
      value: initValues.site,
    },
    {
      name: "posts",
      value: initValues.posts,
    },
    {
      name: "categories",
      value: initValues.categories,
    },
    {
      name: "tags",
      value: initValues.tags,
    },
    {
      name: "authors",
      value: initValues.authors,
    },
    {
      name: "custom",
      value: initValues.custom,
    },
    {
      name: "userInjections",
      value: initValues.userInjections,
    },
  ]);

  ctx.response.body = createResponse({ data: "Success" });
};
