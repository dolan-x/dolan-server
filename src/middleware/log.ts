import * as log from "$log";
import { Middleware } from "oak";

export const logMiddleware: Middleware = async (ctx, next) => {
  log.info(ctx.request.method + " " + ctx.request.url);
  await next();
};
