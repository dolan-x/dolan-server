import { helpers, RouterMiddleware, shared, Status } from "../../deps.ts";

import { getStorage } from "../lib/mod.ts";
import { cr, validateRequestBody } from "../utils/mod.ts";

const tagsStorage = getStorage("Tags");
const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

/** GET /{VERSION}/tags */
export const getTags: RouterMiddleware<"/tags"> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页标签数
  const { maxPageSize = 10 } =
    (await configStorage.select({ name: "tags" }))[0]; // 最大每页标签数
  const pageSize = paramPageSize // 最终每页标签数
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
  const page = Number(_paramPage); // 当前页数
  const tags = await tagsStorage.select(
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
  ctx.response.body = cr.success({ data: tags });
};

/** GET /{VERSION}/tags/{slug} */
export const getTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const tag = (await tagsStorage.select(
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
  if (!tag) {
    ctx.throw(Status.NotFound, `Tag(Slug: ${slug}) does not exist`);
    return;
  }
  ctx.response.body = cr.success({ data: tag });
};

/** GET /{VERSION}/tags/{slug}/count */
export const getTagCount: RouterMiddleware<"/tags/:slug/count"> = async (
  ctx,
) => {
  const { slug } = ctx.params;
  const allPosts: readonly shared.Post[] = Object.freeze( // TODO(@so1ve): 有没有高效点的实现啊喂！！
    await postsStorage.select(
      {},
      {
        fields: [
          "tags",
        ],
      },
    ),
  );
  const postsIncludeThisTag = allPosts.filter((post) =>
    post.tags.includes(slug)
  );
  ctx.response.body = cr.success({ data: postsIncludeThisTag.length });
};

/** POST /{VERSION}/tags */
// Tag会做重名检查，`name` `slug` 不能重复
export const createTag: RouterMiddleware<"/tags"> = async (ctx) => {
  const requestBody = await validateRequestBody(ctx);
  const { // 默认值
    name = "",
    slug = name,
    description = "",
  } = requestBody;
  const duplicate = await tagsStorage.select({
    _complex: {
      name,
      slug,
      _logic: "or",
    },
  });
  if (duplicate.length) {
    ctx.throw(Status.Conflict, `Tag(Name: ${name}) already exists`);
    return;
  }
  const resp = await tagsStorage.add({
    slug,
    name,
    description,
  });
  ctx.response.body = cr.success({
    data: resp,
  });
};

/** PUT /{VERSION}/tags/{slug} */
export const updateTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await tagsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Tag (Slug: ${slug}}) does not exist`);
    return;
  }
  const requestBody = await validateRequestBody(ctx);
  const resp = await tagsStorage.update(
    {
      ...requestBody,
      slug,
    },
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
};

/** DELETE /{VERSION}/tags/{slug} */
export const deleteTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  const exists = (await tagsStorage.select({ slug }))[0];
  if (!exists) {
    ctx.throw(Status.NotFound, `Tag (Slug: ${slug}) does not exist`);
    return;
  }
  await tagsStorage.delete({ slug });
  ctx.response.body = cr.success();
};
