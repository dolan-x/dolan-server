import { helpers, RouterMiddleware, shared } from "../../deps.ts";

import { createResponse, getIncrementId } from "../lib/mod.ts";
import { getStorage } from "../service/storage/mod.ts";

const tagsStorage = getStorage("Tags");
const postsStorage = getStorage("Posts");
const configStorage = getStorage("Config");

/** GET /{VERSION}/tags */
export const getTags: RouterMiddleware<string> = async (ctx) => {
  const {
    pageSize: _paramPageSize,
    page: _paramPage = 0,
  } = helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
  const paramPageSize = Number(_paramPageSize); // 每页标签数
  const { maxPageSize = 10 } = await configStorage.select({ name: "tags" }); // 最大每页标签数
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
        "id",
        "name",
        "description",
      ],
    },
  );
  ctx.response.body = createResponse({ data: tags });
};

/** GET /{VERSION}/tags/{id} */
export const getTag: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const tag = (await tagsStorage.select(
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
  if (!tag) {
    ctx.throw(404, `Tag(ID: ${id}) does not exist`);
    return;
  }
  ctx.response.body = createResponse({ data: tag });
};

/** GET /{VERSION}/tags/{id}/count */
export const getTagCount: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
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
  const postsIncludeThisTag = allPosts.filter((post) => post.tags.includes(id));
  ctx.response.body = createResponse({ data: postsIncludeThisTag.length });
};

/** POST /{VERSION}/tags */
// Tag会做重名检查，`name`不能重复
export const createTag: RouterMiddleware<string> = async (ctx) => {
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
  const duplicate = await tagsStorage.select({ name });
  if (duplicate.length) {
    ctx.throw(409, `Tag(Name: ${name}) already exists`);
    return;
  }
  const tags: shared.Tag[] = await tagsStorage.select(
    {},
    {
      fields: ["id"],
    },
  );
  const currentId = getIncrementId(tags);
  const resp = await tagsStorage.add({
    id: currentId,
    name,
    description,
  });
  ctx.response.body = createResponse({
    data: resp,
  });
};

/** PUT /{VERSION}/tags/{id} */
export const updateTag: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await tagsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Tag (ID: ${id}) does not exist`);
    return;
  }
  let requestBody;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {};
  }
  const resp = await tagsStorage.update(
    {
      ...requestBody,
      id,
    },
    { id },
  );
  ctx.response.body = createResponse({ data: resp });
};

/** DELETE /{VERSION}/tags/{id} */
export const deleteTag: RouterMiddleware<string> = async (ctx) => {
  const { id: _id } = ctx.params;
  const id = Number(_id);
  const exists = (await tagsStorage.select({ id }))[0];
  if (!exists) {
    ctx.throw(404, `Tag (ID: ${id}) does not exist`);
    return;
  }
  await tagsStorage.delete({ id });
  ctx.response.body = createResponse();
};
