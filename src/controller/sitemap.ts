import { Category, ConfigSite, Page, Post, Tag } from "@dolan-x/shared";
import * as log from "$log";
import { RouterMiddleware } from "oak";

import { getStorage } from "../lib/mod.ts";
import { createSitemapUrls, getConfig } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");
const tagsStorage = getStorage("Tags");
const categoriesStorage = getStorage("Categories");
const pagesStorage = getStorage("Pages");

/**
 * GET /sitemap
 */
export const generateSitemap: RouterMiddleware<"/sitemap"> = async (ctx) => {
  log.info("Sitemap: Generating sitemap");
  const [posts, tags, categories, pages, config] = await Promise.all([
    postsStorage.select(
      { status: ["!=", "draft"] },
      {
        fields: ["slug"],
      },
    ) as Promise<Post[]>,
    tagsStorage.select(
      {},
      {
        fields: ["slug"],
      },
    ) as Promise<Tag[]>,
    categoriesStorage.select(
      {},
      {
        fields: ["slug"],
      },
    ) as Promise<Category[]>,
    pagesStorage.select(
      {},
      {
        fields: ["slug"],
      },
    ) as Promise<Page[]>,
    getConfig("site") as Promise<ConfigSite>,
  ]);
  const { postsBaseUrl, tagsBaseUrl, pagesBaseUrl, categoriesBaseUrl } = config;
  // deno-fmt-ignore
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${createSitemapUrls(posts, postsBaseUrl)}${createSitemapUrls(tags, tagsBaseUrl)}${createSitemapUrls(categories, categoriesBaseUrl)}${createSitemapUrls(pages, pagesBaseUrl)}
  </urlset>`;
  log.info("Sitemap: Generating sitemap - sitemap\n", xml);
  ctx.response.type = "xml";
  ctx.response.body = xml;
};
