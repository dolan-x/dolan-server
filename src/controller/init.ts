import { RouterMiddleware, shared, Status } from "../../deps.ts";

import { getStorage, initValues } from "../lib/mod.ts";
import { createResponse } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

export const getInitStatus: RouterMiddleware<string> = async (ctx) => {
  ctx.response.body = createResponse({ data: await configStorage.count() > 0 });
};

export const init: RouterMiddleware<string> = async (ctx) => {
  if (await configStorage.count() > 0) {
    ctx.throw(Status.BadRequest, "Already initialized");
    return;
  }

  await postsStorage.add<shared.Post>({
    slug: "hello-world",
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
  [
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
      name: "functions",
      value: initValues.functions,
    },
  ].forEach(async (i) => {
    await configStorage.add(i);
  });

  ctx.response.body = createResponse({ data: "Success" });
};
