import { Post } from "@dolan-x/shared";
import { RouterMiddleware, Status } from "oak";

import { getStorage } from "../lib/mod.ts";
import {
  cr,
  ensureRequestBody,
  getConfig,
  getPageSize,
  getQuery,
} from "../utils/mod.ts";

const authorsStorage = getStorage("Authors");
const postsStorage = getStorage("Posts");

/** GET /authors */
export const getAuthors: RouterMiddleware<"/authors"> = async (ctx) => {
  const authors = await authorsStorage.select(
    {},
    {
      desc: "created",
      fields: [
        "slug",
        "name",
        "avatar",
        "bio",
      ],
    },
  );
  ctx.response.body = cr.success({ data: authors });
};

/** GET /authors/{slug} */
export const getAuthor: RouterMiddleware<"/authors/:slug"> = async (ctx) => {
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
  ctx.response.body = cr.success({ data: author });
};

/** GET /authors/{slug}/posts */
export const getAuthorPosts: RouterMiddleware<"/authors/:slug/posts"> = async (
  ctx,
) => {
  const { slug } = ctx.params;
  const allPosts = Object.freeze<Post>( // TODO(@so1ve): 有没有高效点的实现啊喂！！
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
  ctx.response.body = cr.success({ data: postsIncludeThisAuthor });
};

/** POST /authors */
export const createAuthor: RouterMiddleware<"/authors"> = async (ctx) => {
  const requestBody = await ensureRequestBody(ctx);

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
  ctx.response.body = cr.success({
    data: resp,
  });
};

/** PUT /authors/{slug} */
export const updateAuthor: RouterMiddleware<"/authors/:slug"> = async (ctx) => {
  const requestBody = await ensureRequestBody(ctx);
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
  ctx.response.body = cr.success({ data: resp });
};

/** DELETE /authors/{slug} */
export const deleteAuthor: RouterMiddleware<"/authors/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await authorsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Author(Slug: ${slug}) does not exist`);
    return;
  }
  await authorsStorage.delete({ slug });
  ctx.response.body = cr.success();
};
