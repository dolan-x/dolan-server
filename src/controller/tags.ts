import * as log from "$log";
import { Post } from "@dolan-x/shared";
import uniqolor from "uniqolor";
import { RouterMiddleware, Status } from "oak";

import { getStorage } from "../lib/mod.ts";
import { cr, ensureRequestBody, getQuery, prettyJSON } from "../utils/mod.ts";
import { checkExists } from "../utils/check_exists.ts";

const tagsStorage = getStorage("Tags");
const postsStorage = getStorage("Posts");

/** GET /tags */
export const getTags: RouterMiddleware<"/tags"> = async (ctx) => {
  log.info("Tags: List tags");
  const {
    slugs,
  } = getQuery(ctx);
  const where = {} as Record<string, any>;
  if (slugs === "") {
    ctx.response.body = cr.success({ data: [] });
    return;
  }
  if (slugs) {
    where.slug = ["IN", slugs.split(",")];
  }
  const tags = await tagsStorage.select(
    where,
    {
      desc: "updated", // 避免与Leancloud的字段冲突
      fields: [
        "slug",
        "name",
        "description",
        "color",
      ],
    },
  );
  // log.info(
  //   "Tags: Getting tags - tags " + prettyJSON(tags),
  // );
  ctx.response.body = cr.success({ data: tags });
  log.info("Tags: Getting tags - success");
};

/** GET /tags/{slug} */
export const getTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Tags: Getting tag - " + slug);
  const tag = (await tagsStorage.select(
    { slug },
    {
      desc: "updated",
      fields: [
        "slug",
        "name",
        "description",
        "color",
      ],
    },
  ))[0]; // Select返回的是一个列表，预期只会有一个返回数据
  // log.info(
  //   "Tags: Getting tags - tag " + prettyJSON(tag),
  // );
  if (!tag) {
    log.error(`Tags: Getting tag - Tag(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Tag(Slug: ${slug}) does not exist`);
  }
  ctx.response.body = cr.success({ data: tag });
  log.info("Tags: Getting tag - success");
};

/** GET /tags/{slug}/count */
export const getTagCount: RouterMiddleware<"/tags/:slug/count"> = async (
  ctx,
) => {
  const { slug } = ctx.params;
  log.info("Tags: Getting tag count - " + slug);
  const allPosts = Object.freeze<Post>( // TODO(@so1ve): 有没有高效点的实现啊喂！！
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
  log.info(
    "Tags: Getting tag count - " + slug + " " + postsIncludeThisTag.length,
  );
  ctx.response.body = cr.success({ data: postsIncludeThisTag.length });
  log.info("Tags: Getting tag count - success");
};

/** POST /tags */
// `slug` 不能重复
export const createTag: RouterMiddleware<"/tags"> = async (ctx) => {
  log.info("Tags: Creating tag");
  const requestBody = await ensureRequestBody(ctx);

  const { // 默认值
    name = "",
    description = "",
  } = requestBody;
  const slug = requestBody.slug || name;
  const color = requestBody.color || uniqolor(slug).color;
  log.info(
    "Tags: Creating tag - body " + prettyJSON({
      name,
      slug,
      description,
      color,
    }),
  );
  if (slug === "") {
    log.error(`Tags: Creating tag - Slug or Name is required`);
    ctx.throw(Status.BadRequest, `Slug or Name is required`);
  }
  if (await checkExists(tagsStorage, slug)) {
    log.error(`Tags: Creating tag - Tag(Slug: ${slug}) already exists`);
    ctx.throw(Status.Conflict, `Tag(Slug: ${slug}) already exists`);
    return;
  }
  const resp = await tagsStorage.add({
    slug,
    name,
    description,
    color,
  });
  ctx.response.body = cr.success({
    data: resp,
  });
  log.info("Tags: Creating tag - success");
};

/** PUT /tags/{slug} */
export const updateTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  log.info("Tags: Updating tag");
  const requestBody = await ensureRequestBody(ctx);
  const { slug } = ctx.params;
  log.info("Tags: Updating tag - slug " + slug);
  log.info("Tags: Updating tag - body " + prettyJSON(requestBody));
  if (!await checkExists(tagsStorage, slug)) {
    log.error(`Tags: Updating tag - Tag(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Tag(Slug: ${slug}) does not exist`);
    return;
  }
  if (
    await checkExists(tagsStorage, requestBody.slug) &&
    requestBody.slug !== slug
  ) {
    log.error(
      `Tags: Updating tag - Tag to be updated(Slug: ${requestBody.slug}) already exists`,
    );
    ctx.throw(
      Status.Conflict,
      `Tag to be updated(Slug: ${requestBody.slug}) already exists`,
    );
    return;
  }
  const resp = await tagsStorage.update(
    requestBody,
    { slug },
  );
  ctx.response.body = cr.success({ data: resp });
  log.info("Tags: Updating tag - success");
};

/** DELETE /tags/{slug} */
export const deleteTag: RouterMiddleware<"/tags/:slug"> = async (ctx) => {
  const { slug } = ctx.params;
  log.info("Tags: Deleting tag - slug " + slug);
  if (!await checkExists(tagsStorage, slug)) {
    log.error(`Tags: Deleting tag - Tag(Slug: ${slug}) does not exist`);
    ctx.throw(Status.NotFound, `Tag(Slug: ${slug}) does not exist`);
    return;
  }
  await tagsStorage.delete({ slug });
  ctx.response.body = cr.success();
  log.info("Tags: Deleting tag - success");
};
