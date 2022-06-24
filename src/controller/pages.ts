import { helpers, RouterMiddleware, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { cr, validateRequestBody } from "../utils/mod.ts";

const pagesStorage = getStorage("Pages");
const configStorage = getStorage("Config");

/**
 * GET /{VERSION}/pages
 * Query: pageSize, page
 */
export const getPages: RouterMiddleware<"/pages"> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页页面数
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "posts" }))[0]; // 最大每页页面数
  const pageSize = paramPageSize // 最终每页页面章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  // deno-lint-ignore no-explicit-any
  const where: Record<string, any> = {};
  if (!ctx.state.userInfo) {
    where.hidden = false;
  }
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
        "metas",
      ],
    },
  );
  ctx.response.body = cr.success({ data: pages });
};

/** GET /{VERSION}/pages/{slug} */
export const getPage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const page = (await pagesStorage.select(
    { slug },
    {
      fields: [
        "slug",
        "title",
        "content",
        "metas",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!page) ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
  ctx.response.body = cr.success({ data: page });
};

/** POST /{VERSION}/pages */
export const createPage: RouterMiddleware<"/pages"> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { // 默认值
    title = "",
    slug = title,
    content = "",
    hidden = false,
  } = requestBody;
  const resp = await pagesStorage.add({
    slug,
    title,
    content,
    hidden,
  });
  ctx.response.body = cr.success({
    data: resp,
  });
};

/** PUT /{VERSION}/pages/{slug} */
export const updatePage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { slug } = ctx.params;
  const exists = (await pagesStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await pagesStorage.update(
    {
      ...requestBody,
      slug,
    },
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
};

/** DELETE /{VERSION}/pages/{slug} */
export const deletePage: RouterMiddleware<"/pages/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await pagesStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Page(Slug: ${slug}) does not exist`);
    return;
  }
  await pagesStorage.delete({ slug });
  ctx.response.body = cr.success();
};
