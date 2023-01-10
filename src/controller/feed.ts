import { Category, ConfigSite, Post } from "@dolan-x/shared";
import { renderMarkdownSync } from "@dolan-x/markdown-renderer";
import { Feed } from "feed";
import * as log from "$log";
import { RouterMiddleware } from "oak";

import { getStorage } from "../lib/mod.ts";
import { getConfig } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");
const categoriesStorage = getStorage("Categories");

/**
 * GET /feed
 */
export const generateFeed: RouterMiddleware<"/feed"> = async (ctx) => {
  log.info("Feed: Generating feed");
  const [posts, categories, config] = await Promise.all([
    postsStorage.select(
      { status: ["!=", "draft"] },
      {
        fields: ["title", "slug", "excerpt", "content", "updated"],
      },
    ) as Promise<Post[]>,
    categoriesStorage.select(
      {},
      { fields: ["name"] },
    ) as Promise<Category[]>,
    getConfig("site") as Promise<ConfigSite>,
  ]);
  const { url, name, description, postsBaseUrl } = config;
  const feed = new Feed({
    title: name,
    description,
    id: url,
    link: url,
    copyright: "", // TODO(@so1ve)
    generator: "Dolan",
  });
  categories.forEach(({ name }) => {
    feed.addCategory(name);
  });
  posts.forEach(({ title, slug, excerpt, content, updated }) => {
    console.log(updated);
    feed.addItem({
      title,
      id: slug,
      link: `${postsBaseUrl}/${slug}`,
      description: excerpt,
      content: renderMarkdownSync(content),
      date: new Date(updated),
    });
  });
  ctx.response.type = "xml";
  ctx.response.body = feed.rss2();
};
