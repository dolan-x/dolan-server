import { helpers, RouterMiddleware, shared, Status } from "../../deps.ts";

import { createResponse, getStorage, validateRequestBody } from "../lib/mod.ts";

const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

// TODO(@so1ve): 携带有合法JWT Token且query: draft=true时，返回内容包括草稿箱的文章
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
  console.log(await configStorage.select({ name: "posts" }));
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "posts" }))[0]; // 最大每页文章数
  const pageSize = paramPageSize // 最终每页文章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const where: Record<string, any> = {};
  if (!ctx.state.userInfo) {
    where.status = ["!=", "draft"];
    where.hidden = false;
  }
  const posts = await postsStorage.select(
    where,
    {
      desc, // 避免与Leancloud的字段冲突
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "slug",
        "title",
        "content",
        "excerpt",
        "sticky",
        "status",
        "authors",
        "tags",
        "categories",
        "metas",
        "created",
        "updated",
      ],
    },
  );
  ctx.response.body = createResponse({ data: posts });
};

// TODO(@so1ve): 携带有合法JWT Token时，可以返回草稿箱文章，否则返回Status.NotFound
/** GET /{VERSION}/posts/{slug} */
export const getPost: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const post = (await postsStorage.select(
    { slug },
    {
      fields: [
        "slug",
        "title",
        "content",
        "excerpt",
        "sticky",
        "status",
        "authors",
        "tags",
        "categories",
        "metas",
        "created",
        "updated",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!post) ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
  ctx.response.body = createResponse({ data: post });
};

/** POST /{VERSION}/posts */
export const createPost: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { // 默认值
    title = "",
    slug = title,
    content = "",
    authors = [],
    tags = [],
    categories = [],
    sticky = false,
    hidden = false,
    status = "published",
    metas = {},
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
  } = requestBody;
  let { excerpt = "" } = requestBody;
  if (!excerpt) {
    excerpt = content.slice(0, 100); // 没有摘要则截取前100个字符
  }
  const resp = await postsStorage.add({
    slug,
    title,
    content,
    excerpt,
    authors,
    tags,
    categories,
    sticky,
    hidden,
    status,
    metas,
    created,
    updated,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/posts/{slug} */
export const updatePost: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { slug } = ctx.params;
  const exists = (await postsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await postsStorage.update(
    {
      ...requestBody,
      slug,
    },
    { slug },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/posts/{slug} */
export const deletePost: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await postsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
    return;
  }
  await postsStorage.delete({ slug });
  ctx.response.body = createResponse();
};
