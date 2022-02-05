import { RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, initValues } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

export const init: RouterMiddleware<string> = async (ctx) => {
  if (await configStorage.count({}) > 0) {
    ctx.throw(400, "Already initialized");
    return;
  }

  const addPost = postsStorage.add<shared.Post>({
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
  const addSiteConfig = configStorage.add({
    name: "site",
    value: initValues.site,
  });
  const addPostsConfig = configStorage.add({
    name: "posts",
    value: initValues.posts,
  });
  const addCategoriesConfig = configStorage.add({
    name: "categories",
    value: initValues.categories,
  });
  const addTagsConfig = configStorage.add({
    name: "tags",
    value: initValues.tags,
  });
  const addAuthorsConfig = configStorage.add({
    name: "authors",
    value: initValues.authors,
  });
  const addCustomConfig = configStorage.add({
    name: "custom",
    value: initValues.custom,
  });
  await Promise.all([
    addPost,
    addSiteConfig,
    addPostsConfig,
    addCategoriesConfig,
    addTagsConfig,
    addAuthorsConfig,
    addCustomConfig,
  ]);
  ctx.response.body = createResponse({ data: {} });
};
