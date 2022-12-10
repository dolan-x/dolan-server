import { Context, helpers, Status } from "oak";
import { getStorage } from "../lib/mod.ts";

export const createSitemapUrls = <T extends { slug: string }>(
  objs: T[],
  baseUrl: string,
) =>
  objs.map(({ slug }) =>
    `  <url>
    <loc>${baseUrl}/${slug}</loc>
  </url>
`
  ).join("");

export async function ensureRequestBody<
  T = any,
>(ctx: Context) {
  if (!ctx.request.hasBody) {
    ctx.throw(Status.BadRequest, "Request body is missing");
  }
  let requestBody: T;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    requestBody = {} as any;
  }
  return requestBody;
}

export function getQuery(ctx: Context) {
  return helpers.getQuery(
    ctx,
    { mergeParams: true },
  );
}

export function getPageSize(maxPageSize: number, paramPageSize: number) {
  return paramPageSize
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
}

export function getLimit(ctx: Context, all: any, pageSize: number) {
  return (ctx.state.userInfo && all !== undefined) ? undefined : pageSize;
}
