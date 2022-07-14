import { log, RouterMiddleware, shared } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { createSitemapUrls, getConfig } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");
const tagsStorage = getStorage("Tags");
const categoriesStorage = getStorage("Categories");

/**
 * GET /sitemap
 * Query: postsBaseUrl, tagsBaseUrl, categoriesBaseUrl
 */
export const generateSitemap: RouterMiddleware<"/sitemap"> = async (ctx) => {
  log.info("Sitemap: Generating sitemap");
  const [posts, tags, categories, config] = await Promise.all([
    postsStorage.select(
      { status: ["!=", "draft"] },
      {
        fields: ["id"],
      },
    ) as Promise<shared.Post[]>,
    tagsStorage.select(
      {},
      {
        fields: ["id"],
      },
    ) as Promise<shared.Tag[]>,
    categoriesStorage.select(
      {},
      {
        fields: ["id"],
      },
    ) as Promise<shared.Category[]>,
    getConfig("functions"),
  ]);
  const { postsBaseUrl, tagsBaseUrl, categoriesBaseUrl } = config.sitemap;
  // deno-fmt-ignore
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${createSitemapUrls(posts, postsBaseUrl)}${createSitemapUrls(tags, tagsBaseUrl)}${createSitemapUrls(categories, categoriesBaseUrl)}
  </urlset>`;
  log.info("Sitemap: Generating sitemap - sitemap\n", xml);
  ctx.response.type = "xml";
  ctx.response.body = xml;
};
