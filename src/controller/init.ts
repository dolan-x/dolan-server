import { RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, initValues } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = await getStorage("Posts");
const configStorage = await getStorage("Config");

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
    hidden: false,
    sticky: false,
    authors: [],
    categories: [],
    tags: [],
    metas: {},
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
      name: "pages",
      value: initValues.pages,
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
    {
      name: "functions",
      value: initValues.functions,
    },
  ]);

  ctx.response.body = createResponse({ data: "Success" });
};
