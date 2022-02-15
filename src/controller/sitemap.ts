import { helpers, RouterMiddleware, shared } from "../../deps.ts";

import { createSitemapUrls } from "../lib/sitemap.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage({ tableName: "Posts" })!;
const tagsStorage = getStorage({ tableName: "Tags" })!;
const categoriesStorage = getStorage({ tableName: "Categories" })!;

/**
 * GET /{VERSION}/sitemap
 * Query: postsBaseUrl, tagsBaseUrl, categoriesBaseUrl
 */
export const generateSitemap: RouterMiddleware<string> = async (ctx) => {
  const {
    postsBaseUrl = "",
    tagsBaseUrl = "",
    categoriesBaseUrl = "",
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const [posts, tags, categories] = await Promise.all([
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
  ]);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${createSitemapUrls(posts, postsBaseUrl)}${createSitemapUrls(tags, tagsBaseUrl)}${createSitemapUrls(categories, categoriesBaseUrl)}
</urlset>`;
  ctx.response.type = "xml";
  ctx.response.body = xml;
};
