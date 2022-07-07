// TODO(@so1ve): 增加子分类功能
import { log, RouterMiddleware, shared, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { cr, ensureRequestBody, getQuery, prettyJSON } from "../utils/mod.ts";

const categoriesStorage = getStorage("Categories");
const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

/** GET /categories */
export const getCategories: RouterMiddleware<"/categories"> = async (ctx) => {
  log.info("Categories: List categories");
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = getQuery(ctx);
  const paramPageSize = Number(_paramPageSize); // 每页分类数
  const { maxPageSize = 10 } = (await configStorage.select({
    name: "categories",
  }))[0]; // 最大每页分类数
  const pageSize = paramPageSize // 最终每页分类数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  log.info(
    "Categories: Getting categories - info " + prettyJSON({
      maxPageSize,
      pageSize,
      page,
    }),
  );
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
  // log.info(
  //   "Categories: Getting categories - categories " + prettyJSON(categories),
  // );
  ctx.response.body = cr.success({ data: categories });
  log.info("Categories: Getting categories - success ");
};

/** GET /categories/{slug} */
export const getCategory: RouterMiddleware<"/categories/:slug"> = async (
  ctx,
) => {
  const { slug } = ctx.params;
  log.info("Categories: Getting category - " + slug);
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
  // log.info(
  //   "Categories: Getting categories - category " + prettyJSON(category),
  // );
  if (!category) {
    log.error(
      `Categories: Getting categories - Category(Slug: ${slug}) does not exist`,
    );
    ctx.throw(Status.NotFound, `Category(Slug: ${slug}) does not exist`);
    return;
  }
  ctx.response.body = cr.success({ data: category });
  log.info("Categories: Getting category - success");
};

/** GET /categories/{slug}/count */
export const getCategoryCount: RouterMiddleware<"/categories/:slug/count"> =
  async (ctx) => {
    const { slug } = ctx.params;
    log.info("Categories: Getting category count - " + slug);
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
    log.info(
      "Categories: Getting category count - " + slug + " " +
        postsIncludeThisCategory.length,
    );
    ctx.response.body = cr.success({
      data: postsIncludeThisCategory.length,
    });
    log.info("Categories: Getting category count - success");
  };

/** POST /categories */
// Slug不能重复
export const createCategory: RouterMiddleware<"/categories"> = async (ctx) => {
  log.info("Categories: Creating category");
  const requestBody = await ensureRequestBody(ctx);
  log.info("Categories: Creating category - body " + prettyJSON(requestBody));
  const { // 默认值
    name = "",
    slug = name,
    description = "",
  } = requestBody;
  if (slug === "") {
    log.error(`Categories: Creating category - Slug or Name is required`);
    ctx.throw(Status.BadRequest, `Slug or Name is required`);
  }
  const duplicate = await categoriesStorage.select({ slug });
  if (duplicate.length) {
    log.error(
      `Categories: Creating category - Category(Slug: ${slug}) already exists`,
    );
    ctx.throw(Status.Conflict, `Category(Slug: ${slug}) already exists`);
    return;
  }
  const resp = await categoriesStorage.add({
    slug,
    name,
    description,
  });
  ctx.response.body = cr.success({
    data: resp,
  });
  log.info("Categories: Creating category - success");
};

/** PUT /categories/{slug} */
export const updateCategory: RouterMiddleware<"/categories/:slug"> = async (
  ctx,
) => {
  log.info("Categories: Updating category");
  const requestBody = await ensureRequestBody(ctx);
  const { slug } = ctx.params;
  log.info("Categories: Updating category - slug " + slug);
  log.info("Categories: Updating category - body " + prettyJSON(requestBody));
  const exists = (await categoriesStorage.select({ slug }))[0];
  if (!exists) {
    log.error(
      `Categories: Updating category - Category(Slug: ${slug}) does not exist`,
    );
    ctx.throw(Status.NotFound, `Category(Slug: ${slug}) does not exist`);
    return;
  }
  const resp = await categoriesStorage.update(
    requestBody,
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
  log.info("Categories: Updating category - success");
};

/** DELETE /categories/{slug} */
export const deleteCategory: RouterMiddleware<"/categories/:slug"> = async (
  ctx,
) => {
  const { slug } = ctx.params;
  log.info("Categories: Deleting category - slug " + slug);
  const exists = (await categoriesStorage.select({ slug }))[0];
  if (!exists) {
    log.error(
      `Categories: Deleting category - Category(Slug: ${slug}) does not exist`,
    );
    ctx.throw(Status.NotFound, `Category(Slug: ${slug}) does not exist`);
    return;
  }
  await categoriesStorage.delete({ slug });
  ctx.response.body = cr.success();
  log.info("Categories: Deleting category - success");
};
