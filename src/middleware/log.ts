import { log, RouterMiddleware } from "../../deps.ts";

import { jwtKey } from "../lib/mod.ts";

export const logMiddleware: RouterMiddleware<string> = async (ctx, next) => {
  log.info(ctx.request.method + " " + ctx.request.url);
  await next();
};
