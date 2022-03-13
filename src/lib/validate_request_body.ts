import { Context, Status } from "../../deps.ts";

export const validateRequestBody = async <
  T = any,
>(ctx: Context) => {
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
};
