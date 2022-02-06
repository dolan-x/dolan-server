// TODO(@so1ve): 增加子分类功能
import { helpers, RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, getIncrementId } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const categoriesStorage = getStorage({ tableName: "Categories" })!;
const postsStorage = getStorage({ tableName: "Posts" })!;
const configStorage = getStorage({ tableName: "Config" })!;

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
  const { maxPageSize = 10 } = await configStorage.select({
    name: "categories",
  }); // 最大每页分类数
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
        "id",
        "name",
        "description",
      ],
    },
  );
  ctx.response.body = createResponse({ data: categories });
};

/** GET /{VERSION}/categories/{id} */
export const getCategory: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const category = (await categoriesStorage.select(
    { id },
    {
      desc: "updated",
      fields: [
        "id",
        "name",
        "description",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  if (!category) {
    ctx.throw(404, `Category(ID: ${id}) does not exist`);
    return;
  }
  ctx.response.body = createResponse({ data: category });
};

/** GET /{VERSION}/categories/{id}/count */
export const getCategoryCount: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
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
    post.categories.includes(id)
  );
  ctx.response.body = createResponse({ data: postsIncludeThisCategory.length });
};

/** POST /{VERSION}/categories */
// Category会做重名检查，不能重复
export const createCategory: RouterMiddleware<string> = async (ctx) => {
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const { // 默认值
    name = "",
    description = "",
  } = requestBody;
  const duplicate = await categoriesStorage.select({ name });
  if (duplicate.length) {
    ctx.throw(409, `Category(Name: ${name}) already exists`);
    return;
  }
  const categories: shared.Category[] = await categoriesStorage.select(
    {},
    {
      fields: ["id"],
    },
  );
  const currentId = getIncrementId(categories);
  const resp = await categoriesStorage.add({
    id: currentId,
    name,
    description,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/categories/{id} */
export const updateCategory: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await categoriesStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Category(ID: ${id}) does not exist`);
    return;
  }
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const resp = await categoriesStorage.update(
    {
      ...requestBody,
      id,
    },
    { id },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/categories/{id} */
export const deleteCategory: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await categoriesStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Category(ID: ${id}) does not exist`);
    return;
  }
  await categoriesStorage.delete({ id });
  ctx.response.body = createResponse();
};
