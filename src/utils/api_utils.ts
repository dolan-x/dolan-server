import { Context, helpers, Status } from "../../deps.ts";
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
  // deno-lint-ignore no-explicit-any
  T = any,
>(ctx: Context) {
  if (!ctx.request.hasBody) {
    ctx.throw(Status.BadRequest, "Request body is missing");
  }
  let requestBody: T;
  try {
    requestBody = await ctx.request.body({ type: "json" }).value;
  } catch {
    // deno-lint-ignore no-explicit-any
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

const configStorage = getStorage("Config");
export async function getConfig(name: string) {
  const configObj = (await configStorage.select({ name }))[0];
  return configObj.value;
}

export function getPageSize(maxPageSize: number, paramPageSize: number) {
  return paramPageSize
    ? (paramPageSize >= maxPageSize ? maxPageSize : paramPageSize)
    : maxPageSize;
}

// deno-lint-ignore no-explicit-any
export function getLimit(ctx: Context, all: any, pageSize: number) {
  return (ctx.state.userInfo && all !== undefined) ? undefined : pageSize;
}
