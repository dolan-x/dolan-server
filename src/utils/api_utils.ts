import { Context, Status, STATUS_TEXT } from "../../deps.ts";

type CreateResponseArguments = {
  code?: Status;
  message?: string;
  data?: unknown;
  error?: string | null;
};
type CreateResponseResult = {
  code: Status;
  message: string;
  data?: unknown;
  error?: string;
};
export function createResponse({
  code,
  message,
  data = {},
  error,
}: CreateResponseArguments = {}): CreateResponseResult {
  const isInternalServerError = error === null;
  code = code
    ? code
    : (isInternalServerError ? Status.InternalServerError : Status.OK);
  message = message || STATUS_TEXT.get(code);
  const response: CreateResponseResult = {
    code,
    message,
  } as CreateResponseResult;
  (!error && !isInternalServerError) && (response.data = data);
  (error || isInternalServerError) &&
    (response.error = error || STATUS_TEXT.get(code) || message);

  return response;
}

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

export const validateRequestBody = async <
  // deno-lint-ignore no-explicit-any
  T = any,
>(ctx: Context) => {
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
};
