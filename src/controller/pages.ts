import { log, RouterMiddleware, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { cr, ensureRequestBody, getQuery, prettyJSON } from "../utils/mod.ts";

const pagesStorage = getStorage("Pages");
const configStorage = getStorage("Config");

/**
 * GET /pages
 * Query: pageSize, page
 */
export const getPages: RouterMiddleware<"/pages"> = async (ctx) => {
  log.info("Pages: List pages");
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = getQuery(ctx);
  const paramPageSize = Number(_paramPageSize); // 每页页面数
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "pages" }))[0]; // 最大每页页面数
  const pageSize = paramPageSize // 最终每页页面章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  log.info(
    "Pages: Getting pages - info " + prettyJSON({
      maxPageSize,
      pageSize,
      page,
    }),
  );
  // deno-lint-ignore no-explicit-any
  const where: Record<string, any> = {};
  if (!ctx.state.userInfo) {
    where.hidden = false;
  }
  log.info(
    "Posts: Getting posts - query " + prettyJSON(where),
  );
  const pages = await pagesStorage.select(
    where, // TODO(@so1ve): 当用户有合法JWT Token时，可以返回隐藏的文章(Query: ?draft)
    {
      desc: "updated", // 避免与Leancloud的字段冲突
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "slug",
        "title",
        "content",
        "hidden",
        "metas",
      ],
    },
  );
  ctx.response.body = cr.success({ data: pages });
  log.info("Posts: Getting posts - success");
};

/** GET /pages/{slug} */
export const getPage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Pages: Getting page - " + slug);
  const page = (await pagesStorage.select(
    { slug },
    {
      fields: [
        "slug",
        "title",
        "content",
        "hidden",
        "metas",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!page) {
    log.error(`Pages: Getting page - Page(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
  }
  ctx.response.body = cr.success({ data: page });
  log.info("Posts: Getting post - success");
};

/** POST /pages */
export const createPage: RouterMiddleware<"/pages"> = async (ctx) => {
  const requestBody = await ensureRequestBody(ctx);
  const { // 默认值
    title = "",
    slug = title,
    content = "",
    hidden = false,
    metas,
  } = requestBody;
  if (!slug) {
    log.error(`Pages: Creating page - Slug is required`);
    ctx.throw(Status.BadRequest, "Slug is required");
    return;
  }
  const duplicate = await pagesStorage.select({
    slug,
  });
  if (duplicate.length) {
    log.error(`Pages: Creating page - Page(Slug: ${slug}) already exists`);
    ctx.throw(Status.Conflict, `Page(Slug: ${slug}) already exists`);
  }
  const resp = await pagesStorage.add({
    slug,
    title,
    content,
    hidden,
    metas,
  });
  ctx.response.body = cr.success({
    data: resp,
  });
};

/** PUT /pages/{slug} */
export const updatePage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  log.info("Pages: Updating page");
  const requestBody = await ensureRequestBody(ctx);
  const { slug } = ctx.params;
  log.info("Pages: Updating page - slug " + slug);
  log.info("Pages: Updating page - body " + prettyJSON(requestBody));
  const exists = (await pagesStorage.select({ slug }))[0];
  if (!exists) {
    log.error(`Pages: Updating page - Page(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await pagesStorage.update(
    requestBody,
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
  log.info("Pages: Updating page - success");
};

/** DELETE /pages/{slug} */
export const deletePage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Pages: Deleting page - slug " + slug);
  const exists = (await pagesStorage.select({ slug }))[0];
  if (!exists) {
    log.error(`Pages: Deleting page - Page(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
    return;
  }
  await pagesStorage.delete({ slug });
  ctx.response.body = cr.success();
  log.info("Pages: Deleting page - success");
};
