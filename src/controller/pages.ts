import { helpers, RouterMiddleware } from "../../deps.ts";

import { createResponse, getIncrementId } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const pagesStorage = getStorage({ tableName: "Pages" })!;
const configStorage = getStorage({ tableName: "Config" })!;

/**
 * GET /{VERSION}/pages
 * Query: pageSize, page
 */
export const getPages: RouterMiddleware<string> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页页面数
  const { maxPageSize = 10 } = await configStorage.select({ name: "posts" }); // 最大每页页面数
  const pageSize = paramPageSize // 最终每页页面章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const pages = await pagesStorage.select(
    { hidden: false }, // TODO(@so1ve): 当用户有合法JWT Token时，可以返回隐藏的文章(Query: ?draft)
    {
      desc: "id", // 避免与Leancloud的字段冲突
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "id",
        "title",
        "content",
        "metas",
      ],
    },
  );
  ctx.response.body = createResponse({ data: pages });
};

/** GET /{VERSION}/pages/{id} */
export const getPage: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const page = (await pagesStorage.select(
    { id },
    {
      fields: [
        "id",
        "title",
        "content",
        "metas",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!page) ctx.throw(404, `Page(ID: ${id}) does not exist`);
  ctx.response.body = createResponse({ data: page });
};

/** POST /{VERSION}/pages */
export const createPage: RouterMiddleware<string> = async (ctx) => {
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const pages = await pagesStorage.select(
    {},
    {
      fields: ["id"],
    },
  );
  const currentId = getIncrementId(pages);
  const { // 默认值
    title = "",
    content = "",
    hidden = false,
  } = requestBody;
  const resp = await pagesStorage.add({
    id: currentId,
    title,
    content,
    hidden,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/pages/{id} */
export const updatePage: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await pagesStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Page(ID: ${id}) does not exist`);
    return;
  }
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const resp = await pagesStorage.update(
    {
      ...requestBody,
      id,
    },
    { id },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/pages/{id} */
export const deletePage: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await pagesStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Page(ID: ${id}) does not exist`);
    return;
  }
  await pagesStorage.delete({ id });
  ctx.response.body = createResponse();
};
