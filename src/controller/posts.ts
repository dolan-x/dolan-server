import { log, RouterMiddleware, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { cr, ensureRequestBody, getQuery, prettyJSON } from "../utils/mod.ts";

const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

// TODO(@so1ve): 携带有合法JWT Token且query: draft=true时，返回内容包括草稿箱的文章
/**
 * GET /posts
 * Query: pageSize, page, desc
 */
export const getPosts: RouterMiddleware<"/posts"> = async (ctx) => {
  log.info("Posts: List posts");
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
    desc = "updated",
    // TODO(@so1ve): Return all posts if logged in and ?all passed
    all,
  } = getQuery(ctx);
  const paramPageSize = Number(_paramPageSize); // 每页文章数
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "posts" }))[0]; // 最大每页文章数
  const pageSize: number = paramPageSize // 最终每页文章数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  log.info(
    "Posts: Getting posts - info " + prettyJSON({
      maxPageSize,
      pageSize,
      page,
      all,
    }),
  );
  // deno-lint-ignore no-explicit-any
  const where: Record<string, any> = {};
  if (!ctx.state.userInfo) {
    where.status = ["!=", "draft"];
    where.hidden = false;
  }
  log.info(
    "Posts: Getting posts - query " + prettyJSON(where),
  );
  const [posts, postCount] = await Promise.all([
    postsStorage.select(
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
    ),
    postsStorage.count(where),
  ]);
  // log.info(
  //   "Posts: Getting posts - posts " + prettyJSON(posts),
  // );
  log.info(
    "Posts: Getting posts - count " + prettyJSON(postCount),
  );
  ctx.response.body = cr.success({
    data: posts,
    metas: {
      pages: Math.ceil(postCount / pageSize),
    },
  });
  log.info("Posts: Getting posts - success");
};

// TODO(@so1ve): 携带有合法JWT Token时，可以返回草稿箱文章，否则返回Status.NotFound
/** GET /posts/{slug} */
export const getPost: RouterMiddleware<"/posts/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Posts: Getting post - " + slug);
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
  // log.info(
  //   "Posts: Getting posts - post " + prettyJSON(post),
  // );
  if (!post) {
    log.error(`Posts: Getting post - Post(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
  }
  ctx.response.body = cr.success({ data: post });
  log.info("Posts: Getting post - success");
};

/** POST /posts */
export const createPost: RouterMiddleware<"/posts"> = async (ctx) => {
  log.info("Posts: Creating post");
  const requestBody = await ensureRequestBody(ctx);
  log.info("Posts: Creating post - body " + prettyJSON(requestBody));
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
  if (!slug) {
    log.error(`Posts: Creating post - Slug is required`);
    ctx.throw(Status.BadRequest, "Slug is required");
    return;
  }
  const duplicate = await postsStorage.select({
    slug,
  });
  if (duplicate.length) {
    log.error(`Posts: Creating post - Post(Slug: ${slug}) already exists`);
    ctx.throw(Status.Conflict, `Post(Slug: ${slug}) already exists`);
  }
  let { excerpt = "" } = requestBody;
  log.info("Posts: Creating post - original excerpt " + excerpt);
  if (!excerpt) {
    excerpt = content.slice(0, 100); // 没有摘要则截取前100个字符
    log.info("Posts: Creating post - excerpt " + excerpt);
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
  ctx.response.body = cr.success({
    data: resp,
  });
  log.info("Posts: Creating post - success");
};

/** PUT /posts/{slug} */
export const updatePost: RouterMiddleware<"/posts/:slug"> = async (ctx) => {
  log.info("Posts: Updating post");
  const requestBody = await ensureRequestBody(ctx);
  const { slug } = ctx.params;
  log.info("Posts: Updating post - slug " + slug);
  log.info("Posts: Updating post - body " + prettyJSON(requestBody));
  const exists = await postsStorage.select({ slug });
  if (!exists.length) {
    log.error(`Posts: Updating post - Post(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await postsStorage.update(
    requestBody,
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
  log.info("Posts: Updating post - success");
};

/** DELETE /posts/{slug} */
export const deletePost: RouterMiddleware<"/posts/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Posts: Deleting post - slug " + slug);
  const exists = (await postsStorage.select({ slug }))[0];
  if (!exists) {
    log.error(`Posts: Deleting post - Post(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Post(Slug: ${slug}) does not exist`);
    return;
  }
  await postsStorage.delete({ slug });
  ctx.response.body = cr.success();
  log.info("Posts: Deleting post - success");
};
