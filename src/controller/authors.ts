import { config, helpers, RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, getIncrementId } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const authorsStorage = getStorage({ tableName: "Authors" })!;
const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

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
  const { maxPageSize = 10 } = await configStorage.select({ name: "authors" }); // 最大每页作者数
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
        "id",
        "name",
        "avatar",
        "bio",
      ],
    },
  );
  ctx.response.body = createResponse({ data: authors });
};

/** GET /{VERSION}/authors/{id} */
export const getAuthor: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const author = (await authorsStorage.select(
    { id },
    {
      desc: "updated",
      fields: [
        "id",
        "name",
        "avatar",
        "bio",
      ],
    },
  ))[0];
  if (!author) {
    ctx.throw(404, `Author(ID: ${id}) does not exist`);
    return;
  }
  ctx.response.body = createResponse({ data: author });
};

/** GET /{VERSION}/authors/{id}/posts */
export const getAuthorPosts: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const allPosts: readonly shared.Post[] = Object.freeze( // TODO(@so1ve): 有没有高效点的实现啊喂！！
    await postsStorage.select(
      {},
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
    ),
  );
  const postsIncludeThisAuthor = allPosts.filter((post) =>
    post.authors.includes(id)
  );
  ctx.response.body = createResponse({ data: postsIncludeThisAuthor });
};

/** POST /{VERSION}/authors */
export const createAuthor: RouterMiddleware<string> = async (ctx) => {
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const authors: shared.Author[] = await authorsStorage.select(
    {},
    {
      fields: ["id"],
    },
  );
  const currentId = getIncrementId(authors);
  const { // 默认值
    name = "",
    avatar = "",
    bio = "",
  } = requestBody;
  const resp = await authorsStorage.add({
    id: currentId,
    name,
    avatar,
    bio,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/authors/{id} */
export const updateAuthor: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await authorsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Author(ID: ${id}) does not exist`);
    return;
  }
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const resp = await authorsStorage.update(
    {
      ...requestBody,
      id,
    },
    { id },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/posts/{id} */
export const deleteAuthor: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await authorsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Author(ID: ${id}) does not exist`);
    return;
  }
  await authorsStorage.delete({ id });
  ctx.response.body = createResponse();
};
