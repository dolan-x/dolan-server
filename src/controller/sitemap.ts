import { RouterMiddleware, shared } from "../../deps.ts";

import { createSitemapUrls } from "../lib/sitemap.ts";
import { Config } from "../types/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage("Posts");
const tagsStorage = getStorage("Tags");
const categoriesStorage = getStorage("Categories");
const configStorage = getStorage("Config");

/**
 * GET /{VERSION}/sitemap
 * Query: postsBaseUrl, tagsBaseUrl, categoriesBaseUrl
 */
export const generateSitemap: RouterMiddleware<string> = async (ctx) => {
  const [posts, tags, categories, config] = await Promise.all([
    postsStorage.select(
      { status: ["NOT IN", ["draft"]] },
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
    configStorage.select(
      { name: "functions" },
    ),
  ]);
  const { postsBaseUrl, tagsBaseUrl, categoriesBaseUrl } = config.sitemap;
  // deno-fmt-ignore
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${createSitemapUrls(posts, postsBaseUrl)}${createSitemapUrls(tags, tagsBaseUrl)}${createSitemapUrls(categories, categoriesBaseUrl)}
</urlset>`;
  ctx.response.type = "xml";
  ctx.response.body = xml;
};
