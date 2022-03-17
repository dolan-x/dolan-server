// TODO(@so1ve): 增加子分类功能
import {
  ErrorStatus,
  helpers,
  RouterMiddleware,
  shared,
  Status,
} from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { createResponse, validateRequestBody } from "../utils/mod.ts";

const categoriesStorage = getStorage("Categories");
const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

/** GET /{VERSION}/categories */
export const getCategories: RouterMiddleware<string> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页分类数
  const { maxPageSize = 10 } = (await configStorage.select({
    name: "categories",
  }))[0]; // 最大每页分类数
  const pageSize = paramPageSize // 最终每页分类数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const categories = await categoriesStorage.select(
    {},
    {
      desc: "updated", // 避免与Leancloud的字段冲突
      limit: pageSize,
      offset: Math.max((page - 1) * pageSize, 0),
      fields: [
        "slug",
        "name",
        "description",
      ],
    },
  );
  ctx.response.body = createResponse({ data: categories });
};

/** GET /{VERSION}/categories/{slug} */
export const getCategory: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const category = (await categoriesStorage.select(
    { slug },
    {
      desc: "updated",
      fields: [
        "slug",
        "name",
        "description",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!category) {
    ctx.throw(
      shared.STATUS_CODES.get(shared.Codes.CategoryDoesNotExist) as ErrorStatus,
      shared.STATUS_MESSAGES.get(shared.Codes.CategoryDoesNotExist),
    );
    return;
  }
  ctx.response.body = createResponse({ data: category });
};

/** GET /{VERSION}/categories/{slug}/count */
export const getCategoryCount: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const allPosts: readonly shared.Post[] = Object.freeze( // TODO(@so1ve): 有没有高效点的实现啊喂！！
    await postsStorage.select(
      {},
      {
        fields: [
          "categories",
        ],
      },
    ),
  );
  const postsIncludeThisCategory = allPosts.filter((post) =>
    post.categories.includes(slug)
  );
  ctx.response.body = createResponse({ data: postsIncludeThisCategory.length });
};

/** POST /{VERSION}/categories */
// Category会做重名检查，不能重复
export const createCategory: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { // 默认值
    name = "",
    slug = name,
    description = "",
  } = requestBody;
  const duplicate = await categoriesStorage.select({ name });
  if (duplicate.length) {
    ctx.throw(Status.Conflict, `Category(Name: ${name}) already exists`);
    return;
  }
  const resp = await categoriesStorage.add({
    slug,
    name,
    description,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/categories/{slug} */
export const updateCategory: RouterMiddleware<string> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { slug } = ctx.params;
  const exists = (await categoriesStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Category(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await categoriesStorage.update(
    {
      ...requestBody,
      slug,
    },
    { slug },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/categories/{slug} */
export const deleteCategory: RouterMiddleware<string> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await categoriesStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Category(Slug: ${slug}) does not exist`);
    return;
  }
  await categoriesStorage.delete({ slug });
  ctx.response.body = createResponse();
};
