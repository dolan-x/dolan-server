import { helpers, RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, getIncrementId } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

// TODO(@so1ve): 携带有合法JWT Token且query: draft=true时，返回内容包括草稿箱的文章
// TODO(@so1ve): 增加hidden属性
/**
 * GET /{VERSION}/posts
 * Query: pageSize, page, desc
 */
export const getPosts: RouterMiddleware<string> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
    desc = "updated",
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页文章数
  const { maxPageSize = 10 } = await configStorage.select({ name: "posts" }); // 最大每页文章数
  const pageSize = paramPageSize // 最终每页文章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const posts = await postsStorage.select(
    { status: ["NOT IN", ["draft"]] },
    {
      desc, // 避免与Leancloud的字段冲突
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "id",
        "title",
        "content",
        "excerpt",
        "sticky",
        "status",
        "authors",
        "tags",
        "categories",
        "postMetas",
        "created",
        "updated",
      ],
    },
  );
  ctx.response.body = createResponse({ data: posts });
};

// TODO(@so1ve): 携带有合法JWT Token时，可以返回草稿箱文章，否则返回404
/** GET /{VERSION}/posts/{id} */
export const getPost: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const post = (await postsStorage.select(
    { id },
    {
      fields: [
        "id",
        "title",
        "content",
        "excerpt",
        "sticky",
        "status",
        "authors",
        "tags",
        "categories",
        "postMetas",
        "created",
        "updated",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!post) ctx.throw(404, `Post(ID: ${id}) does not exist`);
  ctx.response.body = createResponse({ data: post });
};

/** POST /{VERSION}/posts */
export const createPost: RouterMiddleware<string> = async (ctx) => {
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const posts: shared.Post[] = await postsStorage.select(
    {},
    {
      fields: ["id"],
    },
  );
  const currentId = getIncrementId(posts);
  const { // 默认值
    title = "",
    content = "",
    authors = [],
    tags = [],
    categories = [],
    sticky = false,
    status = "published",
    postMetas = {},
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
  } = requestBody;
  let { excerpt = "" } = requestBody;
  if (!excerpt) {
    excerpt = content.slice(0, 100); // 没有摘要则截取前100个字符
  }
  const resp = await postsStorage.add({
    id: currentId,
    title,
    content,
    excerpt,
    authors,
    tags,
    categories,
    sticky,
    status,
    postMetas,
    created,
    updated,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/posts/{id} */
export const updatePost: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await postsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Post(ID: ${id}) does not exist`);
    return;
  }
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const resp = await postsStorage.update(
    {
      ...requestBody,
      id,
    },
    { id },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/posts/{id} */
export const deletePost: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await postsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Post(ID: ${id}) does not exist`);
    return;
  }
  await postsStorage.delete({ id });
  ctx.response.body = createResponse();
};
