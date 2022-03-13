import { helpers, RouterMiddleware, shared, Status } from "../../deps.ts";

import { createResponse, getStorage, validateRequestBody } from "../lib/mod.ts";

const authorsStorage = getStorage("Authors");
const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

/** GET /{VERSION}/authors */
export const getAuthors: RouterMiddleware<string> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页作者数
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "authors" }))[0]; // 最大每页作者数
  const pageSize = paramPageSize // 最终每页作者数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const authors = await authorsStorage.select(
    {},
    {
      desc: "created",
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "slug",
        "name",
        "avatar",
        "bio",
      ],
    },
  );
  ctx.response.body = createResponse({ data: authors });
};

/** GET /{VERSION}/authors/{slug} */
export const getAuthor: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const author = (await authorsStorage.select(
    { slug },
    {
      desc: "updated",
      fields: [
        "slug",
        "name",
        "avatar",
        "bio",
      ],
    },
  ))[0];
  if (!author) {
    ctx.throw(Status.NotFound, `Author(Slug: ${slug}) does not exist`);
    return;
  }
  ctx.response.body = createResponse({ data: author });
};

/** GET /{VERSION}/authors/{slug}/posts */
export const getAuthorPosts: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const allPosts: readonly shared.Post[] = Object.freeze( // TODO(@so1ve): 有没有高效点的实现啊喂！！
    await postsStorage.select(
      {},
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
          "postMetas",
          "created",
          "updated",
        ],
      },
    ),
  );
  const postsIncludeThisAuthor = allPosts.filter((post) =>
    post.authors.includes(slug)
  );
  ctx.response.body = createResponse({ data: postsIncludeThisAuthor });
};

/** POST /{VERSION}/authors */
export const createAuthor: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);

  const { // 默认值
    name = "",
    slug = name,
    avatar = "",
    bio = "",
  } = requestBody;
  const resp = await authorsStorage.add({
    slug,
    name,
    avatar,
    bio,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/authors/{slug} */
export const updateAuthor: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { slug } = ctx.params;
  const exists = (await authorsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Author(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await authorsStorage.update(
    {
      ...requestBody,
      slug,
    },
    { slug },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/posts/{slug} */
export const deleteAuthor: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await authorsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Author(Slug: ${slug}) does not exist`);
    return;
  }
  await authorsStorage.delete({ slug });
  ctx.response.body = createResponse();
};
