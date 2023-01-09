import { ConfigSite, Post } from "@dolan-x/shared";
import { Feed } from "feed";
import * as log from "$log";
import { RouterMiddleware } from "oak";

import { getStorage } from "../lib/mod.ts";
import { getConfig } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");

/**
 * GET /feed
 */
export const generateFeed: RouterMiddleware<"/feed"> = async (ctx) => {
  log.info("Feed: Generating feed");
  const [posts, config] = await Promise.all([
    postsStorage.select(
      { status: ["!=", "draft"] },
      {
        fields: ["slug"],
      },
    ) as Promise<Post[]>,
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
  posts.forEach(({ title, slug, excerpt, content, updated }) => {
    console.log(updated);
    feed.addItem({
      title,
      id: slug,
      link: `${postsBaseUrl}/${slug}`,
      description: excerpt,
      content,
      date: new Date(updated),
    });
  });
  ctx.response.type = "xml";
  ctx.response.body = feed.rss2();
};
