import { log, Middleware } from "../../deps.ts";

export const logMiddleware: Middleware = async (ctx, next) => {
  log.info(ctx.request.method + " " + ctx.request.url);
  await next();
};
